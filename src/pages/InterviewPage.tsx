'use client';

import { useState, useCallback } from 'react';
import AppNavigation from '@/components/AppNavigation';
import { UpdateBanner } from '@/components/update/UpdateBanner';
import { useLanguage } from '@/contexts/LanguageContext';
import { InterviewSetup } from '@/components/interview/InterviewSetup';
import { InterviewCountdown } from '@/components/interview/InterviewCountdown';
import { InterviewSession } from '@/components/interview/InterviewSession';
import { InterviewResults } from '@/components/interview/InterviewResults';
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
  const [phase, setPhase] = useState<InterviewPhase>('setup');
  const [mode, setMode] = useState<InterviewMode>('practice');
  const [micPermission, setMicPermission] = useState(false);
  const [sessionResults, setSessionResults] = useState<InterviewResult[]>([]);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [endReason, setEndReason] = useState<InterviewEndReason>('complete');

  const handleStart = useCallback((selectedMode: InterviewMode) => {
    setMode(selectedMode);

    // Check mic permission state from the setup's proactive request
    navigator.mediaDevices
      ?.getUserMedia({ audio: true })
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
  }, []);

  const handleCountdownComplete = useCallback(() => {
    setPhase('session');
  }, []);

  const handleSessionComplete = useCallback(
    (results: InterviewResult[], durationSeconds: number, reason: InterviewEndReason) => {
      setSessionResults(results);
      setSessionDuration(durationSeconds);
      setEndReason(reason);
      setPhase('results');
    },
    []
  );

  const handleRetry = useCallback(() => {
    setSessionResults([]);
    setSessionDuration(0);
    setEndReason('complete');
    setPhase('setup');
  }, []);

  const handleSwitchMode = useCallback((newMode: InterviewMode) => {
    setSessionResults([]);
    setSessionDuration(0);
    setEndReason('complete');
    setMode(newMode);
    setPhase('countdown');
  }, []);

  return (
    <div className="page-shell">
      <AppNavigation
        locked={phase === 'session' && mode === 'realistic'}
        lockMessage="Complete the interview before leaving this page. · အင်တာဗျူးပြီးမှ ထွက်ပါ"
      />
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
        />
      )}
    </div>
  );
};

export default InterviewPage;
