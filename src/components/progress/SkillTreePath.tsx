'use client';

import { useMemo } from 'react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useLanguage } from '@/contexts/LanguageContext';
import { SUB_CATEGORY_NAMES } from '@/lib/mastery';
import type { Category } from '@/types';

/**
 * The 7 USCIS sub-categories in skill tree order.
 * Ordered by main category: Government (blue) -> History (amber) -> Civics (emerald)
 */
const SKILL_NODES: {
  subCategory: Category;
  emoji: string;
  color: 'blue' | 'amber' | 'emerald';
}[] = [
  { subCategory: 'Principles of American Democracy', emoji: '\u2696\uFE0F', color: 'blue' },
  { subCategory: 'System of Government', emoji: '\u{1F3DB}\uFE0F', color: 'blue' },
  { subCategory: 'Rights and Responsibilities', emoji: '\u{1F4DC}', color: 'blue' },
  {
    subCategory: 'American History: Colonial Period and Independence',
    emoji: '\u{1F3F4}',
    color: 'amber',
  },
  { subCategory: 'American History: 1800s', emoji: '\u{1F559}', color: 'amber' },
  {
    subCategory: 'Recent American History and Other Important Historical Information',
    emoji: '\u{1F30D}',
    color: 'amber',
  },
  { subCategory: 'Civics: Symbols and Holidays', emoji: '\u{1F1FA}\u{1F1F8}', color: 'emerald' },
];

/** Medal ring color classes per threshold level */
const MEDAL_RING_CLASSES = {
  none: '',
  bronze: 'ring-4 ring-amber-600 dark:ring-amber-500',
  silver: 'ring-4 ring-gray-400 dark:ring-gray-300',
  gold: 'ring-4 ring-yellow-400 dark:ring-yellow-300',
} as const;

/** Node background color per category color */
const NODE_BG_CLASSES = {
  blue: 'bg-blue-500 dark:bg-blue-600',
  amber: 'bg-amber-500 dark:bg-amber-600',
  emerald: 'bg-emerald-500 dark:bg-emerald-600',
} as const;

/** Node shadow color for glow effect */
const NODE_GLOW_CLASSES = {
  blue: 'shadow-blue-500/40',
  amber: 'shadow-amber-500/40',
  emerald: 'shadow-emerald-500/40',
} as const;

type MedalLevel = 'none' | 'bronze' | 'silver' | 'gold';

function getMedalLevel(mastery: number): MedalLevel {
  if (mastery >= 100) return 'gold';
  if (mastery >= 75) return 'silver';
  if (mastery >= 50) return 'bronze';
  return 'none';
}

/** Medal label text */
const MEDAL_LABELS: Record<MedalLevel, { en: string; my: string } | null> = {
  none: null,
  bronze: { en: 'Bronze', my: '\u1000\u103C\u1031\u1038\u1010\u1036\u1006\u102D\u1015\u103A' },
  silver: { en: 'Silver', my: '\u1004\u103D\u1031\u1010\u1036\u1006\u102D\u1015\u103A' },
  gold: { en: 'Gold', my: '\u101B\u103D\u103E\u1031\u1010\u1036\u1006\u102D\u1015\u103A' },
};

export interface SkillTreePathProps {
  /** Mastery percentage (0-100) for each sub-category */
  subcategoryMastery: Record<string, number>;
  /** Callback when a node is clicked */
  onNodeClick?: (subCategory: Category) => void;
}

/**
 * Duolingo-style vertical skill tree path with 7 sub-category nodes.
 *
 * Features:
 * - Zigzag vertical layout (nodes alternate left/right)
 * - Sequential unlock: node 1 always unlocked, node N+1 at 50%+ of node N
 * - Medal ring indicators: bronze (50%), silver (75%), gold (100%)
 * - Locked nodes are dimmed and grayscale
 * - Active/current node has pulsing glow animation
 * - Connecting lines between nodes (solid unlocked, dashed locked)
 * - Responsive and dark mode supported
 * - Bilingual labels with font-myanmar
 */
