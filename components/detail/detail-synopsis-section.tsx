import { AniListDescription } from "@/components/shared/anilist-description";

type DetailSynopsisSectionProps = {
  title: string;
  text: string;
};

export function DetailSynopsisSection({ title, text }: DetailSynopsisSectionProps) {
  return (
    <section className="rounded-xl border border-border bg-card/40 p-5 sm:p-6">
      <h2 className="mb-3 text-lg font-medium tracking-tight">{title}</h2>
      <AniListDescription text={text} />
    </section>
  );
}
