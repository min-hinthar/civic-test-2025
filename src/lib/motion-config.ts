/**
 * AUTHORITATIVE MOTION SYSTEM
 *
 * Spring animation configurations for the "playful + bouncy" personality.
 * This is the PRIMARY motion layer — consumed by 30+ components via motion/react.
 *
 * SPRING_BOUNCY: Primary interactions (button press, card tap) — visible overshoot
 * SPRING_SNAPPY: Secondary interactions (tab switch, indicator slide) — quick with slight bounce
 * SPRING_GENTLE: Large element animations (page transitions, progress fill) — smooth with subtle overshoot
 *
 * Motion architecture:
 * - JS springs (this file) → component animations via motion/react (primary)
 * - CSS tokens (tokens.css) → CSS-only transitions (glass hover effects, non-React elements)
 * - Both systems share the same timing personality (bouncy, spring-like)
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

/** Fast press-down spring for instant button press feel (~50ms settle) */
export const SPRING_PRESS_DOWN = {
  type: 'spring' as const,
  stiffness: 800,
  damping: 30,
  mass: 0.5,
};

/**
 * Stagger timing presets for list/grid animations.
 * Values in seconds (for motion/react staggerChildren).
 */
export const STAGGER_FAST = 0.04; // 40ms between items
export const STAGGER_DEFAULT = 0.06; // 60ms between items
export const STAGGER_SLOW = 0.1; // 100ms between items
