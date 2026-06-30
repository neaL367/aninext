import {
  AnimeDetailBody,
  DetailCoverBanner,
} from "@/components/detail/anime-detail-view";
import { resolveAnimeDetailMedia } from "@/lib/anilist/server/resolve-anime-detail-media";
import { createAnimeJsonLd } from "@/lib/seo/json-ld";

type AnimeDetailLoaderProps = {
  params: Promise<{ id: string }>;
};

export async function DetailCoverBannerLoader({
  params,
}: AnimeDetailLoaderProps) {
  const media = await resolveAnimeDetailMedia(params);
  return <DetailCoverBanner media={media} />;
}

export async function AnimeDetailBodyLoader({ params }: AnimeDetailLoaderProps) {
  const media = await resolveAnimeDetailMedia(params);
  const jsonLd = createAnimeJsonLd(media);

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
