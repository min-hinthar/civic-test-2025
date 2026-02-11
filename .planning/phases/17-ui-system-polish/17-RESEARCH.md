# Phase 17: UI System Polish - Research

**Researched:** 2026-02-11
**Domain:** CSS glass-morphism, micro-interactions (motion/react), touch target accessibility, dark mode refinement
**Confidence:** HIGH

## Summary

Phase 17 is a pure visual polish phase that applies premium iOS-inspired glass-morphism, animated prismatic borders, bouncy micro-interactions, 44px+ touch targets, and refined dark mode across the entire app. The codebase already has strong foundations: `motion/react` v12.33 is installed, glass CSS classes (`glass-card`, `glass-nav`, `glass-panel`) exist in globals.css, the design token system is mature (tokens.css), and a `GlassCard` React component exists in the hub. The work is upgrading these foundations to the premium tier described in user decisions: heavier blur (24px+), three glass tiers, animated prismatic shimmer borders on all surfaces, playful spring micro-interactions, and a dramatic dark mode with neon-bright prismatic effects.

The key technical challenges are: (1) the animated prismatic border using CSS `@property` + `conic-gradient` which has excellent browser support now (Chrome 100+, Safari 15.4+, Firefox 128+), (2) the circular reveal theme toggle using the View Transitions API which is Baseline Newly Available (Chrome 111+, Safari 18+, Firefox 144+), and (3) managing performance of heavy backdrop-blur on many simultaneous surfaces. All libraries needed are already installed -- no new dependencies required.

**Primary recommendation:** Build a tiered glass system in CSS (globals.css) with three levels of blur/opacity, add a CSS-only animated prismatic border using `@property` + `conic-gradient`, upgrade all interactive elements with motion/react spring animations matching the "playful + bouncy" personality, and implement the circular reveal theme toggle via View Transitions API with graceful fallback.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Heavy blur (24px+) across all glass surfaces
- Three glass tiers: heavy (sidebar, nav, modals), medium (hero cards like NBA card), light (regular cards)
- All surfaces get glass: navigation, cards, modals, flashcard, floating elements
- Gradient prismatic shimmer border on ALL glass surfaces (nav, cards, sidebar, bottom bar, modals)
- Shimmer is animated -- continuous rainbow/prismatic light sweep along borders
- On prefers-reduced-motion: shimmer freezes but prismatic gradient stays visible (static)
- Glass surfaces have both inner light reflection (top edge) AND drop shadow (below) for full depth
- Subtle gradient mesh background (fixed, does not scroll with content) with brand purple + blue color blobs at 15-25% opacity
- Rainbow/prismatic multi-color light refraction effect for borders
- Animated shimmer -- continuous movement along border edges
- Same shimmer speed in both light and dark mode
- Bottom tab bar gets full glass with prismatic shimmer too
- Overall personality: Playful + bouncy (spring animations with visible overshoot)
- Button press: Scale down (95%) + prismatic glow flare + color shift (triple feedback)
- Tab switching: Combined pop/scale on active icon + indicator slides with spring bounce + content morphs
- Card hover/press: Lift up (increased shadow) AND prismatic border glow intensifies
- Progress bars/rings: Spring fill from 0 (with overshoot) + simultaneous number count-up
- Flashcard flip: Spring bounce (slight overshoot past 180 degrees) + prismatic refraction during rotation
- Toggle switches: Spring bounce on knob + smooth color morph transition
- Page transitions: Scale down + fade on outgoing page, slide in on incoming, shared element transitions
- List items (study guide, history): Staggered spring pop entrance (items pop in one by one with delay)
- Badge celebration: Prismatic ripple expanding outward from badge
- Success/error states: Color pulse (green/red flash) AND animated icon (check bounces, X shakes)
- Streak fire icon: Gentle pulse animation when streak is alive
- SRS badge count: Pulse when reviews are due
- 100% mastery celebration: Prismatic burst + confetti when score reaches 100%
- Interview simulation: Typing indicator dots during wait + pulsing prismatic glow when question appears
- Scroll physics: Rubber-band overscroll at page edges (iOS-like)
- Loading skeletons: Prismatic shimmer on skeleton placeholders (matching glass border colors)
- Theme toggle: Circular reveal from toggle button position (dark mode expands as circle, light mode dissolves)
- No parallax on dashboard -- everything scrolls together
- Mixed touch target approach: visually increase size for icon buttons, invisible expanded hit areas for inline links
- Icon-only buttons: 48px minimum (Material Design standard)
- Bottom tab bar: icon + label area is tappable (not full section strip)
- Text links: Convert to pill-shaped/button-like links with proper padding
- Study guide question rows: Convert to full-width tappable card-style rows with generous padding
- Flashcard: Keep current tap-to-flip behavior (no changes)
- Mock test answer buttons: Claude audits and adjusts if below 44px minimum
- Form elements (state picker, search, toggles): 48px minimum height
- Frosted glass tint: Subtle brand purple tint in dark glass surfaces
- Border glow: Adaptive intensity -- subtle by default, brighter on hover/focus
- Prismatic shimmer in dark: Neon-bright rainbow (full spectrum with glowing intensity)
- Mesh gradient background in dark: Deep purple + dark magenta (richer/more dramatic than light mode)
- Surface elevation: Both color hierarchy (lighter at higher elevation) AND increased glass blur -- double depth cue
- Gradient overlays (NBA hero, interview cards): Deeper and more saturated in dark mode
- Theme toggle animation: Dark reveals as circular expansion, light dissolves away (asymmetric)
- General dark mode audit: Check for low contrast text and inconsistent surface colors
- Shimmer speed: Same in both themes

