import { ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";

import type { Route } from "next";

const collections: Array<{ href: Route; label: string }> = [
  { href: "/anime/trending", label: "Trending" },
  { href: "/anime/popular", label: "This season" },
  { href: "/anime/top100", label: "Top 100" },
  { href: "/anime/upcoming", label: "Upcoming" },
  { href: "/anime/alltimepopular", label: "All time" },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border-soft bg-surface-1/40 pb-20 md:pb-0">
      <div className="mx-auto grid w-full max-w-[1680px] gap-12 px-4 py-12 sm:px-7 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:px-10 lg:py-16">
        <div>
          <Link href="/" className="group inline-flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-md bg-signal text-white text-sm font-bold shadow-sm transition-all group-hover:bg-signal-strong">
              A
            </span>
            <span className="font-mono text-sm font-semibold tracking-[0.22em] text-foreground">
              ANINEXT
            </span>
          </Link>
          <p className="mt-6 max-w-sm text-sm leading-7 text-muted-foreground">
            A calmer way to find what is airing, rising, and worth your next evening.
          </p>
          <p className="mt-8 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
            Powered by AniList
          </p>
        </div>

        <FooterColumn title="Explore" items={collections} />
        <FooterColumn title="Navigate" items={[{ href: "/airing", label: "Airing schedule" }]} />
        <div>
          <p className="eyebrow">System note</p>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Built for fast scans, deliberate choices, and fewer dead ends.
          </p>
          <Link
            href="/anime/top100"
            className="mt-5 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-signal hover:underline"
          >
            View rankings <ArrowUpRightIcon className="size-3" />
          </Link>
        </div>
      </div>
      <div className="border-t border-border-soft">
        <div className="mx-auto flex w-full max-w-[1680px] items-center justify-between px-4 py-4 sm:px-7 lg:px-10">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
            © 2026 AniNext
          </p>
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
            Not affiliated with AniList
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  items,
}: {
  title: string;
  items: Array<{ href: Route; label: string }>;
}) {
  return (
    <div>
      <p className="eyebrow">{title}</p>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="text-sm text-muted-foreground transition-colors hover:text-signal"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
