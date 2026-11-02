"use client";

import { SearchIcon, XIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

export function SearchBar() {
  "use memo";
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("search") ?? "");

  const updateSearch = useCallback(
    (nextValue: string) => {
      const params = new URLSearchParams(window.location.search);
      if (nextValue.trim()) params.set("search", nextValue.trim());
      else params.delete("search");
      const query = params.toString();
      router.replace(query ? `?${query}` : "?", { scroll: false });
    },
    [router],
  );
  const debouncedUpdate = useDebouncedCallback(updateSearch, 300);

  useEffect(() => {
    setValue(searchParams.get("search") ?? "");
  }, [searchParams]);

  useEffect(() => {
    return () => debouncedUpdate.cancel();
  }, [debouncedUpdate]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    debouncedUpdate.flush();
  }

  function handleClear() {
    setValue("");
    debouncedUpdate.cancel();
    updateSearch("");
  }

  return (
    <form role="search" aria-label="Search anime" onSubmit={handleSubmit} className="w-full">
      <div className="group relative flex h-10 items-center border-b border-border-soft transition-colors focus-within:border-signal">
        <SearchIcon
          className="size-3.5 shrink-0 text-muted-foreground transition-colors group-focus-within:text-signal"
          aria-hidden="true"
        />
        <input
          type="search"
          name="search"
          autoComplete="off"
          value={value}
          placeholder="Search anime"
          className="h-full w-full min-w-0 bg-transparent px-2.5 font-mono text-xs text-foreground outline-none placeholder:text-muted-foreground/60 [&::-webkit-search-cancel-button]:hidden"
          onChange={(event) => {
            const nextValue = event.target.value;
            setValue(nextValue);
            debouncedUpdate(nextValue);
          }}
          aria-label="Search anime"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            title="Clear search"
            className="flex size-7 shrink-0 items-center justify-center rounded-[2px] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            <XIcon className="size-3.5" />
          </button>
        )}
      </div>
    </form>
  );
}

export function SearchBarFallback() {
  return <div className="h-10 border-b border-border-soft shimmer" />;
}
