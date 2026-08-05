"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, use, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const FORMATS = ["TV", "TV_SHORT", "MOVIE", "SPECIAL", "OVA", "ONA", "MUSIC"];
const STATUSES = ["FINISHED", "RELEASING", "NOT_YET_RELEASED", "CANCELLED", "HIATUS"];
const COUNTRIES = [
  { value: "JP", label: "Japan" },
  { value: "KR", label: "South Korea" },
  { value: "CN", label: "China" },
  { value: "TW", label: "Taiwan" },
];
const SEASONS = [
  { value: "WINTER", label: "Winter" },
  { value: "SPRING", label: "Spring" },
  { value: "SUMMER", label: "Summer" },
  { value: "FALL", label: "Fall" },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => currentYear - i);

import type { AnimeCollection } from "@/features/anime/types/anime";

function formatFilterValue(value: string): string {
  const map: Record<string, string> = {
    TV: "TV", TV_SHORT: "TV short", MOVIE: "Movie", SPECIAL: "Special", OVA: "OVA", ONA: "ONA", MUSIC: "Music",
    FINISHED: "Finished", RELEASING: "Airing", NOT_YET_RELEASED: "Not yet released", CANCELLED: "Cancelled", HIATUS: "Hiatus",
  };
  return map[value] ?? value;
}

