"use client";

import { WifiOffIcon } from "lucide-react";
import { useOffline } from "next/offline";

export function OfflineBanner() {
  const isOffline = useOffline();

  if (!isOffline) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-0 z-[90] flex items-center justify-center gap-2 border-t border-border-soft bg-background/95 px-4 py-2.5 backdrop-blur-xl"
    >
      <WifiOffIcon className="size-3.5 text-live-badge" />
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-foreground">
        You are offline. Retrying automatically when connection returns.
      </p>
    </div>
  );
}
