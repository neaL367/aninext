"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ProgressiveImage } from "@/components/shared/progressive-image";
import type { MediaCardGrid, MediaType } from "@/lib/anilist/domain/types";
import { formatDisplayTitle } from "@/lib/anilist/display/format";
import { coverCardImageUrl } from "@/lib/anilist/display/image-urls";
import { formatMediaFormat } from "@/lib/anilist/display/labels";
import { getMediaDetailHref } from "@/lib/anilist/display/media-links";
import { saveDetailReturnFromCurrentPage } from "@/lib/navigation/detail-return";
import {
  ANIME_CARD_COMPACT_COVER_CLASS,
  ANIME_CARD_COVER_GRADIENT_BOTTOM_CLASS,
  ANIME_CARD_COVER_GRADIENT_TOP_CLASS,
  ANIME_CARD_COVER_IMAGE_CLASS,
} from "@/lib/styles/anime-card-cover";
import {
  ANIME_CARD_LINK_CLASS,
  ANIME_CARD_ROOT_CLASS,
  ANIME_CARD_TITLE_CLASS,
} from "@/lib/styles/anime-grid-layout";
import { cn } from "@/lib/utils";

const ROLE_BADGE_CLASS =
  "h-auto max-w-full truncate rounded-md border-border/60 bg-background/95 px-1.5 py-0.5 text-[10px] font-medium leading-tight shadow-sm";

type PersonMediaCardProps = {
  media: MediaCardGrid & { type?: MediaType | null };
  role: string | null | undefined;
  className?: string;
};

export function PersonMediaCard({
  media,
  role,
  className,
}: PersonMediaCardProps) {
  "use memo";

  const title = formatDisplayTitle(media.title);
  const coverUrl = coverCardImageUrl(media.coverImage);
  const format = formatMediaFormat(media.format);
  const { href, external } = getMediaDetailHref(media.id, media.type, title);
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const roleLabel = role?.trim() || "—";

  const handleNavigate = () => {
    if (!external) {
      saveDetailReturnFromCurrentPage(pathname, searchParams.toString());
    }
  };

  const linkClassName = cn(ANIME_CARD_LINK_CLASS, "group/credit");
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
          <Badge variant="secondary" className={ROLE_BADGE_CLASS} title={roleLabel}>
            {roleLabel}
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
          aria-label={`${title} (${roleLabel}) on AniList`}
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
}
