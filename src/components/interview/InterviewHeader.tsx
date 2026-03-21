'use client';

import { LogOut } from 'lucide-react';
import { clsx } from 'clsx';

import { ModeBadge } from '@/components/interview/ModeBadge';
import { InterviewProgress } from '@/components/interview/InterviewProgress';
import { InterviewTimer } from '@/components/interview/InterviewTimer';
import { LongPressButton } from '@/components/interview/LongPressButton';
import {
  REALISTIC_TIMER_SECONDS,
  QUESTIONS_PER_SESSION,
} from '@/lib/interview/interviewStateMachine';
import type { InterviewMode } from '@/types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface InterviewHeaderProps {
  mode: InterviewMode;
  currentIndex: number;
  totalQuestions: number;
  progressResults: Array<{ isCorrect: boolean } | null>;
  correctCount: number;
  showBurmese: boolean;
  showTimer: boolean;
  onTimerExpired: () => void;
  onQuitClick: () => void;
  onEmergencyExit: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function InterviewHeader({
  mode,
  currentIndex,
  totalQuestions,
  progressResults,
  correctCount,
  showBurmese,
  showTimer,
  onTimerExpired,
  onQuitClick,
  onEmergencyExit,
}: InterviewHeaderProps) {
  return (
    <>
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <ModeBadge mode={mode} />
          <InterviewProgress
            mode={mode}
            currentIndex={currentIndex}
            totalQuestions={totalQuestions}
            results={progressResults}
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Score display (Practice only -- Real hides score) */}
          {mode === 'practice' && (
            <span className="text-xs text-white/50">
              {correctCount} correct
              {showBurmese && (
                <span className="font-myanmar ml-1">{correctCount} မှန်</span>
              )}
            </span>
          )}

          {mode === 'practice' ? (
            <button
              type="button"
              onClick={onQuitClick}
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
            <LongPressButton onLongPress={onEmergencyExit}>
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
            onExpired={onTimerExpired}
            isActive
          />
        </div>
      )}
    </>
  );
}
