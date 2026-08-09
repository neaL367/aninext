"use client";

import { SearchIcon, XIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

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
      <InputGroup className="h-10 rounded-md border-border-soft bg-surface-1/80 transition-colors focus-within:border-signal">
        <InputGroupAddon align="inline-start" className="pl-3">
          <SearchIcon className="size-3.5 text-muted-foreground" aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          value={value}
          placeholder="Search anime..."
          className="font-mono text-xs text-foreground placeholder:text-muted-foreground"
          onChange={(event) => {
            const nextValue = event.target.value;
            setValue(nextValue);
            debouncedUpdate(nextValue);
          }}
          aria-label="Search anime"
        />
        {value && (
          <InputGroupButton
            type="button"
            size="icon-sm"
            variant="ghost"
            onClick={handleClear}
            aria-label="Clear search"
            title="Clear search"
            className="pr-2"
          >
            <XIcon className="size-3.5" />
          </InputGroupButton>
        )}
      </InputGroup>
    </form>
  );
}

export function SearchBarFallback() {
  return <div className="h-10 rounded-md border border-border-soft bg-surface-1/60 shimmer" />;
}
