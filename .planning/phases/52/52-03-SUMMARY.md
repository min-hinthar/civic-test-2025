---
phase: 52-e2e-critical-flows-accessibility
plan: 03
subsystem: testing
tags: [playwright, e2e, offline-sync, interview, sw-update, session-lock, flashcard-sort]

# Dependency graph
requires:
  - phase: 52-01
    provides: E2E fixtures (authedPage, makeAxeBuilder), Playwright config with chromium-sw project
  - phase: 50
    provides: swUpdateManager session-lock deferral, settings LWW merge
provides:
  - 4 E2E critical flow tests (flashcard sort, offline sync, interview, SW update)
  - Full 7-test E2E safety net for all critical user flows
affects: [52-04-axe-wcag-audit, 53-interview-decomposition]

# Tech tracking
tech-stack:
  added: []
  patterns: [button-click-sort-e2e, offline-network-simulation, text-input-interview-e2e, sw-mock-evaluate, session-lock-deferral-e2e]

key-files:
  created:
    - e2e/flashcard-sort.spec.ts
    - e2e/offline-sync.spec.ts
    - e2e/interview.spec.ts
    - e2e/sw-update.spec.ts
  modified: []

decisions:
  - Flashcard sort uses button clicks not drag per precontext Decision 8
  - Interview uses TextAnswerInput fallback since speech APIs not mockable in Playwright
  - SW update test runs under chromium-sw project with serviceWorkers allow
  - Offline sync tests use context.setOffline for network simulation

metrics:
  duration: 5min
  completed: "2026-03-21"
  tasks_completed: 2
  tasks_total: 2
  files_created: 4
  files_modified: 0
---

# Phase 52 Plan 03: E2E Offline, Interview, SW Update Summary

4 E2E tests completing the 7-test critical flow safety net: flashcard sort with Know/Don't Know buttons, offline-to-online sync with settings LWW merge, Practice interview with text input and keyword feedback, and SW update with session-lock deferral validation.

## What Was Done

### Task 1: Flashcard Sort + Offline Sync E2E Tests

**flashcard-sort.spec.ts (TEST-06):**
- Sorts cards using Know/Don't Know button clicks (not drag per precontext Decision 8)
- Continues sorting until round summary or mastery screen appears
- Verifies results display with known count/percentage and Finish button
- Separate test verifies card content rendering (question text via aria-label)

**offline-sync.spec.ts (TEST-07):**
- Answers questions while online, goes offline via `context.setOffline(true)`, answers more offline
- Reconnects and verifies app remains functional after offline/online transition
- Settings LWW merge test: changes language setting offline, reconnects, verifies persistence per D-03
- Uses `waitForRequest` to catch sync requests on reconnection

### Task 2: Interview Session + SW Update E2E Tests

**interview.spec.ts (TEST-08):**
- Selects Practice mode (not Real, per D-05 -- Practice has more UI surface)
- Uses TextAnswerInput text fallback (mic permission not granted in Playwright)
- Types answers and submits via Send button, verifies session progression
- Keyword feedback test: types partial answer, verifies feedback content appears

**sw-update.spec.ts (TEST-09):**
- Runs under `chromium-sw` project (serviceWorkers: 'allow') for navigator.serviceWorker access
- Mocks SW registration via page.evaluate() with updatefound + controllerchange events
- Test 1: No active session -- verifies update toast/notification appears
- Test 2 (D-08 KEY test): Active mock test session -- verifies update toast does NOT appear during locked session

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Button clicks for sort E2E | Playwright dragTo() is flaky on motion/react transforms (precontext Decision 8) |
| TextAnswerInput for interview E2E | Speech recognition APIs not mockable in Playwright (precontext Decision 7) |
| SW mock via page.evaluate() | Direct DOM manipulation required; no real SW versioning needed |
| Practice mode for interview test | More UI surface (keyword feedback, colored progress) than Real mode (D-05) |

## Deviations from Plan

None -- plan executed exactly as written.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | fa3e68d | Flashcard sort + offline sync E2E tests |
| 2 | 9aa18e8 | Interview session + SW update E2E tests |

## Known Stubs

None -- all 4 test files are complete implementations using shared fixtures.

## Self-Check: PASSED

- All 4 created files verified on disk
- Both commit hashes (fa3e68d, 9aa18e8) verified in git log
