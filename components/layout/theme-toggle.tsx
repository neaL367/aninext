"use client";

import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";

function subscribeToMount(callback: () => void) {
  const timeoutId = window.setTimeout(callback, 0);
  return () => window.clearTimeout(timeoutId);
}

function getMountedSnapshot() {
  return true;
}

function getServerMountedSnapshot() {
  return false;
}

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribeToMount,
    getMountedSnapshot,
    getServerMountedSnapshot,
  );

  const activeTheme = mounted ? (theme ?? "system") : "system";
  const ThemeIcon = !mounted
    ? SunIcon
    : activeTheme === "system"
      ? MonitorIcon
      : resolvedTheme === "dark"
        ? MoonIcon
        : SunIcon;

  return (
    <Select
      value={activeTheme}
      disabled={!mounted}
      onValueChange={(value) => {
        if (value === "light" || value === "dark" || value === "system") {
          setTheme(value);
        }
      }}
    >
      <SelectTrigger
        aria-label="Theme"
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-9 shrink-0 text-muted-foreground hover:bg-transparent hover:text-foreground dark:hover:bg-transparent"
          />
        }
        className="border-0 bg-transparent p-0 shadow-none hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent [&_svg:last-child]:hidden"
      >
        <ThemeIcon className="size-4" />
      </SelectTrigger>
      <SelectContent align="end" side="bottom" data-lenis-prevent>
        <SelectItem value="light">
          <SunIcon className="size-4" />
          Light
        </SelectItem>
        <SelectItem value="dark">
          <MoonIcon className="size-4" />
          Dark
        </SelectItem>
        <SelectItem value="system">
          <MonitorIcon className="size-4" />
          System
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
