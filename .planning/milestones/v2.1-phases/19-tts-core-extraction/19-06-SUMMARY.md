---
phase: 19-tts-core-extraction
plan: 06
subsystem: tts
tags: [speech-synthesis, TTSProvider, integration-tests, old-hook-deletion, settings-migration]

# Dependency graph
requires:
  - "19-03: TTSProvider, TTSContext, useTTS and useTTSSettings hooks"
  - "19-04: SpeechButton migrated to useTTS with TTS color tokens and animation"
  - "19-05: InterviewSession and InterviewResults migrated to useTTS"
provides:
  - "TTSProvider wired into AppShell provider tree (after ThemeProvider, before ToastProvider)"
  - "6 integration tests verifying TTSProvider + SpeechButton end-to-end plumbing"
  - "Old hooks deleted: useInterviewTTS.ts (214 lines) and useSpeechSynthesis.ts (126 lines)"
  - "SettingsPage migrated from raw localStorage to useTTSSettings hook"
  - "Zero stale references to old TTS system in codebase"
  - "Phase 19 complete: all TTS logic consolidated into ttsCore + TTSContext + useTTS"
affects: [22-tts-quality]

# Tech tracking
tech-stack:
  added: []
  patterns: [provider-tree-wiring, integration-test-with-mock-speechSynthesis]

key-files:
  created:
    - src/__tests__/tts.integration.test.tsx
  modified:
    - src/AppShell.tsx
    - src/pages/SettingsPage.tsx
  deleted:
    - src/hooks/useInterviewTTS.ts
    - src/lib/useSpeechSynthesis.ts

key-decisions:
  - "Direct import instead of next/dynamic for TTSProvider -- AppShell has isClient gate, SSR guards in provider itself"
  - "SettingsPage migrated from raw localStorage civic-prep-speech-rate to useTTSSettings hook (deviation Rule 1)"
  - "TTS color tokens and Tailwind config already existed from Plan 19-04 -- no CSS changes needed"

patterns-established:
  - "TTSProvider placement: after ThemeProvider, before ToastProvider in AppShell provider tree"
  - "Integration test pattern: render component inside provider with mock speechSynthesis, verify plumbing"

# Metrics
duration: 15min
completed: 2026-02-14
---

# Phase 19 Plan 06: AppShell Wiring + Old Hook Deletion Summary

**TTSProvider wired into AppShell, 6 integration tests added, old hooks deleted, SettingsPage synced via useTTSSettings -- phase 19 complete**

## Performance

- **Duration:** 15 min
- **Started:** 2026-02-14T15:53:55Z
- **Completed:** 2026-02-14T16:08:31Z
- **Tasks:** 2
- **Files modified:** 4 (1 created, 2 modified, 2 deleted, net -123 lines)

## Accomplishments

- TTSProvider wired into AppShell after ThemeProvider, before ToastProvider -- TTS system is now live app-wide
- 6 integration tests cover SpeechButton + TTSProvider plumbing: render, click-to-speak, disabled state, ARIA, children-first, whitespace
- Deleted 340 lines of duplicated TTS code (useInterviewTTS.ts + useSpeechSynthesis.ts)
- SettingsPage speech rate now flows through TTSContext (was writing to dead localStorage key)
- Zero stale references to old hooks confirmed via grep
- All tests pass (329 passing, 9 pre-existing errorBoundary failures unrelated to TTS)
- Clean build with zero type errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Wire TTSProvider into AppShell** - `12223f1` (feat)
2. **Task 2: Integration tests + delete old hooks + SettingsPage fix** - `f4b52e2` (feat)

## Files Created/Modified

- `src/AppShell.tsx` - Added TTSProvider import and inserted into provider tree
- `src/__tests__/tts.integration.test.tsx` - 6 integration tests with mock speechSynthesis
- `src/pages/SettingsPage.tsx` - Migrated speech rate from raw localStorage to useTTSSettings
- `src/hooks/useInterviewTTS.ts` - DELETED (214 lines, replaced by useTTS)
- `src/lib/useSpeechSynthesis.ts` - DELETED (126 lines, replaced by useTTS)

## Decisions Made

- **Direct import vs dynamic import for TTSProvider:** Used direct import since AppShell already has `isClient` gate and TTSProvider has internal SSR guards. Dynamic import would add complexity with no benefit.
- **SettingsPage migration (deviation):** Discovered SettingsPage still wrote to `civic-prep-speech-rate` localStorage key, which TTSContext migrates away from on mount. Migrated to `useTTSSettings()` to ensure settings sync correctly.
- **No CSS changes needed:** TTS color tokens (`--color-tts` in tokens.css), Tailwind color (`tts` in tailwind.config.js), and pulse animation were already added in Plan 19-04.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] SettingsPage writing to dead localStorage key**
- **Found during:** Task 2 (grep cleanup)
- **Issue:** SettingsPage defined `SPEECH_RATE_KEY = 'civic-prep-speech-rate'` and wrote speech rate directly to localStorage. After TTSContext migration (which moves the old key to `civic-prep-tts-settings`), SettingsPage writes would go to the dead key and never sync to the TTS engine.
- **Fix:** Replaced local state + raw localStorage with `useTTSSettings()` hook. Speech rate now flows through TTSContext's `updateSettings()` which persists to the new key and syncs the engine.
- **Files modified:** `src/pages/SettingsPage.tsx`
- **Verification:** Grep confirms zero references to `SPEECH_RATE_KEY` in codebase. Type check and build pass.
- **Committed in:** `f4b52e2` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Essential fix for settings synchronization. Without this, users changing speech speed in Settings would see no effect. No scope creep.

## Issues Encountered

- Pre-existing errorBoundary.test.tsx failures (9 tests) due to `localStorage.getItem is not a function` in jsdom -- unrelated to TTS changes, verified by running tests on unmodified code.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- **Phase 19 COMPLETE** -- all TTS logic consolidated into `ttsCore.ts` + `TTSContext.tsx` + `useTTS.ts`
- New TTS architecture: 1 core engine (340 lines), 1 provider, 2 hooks, 39 unit tests + 6 integration tests
- Old hooks deleted, zero stale references
- Ready for Phase 22 (TTS Quality): voice picker UI, settings page, pause/resume UI all have hooks ready (`useTTSSettings`, `useTTS.pause/resume`)
- Settings page already uses `useTTSSettings` -- Phase 22 can add voice picker directly

## Self-Check: PASSED

- [x] src/__tests__/tts.integration.test.tsx exists
- [x] src/AppShell.tsx exists (modified)
- [x] src/pages/SettingsPage.tsx exists (modified)
- [x] src/hooks/useInterviewTTS.ts deleted
- [x] src/lib/useSpeechSynthesis.ts deleted
- [x] Commit 12223f1 exists
- [x] Commit f4b52e2 exists

---
*Phase: 19-tts-core-extraction*
*Completed: 2026-02-14*
