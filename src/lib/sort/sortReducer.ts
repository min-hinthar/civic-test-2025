/**
 * Sort Mode State Machine Reducer
 *
 * Pure reducer function implementing all sort mode state transitions.
 * Every action handler is guarded by the current phase -- if an action
 * doesn't match the expected phase, the state is returned unchanged (no-op).
 *
 * Transition map:
 *   any           -> START_SORT          -> sorting
 *   sorting       -> SORT_CARD           -> animating
 *   animating     -> ANIMATION_COMPLETE  -> sorting | round-summary | mastery
 *   sorting       -> UNDO               -> sorting (card restored)
 *   round-summary -> START_NEXT_ROUND   -> sorting
 *   round-summary -> START_COUNTDOWN    -> countdown
 *   countdown     -> CANCEL_COUNTDOWN   -> round-summary
 *   any           -> FINISH_SESSION     -> idle (preserving roundHistory)
 *   any           -> RESUME_SESSION     -> sorting
 *
 * Mastery credit: A single "Know" swipe = mastered for this session.
 * No consecutive-correct tracking needed.
 */

import { fisherYatesShuffle } from '@/lib/shuffle';

import type { SortAction, SortConfig, SortState } from './sortTypes';
import { MAX_ROUNDS } from './sortTypes';

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Create the initial sort state from a config.
 * Shuffles cards and sets up round 1.
 */
export function initialSortState(config: SortConfig): SortState {
  return {
    phase: 'sorting',
    round: 1,
    cards: fisherYatesShuffle(config.cards),
    currentIndex: 0,
    knownIds: new Set(),
    unknownIds: new Set(),
    allUnknownIds: new Set(),
    undoStack: [],
    roundHistory: [],
    startTime: Date.now(),
    sourceCards: config.cards,
    categoryFilter: config.categoryFilter,
  };
}

// ---------------------------------------------------------------------------
// Idle state (for FINISH_SESSION)
// ---------------------------------------------------------------------------

