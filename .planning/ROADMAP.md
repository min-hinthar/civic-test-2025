# Roadmap: Civic Test Prep 2025

## Milestones

- :white_check_mark: **v1.0 MVP** — Phases 1-10 (shipped 2026-02-08)
- :white_check_mark: **v2.0 Unified Learning Hub** — Phases 11-17 (shipped 2026-02-13)
- :white_check_mark: **v2.1 Quality & Polish** — Phases 18-28 (shipped 2026-02-19)
- :construction: **v3.0 World-Class UX** — Phases 29-34 (in progress)

## Phases

<details>
<summary>v1.0 MVP (Phases 1-10) — SHIPPED 2026-02-08</summary>

- [x] Phase 1: Foundation & Code Quality (5 plans)
- [x] Phase 2: PWA & Offline (6 plans)
- [x] Phase 3: UI/UX & Bilingual Polish (10 plans)
- [x] Phase 4: Learning, Explanations & Category Progress (9 plans)
- [x] Phase 5: Spaced Repetition (9 plans)
- [x] Phase 6: Interview Simulation (6 plans)
- [x] Phase 7: Social Features (8 plans)
- [x] Phase 8: Critical Integration Fixes (5 plans)
- [x] Phase 9: Testing & Launch Prep (7 plans)
- [x] Phase 10: Final Polish & Ship (7 plans)

See `.planning/milestones/v1.0/` for full archive.

</details>

<details>
<summary>v2.0 Unified Learning Hub (Phases 11-17) — SHIPPED 2026-02-13</summary>

- [x] Phase 11: Design Token Foundation (7 plans)
- [x] Phase 12: USCIS 2025 Question Bank (6 plans)
- [x] Phase 13: Security Hardening (5 plans)
- [x] Phase 14: Unified Navigation (7 plans)
- [x] Phase 15: Progress Hub (6 plans)
- [x] Phase 16: Dashboard Next Best Action (5 plans)
- [x] Phase 17: UI System Polish (11 plans)

See `.planning/milestones/v2.0-ROADMAP.md` for full archive.

</details>

<details>
<summary>v2.1 Quality & Polish (Phases 18-28) — SHIPPED 2026-02-19</summary>

- [x] Phase 18: Language Mode (7 plans)
- [x] Phase 19: TTS Core Extraction (6 plans)
- [x] Phase 20: Session Persistence (6 plans)
- [x] Phase 21: Test, Practice & Interview UX Overhaul (12 plans)
- [x] Phase 22: TTS Quality (9 plans)
- [x] Phase 23: Flashcard Sort Mode (9 plans)
- [x] Phase 24: Accessibility & Performance (10 plans)
- [x] Phase 25: Burmese Translation Audit (10 plans)
- [x] Phase 26: Gap Closure — Session, Navigation & TTS Fixes (3 plans)
- [x] Phase 27: Gap Closure — Timer Accessibility (1 plan)
- [x] Phase 28: Interview UX & Voice Flow Polish (9 plans)

See `.planning/milestones/v2.1-ROADMAP.md` for full archive.

</details>

### :construction: v3.0 World-Class UX (In Progress)

**Milestone Goal:** Elevate every screen to Duolingo-level polish with consistent visual language, delightful micro-interactions, native-app mobile feel, content completeness, and an About page honoring the app's inspirational figures.

- [ ] **Phase 29: Visual Foundation** - Enforce spacing grid, typography scale, border radius rules, touch targets, dark mode contrast, and unified motion tokens across all screens
- [x] **Phase 30: Mobile Native Feel** - PWA standalone CSS, safe area insets, haptic feedback utility, user-select guards, and swipe-to-dismiss toasts (completed 2026-02-20)
- [x] **Phase 31: Animation & Interaction Polish** - Button press feedback tiers, stagger audit with length scaling, exit animations on overlays, card enter animations, and glass-morphism tier audit (completed 2026-02-20)
- [ ] **Phase 32: Celebration System Elevation** - Fix confetti leak, build useCelebration hook with CelebrationOverlay, achievement-scaled confetti, multi-stage choreography, DotLottie animations, sound warming, XP counter
- [ ] **Phase 33: States & Accessibility** - Skeleton screens, empty state designs, inline error recovery, focus management on route changes, reduced motion CSS completeness, screen reader celebration announcements, modal focus traps
- [x] **Phase 34: Content & About Page** - 28 missing USCIS 2025 explanations, explanation quality audit, About page with mission narrative and bilingual dedication cards (completed 2026-02-20)

## Phase Details

### Phase 29: Visual Foundation
**Goal**: Every screen uses a consistent visual language — spacing, typography, radius, and motion — so subsequent animation and interaction work builds on a solid, uniform canvas
**Depends on**: Nothing (first phase of v3.0)
**Requirements**: VISC-01, VISC-02, VISC-03, VISC-04, VISC-05, VISC-06, VISC-07
**Success Criteria** (what must be TRUE):
  1. Every padding and margin value in the codebase aligns to the 4px grid (4, 8, 12, 16, 20, 24, 32, 40, 48, 64) with no arbitrary pixel values
  2. Typography across all screens uses only the locked scale (caption/body-sm/body/heading-sm/heading/display) with no stray font-size values
  3. Border radius is consistent per component type (pills=full, buttons=xl, cards=2xl, modals=3xl, inputs=lg) with no per-screen overrides
  4. All interactive elements pass a 44x44px minimum touch target audit (including icon buttons, filter chips, and close buttons)
  5. Dark mode glass panels have tuned contrast, shadow depth, and text readability — no washed-out or unreadable text on glass surfaces
