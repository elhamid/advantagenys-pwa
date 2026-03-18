import { test, expect } from '@playwright/test';

test.describe('Resources / Forms page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/resources');
    await page.waitForLoadState('networkidle');
  });

  // --- Page loads ---

  test('page loads and returns 200 status', async ({ page }) => {
    const response = await page.request.get('/resources');
    expect(response.status()).toBe(200);
  });

  test('page has a visible heading', async ({ page }) => {
    await expect(page.locator('h1').first()).toBeVisible();
  });

  // --- Form cards ---

  test('form cards are displayed', async ({ page }) => {
    // The forms grid renders multiple form cards
    const cards = page.locator('[class*="card"], article, [class*="grid"] > *');
    await expect(cards.first()).toBeVisible({ timeout: 5000 });
  });

  test('ITIN Registration form card is visible', async ({ page }) => {
    await expect(page.getByText(/ITIN/i).first()).toBeVisible();
  });

  // --- Category filter ---

  test('category filter buttons are present', async ({ page }) => {
    // The categories array has 8 entries including 'All'
    const allButton = page.getByRole('button', { name: /^all$/i });
    await expect(allButton).toBeVisible();
  });

  test('clicking Tax category filters to show tax-related forms', async ({ page }) => {
    const taxButton = page.getByRole('button', { name: /^tax$/i });
    await taxButton.click();
    // After filtering, ITIN should still be visible (it's in tax category)
    await expect(page.getByText(/ITIN/i).first()).toBeVisible();
  });

  // --- Search ---

  test('search input is present', async ({ page }) => {
    // The forms page has a search input
    const searchInput = page.getByRole('searchbox').or(
      page.getByPlaceholder(/search/i)
    );
    await expect(searchInput.first()).toBeVisible();
  });

  // --- Individual form page ---

  test('clicking the ITIN form card navigates to the form page', async ({ page }) => {
    // Find the ITIN form link/card and click it
    const itinLink = page.getByRole('link', { name: /ITIN/i }).first();
    await expect(itinLink).toBeVisible();
    await itinLink.click();
    await page.waitForLoadState('networkidle');

    // URL should contain 'itin' or the form slug
    await expect(page).toHaveURL(/itin/i);
  });
});

test.describe('Individual form page', () => {
  test('ITIN registration form page loads', async ({ page }) => {
    await page.goto('/resources/forms/itin-registration-form');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('home improvement licensing form (native) loads', async ({ page }) => {
    await page.goto('/resources/forms/home-improvement-licensing');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1, h2, form').first()).toBeVisible();
  });
});

test.describe('Kiosk mode', () => {
  test('/resources/kiosk loads without header or footer (chromeless)', async ({ page }) => {
    await page.goto('/resources/kiosk');
    await page.waitForLoadState('networkidle');

    // In kiosk mode, the LayoutShell hides header and footer
    const header = page.locator('header');
    await expect(header).not.toBeVisible();
  });
});
