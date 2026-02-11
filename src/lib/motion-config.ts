/**
 * Shared spring animation configurations for the "playful + bouncy" personality.
 *
 * SPRING_BOUNCY: Primary interactions (button press, card tap) - visible overshoot
 * SPRING_SNAPPY: Secondary interactions (tab switch, indicator slide) - quick with slight bounce
 * SPRING_GENTLE: Large element animations (page transitions, progress fill) - smooth with subtle overshoot
 */

export const SPRING_BOUNCY = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 15,
  mass: 0.8,
};

export const SPRING_SNAPPY = {
  type: 'spring' as const,
  stiffness: 500,
  damping: 25,
};

export const SPRING_GENTLE = {
  type: 'spring' as const,
  stiffness: 200,
  damping: 20,
};

/**
 * Stagger timing presets for list/grid animations.
 * Values in seconds (for motion/react staggerChildren).
 */
export const STAGGER_FAST = 0.04; // 40ms between items
export const STAGGER_DEFAULT = 0.06; // 60ms between items
export const STAGGER_SLOW = 0.1; // 100ms between items
