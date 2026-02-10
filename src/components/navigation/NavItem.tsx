'use client';

/**
 * NavItem -- Shared navigation item component.
 *
 * Used by both Sidebar and BottomTabBar for consistent rendering.
 * Supports three variants: mobile, sidebar-expanded, sidebar-collapsed.
 * Handles active state, badges, lock behavior, tap animation, and tooltips.
 */

import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import type { NavTab, NavBadges } from './navConfig';
import { NavBadge } from './NavBadge';

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
      return (
        <NavBadge type="count" count={badges.studyDueCount} color="warning" />
      );
    case 'hubHasUpdate':
      return (
        <NavBadge type="dot" color="primary" visible={badges.hubHasUpdate} />
      );
    case 'settingsHasUpdate':
      return (
        <NavBadge type="dot" color="primary" visible={badges.settingsHasUpdate} />
      );
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

  // --- Locked state ---
  const handleLockedClick = (e: React.MouseEvent) => {
    e.preventDefault();
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
    const base = 'flex items-center transition-all';
    const activeStyle = isActive
      ? 'bg-primary/20 shadow-sm shadow-primary/15'
      : '';
    const hoverStyle = !isActive && !isLocked
      ? 'hover:bg-primary/10 hover:scale-[1.02]'
      : '';
    const lockedStyle = isLocked ? 'opacity-60 cursor-not-allowed' : '';

    switch (variant) {
      case 'mobile':
        return `${base} flex-col gap-0.5 rounded-full px-2.5 py-1.5 ${activeStyle} ${hoverStyle} ${lockedStyle}`;
      case 'sidebar-expanded':
        return `${base} gap-3 py-2.5 px-3 rounded-full w-full ${activeStyle} ${hoverStyle} ${lockedStyle}`;
      case 'sidebar-collapsed':
        return `${base} justify-center w-12 h-12 rounded-full ${activeStyle} ${hoverStyle} ${lockedStyle}`;
    }
  })();

  // --- Label rendering ---
  const labelElement = (() => {
    if (variant === 'sidebar-collapsed') return null;

    const textSize = variant === 'mobile' ? 'text-xs' : 'text-sm';
    const fontClass = showBurmese ? 'font-myanmar' : '';
    const activeColor = isActive ? 'font-semibold text-primary' : 'text-muted-foreground';

    return (
      <span
        className={`${textSize} whitespace-nowrap transition-colors ${fontClass} ${activeColor}`}
      >
        {label}
      </span>
    );
  })();

  // --- Icon rendering ---
  const iconElement = (
    <span className="relative">
      <Icon
        className={`h-6 w-6 shrink-0 transition-colors ${
          isActive ? 'text-primary' : 'text-muted-foreground'
        }`}
        strokeWidth={isActive ? 2.5 : 2}
      />
      <TabBadge tab={tab} badges={badges} />
    </span>
  );

  // --- Tooltip for collapsed sidebar ---
  const tooltipAttrs =
    variant === 'sidebar-collapsed'
      ? { 'data-tooltip': tab.label }
      : {};

  // --- Content wrapper (motion for tap animation) ---
  const content = (
    <motion.div
      whileTap={isLocked ? undefined : { scale: 0.92 }}
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
      to={tab.href}
      className={wrapperClasses}
      aria-current={isActive ? 'page' : undefined}
      data-tour={tab.dataTour}
      onClick={onClick}
    >
      {content}
    </Link>
  );
}
