'use client';

import { clsx } from 'clsx';
import { BookOpen, Play } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getNudgeMessage, getUnattemptedMessage } from '@/lib/mastery';
import { strings } from '@/lib/i18n/strings';

export interface WeakAreaNudgeProps {
  /** Category identifier */
  category: string;
  /** Mastery percentage (0-100), or 0 if unattempted */
  mastery: number;
  /** Whether the category has never been attempted */
  isUnattempted: boolean;
  /** Navigate to practice mode for this category */
  onPractice: () => void;
  /** Navigate to study guide for this category */
  onReview: () => void;
}

/**
 * Individual weak area nudge card.
 *
 * Shows category name, mastery level or "Not started", an encouraging message,
 * and quick-action buttons for practice and review.
 *
 * Distinct styling:
 * - Unattempted: neutral/inviting (blue-tinted border)
 * - Weak: orange accent, encouraging
 */
export function WeakAreaNudge({
  category,
  mastery,
  isUnattempted,
  onPractice,
  onReview,
}: WeakAreaNudgeProps) {
  const { showBurmese } = useLanguage();

  const message = isUnattempted
    ? getUnattemptedMessage(category)
    : getNudgeMessage(category, mastery);

  return (
    <div
      className={clsx(
        'rounded-2xl border p-4 transition-colors',
        isUnattempted
          ? 'border-primary-500/20 bg-primary-subtle/50'
          : 'border-warning/20 bg-warning-subtle/50'
      )}
    >
      {/* Category name and mastery */}
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-foreground truncate">{category}</h4>
        <span
          className={clsx(
            'text-xs font-semibold tabular-nums whitespace-nowrap',
            isUnattempted ? 'text-primary' : mastery < 30 ? 'text-warning' : 'text-warning'
          )}
        >
          {isUnattempted ? strings.progress.notStarted.en : `${mastery}%`}
        </span>
      </div>

      {/* Nudge message */}
      <p className="mt-1 text-xs text-muted-foreground">{message.en}</p>
      {showBurmese && <p className="text-xs text-muted-foreground font-myanmar">{message.my}</p>}

      {/* Action buttons */}
      <div className="mt-3 flex gap-2">
        <button
          onClick={onPractice}
          className={clsx(
            'inline-flex items-center gap-1.5 rounded-xl px-3 py-2',
            'text-xs font-semibold transition-colors',
            'min-h-[44px]',
            isUnattempted
              ? 'bg-primary text-white hover:bg-primary'
              : 'bg-warning text-white hover:bg-warning-600'
          )}
        >
          <Play className="h-3.5 w-3.5" />
          <span>{strings.progress.practiceNow.en}</span>
          {showBurmese && (
            <span className="font-myanmar text-[10px]">{strings.progress.practiceNow.my}</span>
          )}
        </button>
        <button
          onClick={onReview}
          className={clsx(
            'inline-flex items-center gap-1.5 rounded-xl px-3 py-2',
            'text-xs font-semibold transition-colors',
            'min-h-[44px]',
            'border border-border bg-card text-foreground hover:bg-muted/40'
          )}
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>{strings.progress.reviewInGuide.en}</span>
          {showBurmese && (
            <span className="font-myanmar text-[10px]">{strings.progress.reviewInGuide.my}</span>
          )}
        </button>
      </div>
    </div>
  );
}
