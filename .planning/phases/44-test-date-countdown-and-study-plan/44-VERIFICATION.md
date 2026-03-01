---
phase: 44-test-date-countdown-and-study-plan
verified: 2026-03-01T03:20:00Z
status: passed
score: 14/14 must-haves verified
re_verification: false
---

# Phase 44: Test Date Countdown and Study Plan Verification Report

**Phase Goal:** Users with a scheduled USCIS interview see a countdown and know exactly what to study today
**Verified:** 2026-03-01T03:20:00Z
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User can set their USCIS test date in Settings and it persists across sessions | VERIFIED | `SettingsPage.tsx` imports `useTestDate`, renders a "Test Preparation" section with `<input type="date">` wired to `setTestDate`. `useTestDate.ts` writes to `localStorage` under `civic-prep-test-date` key with SSR-safe lazy initializer. |
| 2 | Dashboard shows countdown with days remaining when test date is set | VERIFIED | `Dashboard.tsx` calls `useStudyPlan()`, passes `daysRemaining` and `paceStatus` props to `TestDateCountdownCard`. Card renders a two-state view: "Set Your Test Date" prompt when null, countdown with CountUp animation when set. |
| 3 | Progress Hub shows days remaining in header area | VERIFIED | `HubPage.tsx` imports `useTestDate`, computes `daysLeft` with UTC date math, conditionally renders a colored urgency badge in the header. Only visible when `daysLeft > 0`. |
| 4 | Dashboard shows "Today's Plan" card with SRS count, new question target, and mock test recommendation | VERIFIED | `StudyPlanCard.tsx` receives `DailyPlan` prop and renders `srsReviewCount`, `newQuestionTarget`, `drillRecommendation`, and `mockTestRecommended` as tappable activity rows. Estimated time badge shown in header. |
| 5 | Daily targets recalculate from live data (no hardcoded values) | VERIFIED | `useStudyPlan.ts` uses `useMemo` depending on `isLoading`, `readiness`, `srsDueCount`, `categoryMasteries`, `overallMastery`, `user?.testHistory`, `uniqueQuestionsCount`, and `testDate`. Recalculates on every data change. No hardcoded targets. |
| 6 | Countdown uses urgency gradient: green (>21 days), amber (8-21 days), red (<=7 days) | VERIFIED | `TestDateCountdownCard.tsx` defines `getUrgencyGradient(daysRemaining)` returning three distinct gradient sets. Applied to card background. Hub uses matching urgency color classes. |
| 7 | Countdown shows pace indicator (On Track / Behind / Ahead) | VERIFIED | `TestDateCountdownCard.tsx` renders `PACE_CONFIG[paceStatus]` badge with icon, English label, and Burmese label. Engine computes paceStatus via readiness fraction vs time fraction comparison. |
| 8 | After test date passes, user sees "How did your test go?" prompt | VERIFIED | `PostTestPrompt.tsx` is a full modal with Pass/Reschedule buttons. `Dashboard.tsx` opens it when `daysRemaining <= 0 && postTestAction === 'pending'`. |
| 9 | computeStudyPlan pure function handles all edge cases and passes 27 tests | VERIFIED | 27/27 unit tests pass (`pnpm vitest run src/lib/studyPlan/studyPlanEngine.test.ts`). Covers: SRS cap at 20, new question distribution and caps (3 min, 15 max), no-date mode, edge cases (today, past, 0 days), pace status, estimated minutes. |
| 10 | useTestDate reads/writes localStorage under `civic-prep-test-date` key | VERIFIED | `TEST_DATE_KEY = 'civic-prep-test-date'` on line 20 of `useTestDate.ts`. Both read (`localStorage.getItem`) and write (`localStorage.setItem` / `localStorage.removeItem`) are implemented. SSR guard (`typeof window === 'undefined'`) present. |
| 11 | useStudyPlan composes hooks and feeds into computeStudyPlan via useMemo | VERIFIED | `useStudyPlan.ts` imports and calls `useTestDate`, `useReadinessScore`, `useSRSWidget`, `useCategoryMastery`, `useAuth`, and `getAnswerHistory`. All assembled into `computeStudyPlan` call inside `useMemo`. |
| 12 | NBA engine becomes test-date-aware (prevents celebration states when test within 7 days) | VERIFIED | `determineNBA.ts` computes `isTestImminent` (daysRemaining > 0 && <= 7). Two guards at lines 234 and 251 override `isCelebration` state with drill/SRS/practice advice. Also covers default celebration at line 301. |
| 13 | All UI text is bilingual (English + Burmese) | VERIFIED | All three new card components conditionally render `font-myanmar` Burmese text under `showBurmese` prop. Pace badge, activity rows, modal buttons, and headers all include Burmese equivalents. |
| 14 | TypeScript compiles without errors | VERIFIED | `pnpm tsc --noEmit` exited with no output (zero errors). |

