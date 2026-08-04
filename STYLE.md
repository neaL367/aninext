# AniNext — Implementation Styles

A shadcn/ui design system in the Vercel house style: near-monochrome neutrals, Geist typography, restrained radius, hairline borders, motion that's felt more than seen. Generated with the `ui-ux-pro-max` skill's search tool (`search.py --design-system`, `--domain style/typography/color`, `--stack shadcn/nextjs`) against this project's `ARCHITECTURE.md`, not hand-picked — the queries and raw output are noted inline so the reasoning is checkable.

---

## 0. What "Vercel style" cashes out to, concretely

Running the skill's design-system generator against an entertainment/streaming brief surfaces "Dark Mode (OLED)" as the top style match — expected for a site whose whole surface area is cinematic cover art and banners. But that pass alone leans toward saturated indigo/green (tuned for an audio-player brief, not what we want here). The Vercel-specific signal comes from two more targeted queries:

- `--domain typography "geist inter modern developer clean"` surfaces **Geist / Geist Mono** directly — the skill's font database lists them with `Guillermo Rauch` among the listed authors, i.e. this is Vercel's own typeface, not a lookalike.
- `--domain color "neutral monochrome black white single accent developer"` surfaces a `#18181B` / `#FAFAFA` / `#2563EB` triad annotated **"Monochrome + blue accent"** — near-black ink, near-white paper, one restrained blue accent. That's the Vercel palette shape: color is used for state and action, not decoration.

So "Vercel style" here means: a zinc/neutral scale doing almost all the work, Geist Sans for UI text and Geist Mono for numeric/technical labels (scores, episode counts, timestamps), one accent color, small consistent radius, borders over shadows, and dark-mode-first because the content (banners, cover art) is designed to be seen on black.

---

## 1. Color System

