import "server-only";
import { cacheTag, cacheLife } from "next/cache";

import { anilistFetch } from "@/lib/anilist";
import { AniListError } from "@/lib/anilist-errors";

import { ANIME_CACHE } from "./anime-cache";
import { addDays, createAiringContext, dateStrFromEpoch, getAiringDayBounds } from "./lib/airing";
import { compact, compactEdges, compactRecommendations } from "./lib/anime-nodes";
import { getCollectionConfig } from "./lib/collection-config";
import { buildFilterHash } from "./lib/parse-filters";
import { getCurrentSeason } from "./lib/season";

import type {
  AnimeCollection,
  AnimeFilters,
  Media,
  PageInfo,
  CharacterEdge,
  StaffEdge,
  RelationEdge,
  RecommendationNode,
  AiringScheduleNode,
} from "./types/anime";

const MEDIA_SUMMARY_FIELDS = `
  id
  title { romaji english userPreferred }
  coverImage { extraLarge large medium color }
  bannerImage
  averageScore
  popularity
  format
  episodes
  status
  season
  seasonYear
  genres
`;

const MEDIA_CARD_FIELDS = `
  ${MEDIA_SUMMARY_FIELDS}
  description(asHtml: false)
  studios(isMain: true) { nodes { id name } }
`;

// Grid cards clamp the synopsis to three lines (~220 characters), so the full
// multi-KB description only inflates the cache entry and the RSC payload.
const CARD_SYNOPSIS_CHARS = 220;

function trimCardMedia(media: Media): Media {
  const description = media.description;
  if (!description || description.length <= CARD_SYNOPSIS_CHARS) return media;
  return { ...media, description: `${description.slice(0, CARD_SYNOPSIS_CHARS).trimEnd()}…` };
}

// `Page.media` can carry nulls for entries AniList removed mid-crawl.
function trimCardList(items: ReadonlyArray<Media | null | undefined> | null | undefined): Media[] {
  return compact(items).map(trimCardMedia);
}

// The hero clamps the synopsis to three lines, but CSS clamping still ships the
// whole string in the markup and in the RSC payload. A few long-running shows
// carry multi-kilobyte descriptions, so the visible part is all we send.
const HERO_SYNOPSIS_CHARS = 600;

function trimHeroDescription(description: string | undefined): string | undefined {
  if (!description || description.length <= HERO_SYNOPSIS_CHARS) return description;
  return `${description.slice(0, HERO_SYNOPSIS_CHARS).trimEnd()}…`;
}

function withEpisodeLimit(media: Media): Media {
  const episodes = media.streamingEpisodes;
  const limited =
    episodes && episodes.length > STREAMING_EPISODE_LIMIT
      ? { ...media, streamingEpisodes: episodes.slice(0, STREAMING_EPISODE_LIMIT) }
      : media;
  return { ...limited, description: trimHeroDescription(limited.description) };
}

// The episode panel is a 420px scroll area; a long-running series ships around
// 1k rows (~21 KB) that nobody scrolls to. Every row is rendered twice — once
// as markup, once in the RSC payload — so the cap is per-response weight, not
// just payload size.
const STREAMING_EPISODE_LIMIT = 12;
// Related titles: One Piece lists 65. The rail scrolls, so twelve covers carry
// the same information at a fraction of the bytes.
const RELATIONS_LIMIT = 12;

// Slim fragment for airing schedules: timeline/now/home sections render only
// identity, artwork, progress inputs, and streaming links — never description,
// studios, or scores. Used × up to 300 schedules per week fetch, so every
// dropped field multiplies. Includes duration (MEDIA_CARD_FIELDS lacks it,
// which is why the timeline's "· Xm" span never rendered for airing rows).
const AIRING_MEDIA_FIELDS = `
  id
  title { romaji english userPreferred }
  coverImage { extraLarge large medium color }
  bannerImage
  format
  episodes
  duration
  genres
`;

