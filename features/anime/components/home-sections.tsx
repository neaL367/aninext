import { ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";
import { ViewTransition } from "react";

import { MediaImage } from "@/components/ui/media-image";
import { ViewAllLink } from "@/components/ui/view-all-link";
import { formatFormat, getMediaCover, getMediaTitle } from "@/features/anime/lib/media-helpers";

import { MediaCard } from "./media-card";
import { MediaScore } from "./media-score";
import { SectionHeader } from "./section-header";

import type { Media } from "@/features/anime/types/anime";
import type { Route } from "next";

/** 01 — a large still plus a quiet, numbered ledger. */
export function TrendingIndex({ items }: { items: Media[] }) {
  "use memo";
  if (items.length === 0) return null;

  const lead = items[0];
  const rest = items.slice(1, 7);
  const leadTitle = getMediaTitle(lead);

  return (
    <section aria-labelledby="trending">
      <SectionHeader
        index="01"
        title="Trending"
        action={<ViewAllLink href="/anime/trending">All trending</ViewAllLink>}
      />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
        <Link
          href={`/anime/${lead.id}` as Route<string>}
          className="group relative block min-h-[420px] overflow-hidden rounded-[3px] bg-surface-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal lg:min-h-[560px]"
        >
          {(lead.bannerImage ?? getMediaCover(lead, "extraLarge")) && (
            <ViewTransition name={`anime-cover-${lead.id}`} share="morph" default="none">
              <MediaImage
                src={(lead.bannerImage ?? getMediaCover(lead, "extraLarge")) as string}
                alt={leadTitle}
                fill
                priority
                sizes="(min-width: 1024px) 52vw, 100vw"
                className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] motion-reduce:transform-none"
              />
            </ViewTransition>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-7">
            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/50">
                  No. 01
                </p>
                <h3 className="mt-2 line-clamp-2 font-serif text-3xl leading-[1.02] tracking-[-0.03em] text-white sm:text-4xl">
                  {leadTitle}
                </h3>
                <p className="mt-2 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-white/55">
                  {[lead.format ? formatFormat(lead.format) : null, lead.seasonYear]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              {lead.averageScore !== undefined && (
                <MediaScore score={lead.averageScore} className="shrink-0 text-lg text-white/90" />
              )}
            </div>
          </div>
        </Link>

        <ol className="divide-y divide-border-soft border-t border-border-soft">
          {rest.map((item, index) => {
            const title = getMediaTitle(item);
            const cover = getMediaCover(item, "medium");
            return (
              <li key={item.id}>
                <Link
                  href={`/anime/${item.id}` as Route<string>}
                  className="group flex items-center gap-4 py-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                >
                  <span className="w-6 shrink-0 font-mono text-[0.62rem] tabular-nums text-muted-foreground/60">
                    {String(index + 2).padStart(2, "0")}
                  </span>
                  <span className="relative aspect-[2/3] w-9 shrink-0 overflow-hidden rounded-[2px] bg-surface-2">
                    {cover && (
                      <MediaImage
                        src={cover}
                        alt=""
                        fill
                        sizes="36px"
                        loading="lazy"
                        className="object-cover"
                      />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-serif text-base leading-snug text-foreground transition-colors group-hover:text-signal sm:text-lg">
                      {title}
                    </span>
                    <span className="mt-0.5 block font-mono text-[0.58rem] uppercase tracking-[0.12em] text-muted-foreground/75">
                      {[item.format ? formatFormat(item.format) : null, item.seasonYear]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>
                  {item.averageScore !== undefined && (
                    <MediaScore
                      score={item.averageScore}
                      className="shrink-0 text-xs text-muted-foreground"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/** 02 — one large poster and four quiet covers. */
export function SeasonMosaic({
  title,
  href,
  items,
}: {
  title: string;
  href: Route<string>;
  items: Media[];
}) {
  "use memo";
  if (items.length === 0) return null;

  const [lead, ...rest] = items;
  const leadTitle = getMediaTitle(lead);

  return (
    <section aria-labelledby="season">
      <SectionHeader
        index="02"
        title={title}
        action={<ViewAllLink href={href}>Full season</ViewAllLink>}
      />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
        <Link
          href={`/anime/${lead.id}` as Route<string>}
          className="group relative col-span-2 row-span-2 block aspect-[4/5] overflow-hidden rounded-[3px] bg-surface-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal sm:aspect-auto sm:min-h-[560px]"
        >
          {getMediaCover(lead, "extraLarge") && (
            <MediaImage
              src={getMediaCover(lead, "extraLarge") as string}
              alt={leadTitle}
              fill
              sizes="(min-width: 640px) 42vw, 100vw"
              className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] motion-reduce:transform-none"
            />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <h3 className="line-clamp-2 font-serif text-2xl leading-[1.05] tracking-[-0.03em] text-white sm:text-3xl">
              {leadTitle}
            </h3>
            <p className="mt-1.5 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-white/55">
              {[lead.format ? formatFormat(lead.format) : null, lead.seasonYear]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </Link>

        {rest.slice(0, 4).map((item) => (
          <MediaCard key={item.id} media={item} coverTier="extraLarge" />
        ))}
      </div>
    </section>
  );
}

/** 04 — a ranked ledger, no card chrome. */
export function RankingList({
  title,
  href,
  items,
}: {
  title: string;
  href: Route<string>;
  items: Media[];
}) {
  "use memo";
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="ranking">
      <SectionHeader
        index="04"
        title={title}
        action={<ViewAllLink href={href}>Full ranking</ViewAllLink>}
      />
      <ol className="grid grid-cols-1 gap-x-12 md:grid-cols-2">
        {items.slice(0, 10).map((item, index) => {
          const itemTitle = getMediaTitle(item);
          return (
            <li key={item.id} className="border-b border-border-soft">
              <Link
                href={`/anime/${item.id}` as Route<string>}
                className="group flex items-baseline gap-4 py-3.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
              >
                <span className="w-7 shrink-0 font-serif text-lg italic tabular-nums text-muted-foreground/60">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-serif text-base leading-snug text-foreground transition-colors group-hover:text-signal sm:text-lg">
                    {itemTitle}
                  </span>
                  <span className="mt-0.5 block font-mono text-[0.56rem] uppercase tracking-[0.12em] text-muted-foreground/70">
                    {[item.format ? formatFormat(item.format) : null, item.seasonYear]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
                {item.averageScore !== undefined && (
                  <MediaScore score={item.averageScore} className="shrink-0 text-xs" />
                )}
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/** 05 — wide, cinematic anticipation cards. */
export function UpcomingStrip({
  title,
  href,
  items,
}: {
  title: string;
  href: Route<string>;
  items: Media[];
}) {
  "use memo";
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="upcoming">
      <SectionHeader
        index="05"
        title={title}
        action={<ViewAllLink href={href}>Coming soon</ViewAllLink>}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
        {items.slice(0, 4).map((item) => {
          const itemTitle = getMediaTitle(item);
          const banner = item.bannerImage ?? getMediaCover(item, "extraLarge");
          return (
            <Link
              key={item.id}
              href={`/anime/${item.id}` as Route<string>}
              className="group relative block aspect-[16/10] overflow-hidden rounded-[3px] bg-surface-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
            >
              {banner && (
                <MediaImage
                  src={banner}
                  alt={itemTitle}
                  fill
                  sizes="(min-width: 1024px) 23vw, (min-width: 640px) 46vw, 94vw"
                  loading="lazy"
                  className="object-cover transition-transform duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] motion-reduce:transform-none"
                />
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="font-mono text-[0.56rem] uppercase tracking-[0.16em] text-white/50">
                  {item.seasonYear ?? "TBA"}
                </p>
                <h3 className="mt-1 line-clamp-2 font-serif text-lg leading-[1.1] tracking-[-0.02em] text-white">
                  {itemTitle}
                </h3>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/** 06 — an index, not a marketing panel. */
export function GenreIndex({ genres }: { genres: string[] }) {
  "use memo";
  if (genres.length === 0) return null;

  return (
    <section aria-labelledby="genres">
      <SectionHeader index="06" title="By mood" />
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        {genres.map((genre) => (
          <Link
            key={genre}
            href={`/anime/trending?genre=${encodeURIComponent(genre)}`}
            className="group inline-flex items-center gap-1.5 font-serif text-lg text-muted-foreground transition-colors hover:text-foreground sm:text-xl"
          >
            {genre}
            <ArrowUpRightIcon className="size-3 text-signal opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        ))}
      </div>
    </section>
  );
}

export function HomeSectionSkeleton({
  kind = "row",
}: {
  kind?: "row" | "mosaic" | "list" | "wide";
}) {
  if (kind === "mosaic") {
    return (
      <section>
        <div className="mb-8 border-b border-border-soft pb-4">
          <div className="shimmer h-9 w-56 rounded-[2px]" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
          <div className="col-span-2 row-span-2 shimmer min-h-[420px] rounded-[3px] sm:min-h-[560px]" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="shimmer aspect-[2/3] rounded-[3px]" />
          ))}
        </div>
      </section>
    );
  }

  if (kind === "list") {
    return (
      <section>
        <div className="mb-8 border-b border-border-soft pb-4">
          <div className="shimmer h-9 w-56 rounded-[2px]" />
        </div>
        <div className="grid grid-cols-1 gap-x-12 md:grid-cols-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="border-b border-border-soft py-4">
              <div className="shimmer h-5 w-full max-w-sm rounded-[2px]" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (kind === "wide") {
    return (
      <section>
        <div className="mb-8 border-b border-border-soft pb-4">
          <div className="shimmer h-9 w-48 rounded-[2px]" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="shimmer aspect-[16/10] rounded-[3px]" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-8 border-b border-border-soft pb-4">
        <div className="shimmer h-9 w-52 rounded-[2px]" />
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="shimmer min-h-[420px] rounded-[3px] lg:min-h-[560px]" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="shimmer h-16 rounded-[2px]" />
          ))}
        </div>
      </div>
    </section>
  );
}
