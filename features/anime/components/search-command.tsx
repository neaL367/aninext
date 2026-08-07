"use client";
import { CalendarIcon, ClockIcon, StarIcon, TrendingUpIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  trending: <TrendingUpIcon />,
  popular: <StarIcon />,
  top100: <StarIcon />,
  upcoming: <CalendarIcon />,
  seasonal: <ClockIcon />,
  alltimepopular: <StarIcon />,
};

export function SearchCommand() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };

    const customOpen = () => setOpen(true);

    document.addEventListener("keydown", down);
    document.addEventListener("open-search", customOpen);
    return () => {
      document.removeEventListener("keydown", down);
      document.removeEventListener("open-search", customOpen);
    };
  }, []);

  function close() {
    setOpen(false);
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
      onOpenChange={setOpen}
      title="Search AniNext"
      description="Search anime or jump to a collection."
    >
      <Command>
        <CommandInput
          aria-label="Search anime or choose a collection"
          placeholder="Search anime or choose a collection..."
          value={query}
          onValueChange={setQuery}
          onKeyDown={(event) => {
            if (event.key === "Enter") search();
          }}
        />
        <CommandList>
          <CommandEmpty>
            {query ? "Press Enter to search this title." : "No commands found."}
          </CommandEmpty>
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
              <ClockIcon />
              Airing schedule
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
