/**
 * Interview Store - IndexedDB storage for interview session history.
 *
 * Uses idb-keyval with a dedicated store for persisting interview sessions
 * across sessions. Follows the same pattern as src/lib/mastery/masteryStore.ts.
 *
 * Storage key: 'interview-sessions' in the 'civic-prep-interview' database.
 */

import { createStore, get, set } from 'idb-keyval';

import type { InterviewSession } from '@/types';
import { recordStudyActivity } from '@/lib/social';

// ---------------------------------------------------------------------------
// Dedicated IndexedDB store for interview data
// ---------------------------------------------------------------------------

const interviewDb = createStore('civic-prep-interview', 'sessions');

/** Key used to store the interview sessions array */
const SESSIONS_KEY = 'interview-sessions';

/**
 * Get the full interview history, newest first.
 * Returns an empty array if no history exists.
 */
export async function getInterviewHistory(): Promise<InterviewSession[]> {
  return (await get<InterviewSession[]>(SESSIONS_KEY, interviewDb)) ?? [];
}

/**
 * Save a new interview session to history.
 * Prepends to the front of the array (newest first).
 */
export async function saveInterviewSession(
  session: InterviewSession
): Promise<void> {
  const history = await getInterviewHistory();
  history.unshift(session);
  await set(SESSIONS_KEY, history, interviewDb);

  // Fire-and-forget: record interview activity for streak tracking
  recordStudyActivity('interview').catch(() => {
    // Streak recording is non-critical
  });
}

/**
 * Clear all interview history.
 * Used for testing and user-initiated data reset.
 */
export async function clearInterviewHistory(): Promise<void> {
  await set(SESSIONS_KEY, [], interviewDb);
}
