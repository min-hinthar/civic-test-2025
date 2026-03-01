/**
 * NBA Determination Engine
 *
 * Pure function that takes user learning state and returns the best
 * next action recommendation. Follows a priority chain based on
 * learning science principles:
 *
 *   1. New user (no data)
 *   2. Returning after 7+ day absence
 *   3. Streak at risk (studied before, not today)
 *   4. SRS reviews due
 *   5. Weak category (below 50%)
 *   6. No recent test (7+ days)
 *   7. Celebration (streak + no SRS + mastery >= 60 + recent test)
 *   8. Test ready (readiness >= 70%)
 *   9. Default celebration (fallback -- nothing urgent)
 *
 * Zero React dependencies. Injectable `now` parameter for testability.
 */

import { USCIS_CATEGORIES } from '@/lib/mastery/categoryMapping';
import type { USCISCategory } from '@/lib/mastery/categoryMapping';
import { getNBAContent } from './nbaStrings';
import type { NBAInput, NBAState } from './nbaTypes';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Get today's date as YYYY-MM-DD from a Date object */
function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Days between two YYYY-MM-DD date strings (absolute) */
function daysBetween(dateStr: string, now: Date): number {
  const date = new Date(dateStr + 'T00:00:00Z');
  const today = new Date(toDateString(now) + 'T00:00:00Z');
  return Math.round((today.getTime() - date.getTime()) / (24 * 60 * 60 * 1000));
}

/**
 * Compute readiness score using the same formula as ReadinessIndicator.
 * accuracy * 0.4 + coverage * 0.5 + streakBonus (max 10)
 */
function computeReadiness(input: NBAInput): number {
  // Recent accuracy: average of last 5 test scores as percentage
  const recentTests = input.testHistory
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const recentAccuracy =
    recentTests.length > 0
      ? recentTests.reduce((sum, t) => sum + (t.score / t.totalQuestions) * 100, 0) /
        recentTests.length
      : 0;

  // Coverage: percentage of unique questions practiced
  const coveragePercent =
    input.totalQuestions > 0 ? (input.uniqueQuestionsPracticed / input.totalQuestions) * 100 : 0;

  // Streak bonus: 2% per day, max 10%
  const streakBonus = Math.min(input.currentStreak * 2, 10);

  return Math.min(100, Math.round(recentAccuracy * 0.4 + coveragePercent * 0.5 + streakBonus));
}

/** Check if at least one mock test has a passing score (>= 60%) */
function hasPassedMockTest(testHistory: NBAInput['testHistory']): boolean {
  return testHistory.some(t => t.totalQuestions > 0 && t.score / t.totalQuestions >= 0.6);
}

/**
 * Find the weakest USCIS category below the threshold.
 * Returns null if no category is below threshold.
 */
function findWeakestCategory(
  categoryMasteries: Record<string, number>,
  threshold: number = 50
): { name: USCISCategory; mastery: number } | null {
  let weakest: { name: USCISCategory; mastery: number } | null = null;

  for (const catName of Object.keys(USCIS_CATEGORIES) as USCISCategory[]) {
    const mastery = categoryMasteries[catName];
    if (mastery !== undefined && mastery < threshold) {
      if (weakest === null || mastery < weakest.mastery) {
        weakest = { name: catName, mastery };
      }
    }
  }

  return weakest;
}

// ---------------------------------------------------------------------------
// Main determination function
// ---------------------------------------------------------------------------

/**
 * Determine the next best action for a user.
 *
 * @param input - Aggregated user learning state
 * @param now - Current date (injectable for testing, defaults to new Date())
 * @returns Typed NBA state with bilingual content, gradient, icon, CTA
 */
