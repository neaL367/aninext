"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { AppQueryProvider } from "@/components/layout/app-query-provider";
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
          <LenisRoot>{children}</LenisRoot>
        </ThemeProvider>
      </AppQueryProvider>
    </NuqsAdapter>
  );
}
