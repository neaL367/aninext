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
import { DetailBreadcrumb } from "@/components/detail/detail-breadcrumb";
import { DetailReturnAnchor } from "@/components/detail/detail-return-anchor";
import type { MediaDetail, MediaRelation } from "@/lib/anilist/domain/types";
import { buildEpisodeCards } from "@/lib/anilist/display/episodes";
import { DetailSynopsisSection } from "@/components/detail/detail-synopsis-section";
import { formatDisplayTitle, formatEpisodeCount } from "@/lib/anilist/display/format";
import { buildProgressiveImageSources } from "@/lib/anilist/display/image-urls";
import { getStreamingLinks } from "@/lib/anilist/display/streaming";
import { DETAIL_BODY_GRID_CLASS } from "@/lib/styles/detail-page-layout";

type AnimeDetailMediaProps = {
  media: MediaDetail;
};

const EPISODIC_FORMATS = new Set(["TV", "TV_SHORT", "ONA", "OVA", "SPECIAL"]);

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

function getDetailDerivedData(media: MediaDetail) {
  const title = formatDisplayTitle(media.title);
  const episodes = buildEpisodeCards(media);
  const streamingLinks = getStreamingLinks(media.externalLinks);
  const showEpisodes = shouldShowEpisodesSection(media);

  const characterEdges =
    media.characters?.edges?.filter(
      (
        edge,
      ): edge is NonNullable<typeof edge> & {
        node: NonNullable<NonNullable<typeof edge>["node"]>;
      } => Boolean(edge?.node),
    ) ?? [];

  const staffEdges =
    media.staff?.edges?.filter(
      (
        edge,
      ): edge is NonNullable<typeof edge> & {
        node: NonNullable<NonNullable<typeof edge>["node"]>;
      } => Boolean(edge?.node),
    ) ?? [];

  const relationItems: DetailRelationItem[] =
    media.relations?.edges
      ?.filter(
        (
          edge,
        ): edge is NonNullable<typeof edge> & {
          relationType: MediaRelation;
          node: NonNullable<NonNullable<typeof edge>["node"]>;
        } => Boolean(edge?.node?.id && edge.relationType),
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

  return {
    title,
    episodes,
    streamingLinks,
    showEpisodes,
    characterEdges,
    staffEdges,
    relationItems,
    recommendationMedia,
  };
}

export function DetailCoverBanner({ media }: AnimeDetailMediaProps) {
  const bannerSources = buildProgressiveImageSources(media.bannerImage);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ backgroundColor: media.coverImage?.color ?? "var(--muted)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
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
    </div>
  );
}

export function AnimeDetailBody({ media }: AnimeDetailMediaProps) {
  const {
    title,
    episodes,
    streamingLinks,
    showEpisodes,
    characterEdges,
    staffEdges,
    relationItems,
    recommendationMedia,
  } = getDetailDerivedData(media);

  return (
    <>
      <DetailReturnAnchor mediaId={media.id} title={title} />
      <DetailBreadcrumb title={title} />

      <div className={DETAIL_BODY_GRID_CLASS}>
        <DetailSidebar media={media} />

        <div className="flex min-w-0 flex-col gap-8 lg:gap-10">
          <DetailMainHeader media={media} />

          <DetailTaxonomy media={media} streamingLinks={streamingLinks} />

          <DetailTrailer media={media} />

          {media.description ? (
            <DetailSynopsisSection title="Synopsis" text={media.description} />
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
    </>
  );
}