function createIdleState(roundHistory: SortState['roundHistory']): SortState {
  return {
    phase: 'idle',
    round: 0,
    cards: [],
    currentIndex: 0,
    knownIds: new Set(),
    unknownIds: new Set(),
    allUnknownIds: new Set(),
    undoStack: [],
    roundHistory,
    startTime: 0,
    sourceCards: [],
  };
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

/**
 * Sort state machine reducer. Every action is guarded by the current phase.
 * Returns state unchanged if the action is invalid for the current phase.
 */
export function sortReducer(state: SortState, action: SortAction): SortState {
  switch (action.type) {
    // -------------------------------------------------------------------
    // START_SORT — begin sorting (any phase -> sorting)
    // -------------------------------------------------------------------
    case 'START_SORT': {
      return initialSortState(action.payload);
    }

    // -------------------------------------------------------------------
    // SORT_CARD — classify current card (sorting -> animating)
    // -------------------------------------------------------------------
    case 'SORT_CARD': {
      if (state.phase !== 'sorting') {
        return state;
      }

      const currentCard = state.cards[state.currentIndex];
      if (!currentCard) {
        return state;
      }

      const { direction } = action.payload;
      const newKnownIds = new Set(state.knownIds);
      const newUnknownIds = new Set(state.unknownIds);
      const newAllUnknownIds = new Set(state.allUnknownIds);

      if (direction === 'know') {
        newKnownIds.add(currentCard.id);
      } else {
        newUnknownIds.add(currentCard.id);
        newAllUnknownIds.add(currentCard.id);
      }

      const undoEntry = {
        questionId: currentCard.id,
        direction,
        cardIndex: state.currentIndex,
      };

      return {
        ...state,
        phase: 'animating',
        knownIds: newKnownIds,
        unknownIds: newUnknownIds,
        allUnknownIds: newAllUnknownIds,
        undoStack: [...state.undoStack, undoEntry],
      };
    }

    // -------------------------------------------------------------------
    // ANIMATION_COMPLETE — card fling finished (animating -> sorting | round-summary | mastery)
    // -------------------------------------------------------------------
    case 'ANIMATION_COMPLETE': {
      if (state.phase !== 'animating') {
        return state;
      }

      const nextIndex = state.currentIndex + 1;

      // Still have cards left in this round
      if (nextIndex < state.cards.length) {
        return {
          ...state,
          phase: 'sorting',
          currentIndex: nextIndex,
        };
      }

      // Round complete — build round result
      const roundResult = {
        round: state.round,
        totalCards: state.cards.length,
        knownCount: state.knownIds.size,
        unknownCount: state.unknownIds.size,
        durationMs: Date.now() - state.startTime,
        unknownIds: [...state.unknownIds],
      };

      // All cards known — mastery!
      if (state.unknownIds.size === 0) {
        return {
          ...state,
          phase: 'mastery',
          currentIndex: nextIndex,
          roundHistory: [...state.roundHistory, roundResult],
        };
      }

      // Some cards unknown — show round summary
      return {
        ...state,
        phase: 'round-summary',
        currentIndex: nextIndex,
        roundHistory: [...state.roundHistory, roundResult],
      };
    }

    // -------------------------------------------------------------------
    // UNDO — restore last sorted card (sorting -> sorting)
    // -------------------------------------------------------------------
    case 'UNDO': {
      if (state.phase !== 'sorting') {
        return state;
      }

      if (state.undoStack.length === 0) {
        return state;
      }

      const newStack = [...state.undoStack];
      const lastEntry = newStack.pop()!;

      const newKnownIds = new Set(state.knownIds);
      const newUnknownIds = new Set(state.unknownIds);
      const newAllUnknownIds = new Set(state.allUnknownIds);

      if (lastEntry.direction === 'know') {
        newKnownIds.delete(lastEntry.questionId);
      } else {
        newUnknownIds.delete(lastEntry.questionId);
        newAllUnknownIds.delete(lastEntry.questionId);
      }

      return {
        ...state,
        phase: 'sorting',
        currentIndex: state.currentIndex - 1,
        knownIds: newKnownIds,
        unknownIds: newUnknownIds,
        allUnknownIds: newAllUnknownIds,
        undoStack: newStack,
      };
    }

    // -------------------------------------------------------------------
    // START_NEXT_ROUND — begin drill round with don't-know cards
    // (round-summary -> sorting)
    // -------------------------------------------------------------------
    case 'START_NEXT_ROUND': {
      if (state.phase !== 'round-summary') {
        return state;
      }

      if (state.round >= MAX_ROUNDS) {
        return state;
      }

      // Filter source cards by current round's unknownIds
      const dontKnowCards = state.sourceCards.filter(card => state.unknownIds.has(card.id));

      if (dontKnowCards.length === 0) {
        return state;
      }

      return {
        ...state,
        phase: 'sorting',
        round: state.round + 1,
        cards: fisherYatesShuffle(dontKnowCards),
        currentIndex: 0,
        knownIds: new Set(),
        unknownIds: new Set(),
        undoStack: [],
        startTime: Date.now(),
      };
    }

    // -------------------------------------------------------------------
    // START_COUNTDOWN — transition to countdown (round-summary -> countdown)
    // -------------------------------------------------------------------
    case 'START_COUNTDOWN': {
      if (state.phase !== 'round-summary') {
        return state;
      }

      return {
        ...state,
        phase: 'countdown',
      };
    }

    // -------------------------------------------------------------------
    // CANCEL_COUNTDOWN — cancel auto-start (countdown -> round-summary)
    // -------------------------------------------------------------------
    case 'CANCEL_COUNTDOWN': {
      if (state.phase !== 'countdown') {
        return state;
      }

      return {
        ...state,
        phase: 'round-summary',
      };
    }

    // -------------------------------------------------------------------
    // FINISH_SESSION — explicitly end session (any -> idle)
    // Preserves roundHistory for potential display
    // -------------------------------------------------------------------
    case 'FINISH_SESSION': {
      return createIdleState(state.roundHistory);
    }

    // -------------------------------------------------------------------
    // RESUME_SESSION — restore state from persisted snapshot (any -> sorting)
    // Reconstructs Sets from arrays, resets undoStack per locked decision
    // -------------------------------------------------------------------
    case 'RESUME_SESSION': {
      const restored = action.payload;

      return {
        ...state,
        ...restored,
        phase: 'sorting',
        // Reconstruct Sets if they were serialized as arrays
        knownIds: restored.knownIds instanceof Set ? restored.knownIds : new Set(restored.knownIds),
        unknownIds:
          restored.unknownIds instanceof Set ? restored.unknownIds : new Set(restored.unknownIds),
        allUnknownIds:
          restored.allUnknownIds instanceof Set
            ? restored.allUnknownIds
            : new Set(restored.allUnknownIds),
        // Reset undo stack on resume per locked decision
        undoStack: [],
      };
    }

    default: {
      return state;
    }
  }
}
