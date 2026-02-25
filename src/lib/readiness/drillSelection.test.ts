/**
 * Drill Selection Tests
 *
 * Tests the drill question selection algorithm that picks
 * the weakest questions for focused practice.
 */

import { describe, it, expect } from 'vitest';
import { selectDrillQuestions } from './drillSelection';
import type { Question, Category } from '@/types';
import type { StoredAnswer } from '@/lib/mastery/masteryStore';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

/** Create a minimal question with given ID and category */
function makeQuestion(
  id: string,
  category: Category = 'Principles of American Democracy'
): Question {
  return {
    id,
    question_en: `Question ${id}`,
    question_my: `Question ${id} (my)`,
    category,
    studyAnswers: [{ text_en: 'Answer', text_my: 'Answer (my)' }],
    answers: [
      { text_en: 'Correct', text_my: 'Correct (my)', correct: true },
      { text_en: 'Wrong', text_my: 'Wrong (my)', correct: false },
    ],
  };
}

/** Create answer history entries for a question */
function makeHistory(questionId: string, correct: number, incorrect: number): StoredAnswer[] {
  const answers: StoredAnswer[] = [];
  for (let i = 0; i < correct; i++) {
    answers.push({
      questionId,
      isCorrect: true,
      timestamp: Date.now() - i * 1000,
      sessionType: 'practice',
    });
  }
  for (let i = 0; i < incorrect; i++) {
    answers.push({
      questionId,
      isCorrect: false,
      timestamp: Date.now() - (correct + i) * 1000,
      sessionType: 'practice',
    });
  }
  return answers;
}

// ---------------------------------------------------------------------------
// selectDrillQuestions tests
// ---------------------------------------------------------------------------

describe('selectDrillQuestions', () => {
  it('returns empty array for empty pool', () => {
    const result = selectDrillQuestions([], 10, []);
    expect(result).toEqual([]);
  });

  it('returns all questions (shuffled) when pool is smaller than count', () => {
    const pool = [makeQuestion('q-1'), makeQuestion('q-2'), makeQuestion('q-3')];
    const result = selectDrillQuestions(pool, 10, []);

    expect(result).toHaveLength(3);
    // All original IDs are present
    const ids = result.map(q => q.id).sort();
    expect(ids).toEqual(['q-1', 'q-2', 'q-3']);
  });

  it('returns exactly count questions when pool is larger than count', () => {
    const pool = Array.from({ length: 20 }, (_, i) => makeQuestion(`q-${i + 1}`));
    const result = selectDrillQuestions(pool, 5, []);

    expect(result).toHaveLength(5);
  });

  it('treats questions with no history as weak (accuracy 0)', () => {
    const pool = [makeQuestion('q-new-1'), makeQuestion('q-new-2'), makeQuestion('q-strong')];

    // Only q-strong has history (100% accuracy)
    const history = makeHistory('q-strong', 10, 0);

    const result = selectDrillQuestions(pool, 2, history);

    expect(result).toHaveLength(2);
    // New questions should be selected over the strong one
    const ids = result.map(q => q.id).sort();
    expect(ids).toContain('q-new-1');
    expect(ids).toContain('q-new-2');
    expect(ids).not.toContain('q-strong');
  });

  it('selects low-accuracy questions over high-accuracy ones', () => {
    const pool = [makeQuestion('q-weak'), makeQuestion('q-medium'), makeQuestion('q-strong')];

    const history = [
      ...makeHistory('q-weak', 1, 9), // 10% accuracy
      ...makeHistory('q-medium', 5, 5), // 50% accuracy
      ...makeHistory('q-strong', 9, 1), // 90% accuracy
    ];

    const result = selectDrillQuestions(pool, 2, history);

    expect(result).toHaveLength(2);
    const ids = result.map(q => q.id).sort();
    expect(ids).toContain('q-weak');
    expect(ids).toContain('q-medium');
    expect(ids).not.toContain('q-strong');
  });
});
