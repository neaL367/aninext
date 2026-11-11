# AniNext UI System

A quiet, editorial anime index. Near-black surfaces, warm ivory type, one vermilion signal, and large artwork. The interface should feel like a film programme, not a dashboard.

## Direction

- **Base:** `#060606` with graphite surfaces and hairline borders.
- **Type:** **Geist Serif is the only typeface** — body, headings, navigation, buttons, metadata, times, and scores. Numeric runs use tabular figures where alignment matters.
- **Accent:** vermilion (`#ff5433`) for live state, active marks, scores, and small signals. Never as a large fill.
- **Shape:** 2–3px radii. No pills, no heavy shadows, no rounded cards.
- **Space:** generous vertical rhythm; section headers are rules, not boxes.
- **Copy:** one label and one action where possible. Remove marketing lines and duplicated metadata.

## Type scale

Legibility floor for body copy and labels. Nothing goes below 11px, and 11px is
reserved for text inside 32px cover placeholders and the airing hour strip.

- **12px** — tracked uppercase labels: eyebrows, nav, section actions, chip text
- **13px** — metadata runs: format, year, episode counts, counts, captions
- **14px** — dense list titles (relations, cast, episodes)
- **15px** — body copy and synopses (`leading-7`)
- **18px** — card titles, ledger titles
- **Display** — section headings and hero titles stay fluid (`clamp`); they carry
  the page, everything else stays quiet.

Contrast: body text is `--foreground`; metadata is the solid
`--muted-foreground` token — do not fade it with an opacity suffix. Text over
artwork may use `text-white/75` or stronger, never below 70%.

## Layout

- Fluid rail up to `1760px`; do not center every route into a narrow column.
- Home: full-bleed featured hero, then numbered editorial sections (`01 Trending`, `02 This season`, `03 Tonight`, `04 Top 100`, `05 Coming soon`, `06 By mood`).
- Browse: serif page title, quiet collection tabs, search, 210px filter rail, 5-column result grid.
- Detail: art-led hero with a serif title, then sparse watch / cast / related sections.
- Airing: serif page title, sticky day rail, hour-band timeline with a live marker.
- Mobile: recomposed one-column layouts, horizontal rails, fixed bottom navigation.

## Components

- `MediaCard`: borderless cover, serif title, mono metadata, CSS-only hover synopsis. No client JS.
- `TrendingIndex`: one large still plus a numbered title ledger.
- `SeasonMosaic`: one large poster and four quiet covers.
- `RankingList`: a two-column ranked ledger with no card chrome.
- `UpcomingStrip`: wide cinematic anticipation cards.
- `SectionHeader`: index + serif title + one action.
- `AnimeHero`: immersive banner/cover identity block with a shared cover morph.
- `AiringTimeline`: hour bands, live marker, hairline rows, thin episode progress.
- `ViewTransition`: shared cover morph from browse cards into the detail hero.

## Rules

- Keep actions literal: `Open title`, `All trending`, `Full season`, `Full ranking`.
- One hierarchy: score, live state, and rank only when meaningful.
- Preserve visible focus rings and `prefers-reduced-motion` behavior.
- Do not add marketing copy, eyebrows, or descriptive paragraphs to sections.
- Keep hover previews CSS-only. Do not reintroduce per-card client components.
- Keep server reads in feature queries and client boundaries at interactive leaves.
- Use `<Suspense>` per section and keep the static shell free of data reads.
- Verify layouts at 375px, 768px, 1024px, and 1440px.
