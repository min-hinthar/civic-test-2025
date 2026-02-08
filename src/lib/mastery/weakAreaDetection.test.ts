/**
 * Tests for weakAreaDetection - Weak area and stale category detection.
 *
 * Covers: detectWeakAreas, detectStaleCategories, getNextMilestone.
 * Complements tests in calculateMastery.test.ts with additional edge cases.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { detectWeakAreas, detectStaleCategories, getNextMilestone } from './weakAreaDetection';
import type { StoredAnswer } from './masteryStore';

describe('detectWeakAreas', () => {
  it('returns empty array for empty input', () => {
    expect(detectWeakAreas([])).toEqual([]);
  });

  it('returns categories below default 60% threshold', () => {
    const categories = [
      { categoryId: 'cat1', mastery: 80, questionCount: 10 },
      { categoryId: 'cat2', mastery: 40, questionCount: 10 },
      { categoryId: 'cat3', mastery: 55, questionCount: 10 },
    ];
    const weak = detectWeakAreas(categories);
    expect(weak).toHaveLength(2);
    expect(weak[0]).toEqual({ categoryId: 'cat2', mastery: 40 });
    expect(weak[1]).toEqual({ categoryId: 'cat3', mastery: 55 });
  });

  it('does not include categories at exactly the threshold', () => {
    const categories = [{ categoryId: 'cat1', mastery: 60, questionCount: 10 }];
    expect(detectWeakAreas(categories, 60)).toEqual([]);
  });

  it('uses custom threshold', () => {
    const categories = [
      { categoryId: 'cat1', mastery: 80, questionCount: 10 },
      { categoryId: 'cat2', mastery: 70, questionCount: 10 },
    ];
    const weak = detectWeakAreas(categories, 75);
    expect(weak).toHaveLength(1);
    expect(weak[0].categoryId).toBe('cat2');
  });

  it('sorts by mastery ascending (weakest first)', () => {
    const categories = [
      { categoryId: 'cat1', mastery: 50, questionCount: 10 },
      { categoryId: 'cat2', mastery: 10, questionCount: 10 },
      { categoryId: 'cat3', mastery: 30, questionCount: 10 },
    ];
    const weak = detectWeakAreas(categories);
    expect(weak.map(w => w.categoryId)).toEqual(['cat2', 'cat3', 'cat1']);
  });

  it('returns all categories when all below threshold', () => {
    const categories = [
      { categoryId: 'cat1', mastery: 20, questionCount: 10 },
      { categoryId: 'cat2', mastery: 30, questionCount: 10 },
    ];
    const weak = detectWeakAreas(categories);
    expect(weak).toHaveLength(2);
  });

  it('returns empty when all above threshold', () => {
    const categories = [
      { categoryId: 'cat1', mastery: 80, questionCount: 10 },
      { categoryId: 'cat2', mastery: 95, questionCount: 10 },
    ];
    expect(detectWeakAreas(categories)).toEqual([]);
  });

  it('handles 0% mastery correctly', () => {
    const categories = [{ categoryId: 'cat1', mastery: 0, questionCount: 10 }];
    const weak = detectWeakAreas(categories);
    expect(weak).toHaveLength(1);
    expect(weak[0].mastery).toBe(0);
  });

  it('only returns categoryId and mastery (no questionCount)', () => {
    const categories = [{ categoryId: 'cat1', mastery: 30, questionCount: 100 }];
    const weak = detectWeakAreas(categories);
    expect(weak[0]).toEqual({ categoryId: 'cat1', mastery: 30 });
    expect(weak[0]).not.toHaveProperty('questionCount');
  });
});

describe('detectStaleCategories', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-08T12:00:00Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  const NOW = new Date('2026-02-08T12:00:00Z').getTime();
  const MS_PER_DAY = 24 * 60 * 60 * 1000;

  function makeAnswer(questionId: string, daysAgo: number): StoredAnswer {
    return {
      questionId,
      isCorrect: true,
      timestamp: NOW - daysAgo * MS_PER_DAY,
      sessionType: 'test',
    };
  }

  it('returns categories never practiced', () => {
    const categoryMap = {
      cat1: ['Q1'],
      cat2: ['Q2'],
    };
    const stale = detectStaleCategories([], categoryMap);
    expect(stale).toHaveLength(2);
    expect(stale[0].lastPracticed).toBeNull();
    expect(stale[0].daysSincePractice).toBeNull();
  });

  it('returns categories with old activity beyond staleDays', () => {
    const categoryMap = {
      cat1: ['Q1'],
    };
    const history = [makeAnswer('Q1', 10)]; // 10 days ago
    const stale = detectStaleCategories(history, categoryMap, 7);
    expect(stale).toHaveLength(1);
    expect(stale[0].categoryId).toBe('cat1');
    expect(stale[0].daysSincePractice).toBe(10);
  });

  it('does not return recently active categories', () => {
    const categoryMap = {
      cat1: ['Q1'],
    };
    const history = [makeAnswer('Q1', 2)]; // 2 days ago
    const stale = detectStaleCategories(history, categoryMap, 7);
    expect(stale).toHaveLength(0);
  });

  it('uses the most recent answer for each category', () => {
    const categoryMap = {
      cat1: ['Q1', 'Q2'],
    };
    const history = [
      makeAnswer('Q1', 20), // old
      makeAnswer('Q2', 3), // recent
    ];
    const stale = detectStaleCategories(history, categoryMap, 7);
    expect(stale).toHaveLength(0); // most recent is 3 days ago, within 7-day window
  });

  it('separates categories correctly by their question IDs', () => {
    const categoryMap = {
      cat1: ['Q1'],
      cat2: ['Q2'],
    };
    const history = [
      makeAnswer('Q1', 2), // cat1 is recent
      makeAnswer('Q2', 10), // cat2 is stale
    ];
    const stale = detectStaleCategories(history, categoryMap, 7);
    expect(stale).toHaveLength(1);
    expect(stale[0].categoryId).toBe('cat2');
  });

  it('uses default staleDays of 7', () => {
    const categoryMap = { cat1: ['Q1'] };
    const history = [makeAnswer('Q1', 6)]; // 6 days ago
    const stale = detectStaleCategories(history, categoryMap);
    expect(stale).toHaveLength(0); // within default 7-day window
  });

  it('returns stale at exactly staleDays boundary', () => {
    const categoryMap = { cat1: ['Q1'] };
    // Activity at exactly 8 days ago, staleDays = 7
    const history = [makeAnswer('Q1', 8)];
    const stale = detectStaleCategories(history, categoryMap, 7);
    expect(stale).toHaveLength(1);
  });
});

describe('getNextMilestone', () => {
  it('returns bronze for mastery 0', () => {
    expect(getNextMilestone(0)).toEqual({ level: 'bronze', target: 50, remaining: 50 });
  });

  it('returns bronze for mastery 30', () => {
    expect(getNextMilestone(30)).toEqual({ level: 'bronze', target: 50, remaining: 20 });
  });

  it('returns bronze for mastery 49', () => {
    expect(getNextMilestone(49)).toEqual({ level: 'bronze', target: 50, remaining: 1 });
  });

  it('returns silver for mastery exactly 50', () => {
    expect(getNextMilestone(50)).toEqual({ level: 'silver', target: 75, remaining: 25 });
  });

  it('returns silver for mastery 60', () => {
    expect(getNextMilestone(60)).toEqual({ level: 'silver', target: 75, remaining: 15 });
  });

  it('returns gold for mastery exactly 75', () => {
    expect(getNextMilestone(75)).toEqual({ level: 'gold', target: 100, remaining: 25 });
  });

  it('returns gold for mastery 90', () => {
    expect(getNextMilestone(90)).toEqual({ level: 'gold', target: 100, remaining: 10 });
  });

  it('returns gold for mastery 99', () => {
    expect(getNextMilestone(99)).toEqual({ level: 'gold', target: 100, remaining: 1 });
  });

  it('returns null for mastery 100 (gold achieved)', () => {
    expect(getNextMilestone(100)).toBeNull();
  });

  it('returns null for mastery above 100', () => {
    expect(getNextMilestone(120)).toBeNull();
  });
});
