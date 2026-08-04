# AniNext UI System

AniNext uses familiar Vercel and Next.js visual language with an immersive anime layer: deep black surfaces, Geist typography, hairline borders, restrained blue-violet accents, and image-led composition.

## Direction

- **Base:** near-black `#050505`, graphite surfaces, soft white text.
- **Accent:** electric blue-violet for links, focus, active states, and primary actions.
- **Luxury detail:** subtle ambient gradients, precise spacing, quiet borders, large artwork, no decorative noise.
- **Typography:** Geist Sans for all interface text. Geist Mono only for scores, dates, episode counts, shortcuts, and compact metadata.
- **Shape:** small radius, square controls, no excessive pill UI, no heavy shadows.

## Layout

- Use fluid rails up to `1600px`; do not force every route into one narrow container.
- Homepage: immersive featured panel, content shelves, seasonal feature mosaic, genre explorer.
- Browse: heading, collection navigation, search, filter rail, responsive result grid.
- Detail: art-led hero, watch section, cast, recommendations, right-side schedule/relations/staff/genres.
- Airing: day selector and full-width timeline with a compact explanatory rail.
- Mobile: recomposed one-column layouts, horizontal shelves, fixed bottom navigation, no desktop shrinkage.

## Components

- `MediaCard`: image-first card with title and minimal metadata below artwork.
- `AnimePreviewCard`: elevated hover surface matching global colors; banner when available, AniList color fallback.
- `SectionRow`: open shelf with concise heading and a single useful action.
- `BrowsePageShell`: fluid workspace with filters and results.
- `AnimeHero`: immersive banner/cover identity block with stable height.
- `ViewTransition`: shared cover morph from browse cards into detail hero.

## Rules

- Keep actions visible and labels literal: `Open profile`, `Full collection`, `Show all`.
- Prefer one strong hierarchy over many badges. Score, live state, and Top 100 rank only when meaningful.
- Preserve visible focus rings and `prefers-reduced-motion` behavior.
- Keep descriptions readable with line limits or deliberate expansion.
- Use `content-visibility: auto` only on long, below-the-fold lists where skipped paint will not create blank visual gaps.
- Keep server reads in feature queries and keep client boundaries at interactive leaves.
- Verify layouts at 375px, 768px, 1024px, and 1440px.
