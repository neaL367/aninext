"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { memo } from "react";
import type { Route } from "next";
import { Badge } from "@/components/ui/badge";
import { ProgressiveImage } from "@/components/shared/progressive-image";
import type { MediaCardGrid, MediaRelation, MediaType } from "@/lib/anilist/types";
import { coverCardImageUrl } from "@/lib/anilist/utils/image-urls";
import { formatDisplayTitle } from "@/lib/anilist/utils/format";
import { formatMediaFormat } from "@/lib/anilist/utils/labels";
import { getMediaDetailHref } from "@/lib/anilist/utils/media-links";
import { formatMediaRelationType } from "@/lib/anilist/utils/relation-labels";
import { saveDetailReturnFromCurrentPage } from "@/lib/navigation/detail-return";
import {
  ANIME_CARD_COMPACT_COVER_CLASS,
  ANIME_CARD_COVER_GRADIENT_BOTTOM_CLASS,
  ANIME_CARD_COVER_GRADIENT_TOP_CLASS,
  ANIME_CARD_COVER_IMAGE_CLASS,
} from "@/lib/ui/anime-card-cover";
import {
  ANIME_CARD_LINK_CLASS,
  ANIME_CARD_ROOT_CLASS,
  ANIME_CARD_TITLE_CLASS,
} from "@/lib/ui/anime-grid-layout";
import { cn } from "@/lib/utils";

const RELATION_BADGE_CLASS =
  "h-auto max-w-full truncate rounded-md border-border/60 bg-background/95 px-1.5 py-0.5 text-[10px] font-medium leading-tight shadow-sm";

export type DetailRelationMedia = MediaCardGrid & {
  type?: MediaType | null;
};

export type DetailRelationItem = {
  relationType: MediaRelation;
  media: DetailRelationMedia;
};

type DetailRelationCardProps = {
  item: DetailRelationItem;
  className?: string;
};

export const DetailRelationCard = memo(function DetailRelationCard({
  item,
  className,
}: DetailRelationCardProps) {
  const { relationType, media } = item;
  const title = formatDisplayTitle(media.title);
  const coverUrl = coverCardImageUrl(media.coverImage);
  const format = formatMediaFormat(media.format);
  const relationLabel = formatMediaRelationType(relationType);
  const { href, external } = getMediaDetailHref(media.id, media.type);
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();

  const handleNavigate = () => {
    if (!external) {
      saveDetailReturnFromCurrentPage(pathname, searchParams.toString());
    }
  };

  const linkClassName = cn(ANIME_CARD_LINK_CLASS, "group/relation");
  const cardBody = (
    <>
      <div
        className={ANIME_CARD_COMPACT_COVER_CLASS}
        style={
          media.coverImage?.color
            ? { backgroundColor: media.coverImage.color }
            : undefined
        }
      >
        {coverUrl ? (
          <ProgressiveImage
            sources={[coverUrl]}
            alt={title}
            fill
            sizes="100px"
            className={ANIME_CARD_COVER_IMAGE_CLASS}
            loading="lazy"
          />
        ) : null}

        <div className={ANIME_CARD_COVER_GRADIENT_TOP_CLASS} aria-hidden />
        <div className={ANIME_CARD_COVER_GRADIENT_BOTTOM_CLASS} aria-hidden />

        <div className="pointer-events-none absolute inset-x-1.5 bottom-1.5 z-10">
          <Badge variant="secondary" className={RELATION_BADGE_CLASS} title={relationLabel}>
            {relationLabel}
          </Badge>
        </div>
      </div>

      <div className="flex flex-col gap-1 p-2.5">
        <h3 className={cn(ANIME_CARD_TITLE_CLASS, "min-h-0 text-xs leading-snug")}>
          {title}
        </h3>
        {format !== "—" ? (
          <p className="line-clamp-1 text-[11px] text-muted-foreground">{format}</p>
        ) : null}
      </div>
    </>
  );

  return (
    <article className={cn(ANIME_CARD_ROOT_CLASS, className)}>
      {external ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClassName}
          aria-label={`${title} (${relationLabel}) on AniList`}
        >
          {cardBody}
        </a>
      ) : (
        <Link
          href={href as Route}
          prefetch
          className={linkClassName}
          onClick={handleNavigate}
        >
          {cardBody}
        </Link>
      )}
    </article>
  );
});
