"use client";

import { ReactLenis } from "lenis/react";

const lenisOptions = {
  autoRaf: true,
  lerp: 0.12,
  smoothWheel: true,
  wheelMultiplier: 0.9,
  /** Cheaper scroll metrics on pages with hundreds of cards. */
  naiveDimensions: true,
} as const;

type LenisRootProps = {
  children: React.ReactNode;
};

export function LenisRoot({ children }: LenisRootProps) {
  return (
    <ReactLenis root options={lenisOptions}>
      {children}
    </ReactLenis>
  );
}
