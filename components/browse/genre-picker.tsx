"use client";

import { useMemo, useState } from "react";
import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { GenreOption } from "@/lib/anilist/server/get-genre-collection";
import { toggleGenre } from "@/lib/routes/filter-helpers";
import type { AnimeListParams } from "@/lib/routes/search-params";

type GenrePickerProps = {
  params: AnimeListParams;
  genres: GenreOption[];
  onChange: (params: AnimeListParams) => void;
};

export function GenrePicker({ params, genres, onChange }: GenrePickerProps) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return genres;
    return genres.filter((g) => g.name.toLowerCase().includes(q));
  }, [genres, query]);

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find genre..."
          className="h-8 pl-8 text-xs"
          aria-label="Search genres"
        />
      </div>
      <ScrollArea className="h-28 rounded-md border border-border">
        <div className="flex flex-wrap gap-1.5 p-2">
          {filtered.map((genre) => {
            const active = params.genres.includes(genre.name);
            return (
              <Button
                key={genre.name}
                type="button"
                size="xs"
                variant={active ? "secondary" : "outline"}
                className="h-7 font-normal"
                onClick={() => onChange(toggleGenre(params, genre.name))}
              >
                {genre.name}
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
