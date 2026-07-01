import { connection } from "next/server";
import {
  formatSeasonLabel,
  getCurrentAnimeSeason,
  getNextAnimeSeason,
  type AnimeSeason,
} from "@/lib/anilist/domain/season";

type HomeSectionSeasonSubtitleProps = {
  season: "current" | "next";
};

function resolveSeason(season: HomeSectionSeasonSubtitleProps["season"]): AnimeSeason {
  return season === "current" ? getCurrentAnimeSeason() : getNextAnimeSeason();
}

export async function HomeSectionSeasonSubtitle({ season }: HomeSectionSeasonSubtitleProps) {
  await connection();

  return (
    <p className="text-sm leading-relaxed text-muted-foreground">
      {formatSeasonLabel(resolveSeason(season))}
    </p>
  );
}
