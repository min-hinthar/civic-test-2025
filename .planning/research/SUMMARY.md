# Project Research Summary

**Project:** Civic Test Prep 2025 - v2.0 Unified Learning Hub
**Domain:** Bilingual (English/Burmese) civics test prep PWA for Burmese immigrants
**Researched:** 2026-02-09
**Confidence:** HIGH

## Executive Summary

The v2.0 milestone is a **UI/UX refinement layer** built on v1.0's proven architecture (189 files, 37.5K LOC, 348 commits). Research reveals this is primarily a reshuffling and polishing effort, not infrastructure expansion. Only 2 new npm packages are needed (@radix-ui/react-tabs, @supabase/ssr), and zero new data stores or context providers. The core changes — unified navigation, dashboard simplification, Progress Hub consolidation, and design token alignment — follow established patterns from education app leaders like Duolingo and Khan Academy.

The recommended approach is **surgical refactoring over rewriting**. The existing provider hierarchy, offline-first data layer, and hash-based routing patterns are sound. The riskiest integration is Progress Hub consolidation (merging 3 pages with deep links), which must preserve all existing routes, hash fragments, and push notification URLs. The safest starting point is design token alignment, which has zero functional dependencies and reduces visual variance before layout changes. Critical finding: USCIS 2025 requires **128 questions** (not 120 as stated in PRD) — the app has 120, missing 8 questions.

Key risks center on **continuity violations**: breaking onboarding tour targets during navigation redesign, regressing user progress metrics when expanding the question bank, and eroding trust with bad Burmese translations. The mitigation strategy is to preserve user-facing continuity while restructuring under the hood — celebrate new questions instead of showing coverage regression, redirect legacy URLs transparently, and require native speaker review for all translation changes. Security hardening (push subscription authentication) is critical before any push notification improvements.

## Key Findings

### Recommended Stack

The existing v1.0 stack (Next.js 15 Pages Router, React 19, Supabase, Tailwind, motion/react, Radix UI, ts-fsrs, idb-keyval) **requires only 2 additions** for v2.0. The research validates that feature requests like unified navigation, dashboard CTAs, glass-morphism UI, and rate limiting do not require new libraries — they're achievable with existing tools plus CSS and component refactoring.

**Core additions:**
- **@radix-ui/react-tabs** (^1.1.13): Accessible tab component for Progress Hub — consistent with existing Radix ecosystem (Dialog, Toast, Progress already in use), handles keyboard navigation and ARIA roles correctly
- **@supabase/ssr** (^0.8.0): Server-side Supabase client for API route authentication — enables JWT verification in push subscription endpoint to replace current "trust the userId" vulnerability

**No library needed for:**
- **Unified navigation**: Shared config module consumed by existing AppNavigation + BottomTabBar
- **iOS-inspired design tokens**: CSS custom properties + Tailwind backdrop-filter (already supported)
- **In-memory rate limiting**: 30-line Map-based token bucket (sufficient for low-traffic push endpoints)
- **Burmese translation upgrade**: Content work on existing strings.ts centralized i18n system

**Critical finding from stack research:** USCIS 2025 civics test has **128 questions** (official USCIS PDF), not 120. The app currently has 120 questions (100 original + 20 uscis2025Additions). Gap: **8 questions missing** to reach full compliance.

### Expected Features

Seven epics identified across navigation UX, decision support, information architecture, visual design, content trust, legal compliance, and security.

**Must have (table stakes):**
- **Consistent navigation across mobile/desktop** — users currently see different structures (mobile: 3 tabs + More sheet, desktop: 7 links). Standard pattern is 4-5 persistent bottom tabs (iOS HIG, Material Design)
- **Single primary CTA on dashboard** — current dashboard has 11 sections with 3 equal-weight actions. Education apps use "Next Best Action" decision tree to reduce choice paralysis
- **Complete 128-question USCIS 2025 bank** — legal requirement effective Oct 20, 2025. Current gap: 8 questions
- **Push subscription authentication** — current API accepts any userId without verification, allowing subscription hijacking

**Should have (competitive):**
- **Progress Hub consolidation** — current data scattered across Dashboard, ProgressPage, HistoryPage, SocialHubPage. Single tabbed hub matches standard analytics pattern
- **iOS-inspired glass effects** — frosted nav bars, translucent cards with backdrop-blur. Differentiates from dated Material Design competitors
- **Translation trust indicators** — show verification status (verified, community-reviewed, machine). Builds trust for high-stakes legal content

