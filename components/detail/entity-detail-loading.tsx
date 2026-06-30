"use client";

import { usePathname } from "next/navigation";
import { AnimeDetailPageFallback } from "@/components/detail/anime-detail-skeleton";
import { PageContainer } from "@/components/layout/page-container";
import { PersonDetailBodySkeleton } from "@/components/person/person-detail-body-skeleton";
import { PERSON_PAGE_CONTAINER_CLASS } from "@/lib/styles/person-page-layout";

export function EntityDetailLoading() {
  const pathname = usePathname() ?? "";
  const isPersonRoute =
    pathname.startsWith("/character/") || pathname.startsWith("/staff/");

  if (isPersonRoute) {
    return (
      <PageContainer className={PERSON_PAGE_CONTAINER_CLASS}>
        <PersonDetailBodySkeleton />
      </PageContainer>
    );
  }

  return <AnimeDetailPageFallback />;
}
