export type AniListErrorCode =
  | "rate_limit"
  | "graphql"
  | "network"
  | "not_found"
  | "validation";

export class AniListError extends Error {
  readonly code: AniListErrorCode;
  readonly cause?: unknown;
  readonly retryAfterMs?: number;

  constructor(
    code: AniListErrorCode,
    message: string,
    cause?: unknown,
    retryAfterMs?: number
  ) {
    super(message);
    this.name = "AniListError";
    this.code = code;
    this.cause = cause;
    this.retryAfterMs = retryAfterMs;
  }
}

export function isAniListError(error: unknown): error is AniListError {
  return error instanceof AniListError;
}
