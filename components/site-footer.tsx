import Link from "next/link";
import type { Route } from "next";
import { SparklesIcon } from "lucide-react";

const collections: Array<{ href: Route; label: string }> = [
  { href: "/anime/trending", label: "Trending" },
  { href: "/anime/popular", label: "Popular" },
  { href: "/anime/top100", label: "Top 100" },
  { href: "/anime/upcoming", label: "Upcoming" },
  { href: "/anime/alltimepopular", label: "All-Time" },
];

const pages: Array<{ href: Route; label: string }> = [
  { href: "/airing", label: "Airing Schedule" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border-soft bg-surface-1/30">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="col-span-1 sm:col-span-2 lg:col-span-1">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-accent/10">
              <SparklesIcon className="size-4 text-accent" />
            </div>
            <span className="text-lg font-semibold tracking-tight">AniNext</span>
          </Link>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Discover trending, popular, and upcoming anime. Your next favorite show is waiting.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Collections
          </h3>
          <ul className="mt-4 flex flex-col gap-2">
            {collections.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Pages
          </h3>
          <ul className="mt-4 flex flex-col gap-2">
            {pages.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            About
          </h3>
          <ul className="mt-4 flex flex-col gap-2">
            <li className="text-sm text-muted-foreground">
              Data by AniList
            </li>
            <li className="text-sm text-muted-foreground">
              Built with Next.js 16
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border-soft">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-xs text-muted-foreground">
            © 2026 AniNext. Not affiliated with AniList.
          </p>
          <p className="text-xs text-muted-foreground">
            Made with care
          </p>
        </div>
      </div>
    </footer>
  );
}
