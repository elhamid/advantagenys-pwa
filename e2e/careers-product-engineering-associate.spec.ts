import { expect, test } from "@playwright/test";

test.describe("Junior Product Engineering Associate intake", () => {
  test("renders the private intake and converts compensation", async ({ page }) => {
    await page.goto("/careers/product-engineering-associate?ref=partner-demo");

    await expect(page.getByRole("heading", { name: "Junior Product Engineering Associate" })).toBeVisible();
    await expect(page.getByText("Invitation-only partner intake")).toBeVisible();
    await expect(page.getByLabel("Referral partner code")).toHaveValue("partner-demo");
    await expect(page.getByText("Fictional work sample page")).toBeVisible();

    await page.route("**/api/careers/product-engineering-associate/exchange-rate", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          base: "USD",
          quote: "INR",
          rate: 95.71,
          date: "2026-06-08",
          source: "Frankfurter reference rates",
        }),
      });
    });

    await page.reload();
    await page.getByLabel("USD per month").fill("1000");
    await expect(page.getByLabel("INR per month")).toHaveValue("95,710");

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow).toBe(false);
  });

  test("renders the sanitized work sample without client dossier copy", async ({ page }) => {
    await page.goto("/careers/product-engineering-associate/sample");

    await expect(page.getByRole("heading", { name: "Mini product review packet" })).toBeVisible();
    await expect(page.getByText("Fictional sample")).toBeVisible();
    await expect(page.getByText("Tropical Stars")).toHaveCount(0);
  });

  test("keeps reviewer token out of the URL and calls the gated API by header", async ({ page }) => {
    await page.route("**/api/careers/product-engineering-associate/review", async (route) => {
      expect(route.request().headers()["x-recruiting-review-token"]).toBe("review-token");
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          scope: "jkh",
          applications: [],
        }),
      });
    });

    await page.goto("/careers/product-engineering-associate/review");
    await page.getByLabel("Review token").fill("review-token");
    await page.getByRole("button", { name: "Load review" }).click();

    await expect(page).toHaveURL(/\/careers\/product-engineering-associate\/review$/);
    await expect(page.getByText("No applications are visible for this review scope.")).toBeVisible();
  });
});