const BROWSE_QUERY = `
  query BrowseCollection(
    $page: Int, $perPage: Int, $sort: [MediaSort], $season: MediaSeason, $seasonYear: Int,
    $status: MediaStatus, $statusIn: [MediaStatus], $formatIn: [MediaFormat],
    $genreIn: [String], $country: CountryCode, $search: String, $isAdult: Boolean
  ) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { hasNextPage total }
      media(
        type: ANIME
        sort: $sort
        season: $season
        seasonYear: $seasonYear
        status: $status
        status_in: $statusIn
        format_in: $formatIn
        genre_in: $genreIn
        countryOfOrigin: $country
        search: $search
        isAdult: $isAdult
      ) {
        ${MEDIA_CARD_FIELDS}
      }
    }
  }
`;

export async function getBrowseCollection(
  collection: AnimeCollection,
  filters: AnimeFilters,
  page: number,
  perPage = 25,
  currentSeason?: { season: string; seasonYear: number },
) {
  "use cache: remote";
  const hash = buildFilterHash(filters);
  cacheTag("anime", `anime:browse:${collection}`, ANIME_CACHE.browseCollection(collection, hash));

  const config = getCollectionConfig(collection, currentSeason);
  cacheLife(config.cacheLife as Parameters<typeof cacheLife>[0]);

  const variables: Record<string, unknown> = {
    page,
    perPage,
    sort: config.sort,
    isAdult: filters.isAdult ?? false,
  };

  if (config.status && !filters.status?.length) variables.status = config.status;
  if (config.season) variables.season = config.season;
  if (config.seasonYear) variables.seasonYear = config.seasonYear;

  if (filters.genre?.length) variables.genreIn = filters.genre;
  if (filters.format?.length) variables.formatIn = filters.format;
  if (filters.status?.length) variables.statusIn = filters.status;
  if (filters.season) variables.season = filters.season;
  if (filters.year) variables.seasonYear = filters.year;
  if (filters.country) variables.country = filters.country;
  if (filters.search) variables.search = filters.search;

  const data = await anilistFetch<{
    Page: { pageInfo: PageInfo; media: Media[] };
  }>(BROWSE_QUERY, variables);

  return {
    items: trimCardList(data.Page.media),
    pageInfo: data.Page.pageInfo,
  };
}

// One request for the whole homepage feed. The sections used to make four
// separate calls (primary, secondary, top-100 preview, genres), which on a cold
// render meant four round trips paced 300ms apart by the rate limiter.
const HOME_FEED_QUERY = `
  query HomeFeed(
    $season: MediaSeason, $seasonYear: Int, $airingStart: Int, $airingEnd: Int
  ) {
    trending: Page(page: 1, perPage: 14) {
      media(type: ANIME, sort: [TRENDING_DESC], isAdult: false) {
        ${MEDIA_CARD_FIELDS}
      }
    }
    popular: Page(page: 1, perPage: 5) {
      media(type: ANIME, sort: [POPULARITY_DESC], season: $season, seasonYear: $seasonYear, isAdult: false) {
        ${MEDIA_CARD_FIELDS}
      }
    }
    upcoming: Page(page: 1, perPage: 7) {
      media(type: ANIME, status: NOT_YET_RELEASED, sort: [POPULARITY_DESC], isAdult: false) {
        ${MEDIA_CARD_FIELDS}
      }
    }
    alltimepopular: Page(page: 1, perPage: 7) {
      media(type: ANIME, sort: [POPULARITY_DESC], isAdult: false) {
        ${MEDIA_CARD_FIELDS}
      }
    }
    top100: Page(page: 1, perPage: 10) {
      media(type: ANIME, sort: [SCORE_DESC], isAdult: false) {
        ${MEDIA_CARD_FIELDS}
      }
    }
    airing: Page(perPage: 12) {
      airingSchedules(airingAt_greater: $airingStart, airingAt_lesser: $airingEnd, sort: [TIME]) {
        episode
        airingAt
        media {
          ${AIRING_MEDIA_FIELDS}
          externalLinks { url site type icon color }
        }
      }
    }
  }
`;

export interface HomeFeed {
  trending: Media[];
  popular: Media[];
  upcoming: Media[];
  alltimepopular: Media[];
  top100: Media[];
  airingSchedules: AiringScheduleNode[];
}

