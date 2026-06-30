import type { ReactNode } from "react";
import { Suspense } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { SectionSkeleton } from "@/components/shared/section-skeleton";

export const instant = false;

type HomeLayoutProps = {
  children: ReactNode;
  "trending-now": ReactNode;
  "airing-now": ReactNode;
  "popular-this-season": ReactNode;
  "upcoming-next-season": ReactNode;
  "all-time-popular": ReactNode;
  "top-100": ReactNode;
};

export default function HomeLayout({
  children,
  "trending-now": trendingNow,
  "airing-now": airingNow,
  "popular-this-season": popularThisSeason,
  "upcoming-next-season": upcomingNextSeason,
  "all-time-popular": allTimePopular,
  "top-100": top100,
}: HomeLayoutProps) {
  return (
    <PageContainer className="flex flex-col gap-10 py-8 lg:gap-12 lg:py-10">
      {children}
      <Suspense fallback={<SectionSkeleton />}>{trendingNow}</Suspense>
      <Suspense fallback={<SectionSkeleton />}>{airingNow}</Suspense>
      <Suspense fallback={<SectionSkeleton />}>{popularThisSeason}</Suspense>
      <Suspense fallback={<SectionSkeleton />}>{upcomingNextSeason}</Suspense>
      <Suspense fallback={<SectionSkeleton />}>{allTimePopular}</Suspense>
      <Suspense fallback={<SectionSkeleton />}>{top100}</Suspense>
    </PageContainer>
  );
}
