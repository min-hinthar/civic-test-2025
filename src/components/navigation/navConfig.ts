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
  testSessionCount: number;
  interviewSessionCount: number;
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
 *
 * @verified claude-initial-pass 2026-02-18 — pending 3-AI consensus
 */
export const NAV_TABS: NavTab[] = [
  {
    id: 'home',
    href: '/home',
    label: 'Home',
    labelMy: 'ပင်မ',
    icon: Home,
    order: 0,
  },
  {
    id: 'study',
    href: '/study',
    label: 'Study Guide',
    labelMy: 'လေ့လာမှုအညွှန်း',
    icon: BookOpen,
    order: 1,
    badgeKey: 'studyDueCount',
    dataTour: 'nav-study',
  },
  {
    id: 'test',
    href: '/test',
    label: 'Mock Test',
    labelMy: 'စမ်းသပ်စာမေးပွဲ',
    icon: ClipboardCheck,
    order: 2,
    badgeKey: 'testSessionCount',
    dataTour: 'nav-test',
  },
  {
    id: 'interview',
    href: '/interview',
    label: 'Interview',
    labelMy: 'အင်တာဗျူး',
    icon: Mic,
    order: 3,
    badgeKey: 'interviewSessionCount',
    dataTour: 'nav-interview',
  },
  {
    id: 'hub',
    href: '/hub',
    label: 'Hub',
    labelMy: 'တိုးတက်မှု',
    icon: BarChart3,
    order: 4,
    badgeKey: 'hubHasUpdate',
    dataTour: 'nav-hub',
  },
  {
    id: 'settings',
    href: '/settings',
    label: 'Settings',
    labelMy: 'ဆက်တင်များ',
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

export const HIDDEN_ROUTES = [
  '/',
  '/auth',
  '/auth/forgot',
  '/auth/update-password',
  '/op-ed',
  '/about',
];

// ---------------------------------------------------------------------------
// Slide direction helper
// ---------------------------------------------------------------------------

/**
 * Determines the slide direction for page transitions based on tab order.
 * Higher order = slide left (forward), lower order = slide right (backward).
 * Returns 'right' for unknown routes (default).
 */
export function getSlideDirection(from: string, to: string): 'left' | 'right' {
  const matchTab = (path: string) =>
    NAV_TABS.find(t => path === t.href || path.startsWith(t.href + '/'));
  const fromTab = matchTab(from);
  const toTab = matchTab(to);
  if (!fromTab || !toTab) return 'right';
  return toTab.order > fromTab.order ? 'left' : 'right';
}
