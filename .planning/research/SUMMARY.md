# Project Research Summary

**Project:** Civic Test Prep 2025 — Duolingo-Level UX Polish (v3.0)
**Domain:** Bilingual PWA UX elevation — celebration systems, animation consistency, mobile native feel
**Researched:** 2026-02-19
**Confidence:** HIGH

## Executive Summary

This milestone is an elevation, not a rebuild. The app already has 66K LOC, spring physics configs, 14 sound effects, 3D card flips, Tinder-style swipe gestures, and a mature 3-tier glass-morphism design system. The research conclusion is unambiguous: the gap between "good" and "Duolingo-level" in this codebase is not missing libraries or missing features — it is missing polish, consistency, and celebration choreography. Only 2 new packages are justified (`@lottiefiles/dotlottie-react` for designer-quality celebration animations, `@playwright/test` for visual regression coverage). Everything else needed already exists in the stack.

The recommended approach is to work through the codebase in dependency order: establish visual consistency first (spacing grid, typography scale, motion token unification), then layer on mobile native feel (PWA-specific CSS quick wins), then refine interactions and animations (stagger audits, exit animations, button press tiers), then elevate celebrations into a coordinated system (haptics + confetti + sound choreography via a unified `useCelebration` hook), then complete loading/empty/error states, and finally add the About page and validate content quality. The architectural principle is "extend, don't replace" — every new capability must compose with the existing provider hierarchy, design token system, and motion/react patterns.

The top risks are well-understood from 3 prior milestones of codebase history. GPU layer explosion from stacking `will-change` on top of existing `backdrop-filter` glass cards is the most dangerous — it crashes low-end Android devices. A confetti `setInterval` leak in the existing `Confetti.tsx` needs to be fixed before any new celebration work is built on top of it. The React Compiler ESLint rules will block naive animation patterns; the project-established workarounds (avoid setState in effects, use derived state for animation tracking) must be followed consistently.

---

## Key Findings

### Recommended Stack

The existing stack is already 80% of the way to Duolingo-level polish. `motion/react` (v12.33.0, used in 92 files), `react-canvas-confetti`, 14 Web Audio API sound effects, `Tailwind CSS` with a mature token system, and established spring presets (`SPRING_BOUNCY/SNAPPY/GENTLE`) cover the vast majority of animation needs.

**Core technologies:**
- `motion/react` (existing): Spring physics, drag gestures, layout transitions, page transitions — already the primary animation engine across 92 files
- `react-canvas-confetti` (existing): Confetti at 3 intensity levels, already wrapped in `Confetti.tsx`
- Web Audio API (existing): 14 synthesized sounds via `soundEffects.ts`; needs harmonic warming to move from functional to polished
- `@lottiefiles/dotlottie-react` (NEW, ~51KB lazy-loaded): Designer-quality celebration animations (checkmarks, trophies, badge glows, star bursts) that canvas-confetti cannot produce; DotLottie format is 80% smaller than raw Lottie JSON, WASM renderer at 60fps, React 19 compatible
- `navigator.vibrate()` (browser API, zero bundle): Haptic feedback on Android; graceful no-op on iOS; pairs with existing sound effects
- CSS scroll-driven animations (browser CSS, zero bundle): Scroll-linked progress bars and reveals; Chrome 115+, Safari 26+; motion/react `whileInView` as fallback
- `@playwright/test` (NEW, dev only): Visual regression screenshot testing; replaces need for $149+/mo Chromatic; 20-32 screenshot baselines covering themes x viewports x screens

