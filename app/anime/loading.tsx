import { BrowseSkeleton } from "@/components/browse/browse-skeleton";
import { PageContainer } from "@/components/layout/page-container";

export default function AnimeLoading() {
  return (
    <PageContainer className="py-8 lg:py-10">
      <BrowseSkeleton />
    </PageContainer>
  );
}
