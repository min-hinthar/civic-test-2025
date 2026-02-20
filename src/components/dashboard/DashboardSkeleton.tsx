'use client';

import { Skeleton } from '@/components/ui/Skeleton';

/**
 * Dashboard loading skeleton matching the approximate Dashboard layout.
 *
 * Sections:
 * - Top: 4 stat card skeletons in a grid (~h-24 each)
 * - Middle: NBA Hero section skeleton (~h-40)
 * - Bottom: Recent activity rows (4 rows, ~h-16 each)
 *
 * Uses accent-tinted shimmer variant with staggered entrance animation.
 * Accessible via aria-label + role="status".
 */
export function DashboardSkeleton() {
  return (
    <div
      className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-10 space-y-6"
      aria-label="Loading Dashboard..."
      role="status"
    >
      {/* NBA Hero placeholder */}
      <Skeleton variant="accent" height="10rem" className="rounded-2xl" stagger index={0} />

      {/* Badge highlights placeholder */}
      <Skeleton variant="accent" height="4rem" className="rounded-2xl" stagger index={1} />

      {/* Stat cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton
            key={i}
            variant="accent"
            height="6rem"
            className="rounded-2xl"
            stagger
            index={i + 2}
          />
        ))}
      </div>

      {/* Preview cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton variant="accent" height="12rem" className="rounded-2xl" stagger index={6} />
        <Skeleton variant="accent" height="12rem" className="rounded-2xl" stagger index={7} />
      </div>
    </div>
  );
}
