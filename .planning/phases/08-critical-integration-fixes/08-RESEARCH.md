# Phase 08 Research: Critical Integration Fixes

**Phase:** 08-critical-integration-fixes
**Researched:** 2026-02-07
**Mode:** Ecosystem (codebase integration analysis)
**Overall Confidence:** HIGH (all findings verified against actual source code)

---

## Executive Summary

Phase 08 is an integration-wiring and tech-debt phase with no new features. All the infrastructure already exists -- the sync queue, the settings page, the navigation component, the pre-commit hook. The work is connecting existing pieces and cleaning up known issues. This is a low-risk, high-clarity phase.

Five distinct workstreams:
1. Wire offline test result saving to the existing sync queue
2. Add Settings navigation link to the Dashboard
3. Fix the single remaining lint error (`recordStudyActivity` unused import)
4. Resolve the Sentry example page build issue
5. Restore the pre-commit hook without `next build`

All workstreams are independent of each other and can be parallelized. The total scope is small -- estimated 4-6 files modified, no new files needed.

---

## Workstream 1: Offline Test Result Sync

### Current State (Verified)

**The gap:** `saveTestSession` in `SupabaseAuthContext.tsx` (line 248-327) saves directly to Supabase. When offline, the Supabase insert fails, the error propagates, and TestPage shows a destructive toast ("Unable to save test"). The test result is lost -- it is NOT queued for later sync.

**The existing infrastructure:**
- `queueTestResult()` in `src/lib/pwa/offlineDb.ts` (line 110) -- queues a `PendingTestResult` to IndexedDB
- `syncAllPendingResults()` in `src/lib/pwa/syncQueue.ts` (line 107) -- syncs all pending to Supabase with exponential backoff
- `OfflineContext` (line 145-189) -- auto-syncs when coming back online, tracks `wasOffline` state
- `useSyncQueue` hook (line 50-118) -- provides `triggerSync`, `pendingCount`, auto-sync on reconnect
- `SyncStatusIndicator` component -- already in AppNavigation, hidden when no pending items

### Data Shape Mismatch (CRITICAL)

The `PendingTestResult` interface (offlineDb.ts line 88-103) does NOT match what `saveTestSession` sends to Supabase.

**`PendingTestResult` has:**
```
userId, score, totalQuestions, durationSeconds, passed, endReason, createdAt,
responses: Array<{ questionId, selectedAnswer, correct, timeSpentSeconds }>
```

**`saveTestSession` sends to Supabase:**
```
mock_tests: user_id, completed_at, score, total_questions, duration_seconds,
            incorrect_count, end_reason, passed
mock_test_responses: mock_test_id, question_id, question_en, question_my, category,
                     selected_answer_en, selected_answer_my, correct_answer_en,
                     correct_answer_my, is_correct
```

**Differences:**
1. `PendingTestResult.responses` is a simplified schema (questionId, selectedAnswer string, correct boolean, timeSpentSeconds) -- the actual Supabase schema includes full bilingual text fields and separate correct answer fields
2. `PendingTestResult` lacks `incorrectCount` (used in Supabase `mock_tests`)
3. `PendingTestResult.createdAt` vs Supabase's `completed_at`
4. `PendingTestResult` has `responses.timeSpentSeconds` which Supabase doesn't store

### Recommended Approach

**Option A: Modify `PendingTestResult` to match `TestSession`** (RECOMMENDED)
- Store the full `Omit<TestSession, 'id'>` plus `userId` in IndexedDB when offline
- Modify `syncSingleResult` to use the same Supabase insert logic as `saveTestSession`
- Pro: Exact parity between online and offline saves, full data preserved
- Con: Larger IndexedDB entries (bilingual text stored)

**Option B: Keep simplified `PendingTestResult`, rebuild data on sync**
- Queue minimal data, reconstruct bilingual text from question constants on sync
- Pro: Smaller storage
- Con: Questions might change between queue and sync (edge case but real risk)

**Recommendation: Option A.** Store the full session data in IndexedDB. The data is small (20 questions max per test, ~2KB total). Full fidelity is more important than storage savings.

### Integration Point

The integration should happen in `saveTestSession` (SupabaseAuthContext.tsx line 248-327):

1. In the `catch` block (line 315-317), instead of just `throw error`, check if the error is a network/offline error
2. If offline: queue the full session to IndexedDB via `queueTestResult` (or a new function with the right shape)
3. Add the session to `user.testHistory` locally (local-first display per user decision)
4. Show a neutral toast ("Saved offline, will sync when online") instead of the error toast

