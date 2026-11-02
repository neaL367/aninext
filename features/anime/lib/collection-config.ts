import { getCurrentSeason } from "./season";

import type { AnimeCollection } from "@/features/anime/types/anime";
import type { Metadata } from "next";

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
    title: "Trending",
    heading: "Trending",
    description: "What anime is trending right now.",
    pageHeading: "Trending",
    pageDescription: "The titles people are watching right now.",
    navLabel: "Trending",
    sort: ["TRENDING_DESC"],
    cacheLife: "trending",
  },
  popular: {
    title: "Popular this season",
    heading: "Popular this season",
    description: "The most watched anime of the current season.",
    pageHeading: "This season",
    pageDescription: "The most watched shows right now.",
    navLabel: "Season",
    sort: ["POPULARITY_DESC"],
    cacheLife: "home",
  },
  top100: {
    title: "Top 100",
    heading: "Top 100",
    description: "The highest-rated anime of all time.",
    pageHeading: "Top 100",
    pageDescription: "The highest-rated anime of all time.",
    navLabel: "Top 100",
    sort: ["SCORE_DESC"],
    cacheLife: "static",
  },
  upcoming: {
    title: "Coming soon",
    heading: "Coming soon",
    description: "The most anticipated unreleased anime.",
    pageHeading: "Coming soon",
    pageDescription: "Not released yet, already on the radar.",
    navLabel: "Upcoming",
    sort: ["POPULARITY_DESC"],
    status: "NOT_YET_RELEASED",
    cacheLife: "home",
  },
  alltimepopular: {
    title: "All time",
    heading: "All time",
    description: "The most popular anime ever made.",
    pageHeading: "All time",
    pageDescription: "The most popular anime ever made.",
    navLabel: "All time",
    sort: ["POPULARITY_DESC"],
    cacheLife: "home",
  },
  seasonal: {
    title: "Seasonal",
    heading: "Seasonal",
    description: "Browse anime by season and year.",
    pageHeading: "Seasonal",
    pageDescription: "Browse by season.",
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

export function getCollectionConfig(
  collection: AnimeCollection,
  currentSeason = getCurrentSeason(),
): CollectionConfig {
  const config = COLLECTIONS[collection];
  return collection === "popular" ? { ...config, ...currentSeason } : config;
}

export function getCollectionMetadata(collection: AnimeCollection): Metadata {
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
