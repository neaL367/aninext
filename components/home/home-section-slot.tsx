import type { Route } from "next";
import { HomeSection } from "@/components/home/home-section";
import type { HomeSectionId } from "@/lib/anilist/server/get-home-sections";
import { getHomeSectionMedia } from "@/lib/anilist/server/get-home-sections";

type HomeSectionSlotProps = {
  title: string;
  subtitle?: string;
  href?: Route;
  showCountdown?: boolean;
  section: HomeSectionId;
};

export async function HomeSectionSlot({
  title,
  subtitle,
  href,
  showCountdown = false,
  section,
}: HomeSectionSlotProps) {
  const media = await getHomeSectionMedia(section);

  return (
    <HomeSection
      title={title}
      subtitle={subtitle}
      href={href}
      media={media}
      showCountdown={showCountdown}
    />
  );
}
