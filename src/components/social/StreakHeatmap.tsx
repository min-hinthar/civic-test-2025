'use client';

/**
 * StreakHeatmap - Activity calendar with warm orange gradient and freeze day markers.
 *
 * Follows ReviewHeatmap's CSS Grid + Tailwind pattern exactly (no external library).
 * Displays 60 days on desktop, 30 days on mobile via responsive hidden/block classes.
 *
 * Color scheme (data-visualization, kept as palette classes per plan):
 * - No activity: gray (bg-muted/40)
 * - 1 activity: light orange (bg-orange-200)
 * - 2-3 activities: medium orange (bg-orange-400)
 * - 4+ activities: strong orange (bg-orange-500)
 * - Freeze days: blue with border for visual distinction
 * - Today: highlighted with ring border
 *
 * Note: Heatmap cell colors are data-visualization intensity levels,
 * not theme colors. They use palette classes as computed values per plan.
 */

import { useMemo } from 'react';
import clsx from 'clsx';
import { useLanguage } from '@/contexts/LanguageContext';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface StreakHeatmapProps {
  /** Array of activity date strings ('YYYY-MM-DD') */
  activityDates: string[];
  /** Array of freeze date strings ('YYYY-MM-DD') */
  freezesUsed: string[];
  /** Optional CSS class */
  className?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
const DAY_LABELS_MY = ['', 'တန္လာ', '', 'ဗုဒ္ဓ', '', 'သော', ''];

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const MONTH_LABELS_MY = [
  'ဇန်',
  'ဖေ',
  'မတ်',
  'ဧ',
  'မေ',
  'ဇွန်',
  'ဇူ',
  'ဩ',
  'စက်',
  'အောက်',
  'နို',
  'ဒီ',
];

// ---------------------------------------------------------------------------
// Color helpers
// ---------------------------------------------------------------------------

/**
 * Pure function: determine cell color based on activity count and freeze status.
 * These are data-visualization intensity colors, not theme semantic colors.
 */
function getCellColor(count: number, isFreezeDay: boolean): string {
  if (isFreezeDay) {
    return 'bg-blue-200 border border-blue-400';
  }

  if (count === 0) return 'bg-muted/40';
  if (count === 1) return 'bg-orange-200';
  if (count <= 3) return 'bg-orange-400';
  return 'bg-orange-500';
}

// ---------------------------------------------------------------------------
// Date grid helpers (mirroring ReviewHeatmap)
// ---------------------------------------------------------------------------

interface DateGrid {
  dates: Date[];
  monthLabels: { label: string; labelMy: string; col: number }[];
}

/**
 * Generate an array of dates from `daysAgo` days ago to today,
 * aligned to start on a Sunday (for week columns).
 */
function generateDateGrid(daysAgo: number): DateGrid {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Go back `daysAgo` days and align to previous Sunday
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - daysAgo);
  const dayOfWeek = startDate.getDay();
  startDate.setDate(startDate.getDate() - dayOfWeek);

  const dates: Date[] = [];
  const current = new Date(startDate);

  while (current <= today) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  // Build month labels at first occurrence of each month
  const monthLabels: DateGrid['monthLabels'] = [];
  const seenMonths = new Set<string>();

  for (let i = 0; i < dates.length; i++) {
    const d = dates[i];
    const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
    if (!seenMonths.has(monthKey) && d.getDay() === 0) {
      seenMonths.add(monthKey);
      const col = Math.floor(i / 7);
      monthLabels.push({
        label: MONTH_LABELS[d.getMonth()],
        labelMy: MONTH_LABELS_MY[d.getMonth()],
        col,
      });
    }
  }

  return { dates, monthLabels };
}

/**
 * Build a map of date string -> activity count from an array of date strings.
 * Counts duplicate dates as multiple activities on the same day.
 */
function buildActivityCountMap(activityDates: string[]): Map<string, number> {
  const counts = new Map<string, number>();

  for (const dateStr of activityDates) {
    counts.set(dateStr, (counts.get(dateStr) ?? 0) + 1);
  }

  return counts;
}

/**
 * Format a Date object as 'YYYY-MM-DD' using local date.
 */
