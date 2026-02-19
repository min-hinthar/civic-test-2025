# Roadmap: Civic Test Prep 2025

## Overview

This roadmap tracks all development phases for the Civic Test Prep app. Two milestones shipped: v1.0 (full-featured bilingual PWA) and v2.0 (unified navigation, dashboard intelligence, progress hub, USCIS 2025, iOS-inspired polish, security hardening). The active milestone v2.1 refines the core learning experience with Duolingo-style test UX, consistent language mode, session persistence, TTS quality improvements, flashcard sorting, and accessibility/performance hardening.

## Completed Milestones

### v1.0 MVP (2026-02-08)

10 phases, 72 plans, 55/55 requirements. See `.planning/milestones/v1.0/` for full archive.

### v2.0 Unified Learning Hub (2026-02-13)

7 phases, 47 plans, 29/29 requirements. See `.planning/milestones/v2.0-ROADMAP.md` for full archive.

**Phases delivered:**
- Phase 11: Design Token Foundation (7 plans)
- Phase 12: USCIS 2025 Question Bank (6 plans)
- Phase 13: Security Hardening (5 plans)
- Phase 14: Unified Navigation (7 plans)
- Phase 15: Progress Hub (6 plans)
- Phase 16: Dashboard Next Best Action (5 plans)
- Phase 17: UI System Polish (11 plans)

## v2.1 Quality & Polish (Active)

**Milestone Goal:** Make the core learning experience (test, practice, interview, study) feel premium with redesigned UX, natural TTS, proper language toggle behavior, polished Burmese translations, and performance/accessibility improvements.

### Phases

- [x] **Phase 18: Language Mode** - Consistent English-only / bilingual behavior across all 59 consuming components
- [x] **Phase 19: TTS Core Extraction** - Consolidate duplicated TTS hooks into shared module
- [ ] **Phase 20: Session Persistence** - IndexedDB session store with resume prompts for interrupted sessions
- [ ] **Phase 21: Test & Practice UX Overhaul** - Duolingo-style Check/Continue flow with feedback panels and keyboard nav
- [x] **Phase 22: TTS Quality** - Voice selection, speech rate control, Burmese audio, graceful error handling
- [ ] **Phase 23: Flashcard Sort Mode** - Quizlet-style Know/Don't Know card sorting with SRS integration
- [ ] **Phase 24: Accessibility & Performance** - WCAG compliance, screen reader support, Web Vitals, bundle analysis
- [ ] **Phase 25: Burmese Translation Audit** - Natural phrasing, missing translations, consistent terminology
- [x] **Phase 26: Gap Closure — Session, Navigation & TTS Fixes** - Fix mock test resume, sort route, interview English-only, voice picker (completed 2026-02-19)
- [x] **Phase 27: Gap Closure — Timer Accessibility** - Overall timer announcements + extension scope (completed 2026-02-18)

## Phase Details

### Phase 18: Language Mode
**Goal**: Users experience consistent language behavior -- English mode shows English only, Myanmar mode shows bilingual content -- across every screen in the app
**Depends on**: Nothing (first phase of v2.1)
**Requirements**: LANG-01, LANG-02, LANG-03, LANG-04, LANG-05, LANG-06
**Success Criteria** (what must be TRUE):
  1. User in English mode sees zero Burmese text on test, practice, flashcard, and dashboard screens (navbar excluded)
  2. User in Myanmar mode sees bilingual content (English + Burmese) on every screen
  3. Interview simulation always runs in English-only mode regardless of the user's global language toggle
  4. User can switch language mode via a compact toggle without leaving their current screen
  5. Mock test in English-only mode displays a USCIS simulation message explaining English-only behavior
**Plans**: 7 plans