**Defer to v2.1+:**
- **Dynamic answer system** — questions about current officials (president, senators) need periodic updates. In-memory approach works short-term
- **Full design system documentation** — formalize patterns after they stabilize through v2.0
- **Translation contribution workflow** — community reporting infrastructure for scale

### Architecture Approach

The v2.0 changes fit **within the existing architecture** with no new providers, stores, or data flows. The established provider hierarchy (ErrorBoundary > Language > Theme > Toast > Offline > Auth > Social > SRS > Router) remains unchanged. All v2.0 features are UI layer modifications that consume existing context data.

**Major structural changes:**

1. **Navigation config consolidation** — create single navConfig.ts shared source of truth to replace dual nav definitions (AppNavigation's navLinks + BottomTabBar's primaryTabs/moreNavItems). Mobile expands from 3+4 to 5 persistent tabs, eliminating the More menu.

2. **Progress Hub page with hash routing** — new ProgressHubPage.tsx with tabs (Overview, History, Community) using location.hash pattern already validated in HistoryPage and SocialHubPage. Reuses existing components (CategoryGrid, SkillTreePath, LeaderboardTable) with zero modification. Legacy routes redirect: /progress → /hub#overview, /history → /hub#history, /social → /hub#community.

3. **Dashboard simplification via extraction** — new useNextBestAction hook computes single CTA from existing data sources (useSRS, useAuth, useCategoryMastery, useStreak). Dashboard shrinks from 11 sections to 4-5, moving detailed analytics to Progress Hub.

4. **Design token consolidation** — CSS custom properties in globals.css as single source of truth, Tailwind references them via hsl(var(--...)). Current fragmentation (globals.css, tailwind.config.js, design-tokens.ts) creates drift. TypeScript tokens kept only for motion-specific values (springs, timing).

**Data flow changes:** None. All v2.0 features use derived state from existing hooks. No new IndexedDB stores, no new Supabase tables (except security hardening on existing push_subscriptions), no new context providers.

### Critical Pitfalls

Research identified 15 pitfalls across critical, moderate, and minor severity. Top 5 that threaten user experience or require rewrites:

1. **Navigation unification breaks onboarding tour** — OnboardingTour targets 5 data-tour attributes on Dashboard elements (study-action, test-action, srs-deck, interview-sim, theme-toggle). Navigation redesign moves/removes these, causing silent tour failures with floating tooltips or skipped steps. **Prevention:** Audit all data-tour targets before ANY navigation changes, update tour steps to match new mental model.

