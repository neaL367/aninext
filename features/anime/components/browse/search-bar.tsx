"use client";

import { SearchIcon, XIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const debouncedUpdate = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set("search", value);
    else params.delete("search");
    router.replace(`?${params.toString()}`, { scroll: false });
  }, 300);

  function handleClear() {
    const params = new URLSearchParams(searchParams);
    params.delete("search");
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  const searchValue = searchParams.get("search") ?? "";

  return (
    <label className="group flex h-12 items-center gap-3 border-b border-border-soft bg-surface-1/40 px-3 transition-colors focus-within:border-signal">
      <SearchIcon className="size-4 shrink-0 text-muted-foreground group-focus-within:text-signal" />
      <input
        type="search"
        placeholder="Search by title or genre..."
        defaultValue={searchValue}
        onChange={(e) => debouncedUpdate(e.target.value)}
        className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        aria-label="Search anime"
      />
      {searchValue ? (
        <button
          type="button"
          onClick={handleClear}
          className="rounded-sm p-1 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <XIcon className="size-4" />
        </button>
      ) : (
        <span className="hidden font-mono text-[0.6rem] uppercase tracking-[0.12em] text-muted-foreground sm:inline">
          Enter query
        </span>
      )}
    </label>
  );
}
