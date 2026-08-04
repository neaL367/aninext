"use client";

import Link from "next/link";
import type { Route } from "next";
import { ArrowUpRightIcon } from "lucide-react";
import { useEffect, useState } from "react";
import type { Media } from "@/features/anime/types/anime";
import { getMediaTitle, formatFormat } from "@/features/anime/lib/media-helpers";

function useStaggeredReveal(key: string, steps: number) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    setStep(0);
    const timers = Array.from({ length: steps }, (_, i) =>
      setTimeout(() => setStep(i + 1), 80 + i * 100)
    );
    return () => timers.forEach(clearTimeout);
  }, [key, steps]);
  return step;
}

export function HeroInfo({ media }: { media: Media }) {
  const title = getMediaTitle(media);
  const description = media.description?.replace(/<[^>]*>/g, "").trim();
  const step = useStaggeredReveal(String(media.id), 5);

  return (
    <div>
      <p className="eyebrow text-accent">Featured anime</p>
      <p className="mt-8 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">Trending now</p>
      <h1
        className="mt-4 line-clamp-3 max-w-xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] transition-all duration-500 ease-out sm:text-5xl lg:text-6xl"
        style={{ opacity: step >= 1 ? 1 : 0, transform: step >= 1 ? "translateY(0)" : "translateY(16px)" }}
      >
        {title}
      </h1>
      <div
        className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-muted-foreground transition-all duration-500 ease-out"
        style={{ opacity: step >= 2 ? 1 : 0, transform: step >= 2 ? "translateY(0)" : "translateY(8px)" }}
      >
        {media.averageScore && <span className="text-foreground">{(media.averageScore / 10).toFixed(1)} / 10</span>}
        {media.format && <span>{formatFormat(media.format)}</span>}
        {media.episodes && <span>{media.episodes} episodes</span>}
        {media.status === "RELEASING" && <span className="text-live-badge">Airing now</span>}
      </div>
      {description && (
        <p
          className="mt-5 line-clamp-3 max-w-lg text-sm leading-7 text-muted-foreground transition-all duration-500 ease-out"
          style={{ opacity: step >= 3 ? 1 : 0, transform: step >= 3 ? "translateY(0)" : "translateY(8px)" }}
        >
          {description}
        </p>
      )}
      <div
        className="mt-5 flex flex-wrap gap-2 transition-all duration-500 ease-out"
        style={{ opacity: step >= 4 ? 1 : 0, transform: step >= 4 ? "translateY(0)" : "translateY(8px)" }}
      >
        {media.genres.slice(0, 4).map((genre) => (
          <span key={genre} className="border border-border px-2 py-1 font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">{genre}</span>
        ))}
      </div>
      <Link
        href={`/anime/${media.id}` as Route<string>}
        className="mt-8 inline-flex items-center gap-3 border-b border-accent pb-2 text-sm font-medium text-accent transition-all duration-500 ease-out hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        style={{ opacity: step >= 5 ? 1 : 0, transform: step >= 5 ? "translateY(0)" : "translateY(8px)" }}
      >
        Open profile <ArrowUpRightIcon className="size-4" />
      </Link>
    </div>
  );
}
