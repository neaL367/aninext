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
  "use cache: remote";
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
  "use cache: remote";
  cacheTag(ANIME_CACHE.genres);
  cacheLife({ stale: 86400, revalidate: 604800, expire: 1209600 });

  const data = await anilistFetch<{ GenreCollection: string[] }>(GENRE_QUERY, {});
  return data.GenreCollection;
}

const HOME_SECTION_PER_PAGE: Record<string, number> = {
  trending: 14,
  popular: 5,
  top100: 14,
  upcoming: 7,
  alltimepopular: 7,
};

const HOME_COLLECTION_ALIASES = (Object.keys(HOME_SECTION_PER_PAGE) as AnimeCollection[])
  .map((key) => {
    const c = COLLECTIONS[key];
    const args = [
      `sort: [${c.sort.join(", ")}]`,
      c.status ? `status: ${c.status}` : null,
      c.season ? `season: ${c.season}` : null,
      c.seasonYear ? `seasonYear: ${c.seasonYear}` : null,
      "isAdult: false",
    ]
      .filter(Boolean)
      .join(", ");
    return `${key}: Page(page: 1, perPage: ${HOME_SECTION_PER_PAGE[key]}) {
      media(type: ANIME, ${args}) {
        ${MEDIA_CARD_FIELDS}
      }
    }`;
  })
  .join("\n");

const HOME_QUERY = `
  query HomeData($start: Int, $end: Int) {
    hero: Page(page: 1, perPage: 5) {
      media(type: ANIME, sort: [TRENDING_DESC], isAdult: false) {
        ${MEDIA_CARD_FIELDS}
      }
    }
    ${HOME_COLLECTION_ALIASES}
    airing: Page(perPage: 50) {
      airingSchedules(airingAt_greater: $start, airingAt_lesser: $end, sort: [TIME]) {
        episode
        airingAt
        media {
          ${MEDIA_CARD_FIELDS}
          externalLinks { url site type }
        }
      }
    }
    genres: GenreCollection
  }
`;

type HomeData = {
  hero: { media: Media[] };
  trending: { media: Media[] };
  popular: { media: Media[] };
  top100: { media: Media[] };
  upcoming: { media: Media[] };
  alltimepopular: { media: Media[] };
  airing: { airingSchedules: AiringScheduleNode[] };
  genres: string[];
};

export async function getHomeData(start: number, end: number, season: string, seasonYear: number) {
  "use cache: remote";
  cacheTag("anime", ANIME_CACHE.home);
  cacheLife("home" as Parameters<typeof cacheLife>[0]);

  const data = await anilistFetch<HomeData>(HOME_QUERY, { start, end });

  return {
    hero: data.hero.media,
    trending: data.trending.media,
    popular: data.popular.media,
    top100: data.top100.media,
    upcoming: data.upcoming.media,
    alltimepopular: data.alltimepopular.media,
    airing: data.airing.airingSchedules,
    genres: data.genres,
  };
}

const META_FIELDS = `
  id
  title { english romaji userPreferred }
  bannerImage
  description(asHtml: false)
`;

export async function getAnimeMeta(id: number) {
  "use cache: remote";
  cacheTag("anime", ANIME_CACHE.detail(id));
  cacheLife({ stale: 300, revalidate: 900, expire: 86400 });

  const data = await anilistFetch<{ Media: Media }>(
    `query AnimeMeta($id: Int) {
      Media(id: $id, type: ANIME) {
        ${META_FIELDS}
      }
    }`,
    { id },
  );

  return data.Media;
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

export async function getAnimeHero(id: number) {
  "use cache: remote";
  cacheTag("anime", ANIME_CACHE.detail(id));
  cacheLife({ stale: 300, revalidate: 900, expire: 86400 });

  const data = await anilistFetch<{ Media: Media }>(
    `query AnimeHero($id: Int) {
      Media(id: $id, type: ANIME) {
        ${HERO_FIELDS}
      }
    }`,
    { id },
  );

  return data.Media;
}

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
  "use cache: remote";
  const date = localDateStr(fromAiringTimestamp(start));
  cacheTag("anime", ANIME_CACHE.airingDay(date, start));
  cacheLife({ stale: 180, revalidate: 900, expire: 3600 });

  const data = await anilistFetch<{
    Page: { airingSchedules: AiringScheduleNode[] };
  }>(AIRING_WEEK_QUERY, { start, end });

  return data.Page.airingSchedules;
}

export async function getAiringDay(day: string, start: number, end: number) {
  "use cache: remote";
  cacheTag("anime", ANIME_CACHE.airingDay(day, start));
  cacheLife({ stale: 180, revalidate: 900, expire: 3600 });

  const data = await anilistFetch<{
    Page: { airingSchedules: AiringScheduleNode[] };
  }>(AIRING_WEEK_QUERY, { start, end });

  return data.Page.airingSchedules;
}
export async function getAnimeDetail(id: number) {
  "use cache: remote";
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
