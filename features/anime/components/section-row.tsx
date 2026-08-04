import type { Route } from "next";
import { ArrowRightIcon } from "lucide-react";
import { HoverPrefetchLink } from "@/components/hover-prefetch-link";
import type { Media } from "@/features/anime/types/anime";
import { MediaCard, MediaCardSkeleton } from "./media-card";

export function SectionRow({
  title,
  href,
  items,
  description,
}: {
  title: string;
  href: Route<string>;
  items: Media[];
  description?: string;
}) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <HoverPrefetchLink
          href={href}
          className="group hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
        >
          See all
          <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
        </HoverPrefetchLink>
      </div>
      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:gap-5 md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:pb-0 lg:grid-cols-6 xl:grid-cols-7">
        {items.map((item) => (
          <div key={item.id} className="w-[140px] shrink-0 snap-start sm:w-[160px] md:w-auto">
            <MediaCard media={item} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function SectionRowSkeleton({ count = 6 }: { count?: number }) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <div className="h-8 w-40 rounded-md shimmer" />
          <div className="h-4 w-56 rounded shimmer" />
        </div>
        <div className="hidden h-5 w-16 rounded sm:block shimmer" />
      </div>
      <div className="flex gap-4 overflow-hidden pb-4 md:grid md:grid-cols-5 md:overflow-visible md:pb-0 lg:grid-cols-6 xl:grid-cols-7">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="w-[160px] shrink-0 md:w-auto">
            <MediaCardSkeleton />
          </div>
        ))}
      </div>
    </section>
  );
}
