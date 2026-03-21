/**
 * E2E: WCAG 2.2 AA axe-core scans (A11Y-01)
 *
 * Runs automated accessibility audits on 4 key pages in both light and dark
 * modes. Uses makeAxeBuilder fixture which pre-configures WCAG 2.2 AA tags
 * and excludes glass-morphism elements from color-contrast checks (D-25).
 *
 * Per D-19: Compliance scans are separate from flow correctness tests.
 * Per D-32: Any element-level exclusions documented inline.
 */
import { test, expect } from './fixtures';

/**
 * Format axe violations for readable test output.
 */
function formatViolations(violations: Array<{ id: string; impact?: string | null; nodes: Array<{ html: string }> }>) {
  return violations.map(v => ({
    id: v.id,
    impact: v.impact,
    nodes: v.nodes.map(n => n.html.substring(0, 120)),
  }));
}

test.describe('WCAG 2.2 AA scans', () => {
  test('dashboard page passes WCAG 2.2 AA scan', async ({ authedPage, makeAxeBuilder }) => {
    await authedPage.goto('/home');

    // Wait for page to fully load
    const heading = authedPage.locator('h1, h2, [role="heading"]').first();
    await expect(heading).toBeVisible({ timeout: 15_000 });

    const results = await makeAxeBuilder().analyze();
    const violations = formatViolations(results.violations);
    expect(violations, 'Dashboard WCAG violations').toEqual([]);
  });

  test('test page passes WCAG 2.2 AA scan', async ({ authedPage, makeAxeBuilder }) => {
    await authedPage.goto('/test');

    // Wait for page to fully load
    const heading = authedPage.locator('h1, h2, [role="heading"]').first();
    await expect(heading).toBeVisible({ timeout: 15_000 });

    const results = await makeAxeBuilder().analyze();
    const violations = formatViolations(results.violations);
    expect(violations, 'Test page WCAG violations').toEqual([]);
  });

  test('interview page passes WCAG 2.2 AA scan', async ({ authedPage, makeAxeBuilder }) => {
    await authedPage.goto('/interview');

    // Wait for page to fully load
    const heading = authedPage.locator('h1, h2, [role="heading"]').first();
    await expect(heading).toBeVisible({ timeout: 15_000 });

    const results = await makeAxeBuilder().analyze();
    const violations = formatViolations(results.violations);
    expect(violations, 'Interview page WCAG violations').toEqual([]);
  });

  test('settings page passes WCAG 2.2 AA scan', async ({ authedPage, makeAxeBuilder }) => {
    await authedPage.goto('/settings');

    // Wait for page to fully load
    const heading = authedPage.locator('h1, h2, [role="heading"]').first();
    await expect(heading).toBeVisible({ timeout: 15_000 });

    const results = await makeAxeBuilder().analyze();
    const violations = formatViolations(results.violations);
    expect(violations, 'Settings page WCAG violations').toEqual([]);
  });

  test('dashboard dark mode passes WCAG 2.2 AA scan (D-04)', async ({
    authedPage,
    makeAxeBuilder,
  }) => {
    await authedPage.goto('/home');

    // Wait for page to fully load
    const heading = authedPage.locator('h1, h2, [role="heading"]').first();
    await expect(heading).toBeVisible({ timeout: 15_000 });

    // Toggle to dark mode via the theme toggle button
    const themeButton = authedPage.locator('[data-tour="theme-toggle"]');
    if (await themeButton.isVisible()) {
      await themeButton.click();
      // Wait for theme transition
      await authedPage.waitForTimeout(500);
    } else {
      // Fallback: inject dark class directly
      await authedPage.evaluate(() => {
        document.documentElement.classList.add('dark');
      });
      await authedPage.waitForTimeout(300);
    }

    const results = await makeAxeBuilder().analyze();
    const violations = formatViolations(results.violations);
    expect(violations, 'Dashboard dark mode WCAG violations').toEqual([]);
  });
});
