import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Tracks scroll direction and returns whether the nav should be visible.
 * - Visible when scrolling up or near the top of the page.
 * - Hidden when scrolling down past a threshold.
 *
 * Uses a threshold to avoid jitter from small scroll movements.
 */
export function useScrollDirection(threshold = 10): boolean {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const update = useCallback(() => {
    const currentY = window.scrollY;
    const delta = currentY - lastScrollY.current;

    if (currentY <= 48) {
      // Always show near top of page
      setVisible(true);
    } else if (delta > threshold) {
      // Scrolling down past threshold → hide
      setVisible(false);
    } else if (delta < -threshold) {
      // Scrolling up past threshold → show
      setVisible(true);
    }

    lastScrollY.current = currentY;
    ticking.current = false;
  }, [threshold]);

  useEffect(() => {
    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [update]);

  return visible;
}
