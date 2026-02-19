# Requirements: Civic Test Prep 2025

**Defined:** 2026-02-13
**Core Value:** Burmese immigrants can confidently prepare for and pass the US civics test using an app that feels welcoming and speaks their language.

## v2.1 Requirements

Requirements for v2.1 Quality & Polish milestone. Each maps to roadmap phases.

### Test & Practice UX

- [ ] **TPUX-01**: User sees explicit "Check" button after selecting an answer (replaces auto-commit on tap)
- [ ] **TPUX-02**: User sees bottom feedback panel slide up after checking (green for correct, amber for incorrect)
- [ ] **TPUX-03**: User controls pacing via "Continue" button (no auto-advance timer)
- [ ] **TPUX-04**: User sees segmented progress bar with color-coded segments per question (green/red/gray/blue)
- [ ] **TPUX-05**: User can change answer selection before tapping Check
- [ ] **TPUX-06**: User can navigate quiz entirely with keyboard (Tab/arrows for options, Enter for Check/Continue)
- [ ] **TPUX-07**: User feels haptic feedback on Check (vibrate on Android, no-op on iOS)
- [ ] **TPUX-08**: User sees streak/XP micro-reward animation after correct answers within session

### Flashcard Sort Mode

- [ ] **FLSH-01**: User can toggle between Browse mode and Sort mode on flashcard stack
- [ ] **FLSH-02**: User can swipe right (Know) or left (Don't Know) to sort cards in Sort mode
- [ ] **FLSH-03**: User sees live progress counter with Know/Don't Know tallies
- [ ] **FLSH-04**: User sees end-of-round summary with "Study missed cards" option
- [ ] **FLSH-05**: User can tap Know/Don't Know buttons as alternative to swiping
- [ ] **FLSH-06**: Cards sorted as Don't Know auto-suggest adding to SRS deck
- [ ] **FLSH-07**: Sort session state persists (resume mid-sort after closing app)
- [ ] **FLSH-08**: User sees bilingual sort labels ("Know / သိပါတယ်" and "Don't Know / မသိပါ")
- [ ] **FLSH-09**: User sees round counter when iterating through missed cards

### TTS Quality

- [ ] **TTS-01**: User can select preferred TTS voice from available voices in Settings
- [ ] **TTS-02**: User can set global speech rate (slow/normal/fast) applied to all TTS contexts
- [ ] **TTS-03**: TTS failures handled gracefully with user-visible feedback (no silent failures)
- [ ] **TTS-04**: User sees animated speaking indicator when TTS is active
- [ ] **TTS-05**: User can pause/resume TTS by tapping speech button again (not cancel)
- [ ] **TTS-06**: Burmese audio available via pre-generated MP3 files for all 128 questions (both question and answer)

### Language Mode

- [ ] **LANG-01**: English mode shows English text only across all screens (except navbar)
- [ ] **LANG-02**: Myanmar mode shows bilingual content (English + Burmese) across all screens
- [ ] **LANG-03**: Interview simulation forces English-only mode regardless of global toggle
- [ ] **LANG-04**: All 334+ font-myanmar occurrences respect language mode consistently
- [ ] **LANG-05**: User can switch language mode via compact in-session toggle (no settings navigation needed)
- [ ] **LANG-06**: Mock test in English-only mode shows USCIS simulation message

### Session Persistence

- [ ] **SESS-01**: User can resume interrupted mock test session (prompt with session info)
- [ ] **SESS-02**: User can resume interrupted practice session
- [ ] **SESS-03**: User can resume interrupted flashcard sort session
- [ ] **SESS-04**: Persisted sessions expire after 24 hours (auto-discard stale sessions)
- [ ] **SESS-05**: User sees resume countdown (5-4-3...) before timer restarts on resume
- [ ] **SESS-06**: Dashboard shows warning when unfinished session exists

### Accessibility

- [ ] **A11Y-01**: Screen reader announces correct/incorrect feedback via aria-live region
- [ ] **A11Y-02**: Focus moves to feedback panel after Check, to next question after Continue
- [ ] **A11Y-03**: All interactive elements meet 44x44px minimum touch target (WCAG 2.5.8)
- [ ] **A11Y-04**: Screen reader announces timer status at key intervals (5min, 2min, 1min)
- [ ] **A11Y-05**: User can extend test timer by 50% (one-time, WCAG 2.2.1 compliance)
- [ ] **A11Y-06**: Reduced motion preference shows alternative animations (fade) instead of disabling
- [ ] **A11Y-07**: High contrast mode support (prefers-contrast: more)

### Performance

- [ ] **PERF-01**: Web Vitals (LCP, INP, CLS) reported to Sentry for monitoring
- [ ] **PERF-02**: Bundle size analyzed and documented with @next/bundle-analyzer
- [ ] **PERF-03**: eslint-plugin-jsx-a11y integrated for static accessibility linting
- [ ] **PERF-04**: vitest-axe integrated for accessibility unit testing

### Interview UX

- [ ] **INTV-01**: Interview uses chat-style layout with animated examiner character and voice input
- [ ] **INTV-02**: Interview offers Practice mode (per-question feedback) and Real mode (USCIS 2025 rules)
- [ ] **INTV-03**: Real mode follows USCIS 2025 rules: 20 questions, pass at 12 correct, fail at 9 incorrect
- [ ] **INTV-04**: Interview shows full transcript with per-answer grading and confidence scores in results
- [ ] **INTV-05**: User sees transcription before grading and can re-record up to 3 times

### Burmese Translation Quality

- [ ] **BRMSE-01**: All UI strings have natural Burmese translations (not robotic/literal)
- [ ] **BRMSE-02**: No missing Burmese translations across all user-facing screens
- [ ] **BRMSE-03**: Consistent Burmese terminology for recurring concepts (e.g., "correct answer", "practice", "test")

### TTS Infrastructure (Foundational)

- [ ] **INFRA-01**: TTS logic consolidated from 2 duplicate hooks into shared ttsCore module
- [ ] **INFRA-02**: Session persistence store added as 9th IndexedDB store with version stamping

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
| LANG-01 | Phase 18 | Pending |
| LANG-02 | Phase 18 | Pending |
| LANG-03 | Phase 26 | Pending |
| LANG-04 | Phase 18 | Pending |
| LANG-05 | Phase 18 | Pending |
| LANG-06 | Phase 18 | Pending |
| INFRA-01 | Phase 19 | Pending |
| INFRA-02 | Phase 20 | Pending |
| SESS-01 | Phase 26 | Pending |
| SESS-02 | Phase 20 | Pending |
| SESS-03 | Phase 20 | Pending |
| SESS-04 | Phase 20 | Pending |
| SESS-05 | Phase 20 | Pending |
| SESS-06 | Phase 26 | Pending |
| TPUX-01 | Phase 21 | Pending |
| TPUX-02 | Phase 21 | Pending |
| TPUX-03 | Phase 21 | Pending |
| TPUX-04 | Phase 21 | Pending |
| TPUX-05 | Phase 21 | Pending |
| TPUX-06 | Phase 21 | Pending |
| TPUX-07 | Phase 21 | Pending |
| TPUX-08 | Phase 21 | Pending |
| TTS-01 | Phase 26 | Pending |
| TTS-02 | Phase 22 | Pending |
| TTS-03 | Phase 22 | Pending |
| TTS-04 | Phase 22 | Pending |
| TTS-05 | Phase 22 | Pending |
| TTS-06 | Phase 22 | Pending |
| FLSH-01 | Phase 23 | Pending |
| FLSH-02 | Phase 23 | Pending |
| FLSH-03 | Phase 23 | Pending |
| FLSH-04 | Phase 23 | Pending |
| FLSH-05 | Phase 23 | Pending |
| FLSH-06 | Phase 23 | Pending |
| FLSH-07 | Phase 26 | Pending |
| FLSH-08 | Phase 23 | Pending |
| FLSH-09 | Phase 23 | Pending |
| A11Y-01 | Phase 24 | Pending |
| A11Y-02 | Phase 24 | Pending |
| A11Y-03 | Phase 24 | Pending |
| A11Y-04 | Phase 27 | Pending |
| A11Y-05 | Phase 27 | Pending |
| A11Y-06 | Phase 24 | Pending |
| A11Y-07 | Phase 24 | Pending |
| PERF-01 | Phase 24 | Pending |
| PERF-02 | Phase 24 | Pending |
| PERF-03 | Phase 24 | Pending |
| PERF-04 | Phase 24 | Pending |
| BRMSE-01 | Phase 25 | Pending |
| BRMSE-02 | Phase 25 | Pending |
| BRMSE-03 | Phase 25 | Pending |
| INTV-01 | Phase 21 | Pending |
| INTV-02 | Phase 21 | Pending |
| INTV-03 | Phase 21 | Pending |
| INTV-04 | Phase 21 | Pending |
| INTV-05 | Phase 21 | Pending |

**Coverage:**
- v2.1 requirements: 56 total
- Mapped to phases: 56
- Unmapped: 0

---
*Requirements defined: 2026-02-13*
*Last updated: 2026-02-18 after gap closure phase creation*