**Explicitly rejected:** `@use-gesture/react` (redundant with motion/react v12 drag API), `tsParticles` (overkill over canvas-confetti), GSAP (imperative vs declarative conflict), Storybook (overhead unjustified at this team size), `lottie-react` v2.4.1 (abandoned, 17fps vs DotLottie's WASM renderer).

### Expected Features

Research distinguishes sharply between table stakes (polish that must exist for the app to feel finished) and differentiators (polish that creates delight).

**Must have (table stakes):**
- Spacing audit and 4px grid enforcement — inconsistent spacing is the #1 tell of an unpolished app
- Typography scale lockdown (5-6 sizes max) — current codebase likely uses the full Tailwind scale
- Consistent border radius rules — same component type should have the same radius across all screens
- Touch targets minimum 44x44px everywhere — WCAG 2.5.8 requirement; gaps likely in icon buttons and filter chips
- Skeleton screen coverage for all async content — every loading state must have a matching skeleton structure
- Empty state designs for zero-data screens — new users see empty dashboards, empty history, empty achievements
- Dark mode polish pass — glass panels need dark-specific contrast tuning; some components may have light-mode hardcoding

**Should have (differentiators):**
- Multi-stage celebration choreography — sequence score count-up to pass/fail reveal to confetti to sound to action buttons instead of simultaneous dump
- Achievement-scaled confetti intensity — map celebration weight to achievement significance
- Haptic feedback (`haptics.ts` utility) — tactile confirmation on Android for correct answers and milestones
- Warmer sound design via harmonics — add 2nd/3rd overtones to existing oscillator sounds
- XP counter in quiz session header with spring pulse on increment
- `overscroll-behavior: none` in PWA standalone mode — prevents rubber-band white flash
- Safe area inset handling — iPhone Dynamic Island support for BottomTabBar and GlassHeader
- Swipe-to-dismiss toasts — standard mobile gesture expectation
- Stagger coverage audit for all lists — inconsistent stagger (some lists stagger, some don't) is worse than none
- About page with mission statement and honoree tributes

**Defer to later milestone:**
- Shared layout animations (cross-page layoutId) — fragile with AnimatePresence mode="wait" and hash routing
- Swipe between bottom tabs — gesture conflicts with SwipeableCard in Study/Sort modes
- Character mascot/avatar — requires Hobbes-level animation investment to not feel gimmicky
- AI-powered adaptive features — SRS (ts-fsrs) already IS the adaptive engine; offline-first
- Gamified currency/shop — XP + badges are sufficient reward system

### Architecture Approach

The architecture introduces five capabilities, all built as extensions to existing infrastructure rather than new systems. A `useCelebration` hook plus `CelebrationOverlay` provides a unified fire-and-forget API that replaces ad-hoc celebration wiring in TestResultsScreen and MasteryMilestone. DOM CustomEvents (not a new React Context) decouple celebration triggers from the overlay, avoiding deepening the already 10-level provider hierarchy. Gesture primitives are extracted from SwipeableCard into reusable hooks (`useSwipeDismiss`, `useSwipeNavigation`) that return motion props for composability. PageTransition gains route-specific variants (slideUp for immersive modes, fade for auth/results reveals). Visual consistency is enforced via a static analysis audit script rather than Storybook overhead. AboutPage is a standalone route linked from Settings.

**Major components to create:**
1. `src/lib/celebrations/celebrationOrchestrator.ts` + `haptics.ts` — core orchestration with 5 preset levels (micro/small/medium/large/epic)
2. `src/hooks/useCelebration.ts` — hook API: `celebrate(level, overrides?)`
3. `src/components/celebrations/CelebrationOverlay.tsx` — portal-mounted, listens to DOM CustomEvents
4. `src/hooks/gestures/useSwipeDismiss.ts` + `useSwipeNavigation.ts` — reusable gesture abstractions
5. `src/components/animations/TransitionConfig.ts` — route-to-variant mapping for enhanced PageTransition
6. `src/pages/AboutPage.tsx` + route registration + Settings link
7. `scripts/audit-visual-consistency.ts` — static analysis for spacing, radius, touch targets, aria-labels

**Key constraint:** CelebrationOverlay mounts once in AppShell after NavigationProvider. No new provider added. `layoutId` restricted to within-page transitions only — cross-page shared elements break with `AnimatePresence mode="wait"`.

### Critical Pitfalls

1. **GPU layer explosion from will-change + backdrop-filter stacking** — The app has `backdrop-filter` on every glass card (each creates a GPU composite layer). Adding `will-change: transform` on animated elements compounds this multiplicatively. On low-end Android the browser evicts layers causing jank worse than no acceleration. Prevention: audit Chrome DevTools Layers panel before and after changes; budget max 20 composite layers per screen; never add `will-change` permanently in CSS.

2. **Confetti setInterval leak on navigation** — Existing `Confetti.tsx` celebration intensity creates a `setInterval` in a callback but never clears it in `useEffect` cleanup. Navigating mid-celebration leaves the interval running, causing memory leaks and console errors. Fix this before building any new celebration work on top. Add `intervalRef.current` plus cleanup return.

3. **AnimatePresence + React 19 Strict Mode double-mount** — React 19 Strict Mode's double-invoke breaks motion/react's internal presence tracking. Exit animations don't play or components become DOM zombies. Mitigation: always test transitions in production build (not just dev); use stable `key` props (pathname, not index); stay on motion/react v12.33+.

4. **backdrop-filter inside preserve-3d flattens 3D context** — Applying glass-morphism to children of 3D flip card containers collapses the 3D rendering context on Safari. The existing `Flashcard3D.tsx` already avoids this (documented in code comments). Any new celebration overlay or effect added to cards must not inject backdrop-filter into the 3D context.

5. **Staggered animation on long lists causes render delay** — StaggeredList with 128 questions at 60ms stagger equals a 7.68 second delay for the last item. Cap stagger to first 8-10 items; skip stagger entirely for lists longer than 15 items; reduce stagger timing proportionally to list length.

---

## Implications for Roadmap

Based on the combined research, 6 phases in dependency order:

### Phase 1: Visual Foundation
**Rationale:** Visual consistency is the prerequisite for all subsequent work. Celebration choreography, skeleton states, and the About page all inherit from the design foundation. Auditing spacing and typography first means subsequent phases don't introduce new inconsistencies.
**Delivers:** Consistent 4px spacing grid, 5-6 size typography scale, unified border radius rules, motion token alignment (CSS + JS), touch targets at 44x44px minimum across all interactive elements.
**Addresses:** Spacing audit, typography lockdown, border radius rules, touch target audit, motion token unification (FEATURES.md Phase 1)
**Avoids:** Visual inconsistency accumulation that would require revisiting finished screens; establishes clean foundation before adding new animation layers.
**Research flag:** Standard patterns — no deeper research needed. Tailwind, CSS auditing, and motion token conventions are well-understood.

### Phase 2: Mobile Native Feel
**Rationale:** These are almost entirely CSS-only or very small JS additions with the highest impact-to-effort ratio. `overscroll-behavior: none` is one line; safe area insets are four lines. Delivering this early gives the app an immediate "feels installed" improvement on every screen without touching component logic.
**Delivers:** `overscroll-behavior: none` in standalone mode, iPhone safe area insets on nav bars, `user-select: none` on interactive elements, swipe-to-dismiss toasts, keyboard-aware bottom positioning for virtual keyboard.
**Uses:** `navigator.vibrate()` (Vibration API), CSS env() for safe areas, motion/react drag for toast dismiss.
**Avoids:** Gesture conflicts (Pitfall 5) — applying `touch-action` correctly on each new swipeable element.
**Research flag:** Standard patterns — no deeper research needed.

### Phase 3: Interaction and Animation Polish
**Rationale:** After the visual foundation is set, animation refinement can be systematic rather than ad-hoc. The button press tier system and stagger audit benefit from the consistent spacing established in Phase 1.
**Delivers:** Consistent button press feedback tiers (3D chunky / subtle scale / opacity-only), stagger coverage for all lists, exit animations for all overlays, glass-morphism tier usage enforcement, dark mode polish pass.
**Implements:** Stagger cap (8-10 items max) from Pitfall 7; spring-only on transform properties, not layout properties (Pitfall 8).
**Avoids:** Spring overshoot causing layout shifts (Pitfall 8); inconsistent stagger making the app feel uneven.
**Research flag:** Standard patterns — motion/react docs and existing codebase patterns provide clear guidance.

### Phase 4: Celebration System Elevation
**Rationale:** The celebration system is the app's emotional peak. It builds on Phase 3's animation patterns and requires `haptics.ts`, `CelebrationOverlay`, and `useCelebration` hook to be built as a coherent architecture before migrating existing celebration surfaces.
**Delivers:** `haptics.ts` vibration utility, `useCelebration` hook + `CelebrationOverlay` (DOM event bus pattern), achievement-scaled confetti intensity, multi-stage TestResultsScreen choreography, `playCelebrationSequence()` sound function, harmonic-warmed oscillator sounds, XP counter in quiz header, DotLottie checkmark/trophy/badge animations.
**Uses:** `@lottiefiles/dotlottie-react` (lazy-loaded), Vibration API, existing `soundEffects.ts`, existing `Confetti.tsx` (after fixing setInterval leak from Pitfall 2).
**Avoids:** Confetti setInterval leak (Pitfall 2) — fix first before building on top; z-index wars (Pitfall 16) — define z-index scale in tokens before adding new overlay layers; sound/haptic timing offset from animation peak (Pitfall 20).
**Research flag:** Needs attention during planning. DotLottie WASM performance on low-end Android is unverified in benchmarks. LottieFiles animation license terms need review for open-source PWA. The multi-stage choreography sequencing requires careful implementation to avoid React Compiler ESLint violations (Pitfall 10).

### Phase 5: Loading, Empty, and Accessibility States
**Rationale:** These states are best audited together since they address the same screens and the same users (new users, screen reader users, reduced motion users). Doing this after animation polish means the final skeleton designs match the polished states they transition into.
**Delivers:** Skeleton screen coverage for all async screens, empty state designs (Dashboard/History/Achievements/SRS Deck), inline error recovery patterns, screen reader live region announcements for celebrations, reduced motion CSS completeness (CSS keyframes + transitions coverage), focus management on page transitions.
**Avoids:** Reduced motion users getting broken UX (Pitfall 9) — the reduced-motion path must preserve information, not just disable animation; Myanmar font layout shift (Pitfall 12) — verify @fontsource is the active import.
**Research flag:** Standard patterns — NN/g skeleton research, WCAG focus management, and existing reduced motion patterns in codebase provide clear guidance.

### Phase 6: Content Completeness and About Page
**Rationale:** Content and About page are independent of code polish and can be built last without blocking other phases. The About page can be built in parallel with Phases 2-5 if capacity allows.
**Delivers:** USCIS 2025 explanation validation (all 28 entries with complete fields), explanation quality audit across all 128 questions, About page with mission statement + bilingual dedication cards for honorees, Settings and LandingPage navigation integration.
**Addresses:** Mission-driven About page with dignified dedication cards; content consistency across the question bank.
**Research flag:** Standard patterns for the About page. The USCIS 2025 explanation validation is a data task requiring subject matter judgment, not a technical research task.

### Phase Ordering Rationale

- Visual Foundation before Animation Polish because spacing and typography create the canvas that animations should enhance, not fight against.
- Mobile Native Feel is Phase 2 because it is mostly CSS quick wins that benefit from the Phase 1 token foundation and deliver a fast, visible win.
- Animation Polish before Celebration Elevation because celebration choreography is the most sophisticated animation work and should build on consistent underlying patterns.
- Celebration Elevation before States because CelebrationOverlay, once mounted in AppShell, automatically covers all states where celebrations could trigger (including test results, which also show loading states).
- States and Accessibility together as Phase 5 because they share screens, share the reduced motion concern, and share the "does the user get the information they need" question.
- Content and About last because they are independent and can be parallelized or shifted without blocking anything.

### Research Flags

Phases needing deeper research during planning:
- **Phase 4 (Celebration):** DotLottie performance on low-end Android unverified; LottieFiles license terms for open-source PWA needs review; multi-stage choreography implementation needs careful React Compiler ESLint compliance design.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Visual Foundation):** CSS audit patterns, Tailwind token enforcement — well-documented.
- **Phase 2 (Mobile Native Feel):** PWA CSS properties, safe area insets — well-documented.
- **Phase 3 (Animation Polish):** motion/react patterns, stagger configurations — fully established in codebase.
- **Phase 5 (States):** Skeleton screens, empty states, WCAG focus — well-documented patterns.
- **Phase 6 (Content and About):** Standard page construction; USCIS content is a data review task.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Official npm data, React 19 compatibility verified, bundle sizes from Bundlephobia, existing stack validated across 3 milestones. DotLottie low-end Android performance is LOW confidence and needs device testing. |
| Features | HIGH | Duolingo UX research from official blog + Mobbin flows; UX principles from NN/g, Apple HIG, WCAG. Anti-features are well-argued with clear rationale. Note: FEATURES.md initially said no Lottie; STACK.md recommends DotLottie — follow STACK.md as the more thorough analysis. |
| Architecture | HIGH | Based on direct codebase analysis of existing files. DOM CustomEvent pattern for celebrations is well-established. Gesture hook abstraction pattern is proven by existing SwipeableCard implementation. |
| Pitfalls | HIGH | 6 critical pitfalls verified with official docs, GitHub issues, and direct codebase analysis. 8 moderate pitfalls with codebase evidence. 3 low-confidence minor pitfalls noted explicitly with confidence levels. |

**Overall confidence:** HIGH

### Gaps to Address

- **DotLottie low-end Android performance:** Benchmarks are from desktop/high-end mobile. During Phase 4 planning, plan a performance testing gate on actual low-end Android before committing to DotLottie as the celebration animation renderer.
- **LottieFiles Simple License:** Permits commercial use but specific terms for open-source PWA should be reviewed during Phase 4 planning before sourcing animations.
- **CSS scroll-driven animation iOS adoption:** Safari 26 support is new (early 2026). Monitor iOS 19 adoption rates; motion/react `whileInView` fallback is the safe path.
- **Myanmar font loading source:** `globals.css` appears to still import from Google Fonts CDN despite `@fontsource/noto-sans-myanmar` being in dependencies. Verify and consolidate during Phase 5 (or earlier as a quick fix).
- **USCIS 2025 explanations:** 28 entries were reviewed in a Claude initial pass (2026-02-18) but marked "pending 3-AI consensus." Phase 6 should treat these as needing a fresh quality pass.

---

## Sources

### Primary (HIGH confidence)
- Direct codebase analysis of `Confetti.tsx`, `PageTransition.tsx`, `SwipeableCard.tsx`, `Flashcard3D.tsx`, `motion-config.ts`, `globals.css`, `prismatic-border.css`, `animations.css`, `AppShell.tsx`, `soundEffects.ts`
- [npm: @lottiefiles/dotlottie-react](https://www.npmjs.com/package/@lottiefiles/dotlottie-react) — React 19 peer dep, WASM renderer, bundle size
- [Motion gestures docs](https://motion.dev/docs/react-gestures) — drag, pan, touch-action requirements
- [Playwright visual comparisons docs](https://playwright.dev/docs/test-snapshots) — toHaveScreenshot API
- [MDN Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API) — browser support matrix
- [MDN will-change](https://developer.mozilla.org/en-US/docs/Web/CSS/will-change) — layer creation warnings
- [web.dev CLS optimization](https://web.dev/articles/optimize-cls) — spring overshoot and layout shift
- [web.dev prefers-reduced-motion](https://web.dev/articles/prefers-reduced-motion) — accessible animation patterns
- Project MEMORY.md — documented pitfalls from v1.0, v2.0, v2.1 milestones
- [Duolingo streak milestone blog](https://blog.duolingo.com/streak-milestone-design-animation/) — official celebration design rationale
- [Duolingo Mobbin flow](https://mobbin.com/explore/flows/43d3b0b8-cb53-443e-918f-aaa7d445196e) — Android lesson flow reference

### Secondary (MEDIUM confidence)
- [Duolingo micro-interactions analysis](https://medium.com/@Bundu/little-touches-big-impact-the-micro-interactions-on-duolingo-d8377876f682) — stagger, haptics, celebration patterns
- [Duolingo Rive usage](https://elisawicki.blog/p/how-exactly-is-duolingo-using-rive) — why Rive for characters, Lottie for celebrations
- [Lottie vs Rive comparison (Callstack)](https://www.callstack.com/blog/lottie-vs-rive-optimizing-mobile-app-animation) — performance benchmarks
- [8pt grid system (Prototypr)](https://blog.prototypr.io/the-8pt-grid-consistent-spacing-in-ui-design-with-sketch-577e4f0fd520) — spacing system rationale
- [Skeleton screens (NN/g)](https://www.nngroup.com/articles/skeleton-screens/) — perceived performance research
- [Making PWAs feel native (gfor.rest)](https://www.gfor.rest/blog/making-pwas-feel-native) — overscroll, safe areas, user-select
- [motion/react issue #2668](https://github.com/framer/motion/issues/2668) — React 19 Strict Mode AnimatePresence bug
- [canvas-confetti issue #184](https://github.com/catdad/canvas-confetti/issues/184) — DOMException on navigation, cleanup pattern
- [Smashing Magazine GPU animation](https://www.smashingmagazine.com/2016/12/gpu-animation-doing-it-right/) — layer explosion, memory budgets
- [Josh W. Comeau: prefers-reduced-motion](https://www.joshwcomeau.com/react/prefers-reduced-motion/) — accessible animation patterns

### Tertiary (LOW confidence, needs validation)
- DotLottie WASM performance on low-end Android — no authoritative benchmarks found; needs device testing
- LottieFiles Simple License open-source PWA terms — legal interpretation needed
- CSS scroll-driven animations iOS 19 adoption rate — Safari 26 support new, real-world adoption unknown

---
*Research completed: 2026-02-19*
*Ready for roadmap: yes*
*Recommended phases: 6*
*Critical path: Phase 1 (Visual Foundation) -> Phase 3 (Animation Polish) -> Phase 4 (Celebration Elevation)*
*Parallel opportunity: Phase 6 (Content and About) can run alongside Phases 2-5*
