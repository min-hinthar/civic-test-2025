/**
 * Tests for compositeScore - Leaderboard ranking formula.
 *
 * Covers: calculateCompositeScore with various input combinations,
 * weight verification, clamping, and edge cases.
 */
import { describe, it, expect } from 'vitest';
import { calculateCompositeScore } from './compositeScore';

describe('calculateCompositeScore', () => {
  it('returns 0 for all zero inputs', () => {
    const score = calculateCompositeScore({
      currentStreak: 0,
      bestTestAccuracy: 0,
      coveragePercent: 0,
    });
    expect(score).toBe(0);
  });

  it('returns 100 for perfect inputs (100% accuracy, 100% coverage, 30-day streak)', () => {
    const score = calculateCompositeScore({
      currentStreak: 30,
      bestTestAccuracy: 100,
      coveragePercent: 100,
    });
    expect(score).toBe(100);
  });

  // --- Accuracy weight: 50% ---
  it('accuracy at 100% contributes 50 points (50% weight)', () => {
    const score = calculateCompositeScore({
      currentStreak: 0,
      bestTestAccuracy: 100,
      coveragePercent: 0,
    });
    expect(score).toBe(50);
  });

  it('accuracy at 50% contributes 25 points', () => {
    const score = calculateCompositeScore({
      currentStreak: 0,
      bestTestAccuracy: 50,
      coveragePercent: 0,
    });
    expect(score).toBe(25);
  });

  it('accuracy at 80% contributes 40 points', () => {
    const score = calculateCompositeScore({
      currentStreak: 0,
      bestTestAccuracy: 80,
      coveragePercent: 0,
    });
    expect(score).toBe(40);
  });

  // --- Coverage weight: 30% ---
  it('coverage at 100% contributes 30 points (30% weight)', () => {
    const score = calculateCompositeScore({
      currentStreak: 0,
      bestTestAccuracy: 0,
      coveragePercent: 100,
    });
    expect(score).toBe(30);
  });

  it('coverage at 50% contributes 15 points', () => {
    const score = calculateCompositeScore({
      currentStreak: 0,
      bestTestAccuracy: 0,
      coveragePercent: 50,
    });
    expect(score).toBe(15);
  });

  // --- Streak weight: 20% ---
  it('streak at 30 days contributes 20 points (20% weight)', () => {
    const score = calculateCompositeScore({
      currentStreak: 30,
      bestTestAccuracy: 0,
      coveragePercent: 0,
    });
    expect(score).toBe(20);
  });

  it('streak at 15 days contributes 10 points (half of max 20)', () => {
    const score = calculateCompositeScore({
      currentStreak: 15,
      bestTestAccuracy: 0,
      coveragePercent: 0,
    });
    expect(score).toBe(10);
  });

  // --- Streak capping at 30 days ---
  it('streak capped at 30 days - 31 produces same as 30', () => {
    const score30 = calculateCompositeScore({
      currentStreak: 30,
      bestTestAccuracy: 0,
      coveragePercent: 0,
    });
    const score31 = calculateCompositeScore({
      currentStreak: 31,
      bestTestAccuracy: 0,
      coveragePercent: 0,
    });
    expect(score30).toBe(score31);
  });

  it('streak capped at 30 days - 100 produces same as 30', () => {
    const score30 = calculateCompositeScore({
      currentStreak: 30,
      bestTestAccuracy: 0,
      coveragePercent: 0,
    });
    const score100 = calculateCompositeScore({
      currentStreak: 100,
      bestTestAccuracy: 0,
      coveragePercent: 0,
    });
    expect(score30).toBe(score100);
  });

  // --- Clamping ---
  it('clamps negative accuracy to 0', () => {
    const score = calculateCompositeScore({
      currentStreak: 0,
      bestTestAccuracy: -50,
      coveragePercent: 0,
    });
    expect(score).toBe(0);
  });

  it('clamps accuracy above 100 to 100', () => {
    const score = calculateCompositeScore({
      currentStreak: 0,
      bestTestAccuracy: 150,
      coveragePercent: 0,
    });
    // Clamped to 100 * 0.5 = 50
    expect(score).toBe(50);
  });

  it('clamps negative coverage to 0', () => {
    const score = calculateCompositeScore({
      currentStreak: 0,
      bestTestAccuracy: 0,
      coveragePercent: -20,
    });
    expect(score).toBe(0);
  });

  it('clamps coverage above 100 to 100', () => {
    const score = calculateCompositeScore({
      currentStreak: 0,
      bestTestAccuracy: 0,
      coveragePercent: 200,
    });
    // Clamped to 100 * 0.3 = 30
    expect(score).toBe(30);
  });

  // --- Combined/intermediate values ---
  it('computes correctly for intermediate values', () => {
    // accuracy: 70 * 0.5 = 35
    // coverage: 40 * 0.3 = 12
    // streak: (10/30) * 100 * 0.2 = 6.67
    // total = 35 + 12 + 6.67 = 53.67, rounded to 54
    const score = calculateCompositeScore({
      currentStreak: 10,
      bestTestAccuracy: 70,
      coveragePercent: 40,
    });
    expect(score).toBe(54);
  });

  it('rounds to nearest integer', () => {
    // accuracy: 33 * 0.5 = 16.5
    // coverage: 33 * 0.3 = 9.9
    // streak: (1/30) * 100 * 0.2 = 0.667
    // total = 16.5 + 9.9 + 0.667 = 27.067, rounds to 27
    const score = calculateCompositeScore({
      currentStreak: 1,
      bestTestAccuracy: 33,
      coveragePercent: 33,
    });
    expect(score).toBe(27);
  });

  it('handles single-component non-zero correctly', () => {
    // Only streak of 1 day: (1/30) * 100 * 0.2 = 0.667, rounds to 1
    const score = calculateCompositeScore({
      currentStreak: 1,
      bestTestAccuracy: 0,
      coveragePercent: 0,
    });
    expect(score).toBe(1);
  });
});
