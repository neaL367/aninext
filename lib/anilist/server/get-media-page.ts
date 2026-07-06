import "server-only";

import { anilist } from "@/lib/anilist/server/fetchers";

export const getCachedMediaPage = anilist.mediaPage;
