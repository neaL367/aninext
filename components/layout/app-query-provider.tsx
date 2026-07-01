"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/react-query/get-query-client";

type AppQueryProviderProps = {
  children: React.ReactNode;
};

export function AppQueryProvider({ children }: AppQueryProviderProps) {
  return <QueryClientProvider client={getQueryClient()}>{children}</QueryClientProvider>;
}
