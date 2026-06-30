import { HomeSectionPage } from "@/components/home/home-section-page";
import { HOME_SECTION_BROWSE_HREFS } from "@/lib/browse/url";

export default function AiringNowSlot() {
  return (
    <HomeSectionPage
      section="airingNow"
      title="Airing Now"
      subtitle="Popular anime currently releasing"
      href={HOME_SECTION_BROWSE_HREFS.airingNow}
      showCountdown
    />
  );
}
