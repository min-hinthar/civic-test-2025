/**
 * Composite Score - Leaderboard ranking formula.
 *
 * Combines accuracy, coverage, and streak into a single 0-100 score
 * for leaderboard ranking.
 *
 * Weights:
 * - Accuracy: 50% (most important for test readiness)
 * - Coverage: 30% (rewards thoroughness/breadth)
 * - Streak: 20% (rewards consistency, capped at 30 days)
 *
 * Streak is capped at 30 days = 100% contribution to prevent
 * long-term users from being unbeatable on streak alone.
 */

/**
 * Calculate the composite score for leaderboard ranking.
 *
 * @param data.currentStreak - Current consecutive study days (0+)
 * @param data.bestTestAccuracy - Best test score as percentage (0-100)
 * @param data.coveragePercent - Percentage of unique questions answered (0-100)
 * @returns Integer score from 0 to 100
 */
export function calculateCompositeScore(data: {
  currentStreak: number;
  bestTestAccuracy: number;
  coveragePercent: number;
}): number {
  // Cap streak at 30 days for scoring purposes
  const streakScore = Math.min(data.currentStreak / 30, 1) * 100;
  const accuracyScore = Math.min(Math.max(data.bestTestAccuracy, 0), 100);
  const coverageScore = Math.min(Math.max(data.coveragePercent, 0), 100);

  const composite =
    accuracyScore * 0.5 +
    coverageScore * 0.3 +
    streakScore * 0.2;

  return Math.round(composite);
}
