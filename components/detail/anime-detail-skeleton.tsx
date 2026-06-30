import { AnimeDetailPageFrame } from "@/components/detail/anime-detail-page-frame";
import { AnimeDetailBodySkeleton } from "@/components/detail/anime-detail-body-skeleton";

export function AnimeDetailPageFallback() {
  return (
    <AnimeDetailPageFrame>
      <AnimeDetailBodySkeleton />
    </AnimeDetailPageFrame>
  );
}

export { AnimeDetailBodySkeleton } from "@/components/detail/anime-detail-body-skeleton";
export { DetailCoverShell } from "@/components/detail/detail-cover-shell";