### Claude's Discretion
- Glass surface opacity levels per tier (optimized for readability)
- Backdrop-filter fallback strategy
- GlassCard component API design (tier variants vs className overrides)
- Shimmer animation speed per surface size
- Tap spacing enforcement (audit-based)
- Mock test button sizing (audit-based)
- Dark mode text warmth (WCAG-driven)
- Dark mode image/icon treatment per element

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| motion/react | 12.33.0 | All micro-interactions, spring physics, layout animations, AnimatePresence | Already used extensively throughout the app; spring, whileTap, whileHover, layoutId |
| tailwindcss | 3.4.17 | Utility-first CSS, backdrop-blur classes, @supports modifiers | Already the styling foundation; `supports-[backdrop-filter]` modifier for fallbacks |
| tailwindcss-animate | 1.0.7 | CSS keyframe animation utilities | Already installed, useful for CSS-only animations |
| react-canvas-confetti | 2.0.7 | Confetti effects for celebrations | Already used for badge/mastery celebrations |
| react-countup | 6.5.3 | Number count-up animations | Already used in CountUpScore, CompactStatRow |
| @radix-ui/react-progress | 1.1.8 | Accessible progress bar primitives | Already used in Progress component |

### No New Dependencies Needed
This phase requires zero new npm packages. All animation capabilities come from motion/react (spring physics, layout animations, AnimatePresence, gesture handlers) and CSS (conic-gradient, @property, View Transitions API, backdrop-filter).

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS @property for shimmer | JS-animated shimmer with motion/react | CSS is more performant for continuous animation; @property has excellent browser support now |
| View Transitions API for theme toggle | clip-path CSS animation | View Transitions is the standard approach, Baseline Newly Available; clip-path is more limited |
| CSS overscroll-behavior for rubber-band | JS-based overscroll library | CSS overscroll-behavior is native; rubber-band is already default on iOS Safari, `-webkit-overflow-scrolling: touch` |

## Architecture Patterns

