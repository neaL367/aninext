"use client";

import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="size-9 shrink-0"
        aria-label="Theme"
        disabled
      >
        <SunIcon className="size-4" />
      </Button>
    );
  }

  const activeTheme = theme ?? "system";
  const ThemeIcon =
    activeTheme === "system"
      ? MonitorIcon
      : resolvedTheme === "dark"
        ? MoonIcon
        : SunIcon;

  return (
    <Select
      value={activeTheme}
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
