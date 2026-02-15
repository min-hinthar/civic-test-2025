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

export interface DynamicAnswerMeta {
  /** 'time' = changes with elections/appointments; 'state' = varies by user's location */
  type: 'time' | 'state';
  /** Semantic field name, e.g. 'president', 'senators', 'governor', 'capital' */
  field: string;
  /** ISO date when this answer was last verified, e.g. '2026-02-09' */
  lastVerified: string;
  /** Human-readable trigger for when to update, e.g. 'presidential election (every 4 years)' */
  updateTrigger: string;
}

export interface Question {
  id: string; // Changed from number to string for stable IDs like 'GOV-01'
  question_en: string;
  question_my: string;
  category: Category;
  studyAnswers: StudyAnswer[]; // For flip cards (all possible correct answers)
  answers: Answer[]; // For quiz (1 correct, 3+ incorrect)
  explanation?: Explanation; // Optional for gradual rollout safety
  /** Marks questions whose answers change over time or vary by location */
  dynamic?: DynamicAnswerMeta;
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
  InterviewSessionRow,
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
  /** Match confidence from answer grader (0-1), undefined for self-graded */
  confidence?: number;
  /** Time from question TTS end to answer submit in ms */
  responseTimeMs?: number;
  /** What user said (transcribed text), undefined for self-graded */
  transcript?: string;
  /** Keywords that matched expected answers */
  matchedKeywords?: string[];
  /** Keywords user missed from expected answers */
  missingKeywords?: string[];
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
