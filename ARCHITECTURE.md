# AniNext — Production Architecture Plan

**Stack**: Next.js 16.3 (stable) — App Router, Cache Components, Instant Navigations · React 19 + Compiler · TypeScript · Tailwind CSS v4 · shadcn/ui · AniList GraphQL API

**Architecture target**: `next-beats` feature-sliced RSC pattern — pages compose, features own data, route props become plain values at the boundary.

**Scope**: The full consumer-facing site — homepage, five browse collections, anime detail, airing schedule. **Read-only.** No auth, no user accounts, no favorites, no watchlist, no mutations of any kind. Every Server Function in this document exists to *render a page of results*, never to write data. If personalization is added later, it's a new phase with its own design, not a deferred stub living in this one.

**Conscious MVP deferrals** (see §3.22): multi-genre filtering (`genre_in`), tag-based filtering (`tag`/`tag_in`), and studio filtering (requires the `Studio.media` connection, not a direct `Media` filter arg). Each has a stated migration path.

---

## 0. Architecture Reconciliation: next-beats Mapping

One domain folder, not one folder per page section:

| Concept | Feature Folder |
|---|---|
| Anime (list, detail, search, airing) | `features/anime/` |
| Characters, Staff, Studios, Genres, Reviews, Recommendations | folded into `features/anime/` — they're all facets of one anime record, not separate domains |

Everything anime-related — queries, cache tags, types, components — lives under `features/anime/`. There is no `anime-actions.ts`: with no mutations in scope, there's nothing to put in it. The one `'use server'` function in the codebase (browse pagination, §3.8) is colocated next to the component that calls it, following the same pattern AniList-adjacent reference apps use for render-only Server Functions.

---

## 1. Project-Wide Architecture

### 1.1 Folder Structure

```text
app/
  layout.tsx                        # Root layout: fonts, theme, shell
  page.tsx                          # Homepage — composition only
  (browse)/
    anime/
      page.tsx                      # /anime → permanentRedirect('/anime/trending')
      trending/
        page.tsx
        opengraph-image.tsx
      popular/
        page.tsx
        opengraph-image.tsx
      top100/
        page.tsx
        opengraph-image.tsx
      upcoming/
        page.tsx
        opengraph-image.tsx
      alltimepopular/
        page.tsx
        opengraph-image.tsx
      [id]/
        page.tsx                    # /anime/[id] — detail page
        not-found.tsx
    airing/
      page.tsx                      # /airing — schedule page
  error.tsx
  not-found.tsx

features/
  anime/
    anime-cache.ts                  # Pure cache tag builders (no favorites/watchlist tags)
    anime-queries.ts                # All server-side AniList GraphQL reads — import 'server-only'
    types/
      anime.ts                      # Domain types (Media, PageResult, etc.)
    lib/
      parse-filters.ts              # searchParams → AnimeFilters (pure)
      collection-config.ts          # Per-collection AniList variables + copy + cacheLife
      season.ts                     # Current/next season + year computation
    components/
      hero-banner.tsx                # Homepage hero + skeleton
      media-card.tsx                 # Reusable anime card + skeleton
      media-grid.tsx                 # Grid layout + skeleton
      section-row.tsx                # Horizontal scrollable section + skeleton
      collection-nav.tsx             # Browse tab bar (client — useSearchParams/usePathname)
      search-bar.tsx                 # Client search input, URL-synced
      filter-sidebar.tsx             # Desktop sidebar + mobile drawer (client)
      active-filters.tsx             # Removable filter chips (client)
      anime-results.tsx              # async RSC — page-1 browse results
      browse-paginator.tsx           # 'use client' — accumulates pages 2+ via Server Function
      browse-page-action.tsx         # 'use server' — renders one browse page as RSC
      infinite-scroll-sentinel.tsx   # 'use client' — IntersectionObserver, calls loadMore()
      anime-hero.tsx                 # Detail page hero + skeleton
      anime-info.tsx                 # Detail metadata
      anime-characters.tsx           # Character grid
      anime-staff.tsx                # Staff list
      anime-relations.tsx            # Related anime
      anime-recommendations.tsx      # AniList's own recommendation data (not personalized)
      anime-reviews.tsx              # Reviews
      anime-airing-schedule.tsx      # Detail page episode list
      airing-timeline.tsx            # /airing page schedule
      airing-calendar.tsx            # Weekly calendar
      genre-pills.tsx                # Genre navigation
      studio-card.tsx                # Studio display
      character-voice-card.tsx       # Character + VA pairing

components/
  ui/                                # shadcn/ui primitives
  theme/                             # Theme provider + toggle
  site-header.tsx
  site-footer.tsx
  crossfade.tsx                      # <ViewTransition enter="auto" default="none"> wrapper
  hover-prefetch-link.tsx            # Intent-based deep prefetch wrapper around next/link
  error-boundary.tsx                 # catchError-based boundary (not react-error-boundary)

lib/
  anilist.ts                         # GraphQL client — POST wrapper, rate-limit/outage classification
  utils.ts

types/
  anilist.ts                         # Shared AniList response types
```

### 1.2 Global Configuration

```ts
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,      // required for 'use cache' / cacheTag / cacheLife and for Instant Navigations
  partialPrefetching: true,   // shared per-route shell prefetching
  images: {
    remotePatterns: [{ hostname: 's4.anilist.co', protocol: 'https' }],
  },
};

export default nextConfig;
```

Both flags are **opt-in even in stable 16.3** — Next.js has said they'll become defaults in a future major version, but as of this release you still turn them on explicitly. Everything in this document assumes both are on; without them, `'use cache'`/`cacheTag`/`cacheLife` aren't available and prefetching falls back to the pre-16.3 per-link behavior.

`cacheLife` profiles (named, referenced by string elsewhere):

```ts
// next.config.ts (cacheLife block)
cacheLife: {
  trending:  { stale: 60,   revalidate: 300,   expire: 3600 },   // minutes-fresh
  home:      { stale: 300,  revalidate: 900,   expire: 86400 },  // ~5 min fresh
  static:    { stale: 3600, revalidate: 21600, expire: 604800 }, // hours-to-days fresh
},
```

### 1.3 Cross-Cutting Concerns

**Instant Navigations.** With `cacheComponents` on, every route must resolve to one of three states, or the dev server raises an Instant Insights error:

- **Stream** — wrap the dynamic part in `<Suspense>`; the user gets a shell instantly, content streams in.
- **Cache** — mark the read `'use cache'` with a `cacheTag`/`cacheLife`; the user gets a previously-cached UI instantly.
- **Block** — explicitly opt out with `export const instant = false` on a route that should wait for the full server response before navigating (e.g., a page where a stale/loading shell would be actively misleading). **Nothing in this app uses Block** — every route here is either streamed or cached, which is the whole point of §2–§5.

**Partial Prefetching, precisely.** Next.js prefetches one reusable shell **per route template**, not per link. A grid of 40 `MediaCard`s linking to `/anime/[id]` triggers exactly one shell prefetch for that template, cached client-side and reused across every card — not 40 separate requests. This means the default (`prefetch="auto"`, i.e. no `prefetch` prop) is already cheap on `MediaCard`; see §3.10 for what `HoverPrefetchLink` actually buys on top of that baseline.

