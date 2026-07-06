import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";
import { viewAllLinkClassName } from "@/lib/styles/nav-link-styles";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  /** Streamed or deferred subtitle UI — takes precedence over `subtitle`. */
  subtitleSlot?: ReactNode;
  href?: Route;
  viewAllLabel?: string;
};

export function getSectionHeadingId(title: string) {
  return title.toLowerCase().replace(/\s+/g, "-");
}

export function SectionHeader({
  title,
  subtitle,
  subtitleSlot,
  href,
  viewAllLabel = "View all",
}: SectionHeaderProps) {
  const headingId = getSectionHeadingId(title);

  return (
    <div className="flex items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h2
          id={headingId}
          className="text-base font-medium tracking-tight text-foreground sm:text-lg"
        >
          {title}
        </h2>
        {subtitleSlot ??
          (subtitle ? (
            <p className="text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
          ) : null)}
      </div>
      {href ? (
        <Link href={href} prefetch={false} className={viewAllLinkClassName}>
          {viewAllLabel}
        </Link>
      ) : null}
    </div>
  );
}
