"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { MediaDetail } from "@/lib/anilist/domain/types";
import {
  getTrailerEmbedUrl,
  getTrailerSiteLabel,
  getTrailerWatchUrl,
} from "@/lib/anilist/display/trailer";
import { cn } from "@/lib/utils";

type DetailTrailerProps = {
  media: MediaDetail;
};

export function DetailTrailer({ media }: DetailTrailerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const embedUrl = getTrailerEmbedUrl(media.trailer);
  const watchUrl = getTrailerWatchUrl(media.trailer);

  if (!embedUrl) {
    return null;
  }

  const siteLabel = getTrailerSiteLabel(media.trailer);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-medium tracking-tight">Trailer</h2>
        {watchUrl ? (
          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Open on {siteLabel}
          </a>
        ) : null}
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-black shadow-sm">
        <div className="relative aspect-video w-full">
          {!isLoaded ? (
            <Skeleton className="absolute inset-0 size-full rounded-none" />
          ) : null}
          <iframe
            src={embedUrl}
            title={`${siteLabel} trailer`}
            className={cn(
              "absolute inset-0 size-full transition-opacity duration-300",
              isLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setIsLoaded(true)}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </div>
    </section>
  );
}
