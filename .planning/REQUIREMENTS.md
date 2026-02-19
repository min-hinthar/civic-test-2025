# Requirements: Civic Test Prep 2025

**Defined:** 2026-02-13
**Core Value:** Burmese immigrants can confidently prepare for and pass the US civics test using an app that feels welcoming and speaks their language.

## v2.1 Requirements

Requirements for v2.1 Quality & Polish milestone. Each maps to roadmap phases.

### Test & Practice UX

- [x] **TPUX-01**: User sees explicit "Check" button after selecting an answer (replaces auto-commit on tap)
- [x] **TPUX-02**: User sees bottom feedback panel slide up after checking (green for correct, amber for incorrect)
- [x] **TPUX-03**: User controls pacing via "Continue" button (no auto-advance timer)
- [x] **TPUX-04**: User sees segmented progress bar with color-coded segments per question (green/red/gray/blue)
- [x] **TPUX-05**: User can change answer selection before tapping Check
- [x] **TPUX-06**: User can navigate quiz entirely with keyboard (Tab/arrows for options, Enter for Check/Continue)
- [x] **TPUX-07**: User feels haptic feedback on Check (vibrate on Android, no-op on iOS)
- [x] **TPUX-08**: User sees streak/XP micro-reward animation after correct answers within session

### Flashcard Sort Mode

