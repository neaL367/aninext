import {
  MAX_CONCURRENT_BACKGROUND_REQUESTS,
  MAX_CONCURRENT_INTERACTIVE_REQUESTS,
} from "./constants";

export type ConcurrencyLane = "interactive" | "background";

type LaneState = {
  active: number;
  waiting: Array<() => void>;
  max: number;
};

const lanes: Record<ConcurrencyLane, LaneState> = {
  interactive: {
    active: 0,
    waiting: [],
    max: MAX_CONCURRENT_INTERACTIVE_REQUESTS,
  },
  background: {
    active: 0,
    waiting: [],
    max: MAX_CONCURRENT_BACKGROUND_REQUESTS,
  },
};

async function acquire(lane: ConcurrencyLane): Promise<void> {
  const state = lanes[lane];

  if (state.active < state.max) {
    state.active++;
    return;
  }

  await new Promise<void>((resolve) => {
    state.waiting.push(() => {
      state.active++;
      resolve();
    });
  });
}

function release(lane: ConcurrencyLane): void {
  const state = lanes[lane];
  state.active--;
  const next = state.waiting.shift();
  if (next) {
    next();
  }
}

/** Limits in-flight AniList HTTP requests per lane to avoid starving browse/search. */
export async function withConcurrencyLimit<T>(
  fn: () => Promise<T>,
  lane: ConcurrencyLane = "background",
): Promise<T> {
  await acquire(lane);
  try {
    return await fn();
  } finally {
    release(lane);
  }
}
