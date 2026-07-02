import { HOME_SECTION_IDS, type HomeSectionId } from "@/lib/anilist/domain/home-sections";
import type { HomePageSections } from "@/lib/anilist/domain/home-page-sections";
import {
  normalizeHomeTop100Media,
  normalizeListedMedia,
} from "@/lib/anilist/domain/normalize-media-list";
import { sortMediaByNextAiring } from "@/lib/anilist/domain/sort-media-by-airing";
import type { HomePageSectionsQuery } from "@/lib/anilist/generated/graphql";

function normalizeSectionMedia(
  section: HomeSectionId,
  media: Parameters<typeof normalizeListedMedia>[0],
) {
  const listed =
    section === "top100" ? normalizeHomeTop100Media(media) : normalizeListedMedia(media);

  return section === "airingNow" ? sortMediaByNextAiring(listed) : listed;
}

export function normalizeHomePageSections(data: HomePageSectionsQuery): HomePageSections {
  const result = {} as HomePageSections;

  for (const section of HOME_SECTION_IDS) {
    const page = data[section];
    result[section] = normalizeSectionMedia(section, page?.media);
  }

  return result;
}