### Recommended Component Structure
```
src/
├── styles/
│   ├── tokens.css            # Add glass-tier tokens, prismatic border vars
│   ├── globals.css            # Upgrade glass-card/glass-nav, add glass-heavy/glass-medium/glass-light tiers
│   ├── animations.css         # Add prismatic shimmer keyframes, pulse animations
│   └── prismatic-border.css   # NEW: @property + conic-gradient prismatic border system
├── components/
│   ├── ui/
│   │   ├── GlassCard.tsx      # MOVE from hub/ to ui/, add tier prop (heavy/medium/light)
│   │   ├── PrismaticBorder.tsx # NEW: wrapper component for prismatic border effect
│   │   └── ...existing
│   ├── navigation/
│   │   ├── BottomTabBar.tsx    # Add prismatic border, touch target audit
│   │   ├── Sidebar.tsx         # Add prismatic border
│   │   └── GlassHeader.tsx     # Add prismatic border
│   └── ThemeToggle.tsx         # Circular reveal via View Transitions API
```

### Pattern 1: Three-Tier Glass System (CSS Classes)
**What:** Three CSS classes with increasing blur/opacity for visual hierarchy
**When to use:** Every surface that should appear glassy

```css
/* In globals.css -- Three glass tiers */
.glass-light {
  background: hsl(var(--color-surface) / var(--glass-light-opacity, 0.65));
  backdrop-filter: blur(var(--glass-light-blur, 16px));
  -webkit-backdrop-filter: blur(var(--glass-light-blur, 16px));
  border: 1px solid hsl(var(--color-border) / 0.3);
  /* Inner light reflection */
  box-shadow:
    inset 0 1px 0 0 hsl(0 0% 100% / 0.12),
    0 4px 12px -2px hsl(var(--color-overlay) / 0.1);
}

.glass-medium {
  background: hsl(var(--color-surface) / var(--glass-medium-opacity, 0.55));
  backdrop-filter: blur(var(--glass-medium-blur, 24px));
  -webkit-backdrop-filter: blur(var(--glass-medium-blur, 24px));
  border: 1px solid hsl(var(--color-border) / 0.35);
  box-shadow:
    inset 0 1px 0 0 hsl(0 0% 100% / 0.15),
    0 8px 24px -4px hsl(var(--color-overlay) / 0.15);
}

.glass-heavy {
  background: hsl(var(--color-surface) / var(--glass-heavy-opacity, 0.45));
  backdrop-filter: blur(var(--glass-heavy-blur, 32px));
  -webkit-backdrop-filter: blur(var(--glass-heavy-blur, 32px));
  border: 1px solid hsl(var(--color-border) / 0.4);
  box-shadow:
    inset 0 1px 0 0 hsl(0 0% 100% / 0.2),
    0 12px 40px -8px hsl(var(--color-overlay) / 0.2);
}

/* Dark mode adjustments for all tiers */
.dark .glass-light {
  --glass-light-opacity: 0.5;
  background-image: linear-gradient(
    135deg,
    hsl(var(--color-accent-purple) / 0.03),
    transparent
  );
  box-shadow:
    inset 0 1px 0 0 hsl(0 0% 100% / 0.06),
    inset 0 0 0 1px hsl(0 0% 100% / 0.05),
    0 4px 12px -2px hsl(var(--color-overlay) / 0.3);
}
```

### Pattern 2: Animated Prismatic Border (CSS @property)
**What:** Rainbow shimmer border that continuously animates along edges using CSS only
**When to use:** All glass surfaces (nav, cards, sidebar, bottom bar, modals)
**Browser support:** Chrome 100+, Safari 15.4+, Firefox 128+ (all within browserslist targets)

