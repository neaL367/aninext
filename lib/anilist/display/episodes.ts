import type { MediaDetail } from "@/lib/anilist/domain/types";
import { formatLocalDateTime } from "@/lib/anilist/display/datetime";
import { MISSING_VALUE } from "@/lib/anilist/display/format";

export type EpisodeCardData = {
  episode: number;
  title: string;
  airDate: string | null;
  runtime: string | null;
  thumbnail: string | null;
  url: string | null;
  site: string | null;
  isFiller: boolean;
  isRecap: boolean;
};

function detectFillerRecap(title: string): { isFiller: boolean; isRecap: boolean } {
  const lower = title.toLowerCase();
  return {
    isFiller: lower.includes("filler"),
    isRecap: lower.includes("recap") || lower.includes("summary"),
  };
}

function normalizeEpisodeTitle(
  rawTitle: string | undefined,
  episodeNum: number,
  mediaTitle: string,
): string {
  const title = rawTitle?.trim();
  if (!title) return `Episode ${episodeNum}`;

  const lowerTitle = title.toLowerCase();
  const lowerMedia = mediaTitle.toLowerCase();
  if (lowerTitle === lowerMedia || lowerTitle.startsWith(lowerMedia)) {
    return `Episode ${episodeNum}`;
  }

  return title;
}

function getEpisodeThumbnailFallback(media: MediaDetail): string | null {
  return media.bannerImage ?? media.coverImage?.large ?? media.coverImage?.medium ?? null;
}

export function buildEpisodeCards(media: MediaDetail): EpisodeCardData[] {
  const runtime = media.duration ? `${media.duration} min` : null;
  const thumbnailFallback = getEpisodeThumbnailFallback(media);
  const mediaTitle = media.title?.english ?? media.title?.romaji ?? "";
  const airingByEpisode = new Map<number, number>();

  for (const node of media.airingSchedule?.nodes ?? []) {
    if (!node?.episode || !node.airingAt) continue;
    airingByEpisode.set(node.episode, node.airingAt);
  }

  const streaming = (media.streamingEpisodes ?? []).filter(Boolean);

  if (streaming.length) {
    return streaming.map((ep, index) => {
      const episodeNum = index + 1;
      const title = normalizeEpisodeTitle(ep?.title ?? undefined, episodeNum, mediaTitle);
      const airingAt = airingByEpisode.get(episodeNum);
      const flags = detectFillerRecap(title);

      return {
        episode: episodeNum,
        title,
        airDate: airingAt ? formatLocalDateTime(airingAt) : null,
        runtime,
        thumbnail: ep?.thumbnail ?? thumbnailFallback,
        url: ep?.url ?? null,
        site: ep?.site ?? null,
        isFiller: flags.isFiller,
        isRecap: flags.isRecap,
      };
    });
  }

  const scheduleNodes = (media.airingSchedule?.nodes ?? [])
    .filter((n): n is NonNullable<typeof n> => Boolean(n?.episode))
    .sort((a, b) => (a.episode ?? 0) - (b.episode ?? 0));

  if (scheduleNodes.length) {
    return scheduleNodes.map((node) => ({
      episode: node.episode!,
      title: `Episode ${node.episode}`,
      airDate: node.airingAt ? formatLocalDateTime(node.airingAt) : null,
      runtime,
      thumbnail: thumbnailFallback,
      url: null,
      site: null,
      isFiller: false,
      isRecap: false,
    }));
  }

  if (media.episodes && media.episodes > 0) {
    return Array.from({ length: Math.min(media.episodes, 24) }, (_, i) => ({
      episode: i + 1,
      title: `Episode ${i + 1}`,
      airDate: null,
      runtime,
      thumbnail: thumbnailFallback,
      url: null,
      site: null,
      isFiller: false,
      isRecap: false,
    }));
  }

  return [];
}

export function formatEpisodeAirDate(value: string | null): string {
  return value ?? MISSING_VALUE;
}