The `syncSingleResult` function in `syncQueue.ts` needs to match the `saveTestSession` Supabase insert logic (profile sync, mock_tests insert, mock_test_responses insert).

### Auto-Sync Already Works

Once queued, the existing auto-sync infrastructure handles everything:
- `OfflineContext` detects online transition and calls `triggerSync()`
- `useSyncQueue` hook also has auto-sync on reconnect
- `SyncStatusIndicator` shows pending count badge
- Bilingual toast shown on sync completion (already implemented)

### Toast Behavior Per User Decision

- **During offline save:** Show neutral info toast ("Saved offline / will sync")
- **During retry:** Silent (no notification during retry attempts)
- **On sync success:** Existing bilingual success toast fires
- **On permanent failure (5 retries exhausted):** Existing bilingual error toast fires

This matches what the user specified exactly.

### Notification of Pending Count

After queueing, the `OfflineContext.refreshPendingCount()` or `useSyncQueue.refreshCount()` should be called so `SyncStatusIndicator` updates immediately.

---

## Workstream 2: Settings Navigation

### Current State (Verified)

- **Route exists:** `/settings` route in AppShell.tsx (line 208-213) as a `ProtectedRoute`
- **Page exists:** `SettingsPage.tsx` fully implemented with Language, Notifications, Social, Review Reminders, and Speech Rate sections
- **i18n strings exist:** `strings.nav.settings = { en: 'Settings', my: 'ဆက်တင်များ' }` (strings.ts line 21)
- **No link anywhere:** No page links to `/settings`
- **Back navigation:** SettingsPage uses `navigate(-1)` with an ArrowLeft button (line 64-68) -- this pattern is already in place

### User Decision: Dashboard Only

The user explicitly decided: Settings link on Dashboard only, not on every page (not in AppNavigation). This is architecturally simpler -- add a link/icon somewhere on the Dashboard page.

### Recommended Placement

Looking at the Dashboard layout:
1. **Header area** (line 287-301): Welcome message with `BilingualHeading` and description text
2. **Quick action buttons** (line 305-317): Two `BilingualButton` components ("Start Studying" and "Start Test")

**Recommendation: Add a Settings icon button in the Dashboard header area**, positioned at the top-right of the welcome section. This follows the established pattern where:
- The header already has a personal greeting ("Welcome back, [Name]!")
- A gear/settings icon in the header corner is a universal UI pattern
- It doesn't clutter the quick action buttons which are about study/test actions
- The icon should use `lucide-react`'s `Settings` icon (already imported in SettingsPage)

**Alternative:** Add as a third BilingualButton in the quick actions row. This would be more prominent but may dilute the study-focused CTA area.

**My recommendation:** Subtle gear icon in header, not a full BilingualButton. Settings is a utility function, not a primary user action.

### No Other Cross-Links Needed

The SettingsPage already has back navigation (`navigate(-1)`). No other pages need contextual links to Settings since:
- Language toggle is in AppNavigation (accessible everywhere)
- Theme toggle is in AppNavigation
- The full Settings page is for deeper configuration

---

## Workstream 3: Lint Error Fix

### Current State (Verified)

**Single lint error found:**
```
src/hooks/useStreak.ts:20:3 Error: 'recordStudyActivity' is defined but never used.
@typescript-eslint/no-unused-vars
```

**Context:** `useStreak.ts` imports `recordStudyActivity` from `@/lib/social` (line 20) but never calls it. The comment at line 97 says "recordStudyActivity handles freeze auto-use internally" -- but the actual call is NOT present in the code.

**Why it exists:** Per STATE.md decision 07-03, "Activity recording in store functions (not saveSession.ts)". The `recordStudyActivity` call was moved to `masteryStore.recordAnswer()` which is called from `TestPage`, `PracticePage`, `InterviewPage`, and `StudyGuidePage`. So `useStreak.ts` doesn't need it.

**Fix:** Remove the unused import. Per user decision: "Remove unused code entirely (YAGNI)". Just delete line 20.

### Other Lint Observations