/**
 * 5-minute window shared by every homepage section so they land on one cache
 * entry: the whole feed is a single upstream request instead of four.
 */
export function getHomeBucket(now = Date.now()): number {
  // Epoch seconds (AniList's airingAt type), rounded down to a 5-minute window.
  return Math.floor(now / 300_000) * 300;
}

export async function getHomeFeed(bucket: number): Promise<HomeFeed> {
  "use cache: remote";
  cacheTag("anime", "anime:home:feed");
  cacheLife("home");

  const current = getCurrentSeason();
  const data = await anilistFetch<{
    trending: { media: Media[] };
    popular: { media: Media[] };
    upcoming: { media: Media[] };
    alltimepopular: { media: Media[] };
    top100: { media: Media[] };
    airing: { airingSchedules: AiringScheduleNode[] };
  }>(HOME_FEED_QUERY, {
    season: current.season,
    seasonYear: current.seasonYear,
    airingStart: bucket,
    airingEnd: bucket + 64_800,
  });

  return {
    trending: trimCardList(data.trending.media),
    popular: trimCardList(data.popular.media),
    upcoming: trimCardList(data.upcoming.media),
    alltimepopular: trimCardList(data.alltimepopular.media),
    top100: trimCardList(data.top100.media),
    airingSchedules: compact(data.airing.airingSchedules),
  };
}

const GENRE_QUERY = `
  query GenreCollection {
    GenreCollection
  }
`;

export const STATIC_GENRES = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Ecchi",
  "Fantasy",
  "Hentai",
  "Horror",
  "Mahou Shoujo",
  "Mecha",
  "Music",
  "Mystery",
  "Psychological",
  "Romance",
  "Sci-Fi",
  "Slice of Life",
  "Sports",
  "Supernatural",
  "Thriller",
] as const;

