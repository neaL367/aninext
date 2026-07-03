export const ANILIST_API_URL = "https://graphql.anilist.co";

export const REQUEST_TIMEOUT_MS = 8_000;

export const SLOW_REQUEST_MS = 2_000;

export const MAX_RETRIES = 4;

/** Minimum wait before retrying a 429 (AniList often omits Retry-After). */
export const MIN_RATE_LIMIT_RETRY_MS = 2_000;

/** Small cushion after AniList's reset timestamp before resuming requests. */
export const RATE_LIMIT_RESET_BUFFER_MS = 500;

/** Proactive gate cap in development — home page can fan out ~6 sections on cold cache. */
export const MAX_RATE_LIMIT_WAIT_MS_DEV = 120_000;

/** Proactive gate cap in production — fail into L2 backup rather than blocking UX. */
export const MAX_RATE_LIMIT_WAIT_MS_PROD = 8_000;

/** Interactive lane (browse, tooltips, detail) — reserved so search is not starved by home/airing. */
export const MAX_CONCURRENT_INTERACTIVE_REQUESTS = 1;

/** Background lane (home carousels, airing pagination, genres). */
export const MAX_CONCURRENT_BACKGROUND_REQUESTS = 2;

/**
 * Conservative local token bucket — AniList's degraded cap is ~30 req/min but
 * X-RateLimit-Remaining can lie. Per warm serverless instance only; not shared
 * across instances without Redis.
 */
export const TOKEN_BUCKET_RATE_PER_MIN = 28;

export const TOKEN_BUCKET_CAPACITY = 6;

/** When the bucket has budget, pace lightly; full spacing applies only when tokens are exhausted. */
export const TOKEN_BUCKET_LIGHT_SPACING_MS = 350;

/** Production spacing — dev overrides live in rate-limit.ts getTokenBucketConfig(). */
export const TOKEN_BUCKET_MIN_SPACING_MS = Math.ceil(60_000 / TOKEN_BUCKET_RATE_PER_MIN);

/** Max retry attempts when AniList returns Retry-After (avoid compounding 429 storms). */
export const MAX_RATE_LIMIT_RETRIES_WITH_RETRY_AFTER = 2;

/** Jitter applied to retry/backoff sleeps (±ratio). */
export const RETRY_JITTER_RATIO = 0.15;

export const DETAIL_RELATIONS_PER_PAGE = 36;

export const DETAIL_STREAMING_EPISODES_PER_PAGE = 100;
