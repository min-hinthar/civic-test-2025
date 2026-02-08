# Roadmap: Civic Test Prep 2025

## Overview

This roadmap transforms a functional civics test prep app into a polished, offline-capable PWA with intelligent learning features. Starting with critical bug fixes and code quality improvements, we build a stable foundation before adding service worker infrastructure for offline study. The journey then focuses on enhancing the bilingual UX that differentiates this app, followed by explanation-rich learning features, spaced repetition for personalized study, interview simulation for realistic practice, and optional social features. Each phase delivers complete, verifiable capability to Burmese immigrant users preparing for US citizenship.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation & Code Quality** - Fix critical bugs, add TypeScript strictness, establish testing infrastructure
- [x] **Phase 2: PWA & Offline** - Service worker, installability, offline study, sync queue, push notifications
- [x] **Phase 3: UI/UX & Bilingual Polish** - Visual refinement, animations, accessibility, complete bilingual coverage, anxiety-reducing design
- [x] **Phase 4: Learning - Explanations & Category Progress** - Answer explanations, per-category mastery tracking, category-focused practice
- [x] **Phase 5: Spaced Repetition** - FSRS algorithm integration, personalized review scheduling, due cards study mode
- [x] **Phase 6: Interview Simulation** - Audio-only question playback, simulated interview pacing, verbal response practice
- [x] **Phase 7: Social Features** - Study streaks, score sharing, opt-in leaderboards with privacy controls
- [x] **Phase 8: Critical Integration Fixes** - Offline test sync wiring, settings page navigation, lint fixes
- [x] **Phase 9: UI Polish & Onboarding** - Duolingo-inspired UI overhaul, onboarding tour, sound effects, sync indicator, red token audit
- [ ] **Phase 10: Tech Debt Cleanup** - Bilingual toast audit, deprecated imports, test coverage, phase verification, accessibility audit

## Phase Details

### Phase 1: Foundation & Code Quality
**Goal**: Users experience consistent test question distribution, reliable save operations, and developers have confidence in code correctness through strict typing and test coverage.
**Depends on**: Nothing (first phase)
**Requirements**: FNDN-01, FNDN-02, FNDN-03, FNDN-04, FNDN-05, FNDN-06, FNDN-07, FNDN-08, FNDN-09, FNDN-10
**Success Criteria** (what must be TRUE):
  1. User takes multiple tests and sees uniform question distribution (no repeated bias patterns)
  2. User can submit a test once without duplicate records appearing in history
  3. User navigating during a test does not cause browser history stack overflow
  4. Developer runs `npm run typecheck` with zero errors (strict mode enabled)
  5. Developer runs `npm test` and sees passing unit tests for shuffle, SRS logic, and save operations
**Plans**: 5 plans in 3 waves

Plans:
- [x] 01-01-PLAN.md - Testing infrastructure (Vitest, CI, Husky, ESLint flat config)
- [x] 01-02-PLAN.md - Critical bug fixes with TDD (Fisher-Yates shuffle, mutex save, history leak)
- [x] 01-03-PLAN.md - TypeScript strictness (eliminate `any` types, Supabase response types)
- [x] 01-04-PLAN.md - Error handling hardening (Sentry boundaries, bilingual toasts)
- [x] 01-05-PLAN.md - Questions file modularization (split by category, stable IDs)

---

### Phase 2: PWA & Offline
**Goal**: Users can install the app on their home screen and study offline with full functionality, with data syncing automatically when connectivity returns.
**Depends on**: Phase 1
**Requirements**: PWA-01, PWA-02, PWA-03, PWA-04, PWA-05, PWA-06, PWA-07, PWA-08, PWA-09, PWA-10, PWA-11
**Success Criteria** (what must be TRUE):
  1. User sees browser install prompt and can add app to home screen
  2. User can open study guide in airplane mode and browse all 100+ questions
  3. User can complete a test offline and see results saved after going online
  4. User sees clear online/offline status indicator in the app
  5. User receives study reminder push notifications (if opted in)
**Plans**: 6 plans in 5 waves

Plans:
- [x] 02-01-PLAN.md - PWA foundation: manifest, service worker (Serwist), app icons
- [x] 02-02-PLAN.md - IndexedDB question caching and online/offline status indicator
- [x] 02-03-PLAN.md - Offline sync queue for test results with auto-sync
- [x] 02-04-PLAN.md - Install prompt, welcome modal, and notification permission flow
- [x] 02-05-PLAN.md - iOS Safari-specific tip about data persistence
- [x] 02-06-PLAN.md - Push notification infrastructure and settings

---

