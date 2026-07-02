import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { toLocalDateKeyFromDate } from "@/lib/anilist/display/datetime";
import { anilist } from "@/lib/anilist/server/fetchers";

/**
 * Secured with Vercel Cron `CRON_SECRET`.
 * @see https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
 */

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { ok: false, error: "missing_cron_secret", hint: "Set CRON_SECRET in .env (quote values containing #)" },
      { status: 503 },
    );
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      {
        ok: false,
        error: "unauthorized",
        hint:
          process.env.NODE_ENV === "development"
            ? "Authorization must be Bearer <CRON_SECRET>. Quote .env values that contain #. Restart dev after .env changes."
            : undefined,
      },
      { status: 401 },
    );
  }

  const schedule = request.headers.get("x-vercel-cron-schedule");
  const todayKey = toLocalDateKeyFromDate(new Date());

  // Keep this list small and high-value: it runs on a schedule.
  const warmTasks: Promise<unknown>[] = [
    anilist.genreCollection(),
    anilist.homeSection("trending"),
    anilist.homeSection("airingNow"),
    anilist.homeSection("popularThisSeason"),
    anilist.homeSection("upcomingNextSeason"),
    anilist.homeSection("allTimePopular"),
    anilist.homeSection("top100"),
    anilist.airingSchedulesForDay(todayKey),
  ];

  const startedAt = Date.now();
  const results = await Promise.allSettled(warmTasks);
  const okCount = results.filter((result) => result.status === "fulfilled").length;

  return NextResponse.json({
    ok: okCount === results.length,
    schedule,
    warmed: results.length,
    succeeded: okCount,
    elapsedMs: Date.now() - startedAt,
  });
}
