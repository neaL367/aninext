import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyHeader, EmptyTitle, EmptyMedia } from "@/components/ui/empty";
import { UsersIcon } from "lucide-react";
import { getAnimeCharacters } from "@/features/anime/anime-queries";
import type { CharacterEdge, PageInfo } from "@/features/anime/types/anime";

export async function AnimeCharacters({
  id,
  edges: edgesProp,
  pageInfo: pageInfoProp,
}: {
  id?: number;
  edges?: CharacterEdge[];
  pageInfo?: PageInfo;
}) {
  const { edges, pageInfo } =
    edgesProp !== undefined
      ? { edges: edgesProp, pageInfo: pageInfoProp! }
      : await getAnimeCharacters(id!);

  if (edges.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UsersIcon />
          </EmptyMedia>
          <EmptyTitle>No characters available</EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Characters</h2>
      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 md:grid-cols-4 lg:grid-cols-6">
        {edges.map((edge, i) => (
          <div key={`${edge.node.id}-${i}`} className="group w-[120px] shrink-0 snap-start sm:w-auto">
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-muted transition-all duration-300 group-hover:ring-1 group-hover:ring-accent/40 group-hover:shadow-[0_0_12px_var(--glow)]">
              {edge.node.image.medium && (
                <Image
                  src={edge.node.image.medium}
                  alt={edge.node.name.full}
                  fill
                  sizes="(max-width: 640px) 120px, (max-width: 1024px) 25vw, 16vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  loading="lazy"
                />
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <p className="line-clamp-1 text-xs font-semibold text-white">{edge.node.name.full}</p>
                <p className="line-clamp-1 text-[10px] text-white/70">{edge.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnimeCharactersSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="h-7 w-32 rounded-md shimmer" />
      <div className="flex gap-4 overflow-hidden sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="w-[120px] shrink-0 sm:w-auto">
            <div className="shimmer aspect-[2/3] w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