**Plans**: 7 plans in 2 waves
  - [ ] 29-01-PLAN.md — Define semantic typography scale in Tailwind config
  - [ ] 29-02-PLAN.md — Document spacing grid + fix border radius inconsistency
  - [ ] 29-03-PLAN.md — Fix touch target violations (ShareButton, AddToDeckButton, Dialog)
  - [ ] 29-04-PLAN.md — Migrate glass-panel to three-tier system + remove legacy class
  - [ ] 29-05-PLAN.md — Unify motion tokens between CSS and JS systems
  - [ ] 29-06-PLAN.md — Migrate text-[10px] to text-caption (18 files)
  - [ ] 29-07-PLAN.md — Audit and add micro-interactions to interactive elements

### Phase 30: Mobile Native Feel
**Goal**: The app feels like an installed native app on mobile — no rubber-band white flash, no accidental text selection, proper safe area handling, and tactile haptic feedback on key interactions
**Depends on**: Phase 29
**Requirements**: MOBI-01, MOBI-02, MOBI-03, MOBI-04, MOBI-05, MOBI-06
**Success Criteria** (what must be TRUE):
  1. In PWA standalone mode, overscrolling does not produce a white flash or rubber-band effect
  2. On iPhone with Dynamic Island, the bottom tab bar and glass header respect safe area insets with no content overlap
  3. Tapping interactive elements (buttons, toggles, chips) does not trigger accidental text selection
  4. Toast notifications can be swiped away with a natural drag gesture
  5. Haptic feedback fires on answer check, streak rewards, badge celebrations, and 3D button press (Android vibration, graceful no-op on iOS)
**Plans**: 4 plans in 2 waves
Plans:
- [ ] 30-01-PLAN.md — CSS mobile guards, safe area insets, and manifest portrait lock
- [ ] 30-02-PLAN.md — Expand haptics.ts with three-tier system and celebration pattern
- [ ] 30-03-PLAN.md — Swipe-to-dismiss toast rewrite with motion/react drag
- [ ] 30-04-PLAN.md — Haptics integration across all interactive components (~14 files)

### Phase 31: Animation & Interaction Polish
**Goal**: Every interaction has appropriate, consistent feedback — buttons respond at the right tier, lists stagger smoothly, overlays exit gracefully, and glass-morphism tiers are correctly applied everywhere
**Depends on**: Phase 29
**Requirements**: ANIM-01, ANIM-02, ANIM-03, ANIM-04, ANIM-05, ANIM-06
**Success Criteria** (what must be TRUE):
  1. Primary buttons use 3D chunky press feedback, secondary buttons use subtle scale, and tertiary buttons use opacity — consistently across all screens
  2. All item lists use staggered enter animation with timing that scales to list length (faster for short lists, capped at 8-10 items, skipped for 15+)
  3. Closing any overlay (dialog, modal, tooltip, toast) plays a fade + scale(0.95) exit animation instead of an instant disappearance
  4. Card components enter with a consistent scale(0.95 to 1) + fade animation across all screens
  5. Glass-morphism tiers (light/medium/heavy) are applied correctly per component type — verified across all screens in both light and dark mode
**Plans**: 5 plans in 2 waves
Plans:
- [ ] 31-01-PLAN.md — Button tier system (3D chunky primary, scale secondary, opacity tertiary)
- [ ] 31-02-PLAN.md — Dialog exit animations + dismiss audio cue
- [ ] 31-03-PLAN.md — Glass-morphism noise texture, text-shadow, and tier audit
- [ ] 31-04-PLAN.md — Card enter animations (scale+fade on mount)
- [ ] 31-05-PLAN.md — StaggeredList adaptive timing + coverage audit

### Phase 32: Celebration System Elevation
**Goal**: Achievements and milestones trigger choreographed, multi-sensory celebrations — confetti, sound, haptics, and animation work together in timed sequences that scale to the significance of what the user accomplished
**Depends on**: Phase 30 (haptics utility), Phase 31 (animation patterns)
**Requirements**: CELB-01, CELB-02, CELB-03, CELB-04, CELB-05, CELB-06, CELB-07, CELB-08, CELB-09, CELB-10
**Success Criteria** (what must be TRUE):
  1. Navigating away during a celebration does not leak intervals or produce console errors (confetti setInterval leak fixed)
  2. Calling `celebrate(level)` from any component triggers the correct intensity of confetti, sound, and haptics via a single hook API without wiring individual effects
  3. Test results screen plays a multi-stage choreography: card scale-in, then score count-up with dramatic easing, then pass/fail reveal, then confetti, then sound, then action buttons stagger in — each stage visibly sequenced, not simultaneous
  4. DotLottie celebration animations (checkmark, trophy, badge glow, star burst) load lazily and play at 60fps without blocking the main thread
  5. XP counter in the quiz session header pulses with spring animation each time the user earns points
