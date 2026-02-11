'use client';

import { Skeleton } from '@/components/ui/Skeleton';

// ---------------------------------------------------------------------------
// OverviewSkeleton
// ---------------------------------------------------------------------------

/**
 * Skeleton loader for the Overview tab matching widget shapes:
 * - Circle placeholder for readiness ring
 * - 4 stat card rectangles in 2x2 grid
 * - 3 category card placeholders with ring + bars
 */
export function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      {/* Readiness ring placeholder */}
      <div className="flex justify-center py-4">
        <Skeleton circle width={180} height={180} />
      </div>

      {/* Stat cards grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card flex flex-col items-center gap-2 rounded-2xl p-4">
            <Skeleton circle width={20} height={20} />
            <Skeleton height="1.75rem" width="60%" />
            <Skeleton height="0.75rem" width="80%" />
          </div>
        ))}
      </div>

      {/* Category section header */}
      <Skeleton height="1.25rem" width="45%" className="mt-2" />

      {/* Category cards */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-4">
            <Skeleton circle width={80} height={80} />
            <div className="flex-1 space-y-2">
              <Skeleton height="1rem" width="70%" />
              <Skeleton height="0.75rem" width="50%" />
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {Array.from({ length: 2 }).map((_, j) => (
              <div key={j} className="space-y-1">
                <Skeleton height="0.75rem" width="60%" />
                <Skeleton height="0.5rem" width="100%" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// HistorySkeleton
// ---------------------------------------------------------------------------

/**
 * Skeleton loader for the History tab matching list item shapes.
 */
export function HistorySkeleton() {
  return (
    <div className="space-y-3">
      {/* Section header */}
      <Skeleton height="1.25rem" width="40%" />

      {/* List items */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <Skeleton circle width={40} height={40} />
            <div className="flex-1 space-y-1.5">
              <Skeleton height="1rem" width="60%" />
              <Skeleton height="0.75rem" width="40%" />
            </div>
            <Skeleton height="1.5rem" width="3rem" className="rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// AchievementsSkeleton
// ---------------------------------------------------------------------------

/**
 * Skeleton loader for the Achievements tab matching badge grid + leaderboard.
 */
export function AchievementsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Badge section header */}
      <Skeleton height="1.25rem" width="30%" />

      {/* Badge grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="glass-card flex flex-col items-center gap-2 rounded-2xl p-4">
            <Skeleton circle width={48} height={48} />
            <Skeleton height="0.75rem" width="70%" />
            <Skeleton height="0.5rem" width="90%" />
          </div>
        ))}
      </div>

      {/* Leaderboard section header */}
      <Skeleton height="1.25rem" width="35%" />

      {/* Leaderboard rows */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="glass-card flex items-center gap-3 rounded-2xl p-3">
          <Skeleton height="1.5rem" width="1.5rem" className="rounded-md" />
          <Skeleton circle width={32} height={32} />
          <div className="flex-1">
            <Skeleton height="0.875rem" width="50%" />
          </div>
          <Skeleton height="1rem" width="3rem" />
        </div>
      ))}
    </div>
  );
}
