import { test, expect } from '@playwright/test';

test('homepage renders with correct title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Civic/i);
});

test('homepage renders main heading', async ({ page }) => {
  await page.goto('/');
  // The app renders a heading on the dashboard/home page
  const heading = page.locator('h1, h2, [role="heading"]').first();
  await expect(heading).toBeVisible({ timeout: 10_000 });
});
