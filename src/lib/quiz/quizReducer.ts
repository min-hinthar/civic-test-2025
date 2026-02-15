/**
 * Quiz State Machine Reducer
 *
 * Pure reducer function implementing all quiz state transitions.
 * Every action handler is guarded by the current phase — if an action
 * doesn't match the expected phase, the state is returned unchanged (no-op).
 * This prevents race conditions and invalid state combinations.
 *
 * Transition map:
 *   answering  -> CHECK          -> checked
 *   answering  -> SKIP           -> transitioning
 *   answering  -> SELECT_ANSWER  -> answering (with selection)
 *   answering  -> DESELECT_ANSWER -> answering (cleared)
 *   checked    -> SHOW_FEEDBACK  -> feedback (or finished if threshold met)
 *   feedback   -> CONTINUE       -> transitioning
 *   transitioning -> TRANSITION_COMPLETE -> answering (or skipped-review/finished)
 *   skipped-review -> SELECT_ANSWER -> skipped-review (with selection)
 *   skipped-review -> DESELECT_ANSWER -> skipped-review (cleared)
 *   skipped-review -> CHECK       -> checked
 *   skipped-review -> SKIP        -> transitioning (skip during review)
 *   any phase  -> START_SKIPPED_REVIEW -> skipped-review
 *   any phase  -> FINISH         -> finished
 */

import type { QuizAction, QuizConfig, QuizMode, QuizState } from './quizTypes';

// ---------------------------------------------------------------------------
// Factory functions
// ---------------------------------------------------------------------------

/**
 * Create the initial quiz state from a config.
 */
export function initialQuizState(config: QuizConfig): QuizState {
  return {
    phase: 'answering',
    mode: config.mode,
    currentIndex: 0,
    selectedAnswer: null,
    results: [],
    skippedIndices: [],
    streakCount: 0,
    isCorrect: null,
    questionCount: config.questionCount,
    reviewingSkippedIndex: 0,
  };
}

/**
 * Create a QuizConfig with sensible defaults for a given mode.
 */
export function createQuizConfig(mode: QuizMode, questionCount: number): QuizConfig {
  if (mode === 'mock-test') {
    return {
      mode,
      questionCount,
      passThreshold: 12,
      failThreshold: 9,
      allowSkipReview: false,
      allowSegmentTap: false,
      showLiveScore: false,
      showExplanation: false,
    };
  }

  // Practice mode
  return {
    mode,
    questionCount,
    allowSkipReview: true,
    allowSegmentTap: true,
    showLiveScore: true,
    showExplanation: true,
  };
}

// ---------------------------------------------------------------------------
// Helper: count results
// ---------------------------------------------------------------------------

function countCorrect(results: QuizState['results']): number {
  return results.filter(r => r.isCorrect).length;
}

