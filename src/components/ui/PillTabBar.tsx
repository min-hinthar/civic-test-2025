'use client';

import { motion } from 'motion/react';
import clsx from 'clsx';
import { SPRING_SNAPPY } from '@/lib/motion-config';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/** Tab definition for PillTabBar */
export interface PillTab {
  id: string;
  label: string;
  labelMy?: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export interface PillTabBarProps {
  tabs: PillTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  /** ARIA label for the tablist */
  ariaLabel?: string;
  /** Whether to show Burmese sub-labels */
  showBurmese?: boolean;
  /** Size variant: sm = compact for inline selectors, md = full tab bar (default) */
  size?: 'sm' | 'md';
  /** Sticky positioning */
  sticky?: boolean;
  /** Custom className for the outer wrapper */
  className?: string;
}

/**
 * Generic pill tab bar with spring-animated sliding indicator.
 *
 * Extracted from HubTabBar for reuse across the app.
 * Uses motion/react for smooth spring-physics pill animation.
 * Minimum 44px (md) or 36px (sm) touch target for accessibility.
 * Respects prefers-reduced-motion.
 */
export function PillTabBar({
  tabs,
  activeTab,
  onTabChange,
  ariaLabel = 'Tab navigation',
  showBurmese = false,
  size = 'md',
  sticky = false,
  className,
}: PillTabBarProps) {
  const shouldReduceMotion = useReducedMotion();

  const activeIndex = Math.max(
    0,
    tabs.findIndex(t => t.id === activeTab)
  );

  const isSmall = size === 'sm';

  const inner = (
    <nav
      className={clsx(
        'rounded-2xl border border-border/40 bg-surface/80 p-1 backdrop-blur-lg',
        className
      )}
      role="tablist"
      aria-label={ariaLabel}
    >
      <div
        className="relative"
        style={{ display: 'grid', gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
      >
        {/* Sliding pill indicator */}
        <motion.div
          className="absolute inset-y-0 rounded-xl bg-primary/10 dark:bg-primary/20 shadow-sm"
          style={{ width: `${100 / tabs.length}%` }}
          animate={{ x: `${activeIndex * 100}%` }}
          transition={shouldReduceMotion ? { duration: 0 } : SPRING_SNAPPY}
        />
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id)}
              className={clsx(
                'relative z-10 flex flex-col items-center justify-center rounded-xl font-medium transition-colors duration-200',
                isSmall ? 'min-h-[36px] px-2 py-1.5 text-xs' : 'min-h-[44px] px-2 py-2 text-sm',
                isActive ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
              )}
            >
              <motion.span
                className={clsx('flex items-center gap-1.5 leading-tight', isSmall && 'text-xs')}
                animate={shouldReduceMotion ? {} : { scale: isActive ? 1.05 : 1 }}
                transition={shouldReduceMotion ? { duration: 0 } : SPRING_SNAPPY}
              >
                {Icon && <Icon className={clsx(isSmall ? 'h-3.5 w-3.5' : 'h-4 w-4')} />}
                {tab.label}
              </motion.span>
              {showBurmese && !isSmall && tab.labelMy && (
                <motion.span
                  className="font-myanmar mt-0.5 text-[10px] leading-tight opacity-70"
                  animate={shouldReduceMotion ? {} : { scale: isActive ? 1.05 : 1 }}
                  transition={shouldReduceMotion ? { duration: 0 } : SPRING_SNAPPY}
                >
                  {tab.labelMy}
                </motion.span>
              )}
              {/* Badge (e.g., SRS due count) */}
              {tab.badge != null && tab.badge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-warning text-white text-xs font-bold shadow-sm">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );

  if (sticky) {
    return <div className="sticky top-0 z-20 -mx-4 mb-6 px-4 pt-2 pb-0">{inner}</div>;
  }

  return inner;
}
