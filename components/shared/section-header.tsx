import Link from "next/link";
import type { Route } from "next";
import { viewAllLinkClassName } from "@/lib/ui/nav-link-styles";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  href?: Route;
  viewAllLabel?: string;
};

export function SectionHeader({
  title,
  subtitle,
  href,
  viewAllLabel = "View all",
}: SectionHeaderProps) {
  const headingId = title.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h2
          id={headingId}
          className="text-base font-medium tracking-tight text-foreground sm:text-lg"
        >
          {title}
        </h2>
        {subtitle ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {subtitle}
          </p>
        ) : null}
      </div>
      {href ? (
        <Link href={href} prefetch className={viewAllLinkClassName}>
          {viewAllLabel}
        </Link>
      ) : null}
    </div>
  );
}
