/**
 * NBA (Next Best Action) Module
 *
 * Pure priority-logic engine that determines the best next action
 * for a user based on their learning state. No React dependencies.
 *
 * Usage:
 *   import { determineNextBestAction, NBAState, NBAInput } from '@/lib/nba';
 */

// Types
export type {
  NBAState,
  NBAStateType,
  NBAInput,
  NBAIcon,
  NewUserNBA,
  ReturningUserNBA,
  StreakAtRiskNBA,
  SRSDueNBA,
  WeakCategoryNBA,
  NoRecentTestNBA,
  TestReadyNBA,
  CelebrationNBA,
} from './nbaTypes';

// String catalog
export { getNBAContent } from './nbaStrings';
export type { NBAContent } from './nbaStrings';

// Determination function
export { determineNextBestAction } from './determineNBA';
