'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import clsx from 'clsx';
import { X } from 'lucide-react';
import type { BilingualMessage } from '@/lib/errorSanitizer';

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
  success: 'bg-green-600 text-white border-green-700',
  info: 'bg-blue-600 text-white border-blue-700',
  warning: 'bg-warning-500 text-white border-warning-600',
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
      className="pointer-events-none fixed top-4 right-4 z-[9999] flex max-w-sm flex-col gap-3"
      aria-live="assertive"
      aria-atomic="true"
    >
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

/**
 * Individual toast component with auto-dismiss and animations.
 */
function Toast({ toast, onDismiss }: { toast: ToastInstance; onDismiss: (id: string) => void }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Animate in on mount
  useEffect(() => {
    // Small delay to trigger CSS transition
    const showTimer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(showTimer);
  }, []);

  // Auto-dismiss after duration
  useEffect(() => {
    const dismissTimer = setTimeout(() => {
      setIsExiting(true);
      // Wait for exit animation before removing
      setTimeout(() => onDismiss(toast.id), 300);
    }, toast.duration);

    return () => clearTimeout(dismissTimer);
  }, [toast.id, toast.duration, onDismiss]);

  const handleManualDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  return (
    <div
      role="alert"
      className={clsx(
        // Base styles
        'pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg',
        // Transition styles
        'transform transition-all duration-300 ease-out',
        // Type-specific styles
        typeStyles[toast.type],
        // Animation states
        isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      {/* Icon */}
      <span className="flex-shrink-0 text-lg" aria-hidden="true">
        {typeIcons[toast.type]}
      </span>

      {/* Message content - English on top, Burmese below */}
      <div className="min-w-0 flex-1">
        <p className="font-medium leading-snug">{toast.message.en}</p>
        <p className="font-myanmar mt-1 text-sm leading-snug opacity-90">{toast.message.my}</p>
      </div>

      {/* Dismiss button */}
      <button
        type="button"
        onClick={handleManualDismiss}
        className="flex-shrink-0 rounded-full p-1 opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-white focus:outline-none"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/**
 * Re-export BilingualMessage type for convenience.
 */
export type { BilingualMessage };
