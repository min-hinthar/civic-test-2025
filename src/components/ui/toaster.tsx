'use client';

import { ReactNode } from 'react';
import { AnimatePresence } from 'motion/react';
import { Toast, ToastProvider } from './Toast';
import { useToast, useToastState, ToastContext } from './use-toast';

/**
 * Toast context provider - manages toast state.
 * Place this at the root of your app.
 */
export function ToastContextProvider({ children }: { children: ReactNode }) {
  const toastState = useToastState();

  return <ToastContext.Provider value={toastState}>{children}</ToastContext.Provider>;
}

function ToasterContent() {
  const { toasts, dismiss } = useToast();

  return (
    <AnimatePresence mode="popLayout">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          id={toast.id}
          open={true}
          onOpenChange={open => {
            if (!open) dismiss(toast.id);
          }}
          title={toast.title}
          titleMy={toast.titleMy}
          description={toast.description}
          descriptionMy={toast.descriptionMy}
          variant={toast.variant}
          duration={toast.duration}
        />
      ))}
    </AnimatePresence>
  );
}

/**
 * Toaster component - renders all active toasts.
 * Must be placed inside ToastContextProvider.
 */
export function Toaster() {
  return (
    <ToastProvider>
      <ToasterContent />
    </ToastProvider>
  );
}

/**
 * Combined provider and toaster for easy setup.
 * Wrap your app with this.
 */
export function ToastSetup({ children }: { children: React.ReactNode }) {
  return (
    <ToastContextProvider>
      {children}
      <Toaster />
    </ToastContextProvider>
  );
}

export default Toaster;
