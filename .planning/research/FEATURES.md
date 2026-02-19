# Feature Landscape: v3.0 World-Class UX Elevation

**Domain:** Bilingual civics test prep PWA -- elevating existing features to Duolingo-level polish
**Researched:** 2026-02-19
**Focus:** Celebration choreography, visual consistency enforcement, mobile native feel, screen transition refinement, loading/empty states, About page, content completeness

## Context: What Already Exists (v2.1 Delivered)

The app already has strong bones. These features are BUILT and SHIPPED:

- Duolingo-style Check/Continue flow with slide-up FeedbackPanel (green/amber)
- 3D chunky buttons with `shadow-[0_4px_0]` + `active:translate-y-[3px]`
- Spring tab-switch animations (SPRING_BOUNCY, SPRING_SNAPPY, SPRING_GENTLE configs)
- Three-tier glass-morphism (light/medium/heavy) with dark mode variants
- Segmented progress bar with color-coded segments per question
- Streak/XP micro-reward system (XPPopup, StreakReward at milestones 3/5/7/10/15/20)
- Dashboard with NBA contextual CTA + CompactStatRow + CategoryPreviewCards
- Progress Hub with 4 tabs (Overview/Categories/History/Achievements)
- Flashcard sort with swipe gestures (SwipeableCard, SwipeableStack)
- Chat-style interview simulation with ExaminerCharacter + TypingIndicator
- 7-step onboarding tour (TourTooltip, WelcomeScreen)
- Bilingual UI throughout (BilingualText, BilingualHeading, BilingualButton)
- Sound effects: 14 distinct sounds via Web Audio API oscillators
- Direction-aware page transitions (PageTransition with AnimatePresence)
- Skeleton loaders (Skeleton, SkeletonCard, SkeletonAvatar, HubSkeleton)
- Confetti system with 3 intensity levels (sparkle/burst/celebration)
- CountUpScore animation for results screen
- StaggeredList/StaggeredItem with configurable timing
- Full design token system (tokens.css: primitives + semantic + dark mode + high contrast)
- Reduced motion support throughout (useReducedMotion hook)

**The goal is NOT to add new features. It is to make every existing feature feel world-class.**

---

## Table Stakes

Features users expect from a polished app. Missing = the product feels unfinished.

### Visual Consistency & Design System Hygiene

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Spacing audit & 4px grid enforcement** | Inconsistent spacing is the #1 tell of an unpolished app. Users notice uneven padding subconsciously. Duolingo uses a strict 8px grid with 4px subdivisions. The app uses Tailwind spacing (4px increments) but likely has ad-hoc values. | Med | Audit every screen against 4px base grid. Check for `p-[13px]` or arbitrary values. Enforce: padding = multiples of 4, margin = multiples of 4, gaps = multiples of 4. Tooling: custom ESLint rule or manual audit with checklist. |
| **Typography scale lockdown** | World-class apps use 5-7 font sizes max. Too many sizes creates visual noise. Current codebase likely uses Tailwind's full scale (text-xs through text-4xl) without strict rules. | Low | Audit and collapse to: caption (12px/`text-xs`), body-sm (14px/`text-sm`), body (16px/`text-base`), heading-sm (18px/`text-lg`), heading (24px/`text-2xl`), display (32px/`text-3xl`). Document which component types use which size. Remove any text-5xl, text-xl, or other off-scale usage. |
| **Consistent border radius rules** | Different screens use different radius values for similar components. Without rules, cards in Dashboard have `rounded-2xl` while Hub cards have `rounded-3xl`. | Low | Define: pills/badges = `rounded-full`, buttons = `rounded-xl` (already done for chunky buttons), cards = `rounded-2xl`, modals/sheets = `rounded-3xl`, inputs = `rounded-lg`. Audit every component and enforce. |
| **Touch target minimum 44x44px everywhere** | Apple HIG and WCAG 2.5.8 require 44px minimum. Users on phones will mis-tap smaller targets. Already mostly compliant but likely gaps. | Low | Audit candidates: SpeechButton icon variants (currently 32x32 visible with padding), filter chips in results, compact stat row items, small icon buttons in headers. Fix by adding padding/min-height even if visible area is smaller. |
| **Dark mode polish pass** | Every screen must look intentional in dark mode. Glass-morphism panels need dark-specific contrast tuning. Current dark tokens are well-structured but some components may have hardcoded light-mode assumptions. | Med | Focus: glass panel border visibility (borders disappear on dark navy backgrounds), shadow depth (current dark shadows may be too subtle), text contrast on glass surfaces, any inline styles bypassing token system. |

