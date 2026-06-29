import type { Route } from "next";
import { ANIME_SORT_LABELS } from "@/lib/anilist/utils/labels";
import { animeBrowseHref } from "@/lib/routes/browse-hrefs";
import { ANIME_SORTS, type AnimeSort } from "@/lib/routes/search-params";

export type NavItem = {
  href: Route;
  /** Short label shown in the header. */
  label: string;
  /** Full label for tooltips and mobile menu. */
  title: string;
  sortKey?: AnimeSort;
};

const ANIME_SORT_NAV_LABELS: Record<AnimeSort, string> = {
  trending: "Trending",
  "popular-this-season": "Season",
  "upcoming-next-season": "Upcoming",
  "all-time-popular": "Popular",
  "top-100": "Top 100",
};

export const PRIMARY_NAV_ITEMS: NavItem[] = [
  { href: "/airing", label: "Airing", title: "Airing schedule" },
];

export const BROWSE_SORT_NAV_ITEMS: NavItem[] = ANIME_SORTS.map((sort) => ({
  href: animeBrowseHref({ sort }),
  label: ANIME_SORT_NAV_LABELS[sort],
  title: ANIME_SORT_LABELS[sort],
  sortKey: sort,
}));

export const SITE_NAV_ITEMS: NavItem[] = [
  ...PRIMARY_NAV_ITEMS,
  ...BROWSE_SORT_NAV_ITEMS,
];
