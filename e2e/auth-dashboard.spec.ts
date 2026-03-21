/**
 * E2E: Auth -> Dashboard (TEST-03)
 *
 * Verifies authenticated users reach the dashboard with rendered data,
 * bilingual language toggle works (D-07), and unauthenticated users see
 * the landing/login state (D-01 edge case).
 */
import { test, expect } from './fixtures';

test.describe('Auth -> Dashboard', () => {
  test('authenticated user sees dashboard', async ({ authedPage }) => {
    await authedPage.goto('/home');

    // Dashboard should render a heading (either NBA hero, readiness card,
    // or empty state welcome — all have h2 headings)
    const heading = authedPage.locator('h1, h2, [role="heading"]').first();
    await expect(heading).toBeVisible({ timeout: 15_000 });
  });

  test('language toggle switches to bilingual mode (D-07)', async ({ authedPage }) => {
    await authedPage.goto('/home');

    // Wait for page to hydrate
    const heading = authedPage.locator('h1, h2, [role="heading"]').first();
    await expect(heading).toBeVisible({ timeout: 15_000 });

    // Find the language toggle (FlagToggle uses role="radiogroup")
    const flagToggle = authedPage.getByRole('radiogroup');
    await expect(flagToggle).toBeVisible();

    // Click the Myanmar/bilingual radio option to switch to bilingual mode
    const myanmarOption = authedPage.getByRole('radio', { name: /myanmar|bilingual/i });
    await myanmarOption.click();

    // Verify Myanmar text appears somewhere on the page (Unicode range U+1000-U+109F)
    const myanmarText = authedPage.locator('.font-myanmar').first();
    await expect(myanmarText).toBeVisible({ timeout: 5_000 });
  });

  test('unauthenticated user sees landing page (D-01)', async ({ page }) => {
    // No auth fixture — use base page (unauthenticated)
    await page.goto('/');

    // Landing page has distinct content from authenticated dashboard.
    // LandingPage renders feature cards and a CTA to sign up/login.
    // Look for auth-related link or the landing page heading.
    const authLink = page.getByRole('link', { name: /sign|login|get started|start/i });
    const landingHeading = page.locator('h1, h2, [role="heading"]').first();

    // Either a login/signup link or the landing heading should be visible
    await expect(landingHeading).toBeVisible({ timeout: 15_000 });
    await expect(authLink.first()).toBeVisible();
  });
});