```css
/* In prismatic-border.css */
@property --prismatic-angle {
  syntax: "<angle>";
  inherits: false;
  initial-value: 0deg;
}

@keyframes prismatic-rotate {
  to {
    --prismatic-angle: 360deg;
  }
}

.prismatic-border {
  position: relative;
  isolation: isolate;
}

.prismatic-border::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px; /* border width */
  background: conic-gradient(
    from var(--prismatic-angle),
    hsl(0 80% 60% / 0.4),
    hsl(60 80% 60% / 0.4),
    hsl(120 80% 60% / 0.4),
    hsl(180 80% 60% / 0.4),
    hsl(240 80% 60% / 0.4),
    hsl(300 80% 60% / 0.4),
    hsl(0 80% 60% / 0.4)
  );
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: prismatic-rotate 4s linear infinite;
  pointer-events: none;
  z-index: 1;
}

/* Dark mode: neon-bright intensity */
.dark .prismatic-border::before {
  background: conic-gradient(
    from var(--prismatic-angle),
    hsl(0 90% 65% / 0.7),
    hsl(60 90% 65% / 0.6),
    hsl(120 90% 65% / 0.6),
    hsl(180 90% 65% / 0.7),
    hsl(240 90% 65% / 0.7),
    hsl(300 90% 65% / 0.6),
    hsl(0 90% 65% / 0.7)
  );
  filter: blur(0.5px); /* subtle glow */
}

/* Intensify on hover/focus */
.prismatic-border:hover::before,
.prismatic-border:focus-within::before {
  padding: 1.5px;
  filter: brightness(1.3);
}

/* Reduced motion: keep gradient visible but stop animation */
@media (prefers-reduced-motion: reduce) {
  .prismatic-border::before {
    animation: none;
    --prismatic-angle: 45deg; /* static diagonal gradient */
  }
}
```

### Pattern 3: Circular Reveal Theme Toggle (View Transitions API)
**What:** Dark mode expands as a circle from toggle position, light mode dissolves
**When to use:** ThemeToggle component / ThemeContext toggleTheme function
**Browser support:** Baseline Newly Available (Chrome 111+, Safari 18+, Firefox 144+)

```typescript
// In ThemeContext.tsx -- toggleTheme with circular reveal
const toggleTheme = useCallback(async (event?: React.MouseEvent) => {
  const newTheme = theme === 'light' ? 'dark' : 'light';

  // Fallback for browsers without View Transitions API
  if (!document.startViewTransition || prefersReducedMotion) {
    setTheme(newTheme);
    return;
  }

  // Get toggle button position for circular reveal origin
  const x = event?.clientX ?? window.innerWidth / 2;
  const y = event?.clientY ?? 0;
  const maxRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  const transition = document.startViewTransition(() => {
    flushSync(() => setTheme(newTheme));
  });

  await transition.ready;

  // Asymmetric: dark expands as circle, light dissolves
  const clipPathStart = newTheme === 'dark'
    ? `circle(0px at ${x}px ${y}px)`
    : `circle(${maxRadius}px at ${x}px ${y}px)`;
  const clipPathEnd = newTheme === 'dark'
    ? `circle(${maxRadius}px at ${x}px ${y}px)`
    : `circle(0px at ${x}px ${y}px)`;

  document.documentElement.animate(
    { clipPath: [clipPathStart, clipPathEnd] },
    {
      duration: 500,
      easing: 'ease-in-out',
      pseudoElement: '::view-transition-new(root)',
    }
  );
}, [theme, setTheme, prefersReducedMotion]);
```

```css
/* CSS for View Transitions API cleanup */
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}
```

### Pattern 4: Playful Spring Config (motion/react)
**What:** Consistent spring physics matching "playful + bouncy" personality with visible overshoot
**When to use:** All micro-interactions

```typescript
// Shared spring configs for consistency across the app
export const SPRING_BOUNCY = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 15,    // Lower damping = more overshoot/bounce
  mass: 0.8,
};

export const SPRING_SNAPPY = {
  type: 'spring' as const,
  stiffness: 500,
  damping: 25,    // Medium damping for snappy-but-bouncy
};

export const SPRING_GENTLE = {
  type: 'spring' as const,
  stiffness: 200,
  damping: 20,    // Gentle for larger elements
};

// Button press: scale 95% + spring back
<motion.button
  whileTap={{ scale: 0.95 }}
  whileHover={{ scale: 1.03 }}
  transition={SPRING_BOUNCY}
/>

// Card lift on hover
<motion.div
  whileHover={{ y: -4, boxShadow: '...' }}
  transition={SPRING_GENTLE}
/>
```

### Pattern 5: Gradient Mesh Background (Fixed)
**What:** Non-scrolling gradient mesh that content scrolls over, different in dark mode
**When to use:** Applied to body::before (already exists, needs upgrading)

