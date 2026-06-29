export const ANILIST_API_URL = "https://graphql.anilist.co";

export const DEFAULT_PER_PAGE = 25;

export const CAROUSEL_PER_PAGE = 8;

export const LISTING_PAGE_SIZE = 24;

export const TOP_100_LIMIT = 100;

export const TOP_100_MAX_PAGES = Math.ceil(TOP_100_LIMIT / LISTING_PAGE_SIZE);

export const REQUEST_TIMEOUT_MS = 8_000;

export const SLOW_REQUEST_MS = 2_000;

export const MAX_RETRIES = 2;

/** Cap parallel AniList requests (batch home uses one HTTP call). */
export const MAX_CONCURRENT_GRAPHQL_REQUESTS = 8;
