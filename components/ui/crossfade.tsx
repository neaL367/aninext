import { ViewTransition } from "react";

/**
 * Minimal page crossfade — a plain opacity fade with no directional movement.
 * Wrap page-level content so navigations stay subtle instead of sliding.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page-fade-in" exit="page-fade-out" default="none">
      {children}
    </ViewTransition>
  );
}

/**
 * Same-place, different-content crossfade. Pair with a `key` that changes when
 * the content swaps (e.g. the selected airing day) so the old and new content
 * crossfade instead of animating in place.
 */
export function Crossfade({
  children,
  name = "content-swap",
}: {
  children: React.ReactNode;
  name?: string;
}) {
  return (
    <ViewTransition name={name} share="auto" enter="auto" default="none">
      {children}
    </ViewTransition>
  );
}