**Score:** 14/14 truths verified

---

## Required Artifacts

### Plan 01 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/studyPlan/studyPlanTypes.ts` | StudyPlanInput, DailyPlan, PaceStatus types | VERIFIED | Exports all three types. Matches plan spec exactly. |
| `src/lib/studyPlan/studyPlanEngine.ts` | Pure computeStudyPlan function | VERIFIED | 171 lines. Exports `computeStudyPlan`. Zero React imports. Injectable `now` parameter. |
| `src/lib/studyPlan/studyPlanEngine.test.ts` | Unit tests (min 80 lines) | VERIFIED | 358 lines. 27 tests across 7 describe blocks. All pass. |
| `src/lib/studyPlan/index.ts` | Barrel export for module | VERIFIED | Re-exports `computeStudyPlan`, `StudyPlanInput`, `DailyPlan`, `PaceStatus`. |
| `src/hooks/useTestDate.ts` | localStorage hook for test date | VERIFIED | SSR-safe lazy initializer. Writes to `civic-prep-test-date`. Returns `{ testDate, setTestDate, postTestAction, setPostTestAction }`. |
| `src/hooks/useStudyPlan.ts` | Composition hook, 6 data sources | VERIFIED | Aggregates 6 data sources (useTestDate, useReadinessScore, useSRSWidget, useCategoryMastery, useAuth, IndexedDB). Passes to `computeStudyPlan` via `useMemo`. |

### Plan 02 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/dashboard/TestDateCountdownCard.tsx` | Countdown card with urgency gradient, date picker, pace indicator | VERIFIED | Two-state component. State 1: "Set Your Test Date" with `<input type="date">`. State 2: CountUp animation, urgency gradient, readiness %, pace badge. |
| `src/components/dashboard/StudyPlanCard.tsx` | "Today's Plan" with activity rows | VERIFIED | Renders SRS, new questions, drill, mock test as tappable rows. Estimated time badge. "You're all caught up!" empty state. |
| `src/components/dashboard/PostTestPrompt.tsx` | Post-test modal | VERIFIED | AnimatePresence modal with Pass (green/Trophy) and Reschedule (amber/Calendar) buttons. Dismiss link included. |
| `src/views/Dashboard.tsx` | Dashboard integration | VERIFIED | Imports and calls `useStudyPlan`. Renders `TestDateCountdownCard`, `StudyPlanCard`, and `PostTestPrompt`. Adds `studyPlanLoading` to loading gate. |
| `src/views/SettingsPage.tsx` | "Test Preparation" section with date row | VERIFIED | Imports `useTestDate`. Renders new `SettingsSection` with `SettingsRow` containing `<input type="date">` wired to `setTestDate`. |
| `src/views/HubPage.tsx` | Hub header countdown badge | VERIFIED | Imports `useTestDate`. Computes `daysLeft` with UTC math inline. Renders urgency-colored badge only when `daysLeft > 0`. |
| `src/lib/nba/nbaTypes.ts` | `testDate` field added to NBAInput | VERIFIED | Line 134: `testDate?: string | null;` added to `NBAInput` interface. |
| `src/lib/nba/determineNBA.ts` | Test-date-aware NBA logic | VERIFIED | `isTestImminent` flag computed at lines 225-226. Overrides celebration states at lines 234, 251, and 301 with actionable advice. |

---

## Key Link Verification

### Plan 01 Key Links

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `studyPlanEngine.ts` | `studyPlanTypes.ts` | imports StudyPlanInput, DailyPlan types | WIRED | Line 17: `import type { StudyPlanInput, DailyPlan, PaceStatus } from './studyPlanTypes'` |
| `useStudyPlan.ts` | `studyPlanEngine.ts` | calls computeStudyPlan in useMemo | WIRED | Lines 30, 158: imports and calls `computeStudyPlan` inside `useMemo` |
| `useStudyPlan.ts` | `useTestDate.ts` | reads testDate from useTestDate | WIRED | Line 21, 79: imports and destructures `{ testDate, setTestDate, postTestAction, setPostTestAction }` |
| `useStudyPlan.ts` | `useReadinessScore.ts` | reads readiness score | WIRED | Line 22, 84: imports and destructures `{ readiness, isLoading: readinessLoading }` |

