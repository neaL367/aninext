import type { NextRequest } from "next/server";
import type { MediaPageQueryVariables } from "@/lib/anilist/generated/graphql";
import { getCachedMediaPage } from "@/lib/anilist/server/get-media-page";

// Aligns with the `anilistMediaPage` cacheLife profile (stale 5m, expire 6h).
const CACHE_CONTROL = "public, s-maxage=300, stale-while-revalidate=21600";

function parseVariables(raw: string | null): MediaPageQueryVariables | null {
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return null;
    }
    return parsed as MediaPageQueryVariables;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const variables = parseVariables(request.nextUrl.searchParams.get("v"));

  if (!variables) {
    return Response.json({ error: "Invalid variables" }, { status: 400 });
  }

  const result = await getCachedMediaPage(variables);

  return Response.json(result, {
    headers: { "Cache-Control": CACHE_CONTROL },
  });
}
