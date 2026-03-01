import { describe, it, expect } from 'vitest';
import { computeStudyPlan } from './studyPlanEngine';
import type { StudyPlanInput } from './studyPlanTypes';

/** Helper to build a default input with overrides */
function makeInput(overrides: Partial<StudyPlanInput> = {}): StudyPlanInput {
  return {
    readinessScore: 50,
    readinessTarget: 90,
    srsDueCount: 5,
    unpracticedCount: 60,
    weakCategories: [],
    testDate: '2026-03-20',
    lastMockTestDate: '2026-02-28',
    overallMastery: 50,
    now: new Date('2026-03-01T12:00:00Z'),
    ...overrides,
  };
}

describe('computeStudyPlan', () => {
  // ---------------------------------------------------------------------------
  // SRS review count
  // ---------------------------------------------------------------------------
  describe('SRS reviews', () => {
    it('returns srsReviewCount matching srsDueCount input', () => {
      const result = computeStudyPlan(makeInput({ srsDueCount: 8 }));
      expect(result.srsReviewCount).toBe(8);
    });

    it('caps srsReviewCount at 20', () => {
      const result = computeStudyPlan(makeInput({ srsDueCount: 25 }));
      expect(result.srsReviewCount).toBe(20);
    });
  });

  // ---------------------------------------------------------------------------
  // New question target (with date)
  // ---------------------------------------------------------------------------
  describe('new question target (with test date)', () => {
    it('distributes unpracticed questions evenly across remaining days', () => {
      // 60 unpracticed, testDate 2026-03-11 (10 days remaining from 2026-03-01)
      const result = computeStudyPlan(
        makeInput({
          unpracticedCount: 60,
          testDate: '2026-03-11',
          now: new Date('2026-03-01T12:00:00Z'),
        })
      );
      // ceil(60/10) = 6
      expect(result.newQuestionTarget).toBe(6);
    });

    it('caps newQuestionTarget at 15', () => {
      // 60 unpracticed, 2 days remaining -> ceil(60/2) = 30 -> capped at 15
      const result = computeStudyPlan(
        makeInput({
          unpracticedCount: 60,
          testDate: '2026-03-03',
          now: new Date('2026-03-01T12:00:00Z'),
        })
      );
      expect(result.newQuestionTarget).toBe(15);
    });

    it('has minimum of 3 when unpracticed questions exist', () => {
      // 3 unpracticed, 30 days remaining -> ceil(3/30) = 1 -> clamped to 3
      const result = computeStudyPlan(
        makeInput({
          unpracticedCount: 3,
          testDate: '2026-03-31',
          now: new Date('2026-03-01T12:00:00Z'),
        })
      );
      expect(result.newQuestionTarget).toBe(3);
    });

    it('returns 0 when no unpracticed questions remain', () => {
      const result = computeStudyPlan(makeInput({ unpracticedCount: 0 }));
      expect(result.newQuestionTarget).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // New question target (no-date mode)
  // ---------------------------------------------------------------------------
  describe('new question target (no-date mode)', () => {
    it('uses default pacing of max 10 per day', () => {
      const result = computeStudyPlan(
        makeInput({
          unpracticedCount: 60,
          testDate: null,
        })
      );
      expect(result.newQuestionTarget).toBe(10);
    });

    it('returns min 3 when some unpracticed exist', () => {
      const result = computeStudyPlan(
        makeInput({
          unpracticedCount: 2,
          testDate: null,
        })
      );
      expect(result.newQuestionTarget).toBe(3);
    });

    it('returns 0 when no unpracticed questions in no-date mode', () => {
      const result = computeStudyPlan(
        makeInput({
          unpracticedCount: 0,
          testDate: null,
        })
      );
      expect(result.newQuestionTarget).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // Drill recommendation
  // ---------------------------------------------------------------------------
  describe('drill recommendation', () => {
    it('recommends drill for weakest category below 50%', () => {
      const result = computeStudyPlan(
        makeInput({
          weakCategories: [
            { name: 'American History', mastery: 30 },
            { name: 'Integrated Civics', mastery: 45 },
          ],
        })
      );
      expect(result.drillRecommendation).not.toBeNull();
      expect(result.drillRecommendation!.category).toBe('American History');
      expect(result.drillRecommendation!.count).toBeGreaterThanOrEqual(5);
      expect(result.drillRecommendation!.count).toBeLessThanOrEqual(10);
    });

    it('returns null drillRecommendation when no weak categories', () => {
      const result = computeStudyPlan(makeInput({ weakCategories: [] }));
      expect(result.drillRecommendation).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // Mock test recommendation
  // ---------------------------------------------------------------------------
  describe('mock test recommendation', () => {
    it('recommends mock test when last was 5+ days ago and mastery >= 40', () => {
      const result = computeStudyPlan(
        makeInput({
          lastMockTestDate: '2026-02-24',
          overallMastery: 50,
          now: new Date('2026-03-01T12:00:00Z'),
        })
      );
      expect(result.mockTestRecommended).toBe(true);
    });

    it('does not recommend mock test when last was 1 day ago', () => {
      const result = computeStudyPlan(
        makeInput({
          lastMockTestDate: '2026-02-28',
          overallMastery: 50,
          now: new Date('2026-03-01T12:00:00Z'),
        })
      );
      expect(result.mockTestRecommended).toBe(false);
    });

    it('recommends mock test when never taken and mastery >= 40', () => {
      const result = computeStudyPlan(
        makeInput({
          lastMockTestDate: null,
          overallMastery: 50,
        })
      );
      expect(result.mockTestRecommended).toBe(true);
    });

    it('does not recommend mock test when mastery < 40', () => {
      const result = computeStudyPlan(
        makeInput({
          lastMockTestDate: null,
          overallMastery: 30,
        })
      );
      expect(result.mockTestRecommended).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // No-date mode
  // ---------------------------------------------------------------------------
  describe('no-date mode', () => {
    it('returns paceStatus null when testDate is null', () => {
      const result = computeStudyPlan(makeInput({ testDate: null }));
      expect(result.paceStatus).toBeNull();
    });

    it('returns daysRemaining null when testDate is null', () => {
      const result = computeStudyPlan(makeInput({ testDate: null }));
      expect(result.daysRemaining).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // Pace status
  // ---------------------------------------------------------------------------
  describe('pace status', () => {
    it('returns "ahead" when readiness fraction exceeds time fraction', () => {
      // readiness: 80/90 = 0.889, time fraction with 5 days remaining
      // approx totalDays = max(5+14, 30) = 30, timeFraction = (30-5)/30 = 0.833
      // 0.889 > 0.833 + 0.05 -> ahead
      const result = computeStudyPlan(
        makeInput({
          readinessScore: 80,
          readinessTarget: 90,
          testDate: '2026-03-06',
          now: new Date('2026-03-01T12:00:00Z'),
        })
      );
      expect(result.paceStatus).toBe('ahead');
    });

    it('returns "behind" when readiness fraction far below time fraction', () => {
      // readiness: 30/90 = 0.333, 5 days remaining
      // timeFraction = (30-5)/30 = 0.833
      // 0.333 < 0.833 - 0.05 -> behind
      const result = computeStudyPlan(
        makeInput({
          readinessScore: 30,
          readinessTarget: 90,
          testDate: '2026-03-06',
          now: new Date('2026-03-01T12:00:00Z'),
        })
      );
      expect(result.paceStatus).toBe('behind');
    });

    it('returns null paceStatus when daysRemaining is 0', () => {
      const result = computeStudyPlan(
        makeInput({
          testDate: '2026-03-01',
          now: new Date('2026-03-01T12:00:00Z'),
        })
      );
      expect(result.paceStatus).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // Edge cases
  // ---------------------------------------------------------------------------
  describe('edge cases', () => {
    it('handles test date today (daysRemaining = 0)', () => {
      const result = computeStudyPlan(
        makeInput({
          testDate: '2026-03-01',
          now: new Date('2026-03-01T12:00:00Z'),
        })
      );
      expect(result.daysRemaining).toBe(0);
    });

    it('handles test date in past (daysRemaining clamped to 0)', () => {
      const result = computeStudyPlan(
        makeInput({
          testDate: '2026-02-20',
          now: new Date('2026-03-01T12:00:00Z'),
        })
      );
      expect(result.daysRemaining).toBe(0);
    });

    it('clamps all targets when daysRemaining is 0', () => {
      const result = computeStudyPlan(
        makeInput({
          testDate: '2026-03-01',
          now: new Date('2026-03-01T12:00:00Z'),
          srsDueCount: 10,
          unpracticedCount: 50,
        })
      );
      // Should still return valid numbers (SRS due stays, new questions go to 0 or minimal)
      expect(result.daysRemaining).toBe(0);
      expect(result.srsReviewCount).toBeGreaterThanOrEqual(0);
      expect(result.newQuestionTarget).toBeGreaterThanOrEqual(0);
    });
  });

  // ---------------------------------------------------------------------------
  // Estimated minutes
  // ---------------------------------------------------------------------------
  describe('estimated minutes', () => {
    it('calculates estimated minutes correctly', () => {
      const result = computeStudyPlan(
        makeInput({
          srsDueCount: 10,
          unpracticedCount: 0,
          weakCategories: [],
          lastMockTestDate: '2026-03-01',
          overallMastery: 50,
          now: new Date('2026-03-01T12:00:00Z'),
        })
      );
      // srsReviewCount=10, newQuestionTarget=0, no drill, no mock
      // 10*0.5 + 0*1.0 + 0 + 0 = 5
      expect(result.estimatedMinutes).toBe(5);
    });

    it('includes mock test time when recommended', () => {
      const result = computeStudyPlan(
        makeInput({
          srsDueCount: 0,
          unpracticedCount: 0,
          weakCategories: [],
          lastMockTestDate: null,
          overallMastery: 50,
          now: new Date('2026-03-01T12:00:00Z'),
        })
      );
      // srs=0, new=0, no drill, mock=true -> 0 + 0 + 0 + 12 = 12
      expect(result.estimatedMinutes).toBe(12);
    });

    it('includes drill time in estimation', () => {
      const result = computeStudyPlan(
        makeInput({
          srsDueCount: 0,
          unpracticedCount: 0,
          weakCategories: [{ name: 'American History', mastery: 30 }],
          lastMockTestDate: '2026-03-01',
          overallMastery: 50,
          now: new Date('2026-03-01T12:00:00Z'),
        })
      );
      // srs=0, new=0, drill=count*1.0, no mock
      expect(result.drillRecommendation).not.toBeNull();
      const drillCount = result.drillRecommendation!.count;
      expect(result.estimatedMinutes).toBe(Math.round(drillCount * 1.0));
    });

    it('has minimum estimated time of 1 minute', () => {
      const result = computeStudyPlan(
        makeInput({
          srsDueCount: 0,
          unpracticedCount: 0,
          weakCategories: [],
          lastMockTestDate: '2026-03-01',
          overallMastery: 30, // no mock (mastery < 40)
          now: new Date('2026-03-01T12:00:00Z'),
        })
      );
      // All zeros -> min 1
      expect(result.estimatedMinutes).toBe(1);
    });
  });
});
