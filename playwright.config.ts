import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: false,
  workers: 1,
  retries: 1,
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
      command: "bun run dev",
      url: "http://localhost:3000",
      env: { ANILIST_ENDPOINT: "http://127.0.0.1:3101/graphql" },
      reuseExistingServer: false,
      stdout: "ignore",
      name: "Next dev",
      timeout: 120_000,
    },
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
