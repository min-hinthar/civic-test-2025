/**
 * Answer Grader - Keyword-based fuzzy answer grading for interview simulation
 *
 * Grades spoken civics answers by extracting keywords and comparing against
 * expected answer keywords. Designed for short, predictable civics phrases.
 */

export interface GradeResult {
  isCorrect: boolean;
  confidence: number; // 0-1 match quality
  matchedKeywords: string[];
  missingKeywords: string[];
  bestMatchAnswer: string; // Which expected answer matched best
}

// Stub implementations - TDD RED phase
export function normalize(_text: string): string {
  throw new Error('Not implemented');
}

export function extractKeywords(_answer: string): string[] {
  throw new Error('Not implemented');
}

export function gradeAnswer(
  _transcript: string,
  _expectedAnswers: Array<{ text_en: string; text_my?: string }>,
  _threshold?: number
): GradeResult {
  throw new Error('Not implemented');
}
