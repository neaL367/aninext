"use client";

import { useCallback, useMemo, useState } from "react";
import { useBrowseFilters } from "@/components/browse/browse-filters-provider";
import { FilterMoreOptions } from "@/components/browse/filter-more-options";
import { FilterMinField, FilterRangeField } from "@/components/browse/filter-range-field";
import { FilterSection } from "@/components/browse/filter-section";
import { GenrePicker } from "@/components/browse/genre-picker";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { MediaFormat, MediaSeason, MediaStatus } from "@/lib/anilist/domain/types";
import {
  FILTER_DURATION_MAX,
  FILTER_DURATION_MIN,
  FILTER_EPISODES_MAX,
  FILTER_EPISODES_MIN,
  FILTER_SCORE_MAX,
  FILTER_SCORE_MIN,
  FILTER_YEAR_MAX,
  FILTER_YEAR_MIN,
} from "@/lib/browse/filter-bounds";
import type { AnimeListParams } from "@/lib/browse/params";
import { DEFAULT_ANIME_LIST_PARAMS } from "@/lib/browse/params/types";
import {
  formatMediaFormat,
  formatMediaSeason,
  formatMediaStatus,
} from "@/lib/anilist/display/labels";
import { getCurrentAnimeSeason } from "@/lib/anilist/domain/season";
import { cn } from "@/lib/utils";

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

const ALL_SEASONS = [
  "WINTER",
  "SPRING",
  "SUMMER",
  "FALL",
] as const satisfies readonly MediaSeason[];

type AdvancedFiltersProps = {
  className?: string;
  onApply?: () => void;
};

function cloneParams(params: AnimeListParams): AnimeListParams {
  return {
    ...params,
    genres: [...params.genres],
    tags: [...params.tags],
    formats: [...params.formats],
    statuses: [...params.statuses],
  };
}

function buildResetParams(sort: AnimeListParams["sort"]): AnimeListParams {
  return {
    ...DEFAULT_ANIME_LIST_PARAMS,
    sort,
  };
}

export function AdvancedFilters({ className, onApply }: AdvancedFiltersProps) {
  "use memo";

  const { state, actions, meta } = useBrowseFilters();
  const { params } = state;
  const { applyFilters, resetFilters } = actions;
  const { genres } = meta;
  const [draft, setDraft] = useState(() => cloneParams(params));
  const resetParams = useMemo(() => buildResetParams(params.sort), [params.sort]);
  const isDirty = JSON.stringify(draft) !== JSON.stringify(params);

  const patch = useCallback(
    (partial: Partial<AnimeListParams>) => {
      setDraft((current) => ({ ...current, ...partial }));
    },
    [],
  );

  const handleSeasonChange = (values: string[]) => {
    const next = values.at(-1) as MediaSeason | undefined;
    const season = next ?? null;
    if (season && !draft.year) {
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
      year: season ? draft.year : null,
      yearMin: season ? null : draft.yearMin,
      yearMax: season ? null : draft.yearMax,
    });
  };

  const handleApply = () => {
    applyFilters(draft);
    onApply?.();
  };

  const handleReset = () => {
    setDraft(cloneParams(resetParams));
  };

  const handleResetAndApply = () => {
    resetFilters(resetParams);
    onApply?.();
  };

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <FilterSection title="Format & status">
        <div className="flex flex-col gap-3">
          <ToggleGroup
            value={draft.formats}
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
            value={draft.statuses}
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
            value={draft.season ? [draft.season] : []}
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

          {draft.season ? (
            <FilterMinField
              label="Season year"
              min={FILTER_YEAR_MIN}
              max={FILTER_YEAR_MAX}
              value={draft.year}
              onChange={(year) => patch({ year })}
            />
          ) : (
            <FilterRangeField
              label="Years"
              min={FILTER_YEAR_MIN}
              max={FILTER_YEAR_MAX}
              valueMin={draft.yearMin}
              valueMax={draft.yearMax}
              onChange={(yearMin, yearMax) => patch({ yearMin, yearMax })}
            />
          )}
        </div>
      </FilterSection>

      <FilterSection title="Genres">
        <GenrePicker params={draft} genres={genres} onChange={setDraft} />
      </FilterSection>

      <div className="flex flex-col gap-4">
        <p className="text-xs font-medium text-muted-foreground">Quality & length</p>
        <FilterMinField
          label="Minimum score"
          min={FILTER_SCORE_MIN}
          max={FILTER_SCORE_MAX}
          step={5}
          emptyValue={FILTER_SCORE_MIN}
          value={draft.scoreMin}
          onChange={(scoreMin) => patch({ scoreMin })}
          formatValue={(v) => `${v}%`}
        />
        <Separator />
        <FilterRangeField
          label="Episodes"
          min={FILTER_EPISODES_MIN}
          max={FILTER_EPISODES_MAX}
          step={1}
          valueMin={draft.episodesMin}
          valueMax={draft.episodesMax}
          onChange={(episodesMin, episodesMax) => patch({ episodesMin, episodesMax })}
        />
        <FilterRangeField
          label="Minutes per episode"
          min={FILTER_DURATION_MIN}
          max={FILTER_DURATION_MAX}
          step={5}
          valueMin={draft.durationMin}
          valueMax={draft.durationMax}
          onChange={(durationMin, durationMax) => patch({ durationMin, durationMax })}
          formatValue={(v) => `${v}m`}
        />
      </div>

      <FilterMoreOptions params={draft} onPatch={patch} />

      <div className="mt-1 flex flex-col gap-2 border-t border-border pt-4">
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" className="flex-1" onClick={handleReset}>
            Reset draft
          </Button>
          <Button type="button" size="sm" className="flex-1" onClick={handleApply} disabled={!isDirty}>
            Apply filters
          </Button>
        </div>
        <Button type="button" variant="ghost" size="sm" className="w-full" onClick={handleResetAndApply}>
          Clear all now
        </Button>
      </div>
    </div>
  );
}
