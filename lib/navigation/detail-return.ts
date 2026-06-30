import { readScrollY } from "@/lib/navigation/scroll-restore";

const DETAIL_RETURN_KEY = "aninext:detail-return";
const DETAIL_CURRENT_KEY = "aninext:detail-current";

export type DetailReturn = {
  href: string;
  label: string;
  scrollY?: number;
};

export type DetailBreadcrumbCrumb = {
  href?: string;
  label: string;
  scrollY?: number;
  /** Use browser back when returning one step (preserves scroll via history). */
  preferHistoryBack?: boolean;
};

const DETAIL_PATH = /^\/anime\/\d+$/;

export function isHomeReturn(detailReturn: DetailReturn): boolean {
  const pathname = detailReturn.href.split("?")[0];
  return pathname === "/" || detailReturn.label === "Home";
}

/** Builds Home → parent → current crumbs without duplicate Home segments. */
export function buildDetailBreadcrumbs(
  title: string,
  detailReturn: DetailReturn | null
): DetailBreadcrumbCrumb[] {
  const crumbs: DetailBreadcrumbCrumb[] = [
    {
      href: "/",
      label: "Home",
      scrollY:
        detailReturn && isHomeReturn(detailReturn)
          ? detailReturn.scrollY
          : undefined,
    },
  ];

  if (detailReturn && !isHomeReturn(detailReturn)) {
    crumbs.push({
      href: detailReturn.href,
      label: detailReturn.label,
      scrollY: detailReturn.scrollY,
      preferHistoryBack: true,
    });
  } else if (!detailReturn) {
    crumbs.push({ href: "/anime", label: "Anime" });
  }

  crumbs.push({ label: title });
  return crumbs;
}

export function isDetailPath(pathname: string): boolean {
  return DETAIL_PATH.test(pathname);
}

export function getDetailReturnLabel(pathname: string): string {
  if (pathname === "/") return "Home";
  if (pathname === "/airing") return "Airing";
  if (pathname === "/anime") return "Anime";
  if (isDetailPath(pathname)) return "Previous";
  return "Back";
}

export function saveDetailReturn(
  pathname: string,
  search: string,
  options?: { label?: string }
): void {
  if (typeof window === "undefined") return;

  const href = search ? `${pathname}?${search}` : pathname;
  const payload: DetailReturn = {
    href,
    label: options?.label ?? getDetailReturnLabel(pathname),
    scrollY: readScrollY(),
  };

  sessionStorage.setItem(DETAIL_RETURN_KEY, JSON.stringify(payload));
}

export function readDetailReturn(): DetailReturn | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(DETAIL_RETURN_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DetailReturn;
  } catch {
    return null;
  }
}

export function saveDetailCurrent(mediaId: number, title: string): void {
  if (typeof window === "undefined") return;

  const payload: DetailReturn = {
    href: `/anime/${mediaId}`,
    label: title,
  };

  sessionStorage.setItem(DETAIL_CURRENT_KEY, JSON.stringify(payload));
}

export function readDetailCurrent(): DetailReturn | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(DETAIL_CURRENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DetailReturn;
  } catch {
    return null;
  }
}

/** Call before navigating to another title from a detail page. */
export function saveDetailReturnFromCurrentPage(
  pathname: string,
  search: string
): void {
  if (isDetailPath(pathname)) {
    const current = readDetailCurrent();
    if (current) {
      saveDetailReturn(current.href, search, { label: current.label });
      return;
    }
  }

  saveDetailReturn(pathname, search);
}
