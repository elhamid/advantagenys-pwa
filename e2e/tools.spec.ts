import { test, expect } from '@playwright/test';

test.describe('Tools index page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools');
    await page.waitForLoadState('networkidle');
  });

  test('page loads and returns 200', async ({ page }) => {
    const response = await page.request.get('/tools');
    expect(response.status()).toBe(200);
  });

  test('page title contains "Free Business Tools"', async ({ page }) => {
    await expect(page).toHaveTitle(/free business tools/i);
  });

  test('renders exactly 3 tool cards', async ({ page }) => {
    // Each tool is an <a> card wrapping an h2 — count the h2 headings inside cards
    const toolLinks = page.locator('a[href^="/tools/"]');
    await expect(toolLinks).toHaveCount(3);
  });

  test('Tax Savings Estimator card is present', async ({ page }) => {
    await expect(page.getByRole('link', { name: /tax savings estimator/i })).toBeVisible();
  });

  test('Business Readiness Checker card is present', async ({ page }) => {
    await expect(page.getByRole('link', { name: /business readiness checker/i })).toBeVisible();
  });

  test('ITIN Eligibility Checker card is present', async ({ page }) => {
    await expect(page.getByRole('link', { name: /itin eligibility checker/i })).toBeVisible();
  });

  test('page contains JSON-LD script tag', async ({ page }) => {
    const script = page.locator('script[type="application/ld+json"]');
    await expect(script).toBeAttached();
  });
});

// ---------------------------------------------------------------------------
// Tax Savings Estimator
// ---------------------------------------------------------------------------

test.describe('Tax Savings Estimator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/tax-savings-estimator');
    await page.waitForLoadState('networkidle');
  });

  test('page loads with correct title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /tax savings estimator/i })).toBeVisible();
  });

  test('step 1 shows filing status question', async ({ page }) => {
    await expect(page.getByText(/what is your current filing status/i)).toBeVisible();
  });

  test('clicking a filing option advances to step 2', async ({ page }) => {
    await page.getByText('LLC').click();
    await expect(page.getByText(/what is your approximate annual revenue/i)).toBeVisible();
  });

  test('completing all 3 steps shows lead gate with savings estimate', async ({ page }) => {
    // Step 1
    await page.getByText('LLC').click();
    // Step 2
    await page.getByText('Under $50,000').click();
    // Step 3
    await page.getByText('Not sure').click();

    // Step 4: lead gate showing estimated savings
    await expect(page.getByText(/your estimated savings/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /get my full report/i })).toBeVisible();
  });

  test('back button on step 2 returns to step 1', async ({ page }) => {
    await page.getByText('LLC').click();
    await expect(page.getByText(/annual revenue/i)).toBeVisible();

    await page.getByText('← Back').click();
    await expect(page.getByText(/what is your current filing status/i)).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Business Readiness Checker
// ---------------------------------------------------------------------------

test.describe('Business Readiness Checker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/business-readiness-checker');
    await page.waitForLoadState('networkidle');
  });

  test('page loads with correct title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /business readiness checker/i })).toBeVisible();
  });

  test('first question asks about registered business entity', async ({ page }) => {
    await expect(page.getByText(/do you have a registered business entity/i)).toBeVisible();
  });

  test('answering all 5 questions shows score and lead gate', async ({ page }) => {
    // Answer Yes to all 5 questions
    for (let i = 0; i < 5; i++) {
      await page.getByRole('button', { name: 'Yes' }).click();
    }

    // Lead gate shows score
    await expect(page.getByText(/score:/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: /see my checklist/i })).toBeVisible();
  });

  test('answering No shows a different score result', async ({ page }) => {
    // Answer No to all 5 questions — should show low score
    for (let i = 0; i < 5; i++) {
      await page.getByRole('button', { name: 'No' }).click();
    }

    await expect(page.getByText(/0 \/ 5/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/getting started/i)).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// ITIN Eligibility Checker
// ---------------------------------------------------------------------------

test.describe('ITIN Eligibility Checker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/itin-eligibility-checker');
    await page.waitForLoadState('networkidle');
  });

  test('page loads with correct title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /itin eligibility checker/i })).toBeVisible();
  });

  test('first question asks about citizenship status', async ({ page }) => {
    await expect(page.getByText(/are you a us citizen/i)).toBeVisible();
  });

  test('eligible path: No citizen → Yes tax filing → No SSN shows eligible outcome', async ({ page }) => {
    // Q1: US citizen? → No
    await page.getByRole('button', { name: 'No' }).click();
    // Q2: Need to file US taxes? → Yes
    await page.getByRole('button', { name: 'Yes' }).click();
    // Q3: Already have SSN? → No
    await page.getByRole('button', { name: 'No' }).click();

    // Should show eligible outcome with lead form
    await expect(page.getByText(/you likely qualify for an itin/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: /get free itin consultation/i })).toBeVisible();
  });

  test('not-eligible path: US citizen shows "You Don\'t Need an ITIN"', async ({ page }) => {
    // Q1: US citizen? → Yes (immediately shows not-eligible-citizen outcome)
    await page.getByRole('button', { name: 'Yes' }).click();

    await expect(page.getByText(/you don't need an itin/i)).toBeVisible({ timeout: 5000 });
    // No lead form shown for this outcome
    await expect(page.getByRole('button', { name: /get free itin consultation/i })).not.toBeVisible();
  });
});
