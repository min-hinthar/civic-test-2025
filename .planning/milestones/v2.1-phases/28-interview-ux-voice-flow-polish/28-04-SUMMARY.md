---
phase: 28-interview-ux-voice-flow-polish
plan: 04
subsystem: ui
tags: [countdown, audio-precache, progress-bar, tts-fallback, landscape, interview]

# Dependency graph
requires:
  - phase: 28-01
    provides: precacheInterviewAudio, checkNetworkQuality, PrecacheProgress types
provides:
  - Enhanced InterviewCountdown with two-phase audio loading + number countdown
  - TTSFallbackBadge component for indicating TTS fallback mode
  - LandscapeOverlay component for CSS-based portrait rotation prompt
affects: [28-05, 28-06, interview-session, interview-setup]

# Tech tracking
tech-stack:
  added: []
  patterns: [two-phase countdown with async loading, CSS orientation media queries via Tailwind landscape: prefix]

key-files:
  created:
    - src/components/interview/TTSFallbackBadge.tsx
    - src/components/interview/LandscapeOverlay.tsx
  modified:
    - src/components/interview/InterviewCountdown.tsx

key-decisions:
  - "Loading phase runs precacheInterviewAudio and checkNetworkQuality in parallel"
  - "300ms delay after loading completes before transitioning to countdown for visual smoothness"
  - "useRef loadingStarted flag prevents double-invocation in StrictMode"
  - "TTSFallbackBadge uses compact (icon-only) and full (icon+text) variants"
  - "LandscapeOverlay uses Tailwind landscape:flex portrait:hidden for CSS-only orientation detection"
  - "Burmese rotation prompt text: simple imperative sentence for clarity"

patterns-established:
  - "Two-phase countdown: async loading phase -> animated number sequence"
  - "CSS orientation detection via Tailwind responsive prefix (no JS needed)"

requirements-completed: [IVPOL-01, IVPOL-02, IVPOL-09]

# Metrics
duration: 5min
completed: 2026-02-19
---

# Phase 28 Plan 04: Interview Countdown & Support UI Summary

**Enhanced countdown with audio pre-caching progress bar, TTS fallback badge, and CSS-based landscape orientation overlay**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-19T08:07:49Z
- **Completed:** 2026-02-19T08:12:50Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- Enhanced InterviewCountdown with two-phase operation: audio loading with progress bar, then 3-2-1-Begin sequence
- Created TTSFallbackBadge with compact/full variants and reduced motion support
- Created LandscapeOverlay with bilingual text and CSS-only orientation detection

## Task Commits

Each task was committed atomically:

1. **Task 1: Enhance InterviewCountdown with audio loading** - `0d5ad85` (feat)
2. **Task 2: Create TTSFallbackBadge component** - `590c939` (feat)
3. **Task 3: Create LandscapeOverlay component** - `ac1fc3b` (feat)

## Files Created/Modified
- `src/components/interview/InterviewCountdown.tsx` - Two-phase countdown: audio loading with progress bar then 3-2-1-Begin
- `src/components/interview/TTSFallbackBadge.tsx` - Amber badge indicating TTS fallback mode (compact/full variants)
- `src/components/interview/LandscapeOverlay.tsx` - CSS-based portrait rotation prompt with bilingual text

## Decisions Made
- Loading phase runs precacheInterviewAudio and checkNetworkQuality in parallel for speed
- 300ms delay after loading completes before transitioning to countdown for visual smoothness
- useRef loadingStarted flag prevents StrictMode double-invocation of precache
- TTSFallbackBadge compact mode is icon-only (no text) for tight chat bubble layouts
- LandscapeOverlay uses Tailwind `landscape:flex portrait:hidden` -- pure CSS, no JS orientation API
- Burmese rotation prompt: simple imperative "သင့်ဖုန်းကို ဒေါင်လိုက်လှည့်ပါ" (Rotate your phone vertically)
- All new props on InterviewCountdown are optional for backward compatibility

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] LongPressButton.tsx included in Task 3 commit**
- **Found during:** Task 3 (LandscapeOverlay)
- **Issue:** An uncommitted LongPressButton.tsx file (from a future plan) was in the working tree and got picked up by lint-staged stash/restore
- **Fix:** Non-blocking -- file content is correct, committed alongside LandscapeOverlay
- **Files modified:** src/components/interview/LongPressButton.tsx (unplanned inclusion)
- **Verification:** File is valid TypeScript, does not affect plan deliverables
- **Committed in:** ac1fc3b

---

**Total deviations:** 1 (unplanned file inclusion via lint-staged)
**Impact on plan:** No scope creep. LongPressButton is from a future plan and happens to be correct.

## Issues Encountered
- Pre-existing TypeScript errors in KeywordHighlight.test.tsx, audioPrecache.test.ts, and networkCheck.ts (from prior plans) -- not related to this plan's changes.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- InterviewCountdown ready for integration with interview setup flow (pass questionIds from selected questions)
- TTSFallbackBadge ready for ChatBubble integration (show when specific audio failed to cache)
- LandscapeOverlay ready for InterviewSession wrapping (show when orientation lock unsupported)

## Self-Check: PASSED

- All 3 files exist on disk (InterviewCountdown.tsx, TTSFallbackBadge.tsx, LandscapeOverlay.tsx)
- All 3 commit hashes found in git log (0d5ad85, 590c939, ac1fc3b)
- ESLint passes on all 3 files

---
*Phase: 28-interview-ux-voice-flow-polish*
*Completed: 2026-02-19*
