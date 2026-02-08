'use client';

import type { TooltipRenderProps } from 'react-joyride';
import { motion } from 'motion/react';

/**
 * Custom react-joyride tooltip with Duolingo-inspired styling.
 *
 * Features:
 * - Progress dots showing current step position
 * - 3D chunky Next button matching app Button component
 * - Skip button always visible at every step
 * - Smooth entry animation via motion.div
 * - Spreads tooltipProps on root element (required ref for positioning)
 */
export function TourTooltip({
  backProps,
  continuous,
  index,
  isLastStep,
  primaryProps,
  skipProps,
  step,
  size,
  tooltipProps,
}: TooltipRenderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      {...tooltipProps}
      className="bg-card rounded-2xl shadow-2xl p-5 max-w-sm border border-border/60"
    >
      {/* Step content */}
      {step.content && <div className="mb-4">{step.content}</div>}

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1.5 mb-4">
        {Array.from({ length: size }).map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-200 ${
              i === index
                ? 'w-6 bg-primary'
                : i < index
                  ? 'w-2 bg-primary/40'
                  : 'w-2 bg-muted-foreground/20'
            }`}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        {/* Skip button - always visible */}
        <button
          {...skipProps}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md"
        >
          Skip tour
        </button>

        <div className="flex items-center gap-2">
          {/* Back button (after first step) */}
          {index > 0 && (
            <button
              {...backProps}
              className="inline-flex items-center justify-center rounded-xl border-2 border-primary/30 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/10 transition-colors min-h-[36px]"
            >
              Back
            </button>
          )}

          {/* Next / Finish button with 3D chunky style */}
          {continuous && (
            <button
              {...primaryProps}
              className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2 text-sm font-bold text-primary-foreground shadow-[0_4px_0_hsl(var(--primary-700))] hover:shadow-[0_4px_0_hsl(var(--primary-800))] active:shadow-[0_1px_0_hsl(var(--primary-800))] active:translate-y-[3px] transition-[box-shadow,transform] duration-100 min-h-[36px]"
            >
              {isLastStep ? 'Finish' : 'Next'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
