# Domain Pitfalls: v2.0 Feature Additions

**Domain:** Adding unified navigation, dashboard redesign, Progress Hub consolidation, iOS-inspired design tokens, Burmese translation trust upgrade, USCIS 120Q bank integration, and push subscription security to an existing 37.5K LOC React/Next.js PWA
**Researched:** 2026-02-09
**Confidence:** HIGH (verified against codebase, official docs, and community sources)

---

## Critical Pitfalls

These mistakes cause rewrites, data loss, or broken user experiences for Burmese immigrant users.

### Pitfall 1: Navigation Unification Breaks the Onboarding Tour

**What goes wrong:** The existing `OnboardingTour` component targets specific `data-tour` attributes on Dashboard elements (`study-action`, `test-action`, `srs-deck`, `interview-sim`, `theme-toggle`). If the navigation redesign moves, renames, or removes these elements, the tour silently fails -- tooltip positions go to (0,0) or the tour skips steps entirely with no error. Users see an empty tooltip floating in the corner.

**Why it happens:** The onboarding tour uses CSS selector targeting (`[data-tour="study-action"]`), which is a fragile coupling. Navigation redesigns naturally restructure the DOM, and `data-tour` attributes are invisible in the rendered UI, so developers forget they exist. The tour also conditionally filters steps based on viewport (`theme-toggle` is filtered on mobile), adding hidden complexity.

**Consequences:**
- New users get a broken first-run experience, which is devastating for Burmese immigrants who depend on guided onboarding
- Tour may infinite-loop if a required target is missing (depends on implementation)
- The "More" sheet in `BottomTabBar` creates a portal that may not be in DOM when tour expects it

**Prevention:**
1. Audit all 5 `data-tour` targets BEFORE redesigning any navigation or dashboard layout
2. Create a test that validates all tour targets exist in the DOM when the tour runs
3. If consolidating dashboard widgets, preserve `data-tour` attributes on the new container elements
4. Update tour steps to match the new navigation mental model (the tour should teach the NEW nav, not the old one)

**Detection:** Run the onboarding tour flow on a fresh account after ANY navigation/dashboard change. If steps skip or tooltips position incorrectly, data-tour targets are broken.

**Phase to address:** Navigation Redesign phase -- must be done IN the same phase, not deferred

---

### Pitfall 2: Page Consolidation Loses Hash-Based Deep Links and Tab State

**What goes wrong:** The existing `HistoryPage` uses hash-based tabs (`#tests`, `#practice`, `#interview`) via `location.hash` with `useMemo`. The `StudyGuidePage` uses `?category=X#cards` for deep linking. The `ProgressPage` uses `?category=X#cards` for practice navigation. Consolidating these into a "Progress Hub" will break:
- All existing bookmarks and shared links
- The SRS widget's link to `/study#review`
- Push notification URLs that point to `/study#review`
- The `WeakAreaNudge` component which navigates to specific category study pages
- Hash-based scroll targets in `HistoryPage` (`#overview`, `#trend`, `#attempts`)

**Why it happens:** Hash routing is invisible infrastructure. Developers consolidating pages focus on the visual redesign and forget that URLs are a public API. The existing `useEffect` in `HistoryPage` that scrolls to hash targets, the `tabFromHash` derivation, and the `SRS formatSRSReminderNotification` function all depend on specific URL patterns.

**Consequences:**
- Push notifications open to wrong page (notification says "Cards Due for Review" but opens a 404 or wrong tab)
- User bookmarks stop working, eroding trust (critical for immigrant users who may not understand why)
- The `setUserSelectedTab` pattern in `HistoryPage` (user override of hash-derived tab) creates a confusing merge if tabs move to a new page

**Prevention:**
1. Map ALL existing routes and hash fragments before consolidation:
   - `/progress` -- standalone page
   - `/history` -- with `#tests`, `#practice`, `#interview`
   - `/study#review` -- SRS review entry point
   - `/study?category=X#cards` -- category-specific flashcards
