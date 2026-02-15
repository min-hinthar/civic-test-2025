import { describe, it, expect } from 'vitest';
import { gradeAnswer, normalize, extractKeywords } from './answerGrader';

describe('normalize', () => {
  it('lowercases text', () => {
    expect(normalize('George Washington')).toBe('george washington');
  });

  it('strips punctuation', () => {
    expect(normalize("it's the president!")).toBe('its the president');
  });

  it('collapses whitespace', () => {
    expect(normalize('  george   washington  ')).toBe('george washington');
  });

  it('converts number words to digits', () => {
    expect(normalize('fifty states')).toBe('50 states');
    expect(normalize('one hundred senators')).toBe('100 senators');
  });
});

describe('extractKeywords', () => {
  it('removes stop words', () => {
    const keywords = extractKeywords('the first president of the united states');
    expect(keywords).not.toContain('the');
    expect(keywords).not.toContain('of');
    expect(keywords).toContain('first');
    expect(keywords).toContain('president');
    expect(keywords).toContain('united');
    expect(keywords).toContain('states');
  });

  it('filters words with 2 or fewer characters', () => {
    const keywords = extractKeywords('it is a big country');
    expect(keywords).not.toContain('it');
    expect(keywords).not.toContain('is');
    expect(keywords).not.toContain('a');
    expect(keywords).toContain('big');
    expect(keywords).toContain('country');
  });

  it('extracts keywords from multi-word phrases', () => {
    const keywords = extractKeywords('freedom of speech');
    expect(keywords).toContain('freedom');
    expect(keywords).toContain('speech');
    expect(keywords).not.toContain('of');
  });
});

