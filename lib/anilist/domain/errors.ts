export type AniListErrorCode = "rate_limit" | "graphql" | "network" | "not_found" | "validation";

export class AniListError extends Error {
  readonly code: AniListErrorCode;
  readonly cause?: unknown;
  readonly retryAfterMs?: number;
  /** True when the proactive rate-limit gate refused to send (no HTTP round-trip). */
  readonly proactiveGate?: boolean;

  constructor(
    code: AniListErrorCode,
    message: string,
    cause?: unknown,
    retryAfterMs?: number,
    proactiveGate?: boolean,
  ) {
    super(message);
    this.name = "AniListError";
    this.code = code;
    this.cause = cause;
    this.retryAfterMs = retryAfterMs;
    this.proactiveGate = proactiveGate;
  }
}

export function isAniListError(error: unknown): error is AniListError {
  return error instanceof AniListError;
}

export function isAniListRateLimitError(error: unknown): error is AniListError {
  return isAniListError(error) && error.code === "rate_limit";
}
