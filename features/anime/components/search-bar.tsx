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
  InputGroupText,
} from "@/components/ui/input-group";

export function SearchBar() {
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
    <form role="search" aria-label="Search anime" onSubmit={handleSubmit}>
      <InputGroup className="h-12 rounded-none border-border-soft bg-surface-1/40 focus-within:border-signal">
        <InputGroupAddon align="inline-start" className="pl-3">
          <SearchIcon className="size-4 text-muted-foreground" aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          value={value}
          placeholder="Search anime titles..."
          onChange={(event) => {
            const nextValue = event.target.value;
            setValue(nextValue);
            debouncedUpdate(nextValue);
          }}
          aria-label="Search anime"
        />
        {value ? (
          <InputGroupButton
            type="button"
            size="icon-sm"
            variant="ghost"
            onClick={handleClear}
            aria-label="Clear search"
            title="Clear search"
          >
            <XIcon />
          </InputGroupButton>
        ) : (
          <InputGroupText className="hidden pr-3 font-mono text-[0.6rem] uppercase tracking-[0.12em] sm:flex">
            Enter to search
          </InputGroupText>
        )}
      </InputGroup>
    </form>
  );
}

export function SearchBarFallback() {
  return <div className="h-12 border border-border-soft bg-surface-1/40" />;
}
