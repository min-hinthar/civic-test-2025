---
phase: 20-session-persistence
plan: 06
subsystem: ui
tags: [session-persistence, indexeddb, resume-modal, practice, interview, react-state]

# Dependency graph
requires:
  - phase: 20-session-persistence
    provides: "Session types, store, ResumePromptModal, SessionCountdown (plans 01-03)"
provides:
  - "PracticePage with session persistence, resume prompt, countdown on resume"
  - "PracticeSession that saves PracticeSnapshot after each answer"
  - "InterviewPage with session persistence, resume prompt"
  - "InterviewSession that saves InterviewSnapshot after each grade, skips greeting on resume"
affects: [20-session-persistence]

# Tech tracking
tech-stack:
  added: []
  patterns: ["fire-and-forget saveSession in answer/grade handlers", "useState lazy init for resume state seeding", "isResuming flag from initialIndex for conditional initial phase"]

key-files:
  created: []
  modified:
    - src/pages/PracticePage.tsx
    - src/components/practice/PracticeSession.tsx
    - src/pages/InterviewPage.tsx
    - src/components/interview/InterviewSession.tsx

key-decisions:
  - "Practice countdown shown on resume when timer enabled (fresh timer duration per user decision)"
  - "Interview resume skips greeting, starts at chime phase for next ungraded question"
  - "Interview questions changed from useMemo to useState lazy init for resume seeding"
  - "resumeData cleared on retry/switchMode to prevent stale state on next session"
  - "Countdown subtitle varies: Q{index}/{count} for resume vs {count} Questions for new"

patterns-established:
  - "Session save in event handler: fire-and-forget saveSession after state update, before transition"
  - "Resume seeding: parent passes initial* props, child uses useState(initial ?? default)"
  - "Page-level resume flow: check sessions on mount, show modal, restore state, skip to session phase"

# Metrics
duration: 20min
completed: 2026-02-15
---

# Phase 20 Plan 06: Practice & Interview Session Persistence Summary

**Full session persistence for PracticePage and InterviewPage: IndexedDB save after each answer/grade, resume modal on return, state restoration with countdown and greeting skip**

## Performance

- **Duration:** 20 min
- **Started:** 2026-02-15T00:38:15Z
- **Completed:** 2026-02-15T00:58:11Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- PracticePage checks for saved sessions on mount, shows ResumePromptModal, restores full practice state (questions, results, index, timer, category config) on resume
- PracticeSession saves PracticeSnapshot to IndexedDB after each answer via fire-and-forget saveSession
- InterviewPage checks for saved sessions on mount, shows ResumePromptModal, restores interview state (questions, results, counts, mode, startTime) on resume
- InterviewSession saves InterviewSnapshot to IndexedDB after each self-grade, skips greeting on resume (starts at chime for next question)
- Both pages delete sessions from IndexedDB on completion
- Practice countdown shown when timer enabled (both new and resumed sessions)
- SESS-02 (practice persistence) and SESS-03 (interview persistence) fully implemented

## Task Commits

Each task was committed atomically:

1. **Task 1: PracticePage session persistence** - `3e7d690` (feat)
2. **Task 2: InterviewPage session persistence** - `621c526` (feat)

## Files Created/Modified
- `src/pages/PracticePage.tsx` - Added session persistence state, mount check, resume/fresh/notNow handlers, SessionCountdown with subtitle, session deletion on completion, and resume props to PracticeSession
- `src/components/practice/PracticeSession.tsx` - Added sessionId, practiceConfig, initialResults, initialIndex props; saves PracticeSnapshot after each answer
- `src/pages/InterviewPage.tsx` - Added session persistence state, mount check, resume/fresh/notNow handlers, resume data passing to InterviewSession, session deletion on completion
- `src/components/interview/InterviewSession.tsx` - Added sessionId, initial* props; changed questions from useMemo to useState; saves InterviewSnapshot after each grade; skips greeting on resume (starts at chime)

## Decisions Made
- Practice countdown shown on resume when timer was enabled -- uses fresh timer duration (not restored timeLeft) per prior user decision
- Interview resume skips greeting and starts at chime phase for the next ungraded question -- avoids trying to restore mid-question TTS state which is not serializable
- Changed InterviewSession questions from useMemo to useState with lazy init -- required for seeding with saved questions on resume (same pattern used in TestPage plan 05)
- resumeData cleared in handleRetry and handleSwitchMode to prevent stale resume state from carrying over to a new session
- Countdown subtitle format: "Practice: {category} -- Q{index}/{count}" for resume, "Practice: {category} -- {count} Questions" for new sessions

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- `npm run build` runs lint-staged internally which restores git stash, reverting unstaged file edits. Resolved by writing complete files and committing immediately after typecheck verification instead of running build between edits and commit.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 6 plans in Phase 20 are now complete
- Session persistence works across all 3 session types: mock test (plan 05), practice (plan 06), and interview (plan 06)
- Dashboard banners and nav badges (plan 04) already integrated with session store
- Phase 20 ready for final state update

## Self-Check: PASSED

- [x] src/pages/PracticePage.tsx -- FOUND
- [x] src/components/practice/PracticeSession.tsx -- FOUND
- [x] src/pages/InterviewPage.tsx -- FOUND
- [x] src/components/interview/InterviewSession.tsx -- FOUND
- [x] Commit 3e7d690 -- FOUND
- [x] Commit 621c526 -- FOUND

---
*Phase: 20-session-persistence*
*Completed: 2026-02-15*
