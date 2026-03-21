'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ExaminerCharacter } from '@/components/interview/ExaminerCharacter';
import { InterviewHeader } from '@/components/interview/InterviewHeader';
import { InterviewChatArea } from '@/components/interview/InterviewChatArea';
import { InterviewRecordingArea } from '@/components/interview/InterviewRecordingArea';
import { QuitConfirmationDialog } from '@/components/interview/QuitConfirmationDialog';
import { LandscapeOverlay } from '@/components/interview/LandscapeOverlay';
import { useTTS } from '@/hooks/useTTS';
import { useInterviewGuard } from '@/hooks/useInterviewGuard';
import { useOrientationLock } from '@/hooks/useOrientationLock';
import { useVisibilityPause } from '@/hooks/useVisibilityPause';
import { useInterviewSpeech } from '@/hooks/useSpeechRecognition';
import { useSilenceDetection } from '@/hooks/useSilenceDetection';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useInterviewStateMachine } from '@/hooks/useInterviewStateMachine';
import { useInterviewPhaseEffects } from '@/hooks/useInterviewPhaseEffects';
import { useInterviewHandlers } from '@/hooks/useInterviewHandlers';
import type { PrecacheProgress } from '@/lib/audio/audioPrecache';
import type { GradeResult } from '@/lib/interview/answerGrader';
import {
  QUESTIONS_PER_SESSION,
  RATE_MAP,
  type InterviewConfig,
} from '@/lib/interview/interviewStateMachine';
import { fisherYatesShuffle } from '@/lib/shuffle';
import { allQuestions } from '@/constants/questions';
import { strings } from '@/lib/i18n/strings';
import { useLanguage } from '@/contexts/LanguageContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { InterviewMode, InterviewResult, InterviewEndReason, Question } from '@/types';

interface InterviewSessionProps {
  mode: InterviewMode;
  onComplete: (r: InterviewResult[], dur: number, reason: InterviewEndReason) => void;
  micPermission: boolean;
  speedOverride?: 'slow' | 'normal' | 'fast';
  sessionId?: string;
  initialQuestions?: Question[];
  initialResults?: InterviewResult[];
  initialIndex?: number;
  initialCorrectCount?: number;
  initialIncorrectCount?: number;
  initialStartTime?: number;
  precacheResult?: PrecacheProgress;
}