export async function getGenres(): Promise<string[]> {
  "use cache: remote";
  cacheTag(ANIME_CACHE.genres);
  cacheLife("max");

  try {
    const data = await anilistFetch<{ GenreCollection: string[] }>(GENRE_QUERY, {});
    return data.GenreCollection;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[AniList] GenreCollection fetch failed (${message}), using static fallback.`);
    return [...STATIC_GENRES];
  }
}

const HERO_FIELDS = `
  id
  title { romaji english native userPreferred }
  coverImage { extraLarge large color }
  bannerImage
  description(asHtml: false)
  averageScore
  meanScore
  popularity
  favourites
  format
  status
  episodes
  duration
  season
  seasonYear
  genres
  source
  studios(isMain: true) { nodes { id name siteUrl } }
  nextAiringEpisode { episode airingAt timeUntilAiring }
  # streamingEpisodes takes no perPage on AniList; the list is capped in JS.
  streamingEpisodes { title thumbnail url site }
  trailer { id site thumbnail }
  externalLinks { url site type icon color }
`;

const CHARACTERS_SUBFIELDS = `
  edges {
    role
    voiceActors(language: JAPANESE) { id name { full } image { medium } }
    node { id name { full } image { medium } }
  }
`;

const STAFF_SUBFIELDS = `
  edges { role node { id name { full } image { medium } } }
`;

// Relations render as a compact list: cover, title, relation type. Shipping
// MEDIA_SUMMARY_FIELDS there cost ~49 KB on a long-running series.
const RELATION_MEDIA_FIELDS = `
  id
  title { romaji english userPreferred }
  coverImage { large medium color }
`;

const RELATIONS_SUBFIELDS = `
  edges {
    relationType(version: 2)
    node {
      ${RELATION_MEDIA_FIELDS}
    }
  }
`;

const RECOMMENDATIONS_SUBFIELDS = `
  nodes {
    mediaRecommendation {
      ${MEDIA_SUMMARY_FIELDS}
    }
  }
`;

const AIRING_SCHEDULE_SUBFIELDS = `
  nodes { episode airingAt }
`;

const ANIME_DETAIL_QUERY = `
  query AnimeDetailMedia($id: Int) {
    Media(id: $id, type: ANIME) {
      ${HERO_FIELDS}
    }
  }
`;

export async function getAnimeDetail(id: number): Promise<Media | null> {
  "use cache: remote";
  cacheTag("anime", ANIME_CACHE.detail(id));
  cacheLife("detail");

  try {
    const data = await anilistFetch<{ Media: Media | null }>(ANIME_DETAIL_QUERY, { id });
    return data.Media ? withEpisodeLimit(data.Media) : null;
  } catch (error) {
    // AniList returns HTTP 404 for some impossible IDs instead of a successful
    // GraphQL response with Media: null. Preserve the not-found contract for
    // that case, while allowing real outages and network errors to reach the
    // route's retryable error boundary.
    if (error instanceof AniListError && error.status === 404) return null;
    throw error;
  }
}

const ANIME_CHARACTERS_QUERY = `
  query AnimeCharacters($id: Int) {
    Media(id: $id, type: ANIME) {
      characters(page: 1, perPage: 12, sort: [ROLE, RELEVANCE]) {
        ${CHARACTERS_SUBFIELDS}
      }
    }
  }
`;

export async function getAnimeCharacters(id: number): Promise<CharacterEdge[]> {
  "use cache: remote";
  cacheTag("anime", ANIME_CACHE.characters(id));
  cacheLife("static");

  const data = await anilistFetch<{
    Media: { characters?: { edges?: (CharacterEdge | null)[] | null } | null } | null;
  }>(ANIME_CHARACTERS_QUERY, { id });
  return compactEdges(data.Media?.characters?.edges);
}

const ANIME_STAFF_QUERY = `
  query AnimeStaff($id: Int) {
    Media(id: $id, type: ANIME) {
      staff(page: 1, perPage: 10) {
        ${STAFF_SUBFIELDS}
      }
    }
  }
`;

export async function getAnimeStaff(id: number): Promise<StaffEdge[]> {
  "use cache: remote";
  cacheTag("anime", ANIME_CACHE.staff(id));
  cacheLife("static");

  const data = await anilistFetch<{
    Media: { staff?: { edges?: (StaffEdge | null)[] | null } | null } | null;
  }>(ANIME_STAFF_QUERY, { id });
  return compactEdges(data.Media?.staff?.edges);
}

const ANIME_RELATIONS_QUERY = `
  query AnimeRelations($id: Int) {
    Media(id: $id, type: ANIME) {
      relations {
        ${RELATIONS_SUBFIELDS}
      }
    }
  }
`;

export async function getAnimeRelations(id: number): Promise<RelationEdge[]> {
  "use cache: remote";
  cacheTag("anime", ANIME_CACHE.subSection(id, "relations"));
  cacheLife("static");

  const data = await anilistFetch<{
    Media: { relations?: { edges?: (RelationEdge | null)[] | null } | null } | null;
  }>(ANIME_RELATIONS_QUERY, { id });
  return compactEdges(data.Media?.relations?.edges).slice(0, RELATIONS_LIMIT);
}

const ANIME_RECOMMENDATIONS_QUERY = `
  query AnimeRecommendations($id: Int) {
    Media(id: $id, type: ANIME) {
      recommendations(page: 1, perPage: 8, sort: [RATING_DESC]) {
        ${RECOMMENDATIONS_SUBFIELDS}
      }
    }
  }
`;

export async function getAnimeRecommendations(id: number): Promise<RecommendationNode[]> {
  "use cache: remote";
  cacheTag("anime", ANIME_CACHE.subSection(id, "recs"));
  cacheLife("home");

  const data = await anilistFetch<{
    Media: { recommendations?: { nodes?: (RecommendationNode | null)[] | null } | null } | null;
  }>(ANIME_RECOMMENDATIONS_QUERY, { id });
  return compactRecommendations(data.Media?.recommendations?.nodes);
}

const ANIME_AIRING_SCHEDULE_QUERY = `
  query AnimeAiringSchedule($id: Int) {
    Media(id: $id, type: ANIME) {
      airingSchedule(notYetAired: true, perPage: 10) {
        ${AIRING_SCHEDULE_SUBFIELDS}
      }
    }
  }
`;

export async function getAnimeAiringSchedule(id: number): Promise<AiringScheduleNode[]> {
  "use cache: remote";
  cacheTag("anime", ANIME_CACHE.subSection(id, "airing"));
  cacheLife("trending");

  const data = await anilistFetch<{
    Media: { airingSchedule?: { nodes?: AiringScheduleNode[] | null } | null } | null;
  }>(ANIME_AIRING_SCHEDULE_QUERY, { id });
  return data.Media?.airingSchedule?.nodes ?? [];
}

const ANIME_PAGE_BATCH_QUERY = `
  query AnimePageBatch($id: Int) {
    Media(id: $id, type: ANIME) {
      ${HERO_FIELDS}
      characters(page: 1, perPage: 12, sort: [ROLE, RELEVANCE]) {
        ${CHARACTERS_SUBFIELDS}
      }
      staff(page: 1, perPage: 10) {
        ${STAFF_SUBFIELDS}
      }
      relations {
        ${RELATIONS_SUBFIELDS}
      }
      recommendations(page: 1, perPage: 8, sort: [RATING_DESC]) {
        ${RECOMMENDATIONS_SUBFIELDS}
      }
      airingSchedule(notYetAired: true, perPage: 25) {
        ${AIRING_SCHEDULE_SUBFIELDS}
      }
    }
  }
`;

export interface AnimePageBatch {
  media: Media | null;
  characters: CharacterEdge[];
  staff: StaffEdge[];
  relations: RelationEdge[];
  recommendations: RecommendationNode[];
  airingSchedule: AiringScheduleNode[];
}

/**
 * Degraded-mode detail fetch: hero + all sub-sections in ONE AniList request
 * instead of six. Every section on /anime/[id] reads this same cached entry,
 * so concurrent Suspense boundaries collapse onto a single origin call via
 * `use cache` + request dedup. Freshness uses `home` (most sections already
 * did); static sections refresh slightly more often — right tradeoff while
 * the API is capped at 30 req/min.
 */
export async function getAnimePageBatch(id: number): Promise<AnimePageBatch> {
  "use cache: remote";
  cacheTag(
    "anime",
    ANIME_CACHE.detail(id),
    ANIME_CACHE.characters(id),
    ANIME_CACHE.staff(id),
    ANIME_CACHE.subSection(id, "relations"),
    ANIME_CACHE.subSection(id, "recs"),
    ANIME_CACHE.subSection(id, "airing"),
  );
  cacheLife("detail");

  const empty: AnimePageBatch = {
    media: null,
    characters: [],
    staff: [],
    relations: [],
    recommendations: [],
    airingSchedule: [],
  };

  try {
    const data = await anilistFetch<{
      Media:
        | (Media & {
            characters?: { edges?: (CharacterEdge | null)[] | null } | null;
            staff?: { edges?: (StaffEdge | null)[] | null } | null;
            relations?: { edges?: (RelationEdge | null)[] | null } | null;
            recommendations?: { nodes?: (RecommendationNode | null)[] | null } | null;
            airingSchedule?: { nodes?: (AiringScheduleNode | null)[] | null } | null;
          })
        | null;
    }>(ANIME_PAGE_BATCH_QUERY, { id });
    const m = data.Media;
    if (!m) return empty;
    const media = withEpisodeLimit(m);
    return {
      media,
      characters: compactEdges(m.characters?.edges),
      staff: compactEdges(m.staff?.edges),
      relations: compactEdges(m.relations?.edges).slice(0, RELATIONS_LIMIT),
      recommendations: compactRecommendations(m.recommendations?.nodes),
      // A schedule row is only renderable when it still resolves to a media
      // entry — AniList leaves the media null for entries it removed.
      airingSchedule: compact(m.airingSchedule?.nodes).filter((node) => node.media != null),
    };
  } catch (error) {
    if (error instanceof AniListError && error.status === 404) return empty;
    throw error;
  }
}

const AIRING_DAY_QUERY = `
  query AiringDay($start: Int, $end: Int, $page: Int) {
    Page(page: $page, perPage: 50) {
      pageInfo {
        hasNextPage
        total
      }
      airingSchedules(airingAt_greater: $start, airingAt_lesser: $end, sort: [TIME]) {
        episode
        airingAt
        media {
          ${AIRING_MEDIA_FIELDS}
          externalLinks { url site type icon color }
        }
      }
    }
  }
`;

// NOTE: AniList's `pageInfo.total` for airingSchedules is unreliable (returns a
// capped 5000 for single-day windows), so day counts are derived by fetching a
// week's schedules once and bucketing by day in getAiringWeek.

const MAX_AIRING_PAGES = 6;
const AIRING_PARALLEL_PAGES = 2;

/** All schedules across [start, end) — used to derive accurate per-day counts. */
export async function getAiringWeekItems(
  start: number,
  end: number,
): Promise<AiringScheduleNode[]> {
  "use cache: remote";
  cacheTag("anime", ANIME_CACHE.airingDay(`week:${start}`, start));
  cacheLife("airing");

  const allSchedules: AiringScheduleNode[] = [];

  // Fetch page 1 first so a quiet week costs a single request, then fetch any
  // remaining pages in bounded parallel waves. The fetch client already caps
  // concurrency, so Promise.all can't fan out past that limit.
  const first = await anilistFetch<{
    Page: {
      pageInfo: { hasNextPage: boolean };
      airingSchedules: (AiringScheduleNode | null)[];
    };
  }>(AIRING_DAY_QUERY, { start, end, page: 1 });
  allSchedules.push(...compact(first.Page.airingSchedules));

  let page = 2;
  let hasNextPage = first.Page.pageInfo.hasNextPage;

  while (hasNextPage && page <= MAX_AIRING_PAGES) {
    const waveSize = Math.min(AIRING_PARALLEL_PAGES, MAX_AIRING_PAGES - page + 1);
    const pages = Array.from({ length: waveSize }, (_, i) => page + i);
    const results = await Promise.all(
      pages.map((p) =>
        anilistFetch<{
          Page: {
            pageInfo: { hasNextPage: boolean };
            airingSchedules: (AiringScheduleNode | null)[];
          };
        }>(AIRING_DAY_QUERY, { start, end, page: p }),
      ),
    );

    for (const data of results) allSchedules.push(...compact(data.Page.airingSchedules));
    hasNextPage = results[results.length - 1].Page.pageInfo.hasNextPage;
    page += waveSize;
  }

  return allSchedules;
}

/**
 * The seven-day rail shown above the schedule, plus every schedule in that
 * window bucketed per local day. The window is anchored at the visitor's today
 * (so TODAY stays in reach) unless the selected day is more than a week out —
 * or in the past — in which case the selection anchors it. Because the window
 * always contains the selected day, day switches can slice this data
 * client-side instead of re-fetching.
 */
export async function getAiringWeek(
  day: string,
  offsetMinutes?: number,
): Promise<{
  days: { day: string; count: number }[];
  today: string;
  schedules: Record<string, AiringScheduleNode[]>;
  context: ReturnType<typeof createAiringContext>;
}> {
  const context = createAiringContext(day, offsetMinutes);
  const { today } = context;
  const safeOffset = context.offsetMinutes;
  // ISO dates compare lexicographically = chronologically.
  const anchor = day >= today && day <= addDays(today, 6) ? today : day;
  const days = Array.from({ length: 7 }, (_, i) => addDays(anchor, i));

  const bounds = getAiringDayBounds(anchor, safeOffset);
  if (!bounds) {
    return { days: days.map((d) => ({ day: d, count: 0 })), today, schedules: {}, context };
  }

  const offset = safeOffset ?? 0;
  const weekItems = await getAiringWeekItems(bounds.start, bounds.start + 86400 * 7);

  const counts = new Array<number>(7).fill(0);
  const schedules: Record<string, AiringScheduleNode[]> = {};
  for (const s of weekItems) {
    const dayStr = dateStrFromEpoch(s.airingAt, offset);
    const idx = days.indexOf(dayStr);
    if (idx >= 0) counts[idx] += 1;
    (schedules[dayStr] ??= []).push(s);
  }
  for (const d of days) schedules[d] ??= [];

  return {
    days: days.map((d, i) => ({ day: d, count: counts[i] })),
    today,
    schedules,
    context,
  };
}
