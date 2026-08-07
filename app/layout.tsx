import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";

import { OfflineBanner } from "@/components/offline-banner";
import { Providers } from "@/components/providers";
import { ScrollToTop } from "@/components/scroll-to-top";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader, SiteHeaderFallback } from "@/components/site-header";
import { SiteMobileNav } from "@/components/site-mobile-nav";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SearchCommand } from "@/features/anime/components/search-command";

import type { Metadata, Viewport } from "next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AniNext — Discover Anime",
    template: "%s | AniNext",
  },
  description: "Discover trending, popular, and upcoming anime from AniList.",
  metadataBase: new URL("https://ani-next.vercel.app"),
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <Providers>
          <TooltipProvider>
            <SearchCommand />
            <div className="flex min-h-screen flex-col">
              <a
                href="#main-content"
                className="sr-only z-[100] rounded-md bg-background px-3 py-2 text-sm font-medium focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
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
            </div>
          </TooltipProvider>
          <Toaster position="top-right" />
          <OfflineBanner />
        </Providers>
      </body>
    </html>
  );
}