export function SkillTreePath({ subcategoryMastery, onNodeClick }: SkillTreePathProps) {
  const shouldReduceMotion = useReducedMotion();
  const { showBurmese } = useLanguage();

  // Compute unlock states for each node
  const nodeStates = useMemo(() => {
    return SKILL_NODES.map((node, index) => {
      const mastery = subcategoryMastery[node.subCategory] ?? 0;
      const medal = getMedalLevel(mastery);

      // Node 0 is always unlocked. Node N is unlocked if node N-1 has >= 50% mastery
      let isUnlocked = index === 0;
      if (index > 0) {
        const prevMastery = subcategoryMastery[SKILL_NODES[index - 1].subCategory] ?? 0;
        isUnlocked = prevMastery >= 50;
      }

      // Active = unlocked but not yet at bronze (the "current working" node)
      // Or the first unlocked node that hasn't reached 100%
      const isActive = isUnlocked && mastery < 100;

      return {
        ...node,
        mastery,
        medal,
        isUnlocked,
        isActive,
      };
    });
  }, [subcategoryMastery]);

  // Find the first truly "current" node (lowest unlocked node not at 100%)
  const currentNodeIndex = useMemo(() => {
    const idx = nodeStates.findIndex(n => n.isUnlocked && n.mastery < 100);
    return idx >= 0 ? idx : -1;
  }, [nodeStates]);

  return (
    <div className="relative mx-auto w-full max-w-md py-4" role="list" aria-label="Skill tree path">
      {SKILL_NODES.map((node, index) => {
        const state = nodeStates[index];
        const name = SUB_CATEGORY_NAMES[node.subCategory];
        const medalLabel = MEDAL_LABELS[state.medal];
        const isCurrent = index === currentNodeIndex;

        // Zigzag: even nodes left, odd nodes right
        const isLeft = index % 2 === 0;

        return (
          <div key={node.subCategory} role="listitem">
            {/* Connecting line to previous node */}
            {index > 0 && (
              <ConnectingLine
                isUnlocked={state.isUnlocked}
                fromLeft={!isLeft}
                toLeft={isLeft}
                color={node.color}
              />
            )}

            {/* Node row */}
            <div
              className={clsx(
                'flex items-center gap-4 px-2',
                isLeft ? 'justify-start' : 'justify-end'
              )}
            >
              {/* Label (left side when node is right) */}
              {!isLeft && (
                <NodeLabel
                  name={name}
                  medalLabel={medalLabel}
                  showBurmese={showBurmese}
                  isUnlocked={state.isUnlocked}
                  align="right"
                />
              )}

              {/* The node circle */}
              <motion.button
                type="button"
                className={clsx(
                  'relative flex-shrink-0 flex items-center justify-center',
                  'w-16 h-16 rounded-full text-2xl',
                  'transition-all duration-200',
                  state.isUnlocked ? NODE_BG_CLASSES[node.color] : 'bg-muted dark:bg-muted/60',
                  state.isUnlocked ? 'text-white' : 'text-muted-foreground grayscale opacity-40',
                  state.isUnlocked && MEDAL_RING_CLASSES[state.medal],
                  isCurrent && !shouldReduceMotion && 'shadow-lg',
                  isCurrent && NODE_GLOW_CLASSES[node.color]
                )}
                onClick={() => {
                  if (state.isUnlocked && onNodeClick) {
                    onNodeClick(node.subCategory);
                  }
                }}
                disabled={!state.isUnlocked}
                aria-label={`${name?.en ?? node.subCategory} - ${state.mastery}% mastery${!state.isUnlocked ? ' (locked)' : ''}`}
                initial={false}
                animate={
                  isCurrent && !shouldReduceMotion
                    ? {
                        boxShadow: [
                          '0 0 0 0px rgba(59, 130, 246, 0)',
                          '0 0 0 8px rgba(59, 130, 246, 0.15)',
                          '0 0 0 0px rgba(59, 130, 246, 0)',
                        ],
                      }
                    : {}
                }
                transition={
                  isCurrent && !shouldReduceMotion
                    ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                    : undefined
                }
              >
                <span className="select-none" aria-hidden="true">
                  {node.emoji}
                </span>

                {/* Mastery percentage badge */}
                {state.isUnlocked && (
                  <span
                    className={clsx(
                      'absolute -bottom-1 left-1/2 -translate-x-1/2',
                      'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                      'bg-card text-foreground border border-border/60',
                      'tabular-nums shadow-sm'
                    )}
                  >
                    {state.mastery}%
                  </span>
                )}

                {/* Lock icon for locked nodes */}
                {!state.isUnlocked && (
                  <span
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs"
                    aria-hidden="true"
                  >
                    {'\u{1F512}'}
                  </span>
                )}
              </motion.button>

              {/* Label (right side when node is left) */}
              {isLeft && (
                <NodeLabel
                  name={name}
                  medalLabel={medalLabel}
                  showBurmese={showBurmese}
                  isUnlocked={state.isUnlocked}
                  align="left"
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Label component for a skill tree node */
function NodeLabel({
  name,
  medalLabel,
  showBurmese,
  isUnlocked,
  align,
}: {
  name: { en: string; my: string } | undefined;
  medalLabel: { en: string; my: string } | null;
  showBurmese: boolean;
  isUnlocked: boolean;
  align: 'left' | 'right';
}) {
  return (
    <div
      className={clsx(
        'flex-1 min-w-0',
        align === 'right' && 'text-right',
        !isUnlocked && 'opacity-40'
      )}
    >
      <p
        className={clsx(
          'text-sm font-semibold text-foreground leading-tight truncate',
          !isUnlocked && 'text-muted-foreground'
        )}
      >
        {name?.en ?? 'Unknown'}
      </p>
      {showBurmese && name?.my && (
        <p className="text-xs font-myanmar text-muted-foreground leading-tight truncate mt-0.5">
          {name.my}
        </p>
      )}
      {isUnlocked && medalLabel && (
        <p className="text-[10px] font-bold mt-0.5 text-muted-foreground">
          {medalLabel.en}
          {showBurmese && <span className="font-myanmar ml-1">{medalLabel.my}</span>}
        </p>
      )}
    </div>
  );
}

/** SVG connecting line between two nodes */
function ConnectingLine({
  isUnlocked,
  fromLeft,
  toLeft,
}: {
  isUnlocked: boolean;
  fromLeft: boolean;
  toLeft: boolean;
  color?: 'blue' | 'amber' | 'emerald';
}) {
  // Calculate SVG path for the zigzag connector
  // fromLeft/toLeft determine if previous/current nodes are on left or right
  const height = 40;
  const width = 100;

  // X positions: left node at ~25%, right node at ~75%
  const fromX = fromLeft ? 25 : 75;
  const toX = toLeft ? 25 : 75;

  const d = `M ${fromX} 0 C ${fromX} ${height * 0.5}, ${toX} ${height * 0.5}, ${toX} ${height}`;

  return (
    <div className="flex justify-center my-1" aria-hidden="true">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-md h-10"
        preserveAspectRatio="none"
      >
        <path
          d={d}
          fill="none"
          strokeWidth={3}
          className={clsx(isUnlocked ? 'stroke-foreground/20' : 'stroke-muted-foreground/15')}
          strokeDasharray={isUnlocked ? 'none' : '6 4'}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
