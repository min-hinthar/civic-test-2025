/**
 * Backwards Compatibility Layer
 *
 * This file re-exports the modular question bank for existing imports.
 * New code should import directly from '@/constants/questions'.
 *
 * @deprecated Import from '@/constants/questions' instead
 */

import { allQuestions, totalQuestions } from './questions';

/**
 * @deprecated Use `allQuestions` from '@/constants/questions' instead
 */
export const civicsQuestions = allQuestions;

/**
 * @deprecated Use `totalQuestions` from '@/constants/questions' instead
 */
export const totalCivicsQuestions = totalQuestions;
