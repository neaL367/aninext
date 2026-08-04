import { Empty, EmptyHeader, EmptyTitle, EmptyMedia } from "@/components/ui/empty";
import { ThumbsUpIcon } from "lucide-react";
import { getAnimeRecommendations } from "@/features/anime/anime-queries";
import { AnimePreviewCard } from "./anime-preview-card";
import { MediaCard, MediaCardSkeleton } from "./media-card";
import type { RecommendationNode } from "@/features/anime/types/anime";

export async function AnimeRecommendations({
  id,
  nodes: nodesProp,
}: {
  id?: number;
  nodes?: RecommendationNode[];
}) {
  const nodes = nodesProp !== undefined ? nodesProp : await getAnimeRecommendations(id!);

  if (nodes.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ThumbsUpIcon />
          </EmptyMedia>
          <EmptyTitle>No recommendations</EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Recommendations</h2>
      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 md:grid-cols-4">
        {nodes.map((node) => {
          const media = node.mediaRecommendation;
          return (
            <div key={media.id} className="w-[140px] shrink-0 snap-start sm:w-auto">
              <AnimePreviewCard media={media}>
                <MediaCard media={media} />
              </AnimePreviewCard>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AnimeRecommendationsSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="h-7 w-40 rounded-md shimmer" />
      <div className="flex gap-4 overflow-hidden sm:grid sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="w-[140px] shrink-0 sm:w-auto">
            <MediaCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}
