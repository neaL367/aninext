import { HomeSectionPage } from "@/components/home/home-section-page";
import { HOME_SECTION_BROWSE_HREFS } from "@/lib/routes/browse-url";

export default function TrendingNowSlot() {
  return (
    <HomeSectionPage
      section="trending"
      title="Trending Now"
      subtitle="The most active anime in the past hour"
      href={HOME_SECTION_BROWSE_HREFS.trending}
    />
  );
}