### Loading & Empty States

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Skeleton screen coverage for all async content** | `Skeleton.tsx`, `SkeletonCard`, `HubSkeleton` exist. Must cover ALL loading states: Dashboard (before NBA state resolves), Study Guide (before questions load), Settings (before user profile loads). Blank screens break the "always responsive" illusion. | Med | Rule: every screen that has ANY async data must show matching skeleton structure within 16ms of mount. Never show a white flash. Never show a spinner (skeleton > spinner for perceived performance, per NN/g research). |
| **Empty state designs for zero-data screens** | New users see empty dashboards, empty history, empty achievements. These moments set first impressions. Without empty states, the app looks broken. | Med | Priority screens: Dashboard (no sessions yet), Hub History (no test history), Hub Achievements (no badges), SRS Deck (no cards). Pattern: illustration-free design (icon + heading + subtext + CTA), bilingual, consistent layout. Avoid illustrations (scope creep, asset burden). |
| **Error state recovery patterns** | Inline errors (network failure, sync error, data load failure) should suggest what to do. ErrorBoundary exists for crashes; extend to inline recoverable errors. | Low | Pattern per error: icon + brief message + retry button + "go to dashboard" fallback. Bilingual error messages. Consistent placement (centered in the content area that failed). |

### Accessibility Completeness

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Focus management across all navigation** | When page transitions happen, focus should move to the main content heading. Modal/dialog focus should be trapped. Dismiss should return focus to trigger. FeedbackPanel already auto-focuses Continue button (good). | Med | Extend: on PageTransition completion, focus first `h1` or main content region. On modal dismiss, return focus to the element that opened it. Verify tab order makes sense on every screen. |
| **Reduced motion CSS completeness** | `useReducedMotion` hook covers JS animations (motion/react). CSS animations (`skeleton-shimmer`, hover transitions) need `@media (prefers-reduced-motion: reduce)` coverage. | Low | Audit all CSS keyframes and transitions. The shimmer animation should become a solid pulse or static gray. Hover scale/translate effects should become opacity-only. |
| **Screen reader announcement gaps** | FeedbackPanel and XPPopup have `aria-live`. Verify: confetti (sr-only "Congratulations!"), StreakReward (already has sr-only), page navigation changes, toast notifications, badge celebrations. | Low | Add sr-only live regions for: confetti fire events, badge earn moments, mastery milestone achievements. These currently have visual+audio feedback but no screen reader path. |

---

## Differentiators

Features that elevate from "good app" to "world-class app." Not expected, but deeply valued.

### Celebration System Elevation

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Achievement-scaled confetti intensity** | Duolingo scales celebration vibrancy to match achievement significance. A 3-streak feels different from passing the mock test. Currently confetti is triggered with pre-set intensity; tie it contextually. | Low | Map: correct answer = no confetti (too frequent), 5-streak = sparkle, 10-streak = burst, test pass = burst, 100% test = celebration, first badge = burst, mastery milestone = celebration. Review existing trigger points in TestResultsScreen and StreakReward. |
| **Multi-stage celebration choreography** | World-class results screens don't dump everything at once. They sequence: dim background -> container scales in -> score counts up -> pass/fail reveals -> confetti fires -> sound plays -> actions fade in. Timing creates drama. | High | Current TestResultsScreen shows CountUpScore + Confetti simultaneously. Implement sequenced choreography: (1) page enters 200ms, (2) score card scales in with SPRING_BOUNCY 300ms, (3) CountUpScore runs 1.5s, (4) pass/fail badge reveals 200ms after count finishes, (5) confetti fires at badge reveal, (6) sound plays (playMilestone), (7) action buttons stagger in 400ms later. Coordinate with `onComplete` callbacks. |
| **Score count-up with dramatic easing** | `CountUpScore.tsx` exists. Enhance: slow start, accelerating middle, decelerating landing (ease-in-out-cubic). The final number should "land" with a slight spring overshoot. Consider motion/react `AnimateNumber` for spring-physics number transitions. | Low | motion/react's `AnimateNumber` component (2.5kb) provides spring-physics number animation. Evaluate if it's worth adding vs. enhancing existing implementation. Existing impl uses requestAnimationFrame -- add easing curve. |
| **Haptic feedback on key moments** | Vibration API provides tactile confirmation on mobile. Supported on Chromium + Firefox Android. Pattern: 10ms tap on button press, 15ms on correct answer, [10,30,10] on incorrect, 50ms on milestone/badge. | Low | `navigator.vibrate()` with graceful degradation (no-op on Safari/iOS). Create `haptics.ts` utility with named patterns: `haptics.tap()`, `haptics.success()`, `haptics.error()`, `haptics.milestone()`. Integrate into: FeedbackPanel reveal, StreakReward, badge celebration, 3D button press. |
| **XP counter in quiz session header** | Duolingo shows running XP total during lessons. Current XPPopup is transient (floats up and fades). Add persistent counter in QuizHeader that pulses/scales when XP is added. | Low | Add XP total to QuizHeader next to question counter. On increment: spring scale animation (1 -> 1.15 -> 1 over 300ms). Gold/amber color matching XPPopup. Cumulative for the session. |

