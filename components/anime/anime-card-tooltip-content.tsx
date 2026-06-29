"use client";

import Image from "next/image";
import { CalendarClockIcon, StarIcon, UsersIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { MediaCard } from "@/lib/anilist/types";
import { formatDisplayTitle, formatScore } from "@/lib/anilist/utils/format";
import {
  excerptSynopsis,
  formatCountdownShort,
  formatPopularityCount,
  getMainStudioName,
  getTopTags,
} from "@/lib/anilist/utils/tooltip";

type AnimeCardTooltipContentProps = {
  media: MediaCard & { rank?: number };
};

export function AnimeCardTooltipContent({ media }: AnimeCardTooltipContentProps) {
  const title = formatDisplayTitle(media.title);
  const coverUrl = media.coverImage?.large ?? media.coverImage?.medium;
  const banner = media.bannerImage ?? null;
  const score = formatScore(media.averageScore);
  const synopsis = excerptSynopsis(media.description);
  const studio = getMainStudioName(media.studios);
  const popularity = formatPopularityCount(media.popularity);
  const tags = getTopTags(media.tags);
  const nextAiring = media.nextAiringEpisode;

  return (
    <div className="flex w-full flex-col overflow-hidden">
      <div
        className="relative h-36 w-full shrink-0 overflow-hidden"
        style={{
          backgroundColor: media.coverImage?.color ?? "var(--muted)",
        }}
      >
        {banner ? (
          <Image
            src={banner}
            alt=""
            fill
            className="object-cover object-top"
            sizes="448px"
          />
        ) : coverUrl ? (
          <Image
            src={coverUrl}
            alt=""
            fill
            className="object-cover object-top opacity-90"
            sizes="448px"
          />
        ) : null}
        <div
          className="absolute inset-0 bg-linear-to-t from-popover via-popover/50 to-transparent"
          aria-hidden
        />
        <p className="absolute inset-x-0 bottom-0 line-clamp-2 px-4 pb-3 text-base font-semibold leading-snug text-popover-foreground">
          {title}
        </p>
      </div>

      <div className="flex flex-col gap-3 p-4">
        {synopsis ? (
          <p className="line-clamp-6 text-sm leading-relaxed text-muted-foreground">
            {synopsis}
          </p>
        ) : (
          <p className="text-sm italic text-muted-foreground">
            No synopsis available.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border pt-3 text-sm text-muted-foreground">
          {studio ? (
            <span className="inline-flex items-center gap-1.5">
              <UsersIcon className="size-3.5 shrink-0" />
              {studio}
            </span>
          ) : null}
          {score !== "—" ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
              <StarIcon className="size-3.5 fill-amber-400 text-amber-400" />
              {score}
            </span>
          ) : null}
          {popularity ? (
            <span className="tabular-nums">{popularity} users</span>
          ) : null}
        </div>

        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="px-2 py-0 text-xs font-normal"
              >
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}

        {nextAiring ? (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm">
            <CalendarClockIcon className="size-4 shrink-0 text-muted-foreground" />
            <p className="font-medium text-foreground">
              Ep {nextAiring.episode} in{" "}
              {formatCountdownShort(nextAiring.timeUntilAiring)}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
