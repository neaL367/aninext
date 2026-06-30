const STREAMING_DOMAINS: Record<string, string> = {
  Crunchyroll: "crunchyroll.com",
  Netflix: "netflix.com",
  Hulu: "hulu.com",
  "Amazon Prime Video": "primevideo.com",
  "Prime Video": "primevideo.com",
  "Disney Plus": "disneyplus.com",
  "Disney+": "disneyplus.com",
  Funimation: "funimation.com",
  HIDIVE: "hidive.com",
  Hidive: "hidive.com",
  Bilibili: "bilibili.com",
  "Bilibili TV": "bilibili.tv",
  bilibili: "bilibili.com",
  iQiyi: "iq.com",
  iQIYI: "iq.com",
  IQIYI: "iq.com",
  iQ: "iq.com",
  IQ: "iq.com",
  Youku: "youku.com",
  QQ: "v.qq.com",
  YouTube: "youtube.com",
  Youtube: "youtube.com",
  "Anime Digital Network": "animedigitalnetwork.fr",
  Wakanim: "wakanim.tv",
  Retrocrush: "retrocrush.tv",
  Tubi: "tubitv.com",
  "HBO Max": "max.com",
  Max: "max.com",
  Peacock: "peacocktv.com",
  Animax: "animax.co.jp",
  AniOne: "anione.tv",
  AniPlus: "ani.plus",
  Bahamut: "ani.gamer.com.tw",
  "Bahamut Anime Crazy": "ani.gamer.com.tw",
  Abema: "abema.tv",
  "Abema TV": "abema.tv",
  Niconico: "nicovideo.jp",
  "Nico Nico Seiga": "nicovideo.jp",
  Viewster: "viewster.com",
  Viz: "viz.com",
  Animelab: "animelab.com",
  Animenetwork: "animenetwork.com",
  "Anime Network": "animenetwork.com",
  "Tencent Video": "v.qq.com",
  WeTV: "wetv.vip",
};

const STREAMING_HOST_SUFFIXES = [
  "crunchyroll.com",
  "netflix.com",
  "hulu.com",
  "primevideo.com",
  "amazon.com",
  "disneyplus.com",
  "funimation.com",
  "hidive.com",
  "bilibili.com",
  "bilibili.tv",
  "iq.com",
  "iqiyi.com",
  "youku.com",
  "v.qq.com",
  "qq.com",
  "youtube.com",
  "youtu.be",
  "wakanim.tv",
  "retrocrush.tv",
  "tubitv.com",
  "max.com",
  "peacocktv.com",
  "ani.gamer.com.tw",
  "abema.tv",
  "nicovideo.jp",
  "animelab.com",
  "wetv.vip",
  "viewster.com",
  "viz.com",
] as const;

function normalizeSiteKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getDomainFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const hostname = new URL(url).hostname.replace(/^www\./i, "").toLowerCase();
    return hostname || null;
  } catch {
    return null;
  }
}

function hostnameIsStreaming(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return STREAMING_HOST_SUFFIXES.some(
    (suffix) => host === suffix || host.endsWith(`.${suffix}`)
  );
}

export function getStreamingSiteDomain(
  site: string,
  url?: string | null
): string | null {
  if (STREAMING_DOMAINS[site]) {
    return STREAMING_DOMAINS[site];
  }

  const fromUrl = getDomainFromUrl(url);
  if (fromUrl && hostnameIsStreaming(fromUrl)) {
    return fromUrl;
  }

  const normalized = normalizeSiteKey(site);
  if (!normalized) return fromUrl;

  const match = Object.entries(STREAMING_DOMAINS).find(([name]) =>
    normalizeSiteKey(name).includes(normalized)
  );
  if (match) return match[1];

  const reverseMatch = Object.entries(STREAMING_DOMAINS).find(([name]) =>
    normalized.includes(normalizeSiteKey(name))
  );
  if (reverseMatch) return reverseMatch[1];

  return fromUrl;
}

export function getStreamingFaviconUrl(
  site: string,
  url?: string | null
): string | null {
  const domain = getStreamingSiteDomain(site, url);
  if (!domain) return null;
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`;
}

export function isStreamingLink(
  type: string | null | undefined,
  site: string | null | undefined,
  url?: string | null
): boolean {
  if (type === "STREAMING") return true;
  if (!site && !url) return false;

  if (site && getStreamingSiteDomain(site, url)) {
    const domain = getStreamingSiteDomain(site, url);
    if (domain && hostnameIsStreaming(domain)) return true;
    if (STREAMING_DOMAINS[site]) return true;
  }

  const fromUrl = getDomainFromUrl(url);
  return fromUrl ? hostnameIsStreaming(fromUrl) : false;
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
    if (!link?.url) continue;
    const site = link.site?.trim() || "Official site";
    if (!isStreamingLink(link.type ?? null, link.site, link.url)) continue;

    const key = `${site}:${link.url}`;
    if (seen.has(key)) continue;
    seen.add(key);
    links.push({ site, url: link.url });
  }

  return links;
}
