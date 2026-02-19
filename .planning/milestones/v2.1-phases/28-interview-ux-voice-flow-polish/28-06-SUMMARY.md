---
phase: 28-interview-ux-voice-flow-polish
plan: 06
subsystem: ui
tags: [interview, integration, tts-fallback, text-input, keyword-highlight, edge-cases, hooks]

# Dependency graph
requires:
  - phase: 28-01
    provides: audioPrecache.ts with PrecacheProgress type and isAudioCached
  - phase: 28-02
    provides: TextAnswerInput.tsx and KeywordHighlight.tsx components
  - phase: 28-03
    provides: useInterviewGuard, useOrientationLock, useVisibilityPause hooks
  - phase: 28-04
    provides: TTSFallbackBadge.tsx and LandscapeOverlay.tsx components
  - phase: 28-05
    provides: ModeBadge.tsx, InterviewProgress.tsx, LongPressButton.tsx components
provides:
  - Fully integrated InterviewSession.tsx with all Phase 28 features
  - Pre-cache audio TTS fallback with failed URL tracking
  - Voice/text input mode toggling with TextAnswerInput
  - Mode-differentiated UI (ModeBadge, InterviewProgress, LongPressButton)
  - Keyword highlights in Practice feedback messages
  - Edge case hooks (back guard, orientation lock, visibility pause)
affects: [28-07, 28-08, 28-09, interview-results]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Pre-cache failure Set for O(1) TTS fallback lookup
    - Shared processGradeResult helper for speech and text grading paths
    - saveSessionSnapshot with QuotaExceededError graceful handling
    - checkEarlyTermination extracted for DRY threshold logic

key-files:
  created: []
  modified:
    - src/components/interview/InterviewSession.tsx
    - src/lib/audio/networkCheck.ts

key-decisions:
  - "All 3 tasks implemented in single comprehensive rewrite (same file, tightly coupled changes)"
  - "failedUrls tracked via useMemo Set for O(1) lookup instead of repeated array scans"
  - "TTS fallback cascades: check failed Set first, then catch MP3 play errors at runtime"
  - "processGradeResult shared between speech confirmation and text submit paths to eliminate duplication"
  - "interviewActive derived from questionPhase (not greeting/transition) for hook activation"
  - "inputMode defaults to 'text' when canUseSpeech is false (auto-fallback)"
  - "Keyboard/mic toggle only shown when canUseSpeech is true AND in responding phase"
  - "Visibility pause cancels all audio players and TTS, shows brief overlay"
  - "Orientation lock fallback renders LandscapeOverlay when API unsupported"

patterns-established:
  - "Integration plan pattern: comprehensive file rewrite when all tasks target same file"
  - "Hook activation guard: interviewActive computed from phase state excludes greeting/transition"

requirements-completed: [IVPOL-01, IVPOL-03, IVPOL-04, IVPOL-05, IVPOL-06, IVPOL-07, IVPOL-08, IVPOL-09]

# Metrics
duration: 20min
completed: 2026-02-19
---

# Phase 28 Plan 06: InterviewSession Integration Summary

**Comprehensive integration of all Phase 28 components (audio pre-cache TTS fallback, text input mode, mode-differentiated UI, keyword highlights, and mobile edge case hooks) into InterviewSession.tsx**

## Performance

- **Duration:** 20 min
- **Started:** 2026-02-19T08:20:43Z
- **Completed:** 2026-02-19T08:41:55Z
- **Tasks:** 3
- **Files modified:** 2

## Accomplishments
- Integrated pre-cached audio with TTS fallback: failed URLs tracked in a Set, safePlayQuestion cascades MP3 -> TTS automatically
- Added voice/text input mode toggling with TextAnswerInput component replacing inline text input
- Replaced header with ModeBadge (fixed corner), InterviewProgress (segmented bar), and LongPressButton (Real mode exit)
- Added KeywordHighlight in Practice mode feedback messages showing matched/missing keywords
- Wired useInterviewGuard (back navigation), useOrientationLock (with LandscapeOverlay), and useVisibilityPause (auto-pause)
- Refactored grading into shared processGradeResult helper, eliminating duplicated grading logic between speech and text paths
- Added QuotaExceededError handling for session persistence

## Task Commits

Each task was committed atomically:

1. **Task 1-3: Comprehensive InterviewSession integration** - `562b5b1` (feat)

**Deviation fix:** `ad3f6ee` (fix) - networkCheck.ts TypeScript cast error

## Files Created/Modified
- `src/components/interview/InterviewSession.tsx` - Complete rewrite integrating all Phase 28 components, hooks, and TTS fallback logic
- `src/lib/audio/networkCheck.ts` - Fixed TypeScript double-cast for Navigator type (pre-existing build error)

## Decisions Made
- All 3 plan tasks implemented in single comprehensive rewrite since all target InterviewSession.tsx with tightly coupled changes
- failedUrls uses useMemo Set from precacheResult.failed for O(1) lookup per audio play
- TTS fallback cascades: check failed Set first (known failures), then catch runtime MP3 play errors
- processGradeResult shared helper eliminates the duplicated grading logic that was in handleTranscriptConfirm and handleTypedSubmit
- interviewActive computed from questionPhase state (excludes greeting and transition phases) for hook activation
- inputMode defaults to 'text' when canUseSpeech is false, providing automatic fallback
- Keyboard/mic toggle button only rendered when canUseSpeech is true AND questionPhase is 'responding'
- Visibility pause cancels all three audio players + TTS, shows brief "Interview Paused" overlay
- LandscapeOverlay rendered when orientation lock API is unsupported (CSS-only detection)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed networkCheck.ts TypeScript cast error**
- **Found during:** Build verification
- **Issue:** Pre-existing TS2352 error: `navigator as Record<string, unknown>` rejected because types don't overlap
- **Fix:** Changed to double-cast: `navigator as unknown as Record<string, unknown>` per TypeScript docs
- **Files modified:** src/lib/audio/networkCheck.ts
- **Verification:** `npm run build` passes cleanly
- **Committed in:** ad3f6ee

**2. [Rule 2 - Missing Critical] Added QuotaExceededError handling for session saves**
- **Found during:** Task 3 (edge case hooks)
- **Issue:** Plan specified wrapping saveSession in try/catch for QuotaExceededError
- **Fix:** saveSessionSnapshot helper wraps the saveSession call in try/catch, logs debug message on failure, does not block interview
- **Files modified:** src/components/interview/InterviewSession.tsx
- **Verification:** Code compiles; catch block handles storage quota gracefully
- **Committed in:** 562b5b1

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 missing critical)
**Impact on plan:** Both fixes necessary for correctness. No scope creep.

## Issues Encountered
- InterviewPage.tsx was already modified by prior parallel plan executions (28-07, 28-08) with question pre-generation and precacheResult plumbing. No changes needed from this plan.
- Pre-existing TypeScript errors in test files (KeywordHighlight.test.tsx, audioPrecache.test.ts) remain -- out of scope for this integration plan.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- InterviewSession.tsx is fully integrated with all Phase 28 Wave 1-2 components
- Ready for Plan 07 (interview setup/results page updates)
- Ready for Plan 08 (feedback audio generation)
- Ready for Plan 09 (E2E testing and polish)

## Self-Check: PASSED

- All 2 modified files verified on disk
- All 2 commit hashes found in git log (562b5b1, ad3f6ee)
- Build passes cleanly (`npm run build`)
- No new TypeScript errors in modified files

---
*Phase: 28-interview-ux-voice-flow-polish*
*Completed: 2026-02-19*