Dark is the default theme (matches AniNext's actual content — banner art and cover images read best on near-black, same reasoning the OLED-style search result gave for entertainment platforms); light is fully supported per shadcn's own dark-mode guideline ("Define both `:root` and `.dark` color schemes... Don't: only light mode colors" — pulled directly from `--stack shadcn`).

```css
/* app/globals.css */
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

:root {
  --radius: 0.5rem;

  /* Light — near-white paper, near-black ink, one accent */
  --background: oklch(0.99 0 0);
  --foreground: oklch(0.145 0.005 285);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0.005 285);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0.005 285);
  --primary: oklch(0.145 0.005 285);
  --primary-foreground: oklch(0.99 0 0);
  --secondary: oklch(0.96 0.002 285);
  --secondary-foreground: oklch(0.145 0.005 285);
  --muted: oklch(0.96 0.002 285);
  --muted-foreground: oklch(0.5 0.01 285);
  --accent: oklch(0.55 0.2 260);          /* the one blue */
  --accent-foreground: oklch(0.99 0 0);
  --destructive: oklch(0.58 0.24 27);
  --destructive-foreground: oklch(0.99 0 0);
  --border: oklch(0.9 0.003 285);
  --input: oklch(0.9 0.003 285);
  --ring: oklch(0.55 0.2 260 / 0.5);

  /* AniNext-specific semantic aliases (not shadcn defaults) */
  --score-high: oklch(0.65 0.19 145);      /* averageScore ≥ 75 */
  --score-mid: oklch(0.75 0.16 85);        /* averageScore 50–74 */
  --score-low: oklch(0.6 0.05 285);        /* averageScore < 50 */
  --live-badge: oklch(0.62 0.21 25);       /* "airing now" indicator */
}

.dark {
  --background: oklch(0.09 0.003 285);     /* near-black, not pure #000 — avoids OLED smear on large fills */
  --foreground: oklch(0.97 0.002 285);
  --card: oklch(0.13 0.004 285);
  --card-foreground: oklch(0.97 0.002 285);
  --popover: oklch(0.13 0.004 285);
  --popover-foreground: oklch(0.97 0.002 285);
  --primary: oklch(0.97 0.002 285);
  --primary-foreground: oklch(0.145 0.005 285);
  --secondary: oklch(0.19 0.005 285);
  --secondary-foreground: oklch(0.97 0.002 285);
  --muted: oklch(0.19 0.005 285);
  --muted-foreground: oklch(0.65 0.01 285);
  --accent: oklch(0.65 0.19 260);          /* lifted lightness so the accent still pops on dark */
  --accent-foreground: oklch(0.09 0.003 285);
  --destructive: oklch(0.62 0.22 27);
  --destructive-foreground: oklch(0.97 0.002 285);
  --border: oklch(1 0 0 / 0.08);           /* hairline, not a solid gray — Vercel's dark-mode border trick */
  --input: oklch(1 0 0 / 0.12);
  --ring: oklch(0.65 0.19 260 / 0.5);

  --score-high: oklch(0.72 0.18 145);
  --score-mid: oklch(0.8 0.15 85);
  --score-low: oklch(0.55 0.01 285);
  --live-badge: oklch(0.68 0.2 25);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground; }
}
```

Why oklch, not the older HSL-triplet shadcn format: Tailwind v4's CSS-first `@theme` convention expects real color functions, and oklch keeps perceptual lightness consistent as you move the accent between light/dark mode (the dark-mode accent above is the *same hue*, just lifted in lightness — that's why it doesn't look washed out or garish switching themes, which flat HSL adjustment tends to get wrong).

**Score-color mapping is the one deliberately non-shadcn addition.** AniList's `averageScore` is the single most scannable number on a `MediaCard`, so it gets its own semantic tokens rather than reusing `--destructive`/generic green — `--score-high`/`--score-mid`/`--score-low` are read only by the score badge, nowhere else, so they can be tuned without touching any shadcn primitive.

---

## 2. Typography

```tsx
// app/layout.tsx
import { Geist, Geist_Mono } from 'next/font/google';

const geistSans = Geist({ variable: '--font-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-mono', subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
```

```css
/* in @theme inline, alongside the color tokens */
--font-sans: var(--font-sans), ui-sans-serif, system-ui, sans-serif;
--font-mono: var(--font-mono), ui-monospace, monospace;
```

| Role | Font | Weight | Tracking | Used for |
|---|---|---|---|---|
| Display / Hero title | Geist | 700 | `-0.02em` | `AnimeHero` title, homepage hero |
| H1/H2 | Geist | 600 | `-0.01em` | `PageHeading`, section headers |
| Body | Geist | 400 | normal | Synopsis, descriptions |
| UI label | Geist | 500 | `0.01em`, often uppercase | Filter labels, nav tabs, badges |
| Numeric / technical | **Geist Mono** | 500 | tabular-nums | Score, episode count, popularity, airing countdown, `#1234` IDs |

The Geist Mono rule is the detail worth not skipping: run `averageScore`/episode counts/countdowns in Geist Mono with `tabular-nums`, and a grid of `MediaCard`s stops having numbers that visually jitter against each other — this is the same reason Vercel's own dashboards put numeric metrics in mono. Everything else on the card (title, genre badges) stays Geist Sans.

Type scale (Tailwind's default steps, used consistently rather than inventing new ones):

```text
text-xs    12px  — badges, meta labels
text-sm    14px  — body copy, filter options
text-base  16px  — default body / card title
text-lg    18px  — section sub-headers
text-2xl   24px  — H2 / PageHeading
text-4xl   36px  — H1 on detail hero
text-6xl   60px  — homepage hero title (desktop only; text-4xl on mobile)
```

---

## 3. Spacing, Radius, Elevation

- **Radius**: `--radius: 0.5rem` (8px) as the base — `rounded-lg` on cards/buttons/inputs, `rounded-md` on badges/chips, `rounded-full` only on avatars and the search input. No `rounded-2xl`/`rounded-3xl` anywhere; Vercel's restraint is specifically *not* having a soft, bubbly radius scale.
- **Borders over shadows.** shadcn's own `Card` ships with a border and a very light shadow; on AniNext, drop the shadow to `shadow-none` on `MediaCard` and rely on the `--border` hairline (`oklch(1 0 0 / 0.08)` in dark mode) plus a `hover:border-foreground/20` state. Shadows are reserved for genuinely elevated surfaces — the mobile `FilterDrawer` sheet, dropdowns/popovers — where something is floating *above* the page, not sitting *in* it.
- **Spacing scale**: standard Tailwind 4/8/16/24/32/48/64px steps. Browse grid gutters: `gap-4` mobile, `gap-6` desktop. Section vertical rhythm: `py-12` mobile, `py-20` desktop.

---

## 4. Component Patterns (mapped to `ARCHITECTURE.md`)

### `MediaCard`

```tsx
<Card className="group overflow-hidden rounded-lg border-border/60 bg-card p-0 shadow-none transition-colors hover:border-foreground/20">
  <div className="relative aspect-[2/3] overflow-hidden">
    <Image src={coverImage} alt={`${title} cover`} fill className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" sizes="(min-width:1024px) 20vw, 45vw" />
    {isReleasing && (
      <Badge className="absolute left-2 top-2 bg-[var(--live-badge)] text-white">Airing</Badge>
    )}
  </div>
  <div className="space-y-1 p-3">
    <h3 className="line-clamp-2 text-sm font-medium">{title}</h3>
    <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground tabular-nums">
      <span style={{ color: scoreColor(averageScore) }}>{averageScore / 10}</span>
      <span>·</span>
      <span>{format}</span>
      <span>·</span>
      <span>{episodes ? `${episodes} ep` : status}</span>
    </div>
  </div>
</Card>
```

`p-0` on `Card` + a manually-built body is the shadcn "customize, don't fight" pattern the stack search flagged (`cn()` + composition, not `style=`) — the default `Card` padding assumes a text-first card, and a cover-image-first card needs the image flush to the edge.

### `CollectionNav` (browse tabs)

shadcn `Tabs`, restyled as an underline-indicator bar rather than the default pill/segmented look — closer to Vercel's own dashboard tab bar than to a mobile segmented control:

```tsx
<TabsList className="h-auto w-full justify-start gap-6 rounded-none border-b border-border bg-transparent p-0">
  <TabsTrigger className="rounded-none border-b-2 border-transparent px-1 pb-3 text-sm font-medium text-muted-foreground data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:shadow-none" value="trending">
    Trending
  </TabsTrigger>
  {/* ...repeat per collection */}
</TabsList>
```

### `FilterSidebar`

Desktop: no card/border wrapper at all — filters sit directly on the page background as labeled groups separated by `border-t border-border/60`, not boxed. Mobile drawer: shadcn `Sheet` from the left, which *does* get the elevated-surface shadow (§3) since it's genuinely floating above the grid.

### Badges (format / status / genre)

```tsx
<Badge variant="secondary" className="rounded-md border-none bg-secondary font-mono text-[11px] font-medium uppercase tracking-wide text-secondary-foreground">
  TV
</Badge>
```

Genre badges use `variant="outline"` instead — `border-border/60 bg-transparent` — so a card with five genre badges doesn't turn into five gray blocks competing with the cover art above them.

### Buttons

Primary action (rare — mostly on the detail page, e.g. "Watch trailer" if ever added): `variant="default"`, which resolves to the `--accent` token, not `--primary` — on AniNext `--primary` is reserved for near-monochrome UI chrome (nav, headings), and `--accent` is the one spot of color, exactly matching the "single accent" palette this whole system is built around. Everything else — "Clear filters," "Load more" fallback button — is `variant="outline"` or `variant="ghost"`.

---

## 5. Motion

Pulled from the `ux`/`gsap` domains (`Duration 150–300ms`, `Motion conveys meaning`, `prefers-reduced-motion` respected) and tied directly to the `Crossfade` primitive already defined in `ARCHITECTURE.md` §1.3:

- Hover on `MediaCard`: `transition-transform duration-300` scale (`1.03`), `transition-colors duration-150` on the border — the two run at different speeds on purpose, so the border reacts snappier than the image scales.
- Page-reveal crossfades (`BrowsePaginator` pages, detail-page sections): handled by `Crossfade`'s `<ViewTransition enter="auto" default="none">`, not manual CSS — don't duplicate that logic here.
- Filter/search updates: no grid-wide fade; only the pending-state dimming already specified (`data-pending:opacity-60`) on the results container while `useTransition` resolves.
- Respect `prefers-reduced-motion`: the hover-scale and any autoplay banner motion get a `motion-reduce:transition-none motion-reduce:transform-none` fallback.

---

## 6. Pre-Delivery Checklist

Merged from the skill's generic checklist and the shadcn-specific rules pulled via `--stack shadcn`:

- [ ] Both `:root` and `.dark` color blocks defined — never light-only (shadcn "High" severity rule)
- [ ] Composition via `asChild`/`cn()`/`cva`, not wrapper `<div>`s or inline `style=`
- [ ] No emoji as icons anywhere — Lucide (already a listed dependency) for all iconography
- [ ] `cursor-pointer` on every clickable non-button element (e.g. the whole `MediaCard`, not just its text)
- [ ] Hover/focus states use `transition-colors`/`transition-transform` at 150–300ms, never an instant snap
- [ ] Focus rings visible and never removed (`--ring` token, not `outline-none` without a replacement)
- [ ] Text contrast 4.5:1 minimum in both themes — verify `--muted-foreground` against `--background` specifically, since that's the pairing most likely to drift out of range
- [ ] Numeric fields (`score`, `episodes`, `popularity`, countdowns) in Geist Mono with `tabular-nums`
- [ ] Responsive check at 375 / 768 / 1024 / 1440px
- [ ] `prefers-reduced-motion` fallback present on every custom transition