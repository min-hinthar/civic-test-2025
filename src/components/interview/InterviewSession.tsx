'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, LogOut, Mic, Square, Keyboard } from 'lucide-react';
import { clsx } from 'clsx';
import { ExaminerCharacter } from '@/components/interview/ExaminerCharacter';
import { ChatBubble } from '@/components/interview/ChatBubble';
import { TypingIndicator } from '@/components/interview/TypingIndicator';
import { TranscriptionReview } from '@/components/interview/TranscriptionReview';
import { AudioWaveform } from '@/components/interview/AudioWaveform';
import { SelfGradeButtons } from '@/components/interview/SelfGradeButtons';
import { InterviewTimer } from '@/components/interview/InterviewTimer';
import { TTSFallbackBadge } from '@/components/interview/TTSFallbackBadge';
import { ModeBadge } from '@/components/interview/ModeBadge';
import { InterviewProgress } from '@/components/interview/InterviewProgress';
import { LongPressButton } from '@/components/interview/LongPressButton';
import { LandscapeOverlay } from '@/components/interview/LandscapeOverlay';
import { TextAnswerInput } from '@/components/interview/TextAnswerInput';
import { KeywordHighlight } from '@/components/interview/KeywordHighlight';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { BurmeseSpeechButton } from '@/components/ui/BurmeseSpeechButton';
import { useTTS } from '@/hooks/useTTS';
import { useInterviewGuard } from '@/hooks/useInterviewGuard';
import { useOrientationLock } from '@/hooks/useOrientationLock';
import { useVisibilityPause } from '@/hooks/useVisibilityPause';
import {
  createAudioPlayer,
  getEnglishAudioUrl,
  getBurmeseAudioUrl,
  getInterviewAudioUrl,
  type AudioPlayer,
} from '@/lib/audio/audioPlayer';
import type { PrecacheProgress } from '@/lib/audio/audioPrecache';
import { useInterviewSpeech } from '@/hooks/useSpeechRecognition';
import { useSilenceDetection } from '@/hooks/useSilenceDetection';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { gradeAnswer } from '@/lib/interview/answerGrader';
import { playChime } from '@/lib/interview/audioChime';
import { getRandomGreeting } from '@/lib/interview/interviewGreetings';
import { getCorrectFeedback, getIncorrectFeedback } from '@/lib/interview/interviewFeedback';
import { fisherYatesShuffle } from '@/lib/shuffle';
import { allQuestions } from '@/constants/questions';
import { saveSession } from '@/lib/sessions/sessionStore';
import { SESSION_VERSION } from '@/lib/sessions/sessionTypes';
import type { InterviewSnapshot } from '@/lib/sessions/sessionTypes';
import { strings } from '@/lib/i18n/strings';
import { useLanguage } from '@/contexts/LanguageContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { hapticLight, hapticMedium } from '@/lib/haptics';
import type { InterviewMode, InterviewResult, InterviewEndReason, Question } from '@/types';
import type { GradeResult } from '@/lib/interview/answerGrader';

/** Maximum replays per question */
const MAX_REPLAYS = 2;

/** Maximum re-record attempts for transcription */
const MAX_RECORD_ATTEMPTS = 3;

/** Timer duration for realistic mode in seconds */
const REALISTIC_TIMER_SECONDS = 15;

/** Delay between grading and next question in ms */
const TRANSITION_DELAY_MS = 1500;

/** Pass threshold for realistic mode */
const PASS_THRESHOLD = 12;

/** Fail threshold for realistic mode */
const FAIL_THRESHOLD = 9;

/** Number of questions per interview session */
const QUESTIONS_PER_SESSION = 20;

/** Typing indicator display duration in ms */
const TYPING_INDICATOR_MS = 1200;

type QuestionPhase =
  | 'greeting'
  | 'chime'
  | 'typing'
  | 'reading'
  | 'responding'
  | 'transcription'
  | 'grading'
  | 'feedback'
  | 'transition';

/** A single chat message for the conversation log */
interface ChatMessage {
  id: string;
  sender: 'examiner' | 'user';
  text: string;
  isCorrect?: boolean;
  confidence?: number;
  /** Question ID for Burmese replay button (examiner question messages only) */
  questionId?: string;
  /** Grade result for keyword highlighting in feedback */
  gradeResult?: GradeResult;
}

/** Rate map for named speed to numeric playback rate */
const RATE_MAP: Record<'slow' | 'normal' | 'fast', number> = {
  slow: 0.7,
  normal: 0.98,
  fast: 1.3,
};

interface InterviewSessionProps {
  /** Interview mode (realistic or practice) */
  mode: InterviewMode;
  /** Called when the session is complete */
  onComplete: (
    results: InterviewResult[],
    durationSeconds: number,
    endReason: InterviewEndReason
  ) => void;
  /** Whether mic permission was granted */
  micPermission: boolean;
  /** Per-session speech speed override from InterviewSetup */
  speedOverride?: 'slow' | 'normal' | 'fast';
  /** Session ID for persistence */
  sessionId?: string;
  /** Pre-shuffled questions for resume */
  initialQuestions?: Question[];
  /** Graded results so far (resume) */
  initialResults?: InterviewResult[];
  /** Current question index (resume) */
  initialIndex?: number;
  /** Running correct count (resume) */
  initialCorrectCount?: number;
  /** Running incorrect count (resume) */
  initialIncorrectCount?: number;
  /** Original session start timestamp (resume) */
  initialStartTime?: number;
  /** Pre-cache result from InterviewCountdown (failed URLs for TTS fallback) */
  precacheResult?: PrecacheProgress;
}

