import { StreamingService } from "@/components/shared/streaming-service";

type DetailWatchLinksProps = {
  streamingLinks: { site: string; url: string }[];
};

export function DetailWatchLinks({ streamingLinks }: DetailWatchLinksProps) {
  if (!streamingLinks.length) {
    return null;
  }

  return (
    <section className="flex flex-col gap-2.5 rounded-xl border border-border bg-card/50 p-4">
      <h2 className="text-sm font-medium">Watch on</h2>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {streamingLinks.map((link) => (
          <StreamingService
            key={link.site}
            site={link.site}
            url={link.url}
          />
        ))}
      </div>
    </section>
  );
}
