"use client";

import Image from "next/image";
import { useState } from "react";

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
  "use memo";
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      priority={priority}
      loading={loading ?? (priority ? "eager" : undefined)}
      unoptimized={unoptimized}
      onLoad={() => setIsLoaded(true)}
      className={cn(
        "transition-opacity duration-500 ease-out",
        isLoaded ? "opacity-100" : "opacity-0",
        className,
      )}
    />
  );
}
