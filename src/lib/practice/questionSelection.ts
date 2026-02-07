/**
 * Smart Question Selection for Practice Mode
 *
 * Selects questions using a 70/30 weak/strong mix to focus practice
 * on areas the user struggles with while maintaining breadth.
 *
 * Weakness is determined by per-question accuracy from answer history.
 * Unanswered questions are treated as "weak" (accuracy = 0).
 */

import { getAnswerHistory, calculateQuestionAccuracy } from '@/lib/mastery';
import { fisherYatesShuffle } from '@/lib/shuffle';
import type { Question } from '@/types';
import type { StoredAnswer } from '@/lib/mastery';

export interface SelectPracticeQuestionsOptions {
  /** Pool of questions to select from */
  questions: Question[];
  /** Number of questions to select */
  count: number;
  /** Ratio of weak questions (0-1), default 0.7 */
  weakRatio?: number;
}

/**
 * Select practice questions with a weighted weak/strong mix.
 *
 * Algorithm:
 * 1. Load answer history from IndexedDB
 * 2. Calculate per-question accuracy (correct/total)
 * 3. Sort by accuracy (weakest first)
 * 4. Select ceil(count * weakRatio) from weakest
 * 5. Select remaining from strongest (shuffled)
 * 6. Shuffle final selection with Fisher-Yates
 *
 * Unanswered questions have accuracy = 0 and are treated as weak.
 */
export async function selectPracticeQuestions({
  questions,
  count,
  weakRatio = 0.7,
}: SelectPracticeQuestionsOptions): Promise<Question[]> {
  if (questions.length === 0) return [];

  const actualCount = Math.min(count, questions.length);
  const history = await getAnswerHistory();

  // Calculate accuracy for each question
  const scored = questions.map(q => {
    const { accuracy } = calculateQuestionAccuracy(history, q.id);
    return { question: q, accuracy };
  });

  // Sort by accuracy ascending (weakest first)
  scored.sort((a, b) => a.accuracy - b.accuracy);

  // Split into weak and strong pools
  const weakCount = Math.ceil(actualCount * weakRatio);
  const strongCount = actualCount - weakCount;

  // Take weakest questions
  const weakQuestions = scored.slice(0, weakCount).map(s => s.question);

  // Take from strong pool (remaining questions, shuffled)
  const strongPool = scored.slice(weakCount);
  const shuffledStrong = fisherYatesShuffle(strongPool);
  const strongQuestions = shuffledStrong.slice(0, strongCount).map(s => s.question);

  // Combine and shuffle final selection
  return fisherYatesShuffle([...weakQuestions, ...strongQuestions]);
}

/** Accuracy threshold below which a question is considered "weak" */
const WEAK_THRESHOLD = 0.6;

/**
 * Get all weak questions from a pool.
 *
 * Used for "Practice All Weak Areas" mode.
 * Returns questions with accuracy below threshold, plus unanswered questions.
 *
 * @param questions - Pool of questions to filter
 * @param threshold - Accuracy threshold (0-100), default 60
 * @returns Array of weak questions, shuffled
 */
export async function getWeakQuestions(
  questions: Question[],
  threshold: number = WEAK_THRESHOLD * 100
): Promise<Question[]> {
  const history = await getAnswerHistory();

  const weak = questions.filter(q => {
    const { accuracy } = calculateQuestionAccuracy(history, q.id);
    // accuracy is 0-100 from calculateQuestionAccuracy, unanswered returns 0
    return accuracy < threshold;
  });

  return fisherYatesShuffle(weak);
}

/**
 * Compute per-question accuracy scores for display purposes.
 * Returns a map of questionId -> accuracy percentage (0-100).
 */
export async function getQuestionAccuracies(
  questions: Question[]
): Promise<Map<string, number>> {
  const history = await getAnswerHistory();
  const map = new Map<string, number>();

  for (const q of questions) {
    const { accuracy } = calculateQuestionAccuracy(history, q.id);
    map.set(q.id, accuracy);
  }

  return map;
}
