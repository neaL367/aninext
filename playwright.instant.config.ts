import { defineConfig, devices } from "@playwright/test";

// Production rig for instant() navigation contracts.
// Build the artifact with EXPOSE_TESTING_API=1 first (see instant-nav.rig.md).
export default defineConfig({
  testDir: "./e2e",
  testMatch: /\.prod\.test\.ts/,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: "bun run e2e/mock-anilist.ts",
      url: "http://127.0.0.1:3101/health",
      reuseExistingServer: false,
      stdout: "ignore",
      name: "Mock AniList",
      timeout: 120_000,
    },
    {
      command: "bun run start",
      url: "http://localhost:3000",
      env: { ANILIST_ENDPOINT: "http://127.0.0.1:3101/graphql" },
      reuseExistingServer: false,
      stdout: "ignore",
      name: "Next production build",
      timeout: 120_000,
    },
  ],
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
