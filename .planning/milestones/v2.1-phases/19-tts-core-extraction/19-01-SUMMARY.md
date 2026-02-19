---
phase: 19-tts-core-extraction
plan: 01
subsystem: tts
tags: [speech-synthesis, web-speech-api, cross-browser, factory-pattern, typescript]

# Dependency graph
requires: []
provides:
  - "ttsTypes.ts: TTSEngine interface, TTSState, TTSSettings, SpeakOptions, error classes, voice constants"
  - "ttsCore.ts: createTTSEngine factory, findVoice, estimateDuration, loadVoices, getPreferredVoice, safeSpeak"
affects: [19-02, 19-03, 19-04, 19-05, 19-06]

# Tech tracking
tech-stack:
  added: []
  patterns: [closure-based-factory, promise-based-speech, sentence-aware-chunking, module-level-gc-reference]

key-files:
  created:
    - src/lib/ttsTypes.ts
    - src/lib/ttsCore.ts
  modified: []

key-decisions:
  - "eslint-disable for currentUtterance: module-level variable intentionally assigned but never read (GC prevention pattern)"
  - "void swallow pattern in safeSpeak: uses void operator to explicitly consume destructured swallow param"
  - "Android detection via navigator.userAgent: single exception to no-UA-sniffing rule for pause/resume cycling"

patterns-established:
  - "Closure-based factory: createTTSEngine returns TTSEngine interface via closure, not class"
  - "Module-level voice cache: voiceCache shared across all engine instances"
  - "Strong utterance reference: currentUtterance held at module level to prevent browser GC"
  - "Double-fire guard: settled boolean prevents onend/onerror/timeout from resolving promise twice"
  - "Sentence-aware chunking: chunkForSpeech splits on sentence boundaries with 30-word max per chunk"

# Metrics
duration: 5min
completed: 2026-02-14
---

# Phase 19 Plan 01: TTS Core Types and Engine Summary

**Closure-based TTS engine factory with promise-based speak(), 12 cross-browser workarounds, and standalone voice/duration utilities**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-14T15:18:51Z
- **Completed:** 2026-02-14T15:23:49Z
- **Tasks:** 2
- **Files created:** 2

## Accomplishments
- Complete TTS type system with TTSEngine interface, 6 type exports, 2 error classes, and 4 voice constant arrays
- Full createTTSEngine() factory with speak/cancel/pause/resume/destroy and all cross-browser workarounds
- 5 standalone utility exports: loadVoices, findVoice, estimateDuration, getPreferredVoice, safeSpeak
- All 12 pitfalls from research addressed: Chrome 15s bug, Safari cancel errors, Firefox race condition, utterance GC, Android pause breakage, voice loading timing, Safari addEventListener, Android voice selection, Android locale format, utterance reuse, iOS mute switch, React Strict Mode

## Task Commits

Each task was committed atomically:

1. **Task 1: Create TTS types, error classes, and voice constants** - `dcb9561` (feat)
2. **Task 2: Create TTS core engine module with all cross-browser workarounds** - `708da85` (feat)

## Files Created/Modified
- `src/lib/ttsTypes.ts` - Type system: TTSEngine interface, TTSState, TTSSettings, SpeakOptions, TTSEngineDefaults, FindVoicePreferences, SafeSpeakOptions types, TTSCancelledError/TTSUnsupportedError error classes, APPLE_US_VOICES/ANDROID_US_VOICES/EDGE_VOICES/ENHANCED_HINTS voice constants
- `src/lib/ttsCore.ts` - Engine factory + utilities: createTTSEngine(), loadVoices(), findVoice(), estimateDuration(), getPreferredVoice(), safeSpeak(), plus internal chunkForSpeech() and isAndroid() helpers

## Decisions Made
- Used eslint-disable comment for `currentUtterance` module-level variable (intentional GC prevention pattern, not a code smell)
- Used `void swallow` in safeSpeak to consume the destructured swallow parameter without triggering unused-var lint error
- Android detection uses `navigator.userAgent` check -- the single documented exception to the no-UA-sniffing rule, because pause/resume cycling genuinely breaks Android Chrome

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed lint errors for unused variables**
- **Found during:** Task 2 (ttsCore.ts verification)
- **Issue:** ESLint flagged `currentUtterance` as unused (only assigned, never read) and `_swallow` destructured variable as unused
- **Fix:** Added eslint-disable comment for currentUtterance (intentional GC pattern); replaced destructuring with explicit `void swallow` pattern for safeSpeak
- **Files modified:** src/lib/ttsCore.ts
- **Verification:** `npx eslint src/lib/ttsCore.ts` passes with zero errors
- **Committed in:** 708da85 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug fix)
**Impact on plan:** Minor lint fix necessary for build compliance. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- ttsTypes.ts and ttsCore.ts ready as foundation for all subsequent plans
- Plan 19-02 (useTTS hook) can import from these modules
- Plan 19-03 (TTSContext provider) can use createTTSEngine and loadVoices
- Old hooks (useInterviewTTS, useSpeechSynthesis) remain intact for migration in plans 19-04/19-05

## Self-Check: PASSED

- [x] src/lib/ttsTypes.ts exists
- [x] src/lib/ttsCore.ts exists
- [x] Commit dcb9561 exists (Task 1)
- [x] Commit 708da85 exists (Task 2)

---
*Phase: 19-tts-core-extraction*
*Completed: 2026-02-14*