/**
 * Chat-style interview session with ExaminerCharacter, speech recognition,
 * and dual Practice/Real modes.
 *
 * Visual layout:
 * - ModeBadge in top-right corner
 * - ExaminerCharacter at top
 * - InterviewProgress below character
 * - Chat messages area (scrollable)
 * - Recording area / TextAnswerInput at bottom
 *
 * Chat flow:
 * greeting -> (typing -> reading -> responding -> transcription -> grading -> feedback -> transition) * N
 *
 * Practice mode: per-question feedback with keyword highlights, always 20 questions, exit allowed
 * Real mode: no per-question feedback, early termination at 12/9, no exit, monochrome progress, score hidden
 */
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

  // Effective speed: Real mode always normal, Practice mode uses override or global setting
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

  // Unified check: speech recognition API available AND mic permission granted
  const canUseSpeech = speechSupported && micPermission;

  // --- Pre-cache failure tracking for TTS fallback ---
  const failedUrls: Set<string> = useMemo(() => {
    if (!precacheResult?.failed?.length) return new Set<string>();
    return new Set(precacheResult.failed);
  }, [precacheResult]);

  // Track whether current audio is using TTS fallback
  const [usingTTSFallback, setUsingTTSFallback] = useState(false);

  // --- Input mode: voice or text ---
  const [inputMode, setInputMode] = useState<'voice' | 'text'>(() =>
    canUseSpeech ? 'voice' : 'text'
  );

  // --- Session state ---
  const [questions] = useState<Question[]>(
    () => initialQuestions ?? fisherYatesShuffle(allQuestions).slice(0, QUESTIONS_PER_SESSION)
  );
  const isResuming = (initialIndex ?? 0) > 0;
  const [currentIndex, setCurrentIndex] = useState(initialIndex ?? 0);
  const [results, setResults] = useState<InterviewResult[]>(initialResults ?? []);
  const [correctCount, setCorrectCount] = useState(initialCorrectCount ?? 0);
  const [incorrectCount, setIncorrectCount] = useState(initialIncorrectCount ?? 0);
  const [questionPhase, setQuestionPhase] = useState<QuestionPhase>(
    isResuming ? 'chime' : 'greeting'
  );
  const [replaysUsed, setReplaysUsed] = useState(0);
  const [recordAttempt, setRecordAttempt] = useState(1);
  const [showQuitDialog, setShowQuitDialog] = useState(false);
  const [startTime] = useState(() => initialStartTime ?? Date.now());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [examinerState, setExaminerState] = useState<'idle' | 'speaking' | 'nodding' | 'listening'>(
    'idle'
  );
  const [responseStartTime, setResponseStartTime] = useState<number | null>(null);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [previousTranscription, setPreviousTranscription] = useState('');
  const [interviewPaused, setInterviewPaused] = useState(false);

  // Latest grade result for keyword highlighting in Practice feedback
  const [lastGradeResult, setLastGradeResult] = useState<GradeResult | null>(null);

  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Separate ref for advanceToNext timer -- prevents feedback effect cleanup from cancelling it */
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const msgIdCounter = useRef(0);

  // Interview active state (for hooks: guard, orientation, visibility)
  const interviewActive =
    questionPhase !== 'greeting' && questionPhase !== 'transition' && !showQuitDialog;

  // --- Edge case hooks ---

  // Back navigation guard
  const handleBackAttempt = useCallback(() => {
    setShowQuitDialog(true);
  }, []);
  useInterviewGuard(interviewActive, handleBackAttempt);

  // Orientation lock (portrait)
  const { supported: orientationSupported } = useOrientationLock(interviewActive);

  // Visibility pause (tab backgrounding)
  const handleVisibilityHidden = useCallback(() => {
    // Pause all audio players
    englishPlayerRef.current?.cancel();
    burmesePlayerRef.current?.cancel();
    interviewPlayerRef.current?.cancel();
    cancelTTS();
    setInterviewPaused(true);
  }, [cancelTTS]);

  const handleVisibilityVisible = useCallback(() => {
    // Brief delay then resume
    setTimeout(() => {
      setInterviewPaused(false);
    }, 500);
  }, []);

  useVisibilityPause(interviewActive, handleVisibilityHidden, handleVisibilityVisible);

  // Initialize audio recorder stream for waveform + silence detection
  useEffect(() => {
    if (micPermission) {
      void requestPermission();
    }
  }, [micPermission, requestPermission]);

  // Audio players for pre-generated MP3 playback
  const englishPlayerRef = useRef<AudioPlayer | null>(null);
  const burmesePlayerRef = useRef<AudioPlayer | null>(null);
  const interviewPlayerRef = useRef<AudioPlayer | null>(null);
  const getEnglishPlayer = useCallback((): AudioPlayer => {
    if (!englishPlayerRef.current) {
      englishPlayerRef.current = createAudioPlayer();
    }
    return englishPlayerRef.current;
  }, []);
  const getBurmesePlayer = useCallback((): AudioPlayer => {
    if (!burmesePlayerRef.current) {
      burmesePlayerRef.current = createAudioPlayer();
    }
    return burmesePlayerRef.current;
  }, []);
  const getInterviewPlayer = useCallback((): AudioPlayer => {
    if (!interviewPlayerRef.current) {
      interviewPlayerRef.current = createAudioPlayer();
    }
    return interviewPlayerRef.current;
  }, []);

  // Stable ref for onComplete
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const currentQuestion = questions[currentIndex];

  // --- Progress results for InterviewProgress ---
  const progressResults: Array<{ isCorrect: boolean } | null> = useMemo(() => {
    const arr: Array<{ isCorrect: boolean } | null> = [];
    for (let i = 0; i < QUESTIONS_PER_SESSION; i++) {
      const r = results[i];
      if (r) {
        arr.push({ isCorrect: r.selfGrade === 'correct' });
      } else {
        arr.push(null);
      }
    }
    return arr;
  }, [results]);

  // --- Helpers ---

  const nextMsgId = useCallback(() => {
    msgIdCounter.current += 1;
    return `msg-${msgIdCounter.current}`;
  }, []);

  const addMessage = useCallback(
    (
      sender: 'examiner' | 'user',
      text: string,
      isCorrect?: boolean,
      confidence?: number,
      questionId?: string,
      gradeResult?: GradeResult
    ) => {
      setChatMessages(prev => [
        ...prev,
        { id: nextMsgId(), sender, text, isCorrect, confidence, questionId, gradeResult },
      ]);
    },
    [nextMsgId]
  );

  // Auto-scroll chat to bottom when messages change
  useEffect(() => {
    const el = chatEndRef.current;
    if (el) {
      el.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' });
    }
  }, [chatMessages, questionPhase, shouldReduceMotion]);

  // --- Safe play for question text (uses pre-generated English MP3 with TTS fallback) ---
  const safePlayQuestion = useCallback(
    async (questionId: string, questionText?: string) => {
      const url = getEnglishAudioUrl(questionId, 'q');

      // Check if audio URL failed pre-caching
      if (failedUrls.has(url)) {
        // TTS fallback
        setUsingTTSFallback(true);
        try {
          if (questionText) {
            await ttsFallbackSpeak(questionText, { rate: numericRate });
          }
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
        // MP3 play failed at runtime -- try TTS fallback
        setUsingTTSFallback(true);
        try {
          if (questionText) {
            await ttsFallbackSpeak(questionText, { rate: numericRate });
          }
          return 'completed' as const;
        } catch {
          return 'error' as const;
        }
      }
    },
    [numericRate, getEnglishPlayer, failedUrls, ttsFallbackSpeak]
  );

  // --- Safe play for interview audio (greetings, closings, feedback prefixes) ---
  const safePlayInterview = useCallback(
    async (audioName: string) => {
      try {
        const url = getInterviewAudioUrl(audioName);
        await getInterviewPlayer().play(url, numericRate);
        return 'completed' as const;
      } catch {
        return 'error' as const;
      }
    },
    [numericRate, getInterviewPlayer]
  );

  // --- Silence detection: auto-stop recording after 2s silence ---
  // Only transitions if user has spoken (transcript exists) to avoid premature cutoff.
  // Does not require isListening -- recognition may have auto-ended (continuous: false).
  const handleSilenceDetected = useCallback(() => {
    if (questionPhase === 'responding' && transcript.trim()) {
      stopListening();
      stopRecording();
      setQuestionPhase('transcription');
    }
  }, [questionPhase, transcript, stopListening, stopRecording]);

  useSilenceDetection({
    stream,
    onSilence: handleSilenceDetected,
    enabled: questionPhase === 'responding' && isRecording,
    silenceMs: 2000,
  });

  // --- Auto-handle speech recognition ending during responding phase ---
  // When recognition ends (isListening -> false) while still in responding:
  //   - With transcript: auto-transition to transcription review
  //   - Without transcript + no error: restart recognition (user may not have spoken yet)
  //   - With error: text input fallback shows via hasSpeechError (no action needed)
  useEffect(() => {
    if (questionPhase !== 'responding' || !canUseSpeech || isListening || inputMode !== 'voice')
      return;

    if (transcript.trim()) {
      // User spoke and recognition ended -- auto-advance to transcription
      const timer = setTimeout(() => {
        stopRecording();
        setQuestionPhase('transcription');
      }, 300);
      return () => clearTimeout(timer);
    }

    if (!speechError) {
      // No transcript, no error -- recognition timed out (no-speech). Restart.
      const timer = setTimeout(() => {
        startListening().catch(() => {});
      }, 500);
      return () => clearTimeout(timer);
    }
    // speechError exists -> hasSpeechError shows text input fallback automatically
  }, [
    questionPhase,
    canUseSpeech,
    isListening,
    transcript,
    speechError,
    startListening,
    stopRecording,
    inputMode,
  ]);

  // --- Cleanup on unmount ---
  useEffect(() => {
    return () => {
      cleanupRecorder();
      englishPlayerRef.current?.cancel();
      burmesePlayerRef.current?.cancel();
      interviewPlayerRef.current?.cancel();
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
      if (advanceTimerRef.current) {
        clearTimeout(advanceTimerRef.current);
      }
    };
  }, [cleanupRecorder]);

  // --- Phase: GREETING ---
  useEffect(() => {
    if (questionPhase !== 'greeting') return;

    // eslint-disable-next-line no-console
    console.debug('[analytics] interview_session_started', {
      interviewMode: mode,
      languageMode,
    });

    let cancelled = false;
    const { text: greetingText, audio: greetingAudio } = getRandomGreeting();

    setExaminerState('speaking');
    addMessage('examiner', greetingText);

    safePlayInterview(greetingAudio).then(speakResult => {
      if (cancelled) return;
      setExaminerState('idle');
      // Always advance -- even if audio failed
      const delay = speakResult === 'completed' ? 800 : 0;
      transitionTimerRef.current = setTimeout(() => {
        if (!cancelled) setQuestionPhase('chime');
      }, delay);
    });

    return () => {
      cancelled = true;
      interviewPlayerRef.current?.cancel();
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, [questionPhase, safePlayInterview, addMessage, mode, languageMode]);

  // --- Phase: CHIME ---
  useEffect(() => {
    if (questionPhase !== 'chime') return;

    playChime();
    transitionTimerRef.current = setTimeout(() => {
      setQuestionPhase('typing');
    }, 200);

    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, [questionPhase]);

  // --- Phase: TYPING (show typing indicator, then transition to reading) ---
  useEffect(() => {
    if (questionPhase !== 'typing') return;

    transitionTimerRef.current = setTimeout(() => {
      setQuestionPhase('reading');
    }, TYPING_INDICATOR_MS);

    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, [questionPhase]);

  // --- Phase: READING (plays question audio, then Burmese audio if applicable, then responding) ---
  useEffect(() => {
    if (questionPhase !== 'reading') return;
    if (!currentQuestion) return;

    let cancelled = false;
    const questionText = currentQuestion.question_en;

    setExaminerState('speaking');
    setUsingTTSFallback(false);
    addMessage('examiner', questionText, undefined, undefined, currentQuestion.id);

    safePlayQuestion(currentQuestion.id, questionText).then(async speakResult => {
      if (cancelled) return;

      // Practice mode + Myanmar mode: play Burmese audio after English MP3
      if (speakResult === 'completed' && showBurmese && mode === 'practice') {
        try {
          const url = getBurmeseAudioUrl(currentQuestion.id, 'q');
          await getBurmesePlayer().play(url, numericRate);
        } catch {
          // Burmese audio failure is non-blocking -- continue silently
          // eslint-disable-next-line no-console
          console.debug('[interview] Burmese audio failed for', currentQuestion.id);
        }
      }

      if (cancelled) return;
      setExaminerState('listening');
      setUsingTTSFallback(false);
      // Always advance -- even if audio playback failed
      setResponseStartTime(Date.now());
      if (canUseSpeech && inputMode === 'voice') {
        resetTranscript();
        startListening().catch(() => {});
        startRecording();
      }
      setQuestionPhase('responding');
    });

    return () => {
      cancelled = true;
      englishPlayerRef.current?.cancel();
      burmesePlayerRef.current?.cancel();
      cancelTTS();
    };
  }, [
    questionPhase,
    currentQuestion,
    safePlayQuestion,
    addMessage,
    canUseSpeech,
    resetTranscript,
    startListening,
    startRecording,
    showBurmese,
    mode,
    numericRate,
    getBurmesePlayer,
    inputMode,
    cancelTTS,
  ]);

  // --- Manual submit (stop recording + move to transcription) ---
  const handleManualSubmit = useCallback(() => {
    hapticLight();
    stopListening();
    stopRecording();
    setQuestionPhase('transcription');
  }, [stopListening, stopRecording]);

  // Ref for typed submit so handleTimerExpired can call it (defined later)
  const handleTypedSubmitRef = useRef<() => void>(() => {});

  // --- Timer expired (realistic mode) ---
  const handleTimerExpired = useCallback(() => {
    stopListening();
    stopRecording();
    // If user typed something, auto-submit it; otherwise fall to self-grade
    if (inputMode === 'text' && typedAnswer.trim()) {
      handleTypedSubmitRef.current();
    } else if (!canUseSpeech && typedAnswer.trim()) {
      handleTypedSubmitRef.current();
    } else {
      setQuestionPhase('grading');
    }
  }, [stopListening, stopRecording, canUseSpeech, typedAnswer, inputMode]);

  // --- Toggle input mode ---
  const handleToggleInputMode = useCallback(() => {
    if (inputMode === 'voice') {
      // Switch to text: cancel speech recognition and recording
      hapticLight();
      stopListening();
      stopRecording();
      setInputMode('text');
    } else {
      // Switch to voice: start listening
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
    canUseSpeech,
    resetTranscript,
    startListening,
    startRecording,
  ]);

  // --- Helper: Save session snapshot ---
  const saveSessionSnapshot = useCallback(
    (newResults: InterviewResult[], newCorrect: number, newIncorrect: number) => {
      if (!sessionId) return;
      const snapshot: InterviewSnapshot = {
        id: sessionId,
        type: 'interview',
        savedAt: new Date().toISOString(),
        version: SESSION_VERSION,
        questions,
        results: newResults,
        currentIndex: currentIndex + 1,
        correctCount: newCorrect,
        incorrectCount: newIncorrect,
        mode,
        startTime,
      };
      try {
        saveSession(snapshot).catch(() => {});
      } catch {
        // QuotaExceededError -- don't block the interview
        // eslint-disable-next-line no-console
        console.debug('[interview] Session save failed (storage quota)');
      }
    },
    [sessionId, questions, currentIndex, mode, startTime]
  );

  // --- Helper: Check early termination (real mode) ---
  const checkEarlyTermination = useCallback(
    (newResults: InterviewResult[], newCorrect: number, newIncorrect: number): boolean => {
      if (mode !== 'realistic') return false;

      if (newCorrect >= PASS_THRESHOLD) {
        transitionTimerRef.current = setTimeout(() => {
          addMessage('examiner', "Congratulations! You've passed the civics test.");
          setExaminerState('speaking');
          safePlayInterview('pass-announce').then(() => {
            setExaminerState('idle');
            const duration = Math.round((Date.now() - startTime) / 1000);
            onCompleteRef.current(newResults, duration, 'passThreshold');
          });
        }, 500);
        return true;
      }
      if (newIncorrect >= FAIL_THRESHOLD) {
        transitionTimerRef.current = setTimeout(() => {
          addMessage('examiner', "Unfortunately, you didn't reach the passing score this time.");
          setExaminerState('speaking');
          safePlayInterview('fail-announce').then(() => {
            setExaminerState('idle');
            const duration = Math.round((Date.now() - startTime) / 1000);
            onCompleteRef.current(newResults, duration, 'failThreshold');
          });
        }, 500);
        return true;
      }
      return false;
    },
    [mode, addMessage, safePlayInterview, startTime]
  );

  // --- Advance to next question or finish ---
  const advanceToNext = useCallback(() => {
    if (currentIndex >= QUESTIONS_PER_SESSION - 1) {
      const duration = Math.round((Date.now() - startTime) / 1000);
      onCompleteRef.current(results, duration, 'complete');
      return;
    }

    setQuestionPhase('transition');
    // Use advanceTimerRef (not transitionTimerRef) so feedback effect cleanup
    // doesn't cancel this timer when the phase change triggers re-render
    advanceTimerRef.current = setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setReplaysUsed(0);
      setRecordAttempt(1);
      resetTranscript();
      setTypedAnswer('');
      setPreviousTranscription('');
      setLastGradeResult(null);
      setUsingTTSFallback(false);
      setQuestionPhase('chime');
    }, TRANSITION_DELAY_MS);
  }, [currentIndex, startTime, results, resetTranscript]);

  // --- Process grading result (shared between speech and text paths) ---
  const processGradeResult = useCallback(
    (userText: string, gradeResult: GradeResult, responseTimeMs: number | undefined) => {
      if (!currentQuestion) return;

      const interviewResult: InterviewResult = {
        questionId: currentQuestion.id,
        questionText_en: currentQuestion.question_en,
        questionText_my: currentQuestion.question_my,
        correctAnswers: currentQuestion.studyAnswers.map(a => ({
          text_en: a.text_en,
          text_my: a.text_my,
        })),
        selfGrade: gradeResult.isCorrect ? 'correct' : 'incorrect',
        category: currentQuestion.category,
        confidence: gradeResult.confidence,
        responseTimeMs,
        transcript: userText,
        matchedKeywords: gradeResult.matchedKeywords,
        missingKeywords: gradeResult.missingKeywords,
      };

      const newResults = [...results, interviewResult];
      const newCorrect = gradeResult.isCorrect ? correctCount + 1 : correctCount;
      const newIncorrect = gradeResult.isCorrect ? incorrectCount : incorrectCount + 1;

      setResults(newResults);
      setCorrectCount(newCorrect);
      setIncorrectCount(newIncorrect);
      setLastGradeResult(gradeResult);

      saveSessionSnapshot(newResults, newCorrect, newIncorrect);
      clearRecording();
      setQuestionPhase('feedback');

      if (checkEarlyTermination(newResults, newCorrect, newIncorrect)) return;
      // Note: last-question completion is handled by the FEEDBACK effect → advanceToNext().
      // Do NOT schedule onComplete here to avoid double-completion.
    },
    [
      currentQuestion,
      results,
      correctCount,
      incorrectCount,
      saveSessionSnapshot,
      clearRecording,
      checkEarlyTermination,
    ]
  );

  // --- Transcription: user confirms or re-records ---
  const handleTranscriptConfirm = useCallback(() => {
    const responseTimeMs = responseStartTime ? Date.now() - responseStartTime : undefined;
    const userText = transcript.trim() || '(no answer)';
    addMessage('user', userText);

    if (canUseSpeech && currentQuestion) {
      const gradeResult: GradeResult = gradeAnswer(userText, currentQuestion.studyAnswers);
      processGradeResult(userText, gradeResult, responseTimeMs);
    } else {
      setQuestionPhase('grading');
    }
  }, [
    transcript,
    canUseSpeech,
    currentQuestion,
    responseStartTime,
    addMessage,
    processGradeResult,
  ]);

  const handleReRecord = useCallback(() => {
    // Save current transcript as previous transcription for context
    if (transcript.trim()) {
      setPreviousTranscription(transcript.trim());
    }
    setRecordAttempt(prev => prev + 1);
    resetTranscript();
    if (canUseSpeech) {
      startListening().catch(() => {});
      startRecording();
    }
    setQuestionPhase('responding');
  }, [transcript, resetTranscript, canUseSpeech, startListening, startRecording]);

  // --- Typed answer submit ---
  const handleTypedSubmit = useCallback(
    (text?: string) => {
      if (!currentQuestion) return;
      const userText = (text ?? typedAnswer).trim();
      if (!userText) return;

      const responseTimeMs = responseStartTime ? Date.now() - responseStartTime : undefined;
      addMessage('user', userText);

      const gradeResult: GradeResult = gradeAnswer(userText, currentQuestion.studyAnswers);
      processGradeResult(userText, gradeResult, responseTimeMs);
      setTypedAnswer('');
    },
    [typedAnswer, currentQuestion, responseStartTime, addMessage, processGradeResult]
  );

  // Keep ref in sync for handleTimerExpired to call
  useEffect(() => {
    handleTypedSubmitRef.current = handleTypedSubmit;
  }, [handleTypedSubmit]);

  // --- Phase: FEEDBACK (Practice: show detailed, Real: brief ack) ---
  useEffect(() => {
    if (questionPhase !== 'feedback') return;
    if (!currentQuestion) return;

    let cancelled = false;
    const lastResult = results[results.length - 1];
    if (!lastResult) return;

    setExaminerState('nodding');

    // Brief nod then back to idle
    transitionTimerRef.current = setTimeout(() => {
      if (cancelled) return;
      setExaminerState('idle');
    }, 600);

    if (mode === 'practice') {
      // Practice: show correct answer with randomized feedback phrase
      const primaryAnswer = currentQuestion.studyAnswers[0]?.text_en ?? '';
      const feedback =
        lastResult.selfGrade === 'correct' ? getCorrectFeedback() : getIncorrectFeedback();
      const feedbackText =
        lastResult.selfGrade === 'correct'
          ? `${feedback.text} The answer is: ${primaryAnswer}`
          : `${feedback.text} The correct answer is: ${primaryAnswer}`;

      addMessage(
        'examiner',
        feedbackText,
        lastResult.selfGrade === 'correct',
        undefined,
        undefined,
        lastGradeResult ?? undefined
      );

      // Play feedback audio phrase then answer audio
      safePlayInterview(feedback.audio)
        .then(async () => {
          if (cancelled) return;
          try {
            const answerUrl = getEnglishAudioUrl(currentQuestion.id, 'a');
            // Check if answer audio failed pre-caching
            if (failedUrls.has(answerUrl)) {
              // TTS fallback for answer
              await ttsFallbackSpeak(primaryAnswer, { rate: numericRate });
            } else {
              await getEnglishPlayer().play(answerUrl, numericRate);
            }
          } catch {
            // Answer audio failure is non-blocking
          }
        })
        .then(() => {
          if (cancelled) return;
          // Auto-advance after feedback
          transitionTimerRef.current = setTimeout(() => {
            if (!cancelled) advanceToNext();
          }, TRANSITION_DELAY_MS);
        });
    } else {
      // Real mode: brief feedback acknowledgment (no answer reveal)
      const feedback =
        lastResult.selfGrade === 'correct' ? getCorrectFeedback() : getIncorrectFeedback();
      addMessage('examiner', feedback.text);

      // Play brief feedback audio then advance
      safePlayInterview(feedback.audio).then(() => {
        if (cancelled) return;
        transitionTimerRef.current = setTimeout(() => {
          if (!cancelled) advanceToNext();
        }, 500);
      });
    }

    return () => {
      cancelled = true;
      interviewPlayerRef.current?.cancel();
      englishPlayerRef.current?.cancel();
      cancelTTS();
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionPhase]);

  // --- Self-grade fallback (no speech recognition) ---
  const handleSelfGrade = useCallback(
    (grade: 'correct' | 'incorrect') => {
      if (!currentQuestion) return;

      const interviewResult: InterviewResult = {
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

      const newResults = [...results, interviewResult];
      const newCorrect = grade === 'correct' ? correctCount + 1 : correctCount;
      const newIncorrect = grade === 'incorrect' ? incorrectCount + 1 : incorrectCount;

      setResults(newResults);
      setCorrectCount(newCorrect);
      setIncorrectCount(newIncorrect);

      saveSessionSnapshot(newResults, newCorrect, newIncorrect);
      clearRecording();

      if (checkEarlyTermination(newResults, newCorrect, newIncorrect)) return;

      if (currentIndex >= QUESTIONS_PER_SESSION - 1) {
        const duration = Math.round((Date.now() - startTime) / 1000);
        onCompleteRef.current(newResults, duration, 'complete');
        return;
      }

      setQuestionPhase('transition');
      transitionTimerRef.current = setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setReplaysUsed(0);
        setRecordAttempt(1);
        resetTranscript();
        setTypedAnswer('');
        setPreviousTranscription('');
        setLastGradeResult(null);
        setUsingTTSFallback(false);
        setQuestionPhase('chime');
      }, TRANSITION_DELAY_MS);
    },
    [
      currentQuestion,
      results,
      correctCount,
      incorrectCount,
      clearRecording,
      saveSessionSnapshot,
      checkEarlyTermination,
      currentIndex,
      startTime,
      resetTranscript,
    ]
  );

  // --- Repeat question (TTS re-read) ---
  const handleRepeat = useCallback(async () => {
    if (!currentQuestion || replaysUsed >= MAX_REPLAYS) return;

    // Stop recording during repeat
    stopListening();
    stopRecording();
    setReplaysUsed(prev => prev + 1);

    setExaminerState('speaking');
    await new Promise(resolve => setTimeout(resolve, 500));
    const speakResult = await safePlayQuestion(currentQuestion.id, currentQuestion.question_en);
    setExaminerState('listening');

    if (speakResult === 'completed' && canUseSpeech && inputMode === 'voice') {
      resetTranscript();
      startListening().catch(() => {});
      startRecording();
    }
  }, [
    currentQuestion,
    replaysUsed,
    stopListening,
    stopRecording,
    safePlayQuestion,
    canUseSpeech,
    resetTranscript,
    startListening,
    startRecording,
    inputMode,
  ]);

  // --- Quit handler ---
  const handleQuit = useCallback(() => {
    cancelTTS();
    englishPlayerRef.current?.cancel();
    burmesePlayerRef.current?.cancel();
    stopListening();
    stopRecording();
    cleanupRecorder();
    const duration = Math.round((Date.now() - startTime) / 1000);
    onCompleteRef.current(results, duration, 'quit');
  }, [cancelTTS, stopListening, stopRecording, cleanupRecorder, results, startTime]);

  // --- Emergency exit handler (Real mode long press) ---
  const handleEmergencyExit = useCallback(() => {
    cancelTTS();
    englishPlayerRef.current?.cancel();
    burmesePlayerRef.current?.cancel();
    interviewPlayerRef.current?.cancel();
    stopListening();
    stopRecording();
    cleanupRecorder();
    const duration = Math.round((Date.now() - startTime) / 1000);
    onCompleteRef.current(results, duration, 'quit');
  }, [cancelTTS, stopListening, stopRecording, cleanupRecorder, results, startTime]);

  // --- TextAnswerInput submit handler ---
  const handleTextAnswerSubmit = useCallback(
    (text: string) => {
      handleTypedSubmit(text);
    },
    [handleTypedSubmit]
  );

  // --- Render helpers ---
  const isGreeting = questionPhase === 'greeting';
  const isTransition = questionPhase === 'transition';
  const showTimer = mode === 'realistic' && questionPhase === 'responding';
  const showSelfGradeButtons = questionPhase === 'grading';
  // Show mic recording when voice mode, speech works, and no error
  const hasSpeechError = !!speechError && !isListening;
  const showRecordingArea =
    questionPhase === 'responding' && inputMode === 'voice' && canUseSpeech && !hasSpeechError;
  const showTextInput =
    questionPhase === 'responding' && (inputMode === 'text' || !canUseSpeech || hasSpeechError);
  const showTranscriptionReview = questionPhase === 'transcription' && canUseSpeech;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
      {/* Mode badge (top-right corner) */}
      <ModeBadge mode={mode} />

      {/* Landscape overlay for browsers without orientation lock */}
      {!orientationSupported && <LandscapeOverlay active={interviewActive} />}

      {/* Dark interview background */}
      <div className="flex flex-1 flex-col bg-gradient-to-b from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 rounded-t-2xl overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            {/* InterviewProgress replaces old text-based progress */}
            <InterviewProgress
              mode={mode}
              currentIndex={currentIndex}
              totalQuestions={QUESTIONS_PER_SESSION}
              results={progressResults}
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Score display (Practice only -- Real hides score) */}
            {mode === 'practice' && (
              <span className="text-xs text-white/50">
                {correctCount} correct
                {showBurmese && <span className="font-myanmar ml-1">{correctCount} မှန်</span>}
              </span>
            )}

            {mode === 'practice' ? (
              <button
                type="button"
                onClick={() => setShowQuitDialog(true)}
                className={clsx(
                  'flex items-center gap-1 rounded-lg px-2.5 py-1.5',
                  'text-xs text-white/50',
                  'transition-colors hover:bg-white/10 hover:text-white/80',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30'
                )}
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">
                  Exit
                  {showBurmese && <span className="font-myanmar ml-1">ထွက်ရန်</span>}
                </span>
              </button>
            ) : (
              /* Real mode: long-press exit (hidden emergency exit) */
              <LongPressButton onLongPress={handleEmergencyExit}>
                <LogOut className="h-3.5 w-3.5" />
              </LongPressButton>
            )}
          </div>
        </div>

        {/* Timer for realistic mode */}
        {showTimer && (
          <div className="px-4 pt-2" key={currentIndex}>
            <InterviewTimer
              duration={REALISTIC_TIMER_SECONDS}
              onExpired={handleTimerExpired}
              isActive
            />
          </div>
        )}

        {/* ExaminerCharacter */}
        <div className="flex justify-center py-4">
          <ExaminerCharacter state={examinerState} size="md" />
        </div>

        {/* Paused overlay */}
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

        {/* Chat messages area */}
        <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-3 min-h-0">
          <AnimatePresence>
            {chatMessages.map(msg => (
              <div key={msg.id}>
                <ChatBubble
                  sender={msg.sender}
                  isCorrect={msg.isCorrect}
                  confidence={msg.confidence}
                >
                  {msg.text}
                </ChatBubble>

                {/* TTS Fallback badge for examiner messages when using TTS */}
                {msg.sender === 'examiner' && msg.questionId && usingTTSFallback && (
                  <div className="mt-0.5 ml-10">
                    <TTSFallbackBadge visible compact />
                  </div>
                )}

                {/* Burmese replay button for examiner question messages (Practice + Myanmar mode) */}
                {msg.questionId &&
                  msg.sender === 'examiner' &&
                  showBurmese &&
                  mode === 'practice' && (
                    <div className="mt-1 ml-10">
                      <BurmeseSpeechButton
                        questionId={msg.questionId}
                        audioType="q"
                        label="မြန်မာ"
                        className="!py-1 !px-2.5 !text-caption !min-h-[32px]"
                        showSpeedLabel
                        speedLabel={effectiveSpeed === 'normal' ? undefined : effectiveSpeed}
                      />
                    </div>
                  )}

                {/* Keyword highlights in Practice mode feedback messages */}
                {msg.gradeResult &&
                  mode === 'practice' &&
                  msg.sender === 'examiner' &&
                  results[results.length - 1]?.transcript && (
                    <div className="mt-2 ml-10 mr-4">
                      <KeywordHighlight
                        userAnswer={results[results.length - 1]?.transcript ?? ''}
                        matchedKeywords={msg.gradeResult.matchedKeywords}
                        missingKeywords={msg.gradeResult.missingKeywords}
                        compact
                      />
                    </div>
                  )}
              </div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {questionPhase === 'typing' && <TypingIndicator />}

          {/* Transcription review */}
          {showTranscriptionReview && (
            <TranscriptionReview
              transcript={transcript}
              attemptNumber={recordAttempt}
              maxAttempts={MAX_RECORD_ATTEMPTS}
              onConfirm={handleTranscriptConfirm}
              onReRecord={handleReRecord}
            />
          )}

          {/* Self-grade fallback */}
          {showSelfGradeButtons && (
            <div className="py-2">
              <p className="mb-2 text-center text-xs text-white/50">
                Did you answer correctly?
                {showBurmese && (
                  <span className="block font-myanmar mt-0.5">
                    မှန်ကန်စွာ ဖြေဆိုနိုင်ခဲ့ပါသလား?
                  </span>
                )}
              </p>
              <SelfGradeButtons onGrade={handleSelfGrade} />
            </div>
          )}

          {/* Transition indicator */}
          {isTransition && (
            <div className="flex items-center justify-center py-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                className="text-xs text-white/40"
              >
                {strings.interview.nextQuestion.en}
              </motion.div>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={chatEndRef} />
        </div>

        {/* Bottom recording area */}
        <div className="border-t border-white/10 px-4 py-3">
          {showRecordingArea ? (
            <div className="space-y-3">
              {/* Waveform */}
              <AudioWaveform stream={stream} isActive={isRecording} />

              {/* Controls row */}
              <div className="flex items-center justify-center gap-3">
                {/* Repeat button */}
                {questionPhase === 'responding' && replaysUsed < MAX_REPLAYS && (
                  <button
                    type="button"
                    onClick={handleRepeat}
                    className={clsx(
                      'flex items-center gap-1.5 rounded-xl border border-white/20 px-3 py-2',
                      'text-xs text-white/60',
                      'transition-colors hover:bg-white/10 hover:text-white/80',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30'
                    )}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>
                      Repeat ({replaysUsed}/{MAX_REPLAYS})
                    </span>
                  </button>
                )}

                {/* Manual submit button -- always visible so user can advance */}
                {questionPhase === 'responding' && (
                  <button
                    type="button"
                    onClick={handleManualSubmit}
                    className={clsx(
                      'flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2',
                      'text-xs font-semibold text-white',
                      'transition-colors hover:bg-primary/90',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
                    )}
                  >
                    <Square className="h-3 w-3" />
                    <span>Done</span>
                  </button>
                )}

                {/* Toggle to text input */}
                {canUseSpeech && questionPhase === 'responding' && (
                  <button
                    type="button"
                    onClick={handleToggleInputMode}
                    className={clsx(
                      'flex items-center gap-1 rounded-xl border border-white/20 px-2.5 py-2',
                      'text-xs text-white/50',
                      'transition-colors hover:bg-white/10 hover:text-white/80',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30'
                    )}
                    title="Switch to text input"
                  >
                    <Keyboard className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Listening indicator */}
              {isListening && (
                <div className="flex items-center justify-center gap-2">
                  <Mic className="h-3.5 w-3.5 animate-pulse text-primary" />
                  <span className="text-xs text-white/50">
                    Listening...
                    {showBurmese && <span className="font-myanmar ml-1">နားထောင်နေသည်...</span>}
                  </span>
                </div>
              )}

              {/* Speech recognition error */}
              {speechError && !isListening && (
                <p className="text-center text-xs text-warning">{speechError}</p>
              )}
            </div>
          ) : showTextInput ? (
            <div className="space-y-2">
              {/* Header with toggle back to voice */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-white/40">
                  <Keyboard className="h-3.5 w-3.5" />
                  <span className="text-xs">
                    {hasSpeechError
                      ? 'Speech recognition failed. Type your answer.'
                      : !canUseSpeech
                        ? 'No microphone. Type your answer.'
                        : 'Type your answer'}
                  </span>
                </div>
                {canUseSpeech && !hasSpeechError && questionPhase === 'responding' && (
                  <button
                    type="button"
                    onClick={handleToggleInputMode}
                    className="flex items-center gap-1 text-xs text-white/50 hover:text-white/80 transition-colors"
                    title="Switch to voice input"
                  >
                    <Mic className="h-3.5 w-3.5" />
                    <span>Voice</span>
                  </button>
                )}
              </div>

              {/* TextAnswerInput component */}
              <TextAnswerInput
                onSubmit={handleTextAnswerSubmit}
                disabled={questionPhase !== 'responding'}
                previousTranscription={previousTranscription || undefined}
              />

              {/* Mic permission denied prompt */}
              {!canUseSpeech && !micPermission && (
                <p className="text-center text-xs text-white/30">
                  Microphone access denied. Use text input instead.
                </p>
              )}

              {/* Skip to self-grade */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setQuestionPhase('grading')}
                  className="text-xs text-white/30 underline hover:text-white/50 transition-colors"
                >
                  Skip — self-grade instead
                  {showBurmese && (
                    <span className="block font-myanmar">ကျော် — ကိုယ်တိုင်အကဲဖြတ်ပါ</span>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-2">
              <span className="text-xs text-white/30">
                {isGreeting
                  ? 'The examiner is greeting you...'
                  : questionPhase === 'grading' || questionPhase === 'feedback'
                    ? 'Reviewing your answer...'
                    : ''}
                {showBurmese && (
                  <span className="block font-myanmar mt-0.5">
                    {isGreeting
                      ? 'စစ်ဆေးသူက နှုတ်ဆက်နေပါသည်...'
                      : questionPhase === 'grading' || questionPhase === 'feedback'
                        ? 'သင့်အဖြေကို စစ်ဆေးနေပါသည်...'
                        : ''}
                  </span>
                )}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Quit confirmation dialog */}
      <Dialog open={showQuitDialog} onOpenChange={setShowQuitDialog}>
        <DialogContent>
          <DialogTitle>
            {strings.interview.confirmEndTitle.en}
            {showBurmese && (
              <span className="mt-0.5 block font-myanmar text-base font-normal text-muted-foreground">
                {strings.interview.confirmEndTitle.my}
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            {strings.interview.confirmEndMessage.en}
            {showBurmese && (
              <span className="mt-0.5 block font-myanmar text-sm">
                {strings.interview.confirmEndMessage.my}
              </span>
            )}
          </DialogDescription>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setShowQuitDialog(false)}
              className={clsx(
                'rounded-xl px-4 py-2 text-sm font-semibold',
                'border border-border text-foreground',
                'transition-colors hover:bg-muted/40',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
              )}
            >
              {strings.interview.cancel.en}
            </button>
            <button
              type="button"
              onClick={handleQuit}
              className={clsx(
                'rounded-xl px-4 py-2 text-sm font-semibold',
                'bg-warning text-white',
                'transition-colors hover:bg-warning-600',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning'
              )}
            >
              {strings.interview.confirm.en}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
