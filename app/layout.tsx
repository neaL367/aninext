import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SiteMobileNav } from "@/components/site-mobile-nav";
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
              <SiteHeader />
              <main id="main-content" className="flex-1 pb-20 md:pb-0">
                {children}
              </main>
              <SiteFooter />
              <SiteMobileNav />
            </div>
          </TooltipProvider>
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
