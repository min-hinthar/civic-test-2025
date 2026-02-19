---
phase: 26-gap-closure-session-nav-tts
plan: 02
subsystem: ui
tags: [react, tts, speech-synthesis, settings, voice-picker]

requires:
  - phase: 19-tts-core-extraction
    provides: TTSEngine with setDefaults and preferredVoiceName support
  - phase: 22-tts-quality
    provides: TTSSettings type, TTSContext, useTTS hook, Settings Speech & Audio section
provides:
  - VoicePicker component for TTS voice selection
  - preferredVoiceName field on TTSSettings type
  - Voice preference persistence via localStorage
affects: [settings, tts]

tech-stack:
  added: []
  patterns: [native-select-for-a11y, voice-preview-on-change]

key-files:
  created:
    - src/components/settings/VoicePicker.tsx
  modified:
    - src/lib/ttsTypes.ts
    - src/contexts/TTSContext.tsx
    - src/pages/SettingsPage.tsx

key-decisions:
  - "Native <select> for accessibility per Phase 22 decision"
  - "English voices filtered and sorted local-first then alphabetical"
  - "Preview plays 'What is the supreme law of the land?' on voice change"
  - "Mic icon used for Voice row to avoid duplicating Volume2 from section header"

patterns-established:
  - "Voice picker: filter by language -> sort local-first -> native select -> preview on change"

requirements-completed: [TTS-01]

duration: 3min
completed: 2026-02-18
---

# Plan 26-02: VoicePicker Summary

**VoicePicker component with native select dropdown, English voice filtering, local-first sort, preview playback, and localStorage persistence**

## Performance

- **Duration:** 3 min
- **Completed:** 2026-02-18
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Extended TTSSettings type with optional preferredVoiceName field
- Updated TTSContext.updateSettings to forward preferredVoiceName to engine.setDefaults
- Created VoicePicker component with English voice filter, local-first sort, and preview
- Integrated VoicePicker into Settings > Speech & Audio section between Speed and Auto-Read

## Task Commits

1. **Task 1: Extend TTSSettings type and sync preferredVoiceName to engine** - `06658de` (feat)
2. **Task 2: Create VoicePicker component and integrate into SettingsPage** - `06658de` (feat)

## Files Created/Modified
- `src/lib/ttsTypes.ts` - Added preferredVoiceName to TTSSettings
- `src/contexts/TTSContext.tsx` - Forwards preferredVoiceName to engine.setDefaults
- `src/components/settings/VoicePicker.tsx` - New VoicePicker component
- `src/pages/SettingsPage.tsx` - Renders VoicePicker in Speech & Audio section

## Decisions Made
- Used Mic icon for Voice row to differentiate from Volume2 used in section header

## Deviations from Plan
None - plan executed exactly as written

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Voice selection is fully functional with persistence
- Backward compatible — existing users without preferredVoiceName get auto selection

---
*Phase: 26-gap-closure-session-nav-tts*
*Completed: 2026-02-18*
