# Requirements: Civic Test Prep 2025

**Defined:** 2026-02-05
**Core Value:** Burmese immigrants can confidently prepare for and pass the US civics test using an app that feels welcoming and speaks their language.

## v1 Requirements

Requirements for this milestone. Each maps to roadmap phases.

### Foundation & Code Quality

- [x] **FNDN-01**: Shuffle algorithm uses Fisher-Yates for uniform question distribution
- [x] **FNDN-02**: Test session save uses async state machine (idle/saving/saved/error) preventing duplicate submissions
- [x] **FNDN-03**: Navigation lock uses replaceState instead of pushState to prevent memory leak
- [x] **FNDN-04**: All `any` types replaced with proper TypeScript interfaces
- [x] **FNDN-05**: TypeScript strict mode enabled and passing
- [x] **FNDN-06**: Sentry error boundaries wired to all page components
- [x] **FNDN-07**: Error messages sanitized before logging (no raw DB schema exposure)
- [x] **FNDN-08**: Vitest configured with unit tests for shuffle, SM-2/FSRS, and save logic
- [x] **FNDN-09**: Playwright configured for E2E tests on auth flow, test-taking, and study guide
- [x] **FNDN-10**: Questions file split into per-category modules with aggregating index

### PWA & Offline

- [x] **PWA-01**: Web app manifest with app name, icons (192px, 512px), theme color, display standalone
- [x] **PWA-02**: Service worker registered via Serwist with precaching for app shell
- [x] **PWA-03**: Offline fallback page shown when network unavailable and content not cached
- [x] **PWA-04**: Install prompt component guides users to add app to home screen
- [x] **PWA-05**: Questions cached in IndexedDB via idb-keyval for offline study
- [x] **PWA-06**: Study guide works fully offline using cached question data
- [x] **PWA-07**: Test results queued in IndexedDB when offline, synced to Supabase when online
- [x] **PWA-08**: Online/offline status indicator visible to user
- [x] **PWA-09**: Push notification subscription flow (opt-in, bilingual prompt)
- [x] **PWA-10**: Study reminder push notifications (configurable frequency)
- [x] **PWA-11**: Persistent storage requested on iOS to mitigate 7-day eviction

### UI/UX Polish

- [x] **UIUX-01**: Consistent spacing, typography, and component sizing across all pages
- [x] **UIUX-02**: Page transitions using Motion (enter/exit animations)
- [x] **UIUX-03**: Micro-animations on all interactive elements (buttons, cards, modals, toggles)
- [x] **UIUX-04**: Mobile-first responsive layouts for all pages (landing, auth, dashboard, test, study, history)
- [x] **UIUX-05**: Touch-friendly tap targets (minimum 44x44px per WCAG)
- [x] **UIUX-06**: Radix UI primitives for dialogs, toasts, and progress bars (accessible, keyboard-navigable)
- [x] **UIUX-07**: Loading skeletons for async content instead of blank screens
- [x] **UIUX-08**: Smooth scroll behavior and native-feeling navigation
- [x] **UIUX-09**: Dark mode refined with proper contrast ratios for both English and Burmese text

### Bilingual Expansion

- [x] **BILN-01**: All navigation labels displayed in both English and Burmese
- [x] **BILN-02**: All button text displayed in both English and Burmese
- [x] **BILN-03**: All toast/notification messages displayed in both languages
- [x] **BILN-04**: All error messages displayed in both languages
- [x] **BILN-05**: Dashboard headings and metric labels in both languages
- [x] **BILN-06**: Noto Sans Myanmar font embedded (not reliant on system fonts)
- [x] **BILN-07**: Burmese text renders correctly across iOS, Android, and desktop browsers

### Anxiety-Reducing UX

- [x] **ANXR-01**: Encouraging microcopy throughout (bilingual) - "You're doing great!" / warm completion messages
- [x] **ANXR-02**: Soft feedback for incorrect answers (no harsh red/wrong - use gentle orange with explanation)
- [x] **ANXR-03**: Progress celebration animations on milestones (streak, category mastered, test passed)
- [x] **ANXR-04**: Optional timer display in test mode (user can hide countdown)
- [x] **ANXR-05**: "Am I ready?" readiness confidence indicator on dashboard based on study progress

### Learning Features - Explanations

- [ ] **EXPL-01**: Each question has an explanation field (bilingual) explaining why the answer is correct
- [ ] **EXPL-02**: Explanations displayed after answering in test mode (review screen)
- [ ] **EXPL-03**: Explanations displayed on study guide flashcard back
- [ ] **EXPL-04**: Explanation content sourced from authoritative civics resources

### Learning Features - Category Progress

- [ ] **CPRO-01**: Per-category mastery indicator on dashboard (visual progress bar)
- [ ] **CPRO-02**: Category drill-down showing questions answered, accuracy, and trend
- [ ] **CPRO-03**: Category-focused practice tests (user selects topic to study)
- [ ] **CPRO-04**: Weak categories highlighted with study suggestions

### Learning Features - Spaced Repetition

- [ ] **SRS-01**: FSRS algorithm (ts-fsrs) integrated for review scheduling
- [ ] **SRS-02**: Per-question SRS state tracked in Supabase (ease, interval, next review)
- [ ] **SRS-03**: SRS state cached in IndexedDB for offline study sessions
- [ ] **SRS-04**: "Due for review" study mode showing overdue cards first
- [ ] **SRS-05**: Dashboard widget showing number of cards due for review today
- [ ] **SRS-06**: SRS state syncs between devices via Supabase

### Learning Features - Interview Simulation

