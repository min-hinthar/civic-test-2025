/**
 * Study Plan Module
 *
 * Pure-function engine that computes daily study targets from learning
 * state and optional test date. No React dependencies.
 *
 * Usage:
 *   import { computeStudyPlan, StudyPlanInput, DailyPlan, PaceStatus } from '@/lib/studyPlan';
 */

// Types
export type { StudyPlanInput, DailyPlan, PaceStatus } from './studyPlanTypes';

// Engine
export { computeStudyPlan } from './studyPlanEngine';