- [x] **FLSH-01**: User can toggle between Browse mode and Sort mode on flashcard stack
- [x] **FLSH-02**: User can swipe right (Know) or left (Don't Know) to sort cards in Sort mode
- [x] **FLSH-03**: User sees live progress counter with Know/Don't Know tallies
- [x] **FLSH-04**: User sees end-of-round summary with "Study missed cards" option
- [x] **FLSH-05**: User can tap Know/Don't Know buttons as alternative to swiping
- [x] **FLSH-06**: Cards sorted as Don't Know auto-suggest adding to SRS deck
- [x] **FLSH-07**: Sort session state persists (resume mid-sort after closing app)
- [x] **FLSH-08**: User sees bilingual sort labels ("Know / သိပါတယ်" and "Don't Know / မသိပါ")
- [x] **FLSH-09**: User sees round counter when iterating through missed cards

### TTS Quality

- [x] **TTS-01**: User can select preferred TTS voice from available voices in Settings
- [x] **TTS-02**: User can set global speech rate (slow/normal/fast) applied to all TTS contexts
- [x] **TTS-03**: TTS failures handled gracefully with user-visible feedback (no silent failures)
- [x] **TTS-04**: User sees animated speaking indicator when TTS is active
- [x] **TTS-05**: User can pause/resume TTS by tapping speech button again (not cancel)
- [x] **TTS-06**: Burmese audio available via pre-generated MP3 files for all 128 questions (both question and answer)

### Language Mode

- [x] **LANG-01**: English mode shows English text only across all screens (except navbar)
- [x] **LANG-02**: Myanmar mode shows bilingual content (English + Burmese) across all screens
- [x] **LANG-03**: Interview simulation forces English-only mode regardless of global toggle
- [x] **LANG-04**: All 334+ font-myanmar occurrences respect language mode consistently
- [x] **LANG-05**: User can switch language mode via compact in-session toggle (no settings navigation needed)
- [x] **LANG-06**: Mock test in English-only mode shows USCIS simulation message

### Session Persistence

- [x] **SESS-01**: User can resume interrupted mock test session (prompt with session info)
- [x] **SESS-02**: User can resume interrupted practice session
- [x] **SESS-03**: User can resume interrupted flashcard sort session
- [x] **SESS-04**: Persisted sessions expire after 24 hours (auto-discard stale sessions)
- [x] **SESS-05**: User sees resume countdown (5-4-3...) before timer restarts on resume
- [x] **SESS-06**: Dashboard shows warning when unfinished session exists

### Accessibility

- [x] **A11Y-01**: Screen reader announces correct/incorrect feedback via aria-live region
- [x] **A11Y-02**: Focus moves to feedback panel after Check, to next question after Continue
- [x] **A11Y-03**: All interactive elements meet 44x44px minimum touch target (WCAG 2.5.8)
- [x] **A11Y-04**: Screen reader announces timer status at key intervals (5min, 2min, 1min)
- [x] **A11Y-05**: User can extend test timer by 50% (one-time, WCAG 2.2.1 compliance)
- [x] **A11Y-06**: Reduced motion preference shows alternative animations (fade) instead of disabling
- [x] **A11Y-07**: High contrast mode support (prefers-contrast: more)

### Performance

- [x] **PERF-01**: Web Vitals (LCP, INP, CLS) reported to Sentry for monitoring
- [x] **PERF-02**: Bundle size analyzed and documented with @next/bundle-analyzer
- [x] **PERF-03**: eslint-plugin-jsx-a11y integrated for static accessibility linting
- [x] **PERF-04**: vitest-axe integrated for accessibility unit testing

### Interview UX

- [x] **INTV-01**: Interview uses chat-style layout with animated examiner character and voice input
- [x] **INTV-02**: Interview offers Practice mode (per-question feedback) and Real mode (USCIS 2025 rules)
- [x] **INTV-03**: Real mode follows USCIS 2025 rules: 20 questions, pass at 12 correct, fail at 9 incorrect
- [x] **INTV-04**: Interview shows full transcript with per-answer grading and confidence scores in results
- [x] **INTV-05**: User sees transcription before grading and can re-record up to 3 times

### Interview Voice & UX Polish

- [ ] **IVPOL-01**: All interview audio (questions, greetings, closings, feedback) pre-caches during countdown with progress bar
- [ ] **IVPOL-02**: Pre-cache failures fall back to browser TTS with subtle badge indication
- [x] **IVPOL-03**: Text input fallback available when speech recognition unavailable (Firefox, Safari iOS)
- [x] **IVPOL-04**: Keyword highlighting shows matched/missing keywords in Practice feedback and results transcript
- [ ] **IVPOL-05**: Real mode uses monochrome progress, hidden score, amber/red urgent timer, and long-press emergency exit
- [ ] **IVPOL-06**: Practice mode shows colored progress, keyword feedback, and reads correct answer aloud after grading
- [x] **IVPOL-07**: Browser back navigation intercepted with confirmation dialog during interview
- [x] **IVPOL-08**: Interview auto-pauses when tab/app loses focus and resumes when focus returns
- [x] **IVPOL-09**: Portrait orientation locked during interview (CSS fallback on unsupported browsers)
- [ ] **IVPOL-10**: Network quality warning shown before interview start on slow/offline connections

### Burmese Translation Quality

- [ ] **BRMSE-01**: All UI strings have natural Burmese translations (not robotic/literal) *(human verification needed)*
- [x] **BRMSE-02**: No missing Burmese translations across all user-facing screens
- [x] **BRMSE-03**: Consistent Burmese terminology for recurring concepts (e.g., "correct answer", "practice", "test")

### TTS Infrastructure (Foundational)

- [x] **INFRA-01**: TTS logic consolidated from 2 duplicate hooks into shared ttsCore module
- [x] **INFRA-02**: Session persistence store added as 9th IndexedDB store with version stamping

## v2.2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Cloud & Cross-Device

- **CLOUD-01**: Cross-device session resume via Supabase sync
- **CLOUD-02**: Cloud TTS for higher quality voices (Google Cloud / Amazon Polly)

### Advanced Accessibility

- **ADV-A11Y-01**: Screen reader-specific flashcard mode (auto-announce, skip visual flip)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Heart/life system (Duolingo-style) | Punitive mechanics inappropriate for test prep where mistakes = learning |
| Animated mascot reactions | Scope creep, asset complexity, bundle size |
| Full-screen answer transition flash | Accessibility concern (photosensitivity), disorienting |
| Auto-reading questions aloud | Removes user control, overwhelming |
| Tinder-style stacked card visual | Performance issues on low-end phones, dating app metaphor inappropriate |
| Burmese-only language mode | English answers required for US civics test |
| Per-question language toggle | UI clutter, confusing interaction |
| AI voice cloning | Ethically complex, latency, cost |
| Background audio playback | Surprising behavior, battery drain |
| Auto-resume without asking | Disorienting -- always prompt |
| Interview session persistence | Simulates real USCIS conditions where you can't pause |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| LANG-01 | Phase 18+25 | Satisfied |
| LANG-02 | Phase 18 | Satisfied |
| LANG-03 | Phase 26 | Satisfied |
| LANG-04 | Phase 18+25 | Satisfied |
| LANG-05 | Phase 18 | Satisfied |
| LANG-06 | Phase 18 | Satisfied |
| INFRA-01 | Phase 19 | Satisfied |
| INFRA-02 | Phase 20 | Satisfied |
| SESS-01 | Phase 26 | Satisfied |
| SESS-02 | Phase 20 | Satisfied |
| SESS-03 | Phase 20+23 | Satisfied |
| SESS-04 | Phase 20 | Satisfied |
| SESS-05 | Phase 20 | Satisfied |
| SESS-06 | Phase 26 | Satisfied |
| TPUX-01 | Phase 21 | Satisfied |
| TPUX-02 | Phase 21 | Satisfied |
| TPUX-03 | Phase 21 | Satisfied |
| TPUX-04 | Phase 21 | Satisfied |
| TPUX-05 | Phase 21 | Satisfied |
| TPUX-06 | Phase 21 | Satisfied |
| TPUX-07 | Phase 21 | Satisfied |
| TPUX-08 | Phase 21 | Satisfied |
| TTS-01 | Phase 26 | Satisfied |
| TTS-02 | Phase 22 | Satisfied |
| TTS-03 | Phase 22 | Satisfied |
| TTS-04 | Phase 22 | Satisfied |
| TTS-05 | Phase 22 | Satisfied |
| TTS-06 | Phase 22 | Satisfied |
| FLSH-01 | Phase 23 | Satisfied |
| FLSH-02 | Phase 23 | Satisfied |
| FLSH-03 | Phase 23 | Satisfied |
| FLSH-04 | Phase 23 | Satisfied |
| FLSH-05 | Phase 23 | Satisfied |
| FLSH-06 | Phase 23 | Satisfied |
| FLSH-07 | Phase 26 | Satisfied |
| FLSH-08 | Phase 23+25 | Satisfied |
| FLSH-09 | Phase 23 | Satisfied |
| A11Y-01 | Phase 24 | Satisfied |
| A11Y-02 | Phase 24 | Satisfied |
| A11Y-03 | Phase 24 | Satisfied |
| A11Y-04 | Phase 27 | Satisfied |
| A11Y-05 | Phase 27 | Satisfied |
| A11Y-06 | Phase 24 | Satisfied |
| A11Y-07 | Phase 24 | Satisfied |
| PERF-01 | Phase 24 | Satisfied |
| PERF-02 | Phase 24 | Satisfied |
| PERF-03 | Phase 24 | Satisfied |
| PERF-04 | Phase 24 | Satisfied |
| BRMSE-01 | Phase 25 | Partial (human review needed) |
| BRMSE-02 | Phase 25 | Satisfied |
| BRMSE-03 | Phase 25 | Satisfied |
| INTV-01 | Phase 21 | Satisfied |
| INTV-02 | Phase 21 | Satisfied |
| INTV-03 | Phase 21 | Satisfied |
| INTV-04 | Phase 21 | Satisfied |
| INTV-05 | Phase 21 | Satisfied |
| IVPOL-01 | Phase 28 | Planned |
| IVPOL-02 | Phase 28 | Planned |
| IVPOL-03 | Phase 28 | Planned |
| IVPOL-04 | Phase 28 | Planned |
| IVPOL-05 | Phase 28 | Planned |
| IVPOL-06 | Phase 28 | Planned |
| IVPOL-07 | Phase 28 | Planned |
| IVPOL-08 | Phase 28 | Planned |
| IVPOL-09 | Phase 28 | Planned |
| IVPOL-10 | Phase 28 | Planned |

**Coverage:**
- v2.1 requirements: 66 total
- Satisfied: 55
- Partial (human review): 1 (BRMSE-01)
- Planned: 10 (IVPOL-01 through IVPOL-10)
- Unmapped: 0

---
*Requirements defined: 2026-02-13*
*Last updated: 2026-02-18 — checkboxes updated from audit results (55/56 satisfied)*
