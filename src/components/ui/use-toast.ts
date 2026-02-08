'use client';

import { useState, useCallback, createContext, useContext } from 'react';
import type { ToastVariant } from './Toast';

export interface ToastMessage {
  id: string;
  title?: string;
  titleMy?: string;
  description?: string;
  descriptionMy?: string;
  variant?: ToastVariant;
  duration?: number;
}

export interface ToastContextValue {
  toasts: ToastMessage[];
  toast: (message: Omit<ToastMessage, 'id'>) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

let toastCount = 0;

/**
 * Hook to manage toast state. Used by ToastContextProvider.
 */
export function useToastState() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback((message: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${++toastCount}`;
    setToasts(prev => [...prev, { ...message, id }]);
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  return { toasts, toast, dismiss, dismissAll };
}

/**
 * Hook to access toast context.
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastContextProvider');
  }
  return context;
}

// Legacy compatibility - export toast function that works with existing code
// This will be replaced once we integrate the new provider
export const toast = (_options: {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'warning';
}) => {
  // Legacy shim - this gets overridden by the context provider
  console.warn('Toast called outside of ToastContextProvider');
};
