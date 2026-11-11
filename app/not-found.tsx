import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center gap-5 px-5 text-center sm:px-6">
      <p className="font-mono text-[0.8125rem] uppercase tracking-[0.16em] text-signal">404</p>
      <h1 className="display text-5xl sm:text-6xl">Off the schedule</h1>
      <p className="max-w-sm text-sm leading-6 text-muted-foreground">
        This page does not exist. The title may have moved, or the link is out of date.
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        <Link
          href="/"
          className="inline-flex min-h-10 items-center border-b border-border-soft pb-1 font-mono text-[0.8125rem] uppercase tracking-[0.16em] text-foreground transition-colors hover:border-signal hover:text-signal"
        >
          Go home
        </Link>
        <Link
          href="/anime/trending"
          className="inline-flex min-h-10 items-center border-b border-border-soft pb-1 font-mono text-[0.8125rem] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-signal hover:text-signal"
        >
          Browse trending
        </Link>
      </div>
    </div>
  );
}
