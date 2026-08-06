import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SiteMobileNav } from "@/components/site-mobile-nav";
import { ScrollToTop } from "@/components/scroll-to-top";
import { OfflineBanner } from "@/components/offline-banner";
import { SearchCommand } from "@/features/anime/components/search-command";
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
              <Suspense fallback={<HeaderFallback />}><SiteHeader /></Suspense>
              <Suspense fallback={null}><ScrollToTop /></Suspense>
              <main id="main-content" className="min-w-0 flex-1 pb-20 md:pb-0">
                {children}
              </main>
              <SiteFooter />
              <Suspense fallback={null}><SiteMobileNav /></Suspense>
            </div>
          </TooltipProvider>
          <Toaster position="top-right" />
          <OfflineBanner />
        </Providers>
      </body>
    </html>
  );
}

function HeaderFallback() {
  return <header className="sticky top-0 z-50 border-b border-border-soft bg-background/90 backdrop-blur-xl" aria-hidden><div className="mx-auto min-h-16 w-full max-w-[1680px] px-4 sm:px-7 lg:px-10" /></header>;
}
