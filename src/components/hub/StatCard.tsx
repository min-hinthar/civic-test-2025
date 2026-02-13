'use client';

import { type LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard } from '@/components/hub/GlassCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { SPRING_BOUNCY } from '@/lib/motion-config';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StatCardProps {
  /** Lucide icon component */
  icon: LucideIcon;
  /** Bilingual label */
  label: { en: string; my: string };
  /** Display value (string or number) */
  value: string | number;
  /** Optional click handler -- makes card tappable */
  onClick?: () => void;
  /** Optional badge text (e.g. "Review Now") rendered as accent button */
  badge?: string;
}

// ---------------------------------------------------------------------------
// StatCard component
// ---------------------------------------------------------------------------

/**
 * Tappable stat card with icon, value, bilingual label, and optional badge.
 *
 * Features:
 * - Uses GlassCard as wrapper
 * - Tappable when onClick is provided (interactive glass card with hover/active effects)
 * - Layout: icon at top, value large and bold, label below in muted
 * - Bilingual label rendering via useLanguage
 * - Designed for 2x2 grid layout on mobile (min-w-0, flex-1)
 */
export function StatCard({ icon: Icon, label, value, onClick, badge }: StatCardProps) {
  const { showBurmese } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  const content = (
    <div className="flex min-w-0 flex-col items-center gap-1.5 px-2 py-4 text-center">
      <Icon className="h-5 w-5 text-primary" />
      <span className="text-2xl font-extrabold tabular-nums text-text-primary">{value}</span>
      <span className="text-xs font-medium text-text-secondary">{label.en}</span>
      {showBurmese && (
        <span className="font-myanmar text-[10px] leading-tight text-text-secondary/70">
          {label.my}
        </span>
      )}
      {badge && (
        <span className="mt-1 inline-block rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold text-primary">
          {badge}
        </span>
      )}
    </div>
  );

  const card = onClick ? (
    <GlassCard interactive tier="light" className="min-w-0 flex-1 rounded-2xl p-0">
      <button
        type="button"
        className="flex w-full items-center justify-center min-h-[44px]"
        onClick={onClick}
      >
        {content}
      </button>
    </GlassCard>
  ) : (
    <GlassCard tier="light" className="min-w-0 flex-1 rounded-2xl p-0">
      {content}
    </GlassCard>
  );

  return (
    <motion.div
      initial={shouldReduceMotion ? undefined : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={shouldReduceMotion ? { duration: 0 } : SPRING_BOUNCY}
    >
      {card}
    </motion.div>
  );
}
