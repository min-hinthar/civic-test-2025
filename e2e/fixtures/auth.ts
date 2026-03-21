import { type Page } from '@playwright/test';

/**
 * Mock Supabase auth for E2E tests.
 *
 * Intercepts Supabase auth + REST API calls and injects a fake session
 * into localStorage so the app treats the user as authenticated.
 */
export async function setupAuth(page: Page) {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    user_metadata: { display_name: 'Test User' },
  };

  const mockSession = {
    access_token: 'mock-access-token',
    token_type: 'bearer',
    expires_in: 3600,
    refresh_token: 'mock-refresh-token',
    user: mockUser,
  };

  // Intercept Supabase auth API calls
  await page.route('**/auth/v1/**', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockSession),
    })
  );

  // Intercept Supabase REST API (settings, bookmarks, mock_tests, etc.)
  await page.route('**/rest/v1/**', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    })
  );

  // Inject session to localStorage before navigation.
  // Supabase stores session at sb-{ref}-auth-token key.
  await page.addInitScript(() => {
    const sessionData = {
      access_token: 'mock-access-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        user_metadata: { display_name: 'Test User' },
      },
    };
    // Use wildcard-safe key pattern
    const keys = Object.keys(localStorage);
    const authKey = keys.find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
    const key = authKey || 'sb-placeholder-auth-token';
    localStorage.setItem(key, JSON.stringify(sessionData));
  });
}