2. Implement redirects from old routes to new routes (React Router `<Navigate>` elements)
3. Update `formatSRSReminderNotification` and all `navigate()` calls that reference old routes
4. Search for ALL hardcoded path strings: `grep -r "'/history'" "'/progress'" "'/study#'" "'#review'"` in the codebase
5. Use React Router's `useSearchParams` to preserve query parameters across the consolidation

**Detection:** After consolidation, test every push notification URL, every `navigate()` call, every `Link to=` prop, and every bookmark scenario.

**Phase to address:** Progress Hub Consolidation phase

---

### Pitfall 3: Design Token Migration Creates Visual Regressions Across 63+ Files

**What goes wrong:** The codebase has 307 occurrences of hardcoded color classes (`primary-500`, `success-500`, `warning-500`) across 63 files, plus 14 CSS custom property definitions in `globals.css`, plus a `design-tokens.ts` file that is NOT actually consumed by Tailwind (it exports JS objects but Tailwind reads from `tailwind.config.js` with hardcoded HSL values). Introducing a proper design token system means touching 63+ files, and any missed occurrence creates a visual inconsistency.

**Why it happens:** The v1.0 design system evolved organically. Colors were added in phases (Phase 3 added extended primaries, Phase 9 added Duolingo-style tokens). There are now THREE sources of truth:
- `globals.css` `:root` variables (the actual CSS custom properties)
- `tailwind.config.js` colors (hardcoded HSL strings, NOT referencing CSS variables for extended shades)
- `design-tokens.ts` (JS export, only used for reference/documentation, not consumed by Tailwind)

**Consequences:**
- Changing a token in one place but not the others creates subtle color mismatches
- Dark mode overrides in `globals.css` (lines 138-183) use hardcoded HSL values that bypass the token system entirely
- The `primary-50` through `primary-900` in `tailwind.config.js` are hardcoded light-mode values: `'primary-50': 'hsl(214 100% 97%)'` -- these DO NOT respond to dark mode, while `--primary-500` in CSS variables DOES
- Components using `bg-primary-500` get the hardcoded light-mode value even in dark mode, only working because `globals.css` has `.dark .bg-primary-500` overrides

**Prevention:**
1. First consolidate to a single source of truth: CSS custom properties in `globals.css`, referenced by Tailwind via `hsl(var(--primary-500))`
2. Do the migration in TWO passes: first make it work identically (swap hardcoded HSL to CSS variables), THEN introduce new tokens
3. Use visual regression testing (Playwright screenshots) before and after migration
4. Address the dark mode override hack: `.dark .bg-primary-500 { background-color: hsl(217 85% 55%); }` must be replaced by proper CSS variable switching
5. Do NOT introduce new token names until old ones are fully migrated

**Detection:** Toggle dark mode on every page after ANY token change. Check that `bg-primary-500` buttons match in both themes.

**Phase to address:** Design Token System phase -- must be BEFORE any visual redesign work

---

### Pitfall 4: Expanding 100 to 120 Questions Breaks Hardcoded Thresholds and Progress Calculations

**What goes wrong:** The question bank ALREADY contains 120 questions (the index.ts barrel says "Total: 120 questions" and imports `uscis2025Additions` with 20 questions). The `totalQuestions` export is dynamic (`allQuestions.length`). However, there are hardcoded assumptions scattered through the codebase:
- `TestPage.tsx` line 72: `.slice(0, 20)` -- selects 20 questions per test (correct, but the pool size affects coverage calculations)
- `TestPage.tsx` line 41: `PASS_THRESHOLD = 12` -- currently 12/20 (60%), but if the test format changes for 120Q this needs updating
- `Dashboard.tsx` line 135: `coveragePercent = (uniqueQIds.size / totalQuestions) * 100` -- coverage denominator is dynamic, BUT if questions are added gradually, coverage percentage drops for returning users
- Comment in index.ts says "Total: 120 questions" but the barrel aggregation comment says `(47 questions)` + `(10 questions)` + `(13 questions)` + `(7 questions)` + `(10 questions)` + `(13 questions)` + `20 questions` = 120

**Why it happens:** The codebase was designed for 100 questions. The 2025 additions raised it to 120, and `totalQuestions` adapted via `allQuestions.length`. But the UX messaging, coverage calculations, and mastery percentages were calibrated against 100. A user who practiced all 100 original questions and shows "100% coverage" will suddenly drop to 83% when the app recognizes 120 questions.

