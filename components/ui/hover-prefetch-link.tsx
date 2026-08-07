"use client";

import Link from "next/link";
import { useState, type ComponentProps } from "react";

export function HoverPrefetchLink({
  href,
  prefetch,
  onMouseEnter,
  onFocus,
  onTouchStart,
  ...props
}: ComponentProps<typeof Link>) {
  const [intent, setIntent] = useState(false);
  return (
    <Link
      {...props}
      href={href}
      prefetch={prefetch === false ? false : intent ? true : null}
      onMouseEnter={(e) => {
        setIntent(true);
        onMouseEnter?.(e);
      }}
      onFocus={(e) => {
        setIntent(true);
        onFocus?.(e);
      }}
      onTouchStart={(e) => {
        setIntent(true);
        onTouchStart?.(e);
      }}
    />
  );
}
