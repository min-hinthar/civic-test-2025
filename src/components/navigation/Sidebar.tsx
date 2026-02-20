'use client';

/**
 * Sidebar -- Desktop/tablet left navigation.
 *
 * VS Code/Linear-inspired sidebar with glass-morphism, spring animations,
 * responsive collapse behavior, and full morph animation.
 *
 * Hidden below md breakpoint (`hidden md:flex`).
 * Desktop (>=1280px): auto-expanded. Tablet (768-1279px): auto-collapsed icon-rail.
 * Always visible on md+ (scroll-hide only applies to mobile BottomTabBar).
 */

import { useCallback, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon, LogOut, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';

import { NAV_TABS, HIDDEN_ROUTES, SIDEBAR_EXPANDED_W, SIDEBAR_COLLAPSED_W } from './navConfig';
import { NavItem } from './NavItem';
import { useNavigation } from './NavigationProvider';
import { useLanguage } from '@/contexts/LanguageContext';
import { useThemeContext } from '@/contexts/ThemeContext';
import { FlagToggle } from '@/components/ui/FlagToggle';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/BilingualToast';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { hapticLight } from '@/lib/haptics';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SPRING_CONFIG = { type: 'spring' as const, stiffness: 300, damping: 24 };
const TOOLTIP_KEY = 'civic-test-lang-tooltip-shown';

// ---------------------------------------------------------------------------
// Sidebar component
// ---------------------------------------------------------------------------

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    isExpanded,
    setExpanded,
    toggleSidebar,
    tier,
    isLocked,
    lockMessage,
    badges,
    sidebarRef,
  } = useNavigation();
  const { showBurmese } = useLanguage();
  const { theme, toggleTheme } = useThemeContext();
  const { user, logout } = useAuth();
  const { showWarning } = useToast();
  const shouldReduceMotion = useReducedMotion();
  const spring = shouldReduceMotion ? { duration: 0.15, ease: 'easeOut' as const } : SPRING_CONFIG;

  // --- First-time tooltip ---
  const [showTooltip, setShowTooltip] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem(TOOLTIP_KEY);
  });

  useEffect(() => {
    if (!showTooltip) return;
    const timer = setTimeout(() => {
      setShowTooltip(false);
      localStorage.setItem(TOOLTIP_KEY, 'true');
    }, 5000);
    return () => clearTimeout(timer);
  }, [showTooltip]);

  // --- Locked tap handler ---
  const handleLockedTap = useCallback(() => {
    showWarning({
      en: lockMessage ?? 'Complete or exit the test first',
      my:
        lockMessage ??
        '\u1005\u102C\u1019\u1031\u1038\u1015\u103D\u1032\u1000\u102D\u102F \u1021\u101B\u1004\u103A \u1015\u103C\u102E\u1038\u1006\u102F\u1036\u1038 \u101E\u102D\u102F\u1037\u1019\u101F\u102F\u1010\u103A \u1011\u103D\u1000\u103A\u1015\u102B',
    });
  }, [showWarning, lockMessage]);

  // --- Tablet tap behavior: expand first, don't navigate ---
  const handleNavItemClick = useCallback(() => {
    if (tier === 'tablet' && !isExpanded) {
      setExpanded(true);
    }
  }, [tier, isExpanded, setExpanded]);

  // --- Sign out ---
  const handleSignOut = useCallback(() => {
    hapticLight();
    logout().then(() => navigate('/'));
  }, [logout, navigate]);

  // --- Hide on public/auth routes ---
  if (HIDDEN_ROUTES.includes(location.pathname)) {
    return null;
  }

  const ThemeIcon = theme === 'dark' ? Sun : Moon;

  return (
    <motion.aside
      ref={sidebarRef}
      animate={{ width: isExpanded ? SIDEBAR_EXPANDED_W : SIDEBAR_COLLAPSED_W }}
      transition={spring}
      className="glass-heavy prismatic-border glass-nav rounded-none fixed left-0 top-0 bottom-0 z-40 hidden md:flex flex-col overflow-hidden"
      aria-label="Sidebar navigation"
    >
      {/* --- Header: Logo --- */}
      <div className="flex items-center px-4 py-4 min-h-[56px]">
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20 text-primary font-extrabold text-sm shrink-0">
          CTP
        </span>
        <AnimatePresence>
          {isExpanded && (
            <motion.span
              key="logo-text"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={spring}
              className="ml-3 font-extrabold text-foreground text-sm whitespace-nowrap overflow-hidden"
            >
              Civic Test Prep
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* --- Separator --- */}
      <div className="h-px bg-border/40 mx-3" />

      {/* --- Lock warning banner --- */}
      <AnimatePresence>
        {isLocked && (
          <motion.div
            key="lock-banner"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={spring}
            className="flex items-center gap-2 px-3 py-2 mx-2 mt-2 rounded-lg bg-warning/15 text-warning overflow-hidden"
          >
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {isExpanded && <span className="text-xs font-medium truncate">Test in progress</span>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Nav items --- */}
      <nav className="flex flex-col gap-1 px-2 py-3" aria-label="Main">
        {NAV_TABS.map(tab => {
          const isActive =
            location.pathname === tab.href ||
            (tab.href === '/study' && location.pathname.startsWith('/study')) ||
            (tab.href === '/hub' && location.pathname.startsWith('/hub'));

          return (
            <motion.div
              key={tab.id}
              whileTap={
                isLocked && !isActive && !shouldReduceMotion
                  ? { x: [0, -6, 6, -4, 4, 0], transition: { duration: 0.4 } }
                  : undefined
              }
            >
              <NavItem
                tab={tab}
                isActive={isActive}
                isLocked={isLocked && !isActive}
                showBurmese={showBurmese}
                variant={isExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}
                badges={badges}
                onLockedTap={handleLockedTap}
                onClick={tier === 'tablet' && !isExpanded ? handleNavItemClick : undefined}
              />
            </motion.div>
          );
        })}
      </nav>

      {/* --- Separator --- */}
      <div className="h-px bg-border/40 mx-3" />

      {/* --- Utility controls --- */}
      <div className="flex flex-col gap-1 px-2 py-3">
        {/* Language toggle -- dual flag */}
        <div className={isExpanded ? 'relative px-3 py-2' : 'flex justify-center py-2'}>
          <FlagToggle compact={!isExpanded} vertical={!isExpanded} />
          {showTooltip && isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 whitespace-nowrap rounded-lg bg-foreground text-background px-3 py-1.5 text-xs font-medium shadow-lg"
            >
              Switch language mode
              <span className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-4 border-transparent border-r-foreground" />
            </motion.div>
          )}
        </div>

        {/* Theme toggle */}
        <SidebarUtilityButton
          icon={ThemeIcon}
          label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          isExpanded={isExpanded}
          onClick={toggleTheme}
          tooltip={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          spring={spring}
        />

        {/* Logout */}
        {user && (
          <SidebarUtilityButton
            icon={LogOut}
            label="Sign Out"
            isExpanded={isExpanded}
            onClick={handleSignOut}
            tooltip="Sign Out"
            destructive
            spring={spring}
          />
        )}
      </div>

      {/* --- Spacer --- */}
      <div className="flex-1" />

      {/* --- Collapse toggle --- */}
      <div className="px-2 py-3">
        <button
          type="button"
          onClick={() => {
            hapticLight();
            toggleSidebar();
          }}
          className="flex items-center justify-center w-full h-10 rounded-full text-muted-foreground hover:bg-primary/10 hover:text-foreground transition-colors group/collapse"
          data-tooltip={!isExpanded ? 'Expand sidebar' : undefined}
          aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isExpanded ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                key="collapse-text"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={spring}
                className="ml-2 text-sm whitespace-nowrap overflow-hidden"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}

// ---------------------------------------------------------------------------
// Sidebar utility button (language, theme, logout)
// ---------------------------------------------------------------------------

interface SidebarUtilityButtonProps {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  isExpanded: boolean;
  onClick: (event?: React.MouseEvent) => void;
  tooltip: string;
  destructive?: boolean;
  spring: Record<string, unknown>;
}

function SidebarUtilityButton({
  icon: Icon,
  label,
  isExpanded,
  onClick,
  tooltip,
  destructive,
  spring,
}: SidebarUtilityButtonProps) {
  const colorClass = destructive
    ? 'text-destructive/70 hover:text-destructive hover:bg-destructive/10'
    : 'text-muted-foreground hover:text-foreground hover:bg-primary/10';

  return (
    <button
      type="button"
      onClick={e => {
        hapticLight();
        onClick(e);
      }}
      className={`flex items-center w-full rounded-full transition-colors ${colorClass} ${
        isExpanded ? 'gap-3 py-2.5 px-3' : 'justify-center w-12 h-12 mx-auto group/navitem'
      }`}
      data-tooltip={!isExpanded ? tooltip : undefined}
      aria-label={tooltip}
    >
      <Icon className="h-6 w-6 shrink-0" strokeWidth={2} />
      <AnimatePresence>
        {isExpanded && (
          <motion.span
            key={`util-label-${label}`}
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={spring}
            className="text-sm whitespace-nowrap overflow-hidden"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