Plans:
- [x] 18-01-PLAN.md — Core: LanguageContext enhancements + Flag SVG + FlagToggle component
- [x] 18-02-PLAN.md — Navigation: Sidebar + BottomTabBar flag toggle integration + tooltip
- [x] 18-03-PLAN.md — Settings: Enhanced language section with FlagToggle + mode descriptions
- [x] 18-04-PLAN.md — Toast language mode fix + USCIS simulation messages
- [x] 18-05-PLAN.md — Interview language mode consistency + analytics
- [x] 18-06-PLAN.md — Font-myanmar audit: study, test, SRS, social, UI components
- [x] 18-07-PLAN.md — Font-myanmar audit: PWA, onboarding, auth, landing pages

### Phase 19: TTS Core Extraction
**Goal**: TTS logic lives in a single shared module so all future TTS improvements apply uniformly across test, practice, interview, and study contexts
**Depends on**: Phase 18
**Requirements**: INFRA-01
**Success Criteria** (what must be TRUE):
  1. A single `ttsCore` module provides voice loading, voice finding, utterance creation, and duration estimation
  2. Both general-purpose TTS hook and interview TTS hook delegate to the shared core (no duplicated voice-finding logic)
  3. All existing TTS behavior (test, practice, interview, study guide) works identically to before the extraction (zero regressions)
**Plans**: 6 plans

Plans:
- [x] 19-01-PLAN.md -- TTS types, error classes, voice constants + core engine module
- [x] 19-02-PLAN.md -- Unit tests for ttsCore (~35-40 test cases)
- [x] 19-03-PLAN.md -- TTSContext provider + useTTS/useTTSSettings hooks
- [x] 19-04-PLAN.md -- SpeechButton migration with animated speaking feedback
- [x] 19-05-PLAN.md -- InterviewSession + InterviewResults migration to useTTS
- [x] 19-06-PLAN.md -- AppShell wiring, integration tests, old hook deletion, cleanup

### Phase 20: Session Persistence
**Goal**: Users never lose progress from interrupted sessions -- they are prompted to resume where they left off
**Depends on**: Phase 19
**Requirements**: INFRA-02, SESS-01, SESS-02, SESS-03, SESS-04, SESS-05, SESS-06
**Success Criteria** (what must be TRUE):
  1. User who closes the browser mid-mock-test sees a resume prompt with session info when returning
  2. User who closes the browser mid-practice session can resume from the exact question they left off
  3. Persisted sessions older than 24 hours are silently discarded (no stale resume prompts)
  4. User sees a countdown (5-4-3...) before the timer restarts on a resumed timed session
  5. Dashboard displays a warning indicator when the user has an unfinished session waiting
**Plans**: 6 plans

Plans:
- [x] 20-01-PLAN.md — Session types, IndexedDB store, persistence hook, timeAgo, countdown sounds
- [x] 20-02-PLAN.md — SessionCountdown full-screen overlay (5-4-3-2-1-Go!)
- [x] 20-03-PLAN.md — ResumePromptModal, ResumeSessionCard, StartFreshConfirm components
- [x] 20-04-PLAN.md — Dashboard unfinished banners, nav badge extension, startup cleanup
- [x] 20-05-PLAN.md — TestPage session persistence integration
- [x] 20-06-PLAN.md — PracticePage + InterviewPage session persistence integration

### Phase 21: Test, Practice & Interview UX Overhaul
**Goal**: Users control their own pacing through an explicit Check/Continue flow with rich visual feedback (test/practice), and experience a fully immersive chat-style interview simulation with voice input, animated examiner, and Practice/Real modes
**Depends on**: Phase 18, Phase 20
**Requirements**: TPUX-01, TPUX-02, TPUX-03, TPUX-04, TPUX-05, TPUX-06, TPUX-07, TPUX-08, INTV-01, INTV-02, INTV-03, INTV-04, INTV-05
**Success Criteria** (what must be TRUE):
  1. User selects an answer, then explicitly taps "Check" to submit -- answer is not committed on tap
  2. User sees a bottom feedback panel slide up after checking (green for correct, amber for incorrect) with the correct answer shown
  3. User taps "Continue" to advance to the next question -- no auto-advance timer
  4. User sees a segmented progress bar where each question is a color-coded segment (green/red/gray/blue)
  5. User can navigate the entire quiz with keyboard only (Tab/arrows for options, Enter for Check/Continue)
  6. Interview uses chat-style layout with animated examiner character, voice-only input, and auto-read questions
  7. Interview offers Practice mode (per-question feedback) and Real mode (USCIS 2025 rules: 20 questions, pass at 12, fail at 9, early termination)
  8. Interview results show full transcript with per-answer grading, confidence scores, and comparison to previous attempts
