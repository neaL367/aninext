import type { NextRequest } from "next/server";
import { getCachedMediaCardTooltip } from "@/lib/anilist/server/get-cached-media-card-tooltip";

// Aligns with the `anilistTooltip` cacheLife profile (stale 5m, expire 6h).
const CACHE_CONTROL = "public, s-maxage=300, stale-while-revalidate=21600";

export async function GET(request: NextRequest) {
  const rawId = request.nextUrl.searchParams.get("id");
  const mediaId = Number(rawId);

  if (!rawId || !Number.isInteger(mediaId) || mediaId <= 0) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  const tooltip = await getCachedMediaCardTooltip(mediaId);

  return Response.json(tooltip, {
    headers: { "Cache-Control": CACHE_CONTROL },
  });
}
