import "server-only";

export { anilist } from "@/lib/anilist/server/cache/registry";

import { anilist } from "@/lib/anilist/server/cache/registry";

/** @deprecated Use `anilist.genreCollection` */
export const getCachedGenreCollection = anilist.genreCollection;

/** @deprecated Use `anilist.mediaPage` */
export const getCachedMediaPage = anilist.mediaPage;

/** @deprecated Use `anilist.mediaDetail` */
export const getCachedMediaDetail = anilist.mediaDetail;

/** @deprecated Use `anilist.characterDetail` */
export const getCachedCharacterDetail = anilist.characterDetail;

/** @deprecated Use `anilist.staffDetail` */
export const getCachedStaffDetail = anilist.staffDetail;

/** @deprecated Use `anilist.airingSchedulesForDay` */
export const getCachedAiringSchedulesForDay = anilist.airingSchedulesForDay;

export const getGenreCollection = anilist.genreCollection;
export const getHomePageSections = anilist.homePageSections;
export const getMediaDetail = anilist.mediaDetail;
export const getCharacterDetail = anilist.characterDetail;
export const getStaffDetail = anilist.staffDetail;
