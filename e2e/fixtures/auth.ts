import { type Page } from '@playwright/test';

/**
 * Mock Supabase auth for E2E tests.
 *
 * Intercepts Supabase auth + REST API calls and injects a fake, non-expired
 * session into localStorage so the app treats the user as authenticated
 * without a live Supabase backend.
 *
 * The injected session must look valid to @supabase/supabase-js v2's
 * `getSession()`/recover logic, otherwise the client treats it as expired,
 * attempts a token refresh, and ends up with a null session — which makes
 * every protected route redirect to /auth. The key details:
 *   - `expires_at` is an absolute UNIX time (seconds) far in the future, so
 *     no refresh is attempted.
 *   - the session carries a complete `user` object (aud/role/metadata).
 *   - it is stored under `sb-<ref>-auth-token`, matching the storage key the
 *     client derives from NEXT_PUBLIC_SUPABASE_URL (the placeholder URL used
 *     in CI yields `sb-placeholder-auth-token`).
 */
export async function setupAuth(page: Page) {
  // Absolute expiry, one year out (seconds since epoch). Date.now() is fine
  // here — this is test fixture code, not a workflow script.
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365;

  const mockUser = {
    id: 'test-user-id',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'test@example.com',
    email_confirmed_at: '2024-01-01T00:00:00.000Z',
    phone: '',
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: { display_name: 'Test User', full_name: 'Test User' },
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  };

  const mockSession = {
    access_token: 'mock-access-token',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: expiresAt,
    refresh_token: 'mock-refresh-token',
    user: mockUser,
  };

  // Intercept Supabase auth API calls. The /user endpoint must return the
  // user object directly; token/refresh and everything else return a full
  // session so any refresh attempt still yields a valid, non-expired session.
  await page.route('**/auth/v1/**', route => {
    const url = route.request().url();
    const body = url.includes('/auth/v1/user') ? mockUser : mockSession;
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });

  // Intercept Supabase REST API (settings, bookmarks, mock_tests, etc.)
  await page.route('**/rest/v1/**', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    })
  );

  // Inject the session into localStorage before any app script runs.
  // Supabase stores the session at `sb-{ref}-auth-token`.
  await page.addInitScript(session => {
    try {
      const existing = Object.keys(localStorage).find(
        k => k.startsWith('sb-') && k.endsWith('-auth-token')
      );
      const key = existing ?? 'sb-placeholder-auth-token';
      localStorage.setItem(key, JSON.stringify(session));
    } catch {
      // localStorage unavailable — nothing to do
    }
  }, mockSession);
}
