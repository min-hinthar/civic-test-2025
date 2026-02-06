/**
 * Sync Queue Module
 *
 * Handles syncing offline test results to Supabase with exponential backoff retry.
 * Auto-retries failed syncs up to MAX_RETRIES times with increasing delays.
 */

import {
  getPendingResults,
  removeSyncedResult,
  getPendingSyncCount,
  type PendingTestResult,
} from './offlineDb';
import { supabase } from '@/lib/supabaseClient';

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000;

/**
 * Progress callback type for tracking sync status
 */
export interface SyncProgress {
  current: number;
  total: number;
  status: 'syncing' | 'success' | 'error';
}

/**
 * Result type for sync operations
 */
export interface SyncResult {
  synced: number;
  failed: number;
}

/**
 * Sync a single test result to Supabase with exponential backoff retry
 * @param key - IndexedDB key for the pending result
 * @param data - Test result data to sync
 * @returns Promise<boolean> - True if sync succeeded
 */
async function syncSingleResult(key: string, data: PendingTestResult): Promise<boolean> {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      // Insert mock test record
      const { data: testData, error: testError } = await supabase
        .from('mock_tests')
        .insert({
          user_id: data.userId,
          score: data.score,
          total_questions: data.totalQuestions,
          duration_seconds: data.durationSeconds,
          passed: data.passed,
          end_reason: data.endReason,
          created_at: data.createdAt,
        })
        .select('id')
        .single();

      if (testError) throw testError;

      // Insert test responses if any
      if (data.responses.length > 0 && testData) {
        const responsesToInsert = data.responses.map(r => ({
          mock_test_id: testData.id,
          question_id: r.questionId,
          selected_answer: r.selectedAnswer,
          is_correct: r.correct,
          time_spent_seconds: r.timeSpentSeconds,
        }));

        const { error: responseError } = await supabase
          .from('mock_test_responses')
          .insert(responsesToInsert);

        if (responseError) throw responseError;
      }

      // Remove from queue after successful sync
      await removeSyncedResult(key);
      return true;
    } catch (error) {
      retries++;
      if (retries < MAX_RETRIES) {
        // Exponential backoff: 2s, 4s, 8s, 16s
        const delay = BASE_DELAY_MS * Math.pow(2, retries);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error(
          `[syncQueue] Failed to sync result ${key} after ${MAX_RETRIES} retries:`,
          error
        );
      }
    }
  }

  return false;
}

/**
 * Sync all pending results to Supabase
 * @param onProgress - Optional callback for progress updates
 * @returns Promise<SyncResult> - Counts of synced and failed items
 */
export async function syncAllPendingResults(
  onProgress?: (progress: SyncProgress) => void
): Promise<SyncResult> {
  const pending = await getPendingResults();

  if (pending.length === 0) {
    return { synced: 0, failed: 0 };
  }

  let synced = 0;
  let failed = 0;

  onProgress?.({ current: 0, total: pending.length, status: 'syncing' });

  for (let i = 0; i < pending.length; i++) {
    const { key, data } = pending[i];
    const success = await syncSingleResult(key, data);

    if (success) {
      synced++;
    } else {
      failed++;
    }

    onProgress?.({
      current: i + 1,
      total: pending.length,
      status: 'syncing',
    });
  }

  onProgress?.({
    current: pending.length,
    total: pending.length,
    status: failed > 0 ? 'error' : 'success',
  });

  return { synced, failed };
}

// Re-export for convenience
export { getPendingSyncCount };
