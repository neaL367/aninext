"use client";

import { CalendarIcon, ClockIcon, StarIcon, TrendingUpIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { COLLECTION_NAV_ITEMS } from "@/features/anime/lib/collection-config";

import type { AnimeCollection } from "@/features/anime/types/anime";
import type { Route } from "next";

const COLLECTION_ICONS: Record<AnimeCollection, React.ReactNode> = {
  trending: <TrendingUpIcon aria-hidden="true" />,
  popular: <StarIcon aria-hidden="true" />,
  top100: <StarIcon aria-hidden="true" />,
  upcoming: <CalendarIcon aria-hidden="true" />,
  seasonal: <ClockIcon aria-hidden="true" />,
  alltimepopular: <StarIcon aria-hidden="true" />,
};

export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function close() {
    onOpenChange(false);
    setQuery("");
  }

  function search() {
    const value = query.trim();
    if (!value) return;
    // oxlint-disable-next-line typescript/no-unnecessary-type-assertion -- typedRoutes narrowing for router.push
    router.push(`/anime/trending?search=${encodeURIComponent(value)}` as Route<string>);
    close();
  }

  function navigateTo(path: string) {
    // oxlint-disable-next-line typescript/no-unnecessary-type-assertion -- typedRoutes narrowing for router.push
    router.push(path as Route<string>);
    close();
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search"
      description="Find an anime or jump to a collection."
    >
      <Command>
        <CommandInput
          aria-label="Search anime or choose a collection"
          autoComplete="off"
          placeholder="Search anime"
          value={query}
          onValueChange={setQuery}
          onKeyDown={(event) => {
            if (event.key === "Enter") search();
          }}
        />
        <CommandList>
          <CommandEmpty>{query ? "Press Enter to search." : "No commands."}</CommandEmpty>
          <CommandGroup heading="Collections">
            {COLLECTION_NAV_ITEMS.map(({ id, label }) => (
              <CommandItem key={id} onSelect={() => navigateTo(`/anime/${id}`)}>
                {COLLECTION_ICONS[id]}
                {label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Pages">
            <CommandItem onSelect={() => navigateTo("/airing")}>
              <ClockIcon aria-hidden="true" />
              Airing schedule
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
