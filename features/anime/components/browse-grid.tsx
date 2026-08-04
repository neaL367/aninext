"use client";

import type { ReactNode } from "react";

export function BrowseGrid({ children }: { children: ReactNode }) {
  return (
    <div
      className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
      role="list"
      aria-label="Anime results"
    >
      {children}
    </div>
  );
}
