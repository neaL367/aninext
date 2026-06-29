import Link from "next/link";
import Image from "next/image";
import { DetailHero } from "@/components/detail/detail-hero";
import { DetailSection } from "@/components/detail/detail-section";
import {
  DetailCharactersSection,
  DetailEpisodesSection,
  DetailMediaCardsSection,
  DetailStaffSection,
} from "@/components/detail/detail-sections";
import { PageContainer } from "@/components/layout/page-container";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { MediaCard, MediaDetail } from "@/lib/anilist/types";
import { buildEpisodeCards } from "@/lib/anilist/utils/episodes";
import { formatDisplayTitle, stripHtml } from "@/lib/anilist/utils/format";
import { getStreamingLinks } from "@/lib/anilist/utils/streaming";

type AnimeDetailViewProps = {
  media: MediaDetail;
};

export function AnimeDetailView({ media }: AnimeDetailViewProps) {
  const title = formatDisplayTitle(media.title);
  const episodes = buildEpisodeCards(media);
  const streamingLinks = getStreamingLinks(media.externalLinks);

  const characterEdges =
    media.characters?.edges?.filter(
      (edge): edge is NonNullable<typeof edge> & { node: NonNullable<NonNullable<typeof edge>["node"]> } =>
        Boolean(edge?.node)
    ) ?? [];

  const staffEdges =
    media.staff?.edges?.filter(
      (edge): edge is NonNullable<typeof edge> & { node: NonNullable<NonNullable<typeof edge>["node"]> } =>
        Boolean(edge?.node)
    ) ?? [];

  const relationMedia =
    media.relations?.edges
      ?.filter((edge) => Boolean(edge))
      .map((edge) => edge!.node)
      .filter((node): node is NonNullable<typeof node> => Boolean(node)) ?? [];

  const recommendationMedia =
    media.recommendations?.nodes
      ?.filter((node) => Boolean(node))
      .map((node) => node!.mediaRecommendation)
      .filter((item): item is NonNullable<typeof item> => Boolean(item)) ?? [];

  return (
    <>
      <div
        className="h-20 w-full border-b border-border sm:h-24"
        style={{ backgroundColor: media.coverImage?.color ?? "var(--muted)" }}
        aria-hidden
      >
        {media.bannerImage ? (
          <div className="relative h-full w-full overflow-hidden">
            <Image
              src={media.bannerImage}
              alt=""
              fill
              priority
              className="object-cover object-top opacity-80"
              sizes="100vw"
            />
          </div>
        ) : null}
      </div>

      <PageContainer className="flex flex-col gap-8 py-8 lg:gap-10 lg:py-12">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/" />}>Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/anime" />}>Anime</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <DetailHero media={media} streamingLinks={streamingLinks} />

        <div className="flex min-w-0 flex-col gap-8 lg:gap-10">
          {media.description ? (
            <DetailSection title="Synopsis" bordered={false}>
              <p className="max-w-prose text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                {stripHtml(media.description)}
              </p>
            </DetailSection>
          ) : null}

          {episodes.length ? (
            <DetailSection title="Episodes">
              <DetailEpisodesSection episodes={episodes} />
            </DetailSection>
          ) : null}

          {characterEdges.length ? (
            <DetailSection title="Characters">
              <DetailCharactersSection edges={characterEdges} />
            </DetailSection>
          ) : null}

          {staffEdges.length ? (
            <DetailSection title="Staff">
              <DetailStaffSection edges={staffEdges} />
            </DetailSection>
          ) : null}

          {relationMedia.length ? (
            <DetailSection title="Relations">
              <DetailMediaCardsSection
                media={relationMedia as MediaCard[]}
                loadMoreLabel="Load more relations"
              />
            </DetailSection>
          ) : null}

          {recommendationMedia.length ? (
            <DetailSection title="Recommendations">
              <DetailMediaCardsSection
                media={recommendationMedia}
                loadMoreLabel="Load more recommendations"
              />
            </DetailSection>
          ) : null}
        </div>
      </PageContainer>
    </>
  );
}
