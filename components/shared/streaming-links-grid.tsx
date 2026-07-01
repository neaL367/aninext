import { StreamingService } from "@/components/shared/streaming-service";
import { TAXONOMY_SECTION_LABEL_CLASS } from "@/lib/styles/taxonomy-chips";
import { cn } from "@/lib/utils";

export type StreamingLink = {
  site: string;
  url: string;
};

type StreamingLinksGridProps = {
  links: StreamingLink[];
  label?: string;
  limit?: number;
  size?: "sm" | "md";
  className?: string;
  /** Hide the section label (when a parent already provides one). */
  showLabel?: boolean;
};

export function StreamingLinksGrid({
  links,
  label = "Watch on",
  limit,
  size = "md",
  className,
  showLabel = true,
}: StreamingLinksGridProps) {
  const visible = limit ? links.slice(0, limit) : links;

  if (!visible.length) {
    return null;
  }

  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      {showLabel ? <p className={TAXONOMY_SECTION_LABEL_CLASS}>{label}</p> : null}
      <div className="flex flex-wrap gap-2">
        {visible.map((link) => (
          <StreamingService
            key={`${link.site}-${link.url}`}
            site={link.site}
            url={link.url}
            size={size}
            variant="pill"
            className="max-w-full shrink-0"
          />
        ))}
      </div>
    </div>
  );
}
