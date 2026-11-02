import Image from "next/image";

import { cn } from "@/lib/utils";

export function MediaImage({
  src,
  alt,
  fill,
  sizes,
  className,
  priority,
  loading,
  unoptimized,
}: {
  src: string;
  alt: string;
  fill?: boolean;
  sizes?: string;
  className?: string;
  priority?: boolean;
  loading?: "lazy" | "eager";
  unoptimized?: boolean;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      priority={priority}
      loading={loading ?? (priority ? "eager" : undefined)}
      unoptimized={unoptimized}
      className={cn(className)}
    />
  );
}
