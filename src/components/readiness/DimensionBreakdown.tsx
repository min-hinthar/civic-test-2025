'use client';

import { useState, useCallback } from 'react';
import { CategoryRing } from '@/components/progress/CategoryRing';
import type { DimensionScore } from '@/lib/readiness';

// ---------------------------------------------------------------------------
// Dimension config
// ---------------------------------------------------------------------------

interface DimensionConfig {
  key: 'accuracy' | 'coverage' | 'consistency';
  color: string;
  labelEn: string;
  labelMy: string;
  tooltipEn: string;
  tooltipMy: string;
}

const DIMENSIONS: DimensionConfig[] = [
  {
    key: 'accuracy',
    color: 'text-blue-500',
    labelEn: 'Accuracy',
    labelMy: '\u1010\u102D\u1000\u103B\u1019\u103E\u102F',
    tooltipEn: 'Average mastery across all categories',
    tooltipMy:
      '\u1021\u1019\u103B\u102D\u102F\u1038\u1021\u1005\u102C\u1038\u1021\u102C\u1038\u101C\u102F\u1036\u1038\u1010\u103D\u1004\u103A \u1015\u103B\u1019\u103A\u1038\u1019\u103B\u103E \u1000\u103B\u103D\u1019\u103A\u1038\u1000\u103B\u1004\u103A\u1019\u103E\u102F',
  },
  {
    key: 'coverage',
    color: 'text-purple-500',
    labelEn: 'Coverage',
    labelMy: '\u1001\u103C\u102F\u1036\u1004\u102F\u1036\u1019\u103E\u102F',
    tooltipEn: "% of all 128 questions you've attempted",
    tooltipMy:
      '\u1019\u1031\u1038\u1001\u103D\u1014\u103A\u1038 \u1041\u1042\u1048 \u1001\u102F\u1019\u103E \u101E\u1004\u103A\u1005\u1019\u103A\u1038\u101E\u1015\u103A\u1001\u1032\u1037\u101E\u100A\u103A\u1037 \u101B\u102C\u1001\u102D\u102F\u1004\u103A\u1014\u103E\u102F\u1014\u103A\u1038',
  },
  {
    key: 'consistency',
    color: 'text-teal-500',
    labelEn: 'Consistency',
    labelMy: '\u1010\u101E\u1019\u1010\u103A\u1010\u100A\u103A\u1038\u1019\u103E\u102F',
    tooltipEn: "How well you retain what you've learned (FSRS)",
    tooltipMy:
      '\u101E\u1004\u103A\u101E\u1004\u103A\u101A\u102C\u1001\u1032\u1037\u101E\u100A\u103A\u1037\u1021\u101B\u102C\u1019\u103B\u102C\u1038\u1000\u102D\u102F \u1019\u100A\u103A\u1019\u103B\u103E \u1019\u103E\u1010\u103A\u1019\u102D\u1014\u102D\u102F\u1004\u103A\u1019\u103E\u102F',
  },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface DimensionBreakdownProps {
  dimensions: {
    accuracy: DimensionScore;
    coverage: DimensionScore;
    consistency: DimensionScore;
  };
  showBurmese: boolean;
}

// ---------------------------------------------------------------------------
// DimensionBreakdown
// ---------------------------------------------------------------------------

/**
 * Three mini CategoryRing components showing accuracy, coverage, and consistency
 * dimensions side-by-side with tap-to-toggle tooltips.
 */
export function DimensionBreakdown({ dimensions, showBurmese }: DimensionBreakdownProps) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const handleToggle = useCallback((key: string) => {
    setActiveTooltip(prev => (prev === key ? null : key));
  }, []);

  return (
    <div className="flex items-start justify-around gap-2 py-3">
      {DIMENSIONS.map(dim => {
        const score = dimensions[dim.key];
        const isTooltipActive = activeTooltip === dim.key;

        return (
          <button
            key={dim.key}
            type="button"
            onClick={() => handleToggle(dim.key)}
            className="flex flex-col items-center gap-1.5 min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-lg p-1"
          >
            <CategoryRing percentage={score.value} color={dim.color} size={64} strokeWidth={6}>
              <span className="text-xs font-bold tabular-nums">{score.value}%</span>
            </CategoryRing>

            <span className="text-xs font-medium text-foreground">{dim.labelEn}</span>
            {showBurmese && (
              <span className="text-[10px] font-myanmar text-muted-foreground leading-tight">
                {dim.labelMy}
              </span>
            )}

            {/* Tooltip */}
            {isTooltipActive && (
              <span className="text-[10px] text-muted-foreground text-center max-w-[100px] leading-tight mt-0.5">
                {dim.tooltipEn}
                {showBurmese && (
                  <>
                    <br />
                    <span className="font-myanmar">{dim.tooltipMy}</span>
                  </>
                )}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
