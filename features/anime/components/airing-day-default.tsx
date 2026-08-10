"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import { isValidAiringOffset } from "@/features/anime/lib/airing";
import { getLocalOffsetMinutes, localDateStr } from "@/features/anime/lib/media-helpers";

/**
 * Corrects the /airing URL to the visitor's own calendar day and UTC offset.
 *
 * The server renders day boundaries in the *server process* timezone (UTC in
 * production), which is wrong for every visitor outside UTC. This leaf runs in
 * the browser after hydration and rewrites the URL once — then the server
 * re-renders with `offset` and fetches the visitor's actual local day window.
 *
 * `serverToday` is the server's own "today" — i.e. the day the server would
 * have redirected to with no `?day=` param. Only when the URL still holds that
 * value do we treat it as "the server picked a day", and correct it to the
 * visitor's local today. A day the visitor deliberately chose is preserved.
 */
export function AiringDayDefault({ serverToday }: { serverToday: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;

    const urlDay = searchParams.get("day") ?? serverToday;
    const localToday = localDateStr();
    const offset = getLocalOffsetMinutes();
    const rawOffset = searchParams.get("offset");
    const urlOffset = rawOffset === null ? null : Number(rawOffset);

    // Only rewrite the day when the URL still holds the server's "today" (i.e. no
    // user choice was made yet). A deliberately chosen day is preserved. An
    // explicit valid offset is also preserved so shared links keep the timezone
    // they were created for when opened in another browser.
    const dayNeedsFix = urlDay === serverToday && localToday !== serverToday;
    const offsetNeedsFix =
      rawOffset === null ||
      rawOffset.trim() === "" ||
      (urlOffset !== null && !isValidAiringOffset(urlOffset));

    if (!dayNeedsFix && !offsetNeedsFix) return;

    done.current = true;
    const targetDay = dayNeedsFix ? localToday : urlDay;
    router.replace(`/airing?day=${targetDay}&offset=${offset}`, { scroll: false });
  }, [serverToday, router, searchParams]);

  return null;
}
