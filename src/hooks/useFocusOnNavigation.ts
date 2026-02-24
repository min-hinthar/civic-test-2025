/**
 * Focus management hook for route changes.
 *
 * On each navigation, waits for page transition animation to settle (150ms),
 * then focuses the first h1 or main element. This ensures keyboard and screen
 * reader users know which page they are on after navigation.
 *
 * Key details:
 * - 150ms delay matches existing page transition duration
 * - tabindex="-1" makes non-focusable elements focusable without adding to tab order
 * - preventScroll: true avoids page scrolling to the focused element
 * - Triggers on pathname changes via usePathname from next/navigation
 */

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function useFocusOnNavigation() {
  const pathname = usePathname();

  useEffect(() => {
    // Delay to let page transition settle
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
  }, [pathname]);
}