**Error boundaries.** `components/error-boundary.tsx` is built on the stable `catchError` API, not a third-party error-boundary library, because it's the only mechanism that doesn't swallow `notFound()`/`redirect()` calls thrown from Server Components beneath it, and it exposes a retry function:

```tsx
'use client';
import { catchError, type ErrorInfo } from 'next/error';

export function boundary(title: string) {
  return catchError<{ title: string }>((props, info: ErrorInfo) => (
    <ErrorPanel title={props.title} message={info.error.message} onRetry={info.retry} />
  ));
}
```

**View Transitions.** One primitive, reused everywhere instead of ad hoc CSS:

```tsx
// components/crossfade.tsx
import { ViewTransition } from 'react';

export function Crossfade({ children }: { children: React.ReactNode }) {
  return <ViewTransition enter="auto" default="none">{children}</ViewTransition>;
}
```

`enter="auto" default="none"` scopes the animation to Suspense-reveal only, so it doesn't fire during unrelated transitions (e.g., a sibling boundary resolving).

**Deep prefetch on hover.**

```tsx
// components/hover-prefetch-link.tsx
'use client';
import Link from 'next/link';
import { useState, type ComponentProps } from 'react';

export function HoverPrefetchLink({ href, onMouseEnter, onFocus, onTouchStart, ...props }: ComponentProps<typeof Link>) {
  const [intent, setIntent] = useState(false);
  return (
    <Link
      {...props}
      href={href}
      prefetch={intent ? true : null}
      onMouseEnter={e => { setIntent(true); onMouseEnter?.(e); }}
      onFocus={e => { setIntent(true); onFocus?.(e); }}
      onTouchStart={e => { setIntent(true); onTouchStart?.(e); }}
    />
  );
}
```

---

## 2. Route: `/` — Homepage

### 2.1 UX Goals

A fast, visual entry point that sells the breadth of the catalog and routes people into a collection or a specific title — not a full browse surface itself.

### 2.2 Page Wireframe Hierarchy

```text
[Site Header]
├── <HeroBanner />              — Full-bleed featured anime (trending #1), CTA into detail
├── <SectionRow title="Trending Now" href="/anime/trending" />
├── <SectionRow title="Popular This Season" href="/anime/popular" />
├── <SectionRow title="Top 100" href="/anime/top100" />
├── <SectionRow title="Upcoming" href="/anime/upcoming" />
├── <GenrePills />               — Quick links into /anime/trending?genre=X
[Site Footer]
```

### 2.3 Section Ordering Rationale

Trending leads because it's the most volatile, highest-engagement signal — it's the reason to come back. Popular-this-season follows because it answers "what's actually airing now." Top 100 and Upcoming are evergreen/anticipatory, so they sit lower where they're discovered rather than demanded. Genre pills sit last as a lateral escape hatch into deeper browsing.

### 2.4 Component Tree

```text
HomePage (server)
├── HeroBanner (server, async)
├── SectionRow × 4 (server, async each — independent Suspense)
│   └── MediaCard × N (server)
└── GenrePills (server — static list from cached genre query)
```

### 2.5 Server / Client Boundary

Entirely server. The only interactivity on this page is `<Link>` navigation, which needs no client component.

### 2.6 AniList Query Plan

Each row is its own cached query, sharing the exact same variables and `cacheTag`/`cacheLife` the corresponding `/anime/*` route uses (see §3.7) — the homepage doesn't duplicate query logic, it calls `getBrowseCollection('trending', {}, 1)` etc. with `perPage: 10` instead of the full grid page size:

```graphql
query HomeSection($sort: [MediaSort], $season: MediaSeason, $seasonYear: Int, $status: MediaStatus) {
  Page(page: 1, perPage: 10) {
    media(type: ANIME, sort: $sort, season: $season, seasonYear: $seasonYear, status: $status, isAdult: false) {
      id
      title { romaji english userPreferred }
      coverImage { extraLarge large }
      bannerImage
      averageScore
      popularity
      format
      episodes
      status
      seasonYear
      genres
    }
  }
}
```

`GenrePills` reads `GenreCollection` — a root field returning `[String]`, the full list of valid AniList genres, cached under `anime:genres` with the `static` profile since it changes essentially never.

### 2.7 Cache Architecture

Reuses the collection-scoped tags from §3.9 (`anime:browse:trending:{}`, etc.) plus `anime:genres`. No homepage-specific tags — a trending refresh should invalidate both the homepage row and the `/anime/trending` page identically, and sharing the tag is what guarantees that.

### 2.8 Prefetch Architecture

`SectionRow` "See all" links to `/anime/trending` etc. use `HoverPrefetchLink` (§1.3) — these are the five highest-value destinations on the site, worth the deeper per-link prefetch. `MediaCard` links use the default `prefetch="auto"` (shell-only, shared per §1.3).

### 2.9–2.10 Streaming & Suspense

Each `SectionRow` is its own `<Suspense>` boundary with a skeleton matching its exact card count and aspect ratio — a slow AniList response on one row never blocks the others.

### 2.11 State Management

None. Fully static composition of server data.

### 2.12–2.14 Loading, Error, Empty

- Loading: per-row skeleton (`SectionRowSkeleton`, fixed card count, zero CLS).
- Error: `ErrorBoundary` per row — a failed row shows a compact "Couldn't load this row" inline, not a full-page failure.
- Empty: not realistically reachable (AniList always has trending/popular data), but each `SectionRow` still guards against a zero-length response with a "Nothing here yet" fallback rather than rendering an empty row.

### 2.15 Responsive Behavior

`SectionRow` is a horizontally scrollable flex row on mobile (snap-scroll, no wrap), becomes a static grid-like row with visible overflow arrows on desktop.

### 2.16 Accessibility Checklist

- [ ] `HeroBanner` CTA is a real `<a>`/`<Link>`, not a div with a click handler
- [ ] `SectionRow`: `aria-label` per row naming the collection, horizontal scroll reachable via keyboard (`tabindex` on the scroll container or arrow-key roving on cards)
- [ ] Images: meaningful `alt` (`"${title} cover"`), decorative banner images `alt=""`
- [ ] `prefers-reduced-motion`: hero autoplay/parallax (if any) disabled

### 2.17 SEO Checklist

- [ ] `generateMetadata`: site-level title/description, canonical `/`
- [ ] Open Graph: default site image
- [ ] JSON-LD: `WebSite` + `SearchAction` (if search is wired to accept a query param)

### 2.18 Performance Checklist

- [ ] Hero image: `priority` on the `<Image>`, explicit `sizes`
- [ ] Below-fold `SectionRow` images: `loading="lazy"`
- [ ] No client JS beyond theme toggle / header interactions

### 2.19 Animation Opportunities

`Crossfade` around each `SectionRow`'s content — rows crossfade in as they resolve rather than popping in. Card → detail uses `view-transition-name: browse-card-{id}` on the cover image, shared with the browse grid (§3.21) so the same transition works from either entry point.

