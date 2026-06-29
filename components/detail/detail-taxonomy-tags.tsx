"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const DEFAULT_VISIBLE = 12;

type DetailTaxonomyTagsProps = {
  tags: readonly { id: number; name: string | null }[];
};

export function DetailTaxonomyTags({ tags }: DetailTaxonomyTagsProps) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? tags : tags.slice(0, DEFAULT_VISIBLE);
  const hiddenCount = tags.length - DEFAULT_VISIBLE;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {visible.map((tag) =>
          tag.name ? (
            <Badge key={tag.id} variant="outline" className="font-normal">
              {tag.name}
            </Badge>
          ) : null
        )}
      </div>
      {hiddenCount > 0 ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-fit px-2 text-xs text-muted-foreground"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Show fewer tags" : `Show ${hiddenCount} more tags`}
        </Button>
      ) : null}
    </div>
  );
}
