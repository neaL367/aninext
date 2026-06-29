"use client";

import { useCallback } from "react";
import { FilterMoreOptions } from "@/components/browse/filter-more-options";
import { FilterMinField, FilterRangeField } from "@/components/browse/filter-range-field";
import { FilterSection } from "@/components/browse/filter-section";
import { GenrePicker } from "@/components/browse/genre-picker";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { MediaFormat, MediaSeason, MediaStatus } from "@/lib/anilist/types";
import {
  FILTER_DURATION_MAX,
  FILTER_DURATION_MIN,
  FILTER_EPISODES_MAX,
  FILTER_EPISODES_MIN,
  FILTER_SCORE_MAX,
  FILTER_SCORE_MIN,
  FILTER_YEAR_MAX,
  FILTER_YEAR_MIN,
} from "@/lib/routes/filter-bounds";
import type { AnimeListParams } from "@/lib/routes/search-params";
import {
  formatMediaFormat,
  formatMediaSeason,
  formatMediaStatus,
} from "@/lib/anilist/utils/labels";
import { getCurrentAnimeSeason } from "@/lib/anilist/utils/season";
import { cn } from "@/lib/utils";

type GenreOption = { id: number; name: string };

type AdvancedFiltersProps = {
  params: AnimeListParams;
  genres: GenreOption[];
  onApply: (params: AnimeListParams) => void;
  onReset: () => void;
  className?: string;
};

const ALL_FORMATS = [
  "TV",
  "TV_SHORT",
  "MOVIE",
  "SPECIAL",
  "OVA",
  "ONA",
  "MUSIC",
] as const satisfies readonly MediaFormat[];

const ALL_STATUSES = [
  "RELEASING",
  "FINISHED",
  "NOT_YET_RELEASED",
  "CANCELLED",
  "HIATUS",
] as const satisfies readonly MediaStatus[];

const ALL_SEASONS = ["WINTER", "SPRING", "SUMMER", "FALL"] as const satisfies readonly MediaSeason[];

export function AdvancedFilters({
  params,
  genres,
  onApply,
  onReset,
  className,
}: AdvancedFiltersProps) {
  const patch = useCallback(
    (partial: Partial<AnimeListParams>) => onApply({ ...params, ...partial }),
    [onApply, params]
  );

  const handleSeasonChange = (values: string[]) => {
    const next = values.at(-1) as MediaSeason | undefined;
    const season = next ?? null;
    if (season && !params.year) {
      patch({
        season,
        year: getCurrentAnimeSeason().year,
        yearMin: null,
        yearMax: null,
      });
      return;
    }
    patch({
      season,
      year: season ? params.year : null,
      yearMin: season ? null : params.yearMin,
      yearMax: season ? null : params.yearMax,
    });
  };

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <FilterSection title="Format & status">
        <div className="flex flex-col gap-3">
          <ToggleGroup
            value={params.formats}
            onValueChange={(formats) => patch({ formats: formats as MediaFormat[] })}
            variant="outline"
            size="sm"
            multiple
            spacing={0}
            className="flex flex-wrap"
          >
            {ALL_FORMATS.map((format) => (
              <ToggleGroupItem key={format} value={format} className="px-2 text-xs">
                {formatMediaFormat(format)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <ToggleGroup
            value={params.statuses}
            onValueChange={(statuses) => patch({ statuses: statuses as MediaStatus[] })}
            variant="outline"
            size="sm"
            multiple
            spacing={0}
            className="flex flex-wrap"
          >
            {ALL_STATUSES.map((status) => (
              <ToggleGroupItem key={status} value={status} className="px-2 text-xs">
                {formatMediaStatus(status)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </FilterSection>

      <FilterSection title="Release">
        <div className="flex flex-col gap-3">
          <ToggleGroup
            value={params.season ? [params.season] : []}
            onValueChange={handleSeasonChange}
            variant="outline"
            size="sm"
            spacing={0}
            className="flex flex-wrap"
          >
            {ALL_SEASONS.map((season) => (
              <ToggleGroupItem key={season} value={season} className="px-2.5 text-xs">
                {formatMediaSeason(season)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          {params.season ? (
            <FilterMinField
              label="Season year"
              min={FILTER_YEAR_MIN}
              max={FILTER_YEAR_MAX}
              value={params.year}
              onChange={(year) => patch({ year })}
            />
          ) : (
            <FilterRangeField
              label="Years"
              min={FILTER_YEAR_MIN}
              max={FILTER_YEAR_MAX}
              valueMin={params.yearMin}
              valueMax={params.yearMax}
              onChange={(yearMin, yearMax) => patch({ yearMin, yearMax })}
            />
          )}
        </div>
      </FilterSection>

      <FilterSection title="Genres">
        <GenrePicker params={params} genres={genres} onChange={onApply} />
      </FilterSection>

      <div className="flex flex-col gap-4">
        <p className="text-xs font-medium text-muted-foreground">Quality & length</p>
        <FilterMinField
          label="Minimum score"
          min={FILTER_SCORE_MIN}
          max={FILTER_SCORE_MAX}
          step={5}
          emptyValue={FILTER_SCORE_MIN}
          value={params.scoreMin}
          onChange={(scoreMin) => patch({ scoreMin })}
          formatValue={(v) => `${v}%`}
        />
        <Separator />
        <FilterRangeField
          label="Episodes"
          min={FILTER_EPISODES_MIN}
          max={FILTER_EPISODES_MAX}
          step={1}
          valueMin={params.episodesMin}
          valueMax={params.episodesMax}
          onChange={(episodesMin, episodesMax) => patch({ episodesMin, episodesMax })}
        />
        <FilterRangeField
          label="Minutes per episode"
          min={FILTER_DURATION_MIN}
          max={FILTER_DURATION_MAX}
          step={5}
          valueMin={params.durationMin}
          valueMax={params.durationMax}
          onChange={(durationMin, durationMax) => patch({ durationMin, durationMax })}
          formatValue={(v) => `${v}m`}
        />
      </div>

      <FilterMoreOptions params={params} onPatch={patch} />

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        onClick={onReset}
      >
        Reset all filters
      </Button>
    </div>
  );
}
