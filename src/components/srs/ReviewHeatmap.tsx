'use client';

/**
 * ReviewHeatmap - GitHub-style activity heatmap for SRS review history.
 *
 * Renders a CSS Grid of cells representing daily review activity over
 * the past 60 days (desktop) or 30 days (mobile). Color intensity
 * maps to review count per day.
 *
 * Pure CSS grid + Tailwind (no external chart library).
 */

import { useMemo } from 'react';
import clsx from 'clsx';
import type { SRSCardRecord } from '@/lib/srs';
import { useLanguage } from '@/contexts/LanguageContext';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ReviewHeatmapProps {
  deck: SRSCardRecord[];
  className?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
const DAY_LABELS_MY = ['', '\u1010\u1014\u1039\u101C\u102C', '', '\u1017\u102F\u1012\u1039\u1013', '', '\u101E\u1031\u102C', ''];

/** Color intensity classes based on review count */
function getCellColor(count: number): string {
  if (count === 0) return 'bg-muted/40';
  if (count <= 2) return 'bg-primary-200';
  if (count <= 5) return 'bg-primary-400';
  return 'bg-primary-500';
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a map of date string -> review count from deck lastReviewedAt dates.
 */
function buildReviewCountMap(deck: SRSCardRecord[]): Map<string, number> {
  const counts = new Map<string, number>();

  for (const record of deck) {
    if (record.lastReviewedAt) {
      const dateStr = record.lastReviewedAt.slice(0, 10); // 'YYYY-MM-DD'
      counts.set(dateStr, (counts.get(dateStr) ?? 0) + 1);
    }
  }

  return counts;
}

/**
 * Generate an array of dates from `daysAgo` days ago to today.
 * Returns dates aligned to start on a Sunday (for week columns).
 */
function generateDateGrid(daysAgo: number): { dates: Date[]; monthLabels: { label: string; col: number }[] } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Go back `daysAgo` days and align to previous Sunday
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - daysAgo);
  // Align to Sunday (day 0)
  const dayOfWeek = startDate.getDay();
  startDate.setDate(startDate.getDate() - dayOfWeek);

  const dates: Date[] = [];
  const current = new Date(startDate);

  while (current <= today) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  // Build month labels at first occurrence of each month
  const monthLabels: { label: string; col: number }[] = [];
  const seenMonths = new Set<string>();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let i = 0; i < dates.length; i++) {
    const d = dates[i];
    const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
    if (!seenMonths.has(monthKey) && d.getDay() === 0) {
      seenMonths.add(monthKey);
      const col = Math.floor(i / 7);
      monthLabels.push({ label: months[d.getMonth()], col });
    }
  }

  return { dates, monthLabels };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ReviewHeatmap({ deck, className }: ReviewHeatmapProps) {
  const { showBurmese } = useLanguage();

  const reviewCounts = useMemo(() => buildReviewCountMap(deck), [deck]);

  // Desktop: 60 days, Mobile: 30 days (handled via hidden classes)
  const desktopGrid = useMemo(() => generateDateGrid(60), []);
  const mobileGrid = useMemo(() => generateDateGrid(30), []);

  const dayLabels = showBurmese ? DAY_LABELS_MY : DAY_LABELS;

  return (
    <div className={clsx('space-y-1', className)}>
      {/* Desktop heatmap (60 days) */}
      <div className="hidden sm:block">
        <HeatmapGrid
          grid={desktopGrid}
          reviewCounts={reviewCounts}
          dayLabels={dayLabels}
        />
      </div>

      {/* Mobile heatmap (30 days) */}
      <div className="block sm:hidden">
        <HeatmapGrid
          grid={mobileGrid}
          reviewCounts={reviewCounts}
          dayLabels={dayLabels}
        />
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
        <span>{showBurmese ? '\u1014\u100A\u103A\u1038' : 'Less'}</span>
        <div className="h-2.5 w-2.5 rounded-sm bg-muted/40" />
        <div className="h-2.5 w-2.5 rounded-sm bg-primary-200" />
        <div className="h-2.5 w-2.5 rounded-sm bg-primary-400" />
        <div className="h-2.5 w-2.5 rounded-sm bg-primary-500" />
        <span>{showBurmese ? '\u1019\u103B\u102C\u1038' : 'More'}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inner grid component
// ---------------------------------------------------------------------------

function HeatmapGrid({
  grid,
  reviewCounts,
  dayLabels,
}: {
  grid: { dates: Date[]; monthLabels: { label: string; col: number }[] };
  reviewCounts: Map<string, number>;
  dayLabels: string[];
}) {
  const { dates, monthLabels } = grid;

  // Calculate number of weeks (columns)
  const numWeeks = Math.ceil(dates.length / 7);

  return (
    <div className="overflow-x-auto">
      {/* Month labels */}
      <div
        className="grid gap-px mb-0.5"
        style={{
          gridTemplateColumns: `1.5rem repeat(${numWeeks}, 1fr)`,
        }}
      >
        {/* Empty cell for day label column */}
        <div />
        {Array.from({ length: numWeeks }, (_, colIdx) => {
          const monthLabel = monthLabels.find((m) => m.col === colIdx);
          return (
            <div
              key={colIdx}
              className="text-xs text-muted-foreground truncate leading-none"
            >
              {monthLabel?.label ?? ''}
            </div>
          );
        })}
      </div>

      {/* Heatmap grid: 7 rows (days) x N columns (weeks) */}
      <div
        className="grid gap-px"
        style={{
          gridTemplateColumns: `1.5rem repeat(${numWeeks}, 1fr)`,
          gridTemplateRows: 'repeat(7, 1fr)',
        }}
      >
        {Array.from({ length: 7 }, (_, rowIdx) => {
          // Day label
          const cells = [
            <div
              key={`label-${rowIdx}`}
              className="text-xs text-muted-foreground flex items-center leading-none pr-1"
            >
              {dayLabels[rowIdx]}
            </div>,
          ];

          // Cells for each week column
          for (let col = 0; col < numWeeks; col++) {
            const dateIdx = col * 7 + rowIdx;
            const date = dates[dateIdx];

            if (!date) {
              cells.push(
                <div key={`empty-${col}-${rowIdx}`} className="aspect-square" />
              );
              continue;
            }

            const dateStr = date.toISOString().slice(0, 10);
            const count = reviewCounts.get(dateStr) ?? 0;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isFuture = date > today;

            cells.push(
              <div
                key={dateStr}
                className={clsx(
                  'aspect-square rounded-sm min-w-[10px]',
                  isFuture ? 'bg-transparent' : getCellColor(count)
                )}
                title={isFuture ? '' : `${dateStr}: ${count} review${count !== 1 ? 's' : ''}`}
              />
            );
          }

          return cells;
        })}
      </div>
    </div>
  );
}
