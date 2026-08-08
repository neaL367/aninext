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

  test("stops top 100 pagination at the collection cap", async ({ page }) => {
    await page.goto("/anime/top100");
    const results = page.locator('[role="listitem"]');
    const sentinel = page.locator('[aria-label="Load more anime"]');
    await expect(results.first()).toBeVisible({ timeout: 15_000 });

    let previousCount = await results.count();
    for (let i = 0; i < 10; i += 1) {
      const didScroll = await page.evaluate(() => {
        const element = document.querySelector('[aria-label="Load more anime"]');
        if (!element) return false;
        element.scrollIntoView({ block: "end" });
        return true;
      });
      if (!didScroll) break;

      await expect
        .poll(
          async () => {
            const count = await results.count();
            if ((await sentinel.count()) === 0) return "done";
            if (count > previousCount) return "loaded";
            return "pending";
          },
          { timeout: 15_000 },
        )
        .toMatch(/loaded|done/);
      previousCount = await results.count();
    }

    expect(await results.count()).toBeLessThanOrEqual(100);
    await expect(page.getByText("End of results")).toBeVisible();
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
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("main")).toBeVisible();
    await expect.poll(() => page.evaluate(() => navigator.onLine), { timeout: 10_000 }).toBe(true);

    await context.setOffline(true);
    await page.evaluate(() => window.dispatchEvent(new Event("offline")));
    await expect.poll(() => page.evaluate(() => navigator.onLine), { timeout: 10_000 }).toBe(false);

    await expect(page.getByRole("status")).toBeVisible({ timeout: 10_000 });
    await context.setOffline(false);
    await page.evaluate(() => window.dispatchEvent(new Event("online")));
    await expect(page.getByRole("status")).toHaveCount(0, { timeout: 10_000 });
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
