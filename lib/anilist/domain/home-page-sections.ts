import type { HomeSectionId } from "@/lib/anilist/domain/home-sections";
import type { MediaCard } from "@/lib/anilist/domain/types";

export type HomePageSections = Record<HomeSectionId, MediaCard[]>;
