import { HomeSectionPage } from "@/components/home/home-section-page";
import { HOME_SECTION_BROWSE_HREFS } from "@/lib/browse/url";

export default function UpcomingNextSeasonSlot() {
  return (
    <HomeSectionPage
      section="upcomingNextSeason"
      title="Upcoming Next Season"
      seasonSubtitle="next"
      href={HOME_SECTION_BROWSE_HREFS.upcomingNextSeason}
    />
  );
}
