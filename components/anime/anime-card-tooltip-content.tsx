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
  const score = formatScore(media.averageScore);
  const synopsis = excerptSynopsis(media.description);
  const studio = getMainStudioName(media.studios);
  const popularity = formatPopularityCount(media.popularity);
  const tags = getTopTags(media.tags);
  const nextAiring = media.nextAiringEpisode;

  return (
    <div className="flex w-full flex-col gap-2.5 p-3">
      <p className="line-clamp-2 text-sm font-semibold leading-snug text-popover-foreground">
        {title}
      </p>

      <div className="flex gap-2.5">
        {coverUrl ? (
          <div
            className="relative size-16 shrink-0 overflow-hidden rounded-md border border-border bg-muted"
            style={{
              backgroundColor: media.coverImage?.color ?? undefined,
            }}
          >
            <Image
              src={coverUrl}
              alt=""
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
        ) : null}

        {synopsis ? (
          <p className="line-clamp-4 min-w-0 flex-1 text-xs leading-relaxed text-muted-foreground">
            {synopsis}
          </p>
        ) : (
          <p className="text-xs italic text-muted-foreground">
            No synopsis available.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-2 text-xs text-muted-foreground">
        {studio ? (
          <span className="inline-flex items-center gap-1">
            <UsersIcon className="size-3 shrink-0" />
            {studio}
          </span>
        ) : null}
        {score !== "—" ? (
          <span className="inline-flex items-center gap-1 font-medium text-foreground">
            <StarIcon className="size-3 fill-amber-400 text-amber-400" />
            {score}
          </span>
        ) : null}
        {popularity ? (
          <span className="tabular-nums">{popularity} users</span>
        ) : null}
      </div>

      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="px-1.5 py-0 text-[10px] font-normal"
            >
              {tag}
            </Badge>
          ))}
        </div>
      ) : null}

      {nextAiring ? (
        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-2.5 py-2 text-xs">
          <CalendarClockIcon className="size-3.5 shrink-0 text-muted-foreground" />
          <p className="font-medium text-foreground">
            Ep {nextAiring.episode} in{" "}
            {formatCountdownShort(nextAiring.timeUntilAiring)}
          </p>
        </div>
      ) : null}
    </div>
  );
}
