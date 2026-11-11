const WARMUP_DELAY_MS = 500;

export default async function globalSetup() {
  // Warm only route templates needed for navigation/streaming checks. Keep the
  // requests sequential so the suite does not burst the live AniList API.
  const urls = ["/", "/anime/trending", "/anime/top100", "/airing", "/anime/21"];

  for (const url of urls) {
    await fetch(`http://localhost:3000${url}`)
      .then((res) => res.text())
      .catch(() => null);
    await new Promise<void>((resolve) => setTimeout(resolve, WARMUP_DELAY_MS));
  }
}