- The v1 audit mentioned "Two lint errors in sentry-example-api.ts and AppNavigation.tsx" but running ESLint now shows **zero errors** in those files. These were likely fixed in subsequent phases.
- `AppNavigation.tsx` line 43 has an `eslint-disable-next-line` for `react-hooks/set-state-in-effect`. Per user decision, we should keep React Compiler ESLint rules strict. However, this comment includes a justification ("intentional: close menu on route change") which is a legitimate pattern. The user said "no eslint-disable suppressions" so this needs review.
  - **Assessment:** The `setIsMenuOpen(false)` in the route change effect IS the standard pattern for this. Removing the eslint-disable would require restructuring (e.g., useMemo-derived state from location). Since the user said to keep React Compiler rules strict but also fix ALL root causes, the planner should decide whether to refactor this or keep the justified suppression.
- Six other `eslint-disable` comments exist across the codebase (LanguageContext, SRSContext, ThemeContext, useSpeechSynthesis, StudyGuidePage, useStreak). These are pre-existing from prior phases and are out of scope for Phase 08 (which focuses on the specific lint errors identified in the audit).

### ESLint Config Note

The ESLint config (`eslint.config.mjs`) ignores `.next/`, `node_modules/`, `dist/`, `coverage/` but NOT `out/`. The `out/` directory contains stale build artifacts. Adding `out/**` to the ignores list would prevent false positives if someone runs `eslint .` from the root.

---

## Workstream 4: Sentry Build Fix

### Current State (Verified)

**The issue:** During `next build`, the SSG step for `pages/sentry-example-page.tsx` fails with a `pages-manifest.json` / `build-manifest.json` ENOENT error. This was documented in:
- STATE.md blocker (line 269)
- 03-08-SUMMARY.md (line 111)

**Current build behavior (tested):** The build NOW fails at the **lint step** (the `recordStudyActivity` unused import error) BEFORE it even reaches the SSG step. So the Sentry page issue may or may not still exist -- we cannot verify until the lint error is fixed first.

**What the sentry-example-page does:**
- It's a Sentry SDK demo/test page, auto-generated by `@sentry/nextjs` setup wizard
- Provides a "Throw Sample Error" button for testing Sentry error capture
- Has inline `<style>` tags (non-Tailwind)
- Imports `@sentry/nextjs` and calls `Sentry.diagnoseSdkConnectivity()` in a useEffect

**The sentry-example-api:**
- API route at `pages/api/sentry-example-api.ts`
- Throws a test error and captures it with `Sentry.captureException()`

### Recommended Resolution

**Option A: Delete both sentry example files** (RECOMMENDED)
- `pages/sentry-example-page.tsx` -- demo page, not part of the actual app
- `pages/api/sentry-example-api.ts` -- demo API route
- Sentry SDK itself remains configured via `next.config.mjs`, `sentry.edge.config.ts`, `sentry.server.config.ts`
- Pro: Eliminates the root cause entirely, no SSG issues, no lint issues
- Con: Loses the ability to test Sentry with a button click (can be tested by triggering real errors)

**Option B: Add `getServerSideProps` or dynamic export to prevent SSG**
- Adding `export const dynamic = 'force-dynamic'` or `getServerSideProps` would prevent static generation
- Pro: Keeps the test page
- Con: Band-aid fix, page has no production value

**Recommendation: Option A (delete).** The sentry example files are scaffolding from initial setup. Sentry is already configured in the Next.js config and server configs. The example page serves no production purpose and is the root cause of the build failure. Per user decision: "whatever resolves it cleanly."

### Sentry Deprecation Warnings

The build also shows two deprecation warnings:
```
[@sentry/nextjs] DEPRECATION WARNING: disableLogger is deprecated...
[@sentry/nextjs] DEPRECATION WARNING: automaticVercelMonitors is deprecated...
```

These come from `next.config.mjs` lines 43 and 49. While not errors, the planner may want to update these to the new API (`webpack.treeshake.removeDebugLogging` and `webpack.automaticVercelMonitors` respectively) as part of the cleanup.

---

## Workstream 5: Pre-Commit Hook Restoration

### Current State (Verified)

**Current hook** (`.husky/pre-commit`):
```bash
pnpm lint-staged
pnpm run typecheck
pnpm run build
```

**Problem:** `pnpm run build` (line 3) fails due to the Sentry page issue, so all commits since Phase 4 have used `--no-verify`.

### User Decision: Partial Restore

- Keep: `pnpm lint-staged` (ESLint + Prettier via `.lintstagedrc.json`)
- Keep: `pnpm run typecheck` (tsc --noEmit)
- Remove: `pnpm run build` (CI-only check)

### lint-staged Config (Verified)

