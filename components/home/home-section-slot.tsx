import type { Route } from "next";
import { HomeSection } from "@/components/home/home-section";
import type { MediaCard } from "@/lib/anilist/domain/types";

type HomeSectionSlotProps = {
  title: string;
  subtitle?: string;
  href?: Route;
  media: readonly MediaCard[];
  showCountdown?: boolean;
};

export function HomeSectionSlot({
  title,
  subtitle,
  href,
  media,
  showCountdown = false,
}: HomeSectionSlotProps) {
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
