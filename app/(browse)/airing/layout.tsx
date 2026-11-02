import { PageTransition } from "@/components/ui/crossfade";

export default function AiringLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1760px] px-4 pb-16 pt-10 sm:px-7 sm:pt-14 lg:px-10">
      <header className="border-b border-border-soft pb-7">
        <h1 className="display text-[clamp(2.8rem,8vw,6rem)]">Schedule</h1>
      </header>
      <div className="mt-8">
        <PageTransition>{children}</PageTransition>
      </div>
    </div>
  );
}
