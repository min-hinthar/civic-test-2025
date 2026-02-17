'use client';

/**
 * RoundSummary - End-of-round stats screen for flashcard sort mode.
 *
 * Displays comprehensive results: Know %, stats grid (know/don't know/time/round),
 * improvement delta for round 2+, personal best tracking, per-category breakdown
 * sorted weakest-first, and action buttons for next round or finish.
 *
 * Renders MissedCardsList and accepts children slot for SortCountdown / SRSBatchAdd.
 */

import { useMemo } from 'react';
import { motion } from 'motion/react';
import CountUp from 'react-countup';
import { Check, X, Clock, Layers, Star, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { SPRING_GENTLE, STAGGER_DEFAULT } from '@/lib/motion-config';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SUB_CATEGORY_NAMES, SUB_CATEGORY_COLORS } from '@/lib/mastery';
import { MissedCardsList } from '@/components/sort/MissedCardsList';
import type { RoundResult } from '@/lib/sort/sortTypes';
import type { Question, Category } from '@/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PersonalBest {
  percentage: number;
  date: string;
  cardCount: number;
}

export interface RoundSummaryProps {
  round: number;
  totalCards: number;
  knownCount: number;
  unknownCount: number;
  durationMs: number;
  unknownIds: string[];
  allUnknownIds: string[];
  roundHistory: RoundResult[];
  sourceCards: Question[];
  personalBest: PersonalBest | null;
  /** Callbacks for next round actions */
  onStartNextRound: () => void;
  onStartCountdown: () => void;
  onFinishSession: () => void;
  /** Whether max rounds reached */
  isMaxRounds: boolean;
  showBurmese: boolean;
  /** Slot for SortCountdown and SRSBatchAdd */
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format milliseconds to MM:SS */
function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/** Get color class based on percentage threshold */
function getPercentageColor(pct: number): string {
  if (pct >= 80) return 'text-success';
  if (pct >= 50) return 'text-warning';
  return 'text-destructive';
}

/** Convert number to Myanmar numerals */
function toMyanmarNumeral(n: number): string {
  const myanmarDigits = ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉'];
  return String(n)
    .split('')
    .map(d => myanmarDigits[parseInt(d)] ?? d)
    .join('');
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface CategoryBreakdownItem {
  category: Category;
  total: number;
  known: number;
  missed: number;
}

function CategoryBreakdownRow({
  item,
  showBurmese,
}: {
  item: CategoryBreakdownItem;
  showBurmese: boolean;
}) {
  const pct = item.total > 0 ? Math.round((item.known / item.total) * 100) : 0;
  const names = SUB_CATEGORY_NAMES[item.category];
  const colors = SUB_CATEGORY_COLORS[item.category];

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground truncate">
            {names?.en ?? item.category}
          </p>
          {showBurmese && names?.my && (
            <p className="font-myanmar text-xs text-muted-foreground truncate">{names.my}</p>
          )}
        </div>
        <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
          {item.known}/{item.total}
        </span>
      </div>
      {/* Mini progress bar */}
      <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden">
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-500',
            colors?.stripBg ?? 'bg-primary'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RoundSummary({
  round,
  totalCards,
  knownCount,
  unknownCount,
  durationMs,
  unknownIds,
  allUnknownIds: _allUnknownIds,
  roundHistory,
  sourceCards,
  personalBest,
  onStartCountdown,
  onFinishSession,
  isMaxRounds,
  showBurmese,
  children,
}: RoundSummaryProps) {
  const shouldReduceMotion = useReducedMotion();

  const percentage = totalCards > 0 ? Math.round((knownCount / totalCards) * 100) : 0;

  // ---------------------------------------------------------------------------
  // Improvement delta (round 2+)
  // ---------------------------------------------------------------------------
  const improvementDelta = useMemo(() => {
    if (round < 2 || roundHistory.length < 2) return null;
    const previousRound = roundHistory[roundHistory.length - 2];
    if (!previousRound) return null;
    return knownCount - previousRound.knownCount;
  }, [round, roundHistory, knownCount]);

  const improvementMessage = useMemo(() => {
    if (improvementDelta === null) return null;
    if (improvementDelta > 0)
      return {
        en: 'Great improvement!',
        my: 'တိုးတက်မှုကောင်းပါတယ်!',
        icon: TrendingUp,
        color: 'text-success',
      };
    if (improvementDelta === 0)
      return {
        en: "Keep studying, you've got this!",
        my: 'ဆက်လေ့လာပါ!',
        icon: Minus,
        color: 'text-warning',
      };
    return {
      en: "Stay focused, you're learning!",
      my: 'အာရုံစိုက်ပါ!',
      icon: TrendingDown,
      color: 'text-muted-foreground',
    };
  }, [improvementDelta]);

  // ---------------------------------------------------------------------------
  // Personal best check (round 1 only)
  // ---------------------------------------------------------------------------
  const isNewPersonalBest =
    personalBest !== null && round === 1 && percentage > personalBest.percentage;

  // ---------------------------------------------------------------------------
  // Per-category breakdown: group unknownIds by category, sorted weakest-first
  // ---------------------------------------------------------------------------
  const categoryBreakdown: CategoryBreakdownItem[] = useMemo(() => {
    // Build a map of category -> { total, missed set }
    const catMap = new Map<Category, { total: number; missedSet: Set<string> }>();

    // Count all cards in this round by category
    for (const card of sourceCards) {
      const existing = catMap.get(card.category);
      if (existing) {
        existing.total += 1;
      } else {
        catMap.set(card.category, { total: 1, missedSet: new Set() });
      }
    }

    // Mark which ones were missed (using the current round's unknownIds, not allUnknownIds)
    const unknownSet = new Set(unknownIds);
    const questionsById = new Map(sourceCards.map(q => [q.id, q]));

    for (const id of unknownIds) {
      const q = questionsById.get(id);
      if (q) {
        const entry = catMap.get(q.category);
        if (entry) {
          entry.missedSet.add(id);
        }
      }
    }

    // Only include categories from the current round's card set
    // Filter to only categories that appear in the cards being sorted this round
    const roundCardCategories = new Set(
      sourceCards.filter(c => unknownSet.has(c.id) || !unknownSet.has(c.id)).map(c => c.category)
    );

    return Array.from(catMap.entries())
      .filter(([cat]) => roundCardCategories.has(cat))
      .map(([category, { total, missedSet }]) => ({
        category,
        total,
        known: total - missedSet.size,
        missed: missedSet.size,
      }))
      .sort((a, b) => {
        // Sort weakest-first (most missed first), then by percentage ascending
        const aPct = a.total > 0 ? a.known / a.total : 1;
        const bPct = b.total > 0 ? b.known / b.total : 1;
        return aPct - bPct;
      });
  }, [sourceCards, unknownIds]);

  // ---------------------------------------------------------------------------
  // Animation variants
  // ---------------------------------------------------------------------------
  const fadeVariants = {
    hidden: shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 },
    visible: shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: shouldReduceMotion ? 0 : STAGGER_DEFAULT },
        },
      }}
      className="flex flex-col gap-5 px-1"
    >
      {/* Hero stat: Know % with count-up */}
      <motion.div variants={fadeVariants} className="text-center">
        <div className={clsx('text-6xl font-bold tabular-nums', getPercentageColor(percentage))}>
          {shouldReduceMotion ? (
            `${percentage}%`
          ) : (
            <CountUp start={0} end={percentage} duration={1.5} suffix="%" />
          )}
        </div>
        <p className="text-lg font-semibold text-foreground mt-1">Known</p>
        {showBurmese && (
          <p className="font-myanmar text-base text-muted-foreground">
            {toMyanmarNumeral(percentage)}% သိပါတယ်
          </p>
        )}
      </motion.div>

      {/* New personal best */}
      {isNewPersonalBest && (
        <motion.div
          variants={fadeVariants}
          className="flex items-center justify-center gap-2 text-warning"
        >
          <Star className="h-5 w-5 fill-warning" />
          <span className="text-sm font-bold">New Personal Best!</span>
          {showBurmese && <span className="font-myanmar text-xs">ကိုယ်ပိုင်စံချိန်သစ်!</span>}
          <Star className="h-5 w-5 fill-warning" />
        </motion.div>
      )}

      {/* Previous personal best (round 1, not beaten) */}
      {personalBest && round === 1 && !isNewPersonalBest && (
        <motion.div variants={fadeVariants} className="text-center">
          <p className="text-xs text-muted-foreground">
            Personal Best: {personalBest.percentage}% ({personalBest.date})
          </p>
          {showBurmese && (
            <p className="font-myanmar text-xs text-muted-foreground">
              ကိုယ်ပိုင်စံချိန်: {toMyanmarNumeral(personalBest.percentage)}%
            </p>
          )}
        </motion.div>
      )}

      {/* Stats grid: 2x2 */}
      <motion.div variants={fadeVariants}>
        <div className="grid grid-cols-2 gap-3">
          {/* Know */}
          <Card className="text-center !p-3">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Check className="h-4 w-4 text-success" />
              <span className="text-xs font-medium text-muted-foreground">Know</span>
            </div>
            <p className="text-2xl font-bold text-success tabular-nums">{knownCount}</p>
            {showBurmese && <p className="font-myanmar text-xs text-muted-foreground">သိသည်</p>}
          </Card>

          {/* Don't Know */}
          <Card className="text-center !p-3">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <X className="h-4 w-4 text-warning" />
              <span className="text-xs font-medium text-muted-foreground">Don&apos;t Know</span>
            </div>
            <p className="text-2xl font-bold text-warning tabular-nums">{unknownCount}</p>
            {showBurmese && <p className="font-myanmar text-xs text-muted-foreground">မသိသေးပါ</p>}
          </Card>

          {/* Time */}
          <Card className="text-center !p-3">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Time</span>
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">
              {formatDuration(durationMs)}
            </p>
            {showBurmese && <p className="font-myanmar text-xs text-muted-foreground">အချိန်</p>}
          </Card>

          {/* Round */}
          <Card className="text-center !p-3">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Round</span>
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">{round}</p>
            {showBurmese && (
              <p className="font-myanmar text-xs text-muted-foreground">
                အကြိမ် {toMyanmarNumeral(round)}
              </p>
            )}
          </Card>
        </div>
      </motion.div>

      {/* Improvement delta (round 2+) */}
      {improvementDelta !== null && improvementMessage && (
        <motion.div variants={fadeVariants} transition={SPRING_GENTLE}>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <improvementMessage.icon
                className={clsx('h-5 w-5 shrink-0', improvementMessage.color)}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {improvementDelta > 0 ? '+' : ''}
                  {improvementDelta} more known vs last round
                </p>
                {showBurmese && (
                  <p className="font-myanmar text-xs text-muted-foreground mt-0.5">
                    {improvementDelta > 0 ? '+' : ''}
                    {toMyanmarNumeral(improvementDelta)} ယခင်အကြိမ်ထက်ပိုသိသည်
                  </p>
                )}
                <p className={clsx('text-sm font-medium mt-1', improvementMessage.color)}>
                  {improvementMessage.en}
                </p>
                {showBurmese && (
                  <p className={clsx('font-myanmar text-xs mt-0.5', improvementMessage.color)}>
                    {improvementMessage.my}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Per-category breakdown */}
      {categoryBreakdown.length > 1 && (
        <motion.div variants={fadeVariants}>
          <Card className="!p-4">
            <h3 className="text-sm font-bold text-foreground mb-3">Category Breakdown</h3>
            {showBurmese && (
              <p className="font-myanmar text-xs text-muted-foreground -mt-2 mb-3">
                အမျိုးအစားအလိုက်ခွဲခြမ်းစိတ်ဖြာမှု
              </p>
            )}
            <div className="space-y-3">
              {categoryBreakdown.map(item => (
                <CategoryBreakdownRow key={item.category} item={item} showBurmese={showBurmese} />
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Missed cards list */}
      <motion.div variants={fadeVariants}>
        <MissedCardsList
          unknownIds={unknownIds}
          sourceCards={sourceCards}
          showBurmese={showBurmese}
        />
      </motion.div>

      {/* Action buttons */}
      <motion.div variants={fadeVariants} className="space-y-3">
        {isMaxRounds ? (
          <Card className="!p-4 text-center">
            <p className="text-sm font-medium text-foreground">
              Round limit reached. Add remaining cards to your review deck.
            </p>
            {showBurmese && (
              <p className="font-myanmar text-xs text-muted-foreground mt-1">
                အကြိမ်ကန့်သတ်ချက်ပြည့်ပါပြီ။ ကျန်ကတ်များကို ပြန်လှည့်စာရင်းသို့ထည့်ပါ။
              </p>
            )}
          </Card>
        ) : unknownCount > 0 ? (
          <Button variant="primary" size="lg" fullWidth onClick={onStartCountdown}>
            <span className="flex flex-col items-center">
              <span>Study Missed Cards</span>
              {showBurmese && (
                <span className="font-myanmar text-sm opacity-80">မမှန်ကတ်များကိုလေ့လာပါ</span>
              )}
            </span>
          </Button>
        ) : null}

        <Button variant="outline" size="lg" fullWidth onClick={onFinishSession}>
          <span className="flex flex-col items-center">
            <span>Finish</span>
            {showBurmese && <span className="font-myanmar text-sm opacity-80">ပြီးပါပြီ</span>}
          </span>
        </Button>
      </motion.div>

      {/* Children slot for SortCountdown and SRSBatchAdd */}
      {children && <motion.div variants={fadeVariants}>{children}</motion.div>}
    </motion.div>
  );
}
