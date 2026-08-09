import "server-only";
import { cacheTag, cacheLife } from "next/cache";

import { anilistFetch } from "@/lib/anilist";

import { ANIME_CACHE } from "./anime-cache";
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
    items: data.Page.media,
    pageInfo: data.Page.pageInfo,
  };
}

const TOP100_FULL_QUERY = `
  query Top100Full {
    page1: Page(page: 1, perPage: 50) {
      media(type: ANIME, sort: [SCORE_DESC], isAdult: false) {
        ${MEDIA_CARD_FIELDS}
      }
    }
    page2: Page(page: 2, perPage: 50) {
      media(type: ANIME, sort: [SCORE_DESC], isAdult: false) {
        ${MEDIA_CARD_FIELDS}
      }
    }
  }
`;

export async function getTop100Full(): Promise<Media[]> {
  "use cache: remote";
  cacheTag("anime", "anime:top100:full");
  cacheLife("static");

  const data = await anilistFetch<{
    page1: { media: Media[] };
    page2: { media: Media[] };
  }>(TOP100_FULL_QUERY, {});

  return [...data.page1.media, ...data.page2.media];
}

const HOME_PRIMARY_BATCH_QUERY = `
  query HomePrimaryBatch($season: MediaSeason, $seasonYear: Int) {
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
  }
`;

export async function getHomePrimaryBatch() {
  "use cache: remote";
  cacheTag("anime", "anime:home:primary");
  cacheLife("trending");

  const current = getCurrentSeason();
  const data = await anilistFetch<{
    trending: { media: Media[] };
    popular: { media: Media[] };
  }>(HOME_PRIMARY_BATCH_QUERY, { season: current.season, seasonYear: current.seasonYear });

  return {
    trending: data.trending.media,
    popular: data.popular.media,
  };
}

const HOME_SECONDARY_BATCH_QUERY = `
  query HomeSecondaryBatch($airingStart: Int, $airingEnd: Int) {
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
    airing: Page(perPage: 50) {
      airingSchedules(airingAt_greater: $airingStart, airingAt_lesser: $airingEnd, sort: [TIME]) {
        episode
        airingAt
        media {
          ${MEDIA_CARD_FIELDS}
          externalLinks { url site type icon color }
        }
      }
    }
  }
`;

export async function getHomeSecondaryBatch(start: number, end: number) {
  "use cache: remote";
  cacheTag("anime", "anime:home:secondary");
  cacheLife("home");

  const data = await anilistFetch<{
    upcoming: { media: Media[] };
    alltimepopular: { media: Media[] };
    airing: { airingSchedules: AiringScheduleNode[] };
  }>(HOME_SECONDARY_BATCH_QUERY, { airingStart: start, airingEnd: end });

  return {
    upcoming: data.upcoming.media,
    alltimepopular: data.alltimepopular.media,
    airingSchedules: data.airing.airingSchedules,
  };
}

const GENRE_QUERY = `
  query GenreCollection {
    GenreCollection
  }
`;

export async function getGenres() {
  "use cache: remote";
  cacheTag(ANIME_CACHE.genres);
  cacheLife("max");

  const data = await anilistFetch<{ GenreCollection: string[] }>(GENRE_QUERY, {});
  return data.GenreCollection;
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

const RELATIONS_SUBFIELDS = `
  edges {
    relationType(version: 2)
    node {
      ${MEDIA_SUMMARY_FIELDS}
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

const ANIME_FULL_DETAIL_QUERY = `
  query AnimeFullDetail($id: Int) {
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

export interface AnimeFullDetailData {
  media: Media;
  characters: CharacterEdge[];
  staff: StaffEdge[];
  relations: RelationEdge[];
  recommendations: RecommendationNode[];
  airingSchedule: AiringScheduleNode[];
}

export async function getAnimeFullDetail(id: number): Promise<AnimeFullDetailData | null> {
  "use cache: remote";
  cacheTag("anime", ANIME_CACHE.detail(id));
  cacheLife("home");

  const data = await anilistFetch<{
    Media:
      | (Media & {
          characters?: { edges?: CharacterEdge[] | null } | null;
          staff?: { edges?: StaffEdge[] | null } | null;
          relations?: { edges?: RelationEdge[] | null } | null;
          recommendations?: { nodes?: RecommendationNode[] | null } | null;
          airingSchedule?: { nodes?: AiringScheduleNode[] | null } | null;
        })
      | null;
  }>(ANIME_FULL_DETAIL_QUERY, { id });

  const m = data.Media;
  if (!m) return null;

  return {
    media: m,
    characters: m.characters?.edges ?? [],
    staff: m.staff?.edges ?? [],
    relations: m.relations?.edges ?? [],
    recommendations: m.recommendations?.nodes ?? [],
    airingSchedule: m.airingSchedule?.nodes ?? [],
  };
}

const AIRING_DAY_QUERY = `
  query AiringDay($start: Int, $end: Int) {
    Page(perPage: 50) {
      airingSchedules(airingAt_greater: $start, airingAt_lesser: $end, sort: [TIME]) {
        episode
        airingAt
        media {
          ${MEDIA_CARD_FIELDS}
          externalLinks { url site type icon color }
        }
      }
    }
  }
`;

export async function getAiringDay(day: string, start: number, end: number) {
  "use cache: remote";
  cacheTag("anime", ANIME_CACHE.airingDay(day, start));
  cacheLife("airing");

  const data = await anilistFetch<{
    Page: { airingSchedules: AiringScheduleNode[] };
  }>(AIRING_DAY_QUERY, { start, end });

  return data.Page.airingSchedules;
}
