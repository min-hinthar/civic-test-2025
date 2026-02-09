'use client';

/**
 * ShareButton
 *
 * Reusable button that triggers the share card flow:
 * opens ShareCardPreview modal with the generated canvas image.
 *
 * Two variants:
 * - default: Full bilingual button with icon and text
 * - compact: Icon-only button (32px touch target)
 *
 * Manages modal open state internally.
 */

import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { Share2 } from 'lucide-react';
import clsx from 'clsx';
import { useLanguage } from '@/contexts/LanguageContext';
import { ShareCardPreview } from './ShareCardPreview';
import type { ShareCardData } from '@/lib/social/shareCardRenderer';

export interface ShareButtonProps {
  /** Data for generating the share card */
  data: ShareCardData;
  /** Button style variant */
  variant?: 'default' | 'compact';
  /** Additional class names */
  className?: string;
}

const LABEL = {
  en: 'Share Results',
  my: 'ရလဒ်များ မျှဝေပါ',
};

/**
 * Button that opens the share card preview modal.
 * Reusable across results pages and history views.
 */
export function ShareButton({ data, variant = 'default', className }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { showBurmese } = useLanguage();

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      {variant === 'compact' ? (
        <motion.button
          type="button"
          onClick={handleOpen}
          title={showBurmese ? `${LABEL.en} / ${LABEL.my}` : LABEL.en}
          aria-label={LABEL.en}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          className={clsx(
            'inline-flex items-center justify-center rounded-full',
            'h-8 w-8',
            'border border-border text-muted-foreground',
            'transition-colors duration-150',
            'hover:text-foreground hover:border-foreground/30',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
            className
          )}
        >
          <Share2 className="h-4 w-4" />
        </motion.button>
      ) : (
        <motion.button
          type="button"
          onClick={handleOpen}
          aria-label={LABEL.en}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.03 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          className={clsx(
            'inline-flex items-center gap-2 rounded-full px-5',
            'min-h-[44px]',
            'bg-primary-500 text-white shadow-lg shadow-primary-500/25',
            'transition-colors duration-150',
            'hover:bg-primary-600',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
            className
          )}
        >
          <Share2 className="h-4 w-4 shrink-0" />
          <span className="flex flex-col text-left">
            <span className="text-sm font-semibold">{LABEL.en}</span>
            {showBurmese && <span className="font-myanmar text-xs opacity-80">{LABEL.my}</span>}
          </span>
        </motion.button>
      )}

      <ShareCardPreview data={data} open={isOpen} onClose={handleClose} />
    </>
  );
}