**Consequences:**
- Users who had "100% coverage" see their dashboard regress to ~83%, destroying motivation
- Mastery milestones that were earned (gold at 100%) may need re-earning
- The ReadinessIndicator score drops because coverage weight (50% of composite) decreases
- SRS deck completion stats change

**Prevention:**
1. Announce new questions in-app with a celebration, not as a silent regression
2. Implement a "new questions available" notification that positions the change positively
3. Consider separate tracking for "legacy 100Q mastery" vs "120Q mastery" during transition
4. Review `calculateCompositeScore` which uses `coveragePercent` -- ensure the formula accounts for growing question pools gracefully
5. Update the `PreTestScreen` messaging if it references total question counts

**Detection:** Load the app as a user who has practiced exactly 100 questions. Verify dashboard messaging is encouraging, not deflating.

**Phase to address:** USCIS 120Q Bank phase -- requires careful UX around the transition

---

### Pitfall 5: Push Subscription API Lacks Authentication and Rate Limiting

**What goes wrong:** The existing `/api/push/subscribe` endpoint (in `pages/api/push/subscribe.ts`) accepts ANY `userId` in the POST body with NO authentication verification. An attacker can:
1. Register push subscriptions for arbitrary user IDs
2. Overwrite legitimate subscriptions (the endpoint uses `upsert` with `onConflict: 'user_id'`)
3. Delete any user's push subscription via the DELETE endpoint (only requires `userId`)
4. Spam the endpoint with fake subscriptions, filling the Supabase table

The endpoint uses `SUPABASE_SERVICE_ROLE_KEY` (admin-level access) with no request validation beyond "userId exists in body."

**Why it happens:** The v1.0 push notification feature was built as a functional MVP without security hardening. The service role key bypasses RLS policies, and the API trusts the client-provided `userId` without verifying it against the authenticated session.

