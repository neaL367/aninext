import Link from "next/link";
import type { Route } from "next";
import { Fragment } from "react";

export type DetailStaticBreadcrumbCrumb = {
  label: string;
  href?: Route;
};

type DetailStaticBreadcrumbProps = {
  crumbs: readonly DetailStaticBreadcrumbCrumb[];
};

export function DetailStaticBreadcrumb({ crumbs }: DetailStaticBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1.5">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <Fragment key={`${crumb.label}-${index}`}>
              {index > 0 ? <li aria-hidden>/</li> : null}
              <li className={isLast ? "truncate text-foreground" : undefined}>
                {crumb.href && !isLast ? (
                  <Link href={crumb.href} prefetch className="hover:text-foreground">
                    {crumb.label}
                  </Link>
                ) : (
                  crumb.label
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
