/**
 * Streak Store - IndexedDB storage for streak data.
 *
 * Uses idb-keyval with a dedicated store for persisting streak data
 * across sessions. Follows the same pattern as src/lib/mastery/masteryStore.ts.
 *
 * Storage key: 'streak' in the 'civic-prep-streaks' database.
 */

import { createStore, get, set } from 'idb-keyval';

import type { DailyActivityCounts } from './streakTracker';
import {
  calculateStreak,
  checkFreezeEligibility,
  getLocalDateString,
  shouldAutoUseFreeze,
} from './streakTracker';

// ---------------------------------------------------------------------------
// Dedicated IndexedDB store for streak data
// ---------------------------------------------------------------------------

const streakDb = createStore('civic-prep-streaks', 'streak-data');

/** Key used to store the streak data object */
const STREAK_KEY = 'streak';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Persistent streak data stored in IndexedDB */
export interface StreakData {
  activityDates: string[];
  freezesAvailable: number;
  freezesUsed: string[];
  longestStreak: number;
  lastSyncedAt: string | null;
  dailyActivityCounts: DailyActivityCounts;
}

/** Default streak data for new users */
const DEFAULT_STREAK_DATA: StreakData = {
  activityDates: [],
  freezesAvailable: 0,
  freezesUsed: [],
  longestStreak: 0,
  lastSyncedAt: null,
  dailyActivityCounts: {
    srsReviewCount: 0,
    practiceTestCompleted: false,
  },
};

// ---------------------------------------------------------------------------
// Read operations
// ---------------------------------------------------------------------------

/**
 * Get the current streak data from IndexedDB.
 * Returns default values if no data exists.
 */
export async function getStreakData(): Promise<StreakData> {
  return (await get<StreakData>(STREAK_KEY, streakDb)) ?? { ...DEFAULT_STREAK_DATA };
}

// ---------------------------------------------------------------------------
// Write operations
// ---------------------------------------------------------------------------

/**
 * Record a study activity and update streak data.
 *
 * This is the main entry point called whenever a user completes an activity
 * (test, practice, SRS review, study guide visit, or interview).
 *
 * Returns status flags for UI notifications:
 * - streakUpdated: true if today was newly added to activity dates
 * - freezeEarned: true if the activity earned a streak freeze
 * - freezeAutoUsed: true if a freeze was auto-consumed for yesterday
 */
export async function recordStudyActivity(
  activityType: 'test' | 'practice' | 'srs_review' | 'study_guide' | 'interview',
  meta?: { isPracticeTest?: boolean }
): Promise<{ streakUpdated: boolean; freezeEarned: boolean; freezeAutoUsed: boolean }> {
  const data = await getStreakData();
  const today = getLocalDateString();

  let streakUpdated = false;
  let freezeEarned = false;
  let freezeAutoUsed = false;

  // Reset daily activity counts if it's a new day
  const lastActivityDate =
    data.activityDates.length > 0
      ? data.activityDates[data.activityDates.length - 1]
      : null;

  if (lastActivityDate !== today) {
    data.dailyActivityCounts = {
      srsReviewCount: 0,
      practiceTestCompleted: false,
    };
  }

  // Update daily activity counts based on activity type
  if (activityType === 'srs_review') {
    data.dailyActivityCounts.srsReviewCount++;
  }
  if (activityType === 'practice' && meta?.isPracticeTest) {
    data.dailyActivityCounts.practiceTestCompleted = true;
  }

  // Record today's activity date (deduplicate)
  if (!data.activityDates.includes(today)) {
    data.activityDates.push(today);
    streakUpdated = true;
  }

  // Check freeze auto-use (if yesterday was missed and user returned today)
  const freezeCheck = shouldAutoUseFreeze(data.activityDates, data.freezesAvailable);
  if (freezeCheck.useFreeze && freezeCheck.freezeDate) {
    // Make sure we haven't already used a freeze for this date
    if (!data.freezesUsed.includes(freezeCheck.freezeDate)) {
      data.freezesUsed.push(freezeCheck.freezeDate);
      data.freezesAvailable--;
      freezeAutoUsed = true;
    }
  }

  // Check if this activity earns a freeze
  if (checkFreezeEligibility(activityType, data.dailyActivityCounts)) {
    if (data.freezesAvailable < 3) {
      data.freezesAvailable++;
      freezeEarned = true;
    }
  }

  // Recalculate streaks
  const { longest } = calculateStreak(data.activityDates, data.freezesUsed);
  data.longestStreak = longest;

  // Persist to IndexedDB
  await set(STREAK_KEY, data, streakDb);

  return { streakUpdated, freezeEarned, freezeAutoUsed };
}

/**
 * Manually earn a streak freeze.
 *
 * Increments freezesAvailable (capped at 3).
 * Returns false if already at max freezes.
 */
export async function earnFreeze(): Promise<boolean> {
  const data = await getStreakData();

  if (data.freezesAvailable >= 3) {
    return false;
  }

  data.freezesAvailable++;
  await set(STREAK_KEY, data, streakDb);
  return true;
}
