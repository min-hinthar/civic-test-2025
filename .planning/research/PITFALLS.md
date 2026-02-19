# Domain Pitfalls: UX Polish & Animation Refactor

**Domain:** Adding celebration animations, gesture systems, screen transitions, and visual consistency to an existing 66K LOC React 19 PWA with motion/react, glass-morphism, 3D CSS transforms, and bilingual content.
**Researched:** 2026-02-19
**Confidence:** HIGH (based on codebase analysis + verified external sources + project-specific known issues from 3 prior milestones)

---

## Critical Pitfalls

Mistakes that cause rewrites, major regressions, or user-facing breakage.

---

### Pitfall 1: GPU Layer Explosion from will-change and backdrop-filter Stacking

**What goes wrong:** Adding `will-change: transform` to many animated elements while the app already uses `backdrop-filter` on every glass card creates an explosion of GPU composite layers. Each layer consumes VRAM. On mobile devices with 1-2GB RAM, this causes the browser to evict layers constantly, producing worse jank than no hardware acceleration at all. Concrete example: 10 glass cards with prismatic borders + `will-change` on list items = ~40+ composite layers on a single screen.

**Why it happens:** Developers add `will-change` as a "performance fix" without realizing the app already promotes dozens of layers through `backdrop-filter` (each `glass-light`, `glass-medium`, `glass-heavy` element creates its own composite layer). The prismatic-border `::before` pseudo-elements with `animation: prismatic-rotate 4s linear infinite` also create layers. This compounds multiplicatively.

**Consequences:** App crashes on low-end Android devices. Memory usage spikes 50-200MB per screen. Scrolling becomes a slideshow. Battery drain accelerates dramatically.

**Prevention:**
- Audit composite layer count using Chrome DevTools > Layers panel before and after animation changes. Set a budget: max 20 composite layers per visible screen.
- Never add `will-change` in CSS stylesheets permanently. Only toggle it on via JS immediately before animation starts, remove it after animation completes.
- Reduce `backdrop-filter` usage on scroll-heavy lists. Use `glass-light` only on hero/header elements, not list items. Use opaque backgrounds for repeated items.
- Consider pausing prismatic-border animation on off-screen elements using IntersectionObserver.

**Detection:** Chrome DevTools > Performance tab > enable "Advanced rendering" > check "Composited layers". If layer count exceeds 30 on any screen, investigate.

**Confidence:** HIGH -- corroborated by Smashing Magazine GPU animation guide, MDN will-change docs, and the existing codebase already having 6+ glass tiers with backdrop-filter.

---

### Pitfall 2: Confetti setInterval Leak on Navigation

**What goes wrong:** The existing `Confetti` component's "celebration" intensity uses `setInterval` with a 3-second duration. If the user navigates away mid-celebration (via hash routing or browser back), the interval continues firing after unmount. The `refAnimationInstance.current` may become null (canvas removed from DOM), but the interval keeps calling it. This causes either silent errors or DOMExceptions.

**Why it happens:** The `useEffect` that triggers `fireConfetti()` does not return a cleanup function that clears the interval. The interval is created inside `fireConfetti()` which is a callback, not tracked by the effect lifecycle. React's cleanup only runs for effects, not for intervals started inside callbacks invoked by effects.

**Consequences:** Memory leak (interval holds reference to component closure). Console errors on navigation. On repeated celebrations without navigation (e.g., rapid badge earning), multiple intervals stack up creating a particle storm.

**Prevention:**
- Store interval ID in a ref and clear it in the `useEffect` cleanup: `return () => { if (intervalRef.current) clearInterval(intervalRef.current); }`
- Use `AbortController` or a `cancelled` flag pattern for the celebration loop instead of raw setInterval.
- Add a safety cleanup in the Confetti component's unmount effect that resets the canvas confetti instance.
- Test navigation during active celebrations as part of QA.

**Detection:** Navigate away during a "celebration" intensity confetti burst. Check browser console for errors. Use Chrome DevTools > Memory > Heap snapshot to verify no detached DOM trees from old confetti canvases.

**Confidence:** HIGH -- verified by reading the existing `Confetti.tsx` source code. The interval at line 90 has no cleanup path, and the `useEffect` at line 123 has no cleanup return. This is a known pattern from the canvas-confetti GitHub issue #184.

---

### Pitfall 3: AnimatePresence + React 19 Strict Mode Double-Mount Breaking Exit Animations

