import Link from "next/link";

export default function AnimeNotFound() {
  return (
    <div className="container flex flex-col items-center justify-center gap-4 py-32 text-center">
      <h1 className="text-4xl font-bold">Anime Not Found</h1>
      <p className="text-muted-foreground">
        The anime you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
      <Link
        href="/anime/trending"
        className="rounded-md bg-primary px-6 py-2 font-medium text-primary-foreground hover:bg-primary/90"
      >
        Browse Trending Anime
      </Link>
    </div>
  );
}
