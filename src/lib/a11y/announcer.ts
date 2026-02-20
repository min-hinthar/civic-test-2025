/**
 * Screen reader live region announcement utility.
 *
 * Creates persistent, visually-hidden aria-live regions on first use
 * and manages announcements for screen readers. Supports both polite
 * and assertive priorities via separate live regions.
 *
 * Usage:
 * ```ts
 * import { announce } from '@/lib/a11y/announcer';
 * announce('Quiz loaded with 10 questions');           // assertive (default)
 * announce('Score updated', 'polite');                 // polite
 * ```
 */

/** Cached live region elements keyed by priority */
let politeRegion: HTMLDivElement | null = null;
let assertiveRegion: HTMLDivElement | null = null;

/** Screen-reader-only styles matching Tailwind's sr-only */
const SR_ONLY_STYLES = [
  'position: absolute',
  'width: 1px',
  'height: 1px',
  'padding: 0',
  'margin: -1px',
  'overflow: hidden',
  'clip: rect(0, 0, 0, 0)',
  'white-space: nowrap',
  'border-width: 0',
].join('; ');

/**
 * Create a persistent aria-live region element appended to document.body.
 */
function createRegion(priority: 'polite' | 'assertive'): HTMLDivElement {
  const el = document.createElement('div');
  el.setAttribute('aria-live', priority);
  el.setAttribute('aria-atomic', 'true');
  el.setAttribute('role', priority === 'assertive' ? 'alert' : 'status');
  el.setAttribute('style', SR_ONLY_STYLES);
  el.id = `a11y-announcer-${priority}`;
  document.body.appendChild(el);
  return el;
}

/**
 * Get or create the live region for the given priority.
 */
function getRegion(priority: 'polite' | 'assertive'): HTMLDivElement {
  if (priority === 'polite') {
    if (!politeRegion) {
      politeRegion = createRegion('polite');
    }
    return politeRegion;
  }
  if (!assertiveRegion) {
    assertiveRegion = createRegion('assertive');
  }
  return assertiveRegion;
}

/**
 * Announce a message to screen readers via an aria-live region.
 *
 * Clears the region first, then sets the message in a requestAnimationFrame
 * to ensure the browser detects the content change and triggers re-announcement.
 *
 * @param message - The text message to announce
 * @param priority - 'assertive' (default, interrupts) or 'polite' (waits for idle)
 */
export function announce(message: string, priority: 'polite' | 'assertive' = 'assertive'): void {
  if (typeof document === 'undefined') return;

  const region = getRegion(priority);

  // Clear then set in rAF to force screen reader re-announcement
  region.textContent = '';
  requestAnimationFrame(() => {
    region.textContent = message;
  });
}
