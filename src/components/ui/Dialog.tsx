'use client';

import {
  ReactNode,
  forwardRef,
  createContext,
  useContext,
  useRef,
  useCallback,
  useState,
  useEffect,
} from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { SPRING_BOUNCY } from '@/lib/motion-config';
import { playDismiss } from '@/lib/audio/soundEffects';

// ---------------------------------------------------------------------------
// Internal context to thread open state from Dialog root to DialogContent
// ---------------------------------------------------------------------------

interface DialogInternalState {
  open: boolean;
  triggerRef: React.RefObject<HTMLElement | null>;
}

const DialogInternalContext = createContext<DialogInternalState | null>(null);

function useDialogInternal(): DialogInternalState {
  const ctx = useContext(DialogInternalContext);
  if (!ctx) throw new Error('DialogContent must be inside Dialog');
  return ctx;
}

// ---------------------------------------------------------------------------
// Dialog root
// ---------------------------------------------------------------------------

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

/**
 * Accessible modal dialog with animated enter/exit transitions.
 *
 * Features:
 * - WAI-ARIA compliant (DialogPrimitive handles all accessibility)
 * - Focus trapping
 * - Keyboard navigation (Escape to close)
 * - Spring enter animation + fade/scale exit animation
 * - Respects prefers-reduced-motion
 * - Audio dismiss cue on close
 * - Exit scales toward trigger button via dynamic transformOrigin
 */
export function Dialog({ open, onOpenChange, children }: DialogProps) {
  const triggerRef = useRef<HTMLElement | null>(null);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen && open) {
        playDismiss();
      }
      onOpenChange(newOpen);
    },
    [open, onOpenChange]
  );

  return (
    <DialogInternalContext.Provider value={{ open, triggerRef }}>
      <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
        {children}
      </DialogPrimitive.Root>
    </DialogInternalContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// DialogTrigger — captures trigger ref for transformOrigin targeting
// ---------------------------------------------------------------------------

export const DialogTrigger = forwardRef<HTMLButtonElement, DialogPrimitive.DialogTriggerProps>(
  (props, ref) => {
    const { triggerRef } = useDialogInternal();

    const combinedRef = useCallback(
      (node: HTMLButtonElement | null) => {
        triggerRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      },
      [ref, triggerRef]
    );

    return <DialogPrimitive.Trigger ref={combinedRef} {...props} />;
  }
);
DialogTrigger.displayName = 'DialogTrigger';

export const DialogPortal = DialogPrimitive.Portal;

export const DialogClose = DialogPrimitive.Close;

// ---------------------------------------------------------------------------
// Dialog overlay (backdrop) with exit animation
// ---------------------------------------------------------------------------

const DialogOverlayInner = forwardRef<HTMLDivElement, DialogPrimitive.DialogOverlayProps>(
  ({ className, ...props }, ref) => {
    const shouldReduceMotion = useReducedMotion();

    return (
      <DialogPrimitive.Overlay forceMount asChild ref={ref} {...props}>
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={shouldReduceMotion ? undefined : { opacity: 0, transition: { duration: 0.15 } }}
          transition={{ duration: 0.2 }}
          className={clsx('fixed inset-0 z-50 bg-black/50 backdrop-blur-sm', className)}
        />
      </DialogPrimitive.Overlay>
    );
  }
);
DialogOverlayInner.displayName = 'DialogOverlayInner';

// Keep the original export name for backward compatibility if used directly
export const DialogOverlay = DialogOverlayInner;

// ---------------------------------------------------------------------------
// Dialog content container with AnimatePresence exit animation
// ---------------------------------------------------------------------------

export const DialogContent = forwardRef<
  HTMLDivElement,
  DialogPrimitive.DialogContentProps & { showCloseButton?: boolean }
>(({ className, children, showCloseButton = true, ...props }, ref) => {
  const shouldReduceMotion = useReducedMotion();
  const { open, triggerRef } = useDialogInternal();

  // Compute transformOrigin from trigger element position.
  // Use state + effect to avoid reading ref.current during render (React Compiler rule).
  const [transformOrigin, setTransformOrigin] = useState('center center');

  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      setTransformOrigin(`${x}px ${y}px`);
    } else if (open) {
      setTransformOrigin('center center');
    }
  }, [open, triggerRef]);

  return (
    <AnimatePresence>
      {open && (
        <DialogPortal forceMount>
          <DialogOverlayInner />
          <DialogPrimitive.Content forceMount asChild ref={ref} {...props}>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={
                  shouldReduceMotion
                    ? undefined
                    : {
                        opacity: 0,
                        scale: 0.95,
                        transition: { duration: 0.15, ease: 'easeIn' },
                      }
                }
                transition={SPRING_BOUNCY}
                style={{ transformOrigin }}
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
      )}
    </AnimatePresence>
  );
});
DialogContent.displayName = 'DialogContent';

// ---------------------------------------------------------------------------
// Dialog title (required for accessibility)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Dialog description
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Dialog footer for action buttons
// ---------------------------------------------------------------------------

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
