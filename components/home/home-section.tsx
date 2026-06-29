import type { Route } from "next";
import type { MediaCard } from "@/lib/anilist/types";
import { AnimeGrid } from "@/components/anime/anime-grid";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeader } from "@/components/shared/section-header";

type HomeSectionProps = {
  title: string;
  subtitle?: string;
  href?: Route;
  media: readonly (MediaCard & {
    popularityPercent?: number | null;
    rank?: number;
  })[];
  showCountdown?: boolean;
};

export function HomeSection({
  title,
  subtitle,
  href,
  media,
  showCountdown = false,
}: HomeSectionProps) {
  const headingId = title.toLowerCase().replace(/\s+/g, "-");

  return (
    <section
      aria-labelledby={headingId}
      className="flex min-w-0 flex-col gap-4 border-t border-border pt-8 lg:pt-10"
    >
      <SectionHeader title={title} subtitle={subtitle} href={href} />
      {!media.length ? (
        <EmptyState title="No anime found" />
      ) : (
        <AnimeGrid media={media} showCountdown={showCountdown} />
      )}
    </section>
  );
}
