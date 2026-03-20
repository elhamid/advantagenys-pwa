import { test, expect } from '@playwright/test';

// The ChatWidget is rendered globally via root layout and hidden on /contact.
// Tests run against the dev server at localhost:3000.

test.describe('Chat FAB visibility', () => {
  test('chat FAB button is visible on the homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // The FAB has aria-label="Chat with Ava" when closed
    const fab = page.getByRole('button', { name: /chat with ava/i });
    await expect(fab).toBeVisible();
  });

  test('chat FAB is hidden on the /contact page', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    // ChatWidget returns null on /contact — the FAB must not be in the DOM
    const fab = page.getByRole('button', { name: /chat with ava/i });
    await expect(fab).not.toBeVisible();
  });

  test('chat FAB is visible on a service page', async ({ page }) => {
    await page.goto('/services/business-formation');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('button', { name: /chat with ava/i })).toBeVisible();
  });

  test('chat FAB is visible on an industry page', async ({ page }) => {
    await page.goto('/industries/restaurants');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('button', { name: /chat with ava/i })).toBeVisible();
  });
});

test.describe('Chat panel open / close', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('clicking FAB opens the chat panel', async ({ page }) => {
    const fab = page.getByRole('button', { name: /chat with ava/i });
    await fab.click();

    // Panel header shows "Ava" as heading
    await expect(page.getByRole('heading', { name: /ava/i })).toBeVisible({ timeout: 3000 });
    // Subtitle also appears
    await expect(page.getByText('Your AI assistant')).toBeVisible();
  });

  test('chat panel has a text input and send button', async ({ page }) => {
    await page.getByRole('button', { name: /chat with ava/i }).click();

    // Input for typing messages
    await expect(page.getByPlaceholder(/type your message/i)).toBeVisible({ timeout: 3000 });
    // Send button
    await expect(page.getByRole('button', { name: /send message/i })).toBeVisible();
  });

  test('send button is disabled when input is empty', async ({ page }) => {
    await page.getByRole('button', { name: /chat with ava/i }).click();
    await page.waitForTimeout(300); // panel animation

    const sendBtn = page.getByRole('button', { name: /send message/i });
    await expect(sendBtn).toBeDisabled();
  });

  test('closing the chat panel via the panel close button', async ({ page }) => {
    await page.getByRole('button', { name: /chat with ava/i }).click();
    await expect(page.getByRole('heading', { name: /ava/i })).toBeVisible({ timeout: 3000 });

    // The panel has its own "Close chat" button
    await page.getByRole('button', { name: /close chat/i }).first().click();

    // Panel should be gone
    await expect(page.getByRole('heading', { name: /ava/i })).not.toBeVisible({ timeout: 3000 });
  });
});

test.describe('Chat nudge', () => {
  // The nudge appears after 3s on non-contact pages the first time.
  // sessionStorage prevents repeat shows — so we clear it each test.

  test.beforeEach(async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('networkidle');
    // Clear the nudge session key so the nudge will fire
    await page.evaluate(() => sessionStorage.removeItem('ava-nudge-shown'));
  });

  test('nudge pill appears after ~3 seconds on /about', async ({ page }) => {
    // Advance time by 3.5 seconds
    await page.waitForTimeout(3500);
    await expect(page.getByRole('status')).toBeVisible({ timeout: 2000 });
  });

  test('nudge pill shows "Need help?" on generic page', async ({ page }) => {
    await page.waitForTimeout(3500);
    await expect(page.getByText('Need help?')).toBeVisible({ timeout: 2000 });
  });
});