```css
/* Upgrade existing body::before to match user decisions */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -1;
  background:
    radial-gradient(ellipse at 15% 20%, hsl(var(--color-accent-purple) / 0.18), transparent 55%),
    radial-gradient(ellipse at 80% 10%, hsl(var(--color-primary) / 0.2), transparent 55%),
    radial-gradient(ellipse at 50% 80%, hsl(var(--color-primary) / 0.12), transparent 60%);
  filter: blur(80px);
  opacity: 1;
}

/* Dark mode: deep purple + dark magenta (richer/more dramatic) */
.dark body::before {
  background:
    radial-gradient(ellipse at 10% 20%, hsl(var(--color-accent-purple) / 0.3), transparent 55%),
    radial-gradient(ellipse at 85% 10%, hsl(270 60% 30% / 0.25), transparent 60%),
    radial-gradient(ellipse at 50% 85%, hsl(320 60% 25% / 0.2), transparent 60%);
  opacity: 0.7;
}
```

### Anti-Patterns to Avoid
- **Nested backdrop-filter layers:** Stacking multiple backdrop-filter elements degrades performance significantly. Use a single backdrop-filter per visual layer.
- **Animating backdrop-filter blur value:** The blur radius should not be animated -- it triggers heavy repaints. Set blur once, animate other properties (opacity, scale, color).
- **Using motion/react for continuous infinite animations:** For always-on shimmer borders, use CSS @keyframes, not motion/react. Motion's spring system is for interactive/one-shot animations.
- **Forgetting -webkit-backdrop-filter:** Safari still requires the -webkit prefix for backdrop-filter. Always include both.
- **box-shadow on prismatic pseudo-element:** Avoid heavy box-shadow on the `::before` used for the conic-gradient border; use `filter: blur()` on the pseudo-element instead for glow effects.
- **motion `transform` overriding CSS centering:** If a glass element uses `translateX(-50%)` for centering, motion/react inline `transform` will override it. Use flexbox centering instead (from MEMORY.md pitfall).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Spring physics | Custom JS spring math | motion/react `type: 'spring'` | Battle-tested spring solver, handles reduced motion |
| Animated border gradient | JS-animated border with requestAnimationFrame | CSS `@property` + `conic-gradient` + `@keyframes` | Pure CSS, zero JS overhead, GPU-composited |
| Circular reveal animation | Custom clip-path animation with JS | View Transitions API `document.startViewTransition` | Native browser API, handles state synchronization |
| Accessible progress bar | Custom div with ARIA | `@radix-ui/react-progress` (already used) | Handles all ARIA roles and announcements |
| Confetti effects | Custom canvas particles | `react-canvas-confetti` (already used) | Performant, well-tested |
| Reduced motion detection | Custom media query listener | `useReducedMotion` from motion/react (already used) | Reactive, handles SSR |

**Key insight:** This phase is about upgrading visual quality, not building new infrastructure. The app already has the right libraries; the work is applying them more consistently and at higher fidelity.

## Common Pitfalls

### Pitfall 1: Backdrop-filter Performance on Many Surfaces
**What goes wrong:** Having 10+ elements with backdrop-filter visible simultaneously causes janky scrolling, especially on mobile.
**Why it happens:** Each backdrop-filter element requires the browser to composite the blurred content behind it on every frame.
**How to avoid:** (1) Use `will-change: backdrop-filter` sparingly on fixed elements (nav, bottom bar). (2) For scrollable card lists, consider reducing blur to 8-12px for cards that appear many at once. (3) The glass tiers help -- only nav/modals get the heavy 32px blur. (4) Test on a mid-range Android device (not just desktop).
**Warning signs:** Frame drops below 30fps during scroll on Chrome DevTools Performance tab.

### Pitfall 2: CSS @property Not Working in Older Firefox
**What goes wrong:** Firefox versions below 128 don't support `@property`, so the conic-gradient angle can't be animated.
**Why it happens:** `@property` is relatively new in Firefox (added in v128, July 2024).
**How to avoid:** The project's browserslist targets Firefox 140+, so this is not an issue. But include a `@supports` fallback for any users on older browsers: a static gradient border if the animation doesn't work.
**Warning signs:** Border appears but doesn't animate in older Firefox.

