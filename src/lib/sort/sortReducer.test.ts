import { describe, expect, it, vi, beforeEach } from 'vitest';

import type { Question } from '@/types';

import { initialSortState, sortReducer } from './sortReducer';
import type { SortConfig, SortState } from './sortTypes';
import { MAX_ROUNDS } from './sortTypes';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Generate n mock Question objects with sequential IDs ('q1', 'q2', ...).
 * Includes only the minimum fields required by the sort reducer.
 */
function makeTestCards(n: number): Question[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `q${i + 1}`,
    question_en: `Question ${i + 1}`,
    question_my: `\u1019\u1031\u1038\u1001\u103D\u1014\u103A\u1038 ${i + 1}`,
    category: 'Principles of American Democracy' as const,
    answers: [
      { text_en: 'Answer A', text_my: 'A', correct: true },
      { text_en: 'Answer B', text_my: 'B', correct: false },
    ],
    studyAnswers: [{ text_en: 'Study answer', text_my: 'Study' }],
  }));
}

function makeConfig(n: number, categoryFilter?: string): SortConfig {
  return { cards: makeTestCards(n), categoryFilter };
}

/**
 * Create a state where all cards have been sorted (some known, some unknown)
 * and the last card triggers an ANIMATION_COMPLETE at the final index.
 */
