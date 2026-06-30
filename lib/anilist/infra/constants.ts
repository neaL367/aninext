export const ANILIST_API_URL = "https://graphql.anilist.co";

export const REQUEST_TIMEOUT_MS = 8_000;

export const SLOW_REQUEST_MS = 2_000;

export const MAX_RETRIES = 2;

/** Cap parallel AniList requests (home streams six section queries in parallel). */
export const MAX_CONCURRENT_GRAPHQL_REQUESTS = 8;

export const DETAIL_RELATIONS_PER_PAGE = 36;

export const DETAIL_STREAMING_EPISODES_PER_PAGE = 100;
