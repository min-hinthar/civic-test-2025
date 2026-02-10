/**
 * Navigation Configuration -- Single source of truth
 *
 * Defines all nav tabs, utility controls, route helpers, and badge types.
 * Consumed by Sidebar, BottomTabBar, PageTransition, and NavigationProvider.
 */

import {
  Home,
  BookOpen,
  ClipboardCheck,
  Mic,
  BarChart3,
  Settings,
  type LucideIcon,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Badge types
// ---------------------------------------------------------------------------

export interface NavBadges {
  studyDueCount: number;
  hubHasUpdate: boolean;
  settingsHasUpdate: boolean;
}

// ---------------------------------------------------------------------------
// Tab configuration
// ---------------------------------------------------------------------------

export interface NavTab {
  id: string;
  href: string;
  label: string;
  labelMy: string;
  icon: LucideIcon;
  order: number;
  badgeKey?: keyof NavBadges;
  dataTour?: string;
}

/**
 * The 6 navigation tabs shown in both Sidebar and BottomTabBar.
 * Labels are primary-language-only; labelMy is used when showBurmese is true.
 */
export const NAV_TABS: NavTab[] = [
  {
    id: 'home',
    href: '/home',
    label: 'Home',
    labelMy: '\u1015\u1004\u103A\u1019',
    icon: Home,
    order: 0,
  },
  {
    id: 'study',
    href: '/study',
    label: 'Study Guide',
    labelMy:
      '\u101C\u1031\u1037\u101C\u102C\u1019\u103E\u102F\u1021\u100A\u103D\u103E\u1014\u103A\u1038',
    icon: BookOpen,
    order: 1,
    badgeKey: 'studyDueCount',
    dataTour: 'nav-study',
  },
  {
    id: 'test',
    href: '/test',
    label: 'Mock Test',
    labelMy:
      '\u1005\u1019\u103A\u1038\u101E\u1015\u103A\u1005\u102C\u1019\u1031\u1038\u1015\u103D\u1032',
    icon: ClipboardCheck,
    order: 2,
    dataTour: 'nav-test',
  },
  {
    id: 'interview',
    href: '/interview',
    label: 'Interview',
    labelMy: '\u1021\u1004\u103A\u1010\u102C\u1017\u103B\u1030\u1038',
    icon: Mic,
    order: 3,
    dataTour: 'nav-interview',
  },
  {
    id: 'hub',
    href: '/hub',
    label: 'Progress Hub',
    labelMy: '\u1010\u102D\u102F\u1038\u1010\u1000\u103A\u1019\u103E\u102F',
    icon: BarChart3,
    order: 4,
    badgeKey: 'hubHasUpdate',
    dataTour: 'nav-hub',
  },
  {
    id: 'settings',
    href: '/settings',
    label: 'Settings',
    labelMy: '\u1006\u1000\u103A\u1010\u1004\u103A\u1019\u103B\u102C\u1038',
    icon: Settings,
    order: 5,
    badgeKey: 'settingsHasUpdate',
  },
];

// ---------------------------------------------------------------------------
// Sidebar dimensions (shared between Sidebar and NavigationShell)
// ---------------------------------------------------------------------------

export const SIDEBAR_EXPANDED_W = 240;
export const SIDEBAR_COLLAPSED_W = 64;

// ---------------------------------------------------------------------------
// Hidden routes (where nav is not shown)
// ---------------------------------------------------------------------------

export const HIDDEN_ROUTES = ['/', '/auth', '/auth/forgot', '/auth/update-password', '/op-ed'];

// ---------------------------------------------------------------------------
// Slide direction helper
// ---------------------------------------------------------------------------

/**
 * Determines the slide direction for page transitions based on tab order.
 * Higher order = slide left (forward), lower order = slide right (backward).
 * Returns 'right' for unknown routes (default).
 */
export function getSlideDirection(from: string, to: string): 'left' | 'right' {
  const fromTab = NAV_TABS.find(t => t.href === from);
  const toTab = NAV_TABS.find(t => t.href === to);
  if (!fromTab || !toTab) return 'right';
  return toTab.order > fromTab.order ? 'left' : 'right';
}
