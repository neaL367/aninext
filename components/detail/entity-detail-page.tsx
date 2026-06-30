import { Suspense } from "react";
import {
  AnimeDetailBodyLoader,
  DetailCoverBannerLoader,
} from "@/components/detail/anime-detail-content";
import { AnimeDetailPageFrame } from "@/components/detail/anime-detail-page-frame";
import { AnimeDetailBodySkeleton } from "@/components/detail/anime-detail-body-skeleton";
import {
  MangaDetailBodyLoader,
  MangaDetailCoverBannerLoader,
} from "@/components/detail/manga-detail-content";
import { PageContainer } from "@/components/layout/page-container";
import {
  CharacterDetailBodyLoader,
  StaffDetailBodyLoader,
} from "@/components/person/person-detail-content";
import { PersonDetailBodySkeleton } from "@/components/person/person-detail-body-skeleton";
import type { DetailCategory } from "@/lib/anilist/domain/detail-categories";
import {
  toSlugDetailParams,
  type EntityDetailRouteParams,
} from "@/lib/anilist/domain/detail-route-params";
import { PERSON_PAGE_CONTAINER_CLASS } from "@/lib/styles/person-page-layout";

type EntityDetailPageProps = {
  category: DetailCategory;
  params: EntityDetailRouteParams;
};

export function EntityDetailPage({ category, params }: EntityDetailPageProps) {
  const slugParams = toSlugDetailParams(params);

  switch (category) {
    case "anime":
      return (
        <AnimeDetailPageFrame
          cover={
            <Suspense fallback={null}>
              <DetailCoverBannerLoader params={slugParams} />
            </Suspense>
          }
        >
          <Suspense fallback={<AnimeDetailBodySkeleton />}>
            <AnimeDetailBodyLoader params={slugParams} />
          </Suspense>
        </AnimeDetailPageFrame>
      );
    case "manga":
      return (
        <AnimeDetailPageFrame
          cover={
            <Suspense fallback={null}>
              <MangaDetailCoverBannerLoader params={slugParams} />
            </Suspense>
          }
        >
          <Suspense fallback={<AnimeDetailBodySkeleton />}>
            <MangaDetailBodyLoader params={slugParams} />
          </Suspense>
        </AnimeDetailPageFrame>
      );
    case "character":
      return (
        <PageContainer className={PERSON_PAGE_CONTAINER_CLASS}>
          <Suspense fallback={<PersonDetailBodySkeleton />}>
            <CharacterDetailBodyLoader params={slugParams} />
          </Suspense>
        </PageContainer>
      );
    case "staff":
      return (
        <PageContainer className={PERSON_PAGE_CONTAINER_CLASS}>
          <Suspense fallback={<PersonDetailBodySkeleton />}>
            <StaffDetailBodyLoader params={slugParams} />
          </Suspense>
        </PageContainer>
      );
  }
}
