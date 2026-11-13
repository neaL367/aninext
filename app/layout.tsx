import { Analytics } from "@vercel/analytics/next";
import { BotIdClient } from "botid/client";
import { GeistSerif } from "geist/font/serif/variable";
import { Suspense } from "react";

import { OfflineBanner } from "@/components/offline-banner";
import { Providers } from "@/components/providers";
import { ScrollToTop } from "@/components/scroll-to-top";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader, SiteHeaderFallback } from "@/components/site-header";
import { SiteMobileNav } from "@/components/site-mobile-nav";
import { ScrollToTopButton } from "@/components/ui/scroll-to-top-button";
import { SearchCommand } from "@/features/anime/components/search-command";

import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AniNext",
    template: "%s — AniNext",
  },
  description: "What to watch next. A quiet index of anime worth your evening.",
  metadataBase: new URL("https://ani-next.vercel.app"),
};

// Server Action posts land on the collection route the action runs from.
const BOT_PROTECTED_ROUTES = [{ path: "/anime/*", method: "POST" }];

// BotID's client script is served by Vercel's BotID routing. Anywhere else the
// challenge request 404s, and the SDK's patched fetch then waits on a challenge
// that never arrives — which silently stalls the Server Action it is attached
// to. Mount it only where that routing exists.
const BOTID_ENABLED = process.env.VERCEL === "1";

export const viewport: Viewport = {
  themeColor: "#060606",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${GeistSerif.variable} dark`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        {/* Turbopack ignores the instrumentation-client file convention, so the
            BotID challenge is mounted here instead. Only the infinite-scroll
            Server Action is protected; page views stay CDN-cached. */}
        {BOTID_ENABLED && <BotIdClient protect={BOT_PROTECTED_ROUTES} />}
      </head>
      <body className="font-sans antialiased">
        <Providers>
          <SearchCommand />
          <div className="flex min-h-screen flex-col">
            <a
              href="#main-content"
              className="sr-only z-[100] rounded-sm bg-background px-3 py-2 text-sm font-medium focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
            >
              Skip to content
            </a>
            <Suspense fallback={<SiteHeaderFallback />}>
              <SiteHeader />
            </Suspense>
            <Suspense fallback={null}>
              <ScrollToTop />
            </Suspense>
            <main id="main-content" className="min-w-0 flex-1 pb-20 md:pb-0">
              {children}
            </main>
            <SiteFooter />
            <Suspense fallback={null}>
              <SiteMobileNav />
            </Suspense>
            <Suspense fallback={null}>
              <ScrollToTopButton />
            </Suspense>
          </div>
          <OfflineBanner />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