### 2.20 Future Extensibility

- A "Continue watching" or "For you" row is explicitly out of scope (§ scope note) — it requires accounts.
- Additional rows (e.g., "Recently Added") are additive: new `collection-config.ts` entry, new `SectionRow`.

### 2.21 Folder Structure for This Page

Covered by §1.1 — no page-specific additions.

---

## 3. Route: `/anime/*` — Browse Collections

**Design principle**: each collection is an independent, indexable, canonical page — not a filter state of one route. The path encodes collection identity; query params encode transient filters. Each collection gets its own metadata, cache freshness, SEO surface, and internal link equity.

### 3.1 Route Map

| Route | Collection | AniList `sort` | Fixed args | Redirect source |
|---|---|---|---|---|
| `/anime/trending` | Trending Now | `[TRENDING_DESC]` | `type: ANIME, isAdult: false` | `/anime` → 308 |
| `/anime/popular` | Popular This Season | `[POPULARITY_DESC]` | `type: ANIME, season: <current>, seasonYear: <current>, isAdult: false` | — |
| `/anime/top100` | Top 100 | `[SCORE_DESC]` | `type: ANIME, isAdult: false` | — |
| `/anime/upcoming` | Upcoming | `[POPULARITY_DESC]` | `type: ANIME, status: NOT_YET_RELEASED, isAdult: false` | — |
| `/anime/alltimepopular` | All-Time Popular | `[POPULARITY_DESC]` | `type: ANIME, isAdult: false` | — |

```tsx
// app/(browse)/anime/page.tsx
import { permanentRedirect } from 'next/navigation';

export default function AnimeIndexPage() {
  permanentRedirect('/anime/trending');
}
```

`permanentRedirect` (not `redirect`) because this is a static, always-the-same, SEO-relevant redirect — it issues a real 308, consolidating any inbound links/ranking signal onto `/anime/trending` rather than treating the hop as temporary. (`redirect()` would default to 307, which is right for a genuinely dynamic destination — e.g., "take me to the first item in a list that varies per request" — but wrong here, where the destination never changes.)

`sort` is always passed as a list — `[MediaSort]`, not a bare enum — per AniList's schema.

### 3.2 URL Design

```text
/anime/trending?genre=Action&format=TV
/anime/top100?search=Attack
/anime/popular?season=SUMMER&year=2026&genre=Comedy
/anime/upcoming?format=MOVIE&format=OVA
/anime/alltimepopular?country=JP
```

| Param | Type | AniList arg | Notes |
|---|---|---|---|
| `genre` | string | `genre` | Single genre (radio-style UI). Multi-select (`genre_in`) deferred — §3.22. |
| `format` | string, repeatable | `format_in: [MediaFormat]` | UI is checkboxes, so this maps to the **list** arg, not singular `format` — multiple `?format=` values collect into one `format_in` array. |
| `status` | string, repeatable | `status_in: [MediaStatus]` | Same reasoning as `format` — checkboxes map to `_in`. |
| `year` | number | `seasonYear` | Only meaningful alongside `season` per AniList's own docs ("Requires season argument"). |
| `season` | string | `season` | `WINTER \| SPRING \| SUMMER \| FALL` |
| `country` | string | `countryOfOrigin` | ISO 3166-1 alpha-2 (`JP`, `KR`, `CN`) — AniList's `CountryCode` enum. |
| `search` | string | `search` | Free text, scoped within the collection's other args. |
| `isAdult` | boolean | `isAdult` | Default `false` on every collection. |
| `page` | number | — | See §3.8 — **not** forwarded to AniList as a page-1-through-N URL; it exists only to seed the client accumulator on a fresh load, not for classic pagination. |

**Studio filtering** is deferred — AniList's `Media` query has no `studio` filter arg. See §3.22 for the `Studio.media` migration path.

### 3.3 UX Goals

- Each collection is a real destination: distinct `<h1>`, metadata, canonical URL.
- Switching collections is a full navigation, never client-side state.
- Filters share one UI across all five collections.
- Infinite scroll within a collection, no page-number UI.
- Mobile: filter drawer. Desktop: sticky sidebar.
- Search is debounced, updates the URL, never a full navigation.

### 3.4 Page Wireframe Hierarchy (shared across all 5 routes)

```text
[Site Header]
├── <CollectionNav />           — Tab bar: Trending | Popular | Top 100 | Upcoming | All-Time
├── <PageHeading />             — H1 per collection
├── <SearchBar />                — Sticky below heading
├── [Desktop Layout]
│   ├── <FilterSidebar />       — Left sidebar (desktop), drawer (mobile)
│   │   ├── Genre list (radio)
│   │   ├── Format checkboxes
│   │   ├── Year select / Season select
│   │   ├── Status checkboxes
│   │   ├── Country select
│   │   └── Adult content toggle
│   └── <ResultsArea />
│       ├── <ActiveFilters />   — Removable chips
│       ├── <ResultCount />     — "1,234 results"
│       └── <MediaGrid />       — Infinite-scrolling grid
[Site Footer]
```

### 3.5 Component Tree (each collection page follows this pattern)

```tsx
// app/(browse)/anime/trending/page.tsx
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ErrorBoundary } from '@/components/error-boundary';
import { AnimeResults, AnimeResultsSkeleton } from '@/features/anime/components/anime-results';
import { CollectionNav } from '@/features/anime/components/collection-nav';
import { FilterSidebar } from '@/features/anime/components/filter-sidebar';
import { SearchBar } from '@/features/anime/components/search-bar';
import { parseFilters } from '@/features/anime/lib/parse-filters';
import { getCollectionMetadata } from '@/features/anime/lib/collection-config';

export const prefetch = 'allow-runtime';

export function generateMetadata(): Metadata {
  return getCollectionMetadata('trending');
}

export default function TrendingPage({ searchParams }: PageProps<'/anime/trending'>) {
  return (
    <>
      <CollectionNav active="trending" />
      <h1>Trending Anime</h1>
      <SearchBar />
      <div className="flex gap-8">
        <FilterSidebar collection="trending" />
        <ErrorBoundary title="Results failed to load">
          <Suspense fallback={<AnimeResultsSkeleton count={20} />}>
            {searchParams.then(sp => (
              <AnimeResults collection="trending" filters={parseFilters(sp)} />
            ))}
          </Suspense>
        </ErrorBoundary>
      </div>
    </>
  );
}
```

All five route files are this same ~25 lines with only the `collection` string and `generateMetadata` call changing. `CollectionNav`, `SearchBar`, and `FilterSidebar` take **no `searchParams` prop at all** — see §3.6 for why, and how they read the URL themselves. `AnimeResults` is the only component that needs parsed filters, and it gets them already-parsed at the page boundary — never the raw `searchParams` promise.

### 3.6 Server / Client Boundary

