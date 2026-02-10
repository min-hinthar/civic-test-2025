import { useEffect, useRef } from 'react';

/**
 * Scrolls the active item (`[aria-current="page"]`) to the horizontal center
 * of a scrollable container whenever the pathname changes.
 *
 * Returns a ref to attach to the scrollable container element.
 */
export function useScrollSnapCenter(pathname: string) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const active = container.querySelector<HTMLElement>('[aria-current="page"]');
    if (!active) return;

    const scrollLeft =
      active.offsetLeft - container.offsetWidth / 2 + active.offsetWidth / 2;

    // Instant on first render, smooth on subsequent navigations
    container.scrollTo({
      left: scrollLeft,
      behavior: isFirstRender.current ? 'instant' : 'smooth',
    });
    isFirstRender.current = false;
  }, [pathname]);

  return containerRef;
}
