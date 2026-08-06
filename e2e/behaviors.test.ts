import { test, expect } from "@playwright/test";

test.describe("infinite scroll pagination", () => {
  test("loads more results when scrolled to bottom", async ({ page }) => {
    await page.goto("/anime/trending");
    await expect(page.getByRole("list", { name: "Anime results" })).toBeVisible();

    const initial = await page.locator('[role="listitem"]').count();
    expect(initial).toBeGreaterThan(0);

    await page.locator('[aria-label="Load more anime"]').scrollIntoViewIfNeeded();
    await expect
      .poll(async () => page.locator('[role="listitem"]').count(), { timeout: 15000 })
      .toBeGreaterThan(initial);
  });
});

test.describe("hover preview card", () => {
  test("opens preview on hover", async ({ page }) => {
    await page.goto("/anime/trending", { waitUntil: "domcontentloaded" });
    const trigger = page.locator('[data-slot="hover-card-trigger"]').first();
    await expect(trigger).toBeVisible();
    await page.waitForTimeout(500);
    await page.mouse.move(10, 10);
    await page.waitForTimeout(300);
    await trigger.hover({ force: true });
    await expect(page.locator('[data-slot="hover-card-content"]')).toBeVisible({
      timeout: 8000,
    });
  });
});

test.describe("offline banner", () => {
  test("shows banner when browser goes offline", async ({ page, context }) => {
    await page.goto("/");
    await context.setOffline(true);
    await expect(page.getByRole("status")).toBeVisible({ timeout: 5000 });
    await context.setOffline(false);
  });
});

test.describe("API failure error states", () => {
  test("detail page shows error boundary when anime is not found", async ({ page }) => {
    const missingId = Math.floor(100_000 + Math.random() * 800_000);
    await page.goto(`/anime/${missingId}`);
    await expect(page.getByRole("heading", { name: "Anime details failed to load" })).toBeVisible();
  });

  test("collection shows empty state for unmatched filters", async ({ page }) => {
    const uncachedGenre = `XxX-${Math.floor(Math.random() * 1e6)}`;
    await page.goto(`/anime/trending?genre=${uncachedGenre}`);
    await expect(page.getByRole("heading", { name: "Trending Anime" })).toBeVisible();
    await expect(page.getByText("No results match these filters")).toBeVisible();
  });
});
