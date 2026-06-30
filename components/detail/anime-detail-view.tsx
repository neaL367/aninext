import { DetailMainHeader } from "@/components/detail/detail-main-header";
import { DetailSection } from "@/components/detail/detail-section";
import { DetailSidebar } from "@/components/detail/detail-sidebar";
import { DetailTaxonomy } from "@/components/detail/detail-taxonomy";
import { DetailTrailer } from "@/components/detail/detail-trailer";
import { ProgressiveImage } from "@/components/shared/progressive-image";
import {
  DetailCharactersSection,
  DetailEpisodesSection,
  DetailMediaCardsSection,
  DetailRelationsSection,
  DetailStaffSection,
} from "@/components/detail/detail-sections";
import type { DetailRelationItem } from "@/components/detail/detail-relation-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageContainer } from "@/components/layout/page-container";
import { DetailBreadcrumb } from "@/components/detail/detail-breadcrumb";
import { DetailReturnAnchor } from "@/components/detail/detail-return-anchor";
import type { MediaDetail, MediaRelation } from "@/lib/anilist/types";
import { buildEpisodeCards } from "@/lib/anilist/utils/episodes";
import {
  formatDisplayTitle,
  formatEpisodeCount,
  stripHtml,
} from "@/lib/anilist/utils/format";
import { buildProgressiveImageSources } from "@/lib/anilist/utils/image-urls";
import { getStreamingLinks } from "@/lib/anilist/utils/streaming";

type AnimeDetailViewProps = {
  media: MediaDetail;
};

const EPISODIC_FORMATS = new Set([
  "TV",
  "TV_SHORT",
  "ONA",
  "OVA",
  "SPECIAL",
]);

function shouldShowEpisodesSection(media: MediaDetail): boolean {
  if (media.format && EPISODIC_FORMATS.has(media.format)) {
    return true;
  }
  if (media.episodes != null) {
    return true;
  }
  if (media.streamingEpisodes?.length) {
    return true;
  }
  if (media.airingSchedule?.nodes?.length) {
    return true;
  }
  return false;
}

function episodesEmptyMessage(media: MediaDetail): string {
  const count = formatEpisodeCount(media.episodes);
  if (count !== "—" && count !== "?") {
    return `${count} episodes planned — individual episode details are not available yet.`;
  }
  return "Episode details are not available for this title yet.";
}

export function AnimeDetailView({ media }: AnimeDetailViewProps) {
  const title = formatDisplayTitle(media.title);
  const episodes = buildEpisodeCards(media);
  const streamingLinks = getStreamingLinks(media.externalLinks);
  const showEpisodes = shouldShowEpisodesSection(media);

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

  const relationItems: DetailRelationItem[] =
    media.relations?.edges
      ?.filter(
        (
          edge
        ): edge is NonNullable<typeof edge> & {
          relationType: MediaRelation;
          node: NonNullable<NonNullable<typeof edge>["node"]>;
        } => Boolean(edge?.node?.id && edge.relationType)
      )
      .map((edge) => ({
        relationType: edge.relationType,
        media: edge.node,
      })) ?? [];

  const recommendationMedia =
    media.recommendations?.nodes
      ?.filter((node) => Boolean(node))
      .map((node) => node!.mediaRecommendation)
      .filter((item): item is NonNullable<typeof item> => Boolean(item)) ?? [];

  const bannerSources = buildProgressiveImageSources(media.bannerImage);

  return (
    <>
      <DetailReturnAnchor mediaId={media.id} title={title} />
      <div className="relative h-52 w-full overflow-hidden sm:h-64 lg:h-80 xl:h-96">
        <div
          className="absolute inset-0"
          style={{ backgroundColor: media.coverImage?.color ?? "var(--muted)" }}
        />
        {bannerSources.length ? (
          <ProgressiveImage
            sources={bannerSources}
            alt=""
            fill
            priority
            className="object-cover object-top"
            sizes="100vw"
          />
        ) : null}
        <div
          className="absolute inset-0 bg-linear-to-b from-background/5 via-background/25 to-background"
          aria-hidden
        />
      </div>

      <PageContainer className="relative -mt-6 flex flex-col gap-6 pb-10 pt-4 sm:-mt-8 lg:gap-8 lg:pb-12 lg:pt-6">
        <DetailBreadcrumb title={title} />

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
          <DetailSidebar media={media} />

          <div className="flex min-w-0 flex-col gap-8 lg:gap-10">
            <DetailMainHeader media={media} />

            <DetailTaxonomy media={media} streamingLinks={streamingLinks} />

            <DetailTrailer media={media} />

            {media.description ? (
              <section className="rounded-xl border border-border bg-card/40 p-5 sm:p-6">
                <h2 className="mb-3 text-lg font-medium tracking-tight">Synopsis</h2>
                <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                  {stripHtml(media.description)}
                </p>
              </section>
            ) : null}

            {showEpisodes ? (
              <DetailSection title="Episodes" bordered={false}>
                {episodes.length ? (
                  <DetailEpisodesSection episodes={episodes} />
                ) : (
                  <EmptyState
                    title="No episode list available"
                    description={episodesEmptyMessage(media)}
                  />
                )}
              </DetailSection>
            ) : null}

            {characterEdges.length ? (
              <DetailSection title="Characters & voice actors" bordered={false}>
                <DetailCharactersSection edges={characterEdges} />
              </DetailSection>
            ) : null}

            {staffEdges.length ? (
              <DetailSection title="Staff" bordered={false}>
                <DetailStaffSection edges={staffEdges} />
              </DetailSection>
            ) : null}

            {relationItems.length ? (
              <DetailSection title="Relations" bordered={false}>
                <DetailRelationsSection items={relationItems} />
              </DetailSection>
            ) : null}

            {recommendationMedia.length ? (
              <DetailSection title="Recommendations" bordered={false}>
                <DetailMediaCardsSection
                  media={recommendationMedia}
                  loadMoreLabel="Load more recommendations"
                />
              </DetailSection>
            ) : null}
          </div>
        </div>
      </PageContainer>
    </>
  );
}
