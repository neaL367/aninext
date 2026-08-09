"use client";

import { useSyncExternalStore, useCallback } from "react";

let now = Date.now() / 1000;
let listeners: Array<() => void> = [];
let intervalId: ReturnType<typeof setInterval> | null = null;

function subscribe(callback: () => void) {
  listeners = [...listeners, callback];

  if (!intervalId) {
    intervalId = setInterval(() => {
      now = Date.now() / 1000;
      listeners.forEach((l) => l());
    }, 30_000);
  }

  return () => {
    listeners = listeners.filter((l) => l !== callback);
    if (listeners.length === 0 && intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
}

function getSnapshot() {
  return now;
}

/**
 * Returns the current time in seconds, updating every 30 seconds.
 * Uses useSyncExternalStore - no useEffect needed.
 */
export function useNow() {
  return useSyncExternalStore(subscribe, getSnapshot, () => Date.now() / 1000);
}

/**
 * Returns a function that computes the current time on call.
 * Useful for event handlers or derived computations.
 */
export function useGetNow() {
  const subscribe = useCallback((callback: () => void) => {
    listeners = [...listeners, callback];
    if (!intervalId) {
      intervalId = setInterval(() => {
        now = Date.now() / 1000;
        listeners.forEach((l) => l());
      }, 30_000);
    }
    return () => {
      listeners = listeners.filter((l) => l !== callback);
      if (listeners.length === 0 && intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, () => Date.now() / 1000);
}
