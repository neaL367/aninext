export const ANILIST_API_URL = "https://graphql.anilist.co";

export const REQUEST_TIMEOUT_MS = 8_000;

export const SLOW_REQUEST_MS = 2_000;

export const MAX_RETRIES = 4;

/** Minimum wait before retrying a 429 (AniList often omits Retry-After). */
export const MIN_RATE_LIMIT_RETRY_MS = 2_000;

/** Small cushion after AniList's reset timestamp before resuming requests. */
export const RATE_LIMIT_RESET_BUFFER_MS = 500;

/** Proactive gate cap — never block longer than this before attempting the request. */
export const MAX_RATE_LIMIT_WAIT_MS = 8_000;

/** Cap parallel AniList requests — airing pagination + home slots share this queue. */
export const MAX_CONCURRENT_GRAPHQL_REQUESTS = 4;

export const DETAIL_RELATIONS_PER_PAGE = 36;

export const DETAIL_STREAMING_EPISODES_PER_PAGE = 100;
