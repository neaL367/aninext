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
}: {
  src: string;
  alt: string;
  fill?: boolean;
  sizes?: string;
  className?: string;
  priority?: boolean;
  loading?: "lazy" | "eager";
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      priority={priority}
      loading={loading ?? (priority ? "eager" : undefined)}
      className={cn(className)}
    />
  );
}
