'use client';

/**
 * useSortSession Hook
 *
 * Wraps the sortReducer with side effects (sound, haptics) and provides
 * smart card source logic. Orchestrates the entire sort session lifecycle.
 *
 * Features:
 * - Smart card defaults: SRS due cards > weak areas > all cards
 * - Sound effects on each sort (fling + know/dont-know)
 * - Haptic feedback (medium for know, double for dont-know)
 * - Undo with sound feedback
 * - Personal best tracking in localStorage
 * - Computed segments array for progress bar
 * - Session persistence: save/load/resume/discard via IndexedDB
 */

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { sortReducer } from '@/lib/sort/sortReducer';
import type { SortAction, SortState } from '@/lib/sort/sortTypes';
import { allQuestions } from '@/constants/questions';
import { useSRS } from '@/contexts/SRSContext';
import { playFling, playKnow, playDontKnow, playSkip } from '@/lib/audio/soundEffects';
import { hapticMedium, hapticDouble } from '@/lib/haptics';
import { saveSession, getSessionsByType, deleteSession } from '@/lib/sessions/sessionStore';
import { SESSION_VERSION } from '@/lib/sessions/sessionTypes';
import type { SortSnapshot } from '@/lib/sessions/sessionTypes';
import type { Question } from '@/types';

// ---------------------------------------------------------------------------
// Personal best localStorage key
// ---------------------------------------------------------------------------

const PERSONAL_BEST_KEY = 'civic-prep-sort-personal-best';

/** Debounce interval for IndexedDB saves (ms) */
const SAVE_DEBOUNCE_MS = 2000;

interface PersonalBest {
  percentage: number;
  date: string;
  cardCount: number;
}

// ---------------------------------------------------------------------------
// Return type
// ---------------------------------------------------------------------------

export interface UseSortSessionReturn {
  state: SortState;
  dispatch: React.Dispatch<SortAction>;
  /** Start a sort session with smart card defaults */
  startSession: (categoryFilter?: string) => void;
  /** Handle a sort result (called by SwipeableCard onSwipe) */
  handleSort: (direction: 'know' | 'dont-know') => void;
  /** Handle animation completion */
  handleAnimationComplete: () => void;
  /** Handle undo */
  handleUndo: () => void;
  /** Start next drill round */
  startNextRound: () => void;
  /** Exit session */
  exitSession: () => void;
  /** Whether undo is available */
  canUndo: boolean;
  /** Computed segments array for progress bar */
  segments: ('know' | 'dont-know' | null)[];
  /** Personal best first-round % */
  personalBest: PersonalBest | null;
  /** Pending sort session loaded from IndexedDB (null if none) */
  pendingSession: SortSnapshot | null;
  /** Whether pending session check is still loading */
  isLoadingSession: boolean;
  /** Resume a saved sort session */
  resumeSession: (snapshot: SortSnapshot) => void;
  /** Discard a saved sort session */
  discardSession: () => void;
}

// ---------------------------------------------------------------------------
// Idle state constant
// ---------------------------------------------------------------------------

const IDLE_STATE: SortState = {
  phase: 'idle',
  round: 0,
  cards: [],
  currentIndex: 0,
  knownIds: new Set(),
  unknownIds: new Set(),
  allUnknownIds: new Set(),
  undoStack: [],
  roundHistory: [],
  startTime: 0,
  sourceCards: [],
};

// ---------------------------------------------------------------------------
// Active phases that should trigger session saves
// ---------------------------------------------------------------------------

const SAVE_PHASES = new Set(['sorting', 'animating', 'round-summary', 'countdown']);

// ---------------------------------------------------------------------------
// Read personal best from localStorage (pure helper)
// ---------------------------------------------------------------------------

