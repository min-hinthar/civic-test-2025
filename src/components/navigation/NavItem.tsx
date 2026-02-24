'use client';

/**
 * NavItem -- Shared navigation item component.
 *
 * Used by both Sidebar and BottomTabBar for consistent rendering.
 * Supports three variants: mobile, sidebar-expanded, sidebar-collapsed.
 * Handles active state, badges, lock behavior, tap animation, and tooltips.
 */

import Link from 'next/link';
import { motion } from 'motion/react';
import type { NavTab, NavBadges } from './navConfig';
import { NavBadge } from './NavBadge';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { SPRING_SNAPPY } from '@/lib/motion-config';
import { hapticLight } from '@/lib/haptics';

interface NavItemProps {
  tab: NavTab;
  isActive: boolean;
  isLocked: boolean;
  showBurmese: boolean;
  variant: 'mobile' | 'sidebar-expanded' | 'sidebar-collapsed';
  badges: NavBadges;
  onLockedTap?: () => void;
  onClick?: () => void;
}

/** Render the badge for a tab based on its badgeKey */
function TabBadge({ tab, badges }: { tab: NavTab; badges: NavBadges }) {
  if (!tab.badgeKey) return null;

  switch (tab.badgeKey) {
    case 'studyDueCount':
      return <NavBadge type="count" count={badges.studyDueCount} color="warning" />;
    case 'testSessionCount':
      return <NavBadge type="count" count={badges.testSessionCount} color="warning" />;
    case 'interviewSessionCount':
      return <NavBadge type="count" count={badges.interviewSessionCount} color="warning" />;
    case 'hubHasUpdate':
      return <NavBadge type="dot" color="primary" visible={badges.hubHasUpdate} />;
    case 'settingsHasUpdate':
      return <NavBadge type="dot" color="primary" visible={badges.settingsHasUpdate} />;
    default:
      return null;
  }
}

export function NavItem({
  tab,
  isActive,
  isLocked,
  showBurmese,
  variant,
  badges,
  onLockedTap,
  onClick,
}: NavItemProps) {
  const label = showBurmese ? tab.labelMy : tab.label;
  const Icon = tab.icon;
  const shouldReduceMotion = useReducedMotion();

  // --- Locked state ---
  const handleLockedClick = (e: React.MouseEvent) => {
    e.preventDefault();
    hapticLight();
    onLockedTap?.();
  };

  // --- Variant-specific classes ---
  const wrapperClasses = (() => {
    switch (variant) {
      case 'mobile':
        return 'flex shrink-0 flex-col items-center justify-center py-1 px-1.5 min-w-[60px] min-h-[56px] tap-highlight-none';
      case 'sidebar-expanded':
        return 'flex items-center w-full';
      case 'sidebar-collapsed':
        return 'flex items-center justify-center w-full group/navitem';
    }
  })();

  const innerClasses = (() => {
    const activeStyle = isActive ? 'bg-primary/20 shadow-sm shadow-primary/15' : '';
    const hoverStyle = !isActive && !isLocked ? 'hover:bg-primary/10 hover:scale-[1.02]' : '';
    const lockedStyle = isLocked ? 'opacity-60 cursor-not-allowed' : '';

    switch (variant) {
      case 'mobile':
        return `flex flex-col items-center gap-0.5 ${lockedStyle}`;
      case 'sidebar-expanded':
        return `flex items-center transition gap-3 py-2.5 px-3 rounded-full w-full ${activeStyle} ${hoverStyle} ${lockedStyle}`;
      case 'sidebar-collapsed':
        return `flex items-center transition justify-center w-12 h-12 rounded-full ${activeStyle} ${hoverStyle} ${lockedStyle}`;
    }
  })();

  // --- Label rendering ---
  const labelElement = (() => {
    if (variant === 'sidebar-collapsed') return null;

    const textSize = variant === 'mobile' ? 'text-xs' : 'text-sm';
    const fontClass = showBurmese ? 'font-myanmar' : '';
    const activeColor = isActive
      ? variant === 'mobile'
        ? 'text-primary'
        : 'font-semibold text-primary'
      : 'text-muted-foreground';

    return (
      <span
        className={`${textSize} whitespace-nowrap transition-colors duration-200 ${fontClass} ${activeColor}`}
      >
        {label}
      </span>
    );
  })();

  // --- Icon rendering (with spring pop on active) ---
  const iconPop = shouldReduceMotion || !isActive ? undefined : { scale: [0.9, 1] };

  const iconElement = (
    <motion.span
      className="relative"
      animate={iconPop}
      transition={SPRING_SNAPPY}
      key={`${tab.id}-${isActive}`}
    >
      <Icon
        className={`h-6 w-6 shrink-0 transition-colors duration-200 ${
          isActive ? 'text-primary' : 'text-muted-foreground'
        }`}
        strokeWidth={2}
      />
      <TabBadge tab={tab} badges={badges} />
    </motion.span>
  );

  // --- Tooltip for collapsed sidebar ---
  const tooltipAttrs = variant === 'sidebar-collapsed' ? { 'data-tooltip': tab.label } : {};

  // --- Content wrapper (motion for tap animation) ---
  const content =
    variant === 'mobile' ? (
      <div className={innerClasses}>
        {/* Icon pill — layoutId-animated highlight slides between tabs */}
        <span
          className={`relative flex h-8 w-12 items-center justify-center rounded-full ${
            !isActive && !isLocked ? 'hover:bg-primary/10 transition-colors duration-200' : ''
          }`}
        >
          {isActive && (
            <motion.span
              layoutId="mobile-nav-pill"
              className="absolute inset-0 rounded-full bg-primary/20 shadow-sm shadow-primary/15"
              transition={shouldReduceMotion ? { duration: 0.15, ease: 'easeOut' } : SPRING_SNAPPY}
            />
          )}
          {iconElement}
        </span>
        {labelElement}
      </div>
    ) : (
      <motion.div
        whileTap={isLocked || shouldReduceMotion ? undefined : { scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className={innerClasses}
        {...tooltipAttrs}
      >
        {iconElement}
        {labelElement}
      </motion.div>
    );

  // --- Render as button (locked) or Link (normal) ---
  if (isLocked) {
    return (
      <button
        type="button"
        className={wrapperClasses}
        onClick={handleLockedClick}
        aria-disabled
        data-tour={tab.dataTour}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={tab.href}
      className={wrapperClasses}
      aria-current={isActive ? 'page' : undefined}
      data-tour={tab.dataTour}
      onClick={() => {
        hapticLight();
        onClick?.();
      }}
    >
      {content}
    </Link>
  );
}
