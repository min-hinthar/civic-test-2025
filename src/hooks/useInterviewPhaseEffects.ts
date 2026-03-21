'use client';

/**
 * Interview Phase Effects Hook
 *
 * Encapsulates the useEffect-driven phase transition logic for the interview
 * state machine. Each question flows through phases:
 *   greeting -> chime -> typing -> reading -> responding -> transcription ->
 *   grading -> feedback -> transition -> chime (next question)
 *
 * Extracted from InterviewSession.tsx for line count budget (ARCH-04).
 * Speech/recording hooks remain in InterviewSession parent (D-15, D-16).
 */

import { useEffect, useCallback, type MutableRefObject } from 'react';
import {
  getEnglishAudioUrl,
  getBurmeseAudioUrl,
  getInterviewAudioUrl,
} from '@/lib/audio/audioPlayer';
import type { AudioPlayer } from '@/lib/audio/audioPlayer';
import { playChime } from '@/lib/interview/audioChime';
import { getRandomGreeting } from '@/lib/interview/interviewGreetings';
import { getCorrectFeedback, getIncorrectFeedback } from '@/lib/interview/interviewFeedback';
import {
  TYPING_INDICATOR_MS,
  TRANSITION_DELAY_MS,
  PASS_THRESHOLD,
  FAIL_THRESHOLD,
  QUESTIONS_PER_SESSION,
  type InterviewState,
  type InterviewAction,
} from '@/lib/interview/interviewStateMachine';
import type { InterviewMode, InterviewResult, InterviewEndReason } from '@/types';
import type { GradeResult } from '@/lib/interview/answerGrader';

interface PhaseEffectsDeps {
  state: InterviewState;
  dispatch: React.Dispatch<InterviewAction>;
  getEnglishPlayer: () => AudioPlayer;
  getBurmesePlayer: () => AudioPlayer;
  getInterviewPlayer: () => AudioPlayer;
  getNextMessageId: () => string;
  transitionTimerRef: MutableRefObject<ReturnType<typeof setTimeout> | null>;
  advanceTimerRef: MutableRefObject<ReturnType<typeof setTimeout> | null>;
  mode: InterviewMode;
  languageMode: string;
  showBurmese: boolean;
  numericRate: number;
  failedUrls: Set<string>;
  ttsFallbackSpeak: (text: string, opts?: { rate?: number }) => Promise<void>;
  cancelTTS: () => void;
  canUseSpeech: boolean;
  inputMode: 'voice' | 'text';
  resetTranscript: () => void;
  startListening: () => Promise<void>;
  startRecording: () => void;
  onCompleteRef: MutableRefObject<
    (r: InterviewResult[], dur: number, reason: InterviewEndReason) => void
  >;
  setUsingTTSFallback: (v: boolean) => void;
  setResponseStartTime: (v: number) => void;
  lastGradeResult: GradeResult | null;
  shouldReduceMotion: boolean;
  chatEndRef: MutableRefObject<HTMLDivElement | null>;
}

