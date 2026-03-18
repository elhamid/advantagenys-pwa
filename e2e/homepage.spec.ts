import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  // --- Page loads ---

  test('page loads and returns 200 status', async ({ page }) => {
    const response = await page.request.get('/');
    expect(response.status()).toBe(200);
  });

  test('title contains Advantage', async ({ page }) => {
    await expect(page).toHaveTitle(/advantage/i);
  });

  // --- Header ---

  test('header is visible and contains brand name', async ({ page }) => {
    const header = page.locator('header').first();
    await expect(header).toBeVisible();
    await expect(header.getByText('Advantage')).toBeVisible();
  });

  test('header has at least one Get Started link to /contact', async ({ page }) => {
    const getStartedLinks = page.getByRole('link', { name: 'Get Started' });
    await expect(getStartedLinks.first()).toBeVisible();
    await expect(getStartedLinks.first()).toHaveAttribute('href', '/contact');
  });

  // --- Hero section ---

  test('hero section is visible', async ({ page }) => {
    // The first heading on the homepage should be visible
    await expect(page.locator('h1').first()).toBeVisible();
  });

  // --- Footer ---

  test('footer is rendered with Advantage brand', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer.getByText('Advantage').first()).toBeVisible();
  });

  test('footer contains phone number 929-933-1396', async ({ page }) => {
    await expect(page.locator('footer').getByText('929-933-1396')).toBeVisible();
  });

  test('footer contains address Cambria Heights', async ({ page }) => {
    await expect(page.locator('footer').getByText(/Cambria Heights/i)).toBeVisible();
  });

  test('footer copyright contains current year', async ({ page }) => {
    const year = new Date().getFullYear().toString();
    await expect(page.locator('footer').getByText(new RegExp(year))).toBeVisible();
  });

  // --- Desktop navigation (Desktop Chrome project) ---

  test('desktop nav links are visible on desktop', async ({ page, viewport }) => {
    if (!viewport || viewport.width < 768) test.skip();

    await expect(page.getByRole('link', { name: 'About' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Resources' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Contact' })).toBeVisible();
  });

  // --- Mobile BottomNav (Mobile Chrome project) ---

  test('bottom nav is visible on mobile', async ({ page, viewport }) => {
    if (!viewport || viewport.width > 768) test.skip();

    const bottomNav = page.getByRole('navigation');
    await expect(bottomNav).toBeVisible();
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Services' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Forms' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Contact' })).toBeVisible();
  });

  // --- Key sections ---

  test('page has main content area', async ({ page }) => {
    await expect(page.locator('main, section').first()).toBeVisible();
  });
});
