import { HomeSectionPage } from "@/components/home/home-section-page";
import {
  formatSeasonLabel,
  getNextAnimeSeason,
} from "@/lib/anilist/display/season";
import { HOME_SECTION_BROWSE_HREFS } from "@/lib/browse/url";

export default function UpcomingNextSeasonSlot() {
  return (
    <HomeSectionPage
      section="upcomingNextSeason"
      title="Upcoming Next Season"
      getSubtitle={() => formatSeasonLabel(getNextAnimeSeason())}
      href={HOME_SECTION_BROWSE_HREFS.upcomingNextSeason}
      needsConnection
    />
  );
}