### Phase 3: UI/UX & Bilingual Polish
**Goal**: Users experience a visually refined, accessible, and fully bilingual app that reduces test anxiety through warm design and encouraging feedback.
**Depends on**: Phase 1 (Phase 2 can run in parallel)
**Requirements**: UIUX-01, UIUX-02, UIUX-03, UIUX-04, UIUX-05, UIUX-06, UIUX-07, UIUX-08, UIUX-09, BILN-01, BILN-02, BILN-03, BILN-04, BILN-05, BILN-06, BILN-07, ANXR-01, ANXR-02, ANXR-03, ANXR-04, ANXR-05
**Success Criteria** (what must be TRUE):
  1. User navigates entire app using only Burmese text (all labels, buttons, messages in both languages)
  2. User on mobile device can easily tap all interactive elements (44x44px minimum)
  3. User sees smooth page transitions and button animations throughout
  4. User with incorrect answer sees gentle orange feedback with encouraging message, not harsh red
  5. User can hide the countdown timer during test mode to reduce stress
**Plans**: 10 plans in 4 waves

Plans:
- [x] 03-01-PLAN.md - Design foundation: fonts, color tokens, animation keyframes
- [x] 03-02-PLAN.md - Core UI components: Button, Card, Skeleton with animations
- [x] 03-03-PLAN.md - Radix accessible components: Dialog, Toast, Progress
- [x] 03-04-PLAN.md - Page transitions and staggered list animations
- [x] 03-05-PLAN.md - Bilingual text components and centralized strings
- [x] 03-06-PLAN.md - Test UX: circular timer, pre-test screen, answer feedback, celebrations
- [x] 03-07-PLAN.md - Flashcard 3D flip and onboarding tour
- [x] 03-08-PLAN.md - Dashboard, Landing, Auth page integration with readiness indicator (ANXR-05)
- [x] 03-08a-PLAN.md - StudyGuide, Test, History page integration
- [x] 03-09-PLAN.md - Dark mode polish and English-only practice mode

---

### Phase 4: Learning - Explanations & Category Progress
**Goal**: Users understand why answers are correct and can track their mastery by category, enabling focused study on weak areas.
**Depends on**: Phase 1, Phase 3 (for UI components)
**Requirements**: EXPL-01, EXPL-02, EXPL-03, EXPL-04, CPRO-01, CPRO-02, CPRO-03, CPRO-04
**Success Criteria** (what must be TRUE):
  1. User sees bilingual explanation for each question after answering in test mode
  2. User sees explanation on back of study guide flashcards
  3. User sees visual mastery progress bar for each category on dashboard
  4. User can start a practice test focused on a single category
  5. User sees weak categories highlighted with study suggestions
**Plans**: 9 plans in 5 waves

Plans:
- [x] 04-01-PLAN.md — Explanation types, USCIS category mapping, and bilingual content for all 100 questions
- [x] 04-02-PLAN.md — Mastery calculation engine with TDD (recency-weighted, IndexedDB storage, weak detection)
- [x] 04-03-PLAN.md — Explanation UI components (ExplanationCard, WhyButton, RelatedQuestions)
- [x] 04-04-PLAN.md — Test mode explanation integration (inline hints + enhanced review screen)
- [x] 04-05-PLAN.md — Study guide flashcard explanations (expandable below answer)
- [x] 04-06-PLAN.md — Progress visualization components and milestone celebration system
- [x] 04-07-PLAN.md — Progress page and dashboard category progress section
- [x] 04-08-PLAN.md — Category practice mode (config, session, results with animated mastery update)
- [x] 04-09-PLAN.md — Weak area nudges, study guide highlighting, history practice tab, push notifications

---

### Phase 5: Spaced Repetition
**Goal**: Users study efficiently with personalized review scheduling that prioritizes weak areas based on proven memory science.
**Depends on**: Phase 1, Phase 2 (for IndexedDB), Phase 4 (for category tracking)
**Requirements**: SRS-01, SRS-02, SRS-03, SRS-04, SRS-05, SRS-06
**Success Criteria** (what must be TRUE):
  1. User sees "due for review" count on dashboard
  2. User enters "Due for Review" study mode and sees overdue cards first
  3. User's review schedule persists across devices (Supabase sync)
  4. User's review schedule works offline (IndexedDB cache)
  5. User sees questions they struggle with more frequently than easy ones
**Plans**: 9 plans in 5 waves

