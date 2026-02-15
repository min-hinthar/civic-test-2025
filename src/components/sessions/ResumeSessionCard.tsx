'use client';

/**
 * ResumeSessionCard - Displays a saved session snapshot as a compact card.
 *
 * Shows type-specific icon, color accent, progress metadata (question index,
 * score), timer info, and relative timestamp. Used inside ResumePromptModal
 * to present one or more saved sessions.
 *
 * Each session type (mock-test, practice, interview) has distinct icon,
 * accent color, and metadata display. Bilingual text follows language mode.
 */

import { ClipboardCheck, BookOpen, Mic } from 'lucide-react';
import { clsx } from 'clsx';

import { useLanguage } from '@/contexts/LanguageContext';
import { timeAgo } from '@/lib/sessions/timeAgo';
import type { SessionSnapshot } from '@/lib/sessions/sessionTypes';

// ---------------------------------------------------------------------------
// Type-specific visual config
// ---------------------------------------------------------------------------

const TYPE_CONFIG = {
  'mock-test': {
    Icon: ClipboardCheck,
    iconColor: 'text-primary',
    iconBg: 'bg-primary-subtle/20',
    borderColor: 'border-primary/30',
    cardBg: 'bg-primary-subtle/10',
    label: { en: 'Mock Test', my: '\u1005\u102C\u1019\u1031\u1038\u1005\u1005\u103A' },
  },
  practice: {
    Icon: BookOpen,
    iconColor: 'text-success',
    iconBg: 'bg-success-subtle/20',
    borderColor: 'border-success/30',
    cardBg: 'bg-success-subtle/10',
    label: { en: 'Practice', my: '\u101C\u1031\u1037\u1000\u103B\u1004\u1037\u103A' },
  },
  interview: {
    Icon: Mic,
    iconColor: 'text-accent',
    iconBg: 'bg-accent/10',
    borderColor: 'border-accent/30',
    cardBg: 'bg-accent/5',
    label: {
      en: 'Interview',
      my: '\u1021\u1004\u103A\u1010\u102C\u1017\u103B\u1030\u1038',
    },
  },
} as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format seconds as "M:SS" for timer display */
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ResumeSessionCardProps {
  session: SessionSnapshot;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function ResumeSessionCard({ session, isSelected, onSelect }: ResumeSessionCardProps) {
  const { showBurmese } = useLanguage();
  const config = TYPE_CONFIG[session.type];
  const { Icon } = config;
  const relative = timeAgo(session.savedAt);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={clsx(
        'w-full rounded-2xl border p-4 shadow-sm text-left transition-all',
        config.borderColor,
        config.cardBg,
        isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
        onSelect && 'cursor-pointer hover:shadow-md'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Type icon */}
        <div
          className={clsx(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
            config.iconBg
          )}
        >
          <Icon className={clsx('h-8 w-8', config.iconColor)} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Session type label */}
          <p className="text-sm font-bold text-foreground">
            {getSessionLabel(session, showBurmese)}
          </p>

          {/* Progress + score */}
          <p className="mt-0.5 text-xs text-muted-foreground">
            {getProgressText(session, showBurmese)}
          </p>

          {/* Timer info */}
          <p className="mt-0.5 text-xs text-muted-foreground">
            {getTimerText(session, showBurmese)}
          </p>

          {/* Relative timestamp */}
          <p className="mt-1 text-[11px] text-muted-foreground/70">
            {showBurmese ? <span className="font-myanmar">{relative.my}</span> : relative.en}
          </p>
        </div>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Display text helpers (discriminated union narrowing)
// ---------------------------------------------------------------------------

function getSessionLabel(session: SessionSnapshot, showBurmese: boolean): string {
  const config = TYPE_CONFIG[session.type];

  switch (session.type) {
    case 'mock-test':
      return showBurmese ? config.label.my : config.label.en;
    case 'practice': {
      const catName = showBurmese ? session.config.categoryName.my : session.config.categoryName.en;
      return showBurmese ? `${config.label.my}: ${catName}` : `${config.label.en}: ${catName}`;
    }
    case 'interview': {
      const modeLabel =
        session.mode === 'realistic'
          ? showBurmese
            ? '\u1021\u1005\u1005\u103A'
            : 'Realistic'
          : showBurmese
            ? '\u101C\u1031\u1037\u1000\u103B\u1004\u1037\u103A'
            : 'Practice';
      return showBurmese ? `${config.label.my}: ${modeLabel}` : `${config.label.en}: ${modeLabel}`;
    }
  }
}

function getProgressText(session: SessionSnapshot, showBurmese: boolean): string {
  const qNum = session.currentIndex + 1;
  const total = session.questions.length;
  const qText = `Q${qNum}/${total}`;

  switch (session.type) {
    case 'mock-test': {
      const correct = session.results.filter(r => r.isCorrect).length;
      const answered = session.results.length;
      return showBurmese
        ? `${qText} \u2022 ${correct}/${answered} \u1019\u103E\u1014\u103A`
        : `${qText} \u2022 ${correct}/${answered} correct`;
    }
    case 'practice': {
      const correct = session.results.filter(r => r.isCorrect).length;
      const answered = session.results.length;
      return showBurmese
        ? `${qText} \u2022 ${correct}/${answered} \u1019\u103E\u1014\u103A`
        : `${qText} \u2022 ${correct}/${answered} correct`;
    }
    case 'interview': {
      return showBurmese
        ? `${qText} \u2022 ${session.correctCount} \u1019\u103E\u1014\u103A / ${session.incorrectCount} \u1019\u103E\u102C\u1038`
        : `${qText} \u2022 ${session.correctCount} correct / ${session.incorrectCount} incorrect`;
    }
  }
}

function getTimerText(session: SessionSnapshot, showBurmese: boolean): string {
  switch (session.type) {
    case 'mock-test':
      return showBurmese
        ? `\u1000\u103B\u1014\u103A\u1021\u1001\u103B\u102D\u1014\u103A: ${formatTime(session.timeLeft)}`
        : `Time remaining: ${formatTime(session.timeLeft)}`;
    case 'practice':
      if (!session.timerEnabled) {
        return showBurmese
          ? '\u1021\u1001\u103B\u102D\u1014\u103A\u1019\u101B\u103E\u102D'
          : 'Untimed';
      }
      return showBurmese
        ? `\u1000\u103B\u1014\u103A\u1021\u1001\u103B\u102D\u1014\u103A: ${formatTime(session.timeLeft)}`
        : `Time remaining: ${formatTime(session.timeLeft)}`;
    case 'interview':
      return showBurmese
        ? '\u1021\u1001\u103B\u102D\u1014\u103A\u1019\u101B\u103E\u102D'
        : 'Untimed';
  }
}
