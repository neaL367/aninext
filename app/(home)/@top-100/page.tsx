import { HomeSectionPage } from "@/components/home/home-section-page";
import { HOME_SECTION_BROWSE_HREFS } from "@/lib/routes/browse-url";

export default function Top100Slot() {
  return (
    <HomeSectionPage
      section="top100"
      title="Top 100"
      subtitle="Highest rated anime on AniList"
      href={HOME_SECTION_BROWSE_HREFS.top100}
    />
  );
}
