'use client';

/**
 * Interview Handler Callbacks Hook
 *
 * Encapsulates user interaction callbacks for the interview session:
 * timer expired, manual submit, toggle input, transcript confirm,
 * re-record, typed submit, repeat question, self-grade, quit, emergency exit.
 *
 * Extracted from InterviewSession.tsx for line count budget (ARCH-04).
 * Returns stable callbacks that InterviewSession passes to sub-components.
 */

import { useCallback, useRef, useEffect } from 'react';
import type { AudioPlayer } from '@/lib/audio/audioPlayer';
import { gradeAnswer, type GradeResult } from '@/lib/interview/answerGrader';
import {
  getSessionSnapshot,
  MAX_REPLAYS,
  type InterviewState,
  type InterviewAction,
} from '@/lib/interview/interviewStateMachine';
import { saveSession } from '@/lib/sessions/sessionStore';
import { hapticLight, hapticMedium } from '@/lib/haptics';
import type { InterviewMode, InterviewResult, InterviewEndReason } from '@/types';

interface HandlerDeps {
  state: InterviewState;
  dispatch: React.Dispatch<InterviewAction>;
  getEnglishPlayer: () => AudioPlayer;
  getBurmesePlayer: () => AudioPlayer;
  getInterviewPlayer: () => AudioPlayer;
  getNextMessageId: () => string;
  mode: InterviewMode;
  sessionId?: string;
  canUseSpeech: boolean;
  inputMode: 'voice' | 'text';
  setInputMode: (v: 'voice' | 'text') => void;
  transcript: string;
  typedAnswer: string;
  setTypedAnswer: (v: string) => void;
  responseStartTime: number | null;
  setPreviousTranscription: (v: string) => void;
  setLastGradeResult: (v: GradeResult | null) => void;
  stopListening: () => void;
  stopRecording: () => void;
  startListening: () => Promise<void>;
  startRecording: () => void;
  resetTranscript: () => void;
  clearRecording: () => void;
  cleanupRecorder: () => void;
  cancelTTS: () => void;
  onCompleteRef: React.MutableRefObject<
    (r: InterviewResult[], dur: number, reason: InterviewEndReason) => void
  >;
  safePlayQuestion: (qId: string, qText?: string) => Promise<'completed' | 'error'>;
  checkEarlyEnd: (newResults: InterviewResult[], nc: number, ni: number) => boolean;
}