**Plans**: 12 plans

Plans:
- [x] 21-01-PLAN.md — Quiz state machine + haptics utility + sound effects extensions
- [x] 21-02-PLAN.md — Answer grader TDD (keyword-based fuzzy matching for interview)
- [x] 21-03-PLAN.md — FeedbackPanel + AnswerOption with keyboard navigation
- [x] 21-04-PLAN.md — SegmentedProgressBar + QuizHeader + SkipButton
- [x] 21-05-PLAN.md — Examiner SVG character + ChatBubble + speech recognition hooks
- [x] 21-06-PLAN.md — TestPage full refactor (Check/Continue flow + new components)
- [x] 21-07-PLAN.md — PracticeSession refactor (Check/Continue + skip review + tappable segments)
- [x] 21-08-PLAN.md — Interview session chat-style overhaul (Practice/Real modes, speech input)
- [x] 21-09-PLAN.md — Test/Practice results screen redesign
- [x] 21-10-PLAN.md — Interview results screen (transcript, confidence, comparison)
- [x] 21-11-PLAN.md — Keyboard nav polish + streak/XP animations + REQUIREMENTS.md update
- [x] 21-12-PLAN.md — PillTabBar extraction + consistent pill tabs across all pages

### Phase 22: TTS Quality
**Goal**: Users hear clear, natural speech with control over voice and speed, including Burmese audio for all 128 questions
**Depends on**: Phase 19
**Requirements**: TTS-01, TTS-02, TTS-03, TTS-04, TTS-05, TTS-06
**Success Criteria** (what must be TRUE):
  1. User can select their preferred TTS voice from available system voices in Settings
  2. User can set speech rate (slow/normal/fast) that applies consistently across all TTS contexts (test, practice, study, interview)
  3. TTS failures show user-visible feedback instead of failing silently (e.g., "No voices available" message)
  4. User sees an animated speaking indicator while TTS is actively playing
  5. User can tap the speech button to pause active TTS, and tap again to resume (not restart)
**Plans**: 9 plans

Plans:
- [x] 22-01-PLAN.md — TTSSettings extension + VoicePicker + Settings "Speech & Audio" section
- [x] 22-02-PLAN.md — SpeechButton pause/resume + speed label + error state + debounce
- [x] 22-03-PLAN.md — Write 28 missing USCIS 2025 explanation objects
- [x] 22-04-PLAN.md — Burmese audio adapter + BurmeseSpeechButton + SW caching route
- [x] 22-05-PLAN.md — useAutoRead hook + per-session speed/auto-read overrides on pre-screens
- [x] 22-06-PLAN.md — Edge-tts generation scripts + audio file generation (checkpoint)
- [x] 22-07-PLAN.md — Auto-read + Burmese buttons wiring into study/test/practice screens
- [x] 22-08-PLAN.md — Interview audio integration (speed override, Burmese in Practice mode)
- [x] 22-09-PLAN.md — Unit tests + integration tests + final build verification

