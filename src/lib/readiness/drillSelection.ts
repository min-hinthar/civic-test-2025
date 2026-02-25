/**
 * Drill Question Selection
 *
 * Selects the weakest questions for focused drill sessions.
 * Uses per-question accuracy from answer history to prioritize
 * questions the user struggles with most.
 *
 * Two modes (determined by the caller's pool):
 * - Weak-all mode: caller passes allQuestions as pool
 * - Category-specific mode: caller passes pre-filtered category questions
 */

import { calculateQuestionAccuracy } from '@/lib/mastery';
import { fisherYatesShuffle } from '@/lib/shuffle';
import type { Question } from '@/types';
import type { StoredAnswer } from '@/lib/mastery/masteryStore';

/**
 * Select drill questions prioritizing weakest accuracy.
 *
 * Algorithm:
 * 1. Score each question by accuracy (via calculateQuestionAccuracy)
 * 2. Sort by accuracy ascending (weakest first)
 * 3. Take up to `count` questions from the weakest
 * 4. If fewer questions exist than count, return all available
 * 5. Shuffle result with Fisher-Yates for randomized drill order
 *
 * @param pool - Questions to select from (pre-filtered for category mode)
 * @param count - Number of questions to select
 * @param answerHistory - Full answer history for accuracy calculation
 * @returns Selected questions, shuffled
 */
export function selectDrillQuestions(
  pool: Question[],
  count: number,
  answerHistory: StoredAnswer[]
): Question[] {
  if (pool.length === 0) return [];

  // Score each question by accuracy
  const scored = pool.map(q => {
    const { accuracy } = calculateQuestionAccuracy(answerHistory, q.id);
    return { question: q, accuracy };
  });

  // Sort by accuracy ascending (weakest first, unanswered = 0 accuracy)
  scored.sort((a, b) => a.accuracy - b.accuracy);

  // Take up to count weakest questions
  const actualCount = Math.min(count, scored.length);
  const selected = scored.slice(0, actualCount).map(s => s.question);

  // Shuffle for randomized drill order
  return fisherYatesShuffle(selected);
}
