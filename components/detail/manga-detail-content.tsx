import { AnimeDetailBody, DetailCoverBanner } from "@/components/detail/anime-detail-view";
import type { SlugDetailParams } from "@/lib/anilist/domain/detail-route-params";
import { resolveMangaDetailMedia } from "@/lib/anilist/server/resolve-manga-detail-media";
import { createMediaJsonLd } from "@/lib/seo/json-ld";

type MangaDetailLoaderProps = {
  params: SlugDetailParams;
};

export async function MangaDetailCoverBannerLoader({ params }: MangaDetailLoaderProps) {
  const media = await resolveMangaDetailMedia(params);
  return <DetailCoverBanner media={media} />;
}

export async function MangaDetailBodyLoader({ params }: MangaDetailLoaderProps) {
  const media = await resolveMangaDetailMedia(params);
  const jsonLd = createMediaJsonLd(media);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AnimeDetailBody media={media} />
    </>
  );
}
