'use client';

import { memo, useEffect, useRef, useCallback } from 'react';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useLanguage } from '@/contexts/LanguageContext';
import { playCompletionSparkle } from '@/lib/audio/soundEffects';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SegmentStatus = 'correct' | 'incorrect' | 'skipped' | 'current' | 'unanswered';

export interface SegmentedProgressBarProps {
  segments: SegmentStatus[];
  currentIndex: number;
  totalCount: number;
  correctCount?: number;
  allowTap?: boolean;
  onSegmentTap?: (index: number) => void;
  showLiveScore?: boolean;
  showBurmese: boolean;
}

// ---------------------------------------------------------------------------
// Bilingual labels
// ---------------------------------------------------------------------------

const labels = {
  correct: { en: 'correct', my: '\u1019\u103E\u1014\u103A' },
  questionN: { en: 'Question', my: '\u1019\u1031\u1038\u1001\u103D\u1014\u103A\u1038' },
};

// ---------------------------------------------------------------------------
// Segment color mapping (CSS classes using design tokens)
// ---------------------------------------------------------------------------

const segmentColorClass: Record<SegmentStatus, string> = {
  correct: 'bg-success',
  incorrect: 'bg-warning',
  skipped: 'bg-amber-400',
  current: 'bg-primary',
  unanswered: 'bg-muted/30',
};

// ---------------------------------------------------------------------------
// Capitalized status labels for screen reader clarity
// ---------------------------------------------------------------------------

const statusLabels: Record<SegmentStatus, string> = {
  correct: 'Correct',
  incorrect: 'Incorrect',
  skipped: 'Skipped',
  current: 'Current',
  unanswered: 'Unanswered',
};

// ---------------------------------------------------------------------------
// Individual Segment (React.memo for perf -- only re-renders when props change)
// ---------------------------------------------------------------------------

interface SegmentProps {
  index: number;
  status: SegmentStatus;
  allowTap: boolean;
  onTap: (index: number) => void;
  shouldReduceMotion: boolean;
}

const Segment = memo(function Segment({
  index,
  status,
  allowTap,
  onTap,
  shouldReduceMotion,
}: SegmentProps) {
  const isCurrent = status === 'current';
  const isTappable = allowTap && status !== 'current' && status !== 'unanswered';

  const handleClick = useCallback(() => {
    if (isTappable) {
      onTap(index);
    }
  }, [isTappable, onTap, index]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (isTappable && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onTap(index);
      }
    },
    [isTappable, onTap, index]
  );

  return (
    <div
      role="listitem"
      aria-label={`Question ${index + 1}: ${statusLabels[status]}`}
      className={clsx(
        'flex-1 min-w-[8px] h-full rounded-full transition-colors duration-300',
        segmentColorClass[status],
        isCurrent && !shouldReduceMotion && 'animate-pulse',
        isTappable && 'cursor-pointer hover:opacity-80'
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={isTappable ? 0 : undefined}
    />
  );
});

// ---------------------------------------------------------------------------
// SegmentedProgressBar
// ---------------------------------------------------------------------------

export function SegmentedProgressBar({
  segments,
  currentIndex: _currentIndex,
  totalCount,
  correctCount,
  allowTap = false,
  onSegmentTap,
  showLiveScore = false,
  showBurmese,
}: SegmentedProgressBarProps) {
  const shouldReduceMotion = useReducedMotion();
  const { showBurmese: langShowBurmese } = useLanguage();
  const effectiveShowBurmese = showBurmese ?? langShowBurmese;

  // Track completion for sparkle effect (refs only -- no setState in effect)
  const hasPlayedRef = useRef(false);
  const prevAllFilledRef = useRef(false);
  const allFilled =
    segments.length > 0 && segments.every(s => s !== 'unanswered' && s !== 'current');

  useEffect(() => {
    if (allFilled && !prevAllFilledRef.current && !hasPlayedRef.current) {
      playCompletionSparkle();
      hasPlayedRef.current = true;
    }
    prevAllFilledRef.current = allFilled;
  }, [allFilled]);

  const handleSegmentTap = useCallback(
    (index: number) => {
      onSegmentTap?.(index);
    },
    [onSegmentTap]
  );

  // Fraction label
  const answeredCount = segments.filter(
    s => s === 'correct' || s === 'incorrect' || s === 'skipped'
  ).length;
  const fractionText = `${answeredCount}/${totalCount}`;

  // Live score label
  const scoreText =
    showLiveScore && correctCount !== undefined
      ? `${correctCount}/${answeredCount} ${effectiveShowBurmese ? labels.correct.my : labels.correct.en}`
      : null;

  return (
    <div className="w-full space-y-1.5">
      {/* Labels row: fraction on left, live score on right */}
      <div className="flex items-center justify-between px-0.5">
        <span className="text-xs font-medium text-muted-foreground tabular-nums">
          {fractionText}
        </span>
        {scoreText && (
          <span
            className={clsx(
              'text-xs font-medium text-success tabular-nums',
              effectiveShowBurmese && 'font-myanmar'
            )}
          >
            {scoreText}
          </span>
        )}
      </div>

      {/* Segmented bar */}
      <div
        role="list"
        aria-label="Quiz progress"
        className={clsx(
          'flex gap-[2px] h-2.5 w-full rounded-full',
          allFilled && !shouldReduceMotion && 'shadow-[0_0_12px_hsl(var(--success))]',
          allFilled && 'transition-shadow duration-500'
        )}
      >
        {segments.map((status, i) => (
          <Segment
            key={i}
            index={i}
            status={status}
            allowTap={allowTap}
            onTap={handleSegmentTap}
            shouldReduceMotion={shouldReduceMotion}
          />
        ))}
      </div>
    </div>
  );
}
