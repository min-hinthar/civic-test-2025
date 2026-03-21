/**
 * Interview State Machine - Pure Reducer Unit Tests
 *
 * Tests the interviewReducer as a pure function: no React, no providers, no mocking.
 * Covers all action types, valid/invalid transitions, factory initialization,
 * type guard, and session snapshot helper.
 */

import { describe, test, expect } from 'vitest';
import {
  interviewReducer,
  initialInterviewState,
  isValidTransition,
  isValidQuestionPhase,
  getSessionSnapshot,
  VALID_TRANSITIONS,
  MAX_REPLAYS,
  MAX_RECORD_ATTEMPTS,
  REALISTIC_TIMER_SECONDS,
  TRANSITION_DELAY_MS,
  PASS_THRESHOLD,
  FAIL_THRESHOLD,
  QUESTIONS_PER_SESSION,
  TYPING_INDICATOR_MS,
  RATE_MAP,
  type QuestionPhase,
  type InterviewState,
  type InterviewConfig,
} from '@/lib/interview/interviewStateMachine';
import type { InterviewResult, Question } from '@/types';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

function makeTestQuestion(id = 'GOV-01'): Question {
  return {
    id,
    question_en: 'What is the supreme law of the land?',
    question_my: 'Test Burmese',
    category: 'Principles of American Democracy',
    studyAnswers: [{ text_en: 'the Constitution', text_my: 'Test' }],
    answers: [
      { text_en: 'the Constitution', text_my: 'Test', correct: true },
      { text_en: 'the Declaration of Independence', text_my: 'Test', correct: false },
    ],
  };
}

function makeTestConfig(overrides: Partial<InterviewConfig> = {}): InterviewConfig {
  return {
    questions: [makeTestQuestion(), makeTestQuestion('GOV-02')],
    isResuming: false,
    ...overrides,
  };
}

