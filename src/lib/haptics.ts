/**
 * Haptic Feedback Utility
 *
 * Wraps the Vibration API for tactile feedback on answer selection,
 * correct/incorrect results, and UI interactions.
 *
 * - Android: real vibration via navigator.vibrate()
 * - iOS/desktop: graceful no-op (Vibration API unsupported)
 *
 * All functions silently catch errors so haptic issues never break app flow.
 * Call from event handlers only (not during render).
 */

const supportsVibration = typeof navigator !== 'undefined' && 'vibrate' in navigator;

/**
 * Light single tap - answer selection, button press.
 * 10ms vibration pulse.
 */
export function hapticLight(): void {
  if (!supportsVibration) return;
  try {
    navigator.vibrate(10);
  } catch {
    /* silently ignore */
  }
}

/**
 * Double tap pattern - incorrect answer feedback.
 * Two 10ms pulses with 50ms gap.
 */
export function hapticDouble(): void {
  if (!supportsVibration) return;
  try {
    navigator.vibrate([10, 50, 10]);
  } catch {
    /* silently ignore */
  }
}

/**
 * Medium tap - correct answer feedback, confirmations.
 * 20ms vibration pulse (slightly stronger than light).
 */
export function hapticMedium(): void {
  if (!supportsVibration) return;
  try {
    navigator.vibrate(20);
  } catch {
    /* silently ignore */
  }
}
