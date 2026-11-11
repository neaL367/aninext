import { instant } from "@next/playwright";
import { expect, test } from "@playwright/test";

// Contract: a browse-grid card already has the detail route's App Shell when
// it is clicked. The hero title comes from params, so it belongs to the
// navigation stage and must not be present before it.
test("browse card commits the detail shell before its data", async ({ page }) => {
  await page.goto("/anime/top100");

  const card = page.locator('[role="listitem"] a[href^="/anime/"]').first();
  await expect(card).toBeVisible({ timeout: 30_000 });

  await instant(page, async () => {
    await card.click();
    await page.waitForURL((url) => /^\/anime\/\d+$/.test(url.pathname));

    // App Shell: both route-level Suspense fallbacks commit immediately.
    await expect(page.getByTestId("anime-hero-skeleton")).toBeVisible();
    await expect(page.getByTestId("anime-detail-skeleton")).toBeVisible();

    // Navigation stage: the title is params-derived, so it is not prefetched.
    await expect(page.getByTestId("anime-title")).toHaveCount(0);
  });

  await expect(page.getByTestId("anime-title")).toBeVisible({ timeout: 30_000 });
});
