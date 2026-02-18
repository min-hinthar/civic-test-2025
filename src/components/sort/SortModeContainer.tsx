'use client';

/**
 * SortModeContainer
 *
 * Top-level orchestrator for flashcard sort mode. Wires the sortReducer
 * (via useSortSession) to all sort UI components and manages the full
 * lifecycle: sorting -> round-summary -> countdown -> mastery.
 *
 * Features:
 * - Session resume: shows ResumePromptModal when saved session found
 * - Auto-starts new session when no pending session exists
 * - Phase-based rendering: sorting, round-summary, countdown, mastery, idle
 * - Exit confirmation dialog with sort-specific messaging
 * - Aria live region for screen reader sort result announcements
 * - Confetti celebration on mastery (100% known)
 * - Auto-read of current card question text (gated on animation completion via 500ms delay)
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { X, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import clsx from 'clsx';

import { useSortSession } from '@/hooks/useSortSession';
import { SwipeableStack } from '@/components/sort/SwipeableStack';
import { SortProgress } from '@/components/sort/SortProgress';
import { KnowDontKnowButtons } from '@/components/sort/KnowDontKnowButtons';
import { SortCountdown } from '@/components/sort/SortCountdown';
import { RoundSummary } from '@/components/sort/RoundSummary';
import { SRSBatchAdd } from '@/components/sort/SRSBatchAdd';
import { ExitConfirmDialog } from '@/components/quiz/ExitConfirmDialog';
import { Confetti } from '@/components/celebrations/Confetti';
import { ResumePromptModal } from '@/components/sessions/ResumePromptModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAutoRead } from '@/hooks/useAutoRead';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTTSSettings } from '@/hooks/useTTSSettings';
import { getBurmeseAudioUrl, getEnglishAudioUrl } from '@/lib/audio/burmeseAudio';
import { playMasteryComplete } from '@/lib/audio/soundEffects';
import { MAX_ROUNDS } from '@/lib/sort/sortTypes';
import type { SortSnapshot, SessionSnapshot } from '@/lib/sessions/sessionTypes';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SortModeContainerProps {
  categoryFilter?: string;
  onExit: () => void;
}

// ---------------------------------------------------------------------------
// Bilingual labels
// ---------------------------------------------------------------------------

const labels = {
  round: { en: 'Round', my: '\u1021\u1000\u103C\u102D\u1019\u103A' },
  youKnowThemAll: {
    en: 'You know them all!',
    my: '\u1021\u102C\u1038\u101C\u102F\u1036\u1038\u101E\u102D\u1015\u102B\u1015\u103C\u102E',
  },
  amazing: {
    en: 'Amazing work!',
    my: '\u1021\u1036\u1037\u1019\u103E\u102C\u1015\u102B\u1015\u1032',
  },
  known: { en: 'Known', my: '\u101E\u102D\u1015\u102B\u1010\u101A\u103A' },
  backToStudy: {
    en: 'Back to Study Guide',
    my: '\u101C\u1031\u1037\u101C\u102C\u1019\u103E\u102F\u101C\u1019\u103A\u1038\u100A\u103D\u103E\u1014\u103A\u101E\u102D\u102F\u1037',
  },
  sortedAsKnow: {
    en: 'Sorted as Know',
    my: '\u101E\u102D\u1015\u102B\u1010\u101A\u103A\u101F\u102F\u1001\u103D\u1032\u1011\u102C\u1038\u1015\u102B\u1010\u101A\u103A',
  },
  sortedAsDontKnow: {
    en: "Sorted as Don't Know",
    my: '\u1019\u101E\u102D\u1015\u102B\u101F\u102F\u1001\u103D\u1032\u1011\u102C\u1038\u1015\u102B\u1010\u101A\u103A',
  },
  loading: {
    en: 'Loading cards...',
    my: '\u1000\u1010\u103A\u1019\u103B\u102C\u1038\u1010\u1004\u103A\u1014\u1031\u1015\u102B\u1010\u101A\u103A...',
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SortModeContainer({ categoryFilter, onExit }: SortModeContainerProps) {
  const {
    state,
    dispatch,
    startSession,
    handleSort,
    handleAnimationComplete,
    handleUndo,
    startNextRound,
    exitSession,
    canUndo,
    segments,
    personalBest,
    pendingSession,
    isLoadingSession,
    resumeSession,
    discardSession,
  } = useSortSession();

  const { showBurmese } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const { settings: tts } = useTTSSettings();
  const speedLabel = { slow: '0.75x', normal: '1x', fast: '1.25x' }[tts.rate];
  const numericRate = { slow: 0.7, normal: 0.98, fast: 1.3 }[tts.rate];

  // Current card for auto-read (null when no cards or sorting complete)
  const currentCard =
    state.phase === 'sorting' || state.phase === 'animating'
      ? (state.cards[state.currentIndex] ?? null)
      : null;

  // Auto-read question text after card animation settles (500ms delay)
  useAutoRead({
    text: currentCard?.question_en ?? '',
    enabled: currentCard !== null,
    triggerKey: currentCard?.id ?? '',
    lang: 'en-US',
    delay: 500, // Wait for card entrance animation to complete
    autoReadLang: tts.autoReadLang,
    englishAudioUrl: currentCard ? getEnglishAudioUrl(currentCard.id, 'q') : undefined,
    englishRate: numericRate,
    burmeseAudioUrl:
      showBurmese && currentCard ? getBurmeseAudioUrl(currentCard.id, 'q') : undefined,
    burmeseRate: numericRate,
  });

  // Exit dialog state
  const [showExitDialog, setShowExitDialog] = useState(false);

  // Pending sort direction for reduced motion button-initiated sorts
  const [pendingDirection, setPendingDirection] = useState<'know' | 'dont-know' | null>(null);

  // Resume modal state
  const [showResumeModal, setShowResumeModal] = useState(false);

  // Confetti state
  const [showConfetti, setShowConfetti] = useState(false);

  // Mastery sound played ref (prevent double-fire)
  const masteryPlayedRef = useRef(false);

  // Track whether session has been started (to prevent double-start)
  const sessionStartedRef = useRef(false);

  // Aria live announcement text
  const [announcement, setAnnouncement] = useState('');

  // -------------------------------------------------------------------------
  // Session loading: show resume modal or auto-start
  // -------------------------------------------------------------------------

  useEffect(() => {
    // Wait until loading is complete
    if (isLoadingSession) return;
    // Don't re-run if session already started
    if (sessionStartedRef.current) return;

    if (pendingSession) {
      setShowResumeModal(true);
    } else {
      sessionStartedRef.current = true;
      startSession(categoryFilter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingSession]);

  // Play mastery sound and show confetti when entering mastery phase
  useEffect(() => {
    if (state.phase === 'mastery' && !masteryPlayedRef.current) {
      masteryPlayedRef.current = true;
      try {
        playMasteryComplete();
      } catch {
        // Sound failure is non-critical
      }
      setShowConfetti(true);
    }
    // Reset ref when phase changes away from mastery
    if (state.phase !== 'mastery') {
      masteryPlayedRef.current = false;
    }
  }, [state.phase]);

  // -------------------------------------------------------------------------
  // Resume handlers
  // -------------------------------------------------------------------------

  const handleResume = useCallback(
    (session: SessionSnapshot) => {
      sessionStartedRef.current = true;
      setShowResumeModal(false);
      resumeSession(session as SortSnapshot);
    },
    [resumeSession]
  );

  const handleStartFresh = useCallback(
    (_session: SessionSnapshot) => {
      sessionStartedRef.current = true;
      setShowResumeModal(false);
      discardSession();
      startSession(categoryFilter);
    },
    [discardSession, startSession, categoryFilter]
  );

  const handleNotNow = useCallback(() => {
    sessionStartedRef.current = true;
    setShowResumeModal(false);
    startSession(categoryFilter);
  }, [startSession, categoryFilter]);

  // Handle sort with announcement
  const handleSortWithAnnouncement = useCallback(
    (direction: 'know' | 'dont-know') => {
      handleSort(direction);

      if (shouldReduceMotion) {
        // Under reduced motion, let SwipeableCard run a quick 200ms linear slide
        // before completing. setPendingDirection triggers the slide animation.
        setPendingDirection(direction);
      } else {
        // For button-initiated sorts, immediately complete the 'animating' phase.
        // Drag-initiated sorts fire onAnimationComplete from SwipeableCard after
        // the spring fling -- the second dispatch is a no-op (phase guard).
        handleAnimationComplete();
      }

      setAnnouncement(
        direction === 'know'
          ? showBurmese
            ? labels.sortedAsKnow.my
            : labels.sortedAsKnow.en
          : showBurmese
            ? labels.sortedAsDontKnow.my
            : labels.sortedAsDontKnow.en
      );
    },
    [handleSort, handleAnimationComplete, shouldReduceMotion, showBurmese]
  );

  // Wrap handleAnimationComplete to clear pendingDirection
  const handleAnimationCompleteWithClear = useCallback(() => {
    setPendingDirection(null);
    handleAnimationComplete();
  }, [handleAnimationComplete]);

  // Exit handlers
  const handleExitRequest = useCallback(() => {
    setShowExitDialog(true);
  }, []);

  const handleConfirmExit = useCallback(() => {
    setShowExitDialog(false);
    exitSession();
    onExit();
  }, [exitSession, onExit]);

  const handleCloseExitDialog = useCallback(() => {
    setShowExitDialog(false);
  }, []);

  // Countdown handlers
  const handleCountdownComplete = useCallback(() => {
    startNextRound();
  }, [startNextRound]);

  const handleCountdownSkip = useCallback(() => {
    startNextRound();
  }, [startNextRound]);

  const handleCountdownCancel = useCallback(() => {
    dispatch({ type: 'CANCEL_COUNTDOWN' });
  }, [dispatch]);

  const handleStartCountdown = useCallback(() => {
    dispatch({ type: 'START_COUNTDOWN' });
  }, [dispatch]);

  // Compute known count for mastery display
  const latestRound =
    state.roundHistory.length > 0 ? state.roundHistory[state.roundHistory.length - 1] : null;
  const totalKnown = latestRound?.knownCount ?? 0;

  // -------------------------------------------------------------------------
  // Loading state (checking for pending session)
  // -------------------------------------------------------------------------

  if (isLoadingSession) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-purple border-t-transparent mb-4" />
        <p className={clsx('text-muted-foreground', showBurmese && 'font-myanmar')}>
          {showBurmese ? labels.loading.my : labels.loading.en}
        </p>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Resume prompt modal
  // -------------------------------------------------------------------------

  if (showResumeModal && pendingSession) {
    return (
      <ResumePromptModal
        sessions={[pendingSession]}
        open={showResumeModal}
        onResume={handleResume}
        onStartFresh={handleStartFresh}
        onNotNow={handleNotNow}
      />
    );
  }

  // -------------------------------------------------------------------------
  // Idle / Loading
  // -------------------------------------------------------------------------

  if (state.phase === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className={clsx('text-muted-foreground', showBurmese && 'font-myanmar')}>
          {showBurmese ? labels.loading.my : labels.loading.en}
        </p>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Mastery celebration
  // -------------------------------------------------------------------------

  if (state.phase === 'mastery') {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center space-y-6">
        <Confetti
          fire={showConfetti}
          intensity="celebration"
          onComplete={() => setShowConfetti(false)}
        />

        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
        >
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-success/20 mb-4">
            <Trophy className="h-10 w-10 text-success" />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <h2 className="text-2xl font-extrabold text-foreground">{labels.youKnowThemAll.en}</h2>
          {showBurmese && (
            <p className="text-lg font-myanmar text-muted-foreground">{labels.youKnowThemAll.my}</p>
          )}
          <p className={clsx('text-base text-muted-foreground', showBurmese && 'font-myanmar')}>
            {showBurmese ? labels.amazing.my : labels.amazing.en}
          </p>
        </motion.div>

        {/* Final stats */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-6"
        >
          <div className="text-center">
            <p className="text-3xl font-black text-success tabular-nums">{totalKnown}</p>
            <p className={clsx('text-xs text-muted-foreground', showBurmese && 'font-myanmar')}>
              {showBurmese ? labels.known.my : labels.known.en}
            </p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black text-foreground tabular-nums">100%</p>
            <p className="text-xs text-muted-foreground">
              {state.roundHistory.length > 1
                ? `${state.roundHistory.length} ${showBurmese ? labels.round.my : 'rounds'}`
                : `1 ${showBurmese ? labels.round.my : 'round'}`}
            </p>
          </div>
        </motion.div>

        {/* Exit button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <button
            type="button"
            onClick={onExit}
            className={clsx(
              'inline-flex items-center justify-center gap-2',
              'rounded-xl px-8 py-3 min-h-[48px]',
              'bg-primary text-white font-semibold text-sm',
              'shadow-[0_4px_0_hsl(var(--primary)/0.5)]',
              'active:shadow-[0_1px_0_hsl(var(--primary)/0.5)] active:translate-y-[3px]',
              'transition-[box-shadow,transform] duration-100',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
            )}
          >
            <span className={clsx(showBurmese && 'font-myanmar')}>
              {showBurmese ? labels.backToStudy.my : labels.backToStudy.en}
            </span>
          </button>
        </motion.div>

        {/* Aria announcement */}
        <div role="status" aria-live="polite" className="sr-only">
          {labels.youKnowThemAll.en}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Round summary / Countdown (combined — RoundSummary renders both)
  // -------------------------------------------------------------------------

  if (state.phase === 'round-summary' || state.phase === 'countdown') {
    return (
      <>
        {/* Screen reader announcement for round completion */}
        <div role="status" aria-live="polite" className="sr-only">
          {`Round complete. ${state.knownIds.size} correct, ${state.unknownIds.size} to study.`}
        </div>
        <RoundSummary
          round={state.round}
          totalCards={state.cards.length}
          knownCount={state.knownIds.size}
          unknownCount={state.unknownIds.size}
          durationMs={Date.now() - state.startTime}
          unknownIds={[...state.unknownIds]}
          allUnknownIds={[...state.allUnknownIds]}
          roundHistory={state.roundHistory}
          sourceCards={state.sourceCards}
          personalBest={personalBest}
          onStartNextRound={startNextRound}
          onStartCountdown={handleStartCountdown}
          onFinishSession={handleConfirmExit}
          isMaxRounds={state.round >= MAX_ROUNDS}
          showBurmese={showBurmese}
        >
          {/* SRS batch add prompt */}
          <SRSBatchAdd unknownIds={[...state.unknownIds]} showBurmese={showBurmese} />
          {/* Countdown for auto-start next round */}
          {state.phase === 'countdown' && (
            <SortCountdown
              onComplete={handleCountdownComplete}
              onSkip={handleCountdownSkip}
              onCancel={handleCountdownCancel}
              showBurmese={showBurmese}
            />
          )}
        </RoundSummary>
      </>
    );
  }

  // -------------------------------------------------------------------------
  // Sorting / Animating (active card sort)
  // -------------------------------------------------------------------------

  return (
    <div className="flex flex-col gap-4">
      {/* Header: Round badge + Exit button */}
      <div className="flex items-center justify-between px-1">
        <div>
          {state.round > 1 && (
            <span
              className={clsx(
                'inline-flex items-center gap-1 rounded-full bg-accent-purple/15 px-3 py-0.5',
                'text-xs font-semibold text-accent-purple',
                showBurmese && 'font-myanmar'
              )}
            >
              {showBurmese
                ? `${labels.round.my} ${state.round}`
                : `${labels.round.en} ${state.round}`}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleExitRequest}
          className={clsx(
            'inline-flex items-center justify-center',
            'h-10 w-10 rounded-full',
            'text-muted-foreground hover:text-foreground hover:bg-muted/50',
            'transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
          )}
          aria-label="Exit sort mode"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Progress bar */}
      <SortProgress
        totalCards={state.cards.length}
        knowCount={state.knownIds.size}
        dontKnowCount={state.unknownIds.size}
        segments={segments}
        round={state.round}
        showBurmese={showBurmese}
      />

      {/* Card stack */}
      <SwipeableStack
        cards={state.cards}
        currentIndex={state.currentIndex}
        isAnimating={state.phase === 'animating'}
        onSwipe={handleSortWithAnnouncement}
        onAnimationComplete={handleAnimationCompleteWithClear}
        pendingDirection={pendingDirection}
        showBurmese={showBurmese}
        speedLabel={speedLabel}
        className="my-2"
      />

      {/* Know / Don't Know buttons */}
      <KnowDontKnowButtons
        onKnow={() => handleSortWithAnnouncement('know')}
        onDontKnow={() => handleSortWithAnnouncement('dont-know')}
        onUndo={handleUndo}
        canUndo={canUndo}
        disabled={state.phase === 'animating'}
        showBurmese={showBurmese}
      />

      {/* Exit confirmation dialog */}
      <ExitConfirmDialog
        open={showExitDialog}
        onClose={handleCloseExitDialog}
        onConfirmExit={handleConfirmExit}
        mode="sort"
        showBurmese={showBurmese}
      />

      {/* Aria live region for sort result announcements */}
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>
    </div>
  );
}
