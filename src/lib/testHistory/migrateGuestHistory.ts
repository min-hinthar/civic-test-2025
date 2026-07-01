/**
 * Guest -> account history migration.
 *
 * When a guest (no-account) visitor signs in, their locally-stored mock-test
 * history must move into the Supabase account so it isn't orphaned on the
 * device. This runs on every guest -> signed-in promotion (from
 * SupabaseAuthContext.hydrateFromSupabase) and is intentionally idempotent:
 *
 * - Dedupes each guest session against the account's existing history by
 *   content (completed-at instant + score + total), because the schema has no
 *   unique constraint and inserts preserve `completed_at`. Re-running (e.g. on
 *   a token refresh) therefore never double-inserts.
 * - Clears the guest store only once every session has reached the account.
 *   Inserts that fail (offline / backend down) leave the guest store intact for
 *   a later retry, and their sessions are still returned in the merged view so
 *   they stay visible to the user in the meantime.
 */

import { supabase } from '@/lib/supabaseClient';
import { captureError } from '@/lib/sentry';
import { getGuestTestHistory, clearGuestTestHistory } from './guestTestHistory';
import type { TestSession } from '@/types';

/**
 * Stable content identity for a session across the guest-local and account
 * stores. Normalises the timestamp to epoch millis so a format/precision
 * difference between the locally-stored ISO string and the value Supabase
 * returns for `completed_at` can't defeat dedup (which would re-insert dupes).
 */
function sessionKey(session: TestSession): string {
  const instant = new Date(session.date).getTime();
  return `${Number.isNaN(instant) ? session.date : instant}|${session.score}|${session.totalQuestions}`;
}

function byDateDesc(a: TestSession, b: TestSession): number {
  if (a.date === b.date) return 0;
  return a.date < b.date ? 1 : -1;
}

/**
 * Merge test-session lists, dropping content-duplicates (first occurrence wins)
 * and sorting newest-first. Used to fold migrated sessions into the live
 * `user.testHistory` without discarding sessions added meanwhile (e.g. an
 * offline save queued after this hydrate captured its history snapshot).
 */
export function dedupeSessions(sessions: TestSession[]): TestSession[] {
  const seen = new Set<string>();
  const out: TestSession[] = [];
  for (const session of sessions) {
    const key = sessionKey(session);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(session);
  }
  return out.sort(byDateDesc);
}

/** Insert a single guest session into the account; returns the persisted row. */
async function persistSession(userId: string, session: TestSession): Promise<TestSession> {
  const { data, error } = await supabase
    .from('mock_tests')
    .insert({
      user_id: userId,
      // Preserve the original completion time so dedup stays stable across runs.
      completed_at: session.date,
      score: session.score,
      total_questions: session.totalQuestions,
      duration_seconds: session.durationSeconds,
      incorrect_count: session.incorrectCount,
      end_reason: session.endReason,
      passed: session.passed,
    })
    .select(
      'id, completed_at, score, total_questions, duration_seconds, incorrect_count, end_reason, passed'
    )
    .single();

  if (error || !data?.id) {
    throw error ?? new Error('Unable to persist migrated mock test');
  }

  if (session.results.length) {
    const responsesPayload = session.results.map(result => ({
      mock_test_id: data.id,
      question_id: result.questionId,
      question_en: result.questionText_en,
      question_my: result.questionText_my,
      category: result.category,
      selected_answer_en: result.selectedAnswer.text_en,
      selected_answer_my: result.selectedAnswer.text_my,
      correct_answer_en: result.correctAnswer.text_en,
      correct_answer_my: result.correctAnswer.text_my,
      is_correct: result.isCorrect,
    }));
    const { error: responsesError } = await supabase
      .from('mock_test_responses')
      .insert(responsesPayload);
    if (responsesError) throw responsesError;
  }

  return { ...session, id: data.id, date: data.completed_at ?? session.date };
}

/**
 * In-flight migrations keyed by account id. Two hydrates run per app load (the
 * bootstrap getSession call and the INITIAL_SESSION auth event; plus
 * TOKEN_REFRESHED), each calling this. Without a lock they would both read the
 * same non-empty guest store before either clears it and double-insert every
 * session (mock_tests has no unique constraint). Concurrent callers reuse the
 * first migration's promise instead of starting a second insert pass.
 */
const inFlight = new Map<string, Promise<TestSession[]>>();

/**
 * Migrate any locally-stored guest mock-test history into a signed-in account.
 *
 * @param userId - the signed-in account id to migrate into.
 * @param accountHistory - the account's existing history (from hydration).
 * @returns the account history merged with the migrated/pending guest sessions,
 *   newest first. Returns `accountHistory` unchanged (same reference) when there
 *   is nothing to migrate, so callers can cheaply detect a no-op.
 */
export function migrateGuestHistoryToAccount(
  userId: string,
  accountHistory: TestSession[]
): Promise<TestSession[]> {
  const existing = inFlight.get(userId);
  if (existing) return existing;

  const run = runMigration(userId, accountHistory).finally(() => {
    inFlight.delete(userId);
  });
  inFlight.set(userId, run);
  return run;
}

async function runMigration(userId: string, accountHistory: TestSession[]): Promise<TestSession[]> {
  const guest = getGuestTestHistory();
  if (guest.length === 0) return accountHistory;

  const accountKeys = new Set(accountHistory.map(sessionKey));
  const pending = guest.filter(session => !accountKeys.has(sessionKey(session)));

  if (pending.length === 0) {
    // Everything already lives in the account (a prior migration inserted them
    // but didn't get to clear, or they're all dupes). Safe to clear now.
    clearGuestTestHistory();
    return accountHistory;
  }

  const migrated: TestSession[] = [];
  const failed: TestSession[] = [];
  for (const session of pending) {
    try {
      migrated.push(await persistSession(userId, session));
    } catch (error) {
      captureError(error, { operation: 'migrateGuestHistoryToAccount.persist' });
      failed.push(session);
    }
  }

  // Only clear once every pending session reached the account. On partial
  // failure keep the store so the next promotion retries; dedup makes the
  // already-migrated sessions no-ops.
  if (failed.length === 0) clearGuestTestHistory();

  return [...accountHistory, ...migrated, ...failed].sort(byDateDesc);
}
