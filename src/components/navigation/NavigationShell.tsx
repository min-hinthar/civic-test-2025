'use client';

/**
 * NavigationShell -- Orchestrates which nav surface to show based on route.
 *
 * Renders Sidebar (md+) and BottomTabBar (below md) for all routes
 * except public/auth routes listed in HIDDEN_ROUTES.
 *
 * Both components internally handle their own responsive visibility:
 * - Sidebar: `hidden md:flex`
 * - BottomTabBar: `md:hidden`
 */

import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { HIDDEN_ROUTES } from './navConfig';
import { Sidebar } from './Sidebar';
import { BottomTabBar } from './BottomTabBar';

interface NavigationShellProps {
  children: ReactNode;
}

export function NavigationShell({ children }: NavigationShellProps) {
  const location = useLocation();
  const isPublicRoute = HIDDEN_ROUTES.includes(location.pathname);

  return (
    <>
      {!isPublicRoute && <Sidebar />}
      {children}
      {!isPublicRoute && <BottomTabBar />}
    </>
  );
}
