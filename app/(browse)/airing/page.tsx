import { Suspense } from "react";
import type { Metadata } from "next";
import { RadioIcon } from "lucide-react";
import { Crossfade } from "@/components/crossfade";
import { AiringContent, AiringContentSkeleton } from "@/features/anime/components/airing/airing-content";

export const metadata: Metadata = {
  title: "Airing schedule — AniNext",
  description: "See what anime is airing this week and plan your next watch.",
  alternates: { canonical: "/airing" },
};

export default function AiringPage({ searchParams }: { searchParams: Promise<{ day?: string }> }) {
  return (
    <Crossfade>
      <div className="mx-auto w-full max-w-[1680px] px-4 py-8 sm:px-7 sm:py-12 lg:px-10 lg:py-16">
        <header className="mb-8">
          <p className="eyebrow flex items-center gap-2 text-accent"><RadioIcon className="size-3" /> Airing this week</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">Schedule</h1>
        </header>

        <Suspense fallback={<AiringContentSkeleton />}>
          <AiringContent searchParams={searchParams} />
        </Suspense>
      </div>
    </Crossfade>
  );
}
