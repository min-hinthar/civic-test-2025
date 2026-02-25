/**
 * Readiness Engine Tests
 *
 * Tests the readiness scoring formula, 60% cap logic,
 * dimension calculations, and tier labels.
 */

import { describe, it, expect } from 'vitest';
import { State, type Card } from 'ts-fsrs';
import { calculateReadiness, getTierLabel } from './readinessEngine';
import type { ReadinessInput } from './types';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

/** Create a minimal FSRS card with specified reps and stability */
function makeCard(overrides: Partial<Card> = {}): Card {
  return {
    due: new Date(),
    stability: 5,
    difficulty: 5,
    elapsed_days: 0,
    scheduled_days: 1,
    learning_steps: 0,
    reps: 1,
    lapses: 0,
    state: State.Review,
    last_review: new Date(),
    ...overrides,
  };
}

/**
 * Build a categoryQuestionMap for 3 main USCIS categories.
 * Each category gets a range of question IDs (e.g., q-1..q-50 for Gov, etc.)
 */
function makeCategoryQuestionMap(): Record<string, string[]> {
  return {
    'American Government': Array.from({ length: 57 }, (_, i) => `q-${i + 1}`),
    'American History': Array.from({ length: 41 }, (_, i) => `q-${58 + i}`),
    'Integrated Civics': Array.from({ length: 30 }, (_, i) => `q-${99 + i}`),
  };
}

