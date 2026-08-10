<div align="center">

# AniNext

An anime discovery and airing platform on [Next.js 16.3](https://nextjs.org/blog/next-16-3-instant-navigations) — a fast, cinematic live TV guide over the [AniList GraphQL API](https://docs.anilist.co/).

[**Live demo →**](https://ani-next.vercel.app)

</div>

---

## Features

- **[Cache Components](https://preview.nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents)** — every server read is marked `'use cache'` with a named `cacheTag` and a `cacheLife` profile (`trending` / `home` / `static` / `airing` / `max`), so repeated visits come from cache until a profile expires. The site is read-only, so expiry is the only invalidation path.
- **[Partial Prefetching](https://nextjs.org/docs/app/guides/adopting-partial-prefetching)** — Next.js prefetches one shared shell per route template, so a grid of 40 anime cards costs a single shell prefetch and every navigation commits instantly.
- **[Hover-triggered prefetch](https://nextjs.org/docs/app/guides/prefetching#hover-triggered-prefetch)** — `HoverPrefetchLink` defers a link's deep prefetch until pointer, focus, or touch intent, so the six collection tabs and "See all" links stay cheap instead of prefetching every destination on render.
- **[Server Functions that return rendered RSC](https://nextjs.org/docs/app/getting-started/mutating-data)** — infinite scroll never ships raw JSON: a `'use server'` action renders the next page of cards on the server and hands the client ready-to-append React nodes, keeping `MediaCard`/`MediaGrid` 100% server components.
- **[React Compiler](https://react.dev/learn/react-compiler)** in annotation mode memoizes components and hooks automatically, so hot paths need no manual `useMemo`/`useCallback`.
- **[View Transitions](https://nextjs.org/docs/app/guides/view-transitions)** — a `Crossfade` wrapper animates Suspense reveals, appended browse pages, and day switches on the airing schedule.
- **[Timezone-aware airing schedule](ARCHITECTURE.md#5-route-airing--airing-schedule) — the `/airing` page is a time-axis TV guide**: hour bands, a sticky day rail with real per-day release counts, episode progress bars, first-class streaming links, and a pulsing `NOW` marker. Every time renders in the visitor's UTC offset (carried in the URL), so shared links show the same schedule in any browser.

## Getting started

No database and no API key — AniList's public GraphQL endpoint needs neither. Just:

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000). The homepage, six browse collections (`/anime/trending`, `/anime/popular`, `/anime/top100`, `/anime/upcoming`, `/anime/alltimepopular`, `/anime/seasonal`), anime detail pages, and the airing schedule all read live AniList data.

## Testing

End-to-end tests use [`@next/playwright`](https://nextjs.org/docs/app/guides/testing/playwright) with the [`instant()`](https://preview.nextjs.org/docs/app/api-reference/file-conventions/route-segment-config/instant) API to assert that static shells commit immediately and content streams behind them — covering hard navigations, client-side navigations, and the detail page's streamed sections. Playwright starts a local deterministic AniList GraphQL fixture (`e2e/mock-anilist.ts`) so pagination, empty states, and detail tests do not depend on live API rate limits; production development still defaults to AniList unless `ANILIST_ENDPOINT` is set.

```bash
bun run test:e2e
```

## Stack

- **[Next.js 16.3](https://nextjs.org/)**: App Router, Cache Components, Server Functions, Instant Navigations
- **[React 19](https://react.dev/)** with React Compiler: Suspense, `use()`, View Transitions
- **[TypeScript](https://www.typescriptlang.org/)** and **[Tailwind CSS v4](https://tailwindcss.com/)**
- **[shadcn/ui](https://ui.shadcn.com/)** on **[Base UI](https://base-ui.com/)**
- **[AniList GraphQL](https://docs.anilist.co/)** — read-only data source; no auth, no mutations
- **[Bun](https://bun.sh/)** runtime, **[oxlint](https://oxc.rs/)** + **[oxfmt](https://oxc.rs/)** for lint and formatting
- **[Playwright](https://playwright.dev/)** + `@next/playwright` for instant-navigation e2e

## Architecture

The full build plan and its invariants live in [ARCHITECTURE.md](ARCHITECTURE.md): a feature-sliced RSC layout (`features/anime/` owns every query, cache tag, and component), synchronous pages that compose `<Suspense>` boundaries, a shared cache-tag contract, and a verification checklist for new work.
