---
phase: 19-tts-core-extraction
plan: 03
subsystem: tts
tags: [react-context, hooks, speech-synthesis, settings-persistence, localStorage-migration]

# Dependency graph
requires:
  - "19-01: ttsTypes.ts (TTSEngine, TTSState, TTSSettings, SpeakOptions) + ttsCore.ts (createTTSEngine, loadVoices, findVoice)"
provides:
  - "TTSContext.tsx: TTSProvider context with shared engine, settings persistence, named rate mapping, lazy voice loading"
  - "useTTS.ts: Main hook with speak/cancel/pause/resume, reactive state, error handling, auto-cancel on unmount"
  - "useTTSSettings.ts: Lightweight settings-only hook for future Settings page"
affects: [19-04, 19-05, 19-06]

# Tech tracking
tech-stack:
  added: []
  patterns: [shared-engine-context, named-rate-mapping, deferred-voice-loading, isolated-engine-mode, silent-migration]

key-files:
  created:
    - src/contexts/TTSContext.tsx
    - src/hooks/useTTS.ts
    - src/hooks/useTTSSettings.ts
  modified: []

key-decisions:
  - "Error state managed locally in useTTS hook, not in provider context -- hooks own their error lifecycle"
  - "Context error field is static null -- useTTS provides reactive error per consumer"
  - "Isolated engine created via useRef with state subscription, accessed only in effects/handlers (React Compiler safe)"

patterns-established:
  - "Shared engine context: Provider creates/owns engine, hooks consume via useContext"
  - "Named rate mapping: Provider converts slow/normal/fast to numeric (0.7/0.98/1.3)"
  - "Deferred voice loading: requestIdleCallback with setTimeout(0) fallback"
  - "Settings migration: Silent one-time migration from old localStorage key to new unified key"
  - "Auto-cancel on unmount: useTTS cleanup effect cancels active speech when component unmounts"

# Metrics
duration: 5min
completed: 2026-02-14
---

# Phase 19 Plan 03: TTS React Context and Hooks Summary

**TTSProvider with shared engine lifecycle, settings persistence with silent migration, and useTTS/useTTSSettings hooks with auto-cancel on unmount**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-14T15:27:55Z
- **Completed:** 2026-02-14T15:33:32Z
- **Tasks:** 2
- **Files created:** 3

## Accomplishments
- TTSProvider context following ThemeContext/LanguageContext patterns with shared engine creation, deferred voice loading, and settings persistence
- Silent migration from old 'civic-prep-speech-rate' localStorage key to new unified 'civic-prep-tts-settings' key
- useTTS hook with full engine API (speak/cancel/pause/resume), reactive state, error handling, isolated engine mode, and auto-cancel on unmount
- useTTSSettings lightweight hook for settings-only access (future Settings page in Phase 22)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create TTSContext provider with engine lifecycle and settings persistence** - `251bde4` (feat)
2. **Task 2: Create useTTS and useTTSSettings hooks** - `080a431` (feat)

## Files Created/Modified
- `src/contexts/TTSContext.tsx` - TTSProvider context with shared engine, settings persistence via localStorage, silent migration from old key, named rate mapping (slow->0.7, normal->0.98, fast->1.3), deferred voice loading via requestIdleCallback
- `src/hooks/useTTS.ts` - Main TTS hook wrapping shared engine with reactive state, error handling (auto-clears on success), speak with settings-derived defaults, isolated engine mode via useRef, auto-cancel on unmount
- `src/hooks/useTTSSettings.ts` - Lightweight settings-only hook returning settings + updateSettings for future Settings page

## Decisions Made
- Error state managed locally per-hook (not globally in provider) -- each consumer has independent error lifecycle, cancellation errors are suppressed (not real errors)
- Context value includes `error: null` static field for interface compliance; useTTS provides actual reactive error state
- Isolated engine uses useRef for storage with state subscription via useState, ensuring ref.current is only accessed in effects/handlers (React Compiler safe)
- The `void activeEngine` pattern was removed in favor of simply not declaring the variable -- cleaner code

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed unused setError state from provider**
- **Found during:** Task 1 (TTSContext.tsx verification)
- **Issue:** ESLint flagged `setError` as assigned but never used -- provider creates error state but never sets it (hooks manage their own error state)
- **Fix:** Removed useState for error, replaced with static `error: null` in context value
- **Files modified:** src/contexts/TTSContext.tsx
- **Verification:** `npx eslint src/contexts/TTSContext.tsx` passes with zero errors
- **Committed in:** 251bde4 (Task 1 commit)

**2. [Rule 3 - Blocking] Unstaged conflicting test file to unblock commit**
- **Found during:** Task 1 (git commit)
- **Issue:** Pre-commit lint-staged hook failed because `src/lib/ttsCore.test.ts` (untracked file from prior work) was accidentally staged and had lint errors
- **Fix:** `git reset HEAD src/lib/ttsCore.test.ts` to unstage the test file, then committed only TTSContext.tsx
- **Files modified:** None (staging change only)
- **Verification:** Commit succeeded with clean pre-commit hooks

---

**Total deviations:** 2 auto-fixed (1 bug fix, 1 blocking)
**Impact on plan:** Both fixes necessary for lint compliance and commit success. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- TTSProvider, useTTS, and useTTSSettings ready for consumer migration in Plans 19-04 and 19-05
- SpeechButton can import useTTS() for speak/cancel with reactive isSpeaking state
- InterviewSession can use useTTS() + safeSpeak() pattern for async speech sequencing
- AppShell wiring (Plan 19-06) can wrap app with TTSProvider after LanguageProvider
- Old hooks (useInterviewTTS, useSpeechSynthesis) remain intact for migration in plans 19-04/19-05

## Self-Check: PASSED

- [x] src/contexts/TTSContext.tsx exists
- [x] src/hooks/useTTS.ts exists
- [x] src/hooks/useTTSSettings.ts exists
- [x] Commit 251bde4 exists (Task 1)
- [x] Commit 080a431 exists (Task 2)

---
*Phase: 19-tts-core-extraction*
*Completed: 2026-02-14*