### Pitfall 3: View Transitions API Blocking UI
**What goes wrong:** If `flushSync` is used improperly, the theme toggle can freeze the UI.
**Why it happens:** `flushSync` forces synchronous React rendering. If the render is expensive, it blocks.
**How to avoid:** (1) Check `document.startViewTransition` existence before using. (2) Wrap in try-catch. (3) Keep the theme toggle render path lightweight. (4) Fall back to instant theme switch if transition fails.
**Warning signs:** UI freezes for 100ms+ during theme toggle.

### Pitfall 4: Prismatic Border on Rounded Corners
**What goes wrong:** The conic-gradient pseudo-element doesn't clip properly to rounded corners.
**Why it happens:** `border-radius` on the parent doesn't automatically apply to the pseudo-element's mask.
**How to avoid:** Use `border-radius: inherit` on the `::before` pseudo-element AND use `-webkit-mask` with `content-box`/`border-box` exclusion. The mask-composite approach shown in Pattern 2 handles this correctly.
**Warning signs:** Gradient visible in corners as squares instead of following the rounded border.

### Pitfall 5: React Compiler Violations
**What goes wrong:** Adding `useRef` for tracking animation state or using `.current` during render triggers React Compiler ESLint errors.
**Why it happens:** The project uses strict React Compiler ESLint rules (from MEMORY.md).
**How to avoid:** (1) Use `useState` for any state needed during render. (2) Only access ref `.current` inside effects and event handlers. (3) Don't use `useMemo<Type>()` generic syntax -- use `const x: Type = useMemo()`.
**Warning signs:** ESLint errors mentioning `react-hooks/refs` or `react-hooks/set-state-in-effect`.

### Pitfall 6: motion/react Transform Override
**What goes wrong:** Using motion's `animate` prop with transform properties overrides existing CSS transforms like `translateX(-50%)` centering.
**Why it happens:** motion/react applies inline `transform` style, which takes precedence over CSS classes.
**How to avoid:** Use flexbox centering (`items-center justify-center`) instead of translate-based centering on any element that will receive motion animations. Already documented in MEMORY.md.
**Warning signs:** Elements jump to unexpected positions when animation starts.

### Pitfall 7: CSP Hash Invalidation
**What goes wrong:** If the theme script in `_document.tsx` is modified (for View Transitions), the CSP hash must be updated in middleware.ts.
**Why it happens:** The project uses hash-based CSP allowlisting (not nonce).
**How to avoid:** If the circular reveal requires changes to the blocking theme script, update the SHA-256 hash. However, the View Transitions code should live in ThemeContext.tsx (client-side), not in the blocking script, so this likely won't be an issue.
**Warning signs:** CSP violation errors in browser console after deploying.

## Code Examples

### Upgrading GlassCard Component (Tier API)
```typescript
// Source: Codebase pattern from src/components/hub/GlassCard.tsx
// Move to src/components/ui/GlassCard.tsx with tier support

type GlassTier = 'light' | 'medium' | 'heavy';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  tier?: GlassTier;
  interactive?: boolean;
  className?: string;
}

const TIER_CLASSES: Record<GlassTier, string> = {
  light: 'glass-light prismatic-border',
  medium: 'glass-medium prismatic-border',
  heavy: 'glass-heavy prismatic-border',
};

export function GlassCard({
  children,
  tier = 'light',
  interactive = false,
  className,
  ...rest
}: GlassCardProps) {
  return (
    <div
      className={clsx(
        TIER_CLASSES[tier],
        interactive && 'glass-card-interactive',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
```

### Spring Button Press with Triple Feedback
```typescript
// Source: motion/react docs -- spring animation pattern
// Applied to existing Button.tsx

const motionVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.03 },
  tap: { scale: 0.95 },  // User decision: 95% scale
};

// Triple feedback: scale (motion) + glow flare (CSS) + color shift (CSS transition)
<motion.button
  variants={motionVariants}
  initial="idle"
  whileHover="hover"
  whileTap="tap"
  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
  className={clsx(
    // Existing button classes
    'transition-[box-shadow,background-color] duration-150',
    // Prismatic glow on press (CSS handles this)
    'active:shadow-[0_0_20px_hsl(var(--color-primary)/0.4)]',
  )}
/>
```

