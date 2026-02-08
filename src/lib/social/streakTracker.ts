/**
 * Streak Tracker - Pure streak calculation logic.
 *
 * All functions are pure (no side effects, no IndexedDB access).
 * They operate on arrays of date strings and return computed results.
 *
 * Date format: 'YYYY-MM-DD' in user's local timezone.
 */

/** Counts for daily activity tracking (used for freeze eligibility) */
export interface DailyActivityCounts {
  srsReviewCount: number;
  practiceTestCompleted: boolean;
}

/**
 * Get today's date as 'YYYY-MM-DD' in the user's local timezone.
 *
 * Uses local date methods to avoid UTC date-boundary issues.
 * A user studying at 11:30 PM local time should get today's local date,
 * not tomorrow's UTC date.
 */
export function getLocalDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculate current and longest streaks from activity dates and freeze dates.
 *
 * Walks backwards from today counting consecutive days where each day
 * is either an activity day or a freeze day. Gaps break the streak.
 *
 * Also computes the longest streak across all historical activity.
 */
export function calculateStreak(
  activityDates: string[],
  freezesUsed: string[]
): { current: number; longest: number } {
  if (activityDates.length === 0) {
    return { current: 0, longest: 0 };
  }

  // Combine activity dates and freeze dates into a set for O(1) lookup
  const activeDays = new Set([...activityDates, ...freezesUsed]);

  // Sort all active days ascending for longest streak calculation
  const sortedDays = Array.from(activeDays).sort();

  // --- Calculate current streak (walk backwards from today) ---
  const today = getLocalDateString();
  let current = 0;
  let checkDate = new Date(today + 'T00:00:00');

  // If today is not an active day, check yesterday (user might not have
  // studied yet today but still has an active streak from yesterday)
  if (!activeDays.has(today)) {
    checkDate.setDate(checkDate.getDate() - 1);
    const yesterdayStr = formatDate(checkDate);
    if (!activeDays.has(yesterdayStr)) {
      // Neither today nor yesterday is active - current streak is 0
      // Still need to compute longest streak below
      return { current: 0, longest: computeLongest(sortedDays) };
    }
  }

  // Walk backwards counting consecutive active days
  while (activeDays.has(formatDate(checkDate))) {
    current++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  const longest = computeLongest(sortedDays);

  return { current, longest: Math.max(current, longest) };
}

/**
 * Compute the longest consecutive streak from sorted date strings.
 */
function computeLongest(sortedDays: string[]): number {
  if (sortedDays.length === 0) return 0;

  let longest = 1;
  let currentRun = 1;

  for (let i = 1; i < sortedDays.length; i++) {
    const prev = new Date(sortedDays[i - 1] + 'T00:00:00');
    const curr = new Date(sortedDays[i] + 'T00:00:00');
    const diffMs = curr.getTime() - prev.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentRun++;
      longest = Math.max(longest, currentRun);
    } else if (diffDays > 1) {
      currentRun = 1;
    }
    // diffDays === 0 means duplicate date, skip
  }

  return longest;
}

/**
 * Format a Date object as 'YYYY-MM-DD' using local date.
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if a streak freeze should be auto-used.
 *
 * Auto-uses a freeze when:
 * 1. Yesterday has no activity
 * 2. User has freezes available
 * 3. Today has activity (user returned after missing a day)
 *
 * Returns the freeze date (yesterday) if a freeze should be used.
 */
export function shouldAutoUseFreeze(
  activityDates: string[],
  freezesAvailable: number
): { useFreeze: boolean; freezeDate: string | null } {
  if (freezesAvailable <= 0) {
    return { useFreeze: false, freezeDate: null };
  }

  const today = getLocalDateString();
  const yesterday = new Date(today + 'T00:00:00');
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDate(yesterday);

  const activitySet = new Set(activityDates);

  // Only auto-use freeze if:
  // - Today HAS activity (user returned)
  // - Yesterday has NO activity (missed a day)
  if (activitySet.has(today) && !activitySet.has(yesterdayStr)) {
    return { useFreeze: true, freezeDate: yesterdayStr };
  }

  return { useFreeze: false, freezeDate: null };
}

/**
 * Check if the current activity earns a streak freeze.
 *
 * Freeze earned conditions:
 * - A full practice test was completed, OR
 * - 10+ SRS reviews completed in a single day
 *
 * Max 3 freezes can be banked at a time (enforced by caller).
 */
export function checkFreezeEligibility(
  activityType: 'test' | 'practice' | 'srs_review' | 'study_guide' | 'interview',
  dailyActivityCounts: DailyActivityCounts
): boolean {
  // A completed practice test earns a freeze
  if (activityType === 'practice' && dailyActivityCounts.practiceTestCompleted) {
    return true;
  }

  // 10+ SRS reviews in a day earns a freeze
  if (activityType === 'srs_review' && dailyActivityCounts.srsReviewCount >= 10) {
    return true;
  }

  return false;
}