export function FilterSidebar({ genresPromise, mobile = false, collection }: { genresPromise: Promise<string[]>; mobile?: boolean; collection?: AnimeCollection }) {
  const allGenres = use(genresPromise);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateFilter(key: string, value: string | string[] | undefined) {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      params.delete(key);
      if (value) Array.isArray(value) ? value.forEach((item) => params.append(key, item)) : params.set(key, value);
      router.replace(`?${params.toString()}`, { scroll: false });
    });
  }

  const currentGenres = searchParams.getAll("genre");
  const currentFormats = searchParams.getAll("format");
  const currentStatuses = searchParams.getAll("status");
  const currentCountry = searchParams.get("country") ?? "";
  const currentSeason = searchParams.get("season") ?? "";
  const currentYear = searchParams.get("year") ?? "";
  const isAdult = searchParams.get("isAdult") === "true";
  const [adultOpen, setAdultOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const ADULT_GENRES = ["Ecchi", "Hentai"];
  const genres = isAdult ? allGenres : allGenres.filter((g) => !ADULT_GENRES.includes(g));

  const seasonDefault = collection === "seasonal" || !!currentSeason;
  const yearDefault = collection === "seasonal" || !!currentYear;

  const activeCount = currentGenres.length + currentFormats.length + currentStatuses.length + (currentSeason ? 1 : 0) + (currentYear ? 1 : 0) + (currentCountry ? 1 : 0) + (isAdult ? 1 : 0);

  return (
    <aside className={cn(mobile ? "flex w-full" : "hidden w-full lg:flex", "flex-col")} data-pending={isPending ? "" : undefined}>
      <div className="mb-3 flex items-center justify-between border-b border-border-soft pb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-foreground">Filters</span>
          {activeCount > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-accent font-mono text-[0.6rem] font-semibold text-accent-foreground">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
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
            Reset
          </Button>
        )}
      </div>

      <div className="space-y-0">
        <FilterSection label="Genre" defaultOpen count={currentGenres.length}>
          <div className="flex flex-wrap gap-1.5">
            {genres.map((genre) => {
              const active = currentGenres.includes(genre);
              return (
                <button
                  key={genre}
                  onClick={() => {
                    const next = active ? currentGenres.filter((g) => g !== genre) : [...currentGenres, genre];
                    updateFilter("genre", next.length ? next : undefined);
                  }}
                  className={cn(
                    "rounded-sm border px-2 py-1 font-mono text-[0.65rem] transition-colors",
                    active
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border-soft bg-surface-1/50 text-muted-foreground hover:border-accent/40 hover:text-foreground"
                  )}
                >
                  {genre}
                </button>
              );
            })}
          </div>
        </FilterSection>

        <FilterSection label="Format" count={currentFormats.length}>
          <div className="flex flex-wrap gap-1.5">
            {FORMATS.map((format) => {
              const active = currentFormats.includes(format);
              return (
                <button
                  key={format}
                  onClick={() => {
                    const next = active ? currentFormats.filter((f) => f !== format) : [...currentFormats, format];
                    updateFilter("format", next.length ? next : undefined);
                  }}
                  className={cn(
                    "rounded-sm border px-2 py-1 font-mono text-[0.65rem] transition-colors",
                    active
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border-soft bg-surface-1/50 text-muted-foreground hover:border-accent/40 hover:text-foreground"
                  )}
                >
                  {formatFilterValue(format)}
                </button>
              );
            })}
          </div>
        </FilterSection>

        <FilterSection label="Status" count={currentStatuses.length}>
          <div className="flex flex-wrap gap-1.5">
            {STATUSES.map((status) => {
              const active = currentStatuses.includes(status);
              return (
                <button
                  key={status}
                  onClick={() => {
                    const next = active ? currentStatuses.filter((s) => s !== status) : [...currentStatuses, status];
                    updateFilter("status", next.length ? next : undefined);
                  }}
                  className={cn(
                    "rounded-sm border px-2 py-1 font-mono text-[0.65rem] transition-colors",
                    active
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border-soft bg-surface-1/50 text-muted-foreground hover:border-accent/40 hover:text-foreground"
                  )}
                >
                  {formatFilterValue(status)}
                </button>
              );
            })}
          </div>
        </FilterSection>

        <FilterSection label="Season" defaultOpen={seasonDefault} count={currentSeason ? 1 : 0}>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => updateFilter("season", undefined)}
              className={cn(
                "rounded-sm border px-2 py-1 font-mono text-[0.65rem] transition-colors",
                !currentSeason
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border-soft bg-surface-1/50 text-muted-foreground hover:border-accent/40 hover:text-foreground"
              )}
            >
              Any
            </button>
            {SEASONS.map((s) => (
              <button
                key={s.value}
                onClick={() => updateFilter("season", s.value)}
                className={cn(
                  "rounded-sm border px-2 py-1 font-mono text-[0.65rem] transition-colors",
                  currentSeason === s.value
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border-soft bg-surface-1/50 text-muted-foreground hover:border-accent/40 hover:text-foreground"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </FilterSection>

        <FilterSection label="Year" defaultOpen={yearDefault} count={currentYear ? 1 : 0}>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => updateFilter("year", undefined)}
              className={cn(
                "rounded-sm border px-2 py-1 font-mono text-[0.65rem] transition-colors",
                !currentYear
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border-soft bg-surface-1/50 text-muted-foreground hover:border-accent/40 hover:text-foreground"
              )}
            >
              Any
            </button>
            {YEARS.map((y) => (
              <button
                key={y}
                onClick={() => updateFilter("year", String(y))}
                className={cn(
                  "rounded-sm border px-2 py-1 font-mono text-[0.65rem] transition-colors",
                  currentYear === String(y)
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border-soft bg-surface-1/50 text-muted-foreground hover:border-accent/40 hover:text-foreground"
                )}
              >
                {y}
              </button>
            ))}
          </div>
        </FilterSection>

        <FilterSection label="Origin" count={currentCountry ? 1 : 0}>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => updateFilter("country", undefined)}
              className={cn(
                "rounded-sm border px-2 py-1 font-mono text-[0.65rem] transition-colors",
                !currentCountry
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border-soft bg-surface-1/50 text-muted-foreground hover:border-accent/40 hover:text-foreground"
              )}
            >
              All
            </button>
            {COUNTRIES.map((country) => (
              <button
                key={country.value}
                onClick={() => updateFilter("country", country.value)}
                className={cn(
                  "rounded-sm border px-2 py-1 font-mono text-[0.65rem] transition-colors",
                  currentCountry === country.value
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border-soft bg-surface-1/50 text-muted-foreground hover:border-accent/40 hover:text-foreground"
                )}
              >
                {country.label}
              </button>
            ))}
          </div>
        </FilterSection>

        <div className="border-b border-border-soft py-3">
          <button type="button" onClick={() => setAdultOpen(!adultOpen)} className="flex w-full items-center gap-2 text-left">
            <ChevronDownIcon className={cn("size-3.5 transition-transform", adultOpen && "rotate-180")} />
            <span className="font-mono text-[0.65rem] font-medium text-foreground">Adult content</span>
            {isAdult && <span className="ml-auto rounded-sm bg-live-badge/10 px-1.5 py-0.5 font-mono text-[0.6rem] font-medium text-live-badge">Enabled</span>}
          </button>
          {adultOpen && (
            <div className="mt-3 space-y-3">
              <p className="text-xs leading-5 text-muted-foreground">
                This includes mature themes and graphic material. You must be 18 years or older to view adult content.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Enable adult content</span>
                <Switch checked={isAdult} onCheckedChange={(checked: boolean) => {
                  if (checked) {
                    setConfirmOpen(true);
                  } else {
                    updateFilter("isAdult", undefined);
                  }
                }} />
              </div>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Age confirmation</AlertDialogTitle>
            <AlertDialogDescription>
              This content is intended for mature audiences and may include graphic material. You must be 18 years or older to view adult content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setConfirmOpen(false);
              updateFilter("isAdult", "true");
            }}>
              I am 18 or older
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  );
}

function FilterSection({ label, children, defaultOpen = false, count }: { label: string; children: React.ReactNode; defaultOpen?: boolean; count?: number }) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (count && count > 0) setOpen(true);
  }, [count]);

  useEffect(() => {
    setOpen(defaultOpen);
  }, [defaultOpen]);

  return (
    <div className="border-b border-border-soft py-3">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center gap-2 text-left">
        <ChevronDownIcon className={cn("size-3.5 transition-transform", open && "rotate-180")} />
        <span className="font-mono text-[0.65rem] font-medium text-foreground">{label}</span>
        {count !== undefined && count > 0 && (
          <span className="ml-auto font-mono text-[0.6rem] text-accent">{count}</span>
        )}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

export function FilterSidebarSkeleton() {
  return <aside className="hidden w-full flex-col gap-1 lg:flex">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="border-b border-border py-2"><Skeleton className="h-5 w-20 rounded" /></div>)}</aside>;
}
