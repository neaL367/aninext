import { CollectionPage } from "@/features/anime/components/collection-page";
import { getCollectionMetadata } from "@/features/anime/lib/collection-config";

import type { Metadata } from "next";

export function generateMetadata(): Metadata {
  return getCollectionMetadata("top100");
}

export default function Top100Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return <CollectionPage collection="top100" searchParams={searchParams} />;
}
