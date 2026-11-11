import { instant } from "@next/playwright";
import { expect, test } from "@playwright/test";

// Contract: a browse-grid card already has the detail route's App Shell when
// it is clicked. The hero title comes from params, so it belongs to the
// navigation stage and must not be present before it.
test("browse card commits the detail shell before its data", async ({ page }) => {
  await page.goto("/anime/top100");

  const card = page.locator('a[href="/anime/1"]').first();
  await expect(card).toBeVisible();

  await instant(page, async () => {
    await card.click();
    await page.waitForURL((url) => url.pathname === "/anime/1");

    // App Shell: both route-level Suspense fallbacks commit immediately.
    await expect(page.getByTestId("anime-hero-skeleton")).toBeVisible();
    await expect(page.getByTestId("anime-detail-skeleton")).toBeVisible();

    // Navigation stage: URL-derived content is not part of the prefetch.
    await expect(page.getByRole("heading", { name: "Mock Anime 1", exact: true })).toHaveCount(0);
  });

  await expect(page.getByRole("heading", { name: "Mock Anime 1", exact: true })).toBeVisible();
});