### Phase 23: Flashcard Sort Mode
**Goal**: Users can sort flashcards into Know/Don't Know piles with swipe gestures, then drill missed cards until mastery
**Depends on**: Phase 18, Phase 20
**Requirements**: FLSH-01, FLSH-02, FLSH-03, FLSH-04, FLSH-05, FLSH-06, FLSH-07, FLSH-08, FLSH-09
**Success Criteria** (what must be TRUE):
  1. User can toggle between Browse mode (navigate cards) and Sort mode (classify cards) on the flashcard stack
  2. User can swipe right (Know) or left (Don't Know) to sort cards, or use tap buttons as an alternative
  3. User sees a live progress counter showing Know/Don't Know tallies during sorting
  4. User sees an end-of-round summary with the option to study missed cards in another round
  5. Cards sorted as "Don't Know" prompt the user to add them to their SRS deck
**Plans**: 9 plans

Plans:
- [x] 23-01-PLAN.md -- Sort mode types + state machine reducer
- [x] 23-02-PLAN.md -- Sort sound effects + SortSnapshot session type
- [x] 23-03-PLAN.md -- Sort reducer unit tests (TDD)
- [x] 23-04-PLAN.md -- SwipeableCard + SwipeableStack gesture components
- [x] 23-05-PLAN.md -- SortProgress, KnowDontKnowButtons, SortCountdown UI
- [x] 23-06-PLAN.md -- SortModeContainer orchestrator + StudyGuidePage integration
- [x] 23-07-PLAN.md -- RoundSummary + MissedCardsList + SRSBatchAdd
- [x] 23-08-PLAN.md -- Session persistence + resume prompt for sort mode
- [x] 23-09-PLAN.md -- Full integration, polish, and visual verification

### Phase 24: Accessibility & Performance
**Goal**: The app meets WCAG 2.2 accessibility standards and reports performance metrics for ongoing monitoring
**Depends on**: Phase 21, Phase 22, Phase 23
**Requirements**: A11Y-01, A11Y-02, A11Y-03, A11Y-04, A11Y-05, A11Y-06, A11Y-07, PERF-01, PERF-02, PERF-03, PERF-04
**Success Criteria** (what must be TRUE):
  1. Screen reader announces "Correct" or "Incorrect -- the answer is [X]" after user checks an answer
  2. Focus moves programmatically to the feedback panel after Check, and to the next question after Continue
  3. User can extend the test timer by 50% via a clearly visible option (WCAG 2.2.1 timing adjustable)
  4. Reduced motion preference triggers alternative fade animations instead of disabling all animation
  5. Web Vitals (LCP, INP, CLS) are captured and reported to Sentry for real-user monitoring
**Plans**: 10 plans

Plans:
- [x] 24-01-PLAN.md -- A11Y tooling: eslint-plugin-jsx-a11y + vitest-axe setup + initial a11y tests
- [x] 24-02-PLAN.md -- Screen reader: FeedbackPanel announcements, toast roles, progress bar labels, language toggle
- [x] 24-03-PLAN.md -- Focus management, celebrations announcements, high contrast mode, skip-to-content
- [x] 24-04-PLAN.md -- Reduced motion alternatives: flashcard crossfade, sort quick-slide, static celebrations
- [x] 24-05-PLAN.md -- Per-question timer hook + PerQuestionTimer component + TimerExtensionToast
- [x] 24-06-PLAN.md -- Timer integration: TestPage + PracticeSession + PreTestScreen toggle
- [x] 24-07-PLAN.md -- Web Vitals via Sentry, bundle analyzer, font optimization, SW caching audit
- [x] 24-08-PLAN.md -- Flashcard3D bug fixes: backfaceVisibility, flickering, deck transparency, layout shift
- [x] 24-09-PLAN.md -- SwipeableCard bug fixes: gesture threshold, animation freeze, overlay, auto-read, speech button
- [x] 24-10-PLAN.md -- Final build verification + visual checkpoint

### Phase 25: Burmese Translation Audit
**Goal**: Every Burmese translation in the app reads naturally to a native speaker with consistent terminology
**Depends on**: Phase 18, Phase 21, Phase 23
**Requirements**: BRMSE-01, BRMSE-02, BRMSE-03
**Success Criteria** (what must be TRUE):
  1. All UI strings (buttons, labels, messages, toasts, modals) have natural Burmese translations -- no robotic/literal phrasing
  2. Zero missing Burmese translations across all user-facing screens (verified by exhaustive audit)
  3. Recurring concepts use consistent Burmese terminology throughout (e.g., same word for "practice" everywhere)
**Plans**: 10 plans

Plans:
- [ ] 25-01-PLAN.md — Burmese glossary + Myanmar font infrastructure (Google Fonts + CSS line-breaking)
- [ ] 25-02-PLAN.md — Question translations: American Government (47 questions)
- [ ] 25-03-PLAN.md — Question translations: Remaining 6 files (81 questions) + USCIS 2025 quality check
- [ ] 25-04-PLAN.md — Centralized strings (strings.ts) + navigation + categories + badges + nudges
- [ ] 25-05-PLAN.md — Core page inline strings (Landing, Auth, Settings, Dashboard, Study, Hub, Onboarding)
- [ ] 25-06-PLAN.md — Test/Interview page + session management + PWA component inline strings
- [ ] 25-07-PLAN.md — Social, SRS, and sort mode component inline strings
- [ ] 25-08-PLAN.md — Quiz, results, interview, and progress component inline strings
- [ ] 25-09-PLAN.md — Font-myanmar audit + showBurmese toggle verification + responsive overflow check
- [ ] 25-10-PLAN.md — Audio regeneration + flagged disagreements + final build verification

### Phase 26: Gap Closure — Session, Navigation & TTS Fixes
**Goal**: All critical audit gaps from v2.1-MILESTONE-AUDIT.md are closed — mock test resume works, sort navigation works, interview forces English-only, and voice picker exists
**Depends on**: Phase 20, Phase 21, Phase 22, Phase 23
**Requirements**: SESS-01, SESS-06, FLSH-07, LANG-03, TTS-01
**Gap Closure:** Closes gaps from audit
**Success Criteria** (what must be TRUE):
  1. User who resumes an interrupted mock test continues from their saved question with previous answers preserved
  2. Dashboard UnfinishedBanner for sort sessions navigates to the study page sort tab (not a dead route)
  3. Interview realistic mode shows zero Burmese UI text (TTS/STT already English-only; now UI chrome too)
  4. User can select their preferred TTS voice from a dropdown in Settings > Speech & Audio
**Plans**: 3 plans

Plans:
- [x] 26-01-PLAN.md — Mock test resume: RESUME_SESSION action + TestPage dispatch wiring
- [x] 26-02-PLAN.md — VoicePicker: TTSSettings extension + voice dropdown in Settings
- [x] 26-03-PLAN.md — Interview English-only override + sort route fix

### Phase 27: Gap Closure — Timer Accessibility
**Goal**: The overall mock test timer meets WCAG screen reader requirements and timer extension scope is clarified
**Depends on**: Phase 24, Phase 26
**Requirements**: A11Y-04, A11Y-05
**Gap Closure:** Closes gaps from audit
**Success Criteria** (what must be TRUE):
  1. Screen reader announces overall timer status at 5 minutes, 2 minutes, and 1 minute remaining during mock test
  2. Timer extension scope is either implemented for mock test or documented as intentional USCIS simulation exception
**Plans**: 1 plan

Plans:
- [x] 27-01-PLAN.md — sr-only timer announcements at 5/2/1 min + WCAG 2.2.1 exception documentation

## Progress

**Execution Order:**
Phases execute in numeric order: 18 > 19 > 20 > 21 > 22 > 23 > 24 > 25.
Note: Phases 22 and 23 can run in parallel (independent after their shared dependencies complete).

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-10 | v1.0 | 72/72 | Complete | 2026-02-08 |
| 11-17 | v2.0 | 47/47 | Complete | 2026-02-13 |
| 18. Language Mode | v2.1 | 7/7 | Complete | 2026-02-14 |
| 19. TTS Core Extraction | v2.1 | 6/6 | Complete | 2026-02-14 |
| 20. Session Persistence | v2.1 | 6/6 | Complete | 2026-02-15 |
| 21. Test & Practice UX | v2.1 | 12/12 | Complete | 2026-02-15 |
| 22. TTS Quality | v2.1 | 9/9 | Complete | 2026-02-15 |
| 23. Flashcard Sort Mode | v2.1 | 9/9 | Complete | 2026-02-17 |
| 24. Accessibility & Perf | v2.1 | 10/10 | Complete | 2026-02-18 |
| 25. Burmese Translation | v2.1 | 0/10 | Not started | - |
| 26. Gap Closure (Session/Nav/TTS) | v2.1 | Complete    | 2026-02-19 | 2026-02-18 |
| 27. Gap Closure (Timer A11Y) | v2.1 | Complete    | 2026-02-19 | 2026-02-18 |
| 28. Interview UX & Voice Flow | 8/9 | In Progress|  | - |

| Milestone | Phases | Plans | Requirements | Status |
|-----------|--------|-------|-------------|--------|
| v1.0 | 10 | 72 | 55/55 | Complete |
| v2.0 | 7 | 47 | 29/29 | Complete |
| v2.1 | 11 | 78+ | 49/66 | In progress |

### Phase 28: Interview UX & Voice Flow Polish

**Goal:** The interview simulation is reliable, mode-differentiated, and handles all mobile edge cases -- audio pre-caches for offline reliability, Real mode feels like USCIS, Practice mode provides educational keyword feedback, text input works when speech is unavailable, and mobile issues (back swipe, rotation, keyboard, focus loss) are handled gracefully
**Depends on:** Phase 27
**Requirements:** IVPOL-01, IVPOL-02, IVPOL-03, IVPOL-04, IVPOL-05, IVPOL-06, IVPOL-07, IVPOL-08, IVPOL-09, IVPOL-10
**Success Criteria** (what must be TRUE):
  1. All interview audio (questions, greetings, closings, feedback) pre-caches during countdown with progress indication
  2. Pre-cache failures gracefully fall back to browser TTS with subtle badge indication
  3. Text input fallback available when speech recognition unavailable (Firefox, Safari iOS)
  4. Keyword highlighting shows matched/missing keywords in Practice feedback and both mode results
  5. Real mode: monochrome progress, hidden score, amber/red timer, long-press emergency exit
  6. Practice mode: colored progress, keyword feedback, answer read-aloud after grading
  7. Back navigation intercepted, portrait locked, auto-pause on tab switch, keyboard scrolling works
  8. Network quality warning shown before start on slow/offline connections
  9. Screen reader announcements for new features (timer urgency, keyword highlights, mode badge)
  10. Production build succeeds with no regressions
**Plans:** 8/9 plans executed

Plans:
- [ ] 28-01-PLAN.md -- Audio pre-cache module + network quality check + unit tests
- [ ] 28-02-PLAN.md -- TextAnswerInput + KeywordHighlight components + tests
- [ ] 28-03-PLAN.md -- useInterviewGuard + useOrientationLock + useVisibilityPause hooks
- [ ] 28-04-PLAN.md -- InterviewCountdown pre-cache integration + TTSFallbackBadge + LandscapeOverlay
- [ ] 28-05-PLAN.md -- ModeBadge + InterviewProgress + InterviewTimer polish + LongPressButton
- [ ] 28-06-PLAN.md -- InterviewSession full integration (audio, text input, mode UI, edge case hooks)
- [ ] 28-07-PLAN.md -- InterviewSetup + InterviewResults + InterviewPage orchestrator updates
- [ ] 28-08-PLAN.md -- Feedback phrase audio generation + interviewFeedback module
- [ ] 28-09-PLAN.md -- Bilingual strings + screen reader polish + build verification + visual checkpoint

---

*Roadmap created: 2026-02-05*
*v2.0 completed: 2026-02-13*
*v2.1 roadmap created: 2026-02-13*