### Sound & Sonic Polish

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Warmer sound design via harmonics** | Current oscillator sounds are functional but thin (single sine waves). Adding harmonics (simultaneous overtones at 2x and 3x frequency, lower volume) creates warmth without adding dependencies. | Med | For each sound: add 2nd harmonic at 0.3x gain and 3rd harmonic at 0.15x gain. Add very short attack ramp (5ms) to prevent click artifacts. Add slight reverb via `ConvolverNode` with a short impulse response. Test on mobile speakers (tinny speakers benefit most from harmonics). |
| **Sound for celebration choreography** | Multi-stage celebration needs sound timed to the sequence. Current `playMilestone()` plays immediately. Need: quiet anticipation tone during count-up, then crescendo at reveal, then triumph chord with confetti. | Med | New composite sound function: `playCelebrationSequence(stage)` with stages: 'counting' (soft sustained pad), 'reveal' (ascending arpeggio), 'triumph' (full chord + octave). Each stage callable independently so choreography controls timing. |

### Screen Transition Refinement

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Stagger coverage audit** | StaggeredList exists but not all lists use it. Every list of items that renders on mount should stagger. Inconsistency (some lists stagger, some don't) is worse than no stagger at all. | Low | Audit all list renders: Dashboard category cards, Hub tab content, Study Guide question list, Badge grid, Leaderboard rows, Settings sections, Results question review. Wrap all in StaggeredList with appropriate timing (STAGGER_FAST for short lists, STAGGER_DEFAULT for medium, STAGGER_SLOW for long). |
| **Exit animations for overlay screens** | Settings, modals, and dialogs should animate out when dismissed. Current `AnimatePresence mode="wait"` handles page transitions. Verify all overlays have exit animations. | Low | Check: Dialog.tsx (does it fade/scale out?), WhatsNewModal, OnboardingTour tooltips, toast notifications. Add `exit` variants to any missing. Pattern: fade out + slight scale down (0.95) over 150ms. |
| **Consistent enter animation for cards** | Cards should have a consistent enter animation: scale from 0.95 to 1 + fade. Currently some cards animate (via StaggeredItem) and some don't. | Low | Create a standard `<AnimatedCard>` wrapper (or ensure all Card/GlassCard usages go through StaggeredItem). Convention: cards in lists = staggered, standalone cards = FadeIn, hero cards = spring scale-in. |

### Mobile Native Feel (PWA)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **`overscroll-behavior: none` in standalone** | Prevents rubber-banding white flash and accidental pull-to-refresh when app is installed as PWA. One CSS line, massive perceived-native improvement. | Low | `@media (display-mode: standalone) { html, body { overscroll-behavior: none; } }` |
| **Safe area inset handling** | iPhones with notch/Dynamic Island need `env(safe-area-inset-*)` padding. Without it, BottomTabBar overlaps with gesture bar. | Low | Add `viewport-fit=cover` to meta tag (may already exist). Apply `env(safe-area-inset-bottom)` as padding-bottom on BottomTabBar. Apply `env(safe-area-inset-top)` on GlassHeader. |
| **`user-select: none` on interactive elements** | Prevents accidental text selection on buttons, cards, tabs. Native apps never select text on tap. | Low | Global rule: `button, [role="button"], .interactive { user-select: none; }`. Keep `user-select: text` on question text, answer text, explanations, and study content. |
| **Keyboard-aware bottom positioning** | When virtual keyboard opens on mobile (e.g., interview text input), bottom-positioned elements hide behind keyboard. | Med | Track `window.visualViewport` resize. Set `--keyboard-offset` CSS variable. Apply to BottomTabBar and FeedbackPanel positioning. Fallback: hide BottomTabBar when keyboard is detected open. |
| **Swipe-to-dismiss toasts** | Toast notifications should be swipeable left/right to dismiss. Standard mobile gesture. | Low | Add `drag="x"` to toast container. On `onDragEnd`, if `offset.x > 100` or `< -100`, dismiss. Otherwise spring back to center. 200ms animation. |

### Button & Interaction Consistency

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Consistent press feedback system** | 3D chunky press exists on FeedbackPanel's Continue button. Other primary CTAs lack this tactile feedback. Every tap should FEEL responsive. | Low | Define tiers: **Primary CTA** = 3D chunky (`shadow-[0_4px_0]` + `active:translate-y-[3px]`), **Secondary** = subtle scale (`active:scale-[0.98]` + 100ms transition), **Tertiary/ghost** = opacity only (`active:opacity-70`). Audit all buttons and assign correct tier. |
| **Glass-morphism usage rules** | Three glass tiers exist but usage rules are implicit. Inconsistent application undermines the cohesive design language. | Low | Rule: **Light** = content cards within pages, **Medium** = persistent navigation (GlassHeader, BottomTabBar, Sidebar), **Heavy** = overlays, modals, bottom sheets. Audit all glass-panel usage. Document in a style guide comment in tokens.css. |
| **Motion token unification (CSS + JS)** | `motion-config.ts` defines spring constants. `tokens.css` defines `--ease-spring`, `--duration-fast`, etc. Some CSS transitions use ad-hoc values. Unify. | Low | Audit all CSS `transition` declarations. Replace ad-hoc durations/easings with token references. Ensure: fast interactions (100ms) use `--duration-fast`, normal (200ms) use `--duration-normal`, page-level (400ms) use `--duration-page`. |

### Content Completeness

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **USCIS 2025 explanation validation** | `uscis-2025-additions.ts` was verified 2026-02-18 (claude-initial-pass, pending 3-AI consensus). Validate all 28 explanations have complete fields: `brief_en`, `brief_my`, `mnemonic_en`, `mnemonic_my`, `citation`, `relatedQuestionIds`. | Med | Read through all 28 entries. Check for: missing fields, placeholder text, translation quality consistency, citation accuracy. Fill any gaps. This is a data task, not a code task. |
| **Explanation quality consistency audit (all 128)** | Variable explanation quality across the question bank. Some explanations are detailed, others terse. Consistent quality matters for learning. | Med | Audit all 128 questions for: brief explanation length (target: 1-3 sentences), Burmese translation presence and quality, mnemonic/memory tip presence, citation accuracy. Flag weak entries for rewrite. |

### About Page

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Mission-driven About page** | Personal, mission-driven apps need an About page. It builds trust, explains purpose, and creates emotional connection. Currently the app has no About page (only OpEdPage for TPS editorial). | Med | Route: `/about`. Design: glass-morphism cards with staggered entry. Sections: (1) Mission statement (bilingual), (2) "Who it's for" (Burmese families preparing for citizenship), (3) "Who inspired this" (Dwight D. Clark, Dorothy & James Guyot), (4) Credits/attribution, (5) Version info + links. |
| **Dedication cards for honorees** | Each inspirational figure deserves a dignified, beautiful presentation. Not a bullet point -- a dedicated glass card with their story. | Med | Card per honoree: name in display typography, life dates, relationship to the app's mission, meaningful quote or description. Bilingual where appropriate. Glass-morphism with subtle gradient accent. Respectful, warm tone. Entry animation: FadeIn with slight vertical offset. |
| **About page navigation integration** | About page should be accessible from Settings and from the landing page. Not hidden. | Low | Add "About" link in: SettingsPage (near bottom, grouped with "Privacy" and "Version"), LandingPage footer. Add route in AppShell.tsx. No auth required (public page). |

---

## Anti-Features

Features to explicitly NOT build. Each would add complexity without proportional value.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Character mascot/avatar system** | Duolingo's owl works because of massive investment (acquired Hobbes animation studio, uses Rive with 10+ mouth shapes and 20+ movements). A cheap mascot feels gimmicky. The app's personality comes from glass-morphism + sound + celebration. | Invest in the existing celebration system. Confetti + sound + haptics + choreographed timing create delight without illustration assets. |
| **Lottie/Rive animation files** | Adds ~50KB+ bundle size for animation player + JSON assets per animation. Current approach (CSS + motion/react springs + canvas-confetti + Web Audio) is zero-extra-dependency. External animation files also complicate offline-first caching. | Continue with motion/react spring animations + canvas-confetti + Web Audio API. This stack is lightweight, offline-friendly, and already 14 sounds deep. |
| **Complex shared layout animations** | motion/react `layoutId` morphing (card -> detail) is impressive but fragile. Requires careful ID coordination, breaks with hash routing, and conflicts with AnimatePresence page transitions. High risk of visual glitches. | Standard enter/exit animations for each screen. The direction-aware PageTransition is already good. Polish what exists rather than adding fragile new patterns. |
| **Swipe between bottom tabs** | GPay-style horizontal swipe to change tabs requires gesture disambiguation with vertical scroll, conflicts with SwipeableCard in Study/Sort modes, and adds significant complexity to every screen. | Keep tap-based tab navigation. The spring indicator animation already makes tab switching feel delightful. Focus on making existing transitions smoother rather than adding new gesture complexity. |
| **Pull-to-refresh** | Only useful on screens with refreshable server data (leaderboard). Most screens use local data (IndexedDB/localStorage). Adding pull-to-refresh to static screens confuses users. Custom implementation requires `overscroll-behavior: contain` which conflicts with scroll physics. | Manual refresh buttons where needed (leaderboard). SRS sync happens automatically via OfflineProvider. |
| **Gamified currency/shop** | Gems, coins, or virtual currency add economy balancing, store UI, purchase flow complexity. XP already drives leaderboard + badges. Adding currency without something to spend it on is meaningless. | Keep XP as progress indicator only. Badges are the reward. No virtual economy. |
| **AI-powered adaptive features** | AI chatbot, adaptive difficulty, or personalized study paths add API dependency, cost, latency, and complexity. The 128-question set is finite. SRS (ts-fsrs) already adapts to individual performance -- it IS the adaptive system. | SRS is the adaptive engine. It's offline-first, zero-cost, and battle-tested. |
| **Full redesign of existing flows** | The Check/Continue flow, flashcard sort, interview sim, and dashboard are all well-built. Redesigning them would be scope creep disguised as polish. | Polish within existing patterns. Refine animations, fix spacing, add missing states. Don't restructure what already works. |

---

## Feature Dependencies

```
[Foundation: Visual Consistency]
  Typography scale lockdown
      |
      v
  Spacing audit & 4px grid
      |
      v
  Border radius rules
      |
      v
  Motion token unification (CSS + JS)
      |
      v
  Component animation audit (stagger, enter/exit, press feedback)

[Native Feel: PWA]
  overscroll-behavior: none  (independent, no deps)
  Safe area insets  (independent, no deps)
  user-select: none  (independent, no deps)
  Keyboard-aware positioning  (needs safe area insets first)
  Swipe-to-dismiss toasts  (independent)

[Loading & States]
  Skeleton coverage  -->  Empty state designs (different problems, same screens)
  Error state patterns  (independent)

[Celebration System]
  Haptic feedback utility  (independent foundation)
      |
      v
  Achievement-scaled confetti  (maps intensity to context)
      |
      v
  Multi-stage celebration choreography  (coordinates confetti + sound + haptics)
      |
      v
  Sound effect warming  (enriches celebration sequence)
      |
      v
  Celebration sound choreography  (new composite function)

[Content & About]
  USCIS 2025 explanation validation  -->  Full explanation quality audit
  About page structure  -->  Dedication card design  -->  Navigation integration

[Accessibility]
  Focus management  (cross-cutting, do alongside any screen work)
  Reduced motion CSS  (do alongside animation audit)
  Screen reader announcements  (do alongside celebration work)
```

---

## MVP Recommendation

### Phase 1: Visual Foundation (Table Stakes)
1. **Spacing audit & 4px grid enforcement** -- sets the rhythm for everything
2. **Typography scale lockdown** -- reduces visual noise
3. **Consistent border radius rules** -- quick wins, big impact
4. **Touch target audit (44px minimum)** -- accessibility requirement
5. **Motion token unification (CSS + JS)** -- foundation for animation work

*Rationale: Every subsequent phase benefits from a consistent visual base. Do this first so celebration work, loading states, and About page all inherit the clean foundation.*

### Phase 2: Mobile Native Feel (Quick Wins)
1. **`overscroll-behavior: none` in standalone mode** -- one CSS rule, instant improvement
2. **Safe area inset handling** -- iPhone notch/gesture bar support
3. **`user-select: none` on interactive elements** -- prevents accidental selection
4. **Swipe-to-dismiss toasts** -- mobile gesture expectation
5. **Keyboard-aware bottom positioning** -- prevents UI hiding behind keyboard

*Rationale: These are almost all CSS-only or very small JS additions. Highest impact-to-effort ratio. Ship fast.*

### Phase 3: Interaction & Animation Polish
1. **Consistent button press feedback tiers** -- every tap feels responsive
2. **Stagger coverage audit (all lists)** -- life in every screen
3. **Exit animations for overlays** -- no more abrupt disappearances
4. **Glass-morphism tier usage rules** -- enforced visual language
5. **Dark mode polish pass** -- every screen intentional in dark mode

*Rationale: Animation and interaction refinement. Builds on the visual foundation from Phase 1.*

### Phase 4: Celebration Elevation
1. **Haptic feedback utility** -- tactile foundation
2. **Achievement-scaled confetti** -- right intensity for each moment
3. **Score count-up easing enhancement** -- build anticipation
4. **Multi-stage celebration choreography** -- the "wow" results screen
5. **Sound warming via harmonics** -- richer sonic feedback
6. **XP counter in session header** -- running gratification

*Rationale: The celebration system is the app's emotional peak. Polish it after the visual and interaction foundation is solid.*

### Phase 5: Loading, Empty, & Error States
1. **Skeleton screen coverage expansion** -- every async screen
2. **Empty state designs** -- new user experience
3. **Error state recovery patterns** -- graceful degradation
4. **Screen reader announcement gaps** -- accessibility for dynamic content
5. **Reduced motion CSS completeness** -- full a11y coverage
6. **Focus management across navigation** -- keyboard/screen reader UX

*Rationale: States and accessibility are best done together since they address the same screens.*

### Phase 6: Content & About Page
1. **USCIS 2025 explanation validation** -- complete the question data
2. **Explanation quality audit (all 128)** -- consistent learning content
3. **About page with mission & honoree tributes** -- emotional connection
4. **Dedication card design** -- dignified presentation of inspirational figures
5. **About page navigation integration** -- discoverable from Settings + Landing

*Rationale: Content and About page are independent of code polish. Can be done last or in parallel.*

### Defer to Later Milestone
- **Shared layout animations** (high risk, fragile with hash routing)
- **Swipe between tabs** (gesture conflicts, high complexity)
- **Pull-to-refresh** (limited value for offline-first app)
- **Cloud TTS** (server dependency, cost, latency)
- **Character mascot** (asset burden, scope creep)

---

## Sources

### Duolingo UX & Gamification
- [Duolingo Micro-Interactions (Medium)](https://medium.com/@Bundu/little-touches-big-impact-the-micro-interactions-on-duolingo-d8377876f682) - MEDIUM confidence
- [Duolingo Streak Milestone Animation (Blog)](https://blog.duolingo.com/streak-milestone-design-animation/) - HIGH confidence (official)
- [Duolingo Gamification Secrets (Orizon)](https://www.orizon.co/blog/duolingos-gamification-secrets) - MEDIUM confidence
- [Duolingo Gamification Case Study (Trophy)](https://trophy.so/blog/duolingo-gamification-case-study) - MEDIUM confidence
- [Duolingo Hobbes Acquisition (IR)](https://investors.duolingo.com/news-releases/news-release-details/duolingo-doubles-down-design-and-animation-acquisition-hobbes) - HIGH confidence
- [Duolingo Rive Usage (Wicki)](https://elisawicki.blog/p/how-exactly-is-duolingo-using-rive) - MEDIUM confidence
- [Duolingo Android Lesson Flow (Mobbin)](https://mobbin.com/explore/flows/43d3b0b8-cb53-443e-918f-aaa7d445196e) - HIGH confidence
- [Duolingo Onboarding (UserGuiding)](https://userguiding.com/blog/duolingo-onboarding-ux) - MEDIUM confidence

### Mobile UX & Design Systems
- [Making PWAs Feel Native (gfor.rest)](https://www.gfor.rest/blog/making-pwas-feel-native) - HIGH confidence (technical guide)
- [Design Tokens for Motion (Ruixen)](https://www.ruixen.com/blog/motion-design-tokens) - MEDIUM confidence
- [8pt Grid System (Prototypr)](https://blog.prototypr.io/the-8pt-grid-consistent-spacing-in-ui-design-with-sketch-577e4f0fd520) - HIGH confidence
- [Spacing Grids & Layouts (designsystems.com)](https://www.designsystems.com/space-grids-and-layouts/) - HIGH confidence
- [Type Scale (Cieden)](https://cieden.com/book/sub-atomic/typography/establishing-a-type-scale) - HIGH confidence
- [Skeleton Screens (NN/g)](https://www.nngroup.com/articles/skeleton-screens/) - HIGH confidence
- [Skeleton UI Design (Mobbin)](https://mobbin.com/glossary/skeleton) - MEDIUM confidence
- [Motion Design in Design Systems (designsystems.com)](https://www.designsystems.com/5-steps-for-including-motion-design-in-your-system/) - HIGH confidence

### Animation & Libraries
- [motion/react Layout Animations](https://motion.dev/docs/react-layout-animations) - HIGH confidence (official)
- [motion/react AnimateNumber](https://motion.dev/docs/react-animate-number) - HIGH confidence (official)
- [motion/react Transitions](https://motion.dev/docs/react-transitions) - HIGH confidence (official)
- [Framer Motion vs React Spring 2025 (HookedOnUI)](https://hookedonui.com/animating-react-uis-in-2025-framer-motion-12-vs-react-spring-10/) - MEDIUM confidence
- [canvas-confetti (GitHub)](https://github.com/catdad/canvas-confetti) - HIGH confidence

### Sound Design
- [Sound Design for UX (Toptal)](https://www.toptal.com/designers/ux/ux-sounds-guide) - HIGH confidence
- [Material Design Sound (Google)](https://m2.material.io/design/sound/applying-sound-to-ui.html) - HIGH confidence (official)
- [Sound in App UX (FutureSonic)](https://futuresonic.io/blog/why-sound-design-is-the-missing-piece-in-your-apps-user-experience/) - MEDIUM confidence

### PWA & Native Feel
- [Vibration API PWA Demo (Progressier)](https://progressier.com/pwa-capabilities/vibration-api) - MEDIUM confidence
- [Haptic Feedback Web Design (Medium)](https://medium.com/@officialsafamarva/haptic-feedback-in-web-design-ux-you-can-feel-10e1a5095cee) - MEDIUM confidence
- [PWA Vibration API (flaming.codes)](https://flaming.codes/posts/pwa-vibration-api) - MEDIUM confidence

### Nonprofit & About Page Design
- [Best Nonprofit Designs 2026 (ImageX)](https://imagexmedia.com/blog/best-nonprofit-website-designs-drive-impact) - MEDIUM confidence
- [Top Nonprofit Websites (Morweb)](https://morweb.org/post/best-nonprofit-websites) - MEDIUM confidence
- [Nonprofit App Design (DNL)](https://www.dnlomnimedia.com/blog/top-nonprofit-websites-inspire-your-organization/) - MEDIUM confidence

---

*Feature research for: Civic Test Prep v3.0 World-Class UX Elevation*
*Researched: 2026-02-19*
*Supersedes: v2.1 feature research (retained in git history)*
