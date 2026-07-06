import "server-only";

import { getGenreCollection } from "@/lib/anilist/server/dal/genres";
import { getHomePageSections } from "@/lib/anilist/server/dal/home";
import { getMediaDetail } from "@/lib/anilist/server/dal/media";
import { getCharacterDetail, getStaffDetail } from "@/lib/anilist/server/dal/people";
import { getMediaPage } from "@/lib/anilist/server/dal/pages";
import { getAiringSchedulesForDay, getAiringScheduleCountForDay } from "@/lib/anilist/server/dal/airing";
import { getMediaCardTooltipBatch } from "@/lib/anilist/server/dal/tooltips";

export const anilist = {
  genreCollection: getGenreCollection,
  homePageSections: getHomePageSections,
  mediaDetail: getMediaDetail,
  characterDetail: getCharacterDetail,
  staffDetail: getStaffDetail,
  mediaPage: getMediaPage,
  mediaCardTooltipBatch: getMediaCardTooltipBatch,
  airingSchedulesForDay: getAiringSchedulesForDay,
  airingScheduleCountForDay: getAiringScheduleCountForDay,
} as const;

export { 
  getGenreCollection,
  getHomePageSections,
  getMediaDetail,
  getCharacterDetail,
  getStaffDetail,
  getMediaPage
};


