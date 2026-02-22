'use client';

import { useMemo } from 'react';
import CountUp from 'react-countup';
import { motion } from 'motion/react';
import { Flame, TrendingUp, BookOpen, CheckCircle, type LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { GlassCard } from '@/components/ui/GlassCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CompactStatRowProps {
  streak: number;
  mastery: number; // 0-100
  srsDue: number;
  practiced: number;
  totalQuestions: number;
  isLoading: boolean;
}

interface StatDef {
  id: string;
  icon: LucideIcon;
  label: { en: string; my: string };
  route: string;
  getValue: (props: CompactStatRowProps) => number;
  /** Suffix shown after the count-up number */
  suffix?: string;
  /** Render override for complex display (e.g. "practiced/total") */
  renderValue?: (props: CompactStatRowProps, shouldReduceMotion: boolean) => React.ReactNode;
  /** Dynamic text color class based on value */
  getColorClass?: (value: number) => string;
}

// ---------------------------------------------------------------------------
// Urgency color helper
// ---------------------------------------------------------------------------

function getSrsDueColorClass(count: number): string {
  if (count <= 2) return 'text-emerald-600 dark:text-emerald-400';
  if (count <= 5) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

// ---------------------------------------------------------------------------
// Stat definitions
// ---------------------------------------------------------------------------

const STAT_DEFS: StatDef[] = [
  {
    id: 'streak',
    icon: Flame,
    label: {
      en: 'Streak',
      my: '\u1006\u1000\u103A\u1010\u102D\u102F\u1000\u103A\u101B\u1000\u103A',
    },
    route: '/hub/achievements',
    getValue: p => p.streak,
  },
  {
    id: 'mastery',
    icon: TrendingUp,
    label: {
      en: 'Mastery',
      my: '\u1000\u103B\u103D\u1019\u103A\u1038\u1000\u103B\u1004\u103A\u1019\u103E\u102F',
    },
    route: '/hub/overview',
    getValue: p => p.mastery,
    suffix: '%',
  },
  {
    id: 'srs-due',
    icon: BookOpen,
    label: {
      en: 'SRS Due',
      my: 'SRS \u1015\u103C\u1014\u103A\u101C\u100A\u103A\u101B\u1014\u103A',
    },
    route: '/study#review',
    getValue: p => p.srsDue,
    getColorClass: getSrsDueColorClass,
  },
  {
    id: 'practiced',
    icon: CheckCircle,
    label: {
      en: 'Practiced',
      my: '\u101C\u1031\u1037\u1000\u103B\u1004\u103A\u1037\u1015\u103C\u102E\u1038',
    },
    route: '/study',
    getValue: p => p.practiced,
    renderValue: (props, shouldReduceMotion) => {
      const { practiced, totalQuestions } = props;
      if (practiced === 0) {
        return (
          <span>
            0<span className="text-sm font-semibold text-text-secondary">/{totalQuestions}</span>
          </span>
        );
      }
      if (shouldReduceMotion) {
        return (
          <span>
            {practiced}
            <span className="text-sm font-semibold text-text-secondary">/{totalQuestions}</span>
          </span>
        );
      }
      return (
        <span>
          <CountUp end={practiced} duration={1.5} useEasing preserveValue />
          <span className="text-sm font-semibold text-text-secondary">/{totalQuestions}</span>
        </span>
      );
    },
  },
];

// ---------------------------------------------------------------------------
// Skeleton card (loading state)
// ---------------------------------------------------------------------------

function StatSkeleton() {
  return (
    <GlassCard className="min-w-0 flex-1 rounded-2xl p-0">
      <div className="flex min-w-0 flex-col items-center gap-2 px-2 py-4">
        <div className="h-5 w-5 animate-pulse rounded-full bg-text-secondary/20" />
        <div className="h-7 w-12 animate-pulse rounded bg-text-secondary/20" />
        <div className="h-3 w-14 animate-pulse rounded bg-text-secondary/10" />
      </div>
    </GlassCard>
  );
}

// ---------------------------------------------------------------------------
// Individual stat card
// ---------------------------------------------------------------------------

interface StatItemProps {
  def: StatDef;
  props: CompactStatRowProps;
  shouldReduceMotion: boolean;
  showBurmese: boolean;
}

function StatItem({ def, props, shouldReduceMotion, showBurmese }: StatItemProps) {
  const navigate = useNavigate();
  const Icon = def.icon;
  const value = def.getValue(props);
  const colorClass = def.getColorClass ? def.getColorClass(value) : 'text-text-primary';

  const handleClick = () => {
    navigate(def.route);
  };

  // Determine what to render for the number
  let numberContent: React.ReactNode;
  if (def.renderValue) {
    numberContent = def.renderValue(props, shouldReduceMotion);
  } else if (value === 0) {
    // No animation from 0 to 0
    numberContent = `0${def.suffix ?? ''}`;
  } else if (shouldReduceMotion) {
    numberContent = `${value}${def.suffix ?? ''}`;
  } else {
    numberContent = (
      <CountUp end={value} duration={1.5} useEasing preserveValue suffix={def.suffix} />
    );
  }

  // Streak pulse when alive, SRS badge pulse when due > 0
  const shouldPulseIcon =
    !shouldReduceMotion &&
    ((def.id === 'streak' && value > 0) || (def.id === 'srs-due' && value > 0));

  const iconElement = shouldPulseIcon ? (
    <motion.div
      animate={{ scale: 1.15, opacity: 0.8 }}
      transition={{ duration: 1, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
    >
      <Icon
        className={clsx(
          'h-5 w-5',
          def.id === 'streak' && value > 0 ? 'text-orange-500 dark:text-orange-400' : 'text-primary'
        )}
      />
    </motion.div>
  ) : (
    <Icon
      className={clsx(
        'h-5 w-5',
        def.id === 'streak' && value > 0 ? 'text-orange-500 dark:text-orange-400' : 'text-primary'
      )}
    />
  );

  return (
    <GlassCard interactive className="min-w-0 flex-1 rounded-2xl p-0">
      <button
        type="button"
        className="flex w-full min-h-[44px] flex-col items-center gap-1.5 px-2 py-4"
        onClick={handleClick}
      >
        {iconElement}
        <span className={clsx('text-2xl font-extrabold tabular-nums', colorClass)}>
          {numberContent}
        </span>
        <span className="text-xs font-medium text-text-secondary">{def.label.en}</span>
        {showBurmese && (
          <span className="font-myanmar text-xs leading-tight text-muted-foreground">
            {def.label.my}
          </span>
        )}
      </button>
    </GlassCard>
  );
}

// ---------------------------------------------------------------------------
// CompactStatRow component
// ---------------------------------------------------------------------------

/**
 * 4-stat compact glass card grid with count-up animations.
 *
 * Features:
 * - Streak, Mastery %, SRS Due, and Practiced stats
 * - Count-up number animation using react-countup (respects reduced motion)
 * - SRS Due urgency coloring (green/amber/red)
 * - Bilingual labels (English + Burmese)
 * - Each card taps to navigate to the relevant page
 * - Loading skeleton state
 */
export function CompactStatRow(props: CompactStatRowProps) {
  const { showBurmese } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  // Memoize stat defs (static, but keeps the pattern consistent)
  const statDefs = useMemo(() => STAT_DEFS, []);

  if (props.isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statDefs.map(def => (
          <StatSkeleton key={def.id} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {statDefs.map(def => (
        <StatItem
          key={def.id}
          def={def}
          props={props}
          shouldReduceMotion={shouldReduceMotion}
          showBurmese={showBurmese}
        />
      ))}
    </div>
  );
}
