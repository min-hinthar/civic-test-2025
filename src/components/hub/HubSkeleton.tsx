'use client';

// ---------------------------------------------------------------------------
// PrismaticBar - Skeleton bar with prismatic shimmer
// ---------------------------------------------------------------------------

/**
 * Skeleton bar using prismatic shimmer (rainbow gradient matching glass border).
 * Falls back to solid muted color with prefers-reduced-motion.
 */
function PrismaticBar({
  width,
  height,
  circle,
  className,
}: {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`skeleton-prismatic ${circle ? 'rounded-full' : 'rounded-lg'} ${className ?? ''}`}
      style={{
        width: width ?? '100%',
        height: circle ? width : (height ?? '1rem'),
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// OverviewSkeleton
// ---------------------------------------------------------------------------

/**
 * Skeleton loader for the Overview tab matching widget shapes:
 * - Circle placeholder for readiness ring
 * - 4 stat card rectangles in 2x2 grid
 * - 3 category card placeholders with ring + bars
 *
 * Uses prismatic shimmer for rainbow loading effect.
 */
export function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      {/* Readiness ring placeholder */}
      <div className="flex justify-center py-4">
        <PrismaticBar circle width={180} height={180} />
      </div>

      {/* Stat cards grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="glass-light prismatic-border flex flex-col items-center gap-2 p-4"
          >
            <PrismaticBar circle width={20} height={20} />
            <PrismaticBar height="1.75rem" width="60%" />
            <PrismaticBar height="0.75rem" width="80%" />
          </div>
        ))}
      </div>

      {/* Category section header */}
      <PrismaticBar height="1.25rem" width="45%" className="mt-2" />

      {/* Category cards */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="glass-light prismatic-border p-5">
          <div className="flex items-center gap-4">
            <PrismaticBar circle width={80} height={80} />
            <div className="flex-1 space-y-2">
              <PrismaticBar height="1rem" width="70%" />
              <PrismaticBar height="0.75rem" width="50%" />
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {Array.from({ length: 2 }).map((_, j) => (
              <div key={j} className="space-y-1">
                <PrismaticBar height="0.75rem" width="60%" />
                <PrismaticBar height="0.5rem" width="100%" />
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
 * Uses prismatic shimmer for rainbow loading effect.
 */
export function HistorySkeleton() {
  return (
    <div className="space-y-3">
      {/* Section header */}
      <PrismaticBar height="1.25rem" width="40%" />

      {/* List items */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="glass-light prismatic-border p-4">
          <div className="flex items-center gap-3">
            <PrismaticBar circle width={40} height={40} />
            <div className="flex-1 space-y-1.5">
              <PrismaticBar height="1rem" width="60%" />
              <PrismaticBar height="0.75rem" width="40%" />
            </div>
            <PrismaticBar height="1.5rem" width="3rem" className="rounded-full" />
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
 * Uses prismatic shimmer for rainbow loading effect.
 */
export function AchievementsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Badge section header */}
      <PrismaticBar height="1.25rem" width="30%" />

      {/* Badge grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="glass-light prismatic-border flex flex-col items-center gap-2 p-4"
          >
            <PrismaticBar circle width={48} height={48} />
            <PrismaticBar height="0.75rem" width="70%" />
            <PrismaticBar height="0.5rem" width="90%" />
          </div>
        ))}
      </div>

      {/* Leaderboard section header */}
      <PrismaticBar height="1.25rem" width="35%" />

      {/* Leaderboard rows */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="glass-light prismatic-border flex items-center gap-3 p-3">
          <PrismaticBar height="1.5rem" width="1.5rem" className="rounded-md" />
          <PrismaticBar circle width={32} height={32} />
          <div className="flex-1">
            <PrismaticBar height="0.875rem" width="50%" />
          </div>
          <PrismaticBar height="1rem" width="3rem" />
        </div>
      ))}
    </div>
  );
}
