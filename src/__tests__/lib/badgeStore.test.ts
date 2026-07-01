import { describe, it, expect, vi, beforeEach } from 'vitest';

// In-memory idb-keyval so we can inspect the exact keys the store writes.
const memory = new Map<string, unknown>();
vi.mock('idb-keyval', () => ({
  createStore: vi.fn(() => 'mock-badge-store'),
  get: vi.fn((key: string) => Promise.resolve(memory.get(key))),
  set: vi.fn((key: string, val: unknown) => {
    memory.set(key, val);
    return Promise.resolve();
  }),
  del: vi.fn((key: string) => {
    memory.delete(key);
    return Promise.resolve();
  }),
}));

import {
  getEarnedBadges,
  markBadgeEarned,
  getShownBadgeIds,
  markBadgeShown,
  GUEST_BADGE_SCOPE,
} from '@/lib/social/badgeStore';

describe('badgeStore (per-visitor scoping)', () => {
  beforeEach(() => {
    memory.clear();
    vi.clearAllMocks();
  });

  it('keeps earned badges separate per scope', async () => {
    await markBadgeEarned('user-1', 'streak-7');
    await markBadgeEarned(GUEST_BADGE_SCOPE, 'accuracy-90');

    expect((await getEarnedBadges('user-1')).map(b => b.badgeId)).toEqual(['streak-7']);
    expect((await getEarnedBadges(GUEST_BADGE_SCOPE)).map(b => b.badgeId)).toEqual(['accuracy-90']);
  });

  it('writes earned badges under a scoped key', async () => {
    await markBadgeEarned('user-1', 'streak-7');
    expect(memory.has('earned-badges:user-1')).toBe(true);
    expect(memory.has('earned-badges')).toBe(false);
  });

  it('keeps shown badges separate per scope', async () => {
    await markBadgeShown('user-1', 'streak-7');

    expect([...(await getShownBadgeIds('user-1'))]).toEqual(['streak-7']);
    expect([...(await getShownBadgeIds(GUEST_BADGE_SCOPE))]).toEqual([]);
  });

  it('markBadgeEarned is idempotent within a scope', async () => {
    await markBadgeEarned('user-1', 'streak-7');
    await markBadgeEarned('user-1', 'streak-7');
    expect(await getEarnedBadges('user-1')).toHaveLength(1);
  });

  it('adopts legacy device-wide badges into the first signed-in scope, then deletes legacy', async () => {
    memory.set('earned-badges', [
      { badgeId: 'coverage-all', earnedAt: '2026-01-01T00:00:00.000Z' },
    ]);
    memory.set('shown-badges', ['coverage-all']);

    expect((await getEarnedBadges('user-1')).map(b => b.badgeId)).toEqual(['coverage-all']);
    expect([...(await getShownBadgeIds('user-1'))]).toEqual(['coverage-all']);

    // Legacy keys removed; data now lives under the scoped keys.
    expect(memory.has('earned-badges')).toBe(false);
    expect(memory.has('shown-badges')).toBe(false);
    expect(memory.get('earned-badges:user-1')).toBeTruthy();
  });

  it('does NOT adopt legacy data into the guest scope (leaves it for a signed-in scope)', async () => {
    memory.set('earned-badges', [
      { badgeId: 'coverage-all', earnedAt: '2026-01-01T00:00:00.000Z' },
    ]);

    expect(await getEarnedBadges(GUEST_BADGE_SCOPE)).toEqual([]);
    expect(memory.has('earned-badges')).toBe(true);
  });

  it('does not clobber existing scoped data when legacy keys are present', async () => {
    memory.set('earned-badges:user-1', [
      { badgeId: 'streak-7', earnedAt: '2026-02-02T00:00:00.000Z' },
    ]);
    memory.set('earned-badges', [
      { badgeId: 'coverage-all', earnedAt: '2026-01-01T00:00:00.000Z' },
    ]);

    const earned = await getEarnedBadges('user-1');
    expect(earned.map(b => b.badgeId)).toEqual(['streak-7']);
    // Legacy still cleaned up.
    expect(memory.has('earned-badges')).toBe(false);
  });
});
