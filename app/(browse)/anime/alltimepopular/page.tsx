import { CollectionPage } from "@/features/anime/components/collection-page";
import { getCollectionMetadata } from "@/features/anime/lib/collection-config";

import type { Metadata } from "next";

export function generateMetadata(): Metadata {
  return getCollectionMetadata("alltimepopular");
}

export default function AllTimePopularPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return <CollectionPage collection="alltimepopular" searchParams={searchParams} />;
}
