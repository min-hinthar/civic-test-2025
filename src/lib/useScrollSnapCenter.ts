import { useEffect, useRef } from 'react';

/**
 * Scrolls the active item (`[aria-current="page"]`) to the horizontal center
 * of a scrollable container whenever the pathname changes.
 *
 * Uses instant scroll to avoid fighting with layoutId FLIP animations
 * on the nav pill indicator.
 *
 * Returns a ref to attach to the scrollable container element.
 */
export function useScrollSnapCenter(pathname: string) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const active = container.querySelector<HTMLElement>('[aria-current="page"]');
    if (!active) return;

    const scrollLeft = active.offsetLeft - container.offsetWidth / 2 + active.offsetWidth / 2;
    container.scrollTo({ left: scrollLeft, behavior: 'instant' });
  }, [pathname]);

  return containerRef;
}
