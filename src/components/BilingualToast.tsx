'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { motion, useMotionValue, useTransform, useAnimate } from 'motion/react';
import type { PanInfo } from 'motion/react';
import clsx from 'clsx';
import { X } from 'lucide-react';
import type { BilingualMessage } from '@/lib/errorSanitizer';
import { useLanguage } from '@/contexts/LanguageContext';
import { hapticLight, hapticMedium } from '@/lib/haptics';

/**
 * Toast types for different notification styles.
 */
export type ToastType = 'error' | 'success' | 'info' | 'warning';

/**
 * Internal toast instance with unique ID and metadata.
 */
interface ToastInstance {
  id: string;
  type: ToastType;
  message: BilingualMessage;
  duration: number;
}

/**
 * Toast context value exposed via useToast hook.
 */
interface ToastContextValue {
  /** Show an error toast with bilingual message */
  showError: (message: BilingualMessage) => string;
  /** Show a success toast with bilingual message */
  showSuccess: (message: BilingualMessage) => string;
  /** Show an info toast with bilingual message */
  showInfo: (message: BilingualMessage) => string;
  /** Show a warning toast with bilingual message (orange, non-data-loss errors) */
  showWarning: (message: BilingualMessage) => string;
  /** Dismiss a specific toast by ID */
  dismiss: (id: string) => void;
  /** Dismiss all toasts */
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Default toast durations in milliseconds.
 */
const DEFAULT_DURATIONS: Record<ToastType, number> = {
  error: 6000, // Errors stay longer so users can read both languages
  success: 4000,
  info: 5000,
  warning: 5000,
};

/**
 * Generate a unique ID for each toast.
 */
function generateId(): string {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Toast provider component that wraps the app.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastInstance[]>([]);

  const addToast = useCallback((type: ToastType, message: BilingualMessage): string => {
    const id = generateId();
    const toast: ToastInstance = {
      id,
      type,
      message,
      duration: DEFAULT_DURATIONS[type],
    };
    setToasts(prev => [...prev, toast]);
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const showError = useCallback(
    (message: BilingualMessage) => addToast('error', message),
    [addToast]
  );

  const showSuccess = useCallback(
    (message: BilingualMessage) => addToast('success', message),
    [addToast]
  );

  const showInfo = useCallback(
    (message: BilingualMessage) => addToast('info', message),
    [addToast]
  );

  const showWarning = useCallback(
    (message: BilingualMessage) => addToast('warning', message),
    [addToast]
  );

  const contextValue: ToastContextValue = {
    showError,
    showSuccess,
    showInfo,
    showWarning,
    dismiss,
    dismissAll,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

/**
 * Hook to access toast functions.
 * Must be used within a ToastProvider.
 */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

/**
 * Styling configuration for each toast type.
 */
const typeStyles: Record<ToastType, string> = {
  error: 'bg-destructive text-white border-destructive/80',
  success: 'bg-success text-white border-success/80',
  info: 'bg-primary text-white border-primary/80',
  warning: 'bg-warning text-white border-warning/80',
};

/**
 * Icons for each toast type (using CSS for simplicity).
 */
const typeIcons: Record<ToastType, string> = {
  error: '⚠️', // Warning sign
  success: '✓', // Check mark
  info: 'ℹ️', // Info symbol
  warning: '⚠', // Warning triangle
};

/**
 * Container that renders all active toasts.
 * Mobile: bottom-center above tab bar (flex-col-reverse so newest is closest to thumb).
 * Desktop (sm+): top-right with normal flex-col.
 */
function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastInstance[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      className="pointer-events-none fixed left-4 right-4 z-[9999] flex flex-col-reverse gap-3 sm:top-4 sm:bottom-auto sm:left-auto sm:max-w-sm sm:flex-col"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 5rem)' }}
      aria-live="polite"
    >
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

/** Dismiss detection thresholds */
const DISMISS_THRESHOLD = 100; // px distance
const VELOCITY_THRESHOLD = 500; // px/s flick speed

/**
 * Individual toast component with swipe-to-dismiss via motion/react drag.
 *
 * Features:
 * - Horizontal drag with progressive opacity fade
 * - Velocity+offset dismiss detection (fast flick OR far drag)
 * - Spring-back on partial swipe
 * - Auto-dismiss timer that pauses while dragging
 * - Haptic feedback at threshold crossing and on dismiss
 * - Desktop X button (hover-revealed)
 * - Ghost blur trail on dismiss animation
 */
function Toast({ toast, onDismiss }: { toast: ToastInstance; onDismiss: (id: string) => void }) {
  const { showBurmese } = useLanguage();

  // Motion values for drag -- start off-screen for entrance animation
  const x = useMotionValue(300);
  const opacity = useTransform(x, [-150, 0, 150], [0, 1, 0]);
  const [scope, animate] = useAnimate<HTMLDivElement>();

  // Auto-dismiss timer management
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef(0);
  const remainingRef = useRef(toast.duration);

  // Haptic threshold tracking
  const thresholdCrossedRef = useRef(false);

  // Track whether dismiss animation has fired to prevent double-dismiss
  const isDismissingRef = useRef(false);

  // Start or resume auto-dismiss timer
  const startTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      if (isDismissingRef.current) return;
      isDismissingRef.current = true;
      // Animate out to the right for auto-dismiss
      if (scope.current) {
        animate(
          scope.current,
          { x: 400, opacity: 0, filter: 'blur(2px)' },
          { type: 'spring', stiffness: 200, damping: 30 }
        )
          .then(() => onDismiss(toast.id))
          .catch(() => onDismiss(toast.id));
      } else {
        onDismiss(toast.id);
      }
    }, remainingRef.current);
  }, [animate, onDismiss, scope, toast.id]);

  // Pause auto-dismiss timer
  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const elapsed = Date.now() - startTimeRef.current;
    remainingRef.current = Math.max(0, remainingRef.current - elapsed);
  }, []);

  // Entrance animation: spring from off-screen to center
  useEffect(() => {
    if (scope.current) {
      animate(scope.current, { x: 0 }, { type: 'spring', stiffness: 400, damping: 30 }).then(
        () => {},
        () => {
          /* unmounted during entrance */
        }
      );
    }
  }, [animate, scope]);

  // Start auto-dismiss timer on mount
  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [startTimer]);

  // Track drag distance for haptic threshold feedback
  useEffect(() => {
    const unsubscribe = x.on('change', (latest: number) => {
      if (!thresholdCrossedRef.current && Math.abs(latest) > DISMISS_THRESHOLD) {
        thresholdCrossedRef.current = true;
        hapticLight();
      }
    });
    return () => unsubscribe();
  }, [x]);

  const handleDragStart = useCallback(() => {
    pauseTimer();
    thresholdCrossedRef.current = false;
  }, [pauseTimer]);

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      const { offset, velocity } = info;

      const isDismissed =
        Math.abs(offset.x) > DISMISS_THRESHOLD || Math.abs(velocity.x) > VELOCITY_THRESHOLD;

      if (isDismissed && !isDismissingRef.current) {
        isDismissingRef.current = true;
        hapticMedium();
        const exitX = offset.x > 0 ? 400 : -400;

        if (!scope.current) {
          onDismiss(toast.id);
          return;
        }

        animate(
          scope.current,
          { x: exitX, opacity: 0, filter: 'blur(2px)' },
          { type: 'spring', velocity: velocity.x, stiffness: 200, damping: 30 }
        )
          .then(() => onDismiss(toast.id))
          .catch(() => onDismiss(toast.id));
      } else {
        // Spring back to center
        if (scope.current) {
          animate(
            scope.current,
            { x: 0, opacity: 1 },
            { type: 'spring', stiffness: 500, damping: 30 }
          ).then(
            () => {},
            () => {
              /* unmounted */
            }
          );
        }
        // Resume auto-dismiss timer with remaining time
        startTimer();
      }
    },
    [animate, onDismiss, scope, startTimer, toast.id]
  );

  const handleManualDismiss = useCallback(() => {
    if (isDismissingRef.current) return;
    isDismissingRef.current = true;
    hapticMedium();
    if (scope.current) {
      animate(
        scope.current,
        { x: 400, opacity: 0, filter: 'blur(2px)' },
        { type: 'spring', stiffness: 200, damping: 30 }
      )
        .then(() => onDismiss(toast.id))
        .catch(() => onDismiss(toast.id));
    } else {
      onDismiss(toast.id);
    }
  }, [animate, onDismiss, scope, toast.id]);

  return (
    <motion.div
      ref={scope}
      style={{ x, opacity, touchAction: 'pan-y' }}
      drag="x"
      dragElastic={0.3}
      dragMomentum={false}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      role={toast.type === 'error' || toast.type === 'warning' ? 'alert' : 'status'}
      className={clsx(
        'group pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg',
        'cursor-grab active:cursor-grabbing',
        typeStyles[toast.type]
      )}
    >
      {/* Icon */}
      <span className="flex-shrink-0 text-lg" aria-hidden="true">
        {typeIcons[toast.type]}
      </span>

      {/* Message content - English on top, Burmese below */}
      <div className="min-w-0 flex-1">
        <p className="font-medium leading-snug">{toast.message.en}</p>
        {showBurmese && (
          <p className="font-myanmar mt-1 text-sm leading-snug text-muted-foreground">
            {toast.message.my}
          </p>
        )}
      </div>

      {/* Dismiss button -- opacity-0 by default, revealed on hover (desktop) */}
      <button
        type="button"
        onClick={handleManualDismiss}
        className="flex-shrink-0 rounded-full p-1 opacity-0 transition-opacity group-hover:opacity-70 hover:!opacity-100 focus:opacity-100 focus:ring-2 focus:ring-white focus:outline-none"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

/**
 * Re-export BilingualMessage type for convenience.
 */
export type { BilingualMessage };
