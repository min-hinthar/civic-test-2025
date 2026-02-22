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
import { useFocusOnNavigation } from '@/hooks/useFocusOnNavigation';
import { Sidebar } from './Sidebar';
import { BottomTabBar } from './BottomTabBar';
import { OfflineBanner } from '@/components/pwa/OfflineBanner';
import { TipJarWidget } from '@/components/TipJarWidget';

const SPRING = { type: 'spring' as const, stiffness: 300, damping: 24 };

interface NavigationShellProps {
  children: ReactNode;
}

export function NavigationShell({ children }: NavigationShellProps) {
  const location = useLocation();
  const { isExpanded, tier } = useNavigation();
  const shouldReduceMotion = useReducedMotion();
  useFocusOnNavigation();
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
      {/* Skip-to-content link: first focusable element for keyboard/screen reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-white focus:shadow-lg"
      >
        Skip to content
      </a>
      {!isPublicRoute && <Sidebar />}
      <motion.div
        id="main-content"
        tabIndex={-1}
        animate={{ marginLeft }}
        transition={shouldReduceMotion ? { duration: 0.15, ease: 'easeOut' } : SPRING}
        className="outline-none"
      >
        <OfflineBanner />
        {children}
      </motion.div>
      {!isPublicRoute && <BottomTabBar />}
      {!isPublicRoute && (
        <TipJarWidget
          mode="floating"
          username="minsanity"
          position="bottom-right"
          xMargin={18}
          yMargin={18}
          message="Support this project 💖"
        />
      )}
    </>
  );
}
