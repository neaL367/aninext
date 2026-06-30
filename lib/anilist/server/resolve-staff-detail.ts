import "server-only";

import { permanentRedirect } from "next/navigation";
import { notFound } from "next/navigation";
import { cache } from "react";
import { formatPersonName } from "@/lib/anilist/display/format";
import { matchesDetailSlug } from "@/lib/anilist/display/media-links";
import type { SlugDetailParams } from "@/lib/anilist/domain/detail-route-params";
import { getStaffDetail } from "@/lib/anilist/server/get-staff-detail";
import { parseDetailId } from "@/lib/anilist/server/parse-detail-id";
import { staffDetailPath } from "@/lib/navigation/detail-paths";

export const resolveStaffDetail = cache(async (params: SlugDetailParams) => {
  const { id, slug } = await params;
  const staffId = parseDetailId(id);
  const staff = await getStaffDetail(staffId);

  if (!staff) {
    notFound();
  }

  const name = formatPersonName(staff.name);
  const canonicalPath = staffDetailPath(staff.id, name);

  if (!matchesDetailSlug(name, slug)) {
    permanentRedirect(canonicalPath);
  }

  return staff;
});
