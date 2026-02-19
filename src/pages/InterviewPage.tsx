'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavigation } from '@/components/navigation/NavigationProvider';
import { UpdateBanner } from '@/components/update/UpdateBanner';
import { useLanguage } from '@/contexts/LanguageContext';
import { InterviewSetup } from '@/components/interview/InterviewSetup';
import { InterviewCountdown } from '@/components/interview/InterviewCountdown';
import { InterviewSession } from '@/components/interview/InterviewSession';
import { InterviewResults } from '@/components/interview/InterviewResults';
import { getSessionsByType, deleteSession } from '@/lib/sessions/sessionStore';
import { ResumePromptModal } from '@/components/sessions/ResumePromptModal';
import { allQuestions } from '@/constants/questions';
import { fisherYatesShuffle } from '@/lib/shuffle';
import type { PrecacheProgress } from '@/lib/audio/audioPrecache';
import type { InterviewSnapshot, SessionSnapshot } from '@/lib/sessions/sessionTypes';
import type { InterviewSpeechOverrides } from '@/components/interview/InterviewSetup';
import type { InterviewMode, InterviewResult, InterviewEndReason, Question } from '@/types';

type InterviewPhase = 'setup' | 'countdown' | 'session' | 'results';

/** Number of questions per interview session */
const QUESTIONS_PER_SESSION = 20;

/**
 * Interview simulation page managing setup -> countdown -> session -> results flow.
 *
 * State machine:
 * - setup: User selects Realistic or Practice mode (3D chunky cards)
 * - countdown: 3-2-1-Begin countdown animation with audio pre-caching
 * - session: Active interview with TTS, recording, grading
 * - results: Post-interview analysis with confetti, 3D buttons
 *
 * Pre-cache flow: questions are generated at start, their IDs passed to
 * InterviewCountdown for audio pre-caching, then the same questions and
 * cache result are forwarded to InterviewSession.
 */
