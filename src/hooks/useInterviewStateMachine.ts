'use client';

import { useReducer, useCallback, useRef } from 'react';

import {
  interviewReducer,
  initialInterviewState,
  type InterviewConfig,
  type InterviewState,
  type InterviewAction,
} from '@/lib/interview/interviewStateMachine';
import { createAudioPlayer, type AudioPlayer } from '@/lib/audio/audioPlayer';

// ---------------------------------------------------------------------------
// Return type
// ---------------------------------------------------------------------------

export interface UseInterviewStateMachine {
  state: InterviewState;
  dispatch: React.Dispatch<InterviewAction>;
  getEnglishPlayer: () => AudioPlayer;
  getBurmesePlayer: () => AudioPlayer;
  getInterviewPlayer: () => AudioPlayer;
  getNextMessageId: () => string;
  transitionTimerRef: React.RefObject<ReturnType<typeof setTimeout> | null>;
  advanceTimerRef: React.RefObject<ReturnType<typeof setTimeout> | null>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useInterviewStateMachine(config: InterviewConfig): UseInterviewStateMachine {
  const [state, dispatch] = useReducer(interviewReducer, config, initialInterviewState);

  // --- Audio player refs (lazy-initialised) ---

  const englishPlayerRef = useRef<AudioPlayer | null>(null);
  const getEnglishPlayer = useCallback((): AudioPlayer => {
    if (!englishPlayerRef.current) englishPlayerRef.current = createAudioPlayer();
    return englishPlayerRef.current;
  }, []);

  const burmesePlayerRef = useRef<AudioPlayer | null>(null);
  const getBurmesePlayer = useCallback((): AudioPlayer => {
    if (!burmesePlayerRef.current) burmesePlayerRef.current = createAudioPlayer();
    return burmesePlayerRef.current;
  }, []);

  const interviewPlayerRef = useRef<AudioPlayer | null>(null);
  const getInterviewPlayer = useCallback((): AudioPlayer => {
    if (!interviewPlayerRef.current) interviewPlayerRef.current = createAudioPlayer();
    return interviewPlayerRef.current;
  }, []);

  // --- Monotonic message ID counter ---

  const msgIdCounter = useRef(0);
  const getNextMessageId = useCallback((): string => {
    msgIdCounter.current += 1;
    return `msg-${msgIdCounter.current}`;
  }, []);

  // --- Timer refs (phase transition + advance-to-next) ---

  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Dev-mode dispatch logging ---

  const devDispatch: React.Dispatch<InterviewAction> =
    process.env.NODE_ENV === 'development'
      ? (action: InterviewAction) => {
          // eslint-disable-next-line no-console -- dev-only dispatch tracing (Phase 53 decision)
          console.debug('[interview]', action.type, action);
          dispatch(action);
        }
      : dispatch;

  return {
    state,
    dispatch: devDispatch,
    getEnglishPlayer,
    getBurmesePlayer,
    getInterviewPlayer,
    getNextMessageId,
    transitionTimerRef,
    advanceTimerRef,
  };
}
