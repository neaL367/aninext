"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from "react";
import { DetailScrollRestore } from "@/components/navigation/detail-scroll-restore";
import { ManualScrollRestoration } from "@/components/navigation/manual-scroll-restoration";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { LenisRoot } from "@/components/layout/lenis-root";
import { ScrollToTop } from "@/components/layout/scroll-to-top";

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <NuqsAdapter>
      <ThemeProvider>
        <Suspense fallback={null}>
          <ManualScrollRestoration />
          <DetailScrollRestore />
        </Suspense>
        <LenisRoot>
          {children}
          <ScrollToTop />
        </LenisRoot>
      </ThemeProvider>
    </NuqsAdapter>
  );
}
