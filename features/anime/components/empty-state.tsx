import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import type { ComponentType } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
}) {
  "use memo";
  return (
    <Empty className="rounded-[2px] border border-border-soft py-10">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="rounded-[2px] bg-transparent text-muted-foreground">
          <Icon className="size-4" />
        </EmptyMedia>
        <EmptyTitle className="font-serif text-lg font-normal">{title}</EmptyTitle>
      </EmptyHeader>
      {description && (
        <EmptyContent>
          <EmptyDescription>{description}</EmptyDescription>
        </EmptyContent>
      )}
    </Empty>
  );
}
