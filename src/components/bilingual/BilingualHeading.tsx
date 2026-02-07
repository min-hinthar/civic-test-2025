'use client';

import { ReactNode, createElement } from 'react';
import clsx from 'clsx';
import { BilingualString } from '@/lib/i18n/strings';
import { useLanguage } from '@/contexts/LanguageContext';

export interface BilingualHeadingProps {
  /** Heading text with en and my keys */
  text: BilingualString;
  /** HTML heading level */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Size variant (independent of level for flexibility) */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Center align */
  centered?: boolean;
  /** Additional content after heading */
  children?: ReactNode;
  /** Additional class names */
  className?: string;
}

const sizeClasses = {
  sm: { en: 'text-lg font-bold', my: 'text-sm' },
  md: { en: 'text-xl font-bold', my: 'text-base' },
  lg: { en: 'text-2xl font-bold', my: 'text-lg' },
  xl: { en: 'text-3xl font-bold', my: 'text-xl' },
  '2xl': { en: 'text-4xl font-bold', my: 'text-2xl' },
};

/**
 * Bilingual heading with English as main and Burmese as subtitle.
 *
 * Features:
 * - English as main header text
 * - Burmese as smaller subtitle below
 * - Semantic HTML heading element
 *
 * Usage:
 * ```tsx
 * <BilingualHeading text={strings.dashboard.yourProgress} level={2} size="lg" />
 * ```
 */
export function BilingualHeading({
  text,
  level = 2,
  size = 'lg',
  centered = false,
  children,
  className,
}: BilingualHeadingProps) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  const styles = sizeClasses[size];
  const { showBurmese } = useLanguage();

  return createElement(
    Tag,
    { className: clsx('flex flex-col', centered && 'items-center text-center', className) },
    <>
      <span className={clsx('text-foreground', styles.en)}>{text.en}</span>
      {showBurmese && (
        <span className={clsx('font-myanmar text-muted-foreground mt-0.5', styles.my)}>
          {text.my}
        </span>
      )}
      {children}
    </>
  );
}

/**
 * Page title heading (largest size, usually h1)
 */
export function PageTitle({ text, className }: { text: BilingualString; className?: string }) {
  return <BilingualHeading text={text} level={1} size="2xl" className={clsx('mb-6', className)} />;
}

/**
 * Section heading (usually h2)
 */
export function SectionHeading({ text, className }: { text: BilingualString; className?: string }) {
  return <BilingualHeading text={text} level={2} size="lg" className={clsx('mb-4', className)} />;
}
