'use client';

/**
 * OfflineBanner - Persistent offline/reconnecting/back-online notification banner.
 *
 * Three states:
 * 1. offline: Persistent banner with WifiOff icon + bilingual message
 * 2. reconnecting: When navigator.onLine transitions to true, shows "Reconnecting..."
 * 3. back-online: "Back online!" with checkmark, auto-dismisses after 3s
 *
 * Positioned below GlassHeader, uses muted palette (no red/amber per user decision).
 * Respects reduced motion preference.
 *
 * Uses the React "adjust state when props change" pattern for synchronous isOnline
 * transitions, with timers (in effects) only for delayed state changes.
 */

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WifiOff, Wifi, Check } from 'lucide-react';
import { useOffline } from '@/contexts/OfflineContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';

type BannerState = 'offline' | 'reconnecting' | 'back-online' | 'hidden';

const MESSAGES = {
  offline: {
    en: "You're offline -- some features may be limited",
    my: '\u1021\u103D\u1014\u103A\u101C\u102D\u102F\u1004\u103A\u1038\u1019\u101B\u103E\u102D\u1015\u102B -- \u1021\u1001\u103B\u102D\u102F\u1037\u1021\u1001\u103B\u102D\u102F\u1037\u101C\u102F\u1015\u103A\u1006\u1031\u102C\u1004\u103A\u1001\u103B\u1000\u103A\u1019\u103B\u102C\u1038 \u1000\u1014\u103A\u1037\u101E\u1010\u103A\u1014\u102D\u102F\u1004\u103A\u1015\u102B\u101E\u100A\u103A',
  },
  reconnecting: {
    en: 'Reconnecting...',
    my: '\u1015\u103C\u1014\u103A\u1001\u103B\u102D\u1010\u103A\u1006\u1000\u103A\u1014\u1031\u1015\u102B\u101E\u100A\u103A...',
  },
  backOnline: {
    en: 'Back online!',
    my: '\u1021\u103D\u1014\u103A\u101C\u102D\u102F\u1004\u103A\u1038\u1015\u103C\u1014\u103A\u101B\u101B\u103E\u102D\u1015\u103C\u102E!',
  },
};

/** Auto-dismiss delay for back-online state (ms) */
const BACK_ONLINE_DISMISS_MS = 3000;

/** Simulated reconnection delay before showing "back online" (ms) */
const RECONNECTING_DELAY_MS = 1500;

export function OfflineBanner() {
  const { isOnline } = useOffline();
  const { showBurmese } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  const [bannerState, setBannerState] = useState<BannerState>(() =>
    isOnline ? 'hidden' : 'offline'
  );
  const [wasEverOffline, setWasEverOffline] = useState(!isOnline);

  // Track previous isOnline value for "adjust state when props change" pattern
  const [prevIsOnline, setPrevIsOnline] = useState(isOnline);

  // Synchronous state adjustment on isOnline prop change (React-approved pattern)
  if (isOnline !== prevIsOnline) {
    setPrevIsOnline(isOnline);
    if (!isOnline) {
      // Went offline
      setBannerState('offline');
      setWasEverOffline(true);
    } else if (wasEverOffline) {
      // Came back online after being offline -> reconnecting
      setBannerState('reconnecting');
    }
  }

  // Timer: reconnecting -> back-online after delay
  useEffect(() => {
    if (bannerState !== 'reconnecting') return;

    const timer = setTimeout(() => {
      setBannerState('back-online');
    }, RECONNECTING_DELAY_MS);

    return () => clearTimeout(timer);
  }, [bannerState]);

  // Timer: auto-dismiss back-online after delay
  useEffect(() => {
    if (bannerState !== 'back-online') return;

    const timer = setTimeout(() => {
      setBannerState('hidden');
      setWasEverOffline(false);
    }, BACK_ONLINE_DISMISS_MS);

    return () => clearTimeout(timer);
  }, [bannerState]);

  // Derive icon and message from banner state (no callbacks needed)
  const icon = useMemo(() => {
    switch (bannerState) {
      case 'offline':
        return <WifiOff className="h-4 w-4 flex-shrink-0" />;
      case 'reconnecting':
        return <Wifi className="h-4 w-4 flex-shrink-0 animate-pulse" />;
      case 'back-online':
        return <Check className="h-4 w-4 flex-shrink-0" />;
      default:
        return null;
    }
  }, [bannerState]);

  const message = useMemo(() => {
    switch (bannerState) {
      case 'offline':
        return MESSAGES.offline;
      case 'reconnecting':
        return MESSAGES.reconnecting;
      case 'back-online':
        return MESSAGES.backOnline;
      default:
        return null;
    }
  }, [bannerState]);

  return (
    <AnimatePresence>
      {bannerState !== 'hidden' && message && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, height: 0 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, height: 'auto' }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
          transition={
            shouldReduceMotion ? { duration: 0.15 } : { duration: 0.3, ease: 'easeInOut' }
          }
          className="z-40 overflow-hidden"
        >
          <div
            className={`flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium ${
              bannerState === 'back-online'
                ? 'bg-primary-subtle text-primary'
                : 'bg-muted/60 text-muted-foreground'
            }`}
          >
            {icon}
            <span>{message.en}</span>
            {showBurmese && <span className="font-myanmar text-xs opacity-80">{message.my}</span>}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
