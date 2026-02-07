/**
 * Tests for mastery calculation engine.
 *
 * Covers: calculateCategoryMastery, calculateQuestionAccuracy,
 * calculateOverallMastery, and edge cases around recency weighting.
 */
import { describe, it, expect } from 'vitest';
import {
  calculateCategoryMastery,
  calculateQuestionAccuracy,
  calculateOverallMastery,
  DECAY_HALF_LIFE_DAYS,
} from './calculateMastery';
import {
  detectWeakAreas,
  detectStaleCategories,
  getNextMilestone,
} from './weakAreaDetection';
import type { StoredAnswer } from './masteryStore';

// Helper to create a StoredAnswer
function makeAnswer(
  questionId: string,
  isCorrect: boolean,
  daysAgo: number = 0,
  sessionType: 'test' | 'practice' = 'test'
): StoredAnswer {
  const timestamp = Date.now() - daysAgo * 24 * 60 * 60 * 1000;
  return { questionId, isCorrect, timestamp, sessionType };
}

describe('calculateCategoryMastery', () => {
  const questionIds = ['GOV-P01', 'GOV-P02', 'GOV-P03'];

  it('returns 0 for empty answers', () => {
    expect(calculateCategoryMastery([], questionIds)).toBe(0);
  });

  it('returns 100 for all correct answers today', () => {
    const answers = [
      makeAnswer('GOV-P01', true),
      makeAnswer('GOV-P02', true),
      makeAnswer('GOV-P03', true),
    ];
    expect(calculateCategoryMastery(answers, questionIds)).toBe(100);
  });

  it('returns 0 for all incorrect answers today', () => {
    const answers = [
      makeAnswer('GOV-P01', false),
      makeAnswer('GOV-P02', false),
      makeAnswer('GOV-P03', false),
    ];
    expect(calculateCategoryMastery(answers, questionIds)).toBe(0);
  });

  it('returns 50 for 50/50 split today', () => {
    const answers = [
      makeAnswer('GOV-P01', true),
      makeAnswer('GOV-P02', false),
    ];
    expect(calculateCategoryMastery(answers, ['GOV-P01', 'GOV-P02'])).toBe(50);
  });

  it('applies exponential decay - old correct answers weigh less', () => {
    // One correct answer from 30 days ago vs one incorrect today
    const answers = [
      makeAnswer('GOV-P01', true, 30),
      makeAnswer('GOV-P01', false, 0),
    ];
    const mastery = calculateCategoryMastery(answers, ['GOV-P01']);
    // The old correct answer should be heavily decayed, so mastery should be low
    expect(mastery).toBeLessThan(30);
  });

  it('recent incorrect answers outweigh old correct answers', () => {
    const answers = [
      makeAnswer('GOV-P01', true, 28), // old correct
      makeAnswer('GOV-P01', false, 0), // recent incorrect
    ];
    const mastery = calculateCategoryMastery(answers, ['GOV-P01']);
    expect(mastery).toBeLessThan(50);
  });

  it('uses 14-day half-life for decay', () => {
    expect(DECAY_HALF_LIFE_DAYS).toBe(14);

    // Answer from exactly 14 days ago should have half the weight of a today answer
    const answers14DaysAgo = [makeAnswer('GOV-P01', true, 14)];
    const answersToday = [makeAnswer('GOV-P01', true, 0)];

    // Both should return 100 (single correct answer), but the weight differs internally
    // The mastery of a single correct answer is always 100 regardless of age
    // What matters is when there's a MIX of old and new
    const mixedAnswers = [
      makeAnswer('GOV-P01', true, 14),  // half weight correct
      makeAnswer('GOV-P01', false, 0),  // full weight incorrect
    ];
    const mastery = calculateCategoryMastery(mixedAnswers, ['GOV-P01']);
    // weight_correct = 0.5, weight_incorrect = 1.0
    // weighted mastery = 0.5 / (0.5 + 1.0) * 100 = 33.33
    expect(mastery).toBeCloseTo(33.33, 0);
  });

  it('applies practice weighting (0.7x vs test 1.0x)', () => {
    const practiceCorrect = [
      makeAnswer('GOV-P01', true, 0, 'practice'),
      makeAnswer('GOV-P01', false, 0, 'test'),
    ];
    const mastery = calculateCategoryMastery(practiceCorrect, ['GOV-P01']);
    // practice correct weight = 0.7, test incorrect weight = 1.0
    // mastery = 0.7 / (0.7 + 1.0) * 100 = 41.18
    expect(mastery).toBeCloseTo(41.18, 0);
  });

  it('test answers weigh more than practice answers', () => {
    // Same answer, one via test, one via practice
    const testAnswer = [makeAnswer('GOV-P01', true, 0, 'test')];
    const practiceAnswer = [makeAnswer('GOV-P01', true, 0, 'practice')];

    // Both single correct answers = 100, but test mixed in should carry more weight
    const mixedWithTest = [
      makeAnswer('GOV-P01', true, 0, 'test'),
      makeAnswer('GOV-P01', false, 0, 'practice'),
    ];
    const mixedWithPractice = [
      makeAnswer('GOV-P01', true, 0, 'practice'),
      makeAnswer('GOV-P01', false, 0, 'test'),
    ];

    const masteryWithTestCorrect = calculateCategoryMastery(mixedWithTest, ['GOV-P01']);
    const masteryWithPracticeCorrect = calculateCategoryMastery(mixedWithPractice, ['GOV-P01']);

    // Test correct + practice wrong should yield higher mastery than vice versa
    expect(masteryWithTestCorrect).toBeGreaterThan(masteryWithPracticeCorrect);
  });

  it('ignores answers for questions not in questionIds', () => {
    const answers = [
      makeAnswer('GOV-P01', true),
      makeAnswer('HIST-C01', true), // not in questionIds
    ];
    const mastery = calculateCategoryMastery(answers, ['GOV-P01']);
    expect(mastery).toBe(100); // only GOV-P01 matters
  });

  it('handles multiple answers for the same question', () => {
    const answers = [
      makeAnswer('GOV-P01', false, 5), // got it wrong 5 days ago
      makeAnswer('GOV-P01', true, 0),  // got it right today
    ];
    const mastery = calculateCategoryMastery(answers, ['GOV-P01']);
    // Recent correct should outweigh older incorrect
    expect(mastery).toBeGreaterThan(50);
  });
});

