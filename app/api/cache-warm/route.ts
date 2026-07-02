import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getWeekDateKeys, toLocalDateKeyFromDate } from "@/lib/anilist/display/datetime";
import { anilist } from "@/lib/anilist/server/fetchers";

/**
 * Secured with Vercel Cron `CRON_SECRET`.
 * @see https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
 */

export const maxDuration = 60;

function buildWarmTasks() {
  const weekDateKeys = getWeekDateKeys();

  return [
    () => anilist.genreCollection(),
    () => anilist.homePageSections(),
    ...weekDateKeys.map((dateKey) => () => anilist.airingSchedulesForDay(dateKey)),
  ] as const;
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      {
        ok: false,
        error: "missing_cron_secret",
        hint: "Set CRON_SECRET in .env (quote values containing #)",
      },
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
  const startedAt = Date.now();
  const warmTasks = buildWarmTasks();
  const results: PromiseSettledResult<unknown>[] = [];

  // Sequential warming avoids bursting AniList when the bucket is nearly empty.
  for (const warmTask of warmTasks) {
    results.push(
      await Promise.resolve(warmTask()).then(
        (value) => ({ status: "fulfilled", value }) as const,
        (reason) => ({ status: "rejected", reason }) as const,
      ),
    );
  }

  const okCount = results.filter((result) => result.status === "fulfilled").length;

  return NextResponse.json({
    ok: okCount === results.length,
    schedule,
    warmed: results.length,
    succeeded: okCount,
    elapsedMs: Date.now() - startedAt,
    todayKey: toLocalDateKeyFromDate(new Date()),
  });
}
