/**
 * Focus management hook for route changes.
 *
 * On each navigation, waits for page transition animation to settle (150ms),
 * then focuses the first h1 or main element. This ensures keyboard and screen
 * reader users know which page they are on after navigation.
 *
 * Key details:
 * - 150ms delay matches existing AnimatePresence page transition duration
 * - tabindex="-1" makes non-focusable elements focusable without adding to tab order
 * - preventScroll: true avoids page scrolling to the focused element
 * - Triggers on location.pathname (hash routing uses pathname within the hash router)
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useFocusOnNavigation() {
  const location = useLocation();

  useEffect(() => {
    // Delay to let AnimatePresence page transition settle
    const timer = setTimeout(() => {
      const h1 = document.querySelector('h1');
      const main = document.querySelector('[role="main"]') ?? document.querySelector('main');
      const target = h1 ?? main;

      if (target instanceof HTMLElement) {
        // Ensure element is focusable without being in tab order
        if (!target.hasAttribute('tabindex')) {
          target.setAttribute('tabindex', '-1');
        }
        // preventScroll per project pitfalls
        target.focus({ preventScroll: true });
      }
    }, 150); // Match page transition animation duration

    return () => clearTimeout(timer);
  }, [location.pathname]);
}
