import "server-only";

import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { cache } from "react";
import type {
  AnilistCacheProfile,
  AnilistGraphQLOperationName,
} from "@/lib/anilist/server/cache/policy";
import { cachedAnilistData, cachedAnilistQuery } from "@/lib/anilist/server/cache/engine";

type FetcherMeta = {
  operationId: string;
  schemaVersion?: string;
};

/** Standard GraphQL fetcher — L1 dedupe + L2 unstable_cache. */
export function defineGraphQLFetcher<
  TArgs extends unknown[],
  TData,
  TVars extends Record<string, unknown>,
  TCacheVars extends Record<string, unknown>,
  TResult,
>(config: {
  operationId: AnilistGraphQLOperationName;
  schemaVersion?: string;
  document: TypedDocumentNode<TData, TVars>;
  profile: AnilistCacheProfile<TCacheVars>;
  variables: (...args: TArgs) => TVars;
  cacheVars: (...args: TArgs) => TCacheVars;
  normalize: (data: TData) => TResult;
}): (...args: TArgs) => Promise<TResult> {
  const meta: FetcherMeta = {
    operationId: config.operationId,
    schemaVersion: config.schemaVersion,
  };

  const fetchL2 = (...args: TArgs) =>
    cachedAnilistQuery(
      config.document,
      config.variables(...args),
      config.cacheVars(...args),
      config.profile,
      meta,
      config.normalize,
    );

  return cache(fetchL2);
}

/** Runtime-aware fetcher — resolves request-time cache keys before L2. */
export function defineRuntimeFetcher<
  TArgs extends unknown[],
  TRuntime extends Record<string, unknown>,
  TResult,
>(config: {
  operationId: string;
  schemaVersion?: string;
  profile: AnilistCacheProfile<TRuntime>;
  runtime: (...args: TArgs) => Promise<TRuntime>;
  fetch: (runtime: TRuntime) => Promise<TResult>;
}): (...args: TArgs) => Promise<TResult> {
  const meta: FetcherMeta = {
    operationId: config.operationId,
    schemaVersion: config.schemaVersion,
  };

  const fetchL2 = async (...args: TArgs) => {
    const runtime = await config.runtime(...args);
    return cachedAnilistData(runtime, config.profile, meta, () => config.fetch(runtime));
  };

  return cache(fetchL2);
}

/** Non-GraphQL fetcher (multi-request pagination, etc.). */
export function defineDataFetcher<
  TArgs extends unknown[],
  TCacheVars extends Record<string, unknown>,
  TResult,
>(config: {
  operationId: string;
  schemaVersion?: string;
  profile: AnilistCacheProfile<TCacheVars>;
  cacheVars: (...args: TArgs) => TCacheVars;
  fetch: (...args: TArgs) => Promise<TResult>;
}): (...args: TArgs) => Promise<TResult> {
  const meta: FetcherMeta = {
    operationId: config.operationId,
    schemaVersion: config.schemaVersion,
  };

  const fetchL2 = (...args: TArgs) => {
    const cacheVars = config.cacheVars(...args);
    return cachedAnilistData(cacheVars, config.profile, meta, () => config.fetch(...args));
  };

  return cache(fetchL2);
}
