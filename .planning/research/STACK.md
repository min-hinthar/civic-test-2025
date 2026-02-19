# Technology Stack: UX Polish Milestone

**Project:** Civic Test Prep 2025 - Duolingo-Level UX Polish
**Researched:** 2026-02-19
**Overall confidence:** HIGH

---

## Existing Stack (Validated in v1.0-v2.1 -- DO NOT RE-ADD)

| Technology | Current Version | Status | UX Polish Role |
|------------|----------------|--------|----------------|
| motion/react | 12.33.0 | **Keep -- primary animation engine** | Spring physics, drag gestures, layout transitions, page transitions, micro-interactions. Already used in 92 files. |
| react-canvas-confetti | 2.0.7 | **Keep -- confetti celebrations** | Already wrapped in `Confetti.tsx` with 3 intensity levels (sparkle/burst/celebration). Respects reduced motion. |
| react-countup | 6.5.3 | **Keep -- score animations** | `CountUpScore.tsx` and `OdometerNumber` already working. |
| react-countdown-circle-timer | 3.2.1 | **Keep -- timer UI** | Used in quiz/interview countdown displays. |
| tailwindcss-animate | 1.0.7 | **Keep -- CSS animation utilities** | Extends Tailwind with animation utility classes. |
| Tailwind CSS | 3.4.17 | **Keep -- utility-first styling** | Design token architecture (tokens.css) already mature with 3-tier glass, chunky shadows, spring easing curves. |
| lucide-react | 0.475.0 | **Keep -- icon library** | Consistent, tree-shakeable SVG icons. |
| Web Audio API (browser) | N/A | **Keep -- sound effects** | `soundEffects.ts` already has 14 synthesized sounds (correct, incorrect, level-up, milestone, fling, streak, etc.) using AudioContext oscillators. |
| @radix-ui/react-dialog | 1.1.15 | **Keep -- accessible modals** | Foundation for celebration overlays, achievement dialogs. |

**Key assessment:** The existing animation stack is already quite capable. The project has spring physics configs (`SPRING_BOUNCY`, `SPRING_SNAPPY`, `SPRING_GENTLE`), staggered animations, page transitions, 3D card flips, Tinder-style swipe gestures, confetti, count-up scores, streak rewards, and 14 synthesized sound effects. The gap is NOT missing libraries -- it is missing polish, consistency, and celebration moments.

---

## Recommended Stack Additions

### 1. @lottiefiles/dotlottie-react -- Rich Micro-Animations for Celebrations

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| @lottiefiles/dotlottie-react | ^0.18.1 | Designer-quality celebration/success/achievement animations | Confetti particles exist already, but Duolingo-level polish needs richer celebration animations: animated checkmarks, star bursts, trophy reveals, streak flame effects, badge unlocks. These are impractical to build from scratch with motion/react. DotLottie format is 80% smaller than Lottie JSON. |

**Confidence: HIGH** -- React 19 compatible (peer dep: `^17 || ^18 || ^19`). Published 17 days ago (actively maintained). 644K weekly downloads. Uses WASM renderer for 60fps performance. Duolingo themselves use Lottie for micro-animations and celebration effects.

**Why DotLottie, not plain lottie-react:**
- DotLottie format compresses animation JSON into `.lottie` (ZIP) files -- 80% smaller than raw Lottie JSON
- WASM-based renderer: 60fps vs lottie-web's 17fps in benchmarks with complex animations
- Lower CPU/memory: 32% CPU vs 92% for lottie-web, 7MB heap vs 17MB
- lottie-react v2.4.1 hasn't been updated in over a year; DotLottie is actively maintained by LottieFiles

**Why NOT Rive (@rive-app/react-canvas):**

