type ScrollApplyOptions = {
  immediate?: boolean;
  /** Seconds — short duration for scroll-to-top without Lenis lerp heaviness. */
  duration?: number;
};

type ScrollController = {
  scrollTo: (target: number, options?: ScrollApplyOptions) => void;
  getScrollY: () => number;
  resize?: () => void;
};

let scrollController: ScrollController | null = null;
const pendingImmediateScrolls: number[] = [];

export function registerScrollController(controller: ScrollController | null): void {
  scrollController = controller;

  if (!controller) {
    return;
  }

  while (pendingImmediateScrolls.length > 0) {
    const target = pendingImmediateScrolls.shift();
    if (target != null) {
      controller.scrollTo(target, { immediate: true });
    }
  }
}

export function readAppliedScrollY(): number {
  if (typeof window === "undefined") {
    return 0;
  }

  if (scrollController) {
    return Math.max(0, Math.round(scrollController.getScrollY()));
  }

  return Math.max(0, Math.round(window.scrollY));
}

export function scrollToY(target: number, options?: ScrollApplyOptions): void {
  if (typeof window === "undefined") {
    return;
  }

  const top = Math.max(0, Math.round(target));

  if (scrollController) {
    scrollController.scrollTo(top, options);
    return;
  }

  if (options?.immediate) {
    pendingImmediateScrolls.push(top);
  }

  window.scrollTo({ top, left: 0, behavior: "instant" });
}

/** Quick snap to top — not the long Lenis wheel lerp. */
export function scrollToTop(): void {
  scrollToY(0, { duration: 0.35 });
}

export function resizeScrollMetrics(): void {
  scrollController?.resize?.();
}