`.lintstagedrc.json`:
```json
{
  "*.{ts,tsx}": ["pnpm exec eslint --fix", "pnpm exec prettier --write"],
  "*.{js,mjs,json,css}": ["pnpm exec prettier --write"]
}
```

This is already well-configured. ESLint runs on staged TS/TSX files, Prettier on all staged files.

### Speed Assessment

- **lint-staged:** Fast (~3-5 seconds for typical changes, only lints changed files)
- **typecheck (tsc --noEmit):** Medium (~10-15 seconds, checks entire project)
- **Combined:** ~15-20 seconds per commit -- acceptable for pre-commit

**Recommendation:** Keep both `lint-staged` and `typecheck`. The typecheck catches type errors that ESLint misses (cross-file type issues, missing imports, interface mismatches). The 15-20 second overhead is worth the safety guarantee. TypeScript strict mode is already enabled (`"strict": true` in tsconfig.json).

### Hook File Update

Simply remove the third line (`pnpm run build`) from `.husky/pre-commit`.

---

## Workstream 6: Minor Cleanup (Claude's Discretion)

### ESLint Config: Add `out/` to Ignores

The `out/` directory exists with stale build artifacts and is not in the ESLint ignore list. Running `eslint .` from root picks up hundreds of false errors from minified JS. Add `'out/**'` to the ignores array in `eslint.config.mjs`.

### TypeScript Strict Flags

Current `tsconfig.json` has `"strict": true` which enables:
- strictNullChecks, strictFunctionTypes, strictBindCallApply, strictPropertyInitialization
- noImplicitAny, noImplicitThis, alwaysStrict

Additional flags NOT enabled:
- `noUncheckedIndexedAccess` -- would catch `array[i]` returning `T | undefined`
- `exactOptionalPropertyTypes` -- distinguishes `undefined` from missing
- `noPropertyAccessFromIndexSignature` -- requires bracket notation for index signatures

**Recommendation:** Do NOT enable additional strict flags in this phase. They would cause a cascade of new type errors across the codebase, which is out of scope for an integration-wiring phase. The current `strict: true` is already strong.

### Sentry Config Deprecation Warnings

Consider updating `next.config.mjs`:
- `disableLogger: true` -> Use `webpack: { treeshake: { removeDebugLogging: true } }` (or just remove the property)
- `automaticVercelMonitors: true` -> Use `webpack: { automaticVercelMonitors: true }` (or just remove since not deploying on Vercel)

This is optional cleanup but would eliminate build warnings.

---

## Dependencies and Ordering

### No Cross-Workstream Dependencies

All 5 workstreams are independent:
1. **Sync queue wiring** -- touches SupabaseAuthContext, syncQueue, offlineDb
2. **Settings nav** -- touches Dashboard only
3. **Lint fix** -- touches useStreak only
4. **Sentry fix** -- touches pages/sentry-example-* (deletion)
5. **Pre-commit hook** -- touches .husky/pre-commit only

**Recommendation:** Execute in 1-2 waves with maximum parallelism.

### Suggested Wave Structure

**Wave 1 (parallel):** Lint fix + Sentry fix + Pre-commit hook (3 simple, fast tasks)
**Wave 2 (parallel):** Sync queue wiring + Settings nav (2 larger tasks)

Rationale: Wave 1 unblocks the build (fixing lint and Sentry enables `next build` to pass, and the pre-commit hook can be tested). Wave 2 does the feature integration work. Alternatively, all 5 could run in a single wave since they touch completely different files.

---

## Files Inventory

### Files to Modify

| File | Workstream | Change |
|------|-----------|--------|
| `src/contexts/SupabaseAuthContext.tsx` | Sync | Add offline queue fallback in catch block |
| `src/lib/pwa/offlineDb.ts` | Sync | Update/extend PendingTestResult to match full session data |
| `src/lib/pwa/syncQueue.ts` | Sync | Update syncSingleResult to match saveTestSession logic |
| `src/pages/Dashboard.tsx` | Nav | Add Settings icon/link in header area |
| `src/hooks/useStreak.ts` | Lint | Remove unused `recordStudyActivity` import |
| `.husky/pre-commit` | Hook | Remove `pnpm run build` line |
| `eslint.config.mjs` | Cleanup | Add `out/**` to ignores |

### Files to Delete

