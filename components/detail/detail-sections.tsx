"use client";

import Image from "next/image";
import { AnimeCard } from "@/components/anime/anime-card";
import { DetailLoadMoreGrid } from "@/components/detail/detail-load-more-grid";
import { EpisodeCard } from "@/components/detail/episode-card";
import { Separator } from "@/components/ui/separator";
import type { MediaCard, MediaDetail } from "@/lib/anilist/types";
import type { EpisodeCardData } from "@/lib/anilist/utils/episodes";

type CharacterEdge = NonNullable<
  NonNullable<MediaDetail["characters"]>["edges"]
>[number];

type StaffEdge = NonNullable<NonNullable<MediaDetail["staff"]>["edges"]>[number];

function CharacterCard({ edge }: { edge: NonNullable<CharacterEdge> }) {
  const character = edge.node;
  const voiceActor = edge.voiceActors?.[0];
  const characterName = character?.name?.full ?? "—";
  const characterImage = character?.image?.large ?? null;

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center gap-4 p-4">
        <div className="relative size-[4.75rem] shrink-0 overflow-hidden rounded-lg border border-border bg-muted sm:size-20">
          {characterImage ? (
            <Image
              src={characterImage}
              alt=""
              fill
              className="object-cover"
              sizes="80px"
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-medium sm:text-lg">{characterName}</p>
          {edge.role ? (
            <p className="truncate text-sm text-muted-foreground">{edge.role}</p>
          ) : null}
        </div>
      </div>

      {voiceActor ? (
        <>
          <Separator />
          <div className="flex items-center gap-3.5 bg-muted/40 px-4 py-3.5">
            <div className="relative size-12 shrink-0 overflow-hidden rounded-full border border-border bg-muted sm:size-14">
              {voiceActor.image?.large ? (
                <Image
                  src={voiceActor.image.large}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              ) : null}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Voice · {voiceActor.languageV2 ?? "Japanese"}
              </p>
              <p className="truncate text-base font-medium">
                {voiceActor.name?.full ?? "—"}
              </p>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function StaffCard({
  name,
  role,
  image,
}: {
  name: string;
  role: string | null;
  image: string | null;
}) {
  return (
    <div className="flex items-center gap-3.5 rounded-lg border border-border p-3.5">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-border bg-muted sm:size-[4.5rem]">
        {image ? (
          <Image src={image} alt="" fill className="object-cover" sizes="72px" />
        ) : null}
      </div>
      <div className="min-w-0">
        <p className="truncate text-base font-medium">{name}</p>
        {role ? (
          <p className="truncate text-sm text-muted-foreground">{role}</p>
        ) : null}
      </div>
    </div>
  );
}

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
      renderItem={(edge) => <CharacterCard key={edge.node!.id} edge={edge} />}
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
        <StaffCard
          key={`${edge.node!.id}-${edge.role ?? "staff"}-${index}`}
          name={edge.node!.name?.full ?? "—"}
          role={edge.role ?? null}
          image={edge.node!.image?.large ?? null}
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
      gridClassName="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7"
      loadMoreLabel={loadMoreLabel}
      renderItem={(item) => (
        <AnimeCard key={item.id} media={item} showTooltip={false} compact />
      )}
    />
  );
}
