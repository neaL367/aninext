import { test, expect } from "@playwright/test";

test.describe("canonical URLs", () => {
  test("airing redirects to day param with visitor offset", async ({ page }) => {
    await page.goto("/airing");
    // Day is the visitor's local date; offset (minutes east of UTC) is attached by
    // the client after hydration so the server fetches the visitor's day window.
    await expect(page).toHaveURL(/\/airing\?day=\d{4}-\d{2}-\d{2}&offset=-?\d+$/);
    await expect(page.getByRole("heading", { name: "Schedule" })).toBeVisible();
  });

  test("seasonal redirects to season and year params", async ({ page }) => {
    await page.goto("/anime/seasonal");
    await expect(page).toHaveURL(/\/anime\/seasonal\?season=[A-Z]+&year=\d{4}$/);
    await expect(page.getByRole("heading", { name: "Seasonal Anime" })).toBeVisible();
  });
});

test.describe("browse interactions", () => {
  test("genre filter updates URL and keeps results", async ({ page }) => {
    await page.goto("/anime/trending");
    const genreButton = page.getByRole("button", { name: "Genre", exact: true });
    if (await genreButton.isVisible()) {
      const expanded = await genreButton.getAttribute("aria-expanded");
      if (expanded !== "true") {
        await genreButton.click();
      }
    }
    await page.getByRole("button", { name: "Action", exact: true }).first().click();
    await expect(page).toHaveURL(/genre=Action/);
    await expect(page.getByRole("heading", { name: "Trending Anime" })).toBeVisible();
    await expect(page.getByRole("list", { name: "Anime results" })).toBeVisible();
  });

  test("search bar updates URL", async ({ page }) => {
    await page.goto("/anime/trending");
    await page.getByRole("searchbox", { name: "Search anime" }).fill("one piece");
    await expect(page).toHaveURL(/search=one\+piece/, { timeout: 5000 });
    await expect(page.getByRole("heading", { name: "Trending Anime" })).toBeVisible();
  });
});

test.describe("anime detail sections", () => {
  test("characters, staff, and relations render", async ({ page }) => {
    await page.goto("/anime/21");
    await expect(page.getByRole("heading", { name: "ONE PIECE" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Characters and voices" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Staff" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Related" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "More like this" })).toBeVisible();
  });
});