**What goes wrong:** React 19 Strict Mode double-invokes effects during development, which causes motion/react's `AnimatePresence` to lose track of which children are exiting. Exit animations either don't play at all, or components fail to unmount (they stay in DOM as invisible zombies consuming memory and event listeners).

**Why it happens:** motion/react tracks component presence internally. When React 19 Strict Mode mounts-unmounts-remounts a component, the library's internal tracking gets confused about whether a component is entering or exiting. This is documented in motion/react issue #2668.

**Consequences:** Exiting pages don't animate out. Stale components remain in the DOM. State from previous routes bleeds through. The `PageTransition` component (already using `AnimatePresence mode="wait"`) is the most affected since it wraps all route changes.

**Prevention:**
- Ensure motion/react is at v12.33+ (project currently has `^12.33.0`, verify it resolves to latest).
- If exit animations break in dev, do NOT disable Strict Mode as a workaround -- instead verify behavior in production build (`npm run build && npm run start`).
- For new `AnimatePresence` usage, always use unique `key` props that are stable identifiers (not array indices). The existing `PageTransition` correctly uses `location.pathname` as key.
- Avoid wrapping `AnimatePresence` children in React Fragments -- the library needs direct keyed children.

**Detection:** In development mode, navigate between routes rapidly. If the previous page content flashes or lingers, this is the bug. Test in production build to confirm it's a dev-only issue.

**Confidence:** HIGH -- confirmed by GitHub issue #2668 and the existing codebase already using React 19.2 with Strict Mode.

---

### Pitfall 4: Motion inline transform Overriding CSS Positioning (Already Hit, Will Recur)

**What goes wrong:** motion/react's `motion.div` applies inline `transform` styles that override CSS `transform` rules. This breaks CSS centering (`translateX(-50%)`), tooltip positioning, absolute positioning that relies on CSS transforms, and any element combining motion animation with CSS-based layout transforms.

**Why it happens:** When motion/react animates `x`, `y`, `scale`, or `rotate`, it sets an inline `style.transform` that completely replaces (not merges with) any CSS transform. A `motion.div` with `animate={{ scale: 1.05 }}` on an element that uses `transform: translateX(-50%)` for centering loses the centering.

**Consequences:** Elements jump to wrong positions. Centered modals/tooltips snap to the left edge. Flip cards break their 3D positioning. This was already encountered in the project (documented in MEMORY.md).

**Prevention:**
- Never combine motion animation props (`animate`, `whileHover`, `whileTap`) with CSS `transform` for layout positioning on the same element.
- Use flexbox/grid for centering instead of `transform: translate(-50%, -50%)`.
- For elements needing both motion animation AND CSS transforms, use a wrapper pattern: outer div handles CSS positioning, inner `motion.div` handles animation.
- The existing `Flashcard3D.tsx` already uses this pattern correctly (perspective container wraps motion inner).
- Audit all `motion.div` elements that also have Tailwind `translate-*`, `-translate-*`, `scale-*` classes.

**Detection:** Search codebase for `motion.` elements that also have `translate`, `rotate`, or `scale` in their `className` or `style` props. Each is a potential conflict point.

**Confidence:** HIGH -- this is a documented project pitfall from prior milestones and is an inherent design characteristic of motion/react.

---

### Pitfall 5: Gesture Drag Conflicts with Native Scroll on Mobile

**What goes wrong:** Adding drag gestures (swipe-to-dismiss, drag-to-reorder, horizontal carousels) conflicts with the browser's native scroll behavior. Users try to scroll vertically and accidentally trigger horizontal drag animations, or try to drag cards and the page scrolls instead.

**Why it happens:** Touch events on mobile don't distinguish between scroll intent and drag intent until a threshold is crossed. The browser's passive scroll listener fights with motion/react's drag handler. Without explicit `touch-action` CSS, the browser tries to handle both simultaneously.

**Consequences:** Frustrating UX where scrolling feels "sticky" or "fighting". Users accidentally swipe cards when trying to scroll. On iOS Safari, the rubber-band overscroll effect interferes with drag gestures near the top/bottom of the page.

**Prevention:**
- Always set `touch-action: pan-y` on horizontally draggable elements and `touch-action: pan-x` on vertically draggable elements. The existing `SwipeableCard` correctly uses `touch-none` (via Tailwind class) since it needs full drag control.
- For new draggable components, use motion's `drag` constraint props (`dragConstraints`, `dragElastic`, `dragDirectionLock`) to disambiguate direction.
- Set `overscroll-behavior: contain` on scrollable containers that contain draggable children to prevent pull-to-refresh interference.
- Test on actual iOS Safari (not just Chrome DevTools mobile emulation) -- Safari has unique gesture recognition behavior.