/** Build a default empty ReadinessInput */
function makeInput(overrides: Partial<ReadinessInput> = {}): ReadinessInput {
  return {
    categoryMasteries: {},
    totalQuestions: 128,
    attemptedQuestionIds: new Set(),
    srsCards: [],
    categoryQuestionMap: makeCategoryQuestionMap(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// calculateReadiness tests
// ---------------------------------------------------------------------------

describe('calculateReadiness', () => {
  it('returns score 0 for empty input (no answers, no SRS cards)', () => {
    const result = calculateReadiness(makeInput());

    expect(result.score).toBe(0);
    expect(result.uncapped).toBe(0);
    expect(result.dimensions.accuracy.value).toBe(0);
    expect(result.dimensions.coverage.value).toBe(0);
    expect(result.dimensions.consistency.value).toBe(0);
  });

  it('returns near-100 score for full coverage, 100% accuracy, high consistency', () => {
    // All 128 questions attempted
    const allIds = new Set(Array.from({ length: 128 }, (_, i) => `q-${i + 1}`));

    // 100% mastery across sub-categories (weighted avg = 100)
    const categoryMasteries: Record<string, number> = {
      'Principles of American Democracy': 100,
      'System of Government': 100,
      'Rights and Responsibilities': 100,
      'American History: Colonial Period and Independence': 100,
      'American History: 1800s': 100,
      'Recent American History and Other Important Historical Information': 100,
      'Civics: Symbols and Holidays': 100,
    };

    // SRS cards with high stability (high retrievability)
    const srsCards = Array.from({ length: 128 }, (_, i) => ({
      questionId: `q-${i + 1}`,
      card: makeCard({ stability: 100, reps: 5 }),
    }));

    const result = calculateReadiness(
      makeInput({
        categoryMasteries,
        attemptedQuestionIds: allIds,
        srsCards,
      })
    );

    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.isCapped).toBe(false);
    expect(result.cappedCategories).toEqual([]);
  });

  it('returns mid-range score for partial coverage and mixed accuracy', () => {
    // 64 of 128 questions attempted (50% coverage)
    const halfIds = new Set(Array.from({ length: 64 }, (_, i) => `q-${i + 1}`));

    const categoryMasteries: Record<string, number> = {
      'Principles of American Democracy': 60,
      'System of Government': 50,
      'Rights and Responsibilities': 40,
      'American History: Colonial Period and Independence': 70,
      'American History: 1800s': 30,
      'Recent American History and Other Important Historical Information': 50,
      'Civics: Symbols and Holidays': 55,
    };

    const result = calculateReadiness(
      makeInput({
        categoryMasteries,
        attemptedQuestionIds: halfIds,
      })
    );

    expect(result.score).toBeGreaterThanOrEqual(20);
    expect(result.score).toBeLessThanOrEqual(70);
  });

  it('caps score at 60 when one main USCIS category has zero coverage', () => {
    // Only attempt American Government questions (q-1..q-57), skip History & Civics
    const govOnlyIds = new Set(Array.from({ length: 57 }, (_, i) => `q-${i + 1}`));

    const categoryMasteries: Record<string, number> = {
      'Principles of American Democracy': 90,
      'System of Government': 85,
      'Rights and Responsibilities': 80,
    };

    const srsCards = Array.from({ length: 57 }, (_, i) => ({
      questionId: `q-${i + 1}`,
      card: makeCard({ stability: 50, reps: 3 }),
    }));

    const result = calculateReadiness(
      makeInput({
        categoryMasteries,
        attemptedQuestionIds: govOnlyIds,
        srsCards,
      })
    );

    expect(result.isCapped).toBe(true);
    expect(result.score).toBeLessThanOrEqual(60);
    expect(result.cappedCategories).toContain('American History');
    expect(result.cappedCategories).toContain('Integrated Civics');
    expect(result.uncapped).toBeGreaterThan(result.score);
  });

  it('caps score at 60 when all categories have zero coverage', () => {
    // No questions attempted at all, but somehow mastery exists
    const result = calculateReadiness(
      makeInput({
        categoryMasteries: {
          'Principles of American Democracy': 50,
        },
      })
    );

    expect(result.isCapped).toBe(true);
    expect(result.score).toBeLessThanOrEqual(60);
    expect(result.cappedCategories.length).toBe(3);
  });

  it('returns consistency 0 when all SRS cards have reps=0 (new cards)', () => {
    const newCards = Array.from({ length: 10 }, (_, i) => ({
      questionId: `q-${i + 1}`,
      card: makeCard({ reps: 0, state: State.New }),
    }));

    const result = calculateReadiness(
      makeInput({
        srsCards: newCards,
      })
    );

    expect(result.dimensions.consistency.value).toBe(0);
  });

  it('handles division safety: totalQuestions=0 returns coverage 0 (not NaN)', () => {
    const result = calculateReadiness(
      makeInput({
        totalQuestions: 0,
        attemptedQuestionIds: new Set(['q-1']),
      })
    );

    expect(result.dimensions.coverage.value).toBe(0);
    expect(Number.isNaN(result.score)).toBe(false);
  });

  it('dimensions have correct weights (accuracy=0.4, coverage=0.3, consistency=0.3)', () => {
    const result = calculateReadiness(makeInput());

    expect(result.dimensions.accuracy.weight).toBe(0.4);
    expect(result.dimensions.coverage.weight).toBe(0.3);
    expect(result.dimensions.consistency.weight).toBe(0.3);
  });

  it('computes accuracy as weighted average of per-category mastery', () => {
    // Only set one sub-category with 80% mastery, rest 0
    const result = calculateReadiness(
      makeInput({
        categoryMasteries: {
          'Principles of American Democracy': 80,
        },
      })
    );

    // Accuracy should be > 0 but < 80 (weighted by question count)
    expect(result.dimensions.accuracy.value).toBeGreaterThan(0);
    expect(result.dimensions.accuracy.value).toBeLessThan(80);
  });
});

// ---------------------------------------------------------------------------
// getTierLabel tests
// ---------------------------------------------------------------------------

describe('getTierLabel', () => {
  it('returns "Getting Started" for score 0', () => {
    const tier = getTierLabel(0);
    expect(tier.en).toBe('Getting Started');
    expect(tier.my).toBeTruthy();
  });

  it('returns "Getting Started" for score 25', () => {
    const tier = getTierLabel(25);
    expect(tier.en).toBe('Getting Started');
  });

  it('returns "Building Up" for score 26', () => {
    const tier = getTierLabel(26);
    expect(tier.en).toBe('Building Up');
  });

  it('returns "Building Up" for score 50', () => {
    const tier = getTierLabel(50);
    expect(tier.en).toBe('Building Up');
  });

  it('returns "Almost Ready" for score 51', () => {
    const tier = getTierLabel(51);
    expect(tier.en).toBe('Almost Ready');
  });

  it('returns "Almost Ready" for score 75', () => {
    const tier = getTierLabel(75);
    expect(tier.en).toBe('Almost Ready');
  });

  it('returns "Test Ready" for score 76', () => {
    const tier = getTierLabel(76);
    expect(tier.en).toBe('Test Ready');
  });

  it('returns "Test Ready" for score 100', () => {
    const tier = getTierLabel(100);
    expect(tier.en).toBe('Test Ready');
  });
});