describe('calculateQuestionAccuracy', () => {
  it('returns zeroes for no answers', () => {
    const result = calculateQuestionAccuracy([], 'GOV-P01');
    expect(result).toEqual({ correct: 0, total: 0, accuracy: 0 });
  });

  it('calculates simple ratio without decay', () => {
    const answers = [
      makeAnswer('GOV-P01', true, 30),
      makeAnswer('GOV-P01', false, 0),
      makeAnswer('GOV-P01', true, 0),
    ];
    const result = calculateQuestionAccuracy(answers, 'GOV-P01');
    expect(result).toEqual({ correct: 2, total: 3, accuracy: 66.67 });
  });

  it('only counts answers for the specified question', () => {
    const answers = [
      makeAnswer('GOV-P01', true),
      makeAnswer('GOV-P02', false),
    ];
    const result = calculateQuestionAccuracy(answers, 'GOV-P01');
    expect(result).toEqual({ correct: 1, total: 1, accuracy: 100 });
  });
});

describe('calculateOverallMastery', () => {
  it('returns 0 for empty categories', () => {
    expect(calculateOverallMastery([])).toBe(0);
  });

  it('calculates weighted average proportional to question count', () => {
    const categories = [
      { categoryId: 'cat1', mastery: 100, questionCount: 10 },
      { categoryId: 'cat2', mastery: 0, questionCount: 10 },
    ];
    expect(calculateOverallMastery(categories)).toBe(50);
  });

  it('weights categories by question count', () => {
    const categories = [
      { categoryId: 'cat1', mastery: 100, questionCount: 30 }, // big category, fully mastered
      { categoryId: 'cat2', mastery: 0, questionCount: 10 },   // small category, not mastered
    ];
    // Weighted: (100*30 + 0*10) / (30+10) = 75
    expect(calculateOverallMastery(categories)).toBe(75);
  });

  it('handles single category', () => {
    const categories = [
      { categoryId: 'cat1', mastery: 80, questionCount: 5 },
    ];
    expect(calculateOverallMastery(categories)).toBe(80);
  });
});