- [ ] **INTV-01**: Interview simulation mode that plays questions aloud via TTS
- [ ] **INTV-02**: User responds verbally (honor system), then reveals correct answer
- [ ] **INTV-03**: Simulation paces questions like real civics interview
- [ ] **INTV-04**: Results tracked same as regular test mode

### Social Features

- [ ] **SOCL-01**: Study streak tracking (consecutive days studied)
- [ ] **SOCL-02**: Streak display on dashboard with encouragement messages
- [ ] **SOCL-03**: Score sharing - generate shareable result card/image
- [ ] **SOCL-04**: Leaderboard page showing top scores (opt-in, privacy-first)
- [ ] **SOCL-05**: User can toggle leaderboard visibility (private by default)
- [ ] **SOCL-06**: Privacy notice (bilingual) before enabling social features

## v2 Requirements

Deferred to future milestone. Tracked but not in current roadmap.

### Enhanced Audio

- **AUD-01**: Burmese TTS when browser voices available
- **AUD-02**: Fallback audio files for Burmese content when TTS unavailable

### Community

- **COMM-01**: Study groups - invite friends to study together
- **COMM-02**: Discussion forum per question
- **COMM-03**: User-generated study tips

### Additional Languages

- **LANG-01**: Support for additional Myanmar ethnic languages
- **LANG-02**: Language toggle option for users who prefer single-language view

### Admin

- **ADMN-01**: Admin panel for question management
- **ADMN-02**: Analytics dashboard for usage metrics

## Out of Scope

| Feature | Reason |
|---------|--------|
| Native mobile app (Capacitor/RN) | PWA is sufficient for this milestone |
| Real-time chat | High complexity, not core to test prep |
| Video content | Storage/bandwidth costs, unnecessary for civics format |
| AI chatbot tutor | Expensive API costs, risk of incorrect answers for legal context |
| Paid/premium tier | App stays free - no financial barriers for immigrants |
| Multi-language beyond English/Burmese | Focus on doing two languages well first |
| Full voice input recognition | Complex, privacy concerns, not needed for study tool |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FNDN-01 | Phase 1 | Complete |
| FNDN-02 | Phase 1 | Complete |
| FNDN-03 | Phase 1 | Complete |
| FNDN-04 | Phase 1 | Complete |
| FNDN-05 | Phase 1 | Complete |
| FNDN-06 | Phase 1 | Complete |
| FNDN-07 | Phase 1 | Complete |
| FNDN-08 | Phase 1 | Complete |
| FNDN-09 | Phase 1 | Complete |
| FNDN-10 | Phase 1 | Complete |
| PWA-01 | Phase 2 | Complete |
| PWA-02 | Phase 2 | Complete |
| PWA-03 | Phase 2 | Complete |
| PWA-04 | Phase 2 | Complete |
| PWA-05 | Phase 2 | Complete |
| PWA-06 | Phase 2 | Complete |
| PWA-07 | Phase 2 | Complete |
| PWA-08 | Phase 2 | Complete |
| PWA-09 | Phase 2 | Complete |
| PWA-10 | Phase 2 | Complete |
| PWA-11 | Phase 2 | Complete |
| UIUX-01 | Phase 3 | Complete |
| UIUX-02 | Phase 3 | Complete |
| UIUX-03 | Phase 3 | Complete |
| UIUX-04 | Phase 3 | Complete |
| UIUX-05 | Phase 3 | Complete |
| UIUX-06 | Phase 3 | Complete |
| UIUX-07 | Phase 3 | Complete |
| UIUX-08 | Phase 3 | Complete |
| UIUX-09 | Phase 3 | Complete |
| BILN-01 | Phase 3 | Complete |
| BILN-02 | Phase 3 | Complete |
| BILN-03 | Phase 3 | Complete |
| BILN-04 | Phase 3 | Complete |
| BILN-05 | Phase 3 | Complete |
| BILN-06 | Phase 3 | Complete |
| BILN-07 | Phase 3 | Complete |
| ANXR-01 | Phase 3 | Complete |
| ANXR-02 | Phase 3 | Complete |
| ANXR-03 | Phase 3 | Complete |
| ANXR-04 | Phase 3 | Complete |
| ANXR-05 | Phase 3 | Complete |
| EXPL-01 | Phase 4 | Pending |
| EXPL-02 | Phase 4 | Pending |
| EXPL-03 | Phase 4 | Pending |
| EXPL-04 | Phase 4 | Pending |
| CPRO-01 | Phase 4 | Pending |
| CPRO-02 | Phase 4 | Pending |
| CPRO-03 | Phase 4 | Pending |
| CPRO-04 | Phase 4 | Pending |
| SRS-01 | Phase 5 | Pending |
| SRS-02 | Phase 5 | Pending |
| SRS-03 | Phase 5 | Pending |
| SRS-04 | Phase 5 | Pending |
| SRS-05 | Phase 5 | Pending |
| SRS-06 | Phase 5 | Pending |
| INTV-01 | Phase 6 | Pending |
| INTV-02 | Phase 6 | Pending |
| INTV-03 | Phase 6 | Pending |
| INTV-04 | Phase 6 | Pending |
| SOCL-01 | Phase 7 | Pending |
| SOCL-02 | Phase 7 | Pending |
| SOCL-03 | Phase 7 | Pending |
| SOCL-04 | Phase 7 | Pending |
| SOCL-05 | Phase 7 | Pending |
| SOCL-06 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 55 total
- Mapped to phases: 55
- Unmapped: 0

---
*Requirements defined: 2026-02-05*
*Last updated: 2026-02-07 after Phase 3 completion*
