import Link from "next/link";
import type { Route } from "next";
import { Skeleton } from "@/components/ui/skeleton";
import { getGenres } from "@/features/anime/anime-queries";

export async function GenrePills() {
  const genres = await getGenres();

  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Browse by Genre</h2>
      <div className="flex flex-wrap gap-2">
        {genres.map((genre) => (
          <Link
            key={genre}
            href={`/anime/trending?genre=${encodeURIComponent(genre)}` as Route<string>}
            className="group rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-all duration-200 hover:border-accent/50 hover:bg-accent/10 hover:text-accent hover:shadow-[0_0_12px_var(--glow)] motion-reduce:transition-none"
          >
            {genre}
          </Link>
        ))}
      </div>
    </section>
  );
}

export function GenrePillsSkeleton() {
  return (
    <section className="flex flex-col gap-5">
      <div className="h-8 w-48 rounded-md shimmer" />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 24 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>
    </section>
  );
}
