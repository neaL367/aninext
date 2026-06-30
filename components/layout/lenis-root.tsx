"use client";

import {
  useEffect,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";

const lenisOptions = {
  autoRaf: true,
  lerp: 0.12,
  smoothWheel: true,
  wheelMultiplier: 0.9,
  /** Cheaper scroll metrics on pages with hundreds of cards. */
  naiveDimensions: true,
} as const;

type ReactLenisProps = {
  root?: boolean;
  options?: typeof lenisOptions;
  children: ReactNode;
};

type LenisRootProps = {
  children: ReactNode;
};

/**
 * Smooth scroll after hydration. App content stays a sibling so SSR, hydration,
 * and instant-route validation are never blocked by a client-only wrapper.
 */
export function LenisRoot({ children }: LenisRootProps) {
  const [ReactLenis, setReactLenis] = useState<ComponentType<ReactLenisProps> | null>(
    null
  );

  useEffect(() => {
    void import("lenis/react").then((mod) => {
      setReactLenis(() => mod.ReactLenis);
    });
  }, []);

  return (
    <>
      {children}
      {ReactLenis ? (
        <ReactLenis root options={lenisOptions}>
          <span hidden aria-hidden />
        </ReactLenis>
      ) : null}
    </>
  );
}
