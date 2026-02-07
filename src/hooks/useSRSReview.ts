/**
 * useSRSReview - State machine hook for SRS review sessions.
 *
 * Manages the review session lifecycle: setup -> reviewing -> summary.
 * Handles card grading, session progress tracking, and mid-session exit.
 *
 * FSRS Rating.Again with enable_short_term will naturally re-schedule
 * "Hard" cards for minutes later, so no in-session re-queuing is needed.
 */

import { useCallback, useState } from 'react';
import { useSRS } from '@/contexts/SRSContext';
import type { SRSCardRecord, SessionPhase } from '@/lib/srs';

/** Result of grading a single card during a review session */
interface SessionReviewResult {
  questionId: string;
  rating: 'easy' | 'hard';
  intervalText: { en: string; my: string };
}

/**
 * Hook for managing an SRS review session.
 *
 * Provides a state machine (setup -> reviewing -> summary) with
 * card grading, progress tracking, and early exit support.
 */
export function useSRSReview() {
  const { getDueCards, gradeCard, dueCount } = useSRS();

  const [phase, setPhase] = useState<SessionPhase>('setup');
  const [cards, setCards] = useState<SRSCardRecord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<SessionReviewResult[]>([]);
  const [timerEnabled, setTimerEnabled] = useState(false);

  /**
   * Start a review session with a given number of cards.
   *
   * Pulls due cards from context, slices to requested size,
   * and transitions to the reviewing phase.
   */
  const startSession = useCallback(
    (size: number, enableTimer: boolean) => {
      const dueCards = getDueCards();
      const sessionCards = dueCards.slice(0, size);

      if (sessionCards.length === 0) return;

      setCards(sessionCards);
      setCurrentIndex(0);
      setResults([]);
      setTimerEnabled(enableTimer);
      setPhase('reviewing');
    },
    [getDueCards]
  );

  /**
   * Grade the current card and advance.
   *
   * Calls gradeCard on context, records the result, and either
   * advances to the next card or transitions to summary.
   */
  const rateCard = useCallback(
    async (isEasy: boolean) => {
      const currentCard = cards[currentIndex];
      if (!currentCard) return;

      const { intervalText } = await gradeCard(
        currentCard.questionId,
        isEasy
      );

      const result: SessionReviewResult = {
        questionId: currentCard.questionId,
        rating: isEasy ? 'easy' : 'hard',
        intervalText,
      };

      setResults((prev) => [...prev, result]);

      if (currentIndex < cards.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setPhase('summary');
      }
    },
    [cards, currentIndex, gradeCard]
  );

  /**
   * Exit the session early.
   *
   * Per user decision: "Exit mid-session saves progress -- reviewed
   * cards update, remaining stay in queue." Transitions directly to
   * summary with only the cards that were actually reviewed.
   */
  const exitSession = useCallback(() => {
    setPhase('summary');
  }, []);

  return {
    phase,
    cards,
    currentIndex,
    sessionSize: cards.length,
    results,
    timerEnabled,
    startSession,
    rateCard,
    exitSession,
    totalDue: dueCount,
  };
}
