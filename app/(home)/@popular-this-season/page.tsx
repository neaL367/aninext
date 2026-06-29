import { HomeSectionPage } from "@/components/home/home-section-page";
import {
  formatSeasonLabel,
  getCurrentAnimeSeason,
} from "@/lib/anilist/utils/season";
import { HOME_SECTION_BROWSE_HREFS } from "@/lib/routes/browse-url";

export default function PopularThisSeasonSlot() {
  return (
    <HomeSectionPage
      section="popularThisSeason"
      title="Popular This Season"
      getSubtitle={() => formatSeasonLabel(getCurrentAnimeSeason())}
      href={HOME_SECTION_BROWSE_HREFS.popularThisSeason}
      needsConnection
    />
  );
}
