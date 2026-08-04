"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { SearchIcon, XIcon } from "lucide-react";

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
    <div className="relative">
      <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        placeholder="Search anime..."
        defaultValue={searchValue}
        onChange={(e) => debouncedUpdate(e.target.value)}
        className="h-10 w-full rounded-full border border-border-soft bg-surface-1/50 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-accent/50 focus:bg-surface-2 focus:outline-none focus:ring-1 focus:ring-accent/30"
      />
      {searchValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          <XIcon className="size-4" />
          <span className="sr-only">Clear search</span>
        </button>
      )}
    </div>
  );
}
