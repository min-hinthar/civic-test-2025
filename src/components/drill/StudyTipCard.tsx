'use client';

import { useState } from 'react';
import { GraduationCap, X } from 'lucide-react';
import { clsx } from 'clsx';
import { useLanguage } from '@/contexts/LanguageContext';
import { strings } from '@/lib/i18n/strings';

const STORAGE_KEY = 'dismissed-study-tips';

function isDismissed(category: string): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const dismissed: string[] = JSON.parse(raw);
    return dismissed.includes(category);
  } catch {
    return false;
  }
}

function dismissTip(category: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const dismissed: string[] = raw ? JSON.parse(raw) : [];
    if (!dismissed.includes(category)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...dismissed, category]));
    }
  } catch {
    // localStorage not available — fail silently
  }
}

interface StudyTipCardProps {
  /** Category name (used as key for dismissal) */
  category: string;
  /** English tip text */
  tipEn: string;
  /** Burmese tip text */
  tipMy: string;
  /** Additional class names */
  className?: string;
}

/**
 * Dismissible study tip card shown at the top of category drill.
 *
 * Features:
 * - GraduationCap icon with bilingual tip content
 * - Permanent dismiss: once dismissed, never shows again for this category
 * - Stored in localStorage under 'dismissed-study-tips'
 * - Respects bilingual language toggle
 */
export function StudyTipCard({ category, tipEn, tipMy, className }: StudyTipCardProps) {
  const [visible, setVisible] = useState(() => !isDismissed(category));
  const { showBurmese } = useLanguage();

  if (!visible) return null;

  return (
    <div
      className={clsx('rounded-xl border border-primary/20 bg-primary-subtle p-3', className)}
      role="note"
      aria-label={strings.drill.studyTip.en}
    >
      <div className="flex items-start gap-2.5">
        <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-xs font-semibold text-foreground">
            {strings.drill.studyTip.en}
            {showBurmese && (
              <span className="font-myanmar ml-1 font-normal text-muted-foreground">
                {strings.drill.studyTip.my}
              </span>
            )}
          </p>
          <p className="text-sm leading-relaxed text-foreground">{tipEn}</p>
          {showBurmese && (
            <p className="font-myanmar mt-1 text-sm leading-relaxed text-muted-foreground">
              {tipMy}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            dismissTip(category);
            setVisible(false);
          }}
          className={clsx(
            'shrink-0 rounded-lg p-1.5',
            'transition-colors hover:bg-muted/50',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
          )}
          aria-label="Dismiss study tip"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
