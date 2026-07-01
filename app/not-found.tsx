import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <PageContainer className="flex flex-col items-start gap-4 py-16">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-muted-foreground">
        The page you are looking for does not exist.
      </p>
      <Link href="/" prefetch className={cn(buttonVariants(), "min-h-11")}>
        Back to home
      </Link>
    </PageContainer>
  );
}
