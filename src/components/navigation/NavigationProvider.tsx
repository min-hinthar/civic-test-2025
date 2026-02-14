'use client';

/**
 * NavigationProvider -- Central context for navigation state.
 *
 * Provides sidebar expansion state, responsive tier, lock state,
 * scroll visibility, and badge data to all navigation components.
 *
 * This is the single source of truth for navigation behavior.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { useMediaTier } from './useMediaTier';
import type { MediaTier } from './useMediaTier';
import { useNavBadges } from './useNavBadges';
import type { NavBadges } from './navConfig';
import { useScrollDirection } from '@/lib/useScrollDirection';

// ---------------------------------------------------------------------------
// Context value interface
// ---------------------------------------------------------------------------

interface NavigationContextValue {
  isExpanded: boolean;
  setExpanded: (expanded: boolean) => void;
  toggleSidebar: () => void;
  tier: MediaTier;
  isLocked: boolean;
  lockMessage: string | null;
  setLock: (locked: boolean, message?: string) => void;
  navVisible: boolean;
  badges: NavBadges;
  sidebarRef: React.RefObject<HTMLElement | null>;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

// ---------------------------------------------------------------------------
// LocalStorage helpers
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'sidebar-expanded';

function loadSidebarPref(): boolean | null {
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    if (val === 'true') return true;
    if (val === 'false') return false;
    return null;
  } catch {
    return null;
  }
}

function saveSidebarPref(expanded: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, String(expanded));
  } catch {
    // localStorage not available
  }
}

/**
 * Compute default sidebar expansion state for a given tier.
 * Desktop defaults to expanded (or localStorage preference), others collapse.
 */
function getDefaultExpansion(tier: MediaTier): boolean {
  if (tier === 'desktop') {
    return loadSidebarPref() ?? true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface NavigationProviderProps {
  children: ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const tier = useMediaTier();
  const badges = useNavBadges();
  const navVisible = useScrollDirection();
  const sidebarRef = useRef<HTMLElement | null>(null);

  // Manual override: tracks { tier, expanded } when user manually toggles.
  // When tier changes, the override is cleared and we fall back to defaults.
  // Using a single state to avoid the "setState in effect" pattern.
  const [sidebarState, setSidebarState] = useState<{
    tier: MediaTier;
    expanded: boolean;
    isManual: boolean;
  }>(() => {
    const initialTier: MediaTier = (() => {
      if (typeof window === 'undefined') return 'mobile';
      const w = window.innerWidth;
      if (w >= 1280) return 'desktop';
      if (w >= 768) return 'tablet';
      return 'mobile';
    })();
    return {
      tier: initialTier,
      expanded: getDefaultExpansion(initialTier),
      isManual: false,
    };
  });

  // Derive isExpanded: if tier changed since last state, reset to default
  const isExpanded = useMemo(() => {
    if (sidebarState.tier !== tier) {
      // Tier has changed -- return default for new tier.
      // The state will catch up on next user interaction or via the sync below.
      return getDefaultExpansion(tier);
    }
    return sidebarState.expanded;
  }, [sidebarState, tier]);

  // Sync sidebarState.tier when tier changes (derived state pattern).
  // This uses the updater function form which is React Compiler safe
  // because the setState call is conditional and functional.
  if (sidebarState.tier !== tier) {
    setSidebarState({
      tier,
      expanded: getDefaultExpansion(tier),
      isManual: false,
    });
  }

  // Lock state
  const [isLocked, setIsLocked] = useState(false);
  const [lockMessage, setLockMessage] = useState<string | null>(null);

  const setExpanded = useCallback(
    (expanded: boolean) => {
      setSidebarState({ tier, expanded, isManual: true });
      saveSidebarPref(expanded);
    },
    [tier]
  );

  const toggleSidebar = useCallback(() => {
    setExpanded(!isExpanded);
  }, [isExpanded, setExpanded]);

  const setLock = useCallback((locked: boolean, message?: string) => {
    setIsLocked(locked);
    setLockMessage(locked ? (message ?? null) : null);
  }, []);

  // Click-outside handler: collapse sidebar on tablet when clicking outside
  useEffect(() => {
    if (!isExpanded || tier === 'desktop') return;

    const handlePointerDown = (e: PointerEvent) => {
      const sidebar = sidebarRef.current;
      if (sidebar && !sidebar.contains(e.target as Node)) {
        setSidebarState(prev => ({ ...prev, expanded: false, isManual: true }));
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isExpanded, tier]);

  // Memoize context value to prevent unnecessary re-renders
  const value: NavigationContextValue = useMemo(
    () => ({
      isExpanded,
      setExpanded,
      toggleSidebar,
      tier,
      isLocked,
      lockMessage,
      setLock,
      navVisible,
      badges,
      sidebarRef,
    }),
    [
      isExpanded,
      setExpanded,
      toggleSidebar,
      tier,
      isLocked,
      lockMessage,
      setLock,
      navVisible,
      badges,
    ]
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Hook to access navigation context.
 *
 * @throws Error if used outside NavigationProvider
 */
export function useNavigation(): NavigationContextValue {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error(
      'useNavigation must be used within a NavigationProvider. ' +
        'Wrap your app with <NavigationProvider> in AppShell.'
    );
  }
  return context;
}
