'use client';

import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { SegmentedProgressBar, type SegmentStatus } from '@/components/quiz/SegmentedProgressBar';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SortProgressProps {
  totalCards: number;
  knowCount: number;
  dontKnowCount: number;
  /** Array of sort results in order: 'know' | 'dont-know' | null (unsorted) */
  segments: ('know' | 'dont-know' | null)[];
  /** Current round number (1-based) */
  round?: number;
  showBurmese: boolean;
}

// ---------------------------------------------------------------------------
// Bilingual labels
// ---------------------------------------------------------------------------

const labels = {
  know: { en: 'Know', my: 'သိပါတယ်' },
  dontKnow: { en: "Don't Know", my: 'မသိပါ' },
  round: { en: 'Round', my: 'အကြိမ်' },
};

// ---------------------------------------------------------------------------
// Map sort segment to SegmentedProgressBar status
// ---------------------------------------------------------------------------

function mapSegmentStatus(
  seg: 'know' | 'dont-know' | null,
  index: number,
  currentIndex: number
): SegmentStatus {
  if (index === currentIndex && seg === null) return 'current';
  if (seg === 'know') return 'correct';
  if (seg === 'dont-know') return 'incorrect';
  return 'unanswered';
}

// ---------------------------------------------------------------------------
// Counter animation spring config
// ---------------------------------------------------------------------------

const COUNTER_SPRING = { type: 'spring' as const, stiffness: 500, damping: 15 };

// ---------------------------------------------------------------------------
// SortProgress
// ---------------------------------------------------------------------------

/**
 * Dual counters + adaptive progress bar for sort mode.
 *
 * - Animated Know/Don't Know counters with pop + color flash on increment
 * - Segmented progress bar for <=40 cards, continuous bar for >40
 * - Round counter badge for round > 1
 */
export function SortProgress({
  totalCards,
  knowCount,
  dontKnowCount,
  segments,
  round = 1,
  showBurmese,
}: SortProgressProps) {
  const sortedCount = knowCount + dontKnowCount;
  const currentIndex = sortedCount < totalCards ? sortedCount : totalCards - 1;
  const useSegmented = totalCards <= 40;

  // Map sort segments to SegmentedProgressBar statuses
  const mappedSegments: SegmentStatus[] = useSegmented
    ? segments.map((seg, i) => mapSegmentStatus(seg, i, currentIndex))
    : [];

  // Continuous bar percentages
  const knowPercent = totalCards > 0 ? (knowCount / totalCards) * 100 : 0;
  const dontKnowPercent = totalCards > 0 ? (dontKnowCount / totalCards) * 100 : 0;

  return (
    <div className="w-full space-y-2">
      {/* Round counter badge */}
      {round > 1 && (
        <div className="flex justify-center">
          <span
            className={clsx(
              'inline-flex items-center gap-1 rounded-full bg-accent-purple/15 px-3 py-0.5',
              'text-xs font-semibold text-accent-purple',
              showBurmese && 'font-myanmar'
            )}
          >
            {showBurmese ? `${labels.round.my} ${round}` : `${labels.round.en} ${round}`}
          </span>
        </div>
      )}

      {/* Dual counters row */}
      <div className="flex items-center justify-between px-1">
        {/* Don't Know counter (left) */}
        <div className="flex items-center gap-1.5">
          <motion.span
            key={`dk-${dontKnowCount}`}
            animate={{
              scale: [1.3, 1],
              backgroundColor: ['hsl(var(--warning) / 0.3)', 'hsl(var(--warning) / 0)'],
            }}
            transition={COUNTER_SPRING}
            className={clsx(
              'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5',
              'text-sm font-bold tabular-nums',
              'text-warning'
            )}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className="shrink-0"
              aria-hidden="true"
            >
              <path
                d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            {dontKnowCount}
          </motion.span>
          <span className={clsx('text-xs text-muted-foreground', showBurmese && 'font-myanmar')}>
            {showBurmese ? labels.dontKnow.my : labels.dontKnow.en}
          </span>
        </div>

        {/* Fraction */}
        <span className="text-xs font-medium text-muted-foreground tabular-nums">
          {sortedCount}/{totalCards}
        </span>

        {/* Know counter (right) */}
        <div className="flex items-center gap-1.5">
          <span className={clsx('text-xs text-muted-foreground', showBurmese && 'font-myanmar')}>
            {showBurmese ? labels.know.my : labels.know.en}
          </span>
          <motion.span
            key={`k-${knowCount}`}
            animate={{
              scale: [1.3, 1],
              backgroundColor: ['hsl(var(--success) / 0.3)', 'hsl(var(--success) / 0)'],
            }}
            transition={COUNTER_SPRING}
            className={clsx(
              'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5',
              'text-sm font-bold tabular-nums',
              'text-success'
            )}
          >
            {knowCount}
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className="shrink-0"
              aria-hidden="true"
            >
              <path
                d="M2.5 7L5.5 10L11.5 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.span>
        </div>
      </div>

      {/* Adaptive progress bar */}
      {useSegmented ? (
        <SegmentedProgressBar
          segments={mappedSegments}
          currentIndex={currentIndex}
          totalCount={totalCards}
          showBurmese={showBurmese}
        />
      ) : (
        /* Continuous bar for >40 cards */
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted/30">
          <div className="flex h-full">
            {knowPercent > 0 && (
              <div
                className="h-full bg-success transition-all duration-300"
                style={{ width: `${knowPercent}%` }}
              />
            )}
            {dontKnowPercent > 0 && (
              <div
                className="h-full bg-warning transition-all duration-300"
                style={{ width: `${dontKnowPercent}%` }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
