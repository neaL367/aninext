"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from "react";
import { AppQueryProvider } from "@/components/layout/app-query-provider";
import { DetailScrollRestore } from "@/components/navigation/detail-scroll-restore";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { LenisRoot } from "@/components/layout/lenis-root";

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <NuqsAdapter>
      <AppQueryProvider>
        <ThemeProvider>
          <Suspense fallback={null}>
            <DetailScrollRestore />
          </Suspense>
          <LenisRoot>{children}</LenisRoot>
        </ThemeProvider>
      </AppQueryProvider>
    </NuqsAdapter>
  );
}
