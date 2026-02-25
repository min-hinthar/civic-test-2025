'use client';

import { Target } from 'lucide-react';

interface DrillBadgeProps {
  /** Show Burmese translation alongside English */
  showBurmese?: boolean;
}

/**
 * Visual badge indicating drill mode.
 *
 * Orange pill with Target icon and "Drill Mode" text.
 * Used in DrillConfig header, DrillPage session view, and DrillResults.
 */
export function DrillBadge({ showBurmese = false }: DrillBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/15 px-3 py-1 text-xs font-semibold text-orange-600 dark:text-orange-400">
      <Target className="h-3.5 w-3.5" />
      Drill Mode
      {showBurmese && (
        <span className="font-myanmar">
          {'\u101C\u1031\u1037\u1000\u103B\u1004\u103A\u1037\u1019\u102F\u1012\u103A'}
        </span>
      )}
    </span>
  );
}