export function useInterviewHandlers(deps: HandlerDeps) {
  const {
    state,
    dispatch,
    getEnglishPlayer,
    getBurmesePlayer,
    getInterviewPlayer,
    getNextMessageId,
    mode,
    sessionId,
    canUseSpeech,
    inputMode,
    setInputMode,
    transcript,
    typedAnswer,
    setTypedAnswer,
    responseStartTime,
    setPreviousTranscription,
    setLastGradeResult,
    stopListening,
    stopRecording,
    startListening,
    startRecording,
    resetTranscript,
    clearRecording,
    cleanupRecorder,
    cancelTTS,
    onCompleteRef,
    safePlayQuestion,
    checkEarlyEnd,
  } = deps;

  const currentQuestion = state.questions[state.currentIndex];

  // Session save (D-18, D-19: getSessionSnapshot for atomic persistence)
  const saveSnap = useCallback(
    (newResults: InterviewResult[], nc: number, ni: number) => {
      if (!sessionId) return;
      const snap = getSessionSnapshot(
        {
          ...state,
          results: newResults,
          correctCount: nc,
          incorrectCount: ni,
          currentIndex: state.currentIndex + 1,
        },
        mode,
        sessionId
      );
      try {
        saveSession(snap).catch(() => {});
      } catch {
        // session save failed - non-blocking
      }
    },
    [sessionId, state, mode]
  );

  // Process grade result (shared between speech and text)
  const processGrade = useCallback(
    (userText: string, gr: GradeResult, responseTimeMs?: number) => {
      if (!currentQuestion) return;
      const result: InterviewResult = {
        questionId: currentQuestion.id,
        questionText_en: currentQuestion.question_en,
        questionText_my: currentQuestion.question_my,
        correctAnswers: currentQuestion.studyAnswers.map(a => ({
          text_en: a.text_en,
          text_my: a.text_my,
        })),
        selfGrade: gr.isCorrect ? 'correct' : 'incorrect',
        category: currentQuestion.category,
        confidence: gr.confidence,
        responseTimeMs,
        transcript: userText,
        matchedKeywords: gr.matchedKeywords,
        missingKeywords: gr.missingKeywords,
      };
      const newResults = [...state.results, result];
      const nc = gr.isCorrect ? state.correctCount + 1 : state.correctCount;
      const ni = gr.isCorrect ? state.incorrectCount : state.incorrectCount + 1;
      dispatch({ type: 'RECORD_RESULT', result });
      setLastGradeResult(gr);
      saveSnap(newResults, nc, ni);
      clearRecording();
      dispatch({ type: 'ADVANCE_PHASE', phase: 'feedback' });
      checkEarlyEnd(newResults, nc, ni);
    },
    [
      currentQuestion,
      state.results,
      state.correctCount,
      state.incorrectCount,
      dispatch,
      saveSnap,
      clearRecording,
      checkEarlyEnd,
      setLastGradeResult,
    ]
  );

  const handleTypedSubmitRef = useRef<() => void>(() => {});

  const handleTimerExpired = useCallback(() => {
    stopListening();
    stopRecording();
    if ((inputMode === 'text' || !canUseSpeech) && typedAnswer.trim())
      handleTypedSubmitRef.current();
    else dispatch({ type: 'ADVANCE_PHASE', phase: 'grading' });
  }, [stopListening, stopRecording, canUseSpeech, typedAnswer, inputMode, dispatch]);

  const handleManualSubmit = useCallback(() => {
    hapticLight();
    stopListening();
    stopRecording();
    dispatch({ type: 'ADVANCE_PHASE', phase: 'transcription' });
  }, [stopListening, stopRecording, dispatch]);

  const handleToggleInputMode = useCallback(() => {
    if (inputMode === 'voice') {
      hapticLight();
      stopListening();
      stopRecording();
      setInputMode('text');
    } else {
      hapticMedium();
      setInputMode('voice');
      if (canUseSpeech) {
        resetTranscript();
        startListening().catch(() => {});
        startRecording();
      }
    }
  }, [
    inputMode,
    stopListening,
    stopRecording,
    setInputMode,
    canUseSpeech,
    resetTranscript,
    startListening,
    startRecording,
  ]);

  const handleTranscriptConfirm = useCallback(() => {
    const ms = responseStartTime ? Date.now() - responseStartTime : undefined;
    const text = transcript.trim() || '(no answer)';
    dispatch({ type: 'ADD_MESSAGE', message: { id: getNextMessageId(), sender: 'user', text } });
    if (canUseSpeech && currentQuestion)
      processGrade(text, gradeAnswer(text, currentQuestion.studyAnswers), ms);
    else dispatch({ type: 'ADVANCE_PHASE', phase: 'grading' });
  }, [
    transcript,
    canUseSpeech,
    currentQuestion,
    responseStartTime,
    dispatch,
    getNextMessageId,
    processGrade,
  ]);

  const handleReRecord = useCallback(() => {
    if (transcript.trim()) setPreviousTranscription(transcript.trim());
    dispatch({ type: 'INCREMENT_RECORD_ATTEMPT' });
    resetTranscript();
    if (canUseSpeech) {
      startListening().catch(() => {});
      startRecording();
    }
    dispatch({ type: 'ADVANCE_PHASE', phase: 'responding' });
  }, [
    transcript,
    resetTranscript,
    canUseSpeech,
    startListening,
    startRecording,
    dispatch,
    setPreviousTranscription,
  ]);

  const handleTypedSubmit = useCallback(
    (text?: string) => {
      if (!currentQuestion) return;
      const t = (text ?? typedAnswer).trim();
      if (!t) return;
      const ms = responseStartTime ? Date.now() - responseStartTime : undefined;
      dispatch({
        type: 'ADD_MESSAGE',
        message: { id: getNextMessageId(), sender: 'user', text: t },
      });
      processGrade(t, gradeAnswer(t, currentQuestion.studyAnswers), ms);
      setTypedAnswer('');
    },
    [
      typedAnswer,
      currentQuestion,
      responseStartTime,
      dispatch,
      getNextMessageId,
      processGrade,
      setTypedAnswer,
    ]
  );
  useEffect(() => {
    handleTypedSubmitRef.current = handleTypedSubmit;
  }, [handleTypedSubmit]);

  const handleRepeat = useCallback(async () => {
    if (!currentQuestion || state.replaysUsed >= MAX_REPLAYS) return;
    stopListening();
    stopRecording();
    dispatch({ type: 'INCREMENT_REPLAY' });
    dispatch({ type: 'SET_EXAMINER_STATE', examinerState: 'speaking' });
    await new Promise(r => setTimeout(r, 500));
    const sr = await safePlayQuestion(currentQuestion.id, currentQuestion.question_en);
    dispatch({ type: 'SET_EXAMINER_STATE', examinerState: 'listening' });
    if (sr === 'completed' && canUseSpeech && inputMode === 'voice') {
      resetTranscript();
      startListening().catch(() => {});
      startRecording();
    }
  }, [
    currentQuestion,
    state.replaysUsed,
    stopListening,
    stopRecording,
    dispatch,
    safePlayQuestion,
    canUseSpeech,
    resetTranscript,
    startListening,
    startRecording,
    inputMode,
  ]);

  const handleSelfGrade = useCallback(
    (grade: 'correct' | 'incorrect') => {
      if (!currentQuestion) return;
      const result: InterviewResult = {
        questionId: currentQuestion.id,
        questionText_en: currentQuestion.question_en,
        questionText_my: currentQuestion.question_my,
        correctAnswers: currentQuestion.studyAnswers.map(a => ({
          text_en: a.text_en,
          text_my: a.text_my,
        })),
        selfGrade: grade,
        category: currentQuestion.category,
      };
      const newResults = [...state.results, result];
      const nc = grade === 'correct' ? state.correctCount + 1 : state.correctCount;
      const ni = grade === 'incorrect' ? state.incorrectCount + 1 : state.incorrectCount;
      dispatch({ type: 'RECORD_RESULT', result });
      saveSnap(newResults, nc, ni);
      clearRecording();
      if (checkEarlyEnd(newResults, nc, ni)) return;
      dispatch({ type: 'ADVANCE_PHASE', phase: 'feedback' });
    },
    [
      currentQuestion,
      state.results,
      state.correctCount,
      state.incorrectCount,
      dispatch,
      saveSnap,
      clearRecording,
      checkEarlyEnd,
    ]
  );

  const cancelAll = useCallback(() => {
    cancelTTS();
    getEnglishPlayer().cancel();
    getBurmesePlayer().cancel();
    stopListening();
    stopRecording();
    cleanupRecorder();
  }, [
    cancelTTS,
    getEnglishPlayer,
    getBurmesePlayer,
    stopListening,
    stopRecording,
    cleanupRecorder,
  ]);

  const handleQuit = useCallback(() => {
    cancelAll();
    onCompleteRef.current(state.results, Math.round((Date.now() - state.startTime) / 1000), 'quit');
  }, [cancelAll, state.results, state.startTime, onCompleteRef]);

  const handleEmergencyExit = useCallback(() => {
    cancelAll();
    getInterviewPlayer().cancel();
    onCompleteRef.current(state.results, Math.round((Date.now() - state.startTime) / 1000), 'quit');
  }, [cancelAll, getInterviewPlayer, state.results, state.startTime, onCompleteRef]);

  return {
    handleTimerExpired,
    handleManualSubmit,
    handleToggleInputMode,
    handleTranscriptConfirm,
    handleReRecord,
    handleTypedSubmit,
    handleRepeat,
    handleSelfGrade,
    handleQuit,
    handleEmergencyExit,
  };
}
