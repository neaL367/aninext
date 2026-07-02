import "server-only";

import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { unstable_cache } from "next/cache";
import { isAniListRateLimitError } from "@/lib/anilist/domain/errors";
import { executeGraphQL } from "@/lib/anilist/infra/graphql-client";
import { ANILIST_CACHE_VERSION, type AnilistCacheProfile } from "@/lib/anilist/server/cache/policy";

type CacheEngineMeta = {
  operationId: string;
  schemaVersion?: string;
};

function logCacheMiss(namespace: string, keyParts: string[]): void {
  if (process.env.NODE_ENV !== "development") return;
  const suffix = keyParts.length ? `/${keyParts.join("/")}` : "";
  console.log(`[anilist-cache] MISS ${namespace}${suffix}`);
}

function buildCacheKey(
  profile: AnilistCacheProfile<Record<string, unknown>>,
  keyParts: string[],
  meta: CacheEngineMeta,
): string[] {
  return [
    ANILIST_CACHE_VERSION,
    meta.operationId,
    meta.schemaVersion ?? "1",
    profile.namespace,
    ...keyParts,
  ];
}

function backupRevalidateSeconds(primarySeconds: number): number {
  // Keep a longer-lived fallback window (max 24h, min 1h).
  return Math.max(60 * 60, Math.min(60 * 60 * 24, primarySeconds * 12));
}

/** L2 cross-request cache for arbitrary async AniList work (e.g. airing pagination). */
export function cachedAnilistData<TVars extends Record<string, unknown>, TResult>(
  cacheVars: TVars,
  profile: AnilistCacheProfile<TVars>,
  meta: CacheEngineMeta,
  fn: () => Promise<TResult>,
): Promise<TResult> {
  const keyParts = profile.keyParts(cacheVars);
  const tags = profile.tags(cacheVars);

  const key = buildCacheKey(
    profile as AnilistCacheProfile<Record<string, unknown>>,
    keyParts,
    meta,
  );

  const primary = unstable_cache(
    async () => {
      logCacheMiss(profile.namespace, keyParts);
      return fn();
    },
    key,
    { tags, revalidate: profile.revalidate },
  );

  // Backup cache: same keyParts/tags, but longer revalidate window.
  // Used only when AniList rate limits and we have a previously cached value.
  const backup = unstable_cache(async () => fn(), [...key, "backup"], {
    tags,
    revalidate: backupRevalidateSeconds(profile.revalidate),
  });

  return primary().catch(async (error: unknown) => {
    if (!isAniListRateLimitError(error)) throw error;

    try {
      return await backup();
    } catch {
      throw error;
    }
  });
}

/** L2 cross-request cache for typed GraphQL documents. */
export function cachedAnilistQuery<
  TData,
  TCacheVars extends Record<string, unknown>,
  TVars extends Record<string, unknown>,
  TResult,
>(
  document: TypedDocumentNode<TData, TVars>,
  variables: TVars,
  cacheVars: TCacheVars,
  profile: AnilistCacheProfile<TCacheVars>,
  meta: CacheEngineMeta,
  transform: (data: TData) => TResult,
): Promise<TResult> {
  return cachedAnilistData(cacheVars, profile, meta, async () =>
    transform(await executeGraphQL(document, variables)),
  );
}
