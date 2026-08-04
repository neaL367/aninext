"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { use } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

const FORMATS = ["TV", "TV_SHORT", "MOVIE", "SPECIAL", "OVA", "ONA", "MUSIC"];
const STATUSES = [
  "FINISHED",
  "RELEASING",
  "NOT_YET_RELEASED",
  "CANCELLED",
  "HIATUS",
];
const COUNTRIES = [
  { value: "JP", label: "Japan" },
  { value: "KR", label: "South Korea" },
  { value: "CN", label: "China" },
  { value: "TW", label: "Taiwan" },
];

export function FilterSidebar({
  genresPromise,
  mobile = false,
}: {
  genresPromise: Promise<string[]>;
  mobile?: boolean;
}) {
  const genres = use(genresPromise);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateFilter(key: string, value: string | string[] | undefined) {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      params.delete(key);
      if (value) {
        if (Array.isArray(value)) value.forEach((v) => params.append(key, v));
        else params.set(key, value);
      }
      router.replace(`?${params.toString()}`, { scroll: false });
    });
  }

  const currentGenre = searchParams.get("genre") ?? "";
  const currentFormats = searchParams.getAll("format");
  const currentStatuses = searchParams.getAll("status");
  const currentCountry = searchParams.get("country") ?? "";
  const isAdult = searchParams.get("isAdult") === "true";

  return (
    <aside
      className={cn(
        mobile ? "flex w-full flex-col" : "hidden w-60 shrink-0 lg:block"
      )}
      data-pending={isPending ? "" : undefined}
    >
      <div className="flex flex-col gap-6">
        {/* Genre */}
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Genre
          </h3>
          <div className="flex flex-wrap gap-1.5">
            <Button
              variant={!currentGenre ? "secondary" : "ghost"}
              size="sm"
              className="rounded-full"
              onClick={() => updateFilter("genre", undefined)}
            >
              All
            </Button>
            {genres.map((g) => (
              <Button
                key={g}
                variant={currentGenre === g ? "secondary" : "ghost"}
                size="sm"
                className="rounded-full"
                onClick={() => updateFilter("genre", g)}
              >
                {g}
              </Button>
            ))}
          </div>
        </div>

        {/* Format */}
        <div className="border-t border-border-soft pt-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Format
          </h3>
          <ToggleGroup
            multiple
            variant="outline"
            size="sm"
            value={currentFormats}
            onValueChange={(value: string[]) => {
              updateFilter("format", value.length ? value : undefined);
            }}
            className="flex flex-wrap gap-1.5"
          >
            {FORMATS.map((f) => (
              <ToggleGroupItem key={f} value={f} className="rounded-full text-xs">
                {f}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {/* Status */}
        <div className="border-t border-border-soft pt-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Status
          </h3>
          <ToggleGroup
            multiple
            variant="outline"
            size="sm"
            value={currentStatuses}
            onValueChange={(value: string[]) => {
              updateFilter("status", value.length ? value : undefined);
            }}
            className="flex flex-wrap gap-1.5"
          >
            {STATUSES.map((s) => (
              <ToggleGroupItem key={s} value={s} className="rounded-full text-xs">
                {s.replace("_", " ")}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {/* Country */}
        <div className="border-t border-border-soft pt-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Country
          </h3>
          <div className="flex flex-wrap gap-1.5">
            <Button
              variant={!currentCountry ? "secondary" : "ghost"}
              size="sm"
              className="rounded-full"
              onClick={() => updateFilter("country", undefined)}
            >
              All
            </Button>
            {COUNTRIES.map((c) => (
              <Button
                key={c.value}
                variant={currentCountry === c.value ? "secondary" : "ghost"}
                size="sm"
                className="rounded-full"
                onClick={() => updateFilter("country", c.value)}
              >
                {c.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Adult Content */}
        <div className="border-t border-border-soft pt-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Adult content</span>
            <Switch
              checked={isAdult}
              onCheckedChange={(checked: boolean) =>
                updateFilter("isAdult", checked ? "true" : undefined)
              }
            />
          </div>
        </div>
      </div>
    </aside>
  );
}

export function FilterSidebarSkeleton() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col gap-6 lg:flex">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <Skeleton className="h-4 w-16 rounded-full" />
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: 5 }).map((_, j) => (
              <Skeleton key={j} className="h-7 w-16 rounded-full" />
            ))}
          </div>
        </div>
      ))}
    </aside>
  );
}
