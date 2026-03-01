/**
 * Tests for streakSync - Enhanced mergeStreakData with freeze recalculation
 * and longest streak recomputation from merged activity dates.
 *
 * Tests cover:
 * 1. Basic union of activity dates (existing behavior)
 * 2. Basic union of freezes used (existing behavior)
 * 3. Freeze recalculation: freeze on date that now has activity is removed
 * 4. Freed freeze count returned to freezesAvailable (capped at 3)
 * 5. Longest streak recomputed from merged dates using calculateStreak
 * 6. Edge: freezesAvailable cap at 3 even when multiple freezes freed
 * 7. Edge: empty remote data
 * 8. Edge: dailyActivityCounts kept from local
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mergeStreakData } from './streakSync';
import type { StreakData } from './streakStore';

// Mock calculateStreak for controlled testing
vi.mock('./streakTracker', () => ({
  calculateStreak: vi.fn((activityDates: string[], freezesUsed: string[]) => {
    // Combine activity + freezes, sort, count consecutive days
    const allDays = new Set([...activityDates, ...freezesUsed]);
    const sorted = Array.from(allDays).sort();
    if (sorted.length === 0) return { current: 0, longest: 0 };

    let longest = 1;
    let currentRun = 1;
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1] + 'T00:00:00');
      const curr = new Date(sorted[i] + 'T00:00:00');
      const diffMs = curr.getTime() - prev.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentRun++;
        longest = Math.max(longest, currentRun);
      } else if (diffDays > 1) {
        currentRun = 1;
      }
    }
    return { current: currentRun, longest };
  }),
}));

function makeStreakData(overrides: Partial<StreakData> = {}): StreakData {
  return {
    activityDates: [],
    freezesAvailable: 0,
    freezesUsed: [],
    longestStreak: 0,
    lastSyncedAt: null,
    dailyActivityCounts: {
      srsReviewCount: 0,
      practiceTestCompleted: false,
    },
    ...overrides,
  };
}

describe('mergeStreakData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ------------------------------------------------------------------
  // Existing behavior preservation
  // ------------------------------------------------------------------

  it('unions activity dates (dedup + sort)', () => {
    const local = makeStreakData({
      activityDates: ['2026-02-25', '2026-02-26', '2026-02-28'],
    });
    const remote = makeStreakData({
      activityDates: ['2026-02-26', '2026-02-27'],
    });

    const result = mergeStreakData(local, remote);

    expect(result.activityDates).toEqual(['2026-02-25', '2026-02-26', '2026-02-27', '2026-02-28']);
  });

  it('unions freezes used (dedup + sort)', () => {
    const local = makeStreakData({
      activityDates: ['2026-02-25'],
      freezesUsed: ['2026-02-20', '2026-02-22'],
    });
    const remote = makeStreakData({
      activityDates: ['2026-02-25'],
      freezesUsed: ['2026-02-22', '2026-02-23'],
    });

    const result = mergeStreakData(local, remote);

    // All three unique freeze dates remain (none overlap with activity dates)
    expect(result.freezesUsed).toEqual(['2026-02-20', '2026-02-22', '2026-02-23']);
  });

  // ------------------------------------------------------------------
  // Freeze recalculation (NEW behavior)
  // ------------------------------------------------------------------

  it('removes freeze on date that now has activity after merge', () => {
    // Local used a freeze on Feb 28 because they missed that day
    // Remote had activity on Feb 28
    const local = makeStreakData({
      activityDates: ['2026-02-25', '2026-02-26', '2026-02-27'],
      freezesUsed: ['2026-02-28'],
      freezesAvailable: 2,
    });
    const remote = makeStreakData({
      activityDates: ['2026-02-25', '2026-02-26', '2026-02-28'],
      freezesUsed: [],
      freezesAvailable: 1,
    });

    const result = mergeStreakData(local, remote);

    // Feb 28 is now an activity date from remote, so freeze on Feb 28 is unnecessary
    expect(result.freezesUsed).toEqual([]);
    // Freed 1 freeze, max(2, 1) + 1 = 3
    expect(result.freezesAvailable).toBe(3);
    // Activity should include Feb 25-28 (4 consecutive days)
    expect(result.activityDates).toEqual(['2026-02-25', '2026-02-26', '2026-02-27', '2026-02-28']);
  });

  it('returns freed freezes to available pool', () => {
    const local = makeStreakData({
      activityDates: ['2026-02-25'],
      freezesUsed: ['2026-02-26'],
      freezesAvailable: 1,
    });
    const remote = makeStreakData({
      activityDates: ['2026-02-25', '2026-02-26'],
      freezesUsed: [],
      freezesAvailable: 2,
    });

    const result = mergeStreakData(local, remote);

    // Freeze on Feb 26 removed (now has activity)
    expect(result.freezesUsed).toEqual([]);
    // max(1, 2) + 1 freed = 3
    expect(result.freezesAvailable).toBe(3);
  });

  // ------------------------------------------------------------------
  // freezesAvailable cap at 3
  // ------------------------------------------------------------------

  it('caps freezesAvailable at 3 even when multiple freezes freed', () => {
    const local = makeStreakData({
      activityDates: ['2026-02-25'],
      freezesUsed: ['2026-02-26', '2026-02-27'],
      freezesAvailable: 2,
    });
    const remote = makeStreakData({
      activityDates: ['2026-02-25', '2026-02-26', '2026-02-27'],
      freezesUsed: [],
      freezesAvailable: 3,
    });

    const result = mergeStreakData(local, remote);

    // 2 freezes freed, max(2, 3) + 2 = 5, but capped at 3
    expect(result.freezesAvailable).toBe(3);
  });

  // ------------------------------------------------------------------
  // Longest streak recomputation
  // ------------------------------------------------------------------

  it('recomputes longest streak from merged dates (not max of both)', () => {
    // Local: Feb 25-27 (3-day streak, longest=3)
    // Remote: Feb 27-Mar 1 (3-day streak, longest=3)
    // Merged: Feb 25-Mar 1 (5-day streak - longer than either!)
    const local = makeStreakData({
      activityDates: ['2026-02-25', '2026-02-26', '2026-02-27'],
      longestStreak: 3,
    });
    const remote = makeStreakData({
      activityDates: ['2026-02-27', '2026-02-28', '2026-03-01'],
      longestStreak: 3,
    });

    const result = mergeStreakData(local, remote);

    // Merged dates: Feb 25,26,27,28,Mar 1 - 5 consecutive days
    // Old behavior would return max(3,3) = 3
    // New behavior uses calculateStreak which returns 5
    expect(result.longestStreak).toBe(5);
  });

  // ------------------------------------------------------------------
  // Edge cases
  // ------------------------------------------------------------------

  it('merging with empty remote returns local data with recalculated longest', () => {
    const local = makeStreakData({
      activityDates: ['2026-02-25', '2026-02-26'],
      freezesUsed: ['2026-02-27'],
      freezesAvailable: 2,
      longestStreak: 3,
    });
    const remote = makeStreakData();

    const result = mergeStreakData(local, remote);

    expect(result.activityDates).toEqual(['2026-02-25', '2026-02-26']);
    expect(result.freezesUsed).toEqual(['2026-02-27']);
    // max(2, 0) + 0 freed = 2
    expect(result.freezesAvailable).toBe(2);
    // calculateStreak returns longest from Feb 25,26 + freeze Feb 27 = 3 consecutive
    expect(result.longestStreak).toBe(3);
  });

  it('keeps dailyActivityCounts from local (current device state)', () => {
    const local = makeStreakData({
      activityDates: ['2026-02-25'],
      dailyActivityCounts: {
        srsReviewCount: 15,
        practiceTestCompleted: true,
      },
    });
    const remote = makeStreakData({
      activityDates: ['2026-02-25'],
      dailyActivityCounts: {
        srsReviewCount: 3,
        practiceTestCompleted: false,
      },
    });

    const result = mergeStreakData(local, remote);

    expect(result.dailyActivityCounts).toEqual({
      srsReviewCount: 15,
      practiceTestCompleted: true,
    });
  });

  it('sets lastSyncedAt to current time', () => {
    const before = new Date().toISOString();

    const local = makeStreakData({ activityDates: ['2026-02-25'] });
    const remote = makeStreakData({ activityDates: ['2026-02-25'] });

    const result = mergeStreakData(local, remote);

    expect(result.lastSyncedAt).not.toBeNull();
    expect(result.lastSyncedAt! >= before).toBe(true);
  });

  it('handles freeze on date that both devices have activity', () => {
    // Both devices active on Feb 26, but local also has a freeze on Feb 26
    // (shouldn't happen in practice, but test the edge case)
    const local = makeStreakData({
      activityDates: ['2026-02-25', '2026-02-26'],
      freezesUsed: ['2026-02-26'],
      freezesAvailable: 1,
    });
    const remote = makeStreakData({
      activityDates: ['2026-02-25', '2026-02-26'],
      freezesUsed: [],
      freezesAvailable: 2,
    });

    const result = mergeStreakData(local, remote);

    // Freeze on Feb 26 removed (activity exists on that date)
    expect(result.freezesUsed).toEqual([]);
    // max(1, 2) + 1 freed = 3
    expect(result.freezesAvailable).toBe(3);
  });
});
