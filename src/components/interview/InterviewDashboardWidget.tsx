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
      my: 'ပထမဆုံး အင်တာဗျူးစမ်းစစ်ချက် စတင်ပါ!',
    };
  }

  const last = sessions[0];
  const hasTriedRealistic = sessions.some(s => s.mode === 'realistic');
  const hasOnlyPracticed = sessions.every(s => s.mode === 'practice');

  if (hasOnlyPracticed) {
    return {
      en: 'Try realistic mode for the real experience',
      my: 'တကယ်အတိုင်း အတွက်အကြုံအတွက် လက်တွေ့မုဒ်စမ်းကြည့်ပါ',
    };
  }

  if (!hasTriedRealistic) {
    return {
      en: 'Ready to try a realistic interview?',
      my: 'လက်တွေ့အင်တာဗျူး စမ်းကြည့်မလား?',
    };
  }

  if (!last.passed) {
    return {
      en: "Keep practicing! You're improving.",
      my: 'ဆက်လေ့ကျင့်ပါ! တိုးတက်နေပါသည်၍',
    };
  }

  return {
    en: 'Great job! Try to beat your score.',
    my: 'ကျွမ်းသည်၍ သင်အမှတ်ကို ကျော်ပါ၍',
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
          <span className={`text-sm text-muted-foreground ${showBurmese ? 'font-myanmar' : ''}`}>
            {showBurmese
              ? 'တင်နေပါသည်...'
              : 'Loading...'}
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
              <p
                className={`text-sm font-semibold text-foreground ${showBurmese ? 'font-myanmar' : ''}`}
              >
                {showBurmese
                  ? strings.interview.practiceInterview.my
                  : strings.interview.practiceInterview.en}
              </p>
              <p className={`text-xs text-muted-foreground ${showBurmese ? 'font-myanmar' : ''}`}>
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
            <span className={showBurmese ? 'font-myanmar' : ''}>
              {showBurmese ? 'စတင်ပါ' : 'Start'}
            </span>
          </button>
        </div>
      </div>
    );
  }

  // Has history: show last score and contextual nudge
  const scorePercent =
    lastSession.totalQuestions > 0
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
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          goToInterview();
        }
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={clsx(
              'flex h-10 w-10 items-center justify-center rounded-xl',
              lastSession.passed ? 'bg-success-50' : 'bg-primary-100'
            )}
          >
            {lastSession.passed ? (
              <Trophy className="h-5 w-5 text-success-500" />
            ) : (
              <Mic className="h-5 w-5 text-primary-600" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p
                className={`text-sm font-semibold text-foreground ${showBurmese ? 'font-myanmar' : ''}`}
              >
                {showBurmese
                  ? `နောက်ဆုံး: ${lastSession.score}/${lastSession.totalQuestions}`
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
                {lastSession.passed ? (
                  showBurmese ? (
                    <span className="font-myanmar">{strings.interview.passed.my}</span>
                  ) : (
                    strings.interview.passed.en
                  )
                ) : showBurmese ? (
                  <span className="font-myanmar">{strings.interview.failed.my}</span>
                ) : (
                  strings.interview.failed.en
                )}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={`text-xs text-muted-foreground ${showBurmese ? 'font-myanmar' : ''}`}
              >
                {lastSession.mode === 'realistic'
                  ? showBurmese
                    ? strings.interview.realisticMode.my
                    : strings.interview.realisticMode.en
                  : showBurmese
                    ? strings.interview.practiceMode.my
                    : strings.interview.practiceMode.en}
              </span>
              <span className="text-xs text-muted-foreground">{scorePercent}%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`hidden sm:block text-xs text-muted-foreground max-w-[140px] text-right ${showBurmese ? 'font-myanmar' : ''}`}
          >
            {showBurmese ? suggestion.my : suggestion.en}
          </span>
          <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
        </div>
      </div>

      {/* Mobile suggestion text */}
      <p
        className={`sm:hidden mt-2 text-xs text-muted-foreground ${showBurmese ? 'font-myanmar' : ''}`}
      >
        {showBurmese ? suggestion.my : suggestion.en}
      </p>
    </div>
  );
}
