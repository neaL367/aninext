import Link from "next/link";
import type { Route } from "next";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRightIcon } from "lucide-react";
import { getGenres } from "@/features/anime/anime-queries";

export async function GenreExplorer() {
  const allGenres = await getGenres();
  const ADULT_GENRES = ["Ecchi", "Hentai"];
  const genres = allGenres.filter((g) => !ADULT_GENRES.includes(g));

  return (
    <section className="grid gap-8 border-y border-border-soft py-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16 lg:py-14">
      <div>
        <p className="eyebrow text-accent">Find a mood</p>
        <h2 className="mt-3 max-w-sm text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Browse by genre</h2>
        <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">Start with a feeling, not a ranking. Explore the catalog through its recurring worlds and moods.</p>
      </div>
      <div className="grid grid-cols-2 gap-x-8 sm:grid-cols-3">
        {genres.map((genre) => (
          <Link key={genre} href={`/anime/trending?genre=${encodeURIComponent(genre)}` as Route<string>} className="group flex items-center justify-between border-b border-border-soft py-3 text-sm text-muted-foreground transition-colors hover:border-accent/60 hover:text-foreground">
            <span>{genre}</span><ArrowUpRightIcon className="size-3 opacity-0 transition-opacity group-hover:opacity-100 group-hover:text-accent" />
          </Link>
        ))}
      </div>
    </section>
  );
}

export function GenreList({ genres }: { genres: string[] }) {
  if (genres.length === 0) return null;
  return <div className="grid grid-cols-2 gap-x-4">{genres.map((genre) => <Link key={genre} href={`/anime/trending?genre=${encodeURIComponent(genre)}` as Route<string>} className="border-b border-border-soft py-2 text-xs text-muted-foreground transition-colors hover:border-accent/60 hover:text-accent">{genre}</Link>)}</div>;
}

export function GenrePillsSkeleton() {
  return <section className="grid gap-8 border-y border-border-soft py-10 lg:grid-cols-[0.7fr_1.3fr]"><div className="space-y-3"><Skeleton className="h-2.5 w-20 rounded" /><Skeleton className="h-10 w-56 rounded" /><Skeleton className="h-10 w-full max-w-sm rounded" /></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{Array.from({ length: 18 }).map((_, i) => <Skeleton key={i} className="h-10 rounded" />)}</div></section>;
}
