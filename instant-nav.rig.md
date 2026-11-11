# instant-nav rig: AniNext

- BUILD: `$env:EXPOSE_TESTING_API='1'; bun run build` — the flag is read at build time only.
- EXPOSE: `experimental.exposeTestingApiInProductionBuild` binds to `process.env.EXPOSE_TESTING_API === "1"` ([next.config.ts](next.config.ts#L5)), so user-facing deployments never ship the testing API.
- RUN: `bun run test:instant` → `playwright test --config=playwright.instant.config.ts`. The config owns one server: the production build on port 3000, talking to the live AniList API.
- TEST USER: public; no authentication. Data is live AniList, so the contract asserts structure (skeletons, title marker) rather than specific titles.
- DRIFT: live data changes between runs; never assert on a specific anime title, id, or card count in this contract.
- CONTRACTS: `/anime/top100` first grid card → its `/anime/<id>` detail page; ready before the click: hero skeleton + detail skeleton (App Shell); waits for navigation: the `anime-title` heading and detail sections; trigger: viewport, default `<Link>`.
- LOOP: local — build with `EXPOSE_TESTING_API=1`, run `bun run test:instant`, edit, repeat. The config restarts the server on every run.
- LIVENESS: n/a; local build and start.
- WALLS: port 3000 must be free (`reuseExistingServer: false`, so a stray dev server fails the run rather than silently testing the wrong artifact); `next start` must serve the build produced with the flag; a live AniList outage or rate limit shows up as a contract failure and is an upstream problem, not a prefetch regression.
