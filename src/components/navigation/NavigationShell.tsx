'use client';

/**
 * NavigationShell -- Orchestrates nav surfaces and content layout.
 *
 * Renders Sidebar (md+) and BottomTabBar (below md) for app routes.
 * On md+, wraps children with animated marginLeft so the sidebar
 * pushes content instead of overlapping it.
 */

import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { HIDDEN_ROUTES, SIDEBAR_EXPANDED_W, SIDEBAR_COLLAPSED_W } from './navConfig';
import { useNavigation } from './NavigationProvider';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Sidebar } from './Sidebar';
import { BottomTabBar } from './BottomTabBar';

const SPRING = { type: 'spring' as const, stiffness: 300, damping: 24 };

interface NavigationShellProps {
  children: ReactNode;
}

export function NavigationShell({ children }: NavigationShellProps) {
  const location = useLocation();
  const { isExpanded, tier } = useNavigation();
  const shouldReduceMotion = useReducedMotion();
  const isPublicRoute = HIDDEN_ROUTES.includes(location.pathname);

  // On tablet/desktop, push content to make room for the sidebar.
  // Mobile uses BottomTabBar, no margin needed.
  const marginLeft =
    !isPublicRoute && tier !== 'mobile'
      ? isExpanded
        ? SIDEBAR_EXPANDED_W
        : SIDEBAR_COLLAPSED_W
      : 0;

  return (
    <>
      {!isPublicRoute && <Sidebar />}
      <motion.div
        animate={{ marginLeft }}
        transition={shouldReduceMotion ? { duration: 0 } : SPRING}
      >
        {children}
      </motion.div>
      {!isPublicRoute && <BottomTabBar />}
    </>
  );
}
