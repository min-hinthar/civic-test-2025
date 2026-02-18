/**
 * @deprecated Use FlagToggle from '@/components/ui/FlagToggle' instead.
 * This component will be removed after all consumers are migrated.
 * Kept temporarily for backward compatibility.
 */
'use client';

import { motion } from 'motion/react';
import { Languages } from 'lucide-react';
import { clsx } from 'clsx';
import { useLanguage } from '@/contexts/LanguageContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { SPRING_BOUNCY } from '@/lib/motion-config';

interface LanguageToggleProps {
  /** Size variant */
  size?: 'sm' | 'md';
  /** Show label */
  showLabel?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * Quick toggle for English-only practice mode.
 *
 * Features:
 * - Toggle between bilingual and english-only
 * - Visual indicator of current mode
 * - Tooltip explaining the feature
 * - Animated switch with spring physics
 * - 48px minimum touch target
 */
export function LanguageToggle({ size = 'md', showLabel = false, className }: LanguageToggleProps) {
  const { showBurmese, toggleMode } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  const sizeClasses = {
    sm: 'min-h-[48px] px-2',
    md: 'min-h-[48px] px-3',
  };

  return (
    <motion.button
      onClick={toggleMode}
      whileTap={{ scale: 0.9 }}
      transition={SPRING_BOUNCY}
      className={clsx(
        'relative inline-flex items-center gap-2 rounded-full',
        'bg-muted/50 hover:bg-muted transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        sizeClasses[size],
        className
      )}
      aria-label={
        showBurmese
          ? 'Language: Bilingual English and Burmese. Press to switch to English only.'
          : 'Language: English only. Press to switch to bilingual English and Burmese.'
      }
      title={
        showBurmese
          ? 'Currently: Bilingual (English + Burmese)\nClick for English-only practice'
          : 'Currently: English only (USCIS simulation)\nClick for bilingual mode'
      }
    >
      <Languages className="h-4 w-4 text-muted-foreground" />

      {/* Mode indicator */}
      <div className="flex items-center gap-1">
        <span
          className={clsx(
            'text-xs font-medium transition-colors',
            !showBurmese ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          EN
        </span>
        <div className="relative h-5 w-9 rounded-full bg-muted-foreground/20">
          <motion.div
            className="absolute top-0.5 h-4 w-4 rounded-full bg-primary shadow-sm"
            animate={{
              left: showBurmese ? 18 : 2,
            }}
            transition={shouldReduceMotion ? { duration: 0 } : SPRING_BOUNCY}
          />
        </div>
        <span
          className={clsx(
            'text-xs font-medium font-myanmar transition-colors',
            showBurmese ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          {'\u1019\u103C\u1014\u103A\u1019\u102C'}
        </span>
      </div>

      {showLabel && (
        <span className="hidden text-xs text-muted-foreground sm:inline">
          {showBurmese ? 'Bilingual' : 'English only'}
        </span>
      )}
    </motion.button>
  );
}

/**
 * Compact language toggle for mobile header.
 * Icon-only with dot indicator when in English-only mode.
 * 48px touch target with spring press feedback.
 */
export function LanguageToggleCompact({ className }: { className?: string }) {
  const { showBurmese, toggleMode } = useLanguage();

  return (
    <motion.button
      onClick={toggleMode}
      whileTap={{ scale: 0.9 }}
      transition={SPRING_BOUNCY}
      className={clsx(
        'relative flex h-12 w-12 items-center justify-center rounded-full',
        'bg-muted/50 hover:bg-muted transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
      aria-label={
        showBurmese
          ? 'Language: Bilingual English and Burmese. Press to switch to English only.'
          : 'Language: English only. Press to switch to bilingual English and Burmese.'
      }
    >
      <Languages className="h-5 w-5 text-muted-foreground" />
      {!showBurmese && (
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-background bg-warning" />
      )}
    </motion.button>
  );
}
