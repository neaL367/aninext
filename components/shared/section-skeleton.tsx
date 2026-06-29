import { Skeleton } from "@/components/ui/skeleton";
import {
  ANIME_GRID_CELL_CLASS,
  ANIME_GRID_CLASS,
} from "@/lib/ui/anime-grid-layout";

export function SectionSkeleton() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading section"
      className="flex flex-col gap-4 border-t border-border pt-8 lg:pt-10"
    >
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-4 w-20" />
      </div>
      <div className={ANIME_GRID_CLASS}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className={ANIME_GRID_CELL_CLASS}>
            <div className="flex h-full flex-col overflow-hidden rounded-md border border-border/80 bg-card">
              <Skeleton className="aspect-[2/3] max-h-44 w-full rounded-none sm:max-h-48 md:max-h-52 lg:max-h-54" />
              <div className="flex flex-col gap-1.5 p-2.5">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3.5 w-3/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
