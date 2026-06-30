"use client";

import Image from "next/image";
import { useEffect, useState, type ComponentProps } from "react";
import { isAnilistCdnUrl } from "@/lib/anilist/display/image-urls";
import { cn } from "@/lib/utils";

type ProgressiveImageProps = {
  sources: readonly string[];
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  /** Above-the-fold / LCP candidate — maps to eager load + high fetch priority. */
  priority?: boolean;
  loading?: "lazy" | "eager";
  className?: string;
};

function getLoadProps(
  isLcp: boolean,
  loading: "lazy" | "eager"
): Pick<ComponentProps<typeof Image>, "loading" | "fetchPriority"> {
  if (isLcp) {
    return { loading: "eager", fetchPriority: "high" };
  }

  return { loading };
}

export function ProgressiveImage({
  sources,
  alt,
  fill = false,
  width,
  height,
  sizes,
  priority = false,
  loading = "lazy",
  className,
}: ProgressiveImageProps) {
  const validSources = sources.filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(0);

  const canProgress =
    validSources.length > 1 && isAnilistCdnUrl(validSources[0] ?? null);

  useEffect(() => {
    if (!canProgress || activeIndex >= validSources.length - 1) {
      return;
    }

    const nextSrc = validSources[activeIndex + 1];
    if (!nextSrc) return;

    const img = new window.Image();
    img.onload = () => {
      setActiveIndex((index) => index + 1);
    };
    img.src = nextSrc;

    return () => {
      img.onload = null;
    };
  }, [activeIndex, canProgress, validSources]);

  if (!validSources.length) {
    return null;
  }

  if (!canProgress) {
    return (
      <Image
        src={validSources[0]!}
        alt={alt}
        fill={fill}
        width={width}
        height={height}
        sizes={sizes}
        className={className}
        {...getLoadProps(priority, loading)}
      />
    );
  }

  return (
    <>
      {validSources.slice(0, activeIndex + 1).map((src, index) => (
        <Image
          key={src}
          src={src}
          alt={index === activeIndex ? alt : ""}
          fill={fill}
          width={width}
          height={height}
          sizes={sizes}
          className={cn(
            className,
            "transition-opacity duration-300",
            index < activeIndex && "pointer-events-none opacity-0"
          )}
          {...getLoadProps(priority && index === 0, loading)}
        />
      ))}
    </>
  );
}
