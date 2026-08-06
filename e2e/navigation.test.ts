import { instant } from "@next/playwright";
import { test, expect } from "@playwright/test";

test.describe("collection pages", () => {
  test("trending is instant on initial page load", async ({ page, baseURL }) => {
    await instant(
      page,
      async () => {
        await page.goto("/anime/trending");
        await expect(page.getByRole("heading", { name: "Trending Anime" })).toBeVisible();
      },
      { baseURL },
    );
    await expect(page.getByRole("heading", { name: "Trending Anime" })).toBeVisible();
  });

  test("home to popular client navigation is instant", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Trending now" })).toBeVisible();

    await instant(page, async () => {
      await page.click('a[href="/anime/popular"]');
      await page.waitForURL((url) => url.pathname === "/anime/popular");
      await expect(page.getByRole("heading", { name: "Popular This Season" })).toBeVisible();
    });
    await expect(page.getByRole("heading", { name: "Popular This Season" })).toBeVisible();
  });
});

test.describe("anime detail page", () => {
  test("detail commits shell instantly, content streams in", async ({ page, baseURL }) => {
    await instant(
      page,
      async () => {
        await page.goto("/anime/21");
        await expect(page.locator("main")).toBeVisible();
      },
      { baseURL },
    );
    await expect(page.getByRole("heading", { name: "ONE PIECE" })).toBeVisible();
  });
});
