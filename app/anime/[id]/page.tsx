import type { Metadata } from "next";
import { Suspense } from "react";
import {
  AnimeDetailBodyLoader,
  DetailCoverBannerLoader,
} from "@/components/detail/anime-detail-content";
import { AnimeDetailPageFrame } from "@/components/detail/anime-detail-page-frame";
import { AnimeDetailBodySkeleton } from "@/components/detail/anime-detail-body-skeleton";
import { resolveAnimeDetailMedia } from "@/lib/anilist/server/resolve-anime-detail-media";
import { formatDisplayTitle, stripHtml } from "@/lib/anilist/display/format";
import { createDetailMetadata } from "@/lib/seo/metadata";

export const instant = false;

type AnimeDetailPageProps = {
  params: Promise<{ id: string }>;
};

/** Build-time sample for Cache Components validation (One Piece). */
export async function generateStaticParams() {
  return [{ id: "21" }];
}

export async function generateMetadata({
  params,
}: AnimeDetailPageProps): Promise<Metadata> {
  const media = await resolveAnimeDetailMedia(params);
  const title = formatDisplayTitle(media.title);
  const description = media.description
    ? stripHtml(media.description).slice(0, 160)
    : `Anime details for ${title} on AniNext.`;

  return createDetailMetadata(title, description, media.id);
}

export default function AnimeDetailPage({ params }: AnimeDetailPageProps) {
  return (
    <AnimeDetailPageFrame
      cover={
        <Suspense fallback={null}>
          <DetailCoverBannerLoader params={params} />
        </Suspense>
      }
    >
      <Suspense fallback={<AnimeDetailBodySkeleton />}>
        <AnimeDetailBodyLoader params={params} />
      </Suspense>
    </AnimeDetailPageFrame>
  );
}
