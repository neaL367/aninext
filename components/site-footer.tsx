import Link from "next/link";

import type { Route } from "next";

const links: Array<{ href: Route; label: string }> = [
  { href: "/anime/trending", label: "Trending" },
  { href: "/anime/top100", label: "Top 100" },
  { href: "/anime/seasonal", label: "Seasonal" },
  { href: "/airing", label: "Airing" },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border-soft pb-20 md:pb-0">
      <div className="mx-auto flex w-full max-w-[1760px] flex-col gap-8 px-4 py-10 sm:px-7 lg:flex-row lg:items-end lg:justify-between lg:px-10">
        <div>
          <Link
            href="/"
            className="inline-flex items-baseline gap-1 font-serif text-2xl leading-none tracking-[-0.03em] text-foreground"
          >
            AniNext
            <span aria-hidden="true" className="size-1 rounded-full bg-signal" />
          </Link>
          <p className="mt-3 max-w-xs text-xs leading-6 text-muted-foreground">
            A quiet index of anime. Data by AniList.
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap gap-x-7 gap-y-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-border-soft">
        <div className="mx-auto flex w-full max-w-[1760px] items-center justify-between gap-4 px-4 py-4 sm:px-7 lg:px-10">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground/70">
            © 2026 AniNext
          </p>
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground/70">
            Not affiliated with AniList
          </p>
        </div>
      </div>
    </footer>
  );
}