function sortAllCards(state: SortState, knownCount: number): SortState {
  let s = state;
  for (let i = 0; i < s.cards.length; i++) {
    const direction = i < knownCount ? 'know' : 'dont-know';
    s = sortReducer(s, { type: 'SORT_CARD', payload: { direction } });
    s = sortReducer(s, { type: 'ANIMATION_COMPLETE' });
  }
  return s;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('sortReducer', () => {
  let config: SortConfig;

  beforeEach(() => {
    config = makeConfig(10);
  });

  // =========================================================================
  // initialSortState
  // =========================================================================

  describe('initialSortState', () => {
    it('creates state with phase "sorting" and round 1', () => {
      const state = initialSortState(config);
      expect(state.phase).toBe('sorting');
      expect(state.round).toBe(1);
    });

    it('shuffles cards (order differs from input for large sets)', () => {
      // With 10+ cards, the chance of identical order is ~1/3628800
      const state = initialSortState(config);
      const inputIds = config.cards.map(c => c.id);
      const stateIds = state.cards.map(c => c.id);
      // All same cards are present
      expect(stateIds.sort()).toEqual(inputIds.sort());
      // Length preserved
      expect(state.cards).toHaveLength(config.cards.length);
    });

    it('preserves sourceCards as original unshuffled reference', () => {
      const state = initialSortState(config);
      expect(state.sourceCards).toBe(config.cards);
    });

    it('sets empty Sets for knownIds, unknownIds, allUnknownIds', () => {
      const state = initialSortState(config);
      expect(state.knownIds).toBeInstanceOf(Set);
      expect(state.unknownIds).toBeInstanceOf(Set);
      expect(state.allUnknownIds).toBeInstanceOf(Set);
      expect(state.knownIds.size).toBe(0);
      expect(state.unknownIds.size).toBe(0);
      expect(state.allUnknownIds.size).toBe(0);
    });

    it('records startTime close to Date.now()', () => {
      const before = Date.now();
      const state = initialSortState(config);
      const after = Date.now();
      expect(state.startTime).toBeGreaterThanOrEqual(before);
      expect(state.startTime).toBeLessThanOrEqual(after);
    });

    it('stores categoryFilter from config', () => {
      const withFilter = makeConfig(5, 'System of Government');
      const state = initialSortState(withFilter);
      expect(state.categoryFilter).toBe('System of Government');
    });

    it('sets currentIndex to 0 and empty undoStack/roundHistory', () => {
      const state = initialSortState(config);
      expect(state.currentIndex).toBe(0);
      expect(state.undoStack).toEqual([]);
      expect(state.roundHistory).toEqual([]);
    });
  });

  // =========================================================================
  // START_SORT
  // =========================================================================

  describe('START_SORT', () => {
    it('creates fresh state from any existing state', () => {
      const oldState = initialSortState(config);
      // Mutate state to simulate mid-session
      const midSession: SortState = {
        ...oldState,
        phase: 'round-summary',
        round: 3,
        currentIndex: 5,
      };

      const newConfig = makeConfig(8);
      const freshState = sortReducer(midSession, {
        type: 'START_SORT',
        payload: newConfig,
      });

      expect(freshState.phase).toBe('sorting');
      expect(freshState.round).toBe(1);
      expect(freshState.currentIndex).toBe(0);
      expect(freshState.cards).toHaveLength(8);
    });

    it('resets all counters and Sets', () => {
      const state = initialSortState(config);
      // Sort a card then start fresh
      const sorted = sortReducer(state, {
        type: 'SORT_CARD',
        payload: { direction: 'know' },
      });

      const freshState = sortReducer(sorted, {
        type: 'START_SORT',
        payload: config,
      });

      expect(freshState.knownIds.size).toBe(0);
      expect(freshState.unknownIds.size).toBe(0);
      expect(freshState.allUnknownIds.size).toBe(0);
      expect(freshState.undoStack).toEqual([]);
      expect(freshState.roundHistory).toEqual([]);
    });
  });

  // =========================================================================
  // SORT_CARD
  // =========================================================================

  describe('SORT_CARD', () => {
    it('is no-op when phase is not "sorting"', () => {
      const state: SortState = { ...initialSortState(config), phase: 'animating' };
      const next = sortReducer(state, {
        type: 'SORT_CARD',
        payload: { direction: 'know' },
      });
      expect(next).toBe(state);
    });

    it('is no-op when phase is "round-summary"', () => {
      const state: SortState = { ...initialSortState(config), phase: 'round-summary' };
      const next = sortReducer(state, {
        type: 'SORT_CARD',
        payload: { direction: 'know' },
      });
      expect(next).toBe(state);
    });

    it('adds questionId to knownIds when direction is "know"', () => {
      const state = initialSortState(config);
      const cardId = state.cards[0].id;
      const next = sortReducer(state, {
        type: 'SORT_CARD',
        payload: { direction: 'know' },
      });
      expect(next.knownIds.has(cardId)).toBe(true);
      expect(next.unknownIds.has(cardId)).toBe(false);
    });

    it('adds questionId to unknownIds AND allUnknownIds when direction is "dont-know"', () => {
      const state = initialSortState(config);
      const cardId = state.cards[0].id;
      const next = sortReducer(state, {
        type: 'SORT_CARD',
        payload: { direction: 'dont-know' },
      });
      expect(next.unknownIds.has(cardId)).toBe(true);
      expect(next.allUnknownIds.has(cardId)).toBe(true);
      expect(next.knownIds.has(cardId)).toBe(false);
    });

    it('pushes UndoEntry to undoStack', () => {
      const state = initialSortState(config);
      const cardId = state.cards[0].id;
      const next = sortReducer(state, {
        type: 'SORT_CARD',
        payload: { direction: 'know' },
      });
      expect(next.undoStack).toHaveLength(1);
      expect(next.undoStack[0]).toEqual({
        questionId: cardId,
        direction: 'know',
        cardIndex: 0,
      });
    });

    it('transitions to "animating" phase', () => {
      const state = initialSortState(config);
      const next = sortReducer(state, {
        type: 'SORT_CARD',
        payload: { direction: 'know' },
      });
      expect(next.phase).toBe('animating');
    });

    it('does not advance currentIndex (animation step does that)', () => {
      const state = initialSortState(config);
      const next = sortReducer(state, {
        type: 'SORT_CARD',
        payload: { direction: 'know' },
      });
      expect(next.currentIndex).toBe(0);
    });
  });

  // =========================================================================
  // ANIMATION_COMPLETE
  // =========================================================================

  describe('ANIMATION_COMPLETE', () => {
    it('is no-op when phase is not "animating"', () => {
      const state = initialSortState(config);
      expect(state.phase).toBe('sorting');
      const next = sortReducer(state, { type: 'ANIMATION_COMPLETE' });
      expect(next).toBe(state);
    });

    it('advances currentIndex', () => {
      const state = initialSortState(config);
      const sorted = sortReducer(state, {
        type: 'SORT_CARD',
        payload: { direction: 'know' },
      });
      expect(sorted.phase).toBe('animating');
      const next = sortReducer(sorted, { type: 'ANIMATION_COMPLETE' });
      expect(next.currentIndex).toBe(1);
    });

    it('transitions to "sorting" when more cards remain', () => {
      const state = initialSortState(config);
      const sorted = sortReducer(state, {
        type: 'SORT_CARD',
        payload: { direction: 'know' },
      });
      const next = sortReducer(sorted, { type: 'ANIMATION_COMPLETE' });
      expect(next.phase).toBe('sorting');
    });

    it('transitions to "round-summary" when all cards sorted (some unknown)', () => {
      const state = initialSortState(makeConfig(3));
      // Sort 2 as known, 1 as dont-know
      const result = sortAllCards(state, 2);
      expect(result.phase).toBe('round-summary');
      expect(result.roundHistory).toHaveLength(1);
    });

    it('creates RoundResult with correct stats in roundHistory', () => {
      const state = initialSortState(makeConfig(4));
      const result = sortAllCards(state, 3); // 3 known, 1 unknown
      const roundResult = result.roundHistory[0];
      expect(roundResult.round).toBe(1);
      expect(roundResult.totalCards).toBe(4);
      expect(roundResult.knownCount).toBe(3);
      expect(roundResult.unknownCount).toBe(1);
      expect(roundResult.durationMs).toBeGreaterThanOrEqual(0);
      expect(roundResult.unknownIds).toHaveLength(1);
    });

    it('transitions to "mastery" when all cards sorted as Know (unknownIds empty)', () => {
      const state = initialSortState(makeConfig(3));
      const result = sortAllCards(state, 3); // All known
      expect(result.phase).toBe('mastery');
      expect(result.roundHistory).toHaveLength(1);
      expect(result.roundHistory[0].unknownCount).toBe(0);
    });
  });

  // =========================================================================
  // UNDO
  // =========================================================================

  describe('UNDO', () => {
    it('is no-op when phase is not "sorting"', () => {
      const state: SortState = { ...initialSortState(config), phase: 'animating' };
      const next = sortReducer(state, { type: 'UNDO' });
      expect(next).toBe(state);
    });

    it('is no-op when undoStack is empty', () => {
      const state = initialSortState(config);
      expect(state.undoStack).toHaveLength(0);
      const next = sortReducer(state, { type: 'UNDO' });
      expect(next).toBe(state);
    });

    it('removes questionId from knownIds for know undo', () => {
      const state = initialSortState(config);
      const cardId = state.cards[0].id;

      // Sort as know then complete animation
      let s = sortReducer(state, { type: 'SORT_CARD', payload: { direction: 'know' } });
      s = sortReducer(s, { type: 'ANIMATION_COMPLETE' });
      expect(s.knownIds.has(cardId)).toBe(true);

      // Undo
      const undone = sortReducer(s, { type: 'UNDO' });
      expect(undone.knownIds.has(cardId)).toBe(false);
    });

    it('removes questionId from unknownIds AND allUnknownIds for dont-know undo', () => {
      const state = initialSortState(config);
      const cardId = state.cards[0].id;

      // Sort as dont-know then complete animation
      let s = sortReducer(state, { type: 'SORT_CARD', payload: { direction: 'dont-know' } });
      s = sortReducer(s, { type: 'ANIMATION_COMPLETE' });
      expect(s.unknownIds.has(cardId)).toBe(true);
      expect(s.allUnknownIds.has(cardId)).toBe(true);

      // Undo
      const undone = sortReducer(s, { type: 'UNDO' });
      expect(undone.unknownIds.has(cardId)).toBe(false);
      expect(undone.allUnknownIds.has(cardId)).toBe(false);
    });

    it('decrements currentIndex by 1', () => {
      const state = initialSortState(config);
      let s = sortReducer(state, { type: 'SORT_CARD', payload: { direction: 'know' } });
      s = sortReducer(s, { type: 'ANIMATION_COMPLETE' });
      expect(s.currentIndex).toBe(1);

      const undone = sortReducer(s, { type: 'UNDO' });
      expect(undone.currentIndex).toBe(0);
    });

    it('pops last entry from undoStack', () => {
      const state = initialSortState(config);

      // Sort two cards
      let s = sortReducer(state, { type: 'SORT_CARD', payload: { direction: 'know' } });
      s = sortReducer(s, { type: 'ANIMATION_COMPLETE' });
      s = sortReducer(s, { type: 'SORT_CARD', payload: { direction: 'dont-know' } });
      s = sortReducer(s, { type: 'ANIMATION_COMPLETE' });
      expect(s.undoStack).toHaveLength(2);

      // Undo once
      const undone = sortReducer(s, { type: 'UNDO' });
      expect(undone.undoStack).toHaveLength(1);
      expect(undone.undoStack[0].direction).toBe('know');
    });

    it('supports multiple sequential undos', () => {
      const state = initialSortState(config);

      // Sort three cards
      let s = sortReducer(state, { type: 'SORT_CARD', payload: { direction: 'know' } });
      s = sortReducer(s, { type: 'ANIMATION_COMPLETE' });
      s = sortReducer(s, { type: 'SORT_CARD', payload: { direction: 'dont-know' } });
      s = sortReducer(s, { type: 'ANIMATION_COMPLETE' });
      s = sortReducer(s, { type: 'SORT_CARD', payload: { direction: 'know' } });
      s = sortReducer(s, { type: 'ANIMATION_COMPLETE' });
      expect(s.currentIndex).toBe(3);
      expect(s.undoStack).toHaveLength(3);

      // Undo all three
      s = sortReducer(s, { type: 'UNDO' });
      s = sortReducer(s, { type: 'UNDO' });
      s = sortReducer(s, { type: 'UNDO' });
      expect(s.currentIndex).toBe(0);
      expect(s.undoStack).toHaveLength(0);
      expect(s.knownIds.size).toBe(0);
      expect(s.unknownIds.size).toBe(0);
      expect(s.allUnknownIds.size).toBe(0);
    });
  });

  // =========================================================================
  // START_NEXT_ROUND
  // =========================================================================

  describe('START_NEXT_ROUND', () => {
    it('is no-op when phase is not "round-summary"', () => {
      const state = initialSortState(config);
      const next = sortReducer(state, { type: 'START_NEXT_ROUND' });
      expect(next).toBe(state);
    });

    it('filters cards to only unknownIds', () => {
      const state = initialSortState(makeConfig(5));
      // Sort: 3 known, 2 dont-know -> round-summary
      const roundEnd = sortAllCards(state, 3);
      expect(roundEnd.phase).toBe('round-summary');
      expect(roundEnd.unknownIds.size).toBe(2);

      const nextRound = sortReducer(roundEnd, { type: 'START_NEXT_ROUND' });
      expect(nextRound.cards).toHaveLength(2);
      // All cards in next round should be from the unknown set
      for (const card of nextRound.cards) {
        expect(roundEnd.unknownIds.has(card.id)).toBe(true);
      }
    });

    it('shuffles the filtered cards', () => {
      // Use enough cards to make shuffle detectable
      const state = initialSortState(makeConfig(15));
      // Sort: 5 known, 10 dont-know
      const roundEnd = sortAllCards(state, 5);

      const nextRound = sortReducer(roundEnd, { type: 'START_NEXT_ROUND' });
      expect(nextRound.cards).toHaveLength(10);
      // Verify all unknownId cards are present
      const nextRoundIds = nextRound.cards.map(c => c.id).sort();
      const unknownIdsArr = [...roundEnd.unknownIds].sort();
      expect(nextRoundIds).toEqual(unknownIdsArr);
    });

    it('increments round number', () => {
      const state = initialSortState(makeConfig(5));
      const roundEnd = sortAllCards(state, 3);
      const nextRound = sortReducer(roundEnd, { type: 'START_NEXT_ROUND' });
      expect(nextRound.round).toBe(2);
    });

    it('resets knownIds, unknownIds, undoStack', () => {
      const state = initialSortState(makeConfig(5));
      const roundEnd = sortAllCards(state, 3);
      const nextRound = sortReducer(roundEnd, { type: 'START_NEXT_ROUND' });
      expect(nextRound.knownIds.size).toBe(0);
      expect(nextRound.unknownIds.size).toBe(0);
      expect(nextRound.undoStack).toEqual([]);
    });

    it('preserves allUnknownIds (cumulative)', () => {
      const state = initialSortState(makeConfig(5));
      const roundEnd = sortAllCards(state, 3);
      const unknownIdsBeforeNextRound = new Set(roundEnd.allUnknownIds);

      const nextRound = sortReducer(roundEnd, { type: 'START_NEXT_ROUND' });
      expect(nextRound.allUnknownIds).toEqual(unknownIdsBeforeNextRound);
    });

    it('is no-op when round >= MAX_ROUNDS (round cap enforcement)', () => {
      const state = initialSortState(makeConfig(5));
      const roundEnd = sortAllCards(state, 3);
      // Force round to MAX_ROUNDS
      const atMax: SortState = { ...roundEnd, round: MAX_ROUNDS };
      const next = sortReducer(atMax, { type: 'START_NEXT_ROUND' });
      expect(next).toBe(atMax);
    });

    it('resets currentIndex to 0', () => {
      const state = initialSortState(makeConfig(5));
      const roundEnd = sortAllCards(state, 3);
      const nextRound = sortReducer(roundEnd, { type: 'START_NEXT_ROUND' });
      expect(nextRound.currentIndex).toBe(0);
    });

    it('resets startTime', () => {
      const state = initialSortState(makeConfig(5));
      const oldStartTime = state.startTime;
      const roundEnd = sortAllCards(state, 3);

      // Small delay to ensure different timestamp
      vi.spyOn(Date, 'now').mockReturnValue(oldStartTime + 5000);
      const nextRound = sortReducer(roundEnd, { type: 'START_NEXT_ROUND' });
      expect(nextRound.startTime).toBe(oldStartTime + 5000);
      vi.restoreAllMocks();
    });
  });

  // =========================================================================
  // START_COUNTDOWN / CANCEL_COUNTDOWN
  // =========================================================================

  describe('START_COUNTDOWN / CANCEL_COUNTDOWN', () => {
    it('START_COUNTDOWN: round-summary -> countdown', () => {
      const state = initialSortState(makeConfig(3));
      const roundEnd = sortAllCards(state, 2);
      expect(roundEnd.phase).toBe('round-summary');

      const next = sortReducer(roundEnd, { type: 'START_COUNTDOWN' });
      expect(next.phase).toBe('countdown');
    });

    it('CANCEL_COUNTDOWN: countdown -> round-summary', () => {
      const state = initialSortState(makeConfig(3));
      const roundEnd = sortAllCards(state, 2);
      const countdown = sortReducer(roundEnd, { type: 'START_COUNTDOWN' });
      expect(countdown.phase).toBe('countdown');

      const cancelled = sortReducer(countdown, { type: 'CANCEL_COUNTDOWN' });
      expect(cancelled.phase).toBe('round-summary');
    });

    it('START_COUNTDOWN is no-op from wrong phase', () => {
      const state = initialSortState(config);
      expect(state.phase).toBe('sorting');
      const next = sortReducer(state, { type: 'START_COUNTDOWN' });
      expect(next).toBe(state);
    });

    it('CANCEL_COUNTDOWN is no-op from wrong phase', () => {
      const state = initialSortState(config);
      const next = sortReducer(state, { type: 'CANCEL_COUNTDOWN' });
      expect(next).toBe(state);
    });

    it('CANCEL_COUNTDOWN is no-op from sorting phase', () => {
      const state = initialSortState(config);
      expect(state.phase).toBe('sorting');
      const next = sortReducer(state, { type: 'CANCEL_COUNTDOWN' });
      expect(next).toBe(state);
    });
  });

  // =========================================================================
  // FINISH_SESSION
  // =========================================================================

  describe('FINISH_SESSION', () => {
    it('transitions to idle from sorting phase', () => {
      const state = initialSortState(config);
      const finished = sortReducer(state, { type: 'FINISH_SESSION' });
      expect(finished.phase).toBe('idle');
    });

    it('transitions to idle from round-summary phase', () => {
      const state = initialSortState(makeConfig(3));
      const roundEnd = sortAllCards(state, 2);
      expect(roundEnd.phase).toBe('round-summary');
      const finished = sortReducer(roundEnd, { type: 'FINISH_SESSION' });
      expect(finished.phase).toBe('idle');
    });

    it('transitions to idle from mastery phase', () => {
      const state = initialSortState(makeConfig(3));
      const mastered = sortAllCards(state, 3);
      expect(mastered.phase).toBe('mastery');
      const finished = sortReducer(mastered, { type: 'FINISH_SESSION' });
      expect(finished.phase).toBe('idle');
    });

    it('preserves roundHistory', () => {
      const state = initialSortState(makeConfig(3));
      const roundEnd = sortAllCards(state, 2);
      expect(roundEnd.roundHistory).toHaveLength(1);

      const finished = sortReducer(roundEnd, { type: 'FINISH_SESSION' });
      expect(finished.roundHistory).toEqual(roundEnd.roundHistory);
    });

    it('resets all other state fields', () => {
      const state = initialSortState(config);
      const finished = sortReducer(state, { type: 'FINISH_SESSION' });
      expect(finished.round).toBe(0);
      expect(finished.cards).toEqual([]);
      expect(finished.currentIndex).toBe(0);
      expect(finished.knownIds.size).toBe(0);
      expect(finished.unknownIds.size).toBe(0);
      expect(finished.allUnknownIds.size).toBe(0);
      expect(finished.undoStack).toEqual([]);
      expect(finished.startTime).toBe(0);
      expect(finished.sourceCards).toEqual([]);
    });
  });

  // =========================================================================
  // RESUME_SESSION
  // =========================================================================

  describe('RESUME_SESSION', () => {
    it('reconstructs state with empty undoStack', () => {
      const state = initialSortState(config);
      const resumed = sortReducer(state, {
        type: 'RESUME_SESSION',
        payload: {
          round: 2,
          cards: makeTestCards(5),
          currentIndex: 2,
          knownIds: new Set(['q1']),
          unknownIds: new Set(['q2']),
          allUnknownIds: new Set(['q2', 'q3']),
          roundHistory: [
            {
              round: 1,
              totalCards: 10,
              knownCount: 8,
              unknownCount: 2,
              durationMs: 5000,
              unknownIds: ['q2', 'q3'],
            },
          ],
          startTime: Date.now() - 3000,
          sourceCards: makeTestCards(10),
        },
      });

      expect(resumed.undoStack).toEqual([]);
      expect(resumed.phase).toBe('sorting');
      expect(resumed.round).toBe(2);
      expect(resumed.currentIndex).toBe(2);
    });

    it('sets phase to "sorting"', () => {
      const state: SortState = { ...initialSortState(config), phase: 'idle' };
      const resumed = sortReducer(state, {
        type: 'RESUME_SESSION',
        payload: {
          cards: makeTestCards(5),
          currentIndex: 0,
          knownIds: new Set<string>(),
          unknownIds: new Set<string>(),
          allUnknownIds: new Set<string>(),
        },
      });
      expect(resumed.phase).toBe('sorting');
    });

    it('reconstructs Sets from serialized arrays', () => {
      const state = initialSortState(config);
      const resumed = sortReducer(state, {
        type: 'RESUME_SESSION',
        payload: {
          // Simulate arrays from IndexedDB deserialization
          knownIds: ['q1', 'q2'] as unknown as Set<string>,
          unknownIds: ['q3'] as unknown as Set<string>,
          allUnknownIds: ['q3', 'q4'] as unknown as Set<string>,
        },
      });

      expect(resumed.knownIds).toBeInstanceOf(Set);
      expect(resumed.unknownIds).toBeInstanceOf(Set);
      expect(resumed.allUnknownIds).toBeInstanceOf(Set);
      expect(resumed.knownIds.has('q1')).toBe(true);
      expect(resumed.knownIds.has('q2')).toBe(true);
      expect(resumed.unknownIds.has('q3')).toBe(true);
      expect(resumed.allUnknownIds.has('q3')).toBe(true);
      expect(resumed.allUnknownIds.has('q4')).toBe(true);
    });

    it('handles already-Set inputs without double-wrapping', () => {
      const state = initialSortState(config);
      const knownSet = new Set(['q1']);
      const resumed = sortReducer(state, {
        type: 'RESUME_SESSION',
        payload: {
          knownIds: knownSet,
          unknownIds: new Set<string>(),
          allUnknownIds: new Set<string>(),
        },
      });

      expect(resumed.knownIds).toBeInstanceOf(Set);
      expect(resumed.knownIds.has('q1')).toBe(true);
      expect(resumed.knownIds.size).toBe(1);
    });
  });

  // =========================================================================
  // Edge cases and integration
  // =========================================================================

  describe('edge cases', () => {
    it('unknown action type returns state unchanged', () => {
      const state = initialSortState(config);
      const next = sortReducer(state, { type: 'NONEXISTENT' } as never);
      expect(next).toBe(state);
    });

    it('full round lifecycle: sort -> round-summary -> next round -> mastery', () => {
      // Round 1: 5 cards, 3 known, 2 unknown
      const state = initialSortState(makeConfig(5));
      const round1End = sortAllCards(state, 3);
      expect(round1End.phase).toBe('round-summary');
      expect(round1End.roundHistory).toHaveLength(1);

      // Round 2: 2 cards (the unknowns), all known -> mastery
      const round2 = sortReducer(round1End, { type: 'START_NEXT_ROUND' });
      expect(round2.round).toBe(2);
      expect(round2.cards).toHaveLength(2);

      const round2End = sortAllCards(round2, 2);
      expect(round2End.phase).toBe('mastery');
      expect(round2End.roundHistory).toHaveLength(2);
    });

    it('MAX_ROUNDS constant is 10', () => {
      expect(MAX_ROUNDS).toBe(10);
    });
  });
});