Plans:
- [x] 05-01-PLAN.md — FSRS engine wrapper, SRS types, and IndexedDB card store
- [x] 05-02-PLAN.md — Supabase srs_cards table and sync layer with offline queue
- [x] 05-03-PLAN.md — SRSContext provider and specialized hooks (deck, review, widget)
- [x] 05-04-PLAN.md — AddToDeckButton integration into study guide and test review
- [x] 05-05-PLAN.md — DeckManager page and Study Guide tab routing
- [x] 05-06-PLAN.md — ReviewCard with swipe-to-rate, RatingButtons, and SessionSetup
- [x] 05-07-PLAN.md — ReviewSession orchestrator and session summary
- [x] 05-08-PLAN.md — Dashboard SRS widget and review heatmap
- [x] 05-09-PLAN.md — Navigation badge, push notifications, and settings

---

### Phase 6: Interview Simulation
**Goal**: Users can practice for the real interview experience with audio-only questions paced like the actual civics test.
**Depends on**: Phase 1, Phase 3 (for UI), existing TTS infrastructure
**Requirements**: INTV-01, INTV-02, INTV-03, INTV-04
**Success Criteria** (what must be TRUE):
  1. User can start interview simulation mode and hear questions read aloud
  2. User responds verbally (honor system), then reveals correct answer
  3. User experiences realistic pacing between questions (simulating USCIS interview)
  4. User sees interview simulation results tracked in test history
**Plans**: 6 plans in 5 waves

Plans:
- [x] 06-01-PLAN.md — Interview types, IndexedDB store, greetings, audio chime, bilingual strings
- [x] 06-02-PLAN.md — Extended TTS hook with onEnd callbacks, audio recorder hook, speech rate settings
- [x] 06-03-PLAN.md — Interview page state machine, setup screen, countdown, navigation integration
- [x] 06-04-PLAN.md — Interview session core flow (TTS orchestration, recording, grading, timers)
- [x] 06-05-PLAN.md — Interview results (analysis, trend chart, celebration, mastery integration)
- [x] 06-06-PLAN.md — Supabase sync, dashboard widget, history page interview tab

---

### Phase 7: Social Features
**Goal**: Users can optionally share achievements and compare progress with others while maintaining privacy control.
**Depends on**: Phase 1, Phase 2 (for push notifications), Phase 3 (for UI)
**Requirements**: SOCL-01, SOCL-02, SOCL-03, SOCL-04, SOCL-05, SOCL-06
**Success Criteria** (what must be TRUE):
  1. User sees study streak count on dashboard with encouragement messages
  2. User can generate and share a result card image after completing a test
  3. User can view optional leaderboard showing top scores
  4. User's leaderboard visibility is private by default (opt-in required)
  5. User sees bilingual privacy notice before enabling any social features
**Plans**: 8 plans in 4 waves

Plans:
- [x] 07-01-PLAN.md — Streak tracking core, badge definitions, badge engine, composite score (data layer)
- [x] 07-02-PLAN.md — Supabase social tables, RLS policies, leaderboard RPC function
- [x] 07-03-PLAN.md — Streak widget, badge highlights, activity recording hooks
- [x] 07-04-PLAN.md — Badge celebration modal, badge grid, streak heatmap
- [x] 07-05-PLAN.md — Score sharing card (Canvas renderer, Web Share, preview modal)
- [x] 07-06-PLAN.md — Social context, opt-in flow, streak/profile sync, settings section
- [x] 07-07-PLAN.md — Social hub page, leaderboard table/widget/profile
- [x] 07-08-PLAN.md — Full integration (navigation, share buttons, badge celebrations)

---

### Phase 8: Critical Integration Fixes
**Goal**: Users can take tests offline without losing results, and can discover and access the Settings page from the app navigation.
**Depends on**: Phase 2 (sync queue), Phase 7 (all features complete)
**Requirements**: None (gap closure — fixes integration wiring for existing requirements PWA-07, UIUX-08)
**Gap Closure**: Closes integration gaps from v1 audit
**Success Criteria** (what must be TRUE):
  1. User takes a test while offline and results are queued in IndexedDB sync queue
  2. User goes back online and queued test results automatically sync to Supabase
  3. User can navigate to Settings from the app navigation menu
  4. Developer runs `npm run lint` with zero errors
**Plans**: 3 plans in 2 waves

Plans:
- [x] 08-01-PLAN.md — Build fixes: delete Sentry demo pages, fix lint errors, restore pre-commit hook
- [x] 08-02-PLAN.md — Wire offline test result sync to IndexedDB queue with auto-sync
- [x] 08-03-PLAN.md — Add Settings navigation link to Dashboard header

---