function makeTestResult(grade: 'correct' | 'incorrect' = 'correct'): InterviewResult {
  return {
    questionId: 'GOV-01',
    questionText_en: 'What is the supreme law of the land?',
    questionText_my: 'Test Burmese',
    correctAnswers: [{ text_en: 'the Constitution', text_my: 'Test' }],
    selfGrade: grade,
    category: 'Principles of American Democracy',
  };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

describe('Interview State Machine Constants', () => {
  test('MAX_REPLAYS is 2', () => {
    expect(MAX_REPLAYS).toBe(2);
  });

  test('MAX_RECORD_ATTEMPTS is 3', () => {
    expect(MAX_RECORD_ATTEMPTS).toBe(3);
  });

  test('REALISTIC_TIMER_SECONDS is 15', () => {
    expect(REALISTIC_TIMER_SECONDS).toBe(15);
  });

  test('TRANSITION_DELAY_MS is 1500', () => {
    expect(TRANSITION_DELAY_MS).toBe(1500);
  });

  test('PASS_THRESHOLD is 12', () => {
    expect(PASS_THRESHOLD).toBe(12);
  });

  test('FAIL_THRESHOLD is 9', () => {
    expect(FAIL_THRESHOLD).toBe(9);
  });

  test('QUESTIONS_PER_SESSION is 20', () => {
    expect(QUESTIONS_PER_SESSION).toBe(20);
  });

  test('TYPING_INDICATOR_MS is 1200', () => {
    expect(TYPING_INDICATOR_MS).toBe(1200);
  });

  test('RATE_MAP has slow, normal, fast', () => {
    expect(RATE_MAP).toEqual({ slow: 0.7, normal: 0.98, fast: 1.3 });
  });
});

// ---------------------------------------------------------------------------
// Factory: initialInterviewState
// ---------------------------------------------------------------------------

describe('initialInterviewState', () => {
  test('creates state with questionPhase="greeting" for new session', () => {
    const state = initialInterviewState(makeTestConfig());
    expect(state.questionPhase).toBe('greeting');
  });

  test('creates state with questionPhase="chime" when isResuming=true', () => {
    const state = initialInterviewState(makeTestConfig({ isResuming: true }));
    expect(state.questionPhase).toBe('chime');
  });

  test('uses provided initialIndex, initialResults, initialCorrectCount, initialIncorrectCount', () => {
    const results = [makeTestResult()];
    const state = initialInterviewState(
      makeTestConfig({
        isResuming: true,
        initialIndex: 5,
        initialResults: results,
        initialCorrectCount: 3,
        initialIncorrectCount: 2,
      })
    );
    expect(state.currentIndex).toBe(5);
    expect(state.results).toBe(results);
    expect(state.correctCount).toBe(3);
    expect(state.incorrectCount).toBe(2);
  });

  test('defaults to empty state when no resume values provided', () => {
    const state = initialInterviewState(makeTestConfig());
    expect(state.currentIndex).toBe(0);
    expect(state.results).toEqual([]);
    expect(state.correctCount).toBe(0);
    expect(state.incorrectCount).toBe(0);
    expect(state.chatMessages).toEqual([]);
    expect(state.examinerState).toBe('idle');
    expect(state.isComplete).toBe(false);
    expect(state.endReason).toBeNull();
    expect(state.replaysUsed).toBe(0);
    expect(state.recordAttempt).toBe(1);
  });

  test('uses initialStartTime when provided', () => {
    const state = initialInterviewState(makeTestConfig({ initialStartTime: 12345 }));
    expect(state.startTime).toBe(12345);
  });
});

// ---------------------------------------------------------------------------
// ADVANCE_PHASE transitions
// ---------------------------------------------------------------------------

describe('ADVANCE_PHASE', () => {
  function advanceFrom(phase: QuestionPhase, toPhase: QuestionPhase): InterviewState {
    const state = initialInterviewState(makeTestConfig());
    const modified = { ...state, questionPhase: phase };
    return interviewReducer(modified, { type: 'ADVANCE_PHASE', phase: toPhase });
  }

  test('greeting -> chime valid', () => {
    const result = advanceFrom('greeting', 'chime');
    expect(result.questionPhase).toBe('chime');
  });

  test('chime -> typing valid', () => {
    const result = advanceFrom('chime', 'typing');
    expect(result.questionPhase).toBe('typing');
  });

  test('typing -> reading valid', () => {
    const result = advanceFrom('typing', 'reading');
    expect(result.questionPhase).toBe('reading');
  });

  test('reading -> responding valid', () => {
    const result = advanceFrom('reading', 'responding');
    expect(result.questionPhase).toBe('responding');
  });

  test('responding -> transcription valid (speech path)', () => {
    const result = advanceFrom('responding', 'transcription');
    expect(result.questionPhase).toBe('transcription');
  });

  test('responding -> grading valid (self-grade/timer path)', () => {
    const result = advanceFrom('responding', 'grading');
    expect(result.questionPhase).toBe('grading');
  });

  test('transcription -> responding valid (re-record)', () => {
    const result = advanceFrom('transcription', 'responding');
    expect(result.questionPhase).toBe('responding');
  });

  test('transcription -> grading valid (confirm)', () => {
    const result = advanceFrom('transcription', 'grading');
    expect(result.questionPhase).toBe('grading');
  });

  test('grading -> feedback valid', () => {
    const result = advanceFrom('grading', 'feedback');
    expect(result.questionPhase).toBe('feedback');
  });

  test('feedback -> transition valid', () => {
    const result = advanceFrom('feedback', 'transition');
    expect(result.questionPhase).toBe('transition');
  });

  test('transition -> chime valid (next question cycle)', () => {
    const result = advanceFrom('transition', 'chime');
    expect(result.questionPhase).toBe('chime');
  });

  test('greeting -> feedback rejected (returns same state reference)', () => {
    const state = initialInterviewState(makeTestConfig());
    const result = interviewReducer(state, { type: 'ADVANCE_PHASE', phase: 'feedback' });
    expect(result).toBe(state);
  });

  test('chime -> grading rejected', () => {
    const state = { ...initialInterviewState(makeTestConfig()), questionPhase: 'chime' as const };
    const result = interviewReducer(state, { type: 'ADVANCE_PHASE', phase: 'grading' });
    expect(result).toBe(state);
  });
});

// ---------------------------------------------------------------------------
// ADD_MESSAGE
// ---------------------------------------------------------------------------

describe('ADD_MESSAGE', () => {
  test('appends to chatMessages array', () => {
    const state = initialInterviewState(makeTestConfig());
    const msg = { id: 'msg-1', sender: 'examiner' as const, text: 'Hello' };
    const result = interviewReducer(state, { type: 'ADD_MESSAGE', message: msg });
    expect(result.chatMessages).toHaveLength(1);
    expect(result.chatMessages[0]).toEqual(msg);
  });

  test('preserves existing messages', () => {
    const state = initialInterviewState(makeTestConfig());
    const msg1 = { id: 'msg-1', sender: 'examiner' as const, text: 'Hello' };
    const msg2 = { id: 'msg-2', sender: 'user' as const, text: 'Hi' };
    const s1 = interviewReducer(state, { type: 'ADD_MESSAGE', message: msg1 });
    const s2 = interviewReducer(s1, { type: 'ADD_MESSAGE', message: msg2 });
    expect(s2.chatMessages).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// SET_EXAMINER_STATE
// ---------------------------------------------------------------------------

describe('SET_EXAMINER_STATE', () => {
  test('updates examinerState', () => {
    const state = initialInterviewState(makeTestConfig());
    const result = interviewReducer(state, {
      type: 'SET_EXAMINER_STATE',
      examinerState: 'speaking',
    });
    expect(result.examinerState).toBe('speaking');
  });
});

// ---------------------------------------------------------------------------
// RECORD_RESULT
// ---------------------------------------------------------------------------

describe('RECORD_RESULT', () => {
  test('pushes to results and increments correctCount when selfGrade="correct"', () => {
    const state = initialInterviewState(makeTestConfig());
    const result = makeTestResult('correct');
    const next = interviewReducer(state, { type: 'RECORD_RESULT', result });
    expect(next.results).toHaveLength(1);
    expect(next.correctCount).toBe(1);
    expect(next.incorrectCount).toBe(0);
  });

  test('increments incorrectCount when selfGrade="incorrect"', () => {
    const state = initialInterviewState(makeTestConfig());
    const result = makeTestResult('incorrect');
    const next = interviewReducer(state, { type: 'RECORD_RESULT', result });
    expect(next.results).toHaveLength(1);
    expect(next.correctCount).toBe(0);
    expect(next.incorrectCount).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// INCREMENT_REPLAY
// ---------------------------------------------------------------------------

describe('INCREMENT_REPLAY', () => {
  test('increments replaysUsed', () => {
    const state = initialInterviewState(makeTestConfig());
    expect(state.replaysUsed).toBe(0);
    const next = interviewReducer(state, { type: 'INCREMENT_REPLAY' });
    expect(next.replaysUsed).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// INCREMENT_RECORD_ATTEMPT
// ---------------------------------------------------------------------------

describe('INCREMENT_RECORD_ATTEMPT', () => {
  test('increments recordAttempt', () => {
    const state = initialInterviewState(makeTestConfig());
    expect(state.recordAttempt).toBe(1);
    const next = interviewReducer(state, { type: 'INCREMENT_RECORD_ATTEMPT' });
    expect(next.recordAttempt).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// RESET_QUESTION_STATE
// ---------------------------------------------------------------------------

describe('RESET_QUESTION_STATE', () => {
  test('resets replaysUsed=0 and recordAttempt=1', () => {
    let state = initialInterviewState(makeTestConfig());
    state = interviewReducer(state, { type: 'INCREMENT_REPLAY' });
    state = interviewReducer(state, { type: 'INCREMENT_RECORD_ATTEMPT' });
    expect(state.replaysUsed).toBe(1);
    expect(state.recordAttempt).toBe(2);
    const next = interviewReducer(state, { type: 'RESET_QUESTION_STATE' });
    expect(next.replaysUsed).toBe(0);
    expect(next.recordAttempt).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// COMPLETE_SESSION
// ---------------------------------------------------------------------------

describe('COMPLETE_SESSION', () => {
  test('sets isComplete=true and endReason', () => {
    const state = initialInterviewState(makeTestConfig());
    const next = interviewReducer(state, { type: 'COMPLETE_SESSION', endReason: 'passThreshold' });
    expect(next.isComplete).toBe(true);
    expect(next.endReason).toBe('passThreshold');
  });
});

// ---------------------------------------------------------------------------
// isValidTransition
// ---------------------------------------------------------------------------

describe('isValidTransition', () => {
  test('returns true for all entries in VALID_TRANSITIONS', () => {
    for (const [from, targets] of Object.entries(VALID_TRANSITIONS)) {
      for (const to of targets) {
        expect(isValidTransition(from as QuestionPhase, to)).toBe(true);
      }
    }
  });

  test('returns false for invalid pairs', () => {
    expect(isValidTransition('greeting', 'feedback')).toBe(false);
    expect(isValidTransition('chime', 'grading')).toBe(false);
    expect(isValidTransition('feedback', 'greeting')).toBe(false);
    expect(isValidTransition('transition', 'greeting')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isValidQuestionPhase
// ---------------------------------------------------------------------------

describe('isValidQuestionPhase', () => {
  test('returns true for all 9 phases', () => {
    const phases: QuestionPhase[] = [
      'greeting',
      'chime',
      'typing',
      'reading',
      'responding',
      'transcription',
      'grading',
      'feedback',
      'transition',
    ];
    for (const phase of phases) {
      expect(isValidQuestionPhase(phase)).toBe(true);
    }
  });

  test('returns false for arbitrary strings', () => {
    expect(isValidQuestionPhase('invalid')).toBe(false);
    expect(isValidQuestionPhase('')).toBe(false);
    expect(isValidQuestionPhase('GREETING')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getSessionSnapshot
// ---------------------------------------------------------------------------

describe('getSessionSnapshot', () => {
  test('creates InterviewSnapshot with correct fields from state', () => {
    const config = makeTestConfig();
    const state = initialInterviewState(config);
    const snapshot = getSessionSnapshot(state, 'practice', 'session-interview-123');

    expect(snapshot.id).toBe('session-interview-123');
    expect(snapshot.type).toBe('interview');
    expect(snapshot.savedAt).toBeTruthy();
    expect(snapshot.version).toBeGreaterThanOrEqual(1);
    expect(snapshot.questions).toBe(state.questions);
    expect(snapshot.results).toBe(state.results);
    expect(snapshot.currentIndex).toBe(state.currentIndex);
    expect(snapshot.correctCount).toBe(state.correctCount);
    expect(snapshot.incorrectCount).toBe(state.incorrectCount);
    expect(snapshot.mode).toBe('practice');
    expect(snapshot.startTime).toBe(state.startTime);
  });
});
