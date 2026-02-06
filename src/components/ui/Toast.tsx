'use client';

import { forwardRef, ReactNode } from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { motion } from 'motion/react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// Toast variants for styling
const toastVariants = {
  default: 'bg-card border-border',
  success: 'bg-success-50 border-success-500 dark:bg-success-500/10',
  warning: 'bg-warning-50 border-warning-500 dark:bg-warning-500/10',
  destructive: 'bg-destructive/10 border-destructive',
};

const iconMap = {
  default: Info,
  success: CheckCircle,
  warning: AlertCircle,
  destructive: AlertCircle,
};

const iconColorMap = {
  default: 'text-primary-500',
  success: 'text-success-500',
  warning: 'text-warning-500',
  destructive: 'text-destructive',
};

export type ToastVariant = keyof typeof toastVariants;

export interface ToastProps {
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  titleMy?: string; // Burmese title
  description?: string;
  descriptionMy?: string; // Burmese description
  variant?: ToastVariant;
  duration?: number;
}

/**
 * Individual toast item with slide-up animation.
 */
export const Toast = forwardRef<HTMLLIElement, ToastProps>(
  (
    {
      id: _id, // Reserved for future use (unique identification in lists)
      open,
      onOpenChange,
      title,
      titleMy,
      description,
      descriptionMy,
      variant = 'default',
      duration = 5000,
    },
    ref
  ) => {
    const shouldReduceMotion = useReducedMotion();
    const Icon = iconMap[variant];

    return (
      <ToastPrimitive.Root
        ref={ref}
        open={open}
        onOpenChange={onOpenChange}
        duration={duration}
        asChild
        forceMount
      >
        <motion.li
          initial={shouldReduceMotion ? { opacity: 1 } : { y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className={clsx(
            // Layout
            'relative flex items-start gap-3 p-4',
            // Styling
            'rounded-2xl border shadow-lg',
            // Width
            'w-full max-w-sm',
            // Variant
            toastVariants[variant]
          )}
        >
          <Icon className={clsx('h-5 w-5 mt-0.5 shrink-0', iconColorMap[variant])} />
          <div className="flex-1 min-w-0">
            {(title || titleMy) && (
              <ToastPrimitive.Title className="font-semibold text-foreground">
                {title}
                {titleMy && (
                  <span className="block text-sm font-normal text-muted-foreground font-myanmar mt-0.5">
                    {titleMy}
                  </span>
                )}
              </ToastPrimitive.Title>
            )}
            {(description || descriptionMy) && (
              <ToastPrimitive.Description className="mt-1 text-sm text-muted-foreground">
                {description}
                {descriptionMy && (
                  <span className="block font-myanmar mt-0.5">{descriptionMy}</span>
                )}
              </ToastPrimitive.Description>
            )}
          </div>
          <ToastPrimitive.Close
            className={clsx(
              'rounded-full p-1',
              'text-muted-foreground hover:text-foreground',
              'hover:bg-muted/50',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
              'transition-colors'
            )}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </ToastPrimitive.Close>
        </motion.li>
      </ToastPrimitive.Root>
    );
  }
);
Toast.displayName = 'Toast';

/**
 * Toast viewport (container for all toasts)
 * Positioned at bottom center per user decision
 */
export function ToastViewport() {
  return (
    <ToastPrimitive.Viewport
      className={clsx(
        'fixed bottom-4 left-1/2 -translate-x-1/2 z-[100]',
        'flex flex-col gap-2',
        'w-full max-w-sm px-4',
        'outline-none'
      )}
    />
  );
}

/**
 * Toast provider wrapper
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <ToastPrimitive.Provider swipeDirection="down">
      {children}
      <ToastViewport />
    </ToastPrimitive.Provider>
  );
}
