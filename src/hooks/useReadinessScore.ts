'use client';

import { useState, useEffect, useMemo } from 'react';
import { calculateReadiness } from '@/lib/readiness';
import type { ReadinessResult } from '@/lib/readiness';
import { useCategoryMastery } from '@/hooks/useCategoryMastery';
import { getAllSRSCards } from '@/lib/srs/srsStore';
import { getAnswerHistory } from '@/lib/mastery';
import { getCategoryQuestionIds, USCIS_CATEGORIES } from '@/lib/mastery';
import type { USCISCategory } from '@/lib/mastery';
import { allQuestions, totalQuestions } from '@/constants/questions';
import type { SRSCardRecord } from '@/lib/srs/srsTypes';

/** Return type for the useReadinessScore hook */
export interface ReadinessScoreData {
  /** Complete readiness result (null while loading) */
  readiness: ReadinessResult | null;
  /** Whether async data is still loading */
  isLoading: boolean;
  /** Per-sub-category mastery percentages (proxied from useCategoryMastery) */
  subCategoryMasteries: Record<string, number>;
}

/**
 * Hook that composes the readiness scoring engine with IndexedDB data.
 *
 * Loads SRS cards and answer history from IndexedDB, combines with
 * category mastery from useCategoryMastery, and computes the readiness score
 * via calculateReadiness.
 *
 * Usage:
 * ```tsx
 * const { readiness, isLoading, subCategoryMasteries } = useReadinessScore();
 * ```
 */
export function useReadinessScore(): ReadinessScoreData {
  const { subCategoryMasteries, isLoading: masteryLoading } = useCategoryMastery();

  const [srsCards, setSrsCards] = useState<SRSCardRecord[]>([]);
  const [attemptedIds, setAttemptedIds] = useState<Set<string>>(new Set());
  const [asyncLoading, setAsyncLoading] = useState(true);

  // Load SRS cards and answer history from IndexedDB
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [cards, answers] = await Promise.all([getAllSRSCards(), getAnswerHistory()]);
        if (!cancelled) {
          setSrsCards(cards);
          setAttemptedIds(new Set(answers.map(a => a.questionId)));
          setAsyncLoading(false);
        }
      } catch {
        // IndexedDB may not be available (SSR, tests)
        if (!cancelled) {
          setSrsCards([]);
          setAttemptedIds(new Set());
          setAsyncLoading(false);
        }
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  // Build category question map for 60% cap check (3 main USCIS categories)
  const categoryQuestionMap: Record<string, string[]> = useMemo(() => {
    const map: Record<string, string[]> = {};
    const categories = Object.keys(USCIS_CATEGORIES) as USCISCategory[];
    for (const category of categories) {
      map[category] = getCategoryQuestionIds(category, allQuestions);
    }
    return map;
  }, []);

  // Map SRS card records to the format expected by calculateReadiness
  const mappedSrsCards = useMemo(() => {
    return srsCards.map(record => ({
      questionId: record.questionId,
      card: {
        ...record.card,
        // Coerce card.due to Date if it's a string (IndexedDB serialization)
        due: record.card.due instanceof Date ? record.card.due : new Date(record.card.due),
        last_review:
          record.card.last_review instanceof Date
            ? record.card.last_review
            : record.card.last_review
              ? new Date(record.card.last_review)
              : undefined,
      },
    }));
  }, [srsCards]);

  const isLoading = masteryLoading || asyncLoading;

  // Compute readiness score
  const readiness: ReadinessResult | null = useMemo(() => {
    if (isLoading) return null;

    return calculateReadiness({
      categoryMasteries: subCategoryMasteries,
      totalQuestions,
      attemptedQuestionIds: attemptedIds,
      srsCards: mappedSrsCards,
      categoryQuestionMap,
    });
  }, [isLoading, subCategoryMasteries, attemptedIds, mappedSrsCards, categoryQuestionMap]);

  return {
    readiness,
    isLoading,
    subCategoryMasteries,
  };
}
