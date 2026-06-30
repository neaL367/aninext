import "server-only";

import { cache } from "react";
import { getCachedStaffDetail } from "@/lib/anilist/server/get-cached-staff-detail";

export const getStaffDetail = cache(async (staffId: number) => {
  return getCachedStaffDetail(staffId);
});
