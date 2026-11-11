import Link from "next/link";

export default function AnimeNotFound() {
  return (
    <div className="mx-auto flex min-h-[55vh] w-full max-w-xl flex-col items-center justify-center gap-5 px-6 text-center">
      <p className="font-mono text-[0.8125rem] uppercase tracking-[0.16em] text-signal">404</p>
      <h1 className="display text-5xl sm:text-6xl">Not found</h1>
      <p className="max-w-sm text-sm leading-6 text-muted-foreground">
        This title does not exist or has been removed.
      </p>
      <Link
        href="/anime/trending"
        className="mt-2 border-b border-border-soft pb-1 font-mono text-[0.8125rem] uppercase tracking-[0.16em] text-foreground transition-colors hover:border-signal hover:text-signal"
      >
        Browse trending
      </Link>
    </div>
  );
}
