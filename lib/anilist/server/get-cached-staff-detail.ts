import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { StaffDetailDocument } from "@/lib/anilist/generated/graphql";
import { executeGraphQL } from "@/lib/anilist/infra/graphql-client";
import { anilistCacheLife } from "@/lib/anilist/server/cache-policy";
import { anilistCacheTags } from "@/lib/anilist/server/cache-tags";
import { normalizeStaffDetail, type StaffDetail } from "@/lib/anilist/domain/types";

export async function getCachedStaffDetail(staffId: number): Promise<StaffDetail | null> {
  "use cache";

  cacheLife(anilistCacheLife.staffDetail);
  cacheTag(anilistCacheTags.staffDetail(staffId));

  const data = await executeGraphQL(StaffDetailDocument, { id: staffId });
  return normalizeStaffDetail(data);
}
