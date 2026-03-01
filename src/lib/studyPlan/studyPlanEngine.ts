/**
 * Study Plan Engine
 *
 * Pure function that computes daily study targets from learning state
 * and optional test date. Zero React dependencies. Injectable `now`
 * parameter for deterministic testing.
 *
 * Rules:
 *   1. SRS reviews: min(srsDueCount, 20)
 *   2. New questions: distributed across remaining days (capped 3-15)
 *   3. Drill: weakest category below 50%, 5-10 questions
 *   4. Mock test: if none in 3+ days and mastery >= 40
 *   5. Pace status: readiness fraction vs time fraction (ahead/on-track/behind)
 *   6. Estimated minutes: SRS*0.5 + new*1.0 + drill*1.0 + mock*12, min 1
 */

import type { StudyPlanInput, DailyPlan, PaceStatus } from './studyPlanTypes';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_SRS_REVIEWS = 20;
const MIN_NEW_QUESTIONS = 3;
const MAX_NEW_QUESTIONS = 15;
const DEFAULT_DAILY_NEW = 10;
const DRILL_MIN = 5;
const DRILL_MAX = 10;
const MOCK_TEST_INTERVAL_DAYS = 3;
const MOCK_TEST_MIN_MASTERY = 40;
const PACE_TOLERANCE = 0.05;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Get today's date as YYYY-MM-DD from a Date object (UTC) */
function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Days between a YYYY-MM-DD date string and now (positive = dateStr is in the past) */
function daysBetween(dateStr: string, now: Date): number {
  const date = new Date(dateStr + 'T00:00:00Z');
  const today = new Date(toDateString(now) + 'T00:00:00Z');
  return Math.round((today.getTime() - date.getTime()) / (24 * 60 * 60 * 1000));
}

/** Clamp a value between min and max */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ---------------------------------------------------------------------------
// Main function
// ---------------------------------------------------------------------------

/**
 * Compute a daily study plan from the user's learning state.
 *
 * @param input - Aggregated learning state from hooks
 * @returns Daily study plan with targets, recommendations, and pacing
 */
export function computeStudyPlan(input: StudyPlanInput): DailyPlan {
  const now = input.now ?? new Date();

  // -------------------------------------------------------------------------
  // 1. Days remaining
  // -------------------------------------------------------------------------
  let daysRemaining: number | null = null;
  if (input.testDate !== null) {
    const raw = -daysBetween(input.testDate, now); // negative because we want future days
    daysRemaining = Math.max(raw, 0);
  }

  // -------------------------------------------------------------------------
  // 2. SRS reviews: min(srsDueCount, 20)
  // -------------------------------------------------------------------------
  const srsReviewCount = Math.min(input.srsDueCount, MAX_SRS_REVIEWS);

  // -------------------------------------------------------------------------
  // 3. New question target
  // -------------------------------------------------------------------------
  let newQuestionTarget: number;

  if (input.unpracticedCount === 0) {
    newQuestionTarget = 0;
  } else if (input.testDate !== null) {
    // With date: distribute across remaining days
    const effectiveDays = Math.max(daysRemaining!, 1);
    const raw = Math.ceil(input.unpracticedCount / effectiveDays);
    newQuestionTarget = clamp(raw, MIN_NEW_QUESTIONS, MAX_NEW_QUESTIONS);
  } else {
    // No date: default pacing, min 3 if any unpracticed exist
    newQuestionTarget = clamp(input.unpracticedCount, MIN_NEW_QUESTIONS, DEFAULT_DAILY_NEW);
  }

  // -------------------------------------------------------------------------
  // 4. Drill recommendation
  // -------------------------------------------------------------------------
  let drillRecommendation: DailyPlan['drillRecommendation'] = null;

  if (input.weakCategories.length > 0) {
    // Find weakest category
    const weakest = input.weakCategories.reduce((min, cat) =>
      cat.mastery < min.mastery ? cat : min
    );
    drillRecommendation = {
      category: weakest.name,
      count: clamp(DRILL_MAX, DRILL_MIN, DRILL_MAX),
    };
  }

  // -------------------------------------------------------------------------
  // 5. Mock test recommendation
  // -------------------------------------------------------------------------
  let mockTestRecommended = false;

  if (input.overallMastery >= MOCK_TEST_MIN_MASTERY) {
    if (input.lastMockTestDate === null) {
      mockTestRecommended = true;
    } else {
      const daysSinceLastMock = daysBetween(input.lastMockTestDate, now);
      mockTestRecommended = daysSinceLastMock >= MOCK_TEST_INTERVAL_DAYS;
    }
  }

  // -------------------------------------------------------------------------
  // 6. Estimated minutes
  // -------------------------------------------------------------------------
  const rawMinutes =
    srsReviewCount * 0.5 +
    newQuestionTarget * 1.0 +
    (drillRecommendation ? drillRecommendation.count * 1.0 : 0) +
    (mockTestRecommended ? 12 : 0);

  const estimatedMinutes = Math.max(1, Math.round(rawMinutes));

  // -------------------------------------------------------------------------
  // 7. Pace status (only when testDate is set and daysRemaining > 0)
  // -------------------------------------------------------------------------
  let paceStatus: PaceStatus | null = null;

  if (input.testDate !== null && daysRemaining !== null && daysRemaining > 0) {
    const readinessFraction = input.readinessScore / input.readinessTarget;

    // Approximate total days: we don't know when user set the test date,
    // so use conservative estimate
    const approxTotalDays = Math.max(daysRemaining + 14, 30);
    const timeFraction = (approxTotalDays - daysRemaining) / approxTotalDays;

    if (readinessFraction > timeFraction + PACE_TOLERANCE) {
      paceStatus = 'ahead';
    } else if (readinessFraction < timeFraction - PACE_TOLERANCE) {
      paceStatus = 'behind';
    } else {
      paceStatus = 'on-track';
    }
  }

  return {
    srsReviewCount,
    newQuestionTarget,
    drillRecommendation,
    mockTestRecommended,
    estimatedMinutes,
    paceStatus,
    daysRemaining,
  };
}
