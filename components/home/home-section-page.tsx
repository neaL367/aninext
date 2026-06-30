import type { Route } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { HomeSectionSlot } from "@/components/home/home-section-slot";
import { SectionSkeleton } from "@/components/shared/section-skeleton";
import type { HomeSectionId } from "@/lib/anilist/domain/home-sections";
import { getHomeSectionMedia } from "@/lib/anilist/server/get-home-sections";

type HomeSectionPageProps = {
  section: HomeSectionId;
  title: string;
  subtitle?: string;
  getSubtitle?: () => string;
  href?: Route;
  needsConnection?: boolean;
  showCountdown?: boolean;
};

async function HomeSectionPageContent({
  section,
  title,
  subtitle,
  getSubtitle,
  href,
  needsConnection = false,
  showCountdown = false,
}: HomeSectionPageProps) {
  if (needsConnection) {
    await connection();
  }

  const media = await getHomeSectionMedia(section);

  return (
    <HomeSectionSlot
      title={title}
      subtitle={getSubtitle ? getSubtitle() : subtitle}
      href={href}
      media={media}
      showCountdown={showCountdown}
    />
  );
}

export function HomeSectionPage(props: HomeSectionPageProps) {
  return (
    <Suspense fallback={<SectionSkeleton />}>
      <HomeSectionPageContent {...props} />
    </Suspense>
  );
}
