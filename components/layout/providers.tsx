"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { LenisRoot } from "@/components/layout/lenis-root";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { getQueryClient } from "@/lib/react-query/get-query-client";

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LenisRoot>{children}</LenisRoot>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
