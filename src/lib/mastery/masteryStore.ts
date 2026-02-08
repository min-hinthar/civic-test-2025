/**
 * Mastery Store - IndexedDB storage for answer history.
 *
 * Uses idb-keyval with a dedicated store for persisting answer history
 * across sessions. This is the persistence layer for the mastery system.
 *
 * Storage key: 'answer-history' in the 'civic-prep-mastery' database.
 * All answers are stored as a single array for simplicity and
 * efficient retrieval (typical size: hundreds, not thousands).
 */

import { createStore, get, set } from 'idb-keyval';

import { recordStudyActivity } from '@/lib/social';

/** A single stored answer record */
export interface StoredAnswer {
  questionId: string;
  isCorrect: boolean;
  timestamp: number;
  sessionType: 'test' | 'practice';
}

/** IndexedDB store dedicated to mastery data */
const masteryDb = createStore('civic-prep-mastery', 'answer-history');

/** Key used to store the answer history array */
const HISTORY_KEY = 'answers';

/**
 * Record a new answer to the history.
 * Automatically adds a timestamp at the time of recording.
 */
export async function recordAnswer(
  answer: Omit<StoredAnswer, 'timestamp'>
): Promise<void> {
  const history = (await get<StoredAnswer[]>(HISTORY_KEY, masteryDb)) ?? [];
  const storedAnswer: StoredAnswer = {
    ...answer,
    timestamp: Date.now(),
  };
  history.push(storedAnswer);
  await set(HISTORY_KEY, history, masteryDb);

  // Fire-and-forget: record activity for streak tracking.
  // streakStore handles per-day deduplication internally.
  const activityType = answer.sessionType === 'test' ? 'test' : 'practice';
  recordStudyActivity(activityType).catch(() => {
    // Streak recording is non-critical
  });
}

/**
 * Get the full answer history.
 * Returns an empty array if no history exists.
 */
export async function getAnswerHistory(): Promise<StoredAnswer[]> {
  return (await get<StoredAnswer[]>(HISTORY_KEY, masteryDb)) ?? [];
}

/**
 * Get answer history for a specific question.
 * Filters the full history by questionId.
 */
export async function getQuestionHistory(
  questionId: string
): Promise<StoredAnswer[]> {
  const history = await getAnswerHistory();
  return history.filter(a => a.questionId === questionId);
}

/**
 * Clear all answer history.
 * Used for testing and user-initiated data reset.
 */
export async function clearAnswerHistory(): Promise<void> {
  await set(HISTORY_KEY, [], masteryDb);
}
