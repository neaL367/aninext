export interface MediaTitle {
  romaji?: string;
  english?: string;
  native?: string;
  userPreferred?: string;
}

export interface MediaCoverImage {
  extraLarge?: string;
  large?: string;
  medium?: string;
  color?: string;
}

export interface Studio {
  id: number;
  name: string;
  siteUrl?: string;
}

export interface Media {
  id: number;
  idMal?: number;
  title: MediaTitle;
  coverImage: MediaCoverImage;
  bannerImage?: string;
  description?: string;
  format?: string;
  status?: string;
  episodes?: number;
  duration?: number;
  season?: string;
  seasonYear?: number;
  genres: string[];
  averageScore?: number;
  meanScore?: number;
  popularity?: number;
  favourites?: number;
  source?: string;
  studios?: { nodes: Studio[] };
  nextAiringEpisode?: {
    episode: number;
    airingAt: number;
    timeUntilAiring: number;
  };
  streamingEpisodes?: StreamingEpisode[];
  trailer?: Trailer;
  externalLinks?: MediaExternalLink[];
}

export interface Trailer {
  id?: string;
  site?: string;
  thumbnail?: string;
}

export interface StreamingEpisode {
  id?: number;
  title?: string;
  thumbnail?: string;
  url?: string;
  site?: string;
}

export interface PageInfo {
  total: number;
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
  perPage: number;
}

export interface CharacterEdge {
  role: string;
  voiceActors: {
    id: number;
    name: { full: string };
    image: { medium: string };
  }[];
  node: {
    id: number;
    name: { full: string };
    image: { medium: string };
  };
}

export interface StaffEdge {
  role: string;
  node: {
    id: number;
    name: { full: string };
    image: { medium: string };
  };
}

export interface RelationEdge {
  relationType: string;
  node: Media & {
    relationType?: string;
  };
}

export interface RecommendationNode {
  mediaRecommendation: Media;
}

export interface AiringScheduleNode {
  episode: number;
  airingAt: number;
  media?: Media & {
    externalLinks?: MediaExternalLink[];
  };
}

export interface MediaExternalLink {
  url: string;
  site: string;
  type?: string;
}

export type AnimeCollection =
  | "trending"
  | "popular"
  | "top100"
  | "upcoming"
  | "alltimepopular"
  | "seasonal";

export interface AnimeFilters {
  genre?: string[];
  format?: string[];
  status?: string[];
  season?: string;
  year?: number;
  country?: string;
  search?: string;
  isAdult?: boolean;
}
