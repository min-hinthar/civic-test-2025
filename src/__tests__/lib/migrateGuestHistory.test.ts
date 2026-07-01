import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockFrom } = vi.hoisted(() => ({ mockFrom: vi.fn() }));
vi.mock('@/lib/supabaseClient', () => ({ supabase: { from: mockFrom } }));
vi.mock('@/lib/sentry', () => ({ captureError: vi.fn() }));

import {
  migrateGuestHistoryToAccount,
  dedupeSessions,
} from '@/lib/testHistory/migrateGuestHistory';
import { getGuestTestHistory, addGuestTestSession } from '@/lib/testHistory/guestTestHistory';
import type { TestSession } from '@/types';

function guestSession(date: string, score = 18): Omit<TestSession, 'id'> {
  return {
    date,
    score,
    totalQuestions: 20,
    durationSeconds: 300,
    passed: score >= 12,
    incorrectCount: 20 - score,
    endReason: 'complete',
    results: [],
  };
}

function accountSession(date: string, score = 18): TestSession {
  return { id: `acc-${date}`, ...guestSession(date, score) };
}

/**
 * from() mock: mock_tests inserts succeed (echoing completed_at back) unless
 * `failOn` matches; mock_test_responses inserts succeed.
 */
function setupSupabase({ failOn }: { failOn?: (date: string) => boolean } = {}) {
  let counter = 0;
  mockFrom.mockImplementation((table: string) => {
    if (table === 'mock_tests') {
      let lastPayload: { completed_at: string } | undefined;
      const chain = {
        insert: vi.fn((payload: { completed_at: string }) => {
          lastPayload = payload;
          return chain;
        }),
        select: vi.fn(() => chain),
        single: vi.fn(() => {
          const date = lastPayload?.completed_at ?? '';
          if (failOn?.(date)) {
            return Promise.resolve({ data: null, error: new Error('insert failed') });
          }
          counter += 1;
          return Promise.resolve({
            data: { id: `srv-${counter}`, completed_at: date },
            error: null,
          });
        }),
      };
      return chain;
    }
    return { insert: vi.fn(() => Promise.resolve({ error: null })) };
  });
}

function mockTestsInsertCount(): number {
  return mockFrom.mock.calls.filter(c => c[0] === 'mock_tests').length;
}

