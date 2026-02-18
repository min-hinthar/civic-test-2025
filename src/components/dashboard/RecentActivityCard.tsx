'use client';

import { motion } from 'motion/react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '@/components/ui/GlassCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { formatRelativeDate } from '@/lib/formatRelativeDate';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TestSession {
  date: string;
  score: number;
  totalQuestions: number;
}

interface RecentActivityCardProps {
  testHistory: TestSession[];
  isLoading: boolean;
}

// ---------------------------------------------------------------------------
// Skeleton (loading state)
// ---------------------------------------------------------------------------

function ActivitySkeleton() {
  return (
    <GlassCard className="rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-5 w-5 animate-pulse rounded bg-text-secondary/20" />
        <div className="h-4 w-28 animate-pulse rounded bg-text-secondary/20" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center justify-between">
            <div className="h-3 w-20 animate-pulse rounded bg-text-secondary/10" />
            <div className="h-3 w-12 animate-pulse rounded bg-text-secondary/10" />
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ---------------------------------------------------------------------------
// RecentActivityCard component
// ---------------------------------------------------------------------------

/**
 * Compact preview card showing the last 2-3 mock test sessions.
 *
 * Features:
 * - Relative date formatting (Today, Yesterday, X days ago, MMM D)
 * - Pass/fail indicator based on 60% threshold
 * - Score display as X/Y
 * - Tappable to navigate to Hub History tab
 * - Loading/empty states handled
 * - Bilingual heading via useLanguage
 */
export function RecentActivityCard({ testHistory, isLoading }: RecentActivityCardProps) {
  const { showBurmese } = useLanguage();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  // Show last 3 sessions (already sorted newest first)
  const recentSessions = testHistory.slice(0, 3);

  if (isLoading) {
    return <ActivitySkeleton />;
  }

  const handleClick = () => {
    navigate('/hub/history');
  };

  return (
    <GlassCard interactive className="cursor-pointer rounded-2xl p-0" onClick={handleClick}>
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Recent Activity</h3>
            {showBurmese && (
              <span className="font-myanmar text-sm leading-tight text-muted-foreground">
                {
                  '\u1019\u1000\u103C\u102C\u101E\u1031\u1038\u1019\u102E\u1000 \u101C\u103E\u102F\u1015\u103A\u101B\u103E\u102C\u1038\u1019\u103E\u102F'
                }
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        {recentSessions.length === 0 ? (
          <p className="text-sm text-text-secondary">
            Take a mock test to see your history
            {showBurmese && (
              <span className="block font-myanmar text-sm mt-0.5">
                {
                  '\u101E\u1019\u102D\u102F\u1004\u103A\u1038\u1000\u102D\u102F \u1000\u103C\u100A\u103A\u1037\u101B\u1014\u103A \u1005\u102C\u1019\u1031\u1038\u1015\u103C\u1031\u101C\u1031\u1037\u1000\u103B\u1004\u103A\u1037\u1015\u102B'
                }
              </span>
            )}
          </p>
        ) : (
          <div className="space-y-3">
            {recentSessions.map((session, index) => {
              const passed =
                session.totalQuestions > 0 ? session.score / session.totalQuestions >= 0.6 : false;
              const itemProps = shouldReduceMotion
                ? {}
                : {
                    initial: { opacity: 0, x: -8 } as const,
                    animate: { opacity: 1, x: 0 } as const,
                    transition: { delay: index * 0.08, duration: 0.3 },
                  };
              return (
                <motion.div
                  key={`${session.date}-${index}`}
                  className="flex items-center justify-between"
                  {...itemProps}
                >
                  <div className="flex items-center gap-2">
                    {passed ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <XCircle className="h-4 w-4 text-warning" />
                    )}
                    <span className="text-xs text-text-secondary">
                      {formatRelativeDate(session.date)}
                    </span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-text-primary">
                    {session.score}/{session.totalQuestions}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        {recentSessions.length > 0 && (
          <p className="mt-4 text-xs font-medium text-primary">View full history &rarr;</p>
        )}
      </div>
    </GlassCard>
  );
}
