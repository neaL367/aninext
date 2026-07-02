"use client";

import { Suspense, use, type ReactNode } from "react";
import { AiringItemCard } from "@/components/airing/airing-item-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useClientMounted } from "@/lib/hooks/use-client-mounted";
import type { AiringScheduleItem } from "@/lib/anilist/domain/types";
import { cn } from "@/lib/utils";

type AiringDayCountProps = {
  promise: Promise<AiringScheduleItem[]>;
};

export function AiringDayCount({ promise }: AiringDayCountProps) {
  const items = use(promise);
  return <AiringDayTabCountValue count={items.length} />;
}

export function AiringDayTabCount({ promise }: { promise: Promise<number> }) {
  const count = use(promise);
  return <AiringDayTabCountValue count={count} />;
}

export function AiringDayTabCountBadge({ count }: { count: number | undefined }) {
  if (count === undefined) {
    return <AiringDayCountFallback />;
  }

  return <AiringDayTabCountValue count={count} />;
}

function AiringDayTabCountValue({ count }: { count: number }) {
  return (
    <span
      className={cn(
        "text-[11px] font-medium tabular-nums",
        count > 0 ? "opacity-90" : "opacity-55",
      )}
    >
      {count}
    </span>
  );
}

export function AiringDayCountFallback() {
  return (
    <span
      aria-hidden
      className="inline-block h-3.5 w-4 animate-pulse rounded-sm bg-current opacity-25"
    />
  );
}

type AiringDayListProps = {
  promise: Promise<AiringScheduleItem[]>;
};

export function AiringDayList({ promise }: AiringDayListProps) {
  const items = use(promise);

  if (!items.length) {
    return (
      <EmptyState
        title="No shows scheduled"
        description="Nothing is airing on this day. Try another weekday above."
      />
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div key={item.id} className="airing-item-cell">
          <AiringItemCard item={item} />
        </div>
      ))}
    </div>
  );
}

export function AiringDayListSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-24 rounded-md sm:h-28" />
      ))}
    </div>
  );
}

type AiringDayShowCountProps = {
  promise: Promise<AiringScheduleItem[]>;
};

export function AiringDayShowCount({ promise }: AiringDayShowCountProps) {
  const items = use(promise);
  return (
    <>
      {items.length} {items.length === 1 ? "show" : "shows"}
    </>
  );
}

export function AiringDayShowCountFallback() {
  return <span aria-hidden className="inline-block h-4 w-16 animate-pulse rounded-md bg-muted" />;
}

function ClientSuspense({ fallback, children }: { fallback: ReactNode; children: ReactNode }) {
  const mounted = useClientMounted();
  if (!mounted) {
    return fallback;
  }
  return <Suspense fallback={fallback}>{children}</Suspense>;
}

export function AiringDayCountSuspense({ promise }: { promise: Promise<AiringScheduleItem[]> }) {
  return (
    <ClientSuspense fallback={<AiringDayCountFallback />}>
      <AiringDayCount promise={promise} />
    </ClientSuspense>
  );
}

export function AiringDayTabCountSuspense({ promise }: { promise: Promise<number> }) {
  return (
    <ClientSuspense fallback={<AiringDayCountFallback />}>
      <AiringDayTabCount promise={promise} />
    </ClientSuspense>
  );
}

export function AiringDayListSuspense({ promise }: { promise: Promise<AiringScheduleItem[]> }) {
  return (
    <ClientSuspense fallback={<AiringDayListSkeleton />}>
      <AiringDayList promise={promise} />
    </ClientSuspense>
  );
}

export function AiringDayShowCountSuspense({
  promise,
}: {
  promise: Promise<AiringScheduleItem[]>;
}) {
  return (
    <ClientSuspense fallback={<AiringDayShowCountFallback />}>
      <AiringDayShowCount promise={promise} />
    </ClientSuspense>
  );
}