describe('migrateGuestHistoryToAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('is a no-op (same reference) when there is no guest history', async () => {
    setupSupabase();
    const account = [accountSession('2026-06-01T00:00:00.000Z')];

    const result = await migrateGuestHistoryToAccount('user-1', account);

    expect(result).toBe(account);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('inserts new guest sessions, clears the guest store, and returns merged history newest-first', async () => {
    setupSupabase();
    addGuestTestSession(guestSession('2026-06-02T00:00:00.000Z', 15));
    addGuestTestSession(guestSession('2026-06-03T00:00:00.000Z', 19));
    const account = [accountSession('2026-06-01T00:00:00.000Z', 10)];

    const result = await migrateGuestHistoryToAccount('user-1', account);

    expect(mockTestsInsertCount()).toBe(2);
    expect(getGuestTestHistory()).toHaveLength(0);
    expect(result).toHaveLength(3);
    expect(result.map(s => s.date)).toEqual([
      '2026-06-03T00:00:00.000Z',
      '2026-06-02T00:00:00.000Z',
      '2026-06-01T00:00:00.000Z',
    ]);
  });

  it('dedupes guest sessions already present in the account by content', async () => {
    setupSupabase();
    addGuestTestSession(guestSession('2026-06-02T00:00:00.000Z', 15));
    const account = [accountSession('2026-06-02T00:00:00.000Z', 15)];

    const result = await migrateGuestHistoryToAccount('user-1', account);

    expect(mockFrom).not.toHaveBeenCalled();
    expect(getGuestTestHistory()).toHaveLength(0);
    expect(result).toBe(account);
  });

  it('dedupes across timestamp format differences (epoch-normalised)', async () => {
    setupSupabase();
    // Guest stored a millis-precision ISO string; account returns the same
    // instant in a different textual form.
    addGuestTestSession(guestSession('2026-06-02T00:00:00.000Z', 15));
    const account: TestSession[] = [
      { id: 'acc', ...guestSession('2026-06-02T00:00:00.000+00:00', 15) },
    ];

    const result = await migrateGuestHistoryToAccount('user-1', account);

    expect(mockFrom).not.toHaveBeenCalled();
    expect(result).toBe(account);
  });

  it('keeps the guest store on partial failure but still returns the sessions for visibility', async () => {
    setupSupabase({ failOn: date => date === '2026-06-03T00:00:00.000Z' });
    addGuestTestSession(guestSession('2026-06-02T00:00:00.000Z', 15));
    addGuestTestSession(guestSession('2026-06-03T00:00:00.000Z', 19));

    const result = await migrateGuestHistoryToAccount('user-1', []);

    // Failure leaves the store intact for a later retry...
    expect(getGuestTestHistory()).toHaveLength(2);
    // ...but both sessions are still surfaced so they stay visible.
    expect(result).toHaveLength(2);
  });

  it('clears the store when all guest sessions are already in the account (post-migration dupes)', async () => {
    setupSupabase();
    addGuestTestSession(guestSession('2026-06-02T00:00:00.000Z', 15));
    const account = [accountSession('2026-06-02T00:00:00.000Z', 15)];

    await migrateGuestHistoryToAccount('user-1', account);

    expect(getGuestTestHistory()).toHaveLength(0);
  });

  it('serialises concurrent migrations — a second concurrent call reuses the first (no double insert)', async () => {
    setupSupabase();
    addGuestTestSession(guestSession('2026-06-02T00:00:00.000Z', 15));

    const [a, b] = await Promise.all([
      migrateGuestHistoryToAccount('user-1', []),
      migrateGuestHistoryToAccount('user-1', []),
    ]);

    // Only one insert pass ran despite two concurrent callers.
    expect(mockTestsInsertCount()).toBe(1);
    // Both callers observe the same merged result.
    expect(a).toBe(b);
    expect(getGuestTestHistory()).toHaveLength(0);
  });
});

describe('dedupeSessions', () => {
  it('drops content-duplicates (first occurrence wins) and sorts newest-first', () => {
    const offline: TestSession = {
      id: 'offline-1',
      ...guestSession('2026-06-04T00:00:00.000Z', 12),
    };
    const migrated: TestSession = { id: 'srv-1', ...guestSession('2026-06-02T00:00:00.000Z', 15) };
    const dupeOfMigrated: TestSession = {
      id: 'other',
      ...guestSession('2026-06-02T00:00:00.000Z', 15),
    };

    const out = dedupeSessions([offline, migrated, dupeOfMigrated]);

    expect(out.map(s => s.date)).toEqual(['2026-06-04T00:00:00.000Z', '2026-06-02T00:00:00.000Z']);
    // First occurrence wins for the duplicate.
    expect(out.find(s => s.date === '2026-06-02T00:00:00.000Z')?.id).toBe('srv-1');
  });

  it('keeps sessions unique to each list (e.g. an offline save + migrated sessions)', () => {
    const prev: TestSession[] = [
      { id: 'offline-1', ...guestSession('2026-06-05T00:00:00.000Z', 10) },
    ];
    const merged: TestSession[] = [
      { id: 'acc-1', ...guestSession('2026-06-01T00:00:00.000Z', 18) },
      { id: 'srv-1', ...guestSession('2026-06-02T00:00:00.000Z', 15) },
    ];

    const out = dedupeSessions([...prev, ...merged]);

    // The offline save is preserved alongside the migrated/account sessions.
    expect(out).toHaveLength(3);
    expect(out.some(s => s.id === 'offline-1')).toBe(true);
  });
});
