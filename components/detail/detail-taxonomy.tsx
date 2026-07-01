import { DetailTaxonomyTags } from "@/components/detail/detail-taxonomy-tags";
import { StreamingLinksGrid } from "@/components/shared/streaming-links-grid";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ReactNode } from "react";
import type { MediaDetail } from "@/lib/anilist/domain/types";
import {
  TAXONOMY_CHIP_CLASS,
  TAXONOMY_CHIP_ROW_CLASS,
  TAXONOMY_SECTION_LABEL_CLASS,
} from "@/lib/styles/taxonomy-chips";

type DetailTaxonomyProps = {
  media: MediaDetail;
  streamingLinks: { site: string; url: string }[];
};

type TaxonomySectionProps = {
  label: string;
  children: ReactNode;
};

function TaxonomySection({ label, children }: TaxonomySectionProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className={TAXONOMY_SECTION_LABEL_CLASS}>{label}</p>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function DetailTaxonomy({ media, streamingLinks }: DetailTaxonomyProps) {
  const genres = media.genres?.filter(Boolean) ?? [];
  const tags =
    media.tags
      ?.filter((tag): tag is NonNullable<typeof tag> & { name: string } => Boolean(tag?.name))
      .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99)) ?? [];

  const hasClassification = Boolean(media.status) || genres.length > 0 || tags.length > 0;

  if (!hasClassification && streamingLinks.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Classification and streaming"
      className="flex flex-col gap-5 rounded-xl border border-border bg-card/40 p-4 sm:p-5"
    >
      {media.status ? (
        <TaxonomySection label="Status">
          <div className={TAXONOMY_CHIP_ROW_CLASS}>
            <StatusBadge status={media.status} className={TAXONOMY_CHIP_CLASS} />
          </div>
        </TaxonomySection>
      ) : null}

      {genres.length > 0 ? (
        <TaxonomySection label="Genres">
          <div className={TAXONOMY_CHIP_ROW_CLASS}>
            {genres.map((genre) => (
              <Badge key={genre} variant="secondary" className={TAXONOMY_CHIP_CLASS}>
                {genre}
              </Badge>
            ))}
          </div>
        </TaxonomySection>
      ) : null}

      {tags.length > 0 ? (
        <TaxonomySection label="Tags">
          <DetailTaxonomyTags tags={tags} />
        </TaxonomySection>
      ) : null}

      {streamingLinks.length > 0 ? (
        <>
          {hasClassification ? <Separator /> : null}
          <StreamingLinksGrid links={streamingLinks} />
        </>
      ) : null}
    </section>
  );
}
