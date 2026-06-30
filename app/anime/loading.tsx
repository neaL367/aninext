import { BrowseContentSkeleton } from "@/components/browse/browse-skeleton";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";

export default function AnimeLoading() {
  return (
    <PageContainer className="py-8 lg:py-10">
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Anime"
          description="Search and filter — use the navigation above to switch lists."
        />
        <BrowseContentSkeleton />
      </div>
    </PageContainer>
  );
}