### Plan 02 Key Links

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `TestDateCountdownCard.tsx` | `useStudyPlan.ts` (via props) | receives daysRemaining and paceStatus | WIRED | Props `daysRemaining` and `paceStatus` both used in render. Supplied by Dashboard from `useStudyPlan` output. |
| `StudyPlanCard.tsx` | `useStudyPlan.ts` (via props) | receives srsReviewCount, newQuestionTarget, drillRecommendation | WIRED | All three fields destructured from `dailyPlan` prop on line 87-93 and rendered. |
| `Dashboard.tsx` | `useStudyPlan.ts` | calls useStudyPlan and passes results | WIRED | Line 18 import, lines 73-80 destructuring, lines 289-303 pass to card components. |
| `SettingsPage.tsx` | `useTestDate.ts` | imports useTestDate for date row | WIRED | Line 36 import, line 204 call, line 402 `value={testDate ?? ''}` and onChange `setTestDate`. |
| `determineNBA.ts` | `nbaTypes.ts` | reads testDate from extended NBAInput | WIRED | `NBAInput.testDate` field consumed at lines 222-226 in determineNBA. |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| RDNS-07 | 44-01, 44-02 | User can set test date in Settings | SATISFIED | `SettingsPage.tsx` has "Test Preparation" section with USCIS Test Date row and native date picker wired to `useTestDate`. Date persists via localStorage. |
| RDNS-08 | 44-02 | Countdown display shows days remaining on Dashboard and Progress Hub | SATISFIED | `TestDateCountdownCard` on Dashboard renders countdown with CountUp animation. `HubPage.tsx` renders urgency badge in header. Both use UTC date math. |
| RDNS-09 | 44-01, 44-02 | Daily study targets card on Dashboard (SRS + new questions + mock test) | SATISFIED | `StudyPlanCard` renders all three activity types (SRS, new questions, mock test) plus drill recommendation. Each row tappable with navigation. |
| RDNS-10 | 44-01 | Daily targets adapt dynamically when user misses or studies ahead | SATISFIED | `computeStudyPlan` uses `ceil(unpracticedCount / daysRemaining)` for distribution — automatically recalculates on every render based on current state. No hardcoded schedule. `useStudyPlan` depends on live data via `useMemo`. |

All 4 requirements satisfied. No orphaned requirements found.

---

## Anti-Patterns Found

None detected. Scanned all 9 files modified/created in phase 44 for:
- TODO/FIXME/HACK/placeholder comments: none found
- Empty implementations (return null / return {} / return []): none found
- Stub handlers (onClick only console.log / onSubmit only preventDefault): none found
- API routes returning static data: not applicable (no new routes)

---

## Human Verification Required

### 1. Urgency gradient visual appearance

**Test:** Set a test date 3 days from now. Check Dashboard countdown card background.
**Expected:** Card background shows red gradient tones (from-red-500/5 to-red-500/10).
**Why human:** CSS gradient application cannot be verified programmatically from source.

### 2. CountUp animation plays on load

**Test:** Set a test date with 30 days remaining. Navigate to Dashboard.
**Expected:** The days number animates counting up from 0 to 30 on first render (when `shouldReduceMotion` is false).
**Why human:** Animation playback requires a real browser with motion enabled.

### 3. Native date picker opens on countdown card tap

**Test:** With a test date set, tap anywhere on the countdown card.
**Expected:** The device's native date picker opens, allowing the date to be changed.
**Why human:** `showPicker()` browser API behavior cannot be verified from source.

### 4. Post-test prompt appears after test date passes

**Test:** Set a test date in the past (or today). Navigate to Dashboard.
**Expected:** "How did your test go?" modal appears.
**Why human:** Requires runtime rendering with `postTestAction === 'pending'` state.

### 5. Study plan card navigation routes

**Test:** Tap each activity row in the StudyPlanCard (SRS reviews, new questions, drill, mock test).
**Expected:** Each row navigates to `/study#deck`, `/practice`, `/drill`, `/test` respectively.
**Why human:** `router.push()` navigation requires a running Next.js app.

### 6. Burmese text renders correctly

**Test:** Enable Burmese display in Settings. View Dashboard countdown card and study plan card.
**Expected:** Myanmar Unicode text renders in readable Burmese script using the Myanmar font.
**Why human:** Font rendering requires a real browser; Unicode escapes in source cannot be visually confirmed.

---

## Gaps Summary

No gaps. All automated checks passed. Phase goal is fully achieved.

The study plan engine (`computeStudyPlan`) is a pure function with 27 passing unit tests. The `useTestDate` hook correctly persists to localStorage under `civic-prep-test-date`. The `useStudyPlan` hook composes 6 data sources via `useMemo`. All three UI cards are substantive and fully wired into Dashboard. Settings and Progress Hub both surface test date functionality. NBA engine actively prevents celebration states when test is imminent. TypeScript compiles clean.

---

_Verified: 2026-03-01T03:20:00Z_
_Verifier: Claude (gsd-verifier)_
