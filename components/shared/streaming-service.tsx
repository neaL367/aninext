import Image from "next/image";
import { getStreamingFaviconUrl } from "@/lib/anilist/utils/streaming";
import { cn } from "@/lib/utils";

type StreamingServiceProps = {
  site: string;
  url?: string | null;
  size?: "sm" | "md";
  className?: string;
  /** When false, renders label only (avoids nested anchors inside link wrappers). */
  linked?: boolean;
};

export function StreamingService({
  site,
  url,
  size = "md",
  className,
  linked = true,
}: StreamingServiceProps) {
  const favicon = getStreamingFaviconUrl(site);
  const iconSize = size === "sm" ? 14 : 16;

  const inner = (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-muted-foreground",
        size === "sm" ? "text-xs" : "text-sm",
        url && "hover:text-foreground",
        className
      )}
    >
      {favicon ? (
        <Image
          src={favicon}
          alt=""
          width={iconSize}
          height={iconSize}
          className="rounded-sm"
          unoptimized
        />
      ) : (
        <span
          aria-hidden
          className="inline-flex size-3.5 items-center justify-center rounded-sm border border-border text-[9px] font-medium"
        >
          {site.charAt(0)}
        </span>
      )}
      <span>{site}</span>
    </span>
  );

  if (url && linked) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }

  return inner;
}
