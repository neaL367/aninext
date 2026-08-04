import "server-only";
import { cacheTag, cacheLife } from "next/cache";
import { anilistFetch } from "@/lib/anilist";
import { ANIME_CACHE } from "./anime-cache";
import { COLLECTIONS } from "./lib/collection-config";
import { buildFilterHash } from "./lib/parse-filters";
import { fromAiringTimestamp } from "./lib/media-helpers";
import type {
  AnimeCollection,
  AnimeFilters,
  Media,
  PageInfo,
  CharacterEdge,
  StaffEdge,
  RelationEdge,
  RecommendationNode,
  ReviewNode,
  AiringScheduleNode,
} from "./types/anime";

const MEDIA_CARD_FIELDS = `
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
  description(asHtml: false)
  studios(isMain: true) { nodes { id name } }
`;

const BROWSE_QUERY = `
  query BrowseCollection(
    $page: Int, $perPage: Int, $sort: [MediaSort], $season: MediaSeason, $seasonYear: Int,
    $status: MediaStatus, $statusIn: [MediaStatus], $formatIn: [MediaFormat],
    $genre: String, $country: CountryCode, $search: String, $isAdult: Boolean
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
        genre: $genre
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
  perPage = 25
) {
  "use cache";
  const hash = buildFilterHash(filters);
  cacheTag("anime", `anime:browse:${collection}`, ANIME_CACHE.browseCollection(collection, hash));

  const config = COLLECTIONS[collection];
  cacheLife({ stale: 60, revalidate: 300, expire: 3600 });

  const variables: Record<string, unknown> = {
    page,
    perPage,
    sort: config.sort,
    isAdult: filters.isAdult ?? false,
  };

  if (config.status) variables.status = config.status;
  if (config.season) variables.season = config.season;
  if (config.seasonYear) variables.seasonYear = config.seasonYear;

  if (filters.genre) variables.genre = filters.genre;
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

const HERO_QUERY = `
  query AnimeHero($id: Int) {
    Media(id: $id, type: ANIME) {
      ${HERO_FIELDS}
    }
  }
`;

export async function getAnimeHero(id: number) {
  "use cache";
  cacheTag("anime", ANIME_CACHE.detail(id));
  cacheLife({ stale: 300, revalidate: 900, expire: 86400 });

  const data = await anilistFetch<{ Media: Media }>(HERO_QUERY, { id });
  return data.Media;
}

const CHARACTERS_SUBFIELDS = `
  pageInfo { hasNextPage }
  edges {
    role
    voiceActors(language: JAPANESE) { id name { full } image { medium } }
    node { id name { full } image { medium } }
  }
`;

const CHARACTERS_QUERY = `
  query AnimeCharacters($id: Int, $page: Int) {
    Media(id: $id) {
      characters(page: $page, perPage: 12, sort: [ROLE, RELEVANCE]) {
        ${CHARACTERS_SUBFIELDS}
      }
    }
  }
`;

export async function getAnimeCharacters(id: number, page = 1) {
  "use cache";
  cacheTag("anime", ANIME_CACHE.characters(id));
  cacheLife({ stale: 3600, revalidate: 21600, expire: 604800 });

  const data = await anilistFetch<{
    Media: { characters: { pageInfo: PageInfo; edges: CharacterEdge[] } };
  }>(CHARACTERS_QUERY, { id, page });

  return {
    edges: data.Media.characters.edges,
    pageInfo: data.Media.characters.pageInfo,
  };
}

const STAFF_SUBFIELDS = `
  edges { role node { id name { full } image { medium } } }
`;

const STAFF_QUERY = `
  query AnimeStaff($id: Int, $page: Int) {
    Media(id: $id) {
      staff(page: $page, perPage: 10) {
        ${STAFF_SUBFIELDS}
      }
    }
  }
`;

export async function getAnimeStaff(id: number, page = 1) {
  "use cache";
  cacheTag("anime", ANIME_CACHE.staff(id));
  cacheLife({ stale: 3600, revalidate: 21600, expire: 604800 });

  const data = await anilistFetch<{
    Media: { staff: { edges: StaffEdge[] } };
  }>(STAFF_QUERY, { id, page });

  return data.Media.staff.edges;
}

const RELATIONS_SUBFIELDS = `
  edges {
    relationType(version: 2)
    node {
      id
      title { romaji english userPreferred }
      coverImage { extraLarge large }
      bannerImage
      averageScore
      popularity
      format
      episodes
      status
      season
      seasonYear
      genres
    }
  }
`;

const RELATIONS_QUERY = `
  query AnimeRelations($id: Int) {
    Media(id: $id) {
      relations {
        ${RELATIONS_SUBFIELDS}
      }
    }
  }
