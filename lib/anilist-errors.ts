export type AniListErrorKind = "rate_limited" | "outage" | "graphql" | "network" | "circuit_open";

export class AniListError extends Error {
  constructor(
    message: string,
    public kind: AniListErrorKind,
    public retryAfterSeconds?: number,
    public status?: number,
  ) {
    super(message);
    this.name = "AniListError";
  }
}
