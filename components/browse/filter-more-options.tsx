"use client";

import { useEffect, useRef, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import type { MediaSource } from "@/lib/anilist/domain/types";
import type { AnimeListParams } from "@/lib/browse/params";
import {
  COUNTRY_LABELS,
  formatCountry,
  formatMediaSource,
  MEDIA_SOURCE_LABELS,
} from "@/lib/anilist/display/labels";

const ALL_SOURCES = Object.keys(MEDIA_SOURCE_LABELS) as MediaSource[];
const ALL_COUNTRIES = Object.keys(COUNTRY_LABELS);

type FilterMoreOptionsProps = {
  params: AnimeListParams;
  onPatch: (partial: Partial<AnimeListParams>) => void;
};

function parseTagsInput(value: string): string[] {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function tagsEqual(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((tag, index) => tag === b[index]);
}

function TagsInput({
  tags,
  onPatch,
}: {
  tags: string[];
  onPatch: (partial: Partial<AnimeListParams>) => void;
}) {
  const onPatchRef = useRef(onPatch);
  const tagsLabel = tags.join(", ");
  const [tagInput, setTagInput] = useState(tagsLabel);
  const debouncedTagInput = useDebouncedValue(tagInput, 400);

  useEffect(() => {
    onPatchRef.current = onPatch;
  }, [onPatch]);

  useEffect(() => {
    const nextTags = parseTagsInput(debouncedTagInput);
    if (!tagsEqual(nextTags, tags)) {
      onPatchRef.current({ tags: nextTags });
    }
  }, [debouncedTagInput, tags]);

  return (
    <Input
      id="filter-tags"
      value={tagInput}
      onChange={(e) => setTagInput(e.target.value)}
      placeholder="Isekai, School"
      className="h-8 text-xs"
    />
  );
}

export function FilterMoreOptions({ params, onPatch }: FilterMoreOptionsProps) {
  const hasMore = params.source != null || params.country != null || params.tags.length > 0;

  const [userOpenSections, setUserOpenSections] = useState<string[]>(() =>
    hasMore ? ["more"] : [],
  );
  const openSections =
    hasMore && !userOpenSections.includes("more")
      ? ["more", ...userOpenSections]
      : userOpenSections;

  return (
    <Accordion value={openSections} onValueChange={setUserOpenSections}>
      <AccordionItem value="more">
        <AccordionTrigger className="py-2 text-xs font-medium text-muted-foreground hover:no-underline">
          More options
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-3 pb-1">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="filter-source" className="text-xs text-muted-foreground">
                Source
              </Label>
              <Select
                value={params.source ?? "any"}
                onValueChange={(v) => onPatch({ source: v === "any" ? null : (v as MediaSource) })}
              >
                <SelectTrigger id="filter-source" className="h-8 w-full text-xs">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any source</SelectItem>
                  {ALL_SOURCES.map((source) => (
                    <SelectItem key={source} value={source}>
                      {formatMediaSource(source)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="filter-country" className="text-xs text-muted-foreground">
                Country
              </Label>
              <Select
                value={params.country ?? "any"}
                onValueChange={(v) => onPatch({ country: v === "any" ? null : v })}
              >
                <SelectTrigger id="filter-country" className="h-8 w-full text-xs">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any country</SelectItem>
                  {ALL_COUNTRIES.map((code) => (
                    <SelectItem key={code} value={code}>
                      {formatCountry(code)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="filter-tags" className="text-xs text-muted-foreground">
              Tags
            </Label>
            <TagsInput key={params.tags.join(",")} tags={params.tags} onPatch={onPatch} />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
