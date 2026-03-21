/**
 * E2E: Touch Target Regression Test (A11Y-03 + D-27)
 *
 * Verifies all interactive elements meet the 44px minimum touch target size
 * per WCAG 2.5.8 and the app's design system requirements.
 *
 * Per D-15: Standalone file with custom size-checking logic (not part of WCAG scan).
 * Per D-27: CI enforcement for touch target regressions.
 * Per D-29: TourTooltip elements are documented exceptions.
 */
import { type Page } from '@playwright/test';
import { test, expect } from './fixtures';

/**
 * Audit all visible interactive elements on the current page for 44px minimum
 * touch target compliance. Returns an array of violation descriptions.
 */
async function auditTouchTargets(page: Page, pageName: string): Promise<string[]> {
  const interactiveSelectors = [
    'button:visible',
    'a:visible',
    'input:visible',
    'select:visible',
    '[role="button"]:visible',
    '[role="tab"]:visible',
    '[role="radio"]:visible',
    '[role="link"]:visible',
  ].join(', ');

  const elements = page.locator(interactiveSelectors);
  const count = await elements.count();

  const violations: string[] = [];
  for (let i = 0; i < count; i++) {
    const el = elements.nth(i);
    const box = await el.boundingBox();
    if (!box) continue; // off-screen or hidden
    if (box.width === 0 || box.height === 0) continue; // collapsed

    // Skip documented exceptions
    const ariaHidden = await el.getAttribute('aria-hidden');
    if (ariaHidden === 'true') continue;

    // TourTooltip exception (D-29) -- joyride overlay elements
    const classes = (await el.getAttribute('class')) || '';
    if (classes.includes('tour-tooltip') || classes.includes('joyride')) continue;

    // Skip elements inside the scrollbar-hide overflow area that are visually clipped
    // (e.g., tab badge dots that are part of larger touch targets)
    const tagName = await el.evaluate(e => e.tagName.toLowerCase());
    if (tagName === 'input' && (await el.getAttribute('type')) === 'hidden') continue;

    if (box.height < 44 || box.width < 44) {
      const text = ((await el.textContent()) || '').trim().substring(0, 30);
      const ariaLabel = (await el.getAttribute('aria-label')) || '';
      const identifier = text || ariaLabel || tagName;
      violations.push(
        `${pageName}: <${tagName}> "${identifier}" is ${Math.round(box.width)}x${Math.round(box.height)}px`
      );
    }
  }

  return violations;
}

test.describe('Touch target 44px minimum', () => {
  test('dashboard interactive elements meet 44px minimum', async ({ authedPage }) => {
    await authedPage.goto('/home');

    // Wait for page to fully load
    const heading = authedPage.locator('h1, h2, [role="heading"]').first();
    await expect(heading).toBeVisible({ timeout: 15_000 });

    const violations = await auditTouchTargets(authedPage, 'Dashboard');
    expect(violations, `Touch target violations on Dashboard`).toEqual([]);
  });

  test('test page interactive elements meet 44px minimum', async ({ authedPage }) => {
    await authedPage.goto('/test');

    const heading = authedPage.locator('h1, h2, [role="heading"]').first();
    await expect(heading).toBeVisible({ timeout: 15_000 });

    const violations = await auditTouchTargets(authedPage, 'Test');
    expect(violations, `Touch target violations on Test`).toEqual([]);
  });

  test('interview page interactive elements meet 44px minimum', async ({ authedPage }) => {
    await authedPage.goto('/interview');

    const heading = authedPage.locator('h1, h2, [role="heading"]').first();
    await expect(heading).toBeVisible({ timeout: 15_000 });

    const violations = await auditTouchTargets(authedPage, 'Interview');
    expect(violations, `Touch target violations on Interview`).toEqual([]);
  });

  test('settings page interactive elements meet 44px minimum', async ({ authedPage }) => {
    await authedPage.goto('/settings');

    const heading = authedPage.locator('h1, h2, [role="heading"]').first();
    await expect(heading).toBeVisible({ timeout: 15_000 });

    const violations = await auditTouchTargets(authedPage, 'Settings');
    expect(violations, `Touch target violations on Settings`).toEqual([]);
  });
});
