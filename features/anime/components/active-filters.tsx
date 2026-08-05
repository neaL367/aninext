"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useMemo } from "react";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFormat, formatStatus } from "@/features/anime/lib/media-helpers";
import { cn } from "@/lib/utils";

interface FilterItem {
  key: string;
  label: string;
  value?: string;
}

const FILTER_TYPE_LABELS: Record<string, string> = {
  search: "Search",
  genre: "Genre",
  format: "Format",
  status: "Status",
  season: "Season",
  year: "Year",
  country: "Country",
  isAdult: "Content",
};

export function ActiveFilters({ compact = false }: { compact?: boolean } = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function removeFilter(key: string, value?: string) {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        const values = params.getAll(key).filter((v) => v !== value);
        params.delete(key);
        values.forEach((v) => params.append(key, v));
      } else {
        params.delete(key);
      }
      router.replace(`?${params.toString()}`, { scroll: false });
    });
  }

  const filters = useMemo<FilterItem[]>(() => {
    const items: FilterItem[] = [];
    const search = searchParams.get("search");
    if (search) items.push({ key: "search", label: search });
    searchParams.getAll("genre").forEach((g) =>
      items.push({ key: "genre", label: g, value: g })
    );
    searchParams.getAll("format").forEach((f) =>
      items.push({ key: "format", label: formatFormat(f), value: f })
    );
    searchParams.getAll("status").forEach((s) =>
      items.push({ key: "status", label: formatStatus(s), value: s })
    );
    const season = searchParams.get("season");
    if (season) items.push({ key: "season", label: season.charAt(0) + season.slice(1).toLowerCase() });
    const year = searchParams.get("year");
    if (year) items.push({ key: "year", label: year });
    const country = searchParams.get("country");
    if (country) items.push({ key: "country", label: country });
    const isAdult = searchParams.get("isAdult");
    if (isAdult === "true") items.push({ key: "isAdult", label: "18+" });
    return items;
  }, [searchParams]);

  if (filters.length === 0) return null;

  if (compact) {
    return (
      <div
        className="flex flex-col gap-2 border-b border-border-soft pb-3"
        data-pending={isPending ? "" : undefined}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-foreground">
              Active
            </span>
            <span className="flex size-4 items-center justify-center rounded-full bg-accent font-mono text-[0.55rem] font-semibold text-accent-foreground">
              {filters.length}
            </span>
          </div>
          <button
            onClick={() => {
              startTransition(() => {
                router.replace("?", { scroll: false });
              });
            }}
            className="font-mono text-[0.55rem] uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:text-foreground"
          >
            Clear
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {filters.map((item, i) => (
            <span
              key={`${item.key}-${item.value ?? i}`}
              className={cn(
                "group inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 font-mono text-[0.6rem] transition-colors",
                "border-border-soft bg-surface-1/50 text-foreground",
                "hover:border-accent/60 hover:bg-accent/5 hover:text-accent"
              )}
            >
              <span className="leading-none">{item.label}</span>
              <button
                onClick={() => removeFilter(item.key, item.value)}
                className="flex size-3 items-center justify-center rounded-sm transition-colors hover:bg-accent/20"
                aria-label={`Remove ${item.label}`}
              >
                <XIcon className="size-2" />
              </button>
            </span>
          ))}
        </div>
      </div>
    );
  }

  const groupedFilters = useMemo(() => {
    const groups: Record<string, FilterItem[]> = {};
    filters.forEach((f) => {
      if (!groups[f.key]) groups[f.key] = [];
      groups[f.key].push(f);
    });
    return groups;
  }, [filters]);

  const filterOrder = ["search", "genre", "format", "status", "season", "year", "country", "isAdult"];

  return (
    <div
      className="flex flex-col gap-3 border-b border-border-soft py-4"
      data-pending={isPending ? "" : undefined}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-foreground">
            Filters
          </span>
          <span className="flex size-5 items-center justify-center rounded-full bg-accent font-mono text-[0.6rem] font-semibold text-accent-foreground">
            {filters.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            startTransition(() => {
              router.replace("?", { scroll: false });
            });
          }}
          className="h-6 rounded-none px-2 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground"
        >
          Clear all
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        {filterOrder.map((key) => {
          const items = groupedFilters[key];
          if (!items) return null;
          const typeLabel = FILTER_TYPE_LABELS[key];

          return (
            <div key={key} className="flex items-center gap-1.5">
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted-foreground">
                {typeLabel}:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {items.map((item, i) => (
                  <span
                    key={`${item.key}-${item.value ?? i}`}
                    className={cn(
                      "group inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono text-[0.65rem] transition-colors",
                      "border-border-soft bg-surface-1/50 text-foreground",
                      "hover:border-accent/60 hover:bg-accent/5 hover:text-accent"
                    )}
                  >
                    <span className="leading-none">{item.label}</span>
                    <button
                      onClick={() => removeFilter(item.key, item.value)}
                      className="flex size-3.5 items-center justify-center rounded-sm transition-colors hover:bg-accent/20"
                      aria-label={`Remove ${item.label}`}
                    >
                      <XIcon className="size-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
