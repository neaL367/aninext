"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TAXONOMY_CHIP_CLASS } from "@/lib/styles/taxonomy-chips";

const DEFAULT_VISIBLE = 12;

type DetailTaxonomyTagsProps = {
  tags: readonly { id: number; name: string | null }[];
};

export function DetailTaxonomyTags({ tags }: DetailTaxonomyTagsProps) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = tags.length > DEFAULT_VISIBLE;
  const visible = expanded ? tags : tags.slice(0, DEFAULT_VISIBLE);
  const hiddenCount = tags.length - DEFAULT_VISIBLE;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-wrap gap-2">
        {visible.map((tag) =>
          tag.name ? (
            <Badge
              key={tag.id}
              variant="outline"
              className={TAXONOMY_CHIP_CLASS}
            >
              {tag.name}
            </Badge>
          ) : null
        )}
      </div>
      {hasMore ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-fit px-2 text-xs text-muted-foreground"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? (
            <>
              Show fewer tags
              <ChevronUpIcon className="size-3.5" />
            </>
          ) : (
            <>
              Show {hiddenCount} more tags
              <ChevronDownIcon className="size-3.5" />
            </>
          )}
        </Button>
      ) : null}
    </div>
  );
}
