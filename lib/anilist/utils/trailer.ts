type MediaTrailer = {
  id: string | null;
  site: string | null;
} | null | undefined;

export function getTrailerEmbedUrl(trailer: MediaTrailer): string | null {
  if (!trailer?.id) {
    return null;
  }

  const site = trailer.site?.toLowerCase() ?? "";

  if (site === "youtube") {
    return `https://www.youtube-nocookie.com/embed/${trailer.id}`;
  }

  if (site === "dailymotion") {
    return `https://www.dailymotion.com/embed/video/${trailer.id}`;
  }

  return null;
}

export function getTrailerWatchUrl(trailer: MediaTrailer): string | null {
  if (!trailer?.id) {
    return null;
  }

  const site = trailer.site?.toLowerCase() ?? "";

  if (site === "youtube") {
    return `https://www.youtube.com/watch?v=${trailer.id}`;
  }

  if (site === "dailymotion") {
    return `https://www.dailymotion.com/video/${trailer.id}`;
  }

  return null;
}

export function getTrailerSiteLabel(trailer: MediaTrailer): string {
  if (!trailer?.site) {
    return "Trailer";
  }
  return trailer.site.charAt(0).toUpperCase() + trailer.site.slice(1).toLowerCase();
}
