import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// /llms.txt — plain text content for LLM crawlers
// ---------------------------------------------------------------------------

test.describe('/llms.txt', () => {
  test('returns 200 with text/plain content type', async ({ page }) => {
    const response = await page.request.get('/llms.txt');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/plain');
  });

  test('contains "Advantage Services" brand name', async ({ page }) => {
    const response = await page.request.get('/llms.txt');
    const body = await response.text();
    expect(body).toContain('Advantage Services');
  });

  test('lists core service pages', async ({ page }) => {
    const response = await page.request.get('/llms.txt');
    const body = await response.text();
    expect(body).toContain('/services/tax-services');
    expect(body).toContain('/services/business-formation');
    expect(body).toContain('/services/legal');
  });

  test('lists all 3 tool URLs', async ({ page }) => {
    const response = await page.request.get('/llms.txt');
    const body = await response.text();
    expect(body).toContain('/tools/tax-savings-estimator');
    expect(body).toContain('/tools/business-readiness-checker');
    expect(body).toContain('/tools/itin-eligibility-checker');
  });

  test('includes contact information', async ({ page }) => {
    const response = await page.request.get('/llms.txt');
    const body = await response.text();
    expect(body).toContain('929');
    expect(body).toContain('advantagenys.com');
  });
});

// ---------------------------------------------------------------------------
// /sitemap.xml
// ---------------------------------------------------------------------------

test.describe('/sitemap.xml', () => {
  test('returns 200', async ({ page }) => {
    const response = await page.request.get('/sitemap.xml');
    expect(response.status()).toBe(200);
  });

  test('returns XML content type', async ({ page }) => {
    const response = await page.request.get('/sitemap.xml');
    expect(response.headers()['content-type']).toContain('xml');
  });

  test('XML contains the domain advantagenys.com', async ({ page }) => {
    const response = await page.request.get('/sitemap.xml');
    const body = await response.text();
    expect(body).toContain('advantagenys.com');
  });

  test('XML includes homepage URL', async ({ page }) => {
    const response = await page.request.get('/sitemap.xml');
    const body = await response.text();
    // Sitemap should include the base URL (with or without trailing slash)
    expect(body).toMatch(/advantagenys\.com\/?</);
  });
});

// ---------------------------------------------------------------------------
// JSON-LD on service pages
// ---------------------------------------------------------------------------

test.describe('Service page JSON-LD', () => {
  test('/services/business-formation has a JSON-LD script tag', async ({ page }) => {
    await page.goto('/services/business-formation');
    await page.waitForLoadState('networkidle');
    const script = page.locator('script[type="application/ld+json"]');
    await expect(script.first()).toBeAttached();
  });

  test('/services/tax-services has a JSON-LD script tag', async ({ page }) => {
    await page.goto('/services/tax-services');
    await page.waitForLoadState('networkidle');
    const script = page.locator('script[type="application/ld+json"]');
    await expect(script.first()).toBeAttached();
  });

  test('/tools/tax-savings-estimator has a JSON-LD WebApplication script', async ({ page }) => {
    await page.goto('/tools/tax-savings-estimator');
    await page.waitForLoadState('networkidle');

    // Verify JSON-LD content has WebApplication type
    const jsonLd = await page.evaluate(() => {
      const script = document.querySelector('script[type="application/ld+json"]');
      return script ? JSON.parse(script.textContent ?? '{}') : null;
    });

    expect(jsonLd).not.toBeNull();
    expect(jsonLd['@type']).toBe('WebApplication');
    expect(jsonLd.name).toContain('Tax Savings Estimator');
  });

  test('/tools/itin-eligibility-checker has a JSON-LD WebApplication script', async ({ page }) => {
    await page.goto('/tools/itin-eligibility-checker');
    await page.waitForLoadState('networkidle');

    const jsonLd = await page.evaluate(() => {
      const script = document.querySelector('script[type="application/ld+json"]');
      return script ? JSON.parse(script.textContent ?? '{}') : null;
    });

    expect(jsonLd).not.toBeNull();
    expect(jsonLd['@type']).toBe('WebApplication');
    expect(jsonLd.name).toContain('ITIN');
  });
});
