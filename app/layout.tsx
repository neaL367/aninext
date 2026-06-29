import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SkipLink } from "@/components/layout/skip-link";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Providers } from "@/components/layout/providers";
import { createPageMetadata } from "@/lib/seo/metadata";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = createPageMetadata({
  title: "AniNext",
  description:
    "Discover trending, seasonal, and airing anime with a fast, server-driven browsing experience.",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <TooltipProvider delay={300}>
          <Providers>
            <SkipLink />
            <Suspense
              fallback={
                <header className="sticky top-0 z-40 h-14 border-b border-border bg-background" />
              }
            >
              <SiteHeader />
            </Suspense>
            <main id="main-content" className="min-w-0 flex-1">
              {children}
            </main>
            <SiteFooter />
          </Providers>
        </TooltipProvider>
      </body>
    </html>
  );
}