export function determineNextBestAction(input: NBAInput, now: Date = new Date()): NBAState {
  const today = toDateString(now);

  // -----------------------------------------------------------------------
  // 1. New user: no activity, no tests, no practice
  // -----------------------------------------------------------------------
  if (
    input.activityDates.length === 0 &&
    input.testHistory.length === 0 &&
    input.uniqueQuestionsPracticed === 0
  ) {
    const content = getNBAContent('new-user');
    return { ...content, type: 'new-user' };
  }

  // -----------------------------------------------------------------------
  // 2. Returning user: last activity 7+ days ago
  // -----------------------------------------------------------------------
  if (input.activityDates.length > 0) {
    const lastActivityDate = input.activityDates.slice().sort().pop()!;
    const daysSinceActivity = daysBetween(lastActivityDate, now);

    if (daysSinceActivity >= 7) {
      const content = getNBAContent('returning-user');
      return {
        ...content,
        type: 'returning-user',
        daysSinceActivity,
      };
    }
  }

  // -----------------------------------------------------------------------
  // 3. Streak at risk: has active streak but hasn't studied today
  // -----------------------------------------------------------------------
  if (input.currentStreak > 0 && !input.activityDates.includes(today)) {
    const content = getNBAContent('streak-at-risk', {
      currentStreak: input.currentStreak,
    });
    return {
      ...content,
      type: 'streak-at-risk',
      currentStreak: input.currentStreak,
    };
  }

  // -----------------------------------------------------------------------
  // 4. SRS cards due for review
  // -----------------------------------------------------------------------
  if (input.srsDueCount > 0) {
    const content = getNBAContent('srs-due', {
      dueCount: input.srsDueCount,
    });
    return {
      ...content,
      type: 'srs-due',
      dueCount: input.srsDueCount,
    };
  }

  // -----------------------------------------------------------------------
  // 5. Weak category: any USCIS category below 50%
  // -----------------------------------------------------------------------
  const weakCategory = findWeakestCategory(input.categoryMasteries);
  if (weakCategory) {
    const categoryDef = USCIS_CATEGORIES[weakCategory.name];
    const content = getNBAContent('weak-category', {
      categoryName: categoryDef.name,
      mastery: weakCategory.mastery,
    });
    return {
      ...content,
      type: 'weak-category',
      categoryName: categoryDef.name,
      mastery: weakCategory.mastery,
    };
  }

  // -----------------------------------------------------------------------
  // 6. No recent test: no tests at all, or last test 7+ days ago
  // -----------------------------------------------------------------------
  if (input.testHistory.length === 0) {
    const content = getNBAContent('no-recent-test', { daysSinceTest: 0 });
    return {
      ...content,
      type: 'no-recent-test',
      daysSinceTest: 0,
    };
  }

  const sortedTests = input.testHistory.slice().sort((a, b) => b.date.localeCompare(a.date));
  const daysSinceLastTest = daysBetween(sortedTests[0].date, now);

  if (daysSinceLastTest >= 7) {
    const content = getNBAContent('no-recent-test', {
      daysSinceTest: daysSinceLastTest,
    });
    return {
      ...content,
      type: 'no-recent-test',
      daysSinceTest: daysSinceLastTest,
    };
  }

  // -----------------------------------------------------------------------
  // 7. Celebration: everything is going well (specific "all clear" state)
  //    streak > 0, SRS caught up, mastery >= 60, recent test within 7 days
  // -----------------------------------------------------------------------
  const readinessScore = computeReadiness(input);
  const passedTest = hasPassedMockTest(input.testHistory);

  // -----------------------------------------------------------------------
  // Test-date awareness: when test is within 7 days, prevent celebration
  // states and instead suggest actionable next steps.
  // -----------------------------------------------------------------------
  const testDateDaysRemaining = input.testDate
    ? Math.max(0, -daysBetween(input.testDate, now))
    : null;
  const isTestImminent =
    testDateDaysRemaining !== null && testDateDaysRemaining > 0 && testDateDaysRemaining <= 7;

  const isCelebration =
    input.currentStreak > 0 &&
    input.srsDueCount === 0 &&
    input.overallMastery >= 60 &&
    daysSinceLastTest < 7;

  if (isCelebration && !isTestImminent) {
    const suggestInterview = readinessScore >= 80 && passedTest;
    const content = getNBAContent('celebration', {
      currentStreak: input.currentStreak,
      mastery: input.overallMastery,
      suggestInterview,
    });
    return {
      ...content,
      type: 'celebration',
      streak: input.currentStreak,
      mastery: input.overallMastery,
      suggestInterview,
    };
  }

  // When test is imminent and we'd celebrate, suggest actionable advice instead
  if (isCelebration && isTestImminent) {
    // Try weak category first
    const weakCat = findWeakestCategory(input.categoryMasteries, 70);
    if (weakCat) {
      const categoryDef = USCIS_CATEGORIES[weakCat.name];
      const contentWeak = getNBAContent('weak-category', {
        categoryName: categoryDef.name,
        mastery: weakCat.mastery,
      });
      return {
        ...contentWeak,
        type: 'weak-category',
        categoryName: categoryDef.name,
        mastery: weakCat.mastery,
      };
    }
    // Suggest a mock test if none recently
    if (daysSinceLastTest >= 2) {
      const contentTest = getNBAContent('no-recent-test', {
        daysSinceTest: daysSinceLastTest,
      });
      return {
        ...contentTest,
        type: 'no-recent-test',
        daysSinceTest: daysSinceLastTest,
      };
    }
  }

  // -----------------------------------------------------------------------
  // 8. Test ready: readiness score >= 70%
  // -----------------------------------------------------------------------
  if (readinessScore >= 70) {
    const suggestInterview = readinessScore >= 80 && passedTest;
    const content = getNBAContent('test-ready', {
      readinessScore,
      suggestInterview,
    });
    return {
      ...content,
      type: 'test-ready',
      readinessScore,
      suggestInterview,
    };
  }

  // -----------------------------------------------------------------------
  // 9. Default celebration: nothing urgent, things are going OK
  //    (also overridden by test-date awareness when test is imminent)
  // -----------------------------------------------------------------------
  if (isTestImminent) {
    // When test imminent: push for practice instead of celebrating
    const weakCat = findWeakestCategory(input.categoryMasteries, 70);
    if (weakCat) {
      const categoryDef = USCIS_CATEGORIES[weakCat.name];
      const contentWeak = getNBAContent('weak-category', {
        categoryName: categoryDef.name,
        mastery: weakCat.mastery,
      });
      return {
        ...contentWeak,
        type: 'weak-category',
        categoryName: categoryDef.name,
        mastery: weakCat.mastery,
      };
    }
    if (daysSinceLastTest >= 2) {
      const contentTest = getNBAContent('no-recent-test', {
        daysSinceTest: daysSinceLastTest,
      });
      return {
        ...contentTest,
        type: 'no-recent-test',
        daysSinceTest: daysSinceLastTest,
      };
    }
  }

  const suggestInterview = readinessScore >= 80 && passedTest;
  const content = getNBAContent('celebration', {
    currentStreak: input.currentStreak,
    mastery: input.overallMastery,
    suggestInterview,
  });
  return {
    ...content,
    type: 'celebration',
    streak: input.currentStreak,
    mastery: input.overallMastery,
    suggestInterview,
  };
}
