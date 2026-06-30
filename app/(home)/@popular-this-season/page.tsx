import { HomeSectionPage } from "@/components/home/home-section-page";
import { HOME_SECTION_BROWSE_HREFS } from "@/lib/browse/url";

export default function PopularThisSeasonSlot() {
  return (
    <HomeSectionPage
      section="popularThisSeason"
      title="Popular This Season"
      seasonSubtitle="current"
      href={HOME_SECTION_BROWSE_HREFS.popularThisSeason}
    />
  );
}
