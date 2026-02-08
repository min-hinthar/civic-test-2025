'use client';

/**
 * InterviewDashboardWidget - Dashboard card for interview simulation status.
 *
 * Shows at-a-glance interview stats with contextual suggestions:
 * - No history: "Try your first interview" CTA
 * - Has history: last score, mode, and a contextual nudge
 *
 * Loads data from IndexedDB via getInterviewHistory().
 * Follows SRSWidget layout patterns (Card with compact styling).
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Trophy, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

import { useLanguage } from '@/contexts/LanguageContext';
import { getInterviewHistory } from '@/lib/interview';
import type { InterviewSession } from '@/types';
import { strings } from '@/lib/i18n/strings';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface Suggestion {
  en: string;
  my: string;
}

function getContextualSuggestion(sessions: InterviewSession[]): Suggestion {
  if (sessions.length === 0) {
    return {
      en: 'Try your first mock interview!',
      my: '\u1015\u1011\u1019\u1006\u102F\u1036\u1038 \u1021\u1004\u103A\u1010\u102C\u1017\u103B\u1030\u1038\u1005\u1019\u103A\u1038\u1005\u1005\u103A\u1001\u103B\u1000\u103A \u1005\u1010\u1004\u103A\u1015\u102B!',
    };
  }

  const last = sessions[0];
  const hasTriedRealistic = sessions.some(s => s.mode === 'realistic');
  const hasOnlyPracticed = sessions.every(s => s.mode === 'practice');

  if (hasOnlyPracticed) {
    return {
      en: 'Try realistic mode for the real experience',
      my: '\u1010\u1000\u101A\u103A\u1021\u1010\u102D\u102F\u1004\u103A\u1038 \u1021\u1010\u103D\u1000\u103A\u1021\u1000\u103C\u102F\u1036\u1021\u1010\u103D\u1000\u103A \u101C\u1000\u103A\u1010\u103D\u1031\u1037\u1019\u102F\u1012\u103A\u1005\u1019\u103A\u1038\u1000\u103C\u100A\u103A\u1037\u1015\u102B',
    };
  }

  if (!hasTriedRealistic) {
    return {
      en: 'Ready to try a realistic interview?',
      my: '\u101C\u1000\u103A\u1010\u103D\u1031\u1037\u1021\u1004\u103A\u1010\u102C\u1017\u103B\u1030\u1038 \u1005\u1019\u103A\u1038\u1000\u103C\u100A\u103A\u1037\u1019\u101C\u102C\u1038?',
    };
  }

  if (!last.passed) {
    return {
      en: 'Keep practicing! You\'re improving.',
      my: '\u1006\u1000\u103A\u101C\u1031\u1037\u1000\u103B\u1004\u103A\u1037\u1015\u102B! \u1010\u102D\u102F\u1038\u1010\u1000\u103A\u1014\u1031\u1015\u102B\u101E\u100A\u103A\u104D',
    };
  }

  return {
    en: 'Great job! Try to beat your score.',
    my: '\u1000\u103B\u103D\u1019\u103A\u1038\u101E\u100A\u103A\u104D \u101E\u1004\u103A\u1021\u1019\u103E\u1010\u103A\u1000\u102D\u102F \u1000\u103B\u1031\u102C\u103A\u1015\u102B\u104D',
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface InterviewDashboardWidgetProps {
  className?: string;
}

export function InterviewDashboardWidget({ className }: InterviewDashboardWidgetProps) {
  const navigate = useNavigate();
  const { showBurmese } = useLanguage();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getInterviewHistory()
      .then(history => {
        if (!cancelled) {
          setSessions(history);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const goToInterview = useCallback(() => {
    navigate('/interview');
  }, [navigate]);

  // Loading state
  if (isLoading) {
    return (
      <div
        className={clsx(
          'rounded-2xl border border-border/60 bg-card p-5 shadow-lg shadow-primary/10',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          <span className="text-sm text-muted-foreground">
            {showBurmese ? '\u1010\u1004\u103A\u1014\u1031\u1015\u102B\u101E\u100A\u103A...' : 'Loading...'}
          </span>
        </div>
      </div>
    );
  }

  const suggestion = getContextualSuggestion(sessions);
  const lastSession = sessions[0];

  // Empty state: no interview history
  if (!lastSession) {
    return (
      <div
        className={clsx(
          'rounded-2xl border border-border/60 bg-card p-5 shadow-lg shadow-primary/10',
          className
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
              <Mic className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {showBurmese
                  ? strings.interview.practiceInterview.my
                  : strings.interview.practiceInterview.en}
              </p>
              <p className="text-xs text-muted-foreground">
                {showBurmese ? suggestion.my : suggestion.en}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={goToInterview}
            className="flex h-9 items-center gap-1.5 rounded-full bg-primary-500 px-3.5 text-sm font-medium text-white transition-colors hover:bg-primary-600 min-h-[44px]"
          >
            <Mic className="h-3.5 w-3.5" />
            <span>
              {showBurmese ? '\u1005\u1010\u1004\u103A\u1015\u102B' : 'Start'}
            </span>
          </button>
        </div>
      </div>
    );
  }

  // Has history: show last score and contextual nudge
  const scorePercent = lastSession.totalQuestions > 0
    ? Math.round((lastSession.score / lastSession.totalQuestions) * 100)
    : 0;

  return (
    <div
      className={clsx(
        'rounded-2xl border border-border/60 bg-card p-5 shadow-lg shadow-primary/10 cursor-pointer',
        className
      )}
      onClick={goToInterview}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          goToInterview();
        }
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={clsx(
            'flex h-10 w-10 items-center justify-center rounded-xl',
            lastSession.passed ? 'bg-success-50' : 'bg-primary-100'
          )}>
            {lastSession.passed ? (
              <Trophy className="h-5 w-5 text-success-500" />
            ) : (
              <Mic className="h-5 w-5 text-primary-600" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">
                {showBurmese
                  ? `\u1014\u1031\u102C\u1000\u103A\u1006\u102F\u1036\u1038: ${lastSession.score}/${lastSession.totalQuestions}`
                  : `Last Interview: ${lastSession.score}/${lastSession.totalQuestions}`}
              </p>
              <span
                className={clsx(
                  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
                  lastSession.passed
                    ? 'bg-success-50 text-success-500'
                    : 'bg-warning-50 text-warning-500'
                )}
              >
                {lastSession.passed
                  ? (showBurmese ? strings.interview.passed.my : strings.interview.passed.en)
                  : (showBurmese ? strings.interview.failed.my : strings.interview.failed.en)}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground">
                {lastSession.mode === 'realistic'
                  ? (showBurmese ? strings.interview.realisticMode.my : strings.interview.realisticMode.en)
                  : (showBurmese ? strings.interview.practiceMode.my : strings.interview.practiceMode.en)}
              </span>
              <span className="text-xs text-muted-foreground">
                {scorePercent}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:block text-xs text-muted-foreground max-w-[140px] text-right">
            {showBurmese ? suggestion.my : suggestion.en}
          </span>
          <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
        </div>
      </div>

      {/* Mobile suggestion text */}
      <p className="sm:hidden mt-2 text-xs text-muted-foreground">
        {showBurmese ? suggestion.my : suggestion.en}
      </p>
    </div>
  );
}