### Staggered Spring Pop Entrance
```typescript
// Source: motion/react docs -- staggerChildren pattern
// Upgrade StaggeredList to use bouncy springs

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 15,  // Bouncy with overshoot
    },
  },
};
```

### Flashcard Spring Bounce Past 180 Degrees
```typescript
// Source: motion/react spring with overshoot
// Flashcard flip with visible bounce past 180deg

<motion.div
  animate={{ rotateY: isFlipped ? 180 : 0 }}
  transition={{
    type: 'spring',
    stiffness: 250,
    damping: 18,   // Allows slight overshoot past 180
    mass: 0.8,
  }}
  style={{ transformStyle: 'preserve-3d' }}
/>
```

### Loading Skeleton with Prismatic Shimmer
```css
/* Replace existing skeleton-shimmer with prismatic version */
.skeleton-prismatic {
  background: linear-gradient(
    90deg,
    hsl(var(--muted)) 0%,
    hsl(280 60% 70% / 0.15) 25%,
    hsl(200 80% 65% / 0.2) 50%,
    hsl(280 60% 70% / 0.15) 75%,
    hsl(var(--muted)) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

## Discretion Recommendations

### Glass Surface Opacity Levels Per Tier
**Recommendation:** Light mode: heavy=0.45, medium=0.55, light=0.65. Dark mode: heavy=0.35, medium=0.45, light=0.5. These values keep text readable while showing enough backdrop content through the glass.
**Confidence:** MEDIUM -- will need visual tuning during implementation.

### Backdrop-filter Fallback Strategy
**Recommendation:** Use `@supports not (backdrop-filter: blur(1px))` to provide opaque backgrounds with 95% opacity. This already exists partially in globals.css for `.glass-card`. Extend to all three tiers. Op-mini is in the browserslist (supports none of this) -- fallback to solid backgrounds.
**Confidence:** HIGH -- existing pattern works, just needs extension.

### GlassCard Component API Design
**Recommendation:** Use a `tier` prop with union type `'light' | 'medium' | 'heavy'` defaulting to `'light'`. Move GlassCard from `hub/` to `ui/` to make it available app-wide. Keep `className` for overrides. The old `glass-card` CSS class stays for backward compatibility but maps to the `light` tier.
**Confidence:** HIGH -- clean API, backward compatible.

### Shimmer Animation Speed
**Recommendation:** Nav/sidebar (large surfaces): 6s rotation. Cards (medium): 4s rotation. Small elements (badges, pills): 3s rotation. Faster rotation on smaller surfaces creates a more lively feel. Same speed light and dark (user decision).
**Confidence:** MEDIUM -- aesthetic judgment, may need tuning.

### Tap Spacing Enforcement
**Recommendation:** Audit these areas: (1) Bottom tab bar icons -- currently 60px min-width, 56px min-height -- adequate but should verify icon+label combined target hits 48px. (2) Study guide category rows -- currently using `interactive-tile` which is a tappable card, may need padding increase. (3) Settings page form controls. (4) Interview SelfGradeButtons.
**Confidence:** HIGH -- just needs a pass through each component to verify/adjust.

### Mock Test Button Sizing
**Recommendation:** Audit the AnswerFeedback.tsx and TestPage answer options. The Button component already enforces 44px min-height for `md` size. Ensure all answer buttons use `size="md"` or larger.
**Confidence:** HIGH -- Button component already handles this.

### Dark Mode Text Warmth
**Recommendation:** Keep text-primary at `210 40% 98%` (near-white, slightly cool). For text on purple-tinted glass surfaces, use `210 30% 95%` (slightly warmer). Check WCAG AA (4.5:1) against the purple-tinted dark glass backgrounds. The surface color `222 47% 14%` with `210 40% 98%` text gives ~15:1 contrast ratio, well above AA.
**Confidence:** HIGH -- can verify with contrast checker.

### Dark Mode Image/Icon Treatment
**Recommendation:** (1) Lucide icons: already adapt via `text-*` color classes, no changes needed. (2) Flags (AmericanFlag, MyanmarFlag): decorative, keep as-is. (3) Gradient overlays on hero cards: increase saturation in dark mode by adjusting opacity from 15% to 25-30%.
**Confidence:** HIGH -- icons are already color-token based.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| JS border animation | CSS `@property` + `conic-gradient` | 2024 (Firefox 128) | Pure CSS animated gradient borders, no JS |
| clip-path theme reveal | View Transitions API | Oct 2025 (Baseline) | Native browser API for theme transitions |
| Custom spring math | motion/react spring solver | Stable since 2023 | Reliable spring physics with `bounce` param |
| -webkit-backdrop-filter only | `backdrop-filter` (unprefixed) | 2023 (Safari 18) | Still need `-webkit-` prefix for Safari |

## Open Questions

1. **Overscroll rubber-band on non-iOS**
   - What we know: iOS Safari has native rubber-band overscroll. Chrome/Firefox don't by default.
   - What's unclear: CSS `overscroll-behavior: auto` enables native behavior where available but Chrome shows a "glow" effect, not rubber-band. True rubber-band requires custom JS (which conflicts with native scrolling).
   - Recommendation: Set `overscroll-behavior: auto` and accept platform-native overscroll behavior. iOS gets rubber-band, Chrome gets its native glow/overscroll. Don't fight the platform.

2. **Performance of many simultaneous prismatic borders**
   - What we know: Each prismatic border uses a `::before` pseudo-element with `conic-gradient` and CSS animation. GPU-composited.
   - What's unclear: How many simultaneous animated borders before performance degrades on mid-range mobile devices.
   - Recommendation: Profile on a mid-range device. If needed, reduce border animation to `will-change: --prismatic-angle` or pause off-screen animations with IntersectionObserver.

3. **View Transitions API with React 19 + Pages Router**
   - What we know: The API works with `flushSync`. React 19 has improved concurrent features.
   - What's unclear: Any edge cases with React's concurrent renderer and View Transitions in Pages Router.
   - Recommendation: Wrap in try-catch with instant fallback. The theme toggle is non-critical UX -- graceful degradation is fine.

## Sources

### Primary (HIGH confidence)
- `/websites/motion_dev_react` (Context7) -- spring animation config, whileHover/whileTap, layoutId, layout animations
- `/websites/v3_tailwindcss` (Context7) -- backdrop-blur utilities, @supports modifier, keyframe animation config
- Codebase analysis -- 95+ components read, all CSS files, tailwind config, package.json, browserslist

### Secondary (MEDIUM confidence)
- [MDN View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API) -- browser support confirmed Baseline Newly Available
- [Akash Hamirwasia - Circular reveal with View Transitions](https://akashhamirwasia.com/blog/full-page-theme-toggle-animation-with-view-transitions-api/) -- implementation pattern for circular theme toggle
- [CodeTV - Animated CSS gradient borders](https://codetv.dev/blog/animated-css-gradient-border) -- @property + conic-gradient pattern for prismatic borders
- [Can I Use - View Transitions](https://caniuse.com/view-transitions) -- Chrome 111+, Safari 18+, Firefox 144+

### Tertiary (LOW confidence)
- Overscroll rubber-band behavior on non-iOS platforms -- no authoritative source for cross-platform rubber-band; platform-native behavior varies

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and battle-tested in codebase
- Architecture: HIGH -- patterns verified with Context7 and official docs; CSS @property and View Transitions have confirmed broad browser support
- Pitfalls: HIGH -- identified from codebase MEMORY.md patterns and cross-referenced with known issues
- Discretion items: MEDIUM -- opacity/speed values are aesthetic judgment that need visual tuning

**Research date:** 2026-02-11
**Valid until:** 2026-03-11 (stable domain, no fast-moving dependencies)
