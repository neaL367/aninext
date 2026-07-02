import { buildAnimeBrowseHref } from "@/lib/browse/url";
import { parseAnimeListParams } from "@/lib/browse/params";
import { normalizeHrefForScrollRestore } from "@/lib/navigation/scroll-restore";

/** Canonical `/anime` href so `?sort=` and default sort match on restore. */
export function normalizeBrowseHrefForRestore(href: string): string {
  const [pathname, search = ""] = href.split("?");
  if (pathname !== "/anime") {
    return normalizeHrefForScrollRestore(href);
  }

  const searchParams = Object.fromEntries(new URLSearchParams(search));
  const params = parseAnimeListParams(searchParams);
  return normalizeHrefForScrollRestore(buildAnimeBrowseHref(params));
}
