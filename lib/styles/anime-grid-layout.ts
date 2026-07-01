/** Max 6 columns (xl) — home carousels. */
export const ANIME_GRID_CLASS =
  "grid grid-cols-2 items-stretch gap-2 sm:grid-cols-4 sm:gap-2.5 md:grid-cols-4 lg:grid-cols-5 lg:gap-3 xl:grid-cols-6";

/** Browse listing — six columns at xl; roomier gaps than home carousels. */
export const ANIME_BROWSE_GRID_CLASS =
  "grid grid-cols-2 items-stretch gap-x-3 gap-y-5 sm:grid-cols-4 sm:gap-x-3 sm:gap-y-5 md:grid-cols-4 lg:grid-cols-5 lg:gap-x-4 lg:gap-y-6 xl:grid-cols-6 xl:gap-x-4 xl:gap-y-6";

export const ANIME_GRID_CELL_CLASS =
  "anime-grid-cell flex h-full min-w-0 flex-col contain-[layout_paint]";

export const ANIME_BROWSE_GRID_CELL_CLASS =
  "anime-grid-cell anime-browse-grid-cell flex h-full min-w-0 flex-col contain-[layout_paint]";

export const ANIME_CARD_ROOT_CLASS =
  "flex h-full flex-col overflow-hidden rounded-md border border-border/70 bg-card";

export const ANIME_CARD_LINK_CLASS = "flex h-full flex-col";

export const ANIME_CARD_BODY_CLASS = "flex flex-col gap-1 px-2.5 pb-2.5 pt-1.5";

/** Slightly roomier text block for browse grids. */
export const ANIME_BROWSE_CARD_BODY_CLASS = "flex flex-col gap-1.5 px-3 pb-3 pt-2";

export const ANIME_CARD_TITLE_CLASS =
  "line-clamp-2 min-h-10 text-sm font-medium leading-5 text-foreground";

export const ANIME_CARD_META_CLASS = "line-clamp-1 text-xs leading-4 text-muted-foreground";

export const ANIME_CARD_STATS_CLASS =
  "line-clamp-1 text-xs leading-4 tabular-nums text-muted-foreground";

/** Extra row for home airing countdown. */
export const ANIME_CARD_BODY_WITH_COUNTDOWN_CLASS = "flex flex-col gap-1 px-2.5 pb-2.5 pt-1.5";
