'use client';

import { useState, useCallback } from 'react';
import AppNavigation from '@/components/AppNavigation';
import { InterviewSetup } from '@/components/interview/InterviewSetup';
import { InterviewCountdown } from '@/components/interview/InterviewCountdown';
import type { InterviewMode } from '@/types';

type InterviewPhase = 'setup' | 'countdown' | 'session' | 'results';

/**
 * Interview simulation page managing setup -> countdown -> session -> results flow.
 *
 * State machine:
 * - setup: User selects Realistic or Practice mode
 * - countdown: 3-2-1-Begin countdown animation
 * - session: Active interview (placeholder, coming in plan 06-04)
 * - results: Post-interview review (placeholder, coming in plan 06-05)
 */
const InterviewPage = () => {
  const [phase, setPhase] = useState<InterviewPhase>('setup');
  const [mode, setMode] = useState<InterviewMode>('practice');

  const handleStart = useCallback((selectedMode: InterviewMode) => {
    setMode(selectedMode);
    setPhase('countdown');
  }, []);

  const handleCountdownComplete = useCallback(() => {
    setPhase('session');
  }, []);

  const handleRetry = useCallback(() => {
    setPhase('setup');
  }, []);

  return (
    <div className="page-shell">
      <AppNavigation
        locked={phase === 'session' && mode === 'realistic'}
        lockMessage="Complete the interview before leaving this page. · အင်တာဗျူးပြီးမှ ထွက်ပါ"
      />
      {phase === 'setup' && <InterviewSetup onStart={handleStart} />}
      {phase === 'countdown' && (
        <InterviewCountdown onComplete={handleCountdownComplete} />
      )}
      {phase === 'session' && (
        <div className="flex flex-1 items-center justify-center p-8">
          <p className="text-muted-foreground">
            Interview session coming in plan 06-04
          </p>
        </div>
      )}
      {phase === 'results' && (
        <div className="flex flex-1 items-center justify-center p-8">
          <p className="text-muted-foreground">
            Interview results coming in plan 06-05
          </p>
          <button
            onClick={handleRetry}
            className="ml-4 rounded-full bg-primary-500 px-4 py-2 text-white"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default InterviewPage;