**Detection:** Test every draggable element on a real phone (or BrowserStack). Try scrolling through a list that contains draggable items. If the page scrolls instead of the element dragging (or vice versa), the `touch-action` is wrong.

**Confidence:** HIGH -- motion/react docs explicitly state: "For pan gestures to work correctly with touch input, the element needs touch scrolling to be disabled on either x/y or both axis with the touch-action CSS rule." The existing SwipeableCard already handles this correctly; the risk is in NEW gesture components not following the same pattern.

---

### Pitfall 6: backdrop-filter Inside preserve-3d Flattens 3D (Already Hit, Will Recur)

**What goes wrong:** Adding glass-morphism effects (`backdrop-filter: blur()`) to elements that are children of a `transform-style: preserve-3d` container silently collapses the 3D context. Flip cards become flat crossfades. Depth effects vanish.

**Why it happens:** The CSS spec states that certain properties (including `backdrop-filter`, `opacity < 1`, `overflow: hidden`, `isolation: isolate`) force the browser to flatten the 3D rendering context. Safari is strictest about this, Chrome somewhat more forgiving but inconsistent.

**Consequences:** 3D card flips stop working on mobile Safari. Cards appear to crossfade instead of rotating. The visual quality regression is subtle enough to miss in desktop Chrome testing but obvious on iOS.

**Prevention:**
- The existing `Flashcard3D.tsx` deliberately avoids `glass-light`/`prismatic-border` on card faces (documented in code comments at line 221-223). This pattern MUST be maintained.
- Create an ESLint rule or code review checklist: "No `backdrop-filter`, `glass-*`, `prismatic-border`, `isolation: isolate`, or `overflow: hidden` on children of `preserve-3d` containers."
- When adding new celebration overlays or effects to cards, verify they don't inject backdrop-filter into the 3D context.
- Test all 3D components on Safari (desktop and iOS) after any CSS changes.

**Detection:** Open the app on iOS Safari. Navigate to any 3D flip card. If the flip looks like a crossfade instead of a 3D rotation, a child has broken the 3D context.

**Confidence:** HIGH -- documented project pitfall from prior milestones, verified in both the MEMORY.md and the Flashcard3D.tsx code comments.

---

## Moderate Pitfalls

Issues that cause noticeable quality regressions or require targeted fixes.

---

### Pitfall 7: Staggered Animation on Long Lists Causing Initial Render Delay

**What goes wrong:** Applying `StaggeredList` with spring animations to lists of 20+ items means the last item doesn't appear until 20 * 60ms = 1.2 seconds after navigation. Users see a mostly-empty screen during this time. For the 128-question study guide, the delay would be 7.68 seconds.

**Why it happens:** Each item waits for the previous item's stagger delay before beginning its animation. Spring physics add overshoot time. The animation looks great for 5-8 items but becomes absurdly slow for long lists.

**Prevention:**
- Cap stagger to first 8-10 items. Items beyond the cap should render immediately at full opacity.
- Use a "viewport stagger" pattern: only stagger items as they enter the viewport via IntersectionObserver, not all at once.
- For long lists (>15 items), skip stagger entirely and use a single fade-in for the container.
- The existing `StaggeredList` has a `stagger` prop -- provide a computed value that decreases with list length: `stagger={Math.max(20, 60 - items.length * 2)}`.

**Detection:** Navigate to any screen with 15+ list items. If the last item takes more than 800ms to appear, the stagger is too aggressive.

**Confidence:** HIGH -- basic math on the existing stagger config (STAGGER_DEFAULT = 60ms).

---

### Pitfall 8: Spring Animation Overshoot Causing Layout Shifts (CLS)

**What goes wrong:** Spring animations with low damping (like `SPRING_BOUNCY` with damping: 15) cause elements to overshoot their target position. A card animating from `scale: 0.9` to `scale: 1` temporarily reaches `scale: 1.06` during overshoot. If this element isn't `position: absolute` or using `transform`, the overshoot pushes surrounding content, causing Cumulative Layout Shift (CLS) that hurts Core Web Vitals.

