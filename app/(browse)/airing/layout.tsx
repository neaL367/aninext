import { RadioIcon } from "lucide-react";

import { Crossfade } from "@/components/ui/crossfade";

export default function AiringLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1680px] px-4 py-8 sm:px-7 sm:py-12 lg:px-10">
      <header className="mb-10 border-b border-border-soft pb-10">
        <p className="eyebrow flex items-center gap-2 text-signal">
          <RadioIcon className="size-3" /> Live schedule
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.055em] text-foreground sm:text-6xl">
          Schedule
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          What is airing, what comes next, and where to watch it — a live TV guide for anime.
        </p>
      </header>
      <Crossfade>{children}</Crossfade>
    </div>
  );
}
