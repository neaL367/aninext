"use client";

import { AnimeCompactCard } from "@/components/anime/anime-compact-card";
import { DetailRelationCard, type DetailRelationItem } from "@/components/detail/detail-relation-card";
import { DetailCharacterCard, DetailStaffCard } from "@/components/detail/detail-cards";
import { DetailLoadMoreGrid } from "@/components/detail/detail-load-more-grid";
import { EpisodeCard } from "@/components/detail/episode-card";
import type { MediaCard } from "@/lib/anilist/domain/types";
import type { EpisodeCardData } from "@/lib/anilist/display/episodes";
import type { CharacterEdge, StaffEdge } from "@/components/detail/detail-cards";

export function DetailEpisodesSection({
  episodes,
}: {
  episodes: EpisodeCardData[];
}) {
  return (
    <DetailLoadMoreGrid
      items={episodes}
      initialCount={8}
      step={8}
      gridClassName="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3"
      loadMoreLabel="Load more episodes"
      renderItem={(ep) => <EpisodeCard key={ep.episode} episode={ep} />}
    />
  );
}

export function DetailCharactersSection({
  edges,
}: {
  edges: NonNullable<CharacterEdge>[];
}) {
  return (
    <DetailLoadMoreGrid
      items={edges}
      initialCount={6}
      step={6}
      gridClassName="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      loadMoreLabel="Load more characters"
      renderItem={(edge) => <DetailCharacterCard key={edge.node!.id} edge={edge} />}
    />
  );
}

export function DetailStaffSection({
  edges,
}: {
  edges: NonNullable<StaffEdge>[];
}) {
  return (
    <DetailLoadMoreGrid
      items={edges}
      initialCount={8}
      step={8}
      gridClassName="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      loadMoreLabel="Load more staff"
      renderItem={(edge, index) => (
        <DetailStaffCard
          key={`${edge.node!.id}-${edge.role ?? "staff"}-${index}`}
          staffId={edge.node!.id}
          name={edge.node!.name?.full ?? "—"}
          role={edge.role ?? null}
          image={edge.node!.image?.large ?? null}
        />
      )}
    />
  );
}

export function DetailRelationsSection({
  items,
}: {
  items: DetailRelationItem[];
}) {
  return (
    <DetailLoadMoreGrid
      items={items}
      initialCount={8}
      step={8}
      gridClassName="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6"
      loadMoreLabel="Load more relations"
      renderItem={(item) => (
        <DetailRelationCard
          key={`${item.media.id}-${item.relationType}`}
          item={item}
        />
      )}
    />
  );
}

export function DetailMediaCardsSection({
  media,
  loadMoreLabel,
}: {
  media: MediaCard[];
  loadMoreLabel: string;
}) {
  return (
    <DetailLoadMoreGrid
      items={media}
      initialCount={8}
      step={8}
      gridClassName="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6"
      loadMoreLabel={loadMoreLabel}
      renderItem={(item) => (
        <AnimeCompactCard key={item.id} media={item} />
      )}
    />
  );
}
