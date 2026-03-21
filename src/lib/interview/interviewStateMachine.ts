/**
 * Interview State Machine
 *
 * Pure reducer implementing all interview session state transitions.
 * Extracted from InterviewSession.tsx for independent testability (ARCH-05).
 *
 * Phase transition map:
 *   greeting    -> chime
 *   chime       -> typing
 *   typing      -> reading
 *   reading     -> responding
 *   responding  -> transcription | grading
 *   transcription -> responding | grading
 *   grading     -> feedback
 *   feedback    -> transition
 *   transition  -> chime (next question cycle)
 *
 * Every ADVANCE_PHASE action is validated against VALID_TRANSITIONS.
 * Invalid transitions return state unchanged (same reference).
 */

import type { InterviewEndReason, InterviewMode, InterviewResult, Question } from '@/types';
import { SESSION_VERSION } from '@/lib/sessions/sessionTypes';
import type { InterviewSnapshot } from '@/lib/sessions/sessionTypes';
import type { GradeResult } from '@/lib/interview/answerGrader';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum replays per question */
export const MAX_REPLAYS = 2;

/** Maximum re-record attempts for transcription */
export const MAX_RECORD_ATTEMPTS = 3;

/** Timer duration for realistic mode in seconds */
export const REALISTIC_TIMER_SECONDS = 15;

/** Delay between grading and next question in ms */
export const TRANSITION_DELAY_MS = 1500;

/** Pass threshold for realistic mode */
export const PASS_THRESHOLD = 12;

/** Fail threshold for realistic mode */
export const FAIL_THRESHOLD = 9;

/** Number of questions per interview session */
export const QUESTIONS_PER_SESSION = 20;

/** Typing indicator display duration in ms */
export const TYPING_INDICATOR_MS = 1200;

/** Rate map for named speed to numeric playback rate */
export const RATE_MAP: Record<'slow' | 'normal' | 'fast', number> = {
  slow: 0.7,
  normal: 0.98,
  fast: 1.3,
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** The 9 phases of the interview question flow */
export type QuestionPhase =
  | 'greeting'
  | 'chime'
  | 'typing'
  | 'reading'
  | 'responding'
  | 'transcription'
  | 'grading'
  | 'feedback'
  | 'transition';

/** Examiner character animation state */
export type ExaminerState = 'idle' | 'speaking' | 'nodding' | 'listening';

/** A single chat message for the conversation log */
export interface ChatMessage {
  id: string;
  sender: 'examiner' | 'user';
  text: string;
  isCorrect?: boolean;
  confidence?: number;
  /** Question ID for Burmese replay button (examiner question messages only) */
  questionId?: string;
  /** Grade result for keyword highlighting in feedback */
  gradeResult?: GradeResult;
}

/** Full interview session state managed by the reducer */
export interface InterviewState {
  questions: Question[];
  currentIndex: number;
  results: InterviewResult[];
  correctCount: number;
  incorrectCount: number;
  questionPhase: QuestionPhase;
  chatMessages: ChatMessage[];
  examinerState: ExaminerState;
  isComplete: boolean;
  endReason: InterviewEndReason | null;
  replaysUsed: number;
  recordAttempt: number;
  startTime: number;
}

/** Configuration for creating initial interview state */
export interface InterviewConfig {
  questions: Question[];
  isResuming: boolean;
  initialIndex?: number;
  initialResults?: InterviewResult[];
  initialCorrectCount?: number;
  initialIncorrectCount?: number;
  initialStartTime?: number;
}

/** Discriminated union of all interview reducer actions */
export type InterviewAction =
  | { type: 'ADVANCE_PHASE'; phase: QuestionPhase }
  | { type: 'ADD_MESSAGE'; message: ChatMessage }
  | { type: 'SET_EXAMINER_STATE'; examinerState: ExaminerState }
  | { type: 'RECORD_RESULT'; result: InterviewResult }
  | { type: 'INCREMENT_REPLAY' }
  | { type: 'INCREMENT_RECORD_ATTEMPT' }
  | { type: 'RESET_QUESTION_STATE' }
  | { type: 'COMPLETE_SESSION'; endReason: InterviewEndReason };

// ---------------------------------------------------------------------------
// Transition Table
// ---------------------------------------------------------------------------

/** Valid phase transitions. Each phase maps to its allowed next phases. */
export const VALID_TRANSITIONS: Record<QuestionPhase, readonly QuestionPhase[]> = {
  greeting: ['chime'],
  chime: ['typing'],
  typing: ['reading'],
  reading: ['responding'],
  responding: ['transcription', 'grading'],
  transcription: ['responding', 'grading'],
  grading: ['feedback'],
  feedback: ['transition'],
  transition: ['chime'],
} as const;

/** All valid question phase strings */
const VALID_PHASES: readonly string[] = [
  'greeting',
  'chime',
  'typing',
  'reading',
  'responding',
  'transcription',
  'grading',
  'feedback',
  'transition',
] as const;

/**
 * Check if a phase transition is valid.
 */
export function isValidTransition(from: QuestionPhase, to: QuestionPhase): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}

