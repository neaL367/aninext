import type { ReactNode } from "react";
import { DetailCoverRegion } from "@/components/detail/detail-cover-region";
import { PageContainer } from "@/components/layout/page-container";
import { DETAIL_PAGE_CONTAINER_CLASS } from "@/lib/styles/detail-page-layout";

type AnimeDetailPageFrameProps = {
  cover?: ReactNode;
  children: ReactNode;
};

/** Shared static shell for the anime detail route (page, loading, and fallbacks). */
export function AnimeDetailPageFrame({
  cover,
  children,
}: AnimeDetailPageFrameProps) {
  return (
    <>
      <DetailCoverRegion>{cover}</DetailCoverRegion>
      <PageContainer className={DETAIL_PAGE_CONTAINER_CLASS}>
        {children}
      </PageContainer>
    </>
  );
}
