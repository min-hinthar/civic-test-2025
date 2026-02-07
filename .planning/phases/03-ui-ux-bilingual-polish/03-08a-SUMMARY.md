---
phase: 03-ui-ux-bilingual-polish
plan: 08a
subsystem: pages
tags: [study, test, history, flashcards, timer, celebrations, bilingual, animations]
dependency-graph:
  requires: ["03-01", "03-02", "03-03", "03-05", "03-06", "03-07"]
  provides: ["Phase 3 polished StudyGuidePage, TestPage, HistoryPage"]
  affects: ["04-*"]
tech-stack:
  added: []
  patterns: ["hash-based-routing", "answer-feedback-delay", "pre-test-screen", "staggered-animations"]
key-files:
  created: []
  modified:
    - src/pages/StudyGuidePage.tsx
    - src/pages/TestPage.tsx
    - src/pages/HistoryPage.tsx
decisions:
  - id: 03-08a-01
    title: "react-router-dom for hash routing (not Next.js router)"
    context: "Plan specified Next.js Pages Router, but project uses react-router-dom"
    choice: "Used useLocation/useNavigate from react-router-dom for hash-based routing"
  - id: 03-08a-02
    title: "1500ms feedback delay before question advancement"
    context: "AnswerFeedback needs visible time for user to read correct/incorrect"
    choice: "FEEDBACK_DELAY_MS = 1500 with setTimeout"
  - id: 03-08a-03
    title: "warning-500 (orange) replaces red for incorrect indicators"
    context: "Design system uses soft orange not red for wrong answers"
    choice: "text-warning-500 everywhere incorrect/failing is shown"
metrics:
  duration: "25 min"
  completed: 2026-02-06
---

# Phase 3 Plan 08a: Study, Test, History Page Polish Summary

**One-liner:** Core learning pages polished with FlashcardStack, CircularTimer, PreTestScreen, AnswerFeedback, Confetti, CountUpScore, and StaggeredList animations

## What Was Done

### Task 1: StudyGuidePage with FlashcardStack and hash routing
- Added hash-based routing: `#cards`, `#cards-{category}`, `#category-{name}`
- Added PageTitle bilingual heading using `strings.study.studyGuide`
- Added StaggeredList/StaggeredItem for category grid (1/2/3 col responsive)
- Added FlashcardStack for swipeable cards view with back navigation
- Added BilingualButton for "View All Flashcards" CTA
- Added `data-tour="study-guide"` for onboarding
- Preserved legacy flip-card grid with category filter below

### Task 2: TestPage with PreTestScreen, CircularTimer, and celebrations
- Added PreTestScreen as initial view (timer does not start until dismissed)
- Replaced text-based timer with CircularTimer (color thresholds, allowHide)
- Added AnswerFeedback with getAnswerOptionClasses (orange for wrong)
- Added 1500ms feedback delay before proceeding to next question
- Added Confetti + CountUpScore for test completion celebration
- Added BilingualHeading for results and BilingualButton for actions
- Answer buttons: `w-full min-h-[44px] py-3 px-4 space-y-1`
- Progress component replaces manual progress bar
- Added `data-tour="mock-test"` for onboarding

### Task 3: HistoryPage with staggered animations
- Added PageTitle bilingual heading using `strings.nav.testHistory`
- Added StaggeredList/StaggeredItem for test history entries
- Added FadeIn animation for overview stat cards (100ms stagger)
- Added Card with interactive prop for each history entry
- Added Progress bar per entry with success/warning variants
- Score displayed with success-500/warning-500 colors
- Empty state with encouraging bilingual message and BilingualButton to start test
- Added `data-tour="test-history"` for onboarding
- 44px minimum touch targets on review buttons

## Task Commits

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | StudyGuidePage FlashcardStack + hash routing | b4ad7a5 (via 03-08) | src/pages/StudyGuidePage.tsx |
| 2 | TestPage PreTestScreen + CircularTimer + celebrations | ce2f6bd | src/pages/TestPage.tsx |
| 3 | HistoryPage staggered animations | 87cb808 (via 03-09) | src/pages/HistoryPage.tsx |

## Decisions Made

| ID | Decision | Rationale |
|----|----------|-----------|
| 03-08a-01 | Used react-router-dom for hash routing | Project uses react-router-dom, not Next.js router (plan incorrectly specified next/router) |
| 03-08a-02 | 1500ms feedback delay before question advancement | Gives users time to read AnswerFeedback before auto-advancing |
| 03-08a-03 | warning-500 (orange) replaces red throughout | Design system mandate: soft orange for incorrect, not harsh red |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] React-router-dom instead of Next.js router**
- **Found during:** Task 1
- **Issue:** Plan specified Next.js Pages Router with `useRouter` from `next/router`, but the project uses react-router-dom with `useLocation`/`useNavigate`
- **Fix:** Used react-router-dom hooks throughout (consistent with existing codebase)
- **Files modified:** All three pages

**2. [Rule 1 - Bug] OneDrive filesystem interference with build**
- **Found during:** Task 3 commit
- **Issue:** OneDrive sync deletes `.next` build artifacts during "Collecting page data" step, causing build failures even though compilation succeeds
- **Fix:** Task 3 was committed as part of 03-09 commit since lint-staged stash/restore left changes in working tree; Task 1 was already committed by prior 03-08 plan execution
- **Impact:** Commit attribution split across 03-08, 03-08a, and 03-09 commit messages

## Verification Results

| Criterion | Status |
|-----------|--------|
| StudyGuidePage has hash routing | PASS (6 instances of hash-related code) |
| StudyGuidePage uses FlashcardStack | PASS (3 references) |
| TestPage uses CircularTimer | PASS (2 references) |
| TestPage uses PreTestScreen | PASS (2 references) |
| TestPage answer buttons min-h-[44px] | PASS |
| TestPage has Confetti + CountUpScore | PASS (5+2 references) |
| Wrong answers show orange (warning-500) | PASS |
| HistoryPage uses StaggeredList | PASS (5 references) |
| All pages have data-tour attributes | PASS |
| TypeScript compiles | PASS (tsc --noEmit clean) |

## Next Phase Readiness

All three core learning pages are now fully polished with Phase 3 components. No blockers for Phase 4.

## Self-Check: PASSED
