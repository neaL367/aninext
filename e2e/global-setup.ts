export default async function globalSetup() {
  const urls = [
    "/",
    "/anime/trending",
    "/anime/popular",
    "/anime/top100",
    "/anime/upcoming",
    "/anime/alltimepopular",
    "/anime/seasonal",
    "/airing",
    "/anime/21",
  ];

  await Promise.all(
    urls.map((url) =>
      fetch(`http://localhost:3000${url}`)
        .then((res) => res.text())
        .catch(() => null),
    ),
  );
}
