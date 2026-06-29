const inflight = new Map<string, Promise<unknown>>();

/** Share one in-flight Promise for identical request keys within a process. */
export function dedupeRequest<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const existing = inflight.get(key);
  if (existing) {
    return existing as Promise<T>;
  }

  const promise = fn().finally(() => {
    inflight.delete(key);
  });
  inflight.set(key, promise);
  return promise;
}

export function buildRequestKey(query: string, variables: unknown): string {
  return `${query}::${JSON.stringify(variables ?? {})}`;
}
