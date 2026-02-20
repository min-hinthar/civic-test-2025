/**
 * Haptic Feedback Utility
 *
 * Three-tier haptic system for native-feel tactile feedback:
 *   - Light (10ms): every button tap, toggle, nav tap, TTS speak
 *   - Medium (20ms): card flip, answer grade, mic start/stop, share success
 *   - Heavy (multi-burst): streak reward, badge unlock, milestone celebration
 *
 * - Android: real vibration via navigator.vibrate()
 * - iOS/desktop: graceful no-op (Vibration API unsupported)
 *
 * All functions silently catch errors so haptic issues never break app flow.
 * Call from event handlers only (not during render).
 */

const supportsVibration = typeof navigator !== 'undefined' && 'vibrate' in navigator;

/**
 * Light: every button tap, toggle, nav tap, TTS speak button (10ms).
 * Call from event handlers only.
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
 * Medium: card flip, answer grade, mic start/stop, share success (20ms).
 * Call from event handlers only.
 */
export function hapticMedium(): void {
  if (!supportsVibration) return;
  try {
    navigator.vibrate(20);
  } catch {
    /* silently ignore */
  }
}

/**
 * Heavy: streak reward, badge unlock, milestone -- multi-burst ta-da-da pattern.
 * Uses [15, 30, 15, 30, 40] for two short pulses with a longer final pulse (festive feel).
 * Call from event handlers only.
 */
export function hapticHeavy(): void {
  if (!supportsVibration) return;
  try {
    navigator.vibrate([15, 30, 15, 30, 40]);
  } catch {
    /* silently ignore */
  }
}

/**
 * Legacy double-tap pattern -- retained for backward compatibility.
 * Two 10ms pulses with 50ms gap.
 * Call from event handlers only.
 */
export function hapticDouble(): void {
  if (!supportsVibration) return;
  try {
    navigator.vibrate([10, 50, 10]);
  } catch {
    /* silently ignore */
  }
}
