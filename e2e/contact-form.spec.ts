import { test, expect } from '@playwright/test';

// NOTE: Turnstile uses the always-pass test site key "1x00000000000000000000AA" when
// NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set. Turnstile verification on the server side
// is also skipped when TURNSTILE_SECRET_KEY is not set in the environment. This means
// the contact form submits successfully in local dev without any Turnstile mock needed.
// If you add TURNSTILE_SECRET_KEY to your CI environment, you must also set
// NEXT_PUBLIC_TURNSTILE_SITE_KEY to "1x00000000000000000000AA" (Cloudflare's always-pass
// test key) and TURNSTILE_SECRET_KEY to "1x0000000000000000000000000000000AA" (always-pass
// secret) so E2E tests pass without manual CAPTCHA interaction.

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
  });

  test('fills and submits the contact form successfully', async ({ page }) => {
    // Verify we land on the Send Message tab by default
    await expect(page.getByRole('heading', { name: 'Request a Free Consultation' })).toBeVisible();

    // Fill required fields
    await page.getByLabel('Full Name').fill('Jane Doe');
    await page.getByLabel('Phone Number').fill('(929) 555-1234');

    // Fill optional fields to exercise the full form
    await page.getByLabel(/Email/).fill('jane@example.com');

    await page.selectOption('#businessType', 'Contractor');

    // Toggle a service checkbox
    await page.getByLabel('Tax Services').check();

    await page.getByLabel('Brief Message').fill('I need help with business formation.');

    // Intercept the API call so the test doesn't depend on the external webhook
    await page.route('/api/contact', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    // Submit
    await page.getByRole('button', { name: 'Request Free Consultation' }).click();

    // Success state: "Thank You, Jane Doe!" card
    await expect(page.getByRole('heading', { name: /Thank You, Jane Doe/i })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("We'll call you back within 1 business day.")).toBeVisible();
  });

  test('prevents submission when required fields are empty', async ({ page }) => {
    // The Send Message tab is active by default
    await expect(page.getByRole('heading', { name: 'Request a Free Consultation' })).toBeVisible();

    // Click submit without filling anything
    const submitButton = page.getByRole('button', { name: 'Request Free Consultation' });
    await submitButton.click();

    // The browser's native required-field validation should prevent submission.
    // The success heading must NOT appear.
    await expect(page.getByRole('heading', { name: /Thank You/i })).not.toBeVisible();

    // The form should still be visible
    await expect(page.getByRole('heading', { name: 'Request a Free Consultation' })).toBeVisible();
  });

  test('shows an error when the API returns a failure', async ({ page }) => {
    await page.getByLabel('Full Name').fill('Error Test');
    await page.getByLabel('Phone Number').fill('(929) 555-0000');

    // Simulate a server-side validation error
    await page.route('/api/contact', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'Full name is required.' }),
      });
    });

    await page.getByRole('button', { name: 'Request Free Consultation' }).click();

    // Error message must be visible and success state must not appear
    await expect(page.getByText('Full name is required.')).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('heading', { name: /Thank You/i })).not.toBeVisible();
  });
});
