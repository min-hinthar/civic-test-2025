'use client';

/**
 * ReviewSession - Full review session orchestrator.
 *
 * Manages the complete review lifecycle: setup -> reviewing -> summary.
 * Ties together SessionSetup, ReviewCard, RatingButtons, and SessionSummary
 * into a cohesive review experience with progress tracking and keyboard shortcuts.
 */

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSRSReview } from '@/hooks/useSRSReview';
import { useSRS } from '@/contexts/SRSContext';
import { Progress } from '@/components/ui/Progress';
import { SessionSetup } from '@/components/srs/SessionSetup';
import { ReviewCard, type RatingFeedback } from '@/components/srs/ReviewCard';
import { RatingButtons } from '@/components/srs/RatingButtons';
import { SessionSummary, type SessionResult } from '@/components/srs/SessionSummary';

// ---------------------------------------------------------------------------
// Burmese numeral helper (inline to avoid circular dep)
// ---------------------------------------------------------------------------

const BURMESE_DIGITS = [
  '\u1040', '\u1041', '\u1042', '\u1043', '\u1044',
  '\u1045', '\u1046', '\u1047', '\u1048', '\u1049',
];

function toBurmeseNumeral(n: number): string {
  return String(n)
    .split('')
    .map((ch) => BURMESE_DIGITS[Number(ch)] ?? ch)
    .join('');
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Feedback overlay duration in milliseconds */
const FEEDBACK_DURATION_MS = 1500;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ReviewSessionProps {
  /** Callback when user exits the review session */
  onExit: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Full review session orchestrator.
 *
 * Features:
 * - Phase rendering: setup -> reviewing -> summary
 * - Progress bar with card count ("Card X of Y")
 * - Optional count-up timer during review
 * - Rating feedback overlay with colored flash
 * - AnimatePresence card transitions
 * - Mid-session exit saves reviewed cards
 * - Keyboard shortcuts: arrows/h/e for rating, space/enter for flip
 * - Weak category nudge in summary links to /practice
 */
export function ReviewSession({ onExit }: ReviewSessionProps) {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const { showBurmese } = useLanguage();

  // SRS hooks
  const {
    phase,
    cards,
    currentIndex,
    sessionSize,
    results,
    timerEnabled,
    startSession,
    rateCard,
    exitSession,
    totalDue,
  } = useSRSReview();
  const { dueCount } = useSRS();

  // Local state for card flip and rating feedback
  const [isFlipped, setIsFlipped] = useState(false);
  const [ratingFeedback, setRatingFeedback] = useState<RatingFeedback | null>(null);
  const [isRating, setIsRating] = useState(false);
  const [lastRatingDirection, setLastRatingDirection] = useState<'left' | 'right'>('right');

  // Timer state (count-up)
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // -------------------------------------------------------------------------
  // Timer effect (count-up during reviewing phase)
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (phase !== 'reviewing' || !timerEnabled) return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, timerEnabled]);

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  const handleFlip = useCallback(() => {
    if (!isRating) {
      setIsFlipped((prev) => !prev);
    }
  }, [isRating]);

  const handleRate = useCallback(
    async (isEasy: boolean) => {
      if (isRating) return;
      setIsRating(true);
      setLastRatingDirection(isEasy ? 'right' : 'left');

      // Call the hook's rateCard (grades via FSRS, records result)
      await rateCard(isEasy);

      // Get the interval text from the last result
      // The hook appends result synchronously, but we need to show feedback
      // We show a simple feedback based on rating
      const currentCard = cards[currentIndex];
      if (currentCard) {
        // Show rating feedback for FEEDBACK_DURATION_MS
        setRatingFeedback({
          isEasy,
          intervalText: { en: 'Scheduling...', my: '\u1021\u1005\u102E\u1021\u1005\u1009\u103A\u1006\u103D\u1032\u1014\u1031\u1015\u102B\u101E\u100A\u103A...' },
        });

        // Wait for feedback duration, then clear and reset for next card
        await new Promise((resolve) => setTimeout(resolve, FEEDBACK_DURATION_MS));
        setRatingFeedback(null);
        setIsFlipped(false);
      }

      setIsRating(false);
    },
    [isRating, rateCard, cards, currentIndex]
  );

  const handleExitSession = useCallback(() => {
    exitSession();
  }, [exitSession]);

  const handlePracticeWeak = useCallback(
    (category: string) => {
      navigate(`/practice?category=${encodeURIComponent(category)}`);
    },
    [navigate]
  );

  // -------------------------------------------------------------------------
  // Keyboard shortcuts
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (phase !== 'reviewing') return;

    function handleKeyDown(e: KeyboardEvent) {
      // Flip: Space or Enter
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!isRating) {
          setIsFlipped((prev) => !prev);
        }
        return;
      }

      // Rating: only when card is flipped (answer visible)
      if (!isFlipped || isRating) return;

      if (e.key === 'ArrowRight' || e.key === 'e') {
        e.preventDefault();
        handleRate(true); // Easy
      } else if (e.key === 'ArrowLeft' || e.key === 'h') {
        e.preventDefault();
        handleRate(false); // Hard
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, isFlipped, isRating, handleRate]);

  // -------------------------------------------------------------------------
  // Timer format helper
  // -------------------------------------------------------------------------
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // -------------------------------------------------------------------------
  // Convert hook results to SessionSummary format
  // -------------------------------------------------------------------------
  const summaryResults: SessionResult[] = results.map((r) => ({
    questionId: r.questionId,
    rating: r.rating,
    intervalText: r.intervalText,
  }));

  // -------------------------------------------------------------------------
  // Phase rendering
  // -------------------------------------------------------------------------

  // Setup phase
  if (phase === 'setup') {
    return (
      <div className="max-w-md mx-auto">
        <SessionSetup
          totalDue={totalDue > 0 ? totalDue : dueCount}
          onStart={startSession}
          onBack={onExit}
        />
      </div>
    );
  }

  // Summary phase
  if (phase === 'summary') {
    return (
      <div className="max-w-md mx-auto">
        <SessionSummary
          results={summaryResults}
          onDone={onExit}
          onPracticeWeak={handlePracticeWeak}
        />
      </div>
    );
  }

  // Reviewing phase
  const currentCard = cards[currentIndex];
  if (!currentCard) return null;

  const progressValue = currentIndex;
  const progressMax = sessionSize;

  return (
    <div className="max-w-md mx-auto flex flex-col gap-4">
      {/* Top bar: Exit + Timer */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleExitSession}
          className={clsx(
            'flex items-center gap-1.5 text-sm text-muted-foreground',
            'hover:text-foreground transition-colors duration-150',
            'min-h-[44px] px-2',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
          )}
          aria-label="Exit review session"
        >
          <X className="h-4 w-4" />
          <span>Exit</span>
          {showBurmese && (
            <span className="font-myanmar ml-1">
              / {'\u1011\u103D\u1000\u103A\u1015\u102B'}
            </span>
          )}
        </button>

        {timerEnabled && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span className="font-mono tabular-nums">{formatTime(elapsedSeconds)}</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-sm font-medium text-foreground">
            Card {currentIndex + 1} of {sessionSize}
          </p>
          {showBurmese && (
            <p className="font-myanmar text-xs text-muted-foreground">
              {'\u1000\u1010\u103A'} {toBurmeseNumeral(currentIndex + 1)} / {toBurmeseNumeral(sessionSize)}
            </p>
          )}
        </div>
        <Progress
          value={progressValue}
          max={progressMax}
          size="sm"
        />
      </div>

      {/* Card with AnimatePresence transitions */}
      <div className="relative min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={
              shouldReduceMotion
                ? { opacity: 1 }
                : { opacity: 0, x: 60 }
            }
            animate={{ opacity: 1, x: 0 }}
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : {
                    opacity: 0,
                    x: lastRatingDirection === 'left' ? -100 : 100,
                  }
            }
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { type: 'spring', stiffness: 300, damping: 25 }
            }
          >
            <ReviewCard
              record={currentCard}
              isFlipped={isFlipped}
              onFlip={handleFlip}
              onRate={handleRate}
              showRatingFeedback={ratingFeedback}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Rating buttons - visible only when card is flipped */}
      <AnimatePresence>
        {isFlipped && !ratingFeedback && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { type: 'spring', stiffness: 400, damping: 25 }
            }
          >
            <RatingButtons
              onRate={handleRate}
              disabled={isRating}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flip hint when card is not flipped */}
      {!isFlipped && !ratingFeedback && (
        <p className="text-center text-sm text-muted-foreground">
          Tap card to reveal answer
          {showBurmese && (
            <span className="font-myanmar block text-xs mt-0.5">
              {'\u1021\u1016\u103C\u1031\u1000\u102D\u102F\u1000\u103C\u100A\u103A\u1037\u101B\u1014\u103A \u1000\u1010\u103A\u1000\u102D\u102F\u1014\u103E\u102D\u1015\u103A\u1015\u102B'}
            </span>
          )}
        </p>
      )}
    </div>
  );
}
