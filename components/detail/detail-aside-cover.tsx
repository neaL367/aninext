import { ProgressiveImage } from "@/components/shared/progressive-image";

type DetailAsideCoverProps = {
  alt: string;
  sources: readonly string[];
  backgroundColor?: string | null;
  sizes?: string;
  priority?: boolean;
};

export function DetailAsideCover({
  alt,
  sources,
  backgroundColor,
  sizes = "(max-width: 1024px) 240px, 260px",
  priority = true,
}: DetailAsideCoverProps) {
  return (
    <div
      className="relative mx-auto aspect-[2/3] w-full max-w-[13rem] overflow-hidden rounded-xl border border-border shadow-lg ring-1 ring-border/60 sm:max-w-[15rem] lg:mx-0 lg:max-w-none"
      style={{ backgroundColor: backgroundColor ?? "var(--muted)" }}
    >
      {sources.length ? (
        <ProgressiveImage
          sources={[...sources]}
          alt={alt}
          fill
          className="object-cover"
          sizes={sizes}
          priority={priority}
        />
      ) : null}
    </div>
  );
}
