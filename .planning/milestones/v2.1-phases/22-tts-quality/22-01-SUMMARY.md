---
phase: 22-tts-quality
plan: 01
subsystem: ui
tags: [tts, voice-selection, settings, speech-synthesis, accessibility]

# Dependency graph
requires:
  - phase: 19-tts-core
    provides: "TTSContext, ttsCore engine, useTTS/useTTSSettings hooks"
provides:
  - "Extended TTSSettings type with autoRead, autoReadLang, burmeseVoice fields"
  - "VoicePicker component for English voice selection with preview"
  - "Speech & Audio settings section with 5 controls"
affects: [22-02, 22-03, 22-04, 22-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Settings merge pattern: { ...DEFAULT_SETTINGS, ...parsed } for backward-compatible field additions"
    - "VoicePicker voice filtering: normalize lang with toLowerCase().replace(/_/g, '-') before en- matching"
    - "Conditional radio group visibility: autoReadLang only when autoRead && showBurmese"

key-files:
  created:
    - "src/components/ui/VoicePicker.tsx"
  modified:
    - "src/lib/ttsTypes.ts"
    - "src/contexts/TTSContext.tsx"
    - "src/pages/SettingsPage.tsx"

key-decisions:
  - "VoicePicker uses native <select> for accessibility (not custom dropdown)"
  - "Voice preview plays 'What is the supreme law of the land?' on selection change"
  - "Interview section replaced by Speech & Audio section (above Sound & Notifications)"
  - "Sound & Notifications icon changed from Volume2 to Bell to differentiate from Speech & Audio"
  - "Auto-read language selector only visible when autoRead is ON and showBurmese is true"
  - "Burmese voice selector always visible in bilingual mode (not gated on autoRead)"

patterns-established:
  - "Settings backward compatibility: merge stored with defaults for new fields"
  - "Conditional settings controls: gate UI on related toggle state"

# Metrics
duration: 12min
completed: 2026-02-15
---

# Phase 22 Plan 01: Voice Selection & Speech Settings Summary

**VoicePicker dropdown with voice preview, extended TTSSettings with autoRead/autoReadLang/burmeseVoice, and dedicated Speech & Audio section in Settings with 5 controls**

## Performance

- **Duration:** 12 min
- **Started:** 2026-02-15T09:16:37Z
- **Completed:** 2026-02-15T09:29:23Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Extended TTSSettings type with autoRead, autoReadLang, and burmeseVoice fields with backward-compatible defaults
- Created VoicePicker component with English voice filtering, local/remote grouping, and preview playback
- Redesigned Settings page with dedicated Speech & Audio section containing voice picker, speed selector, auto-read toggle, auto-read language selector, and Burmese voice selector

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend TTSSettings type and TTSContext defaults** - `e6bc892` (feat)
2. **Task 2: Create VoicePicker component and add Speech & Audio section to Settings** - `e202ea5` (feat)

## Files Created/Modified
- `src/lib/ttsTypes.ts` - Added AutoReadLang, BurmeseVoice types; extended TTSSettings
- `src/contexts/TTSContext.tsx` - Updated DEFAULT_SETTINGS with new fields; merge pattern in loadInitialSettings
- `src/components/ui/VoicePicker.tsx` - New voice selection dropdown with preview playback
- `src/pages/SettingsPage.tsx` - Speech & Audio section with 5 controls, removed old Interview section

## Decisions Made
- VoicePicker uses native `<select>` element for built-in accessibility rather than custom dropdown
- Voice preview plays "What is the supreme law of the land?" on voice selection change
- Old Interview section entirely replaced by Speech & Audio section (moved above Sound & Notifications)
- Sound & Notifications icon changed from Volume2 to Bell to visually differentiate from Speech & Audio
- Auto-read language selector conditionally visible only when both autoRead is enabled and showBurmese is true
- Burmese voice selector visible whenever bilingual mode is active (not gated behind autoRead)
- Settings merge uses `{ ...DEFAULT_SETTINGS, ...parsed }` pattern for backward compatibility with existing localStorage data

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Removed unused Mic import from SettingsPage**
- **Found during:** Task 2 (Settings page restructure)
- **Issue:** After removing the Interview section, the `Mic` icon import was unused which would cause ESLint error
- **Fix:** Removed `Mic` from lucide-react import
- **Files modified:** src/pages/SettingsPage.tsx
- **Verification:** ESLint passes clean
- **Committed in:** e202ea5 (Task 2 commit)

**2. [Rule 2 - Missing Critical] Changed Sound & Notifications icon from Volume2 to Bell**
- **Found during:** Task 2 (Settings page restructure)
- **Issue:** Both Speech & Audio and Sound & Notifications sections would use Volume2 icon, causing visual confusion
- **Fix:** Changed Sound & Notifications section icon to Bell (already imported)
- **Files modified:** src/pages/SettingsPage.tsx
- **Verification:** Visual differentiation between sections
- **Committed in:** e202ea5 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 missing critical)
**Impact on plan:** Both auto-fixes necessary for correctness. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- TTSSettings type fully extended for downstream plans (auto-read hooks, speed overrides, Burmese audio)
- VoicePicker component ready for reuse in other contexts if needed
- Settings page Speech & Audio section provides the foundation for all Phase 22 user-facing controls
- No blockers for plans 22-02 through 22-09

---
*Phase: 22-tts-quality*
*Completed: 2026-02-15*
