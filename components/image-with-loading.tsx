"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function ImageWithLoading({
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
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (ref.current?.complete) setLoaded(true);
  }, []);

  return (
    <Image
      ref={ref}
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      priority={priority}
      loading={loading ?? (priority ? "eager" : undefined)}
      onLoad={() => setLoaded(true)}
      className={cn(
        "transition-opacity duration-300",
        loaded ? "opacity-100" : "opacity-0",
        className
      )}
    />
  );
}
