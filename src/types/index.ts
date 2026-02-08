export type Category =
  | 'Principles of American Democracy'
  | 'System of Government'
  | 'Rights and Responsibilities'
  | 'American History: Colonial Period and Independence'
  | 'American History: 1800s'
  | 'Recent American History and Other Important Historical Information'
  | 'Civics: Symbols and Holidays';

export interface StudyAnswer {
  text_en: string;
  text_my: string;
}

// For the quiz - one correct, multiple incorrect
export interface Answer {
  text_en: string;
  text_my: string;
  correct: boolean;
}

/**
 * Bilingual explanation content for a question.
 * Helps users understand WHY the answer is correct, not just restate it.
 */
export interface Explanation {
  /** 2-3 sentence explanation in English */
  brief_en: string;
  /** Natural Burmese rephrasing (NOT word-for-word translation) */
  brief_my: string;
  /** Optional memory aid in English */
  mnemonic_en?: string;
  /** Optional memory aid in Burmese (may differ from EN) */
  mnemonic_my?: string;
  /** Constitutional reference (only for constitutional questions) */
  citation?: string;
  /** Optional cultural connection / fun fact in English */
  funFact_en?: string;
  /** Fun fact in Burmese */
  funFact_my?: string;
  /** IDs for "See also" section linking related questions */
  relatedQuestionIds?: string[];
  /** Why common wrong answers are wrong (English) */
  commonMistake_en?: string;
  /** Common mistake explanation in Burmese */
  commonMistake_my?: string;
}

export interface Question {
  id: string; // Changed from number to string for stable IDs like 'GOV-01'
  question_en: string;
  question_my: string;
  category: Category;
  studyAnswers: StudyAnswer[]; // For flip cards (all possible correct answers)
  answers: Answer[]; // For quiz (1 correct, 3+ incorrect)
  explanation?: Explanation; // Optional for gradual rollout safety
}

export interface QuestionResult {
  questionId: string; // Changed from number to string for stable IDs
  questionText_en: string;
  questionText_my: string;
  selectedAnswer: Answer;
  correctAnswer: Answer;
  isCorrect: boolean;
  category: Category;
}

export type TestEndReason = 'passThreshold' | 'failThreshold' | 'time' | 'complete';

// Re-export Supabase types for convenience
export type {
  ProfileRow,
  MockTestResponseRow,
  MockTestRow,
  GoogleUserMetadata,
  StandardUserMetadata,
  UserMetadata,
} from './supabase';
export { isGoogleMetadata } from './supabase';

export interface TestSession {
  id?: string;
  date: string;
  score: number;
  totalQuestions: number;
  durationSeconds: number;
  passed: boolean;
  incorrectCount: number;
  endReason: TestEndReason;
  results: QuestionResult[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  testHistory: TestSession[];
}

// Interview Simulation types

export type InterviewMode = 'realistic' | 'practice';

export type InterviewEndReason = 'passThreshold' | 'failThreshold' | 'complete' | 'quit';

export interface InterviewResult {
  questionId: string;
  questionText_en: string;
  questionText_my: string;
  correctAnswers: Array<{ text_en: string; text_my: string }>;
  selfGrade: 'correct' | 'incorrect';
  category: Category;
}

export interface InterviewSession {
  id?: string;
  date: string;
  mode: InterviewMode;
  score: number;
  totalQuestions: number;
  durationSeconds: number;
  passed: boolean;
  endReason: InterviewEndReason;
  results: InterviewResult[];
}
