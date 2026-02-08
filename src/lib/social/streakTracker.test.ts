/**
 * Tests for streakTracker - Pure streak calculation logic.
 *
 * Covers: calculateStreak, shouldAutoUseFreeze, checkFreezeEligibility.
 * Uses vi.useFakeTimers for deterministic date-dependent tests.
 */
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import {
  calculateStreak,
  shouldAutoUseFreeze,
  checkFreezeEligibility,
  getLocalDateString,
} from './streakTracker';

// Helper to format a Date as YYYY-MM-DD
function toDateStr(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to get a date string N days before a reference date
function daysBeforeStr(ref: Date, n: number): string {
  const d = new Date(ref);
  d.setDate(d.getDate() - n);
  return toDateStr(d);
}

describe('getLocalDateString', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns YYYY-MM-DD format', () => {
    vi.setSystemTime(new Date('2026-03-15T10:00:00'));
    expect(getLocalDateString()).toBe('2026-03-15');
  });

  it('pads single-digit month and day', () => {
    vi.setSystemTime(new Date('2026-01-05T10:00:00'));
    expect(getLocalDateString()).toBe('2026-01-05');
  });
});

describe('calculateStreak', () => {
  const NOW = new Date('2026-02-08T12:00:00');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns current:0, longest:0 for empty activity array', () => {
    expect(calculateStreak([], [])).toEqual({ current: 0, longest: 0 });
  });

  it('returns current:1, longest:1 for single today activity', () => {
    const today = toDateStr(NOW);
    expect(calculateStreak([today], [])).toEqual({ current: 1, longest: 1 });
  });

  it('returns current:1 for yesterday only (not yet studied today)', () => {
    const yesterday = daysBeforeStr(NOW, 1);
    expect(calculateStreak([yesterday], [])).toEqual({ current: 1, longest: 1 });
  });

  it('builds streak from consecutive days including today', () => {
    const dates = [daysBeforeStr(NOW, 2), daysBeforeStr(NOW, 1), toDateStr(NOW)];
    expect(calculateStreak(dates, [])).toEqual({ current: 3, longest: 3 });
  });

  it('builds streak from consecutive days ending yesterday', () => {
    const dates = [daysBeforeStr(NOW, 3), daysBeforeStr(NOW, 2), daysBeforeStr(NOW, 1)];
    expect(calculateStreak(dates, [])).toEqual({ current: 3, longest: 3 });
  });

  it('resets current streak on gap', () => {
    // Activity today + 3 days ago (gap of 2 days ago and yesterday)
    const dates = [daysBeforeStr(NOW, 3), toDateStr(NOW)];
    const result = calculateStreak(dates, []);
    expect(result.current).toBe(1);
  });

  it('tracks longest streak separately from current', () => {
    // Old 5-day streak, then gap, then today only
    const dates = [
      daysBeforeStr(NOW, 20),
      daysBeforeStr(NOW, 19),
      daysBeforeStr(NOW, 18),
      daysBeforeStr(NOW, 17),
      daysBeforeStr(NOW, 16),
      toDateStr(NOW), // current streak is just 1
    ];
    const result = calculateStreak(dates, []);
    expect(result.current).toBe(1);
    expect(result.longest).toBe(5);
  });

  it('freeze days fill gaps in current streak', () => {
    // Activity 3 days ago and today, freeze on 2 and 1 days ago
    const dates = [daysBeforeStr(NOW, 3), toDateStr(NOW)];
    const freezes = [daysBeforeStr(NOW, 2), daysBeforeStr(NOW, 1)];
    const result = calculateStreak(dates, freezes);
    expect(result.current).toBe(4); // 3 days ago + 2 freeze + today
  });

  it('returns current:0 when neither today nor yesterday is active', () => {
    const dates = [daysBeforeStr(NOW, 5)];
    const result = calculateStreak(dates, []);
    expect(result.current).toBe(0);
    expect(result.longest).toBe(1);
  });

  it('handles duplicate dates without issues', () => {
    const today = toDateStr(NOW);
    const result = calculateStreak([today, today, today], []);
    expect(result.current).toBe(1);
    expect(result.longest).toBe(1);
  });
});

describe('shouldAutoUseFreeze', () => {
  const NOW = new Date('2026-02-08T12:00:00');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  const today = '2026-02-08';
  const yesterday = '2026-02-07';

  it('returns true when today has activity, yesterday does not, and freeze available', () => {
    const result = shouldAutoUseFreeze([today], 1);
    expect(result.useFreeze).toBe(true);
    expect(result.freezeDate).toBe(yesterday);
  });

  it('returns false when no freezes available', () => {
    const result = shouldAutoUseFreeze([today], 0);
    expect(result.useFreeze).toBe(false);
    expect(result.freezeDate).toBeNull();
  });

  it('returns false when yesterday already has activity', () => {
    const result = shouldAutoUseFreeze([today, yesterday], 3);
    expect(result.useFreeze).toBe(false);
    expect(result.freezeDate).toBeNull();
  });

  it('returns false when today has no activity (user has not returned yet)', () => {
    const result = shouldAutoUseFreeze([yesterday], 3);
    expect(result.useFreeze).toBe(false);
    expect(result.freezeDate).toBeNull();
  });

  it('returns false when no activity at all', () => {
    const result = shouldAutoUseFreeze([], 5);
    expect(result.useFreeze).toBe(false);
    expect(result.freezeDate).toBeNull();
  });
});

describe('checkFreezeEligibility', () => {
  it('returns true for practice with completed practice test', () => {
    expect(
      checkFreezeEligibility('practice', {
        srsReviewCount: 0,
        practiceTestCompleted: true,
      })
    ).toBe(true);
  });

  it('returns false for practice without completed practice test', () => {
    expect(
      checkFreezeEligibility('practice', {
        srsReviewCount: 0,
        practiceTestCompleted: false,
      })
    ).toBe(false);
  });

  it('returns true for srs_review with 10+ reviews', () => {
    expect(
      checkFreezeEligibility('srs_review', {
        srsReviewCount: 10,
        practiceTestCompleted: false,
      })
    ).toBe(true);
  });

  it('returns true for srs_review with more than 10 reviews', () => {
    expect(
      checkFreezeEligibility('srs_review', {
        srsReviewCount: 15,
        practiceTestCompleted: false,
      })
    ).toBe(true);
  });

  it('returns false for srs_review with fewer than 10 reviews', () => {
    expect(
      checkFreezeEligibility('srs_review', {
        srsReviewCount: 9,
        practiceTestCompleted: false,
      })
    ).toBe(false);
  });

  it('returns false for test activity type', () => {
    expect(
      checkFreezeEligibility('test', {
        srsReviewCount: 20,
        practiceTestCompleted: true,
      })
    ).toBe(false);
  });

  it('returns false for study_guide activity type', () => {
    expect(
      checkFreezeEligibility('study_guide', {
        srsReviewCount: 20,
        practiceTestCompleted: true,
      })
    ).toBe(false);
  });

  it('returns false for interview activity type', () => {
    expect(
      checkFreezeEligibility('interview', {
        srsReviewCount: 20,
        practiceTestCompleted: true,
      })
    ).toBe(false);
  });
});
