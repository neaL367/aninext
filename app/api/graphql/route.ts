import { NextRequest, NextResponse, after } from 'next/server'
import { executeGraphQLRaw } from '@/lib/anilist/infra/graphql-client'
import { getAniListRateLimit, reserveAniListRequest } from '@/lib/anilist/infra/rate-limit'
import { createHash } from 'crypto'

/**
 * GraphQL API Route Handler
 * 
 * Integrates client-side batching and deduplication with the 
 * project's robust Token Bucket and Circuit Breaker infra.
 */

type CachedRequest = {
  result: unknown
  timestamp: number
  promise?: Promise<unknown>
}

const requestCache = new Map<string, CachedRequest>()
const DEDUPLICATION_CACHE_TTL = 1000

function generateCacheKey(query: string, variables?: unknown): string {
  const key = JSON.stringify({ query, variables })
  return createHash('sha256').update(key).digest('hex')
}

function cleanupCache() {
  const now = Date.now()
  const maxAge = DEDUPLICATION_CACHE_TTL * 10
  for (const [key, value] of requestCache.entries()) {
    if (now - value.timestamp > maxAge) {
      requestCache.delete(key)
    }
  }
}

type RateLimitRecord = {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitRecord>()
const RATE_LIMIT_MAX = 25
const RATE_LIMIT_WINDOW = 60000

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  return forwarded?.split(',')[0] || realIP || 'unknown'
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    }
    rateLimitMap.set(ip, newRecord)
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX - 1,
      resetTime: newRecord.resetTime,
    }
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    }
  }

  record.count++
  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX - record.count,
    resetTime: record.resetTime,
  }
}

function cleanupRateLimits() {
  const now = Date.now()
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip)
    }
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const ip = getClientIP(request)

  try {
    // Client-side IP rate limit
    const rateLimit = checkRateLimit(ip)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429, headers: { 'Retry-After': '60' } }
      )
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const isBatch = Array.isArray(body)
    const requestsArray: Array<{ query: string; variables?: unknown }> = isBatch
      ? (body as Array<{ query: string; variables?: unknown }>)
      : [body as { query: string; variables?: unknown }]

    if (requestsArray.length === 0) {
      return NextResponse.json({ error: 'At least one query is required' }, { status: 400 })
    }

    const now = Date.now()
    const cacheKeyToIndices = new Map<string, number[]>()
    const uniqueRequests: Array<{
      query: string
      variables?: Record<string, unknown>
      cacheKey: string
      indices: number[]
    }> = []

    for (let index = 0; index < requestsArray.length; index++) {
      const req = requestsArray[index]
      if (!req || typeof req !== 'object' || !('query' in req) || typeof req.query !== 'string') {
        return NextResponse.json({ error: 'Valid query string is required' }, { status: 400 })
      }
      const variables = req.variables as Record<string, unknown> | undefined;
      const cacheKey = generateCacheKey(req.query, variables)
      const existingIndices = cacheKeyToIndices.get(cacheKey)
      if (existingIndices) {
        existingIndices.push(index)
      } else {
        cacheKeyToIndices.set(cacheKey, [index])
        uniqueRequests.push({
          query: req.query,
          variables,
          cacheKey,
          indices: [index],
        })
      }
    }

    for (const req of uniqueRequests) {
      req.indices = cacheKeyToIndices.get(req.cacheKey)!
    }

    const cachedResults = new Map<string, unknown>()
    const newRequests: typeof uniqueRequests = []
    const pendingPromises = new Map<string, Promise<unknown>>()

    for (const req of uniqueRequests) {
      const cached = requestCache.get(req.cacheKey)
      if (cached && now - cached.timestamp < DEDUPLICATION_CACHE_TTL) {
        cachedResults.set(req.cacheKey, cached.result)
      } else if (cached?.promise) {
        pendingPromises.set(req.cacheKey, cached.promise)
      } else {
        newRequests.push(req)
      }
    }

    for (const [cacheKey, promise] of pendingPromises) {
      try {
        const result = await promise
        cachedResults.set(cacheKey, result)
        const cached = requestCache.get(cacheKey)
        if (cached && !cached.result) {
          requestCache.set(cacheKey, { result, timestamp: Date.now() })
        }
      } catch {
        requestCache.delete(cacheKey)
      }
    }

    const executionPromises = newRequests.map(async ({ query, variables, cacheKey }) => {
      const promise = executeGraphQLRaw(query, variables).catch((error) => {
        requestCache.delete(cacheKey)
        return { data: null, errors: [{ message: error instanceof Error ? error.message : 'Unknown error' }] }
      })

      requestCache.set(cacheKey, { result: null as unknown, timestamp: now, promise })
      const result = await promise
      requestCache.set(cacheKey, { result, timestamp: Date.now() })
      return { cacheKey, result }
    })

    const executionResults = await Promise.all(executionPromises)

    const resultMap = new Map<string, unknown>()
    for (const [key, value] of cachedResults) resultMap.set(key, value)
    for (const { cacheKey, result } of executionResults) resultMap.set(cacheKey, result)

    const requestsCount = requestsArray.length
    const responses: unknown[] = Array.from({ length: requestsCount })
    for (const { cacheKey, indices } of uniqueRequests) {
      const result = resultMap.get(cacheKey) ?? { data: null, errors: [{ message: 'Query execution failed' }] }
      for (const index of indices) responses[index] = result
    }

    after(() => {
      if (requestCache.size > 1000) cleanupCache()
      if (rateLimitMap.size > 10000) cleanupRateLimits()
    })

    const currentAnilistRateLimit = getAniListRateLimit()
    const responseHeaders: Record<string, string> = {
      'X-Execution-Time': `${Date.now() - startTime}ms`,
      'X-Deduplicated-Queries': (requestsCount - uniqueRequests.length).toString(),
      'X-AniList-RateLimit-Remaining': currentAnilistRateLimit.remaining?.toString() ?? 'unknown',
    }

    return NextResponse.json(isBatch ? responses : responses[0], { headers: responseHeaders })
  } catch (error) {
    console.error('GraphQL API route error:', error)
    return NextResponse.json({ data: null, errors: [{ message: 'Internal server error' }] }, { status: 500 })
  }
}
