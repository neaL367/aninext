import Image from "next/image";
import {
  getStreamingFaviconUrl,
  getStreamingSiteDomain,
} from "@/lib/anilist/display/streaming";
import { cn } from "@/lib/utils";

type StreamingServiceProps = {
  site: string;
  url?: string | null;
  size?: "sm" | "md";
  className?: string;
  /** When false, renders label only (avoids nested anchors inside link wrappers). */
  linked?: boolean;
  /** Pill-style chip for detail watch grid. */
  variant?: "inline" | "pill";
};

export function StreamingService({
  site,
  url,
  size = "md",
  className,
  linked = true,
  variant = "inline",
}: StreamingServiceProps) {
  const favicon = getStreamingFaviconUrl(site, url);
  const iconSize = size === "sm" ? 16 : 18;
  const isPill = variant === "pill";

  const inner = (
    <span
      className={cn(
        "inline-flex min-w-0 items-center gap-2 text-muted-foreground transition-colors",
        isPill
          ? "rounded-md border border-border/80 bg-background/90 px-3 py-1.5 text-sm shadow-sm hover:border-border hover:bg-muted/60 hover:text-foreground"
          : size === "sm"
            ? "text-xs"
            : "text-sm",
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
          className="size-4 shrink-0 rounded-sm object-contain"
          unoptimized
        />
      ) : (
        <span
          aria-hidden
          className="inline-flex size-4 shrink-0 items-center justify-center rounded-sm bg-muted text-[9px] font-semibold uppercase text-muted-foreground"
        >
          {(getStreamingSiteDomain(site, url) ?? site).charAt(0)}
        </span>
      )}
      <span className={cn("min-w-0", isPill ? "whitespace-nowrap font-medium" : "truncate")}>
        {site}
      </span>
    </span>
  );

  if (url && linked) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="min-w-0 max-w-full"
      >
        {inner}
      </a>
    );
  }

  return inner;
}
