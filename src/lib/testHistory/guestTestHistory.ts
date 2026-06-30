/**
 * Guest Test History - localStorage persistence for no-account users.
 *
 * Signed-in users persist mock-test sessions to Supabase (see
 * SupabaseAuthContext.saveTestSession). Guests have no account, so their
 * mock-test history is kept locally in localStorage instead. This lets
 * anyone study with full functionality — including a persistent test
 * history — without signing in, and without depending on Supabase being
 * reachable.
 *
 * Kept in localStorage (not IndexedDB) to stay synchronous and to mirror
 * the existing local-only stores (theme, language, badges, test date).
 */

import type { TestSession } from '@/types';

const STORAGE_KEY = 'civic-prep-guest-test-history';

/** Cap stored sessions to bound localStorage usage (each holds full results). */
const MAX_SESSIONS = 50;

/**
 * Read the guest's locally-stored mock-test history, newest first.
 * Returns an empty array when none exists, on a server render, or on parse error.
 */
export function getGuestTestHistory(): TestSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Drop malformed entries (e.g. hand-tampered storage) so downstream
    // consumers that rely on `date`/`results` don't throw.
    return (parsed as TestSession[]).filter(
      (s): s is TestSession =>
        !!s && typeof s === 'object' && typeof s.date === 'string' && Array.isArray(s.results)
    );
  } catch {
    return [];
  }
}

/**
 * Persist a completed mock-test session for a guest and return the full,
 * capped history (newest first) including the new session.
 */
export function addGuestTestSession(session: Omit<TestSession, 'id'>): TestSession[] {
  const persisted: TestSession = {
    ...session,
    id: `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  };
  const next = [persisted, ...getGuestTestHistory()].slice(0, MAX_SESSIONS);
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // localStorage unavailable or quota exceeded — history stays in memory only
    }
  }
  return next;
}

/** Remove all locally-stored guest mock-test history. */
export function clearGuestTestHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
