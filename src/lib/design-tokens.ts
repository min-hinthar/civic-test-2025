/**
 * Design tokens for Phase 3: UI/UX Polish
 * Multi-shade blue system inspired by Duolingo energy with patriotic feel
 */

// Blue palette - primary accent (HSL values for Tailwind)
export const colors = {
  // Primary blue shades (patriotic, confident)
  primary: {
    50: '214 100% 97%', // Lightest - surfaces, backgrounds
    100: '214 95% 93%', // Light hover states
    200: '213 97% 87%', // Light accents
    300: '212 96% 78%', // Medium accents
    400: '213 94% 68%', // Interactive elements
    500: '217 91% 60%', // Primary buttons, links (main blue)
    600: '221 83% 53%', // Hover on primary
    700: '224 76% 48%', // Active/pressed states
    800: '226 71% 40%', // Dark text on light
    900: '224 64% 33%', // Darkest blue
  },
  // Success green (correct answers, progress)
  success: {
    50: '142 76% 95%',
    100: '141 84% 86%',
    500: '142 71% 45%',
    600: '142 76% 36%',
  },
  // Warning orange (wrong answers - soft, not alarming)
  warning: {
    50: '38 92% 95%',
    100: '39 96% 89%',
    500: '32 95% 52%', // Soft orange for wrong answers
    600: '26 90% 45%',
  },
  // Patriotic red (decorative only - stars, stripes, never errors)
  patriotic: {
    500: '0 72% 51%', // American red
    600: '0 74% 42%',
  },
};

// Spacing scale (4px base)
export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem', // 2px
  1: '0.25rem', // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem', // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem', // 12px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  8: '2rem', // 32px
  10: '2.5rem', // 40px
  12: '3rem', // 48px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
};

// Animation timing (snappy per user decision: 150-250ms)
export const timing = {
  instant: '0ms',
  fast: '150ms',
  normal: '200ms',
  slow: '250ms',
  page: '300ms', // Page transitions only
};

// Border radius (bubbly, friendly per user decision: 16px+)
export const radius = {
  sm: '0.5rem', // 8px
  md: '0.75rem', // 12px
  lg: '1rem', // 16px - minimum for phase 3
  xl: '1.25rem', // 20px
  '2xl': '1.5rem', // 24px
  '3xl': '2rem', // 32px
  full: '9999px', // Pill buttons
};

// Spring physics for Motion animations (Duolingo-style tactile feedback)
export const springs = {
  button: { type: 'spring', stiffness: 400, damping: 17 },
  gentle: { type: 'spring', stiffness: 300, damping: 20 },
  bouncy: { type: 'spring', stiffness: 500, damping: 15 },
};
