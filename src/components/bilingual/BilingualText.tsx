'use client';

import clsx from 'clsx';
import { BilingualString } from '@/lib/i18n/strings';
import { useLanguage } from '@/contexts/LanguageContext';

export interface BilingualTextProps {
  /** Text content with en and my keys */
  text: BilingualString;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Center align text */
  centered?: boolean;
  /** Additional class names */
  className?: string;
}

// Size mappings — same for both languages (co-equal sizing)
const enSizes = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

/**
 * Stacked bilingual text component.
 *
 * Features:
 * - English on top, Burmese below (per user decision)
 * - Burmese differentiated by color only (co-equal sizing)
 * - Configurable sizes with smart defaults
 *
 * Usage:
 * ```tsx
 * <BilingualText text={strings.nav.dashboard} />
 * <BilingualText text={{ en: 'Hello', my: 'မင်္ဂလာပါ' }} size="lg" />
 * ```
 */
export function BilingualText({
  text,
  size = 'md',
  centered = false,
  className,
}: BilingualTextProps) {
  const { showBurmese } = useLanguage();

  return (
    <span className={clsx('flex flex-col', centered && 'items-center text-center', className)}>
      <span className={clsx('font-semibold text-foreground', enSizes[size])}>{text.en}</span>
      {showBurmese && (
        <span className={clsx('font-myanmar text-muted-foreground', enSizes[size])}>{text.my}</span>
      )}
    </span>
  );
}

/**
 * Inline bilingual text (side by side with separator)
 */
export function BilingualTextInline({
  text,
  separator = ' · ',
  className,
}: {
  text: BilingualString;
  separator?: string;
  className?: string;
}) {
  const { showBurmese } = useLanguage();

  return (
    <span className={className}>
      <span className="text-foreground">{text.en}</span>
      {showBurmese && (
        <>
          <span className="text-muted-foreground">{separator}</span>
          <span className="font-myanmar text-muted-foreground">{text.my}</span>
        </>
      )}
    </span>
  );
}
