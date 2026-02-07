/**
 * useSRSDeck - Convenience hook for SRS deck management.
 *
 * Thin wrapper around SRSContext providing deck CRUD operations
 * plus bulk-add for adding multiple questions (e.g., weak areas) at once.
 */

import { useCallback } from 'react';
import { useSRS } from '@/contexts/SRSContext';
import {
  detectWeakAreas,
  getCategoryQuestionIds,
  USCIS_CATEGORIES,
} from '@/lib/mastery';
import type { CategoryMasteryEntry, USCISCategory } from '@/lib/mastery';
import { allQuestions } from '@/constants/questions';
import type { Category } from '@/types';

/**
 * Hook for SRS deck management operations.
 *
 * Provides deck state, CRUD, and convenience methods like bulk-add
 * and weak-question detection for integration with mastery data.
 */
export function useSRSDeck() {
  const { deck, dueCount, isLoading, addCard, removeCard, isInDeck } = useSRS();

  /**
   * Add multiple cards at once, skipping any already in the deck.
   *
   * @returns Count of newly added cards
   */
  const bulkAddCards = useCallback(
    async (questionIds: string[]): Promise<number> => {
      let added = 0;
      for (const qid of questionIds) {
        if (!isInDeck(qid)) {
          await addCard(qid);
          added++;
        }
      }
      return added;
    },
    [addCard, isInDeck]
  );

  /**
   * Get question IDs from weak categories (mastery < 60%).
   *
   * Identifies USCIS categories below threshold and collects all
   * question IDs from those categories for bulk-add to the SRS deck.
   */
  const getWeakQuestionIds = useCallback(
    (categoryMasteries: CategoryMasteryEntry[]): string[] => {
      const weakAreas = detectWeakAreas(categoryMasteries);
      const weakIds: string[] = [];

      for (const weak of weakAreas) {
        // Check if it's a USCIS main category
        if (weak.categoryId in USCIS_CATEGORIES) {
          const ids = getCategoryQuestionIds(
            weak.categoryId as USCISCategory,
            allQuestions
          );
          weakIds.push(...ids);
        } else {
          // Sub-category
          const ids = getCategoryQuestionIds(weak.categoryId as Category, allQuestions);
          weakIds.push(...ids);
        }
      }

      // Deduplicate
      return [...new Set(weakIds)];
    },
    []
  );

  return {
    deck,
    dueCount,
    isLoading,
    addCard,
    removeCard,
    isInDeck,
    bulkAddCards,
    getWeakQuestionIds,
  };
}