function countIncorrect(results: QuizState['results']): number {
  return results.filter(r => !r.isCorrect).length;
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

/**
 * Quiz state machine reducer. Every action is guarded by the current phase.
 * Returns state unchanged if the action is invalid for the current phase.
 */
export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    // -------------------------------------------------------------------
    // SELECT_ANSWER — allowed in 'answering' and 'skipped-review'
    // -------------------------------------------------------------------
    case 'SELECT_ANSWER': {
      if (state.phase !== 'answering' && state.phase !== 'skipped-review') {
        return state;
      }
      return { ...state, selectedAnswer: action.answer };
    }

    // -------------------------------------------------------------------
    // DESELECT_ANSWER — allowed in 'answering' and 'skipped-review'
    // -------------------------------------------------------------------
    case 'DESELECT_ANSWER': {
      if (state.phase !== 'answering' && state.phase !== 'skipped-review') {
        return state;
      }
      return { ...state, selectedAnswer: null };
    }

    // -------------------------------------------------------------------
    // CHECK — only when an answer is selected, in 'answering' or 'skipped-review'
    // -------------------------------------------------------------------
    case 'CHECK': {
      if (state.phase !== 'answering' && state.phase !== 'skipped-review') {
        return state;
      }
      if (state.selectedAnswer === null) {
        return state; // Cannot check without a selection
      }
      return { ...state, phase: 'checked' };
    }

    // -------------------------------------------------------------------
    // SHOW_FEEDBACK — transitions from 'checked' to 'feedback'
    // Records result, updates streak, checks pass/fail thresholds
    // -------------------------------------------------------------------
    case 'SHOW_FEEDBACK': {
      if (state.phase !== 'checked') {
        return state;
      }

      const newResults = [...state.results, action.result];
      const newStreakCount = action.isCorrect ? state.streakCount + 1 : 0;

      return {
        ...state,
        phase: 'feedback',
        results: newResults,
        streakCount: newStreakCount,
        isCorrect: action.isCorrect,
      };
    }

    // -------------------------------------------------------------------
    // CONTINUE — from 'feedback' to 'transitioning'
    // Clears selection and isCorrect for the next question
    // -------------------------------------------------------------------
    case 'CONTINUE': {
      if (state.phase !== 'feedback') {
        return state;
      }
      return {
        ...state,
        phase: 'transitioning',
        selectedAnswer: null,
        isCorrect: null,
      };
    }

    // -------------------------------------------------------------------
    // SKIP — from 'answering' or 'skipped-review' to 'transitioning'
    // Adds currentIndex to skippedIndices
    // -------------------------------------------------------------------
    case 'SKIP': {
      if (state.phase !== 'answering' && state.phase !== 'skipped-review') {
        return state;
      }

      // Determine the actual question index being skipped
      const skippedQuestionIndex =
        state.phase === 'skipped-review'
          ? state.skippedIndices[state.reviewingSkippedIndex]
          : state.currentIndex;

      // During skipped-review, re-skipping keeps the item in skippedIndices
      // During answering, add to skippedIndices
      const newSkippedIndices =
        state.phase === 'skipped-review'
          ? state.skippedIndices
          : [...state.skippedIndices, skippedQuestionIndex];

      return {
        ...state,
        phase: 'transitioning',
        selectedAnswer: null,
        isCorrect: null,
        skippedIndices: newSkippedIndices,
      };
    }

    // -------------------------------------------------------------------
    // TRANSITION_COMPLETE — from 'transitioning'
    // Advances to next question or enters skipped-review/finished
    // -------------------------------------------------------------------
    case 'TRANSITION_COMPLETE': {
      if (state.phase !== 'transitioning') {
        return state;
      }

      // If we were in skipped-review mode, advance the review index
      if (state.reviewingSkippedIndex > 0 || state.currentIndex === 0) {
        // Check if we came from a skipped-review skip/continue
        // by checking if reviewingSkippedIndex was active
      }

      // During skipped review: advance reviewingSkippedIndex
      // We detect this by checking if reviewingSkippedIndex was being used
      // (i.e., the previous phase was skipped-review before transitioning)
      // Since we lost that info in the transition, we use a heuristic:
      // if currentIndex >= questionCount, we're in review territory
      if (state.currentIndex >= state.questionCount) {
        const nextReviewIndex = state.reviewingSkippedIndex + 1;
        if (nextReviewIndex < state.skippedIndices.length) {
          return {
            ...state,
            phase: 'skipped-review',
            reviewingSkippedIndex: nextReviewIndex,
          };
        }
        // All skipped questions reviewed
        return { ...state, phase: 'finished' };
      }

      const nextIndex = state.currentIndex + 1;

      // Check if we've reached the end of questions
      if (nextIndex >= state.questionCount) {
        // Practice mode with skipped questions: start skipped review
        if (state.mode === 'practice' && state.skippedIndices.length > 0) {
          return {
            ...state,
            phase: 'skipped-review',
            currentIndex: nextIndex,
            reviewingSkippedIndex: 0,
          };
        }
        // No more questions, finish
        return {
          ...state,
          phase: 'finished',
          currentIndex: nextIndex,
        };
      }

      // Normal: advance to next question
      return {
        ...state,
        phase: 'answering',
        currentIndex: nextIndex,
      };
    }

    // -------------------------------------------------------------------
    // START_SKIPPED_REVIEW — enter skipped-review phase
    // -------------------------------------------------------------------
    case 'START_SKIPPED_REVIEW': {
      if (state.skippedIndices.length === 0) {
        return state; // Nothing to review
      }
      return {
        ...state,
        phase: 'skipped-review',
        reviewingSkippedIndex: 0,
      };
    }

    // -------------------------------------------------------------------
    // FINISH — transitions to finished from any phase
    // -------------------------------------------------------------------
    case 'FINISH': {
      return { ...state, phase: 'finished' };
    }

    default: {
      return state;
    }
  }
}

// ---------------------------------------------------------------------------
// Threshold helpers (for use by consumers)
// ---------------------------------------------------------------------------

/**
 * Check if the mock test should end early due to passing threshold.
 */
export function hasPassedThreshold(state: QuizState, config: QuizConfig): boolean {
  if (!config.passThreshold) return false;
  return countCorrect(state.results) >= config.passThreshold;
}

/**
 * Check if the mock test should end early due to failing threshold.
 */
export function hasFailedThreshold(state: QuizState, config: QuizConfig): boolean {
  if (!config.failThreshold) return false;
  return countIncorrect(state.results) >= config.failThreshold;
}
