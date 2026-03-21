import { type Page } from '@playwright/test';

/**
 * Clear all browser storage between E2E tests.
 *
 * Removes localStorage, sessionStorage, and all IndexedDB databases
 * to ensure full test isolation.
 */
export async function clearStorage(page: Page) {
  await page.evaluate(async () => {
    localStorage.clear();
    sessionStorage.clear();
    // Clear all IndexedDB databases
    const dbs = await indexedDB.databases();
    for (const db of dbs) {
      if (db.name) indexedDB.deleteDatabase(db.name);
    }
  });
}