describe('detectWeakAreas', () => {
  it('returns empty array when all categories above threshold', () => {
    const categories = [
      { categoryId: 'cat1', mastery: 80, questionCount: 10 },
      { categoryId: 'cat2', mastery: 75, questionCount: 10 },
    ];
    expect(detectWeakAreas(categories)).toEqual([]);
  });

  it('returns categories below 60% threshold (default)', () => {
    const categories = [
      { categoryId: 'cat1', mastery: 80, questionCount: 10 },
      { categoryId: 'cat2', mastery: 40, questionCount: 10 },
      { categoryId: 'cat3', mastery: 55, questionCount: 10 },
    ];
    const weak = detectWeakAreas(categories);
    expect(weak).toHaveLength(2);
    expect(weak[0].categoryId).toBe('cat2'); // weakest first
    expect(weak[1].categoryId).toBe('cat3');
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
      { categoryId: 'cat2', mastery: 20, questionCount: 10 },
      { categoryId: 'cat3', mastery: 40, questionCount: 10 },
    ];
    const weak = detectWeakAreas(categories);
    expect(weak.map(w => w.categoryId)).toEqual(['cat2', 'cat3', 'cat1']);
  });
});

describe('detectStaleCategories', () => {
  it('returns categories not practiced within staleDays', () => {
    const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
    const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
    const history: StoredAnswer[] = [
      { questionId: 'GOV-P01', isCorrect: true, timestamp: eightDaysAgo, sessionType: 'test' },
      { questionId: 'HIST-C01', isCorrect: true, timestamp: twoDaysAgo, sessionType: 'test' },
    ];

    const categoryMap = {
      'American Government': ['GOV-P01', 'GOV-P02'],
      'American History': ['HIST-C01', 'HIST-C02'],
      'Integrated Civics': ['CIV-S01'],
    };

    const stale = detectStaleCategories(history, categoryMap, 7);

    // American Government last practiced 8 days ago (stale)
    // Integrated Civics never practiced (stale)
    // American History practiced 2 days ago (not stale)
    expect(stale.length).toBeGreaterThanOrEqual(2);
    const staleIds = stale.map(s => s.categoryId);
    expect(staleIds).toContain('American Government');
    expect(staleIds).toContain('Integrated Civics');
    expect(staleIds).not.toContain('American History');
  });

  it('returns categories never practiced', () => {
    const categoryMap = {
      'American Government': ['GOV-P01'],
      'American History': ['HIST-C01'],
    };
    const stale = detectStaleCategories([], categoryMap, 7);
    expect(stale).toHaveLength(2);
    expect(stale[0].lastPracticed).toBeNull();
    expect(stale[0].daysSincePractice).toBeNull();
  });

  it('uses default staleDays of 7', () => {
    const sixDaysAgo = Date.now() - 6 * 24 * 60 * 60 * 1000;
    const history: StoredAnswer[] = [
      { questionId: 'GOV-P01', isCorrect: true, timestamp: sixDaysAgo, sessionType: 'test' },
    ];
    const categoryMap = {
      'American Government': ['GOV-P01', 'GOV-P02'],
    };
    const stale = detectStaleCategories(history, categoryMap);
    // 6 days ago is within 7-day window
    expect(stale).toHaveLength(0);
  });
});

describe('getNextMilestone', () => {
  it('returns bronze milestone for mastery below 50', () => {
    const milestone = getNextMilestone(30);
    expect(milestone).toEqual({ level: 'bronze', target: 50, remaining: 20 });
  });

  it('returns silver milestone for mastery between 50-74', () => {
    const milestone = getNextMilestone(60);
    expect(milestone).toEqual({ level: 'silver', target: 75, remaining: 15 });
  });

  it('returns gold milestone for mastery between 75-99', () => {
    const milestone = getNextMilestone(90);
    expect(milestone).toEqual({ level: 'gold', target: 100, remaining: 10 });
  });

  it('returns null for mastery at 100 (gold achieved)', () => {
    const milestone = getNextMilestone(100);
    expect(milestone).toBeNull();
  });

  it('returns bronze for 0 mastery', () => {
    const milestone = getNextMilestone(0);
    expect(milestone).toEqual({ level: 'bronze', target: 50, remaining: 50 });
  });

  it('returns silver for exactly 50 mastery', () => {
    const milestone = getNextMilestone(50);
    expect(milestone).toEqual({ level: 'silver', target: 75, remaining: 25 });
  });

  it('returns gold for exactly 75 mastery', () => {
    const milestone = getNextMilestone(75);
    expect(milestone).toEqual({ level: 'gold', target: 100, remaining: 25 });
  });
});
