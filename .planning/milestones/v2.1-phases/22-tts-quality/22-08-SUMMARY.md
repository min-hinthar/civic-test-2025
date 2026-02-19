---
phase: 22-tts-quality
plan: 08
subsystem: ui
tags: [tts, interview, burmese-audio, speed-override, speech-button]

requires:
  - phase: 22-05
    provides: InterviewSpeechOverrides type, per-session speed override on InterviewSetup
  - phase: 22-07
    provides: BurmeseSpeechButton, auto-read pattern, speed label pattern
provides:
  - InterviewSession with speed override and rate-controlled TTS
  - Practice + Myanmar mode: English then Burmese audio sequence per question
  - BurmeseSpeechButton in interview chat bubbles and transcript
  - InterviewResults with speed-labeled transcript buttons
affects: [22-09, interview]

tech-stack:
  added: []
  patterns:
    - "safeSpeakLocal wraps speak() with session numericRate override"
    - "Burmese audio played sequentially after English TTS in reading phase"
    - "ChatMessage extended with optional questionId for Burmese replay targeting"
    - "BurmesePlayer ref created lazily, cancelled on unmount/quit"

key-files:
  created: []
  modified:
    - src/components/interview/InterviewSession.tsx
    - src/components/interview/InterviewResults.tsx
    - src/components/interview/InterviewTranscript.tsx
    - src/pages/InterviewPage.tsx

key-decisions:
  - "Real mode always uses normal speed (0.98x) regardless of user selection"
  - "Practice mode uses speedOverride from InterviewSetup or falls back to global TTS rate"
  - "Burmese audio failure is non-blocking (console.debug, no toast, no interview interruption)"
  - "ChatMessage gains questionId field to identify examiner question messages for Burmese replay"
  - "BurmeseSpeechButton uses compact styling in chat bubbles (!py-1 !min-h-[32px])"
  - "InterviewTranscript accepts speedLabel prop for results view Burmese buttons"

patterns-established:
  - "Speed override flow: InterviewSetup -> InterviewPage state -> InterviewSession/Results props"
  - "Burmese player ref with lazy initialization (getBurmesePlayer callback)"
  - "Sequential TTS: English speak() -> await Burmese play() -> transition to responding"

duration: 14min
completed: 2026-02-15
---

# Phase 22 Plan 08: Interview TTS Integration Summary

**Speed-overridden TTS and Burmese MP3 playback in InterviewSession with BurmeseSpeechButton in chat bubbles and transcript**

## Performance

- **Duration:** 14 min
- **Started:** 2026-02-15T10:16:16Z
- **Completed:** 2026-02-15T10:31:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- InterviewSession applies per-session speed override to all TTS calls (Real mode forces normal, Practice mode respects user selection)
- Practice mode in Myanmar mode plays English TTS followed by Burmese MP3 for each question with graceful error handling
- BurmeseSpeechButton appears in chat bubbles for examiner question messages (Practice + Myanmar mode)
- InterviewTranscript shows BurmeseSpeechButton with speed labels for each question in the results view
- Full data flow from InterviewSetup through InterviewPage to InterviewSession and InterviewResults

## Task Commits

Each task was committed atomically:

1. **Task 1: Add speed override and always-auto-read to InterviewSession** - `fad1504` (feat)
2. **Task 2: Add Burmese audio to Practice mode in Myanmar mode** - `702fd57` (feat)

## Files Created/Modified

- `src/components/interview/InterviewSession.tsx` - RATE_MAP, speedOverride prop, numericRate in safeSpeakLocal, Burmese audio in reading phase, BurmeseSpeechButton in chat, Burmese player lifecycle
- `src/components/interview/InterviewResults.tsx` - speedOverride prop, effectiveSpeedLabel computed, passed to InterviewTranscript
- `src/components/interview/InterviewTranscript.tsx` - speedLabel prop, BurmeseSpeechButton after each examiner question bubble (Myanmar mode)
- `src/pages/InterviewPage.tsx` - speedOverride state, captures InterviewSpeechOverrides from setup, forwards to session and results

## Decisions Made

- Real mode enforces normal speed (USCIS simulation fidelity) -- speedOverride ignored
- Burmese audio failure is completely silent (console.debug only) -- interview flow never blocks on MP3 load errors
- ChatMessage interface extended with optional questionId to identify which messages are question reads (vs greetings, feedback, acks)
- BurmeseSpeechButton in chat uses compact styling to not overwhelm the conversation layout
- InterviewTranscript receives speedLabel as a string prop (not the full override) for simplicity

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] InterviewPage did not forward speedOverride from InterviewSetup**
- **Found during:** Task 1 (InterviewSession speed override)
- **Issue:** InterviewPage's handleStart only accepted `InterviewMode` parameter, ignoring the `InterviewSpeechOverrides` that InterviewSetup sends
- **Fix:** Added speedOverride state to InterviewPage, updated handleStart to accept and store overrides, forwarded to InterviewSession and InterviewResults
- **Files modified:** src/pages/InterviewPage.tsx
- **Verification:** TypeScript + ESLint pass, build succeeds
- **Committed in:** fad1504 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential fix -- without it, speed overrides would never reach the session. No scope creep.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All interview TTS features complete: speed override, always-auto-read, Burmese audio in Practice mode
- Ready for plan 22-09 (final polish/verification)
- InterviewSession backward compatible (speedOverride is optional prop)

## Self-Check: PASSED

All 4 modified files exist on disk. Both commit hashes (fad1504, 702fd57) found in git log.

---
*Phase: 22-tts-quality*
*Completed: 2026-02-15*