**Plans**: 6 plans in 3 waves
Plans:
- [ ] 32-01-PLAN.md — Fix confetti leak + civics-themed shapes and party popper physics
- [ ] 32-02-PLAN.md — Sound harmonics + celebration sound sequences
- [ ] 32-03-PLAN.md — DotLottie integration + CSP update
- [ ] 32-04-PLAN.md — Dramatic score count-up easing + XP counter
- [ ] 32-05-PLAN.md — useCelebration hook + CelebrationOverlay orchestration
- [ ] 32-06-PLAN.md — TestResultsScreen multi-stage choreography

### Phase 33: States & Accessibility
**Goal**: Every screen has polished loading, empty, and error states, and all users — including those using screen readers or reduced motion — experience the full app without information loss
**Depends on**: Phase 32 (celebration overlay exists for screen reader announcements)
**Requirements**: STAT-01, STAT-02, STAT-03, STAT-04, STAT-05, STAT-06, STAT-07
**Success Criteria** (what must be TRUE):
  1. Dashboard, Study Guide, Settings, and all Progress Hub tabs show skeleton screens that match the layout of their loaded state while async content is fetched
  2. New users with zero data see designed empty states (not blank screens) on Dashboard, Hub History, Hub Achievements, and SRS Deck — each with bilingual guidance on what to do next
  3. When content fails to load, an inline error state appears with icon, bilingual message, retry button, and fallback content — not a blank screen or unhandled error
  4. Navigating to any route moves focus to the page's first h1 or main content area so keyboard and screen reader users know where they are
  5. All CSS keyframes and transitions respect `prefers-reduced-motion: reduce` — animation-dependent information is preserved via alternative non-motion presentation
**Plans**: 5 plans in 3 waves
Plans:
- [ ] 33-01-PLAN.md — Reusable state components (Skeleton, EmptyState, ErrorFallback, announcer, useRetry)
- [ ] 33-02-PLAN.md — Reduced motion CSS audit + StaggeredList fix
- [ ] 33-03-PLAN.md — Skeleton + empty state integration across all screens
- [ ] 33-04-PLAN.md — Error recovery + OfflineBanner integration
- [ ] 33-05-PLAN.md — Focus management, live region announcements, modal focus trap audit

### Phase 34: Content & About Page
**Goal**: Every USCIS 2025 question has a complete, quality explanation, and the app includes an About page that tells the story of why it exists and honors the people who inspired it
**Depends on**: Phase 29 (visual foundation for consistent page styling)
**Requirements**: CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, CONT-06
**Success Criteria** (what must be TRUE):
  1. All 128 USCIS questions have explanation objects — no missing explanations when a user taps "Why?" on any question
  2. Explanations follow a consistent format and depth across all 128 questions — no jarring quality differences between original 100 and the 28 USCIS 2025 additions
  3. The About page tells the app's origin story, mission, and the history of Volunteers in Asia and the Pre-Collegiate Program in a compelling narrative
  4. Bilingual dedication cards for Dwight D. Clark and Dorothy & James Guyot render with dignity in both English-only and bilingual modes
  5. The About page is accessible from Settings (and optionally navigation) and renders correctly in both language modes
**Plans**: 3 plans in 2 waves
Plans:
- [ ] 34-01-PLAN.md — Bilingual content constants + CONT-01/CONT-02 verification
- [ ] 34-02-PLAN.md — About page UI, DedicationCard component, route registration
- [ ] 34-03-PLAN.md — Navigation integration (GlassHeader heart, Settings link, landing teaser)

## Progress

**Execution Order:**
Phases execute in numeric order: 29 → 30 → 31 → 32 → 33 → 34
Note: Phase 34 (Content) depends only on Phase 29 and can potentially run in parallel with Phases 30-33.

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 29. Visual Foundation | v3.0 | TBD | Not started | - |
| 30. Mobile Native Feel | 4/4 | Complete    | 2026-02-20 | - |
| 31. Animation & Interaction Polish | 5/5 | Complete    | 2026-02-20 | - |
| 32. Celebration System Elevation | 1/6 | In Progress|  | - |
| 33. States & Accessibility | v3.0 | TBD | Not started | - |
| 34. Content & About Page | 3/3 | Complete    | 2026-02-20 | - |

**Cumulative:**

| Milestone | Phases | Plans | Requirements | Status | Date |
|-----------|--------|-------|-------------|--------|------|
| v1.0 MVP | 1-10 | 72 | 55/55 | Complete | 2026-02-08 |
| v2.0 Unified Learning Hub | 11-17 | 47 | 29/29 | Complete | 2026-02-13 |
| v2.1 Quality & Polish | 18-28 | 82 | 65/66 | Complete | 2026-02-19 |
| v3.0 World-Class UX | 29-34 | TBD | 0/39 | In progress | - |

**Total:** 34 phases, 201+ plans, 149/150 + 0/39 requirements

---
*Roadmap created: 2026-02-05*
*v3.0 roadmap added: 2026-02-19*
