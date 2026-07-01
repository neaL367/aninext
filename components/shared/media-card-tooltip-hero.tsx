"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { buildProgressiveImageSources } from "@/lib/anilist/display/image-urls";
import { cn } from "@/lib/utils";

type MediaCardTooltipHeroProps = {
  title: string;
  placeholderColor: string | null | undefined;
  bannerImage: string | null | undefined;
  sizes: string;
  className?: string;
  onBannerLoad?: () => void;
};

export function MediaCardTooltipHero({
  title,
  placeholderColor,
  bannerImage,
  sizes,
  className,
  onBannerLoad,
}: MediaCardTooltipHeroProps) {
  const bannerSrc = bannerImage ? (buildProgressiveImageSources(bannerImage)[0] ?? null) : null;
  const [bannerLoaded, setBannerLoaded] = useState(!bannerSrc);

  useEffect(() => {
    if (!bannerSrc) {
      onBannerLoad?.();
    }
  }, [bannerSrc, onBannerLoad]);

  const handleBannerLoad = () => {
    setBannerLoaded(true);
    onBannerLoad?.();
  };

  return (
    <div className={cn("flex min-w-0 w-full flex-col overflow-hidden", className)}>
      <div
        className="relative h-32 w-full shrink-0 overflow-hidden"
        style={{
          backgroundColor: placeholderColor ?? "var(--muted)",
        }}
      >
        {!bannerLoaded ? <Skeleton className="absolute inset-0 rounded-none bg-muted/60" /> : null}

        {bannerSrc ? (
          <Image
            src={bannerSrc}
            alt=""
            fill
            className={cn(
              "object-cover object-top transition-opacity duration-200",
              bannerLoaded ? "opacity-100" : "opacity-0",
            )}
            sizes={sizes}
            loading="eager"
            onLoad={handleBannerLoad}
            onError={handleBannerLoad}
          />
        ) : null}
      </div>

      <p className="line-clamp-2 min-w-0 break-words px-4 pt-3 text-base font-semibold leading-snug text-popover-foreground">
        {title}
      </p>
    </div>
  );
}
