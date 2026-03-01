'use client';

import { AlertTriangle } from 'lucide-react';
import { strings } from '@/lib/i18n/strings';

interface TrickyBadgeProps {
  showBurmese?: boolean;
}

/**
 * Small pill badge indicating a tricky/commonly confused question.
 * Amber/warning color with AlertTriangle icon.
 * Follows DrillBadge/ModeBadge pattern.
 */
export function TrickyBadge({ showBurmese = false }: TrickyBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
      <AlertTriangle className="h-3 w-3" />
      {strings.quiz.trickyQuestion.en}
      {showBurmese && <span className="font-myanmar ml-0.5">{strings.quiz.trickyQuestion.my}</span>}
    </span>
  );
}
