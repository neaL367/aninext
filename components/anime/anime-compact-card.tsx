"use client";

import {
  AnimeCardArticle,
  type AnimeCardMedia,
} from "@/components/anime/anime-card-parts";

type AnimeCompactCardProps = {
  media: AnimeCardMedia;
  className?: string;
};

export function AnimeCompactCard({
  media,
  className,
}: AnimeCompactCardProps) {
  "use memo";

  return (
    <AnimeCardArticle media={media} layout="compact" className={className} />
  );
}
