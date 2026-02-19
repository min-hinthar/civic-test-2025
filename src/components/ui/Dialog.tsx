'use client';

import { ReactNode, forwardRef } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { SPRING_BOUNCY } from '@/lib/motion-config';

// Animation variants for bottom-sheet style modal
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const contentVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

/**
 * Accessible modal dialog with bottom-sheet slide-up animation.
 *
 * Features:
 * - WAI-ARIA compliant (DialogPrimitive handles all accessibility)
 * - Focus trapping
 * - Keyboard navigation (Escape to close)
 * - Bottom-sheet slide-up animation
 * - Respects prefers-reduced-motion
 */
export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </DialogPrimitive.Root>
  );
}

export const DialogTrigger = DialogPrimitive.Trigger;

export const DialogPortal = DialogPrimitive.Portal;

export const DialogClose = DialogPrimitive.Close;

/**
 * Dialog overlay (backdrop)
 */
export const DialogOverlay = forwardRef<HTMLDivElement, DialogPrimitive.DialogOverlayProps>(
  ({ className, ...props }, ref) => {
    const shouldReduceMotion = useReducedMotion();

    return (
      <DialogPrimitive.Overlay asChild ref={ref} {...props}>
        <motion.div
          variants={overlayVariants}
          initial={shouldReduceMotion ? 'visible' : 'hidden'}
          animate="visible"
          exit={shouldReduceMotion ? 'visible' : 'hidden'}
          transition={{ duration: 0.2 }}
          className={clsx('fixed inset-0 z-50 bg-black/50 backdrop-blur-sm', className)}
        />
      </DialogPrimitive.Overlay>
    );
  }
);
DialogOverlay.displayName = 'DialogOverlay';

/**
 * Dialog content container
 */
export const DialogContent = forwardRef<
  HTMLDivElement,
  DialogPrimitive.DialogContentProps & { showCloseButton?: boolean }
>(({ className, children, showCloseButton = true, ...props }, ref) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content asChild ref={ref} {...props}>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <motion.div
            variants={contentVariants}
            initial={shouldReduceMotion ? 'visible' : 'hidden'}
            animate="visible"
            exit={shouldReduceMotion ? 'visible' : 'hidden'}
            transition={SPRING_BOUNCY}
            className={clsx(
              // Sizing & pointer restore
              'pointer-events-auto w-full max-w-lg max-h-[85vh] overflow-auto',
              // Styling — glass-heavy tier with prismatic border
              'rounded-2xl bg-card border border-border/60 p-6',
              'glass-heavy prismatic-border',
              'shadow-2xl shadow-black/20',
              // Focus
              'focus:outline-none',
              className
            )}
          >
            {children}
            {showCloseButton && (
              <DialogPrimitive.Close
                className={clsx(
                  'absolute right-3 top-3',
                  'rounded-full p-3 min-h-[44px] min-w-[44px] inline-flex items-center justify-center',
                  'text-muted-foreground hover:text-foreground',
                  'hover:bg-muted/50',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                  'transition-colors'
                )}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DialogPrimitive.Close>
            )}
          </motion.div>
        </div>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = 'DialogContent';

/**
 * Dialog title (required for accessibility)
 */
export const DialogTitle = forwardRef<HTMLHeadingElement, DialogPrimitive.DialogTitleProps>(
  ({ className, ...props }, ref) => (
    <DialogPrimitive.Title
      ref={ref}
      className={clsx('text-lg font-bold text-foreground', className)}
      {...props}
    />
  )
);
DialogTitle.displayName = 'DialogTitle';

/**
 * Dialog description
 */
export const DialogDescription = forwardRef<
  HTMLParagraphElement,
  DialogPrimitive.DialogDescriptionProps
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={clsx('mt-2 text-sm text-muted-foreground', className)}
    {...props}
  />
));
DialogDescription.displayName = 'DialogDescription';

/**
 * Dialog footer for action buttons
 */
export function DialogFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx('mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    >
      {children}
    </div>
  );
}
