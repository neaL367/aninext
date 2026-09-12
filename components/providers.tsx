"use client";

import { ThemeProvider } from "next-themes";
import { useEffect, type ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    const offset = -new Date().getTimezoneOffset();
    document.cookie = `tz_offset=${offset}; path=/; max-age=31536000; SameSite=Lax`;
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
