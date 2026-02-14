'use client';

/**
 * NBAHeroCard - Next Best Action hero card for the dashboard.
 *
 * Full-width glassmorphic card with contextual gradient overlay,
 * themed/pulsing icon, bilingual title + hint, primary CTA, and
 * secondary skip link. Uses AnimatePresence for crossfade
 * transitions when the recommendation changes.
 *
 * NBAHeroSkeleton is exported as a loading placeholder.
 */

import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import clsx from 'clsx';
import {
  Sparkles,
  Heart,
  Flame,
  Brain,
  BookOpen,
  Target,
  Trophy,
  type LucideIcon,
} from 'lucide-react';

import { GlassCard } from '@/components/ui/GlassCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { SPRING_GENTLE } from '@/lib/motion-config';
import type { NBAState, NBAStateType } from '@/lib/nba';

// ---------------------------------------------------------------------------
// Icon mapping
// ---------------------------------------------------------------------------

const ICON_MAP: Record<NBAStateType, LucideIcon> = {
  'new-user': Sparkles,
  'returning-user': Heart,
  'streak-at-risk': Flame,
  'srs-due': Brain,
  'weak-category': BookOpen,
  'no-recent-test': Target,
  'test-ready': Target,
  celebration: Trophy,
};

const ICON_BG_MAP: Record<NBAStateType, string> = {
  'new-user': 'bg-primary/15',
  'returning-user': 'bg-amber-500/15',
  'streak-at-risk': 'bg-orange-500/20',
  'srs-due': 'bg-blue-500/15',
  'weak-category': 'bg-amber-400/15',
  'no-recent-test': 'bg-emerald-500/15',
  'test-ready': 'bg-emerald-600/15',
  celebration: 'bg-amber-400/15',
};

const ICON_COLOR_MAP: Record<NBAStateType, string> = {
  'new-user': 'text-primary',
  'returning-user': 'text-amber-500',
  'streak-at-risk': 'text-orange-500',
  'srs-due': 'text-blue-500',
  'weak-category': 'text-amber-500',
  'no-recent-test': 'text-emerald-500',
  'test-ready': 'text-emerald-600',
  celebration: 'text-amber-500',
};

// ---------------------------------------------------------------------------
// NBAIcon sub-component
// ---------------------------------------------------------------------------

function NBAIconBadge({
  type,
  urgent,
  shouldReduceMotion,
}: {
  type: NBAStateType;
  urgent: boolean;
  shouldReduceMotion: boolean;
}) {
  const Icon = ICON_MAP[type];

  return (
    <motion.div
      className={clsx(
        'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl',
        ICON_BG_MAP[type]
      )}
      animate={!shouldReduceMotion && urgent ? { scale: 1.05, opacity: 0.85 } : {}}
      transition={
        urgent
          ? { duration: 1, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }
          : undefined
      }
    >
      <Icon className={clsx('h-6 w-6', ICON_COLOR_MAP[type])} />
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// NBAHeroCard
// ---------------------------------------------------------------------------

interface NBAHeroCardProps {
  nbaState: NBAState;
}

export function NBAHeroCard({ nbaState }: NBAHeroCardProps) {
  const { showBurmese } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={nbaState.type}
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
        transition={SPRING_GENTLE}
      >
        <GlassCard tier="medium" className="relative overflow-hidden rounded-2xl p-6">
          {/* Gradient overlay -- deeper/more saturated in dark mode */}
          <div
            className={clsx(
              'pointer-events-none absolute inset-0 bg-gradient-to-br opacity-15 dark:opacity-25',
              nbaState.gradient
            )}
          />

          {/* Content */}
          <div className="relative z-10">
            {/* Recommended for you label */}
            <div className="mb-3 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Recommended for you
              </span>
              {showBurmese && (
                <span className="ml-1 font-myanmar text-[10px] text-primary/70">
                  သင့်အတွက် အကြံပြုချက်
                </span>
              )}
            </div>

            {/* Icon + Title block */}
            <div className="mb-4 flex items-start gap-4">
              <NBAIconBadge
                type={nbaState.type}
                urgent={nbaState.urgent}
                shouldReduceMotion={shouldReduceMotion}
              />

              <div className="min-w-0 flex-1">
                {/* Title */}
                <h2 className="text-lg font-bold leading-tight text-foreground">
                  {nbaState.title.en}
                </h2>
                {showBurmese && (
                  <p className="mt-0.5 font-myanmar text-sm leading-tight text-foreground/70">
                    {nbaState.title.my}
                  </p>
                )}

                {/* Hint */}
                <p className="mt-1.5 text-sm text-muted-foreground">{nbaState.hint.en}</p>
                {showBurmese && (
                  <p className="mt-0.5 font-myanmar text-xs text-muted-foreground/80">
                    {nbaState.hint.my}
                  </p>
                )}

                {/* Time estimate */}
                {nbaState.estimatedMinutes && (
                  <span className="mt-1 inline-block text-xs text-muted-foreground">
                    ~{nbaState.estimatedMinutes} min
                  </span>
                )}
              </div>
            </div>

            {/* CTA + Skip row */}
            <div className="flex items-center gap-3">
              <Link
                to={nbaState.cta.to}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-bold text-white transition-colors hover:bg-primary/90"
              >
                <span>{nbaState.cta.label.en}</span>
                {showBurmese && (
                  <span className="font-myanmar text-xs text-white/80">
                    {nbaState.cta.label.my}
                  </span>
                )}
              </Link>

              <Link
                to={nbaState.skip.to}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {nbaState.skip.label.en}
              </Link>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

/**
 * Pulsing skeleton matching the NBAHeroCard layout.
 * Shown by Dashboard when nbaState is null (still loading).
 */
export function NBAHeroSkeleton() {
  return (
    <GlassCard tier="medium" className="relative overflow-hidden rounded-2xl p-6">
      <div className="animate-pulse">
        {/* Recommended label skeleton */}
        <div className="mb-3 flex items-center gap-1.5">
          <div className="h-3.5 w-3.5 rounded bg-muted" />
          <div className="h-3 w-32 rounded bg-muted" />
        </div>

        {/* Icon + content block */}
        <div className="mb-4 flex items-start gap-4">
          {/* Icon placeholder */}
          <div className="h-12 w-12 shrink-0 rounded-2xl bg-muted" />

          <div className="min-w-0 flex-1 space-y-2">
            {/* Title skeleton */}
            <div className="h-5 w-3/4 rounded bg-muted" />
            {/* Hint skeleton */}
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-2/3 rounded bg-muted" />
          </div>
        </div>

        {/* CTA skeleton */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-36 rounded-xl bg-muted" />
          <div className="h-4 w-20 rounded bg-muted" />
        </div>
      </div>
    </GlassCard>
  );
}