describe('gradeAnswer', () => {
  const firstPresidentAnswers = [{ text_en: 'George Washington' }];

  const freedomAnswers = [
    { text_en: 'freedom of speech' },
    { text_en: 'freedom of religion' },
    { text_en: 'freedom of assembly' },
    { text_en: 'freedom of the press' },
    { text_en: 'the right to petition the government' },
  ];

  // Test 1: Exact match
  it('returns correct with confidence 1.0 for exact match', () => {
    const result = gradeAnswer('George Washington', firstPresidentAnswers);
    expect(result.isCorrect).toBe(true);
    expect(result.confidence).toBe(1.0);
    expect(result.bestMatchAnswer).toBe('George Washington');
  });

  // Test 2: Case-insensitive
  it('matches case-insensitively', () => {
    const result = gradeAnswer('george washington', firstPresidentAnswers);
    expect(result.isCorrect).toBe(true);
    expect(result.confidence).toBe(1.0);
  });

  // Test 3: With articles/stop words
  it('strips stop words before matching', () => {
    const result = gradeAnswer('the George Washington', firstPresidentAnswers);
    expect(result.isCorrect).toBe(true);
    expect(result.confidence).toBe(1.0);
  });

  // Test 4: Partial match
  it('returns partial confidence for partial keyword match', () => {
    const result = gradeAnswer('Washington', firstPresidentAnswers);
    expect(result.confidence).toBe(0.5);
    expect(result.matchedKeywords).toContain('washington');
    expect(result.missingKeywords).toContain('george');
  });

  // Test 5: Multiple correct answers - matches one
  it('matches one of multiple correct answers', () => {
    const result = gradeAnswer('freedom of speech', freedomAnswers);
    expect(result.isCorrect).toBe(true);
    expect(result.bestMatchAnswer).toBe('freedom of speech');
  });

  // Test 6: Paraphrased / partial synonym match
  it('partially matches paraphrased answers sharing keywords', () => {
    const result = gradeAnswer('free speech', freedomAnswers);
    // "free" doesn't match "freedom" directly, but "speech" does
    expect(result.matchedKeywords).toContain('speech');
    expect(result.confidence).toBeGreaterThan(0);
  });

  // Test 7: Completely wrong answer
  it('returns isCorrect false and confidence 0 for wrong answer', () => {
    const result = gradeAnswer('Abraham Lincoln', firstPresidentAnswers);
    expect(result.isCorrect).toBe(false);
    expect(result.confidence).toBe(0);
  });

  // Test 8: Empty transcript
  it('returns isCorrect false for empty transcript', () => {
    const result = gradeAnswer('', firstPresidentAnswers);
    expect(result.isCorrect).toBe(false);
    expect(result.confidence).toBe(0);
  });

  // Test 9: Numeric answers
  it('handles numeric answer variants (word to digit)', () => {
    const result = gradeAnswer('50', [{ text_en: 'fifty (50)' }]);
    expect(result.isCorrect).toBe(true);
    expect(result.confidence).toBeGreaterThanOrEqual(0.5);
  });

  // Test 10: Multi-word keywords extraction
  it('extracts multiple keywords from expected answers', () => {
    const result = gradeAnswer('freedom of speech', [{ text_en: 'freedom of speech' }]);
    expect(result.matchedKeywords).toContain('freedom');
    expect(result.matchedKeywords).toContain('speech');
  });

  // Test 11: Threshold at 0.5 (default)
  it('passes at default threshold of 0.5 with 50% keyword match', () => {
    // "Washington" matches 1 of 2 keywords in "George Washington" = 0.5
    const result = gradeAnswer('Washington', firstPresidentAnswers, 0.5);
    expect(result.isCorrect).toBe(true);
  });

  // Test 12: Threshold at 0.8 (strict)
  it('fails at strict threshold of 0.8 with only partial match', () => {
    const result = gradeAnswer('Washington', firstPresidentAnswers, 0.8);
    expect(result.isCorrect).toBe(false);
  });

  // Test 13: Multiple valid answers - picks best match
  it('picks the best matching answer from multiple valid answers', () => {
    const result = gradeAnswer('freedom of the press', freedomAnswers);
    expect(result.isCorrect).toBe(true);
    expect(result.bestMatchAnswer).toBe('freedom of the press');
  });

  // Test 14: Special characters stripped
  it('handles special characters in transcript', () => {
    const result = gradeAnswer("it's George Washington!", firstPresidentAnswers);
    expect(result.isCorrect).toBe(true);
    expect(result.confidence).toBe(1.0);
  });

  // Test 15: Long answer with extra words
  it('handles long answers with extra words', () => {
    const result = gradeAnswer(
      'I think it was George Washington who was first',
      firstPresidentAnswers
    );
    expect(result.isCorrect).toBe(true);
    expect(result.matchedKeywords).toContain('george');
    expect(result.matchedKeywords).toContain('washington');
  });

  // Test 16: Synonym matching
  it('matches synonyms (liberty for freedom)', () => {
    const result = gradeAnswer('liberty of speech', freedomAnswers);
    expect(result.matchedKeywords.length).toBeGreaterThanOrEqual(2);
    expect(result.confidence).toBeGreaterThanOrEqual(0.5);
  });

  // Test 17: Handles text_my in expected answers (ignores it for EN grading)
  it('works when expected answers have text_my property', () => {
    const result = gradeAnswer('George Washington', [
      { text_en: 'George Washington', text_my: '\u1002\u103B\u1031\u102C\u1037' },
    ]);
    expect(result.isCorrect).toBe(true);
    expect(result.confidence).toBe(1.0);
  });

  // Test 18: GradeResult structure completeness
  it('returns complete GradeResult structure', () => {
    const result = gradeAnswer('George Washington', firstPresidentAnswers);
    expect(result).toHaveProperty('isCorrect');
    expect(result).toHaveProperty('confidence');
    expect(result).toHaveProperty('matchedKeywords');
    expect(result).toHaveProperty('missingKeywords');
    expect(result).toHaveProperty('bestMatchAnswer');
    expect(typeof result.isCorrect).toBe('boolean');
    expect(typeof result.confidence).toBe('number');
    expect(Array.isArray(result.matchedKeywords)).toBe(true);
    expect(Array.isArray(result.missingKeywords)).toBe(true);
    expect(typeof result.bestMatchAnswer).toBe('string');
  });
});
