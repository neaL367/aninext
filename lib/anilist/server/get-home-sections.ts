import "server-only";

import type { HomePageSections } from "@/lib/anilist/domain/home-page-sections";
import { anilist } from "@/lib/anilist/server/fetchers";

export async function getHomePageSections(): Promise<HomePageSections> {
  return anilist.homePageSections();
}