function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StreakHeatmap({ activityDates, freezesUsed, className }: StreakHeatmapProps) {
  const { showBurmese } = useLanguage();

  const activityCounts = useMemo(() => buildActivityCountMap(activityDates), [activityDates]);
  const freezeSet = useMemo(() => new Set(freezesUsed), [freezesUsed]);

  // Desktop: 60 days, Mobile: 30 days
  const desktopGrid = useMemo(() => generateDateGrid(60), []);
  const mobileGrid = useMemo(() => generateDateGrid(30), []);

  const dayLabels = showBurmese ? DAY_LABELS_MY : DAY_LABELS;

  return (
    <div className={clsx('space-y-1', className)}>
      {/* Desktop heatmap (60 days) */}
      <div className="hidden sm:block">
        <HeatmapGrid
          grid={desktopGrid}
          activityCounts={activityCounts}
          freezeSet={freezeSet}
          dayLabels={dayLabels}
          showBurmese={showBurmese}
        />
      </div>

      {/* Mobile heatmap (30 days) */}
      <div className="block sm:hidden">
        <HeatmapGrid
          grid={mobileGrid}
          activityCounts={activityCounts}
          freezeSet={freezeSet}
          dayLabels={dayLabels}
          showBurmese={showBurmese}
        />
      </div>

      {/* Legend - data-visualization colors kept as palette classes */}
      <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground pt-1">
        <span className={showBurmese ? 'font-myanmar' : ''}>{showBurmese ? 'နည်း' : 'Less'}</span>
        <div className="h-2.5 w-2.5 rounded-sm bg-muted/40" />
        <div className="h-2.5 w-2.5 rounded-sm bg-orange-200" />
        <div className="h-2.5 w-2.5 rounded-sm bg-orange-400" />
        <div className="h-2.5 w-2.5 rounded-sm bg-orange-500" />
        <span className={showBurmese ? 'font-myanmar' : ''}>{showBurmese ? 'များ' : 'More'}</span>
        <span className="ml-2">|</span>
        <div className="h-2.5 w-2.5 rounded-sm bg-blue-200 border border-blue-400" />
        <span>{showBurmese ? 'Freeze' : 'Freeze'}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inner grid component
// ---------------------------------------------------------------------------

function HeatmapGrid({
  grid,
  activityCounts,
  freezeSet,
  dayLabels,
  showBurmese,
}: {
  grid: DateGrid;
  activityCounts: Map<string, number>;
  freezeSet: Set<string>;
  dayLabels: string[];
  showBurmese: boolean;
}) {
  const { dates, monthLabels } = grid;
  const numWeeks = Math.ceil(dates.length / 7);
  const todayStr = formatDateLocal(new Date());

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
          const monthLabel = monthLabels.find(m => m.col === colIdx);
          return (
            <div key={colIdx} className="text-xs text-muted-foreground truncate leading-none">
              {monthLabel ? (showBurmese ? monthLabel.labelMy : monthLabel.label) : ''}
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
              cells.push(<div key={`empty-${col}-${rowIdx}`} className="aspect-square" />);
              continue;
            }

            const dateStr = formatDateLocal(date);
            const count = activityCounts.get(dateStr) ?? 0;
            const isFreezeDay = freezeSet.has(dateStr);
            const isToday = dateStr === todayStr;

            // Future dates
            const todayDate = new Date();
            todayDate.setHours(0, 0, 0, 0);
            const isFuture = date > todayDate;

            // Build tooltip text
            const tooltipText = isFuture
              ? ''
              : isFreezeDay
                ? showBurmese
                  ? `${dateStr}: Streak Freeze အသုံးပြု`
                  : `${dateStr}: Streak Freeze`
                : `${dateStr}: ${count} activit${count !== 1 ? 'ies' : 'y'}`;

            cells.push(
              <div
                key={dateStr}
                className={clsx(
                  'aspect-square rounded-sm min-w-[10px]',
                  isFuture ? 'bg-transparent' : getCellColor(count, isFreezeDay),
                  isToday && !isFuture && 'ring-2 ring-foreground/30'
                )}
                title={tooltipText}
              />
            );
          }

          return cells;
        })}
      </div>
    </div>
  );
}
