/**
 * Tests for badgeEngine - Badge evaluation logic.
 *
 * Covers: evaluateBadges, getNewlyEarnedBadge.
 * Uses minimal BadgeCheckData objects for deterministic results.
 */
import { describe, it, expect } from 'vitest';
import { evaluateBadges, getNewlyEarnedBadge } from './badgeEngine';
import type { BadgeCheckData } from './badgeDefinitions';

// Helper to create default badge check data (all zeros / empty)
function makeData(overrides: Partial<BadgeCheckData> = {}): BadgeCheckData {
  return {
    currentStreak: 0,
    longestStreak: 0,
    bestTestAccuracy: 0,
    bestTestScore: 0,
    totalTestsTaken: 0,
    uniqueQuestionsAnswered: 0,
    categoriesMastered: 0,
    totalCategories: 7,
    ...overrides,
  };
}

describe('evaluateBadges', () => {
  it('returns no badges for all-zero data', () => {
    const badges = evaluateBadges(makeData(), new Set());
    expect(badges).toHaveLength(0);
  });

  it('returns streak-7 badge when currentStreak >= 7', () => {
    const badges = evaluateBadges(makeData({ currentStreak: 7 }), new Set());
    const ids = badges.map(b => b.id);
    expect(ids).toContain('streak-7');
  });

  it('returns streak-7 badge when longestStreak >= 7 (even if current is 0)', () => {
    const badges = evaluateBadges(makeData({ longestStreak: 7 }), new Set());
    const ids = badges.map(b => b.id);
    expect(ids).toContain('streak-7');
  });

  it('returns multiple streak badges for 30-day streak', () => {
    const badges = evaluateBadges(makeData({ currentStreak: 30 }), new Set());
    const ids = badges.map(b => b.id);
    expect(ids).toContain('streak-7');
    expect(ids).toContain('streak-14');
    expect(ids).toContain('streak-30');
  });

  it('returns accuracy-90 badge when bestTestAccuracy >= 90', () => {
    const badges = evaluateBadges(makeData({ bestTestAccuracy: 90 }), new Set());
    const ids = badges.map(b => b.id);
    expect(ids).toContain('accuracy-90');
  });

  it('returns both accuracy badges when bestTestAccuracy is 100', () => {
    const badges = evaluateBadges(makeData({ bestTestAccuracy: 100 }), new Set());
    const ids = badges.map(b => b.id);
    expect(ids).toContain('accuracy-90');
    expect(ids).toContain('accuracy-100');
  });

  it('returns coverage-all badge when uniqueQuestionsAnswered >= 100', () => {
    const badges = evaluateBadges(makeData({ uniqueQuestionsAnswered: 100 }), new Set());
    const ids = badges.map(b => b.id);
    expect(ids).toContain('coverage-all');
  });

  it('returns coverage-mastered badge when all categories mastered', () => {
    const badges = evaluateBadges(
      makeData({ categoriesMastered: 7, totalCategories: 7 }),
      new Set()
    );
    const ids = badges.map(b => b.id);
    expect(ids).toContain('coverage-mastered');
  });

  it('excludes already-earned badges', () => {
    const badges = evaluateBadges(makeData({ currentStreak: 7 }), new Set(['streak-7']));
    const ids = badges.map(b => b.id);
    expect(ids).not.toContain('streak-7');
  });

  it('returns multiple badges simultaneously when criteria met', () => {
    const badges = evaluateBadges(
      makeData({
        currentStreak: 7,
        bestTestAccuracy: 100,
        uniqueQuestionsAnswered: 100,
      }),
      new Set()
    );
    expect(badges.length).toBeGreaterThanOrEqual(4);
  });
});

describe('getNewlyEarnedBadge', () => {
  it('returns null when no badges earned', () => {
    const badge = getNewlyEarnedBadge(makeData(), new Set(), new Set());
    expect(badge).toBeNull();
  });

  it('returns new badge when one is newly earned and not yet shown', () => {
    const badge = getNewlyEarnedBadge(makeData({ currentStreak: 7 }), new Set(), new Set());
    expect(badge).not.toBeNull();
    expect(badge!.id).toBe('streak-7');
  });

  it('returns null when badge is earned but already shown', () => {
    const badge = getNewlyEarnedBadge(
      makeData({ currentStreak: 7 }),
      new Set(),
      new Set(['streak-7'])
    );
    // streak-7 is shown, no other badges earned
    expect(badge).toBeNull();
  });

  it('returns previously earned badge that has not been shown', () => {
    // Badge was earned before (in earnedBadgeIds) but never shown
    const badge = getNewlyEarnedBadge(
      makeData(), // data says streak is 0, but badge is in earnedBadgeIds
      new Set(['streak-7']),
      new Set()
    );
    expect(badge).not.toBeNull();
    expect(badge!.id).toBe('streak-7');
  });

  it('skips shown badges and returns next unshown one', () => {
    // streak-7 is shown, streak-14 earned but not shown
    const badge = getNewlyEarnedBadge(
      makeData({ currentStreak: 14 }),
      new Set(),
      new Set(['streak-7'])
    );
    expect(badge).not.toBeNull();
    expect(badge!.id).toBe('streak-14');
  });

  it('returns null when all earned badges are shown', () => {
    const badge = getNewlyEarnedBadge(
      makeData({ currentStreak: 14 }),
      new Set(),
      new Set(['streak-7', 'streak-14'])
    );
    expect(badge).toBeNull();
  });
});