`;

export async function getAnimeRelations(id: number) {
  "use cache";
  cacheTag("anime", ANIME_CACHE.subSection(id, "relations"));
  cacheLife({ stale: 3600, revalidate: 21600, expire: 604800 });

  const data = await anilistFetch<{
    Media: { relations: { edges: RelationEdge[] } };
  }>(RELATIONS_QUERY, { id });

  return data.Media.relations.edges;
}

const RECOMMENDATIONS_SUBFIELDS = `
  nodes {
    mediaRecommendation {
      id
      title { romaji english userPreferred }
      coverImage { extraLarge large }
      bannerImage
      averageScore
      popularity
      format
      episodes
      status
      season
      seasonYear
      genres
    }
  }
`;

const RECOMMENDATIONS_QUERY = `
  query AnimeRecommendations($id: Int, $page: Int) {
    Media(id: $id) {
      recommendations(page: $page, perPage: 8, sort: [RATING_DESC]) {
        ${RECOMMENDATIONS_SUBFIELDS}
      }
    }
  }
`;

export async function getAnimeRecommendations(id: number, page = 1) {
  "use cache";
  cacheTag("anime", ANIME_CACHE.subSection(id, "recs"));
  cacheLife({ stale: 300, revalidate: 900, expire: 86400 });

  const data = await anilistFetch<{
    Media: { recommendations: { nodes: RecommendationNode[] } };
  }>(RECOMMENDATIONS_QUERY, { id, page });

  return data.Media.recommendations.nodes;
}

const REVIEWS_SUBFIELDS = `
  nodes { id summary score user { name avatar { medium } } }
`;

const REVIEWS_QUERY = `
  query AnimeReviews($id: Int, $page: Int) {
    Media(id: $id) {
      reviews(page: $page, perPage: 5, sort: [RATING_DESC]) {
        ${REVIEWS_SUBFIELDS}
      }
    }
  }
`;

export async function getAnimeReviews(id: number, page = 1) {
  "use cache";
  cacheTag("anime", ANIME_CACHE.subSection(id, "reviews"));
  cacheLife({ stale: 300, revalidate: 900, expire: 86400 });

  const data = await anilistFetch<{
    Media: { reviews: { nodes: ReviewNode[] } };
  }>(REVIEWS_QUERY, { id, page });

  return data.Media.reviews.nodes;
}

const AIRING_SCHEDULE_SUBFIELDS = `
  nodes { episode airingAt }
`;

const AIRING_SCHEDULE_QUERY = `
  query AnimeAiringSchedule($id: Int) {
    Media(id: $id) {
      airingSchedule(notYetAired: true, perPage: 25) {
        ${AIRING_SCHEDULE_SUBFIELDS}
      }
    }
  }
`;

export async function getAnimeAiringSchedule(id: number) {
  "use cache";
  cacheTag("anime", ANIME_CACHE.subSection(id, "airing"));
  cacheLife({ stale: 60, revalidate: 300, expire: 3600 });

  const data = await anilistFetch<{
    Media: { airingSchedule: { nodes: AiringScheduleNode[] } };
  }>(AIRING_SCHEDULE_QUERY, { id });

  return data.Media.airingSchedule.nodes;
}

const AIRING_WEEK_QUERY = `
  query AiringWeek($start: Int, $end: Int) {
    Page(perPage: 50) {
      airingSchedules(airingAt_greater: $start, airingAt_lesser: $end, sort: [TIME]) {
        episode
        airingAt
        media {
          id
          title { userPreferred }
          coverImage { medium }
          format
        }
      }
    }
  }
`;

export async function getAiringWeek(start: number, end: number) {
  "use cache";
  const date = fromAiringTimestamp(start).toISOString().split("T")[0];
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
      characters: { pageInfo: PageInfo; edges: CharacterEdge[] };
      staff: { edges: StaffEdge[] };
      relations: { edges: RelationEdge[] };
      recommendations: { nodes: RecommendationNode[] };
      reviews: { nodes: ReviewNode[] };
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
        reviews(page: 1, perPage: 5, sort: [RATING_DESC]) {
          ${REVIEWS_SUBFIELDS}
        }
        airingSchedule(notYetAired: true, perPage: 25) {
          ${AIRING_SCHEDULE_SUBFIELDS}
        }
      }
    }`,
    { id }
  );

  const m = data.Media;
  return {
    media: m as Media,
    characters: { edges: m.characters.edges, pageInfo: m.characters.pageInfo },
    staff: m.staff.edges,
    relations: m.relations.edges,
    recommendations: m.recommendations.nodes,
    reviews: m.reviews.nodes,
    airingSchedule: m.airingSchedule.nodes,
  };
}