export function useInterviewPhaseEffects(deps: PhaseEffectsDeps) {
  const {
    state,
    dispatch,
    getEnglishPlayer,
    getBurmesePlayer,
    getInterviewPlayer,
    getNextMessageId,
    transitionTimerRef,
    advanceTimerRef,
    mode,
    languageMode,
    showBurmese,
    numericRate,
    failedUrls,
    ttsFallbackSpeak,
    cancelTTS,
    canUseSpeech,
    inputMode,
    resetTranscript,
    startListening,
    startRecording,
    onCompleteRef,
    setUsingTTSFallback,
    setResponseStartTime,
    lastGradeResult,
    shouldReduceMotion,
    chatEndRef,
  } = deps;

  const currentQuestion = state.questions[state.currentIndex];

  // Safe play helpers
  const safePlayQuestion = useCallback(
    async (qId: string, qText?: string) => {
      const url = getEnglishAudioUrl(qId, 'q');
      if (failedUrls.has(url)) {
        setUsingTTSFallback(true);
        try {
          if (qText) await ttsFallbackSpeak(qText, { rate: numericRate });
          return 'completed' as const;
        } catch {
          return 'error' as const;
        }
      }
      try {
        setUsingTTSFallback(false);
        await getEnglishPlayer().play(url, numericRate);
        return 'completed' as const;
      } catch {
        setUsingTTSFallback(true);
        try {
          if (qText) await ttsFallbackSpeak(qText, { rate: numericRate });
          return 'completed' as const;
        } catch {
          return 'error' as const;
        }
      }
    },
    [numericRate, getEnglishPlayer, failedUrls, ttsFallbackSpeak, setUsingTTSFallback]
  );

  const safePlayInterview = useCallback(
    async (name: string) => {
      try {
        await getInterviewPlayer().play(getInterviewAudioUrl(name), numericRate);
        return 'completed' as const;
      } catch {
        return 'error' as const;
      }
    },
    [numericRate, getInterviewPlayer]
  );

  // Early termination check (real mode)
  const checkEarlyEnd = useCallback(
    (newResults: InterviewResult[], nc: number, ni: number): boolean => {
      if (mode !== 'realistic') return false;
      const announce = (text: string, audio: string, reason: InterviewEndReason) => {
        transitionTimerRef.current = setTimeout(() => {
          dispatch({
            type: 'ADD_MESSAGE',
            message: { id: getNextMessageId(), sender: 'examiner', text },
          });
          dispatch({ type: 'SET_EXAMINER_STATE', examinerState: 'speaking' });
          safePlayInterview(audio).then(() => {
            dispatch({ type: 'SET_EXAMINER_STATE', examinerState: 'idle' });
            onCompleteRef.current(
              newResults,
              Math.round((Date.now() - state.startTime) / 1000),
              reason
            );
          });
        }, 500);
      };
      if (nc >= PASS_THRESHOLD) {
        announce(
          "Congratulations! You've passed the civics test.",
          'pass-announce',
          'passThreshold'
        );
        return true;
      }
      if (ni >= FAIL_THRESHOLD) {
        announce(
          "Unfortunately, you didn't reach the passing score this time.",
          'fail-announce',
          'failThreshold'
        );
        return true;
      }
      return false;
    },
    [
      mode,
      dispatch,
      getNextMessageId,
      safePlayInterview,
      state.startTime,
      transitionTimerRef,
      onCompleteRef,
    ]
  );

  // Advance to next question or finish
  const advanceToNext = useCallback(() => {
    if (state.currentIndex >= QUESTIONS_PER_SESSION - 1) {
      onCompleteRef.current(
        state.results,
        Math.round((Date.now() - state.startTime) / 1000),
        'complete'
      );
      return;
    }
    dispatch({ type: 'ADVANCE_PHASE', phase: 'transition' });
    advanceTimerRef.current = setTimeout(() => {
      dispatch({ type: 'ADVANCE_INDEX' });
      dispatch({ type: 'RESET_QUESTION_STATE' });
      resetTranscript();
      dispatch({ type: 'ADVANCE_PHASE', phase: 'chime' });
    }, TRANSITION_DELAY_MS);
  }, [
    state.currentIndex,
    state.startTime,
    state.results,
    resetTranscript,
    dispatch,
    advanceTimerRef,
    onCompleteRef,
  ]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' });
  }, [state.chatMessages, state.questionPhase, shouldReduceMotion, chatEndRef]);

  // Phase: GREETING
  useEffect(() => {
    if (state.questionPhase !== 'greeting') return;
    console.debug('[analytics] interview_session_started', { interviewMode: mode, languageMode }); // eslint-disable-line no-console
    let cancelled = false;
    const { text, audio } = getRandomGreeting();
    dispatch({ type: 'SET_EXAMINER_STATE', examinerState: 'speaking' });
    dispatch({
      type: 'ADD_MESSAGE',
      message: { id: getNextMessageId(), sender: 'examiner', text },
    });
    safePlayInterview(audio).then(r => {
      if (cancelled) return;
      dispatch({ type: 'SET_EXAMINER_STATE', examinerState: 'idle' });
      transitionTimerRef.current = setTimeout(
        () => {
          if (!cancelled) dispatch({ type: 'ADVANCE_PHASE', phase: 'chime' });
        },
        r === 'completed' ? 800 : 0
      );
    });
    return () => {
      cancelled = true;
      getInterviewPlayer().cancel();
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, [
    state.questionPhase,
    safePlayInterview,
    dispatch,
    getNextMessageId,
    getInterviewPlayer,
    transitionTimerRef,
    mode,
    languageMode,
  ]);

  // Phase: CHIME
  useEffect(() => {
    if (state.questionPhase !== 'chime') return;
    playChime();
    transitionTimerRef.current = setTimeout(
      () => dispatch({ type: 'ADVANCE_PHASE', phase: 'typing' }),
      200
    );
    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, [state.questionPhase, dispatch, transitionTimerRef]);

  // Phase: TYPING
  useEffect(() => {
    if (state.questionPhase !== 'typing') return;
    transitionTimerRef.current = setTimeout(
      () => dispatch({ type: 'ADVANCE_PHASE', phase: 'reading' }),
      TYPING_INDICATOR_MS
    );
    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, [state.questionPhase, dispatch, transitionTimerRef]);

  // Phase: READING
  useEffect(() => {
    if (state.questionPhase !== 'reading' || !currentQuestion) return;
    let cancelled = false;
    dispatch({ type: 'SET_EXAMINER_STATE', examinerState: 'speaking' });
    setUsingTTSFallback(false);
    dispatch({
      type: 'ADD_MESSAGE',
      message: {
        id: getNextMessageId(),
        sender: 'examiner',
        text: currentQuestion.question_en,
        questionId: currentQuestion.id,
      },
    });
    safePlayQuestion(currentQuestion.id, currentQuestion.question_en).then(async r => {
      if (cancelled) return;
      if (r === 'completed' && showBurmese && mode === 'practice') {
        try {
          await getBurmesePlayer().play(getBurmeseAudioUrl(currentQuestion.id, 'q'), numericRate);
        } catch {
          /* Burmese audio failed - non-blocking */
        }
      }
      if (cancelled) return;
      dispatch({ type: 'SET_EXAMINER_STATE', examinerState: 'listening' });
      setUsingTTSFallback(false);
      setResponseStartTime(Date.now());
      if (canUseSpeech && inputMode === 'voice') {
        resetTranscript();
        startListening().catch(() => {});
        startRecording();
      }
      dispatch({ type: 'ADVANCE_PHASE', phase: 'responding' });
    });
    return () => {
      cancelled = true;
      getEnglishPlayer().cancel();
      getBurmesePlayer().cancel();
      cancelTTS();
    };
  }, [
    state.questionPhase,
    currentQuestion,
    safePlayQuestion,
    dispatch,
    getNextMessageId,
    canUseSpeech,
    resetTranscript,
    startListening,
    startRecording,
    showBurmese,
    mode,
    numericRate,
    getBurmesePlayer,
    getEnglishPlayer,
    inputMode,
    cancelTTS,
    setUsingTTSFallback,
    setResponseStartTime,
  ]);

  // Phase: FEEDBACK
  useEffect(() => {
    if (state.questionPhase !== 'feedback' || !currentQuestion) return;
    let cancelled = false;
    const last = state.results[state.results.length - 1];
    if (!last) return;
    dispatch({ type: 'SET_EXAMINER_STATE', examinerState: 'nodding' });
    transitionTimerRef.current = setTimeout(() => {
      if (!cancelled) dispatch({ type: 'SET_EXAMINER_STATE', examinerState: 'idle' });
    }, 600);
    if (mode === 'practice') {
      const allAns = currentQuestion.studyAnswers.map(a => a.text_en).join('; ');
      const fb = last.selfGrade === 'correct' ? getCorrectFeedback() : getIncorrectFeedback();
      const txt =
        last.selfGrade === 'correct'
          ? `${fb.text} The answer is: ${allAns}`
          : `${fb.text} The correct answer is: ${allAns}`;
      dispatch({
        type: 'ADD_MESSAGE',
        message: {
          id: getNextMessageId(),
          sender: 'examiner',
          text: txt,
          isCorrect: last.selfGrade === 'correct',
          gradeResult: lastGradeResult ?? undefined,
        },
      });
      safePlayInterview(fb.audio)
        .then(async () => {
          if (cancelled) return;
          try {
            const u = getEnglishAudioUrl(currentQuestion.id, 'a');
            if (failedUrls.has(u))
              await ttsFallbackSpeak(currentQuestion.studyAnswers[0]?.text_en ?? '', {
                rate: numericRate,
              });
            else await getEnglishPlayer().play(u, numericRate);
          } catch {
            /* non-blocking */
          }
        })
        .then(() => {
          if (!cancelled)
            transitionTimerRef.current = setTimeout(() => {
              if (!cancelled) advanceToNext();
            }, TRANSITION_DELAY_MS);
        });
    } else {
      dispatch({
        type: 'ADD_MESSAGE',
        message: { id: getNextMessageId(), sender: 'examiner', text: 'Thank you. Next question.' },
      });
      transitionTimerRef.current = setTimeout(() => {
        if (!cancelled) advanceToNext();
      }, 800);
    }
    return () => {
      cancelled = true;
      getInterviewPlayer().cancel();
      getEnglishPlayer().cancel();
      cancelTTS();
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.questionPhase]);

  return { safePlayQuestion, safePlayInterview, checkEarlyEnd, advanceToNext };
}
