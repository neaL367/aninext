import type { Metadata } from "next";
import { EntityDetailPage } from "@/components/detail/entity-detail-page";
import { parseDetailCategory } from "@/lib/anilist/domain/detail-categories";
import type { EntityDetailRouteParams } from "@/lib/anilist/domain/detail-route-params";
import { getEntityDetailStaticParams } from "@/lib/anilist/server/entity-detail-static-params";
import { createEntityDetailMetadata } from "@/lib/seo/entity-detail-metadata";

export const instant = false;

type EntityDetailRouteProps = {
  params: EntityDetailRouteParams;
};

export async function generateStaticParams() {
  return getEntityDetailStaticParams();
}

export async function generateMetadata({ params }: EntityDetailRouteProps): Promise<Metadata> {
  const { category: categoryParam } = await params;
  const category = parseDetailCategory(categoryParam);
  return createEntityDetailMetadata(category, params);
}

export default async function EntityDetailRoute({ params }: EntityDetailRouteProps) {
  const { category: categoryParam } = await params;
  const category = parseDetailCategory(categoryParam);
  return <EntityDetailPage category={category} params={params} />;
}
