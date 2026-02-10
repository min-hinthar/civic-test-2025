/**
 * Responsive tier detection hook.
 *
 * Returns 'mobile' | 'tablet' | 'desktop' based on viewport width.
 * - mobile:  < 768px  (Tailwind md breakpoint)
 * - tablet:  768px - 1279px  (Tailwind md to xl)
 * - desktop: >= 1280px  (Tailwind xl breakpoint)
 *
 * Uses matchMedia listeners for efficient, debounce-free updates.
 * SSR-safe: defaults to 'mobile' when window is undefined.
 */

import { useState, useEffect } from 'react';

export type MediaTier = 'mobile' | 'tablet' | 'desktop';

export function useMediaTier(): MediaTier {
  const [tier, setTier] = useState<MediaTier>(() => {
    if (typeof window === 'undefined') return 'mobile';
    const w = window.innerWidth;
    if (w >= 1280) return 'desktop';
    if (w >= 768) return 'tablet';
    return 'mobile';
  });

  useEffect(() => {
    const mqTablet = window.matchMedia('(min-width: 768px)');
    const mqDesktop = window.matchMedia('(min-width: 1280px)');

    const update = () => {
      if (mqDesktop.matches) setTier('desktop');
      else if (mqTablet.matches) setTier('tablet');
      else setTier('mobile');
    };

    // The matchMedia change callbacks call setState via the update function.
    // This is an event handler pattern, not a direct effect body setState,
    // so it is React Compiler safe.
    mqTablet.addEventListener('change', update);
    mqDesktop.addEventListener('change', update);

    return () => {
      mqTablet.removeEventListener('change', update);
      mqDesktop.removeEventListener('change', update);
    };
  }, []);

  return tier;
}
