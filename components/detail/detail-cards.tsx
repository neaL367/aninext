"use client";

import Link from "next/link";
import type { Route } from "next";
import { Separator } from "@/components/ui/separator";
import { ProgressiveImage } from "@/components/shared/progressive-image";
import type { MediaDetail } from "@/lib/anilist/domain/types";
import { buildProgressiveImageSources } from "@/lib/anilist/display/image-urls";
import { getCharacterDetailHref, getStaffDetailHref } from "@/lib/anilist/display/media-links";

type CharacterEdge = NonNullable<
  NonNullable<MediaDetail["characters"]>["edges"]
>[number];

export function DetailCharacterCard({ edge }: { edge: NonNullable<CharacterEdge> }) {
  const character = edge.node;
  const voiceActor = edge.voiceActors?.[0];
  const characterName = character?.name?.full ?? "—";
  const characterImage = character?.image?.large ?? null;

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Link
        href={
          character?.id
            ? getCharacterDetailHref(character.id, characterName)
            : ("#" as Route)
        }
        prefetch
        className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/40"
      >
        <div className="relative size-[4.75rem] shrink-0 overflow-hidden rounded-lg border border-border bg-muted sm:size-20">
          {characterImage ? (
            <ProgressiveImage
              sources={buildProgressiveImageSources(characterImage)}
              alt=""
              fill
              className="object-cover"
              sizes="80px"
              loading="lazy"
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-medium sm:text-lg">{characterName}</p>
          {edge.role ? (
            <p className="truncate text-sm text-muted-foreground">{edge.role}</p>
          ) : null}
        </div>
      </Link>

      {voiceActor ? (
        <>
          <Separator />
          <div className="flex items-center gap-3.5 bg-muted/40 px-4 py-3.5">
            {voiceActor.id ? (
              <Link
                href={getStaffDetailHref(
                  voiceActor.id,
                  voiceActor.name?.full ?? "—"
                )}
                prefetch
                className="flex min-w-0 flex-1 items-center gap-3.5 transition-opacity hover:opacity-90"
              >
                <div className="relative size-12 shrink-0 overflow-hidden rounded-full border border-border bg-muted sm:size-14">
                  {voiceActor.image?.large ? (
                    <ProgressiveImage
                      sources={buildProgressiveImageSources(voiceActor.image.large)}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="56px"
                      loading="lazy"
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
              </Link>
            ) : (
              <>
                <div className="relative size-12 shrink-0 overflow-hidden rounded-full border border-border bg-muted sm:size-14">
                  {voiceActor.image?.large ? (
                    <ProgressiveImage
                      sources={buildProgressiveImageSources(voiceActor.image.large)}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="56px"
                      loading="lazy"
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
              </>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

type StaffEdge = NonNullable<NonNullable<MediaDetail["staff"]>["edges"]>[number];

export function DetailStaffCard({
  staffId,
  name,
  role,
  image,
}: {
  staffId?: number;
  name: string;
  role: string | null;
  image: string | null;
}) {
  const cardBody = (
    <>
      <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-border bg-muted sm:size-[4.5rem]">
        {image ? (
          <ProgressiveImage
            sources={buildProgressiveImageSources(image)}
            alt=""
            fill
            className="object-cover"
            sizes="72px"
            loading="lazy"
          />
        ) : null}
      </div>
      <div className="min-w-0">
        <p className="truncate text-base font-medium">{name}</p>
        {role ? (
          <p className="truncate text-sm text-muted-foreground">{role}</p>
        ) : null}
      </div>
    </>
  );

  if (!staffId) {
    return (
      <div className="flex items-center gap-3.5 rounded-lg border border-border p-3.5">
        {cardBody}
      </div>
    );
  }

  return (
    <Link
      href={getStaffDetailHref(staffId, name)}
      prefetch
      className="flex items-center gap-3.5 rounded-lg border border-border p-3.5 transition-colors hover:bg-muted/40"
    >
      {cardBody}
    </Link>
  );
}

export type { CharacterEdge, StaffEdge };