2. **Page consolidation loses hash-based deep links** — existing routes use hash routing (/history#tests, /study#review, /progress?category=X#cards) for tabs, scroll targets, and SRS entry points. Push notifications, SRS widget links, and user bookmarks depend on these URLs. **Prevention:** Map ALL routes/hashes before consolidation, implement redirects, update all navigate() calls and formatSRSReminderNotification function.

3. **Design token migration creates visual regressions across 63+ files** — 307 occurrences of hardcoded color classes (primary-500, success-500, warning-500) across 63 files. THREE sources of truth: globals.css CSS variables, tailwind.config.js hardcoded HSL, design-tokens.ts JS exports (not consumed by Tailwind). Dark mode uses manual overrides (.dark .bg-primary-500) instead of CSS variable switching. **Prevention:** Consolidate to CSS variables first (migration pass), THEN introduce new tokens (visual pass). Use Playwright screenshot diffing.

4. **Expanding to 128 questions breaks hardcoded thresholds** — app has 120 questions, but users who practiced all 100 original questions show "100% coverage". Adding 8 more questions drops them to 83%, destroying motivation. ReadinessIndicator score drops (coverage is 50% of composite score). **Prevention:** Celebrate new questions with in-app notification, consider separate "legacy 100Q" vs "128Q" tracking during transition.

5. **Push subscription API lacks authentication** — /api/push/subscribe accepts any userId in POST body with NO JWT verification. Uses SUPABASE_SERVICE_ROLE_KEY (admin access) and trusts client-provided userId. Attacker can hijack any user's push notifications or spam the table. **Prevention:** Verify supabase.auth.getUser() matches userId, add token-based rate limiting (5 changes/hour), validate before ANY push improvements.

**Cross-cutting concern:** React Compiler ESLint rules (project uses strict rules from React 19 compiler). Common refactoring patterns violate: setState in useEffect (set-state-in-effect), ref.current in render (refs), useMemo<Type>() generics (preserve-manual-memoization). Existing workarounds validated in HistoryPage (useMemo-derived tab from location.hash) and useMasteryMilestones (lazy useState instead of useRef). **Prevention:** Follow MEMORY.md patterns, run ESLint after every component change.

## Implications for Roadmap

Based on research findings, suggested 7-phase structure emphasizing foundation-first and continuity preservation:

### Phase 1: Design Token Consolidation
**Rationale:** Zero-risk infrastructure that unblocks all UI work. If tokens are inconsistent when building new UI, every new component adds to the debt. STACK.md confirms no new library needed (CSS + Tailwind).

**Delivers:** Single source of truth for colors/shadows/spacing, dark mode via CSS variable switching (not overrides), shared motion spring presets.

**Addresses:** Epic D (iOS-Inspired Design System) foundation, prevents Pitfall 3 (visual regressions).

**Avoids:** Touching 63+ files after visual changes are in flight. Do structural consolidation with zero visual change, then layer visual polish.

**Research flag:** Standard patterns, skip research-phase.

### Phase 2: USCIS 128-Question Bank Completion
**Rationale:** Pure data work with no UI dependencies. Unblocks accurate question count messaging. Critical legal compliance gap (8 questions missing for Oct 2025 effective date).

**Delivers:** Full 128-question bank with bilingual content, studyAnswers, and explanations. Updated mock test to 20Q/12 pass/9 fail logic (already implemented, verify alignment).

**Addresses:** Epic F (USCIS 2025 128Q Bank), prevents Pitfall 4 (coverage regression).

**Avoids:** Announcing "120 questions" in v2.0 UI when the real requirement is 128. Add celebration messaging for new questions instead of silent metric regression.

**Research flag:** Skip research-phase (official USCIS PDF is source of truth). Cross-reference with official 2025-Civics-Test-128-Questions-and-Answers.pdf to identify missing 8.

### Phase 3: Push Subscription Security Hardening
**Rationale:** Foundational security before any push notification improvements. Current vulnerability allows subscription hijacking (PITFALLS.md Critical Pitfall 5). STACK.md confirms @supabase/ssr enables proper JWT verification.

**Delivers:** Authenticated push subscription endpoint via @supabase/ssr createServerClient, token-based rate limiting (5 changes/hour), input validation.

**Addresses:** Epic G (Security Hardening) push security, prevents Pitfall 5 (unauthenticated API).

**Avoids:** Building new push features on insecure foundation. This is 2-hour fix that must ship before any push improvements.

**Research flag:** Skip research-phase (@supabase/ssr docs are comprehensive).

### Phase 4: Unified Navigation Structure
**Rationale:** Structural change that everything else depends on. Dashboard redesign needs stable nav, Progress Hub needs finalized route. ARCHITECTURE.md recommends creating navConfig.ts BEFORE visual changes.

**Delivers:** Single navConfig.ts consumed by both AppNavigation and BottomTabBar, 5-tab mobile bottom bar (eliminate More menu), layout component wrapper (move AppNavigation out of individual pages).

**Addresses:** Epic A (Unified Navigation), prevents Pitfall 1 (broken tour), Pitfall 12 (per-page nav pattern).

**Avoids:** Doing layout-level refactor AFTER visual redesign (double work). Do structural refactor first with zero visual change, then polish.

**Research flag:** Standard patterns (hash routing validated in codebase), but audit ALL data-tour targets, push notification URLs, and navigate() calls. Medium complexity.

### Phase 5: Progress Hub Consolidation
**Rationale:** Depends on unified navigation for new /hub route. Establishes destination before dashboard links to it (ARCHITECTURE.md build order). Highest integration risk due to deep links.

**Delivers:** ProgressHubPage.tsx with tabs (Overview, History, Community), legacy route redirects (/progress, /history, /social → /hub#tab), preserved hash-based deep links.

**Addresses:** Epic C (Progress Hub Consolidation), prevents Pitfall 2 (broken deep links), Pitfall 14 (stale localStorage keys).

**Avoids:** Breaking push notification URLs, SRS review links, user bookmarks. Map ALL existing routes/hashes before consolidation, implement redirects, update all hardcoded path strings.

**Research flag:** Hash routing is established pattern, but needs careful audit of ALL link sources. Medium-high complexity due to blast radius.

### Phase 6: Dashboard Redesign with Next Best Action
**Rationale:** Depends on navigation (dashboard is Home tab) and Progress Hub (dashboard links to it). FEATURES.md research confirms "Next Best Action" decision tree is standard education app pattern (Duolingo, Khan Academy).

**Delivers:** useNextBestAction hook (decision tree from SRS due count, test history, mastery, streak), NextBestAction hero CTA component, simplified 4-5 sections (down from 11).

**Addresses:** Epic B (NBA Dashboard), prevents Pitfall 8 (removing widgets users depend on), Pitfall 11 (motion/react transform conflicts).

**Avoids:** Decision fatigue from 3 equal-weight CTAs, overwhelming 11-section scroll. Preserve key metrics (due cards, streak, readiness) in compact form, link to Progress Hub for details.

**Research flag:** Decision logic needs design review. useNextBestAction priority order should be validated with existing users. Medium complexity.

### Phase 7: Burmese Translation Trust Upgrade
**Rationale:** Can be done alongside or after Hub/Dashboard work. Requires careful content QA, not architectural changes. FEATURES.md confirms translation trust system builds confidence for high-stakes legal content.

**Delivers:** Burmese style guide (glossary, tone, terminology), updated top-20 strings with native speaker review, text expansion safety (overflow-hidden, line-clamp), consistent font-myanmar line-height (1.6-1.8).

**Addresses:** Epic E (Burmese Translation Trust), prevents Pitfall 6 (bad translations erode trust).

**Avoids:** Partial updates creating mixed formality levels, scattered inline Burmese strings outside strings.ts. Audit for Myanmar Unicode (U+1000-109F) outside centralized i18n file first.

**Research flag:** Requires native Burmese speaker, not a technical research phase. Low technical complexity, high content sensitivity.

### Phase Ordering Rationale

- **Foundation first (Phases 1-3)**: Design tokens, question bank, and security are independent changes with no UI dependencies. Get these stable before visible changes.
- **Structure before visual (Phase 4-5)**: Navigation structure and Progress Hub routing established before dashboard redesign. Avoids building links to pages that don't exist yet.
- **Visual polish last (Phase 6-7)**: Dashboard simplification and translation upgrade apply after structural changes stabilize. Changing translations before layout changes = double work.
- **Dependencies honored**: Dashboard depends on Hub existing (for links), Hub depends on unified nav (for /hub route), unified nav depends on stable tokens (for consistent UI).
- **Pitfall avoidance**: Security hardening before push improvements, token consolidation before visual changes, question bank expansion with celebration UX (not silent regression), translation with native speaker review.

### Research Flags

**Phases likely needing deeper research:**
- **Phase 6 (Dashboard):** Next Best Action decision tree priority order needs validation with existing users. What actually drives engagement? Mock decision logic against real user data.
- **Phase 7 (Burmese):** Native speaker recruitment for translation review. Translation trust indicator UI patterns (verification badges, report flow) need UX design.

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (Design Tokens):** CSS custom properties + Tailwind is established pattern. ARCHITECTURE.md confirms approach.
- **Phase 2 (Question Bank):** Official USCIS PDF is source of truth. Data entry + schema alignment.
- **Phase 3 (Security):** @supabase/ssr docs are comprehensive. JWT verification is standard auth pattern.
- **Phase 4 (Navigation):** Hash routing validated in existing HistoryPage/SocialHubPage. navConfig.ts is simple data structure.
- **Phase 5 (Progress Hub):** Reuses existing components, follows existing hash tab pattern. Main work is route mapping.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Only 2 new packages needed (@radix-ui/react-tabs, @supabase/ssr). All other features achievable with existing stack. Verified against npm registry + official docs. |
| Features | HIGH | 7 epics validated against Duolingo/Khan Academy patterns, iOS HIG, and education app research. USCIS 128Q requirement verified via official PDF. |
| Architecture | HIGH | Direct codebase analysis (189 files). Existing patterns (hash routing, provider hierarchy, offline-first) are sound. No new infrastructure needed. |
| Pitfalls | HIGH | 15 pitfalls identified via codebase audit + cross-referencing with React Compiler rules, Supabase security docs, PWA iOS patterns. Validated against MEMORY.md. |

**Overall confidence:** HIGH

The research is grounded in direct codebase analysis (all claims verified against source), official documentation (USCIS, Supabase, Radix, React), and established patterns from education app leaders. The "only 2 new packages" finding de-risks the milestone significantly — most complexity is refactoring existing code, not integrating new dependencies.

### Gaps to Address

**Question bank gap:** The app has 120 questions, but USCIS 2025 requires 128. Research confirmed the gap (8 questions missing) but did not identify WHICH specific questions are missing from the official 128. **Resolution:** Cross-reference existing question IDs (GOV-P01-P16, GOV-S01-S39, etc.) against the official USCIS 2025-Civics-Test-128-Questions-and-Answers.pdf to identify missing Qs. This is Phase 2 work, not a research blocker.

**Next Best Action priority logic:** The decision tree in FEATURES.md is based on Duolingo/Khan Academy patterns (SRS due > streak preservation > weak area > test readiness). This is sound for v2.0, but the exact thresholds (e.g., "SRS due count > 5" vs "> 10", "no test in 7 days" vs "3 days") need validation against real user behavior. **Resolution:** Start with conservative thresholds (lower false positive rate), instrument the CTA with analytics, and tune in v2.1 based on click-through data.

**Translation style guide scope:** FEATURES.md recommends Burmese glossary for key terms, but research did not define the exact term list or formality register. **Resolution:** Phase 7 starts with a translation audit (identify top-20 most-visible strings, catalog current inconsistencies), then draft glossary with native speaker. This is content work, not a research gap.

**iOS safe area edge cases:** PITFALLS.md warns about safe area handling during navigation restructure, but the specific breakage scenarios depend on how the layout component refactor is implemented. **Resolution:** Phase 4 includes explicit safe area testing on iOS Safari standalone mode after EVERY layout change. Use existing --safe-area-top/bottom CSS variables, test on device with notch.

## Sources

### Primary (HIGH confidence)
- **Codebase Analysis:** Direct reading of AppShell.tsx, BottomTabBar.tsx, AppNavigation.tsx, Dashboard.tsx, ProgressPage.tsx, HistoryPage.tsx, SocialHubPage.tsx, globals.css, tailwind.config.js, design-tokens.ts, strings.ts, questions/index.ts (project source files)
- **USCIS Official Docs:** [2025 Civics Test](https://www.uscis.gov/citizenship-resource-center/naturalization-test-and-study-resources/2025-civics-test), [128 Questions PDF](https://www.uscis.gov/sites/default/files/document/questions-and-answers/2025-Civics-Test-128-Questions-and-Answers.pdf)
- **Official Package Docs:** [@radix-ui/react-tabs](https://www.radix-ui.com/primitives/docs/components/tabs), [@supabase/ssr](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [Supabase auth.getUser()](https://supabase.com/docs/guides/auth/server-side/nextjs)
- **React Compiler Rules:** [react-hooks/set-state-in-effect](https://react.dev/reference/eslint-plugin-react-hooks/lints/set-state-in-effect), [react-hooks/refs](https://react.dev/reference/eslint-plugin-react-hooks/lints/refs)
- **Project Context:** docs/PRD-next-milestone.md, .planning/milestones/v1.0/, C:/Users/minkk/.claude/projects/.../memory/MEMORY.md

### Secondary (MEDIUM confidence)
- **Education App Patterns:** [Duolingo Core Tabs Redesign](https://blog.duolingo.com/core-tabs-redesign/), [Duolingo Home Screen](https://blog.duolingo.com/new-duolingo-home-screen-design/), [Next Best Action - CleverTap](https://clevertap.com/blog/next-best-action/)
- **iOS Design:** [Apple Liquid Glass](https://en.wikipedia.org/wiki/Liquid_Glass), [Behind the Design: Duolingo](https://developer.apple.com/news/?id=jhkvppla)
- **Translation Trust:** [Google Crowdsource](https://en.m.wikipedia.org/wiki/Crowdsource_(app)), [Crowdin Localization](https://crowdin.com/)
- **PWA/iOS:** [PWA App Design - web.dev](https://web.dev/learn/pwa/app-design), [Supporting iOS Safe Areas](https://jipfr.nl/blog/supporting-ios-web/)
- **Design Tokens:** [Tailwind CSS Best Practices 2025](https://www.frontendtools.tech/blog/tailwind-css-best-practices-design-system-patterns)

### Tertiary (LOW confidence, needs validation)
- Liquid Glass React libraries (liquid-glass-js, liquidglassui.org) — immature (2025 releases), not recommended
- Immiva/MyAttorneyUSA USCIS guides — third-party summaries, defer to official USCIS PDF

---
*Research completed: 2026-02-09*
*Ready for roadmap: yes*
*Key finding: Only 2 new npm packages needed. 128Q requirement (not 120). Security hardening critical.*