const InterviewPage = () => {
  const navigate = useNavigate();
  const { showBurmese } = useLanguage();
  const { setLock } = useNavigation();
  const [phase, setPhase] = useState<InterviewPhase>('setup');
  const [mode, setMode] = useState<InterviewMode>('practice');
  const [micPermission, setMicPermission] = useState(false);
  const [sessionResults, setSessionResults] = useState<InterviewResult[]>([]);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [endReason, setEndReason] = useState<InterviewEndReason>('complete');

  // Per-session speech speed override (from InterviewSetup)
  const [speedOverride, setSpeedOverride] = useState<'slow' | 'normal' | 'fast'>('normal');

  // Pre-generated shuffled questions for this session
  const [sessionQuestions, setSessionQuestions] = useState<Question[] | null>(null);

  // Question IDs for pre-caching during countdown
  const questionIds = useMemo(() => sessionQuestions?.map(q => q.id) ?? [], [sessionQuestions]);

  // Pre-cache result from InterviewCountdown (for TTS fallback in session)
  const [precacheResult, setPrecacheResult] = useState<PrecacheProgress | undefined>();

  // Practice exit confirmation dialog
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // --- Session persistence state ---
  const [savedSessions, setSavedSessions] = useState<InterviewSnapshot[]>([]);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [sessionId] = useState(() => `session-interview-${Date.now()}`);
  const [resumeData, setResumeData] = useState<InterviewSnapshot | null>(null);

  // Check for saved sessions on mount
  useEffect(() => {
    let cancelled = false;
    getSessionsByType('interview')
      .then(sessions => {
        if (!cancelled && sessions.length > 0) {
          setSavedSessions(sessions as InterviewSnapshot[]);
          setShowResumeModal(true);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // --- Resume / Start Fresh / Not Now handlers ---

  const handleResume = useCallback((session: SessionSnapshot) => {
    const snap = session as InterviewSnapshot;
    setMode(snap.mode);
    setResumeData(snap);
    setShowResumeModal(false);

    // Check mic permission, then go straight to session (skip countdown on resume)
    if (!navigator.mediaDevices) {
      setMicPermission(false);
      setPhase('session');
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(mediaStream => {
        mediaStream.getTracks().forEach(t => t.stop());
        setMicPermission(true);
      })
      .catch(() => {
        setMicPermission(false);
      })
      .finally(() => {
        setPhase('session');
      });
  }, []);

  const handleStartFresh = useCallback((session: SessionSnapshot) => {
    deleteSession(session.id).catch(() => {});
    setSavedSessions([]);
    setShowResumeModal(false);
  }, []);

  const handleNotNow = useCallback(() => {
    setShowResumeModal(false);
  }, []);

  const handleStart = useCallback(
    (selectedMode: InterviewMode, overrides?: InterviewSpeechOverrides) => {
      setMode(selectedMode);
      if (overrides) {
        setSpeedOverride(overrides.speedOverride);
        // Use mic permission status from InterviewSetup's proactive probe
        setMicPermission(overrides.micGranted);
      }
      // Generate shuffled questions for this session
      const shuffled = fisherYatesShuffle(allQuestions).slice(0, QUESTIONS_PER_SESSION);
      setSessionQuestions(shuffled);
      setPhase('countdown');
    },
    []
  );

  const handleCountdownComplete = useCallback(() => {
    setPhase('session');
  }, []);

  const handleSessionComplete = useCallback(
    (results: InterviewResult[], durationSeconds: number, reason: InterviewEndReason) => {
      setSessionResults(results);
      setSessionDuration(durationSeconds);
      setEndReason(reason);
      setPhase('results');
      // Delete session from IndexedDB on completion
      deleteSession(sessionId).catch(() => {});
    },
    [sessionId]
  );

  const handleRetry = useCallback(() => {
    setSessionResults([]);
    setSessionDuration(0);
    setEndReason('complete');
    setResumeData(null);
    setSessionQuestions(null);
    setPrecacheResult(undefined);
    setPhase('setup');
  }, []);

  const handleSwitchMode = useCallback((newMode: InterviewMode) => {
    setSessionResults([]);
    setSessionDuration(0);
    setEndReason('complete');
    setResumeData(null);
    setMode(newMode);
    // Generate new questions for the new mode
    const shuffled = fisherYatesShuffle(allQuestions).slice(0, QUESTIONS_PER_SESSION);
    setSessionQuestions(shuffled);
    setPrecacheResult(undefined);
    setPhase('countdown');
  }, []);

  // Practice exit: save progress and show confirmation dialog
  const handleExitRequest = useCallback(() => {
    if (mode === 'practice') {
      setShowExitConfirm(true);
    } else {
      // Real mode long-press exit: discard session, navigate home
      deleteSession(sessionId).catch(() => {});
      navigate('/');
    }
  }, [mode, sessionId, navigate]);

  const handleExitConfirm = useCallback(() => {
    setShowExitConfirm(false);
    deleteSession(sessionId).catch(() => {});
    navigate('/');
  }, [sessionId, navigate]);

  const handleExitCancel = useCallback(() => {
    setShowExitConfirm(false);
  }, []);

  // Navigation lock via context: lock during active interview session
  const interviewActive = phase === 'session';
  useEffect(() => {
    setLock(interviewActive, 'Complete or exit the interview first');
  }, [interviewActive, setLock]);

  // Release lock on unmount
  useEffect(() => () => setLock(false), [setLock]);

  // Keep handleExitRequest reference stable for potential downstream use
  void handleExitRequest;

  return (
    <div className="page-shell">
      {/* Resume prompt modal (setup phase only) */}
      {phase === 'setup' && savedSessions.length > 0 && (
        <ResumePromptModal
          sessions={savedSessions}
          open={showResumeModal}
          onResume={handleResume}
          onStartFresh={handleStartFresh}
          onNotNow={handleNotNow}
        />
      )}

      {phase === 'setup' && (
        <>
          <UpdateBanner showBurmese={showBurmese} />
          <InterviewSetup onStart={handleStart} />
        </>
      )}
      {phase === 'countdown' && (
        <InterviewCountdown
          onComplete={handleCountdownComplete}
          questionIds={questionIds}
          includeBurmese={showBurmese}
          onCacheComplete={setPrecacheResult}
        />
      )}
      {phase === 'session' && (
        <>
          <InterviewSession
            mode={mode}
            onComplete={handleSessionComplete}
            micPermission={micPermission}
            speedOverride={speedOverride}
            sessionId={sessionId}
            initialQuestions={resumeData?.questions ?? sessionQuestions ?? undefined}
            initialResults={resumeData?.results}
            initialIndex={resumeData?.currentIndex}
            initialCorrectCount={resumeData?.correctCount}
            initialIncorrectCount={resumeData?.incorrectCount}
            initialStartTime={resumeData?.startTime}
            precacheResult={precacheResult}
          />

          {/* Practice exit confirmation dialog */}
          {showExitConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="mx-4 w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl">
                <h3 className="text-lg font-bold text-foreground">
                  Exit Interview?
                  {showBurmese && (
                    <span className="mt-1 block font-myanmar text-sm font-normal text-muted-foreground">
                      အင်တာဗျူးမှ ထွက်မလား?
                    </span>
                  )}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your progress will be saved. You can resume later.
                  {showBurmese && (
                    <span className="mt-1 block font-myanmar">
                      တိုးတက်မှုကို သိမ်းဆည်းပါမည်။ နောက်မှ ဆက်လုပ်နိုင်ပါသည်။
                    </span>
                  )}
                </p>
                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={handleExitCancel}
                    className="min-h-[44px] flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold text-foreground transition-colors hover:bg-muted/40"
                  >
                    Continue
                    {showBurmese && (
                      <span className="block font-myanmar text-xs font-normal">ဆက်လုပ်ပါ</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleExitConfirm}
                    className="min-h-[44px] flex-1 rounded-xl bg-destructive px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-destructive/90"
                  >
                    Exit
                    {showBurmese && (
                      <span className="block font-myanmar text-xs font-normal">ထွက်ပါ</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      {phase === 'results' && (
        <InterviewResults
          results={sessionResults}
          mode={mode}
          durationSeconds={sessionDuration}
          endReason={endReason}
          onRetry={handleRetry}
          onSwitchMode={handleSwitchMode}
          speedOverride={speedOverride}
        />
      )}
    </div>
  );
};

export default InterviewPage;
