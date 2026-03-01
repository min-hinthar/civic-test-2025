'use client';

/**
 * StudyPlanCard
 *
 * "Today's Plan" card showing daily study targets with activity breakdown.
 * Each activity row is tappable, navigating to the appropriate route.
 * Shows "You're all caught up!" when all counts are zero.
 *
 * Activities:
 * - SRS reviews -> /study#deck
 * - New questions -> /practice
 * - Drill: {category} -> /drill
 * - Mock test -> /test
 */

import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  Target,
  BookOpen,
  Sparkles,
  Zap,
  ClipboardCheck,
  CheckCircle,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { SPRING_GENTLE } from '@/lib/motion-config';
import { USCIS_CATEGORY_NAMES } from '@/lib/mastery';
import type { USCISCategory } from '@/lib/mastery';
import type { DailyPlan } from '@/lib/studyPlan';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface StudyPlanCardProps {
  dailyPlan: DailyPlan;
  showBurmese: boolean;
}

// ---------------------------------------------------------------------------
// Activity row component
// ---------------------------------------------------------------------------

function ActivityRow({
  icon: Icon,
  labelEn,
  labelMy,
  showBurmese,
  onClick,
}: {
  icon: typeof BookOpen;
  labelEn: string;
  labelMy?: string;
  showBurmese: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 min-h-[48px] hover:bg-muted/40 transition-colors text-left"
    >
      <Icon className="h-4.5 w-4.5 text-primary shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{labelEn}</p>
        {showBurmese && labelMy && (
          <p className="font-myanmar text-sm text-muted-foreground">{labelMy}</p>
        )}
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StudyPlanCard({ dailyPlan, showBurmese }: StudyPlanCardProps) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const {
    srsReviewCount,
    newQuestionTarget,
    drillRecommendation,
    mockTestRecommended,
    estimatedMinutes,
  } = dailyPlan;

  const hasActivities =
    srsReviewCount > 0 ||
    newQuestionTarget > 0 ||
    drillRecommendation !== null ||
    mockTestRecommended;

  // Get bilingual category name for drill recommendation
  const drillCategoryName = drillRecommendation
    ? USCIS_CATEGORY_NAMES[drillRecommendation.category as USCISCategory]
    : null;

  const Wrapper = shouldReduceMotion ? 'div' : motion.div;
  const animProps = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: SPRING_GENTLE,
      };

  return (
    <Wrapper {...animProps}>
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-lg shadow-primary/5">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-subtle text-primary">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Today&apos;s Plan</h3>
              {showBurmese && (
                <p className="font-myanmar text-base text-muted-foreground">
                  {'\u101A\u1014\u1031\u1037\u1021\u1005\u102E\u1021\u1005\u1025\u103A'}
                </p>
              )}
            </div>
          </div>

          {/* Estimated time badge */}
          {hasActivities && (
            <div className="flex items-center gap-1 rounded-full bg-muted/50 px-2.5 py-1 text-xs font-semibold text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{estimatedMinutes} min</span>
            </div>
          )}
        </div>

        {/* Activity list or caught-up state */}
        {hasActivities ? (
          <div className="space-y-0.5">
            {srsReviewCount > 0 && (
              <ActivityRow
                icon={BookOpen}
                labelEn={`${srsReviewCount} SRS reviews`}
                labelMy={`SRS \u1015\u103C\u1014\u103A\u101C\u100A\u103A\u101B\u1014\u103A ${srsReviewCount} \u1001\u102F`}
                showBurmese={showBurmese}
                onClick={() => router.push('/study#deck')}
              />
            )}
            {newQuestionTarget > 0 && (
              <ActivityRow
                icon={Sparkles}
                labelEn={`${newQuestionTarget} new questions`}
                labelMy={`\u1019\u1031\u1038\u1001\u103D\u1014\u103A\u1038\u1021\u101E\u1005\u103A ${newQuestionTarget} \u1001\u102F`}
                showBurmese={showBurmese}
                onClick={() => router.push('/practice')}
              />
            )}
            {drillRecommendation && (
              <ActivityRow
                icon={Zap}
                labelEn={`Drill: ${drillCategoryName?.en ?? drillRecommendation.category} (${drillRecommendation.count} questions)`}
                labelMy={
                  drillCategoryName
                    ? `\u101C\u1031\u1037\u1000\u103B\u1004\u103A\u1037: ${drillCategoryName.my} (\u1019\u1031\u1038\u1001\u103D\u1014\u103A\u1038 ${drillRecommendation.count} \u1001\u102F)`
                    : undefined
                }
                showBurmese={showBurmese}
                onClick={() => router.push('/drill')}
              />
            )}
            {mockTestRecommended && (
              <ActivityRow
                icon={ClipboardCheck}
                labelEn="Take a mock test"
                labelMy={
                  '\u1005\u102C\u1019\u1031\u1038\u1015\u103D\u1032 \u1005\u1019\u103A\u1038\u101E\u1015\u103A\u1000\u103C\u100A\u103A\u1037\u1015\u102B'
                }
                showBurmese={showBurmese}
                onClick={() => router.push('/test')}
              />
            )}
          </div>
        ) : (
          /* All caught up state */
          <div className="flex flex-col items-center py-4">
            {shouldReduceMotion ? (
              <CheckCircle className="h-10 w-10 text-green-500 mb-2" />
            ) : (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={SPRING_GENTLE}
              >
                <CheckCircle className="h-10 w-10 text-green-500 mb-2" />
              </motion.div>
            )}
            <p className="text-sm font-semibold text-foreground">You&apos;re all caught up!</p>
            {showBurmese && (
              <p className="font-myanmar text-sm text-muted-foreground mt-0.5">
                {
                  '\u1021\u102C\u1038\u101C\u102F\u1036\u1038 \u1015\u103C\u102E\u1038\u1006\u102F\u1036\u1038\u1015\u103C\u102E\u104B'
                }
              </p>
            )}
          </div>
        )}
      </div>
    </Wrapper>
  );
}
