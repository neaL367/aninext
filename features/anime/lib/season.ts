export const SEASONS = ["WINTER", "SPRING", "SUMMER", "FALL"] as const;

function getSeasonInfo() {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const seasonIndex = Math.floor(month / 3);
  return { seasonIndex, year };
}

export function getCurrentSeason(): { season: string; seasonYear: number } {
  const { seasonIndex, year } = getSeasonInfo();
  return { season: SEASONS[seasonIndex], seasonYear: year };
}

export function getNextSeason(): { season: string; seasonYear: number } {
  const { seasonIndex, year } = getSeasonInfo();
  const nextIndex = (seasonIndex + 1) % 4;
  const nextYear = seasonIndex === 3 ? year + 1 : year;
  return { season: SEASONS[nextIndex], seasonYear: nextYear };
}