export function InterviewSession({
  mode,
  onComplete,
  micPermission,
  speedOverride,
  sessionId,
  initialQuestions,
  initialResults,
  initialIndex,
  initialCorrectCount,
  initialIncorrectCount,
  initialStartTime,
  precacheResult,
}: InterviewSessionProps) {
  const { showBurmese: globalShowBurmese, mode: languageMode } = useLanguage();
  const showBurmese = mode === 'realistic' ? false : globalShowBurmese;
  const shouldReduceMotion = useReducedMotion();
  const { speak: ttsFallbackSpeak, cancel: cancelTTS, settings: ttsSettings } = useTTS();
  const effectiveSpeed = mode === 'realistic' ? 'normal' : (speedOverride ?? ttsSettings.rate);
  const numericRate = RATE_MAP[effectiveSpeed];
  const {
    transcript,
    isListening,
    isSupported: speechSupported,
    startListening,
    stopListening,
    resetTranscript,
    error: speechError,
  } = useInterviewSpeech();
  const {
    startRecording,
    stopRecording,
    clearRecording,
    stream,
    isRecording,
    requestPermission,
    cleanup: cleanupRecorder,
  } = useAudioRecorder();
  const canUseSpeech = speechSupported && micPermission;
  const failedUrls = useMemo(() => new Set(precacheResult?.failed ?? []), [precacheResult]);

  /* eslint-disable react-hooks/exhaustive-deps */
  const config: InterviewConfig = useMemo(
    () => ({
      questions:
        initialQuestions ?? fisherYatesShuffle(allQuestions).slice(0, QUESTIONS_PER_SESSION),
      isResuming: (initialIndex ?? 0) > 0,
      initialIndex,
      initialResults,
      initialCorrectCount,
      initialIncorrectCount,
      initialStartTime,
    }),
    []
  );
  /* eslint-enable react-hooks/exhaustive-deps */
  const {
    state,
    dispatch,
    getEnglishPlayer,
    getBurmesePlayer,
    getInterviewPlayer,
    getNextMessageId,
    transitionTimerRef,
    advanceTimerRef,
  } = useInterviewStateMachine(config);
  const [usingTTSFallback, setUsingTTSFallback] = useState(false);
  const [inputMode, setInputMode] = useState<'voice' | 'text'>(() =>
    canUseSpeech ? 'voice' : 'text'
  );
  const [showQuitDialog, setShowQuitDialog] = useState(false);
  const [responseStartTime, setResponseStartTime] = useState<number | null>(null);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [previousTranscription, setPreviousTranscription] = useState('');
  const [interviewPaused, setInterviewPaused] = useState(false);
  const [lastGradeResult, setLastGradeResult] = useState<GradeResult | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);
  const interviewActive =
    state.questionPhase !== 'greeting' && state.questionPhase !== 'transition' && !showQuitDialog;
  const hasSpeechError = !!speechError && !isListening;
  const showRecordingArea =
    state.questionPhase === 'responding' &&
    inputMode === 'voice' &&
    canUseSpeech &&
    !hasSpeechError;
  const showTextInput =
    state.questionPhase === 'responding' &&
    (inputMode === 'text' || !canUseSpeech || hasSpeechError);
  const progressResults = useMemo(() => {
    const arr: Array<{ isCorrect: boolean } | null> = [];
    for (let i = 0; i < QUESTIONS_PER_SESSION; i++) {
      const r = state.results[i];
      arr.push(r ? { isCorrect: r.selfGrade === 'correct' } : null);
    }
    return arr;
  }, [state.results]);
  const { safePlayQuestion, checkEarlyEnd } = useInterviewPhaseEffects({
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
  });
  const {
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
  } = useInterviewHandlers({
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
  });
  useInterviewGuard(
    interviewActive,
    useCallback(() => setShowQuitDialog(true), [])
  );
  const { supported: orientationSupported } = useOrientationLock(interviewActive);
  useVisibilityPause(
    interviewActive,
    useCallback(() => {
      getEnglishPlayer().cancel();
      getBurmesePlayer().cancel();
      getInterviewPlayer().cancel();
      cancelTTS();
      setInterviewPaused(true);
    }, [cancelTTS, getEnglishPlayer, getBurmesePlayer, getInterviewPlayer]),
    useCallback(() => setTimeout(() => setInterviewPaused(false), 500), [])
  );
  useEffect(() => {
    if (micPermission) void requestPermission();
  }, [micPermission, requestPermission]);
  useSilenceDetection({
    stream,
    silenceMs: 2000,
    enabled: state.questionPhase === 'responding' && isRecording,
    onSilence: useCallback(() => {
      if (state.questionPhase === 'responding' && transcript.trim()) {
        stopListening();
        stopRecording();
        dispatch({ type: 'ADVANCE_PHASE', phase: 'transcription' });
      }
    }, [state.questionPhase, transcript, stopListening, stopRecording, dispatch]),
  });
  useEffect(() => {
    if (
      state.questionPhase !== 'responding' ||
      !canUseSpeech ||
      isListening ||
      inputMode !== 'voice'
    )
      return;
    if (transcript.trim()) {
      const t = setTimeout(() => {
        stopRecording();
        dispatch({ type: 'ADVANCE_PHASE', phase: 'transcription' });
      }, 300);
      return () => clearTimeout(t);
    }
    if (!speechError) {
      const t = setTimeout(() => {
        startListening().catch(() => {});
      }, 500);
      return () => clearTimeout(t);
    }
  }, [
    state.questionPhase,
    canUseSpeech,
    isListening,
    transcript,
    speechError,
    startListening,
    stopRecording,
    inputMode,
    dispatch,
  ]);
  useEffect(
    () => () => {
      cleanupRecorder();
      getEnglishPlayer().cancel();
      getBurmesePlayer().cancel();
      getInterviewPlayer().cancel();
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    },
    [
      cleanupRecorder,
      getEnglishPlayer,
      getBurmesePlayer,
      getInterviewPlayer,
      transitionTimerRef,
      advanceTimerRef,
    ]
  );

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
      {!orientationSupported && <LandscapeOverlay active={interviewActive} />}
      <div className="flex flex-1 flex-col bg-gradient-to-b from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 rounded-t-2xl overflow-hidden">
        <InterviewHeader
          mode={mode}
          currentIndex={state.currentIndex}
          totalQuestions={QUESTIONS_PER_SESSION}
          progressResults={progressResults}
          correctCount={state.correctCount}
          showBurmese={showBurmese}
          showTimer={mode === 'realistic' && state.questionPhase === 'responding'}
          onTimerExpired={handleTimerExpired}
          onQuitClick={() => setShowQuitDialog(true)}
          onEmergencyExit={handleEmergencyExit}
        />
        <div className="flex justify-center py-4">
          <ExaminerCharacter state={state.examinerState} size="md" />
        </div>
        {interviewPaused && (
          <div
            className="absolute inset-0 z-30 flex items-center justify-center bg-slate-900/80"
            role="alertdialog"
            aria-label={strings.interview.paused.en}
          >
            <div className="text-center">
              <p className="text-xl font-bold text-white">{strings.interview.paused.en}</p>
              {showBurmese && (
                <p className="font-myanmar text-base text-white/70 mt-1">
                  {strings.interview.paused.my}
                </p>
              )}
              <p className="text-sm text-white/50 mt-2">{strings.interview.resuming.en}</p>
              {showBurmese && (
                <p className="font-myanmar text-xs text-white/40 mt-0.5">
                  {strings.interview.resuming.my}
                </p>
              )}
            </div>
          </div>
        )}
        <InterviewChatArea
          chatMessages={state.chatMessages}
          questionPhase={state.questionPhase}
          mode={mode}
          showBurmese={showBurmese}
          usingTTSFallback={usingTTSFallback}
          effectiveSpeed={effectiveSpeed}
          showTranscriptionReview={state.questionPhase === 'transcription' && canUseSpeech}
          previousTranscription={previousTranscription}
          recordAttempt={state.recordAttempt}
          onTranscriptConfirm={handleTranscriptConfirm}
          onReRecord={handleReRecord}
          showSelfGradeButtons={state.questionPhase === 'grading'}
          onSelfGrade={handleSelfGrade}
          lastTranscript={state.results[state.results.length - 1]?.transcript ?? ''}
          isTransition={state.questionPhase === 'transition'}
          chatEndRef={chatEndRef}
          shouldReduceMotion={shouldReduceMotion}
        />
        <InterviewRecordingArea
          isRecording={isRecording}
          isListening={isListening}
          stream={stream}
          canUseSpeech={canUseSpeech}
          micPermission={micPermission}
          questionPhase={state.questionPhase}
          replaysUsed={state.replaysUsed}
          onRepeat={handleRepeat}
          onManualSubmit={handleManualSubmit}
          previousTranscription={previousTranscription || null}
          onTextSubmit={(t: string) => handleTypedSubmit(t)}
          onToggleInputMode={handleToggleInputMode}
          onSkipToGrade={() => dispatch({ type: 'ADVANCE_PHASE', phase: 'grading' })}
          showBurmese={showBurmese}
          showRecordingArea={showRecordingArea}
          showTextInput={showTextInput}
          hasSpeechError={hasSpeechError}
          speechError={speechError}
          isGreeting={state.questionPhase === 'greeting'}
        />
      </div>
      <QuitConfirmationDialog
        open={showQuitDialog}
        onOpenChange={setShowQuitDialog}
        onCancel={() => setShowQuitDialog(false)}
        onQuit={handleQuit}
        showBurmese={showBurmese}
      />
    </div>
  );
}
