---
phase: 06-interview-simulation
plan: 02
subsystem: audio
tags: [tts, speech-synthesis, media-recorder, audio, hooks]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: "Base project structure, hooks directory convention"
  - phase: 03-ui-ux-bilingual-polish
    provides: "SettingsPage, SectionHeading, Card components, design tokens"
  - phase: 05-spaced-repetition
    provides: "SettingsPage with notification and reminder sections"
provides:
  - "useInterviewTTS hook with speakWithCallback and timeout fallback"
  - "useAudioRecorder hook with graceful mic degradation"
  - "Speech rate setting on SettingsPage (slow/normal/fast)"
affects:
  - "06-03 (interview state machine uses TTS for question playback)"
  - "06-04 (interview UI uses audio recorder for response capture)"
  - "06-05 (review screen uses audioURL for playback)"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Timeout fallback for unreliable browser onend events"
    - "Graceful degradation pattern for optional browser APIs"
    - "Blob URL lifecycle management with revokeObjectURL"

key-files:
  created:
    - src/hooks/useInterviewTTS.ts
    - src/hooks/useAudioRecorder.ts
  modified:
    - src/pages/SettingsPage.tsx

key-decisions:
  - "Lazy useState initializer for isSupported instead of setState in effect"
  - "Speech rate stored in localStorage key civic-prep-speech-rate"
  - "Timeout formula: (wordCount/2.5)*1000/rate + 3000ms buffer"
  - "MediaRecorder mimeType omitted to let browser choose default"
  - "useAudioRecorder exposes stream state for waveform visualization"

patterns-established:
  - "TTS timeout fallback: estimate duration + setTimeout guard against unreliable onend"
  - "Audio permission flow: requestPermission -> startRecording -> stopRecording -> cleanup"
  - "Graceful degradation: no-op functions when browser API unavailable"

# Metrics
duration: 7min
completed: 2026-02-07
---

# Phase 6 Plan 02: Audio Hooks Summary

**Interview TTS hook with onEnd callbacks, timeout fallback, and audio recorder with graceful mic degradation**

## Performance

- **Duration:** 7 min
- **Started:** 2026-02-08T00:49:11Z
- **Completed:** 2026-02-08T00:55:48Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- useInterviewTTS hook with speakWithCallback that fires onEnd when speech completes (or times out)
- Timeout fallback for Chrome/Android where browser onend event is unreliable
- useAudioRecorder hook with full lifecycle: permission request, record, stop, cleanup
- Graceful degradation when TTS or mic APIs are unavailable (honor-system interview mode)
- Speech rate selector on SettingsPage persisted to localStorage (slow=0.7, normal=0.98, fast=1.3)

## Task Commits

Each task was committed atomically:

1. **Task 1: Extended TTS hook with onEnd callbacks and speech rate** - `661189c` (feat)
2. **Task 2: Audio recorder hook with graceful degradation** - `50b6940` (feat)

## Files Created/Modified
- `src/hooks/useInterviewTTS.ts` - TTS hook with speakWithCallback, timeout fallback, voice loading
- `src/hooks/useAudioRecorder.ts` - MediaRecorder hook with permission flow, blob URL management
- `src/pages/SettingsPage.tsx` - Added speech rate radio selector section with bilingual labels

## Decisions Made
- **Lazy useState for isSupported**: Used `useState(() => 'speechSynthesis' in window)` instead of `setIsSupported` in useEffect, avoiding React Compiler ESLint rule violation and unused setter
- **Timeout formula**: `(wordCount / 2.5) * 1000 / rate + 3000ms` balances quick detection with avoiding false positives
- **MediaRecorder mimeType omitted**: Let browser choose default codec per research recommendation for max compatibility
- **Stream exposed as both ref and state**: Ref for internal use in handlers, state for external waveform visualization component
- **Inline bilingual strings**: Used inline Burmese strings for speech rate options since i18n strings.ts doesn't yet have speech-related entries

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed unused setIsSupported ESLint error**
- **Found during:** Task 2 (ESLint verification)
- **Issue:** `setIsSupported` was destructured but never used since isSupported was initialized via lazy useState
- **Fix:** Changed to `const [isSupported] = useState(...)` to omit the setter
- **Files modified:** src/hooks/useInterviewTTS.ts
- **Verification:** ESLint passes clean
- **Committed in:** 50b6940 (amended into Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Trivial ESLint fix. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Both audio hooks ready for interview state machine (plan 06-03)
- useInterviewTTS provides the speakWithCallback sequencing needed for chime -> greeting -> question flow
- useAudioRecorder provides the recording lifecycle needed for response capture
- Speech rate setting available from localStorage for all TTS consumers

---
*Phase: 06-interview-simulation*
*Completed: 2026-02-07*

## Self-Check: PASSED
