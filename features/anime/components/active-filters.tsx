"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFormat, formatStatus } from "@/features/anime/lib/media-helpers";

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
  searchParams.getAll("genre").forEach((g) =>
    filters.push({ key: "genre", label: g, value: g })
  );
  searchParams.getAll("format").forEach((f) =>
    filters.push({ key: "format", label: formatFormat(f), value: f })
  );
  searchParams.getAll("status").forEach((s) =>
    filters.push({ key: "status", label: formatStatus(s), value: s })
  );
  const country = searchParams.get("country");
  if (country) filters.push({ key: "country", label: country });
  const search = searchParams.get("search");
  if (search) filters.push({ key: "search", label: `"${search}"` });

  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2" data-pending={isPending ? "" : undefined}>
      <span className="eyebrow mr-1">Active</span>
      {filters.map((f, i) => (
        <span
          key={`${f.key}-${f.value ?? i}`}
          className="inline-flex items-center gap-2 border border-signal/35 bg-signal-soft px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.08em] text-signal"
        >
          {f.label}
          <button
            onClick={() => removeFilter(f.key, f.value)}
            className="p-0.5 transition-colors hover:bg-background/40"
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
        className="ml-1 h-7 rounded-none px-2 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-muted-foreground"
      >
        Clear all
      </Button>
    </div>
  );
}
