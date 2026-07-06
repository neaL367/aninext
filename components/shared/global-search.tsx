"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, User, Film } from "lucide-react";
import { globalSearchAction } from "@/lib/anilist/server/actions";
import type { GlobalSearchResult } from "@/lib/anilist/domain/types";
import { 
  getMediaDetailHref, 
  getCharacterDetailHref, 
  getStaffDetailHref 
} from "@/lib/anilist/display/media-links";
import { formatDisplayTitle, formatPersonName } from "@/lib/anilist/display/format";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      const res = await globalSearchAction(query);
      if (res.ok) {
        setResults(res.data);
      }
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (result: GlobalSearchResult) => {
    if (!result.data) return;
    let href: Route = "#" as Route;
    const name = result.type === 'anime' || result.type === 'manga' 
      ? formatDisplayTitle(result.data.title)
      : formatPersonName(result.data.name);
    
    if (result.type === 'anime' || result.type === 'manga') {
      href = getMediaDetailHref(result.data.id, result.type as any, name).href as Route;
    } else if (result.type === 'character') {
      href = getCharacterDetailHref(result.data.id, name);
    } else if (result.type === 'staff') {
      href = getStaffDetailHref(result.data.id, name);
    }

    router.push(href);
    setOpen(false);
  };

  const groupedResults = {
    anime: results.filter(r => r.type === 'anime'),
    manga: results.filter(r => r.type === 'manga'),
    character: results.filter(r => r.type === 'character'),
    staff: results.filter(r => r.type === 'staff'),
  };

  return (
    <>
      <div 
        onClick={() => setOpen(true)}
        className="group flex cursor-pointer items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground transition-all hover:border-primary/50 hover:bg-muted"
      >
        <Search className="size-3.5 transition-colors group-hover:text-primary" />
        <span className="max-w-[100px] truncate">Search...</span>
        <kbd className="ml-1 rounded bg-background px-1.5 py-0.5 text-[10px] font-medium shadow-sm border border-border">
          <span className="hidden sm:inline">⌘</span>
          <span className="sm:hidden">Ctrl</span>
          K
        </kbd>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden border-border bg-background shadow-2xl">
          <DialogTitle className="sr-only">Global Search</DialogTitle>
          <Command className="rounded-lg">
            <div className="flex items-center border-b px-3 py-3">
              <Search className="mr-2 size-4 shrink-0 text-muted-foreground" />
              <CommandInput 
                placeholder="Search anime, manga, characters..." 
                value={query}
                onValueChange={setQuery}
                className="border-none focus:ring-0 text-base"
              />
              {isLoading && (
                <div className="mr-2 size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              )}
            </div>
            <CommandList className="max-h-[400px] overflow-y-auto p-2">
              {results.length === 0 && !isLoading && query.length >= 2 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Search className="size-8 text-muted-foreground/50 mb-2" />
                  <CommandEmpty className="text-sm text-muted-foreground">
                    No results found for "{query}"
                  </CommandEmpty>
                </div>
              )}
              
              {Object.entries(groupedResults).map(([type, items]) => (
                items.length > 0 && (
                  <CommandGroup key={type} heading={type.charAt(0).toUpperCase() + type.slice(1)}>
                    {items.map((result, i) => {
                      if (!result.data) return null;
                      const name = result.type === 'anime' || result.type === 'manga' 
                        ? formatDisplayTitle(result.data.title)
                        : formatPersonName(result.data.name);
                      
                      const imageSrc = result.type === 'anime' || result.type === 'manga' 
                        ? (result.data.coverImage?.large || result.data.coverImage?.medium || "") 
                        : (result.data.image?.large || result.data.image?.medium || "");

                      return (
                        <CommandItem 
                          key={`${result.type}-${result.data.id}-${i}`} 
                          onSelect={() => handleSelect(result)}
                          className="flex items-center gap-3 py-3 rounded-md transition-colors cursor-pointer"
                        >
                          <div className="relative size-11 shrink-0 overflow-hidden rounded-md bg-muted">
                            {imageSrc ? (
                              <img 
                                src={imageSrc} 
                                alt={name} 
                                className="size-full object-cover transition-transform duration-200 group-hover:scale-110"
                              />
                            ) : (
                              <div className="flex size-full items-center justify-center text-muted-foreground">
                                {result.type === 'anime' || result.type === 'manga' ? <Film className="size-4" /> : <User className="size-4" />}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-0.5 overflow-hidden">
                            <span className="text-sm font-medium leading-none truncate">{name}</span>
                            <div className="flex items-center gap-1">
                              <Badge variant="secondary" className="h-4 px-1 text-[10px] font-medium uppercase opacity-70">
                                {result.type}
                              </Badge>
                            </div>
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                )
              ))}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
