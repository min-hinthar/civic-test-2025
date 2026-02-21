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

import { motion } from 'motion/react';
import { ClipboardCheck, BookOpen, Mic, Layers } from 'lucide-react';
import { clsx } from 'clsx';
import { SPRING_SNAPPY } from '@/lib/motion-config';

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
    label: { en: 'Mock Test', my: 'စမ်းသပ်စာမေးပွဲ' },
  },
  practice: {
    Icon: BookOpen,
    iconColor: 'text-success',
    iconBg: 'bg-success-subtle/20',
    borderColor: 'border-success/30',
    cardBg: 'bg-success-subtle/10',
    label: { en: 'Practice', my: 'လေ့ကျင့်' },
  },
  interview: {
    Icon: Mic,
    iconColor: 'text-accent',
    iconBg: 'bg-accent/10',
    borderColor: 'border-accent/30',
    cardBg: 'bg-accent/5',
    label: {
      en: 'Interview',
      my: 'အင်တာဗျူး',
    },
  },
  sort: {
    Icon: Layers,
    iconColor: 'text-accent-purple',
    iconBg: 'bg-accent-purple/10',
    borderColor: 'border-accent-purple/30',
    cardBg: 'bg-accent-purple/5',
    label: {
      en: 'Flashcard Sort',
      my: 'ကဒ်စီစုံ',
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
    <motion.button
      type="button"
      onClick={onSelect}
      whileTap={{ scale: 0.97 }}
      transition={SPRING_SNAPPY}
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
          <p className={`text-sm font-bold text-foreground ${showBurmese ? 'font-myanmar' : ''}`}>
            {getSessionLabel(session, showBurmese)}
          </p>

          {/* Progress + score */}
          <p
            className={`mt-0.5 text-xs text-muted-foreground ${showBurmese ? 'font-myanmar' : ''}`}
          >
            {getProgressText(session, showBurmese)}
          </p>

          {/* Timer info */}
          <p
            className={`mt-0.5 text-xs text-muted-foreground ${showBurmese ? 'font-myanmar' : ''}`}
          >
            {getTimerText(session, showBurmese)}
          </p>

          {/* Relative timestamp */}
          <p className="mt-1 text-body-xs text-muted-foreground/70">
            {showBurmese ? <span className="font-myanmar">{relative.my}</span> : relative.en}
          </p>
        </div>
      </div>
    </motion.button>
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
            ? 'အစစ်'
            : 'Realistic'
          : showBurmese
            ? 'လေ့ကျင့်'
            : 'Practice';
      return showBurmese ? `${config.label.my}: ${modeLabel}` : `${config.label.en}: ${modeLabel}`;
    }
    case 'sort': {
      if (session.categoryFilter) {
        return showBurmese
          ? `${config.label.my}: ${session.categoryFilter}`
          : `${config.label.en}: ${session.categoryFilter}`;
      }
      return showBurmese ? config.label.my : config.label.en;
    }
  }
}

function getProgressText(session: SessionSnapshot, showBurmese: boolean): string {
  switch (session.type) {
    case 'mock-test': {
      const qNum = session.currentIndex + 1;
      const total = session.questions.length;
      const qText = `Q${qNum}/${total}`;
      const correct = session.results.filter(r => r.isCorrect).length;
      const answered = session.results.length;
      return showBurmese
        ? `${qText} \u2022 ${correct}/${answered} မှန်`
        : `${qText} \u2022 ${correct}/${answered} correct`;
    }
    case 'practice': {
      const qNum = session.currentIndex + 1;
      const total = session.questions.length;
      const qText = `Q${qNum}/${total}`;
      const correct = session.results.filter(r => r.isCorrect).length;
      const answered = session.results.length;
      return showBurmese
        ? `${qText} \u2022 ${correct}/${answered} မှန်`
        : `${qText} \u2022 ${correct}/${answered} correct`;
    }
    case 'interview': {
      const qNum = session.currentIndex + 1;
      const total = session.questions.length;
      const qText = `Q${qNum}/${total}`;
      return showBurmese
        ? `${qText} \u2022 ${session.correctCount} မှန် / ${session.incorrectCount} မှား`
        : `${qText} \u2022 ${session.correctCount} correct / ${session.incorrectCount} incorrect`;
    }
    case 'sort': {
      const cardNum = session.currentIndex + 1;
      const total = session.remainingCardIds.length;
      const known = session.knownIds.length;
      const roundLabel = showBurmese ? `အကြိမ် ${session.round}` : `Round ${session.round}`;
      return showBurmese
        ? `${roundLabel} \u2022 ${cardNum}/${total} \u2022 ${known} သိ`
        : `${roundLabel} \u2022 ${cardNum}/${total} \u2022 ${known} known`;
    }
  }
}

function getTimerText(session: SessionSnapshot, showBurmese: boolean): string {
  switch (session.type) {
    case 'mock-test':
      return showBurmese
        ? `ကျန်အချိန်: ${formatTime(session.timeLeft)}`
        : `Time remaining: ${formatTime(session.timeLeft)}`;
    case 'practice':
      if (!session.timerEnabled) {
        return showBurmese ? 'အချိန်မရှိ' : 'Untimed';
      }
      return showBurmese
        ? `ကျန်အချိန်: ${formatTime(session.timeLeft)}`
        : `Time remaining: ${formatTime(session.timeLeft)}`;
    case 'interview':
    case 'sort':
      return showBurmese ? 'အချိန်မရှိ' : 'Untimed';
  }
}