**Consequences:**
- Any user can hijack another user's push notifications
- Subscription table can be polluted with garbage data
- Legitimate users stop receiving notifications without knowing why
- Service role key exposure risk (though it's server-side only, the endpoint has no CSRF protection)

**Prevention:**
1. Verify the authenticated user matches the provided userId:
   ```typescript
   const { data: { user } } = await supabaseAdmin.auth.getUser(req.headers.authorization?.replace('Bearer ', '') ?? '');
   if (!user || user.id !== req.body.userId) return res.status(401).json({ error: 'Unauthorized' });
   ```
2. Add rate limiting (e.g., 5 subscription changes per hour per user)
3. Validate the push subscription object structure
4. Consider using Supabase RLS instead of service role key for subscription management
5. Add CSRF token validation for the API route

**Detection:** Attempt to call `/api/push/subscribe` with a userId that doesn't match the authenticated session. If it succeeds, the endpoint is vulnerable.

**Phase to address:** Push Subscription Security phase -- should be done BEFORE any push notification improvements

---

### Pitfall 6: Burmese Translation "Trust Upgrade" Without Native Speaker Review Creates Worse UX Than Literal Translation

**What goes wrong:** The existing Burmese translations in `strings.ts` are functional but literal (e.g., `'ဒက်ရှ်ဘုတ်'` for "Dashboard" is a transliteration, not a natural Burmese word). Improving these without a native Burmese speaker creates three failure modes:
1. Over-localized text that uses formal register when users expect colloquial Myanmar
2. Mixed formality levels across the app (some pages updated, some not)
3. Technical terminology translated differently in different places (inconsistent glossary)

The app has 360 occurrences of `font-myanmar` across 70 files, meaning Burmese text appears on virtually every screen. A partial update creates a jarring inconsistency.

**Why it happens:** Developers use translation tools (Google Translate, ChatGPT) that produce grammatically correct but unnatural Myanmar text. The Burmese writing system has complex rules about consonant clusters, medial vowels, and tone marks that affect readability. Additionally, Myanmar has distinct formal (literary) and informal (spoken) registers -- mixing them signals "machine translated" to native speakers, eroding trust.

**Consequences:**
- Burmese users perceive the app as "not really for them" -- a translated English app rather than a genuinely bilingual one
- Trust degradation is particularly harmful for immigrant users navigating a high-stakes process (citizenship test)
- Inconsistent terminology confuses users (e.g., "progress" translated as both `တိုးတက်မှု` and `တိုင်တက်ခြင်း` in different places)

**Prevention:**
1. Create a Burmese glossary document FIRST: define how key terms are translated consistently
2. Translate in BATCHES by feature area, not scattered across the app
3. Have a native Burmese speaker review ALL translations before shipping -- even "improved" AI translations
4. Test with actual Burmese speakers for comprehension, not just correctness
5. Maintain a `BilingualString` type discipline: never inline Burmese text outside the `strings.ts` centralized file
6. Audit for hardcoded Burmese strings outside `strings.ts` (there are some in `Dashboard.tsx`, `HistoryPage.tsx`, `ProgressPage.tsx`, etc.)

**Detection:** Search for Myanmar Unicode range (U+1000-109F) in files OTHER than `strings.ts` and question data files. Any hits are decentralized translations that will be missed during the upgrade.

**Phase to address:** Burmese Translation Trust Upgrade phase -- should happen as a concentrated effort, not sprinkled across phases

---

## Moderate Pitfalls

### Pitfall 7: Unified Navigation Doubles the Mobile "More" Menu Complexity

**What goes wrong:** The current `BottomTabBar` has 3 primary tabs + "More" button (containing 4 items). The `AppNavigation` desktop bar has 7 links. These are defined in TWO separate components with TWO separate nav item arrays (`primaryTabs` and `moreNavItems` in BottomTabBar, `navLinks` in AppNavigation). Unifying navigation means maintaining a SINGLE source of truth for nav items, but the mobile and desktop presentations have different slot counts.

If the unified system adds items (e.g., Practice, SRS Review) without adjusting the mobile "More" menu, the sheet becomes too tall. If it removes items, existing muscle memory breaks.

**Prevention:**
1. Define navigation items in ONE central config, with a `mobilePriority` field that determines which appear in the bottom bar vs. the "More" sheet
2. Keep the bottom bar to 4-5 items maximum (iOS HIG recommendation)
3. Test the "More" sheet height on the smallest supported screen (iPhone SE / 320px wide)
4. Animate the transition smoothly if nav structure changes -- don't force a "learn the new nav" moment

**Detection:** Render the bottom bar and More sheet on a 320px viewport. If the sheet requires scrolling, there are too many items.

**Phase to address:** Navigation Redesign phase

---

### Pitfall 8: Dashboard Simplification Removes Widgets Users Depend On

**What goes wrong:** The current Dashboard has 11 staggered motion sections: welcome header, readiness hero, quick actions, SRS widget, streak widget, interview widget, badges, leaderboard, category progress (collapsible), suggested focus, and accuracy. "Simplification" means removing or consolidating some of these, but each has users who rely on it as their primary engagement hook.

The `SRSWidget` shows due card count and has a `data-tour="srs-deck"` attribute. The `StreakWidget` is the daily engagement driver. The `ReadinessIndicator` is the primary motivational element. Removing any of these without redirecting the user journey breaks retention patterns.

**Prevention:**
1. Track which widgets are actually clicked/interacted with before deciding what to remove (add analytics events first)
2. If consolidating, ensure the consolidated view preserves the key information: due cards count, streak count, readiness score
3. Move removed widgets to the Progress Hub rather than deleting them
4. Keep `data-tour` targets on whatever replaces the current widgets

**Detection:** A/B test the simplified dashboard if possible. At minimum, survey existing users about which widgets they use most.

**Phase to address:** Dashboard Redesign phase

---

### Pitfall 9: React Compiler ESLint Rules Reject Common Navigation Patterns

**What goes wrong:** The project uses React Compiler ESLint rules (documented in MEMORY.md). Common patterns used during navigation redesign will trigger violations:
- `setState` in `useEffect` to sync URL hash to tab state -- violates `react-hooks/set-state-in-effect`
- `ref.current` access in render for scroll position restoration -- violates `react-hooks/refs`
- `useMemo<Type>(() => ...)` generic annotation -- violates `react-hooks/preserve-manual-memoization`
- Timer/interval resets for navigation animations -- require `key` prop pattern instead of `setState` in effect

The existing `HistoryPage` already has a carefully constructed pattern to work around these rules: `tabFromHash` is derived via `useMemo` from `location.hash`, and `userSelectedTab` is a separate `useState` that overrides it. This pattern must be preserved or replicated in any consolidated page.

**Prevention:**
1. Follow the established patterns from MEMORY.md:
   - Use `useMemo` for derived state from `location.hash`, never `setState` in effect
   - Use `useState(() => Date.now())` instead of `useRef(Date.now())` for initialization
   - Use React `key` prop to force remount instead of `setState` in effect for timer resets
2. Run ESLint after EVERY component change, not just at CI time
3. Reference `useMasteryMilestones.ts` as the canonical example of React Compiler-safe patterns

**Detection:** `npx eslint src/components/navigation/ src/pages/` after any navigation-related changes.

**Phase to address:** ALL phases -- this is a cross-cutting constraint

---

### Pitfall 10: iOS Safe Area Handling Breaks During Navigation Restructure

**What goes wrong:** The existing app has careful safe area handling:
- `globals.css` defines `--safe-area-top`, `--safe-area-bottom`, `--bottom-tab-height`
- `.page-shell` includes `padding-top: var(--safe-area-top)` and `padding-bottom: calc(var(--safe-area-bottom) + var(--bottom-tab-height) + 1rem)`
- `BottomTabBar` uses `style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}`
- `AppNavigation` uses `.nav-safe-area` class with `max()` CSS functions

Restructuring navigation (e.g., moving `BottomTabBar` rendering, changing `page-shell` padding, introducing new layout wrappers) can cause:
- Content hidden behind the iOS home indicator
- Double padding (both the page-shell AND a new layout wrapper adding safe area padding)
- `BottomTabBar` height variable (`--bottom-tab-height: 64px` at `max-width: 767px`) no longer matching actual tab bar height after redesign

**Prevention:**
1. Test EVERY navigation change on iOS Safari in standalone PWA mode (not just in-browser)
2. Keep the `--bottom-tab-height` CSS variable in sync with the actual rendered height
3. If introducing a new layout wrapper, ensure safe area padding is applied in exactly ONE place
4. Use `dvh` (dynamic viewport height) rather than `vh` for any new viewport-height calculations
5. The `useViewportHeight` hook sets `--app-viewport-height` -- ensure it remains functional after layout changes

**Detection:** Open the PWA on an iPhone with a notch. Verify bottom content is visible above the home indicator. Verify top content is below the status bar. Check with keyboard open.

**Phase to address:** Navigation Redesign and iOS-Inspired UI phase

---

### Pitfall 11: motion/react (Framer Motion) Inline Transform Overrides CSS Centering

**What goes wrong:** Documented in MEMORY.md: `motion/react` inline `transform` overrides CSS `translateX(-50%)` centering. The Dashboard uses `motion.div` with stagger animations (`initial: { opacity: 0, y: 16 }`) on 11 sections. Adding new animations to navigation elements or redesigning dashboard layout with motion components will break centering on any element that uses `transform: translate()` for positioning.

**Prevention:**
1. Never use CSS `translate` for centering on elements that will be animated with motion/react
2. Use flexbox (`justify-center`, `items-center`) for centering instead
3. If animation requires a wrapper, use a separate `motion.div` wrapper around the centered element
4. The `Dialog` component already handles this correctly with `pointer-events-none` wrapper + `pointer-events-auto` content -- follow that pattern

**Detection:** After adding any `motion.div` to a centered element, verify centering in both initial and animated states.

**Phase to address:** Dashboard Redesign and Navigation phases

---

### Pitfall 12: AppNavigation Per-Page Pattern Prevents Layout-Level Changes

**What goes wrong:** Every page component individually imports and renders `<AppNavigation />` inside a `<div className="page-shell">` wrapper. This pattern (seen in ALL 13 pages) means:
- Navigation changes require touching every page file
- The `locked` and `translucent` props are per-page configuration
- There's no shared layout component -- each page owns its own shell

Introducing a unified navigation layout requires migrating from "nav inside page" to "page inside nav layout." This is a high-touch refactor: every page import of `AppNavigation` must be removed, and the `locked`/`translucent` props must be handled by a different mechanism (route-level config or context).

**Prevention:**
1. Create a `Layout` component that wraps pages and renders navigation
2. Move `<AppNavigation />` from individual pages to the layout
3. Use route metadata or a context to pass `locked` and `translucent` states
4. Do this refactor FIRST, before any visual navigation changes
5. The `page-shell` class and its padding must move to the layout, not remain in individual pages

**Detection:** After the refactor, search for `import AppNavigation` -- it should only appear in the layout component, not in any page.

**Phase to address:** Navigation Redesign phase -- do the structural refactor BEFORE the visual redesign

---

## Minor Pitfalls

### Pitfall 13: Inconsistent Icon Libraries After Navigation Redesign

**What goes wrong:** The current `BottomTabBar` and `AppNavigation` use different icon selections from `lucide-react` for the same concepts (e.g., `History` vs `Clock` for test history, `TrendingUp` for progress in both but different strokes). An "iOS-inspired" redesign may introduce SF Symbols-style icons or change icon weights, creating inconsistency between updated and not-yet-updated sections.

**Prevention:** Establish an icon mapping document before starting the redesign. Update ALL icon usages in one pass.

**Phase to address:** iOS-Inspired UI phase

---

### Pitfall 14: Stale localStorage Keys After Page Consolidation

**What goes wrong:** The app uses several localStorage keys for UI state:
- `civic-prep-dashboard-category-collapsed` (Dashboard category section)
- `push-reminder-frequency` (push notifications)
- `welcome-shown`, `pwa-installed` (onboarding)
- Various SRS and social keys

Page consolidation may render some of these keys meaningless (e.g., the collapsed state of a section that no longer exists) or create conflicts (two pages using the same collapse key).

**Prevention:** Audit all `localStorage.getItem`/`setItem` calls before consolidation. Remove obsolete keys with a migration function on first load of the new version.

**Phase to address:** Progress Hub Consolidation phase

---

### Pitfall 15: PageTransition AnimatePresence Conflicts with New Navigation Animations

**What goes wrong:** The existing `PageTransition` component wraps `<Routes>` with `AnimatePresence` for page-level enter/exit animations. Adding navigation-level animations (tab bar transitions, sheet animations) can conflict -- `AnimatePresence` may try to animate a page exit while a navigation animation is still running, causing visual glitches or z-index wars.

**Prevention:** Keep page transitions and navigation animations on separate z-index layers. The `BottomTabBar` already uses `z-50` for the More sheet and `z-40` for the bar itself. Ensure new navigation animations don't overlap with `PageTransition` z-indices.

**Phase to address:** Navigation Redesign phase

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Severity | Mitigation |
|-------------|---------------|----------|------------|
| Navigation Redesign | Onboarding tour breaks (Pitfall 1) | CRITICAL | Audit all data-tour targets before and after |
| Navigation Redesign | AppNavigation per-page pattern (Pitfall 12) | HIGH | Refactor to layout component FIRST |
| Navigation Redesign | Mobile "More" menu overflow (Pitfall 7) | MODERATE | Test on 320px viewport |
| Dashboard Redesign | Widget removal breaks engagement (Pitfall 8) | HIGH | Preserve key metrics in simplified view |
| Dashboard Redesign | motion/react transform conflicts (Pitfall 11) | MODERATE | Use flexbox centering, not CSS translate |
| Progress Hub Consolidation | Hash-based deep links break (Pitfall 2) | CRITICAL | Map all routes/hashes, implement redirects |
| Progress Hub Consolidation | Stale localStorage keys (Pitfall 14) | LOW | Audit and migrate |
| Design Token System | 63-file visual regression (Pitfall 3) | CRITICAL | Single source of truth first, visual testing |
| Burmese Translation | Trust erosion from bad translation (Pitfall 6) | CRITICAL | Native speaker review, glossary-first approach |
| USCIS 120Q Bank | Coverage regression destroys motivation (Pitfall 4) | HIGH | Celebrate new questions, don't silently regress |
| Push Security | Unauthenticated subscription API (Pitfall 5) | CRITICAL | Auth verification before ANY push improvements |
| iOS-Inspired UI | Safe area breakage (Pitfall 10) | HIGH | Test on real iOS devices in standalone mode |
| ALL phases | React Compiler rule violations (Pitfall 9) | MODERATE | Follow established patterns from MEMORY.md |

## Cross-Cutting Concerns

### Concern 1: The 13-Page AppNavigation Import Pattern

Every page individually imports `AppNavigation`. This means any navigation change is automatically a 13-file change. The risk of partial migration (some pages updated, some not) is extremely high.

**Recommended order:**
1. Extract layout component (structural change, zero visual change)
2. Verify all pages render correctly with layout-provided navigation
3. THEN redesign the navigation visually

### Concern 2: Three Sources of Truth for Colors

The design token system has fragmented into `globals.css`, `tailwind.config.js`, and `design-tokens.ts`. Any new token system must consolidate these into ONE source of truth before adding new tokens.

**Recommended order:**
1. Consolidate existing tokens (CSS variables as source of truth)
2. Wire Tailwind to CSS variables for ALL extended colors
3. THEN introduce new design tokens

### Concern 3: Burmese Text Scattered Across Codebase

Despite having a centralized `strings.ts`, Burmese text appears directly in component JSX in at least: `Dashboard.tsx`, `HistoryPage.tsx`, `ProgressPage.tsx`, `BottomTabBar.tsx`, `AppNavigation.tsx`, and multiple component files. The translation upgrade must centralize ALL Burmese text before improving it.

**Recommended order:**
1. Extract ALL inline Burmese strings to `strings.ts`
2. Create a Burmese glossary for key terms
3. THEN improve translations with native speaker review

---

## "Looks Done But Isn't" Checklist for v2.0

- [ ] **Navigation redesign**: All 5 data-tour targets still work on fresh account
- [ ] **Navigation redesign**: AppNavigation import removed from ALL 13 pages
- [ ] **Navigation redesign**: BottomTabBar "More" sheet fits on 320px screen
- [ ] **Navigation redesign**: `locked` and `translucent` navigation states still work during tests
- [ ] **Progress Hub**: Every old route (`/history`, `/progress`, `/history#interview`) redirects correctly
- [ ] **Progress Hub**: Push notification URLs point to correct new routes
- [ ] **Progress Hub**: SRS widget "review" link opens correct tab in consolidated view
- [ ] **Design tokens**: Dark mode toggle produces identical colors to v1.0 (unless intentionally changed)
- [ ] **Design tokens**: No hardcoded HSL values remain in `tailwind.config.js` extended colors
- [ ] **120Q bank**: User with 100/100 coverage sees encouraging message, not regression
- [ ] **120Q bank**: Mastery milestone celebrations acknowledge the expanded pool
- [ ] **Burmese**: ALL Myanmar Unicode text lives in `strings.ts` (zero inline)
- [ ] **Burmese**: Glossary terms are consistent across ALL pages
- [ ] **Push security**: Unauthenticated POST to `/api/push/subscribe` returns 401
- [ ] **Push security**: Cannot delete another user's subscription
- [ ] **iOS safe areas**: Bottom tab bar clears home indicator in standalone PWA mode
- [ ] **iOS safe areas**: Top navigation clears status bar/notch
- [ ] **React Compiler**: `npx eslint src/` passes with zero violations after every phase

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Broken onboarding tour | LOW | Re-add data-tour attributes, update step selectors |
| Broken deep links | MEDIUM | Add redirects; users with bookmarks need to re-bookmark |
| Visual regression from tokens | HIGH | Revert to v1.0 tokens, re-attempt with visual testing |
| Coverage regression for 120Q | LOW | Add celebration UI, recompute milestones |
| Push subscription hijack | HIGH | Rotate VAPID keys, re-subscribe all users, audit logs |
| Bad Burmese translations | MEDIUM | Revert to v1.0 translations while getting native review |
| iOS safe area broken | MEDIUM | Revert navigation changes, retest on device |

---

## Sources

**Navigation & Routing:**
- [React Router Dynamic Tabs Discussion](https://github.com/remix-run/react-router/discussions/11040) - Tab state in URL params (MEDIUM confidence)
- [React Navigation Bottom Tabs Overlap Issue](https://github.com/react-navigation/react-navigation/issues/12769) - Safe area overlaps (MEDIUM confidence)

**Design Tokens:**
- [Modern Design Systems for React in 2025](https://inwald.com/2025/11/modern-design-systems-for-react-in-2025-a-pragmatic-comparison/) - Token migration strategies (MEDIUM confidence)
- [Design Tokens in React - UXPin](https://www.uxpin.com/studio/blog/what-are-design-tokens-in-react/) - Token architecture (MEDIUM confidence)
- [Managing Global Styles with Design Tokens](https://www.uxpin.com/studio/blog/managing-global-styles-in-react-with-design-tokens/) - Single source of truth (MEDIUM confidence)

**Burmese/Myanmar:**
- [Burmese Font Issues Have Real World Consequences](https://www.localizationlab.org/blog/2019/3/25/burmese-font-issues-have-real-world-consequences-for-at-risk-users) - Trust and security impact (HIGH confidence)
- [Mini-Guide to UX Design in Myanmar](https://www.nexlabs.co/insight-post/a-mini-guide-to-ux-design-in-myanmar) - Cultural UX considerations (MEDIUM confidence)
- [NLP and Burmese Localization - GALA](https://www.gala-global.org/knowledge-center/professional-development/articles/nlp-burmesemyanmar) - Linguistic challenges (MEDIUM confidence)

**React Compiler:**
- [React Compiler v1.0 Blog Post](https://react.dev/blog/2025/10/07/react-compiler-1) - Official rules documentation (HIGH confidence)
- [set-state-in-effect Rule](https://react.dev/reference/eslint-plugin-react-hooks/lints/set-state-in-effect) - Official lint rule (HIGH confidence)
- [refs Rule](https://react.dev/reference/eslint-plugin-react-hooks/lints/refs) - Official lint rule (HIGH confidence)
- [Bug: set-state-in-effect overly strict?](https://github.com/facebook/react/issues/34743) - Known false positives (HIGH confidence)

**PWA & iOS:**
- [Make PWAs Look Handsome on iOS](https://dev.to/karmasakshi/make-your-pwas-look-handsome-on-ios-1o08) - Safe area handling (MEDIUM confidence)
- [Supporting iOS Safe Areas in Web Apps](https://jipfr.nl/blog/supporting-ios-web/) - Implementation guide (MEDIUM confidence)
- [Next.js Discussion: Safe Area Inset Issues](https://github.com/vercel/next.js/discussions/81264) - Next.js-specific (MEDIUM confidence)
- [Understanding Mobile Viewport Units](https://medium.com/@tharunbalaji110/understanding-mobile-viewport-units-a-complete-guide-to-svh-lvh-and-dvh-0c905d96e21a) - dvh/svh/lvh guide (MEDIUM confidence)

**Push Notifications:**
- [Supabase Push Notifications Docs](https://supabase.com/docs/guides/functions/examples/push-notifications) - Official (HIGH confidence)
- [Supabase Security 2025 Retro](https://supabase.com/blog/supabase-security-2025-retro) - Security defaults (HIGH confidence)
- [PWA Push Notifications Guide](https://www.magicbell.com/blog/using-push-notifications-in-pwas) - Implementation patterns (MEDIUM confidence)

**Codebase Analysis:**
- Verified against actual source files: `AppShell.tsx`, `BottomTabBar.tsx`, `AppNavigation.tsx`, `Dashboard.tsx`, `HistoryPage.tsx`, `ProgressPage.tsx`, `TestPage.tsx`, `globals.css`, `tailwind.config.js`, `design-tokens.ts`, `strings.ts`, `questions/index.ts`, `pushNotifications.ts`, `subscribe.ts` (HIGH confidence)

---

*Pitfalls research for: Civic Test Prep 2025 v2.0 Feature Additions*
*Researched: 2026-02-09*
*Previous version: v1.0 pitfalls archived in milestones/v1.0/*