function readPersonalBest(): PersonalBest | null {
  try {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(PERSONAL_BEST_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as PersonalBest;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Build SortSnapshot from current state (pure helper)
// ---------------------------------------------------------------------------

function buildSnapshot(state: SortState, sessionId: string): SortSnapshot {
  return {
    id: sessionId,
    type: 'sort',
    savedAt: new Date().toISOString(),
    version: SESSION_VERSION,
    sourceCardIds: state.sourceCards.map(c => c.id),
    round: state.round,
    knownIds: [...state.knownIds],
    unknownIds: [...state.unknownIds],
    allUnknownIds: [...state.allUnknownIds],
    remainingCardIds: state.cards.slice(state.currentIndex).map(c => c.id),
    currentIndex: state.currentIndex,
    roundHistory: state.roundHistory,
    categoryFilter: state.categoryFilter,
    startTime: state.startTime,
  };
}

// ---------------------------------------------------------------------------
// Reconstruct Question[] from IDs (pure helper)
// ---------------------------------------------------------------------------

const questionMap = new Map(allQuestions.map(q => [q.id, q]));

function questionsFromIds(ids: string[]): Question[] {
  const result: Question[] = [];
  for (const id of ids) {
    const q = questionMap.get(id);
    if (q) result.push(q);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useSortSession(): UseSortSessionReturn {
  const [state, dispatch] = useReducer(sortReducer, IDLE_STATE);
  const { getDueCards } = useSRS();

  // Session persistence state
  const [pendingSession, setPendingSession] = useState<SortSnapshot | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const sessionIdRef = useRef(`session-sort-${Date.now()}`);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // -------------------------------------------------------------------------
  // Load pending session on mount
  // -------------------------------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const sessions = await getSessionsByType('sort');
        if (!cancelled && sessions.length > 0) {
          setPendingSession(sessions[0] as SortSnapshot);
        }
      } catch {
        // IndexedDB failure is non-critical
      }
      if (!cancelled) {
        setIsLoadingSession(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  // -------------------------------------------------------------------------
  // Debounced save on state changes
  // -------------------------------------------------------------------------

  const statePhase = state.phase;
  const stateCurrentIndex = state.currentIndex;
  const stateRound = state.round;
  const roundHistoryLen = state.roundHistory.length;

  useEffect(() => {
    // Only save during active phases
    if (!SAVE_PHASES.has(statePhase)) return;

    // Don't save if no cards (session not started)
    if (state.cards.length === 0) return;

    // Clear any existing debounce timer
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      const snapshot = buildSnapshot(state, sessionIdRef.current);
      saveSession(snapshot).catch(() => {});
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
    // Track significant state changes that warrant a save
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statePhase, stateCurrentIndex, stateRound, roundHistoryLen]);

  // -------------------------------------------------------------------------
  // Delete session on completion (idle after active, or mastery)
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (statePhase === 'idle' || statePhase === 'mastery') {
      // Flush any pending save timer
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      deleteSession(sessionIdRef.current).catch(() => {});
    }
  }, [statePhase]);

  // -------------------------------------------------------------------------
  // Save final snapshot on unmount if session is active
  // -------------------------------------------------------------------------

  // Keep a ref to current state for unmount save (avoid stale closure)
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    return () => {
      // Flush any pending timer
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      // Save if session is active
      const s = stateRef.current;
      if (SAVE_PHASES.has(s.phase) && s.cards.length > 0) {
        const snapshot = buildSnapshot(s, sessionIdRef.current);
        saveSession(snapshot).catch(() => {});
      }
    };
  }, []);

  // -------------------------------------------------------------------------
  // Smart card source logic
  // -------------------------------------------------------------------------

  const getCards = useCallback(
    (categoryFilter?: string): Question[] => {
      // If category filter is provided, always filter to that category
      if (categoryFilter) {
        const filtered = allQuestions.filter(q => q.category === categoryFilter);
        return filtered.length > 0 ? filtered : allQuestions;
      }

      // 1. Try SRS due cards
      try {
        const dueCards = getDueCards();
        if (dueCards.length > 0) {
          // Map SRS card records to Question objects
          const dueQuestionIds = new Set(dueCards.map(c => c.questionId));
          const dueQuestions = allQuestions.filter(q => dueQuestionIds.has(q.id));
          if (dueQuestions.length > 0) return dueQuestions;
        }
      } catch {
        // SRS context may not be available, continue to fallback
      }

      // 2. Fallback: all questions
      // (Weak area detection requires async mastery data which is complex;
      // for sort mode, we default to all questions for simplicity)
      return allQuestions;
    },
    [getDueCards]
  );

  // -------------------------------------------------------------------------
  // Start session
  // -------------------------------------------------------------------------

  const startSession = useCallback(
    (categoryFilter?: string) => {
      // Generate fresh session ID for new session
      sessionIdRef.current = `session-sort-${Date.now()}`;
      const cards = getCards(categoryFilter);
      dispatch({
        type: 'START_SORT',
        payload: { cards, categoryFilter },
      });
    },
    [getCards]
  );

  // -------------------------------------------------------------------------
  // Resume session from snapshot
  // -------------------------------------------------------------------------

  const resumeSession = useCallback((snapshot: SortSnapshot) => {
    // Reconstruct Question objects from IDs
    const sourceCards = questionsFromIds(snapshot.sourceCardIds);
    const remainingCards = questionsFromIds(snapshot.remainingCardIds);

    // Use the snapshot's session ID so future saves overwrite it
    sessionIdRef.current = snapshot.id;

    dispatch({
      type: 'RESUME_SESSION',
      payload: {
        cards: remainingCards,
        sourceCards,
        round: snapshot.round,
        knownIds: new Set(snapshot.knownIds),
        unknownIds: new Set(snapshot.unknownIds),
        allUnknownIds: new Set(snapshot.allUnknownIds),
        currentIndex: snapshot.currentIndex,
        roundHistory: snapshot.roundHistory,
        categoryFilter: snapshot.categoryFilter,
        startTime: snapshot.startTime,
      },
    });

    // Clear pending session state
    setPendingSession(null);

    // Delete the old snapshot (will be re-saved as progress continues)
    deleteSession(snapshot.id).catch(() => {});
  }, []);

  // -------------------------------------------------------------------------
  // Discard saved session
  // -------------------------------------------------------------------------

  const discardSession = useCallback(() => {
    if (pendingSession) {
      deleteSession(pendingSession.id).catch(() => {});
    }
    setPendingSession(null);
  }, [pendingSession]);

  // -------------------------------------------------------------------------
  // Handle sort with sound + haptics
  // -------------------------------------------------------------------------

  const handleSort = useCallback((direction: 'know' | 'dont-know') => {
    // Sound: fling immediately
    try {
      playFling();
    } catch {
      // Sound failure must never break sort
    }

    // Delayed result sound (50ms after fling)
    setTimeout(() => {
      try {
        if (direction === 'know') {
          playKnow();
        } else {
          playDontKnow();
        }
      } catch {
        // Sound failure must never break sort
      }
    }, 50);

    // Haptic feedback
    if (direction === 'know') {
      hapticMedium();
    } else {
      hapticDouble();
    }

    // Dispatch sort action
    dispatch({ type: 'SORT_CARD', payload: { direction } });
  }, []);

  // -------------------------------------------------------------------------
  // Handle animation complete
  // -------------------------------------------------------------------------

  const handleAnimationComplete = useCallback(() => {
    dispatch({ type: 'ANIMATION_COMPLETE' });
  }, []);

  // -------------------------------------------------------------------------
  // Handle undo
  // -------------------------------------------------------------------------

  const handleUndo = useCallback(() => {
    try {
      playSkip();
    } catch {
      // Sound failure must never break undo
    }
    dispatch({ type: 'UNDO' });
  }, []);

  // -------------------------------------------------------------------------
  // Start next round
  // -------------------------------------------------------------------------

  const startNextRound = useCallback(() => {
    dispatch({ type: 'START_NEXT_ROUND' });
  }, []);

  // -------------------------------------------------------------------------
  // Exit session
  // -------------------------------------------------------------------------

  const exitSession = useCallback(() => {
    dispatch({ type: 'FINISH_SESSION' });
  }, []);

  // -------------------------------------------------------------------------
  // Derived: canUndo
  // -------------------------------------------------------------------------

  const canUndo = state.phase === 'sorting' && state.undoStack.length > 0;

  // -------------------------------------------------------------------------
  // Derived: segments array for progress bar
  // -------------------------------------------------------------------------

  const segments: ('know' | 'dont-know' | null)[] = useMemo(() => {
    if (state.cards.length === 0) return [];
    return state.cards.map((card, index) => {
      if (
        index >= state.currentIndex &&
        state.phase !== 'round-summary' &&
        state.phase !== 'mastery'
      )
        return null;
      if (state.knownIds.has(card.id)) return 'know';
      if (state.unknownIds.has(card.id)) return 'dont-know';
      return null;
    });
  }, [state.cards, state.currentIndex, state.knownIds, state.unknownIds, state.phase]);

  // -------------------------------------------------------------------------
  // Personal best: derived via useMemo (avoids setState in render/effect)
  // Reads from localStorage on mount, updates when first round completes.
  // -------------------------------------------------------------------------

  const roundHistoryLength = state.roundHistory.length;
  const personalBest: PersonalBest | null = useMemo(() => {
    const stored = readPersonalBest();

    if (roundHistoryLength === 0) return stored;

    // Find the first round result in history
    const firstRound = state.roundHistory.find(r => r.round === 1);
    if (!firstRound || firstRound.totalCards === 0) return stored;

    const pct = Math.round((firstRound.knownCount / firstRound.totalCards) * 100);
    if (!stored || pct > stored.percentage) {
      const newBest: PersonalBest = {
        percentage: pct,
        date: new Date().toISOString(),
        cardCount: firstRound.totalCards,
      };
      // Persist to localStorage
      try {
        localStorage.setItem(PERSONAL_BEST_KEY, JSON.stringify(newBest));
      } catch {
        // Storage failure is non-critical
      }
      return newBest;
    }

    return stored;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundHistoryLength]);

  return {
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
  };
}
