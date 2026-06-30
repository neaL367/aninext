import { HomeSectionPage } from "@/components/home/home-section-page";
import { HOME_SECTION_BROWSE_HREFS } from "@/lib/browse/url";

export default function AllTimePopularSlot() {
  return (
    <HomeSectionPage
      section="allTimePopular"
      title="All Time Popular"
      subtitle="The most popular anime on AniList"
      href={HOME_SECTION_BROWSE_HREFS.allTimePopular}
    />
  );
}
