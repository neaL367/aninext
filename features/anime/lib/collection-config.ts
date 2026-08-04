import type { Metadata } from "next";
import type { AnimeCollection } from "@/features/anime/types/anime";
import { getCurrentSeason } from "./season";

export interface CollectionConfig {
  title: string;
  heading: string;
  description: string;
  pageHeading: string;
  pageDescription: string;
  navLabel: string;
  sort: string[];
  status?: string;
  season?: string;
  seasonYear?: number;
  cacheLife: "trending" | "home" | "static";
}

export const COLLECTIONS: Record<AnimeCollection, CollectionConfig> = {
  trending: {
    title: "Trending Anime — AniNext",
    heading: "Trending Anime",
    description:
      "See what anime is trending right now based on community activity.",
    pageHeading: "Trending Anime",
    pageDescription: "What everyone's watching right now",
    navLabel: "Trending",
    sort: ["TRENDING_DESC"],
    cacheLife: "trending",
  },
  popular: {
    title: "Popular Anime This Season — AniNext",
    heading: "Popular This Season",
    description: "The most popular anime airing this season.",
    pageHeading: "Popular This Season",
    pageDescription: "The most watched shows right now",
    navLabel: "Popular",
    sort: ["POPULARITY_DESC"],
    ...getCurrentSeason(),
    cacheLife: "home",
  },
  top100: {
    title: "Top 100 Anime of All Time — AniNext",
    heading: "Top 100 Anime",
    description:
      "The 100 highest-rated anime of all time, ranked by user scores.",
    pageHeading: "Top 100 Anime",
    pageDescription: "Highest rated of all time",
    navLabel: "Top 100",
    sort: ["SCORE_DESC"],
    cacheLife: "static",
  },
  upcoming: {
    title: "Upcoming Anime — AniNext",
    heading: "Upcoming Anime",
    description: "The most anticipated upcoming anime.",
    pageHeading: "Coming Soon",
    pageDescription: "Not yet released — set your reminders",
    navLabel: "Upcoming",
    sort: ["POPULARITY_DESC"],
    status: "NOT_YET_RELEASED",
    cacheLife: "home",
  },
  alltimepopular: {
    title: "Most Popular Anime — AniNext",
    heading: "Most Popular Anime",
    description:
      "The most popular anime of all time by community engagement.",
    pageHeading: "All-Time Popular",
    pageDescription: "The most beloved anime ever made",
    navLabel: "All-Time",
    sort: ["POPULARITY_DESC"],
    cacheLife: "home",
  },
  seasonal: {
    title: "Seasonal Anime — AniNext",
    heading: "Seasonal Anime",
    description: "Browse anime by season and year.",
    pageHeading: "Seasonal Anime",
    pageDescription: "Explore anime from specific seasons and years",
    navLabel: "Seasonal",
    sort: ["POPULARITY_DESC"],
    cacheLife: "home",
  },
};

const COLLECTION_ORDER: AnimeCollection[] = [
  "trending",
  "popular",
  "top100",
  "upcoming",
  "alltimepopular",
  "seasonal",
];

export const COLLECTION_NAV_ITEMS = COLLECTION_ORDER.map((id) => ({
  id,
  label: COLLECTIONS[id].navLabel,
}));

export function getCollectionMetadata(
  collection: AnimeCollection
): Metadata {
  const c = COLLECTIONS[collection];
  return {
    title: c.title,
    description: c.description,
    openGraph: {
      title: c.title,
      description: c.description,
      type: "website",
    },
    alternates: { canonical: `/anime/${collection}` },
  };
}