| Criterion | DotLottie | Rive |
|-----------|-----------|------|
| Bundle size | ~51KB min+gzip (WASM) | ~44KB min+gzip + 78KB WASM module |
| Animation ecosystem | Massive (LottieFiles.com: thousands of free animations) | Smaller community, need to create from scratch |
| Designer workflow | After Effects export (industry standard) | Rive editor (proprietary tool, learning curve) |
| Use case fit | Pre-made celebration animations we download and use | Interactive characters we would need to design |
| Cost | Free animations on LottieFiles (Simple License) | Free editor, but animations must be created |

Rive is superior for interactive characters (like Duolingo's Duo owl reacting to answers), but this project does not have custom characters. We need pre-made celebration effects -- checkmarks, stars, confetti, trophies -- where the LottieFiles ecosystem is unmatched.

**Integration plan:**
```typescript
// Lazy-load DotLottie to avoid blocking initial page load
import { lazy, Suspense } from 'react';
const DotLottieReact = lazy(() =>
  import('@lottiefiles/dotlottie-react').then(m => ({ default: m.DotLottieReact }))
);

// Usage in celebration component
<Suspense fallback={null}>
  <DotLottieReact
    src="/animations/success-checkmark.lottie"
    autoplay
    loop={false}
    style={{ width: 120, height: 120 }}
  />
</Suspense>
```

**Animation file budget:**
- Each .lottie file: 5-20KB (vs 50-200KB raw JSON)
- Estimated 8-12 celebration animations needed
- Total: ~100-200KB in `public/animations/`
- Service worker caches on first use (runtime CacheFirst)

**Specific animations to source from LottieFiles:**
1. Success checkmark (correct answer)
2. Star burst (streak milestone)
3. Trophy / cup (test completion, high score)
4. Badge unlock (achievement earned)
5. Flame / fire (streak active)
6. Confetti rain (supplement canvas-confetti for variety)
7. Level-up glow (mastery progression)
8. Sparkle / shimmer (XP gain)

### 2. NO Additional Gesture Library Needed

**Assessment: motion/react's built-in gesture system is sufficient.**

The project already implements:
- **Tinder-style swipe** (`SwipeableCard.tsx`): horizontal drag with rotation, velocity-based commit, spring fling, snap-back. Includes bilingual zone labels.
- **Pan detection** with `onDragEnd` + `PanInfo` velocity/offset thresholds
- **Drag constraints** with `dragElastic` rubber-banding
- **Touch handling** with `touch-none` CSS and `active:cursor-grabbing`

What motion/react does NOT support (and we do NOT need):
- Pinch/zoom (not relevant for quiz cards)
- Multi-touch (not relevant for single-card interactions)
- Scroll gestures (handled by CSS `scroll-driven-animations` or `IntersectionObserver`)

**@use-gesture/react was evaluated and rejected:**
- Version 10.3.1 (last published 2 years ago, no React 19-specific updates)
- Would add ~12KB for gesture detection that motion/react already handles
- Creates two competing gesture systems (motion drag + use-gesture drag)
- The only value-add would be pinch/scroll gestures, which this project does not need

### 3. Vibration API (Browser Built-In) -- Haptic Feedback

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| navigator.vibrate() | Web API | Haptic feedback on correct/incorrect answers, milestone celebrations | Makes the app feel native on Android. Short 50ms buzz for correct, pattern [100, 50, 100] for milestone. Zero bundle cost -- it is a browser API. |

**Confidence: HIGH** -- Supported in Chrome (Android), Firefox (Android), Edge (Android). NOT supported in Safari/iOS (WebKit limitation). Must be called in response to user gesture (tap, not auto-play).

**Integration approach:**
```typescript
// src/lib/haptics.ts
export function hapticTap(): void {
  navigator.vibrate?.(50);
}

export function hapticSuccess(): void {
  navigator.vibrate?.([50, 30, 80]);
}

export function hapticMilestone(): void {
  navigator.vibrate?.([100, 50, 100, 50, 200]);
}

// Pair with existing sound effects:
// playCorrect() + hapticSuccess() on correct answer
// playMilestone() + hapticMilestone() on test completion
```

**No library needed.** The Vibration API is a single method (`navigator.vibrate()`). Feature-detect with `navigator.vibrate?.(pattern)`. Fails silently on iOS.

### 4. CSS Scroll-Driven Animations (Browser Built-In) -- Progress & Parallax

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| CSS `animation-timeline: scroll()` | CSS Spec | Scroll-linked progress bars, parallax effects, scroll-reveal transitions | Cross-browser baseline as of early 2026 (Chrome 115+, Firefox, Safari 26). Zero JavaScript overhead for scroll-triggered animations. Use for study guide progress, dashboard scroll reveals, and hub page parallax effects. |

**Confidence: MEDIUM** -- Safari 26 support is new (early 2026). The app's PWA target audience (mobile Chrome/Safari) should have support, but older Safari versions will need a fallback. Motion/react's `whileInView` is the graceful degradation path.

**Integration approach:**
```css
/* tokens.css addition */
@supports (animation-timeline: scroll()) {
  .scroll-progress-bar {
    animation: grow-progress linear;
    animation-timeline: scroll();
    transform-origin: left;
  }

  @keyframes grow-progress {
    from { transform: scaleX(0); }
    to { transform: scaleX(1); }
  }
}
```

**Fallback:** Use motion/react `useScroll()` + `useTransform()` for scroll-linked animations when CSS scroll-driven animations are not supported. This is what the project would naturally use anyway.

### 5. Playwright -- Visual Regression & E2E Testing for UX Consistency

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| @playwright/test | ^1.50.0 | Visual regression screenshot testing + E2E testing | Built-in `toMatchSnapshot()` and `toHaveScreenshot()` assertions for pixel-level visual regression. Catches unintended UI changes across light/dark themes, desktop/mobile viewports, and English/Burmese layouts. Free, local, no SaaS dependency. |

**Confidence: HIGH** -- Playwright is the industry standard for visual regression testing as of 2026. `toHaveScreenshot()` auto-generates baselines on first run, configurable `maxDiffPixels` threshold, built-in retry logic. No need for Chromatic ($150+/mo) or Percy ($599+/mo) for a project this size.

**Why Playwright over Chromatic/Percy:**

| Criterion | Playwright | Chromatic | Percy |
|-----------|-----------|-----------|-------|
| Cost | Free | $149+/mo | $599+/mo |
| Hosting | Local / CI | SaaS | SaaS |
| Integration | Standalone | Requires Storybook | Framework-agnostic |
| Storybook needed? | No | Yes | No |
| Setup complexity | Low (npm install) | Medium (Storybook + config) | Medium (CI integration) |
| False positive handling | `maxDiffPixels` threshold | Pixel-level diffing | AI-based (2025 update) |

This project does NOT use Storybook and adding it solely for visual regression testing would be significant overhead. Playwright tests can screenshot actual routes directly.

**Integration plan:**
```bash
pnpm add -D @playwright/test
npx playwright install chromium  # Just Chromium for visual testing
```

```typescript
// e2e/visual.spec.ts
import { test, expect } from '@playwright/test';

test('hub page light mode', async ({ page }) => {
  await page.goto('http://localhost:3000/#/');
  await expect(page).toHaveScreenshot('hub-light.png', {
    maxDiffPixels: 100,  // Allow minor rendering differences
  });
});

test('hub page dark mode', async ({ page }) => {
  await page.goto('http://localhost:3000/#/');
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await expect(page).toHaveScreenshot('hub-dark.png', {
    maxDiffPixels: 100,
  });
});

test('quiz mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:3000/#/test');
  await expect(page).toHaveScreenshot('quiz-mobile.png');
});
```

**Visual regression matrix:**
- 2 themes (light, dark)
- 2 viewports (desktop 1280x720, mobile 390x844)
- 5-8 key screens (hub, quiz, results, dashboard, interview, study guide)
- = 20-32 screenshot baselines

---

## Explicitly NOT Adding

### Rive (@rive-app/react-canvas) -- Overkill for This Project

Rive excels at interactive, stateful character animations (Duolingo's Duo owl). This project has no custom characters or interactive mascots. Pre-made Lottie animations from LottieFiles cover all celebration/feedback needs at lower cost and complexity.

### @use-gesture/react -- Redundant with motion/react

Motion/react v12 handles drag, pan, hover, tap, focus, and inView gestures. The project already uses drag gestures in `SwipeableCard.tsx` and `FlashcardStack.tsx`. @use-gesture would add a second gesture system fighting for pointer events.

### tsParticles -- Overkill for Confetti

`react-canvas-confetti` (already installed) handles confetti effects. tsParticles is a full particle system engine with a steep learning curve and large bundle size. The project needs celebration effects, not particle simulations.

### GSAP (GreenSock Animation Platform) -- Wrong Paradigm

GSAP uses imperative timeline-based animation, which conflicts with React's declarative model. Motion/react already provides spring physics, layout animations, and gesture support in a React-native way. Adding GSAP would create paradigm confusion.

### Storybook -- Not Justified for Visual Testing Alone

The project has 92 files using motion/react animations and a mature component library, but no Storybook. Adding Storybook solely for visual regression testing (via Chromatic) would be disproportionate. Playwright's built-in screenshot comparison achieves the same goal with less infrastructure.

### tailwindcss-motion Plugin -- Redundant

The `tailwindcss-motion` Tailwind plugin adds spring animation utilities as Tailwind classes. motion/react already handles all spring animations with more control. Using both would create confusion about which animation system to use for a given effect.

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Celebration animations | @lottiefiles/dotlottie-react | @rive-app/react-canvas | No custom characters needed; Lottie ecosystem has thousands of free animations |
| Celebration animations | @lottiefiles/dotlottie-react | lottie-react (v2.4.1) | DotLottie: 80% smaller files, WASM renderer (60fps vs 17fps), actively maintained |
| Gesture handling | motion/react (already installed) | @use-gesture/react (v10.3.1) | Adds competing gesture system; motion's drag/pan sufficient; last updated 2 years ago |
| Particle effects | react-canvas-confetti (already installed) | tsParticles | Overkill; steep learning curve; large bundle; confetti already works |
| Visual regression | Playwright toHaveScreenshot | Chromatic ($149+/mo) | Free, local, no Storybook needed |
| Visual regression | Playwright toHaveScreenshot | Percy ($599+/mo) | Cost; project doesn't need AI diff analysis at this scale |
| Haptic feedback | navigator.vibrate() (browser API) | react-native-haptics | PWA not React Native; browser API is sufficient |
| Scroll animations | CSS scroll-driven animations | scroll-trigger libraries | Browser-native; zero bundle cost; motion/react fallback available |
| Animation library | motion/react (already installed) | GSAP | Imperative vs declarative conflict; motion/react already mature in this codebase |

---

## Installation

```bash
# Runtime dependency (1 package)
pnpm add @lottiefiles/dotlottie-react

# Dev dependency (1 package)
pnpm add -D @playwright/test

# Browser setup for Playwright
npx playwright install chromium
```

**Total new packages: 2** (1 runtime, 1 dev).
Everything else is either already installed or a browser-native API.

---

## Bundle Impact Assessment

| Addition | Type | Size Impact | Notes |
|----------|------|-------------|-------|
| @lottiefiles/dotlottie-react | Runtime | ~51KB min+gzip (includes WASM renderer) | Lazy-load via React.lazy -- not in critical path |
| .lottie animation files | Static assets | ~100-200KB total (8-12 files) | Cached by service worker |
| Playwright | Dev only | 0KB client impact | E2E testing tool, not bundled |
| navigator.vibrate() | Browser API | 0KB | Already in browser |
| CSS scroll-driven animations | Browser CSS | 0KB | No JavaScript required |

**Total client bundle increase:** ~51KB gzipped (lazy-loaded, not blocking).
Compare to existing motion/react which is ~40KB gzipped. This is a reasonable trade for designer-quality celebration animations.

**Mitigation:** DotLottie React should be dynamically imported (`React.lazy`) so the WASM renderer only loads when a celebration animation is displayed, not on initial page load.

---

## Integration Points with Existing Stack

### DotLottie + Existing Confetti System

The two complement rather than compete:
- **react-canvas-confetti**: Continues to handle particle confetti effects (rain down from top, burst from center). Already has `Confetti.tsx` with 3 intensity levels.
- **DotLottie**: Handles shaped/themed animations (animated checkmark, trophy reveal, badge glow, star burst). These are pre-designed vector animations, not particle effects.

**Orchestration pattern:**
```typescript
// Celebration sequence: score reveals -> Lottie checkmark -> confetti burst -> haptic
const celebrateCorrectAnswer = () => {
  playCorrect();          // existing sound effect
  hapticSuccess();        // new Vibration API
  setShowCheckmark(true); // triggers DotLottie checkmark animation
};

const celebrateTestCompletion = () => {
  playMilestone();          // existing sound effect
  hapticMilestone();        // new Vibration API
  setShowTrophy(true);      // triggers DotLottie trophy animation
  setShowConfetti(true);    // triggers existing canvas confetti
};
```

### DotLottie + Reduced Motion

Follow the existing pattern from `Confetti.tsx`:
```typescript
const shouldReduceMotion = useReducedMotion();
if (shouldReduceMotion) {
  // Show static success icon instead of animated Lottie
  return <CheckCircle className="w-12 h-12 text-success" />;
}
return <DotLottieReact src="/animations/success.lottie" autoplay />;
```

### Playwright + Existing Vitest Suite

Playwright handles E2E and visual regression; Vitest handles unit/component tests:
- **Vitest**: Fast, JSDOM-based, ~700+ test scenarios. Continues for logic, hooks, component rendering.
- **Playwright**: Slow, real browser. Used for visual regression snapshots (20-32 screenshots) and critical user flows.
- **CI strategy**: Vitest runs on every PR; Playwright visual regression runs on PRs touching `src/components/` or `src/styles/`.

### Haptics + Existing Sound Effects

`soundEffects.ts` has module-level functions (`playCorrect()`, `playMilestone()`, etc.) called from event handlers. Haptics follow the same pattern:
```typescript
// Pair in the same event handler
const handleCorrectAnswer = () => {
  playCorrect();     // sound (existing)
  hapticTap();       // vibration (new)
};
```

Both respect the same user preference: if sounds are muted (`isSoundMuted()`), haptics should also be disabled. Add haptics to the existing `SOUND_MUTE_KEY` preference or create a parallel `HAPTIC_MUTE_KEY`.

### CSS Scroll Animations + Existing Token System

Add scroll-animation CSS custom properties to `tokens.css`:
```css
:root {
  --scroll-reveal-distance: 20px;
  --scroll-reveal-duration: var(--duration-slow);
}
```

Use `@supports (animation-timeline: scroll())` feature query to progressively enhance. Fallback to motion/react `whileInView` (already used in components like `SubcategoryBar.tsx`).

---

## Version Compatibility Matrix

| New Package | Compatible With | Verified |
|-------------|----------------|----------|
| @lottiefiles/dotlottie-react@0.18.1 | React ^17, ^18, ^19 | YES -- peer dep explicitly lists React 19 |
| @playwright/test@1.50.x | Node.js 18+, Chromium (bundled) | YES -- E2E tool, no React dependency |
| navigator.vibrate() | Chrome/Edge/Firefox on Android | YES -- MDN browser compat data. Not Safari/iOS. |
| CSS scroll-driven animations | Chrome 115+, Firefox, Safari 26+ | YES -- baseline as of early 2026 |

---

## Sources

### HIGH Confidence (Official Documentation, Verified Data)
- [npm: @lottiefiles/dotlottie-react](https://www.npmjs.com/package/@lottiefiles/dotlottie-react) -- v0.18.1, React 19 peer dep, published Feb 2026
- [npm: @rive-app/react-canvas](https://www.npmjs.com/package/@rive-app/react-canvas) -- v4.27.0, React 19 peer dep, 44KB
- [npm: @use-gesture/react](https://www.npmjs.com/package/@use-gesture/react) -- v10.3.1, last published 2 years ago
- [npm: lottie-react](https://www.npmjs.com/package/lottie-react) -- v2.4.1, React 19 peer dep
- [Motion gestures docs](https://motion.dev/docs/react-gestures) -- hover, tap, pan, drag, focus, inView
- [Motion drag docs](https://motion.dev/docs/react-drag) -- drag, dragConstraints, dragElastic, onDragEnd
- [Framer Motion pinch/zoom feature request (wontfix)](https://github.com/motiondivision/motion/issues/617)
- [Playwright visual comparisons docs](https://playwright.dev/docs/test-snapshots) -- toHaveScreenshot(), toMatchSnapshot()
- [MDN Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API) -- navigator.vibrate(), browser support
- [MDN CSS scroll-driven animations](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations) -- animation-timeline: scroll()

### MEDIUM Confidence (Multiple Sources Agree)
- [Duolingo LottieFiles case study](https://lottiefiles.com/case-studies/duolingo) -- Duolingo uses Lottie for micro-animations
- [Duolingo Rive character animations](https://elisawicki.blog/p/how-exactly-is-duolingo-using-rive) -- Rive for interactive characters, Lottie for celebrations
- [Lottie vs Rive performance comparison (Callstack)](https://www.callstack.com/blog/lottie-vs-rive-optimizing-mobile-app-animation) -- Rive 60fps / 2.6MB GPU vs Lottie 17fps / 149MB GPU (for lottie-web, not DotLottie WASM)
- [DotLottie bundle size discussion (GitHub)](https://github.com/LottieFiles/dotlottie-web/issues/357) -- v0.8+ increased to ~51KB min+gzip
- [Rive React optimization techniques (Pixel Point)](https://pixelpoint.io/blog/rive-react-optimizations/) -- Rive WASM 78KB, lazy loading patterns
- [CSS scroll-driven animations browser support](https://caniuse.com/mdn-css_properties_animation-timeline_scroll) -- Chrome 115+, Safari 26
- [Percy vs Chromatic comparison](https://medium.com/@crissyjoshua/percy-vs-chromatic-which-visual-regression-testing-tool-to-use-6cdce77238dc) -- Pricing, feature comparison
- [Playwright visual testing guide (Scott Logic)](https://blog.scottlogic.com/2025/02/12/playwright-visual-testing.html) -- Practical implementation patterns

### LOW Confidence (Needs Validation During Implementation)
- DotLottie WASM renderer performance on low-end Android devices -- benchmarks are from desktop/high-end mobile. Should be tested on actual target devices.
- LottieFiles Simple License terms for bundling in open-source PWA -- license permits commercial use but specific terms should be reviewed for this project's license.
- CSS scroll-driven animation support on older iOS Safari versions (pre-26) -- the fallback path (motion/react `whileInView`) handles this, but specific iOS adoption rates for Safari 26 should be monitored.

---

*Stack research for: Civic Test Prep 2025 - UX Polish Milestone*
*Researched: 2026-02-19*
*Key finding: Only 2 new packages needed (dotlottie-react + playwright). The existing stack (motion/react, react-canvas-confetti, sound effects, spring configs) is 80% of what Duolingo-level polish requires. The gap is celebration animation richness (solved by DotLottie), haptic feedback (browser API), and visual regression testing (Playwright). No new gesture library needed.*
