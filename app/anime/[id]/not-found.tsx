import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AnimeNotFound() {
  return (
    <PageContainer className="flex flex-col gap-4 py-16">
      <h1 className="text-2xl font-semibold">Anime not found</h1>
      <p className="text-muted-foreground">
        This anime could not be found on AniList.
      </p>
      <Link href="/anime" className={cn(buttonVariants(), "min-h-11 w-fit")}>
        Browse anime
      </Link>
    </PageContainer>
  );
}
