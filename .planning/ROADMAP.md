# Roadmap: Civic Test Prep 2025

## Overview

This roadmap transforms a functional civics test prep app into a polished, offline-capable PWA with intelligent learning features. Starting with critical bug fixes and code quality improvements, we build a stable foundation before adding service worker infrastructure for offline study. The journey then focuses on enhancing the bilingual UX that differentiates this app, followed by explanation-rich learning features, spaced repetition for personalized study, interview simulation for realistic practice, and optional social features. Each phase delivers complete, verifiable capability to Burmese immigrant users preparing for US citizenship.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation & Code Quality** - Fix critical bugs, add TypeScript strictness, establish testing infrastructure
- [ ] **Phase 2: PWA & Offline** - Service worker, installability, offline study, sync queue, push notifications
- [ ] **Phase 3: UI/UX & Bilingual Polish** - Visual refinement, animations, accessibility, complete bilingual coverage, anxiety-reducing design
- [ ] **Phase 4: Learning - Explanations & Category Progress** - Answer explanations, per-category mastery tracking, category-focused practice
- [ ] **Phase 5: Spaced Repetition** - FSRS algorithm integration, personalized review scheduling, due cards study mode
- [ ] **Phase 6: Interview Simulation** - Audio-only question playback, simulated interview pacing, verbal response practice
- [ ] **Phase 7: Social Features** - Study streaks, score sharing, opt-in leaderboards with privacy controls

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
- [ ] 01-01-PLAN.md - Testing infrastructure (Vitest, CI, Husky, ESLint flat config)
- [ ] 01-02-PLAN.md - Critical bug fixes with TDD (Fisher-Yates shuffle, mutex save, history leak)
- [ ] 01-03-PLAN.md - TypeScript strictness (eliminate `any` types, Supabase response types)
- [ ] 01-04-PLAN.md - Error handling hardening (Sentry boundaries, bilingual toasts)
- [ ] 01-05-PLAN.md - Questions file modularization (split by category, stable IDs)

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
**Plans**: TBD

Plans:
- [ ] 02-01: Web manifest and app icons
- [ ] 02-02: Service worker setup (Serwist, precaching)
- [ ] 02-03: IndexedDB question caching (idb-keyval)
- [ ] 02-04: Offline sync queue for test results
- [ ] 02-05: Install prompt component
- [ ] 02-06: Online/offline status indicator
- [ ] 02-07: Push notification infrastructure
- [ ] 02-08: iOS persistent storage and Safari handling

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
**Plans**: TBD

Plans:
- [ ] 03-01: Typography and spacing system
- [ ] 03-02: Noto Sans Myanmar font embedding
- [ ] 03-03: Mobile-first responsive layouts
- [ ] 03-04: Page transitions and micro-animations (Motion)
- [ ] 03-05: Accessible components (Radix UI dialogs, toasts, progress)
- [ ] 03-06: Bilingual navigation, buttons, and messages
- [ ] 03-07: Anxiety-reducing design (microcopy, soft feedback, celebrations)
- [ ] 03-08: Dark mode contrast refinement
- [ ] 03-09: Loading skeletons and scroll behavior

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
**Plans**: TBD

Plans:
- [ ] 04-01: Explanation content creation (bilingual, authoritative sources)
- [ ] 04-02: Test review screen with explanations
- [ ] 04-03: Study guide flashcard explanations
- [ ] 04-04: Category progress tracking and visualization
- [ ] 04-05: Category-focused practice tests
- [ ] 04-06: Weak category detection and recommendations

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
**Plans**: TBD

Plans:
- [ ] 05-01: ts-fsrs integration and SRS data model
- [ ] 05-02: Supabase srs_cards table with RLS
- [ ] 05-03: SRS IndexedDB cache layer
- [ ] 05-04: SRSProvider context and hooks
- [ ] 05-05: Due cards study mode UI
- [ ] 05-06: Dashboard SRS widget
- [ ] 05-07: Cross-device sync conflict resolution

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
**Plans**: TBD

Plans:
- [ ] 06-01: Interview simulation mode UI
- [ ] 06-02: Audio-only question playback
- [ ] 06-03: Interview pacing and timing logic
- [ ] 06-04: Results tracking integration

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
**Plans**: TBD

Plans:
- [ ] 07-01: Study streak tracking and dashboard display
- [ ] 07-02: Score sharing card generation
- [ ] 07-03: Leaderboard page and opt-in flow
- [ ] 07-04: Privacy controls and visibility settings
- [ ] 07-05: Supabase social tables (follows, streaks, achievements)

---

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7
Note: Phase 2 and 3 can run in parallel after Phase 1 completes.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Code Quality | 0/5 | Planned | - |
| 2. PWA & Offline | 0/8 | Not started | - |
| 3. UI/UX & Bilingual Polish | 0/9 | Not started | - |
| 4. Learning - Explanations & Category Progress | 0/6 | Not started | - |
| 5. Spaced Repetition | 0/7 | Not started | - |
| 6. Interview Simulation | 0/4 | Not started | - |
| 7. Social Features | 0/5 | Not started | - |

---

*Roadmap created: 2026-02-05*
*Last updated: 2026-02-05*
