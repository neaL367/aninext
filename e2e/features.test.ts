import { test, expect } from "@playwright/test";

test.describe("canonical URLs", () => {
  test("airing redirects to a clean day path", async ({ page }) => {
    await page.goto("/airing");
    // Day lives in the path; the visitor timezone resolves from the
    // `tz_offset` cookie server-side, so URLs stay clean (no ?offset=).
    await expect(page).toHaveURL(/\/airing\/\d{4}-\d{2}-\d{2}$/, {
      timeout: 10_000,
    });
    await expect(page.getByRole("heading", { name: "Schedule" })).toBeVisible();
  });

  test("seasonal redirects to season and year params", async ({ page }) => {
    await page.goto("/anime/seasonal");
    await expect(page).toHaveURL(/\/anime\/seasonal\?season=[A-Z]+&year=\d{4}$/);
    await expect(page.getByRole("heading", { name: "Seasonal" })).toBeVisible();
  });

  test("airing normalizes invalid day and offset params", async ({ page }) => {
    await page.goto("/airing?day=2026-02-30&offset=9999");
    await expect(page).toHaveURL(/\/airing\/\d{4}-\d{2}-\d{2}$/);
    await expect(page.getByRole("heading", { name: "Schedule" })).toBeVisible();
  });

  test("airing redirects legacy day query to day path", async ({ page }) => {
    await page.goto("/airing?day=2030-01-15&offset=840");
    await expect(page).toHaveURL(/\/airing\/2030-01-15$/);
  });

  test("legacy offset links normalize to the clean day path", async ({ browser }) => {
    const context = await browser.newContext({ timezoneId: "America/Los_Angeles" });
    const page = await context.newPage();

    await page.goto("/airing/2030-01-15?offset=840", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/airing\/2030-01-15$/);

    await context.close();
  });

  test("airing keeps clean URLs in extreme visitor timezones", async ({ browser }) => {
    for (const timezoneId of ["Pacific/Kiritimati", "Etc/GMT+12"] as const) {
      const context = await browser.newContext({ timezoneId });
      const page = await context.newPage();
      await page.goto("/airing", { waitUntil: "domcontentloaded" });
      await expect(page).toHaveURL(/\/airing\/\d{4}-\d{2}-\d{2}$/);
      await context.close();
    }
  });

  test("airing distinguishes an empty day from an API failure", async ({ page }) => {
    await page.goto("/airing/2099-01-15");
    await expect(page.getByText("Nothing airing this day")).toBeVisible();

    await page.goto("/airing/2098-01-15");
    await expect(page.getByRole("heading", { name: "Airing schedule failed to load" })).toBeVisible(
      { timeout: 15_000 },
    );
    await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
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
    await expect(page.getByRole("heading", { name: "Trending" })).toBeVisible();
    await expect(page.getByRole("list", { name: "Anime results" })).toBeVisible();
  });

  test("search bar updates URL", async ({ page }) => {
    await page.goto("/anime/trending");
    await page.getByRole("searchbox", { name: "Search anime" }).fill("one piece");
    await expect(page).toHaveURL(/search=one\+piece/, { timeout: 5000 });
    await expect(page.getByRole("heading", { name: "Trending" })).toBeVisible();
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
