"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ActiveFilters() {
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

  const filters: { key: string; label: string; value?: string }[] = [];
  const genre = searchParams.get("genre");
  if (genre) filters.push({ key: "genre", label: genre });
  searchParams.getAll("format").forEach((f) =>
    filters.push({ key: "format", label: f, value: f })
  );
  searchParams.getAll("status").forEach((s) =>
    filters.push({ key: "status", label: s.replace("_", " "), value: s })
  );
  const country = searchParams.get("country");
  if (country) filters.push({ key: "country", label: country });
  const search = searchParams.get("search");
  if (search) filters.push({ key: "search", label: `"${search}"` });

  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2" data-pending={isPending ? "" : undefined}>
      {filters.map((f, i) => (
        <span
          key={`${f.key}-${f.value ?? i}`}
          className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-foreground"
        >
          {f.label}
          <button
            onClick={() => removeFilter(f.key, f.value)}
            className="rounded-full p-0.5 transition-colors hover:bg-muted"
          >
            <XIcon className="size-3" />
          </button>
        </span>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          startTransition(() => {
            router.replace("?", { scroll: false });
          });
        }}
        className="text-xs text-muted-foreground"
      >
        Clear all
      </Button>
    </div>
  );
}
