import type { Route } from "next";
import type { AnimeCardMedia } from "@/components/anime/anime-card-parts";
import { AnimeMediaGrid } from "@/components/anime/anime-media-grid";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeader } from "@/components/shared/section-header";

type HomeSectionProps = {
  title: string;
  subtitle?: string;
  href?: Route;
  media: readonly AnimeCardMedia[];
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
        <AnimeMediaGrid media={media} showCountdown={showCountdown} />
      )}
    </section>
  );
}
