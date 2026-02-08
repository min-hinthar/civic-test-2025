'use client';

/**
 * SRS Context Provider
 *
 * Provides centralized deck state, optimistic updates, and sync triggers
 * for the spaced repetition system. All SRS UI components consume this context.
 *
 * Features:
 * - Loads deck from IndexedDB on mount
 * - Optimistic in-memory updates for add/remove/grade
 * - Automatic sync when user is logged in
 * - Due count reactivity via visibility change listener
 * - Works offline-first (local IndexedDB only, no login required)
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Card } from 'ts-fsrs';
import type { SRSCardRecord } from '@/lib/srs';
import {
  createNewSRSCard,
  gradeCard as gradeCardEngine,
  isDue,
  getNextReviewText,
  getAllSRSCards,
  setSRSCard,
  removeSRSCard as removeSRSCardFromStore,
  syncPendingSRSReviews,
  pullSRSCards,
  pushSRSCards,
  mergeSRSDecks,
  queueSRSSync,
} from '@/lib/srs';
import { useAuth } from '@/contexts/SupabaseAuthContext';

// ---------------------------------------------------------------------------
// Context value interface
// ---------------------------------------------------------------------------

interface SRSContextValue {
  /** All SRS cards in the deck */
  deck: SRSCardRecord[];
  /** Number of cards currently due for review */
  dueCount: number;
  /** Whether the deck is loading from IndexedDB */
  isLoading: boolean;
  /** Add a question to the SRS deck */
  addCard: (questionId: string) => Promise<void>;
  /** Remove a question from the SRS deck */
  removeCard: (questionId: string) => Promise<void>;
  /** Grade a card (Easy/Hard) and return updated card + bilingual interval text */
  gradeCard: (
    questionId: string,
    isEasy: boolean
  ) => Promise<{ card: Card; intervalText: { en: string; my: string } }>;
  /** Check if a question is already in the deck */
  isInDeck: (questionId: string) => boolean;
  /** Reload deck from IndexedDB */
  refreshDeck: () => Promise<void>;
  /** Get all due cards sorted by due date ascending (most overdue first) */
  getDueCards: () => SRSCardRecord[];
}

const SRSContext = createContext<SRSContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface SRSProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component for SRS deck state management.
 *
 * Loads the deck from IndexedDB on mount, provides optimistic add/remove/grade,
 * and syncs with Supabase when the user is logged in.
 */
