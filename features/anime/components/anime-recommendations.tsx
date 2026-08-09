import { ThumbsUpIcon } from "lucide-react";

import { AnimePreviewCard } from "@/features/anime/components/anime-preview-card";
import { MediaCard, MediaCardSkeleton } from "@/features/anime/components/media-card";

import { EmptyState } from "./empty-state";

import type { RecommendationNode } from "@/features/anime/types/anime";

export function AnimeRecommendations({ nodes }: { nodes: RecommendationNode[] }) {
  "use memo";
  if (nodes.length === 0) {
    return (
      <EmptyState
        icon={ThumbsUpIcon}
        title="No recommendations"
        description="No recommendations available yet."
      />
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {nodes.map((node) => {
          const media = node.mediaRecommendation;
          return (
            <div key={media.id}>
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
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <MediaCardSkeleton key={i} />
      ))}
    </div>
  );
}
