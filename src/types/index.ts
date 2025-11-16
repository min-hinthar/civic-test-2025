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

export interface Question {
  id: number;
  question_en: string;
  question_my: string;
  category: Category;
  studyAnswers: StudyAnswer[]; // For flip cards (all possible correct answers)
  answers: Answer[]; // For quiz (1 correct, 3+ incorrect)
}

export interface QuestionResult {
  questionId: number;
  questionText_en: string;
  questionText_my: string;
  selectedAnswer: Answer;
  correctAnswer: Answer;
  isCorrect: boolean;
  category: Category;
}

export type TestEndReason = 'passThreshold' | 'failThreshold' | 'time' | 'complete';

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
