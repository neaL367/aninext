# instant-nav rig: AniNext

- BUILD: `$env:EXPOSE_TESTING_API='1'; bun run build` — the flag is read at build time only.
- EXPOSE: `experimental.exposeTestingApiInProductionBuild` binds to `process.env.EXPOSE_TESTING_API === "1"` ([next.config.ts](next.config.ts#L5)), so user-facing deployments never ship the testing API.
- RUN: `bun run test:instant` → `playwright test --config=playwright.instant.config.ts`. That config owns both servers: mock AniList on 3101 and `next start` on 3000 with `ANILIST_ENDPOINT` injected.
- TEST USER: public; no authentication. State: deterministic fixtures from `e2e/mock-anilist.ts` (top-100 cards are ids 1001+, titled `Mock Anime <id>`), Desktop Chrome viewport.
- DRIFT: none known.
- CONTRACTS: `/anime/top100` card `a[href="/anime/1001"]` → `/anime/1001`; ready before the click: hero skeleton + detail skeleton (App Shell); waits for navigation: hero `<h1>` title and detail sections; trigger: viewport, default `<Link>`.
- LOOP: local — build with `EXPOSE_TESTING_API=1`, run `bun run test:instant`, edit, repeat. The config restarts both servers on every run.
- LIVENESS: n/a; local build and start.
- WALLS: ports 3000 and 3101 must be free (`reuseExistingServer: false`, so a stray dev server fails the run rather than silently testing the wrong artifact); `next start` must serve the build produced with the flag.