| Component | Boundary | How it gets URL state |
|---|---|---|
| Collection `page.tsx` | Server | `searchParams.then()`, passed only into `AnimeResults` |
| `CollectionNav` | Client | `usePathname()` for active-tab styling — doesn't need search params at all |
| `SearchBar` | Client | `useSearchParams()` + `useSyncSearchParamToInput` (syncs uncontrolled input from the URL on mount/soft-nav), writes via `router.replace(..., { scroll: false })` inside `useTransition` |
| `FilterSidebar` | Client | `useSearchParams()` directly — reads current filter state itself, writes the same way as `SearchBar` |
| `ActiveFilters` | Client | `useSearchParams()`, removes one param at a time via `router.replace` |
| `AnimeResults` | Server (async) | Receives already-parsed `AnimeFilters`, fetches page 1 |
| `BrowsePaginator` / `InfiniteScrollSentinel` | Client | See §3.8 |
| `MediaCard` | Server (parent) ↦ Client only for the hover-intent wrapper | `HoverPrefetchLink` |

This is the one substantive fix from the previous draft: `FilterSidebar` used to receive `searchParams` as a prop from the server page — that both violated the "components get parsed values, not raw route props" rule *and* was inconsistent with §3.11/§3.12 describing it as rendering instantly with no Suspense boundary (consuming an unresolved promise prop in a Client Component needs `use()`, which needs Suspense above it). Every client component that needs the current filter state now reads it directly via `useSearchParams()`, matching how `next16-social-media`'s `Search` and `FeedTabs` components do it — no prop threading, no boundary mismatch.

### 3.7 AniList Query Plan

One query builder, branching on collection config:

```graphql
query BrowseCollection(
  $page: Int, $perPage: Int, $sort: [MediaSort], $season: MediaSeason, $seasonYear: Int,
  $status: MediaStatus, $statusIn: [MediaStatus], $formatIn: [MediaFormat],
  $genre: String, $country: CountryCode, $search: String, $isAdult: Boolean
) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { hasNextPage total }
    media(
      type: ANIME
      sort: $sort
      season: $season
      seasonYear: $seasonYear
      status: $status
      status_in: $statusIn
      format_in: $formatIn
      genre: $genre
      countryOfOrigin: $country
      search: $search
      isAdult: $isAdult
    ) {
      id
      title { romaji english userPreferred }
      coverImage { extraLarge large }
      bannerImage
      averageScore
      popularity
      format
      episodes
      status
      season
      seasonYear
      genres
    }
  }
}
```

Fixed per-collection args (`sort`, `status` for Upcoming, `season`/`seasonYear` for Popular) come from `collection-config.ts`; user-controlled args come from `parseFilters()`. `status` (singular, fixed) and `status_in` (repeatable, user-controlled) can both be present — AniList applies them as an implicit AND, which is what we want (e.g., Upcoming's fixed `status: NOT_YET_RELEASED` plus a user's `status_in` filter would just be redundant/no-op in practice, so the UI hides the Status filter entirely on the Upcoming route rather than letting the two fight).

