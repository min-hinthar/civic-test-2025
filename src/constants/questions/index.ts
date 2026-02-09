/**
 * Question Bank Barrel File
 *
 * Aggregates all category-specific question modules into a single export.
 * Each category file uses stable IDs for reliable SRS tracking:
 *
 * - GOV-P## : Principles of American Democracy (17 questions)
 * - GOV-S## : System of Government (46 questions)
 * - RR-##   : Rights and Responsibilities (13 questions)
 * - HIST-C##: American History: Colonial Period and Independence (16 questions)
 * - HIST-1##: American History: 1800s (9 questions)
 * - HIST-R##: Recent American History (12 questions)
 * - SYM-##  : Civics: Symbols and Holidays (15 questions)
 *
 * Total: 128 questions
 */

import type { Question } from '@/types';

// Category-specific exports
export { americanGovernmentQuestions } from './american-government';
export { colonialHistoryQuestions } from './american-history-colonial';
export { history1800sQuestions } from './american-history-1800s';
export { recentHistoryQuestions } from './american-history-recent';
export { rightsResponsibilitiesQuestions } from './rights-responsibilities';
export { symbolsHolidaysQuestions } from './symbols-holidays';
export { uscis2025Additions } from './uscis-2025-additions';

// Import for aggregation
import { americanGovernmentQuestions } from './american-government';
import { colonialHistoryQuestions } from './american-history-colonial';
import { history1800sQuestions } from './american-history-1800s';
import { recentHistoryQuestions } from './american-history-recent';
import { rightsResponsibilitiesQuestions } from './rights-responsibilities';
import { symbolsHolidaysQuestions } from './symbols-holidays';
import { uscis2025Additions } from './uscis-2025-additions';

/**
 * All civics questions aggregated from category modules.
 * Order matches original question bank for backwards compatibility.
 */
export const allQuestions: Question[] = [
  ...americanGovernmentQuestions, // GOV-P01-12, GOV-S01-35 (47 questions)
  ...rightsResponsibilitiesQuestions, // RR-01-10 (10 questions)
  ...colonialHistoryQuestions, // HIST-C01-13 (13 questions)
  ...history1800sQuestions, // HIST-101-107 (7 questions)
  ...recentHistoryQuestions, // HIST-R01-10 (10 questions)
  ...symbolsHolidaysQuestions, // SYM-01-13 (13 questions)
  ...uscis2025Additions, // 28 questions
];

/** Total number of civics questions */
export const totalQuestions = allQuestions.length;
