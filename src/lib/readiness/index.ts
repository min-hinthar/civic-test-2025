/**
 * Readiness Module
 *
 * Central export for readiness scoring and drill selection.
 *
 * Usage:
 *   import { calculateReadiness, getTierLabel, selectDrillQuestions } from '@/lib/readiness';
 */

// Readiness engine
export { calculateReadiness, getTierLabel } from './readinessEngine';
export {
  calculateAccuracy,
  calculateCoverage,
  calculateConsistency,
  findZeroCoverageCategories,
} from './readinessEngine';

// Drill selection
export { selectDrillQuestions } from './drillSelection';

// Types
export type {
  ReadinessInput,
  DimensionScore,
  ReadinessResult,
  TierLabel,
  DrillConfig,
} from './types';
