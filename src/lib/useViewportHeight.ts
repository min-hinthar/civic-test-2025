import { useEffect } from 'react';

/**
 * Syncs a CSS custom property with the current viewport height, accounting for
 * mobile browser UI chrome (address bars, virtual keyboard) and safe areas.
 * This avoids layout jumps on iOS/Android when 100vh includes the URL bar.
 */
export function useViewportHeight() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const setViewportVars = () => {
      const height = window.visualViewport?.height ?? window.innerHeight;
      const offsetTop = window.visualViewport?.offsetTop ?? 0;
      const offsetLeft = window.visualViewport?.offsetLeft ?? 0;
      document.documentElement.style.setProperty('--app-viewport-height', `${height}px`);
      document.documentElement.style.setProperty('--app-viewport-offset-top', `${offsetTop}px`);
      document.documentElement.style.setProperty('--app-viewport-offset-left', `${offsetLeft}px`);
    };

    setViewportVars();

    window.visualViewport?.addEventListener('resize', setViewportVars);
    window.visualViewport?.addEventListener('scroll', setViewportVars);
    window.addEventListener('orientationchange', setViewportVars);
    window.addEventListener('resize', setViewportVars);

    return () => {
      window.visualViewport?.removeEventListener('resize', setViewportVars);
      window.visualViewport?.removeEventListener('scroll', setViewportVars);
      window.removeEventListener('orientationchange', setViewportVars);
      window.removeEventListener('resize', setViewportVars);
    };
  }, []);
}
