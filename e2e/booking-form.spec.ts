import { test, expect } from '@playwright/test';

// NOTE: See e2e/contact-form.spec.ts for Turnstile test-key guidance.
// BookingForm catches API errors and treats them as success (see BookingForm.tsx line 65).
// This means even without an API mock, the form will show the success card if the fetch
// fails. We still route-intercept to avoid real network calls and assert on success state.

test.describe('Booking Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    // Switch to the booking tab
    await page.getByRole('button', { name: 'Book Appointment' }).click();

    // Wait for the booking form heading to appear
    await expect(page.getByRole('heading', { name: 'Book an Appointment' })).toBeVisible();
  });

  test('switches to the booking tab', async ({ page }) => {
    // Already on the booking tab (done in beforeEach)
    await expect(page.getByRole('heading', { name: 'Book an Appointment' })).toBeVisible();

    // The contact form heading should not be visible
    await expect(page.getByRole('heading', { name: 'Request a Free Consultation' })).not.toBeVisible();
  });

  test('fills and submits the booking form successfully', async ({ page }) => {
    // Fill all required fields
    await page.getByLabel('Full Name').fill('John Smith');
    await page.getByLabel('Phone Number').fill('(929) 555-5678');
    await page.getByLabel('Email').fill('john@example.com');
    await page.selectOption('#serviceType', 'Tax Services');

    // Fill optional date and time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD
    await page.fill('#preferredDate', dateStr);
    await page.selectOption('#preferredTime', 'morning');

    await page.getByLabel('Brief Description').fill('Looking for tax filing help.');

    // Intercept API to avoid real network call
    await page.route('/api/contact', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.getByRole('button', { name: 'Book Appointment' }).click();

    // Success state
    await expect(page.getByRole('heading', { name: /Thank You, John Smith/i })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("We'll confirm your appointment within 24 hours.")).toBeVisible();
  });

  test('prevents booking submission when required fields are empty', async ({ page }) => {
    // Click submit without filling anything
    const submitButton = page.getByRole('button', { name: 'Book Appointment' });
    await submitButton.click();

    // Browser native validation blocks submission — success heading must not appear
    await expect(page.getByRole('heading', { name: /Thank You/i })).not.toBeVisible();

    // Booking form is still visible
    await expect(page.getByRole('heading', { name: 'Book an Appointment' })).toBeVisible();
  });

  test('prevents booking submission when only name is filled but phone is missing', async ({ page }) => {
    // Fill name only — phone and email are required
    await page.getByLabel('Full Name').fill('Partial Fill');

    await page.getByRole('button', { name: 'Book Appointment' }).click();

    // Native validation should block — success must not appear
    await expect(page.getByRole('heading', { name: /Thank You/i })).not.toBeVisible();
    await expect(page.getByRole('heading', { name: 'Book an Appointment' })).toBeVisible();
  });

  test('can switch back to the contact form tab', async ({ page }) => {
    // Currently on booking tab (from beforeEach)
    await page.getByRole('button', { name: 'Send Message' }).click();

    await expect(page.getByRole('heading', { name: 'Request a Free Consultation' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Book an Appointment' })).not.toBeVisible();
  });
});
