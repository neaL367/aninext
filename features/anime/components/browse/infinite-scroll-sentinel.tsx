"use client";

import { useEffect, useRef } from "react";

import { Spinner } from "@/components/ui/spinner";

export function InfiniteScrollSentinel({
  onLoadMore,
  isLoading,
}: {
  onLoadMore: () => void;
  isLoading: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onLoadMore);

  useEffect(() => {
    callbackRef.current = onLoadMore;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          callbackRef.current();
        }
      },
      { rootMargin: "600px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isLoading]);

  return (
    <div
      ref={ref}
      className="flex items-center justify-center border-t border-border-soft py-8"
      aria-label="Load more anime"
    >
      {isLoading && <Spinner className="size-5" />}
    </div>
  );
}
