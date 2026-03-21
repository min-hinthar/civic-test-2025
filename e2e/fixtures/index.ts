/* eslint-disable react-hooks/rules-of-hooks */
import { test as base, type Page } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import { setupAuth } from './auth';
import { clearStorage } from './storage';

type Fixtures = {
  authedPage: Page;
  makeAxeBuilder: () => AxeBuilder;
};

export const test = base.extend<Fixtures>({
  // Override base page to also apply reducedMotion at fixture level
  // (belt-and-suspenders with config-level setting per D-21 / Research Pattern 1)
  page: async ({ page }, use) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await use(page);
  },

  // Authenticated page with mocked Supabase auth
  authedPage: async ({ page }, use) => {
    await setupAuth(page);
    await use(page);
    await clearStorage(page);
  },

  // Pre-configured axe builder for WCAG scans (per D-25, D-19)
  // Excludes glass-morphism elements where color-contrast rules produce false positives
  makeAxeBuilder: async ({ page }, use) => {
    const builder = () =>
      new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .exclude('.glass-light')
        .exclude('.glass-medium')
        .exclude('.glass-heavy')
        .exclude('.glass-card');
    await use(builder);
  },
});

export { expect } from '@playwright/test';
