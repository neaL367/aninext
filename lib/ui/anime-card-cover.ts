/** One cover height at every breakpoint so cards align in each row. */
export const ANIME_CARD_COVER_CLASS =
  "relative block h-64 min-h-64 w-full shrink-0 overflow-hidden bg-muted";

/** Taller cover for browse listing grids. */
export const ANIME_BROWSE_CARD_COVER_CLASS =
  "relative block h-72 min-h-72 w-full shrink-0 overflow-hidden bg-muted";

export const ANIME_CARD_COMPACT_COVER_CLASS =
  "relative block h-44 min-h-44 w-full shrink-0 overflow-hidden bg-muted";

export const ANIME_CARD_COVER_IMAGE_CLASS = "object-cover object-top";

/** Legibility scrims — dark localized fades; no full white wash in light mode. */
export const ANIME_CARD_COVER_GRADIENT_TOP_CLASS =
  "pointer-events-none absolute inset-x-0 top-0 z-[1] h-[36%] bg-linear-to-b from-black/45 via-black/12 to-transparent";

export const ANIME_CARD_COVER_GRADIENT_BOTTOM_CLASS =
  "pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[30%] bg-linear-to-t from-black/50 via-black/12 to-transparent";
