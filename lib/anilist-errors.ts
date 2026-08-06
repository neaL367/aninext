export class AniListError extends Error {
  constructor(
    message: string,
    public kind: "rate_limited" | "outage" | "graphql" | "network",
    public retryAfterSeconds?: number
  ) {
    super(message);
  }
}
