import "server-only";
import { cacheTag, cacheLife } from "next/cache";

import { anilistFetch } from "@/lib/anilist";

import { ANIME_CACHE } from "./anime-cache";
import { COLLECTIONS } from "./lib/collection-config";
import { localDateStr, fromAiringTimestamp } from "./lib/media-helpers";
import { buildFilterHash } from "./lib/parse-filters";

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
) {
  "use cache";
  const hash = buildFilterHash(filters);
  cacheTag("anime", `anime:browse:${collection}`, ANIME_CACHE.browseCollection(collection, hash));

  const config = COLLECTIONS[collection];
  // custom profiles (next.config cacheLife) aren't part of the builtin union
  cacheLife(config.cacheLife as Parameters<typeof cacheLife>[0]);

  const variables: Record<string, unknown> = {
    page,
    perPage,
    sort: config.sort,
    isAdult: filters.isAdult ?? false,
  };

  if (config.status) variables.status = config.status;
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

const GENRE_QUERY = `
  query GenreCollection {
    GenreCollection
  }
`;

export async function getGenres() {
  "use cache";
  cacheTag(ANIME_CACHE.genres);
  cacheLife({ stale: 3600, revalidate: 21600, expire: 604800 });

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

const AIRING_WEEK_QUERY = `
  query AiringWeek($start: Int, $end: Int) {
    Page(perPage: 50) {
      airingSchedules(airingAt_greater: $start, airingAt_lesser: $end, sort: [TIME]) {
        episode
        airingAt
        media {
          ${MEDIA_CARD_FIELDS}
          externalLinks { url site type }
        }
      }
    }
  }
`;

export async function getAiringWeek(start: number, end: number) {
  "use cache";
  const date = localDateStr(fromAiringTimestamp(start));
  cacheTag("anime", ANIME_CACHE.airingDay(date));
  cacheLife({ stale: 60, revalidate: 300, expire: 3600 });

  const data = await anilistFetch<{
    Page: { airingSchedules: AiringScheduleNode[] };
  }>(AIRING_WEEK_QUERY, { start, end });

  return data.Page.airingSchedules;
}
export async function getAnimeDetail(id: number) {
  "use cache";
  cacheTag("anime", ANIME_CACHE.detail(id));
  cacheLife({ stale: 300, revalidate: 900, expire: 86400 });

  const data = await anilistFetch<{
    Media: Media & {
      characters: { edges: CharacterEdge[] };
      staff: { edges: StaffEdge[] };
      relations: { edges: RelationEdge[] };
      recommendations: { nodes: RecommendationNode[] };
      airingSchedule: { nodes: AiringScheduleNode[] };
    };
  }>(
    `query AnimeDetail($id: Int) {
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
    }`,
    { id },
  );

  const m = data.Media;
  return {
    media: m as Media,
    characters: { edges: m.characters.edges },
    staff: m.staff.edges,
    relations: m.relations.edges,
    recommendations: m.recommendations.nodes,
    airingSchedule: m.airingSchedule.nodes,
  };
}