**Studio branch** (only when `filters.studio` is present — deferred per §3.2, documented here for the eventual migration): AniList has no `studio` arg on `Media`. The alternative root query is `Studio`, whose `media` field is a standard `MediaConnection` (`edges`/`nodes`/`pageInfo`, per AniList's Connections guide) supporting its own `sort`/`page`/`perPage`:

```graphql
query BrowseByStudio($studioName: String, $page: Int, $perPage: Int, $sort: [MediaSort]) {
  Studio(search: $studioName) {
    id
    name
    media(sort: $sort, page: $page, perPage: $perPage, type: ANIME) {
      pageInfo { hasNextPage total }
      nodes { id title { romaji english userPreferred } coverImage { extraLarge large } averageScore popularity format episodes status genres }
    }
  }
}
```

`anime-queries.ts` picks the root field at request time based on whether `filters.studio` is set — same response shape downstream (`{ items, hasNextPage, total }`), different GraphQL root.

### 3.8 Infinite Scrolling — Server Function returns rendered RSC, not JSON

The naive version of this (client fetches JSON, re-renders `MediaCard` on the client) would force `MediaCard` to exist as a client component too. Instead, the Server Function renders the cards itself and hands the client already-built React nodes to append — `MediaCard`/`MediaGrid` stay 100% server components:

```tsx
// features/anime/components/browse-page-action.tsx
'use server';

import type { ReactNode } from 'react';
import { MediaGrid } from '@/features/anime/components/media-grid';
import { getBrowseCollection } from '@/features/anime/anime-queries';
import type { AnimeCollection, AnimeFilters } from '@/features/anime/types/anime';

export type BrowsePage = { node: ReactNode; hasMore: boolean };

export async function renderBrowsePage(
  collection: AnimeCollection,
  filters: AnimeFilters,
  page: number,
): Promise<BrowsePage> {
  const { items, hasNextPage } = await getBrowseCollection(collection, filters, page);
  const capped = collection === 'top100' ? page * 25 <= 100 : true;
  return { hasMore: hasNextPage && capped, node: <MediaGrid.Items items={items} /> };
}
```

```tsx
// features/anime/components/browse-paginator.tsx
'use client';
import { Suspense, use, useState, useTransition, type ReactNode } from 'react';
import { Crossfade } from '@/components/crossfade';
import type { BrowsePage } from './browse-page-action';

export function BrowsePaginator({
  initialPage, renderPage, skeleton,
}: { initialPage: Promise<BrowsePage>; renderPage: (page: number) => Promise<BrowsePage>; skeleton: ReactNode }) {
  const [pages, setPages] = useState([initialPage]);
  const [isPending, startTransition] = useTransition();

  function loadMore() {
    const next = renderPage(pages.length + 1);
    startTransition(() => setPages(prev => [...prev, next]));
  }

  return (
    <>
      {pages.map((page, i) => (
        <Suspense key={i} fallback={skeleton}>
          {i === 0 ? <PageContent page={page} /> : <Crossfade><PageContent page={page} /></Crossfade>}
        </Suspense>
      ))}
      <InfiniteScrollSentinel onIntersect={loadMore} disabled={isPending} />
    </>
  );
}

function PageContent({ page }: { page: Promise<BrowsePage> }) {
  const { node } = use(page);
  return node;
}
```

`InfiniteScrollSentinel` is a small `IntersectionObserver` leaf with a large (~600px) root margin, so `loadMore()` fires before the user actually reaches the bottom — the fetch is usually resolved by the time they arrive. It unmounts itself once the most recent page's `hasMore` is `false`.

**The explicit tradeoff** (same one a page-number `?page=` URL scheme runs into, documented directly in `next16-social-media`'s `Feed` component): putting `page` in the URL and re-rendering pages 1 through N on every "load more" gives a shareable, revalidatable URL but re-fetches everything already loaded. Accumulating pages in client state (what's above) fetches only the new page and feels right for a scroll-heavy grid, but the URL no longer reflects scroll depth, and accumulated pages sit outside `cacheLife` revalidation until the next hard navigation. **This is the right tradeoff for a browse grid** — filters and search still live in the URL and are fully shareable/bookmarkable (§3.2); only "how far you've scrolled into this result set" is client-only, which is exactly the part nobody expects a URL to capture. `AnimeResults` (page 1) seeds `BrowsePaginator`'s `initialPage` with a promise that resolves from the already-cached server render, so the very first screenful is still real SSR + `'use cache'`, not client-fetched.

`top100` caps itself at 100 loaded items (`page * 25 <= 100` in the action above) and the sentinel disables past that point, replaced by an end-of-results message.

### 3.9 Cache Architecture

| Collection | cacheTag (base) | cacheLife | Rationale |
|---|---|---|---|
| Trending | `anime:browse:trending:{hash}` | `trending` (~60s stale) | Changes hour to hour. |
| Popular | `anime:browse:popular:{hash}` | `home` (~5min stale) | Seasonal; stable for weeks but should track the season. |
| Top 100 | `anime:browse:top100:{hash}` | `static` (~1hr stale) | Evergreen; high scores move glacially. |
| Upcoming | `anime:browse:upcoming:{hash}` | `home` (~5min stale) | New announcements trickle in. |
| All-Time Popular | `anime:browse:alltimepopular:{hash}` | `home` (~5min stale) | Very slow-moving, but benefits from more frequent refresh than Top 100. |
| Genre list | `anime:genres` | `static` | Effectively static. |

`hash` is a deterministic, sorted string of the *user-controlled* filter values only — the fixed per-collection args aren't part of it, since they're already encoded in the tag's `{collection}` segment (e.g., `anime:browse:trending:format=TV;genre=Action`, `anime:browse:trending:` with no suffix for the unfiltered view). Every `getBrowseCollection` call in `anime-queries.ts` sets `cacheTag('anime')`, `cacheTag('anime:browse:' + collection)`, and `cacheTag(scopedTag)` — global, collection, and scoped — so a manual `updateTag('anime:browse:trending')` (if ever needed from an admin tool) invalidates every filtered variant of Trending without touching Top 100.

**No app-level mutations invalidate these tags** — this is a read-only site, so `cacheLife` expiry is the only invalidation path. There is no `updateTag()` call anywhere in `features/anime/`.

### 3.10 Prefetch Architecture

- `CollectionNav`'s five tab links: `HoverPrefetchLink` — these are exactly the "sidebar with twenty chat links" case from Next.js's own Partial Prefetching writeup, except with five links instead of twenty. Default `prefetch="auto"` already gives each of the five route templates a shared shell; `HoverPrefetchLink` upgrades to `prefetch={true}` on hover/focus/touch-intent, which pulls in the `'use cache'`-marked collection data itself (not just the shell) for whichever tab the user is actually about to click.
- `MediaCard` links to `/anime/[id]`: plain `<Link>`, default `prefetch="auto"`. Because Partial Prefetching shares one shell per route template, a 40-card grid doesn't multiply into 40 prefetch requests — it's already just the one `/anime/[id]` shell, prefetched once. There's no need to gate this behind hover the way the previous draft did; that concern was solving a problem 16.3 already solves for you.
- Collection routes export `prefetch = 'allow-runtime'` (§3.5) so a hovered `CollectionNav` link can prefetch the *specific filtered/unfiltered result set* the user is about to land on, not just the shell. Per Next.js's own docs, this trades some extra server load for that deeper prefetch — acceptable here since it's scoped to five nav links, not the whole grid.
- Filter/search changes trigger `router.replace`, not a prefetch — they're not "about to navigate," they're already navigating.

### 3.11–3.12 Streaming & Suspense

| Boundary | Fallback |
|---|---|
| `AnimeResults` (page 1) | `AnimeResultsSkeleton` — grid of card skeletons matching real breakpoints |
| Pages 2+ (`BrowsePaginator`) | Same skeleton, wrapped in `Crossfade` |
| `CollectionNav`, `SearchBar`, `FilterSidebar` | None needed — all client-rendered from `useSearchParams()`, no server fetch, no boundary |

### 3.13 State Management

- Collection identity: the path. Never state.
- Filters/search: URL search params, read via `useSearchParams()` in every client leaf that needs them — never threaded down as server props.
- Scroll depth: `BrowsePaginator`'s local `pages` array (§3.8) — intentionally not in the URL.
- Search debounce: 300ms before the `router.replace` fires.

### 3.14 Loading UI

Initial: `AnimeResultsSkeleton` with 20 placeholders. Load more: one skeleton page appended, crossfaded in. Collection switch: full navigation, brand-new Suspense boundary and skeleton (this is a real page load, not a transition to animate around).

### 3.15–3.16 Error Handling & Empty States

- `ErrorBoundary` around `AnimeResults` — a failed AniList call takes down the grid, not the header/filters.
- Rate limiting (AniList: 90 req/min, 429 with `X-RateLimit-Remaining`/`Retry-After`): `lib/anilist.ts` classifies this distinctly from a generic failure so the boundary can say "We're fetching a lot of anime data — try again in a moment" instead of a bare error.
- Empty search: *"No anime found matching '[search]' in [collection]."* + Clear Filters.
- Empty filters: *"No anime match these filters in [collection]."* + Clear All.
- Empty Upcoming: *"No upcoming anime announced yet. Check back soon!"* — a legitimate between-season state, not an error.

### 3.17 Responsive Behavior

| Breakpoint | Layout |
|---|---|
| Mobile (<768px) | Single column. `CollectionNav`: horizontal scroll tabs. Filters: bottom-sheet drawer. |
| Tablet (768–1024px) | 2-column grid. Filters: collapsible panel. |
| Desktop (>1024px) | 3–5 column grid. Filters: fixed 240px sidebar. |

### 3.18 Accessibility Checklist

- [ ] `CollectionNav`: `role="tablist"` / `role="tab"` / `aria-selected`
- [ ] Filter controls: keyboard-navigable, correct `role`/`aria-checked`
- [ ] Filter drawer: focus trap, `aria-label`, closes on Escape
- [ ] Active filter chips: removable via keyboard
- [ ] `SearchBar`: `role="searchbox"`, `aria-label="Search anime"`
- [ ] Result count: `aria-live="polite"`
- [ ] Sentinel/load-more region: `aria-label="Load more anime"`
- [ ] `role="list"` / `role="listitem"` on the grid
- [ ] `prefers-reduced-motion`: no scroll animation on filter change

### 3.19 SEO Strategy

Every collection route is real, canonical, indexable content — no `noindex`, no thin-content label.

```tsx
// features/anime/lib/collection-config.ts
export function getCollectionMetadata(collection: AnimeCollection): Metadata {
  const c = COLLECTIONS[collection];
  return {
    title: c.title,
    description: c.description,
    openGraph: { title: c.title, description: c.description, type: 'website' },
    alternates: { canonical: `/anime/${collection}` },
  };
}
```

| Collection | Title | Description |
|---|---|---|
| Trending | "Trending Anime — AniNext" | "See what anime is trending right now based on community activity." |
| Popular | "Popular Anime This Season — AniNext" | "The most popular anime airing this season." |
| Top 100 | "Top 100 Anime of All Time — AniNext" | "The 100 highest-rated anime of all time, ranked by user scores." |
| Upcoming | "Upcoming Anime — AniNext" | "The most anticipated upcoming anime." |
| All-Time Popular | "Most Popular Anime — AniNext" | "The most popular anime of all time by community engagement." |

- [ ] Every route exports collection-specific `generateMetadata`
- [ ] Canonical is the bare collection path; **filtered URLs (with query params) also canonicalize to the bare path** to avoid duplicate indexing of every filter combination
- [ ] `<h1>` per collection, semantic `<section>` around results
- [ ] JSON-LD `ItemList` with `ListItem` entries for the first page of results
- [ ] `/anime` → `/anime/trending` is a real 308 (`permanentRedirect`, §3.1), so ranking signal consolidates rather than resetting

### 3.20 Performance Checklist

- [ ] Filter sidebar: zero blocking fetch, purely client-rendered from the URL
- [ ] Genre list: `'use cache'`, `anime:genres`, `static` profile
- [ ] Collection switch: full navigation → new cache entry with the correct `cacheLife` for that collection
- [ ] Images: responsive `sizes`, `loading="lazy"` below the fold
- [ ] Virtualization considered, rejected — grid + lazy images is sufficient at this scale

### 3.21 Animation Opportunities

- Card → detail: `view-transition-name: browse-card-{id}` on the cover image (shared with the homepage's cards, §2.19).
- New pages appended by `BrowsePaginator`: wrapped in `Crossfade` (§3.8) — only the *newly appended* page crossfades, not the whole grid.
- Collection switch and filter change: full navigation / `router.replace`, which is already a clean break — no extra transition needed on top.

### 3.22 Future Extensibility

- **Multi-genre**: swap `genre` → `genre_in: [String]` once the sidebar goes from radio to checkboxes for genre.
- **Tag filters**: add `tag` / `tag_in` (AniList media tags, distinct from genres) — same shape as format/status.
- **Studio filter**: implement the `Studio.media` branch sketched in §3.7. The blocker isn't missing data, it's UX — resolving a studio *name* to the right `Studio` node needs its own type-ahead (AniList's `Studio(search: ...)` returns a best-effort match, not a guaranteed unique result).
- **Sort by date**: `START_DATE_DESC` / `END_DATE_DESC` as additional collection variants.
- **New collections**: one `collection-config.ts` entry + one route folder — additive by design (§3.5).

### 3.23 Folder Structure

Covered by §1.1.

### 3.24 Architectural Rationale for Next.js 16.3

Path-based routing is what makes the rest of this section's cache and prefetch story work cleanly: each route gets its own `cacheLife` (§3.9), its own shell (§3.10), and its own Instant Insight compliance (§1.3) independently. Collapsing all five into `/anime?sort=` would force one shared cache profile and one shared shell across data with very different freshness needs — the opposite of what Cache Components is for.

---

## 4. Route: `/anime/[id]` — Detail Page

### 4.1 UX Goals

The hero and core metadata (title, cover, score, synopsis) must be visible immediately — this is the page most likely to be a shared link or a search-engine landing page. Everything else (characters, staff, relations, reviews, recommendations, airing schedule) streams in independently.

### 4.2 Page Wireframe Hierarchy

```text
[Site Header]
├── <AnimeHero />               — banner, cover, title, score, genres, synopsis (Suspense #1)
├── <AnimeInfo />                — format, episodes, studio, source, duration (part of hero query)
├── [Tabs or stacked sections]
│   ├── <AnimeCharacters />     — Suspense #2
│   ├── <AnimeStaff />          — Suspense #3
│   ├── <AnimeAiringSchedule /> — Suspense #4 (only if status is RELEASING/NOT_YET_RELEASED)
│   ├── <AnimeRelations />      — Suspense #5
│   ├── <AnimeRecommendations />— Suspense #6 (AniList's aggregate recs, not personalized)
│   └── <AnimeReviews />        — Suspense #7
[Site Footer]
```

### 4.3 Component Tree

All server components, each async and independently fetching. No client components are required on this page in the read-only scope — there's no favorite button, no watchlist toggle, nothing to make interactive beyond `<Link>`s (relations, recommendations, staff/character detail links).

### 4.4 Server / Client Boundary

100% server. This is a direct consequence of removing favorites/watchlist from scope — the earlier draft's only client component on this page was a `FavoriteButton`.

### 4.5 AniList Query Plan (see §4.6 for why it's split this way)

```graphql
query AnimeHero($id: Int) {
  Media(id: $id, type: ANIME) {
    id
    title { romaji english native userPreferred }
    coverImage { extraLarge large color }
    bannerImage
    description(asHtml: false)
    averageScore
    meanScore
    popularity
    favourites
    format
    status
    episodes
    duration
    season
    seasonYear
    genres
    source
    studios(isMain: true) { nodes { id name siteUrl } }
    nextAiringEpisode { episode airingAt timeUntilAiring }
  }
}
```

```graphql
query AnimeCharacters($id: Int, $page: Int) {
  Media(id: $id) {
    characters(page: $page, perPage: 12, sort: [ROLE, RELEVANCE]) {
      pageInfo { hasNextPage }
      edges {
        role
        voiceActors(language: JAPANESE) { id name { full } image { medium } }
        node { id name { full } image { medium } }
      }
    }
  }
}
```

```graphql
query AnimeStaff($id: Int, $page: Int) {
  Media(id: $id) {
    staff(page: $page, perPage: 10) {
      edges { role node { id name { full } image { medium } } }
    }
  }
}
```

```graphql
query AnimeRelations($id: Int) {
  Media(id: $id) {
    relations {
      edges {
        relationType(version: 2)
        node { id title { userPreferred } coverImage { large } format status }
      }
    }
  }
}
```

```graphql
query AnimeRecommendations($id: Int, $page: Int) {
  Media(id: $id) {
    recommendations(page: $page, perPage: 8, sort: [RATING_DESC]) {
      nodes { mediaRecommendation { id title { userPreferred } coverImage { large } averageScore } }
    }
  }
}
```

```graphql
query AnimeReviews($id: Int, $page: Int) {
  Media(id: $id) {
    reviews(page: $page, perPage: 5, sort: [RATING_DESC]) {
      nodes { id summary score user { name avatar { medium } } }
    }
  }
}
```

```graphql
query AnimeAiringSchedule($id: Int) {
  Media(id: $id) {
    airingSchedule(notYetAired: true, perPage: 25) {
      nodes { episode airingAt }
    }
  }
}
```

### 4.6 Query Splitting Strategy

Every section below the hero is its **own** query hitting `Media(id: $id) { <one field> }`, not one giant query with every connection attached. AniList resolves each of these independently server-side regardless, but splitting them client-side into separate cached functions means:

- The hero (§4.5, first query) can be cached with a short-ish `cacheLife` while `characters`/`staff`/`relations` — which change even less often than the media's own metadata — get a longer one, independently.
- A slow `reviews` or `recommendations` connection (paginated, potentially large) never blocks the hero's Suspense boundary from resolving.
- Each section's Suspense fallback appears and resolves on its own schedule — this is the literal point of "split large queries into logical streams" from the original spec, now backed by a concrete query-per-section plan instead of a general principle.

### 4.7 Cache Architecture

| Section | cacheTag | cacheLife |
|---|---|---|
| Hero | `anime:detail:{id}` | `home` |
| Characters | `anime:characters:{id}` | `static` |
| Staff | `anime:staff:{id}` | `static` |
| Relations | `anime:sub:{id}:relations` | `static` |
| Recommendations | `anime:sub:{id}:recs` | `home` |
| Reviews | `anime:sub:{id}:reviews` | `home` |
| Airing schedule | `anime:sub:{id}:airing` | `trending` |

Per-ID tagging means a future need to force-refresh one title's data (e.g., after a correction) never has to touch any other title's cache.

### 4.8 Prefetch Architecture

`MediaCard` links from `AnimeRelations`/`AnimeRecommendations` use the same default `prefetch="auto"` as everywhere else (§3.10) — no special-casing needed here.

### 4.9–4.10 Streaming & Suspense

One `<Suspense>` per section listed in §4.2, each with its own skeleton sized to that section's real layout (character grid skeleton, staff list skeleton, etc.) — independent streaming per §4.6.

### 4.11 State Management

None — no tabs-as-client-state; if sections are visually tabbed, the tabs are anchor-scroll (`#characters`, `#staff`) rather than client state, so the page stays server-only and deep-linkable to a section.

### 4.12–4.14 Loading, Error, Empty

- Loading: per-section skeletons as above.
- Error: `ErrorBoundary` per section — a broken `reviews` fetch doesn't take down the hero.
- Empty: sections with zero results (e.g., no reviews yet) render a quiet "No reviews yet" rather than disappearing, so the layout doesn't visibly shift once data resolves.
- `app/(browse)/anime/[id]/not-found.tsx`: AniList returning no `Media` for the given `id` calls `notFound()` from the hero query — this is exactly the case `catchError`-based boundaries (§1.3) are chosen to not interfere with.

### 4.15 Responsive Behavior

Hero: stacked (banner → cover+title → synopsis) on mobile, side-by-side on desktop. Sections below: single column on mobile, 2–4 column card grids on desktop depending on section.

### 4.16 Accessibility Checklist

- [ ] Hero `<h1>` is the anime title
- [ ] Section headers are real `<h2>`s, anchor-linkable
- [ ] Character/staff cards: `alt` text names the person, not just "photo"
- [ ] Review scores: numeric value exposed to assistive tech, not just a visual bar

### 4.17 SEO Checklist

- [ ] `generateMetadata({ params })`: title = anime's preferred title, description = truncated synopsis, canonical `/anime/{id}`
- [ ] Open Graph image = the anime's banner/cover
- [ ] JSON-LD: `TVSeries` or `Movie` (based on `format`) with `aggregateRating` from `averageScore`

### 4.18 Performance Checklist

- [ ] Hero image `priority`
- [ ] Below-fold section images `loading="lazy"`
- [ ] Reviews/recommendations paginated server-side (`perPage`), not fetched in full and sliced client-side

### 4.19 Animation Opportunities

`view-transition-name: browse-card-{id}` on the hero cover image — continues the same transition name a `MediaCard` used to get here, so the card visually "becomes" the hero rather than a hard cut. Sections crossfade in via `Crossfade` as their Suspense boundaries resolve.

### 4.20 Future Extensibility

Favorite/watchlist toggles, once accounts exist, would be a small `'use client'` leaf added to `AnimeHero` calling a new Server Function — but that's a new phase (per the scope note), not a stub carried in this document.

### 4.21 Folder Structure for This Page

Covered by §1.1.

### 4.22 Architectural Rationale for Next.js 16.3

This page is the clearest case for Stream-over-Block: nothing here should trigger `export const instant = false`. A slightly-stale cached hero streaming in instantly is strictly better UX than making every detail-page navigation wait on seven parallel AniList queries.

---

## 5. Route: `/airing` — Airing Schedule

### 5.1 UX Goals

A week-at-a-glance view of what's airing, so users can plan what to watch without hunting through individual detail pages.

### 5.2 Page Wireframe Hierarchy

```text
[Site Header]
├── <AiringCalendar />          — Week selector (prev/next), day columns
├── <AiringTimeline />          — Chronological list for the selected day
[Site Footer]
```

### 5.3 Component Tree

`AiringPage (server)` → `AiringCalendar (server, async)` → `AiringTimeline (server, async)` per selected day.

### 5.4 Server / Client Boundary

Server, with one client leaf: the week/day selector needs `onClick` navigation — implemented as `<Link href="/airing?day=...">` (no client state needed at all; the selector is just styled links).

### 5.5 AniList Query Plan

```graphql
query AiringWeek($start: Int, $end: Int) {
  Page(perPage: 50) {
    airingSchedules(airingAt_greater: $start, airingAt_lesser: $end, sort: [TIME]) {
      episode
      airingAt
      media {
        id
        title { userPreferred }
        coverImage { medium }
        format
      }
    }
  }
}
```

`$start`/`$end` are Unix timestamps bounding the selected day or week, computed server-side from the `day` search param (defaulting to today). `airingAt_greater`/`airingAt_lesser` and `sort: [TIME]` (a member of `AiringSort`) come straight from the `AiringSchedule` root query's documented filter set.

### 5.6 Cache Architecture

`anime:airing:day:{date}` / `anime:airing:week:{monday}`, `trending` profile — airing times can shift, so this shouldn't sit stale for more than a few minutes.

### 5.7 Prefetch Architecture

Day/week navigation links: default `prefetch="auto"`; the route itself doesn't need `allow-runtime` since the day is a small, bounded set of likely values, not an open-ended filter space.

### 5.8–5.9 Streaming & Suspense

`AiringTimeline` is its own Suspense boundary per day, so switching days doesn't block on the calendar re-rendering.

### 5.10 State Management

None — the selected day lives in the URL (`?day=YYYY-MM-DD`), read via `searchParams` in the server page.

### 5.11–5.13 Loading, Error, Empty

- Loading: timeline skeleton matching a typical day's episode count.
- Error: `ErrorBoundary` around the timeline.
- Empty: "Nothing airing today" — genuinely possible on quiet days, not treated as an error.

### 5.14 Responsive Behavior

Mobile: single scrollable day list with a horizontal day-picker strip. Desktop: full week grid.

### 5.15 Accessibility Checklist

- [ ] Day picker: keyboard-navigable, current day marked with `aria-current="date"`
- [ ] Episode rows: airing time in a machine-readable `<time>` element

### 5.16 SEO Checklist

- [ ] `generateMetadata`: "Anime Airing Schedule — AniNext", canonical `/airing`
- [ ] Not canonicalized per-day — `?day=` variants point back to the bare `/airing` canonical, same reasoning as browse filters (§3.19)

### 5.17 Performance Checklist

- [ ] Cover thumbnails only (`coverImage.medium`), no full detail data needed per row

### 5.18 Animation Opportunities

`Crossfade` around `AiringTimeline` when switching days.

### 5.19 Future Extensibility

Per-user airing reminders/notifications require accounts — out of scope, same as favorites/watchlist.

### 5.20 Folder Structure for This Page

Covered by §1.1.

---

## 6. Shared Infrastructure

### 6.1 GraphQL Client (`lib/anilist.ts`)

```ts
import 'server-only';

const ENDPOINT = 'https://graphql.anilist.co';

export class AniListError extends Error {
  constructor(
    message: string,
    public kind: 'rate_limited' | 'outage' | 'graphql' | 'network',
    public retryAfterSeconds?: number,
  ) {
    super(message);
  }
}

export async function anilistFetch<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query, variables }),
  });

  if (res.status === 429) {
    const retryAfter = Number(res.headers.get('Retry-After') ?? res.headers.get('X-RateLimit-Reset') ?? 30);
    throw new AniListError('AniList rate limit hit', 'rate_limited', retryAfter);
  }
  if (res.status === 403) throw new AniListError('AniList API temporarily unavailable', 'outage');
  if (!res.ok) throw new AniListError(`AniList request failed (${res.status})`, 'network');

  const json = await res.json();
  if (json.errors?.length) throw new AniListError(json.errors[0].message, 'graphql');
  return json.data as T;
}
```

AniList's public GraphQL endpoint has no API key; the rate limit is 90 requests/minute with burst limiting on top, and a 429 carries `X-RateLimit-Remaining`/`Retry-After`. Because every read in `anime-queries.ts` is `'use cache'`, the number of *actual* requests this client makes is bounded by cache misses across all users, not by traffic — the 90/min ceiling is realistically only a concern for the first visitor after a `cacheLife` expiry on a popular route, which the `rate_limited`/`outage` classification (§3.15) exists to degrade gracefully from.

### 6.2 Fragment Definitions

A shared `MediaCardFields` fragment (id, title, coverImage, bannerImage, averageScore, popularity, format, episodes, status, season, seasonYear, genres) is reused across the homepage, all five browse queries, and the detail page's relations/recommendations queries — one definition, imported everywhere `MediaCard` needs data, so the card's prop shape and the fragment's field list can never drift apart.

### 6.3 Cache Tag Contract (`features/anime/anime-cache.ts`)

```ts
export const ANIME_CACHE = {
  genres: 'anime:genres' as const,
  browseCollection: (collection: string, hash: string) => `anime:browse:${collection}:${hash}` as const,
  detail: (id: number) => `anime:detail:${id}` as const,
  characters: (id: number) => `anime:characters:${id}` as const,
  staff: (id: number) => `anime:staff:${id}` as const,
  subSection: (id: number, section: 'relations' | 'recs' | 'reviews' | 'airing') =>
    `anime:sub:${id}:${section}` as const,
  airingDay: (date: string) => `anime:airing:day:${date}` as const,
  airingWeek: (monday: string) => `anime:airing:week:${monday}` as const,
} as const;
```

No `favorites` / `watchlist` / `user-*` entries — there is nothing in this codebase that would ever call `updateTag()` on them, since there are no user mutations in scope at all.

### 6.4 Type Definitions (`features/anime/types/anime.ts`)

```ts
export interface MediaTitle { romaji?: string; english?: string; native?: string; userPreferred?: string }
export interface MediaCoverImage { extraLarge?: string; large?: string; medium?: string }
export interface Studio { id: number; name: string; siteUrl?: string }

export interface Media {
  id: number;
  idMal?: number;
  title: MediaTitle;
  coverImage: MediaCoverImage;
  bannerImage?: string;
  description?: string;
  format?: string;
  status?: string;
  episodes?: number;
  duration?: number;
  season?: string;
  seasonYear?: number;
  genres: string[];
  averageScore?: number;
  popularity?: number;
  favourites?: number;
  studios?: { nodes: Studio[] };
}

export type AnimeCollection = 'trending' | 'popular' | 'top100' | 'upcoming' | 'alltimepopular';

export interface AnimeFilters {
  genre?: string;
  format?: string[];      // → format_in
  status?: string[];      // → status_in
  season?: string;
  year?: number;
  country?: string;       // → countryOfOrigin
  search?: string;
  isAdult?: boolean;
  studio?: string;        // deferred, see §3.22
}
```

---

## 7. Verification Checklist

- [ ] `app/**/page.tsx` files import only feature components + `Suspense`/`ErrorBoundary` — never `anime-queries` directly
- [ ] Every collection page is synchronous; `searchParams.then()`, never `await searchParams`
- [ ] `FilterSidebar`, `SearchBar`, `CollectionNav`, `ActiveFilters` read the URL via `useSearchParams()`/`usePathname()` themselves — **none of them receive `searchParams` as a server-passed prop**
- [ ] `AnimeResults`/`MediaGrid`/`AnimeHero` etc. own their `*Skeleton` in the same file, defined last
- [ ] `anime-queries.ts` starts with `import 'server-only'`
- [ ] There is no `anime-actions.ts` and no `FavoriteButton` anywhere in the tree
- [ ] Every `getBrowseCollection`/detail-section read is `'use cache'` with global + collection/id-scoped `cacheTag`s and a named `cacheLife`
- [ ] The `Studio.media` branch (when built) is exercised by a `?studio=` test case, not silently dropped
- [ ] `/anime` uses `permanentRedirect`, not `redirect`
- [ ] `top100`'s sentinel disables itself at 100 loaded items
- [ ] `renderBrowsePage` / `BrowsePaginator` return and accumulate rendered RSC nodes, not raw JSON re-rendered client-side
- [ ] `cacheComponents: true` and `partialPrefetching: true` are both set in `next.config.ts`
- [ ] No route sets `export const instant = false` unless a genuine case for Blocking is found — everything here should Stream or Cache
- [ ] Rate-limit/outage errors from AniList surface a distinct message from "no results"

---

## 8. Build Order

1. Scaffold — Next 16.3, `cacheComponents`/`partialPrefetching` flags, Tailwind v4 tokens, shadcn/ui base.
2. `lib/anilist.ts` + fragments — verify a raw trending query against the live API before wiring the app.
3. `features/anime/anime-queries.ts` for `trending` only, plus `collection-config.ts` and `anime-cache.ts`.
4. `/anime/trending` end-to-end: `AnimeResults`/`MediaGrid`/`MediaCard` + skeletons, `permanentRedirect` from `/anime`. Drive CLS to zero here before replicating.
5. Remaining four collection routes — season/next-season math, `Studio.media` branch stubbed but not wired (deferred per §3.22).
6. `SearchBar`/`FilterSidebar`/`ActiveFilters`, all reading `useSearchParams()` directly per §3.6.
7. `BrowsePaginator` + `renderBrowsePage` Server Function + `InfiniteScrollSentinel`, Top100 cap.
8. `CollectionNav` + `HoverPrefetchLink`, `export const prefetch = 'allow-runtime'` on routes, `Crossfade` wiring.
9. Homepage (§2), reusing every browse component.
10. Detail page (§4) — query splitting, per-section Suspense.
11. Airing page (§5).
12. SEO pass — `generateMetadata` everywhere, OG images, JSON-LD.
13. Resilience pass — `catchError` boundaries, rate-limit backoff, empty states, a11y audit, Instant Insights clean run across every route.