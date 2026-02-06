/**
 * IndexedDB Wrapper for Offline Data Storage
 *
 * Uses idb-keyval for lightweight IndexedDB operations.
 * Stores questions and sync queue in separate stores.
 *
 * Stores:
 * - civic-prep-questions: Cached questions for offline study
 * - civic-prep-sync: Pending test results for background sync
 */

import { createStore, get, set, del, keys, clear } from 'idb-keyval';
import type { Question } from '@/types';

// Create separate stores for different data types
export const questionsStore = createStore('civic-prep-questions', 'questions');
export const syncQueueStore = createStore('civic-prep-sync', 'pending-results');

// Key used to store the questions array
const QUESTIONS_KEY = 'all-questions';

// Key used to store cache metadata
const CACHE_META_KEY = 'cache-meta';

interface CacheMeta {
  cachedAt: string;
  count: number;
  version: number;
}

/**
 * Cache all questions to IndexedDB
 * @param questions - Array of Question objects to cache
 * @returns Promise<void>
 */
export async function cacheQuestions(questions: Question[]): Promise<void> {
  await set(QUESTIONS_KEY, questions, questionsStore);

  const meta: CacheMeta = {
    cachedAt: new Date().toISOString(),
    count: questions.length,
    version: 1,
  };
  await set(CACHE_META_KEY, meta, questionsStore);
}

/**
 * Retrieve cached questions from IndexedDB
 * @returns Promise<Question[] | undefined> - Cached questions or undefined if not cached
 */
export async function getCachedQuestions(): Promise<Question[] | undefined> {
  return get<Question[]>(QUESTIONS_KEY, questionsStore);
}

/**
 * Check if questions are cached in IndexedDB
 * @returns Promise<boolean> - True if cache exists
 */
export async function hasQuestionsCache(): Promise<boolean> {
  const questions = await get<Question[]>(QUESTIONS_KEY, questionsStore);
  return questions !== undefined && questions.length > 0;
}

/**
 * Get cache metadata (when cached, count, version)
 * @returns Promise<CacheMeta | undefined>
 */
export async function getCacheMeta(): Promise<CacheMeta | undefined> {
  return get<CacheMeta>(CACHE_META_KEY, questionsStore);
}

/**
 * Clear the questions cache
 * @returns Promise<void>
 */
export async function clearQuestionsCache(): Promise<void> {
  await del(QUESTIONS_KEY, questionsStore);
  await del(CACHE_META_KEY, questionsStore);
}

// ============================================
// Sync Queue Operations
// ============================================

/**
 * Interface for test results pending sync to server
 */
export interface PendingTestResult {
  id: string;
  userId: string;
  score: number;
  totalQuestions: number;
  durationSeconds: number;
  passed: boolean;
  endReason: string;
  createdAt: string;
  responses: Array<{
    questionId: string;
    selectedAnswer: string;
    correct: boolean;
    timeSpentSeconds: number;
  }>;
}

/**
 * Queue a test result for later sync to server
 * @param result - Test result data to queue
 * @returns Promise<string> - The ID assigned to the queued item
 */
export async function queueTestResult(result: Omit<PendingTestResult, 'id'>): Promise<string> {
  const id = `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const pendingResult: PendingTestResult = { ...result, id };
  await set(id, pendingResult, syncQueueStore);
  return id;
}

/**
 * Get all pending results awaiting sync
 * @returns Promise<Array<{ key: string; data: PendingTestResult }>>
 */
export async function getPendingResults(): Promise<
  Array<{ key: string; data: PendingTestResult }>
> {
  const allKeys = await keys(syncQueueStore);
  const results: Array<{ key: string; data: PendingTestResult }> = [];
  for (const key of allKeys) {
    const result = await get<PendingTestResult>(key, syncQueueStore);
    if (result) {
      results.push({ key: String(key), data: result });
    }
  }
  return results;
}

/**
 * Remove a result after successful sync
 * @param id - The ID of the queued item to remove
 */
export async function removeSyncedResult(id: string): Promise<void> {
  await del(id, syncQueueStore);
}

/**
 * Count pending items for badge display
 * @returns Promise<number> - Count of pending items
 */
export async function getPendingSyncCount(): Promise<number> {
  const allKeys = await keys(syncQueueStore);
  return allKeys.length;
}

// Re-export idb-keyval functions for potential use
export { get, set, del, keys, clear };
