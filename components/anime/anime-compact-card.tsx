"use client";

import { memo } from "react";
import {
  AnimeCardArticle,
  type AnimeCardMedia,
} from "@/components/anime/anime-card-parts";

type AnimeCompactCardProps = {
  media: AnimeCardMedia;
  className?: string;
};

export const AnimeCompactCard = memo(function AnimeCompactCard({
  media,
  className,
}: AnimeCompactCardProps) {
  return (
    <AnimeCardArticle media={media} layout="compact" className={className} />
  );
});
