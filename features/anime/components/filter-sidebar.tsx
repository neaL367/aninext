"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, use, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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
  const genres = use(genresPromise);
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

  const seasonDefault = collection === "seasonal" || !!currentSeason;
  const yearDefault = collection === "seasonal" || !!currentYear;

  return (
    <aside className={cn(mobile ? "flex w-full" : "hidden w-full lg:flex", "flex-col")} data-pending={isPending ? "" : undefined}>
      <div className="space-y-1">
        <CollapsibleSection label="Genre" defaultOpen count={currentGenres.length || undefined}>
          <ToggleGroup multiple value={currentGenres} onValueChange={(value: string[]) => updateFilter("genre", value.length ? value : undefined)} className="flex flex-wrap gap-1">
            {genres.map((genre) => <ToggleGroupItem key={genre} value={genre} className="h-7 rounded-none border border-border px-1.5 text-xs data-[state=on]:border-accent data-[state=on]:bg-accent/10 data-[state=on]:text-accent">{genre}</ToggleGroupItem>)}
          </ToggleGroup>
        </CollapsibleSection>

        <CollapsibleSection label="Format" count={currentFormats.length || undefined}>
          <ToggleGroup multiple value={currentFormats} onValueChange={(value: string[]) => updateFilter("format", value.length ? value : undefined)} className="flex flex-wrap gap-1">
            {FORMATS.map((format) => <ToggleGroupItem key={format} value={format} className="h-7 rounded-none border border-border px-1.5 text-xs data-[state=on]:border-accent data-[state=on]:bg-accent/10 data-[state=on]:text-accent">{formatFilterValue(format)}</ToggleGroupItem>)}
          </ToggleGroup>
        </CollapsibleSection>

        <CollapsibleSection label="Status" count={currentStatuses.length || undefined}>
          <ToggleGroup multiple value={currentStatuses} onValueChange={(value: string[]) => updateFilter("status", value.length ? value : undefined)} className="flex flex-wrap gap-1">
            {STATUSES.map((status) => <ToggleGroupItem key={status} value={status} className="h-7 rounded-none border border-border px-1.5 text-xs data-[state=on]:border-accent data-[state=on]:bg-accent/10 data-[state=on]:text-accent">{formatFilterValue(status)}</ToggleGroupItem>)}
          </ToggleGroup>
        </CollapsibleSection>

        <CollapsibleSection label="Season" defaultOpen={seasonDefault} count={currentSeason ? 1 : undefined}>
          <div className="flex flex-wrap gap-1">
            <FilterChip active={!currentSeason} onClick={() => updateFilter("season", undefined)}>Any</FilterChip>
            {SEASONS.map((s) => <FilterChip key={s.value} active={currentSeason === s.value} onClick={() => updateFilter("season", s.value)}>{s.label}</FilterChip>)}
          </div>
        </CollapsibleSection>

        <CollapsibleSection label="Year" defaultOpen={yearDefault} count={currentYear ? 1 : undefined}>
          <div className="flex flex-wrap gap-1">
            <FilterChip active={!currentYear} onClick={() => updateFilter("year", undefined)}>Any</FilterChip>
            {YEARS.map((y) => <FilterChip key={y} active={currentYear === String(y)} onClick={() => updateFilter("year", String(y))}>{y}</FilterChip>)}
          </div>
        </CollapsibleSection>

        <CollapsibleSection label="Origin" count={currentCountry ? 1 : undefined}>
          <div className="flex flex-wrap gap-1">
            <FilterChip active={!currentCountry} onClick={() => updateFilter("country", undefined)}>All</FilterChip>
            {COUNTRIES.map((country) => <FilterChip key={country.value} active={currentCountry === country.value} onClick={() => updateFilter("country", country.value)}>{country.label}</FilterChip>)}
          </div>
        </CollapsibleSection>

        <div className="border-b border-border py-2">
          <button type="button" onClick={() => setAdultOpen(!adultOpen)} className="flex w-full items-center gap-2 py-1 text-left text-xs font-medium text-foreground hover:text-accent">
            <ChevronDownIcon className={cn("size-3 transition-transform", adultOpen && "rotate-180")} />
            Adult content
            {isAdult ? <span className="ml-auto font-mono text-[0.65rem] text-live-badge">On</span> : null}
          </button>
          {adultOpen && (
            <div className="mt-2 space-y-3">
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

function CollapsibleSection({ label, children, defaultOpen = false, count }: { label: string; children: React.ReactNode; defaultOpen?: boolean; count?: number }) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (count && count > 0) setOpen(true);
  }, [count]);

  useEffect(() => {
    setOpen(defaultOpen);
  }, [defaultOpen]);
  return (
    <div className="border-b border-border py-2">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center gap-2 py-1 text-left text-xs font-medium text-foreground hover:text-accent">
        <ChevronDownIcon className={cn("size-3 transition-transform", open && "rotate-180")} />
        {label}
        {count ? <span className="ml-auto font-mono text-[0.65rem] text-accent">{count}</span> : null}
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <Button variant="ghost" size="sm" onClick={onClick} className={cn("h-7 rounded-none border px-1.5 text-xs font-normal", active ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground")}>{children}</Button>;
}

export function FilterSidebarSkeleton() {
  return <aside className="hidden w-full flex-col gap-1 lg:flex">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="border-b border-border py-2"><Skeleton className="h-5 w-20 rounded" /></div>)}</aside>;
}
