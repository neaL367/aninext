"use client";

import Link from "next/link";
import type { Route } from "next";
import { useParams, useRouter } from "next/navigation";
import { Fragment, useCallback, useLayoutEffect, useState, type MouseEvent } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  buildDetailBreadcrumbs,
  readDetailReturn,
  type DetailBreadcrumbCrumb,
  type DetailReturn,
} from "@/lib/navigation/detail-return";
import { queueScrollRestore } from "@/lib/navigation/scroll-restore";
import { cn } from "@/lib/utils";

type DetailBreadcrumbProps = {
  title: string;
};

const CRUMB_LABEL_CLASS = "block max-w-[10rem] truncate sm:max-w-[14rem]";

type DetailBreadcrumbNavLinkProps = {
  crumb: DetailBreadcrumbCrumb;
};

function DetailBreadcrumbNavLink({ crumb }: DetailBreadcrumbNavLinkProps) {
  "use memo";

  const router = useRouter();
  const href = (crumb.href ?? "/") as Route;

  const handleClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (
        crumb.preferHistoryBack &&
        typeof window !== "undefined" &&
        window.history.length > 1
      ) {
        event.preventDefault();
        router.back();
        return;
      }

      if (crumb.scrollY != null && crumb.scrollY > 0) {
        event.preventDefault();
        queueScrollRestore(crumb.href ?? "/", crumb.scrollY);
        router.push(href, { scroll: false });
      }
    },
    [crumb.href, crumb.preferHistoryBack, crumb.scrollY, href, router]
  );

  return (
    <BreadcrumbLink
      render={
        <Link href={href} scroll={false} onClick={handleClick} />
      }
      className={CRUMB_LABEL_CLASS}
      title={crumb.label}
    >
      {crumb.label}
    </BreadcrumbLink>
  );
}

export function DetailBreadcrumb({ title }: DetailBreadcrumbProps) {
  "use memo";

  const params = useParams();
  const mediaId = params.id as string | undefined;
  const [detailReturn, setDetailReturn] = useState<DetailReturn | null>(null);

  useLayoutEffect(() => {
    setDetailReturn(readDetailReturn());
  }, [mediaId]);

  const crumbs = buildDetailBreadcrumbs(title, detailReturn);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <Fragment key={`${crumb.href ?? "current"}-${crumb.label}`}>
              {index > 0 ? <BreadcrumbSeparator /> : null}
              <BreadcrumbItem className="min-w-0">
                {isLast ? (
                  <BreadcrumbPage
                    className={cn(
                      CRUMB_LABEL_CLASS,
                      "max-w-[min(100%,18rem)] sm:max-w-[min(100%,24rem)]"
                    )}
                    title={crumb.label}
                  >
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <DetailBreadcrumbNavLink crumb={crumb} />
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
