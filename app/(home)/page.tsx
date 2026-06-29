export const instant = true;

export default function HomePage() {
  return (
    <header className="flex max-w-prose flex-col gap-2 pb-2">
      <p className="text-sm font-medium text-muted-foreground">Anime discovery</p>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        Find your next anime
      </h1>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Browse trending, seasonal, and airing titles from AniList — with filters,
        schedules, and detail pages that stay out of the way.
      </p>
    </header>
  );
}
