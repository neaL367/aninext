"use client";

import { DetailLoadMoreGrid } from "@/components/detail/detail-load-more-grid";
import { PersonMediaCard } from "@/components/person/person-media-card";
import type { MediaCardGrid, MediaType } from "@/lib/anilist/domain/types";

export type PersonCreditItem = {
  key: string;
  media: MediaCardGrid & { type?: MediaType | null };
  role: string | null;
};

type PersonCreditsSectionProps = {
  credits: PersonCreditItem[];
  kind: "character" | "staff";
};

export function PersonCreditsSection({ credits, kind }: PersonCreditsSectionProps) {
  return (
    <DetailLoadMoreGrid
      items={credits.map((item) => (
        <PersonMediaCard key={item.key} media={item.media} role={item.role} />
      ))}
      initialCount={8}
      step={8}
      gridClassName="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6"
      loadMoreLabel={kind === "character" ? "Load more roles" : "Load more works"}
    />
  );
}
