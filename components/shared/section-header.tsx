import Link from "next/link";
import type { Route } from "next";
import { Button } from "@/components/ui/button";

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
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 text-muted-foreground hover:text-foreground"
          render={<Link href={href} />}
          nativeButton={false}
        >
          {viewAllLabel}
        </Button>
      ) : null}
    </div>
  );
}
