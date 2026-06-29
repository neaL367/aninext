import type { Route } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { HomeSectionSlot } from "@/components/home/home-section-slot";
import { SectionSkeleton } from "@/components/shared/section-skeleton";
import type { HomeSectionId } from "@/lib/anilist/server/get-home-sections";

type HomeSectionPageProps = {
  section: HomeSectionId;
  title: string;
  subtitle?: string;
  getSubtitle?: () => string;
  href?: Route;
  showCountdown?: boolean;
  needsConnection?: boolean;
};

async function HomeSectionPageContent({
  section,
  title,
  subtitle,
  getSubtitle,
  href,
  showCountdown = false,
  needsConnection = false,
}: HomeSectionPageProps) {
  if (needsConnection) {
    await connection();
  }

  return (
    <HomeSectionSlot
      title={title}
      subtitle={getSubtitle ? getSubtitle() : subtitle}
      href={href}
      section={section}
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
