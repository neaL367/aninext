import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SkipLink } from "@/components/layout/skip-link";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Providers } from "@/components/layout/providers";
import { createRootLayoutMetadata } from "@/lib/seo/metadata";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = createRootLayoutMetadata({
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
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} min-h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>
          <TooltipProvider delay={250}>
            <SkipLink />
            <Suspense fallback={null}>
              <SiteHeader />
            </Suspense>
            <main id="main-content" className="min-w-0 flex-1">
              {children}
            </main>
            <SiteFooter />
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
