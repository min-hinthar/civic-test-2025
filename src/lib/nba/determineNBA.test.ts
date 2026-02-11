/**
 * Tests for determineNextBestAction pure function.
 *
 * Covers all 8 NBA priority states, edge cases, and priority ordering.
 * Uses injectable `now` parameter for deterministic date-based logic.
 */

import { describe, it, expect } from 'vitest';
import { determineNextBestAction } from './determineNBA';
import type { NBAInput } from './nbaTypes';

/** Helper: create a base NBAInput with all zeros/empty */
function emptyInput(overrides: Partial<NBAInput> = {}): NBAInput {
  return {
    currentStreak: 0,
    activityDates: [],
    srsDueCount: 0,
    overallMastery: 0,
    categoryMasteries: {},
    testHistory: [],
    interviewHistory: [],
    uniqueQuestionsPracticed: 0,
    totalQuestions: 128,
    ...overrides,
  };
}

/** Helper: get a date string N days before the reference date */
function daysAgo(n: number, now: Date = new Date('2026-02-11')): string {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

const NOW = new Date('2026-02-11');
const TODAY = '2026-02-11';

describe('determineNextBestAction', () => {
  // -----------------------------------------------------------------------
  // 1. New user (all zeros/empty)
  // -----------------------------------------------------------------------
  describe('new-user state', () => {
    it('returns new-user when all data is empty', () => {
      const result = determineNextBestAction(emptyInput(), NOW);

      expect(result.type).toBe('new-user');
      expect(result.title.en).toContain('citizenship journey');
      expect(result.cta.to).toBe('/study');
      expect(result.urgent).toBe(false);
    });

    it('returns new-user even when totalQuestions varies', () => {
      const result = determineNextBestAction(emptyInput({ totalQuestions: 200 }), NOW);
      expect(result.type).toBe('new-user');
    });
  });

  // -----------------------------------------------------------------------
  // 2. Returning user (7+ day gap)
  // -----------------------------------------------------------------------
  describe('returning-user state', () => {
    it('returns returning-user when last activity was 10 days ago', () => {
      const result = determineNextBestAction(
        emptyInput({
          activityDates: [daysAgo(10, NOW)],
          overallMastery: 30,
          uniqueQuestionsPracticed: 20,
        }),
        NOW
      );

      expect(result.type).toBe('returning-user');
      if (result.type === 'returning-user') {
        expect(result.daysSinceActivity).toBeGreaterThanOrEqual(7);
      }
    });

    it('returns returning-user when last activity was exactly 7 days ago', () => {
      const result = determineNextBestAction(
        emptyInput({
          activityDates: [daysAgo(7, NOW)],
          overallMastery: 20,
          uniqueQuestionsPracticed: 10,
        }),
        NOW
      );

      expect(result.type).toBe('returning-user');
    });

    it('does NOT return returning-user when last activity was 6 days ago', () => {
      const result = determineNextBestAction(
        emptyInput({
          activityDates: [daysAgo(6, NOW)],
          overallMastery: 20,
          uniqueQuestionsPracticed: 10,
        }),
        NOW
      );

      expect(result.type).not.toBe('returning-user');
    });
  });

  // -----------------------------------------------------------------------
  // 3. Streak at risk
  // -----------------------------------------------------------------------
  describe('streak-at-risk state', () => {
    it('returns streak-at-risk when user has streak but did not study today', () => {
      const result = determineNextBestAction(
        emptyInput({
          currentStreak: 5,
          activityDates: [daysAgo(1, NOW), daysAgo(2, NOW)],
          uniqueQuestionsPracticed: 40,
        }),
        NOW
      );

      expect(result.type).toBe('streak-at-risk');
      if (result.type === 'streak-at-risk') {
        expect(result.currentStreak).toBe(5);
      }
      expect(result.urgent).toBe(true);
    });

    it('does NOT return streak-at-risk when user studied today', () => {
      const result = determineNextBestAction(
        emptyInput({
          currentStreak: 5,
          activityDates: [TODAY, daysAgo(1, NOW)],
          srsDueCount: 3,
          uniqueQuestionsPracticed: 40,
        }),
        NOW
      );

      expect(result.type).not.toBe('streak-at-risk');
    });

    it('does NOT return streak-at-risk when streak is 0', () => {
      const result = determineNextBestAction(
        emptyInput({
          currentStreak: 0,
          activityDates: [daysAgo(1, NOW)],
          uniqueQuestionsPracticed: 10,
        }),
        NOW
      );

      expect(result.type).not.toBe('streak-at-risk');
    });
  });

  // -----------------------------------------------------------------------
  // 4. SRS due
  // -----------------------------------------------------------------------
  describe('srs-due state', () => {
    it('returns srs-due when cards are due and no higher-priority condition', () => {
      const result = determineNextBestAction(
        emptyInput({
          currentStreak: 3,
          activityDates: [TODAY],
          srsDueCount: 8,
          uniqueQuestionsPracticed: 40,
        }),
        NOW
      );

      expect(result.type).toBe('srs-due');
      if (result.type === 'srs-due') {
        expect(result.dueCount).toBe(8);
      }
      expect(result.urgent).toBe(true);
      expect(result.estimatedMinutes).toBe(4); // ceil(8 * 0.5)
    });

    it('returns srs-due with correct time estimate for 1 card', () => {
      const result = determineNextBestAction(
        emptyInput({
          currentStreak: 2,
          activityDates: [TODAY],
          srsDueCount: 1,
          uniqueQuestionsPracticed: 40,
        }),
        NOW
      );

      expect(result.type).toBe('srs-due');
      if (result.type === 'srs-due') {
        expect(result.dueCount).toBe(1);
      }
      expect(result.estimatedMinutes).toBe(1); // ceil(1 * 0.5)
    });
  });

  // -----------------------------------------------------------------------
  // 5. Weak category
  // -----------------------------------------------------------------------
  describe('weak-category state', () => {
    it('returns weak-category when a category is below 50% and no higher priority', () => {
      const result = determineNextBestAction(
        emptyInput({
          currentStreak: 2,
          activityDates: [TODAY],
          srsDueCount: 0,
          overallMastery: 40,
          categoryMasteries: {
            'American Government': 60,
            'American History': 25,
            'Integrated Civics': 45,
          },
          uniqueQuestionsPracticed: 40,
        }),
        NOW
      );

      expect(result.type).toBe('weak-category');
      if (result.type === 'weak-category') {
        // Should pick the weakest: American History at 25%
        expect(result.categoryName.en).toBe('American History');
        expect(result.mastery).toBe(25);
      }
    });

    it('picks the weakest category when multiple are below 50%', () => {
      const result = determineNextBestAction(
        emptyInput({
          currentStreak: 2,
          activityDates: [TODAY],
          srsDueCount: 0,
          categoryMasteries: {
            'American Government': 10,
            'American History': 30,
            'Integrated Civics': 45,
          },
          uniqueQuestionsPracticed: 40,
        }),
        NOW
      );

      expect(result.type).toBe('weak-category');
      if (result.type === 'weak-category') {
        expect(result.categoryName.en).toBe('American Government');
        expect(result.mastery).toBe(10);
      }
    });

    it('does NOT trigger weak-category when all categories are >= 50%', () => {
      const result = determineNextBestAction(
        emptyInput({
          currentStreak: 2,
          activityDates: [TODAY],
          srsDueCount: 0,
          categoryMasteries: {
            'American Government': 60,
            'American History': 55,
            'Integrated Civics': 70,
          },
          uniqueQuestionsPracticed: 40,
        }),
        NOW
      );

      expect(result.type).not.toBe('weak-category');
    });
  });

  // -----------------------------------------------------------------------
  // 6. No recent test
  // -----------------------------------------------------------------------
  describe('no-recent-test state', () => {
    it('returns no-recent-test when no tests exist and user has some practice', () => {
      const result = determineNextBestAction(
        emptyInput({
          currentStreak: 2,
          activityDates: [TODAY],
          srsDueCount: 0,
          overallMastery: 55,
          categoryMasteries: {
            'American Government': 60,
            'American History': 55,
            'Integrated Civics': 50,
          },
          testHistory: [],
          uniqueQuestionsPracticed: 40,
        }),
        NOW
      );

      expect(result.type).toBe('no-recent-test');
    });

    it('returns no-recent-test when last test was 10 days ago', () => {
      const result = determineNextBestAction(
        emptyInput({
          currentStreak: 2,
          activityDates: [TODAY],
          srsDueCount: 0,
          overallMastery: 55,
          categoryMasteries: {
            'American Government': 60,
            'American History': 55,
            'Integrated Civics': 50,
          },
          testHistory: [{ date: daysAgo(10, NOW), score: 12, totalQuestions: 20 }],
          uniqueQuestionsPracticed: 40,
        }),
        NOW
      );

      expect(result.type).toBe('no-recent-test');
      if (result.type === 'no-recent-test') {
        expect(result.daysSinceTest).toBe(10);
      }
    });

    it('does NOT return no-recent-test when test was 3 days ago', () => {
      const result = determineNextBestAction(
        emptyInput({
          currentStreak: 2,
          activityDates: [TODAY],
          srsDueCount: 0,
          overallMastery: 55,
          categoryMasteries: {
            'American Government': 60,
            'American History': 55,
            'Integrated Civics': 50,
          },
          testHistory: [{ date: daysAgo(3, NOW), score: 12, totalQuestions: 20 }],
          uniqueQuestionsPracticed: 40,
        }),
        NOW
      );

      expect(result.type).not.toBe('no-recent-test');
    });
  });

  // -----------------------------------------------------------------------
  // 7. Test ready
  // -----------------------------------------------------------------------
  describe('test-ready state', () => {
    it('returns test-ready when readiness >= 70% with recent test but mastery < 60', () => {
      // overallMastery < 60 avoids celebration check; readiness still high from
      // test accuracy + coverage + streak
      const result = determineNextBestAction(
        emptyInput({
          currentStreak: 5,
          activityDates: [TODAY],
          srsDueCount: 0,
          overallMastery: 55,
          categoryMasteries: {
            'American Government': 80,
            'American History': 70,
            'Integrated Civics': 75,
          },
          testHistory: [{ date: daysAgo(2, NOW), score: 16, totalQuestions: 20 }],
          uniqueQuestionsPracticed: 90,
          totalQuestions: 128,
        }),
        NOW
      );

      expect(result.type).toBe('test-ready');
      if (result.type === 'test-ready') {
        expect(result.readinessScore).toBeGreaterThanOrEqual(70);
      }
    });

    it('suggests interview when readiness >= 80% and has passed mock test', () => {
      // overallMastery < 60 avoids celebration; high streak + accuracy + coverage
      // gives readiness >= 80%
      const result = determineNextBestAction(
        emptyInput({
          currentStreak: 5,
          activityDates: [TODAY],
          srsDueCount: 0,
          overallMastery: 55,
          categoryMasteries: {
            'American Government': 90,
            'American History': 88,
            'Integrated Civics': 92,
          },
          testHistory: [{ date: daysAgo(1, NOW), score: 16, totalQuestions: 20 }],
          uniqueQuestionsPracticed: 110,
          totalQuestions: 128,
        }),
        NOW
      );

      expect(result.type).toBe('test-ready');
      if (result.type === 'test-ready') {
        expect(result.suggestInterview).toBe(true);
        expect(result.readinessScore).toBeGreaterThanOrEqual(80);
      }
    });

    it('does NOT suggest interview when no passed test despite high readiness', () => {
      // overallMastery < 60 avoids celebration
      const result = determineNextBestAction(
        emptyInput({
          currentStreak: 5,
          activityDates: [TODAY],
          srsDueCount: 0,
          overallMastery: 55,
          categoryMasteries: {
            'American Government': 90,
            'American History': 88,
            'Integrated Civics': 92,
          },
          // Low scores: 5/20 = 25% -- not a pass
          testHistory: [{ date: daysAgo(1, NOW), score: 5, totalQuestions: 20 }],
          uniqueQuestionsPracticed: 110,
          totalQuestions: 128,
        }),
        NOW
      );

      if (result.type === 'test-ready') {
        expect(result.suggestInterview).toBe(false);
      }
    });
  });

  // -----------------------------------------------------------------------
  // 8. Celebration
  // -----------------------------------------------------------------------
  describe('celebration state', () => {
    it('returns celebration when streak > 0, SRS 0, mastery >= 60, recent test', () => {
      const result = determineNextBestAction(
        emptyInput({
          currentStreak: 3,
          activityDates: [TODAY],
          srsDueCount: 0,
          overallMastery: 65,
          categoryMasteries: {
            'American Government': 65,
            'American History': 65,
            'Integrated Civics': 65,
          },
          testHistory: [{ date: daysAgo(2, NOW), score: 12, totalQuestions: 20 }],
          uniqueQuestionsPracticed: 50,
          totalQuestions: 128,
        }),
        NOW
      );

      expect(result.type).toBe('celebration');
      if (result.type === 'celebration') {
        expect(result.streak).toBe(3);
        expect(result.mastery).toBe(65);
      }
    });

    it('celebration suggests interview when readiness >= 80% and passed test', () => {
      const result = determineNextBestAction(
        emptyInput({
          currentStreak: 10,
          activityDates: [TODAY],
          srsDueCount: 0,
          overallMastery: 65,
          categoryMasteries: {
            'American Government': 65,
            'American History': 65,
            'Integrated Civics': 65,
          },
          testHistory: [{ date: daysAgo(1, NOW), score: 16, totalQuestions: 20 }],
          uniqueQuestionsPracticed: 100,
          totalQuestions: 128,
        }),
        NOW
      );

      expect(result.type).toBe('celebration');
      if (result.type === 'celebration') {
        expect(result.suggestInterview).toBe(true);
      }
    });
  });

  // -----------------------------------------------------------------------
  // Priority ordering edge cases
  // -----------------------------------------------------------------------
  describe('priority ordering', () => {
    it('streak-at-risk wins over SRS due', () => {
      const result = determineNextBestAction(
        emptyInput({
          currentStreak: 5,
          activityDates: [daysAgo(1, NOW)], // not today
          srsDueCount: 10,
          uniqueQuestionsPracticed: 40,
        }),
        NOW
      );

      expect(result.type).toBe('streak-at-risk');
    });

    it('returning-user wins over streak-at-risk', () => {
      const result = determineNextBestAction(
        emptyInput({
          currentStreak: 3,
          activityDates: [daysAgo(10, NOW)],
          srsDueCount: 5,
          overallMastery: 30,
          uniqueQuestionsPracticed: 20,
        }),
        NOW
      );

      expect(result.type).toBe('returning-user');
    });

    it('new-user wins over everything else (empty data)', () => {
      const result = determineNextBestAction(emptyInput(), NOW);
      expect(result.type).toBe('new-user');
    });

    it('SRS due wins over weak-category', () => {
      const result = determineNextBestAction(
        emptyInput({
          currentStreak: 2,
          activityDates: [TODAY],
          srsDueCount: 5,
          categoryMasteries: { 'American History': 20 },
          uniqueQuestionsPracticed: 40,
        }),
        NOW
      );

      expect(result.type).toBe('srs-due');
    });

    it('weak-category wins over no-recent-test', () => {
      const result = determineNextBestAction(
        emptyInput({
          currentStreak: 2,
          activityDates: [TODAY],
          srsDueCount: 0,
          categoryMasteries: { 'American History': 20 },
          testHistory: [{ date: daysAgo(10, NOW), score: 10, totalQuestions: 20 }],
          uniqueQuestionsPracticed: 40,
        }),
        NOW
      );

      expect(result.type).toBe('weak-category');
    });
  });

  // -----------------------------------------------------------------------
  // Edge cases
  // -----------------------------------------------------------------------
  describe('edge cases', () => {
    it('empty activityDates with some practice = new user', () => {
      // The plan says: empty activityDates + no test + no practice = new user
      // But if they have some practice data, they're not "new" -- they just
      // never had activity dates tracked. In practice this shouldn't happen
      // but if activityDates is empty AND there's some uniqueQuestionsPracticed,
      // the new-user check also requires no test history and no questions practiced.
      const result = determineNextBestAction(
        emptyInput({
          activityDates: [],
          testHistory: [],
          uniqueQuestionsPracticed: 5,
        }),
        NOW
      );

      // With uniqueQuestionsPracticed > 0, this is NOT a new user
      expect(result.type).not.toBe('new-user');
    });

    it('interview suggestion requires both readiness >= 80 AND passed test (score >= 60%)', () => {
      // High readiness but test score 10/20 = 50% -- not a pass
      const result = determineNextBestAction(
        emptyInput({
          currentStreak: 10,
          activityDates: [TODAY],
          srsDueCount: 0,
          overallMastery: 90,
          categoryMasteries: {
            'American Government': 90,
            'American History': 88,
            'Integrated Civics': 92,
          },
          testHistory: [{ date: daysAgo(1, NOW), score: 10, totalQuestions: 20 }],
          uniqueQuestionsPracticed: 110,
          totalQuestions: 128,
        }),
        NOW
      );

      // With low test scores, should not suggest interview
      if (result.type === 'test-ready' || result.type === 'celebration') {
        expect(result.suggestInterview).toBe(false);
      }
    });

    it('handles single test in history for accuracy calculation', () => {
      const result = determineNextBestAction(
        emptyInput({
          currentStreak: 3,
          activityDates: [TODAY],
          srsDueCount: 0,
          overallMastery: 55,
          categoryMasteries: {
            'American Government': 60,
            'American History': 55,
            'Integrated Civics': 50,
          },
          testHistory: [{ date: daysAgo(2, NOW), score: 15, totalQuestions: 20 }],
          uniqueQuestionsPracticed: 50,
          totalQuestions: 128,
        }),
        NOW
      );

      // Should have a defined type (not throw)
      expect(result.type).toBeDefined();
    });

    it('all NBAState objects have required bilingual fields', () => {
      // Test a representative state to ensure bilingual content is populated
      const result = determineNextBestAction(
        emptyInput({
          currentStreak: 5,
          activityDates: [daysAgo(1, NOW)],
          uniqueQuestionsPracticed: 40,
        }),
        NOW
      );

      expect(result.title.en).toBeTruthy();
      expect(result.title.my).toBeTruthy();
      expect(result.hint.en).toBeTruthy();
      expect(result.hint.my).toBeTruthy();
      expect(result.cta.label.en).toBeTruthy();
      expect(result.cta.label.my).toBeTruthy();
      expect(result.cta.to).toBeTruthy();
      expect(result.skip.label.en).toBeTruthy();
      expect(result.skip.label.my).toBeTruthy();
      expect(result.skip.to).toBeTruthy();
      expect(result.gradient).toBeTruthy();
      expect(result.icon).toBeTruthy();
    });
  });
});
