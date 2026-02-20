'use client';

import { type LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { useLanguage } from '@/contexts/LanguageContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Button } from '@/components/ui/Button';

export interface EmptyStateProps {
  /** Lucide icon component to display */
  icon: LucideIcon;
  /** Tailwind text color class for the icon (e.g., 'text-primary') */
  iconColor?: string;
  /** Bilingual title text */
  title: { en: string; my: string };
  /** Bilingual description text */
  description: { en: string; my: string };
  /** Optional CTA button */
  action?: {
    label: { en: string; my: string };
    onClick: () => void;
  };
  /** Additional CSS classes */
  className?: string;
}

/**
 * Reusable empty state component for screens with no data.
 *
 * Features:
 * - Duotone icon with configurable color and subtle pulse animation
 * - Bilingual title and description (English + Burmese when enabled)
 * - Optional CTA button with encouraging tone
 * - Respects reduced motion preference
 * - Vertically centered layout
 */
export function EmptyState({
  icon: Icon,
  iconColor = 'text-muted-foreground',
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const { showBurmese } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className={clsx('flex flex-col items-center justify-center py-16 text-center', className)}>
      {/* Icon with optional pulse animation */}
      <div className={clsx(!shouldReduceMotion && 'animate-soft-bounce')}>
        <Icon className={clsx('h-16 w-16', iconColor)} strokeWidth={1.5} />
      </div>

      {/* Title */}
      <div className="mt-6">
        <h3 className="text-xl font-bold text-foreground">{title.en}</h3>
        {showBurmese && (
          <p className="mt-1 text-lg text-muted-foreground font-myanmar">{title.my}</p>
        )}
      </div>

      {/* Description */}
      <div className="mt-3 max-w-sm">
        <p className="text-muted-foreground">{description.en}</p>
        {showBurmese && (
          <p className="mt-1 text-sm text-muted-foreground font-myanmar">{description.my}</p>
        )}
      </div>

      {/* CTA Button */}
      {action && (
        <div className="mt-8">
          <Button variant="chunky" size="lg" onClick={action.onClick}>
            <span>{action.label.en}</span>
            {showBurmese && (
              <span className="ml-2 text-sm font-myanmar opacity-80">{action.label.my}</span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
