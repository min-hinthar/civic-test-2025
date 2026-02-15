---
phase: 22-tts-quality
plan: 02
subsystem: ui
tags: [tts, speech-button, pause-resume, android, accessibility, debounce]

# Dependency graph
requires:
  - phase: 19-tts-core
    provides: "TTSEngine with pause/resume/cancel, useTTS hook with reactive state"
provides:
  - "Enhanced SpeechButton with pause/resume toggle, speed label, error state, offline awareness"
  - "Exported isAndroid() from ttsCore.ts"
affects: [22-tts-quality, components using SpeechButton]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Android cancel/restart fallback for unreliable pause"
    - "Rapid-tap debounce via useRef timestamp"
    - "Native title tooltip wrapper span for disabled button hover"
    - "Online/offline event listeners with useCallback handlers"

key-files:
  created: []
  modified:
    - "src/components/ui/SpeechButton.tsx"
    - "src/lib/ttsCore.ts"

key-decisions:
  - "Android gets cancel/restart semantics instead of pause/resume (Android Chrome pause bug)"
  - "150ms debounce window for rapid taps via useRef timestamp"
  - "PauseIcon is static two-bar SVG (not SoundWaveIcon with animate=false)"
  - "Native browser title tooltip (span wrapper) for error/unsupported/offline states"
  - "Error auto-clears in useTTS on next successful speak -- no manual clear needed"
  - "Tooltip priority: unsupported > error > offline > none"

patterns-established:
  - "Span wrapper for disabled button tooltips: disabled elements do not fire hover events"
  - "Three-state click handler: idle -> speak, speaking -> pause/cancel, paused -> resume"

# Metrics
duration: 9min
completed: 2026-02-15
---

# Phase 22 Plan 02: SpeechButton Enhancement Summary

**SpeechButton with pause/resume toggle, speed label, inline error state, paused visual, and offline awareness**

## Performance

- **Duration:** 9 min
- **Started:** 2026-02-15T09:16:02Z
- **Completed:** 2026-02-15T09:25:50Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- SpeechButton click toggles between speak/pause/resume with Android cancel/restart fallback
- Speed label (e.g. "1x") renders when showSpeedLabel prop enabled
- Inline error state shows red-tinted button with native tooltip on TTS failure
- Paused state shows dimmed TTS color with static PauseIcon and no expanding rings
- Offline awareness appends "(Limited audio offline)" tooltip when offline and idle
- Unsupported browsers show disabled button with explanatory tooltip
- Rapid-tap debounce prevents double-firing within 150ms

## Task Commits

Each task was committed atomically:

1. **Task 1: Add pause/resume toggle with Android detection and rapid-tap debounce** - `916ce3c` (feat)
2. **Task 2: Add speed label, inline error state, and unsupported browser handling** - `e557d7c` (feat)

## Files Created/Modified
- `src/components/ui/SpeechButton.tsx` - Enhanced with pause/resume toggle, speed label, error state, paused visual, offline awareness, PauseIcon sub-component
- `src/lib/ttsCore.ts` - Exported isAndroid() function for SpeechButton use

## Decisions Made
- Android gets cancel/restart instead of pause/resume due to Android Chrome pause bug (existing convention from Phase 19)
- 150ms debounce window chosen for rapid taps (fast enough for intentional double-taps, slow enough to catch accidental)
- PauseIcon uses static two-bar SVG rather than SoundWaveIcon with animate=false for clear visual distinction
- Native browser title tooltip via span wrapper (not a custom tooltip library) -- keeps the component lightweight
- Tooltip priority order: unsupported > error > offline, ensuring most critical message shows
- Online/offline state tracked with useState + window event listeners (not OfflineContext) to keep SpeechButton self-contained

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- SpeechButton now supports all planned TTS control states
- showSpeedLabel/speedLabel props ready for integration with TTS settings UI
- Error state and pause/resume ready for end-to-end testing

## Self-Check: PASSED

All files exist, all commits verified.

---
*Phase: 22-tts-quality*
*Completed: 2026-02-15*