export function SRSProvider({ children }: SRSProviderProps) {
  const { user } = useAuth();
  const [deck, setDeck] = useState<SRSCardRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // -------------------------------------------------------------------------
  // Derived: due count
  // -------------------------------------------------------------------------
  const dueCount: number = useMemo(() => deck.filter(r => isDue(r.card)).length, [deck]);

  // -------------------------------------------------------------------------
  // Load deck from IndexedDB on mount
  // -------------------------------------------------------------------------
  const loadDeck = useCallback(async (): Promise<SRSCardRecord[]> => {
    const cards = await getAllSRSCards();
    return cards;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const cards = await loadDeck();
        if (cancelled) return;
        setDeck(cards);
      } catch (error) {
        console.error('[SRSContext] Failed to load deck:', error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [loadDeck]);

  // -------------------------------------------------------------------------
  // refreshDeck: reload from IndexedDB
  // -------------------------------------------------------------------------
  const refreshDeck = useCallback(async () => {
    try {
      const cards = await loadDeck();
      setDeck(cards);
    } catch (error) {
      console.error('[SRSContext] Failed to refresh deck:', error);
    }
  }, [loadDeck]);

  // -------------------------------------------------------------------------
  // Due count reactivity: refresh on visibility change
  // -------------------------------------------------------------------------
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        refreshDeck();
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshDeck]);

  // -------------------------------------------------------------------------
  // Sync with Supabase when user is logged in
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!user?.id || isLoading) return;

    let cancelled = false;

    async function syncWithRemote() {
      try {
        // 1. Push any queued offline changes
        await syncPendingSRSReviews(user!.id);

        // 2. Pull remote state
        const remote = await pullSRSCards(user!.id);

        if (cancelled) return;

        // 3. Merge local + remote
        const local = await getAllSRSCards();
        const merged = mergeSRSDecks(local, remote);

        // 4. Write merged deck back to IndexedDB
        for (const record of merged) {
          await setSRSCard(record);
        }

        // 5. Push merged state to Supabase
        await pushSRSCards(user!.id, merged);

        if (cancelled) return;

        // 6. Update in-memory state
        setDeck(merged);
      } catch (error) {
        console.error('[SRSContext] Sync failed:', error);
        // Sync failure is non-fatal; local deck remains functional
      }
    }

    syncWithRemote();
    return () => {
      cancelled = true;
    };
  }, [user?.id, isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // -------------------------------------------------------------------------
  // getDueCards: due cards sorted by due date ascending
  // -------------------------------------------------------------------------
  const getDueCards = useCallback((): SRSCardRecord[] => {
    return deck
      .filter(r => isDue(r.card))
      .sort((a, b) => a.card.due.getTime() - b.card.due.getTime());
  }, [deck]);

  // -------------------------------------------------------------------------
  // isInDeck: check if questionId is in the deck
  // -------------------------------------------------------------------------
  const isInDeck = useCallback(
    (questionId: string): boolean => {
      return deck.some(r => r.questionId === questionId);
    },
    [deck]
  );

  // -------------------------------------------------------------------------
  // addCard: create card, persist, and optimistically update
  // -------------------------------------------------------------------------
  const addCard = useCallback(
    async (questionId: string) => {
      // Skip if already in deck
      if (deck.some(r => r.questionId === questionId)) return;

      const newCard = createNewSRSCard();
      const record: SRSCardRecord = {
        questionId,
        card: newCard,
        addedAt: new Date().toISOString(),
      };

      // Persist to IndexedDB
      await setSRSCard(record);

      // Optimistic in-memory update
      setDeck(prev => [...prev, record]);

      // Queue sync if logged in
      if (user?.id) {
        await queueSRSSync({
          questionId,
          record,
          reviewedAt: new Date().toISOString(),
          action: 'upsert',
        });
      }
    },
    [deck, user?.id]
  );

  // -------------------------------------------------------------------------
  // removeCard: delete from store and optimistically update
  // -------------------------------------------------------------------------
  const removeCard = useCallback(
    async (questionId: string) => {
      await removeSRSCardFromStore(questionId);

      // Optimistic in-memory update
      setDeck(prev => prev.filter(r => r.questionId !== questionId));

      // Queue delete sync if logged in
      if (user?.id) {
        // We need a placeholder record for the sync queue
        const existing = deck.find(r => r.questionId === questionId);
        if (existing) {
          await queueSRSSync({
            questionId,
            record: existing,
            reviewedAt: new Date().toISOString(),
            action: 'delete',
          });
        }
      }
    },
    [deck, user?.id]
  );

  // -------------------------------------------------------------------------
  // gradeCard: grade via FSRS engine, persist, and return result
  // -------------------------------------------------------------------------
  const gradeCardFn = useCallback(
    async (
      questionId: string,
      isEasy: boolean
    ): Promise<{ card: Card; intervalText: { en: string; my: string } }> => {
      const existing = deck.find(r => r.questionId === questionId);
      if (!existing) {
        throw new Error(`[SRSContext] Card not found: ${questionId}`);
      }

      // Grade via FSRS engine
      const result = gradeCardEngine(existing.card, isEasy);
      const updatedCard = result.card;
      const intervalText = getNextReviewText(updatedCard);

      // Update record
      const updatedRecord: SRSCardRecord = {
        ...existing,
        card: updatedCard,
        lastReviewedAt: new Date().toISOString(),
      };

      // Persist to IndexedDB
      await setSRSCard(updatedRecord);

      // Optimistic in-memory update
      setDeck(prev => prev.map(r => (r.questionId === questionId ? updatedRecord : r)));

      // Queue sync if logged in
      if (user?.id) {
        await queueSRSSync({
          questionId,
          record: updatedRecord,
          reviewedAt: new Date().toISOString(),
          action: 'upsert',
        });
      }

      return { card: updatedCard, intervalText };
    },
    [deck, user?.id]
  );

  // -------------------------------------------------------------------------
  // Context value (memoized)
  // -------------------------------------------------------------------------
  const value: SRSContextValue = useMemo(
    () => ({
      deck,
      dueCount,
      isLoading,
      addCard,
      removeCard,
      gradeCard: gradeCardFn,
      isInDeck,
      refreshDeck,
      getDueCards,
    }),
    [
      deck,
      dueCount,
      isLoading,
      addCard,
      removeCard,
      gradeCardFn,
      isInDeck,
      refreshDeck,
      getDueCards,
    ]
  );

  return <SRSContext.Provider value={value}>{children}</SRSContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Hook to access SRS context.
 *
 * @throws Error if used outside SRSProvider
 * @returns SRSContextValue
 */
export function useSRS(): SRSContextValue {
  const context = useContext(SRSContext);
  if (!context) {
    throw new Error('useSRS must be used within an SRSProvider');
  }
  return context;
}
