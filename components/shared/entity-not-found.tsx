import Link from "next/link";
import type { Route } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EntityNotFoundProps = {
  title: string;
  description: string;
  browseHref: Route;
  browseLabel: string;
};

export function EntityNotFound({
  title,
  description,
  browseHref,
  browseLabel,
}: EntityNotFoundProps) {
  return (
    <PageContainer className="flex flex-col gap-4 py-16">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
      <Link href={browseHref} className={cn(buttonVariants(), "min-h-11 w-fit")}>
        {browseLabel}
      </Link>
    </PageContainer>
  );
}
