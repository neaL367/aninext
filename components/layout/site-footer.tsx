import { PageContainer } from "@/components/layout/page-container";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <PageContainer className="flex flex-col gap-2 py-10 text-sm leading-relaxed text-muted-foreground">
        <p className="font-medium text-foreground">AniNext</p>
        <p>
          Data from{" "}
          <a
            href="https://anilist.co"
            className="text-foreground underline underline-offset-4 hover:text-muted-foreground"
            target="_blank"
            rel="noopener noreferrer"
          >
            AniList
          </a>
          . Not affiliated with AniList or MyAnimeList.
        </p>
      </PageContainer>
    </footer>
  );
}
