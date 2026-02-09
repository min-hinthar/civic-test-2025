import { describe, it, expect } from 'vitest';
import { allQuestions, totalQuestions } from './index';

describe('Question Bank Validation', () => {
  it('has exactly 128 questions', () => {
    expect(totalQuestions).toBe(128);
    expect(allQuestions).toHaveLength(128);
  });

  it('all IDs are unique', () => {
    const ids = allQuestions.map((q) => q.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
    // If this fails, find duplicates:
    if (uniqueIds.size !== ids.length) {
      const seen = new Set<string>();
      const duplicates = ids.filter((id) => {
        if (seen.has(id)) return true;
        seen.add(id);
        return false;
      });
      console.error('Duplicate IDs:', duplicates);
    }
  });

  it('all questions have English text', () => {
    for (const q of allQuestions) {
      expect(q.question_en, `${q.id} missing question_en`).toBeTruthy();
    }
  });

  it('all questions have Burmese translations', () => {
    for (const q of allQuestions) {
      expect(q.question_my, `${q.id} missing question_my`).toBeTruthy();
      for (const sa of q.studyAnswers) {
        expect(sa.text_my, `${q.id} studyAnswer missing text_my`).toBeTruthy();
      }
      for (const a of q.answers) {
        expect(a.text_my, `${q.id} answer missing text_my`).toBeTruthy();
      }
    }
  });

  it('all questions have at least one study answer', () => {
    for (const q of allQuestions) {
      expect(
        q.studyAnswers.length,
        `${q.id} has no studyAnswers`,
      ).toBeGreaterThan(0);
    }
  });

  it('each question has exactly one correct quiz answer', () => {
    for (const q of allQuestions) {
      const correctCount = q.answers.filter((a) => a.correct).length;
      expect(
        correctCount,
        `${q.id} has ${correctCount} correct answers (expected 1)`,
      ).toBe(1);
    }
  });

  it('each question has at least 2 quiz answers (1 correct + 1 distractor minimum)', () => {
    for (const q of allQuestions) {
      expect(
        q.answers.length,
        `${q.id} has ${q.answers.length} answers`,
      ).toBeGreaterThanOrEqual(2);
    }
  });

  it('all questions belong to valid categories', () => {
    const validCategories = [
      'Principles of American Democracy',
      'System of Government',
      'Rights and Responsibilities',
      'American History: Colonial Period and Independence',
      'American History: 1800s',
      'Recent American History and Other Important Historical Information',
      'Civics: Symbols and Holidays',
    ];
    for (const q of allQuestions) {
      expect(
        validCategories,
        `${q.id} has invalid category: "${q.category}"`,
      ).toContain(q.category);
    }
  });

  it('IDs follow naming conventions', () => {
    const validPrefixes = [
      'GOV-P',
      'GOV-S',
      'RR-',
      'HIST-C',
      'HIST-1',
      'HIST-R',
      'SYM-',
    ];
    for (const q of allQuestions) {
      const hasValidPrefix = validPrefixes.some((prefix) =>
        q.id.startsWith(prefix),
      );
      expect(hasValidPrefix, `${q.id} does not match any valid ID prefix`).toBe(
        true,
      );
    }
  });

  describe('Dynamic Questions', () => {
    it('has dynamic questions marked', () => {
      const dynamicQs = allQuestions.filter((q) => q.dynamic);
      expect(dynamicQs.length).toBeGreaterThanOrEqual(9);
    });

    it('dynamic questions have valid type', () => {
      const dynamicQs = allQuestions.filter((q) => q.dynamic);
      for (const q of dynamicQs) {
        expect(
          ['time', 'state'],
          `${q.id} has invalid dynamic type: ${q.dynamic!.type}`,
        ).toContain(q.dynamic!.type);
      }
    });

    it('dynamic questions have valid lastVerified date format', () => {
      const dynamicQs = allQuestions.filter((q) => q.dynamic);
      for (const q of dynamicQs) {
        expect(q.dynamic!.lastVerified, `${q.id} missing lastVerified`).toMatch(
          /^\d{4}-\d{2}-\d{2}$/,
        );
      }
    });

    it('dynamic questions have field and updateTrigger', () => {
      const dynamicQs = allQuestions.filter((q) => q.dynamic);
      for (const q of dynamicQs) {
        expect(
          q.dynamic!.field,
          `${q.id} missing dynamic.field`,
        ).toBeTruthy();
        expect(
          q.dynamic!.updateTrigger,
          `${q.id} missing dynamic.updateTrigger`,
        ).toBeTruthy();
      }
    });

    it('time-dynamic questions include president, VP, chief justice, speaker, and party', () => {
      const timeDynamic = allQuestions.filter(
        (q) => q.dynamic?.type === 'time',
      );
      const fields = timeDynamic.map((q) => q.dynamic!.field);
      expect(fields).toContain('president');
      expect(fields).toContain('vicePresident');
      expect(fields).toContain('chiefJustice');
      expect(fields).toContain('speakerOfHouse');
      expect(fields).toContain('presidentParty');
    });

    it('state-dynamic questions include senators, representative, governor, and capital', () => {
      const stateDynamic = allQuestions.filter(
        (q) => q.dynamic?.type === 'state',
      );
      const fields = stateDynamic.map((q) => q.dynamic!.field);
      expect(fields).toContain('senators');
      expect(fields).toContain('representative');
      expect(fields).toContain('governor');
      expect(fields).toContain('capital');
    });
  });

  describe('Category Distribution', () => {
    it('has correct category counts', () => {
      const counts = new Map<string, number>();
      for (const q of allQuestions) {
        counts.set(q.category, (counts.get(q.category) || 0) + 1);
      }
      expect(counts.get('Principles of American Democracy')).toBe(17);
      expect(counts.get('System of Government')).toBe(46);
      expect(counts.get('Rights and Responsibilities')).toBe(13);
      expect(counts.get('American History: Colonial Period and Independence')).toBe(16);
      expect(counts.get('American History: 1800s')).toBe(9);
      expect(counts.get('Recent American History and Other Important Historical Information')).toBe(12);
      expect(counts.get('Civics: Symbols and Holidays')).toBe(15);
    });
  });
});
