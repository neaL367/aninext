const STREAMING_DOMAINS: Record<string, string> = {
  Crunchyroll: "crunchyroll.com",
  Netflix: "netflix.com",
  Hulu: "hulu.com",
  "Amazon Prime Video": "primevideo.com",
  "Disney Plus": "disneyplus.com",
  "Disney+": "disneyplus.com",
  Funimation: "funimation.com",
  HIDIVE: "hidive.com",
  Bilibili: "bilibili.com",
  YouTube: "youtube.com",
  "Anime Digital Network": "animedigitalnetwork.fr",
  Wakanim: "wakanim.tv",
  Retrocrush: "retrocrush.tv",
  Tubi: "tubitv.com",
  "HBO Max": "max.com",
  Peacock: "peacocktv.com",
};

export function getStreamingSiteDomain(site: string): string | null {
  if (STREAMING_DOMAINS[site]) {
    return STREAMING_DOMAINS[site];
  }

  const normalized = site.toLowerCase().replace(/[^a-z0-9]/g, "");
  const match = Object.entries(STREAMING_DOMAINS).find(([name]) =>
    name.toLowerCase().replace(/[^a-z0-9]/g, "").includes(normalized)
  );
  return match?.[1] ?? null;
}

export function getStreamingFaviconUrl(site: string): string | null {
  const domain = getStreamingSiteDomain(site);
  if (!domain) return null;
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
}

export function isStreamingLink(
  type: string | null | undefined,
  site: string | null | undefined
): boolean {
  if (type === "STREAMING") return true;
  if (!site) return false;
  return Boolean(getStreamingSiteDomain(site));
}

export function getStreamingLinks(
  externalLinks:
    | readonly ({
        site: string | null;
        url: string | null;
        type?: string | null;
      } | null)[]
    | null
    | undefined
): { site: string; url: string }[] {
  if (!externalLinks?.length) return [];

  const seen = new Set<string>();
  const links: { site: string; url: string }[] = [];

  for (const link of externalLinks) {
    if (!link?.site || !link.url) continue;
    if (!isStreamingLink(link.type ?? null, link.site)) continue;
    if (seen.has(link.site)) continue;
    seen.add(link.site);
    links.push({ site: link.site, url: link.url });
  }

  return links;
}
