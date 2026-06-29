import { MISSING_VALUE, stripHtml } from "@/lib/anilist/utils/format";

export function excerptSynopsis(
  description: string | null | undefined,
  maxLength = 160
): string | null {
  const text = stripHtml(description);
  if (!text || text === MISSING_VALUE) {
    return null;
  }
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

export function formatPopularityCount(
  popularity: number | null | undefined
): string | null {
  if (popularity === null || popularity === undefined) {
    return null;
  }
  return popularity.toLocaleString("en-US");
}

export function getMainStudioName(
  studios:
    | {
        nodes: ReadonlyArray<{ name: string | null } | null> | null;
      }
    | null
    | undefined
): string | null {
  const name = studios?.nodes?.find((node) => node?.name)?.name;
  return name ?? null;
}

export function getTopTags(
  tags:
    | ReadonlyArray<{ name: string | null; rank: number | null } | null>
    | null
    | undefined,
  limit = 3
): string[] {
  if (!tags?.length) {
    return [];
  }

  return [...tags]
    .filter((tag): tag is { name: string; rank: number | null } =>
      Boolean(tag?.name)
    )
    .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99))
    .slice(0, limit)
    .map((tag) => tag.name);
}

export function formatCountdownShort(seconds: number): string {
  if (seconds <= 0) {
    return "Airing now";
  }
  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3_600);
  const minutes = Math.floor((seconds % 3_600) / 60);
  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
