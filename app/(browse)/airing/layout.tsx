import { RadioIcon } from "lucide-react";

import { Crossfade } from "@/components/ui/crossfade";

export default function AiringLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1680px] px-4 py-8 sm:px-7 sm:py-12 lg:px-10 lg:py-16">
      <header className="mb-8">
        <p className="eyebrow flex items-center gap-2 text-accent">
          <RadioIcon className="size-3" /> Airing this week
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">Schedule</h1>
      </header>
      <Crossfade>{children}</Crossfade>
    </div>
  );
}
