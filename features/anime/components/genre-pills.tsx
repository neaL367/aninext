import Link from "next/link";

import { FILTER_ADULT_GENRES } from "@/features/anime/lib/filter-constants";

export function GenreList({ genres }: { genres: string[] }) {
  "use memo";
  const visible = genres.filter(
    (genre) => !FILTER_ADULT_GENRES.some((adultGenre) => adultGenre === genre),
  );
  if (visible.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2">
      {visible.map((genre) => (
        <Link
          key={genre}
          href={`/anime/trending?genre=${encodeURIComponent(genre)}`}
          className="inline-flex min-h-8 items-center font-mono text-[0.8125rem] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-signal"
        >
          {genre}
        </Link>
      ))}
    </div>
  );
}
