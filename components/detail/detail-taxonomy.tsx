import { DetailTaxonomyTags } from "@/components/detail/detail-taxonomy-tags";
import { StreamingService } from "@/components/shared/streaming-service";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ReactNode } from "react";
import type { MediaDetail } from "@/lib/anilist/types";

type DetailTaxonomyProps = {
  media: MediaDetail;
  streamingLinks: { site: string; url: string }[];
};

type TaxonomyRowProps = {
  label: string;
  children: ReactNode;
};

function TaxonomyRow({ label, children }: TaxonomyRowProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
      <p className="shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:w-24 sm:pt-1.5">
        {label}
      </p>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export function DetailTaxonomy({ media, streamingLinks }: DetailTaxonomyProps) {
  const genres = media.genres?.filter(Boolean) ?? [];
  const tags =
    media.tags
      ?.filter((tag): tag is NonNullable<typeof tag> & { name: string } =>
        Boolean(tag?.name)
      )
      .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99)) ?? [];

  if (
    !media.status &&
    genres.length === 0 &&
    tags.length === 0 &&
    streamingLinks.length === 0
  ) {
    return null;
  }

  return (
    <section
      aria-label="Classification and streaming"
      className="flex flex-col gap-4 rounded-xl border border-border bg-card/40 p-4 sm:gap-5 sm:p-5"
    >
      {media.status ? (
        <TaxonomyRow label="Status">
          <StatusBadge status={media.status} />
        </TaxonomyRow>
      ) : null}

      {genres.length > 0 ? (
        <TaxonomyRow label="Genres">
          <div className="flex flex-wrap gap-1.5">
            {genres.map((genre) => (
              <Badge key={genre} variant="secondary" className="font-normal">
                {genre}
              </Badge>
            ))}
          </div>
        </TaxonomyRow>
      ) : null}

      {tags.length > 0 ? (
        <TaxonomyRow label="Tags">
          <DetailTaxonomyTags tags={tags} />
        </TaxonomyRow>
      ) : null}

      {streamingLinks.length > 0 ? (
        <>
          {media.status || genres.length > 0 || tags.length > 0 ? (
            <Separator />
          ) : null}
          <TaxonomyRow label="Watch on">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {streamingLinks.map((link) => (
                <StreamingService
                  key={`${link.site}-${link.url}`}
                  site={link.site}
                  url={link.url}
                  variant="pill"
                />
              ))}
            </div>
          </TaxonomyRow>
        </>
      ) : null}
    </section>
  );
}
