import type { Metadata } from "next";
import { EntityDetailPage } from "@/components/detail/entity-detail-page";
import { parseDetailCategory } from "@/lib/anilist/domain/detail-categories";
import type { EntityDetailRouteParams } from "@/lib/anilist/domain/detail-route-params";
import { createEntityDetailMetadata } from "@/lib/seo/entity-detail-metadata";
import { Suspense } from "react";

type EntityDetailRouteProps = {
  params: EntityDetailRouteParams;
};

export async function generateMetadata({ params }: EntityDetailRouteProps): Promise<Metadata> {
  const { category: categoryParam } = await params;
  const category = parseDetailCategory(categoryParam);
  return createEntityDetailMetadata(category, params);
}

export default function EntityDetailRoute({ params }: EntityDetailRouteProps) {
  return (
    <Suspense fallback={<EntityDetailSkeleton />}>
      <EntityDetailRouteInner params={params} />
    </Suspense>
  );
}

async function EntityDetailRouteInner({ params }: EntityDetailRouteProps) {
  const { category: categoryParam } = await params;
  const category = parseDetailCategory(categoryParam);
  return <EntityDetailPage category={category} params={params} />;
}

function EntityDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-4">
      <div className="h-8 w-1/3 rounded bg-muted" />
      <div className="h-64 w-full rounded bg-muted" />
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-5/6 rounded bg-muted" />
      </div>
    </div>
  );
}
