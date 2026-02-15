---
phase: 22-tts-quality
plan: 05
subsystem: ui
tags: [tts, react-hooks, auto-read, speech-overrides, pre-screen]

requires:
  - phase: 22-01
    provides: TTSSettings with autoRead/rate, useTTSSettings hook
  - phase: 22-02
    provides: Enhanced SpeechButton with useTTS hook
provides:
  - useAutoRead hook for triggerKey-based auto-speech with silent retry
  - SpeechOverrides type for per-session speed + auto-read
  - InterviewSpeechOverrides type for interview speed override
  - Per-session speech controls on PreTestScreen, PracticeConfig, InterviewSetup
affects: [22-07, 22-08, study-card, test-session, practice-session, interview-session]

tech-stack:
  added: []
  patterns:
    - "Per-session overrides initialized from global settings but never synced back"
    - "triggerKey-based auto-read with 300ms delay and silent retry once"
    - "cancelledRef pattern for React Strict Mode double-invoke safety"

key-files:
  created:
    - src/hooks/useAutoRead.ts
  modified:
    - src/components/test/PreTestScreen.tsx
    - src/components/practice/PracticeConfig.tsx
    - src/components/interview/InterviewSetup.tsx

key-decisions:
  - "Per-session overrides stay local (useState), never mutate global settings"
  - "Interview auto-read always on (no toggle), speed selector only in Practice mode"
  - "Real mode interview uses fixed normal speed per user decision"
  - "SpeechOverrides exported from PreTestScreen for consumer reuse"
  - "Optional parameters on callbacks maintain backward compatibility"

patterns-established:
  - "Per-session speech overrides: useState from global, pass through onStart/onReady"
  - "SPEED_OPTIONS constant with en/my labels reused across all three pre-screens"
  - "ToggleSwitch inline pattern for auto-read (matching SettingsPage style)"

duration: 9min
completed: 2026-02-15
---

# Phase 22 Plan 05: Auto-Read Hook & Pre-Screen Overrides Summary

**useAutoRead hook with triggerKey-based auto-speech and per-session speed/auto-read overrides on all three pre-screens**

## Performance

- **Duration:** 9 min
- **Started:** 2026-02-15T09:39:20Z
- **Completed:** 2026-02-15T09:49:19Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Created useAutoRead hook that triggers TTS speech on triggerKey change with 300ms delay, silent retry once on failure, and cleanup on unmount
- Added per-session speech speed pill selector and auto-read toggle to PreTestScreen and PracticeConfig
- Added per-session speed selector to InterviewSetup (Practice mode only, no auto-read toggle since interview always auto-reads)
- All overrides initialize from global TTS settings but remain local state (no localStorage mutation)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create useAutoRead hook** - `532c37d` (feat)
2. **Task 2: Add per-session speed and auto-read overrides to pre-screens** - `0b18f94` (feat)

## Files Created/Modified

- `src/hooks/useAutoRead.ts` - triggerKey-based auto-read hook with delay, retry, and cleanup
- `src/components/test/PreTestScreen.tsx` - Speed pills, auto-read toggle, SpeechOverrides export
- `src/components/practice/PracticeConfig.tsx` - Speed pills, auto-read toggle, PracticeConfigType extended
- `src/components/interview/InterviewSetup.tsx` - Speed pills (Practice mode only), InterviewSpeechOverrides export

## Decisions Made

- Per-session overrides use useState initialized from global settings -- never synced back to prevent unwanted side effects
- Interview has no auto-read toggle because interview always auto-reads (per user decision from planning)
- Real mode interview forces normal speed (per user decision -- USCIS simulation fidelity)
- Callback signatures extended with optional parameters for backward compatibility (no consumer changes needed)
- Speed pill options reuse the same Burmese translations as the Settings page

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- useAutoRead hook ready for consumer integration in study cards, test sessions, and practice sessions (plan 22-07)
- Per-session overrides ready to be forwarded to session components
- Pre-existing uncommitted changes from other plans (SpeechButton.tsx, sw.ts, BurmeseSpeechButton.tsx, SpeechAnimations.tsx) observed but not touched

## Self-Check: PASSED

All 4 files exist on disk. Both commit hashes (532c37d, 0b18f94) found in git log.

---
*Phase: 22-tts-quality*
*Completed: 2026-02-15*