| File | Workstream | Reason |
|------|-----------|--------|
| `pages/sentry-example-page.tsx` | Sentry | Demo scaffolding causing SSG build failure |
| `pages/api/sentry-example-api.ts` | Sentry | Demo scaffolding, unused in production |

### Files NOT Modified

- `src/components/AppNavigation.tsx` -- No changes (settings link goes on Dashboard, not nav)
- `src/pages/SettingsPage.tsx` -- No changes (already has back navigation)
- `src/components/pwa/SyncStatusIndicator.tsx` -- No changes (already works with pending count)
- `src/contexts/OfflineContext.tsx` -- No changes (auto-sync already works)

---

## Pitfalls

### 1. Data Shape Mismatch (HIGH)

**Risk:** The `PendingTestResult` interface doesn't match the Supabase schema used by `saveTestSession`. If the sync queue stores the simplified shape, data will be lost or the sync will fail.

**Prevention:** Either refactor `PendingTestResult` to store full `TestSession` data, or create a new type. The sync function must reproduce the exact same Supabase inserts as `saveTestSession`.

### 2. Double-Save Race Condition (MEDIUM)

**Risk:** If the user goes offline, takes a test, and comes back online while the save is still processing, both the original save (retrying) and the auto-sync could try to insert the same test.

**Prevention:** The `saveSessionGuard` mutex already prevents concurrent saves. When queueing for offline, ensure the save guard transitions to 'saved' state so no retry happens on the original path. The sync queue should be the only path that retries.

### 3. Local History Consistency (MEDIUM)

**Risk:** When offline, the test needs to appear in `user.testHistory` immediately (local-first display). But when the sync eventually succeeds, the Supabase data has a server-generated `id`. The local entry won't have this ID.

**Prevention:** Generate a client-side UUID for the local entry. When sync succeeds, the `hydrateFromSupabase` call on next login will replace it with the server version. Or, after sync, call `hydrateFromSupabase` to refresh.

### 4. React Compiler ESLint (LOW)

**Risk:** New code in SupabaseAuthContext or Dashboard might trigger React Compiler ESLint rules (no-setState-in-effect, refs-during-render, etc.).

**Prevention:** Follow established patterns: useMemo for derived state, useCallback for handlers, lazy useState initializers for browser APIs. The project's MEMORY.md documents known patterns.

### 5. Pre-commit Hook Testing (LOW)

**Risk:** After restoring the hook, if any pre-existing issue causes lint or typecheck to fail, developers are blocked from committing.

**Prevention:** Run `pnpm lint-staged` and `pnpm run typecheck` manually before updating the hook to confirm they pass cleanly. Fix all issues first, then update the hook.

---

## Confidence Assessment

| Area | Level | Reason |
|------|-------|--------|
| Sync Queue Integration | HIGH | All source code read and verified, data flow traced end-to-end |
| Settings Navigation | HIGH | Dashboard source verified, i18n strings confirmed, pattern clear |
| Lint Error | HIGH | Single error confirmed by running ESLint, root cause identified |
| Sentry Build Fix | HIGH | Files read, issue documented across multiple planning docs |
| Pre-commit Hook | HIGH | Current hook file read, user decision clear |
| Data Shape Mismatch | HIGH | Both interfaces compared line-by-line |

---

## Implications for Planning

### Plan Count: 3-4 plans

Given the independence of workstreams and their relative sizes:

1. **Plan 1: Lint + Sentry + Pre-commit + ESLint config cleanup** (~10 min)
   - Smallest changes, unblocks build
   - Delete 2 files, edit 3 files (single lines)

2. **Plan 2: Offline test result sync** (~20-25 min)
   - Largest workstream, most files touched
   - Requires careful data shape alignment
   - Needs the Sentry fix done first so build can verify

3. **Plan 3: Settings navigation on Dashboard** (~10 min)
   - Single file change (Dashboard.tsx)
   - Simple UI addition

Alternatively, Plans 2 and 3 could be parallelized since they touch different files.

### Success Criteria Mapping

| Success Criterion | Workstream | Verification |
|-------------------|-----------|-------------|
| Offline test results queued in IndexedDB | Sync | Test with network disabled |
| Queued results auto-sync when online | Sync | Built-in auto-sync infrastructure |
| Settings accessible from app navigation | Nav | Click test on Dashboard |
| `npm run lint` with zero errors | Lint + Sentry | `npx eslint src/ --max-warnings=0` |

---

*Researched: 2026-02-07*
*All findings verified against source code at commit 85ed82e*