/**
 * Runtime type guard for persisted phase strings.
 */
export function isValidQuestionPhase(phase: string): phase is QuestionPhase {
  return VALID_PHASES.includes(phase);
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Create initial interview state from config. Supports session resume.
 */
export function initialInterviewState(config: InterviewConfig): InterviewState {
  return {
    questions: config.questions,
    currentIndex: config.initialIndex ?? 0,
    results: config.initialResults ?? [],
    correctCount: config.initialCorrectCount ?? 0,
    incorrectCount: config.initialIncorrectCount ?? 0,
    questionPhase: config.isResuming ? 'chime' : 'greeting',
    chatMessages: [],
    examinerState: 'idle',
    isComplete: false,
    endReason: null,
    replaysUsed: 0,
    recordAttempt: 1,
    startTime: config.initialStartTime ?? Date.now(),
  };
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

/**
 * Interview state machine reducer. Phase-guarded transitions with exhaustive switch.
 */
export function interviewReducer(state: InterviewState, action: InterviewAction): InterviewState {
  switch (action.type) {
    case 'ADVANCE_PHASE': {
      if (!isValidTransition(state.questionPhase, action.phase)) {
        return state;
      }
      return { ...state, questionPhase: action.phase };
    }

    case 'ADD_MESSAGE': {
      return { ...state, chatMessages: [...state.chatMessages, action.message] };
    }

    case 'SET_EXAMINER_STATE': {
      return { ...state, examinerState: action.examinerState };
    }

    case 'RECORD_RESULT': {
      const isCorrect = action.result.selfGrade === 'correct';
      return {
        ...state,
        results: [...state.results, action.result],
        correctCount: state.correctCount + (isCorrect ? 1 : 0),
        incorrectCount: state.incorrectCount + (isCorrect ? 0 : 1),
      };
    }

    case 'INCREMENT_REPLAY': {
      return { ...state, replaysUsed: state.replaysUsed + 1 };
    }

    case 'INCREMENT_RECORD_ATTEMPT': {
      return { ...state, recordAttempt: state.recordAttempt + 1 };
    }

    case 'RESET_QUESTION_STATE': {
      return { ...state, replaysUsed: 0, recordAttempt: 1 };
    }

    case 'COMPLETE_SESSION': {
      return { ...state, isComplete: true, endReason: action.endReason };
    }

    default: {
      const _exhaustive: never = action;
      return state;
    }
  }
}

// ---------------------------------------------------------------------------
// Snapshot Helper
// ---------------------------------------------------------------------------

/**
 * Create an InterviewSnapshot from current reducer state for session persistence.
 */
export function getSessionSnapshot(
  state: InterviewState,
  mode: InterviewMode,
  sessionId: string
): InterviewSnapshot {
  return {
    id: sessionId,
    type: 'interview',
    savedAt: new Date().toISOString(),
    version: SESSION_VERSION,
    questions: state.questions,
    results: state.results,
    currentIndex: state.currentIndex,
    correctCount: state.correctCount,
    incorrectCount: state.incorrectCount,
    mode,
    startTime: state.startTime,
  };
}
