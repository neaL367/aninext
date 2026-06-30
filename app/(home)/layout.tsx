import type { ReactNode } from "react";
import { PageContainer } from "@/components/layout/page-container";

type HomeLayoutProps = {
  children: ReactNode;
  "trending-now": ReactNode;
  "airing-now": ReactNode;
  "popular-this-season": ReactNode;
  "upcoming-next-season": ReactNode;
  "all-time-popular": ReactNode;
  "top-100": ReactNode;
};

export const instant = false;

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
      {trendingNow}
      {airingNow}
      {popularThisSeason}
      {upcomingNextSeason}
      {allTimePopular}
      {top100}
    </PageContainer>
  );
}
