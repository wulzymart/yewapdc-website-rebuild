import { test, expect } from "@playwright/test";

const BASE_URL = process.env.E2E_BASE_URL || "http://127.0.0.1:3000";

async function devSignupAndGoToAdmin(page: import("@playwright/test").Page) {
  await page.goto(`${BASE_URL}/dev-signup`);

  if (!page.url().endsWith("/dev-signup")) {
    test.skip("Dev signup is disabled in this environment");
  }

  const unique = Date.now();
  await page.fill("#name", `E2E Admin ${unique}`);
  await page.fill("#email", `e2e-${unique}@example.com`);
  await page.fill("#password", "E2E-password-123!");
  await page.getByRole("button", { name: /create dev account/i }).click();

  await page.waitForURL("**/admin", { timeout: 15000 });
  await expect(page.getByRole("heading", { name: /YEWAPDC Admin/i })).toBeVisible();
}

test.describe("CMS core flows", () => {
  test("dev signup can access admin dashboard and media library", async ({ page }) => {
    await devSignupAndGoToAdmin(page);

    await page.goto(`${BASE_URL}/admin/articles`);
    await expect(page.getByRole("heading", { name: /articles/i })).toBeVisible();

    await page.goto(`${BASE_URL}/admin/media`);
    await expect(page.getByRole("heading", { name: /media library/i })).toBeVisible();
  });

  test("public pages render core views", async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await expect(page.getByRole("heading", { name: /working for the development/i })).toBeVisible();

    await page.goto(`${BASE_URL}/articles`);
    await expect(page.getByRole("heading", { name: /articles/i })).toBeVisible();

    await page.goto(`${BASE_URL}/events?view=list`);
    await expect(page.getByRole("heading", { name: /events/i })).toBeVisible();
  });
});