**Why it happens:** Spring physics inherently overshoot when damping ratio < 1 (underdamped). The `SPRING_BOUNCY` config has mass 0.8 and damping 15, which creates visible overshoot. This is intentional for the "playful" feel but problematic when the animated element is in document flow.

**Consequences:** Content below an animating element "jumps" during the overshoot phase. Text reflows. Buttons shift position, causing mis-taps on mobile. CLS score degrades.

**Prevention:**
- Only use spring scale/size animations on elements that are `position: absolute/fixed` or use `transform` (which doesn't affect layout).
- For elements in document flow, use `SPRING_SNAPPY` (damping: 25) or `SPRING_GENTLE` (damping: 20) which have less overshoot.
- For list items, animate `opacity` and `transform` only -- never `height`, `width`, `margin`, or `padding` with springs.
- Reserve `SPRING_BOUNCY` for isolated hero elements (badges, celebration icons) that are positioned absolutely.

**Detection:** Run Lighthouse on key pages. If CLS > 0.1, investigate which animations contribute by disabling them one at a time.

**Confidence:** HIGH -- the spring configs are defined in the codebase at `motion-config.ts`, and the physics are deterministic.

---

### Pitfall 9: Reduced Motion Users Getting Broken UX Instead of Simplified UX

**What goes wrong:** When a developer checks `shouldReduceMotion` and returns `null` or an empty fragment for a celebration, the user misses the entire interaction. They earned a badge but see nothing. They completed a streak but get no feedback. The reduced-motion experience becomes a degraded experience rather than an alternative experience.

**Why it happens:** Treating `prefers-reduced-motion` as "disable everything" rather than "provide alternative feedback." The existing `Confetti` component correctly returns null for reduced-motion, but the `BadgeCelebration` dialog should still appear (just without the confetti/spring-scale entrance).

**Consequences:** ~5% of users (35% of adults 40+ report vestibular issues, and this is a bilingual civics app likely used by older adults) miss critical feedback. They don't know they earned badges, hit streaks, or completed milestones.

**Prevention:**
- For celebrations: keep the informational content (dialog, text, badge icon) but remove the motion (no confetti, no spring bounce, no scale animation). Use simple fade-in with `duration: 0.15`.
- For transitions: use instant cut instead of slide/scale.
- For ongoing animations (shimmer, pulse, flame): use static states with distinct visual styling (e.g., a solid glow instead of animated shimmer).
- Audit every `shouldReduceMotion` check: if the reduced-motion path returns `null`, ask "Does the user still get the information they need?"
- The existing code mostly handles this well (StreakReward, XPPopup, PageTransition all have reduced-motion variants). Maintain this pattern in new code.

**Detection:** Enable "Reduce motion" in OS accessibility settings. Walk through the entire app flow. If any screen feels like information is missing compared to the full-motion version, fix it.

**Confidence:** HIGH -- verified by code review of existing reduced-motion handling and web.dev accessibility guidelines.

---

### Pitfall 10: React Compiler ESLint Rules Blocking Animation Patterns

**What goes wrong:** The React Compiler's ESLint rules (`set-state-in-effect`, `refs`) reject common animation patterns. Using `useRef` to track animation state (is animating, previous value) triggers `refs` rule violations when read during render. Using `setState` in animation callbacks that run inside effects triggers `set-state-in-effect` violations.

**Why it happens:** The React Compiler assumes patterns that read refs during render or set state in effects are bugs. For most React code, they are. But animation code legitimately needs to:
- Read a ref to check "is this animation currently running" during render (to conditionally render)
- Set state in animation completion callbacks (which may be called from within effects)
- Track previous values for animation direction calculation

**Consequences:** Lint errors block commits (pre-commit hook runs lint-staged). Developers either suppress the rule (unsafe) or restructure code in ways that break animation timing.

**Prevention:**
- Use the "adjust state when props change" pattern (setState during render, not in effect) for tracking previous values. The existing `PageTransition.tsx` demonstrates this at lines 69-72 with `prevPath` tracking.
- For animation-complete callbacks, ensure the setState is inside an event handler or promise chain (`.then(() => setState(...))`), not directly in the effect body. The `SwipeableCard` does this correctly.
- Use `useState(() => initialValue)` lazy init instead of `useRef(initialValue)` for render-time values.
- For genuinely needed ref reads during render (rare), use the escape hatch of extracting to a custom hook with an eslint-disable comment, documented with rationale.

**Detection:** Run `npm run lint` after every animation component change. If `set-state-in-effect` or `refs` errors appear, restructure using the patterns above rather than suppressing.

**Confidence:** HIGH -- documented in project MEMORY.md and verified against React official docs for the eslint rules.

---

### Pitfall 11: Prismatic Border Animation Running on Every Element Even Off-Screen

**What goes wrong:** The `prismatic-rotate` CSS animation runs continuously at 4-second intervals on every element with `prismatic-border` class, even when the element is scrolled off-screen. On a page with 20+ glass cards (each with prismatic border), this means 20+ perpetual CSS animations ticking in the background.

**Why it happens:** CSS animations don't pause when elements leave the viewport by default. The `glass-light`, `glass-medium`, and `glass-heavy` classes all apply `prismatic-border`, and these are used extensively throughout the app (nav, cards, containers, modals).

**Consequences:** Constant GPU work repainting gradient rotations. Battery drain on mobile. Frame budget consumed by off-screen animations, leaving less time for on-screen interactive animations.

**Prevention:**
- Use `content-visibility: auto` on list items and off-screen sections to let the browser skip rendering entirely.
- Apply `animation-play-state: paused` via IntersectionObserver for off-screen prismatic borders.
- Consider limiting prismatic borders to interactive/hero elements only. For list items, use a static border or no border.
- The reduced-motion media query already pauses the animation (`animation: none; --prismatic-angle: 45deg;`), which is correct.
- Consider using `@media (prefers-reduced-data: reduce)` to also disable the animation for data-saver users.

**Detection:** Open Chrome DevTools > Performance > Record while scrolling a long list of glass cards. If "Animation Frame Fired" events show continuous activity for off-screen elements, this is the issue.

**Confidence:** MEDIUM -- based on code review of `prismatic-border.css` and the widespread use of `glass-*` + `prismatic-border` class combination. Actual performance impact depends on how many elements use the class simultaneously.

---

### Pitfall 12: Myanmar Font Loading Causes Layout Shift on Bilingual Text

**What goes wrong:** Noto Sans Myanmar loads asynchronously from Google Fonts. Until it loads, the browser renders Myanmar text in a fallback font with different metrics (line height, character width). When the Myanmar font arrives, text reflashes (FOUT) and elements shift position.

**Why it happens:** The app loads the font via `@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Myanmar:wght@400;500;600;700&display=swap')` in `globals.css`. The `display=swap` strategy shows fallback text immediately, then swaps when the real font loads. Myanmar script in a Latin fallback font has dramatically different metrics.

**Consequences:** Cards resize when font loads. Flashcard content jumps. CLS score degrades. On slow connections, users see a flash of incorrectly-rendered Myanmar text.

**Prevention:**
- Use `@fontsource/noto-sans-myanmar` (already in dependencies!) instead of Google Fonts CDN. Self-hosting eliminates the network dependency and allows font to be included in the service worker cache.
- Verify that the `@fontsource` import is actually used (check if the CDN import in globals.css is the actual source or if fontsource is also loaded).
- Add `font-display: optional` for Myanmar font to prevent FOUT entirely on slow connections (accept invisible text briefly instead of shifting text).
- Set explicit `min-height` on containers that will contain Myanmar text to absorb the layout shift.
- Preload the Myanmar font: `<link rel="preload" href="/fonts/noto-sans-myanmar-*.woff2" as="font" type="font/woff2" crossorigin>`.

**Detection:** Throttle network to "Slow 3G" in DevTools. Navigate to a bilingual page. Watch for text jumping when the Myanmar font loads.

**Confidence:** MEDIUM -- the `@fontsource/noto-sans-myanmar` dependency exists in package.json but globals.css still imports from Google Fonts CDN, suggesting possible dual-loading or the fontsource import may not be in use. Needs verification.

---

### Pitfall 13: Service Worker Caching Stale Animation CSS/JS

**What goes wrong:** After deploying animation changes, users on the PWA continue seeing old animations because the service worker serves cached CSS/JS. The `@serwist/next` service worker uses precaching, which should handle versioned assets, but runtime-cached resources (Google Fonts CSS, external libraries loaded via CDN) can become stale.

**Why it happens:** Service workers have their own lifecycle separate from deployments. Even with proper precaching, the service worker only updates when the browser detects a byte-level change in the service worker file itself. If animation changes are in CSS custom properties or Tailwind utility classes (which get compiled into the same CSS chunk), the cache key may not change.

**Consequences:** Users see a mismatch between new component markup and old CSS (broken layouts, missing animations, wrong spring values). Users must force-refresh or clear site data.

**Prevention:**
- Ensure `@serwist/next` is configured with `reloadOnOnline: true` and proper cache versioning.
- Use `skipWaiting()` and `clientsClaim()` in the service worker to activate immediately.
- For major visual changes, bump the service worker version and implement an "Update available" banner prompting refresh.
- Test animation changes in an incognito window (no service worker) AND a regular window (with service worker) to verify both paths work.

**Detection:** Deploy a visual change. Open the PWA on a device that last loaded it before the change. If the old visuals persist, the cache is stale.

**Confidence:** MEDIUM -- the project uses `@serwist/next` which handles precaching well, but any deviation from the standard Next.js build output (custom CSS imports, external fonts) could bypass the precaching manifest.

---

## Minor Pitfalls

Issues that cause subtle quality issues or developer friction.

---

### Pitfall 14: WAAPI 2-Keyframe Limitation Breaking Multi-Step Animations

**What goes wrong:** The Web Animations API (used internally by motion/react for hardware acceleration) only supports 2-keyframe arrays in some contexts. Attempting to define multi-step animations like `scale: [0.85, 1.08, 1]` directly throws an error.

**Why it happens:** WAAPI's `element.animate()` has constraints on composite keyframe arrays that differ from CSS `@keyframes`. motion/react falls back to JS-driven animation when WAAPI can't handle the keyframes, but developers may assume all array-syntax keyframes work identically.

**Prevention:** Use spring physics for bounce effects instead of explicit multi-step keyframes. `SPRING_BOUNCY` naturally overshoots to ~1.08 before settling at 1.0, achieving the same effect with better performance.

**Confidence:** HIGH -- documented in project MEMORY.md as a known issue.

---

### Pitfall 15: AnimatePresence mode="wait" Blocking Rapid Navigation

**What goes wrong:** `AnimatePresence mode="wait"` prevents the new page from entering until the old page's exit animation completes. If exit animations take 150ms+ (the current exit transition in PageTransition is 150ms tween), rapid tab switching feels sluggish because users must wait for each exit before seeing the next page.

**Why it happens:** `mode="wait"` is synchronous: exit must complete before enter starts. This is correct for preventing two pages from overlapping but creates a perceived delay on fast navigation.

**Prevention:**
- Keep exit animation duration under 100ms for page transitions.
- Consider `mode="popLayout"` for tab-style navigation where overlap is acceptable.
- For the bottom tab bar, consider skipping exit animations entirely and using only enter animations.
- The current 150ms exit tween is borderline -- test by rapidly switching between all 5 main tabs.

**Confidence:** MEDIUM -- based on reading `PageTransition.tsx` exit transition config. Subjective feel depends on user testing.

---

### Pitfall 16: z-index Wars Between Celebrations, Modals, Navigation, and Toast

**What goes wrong:** Multiple overlay systems compete for visual stacking: Confetti (z-100), navigation (glass-heavy with z-index), Radix Dialog (portal-based), toast notifications, and new celebration effects. Adding more celebration animations without a z-index system causes overlays to appear behind navigation or confetti to appear behind modals.

**Why it happens:** Each component defines its own z-index independently. The Confetti component uses `zIndex: 100`, Radix Dialog uses a portal (which puts it at the end of the DOM, naturally on top), and navigation uses Tailwind z-utilities.

**Prevention:**
- Define a z-index scale in design tokens: `--z-base: 0`, `--z-sticky: 10`, `--z-nav: 20`, `--z-modal: 30`, `--z-toast: 40`, `--z-celebration: 50`, `--z-confetti: 60`.
- Audit all z-index values across the codebase before adding new celebration layers.
- Celebrations should be ABOVE modals but BELOW system-critical UI (toast errors, offline indicators).

**Confidence:** MEDIUM -- the current z-index usage is manageable but will become a problem as more overlay animations are added.

---

### Pitfall 17: Spring Physics Inconsistency Across Components

**What goes wrong:** Different developers (or different AI sessions) create animation components with ad-hoc spring configs instead of using the centralized `motion-config.ts` presets. The result is an inconsistent feel: one card bounces heavily while a similar card nearby has a stiff transition.

**Why it happens:** It's faster to write `transition={{ type: 'spring', stiffness: 300, damping: 20 }}` inline than to import from `motion-config.ts`. The existing codebase already has some inline spring configs (e.g., `BadgeCelebration` uses stiffness: 400, damping: 17 instead of `SPRING_BOUNCY` which is stiffness: 400, damping: 15).

**Prevention:**
- Expand `motion-config.ts` with additional presets for specific use cases: `SPRING_CELEBRATION` (high bounce for badges), `SPRING_FLIP` (the existing Flashcard3D config), `SPRING_DRAG_SNAPBACK` (the SwipeableCard snap-back config).
- Add an ESLint rule or code review guideline: "Spring config objects must be imported from motion-config.ts, not defined inline."
- Document which spring preset to use for each interaction type.

**Confidence:** MEDIUM -- based on code review showing 3-4 different inline spring configs across components.

---

### Pitfall 18: Fixed-Position Confetti Canvas Blocking Touch Events on iOS

**What goes wrong:** The Confetti component renders a `position: fixed; width: 100%; height: 100%` canvas covering the entire viewport. Although it has `pointer-events: none`, some iOS Safari versions inconsistently respect this on canvas elements, especially during active touch sequences.

**Why it happens:** iOS Safari has a history of quirks with `pointer-events: none` on large overlay elements, particularly when touch events are already in progress (mid-drag, mid-scroll).

**Prevention:**
- Add explicit touch event handlers that call `preventDefault()` and `stopPropagation()` on the confetti wrapper to prevent iOS from capturing touch sequences.
- Alternatively, only render the confetti canvas during the celebration window (mount it on fire=true, unmount after animation completes) rather than keeping it in the DOM permanently.
- Test confetti during active card dragging to verify no interaction conflict.

**Confidence:** LOW -- this is a known iOS Safari quirk but may not manifest in the current implementation. Test on actual iOS devices to verify.

---

### Pitfall 19: Bundle Size Creep from Animation Dependencies

**What goes wrong:** motion/react already contributes ~34kb minified+gzipped to the bundle. Adding more animation libraries (lottie, rive, gsap, react-spring alongside motion) for specialized effects bloats the bundle past the performance budget for a PWA that must work on slow connections.

**Why it happens:** Each celebration type seems to want a different tool. Confetti uses `canvas-confetti` (4.5kb). Particle effects might suggest `tsparticles` (50kb+). Lottie animations suggest `lottie-web` (65kb+). These add up fast.

**Prevention:**
- Stick with motion/react + canvas-confetti for all animation needs. Both are already in the dependency tree.
- Use CSS `@keyframes` for simple looping animations (shimmer, pulse, breathing) instead of motion/react components -- the codebase already does this well in `animations.css`.
- If Lottie/Rive is absolutely needed, use dynamic `import()` and only load the runtime when the celebration triggers, not at app startup.
- Use `LazyMotion` with `domAnimation` features (4.6kb initial) instead of the full `motion` component (34kb) for pages that only need basic animations.
- Monitor bundle size with the existing `@next/bundle-analyzer` dev dependency after every phase.

**Confidence:** HIGH -- bundle sizes verified via Bundlephobia. The project already has `@next/bundle-analyzer` in devDependencies for monitoring.

---

### Pitfall 20: Haptic Feedback and Sound Effects Not Synchronized with Animations

**What goes wrong:** Adding haptic feedback (vibration API) or sound effects (like the existing `playStreak()`) to celebrations without proper timing makes them feel disconnected. The sound plays at the start of the animation, but the visual climax (confetti burst, badge appear) happens 300ms later due to spring ramp-up.

**Why it happens:** Sound and haptics trigger immediately on the JS call, while spring animations take time to reach their peak. The gap between trigger and visual peak creates a disconnect.

**Prevention:**
- Trigger sound/haptics at the animation's peak, not at the start. Use motion/react's `onAnimationComplete` or a timed delay matching the spring's time-to-peak.
- For `SPRING_BOUNCY` (stiffness: 400, damping: 15, mass: 0.8), the overshoot peak occurs at approximately 120-150ms. Schedule haptics to fire at that offset.
- Use `requestAnimationFrame` for sound triggers to ensure they fire on a frame boundary.
- The existing `StreakReward` plays sound in a `useEffect` on mount -- this is close enough for a simple case but will feel off for elaborate multi-stage celebrations.

**Confidence:** LOW -- this is a polish concern that becomes noticeable only when the app reaches high-fidelity celebration sequences. Not a current issue but will matter as celebrations become more elaborate.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|---|---|---|
| Celebration animations (confetti, badges, streaks) | setInterval leak (#2), confetti canvas blocking touch (#18), z-index wars (#16) | Add cleanup to Confetti component first, define z-index scale in tokens |
| Screen transitions (page transitions, route animations) | AnimatePresence + Strict Mode (#3), mode="wait" blocking fast nav (#15), transform override (#4) | Test in production build, keep exit durations under 100ms |
| Gesture systems (swipe, drag, pull-to-refresh) | Touch/scroll conflict (#5), React Compiler lint blocking patterns (#10) | Always set touch-action CSS, use "adjust state when props change" pattern |
| Glass-morphism / visual consistency | GPU layer explosion (#1), backdrop-filter + preserve-3d (#6), prismatic animation battery drain (#11) | Audit layer count, restrict glass to hero elements, pause off-screen animations |
| Staggered list animations | Long list delay (#7), spring overshoot CLS (#8) | Cap stagger at 8-10 items, use transform-only animations |
| Reduced motion / accessibility | Broken UX instead of simplified UX (#9) | Audit every shouldReduceMotion check for information parity |
| Bilingual content + animations | Myanmar font layout shift (#12), text reflow during animation | Self-host font via @fontsource, set container min-heights |
| Bundle size / PWA performance | Animation library bloat (#19), service worker stale cache (#13) | Monitor with bundle-analyzer, test both SW and non-SW paths |
| Animation consistency | Spring inconsistency (#17), sound/haptic timing (#20) | Expand motion-config.ts presets, time sound to animation peak |

---

## Sources

### Verified with official documentation (HIGH confidence)
- [Motion performance docs](https://motion.dev/docs/performance) -- GPU-composited properties, WAAPI usage
- [Motion bundle size reduction](https://motion.dev/docs/react-reduce-bundle-size) -- LazyMotion, m component, sizes
- [Motion gesture docs](https://motion.dev/docs/react-gestures) -- touch-action requirements for drag
- [MDN will-change](https://developer.mozilla.org/en-US/docs/Web/CSS/will-change) -- layer creation warnings
- [MDN backface-visibility](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backface-visibility) -- 3D context flattening
- [React eslint-plugin-react-hooks set-state-in-effect](https://react.dev/reference/eslint-plugin-react-hooks/lints/set-state-in-effect) -- Compiler lint rules
- [web.dev animation performance](https://web.dev/articles/animations-overview) -- composited vs layout-triggering properties
- [web.dev prefers-reduced-motion](https://web.dev/articles/prefers-reduced-motion) -- accessibility guidance
- [web.dev CLS optimization](https://web.dev/articles/optimize-cls) -- layout shift from animations

### Community sources and issue trackers (MEDIUM confidence)
- [motion/react issue #2668: React 19 incompatibility](https://github.com/framer/motion/issues/2668) -- Strict Mode double-mount bug
- [motion/react issue #2172: layoutId + AnimatePresence unmount](https://github.com/motiondivision/motion/issues/2172) -- Exit animation failures
- [motion/react issue #625: AnimatePresence memory leak](https://github.com/motiondivision/motion/issues/625) -- Container leave/reenter mid-animation
- [canvas-confetti issue #184: DOMException on navigation](https://github.com/catdad/canvas-confetti/issues/184) -- Cleanup on unmount
- [mdn/browser-compat-data issue #25914: backdrop-filter Safari prefix](https://github.com/mdn/browser-compat-data/issues/25914) -- Still needs -webkit-prefix
- [Smashing Magazine: CSS GPU Animation](https://www.smashingmagazine.com/2016/12/gpu-animation-doing-it-right/) -- Layer explosion, memory budgets
- [Josh W. Comeau: prefers-reduced-motion in React](https://www.joshwcomeau.com/react/prefers-reduced-motion/) -- Accessible animation patterns
- [Framer Motion vs Motion One comparison](https://reactlibraries.com/blog/framer-motion-vs-motion-one-mobile-animation-performance-in-2025) -- Bundle size and WAAPI considerations
- [Bundlephobia: framer-motion](https://bundlephobia.com/package/framer-motion) -- Verified bundle sizes

### Project-specific verified findings (HIGH confidence)
- Codebase analysis: `Confetti.tsx`, `PageTransition.tsx`, `SwipeableCard.tsx`, `Flashcard3D.tsx`, `motion-config.ts`, `globals.css`, `prismatic-border.css`, `animations.css`
- Project MEMORY.md documented pitfalls from v1.0, v2.0, v2.1 milestones
