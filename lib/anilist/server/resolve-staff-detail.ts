import "server-only";

import { formatPersonName } from "@/lib/anilist/display/format";
import { createSlugDetailResolver } from "@/lib/anilist/server/create-slug-detail-resolver";
import { getStaffDetail } from "@/lib/anilist/server/get-staff-detail";
import { staffDetailPath } from "@/lib/navigation/detail-paths";

export const resolveStaffDetail = createSlugDetailResolver({
  fetch: getStaffDetail,
  getSlugName: (staff) => formatPersonName(staff.name),
  getCanonicalPath: (staff, slugName) => staffDetailPath(staff.id, slugName),
});
