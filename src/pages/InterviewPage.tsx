'use client';

import { useState, useCallback, useEffect } from 'react';
import { useNavigation } from '@/components/navigation/NavigationProvider';
import { UpdateBanner } from '@/components/update/UpdateBanner';
import { useLanguage } from '@/contexts/LanguageContext';
import { InterviewSetup } from '@/components/interview/InterviewSetup';
import { InterviewCountdown } from '@/components/interview/InterviewCountdown';
import { InterviewSession } from '@/components/interview/InterviewSession';
import { InterviewResults } from '@/components/interview/InterviewResults';
import { getSessionsByType, deleteSession } from '@/lib/sessions/sessionStore';
import { ResumePromptModal } from '@/components/sessions/ResumePromptModal';
import type { InterviewSnapshot, SessionSnapshot } from '@/lib/sessions/sessionTypes';
import type { InterviewSpeechOverrides } from '@/components/interview/InterviewSetup';
import type { InterviewMode, InterviewResult, InterviewEndReason } from '@/types';

type InterviewPhase = 'setup' | 'countdown' | 'session' | 'results';

/**
 * Interview simulation page managing setup -> countdown -> session -> results flow.
 *
 * State machine:
 * - setup: User selects Realistic or Practice mode (3D chunky cards)
 * - countdown: 3-2-1-Begin countdown animation
 * - session: Active interview with TTS, recording, grading
 * - results: Post-interview analysis with confetti, 3D buttons
 *
 * Duolingo visual treatment applied across all phases via sub-components:
 * - InterviewSetup: rounded-2xl mode cards, 3D chunky Start buttons
 * - InterviewResults: rounded-2xl category cards, 3D action buttons, confetti
 */
const InterviewPage = () => {
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
      }

      // Check mic permission state from the setup's proactive request
      if (!navigator.mediaDevices) {
        setMicPermission(false);
        setPhase('countdown');
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
          setPhase('countdown');
        });
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
    setPhase('setup');
  }, []);

  const handleSwitchMode = useCallback((newMode: InterviewMode) => {
    setSessionResults([]);
    setSessionDuration(0);
    setEndReason('complete');
    setResumeData(null);
    setMode(newMode);
    setPhase('countdown');
  }, []);

  // Navigation lock via context: lock during active interview session
  useEffect(() => {
    setLock(phase === 'session', 'Complete or exit the interview first');
  }, [phase, setLock]);

  // Release lock on unmount
  useEffect(() => () => setLock(false), [setLock]);

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
      {phase === 'countdown' && <InterviewCountdown onComplete={handleCountdownComplete} />}
      {phase === 'session' && (
        <InterviewSession
          mode={mode}
          onComplete={handleSessionComplete}
          micPermission={micPermission}
          speedOverride={speedOverride}
          sessionId={sessionId}
          initialQuestions={resumeData?.questions}
          initialResults={resumeData?.results}
          initialIndex={resumeData?.currentIndex}
          initialCorrectCount={resumeData?.correctCount}
          initialIncorrectCount={resumeData?.incorrectCount}
          initialStartTime={resumeData?.startTime}
        />
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