### Phase 9: UI Polish & Onboarding
**Goal**: Users experience a full Duolingo-inspired visual overhaul with consistent anxiety-reducing design, gamified sound feedback, guided onboarding tour, and visible sync status.
**Depends on**: Phase 8
**Requirements**: None (gap closure — fixes tech debt for ANXR-02, UIUX-07)
**Gap Closure**: Closes tech debt from v1 audit + comprehensive UI overhaul
**Success Criteria** (what must be TRUE):
  1. No `text-red-600` or `bg-red-600` remains in any component (replaced with destructive/warning tokens)
  2. First-time users see the OnboardingTour on their initial visit
  3. User sees pending sync count indicator when offline items are queued
  4. All pages have Duolingo-inspired 3D buttons, rounded cards, bold typography
  5. Sound effects play for correct/incorrect answers with mute toggle in Settings
  6. Mobile users see bottom tab bar navigation
  7. Progress page shows vertical skill tree with 7 sub-category nodes
**Plans**: 12 plans in 5 waves

Plans:
- [x] 09-01-PLAN.md — Design system foundation: tokens, 3D buttons, radius, accent colors, destructive hue shift
- [x] 09-02-PLAN.md — Sound effects system with mute toggle in Settings
- [x] 09-03-PLAN.md — Floating sync status indicator redesign (OfflineContext, AnimatePresence)
- [x] 09-04-PLAN.md — Onboarding tour: welcome screen, 7 steps, custom tooltip, AppShell mount, Settings replay
- [x] 09-05-PLAN.md — Red token audit: warning toast variant, destructive reclassification, remaining red fixes
- [x] 09-06-PLAN.md — Navigation overhaul: mobile bottom tab bar + desktop nav refresh
- [x] 09-07-PLAN.md — Landing + Auth page full bilingual Duolingo-inspired redesign
- [x] 09-08-PLAN.md — Dashboard hero readiness + Settings grouped sections overhaul
- [x] 09-09-PLAN.md — Test + Practice page overhaul: progress bar, icon reactions, sound integration
- [x] 09-10-PLAN.md — Study Guide + Flashcard overhaul: category color header strips
- [x] 09-11-PLAN.md — Progress page Duolingo-style vertical skill tree path
- [x] 09-12-PLAN.md — History + Social + Interview refresh + final comprehensive audit checkpoint

---

### Phase 10: Tech Debt Cleanup
**Goal**: Close all tech debt identified in v1.0 milestone audit — complete bilingual toast coverage, clean deprecated imports, improve test coverage, and produce formal verification artifacts for unverified phases.
**Depends on**: Phase 9
**Requirements**: None (tech debt closure — strengthens BILN-03, BILN-04, FNDN-08, UIUX-06)
**Gap Closure**: Closes all 8 tech debt items from v1.0-MILESTONE-AUDIT.md
**Success Criteria** (what must be TRUE):
  1. All toast callsites use bilingual format (zero English-only toast calls remain)
  2. No files import from deprecated `@/constants/civicsQuestions` path
  3. Unit test coverage improved toward 70% threshold (new tests for uncovered modules)
  4. Phase 02 and Phase 09 have formal VERIFICATION.md artifacts
  5. Keyboard accessibility findings documented
**Plans**: 4 plans in 2 waves

Plans:
- [ ] 10-01-PLAN.md — Bilingual toast audit: convert all English-only toast calls to BilingualToast format
- [ ] 10-02-PLAN.md — Code cleanup: deprecated imports, lint, TS error investigation
- [ ] 10-03-PLAN.md — Test coverage improvements: add unit tests for uncovered modules
- [ ] 10-04-PLAN.md — Phase verification and accessibility audit: run verifier on Ph02/09, document keyboard findings

---

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9 -> 10
Note: Phase 2 and 3 can run in parallel after Phase 1 completes.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Code Quality | 5/5 | Complete | 2026-02-05 |
| 2. PWA & Offline | 6/6 | Complete | 2026-02-06 |
| 3. UI/UX & Bilingual Polish | 10/10 | Complete | 2026-02-07 |
| 4. Learning - Explanations & Category Progress | 9/9 | Complete | 2026-02-07 |
| 5. Spaced Repetition | 9/9 | Complete | 2026-02-07 |
| 6. Interview Simulation | 6/6 | Complete | 2026-02-07 |
| 7. Social Features | 8/8 | Complete | 2026-02-07 |
| 8. Critical Integration Fixes | 3/3 | Complete | 2026-02-08 |
| 9. UI Polish & Onboarding | 12/12 | Complete | 2026-02-08 |
| 10. Tech Debt Cleanup | 0/4 | Pending | — |

---

*Roadmap created: 2026-02-05*
*Last updated: 2026-02-08 after Phase 10 tech debt closure planning (4 plans in 2 waves)*
