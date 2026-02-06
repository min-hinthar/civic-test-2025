# Codebase Concerns

**Analysis Date:** 2026-02-05

## Tech Debt

**Insecure Shuffle Algorithm:**
- Issue: Question shuffling uses biased `Math.random() - 0.5` sort comparator instead of Fisher-Yates
- Files: `src/pages/TestPage.tsx` (line 18)
- Impact: Questions may not be uniformly distributed; some orderings are more likely than others. Affects test integrity and fairness.
- Fix approach: Replace with Fisher-Yates shuffle algorithm or use crypto-secure randomization for test question ordering

**Loose Type Safety:**
- Issue: Multiple `any` type declarations bypass TypeScript validation
- Files: `src/contexts/SupabaseAuthContext.tsx` (lines 29, 30, 189)
- Impact: Type mismatches in database response mapping could cause runtime errors; user metadata parsing lacks type safety
- Fix approach: Create proper TypeScript interfaces for Supabase response shapes and user metadata structure

**Large Monolithic Questions File:**
- Issue: All 1691 lines of civics questions hardcoded in single constant file
- Files: `src/constants/civicsQuestions.ts`
- Impact: Difficult to maintain, update, or paginate; no separation between data and presentation logic
- Fix approach: Move questions to database or separate structured data files; implement lazy-loading for study guide

**Session Data Duplication:**
- Issue: Test session data stored in both local React state and Supabase, with potential sync issues
- Files: `src/contexts/SupabaseAuthContext.tsx` (lines 282-283), `src/pages/TestPage.tsx` (lines 142-177)
- Impact: Inconsistent state if save fails but component updates; no retry mechanism for failed saves
- Fix approach: Implement optimistic updates with rollback; add retry queue for failed database operations

## Known Bugs

**Question Answer Shuffle Side Effect:**
- Symptoms: Same question appears with different answer option layouts across retakes
- Files: `src/pages/TestPage.tsx` (lines 32-41)
- Trigger: Every test page load, both `shuffle(civicsQuestions)` and `shuffle(question.answers)` are called
- Risk: No reproducibility for learners wanting to review specific question variations; affects test consistency
- Workaround: None - users must accept randomized layouts

**Unhandled Navigation Prevention Edge Case:**
- Symptoms: History.pushState spam creates memory leak during long test sessions
- Files: `src/pages/TestPage.tsx` (lines 125-135)
- Trigger: Every popstate event calls `window.history.pushState()` again, creating recursive listeners
- Risk: Browser history stack grows unbounded; poor performance on long tests
- Fix approach: Use single history state with flag instead of pushing on every popstate

**Race Condition in Test Save:**
- Symptoms: Test results may save twice if network latency causes double-submission
- Files: `src/pages/TestPage.tsx` (lines 142-177), `src/contexts/SupabaseAuthContext.tsx` (lines 227-292)
- Trigger: Effect dependency array includes `results`, `saveTestSession`, and other state that changes frequently
- Risk: Duplicate test records in database; inflated statistics
- Fix approach: Use ref to track save state; prevent re-running effect if save already initiated

## Security Considerations

**Unvalidated Google Credential Handling:**
- Risk: Credential token from Google One Tap passed directly to Supabase without validation
- Files: `src/components/GoogleOneTapSignIn.tsx` (lines 19-38), `src/contexts/SupabaseAuthContext.tsx` (lines 173-198)
- Current mitigation: Supabase handles token validation server-side
- Recommendations: Verify token expiration before passing; add nonce validation; log token exchange attempts

**Insufficient Error Details in User Feedback:**
- Risk: Console.error logs raw error objects without sanitization; could expose internal DB schema or stack traces
- Files: `src/pages/TestPage.tsx` (line 167), `src/contexts/SupabaseAuthContext.tsx` (line 285), `src/components/GoogleOneTapSignIn.tsx` (line 29)
- Current mitigation: Only logged to console (not user-facing)
- Recommendations: Implement error boundary; sanitize error messages before logging; track errors via Sentry without exposing to users

**Window Global Direct Access:**
- Risk: Multiple direct window object accesses without nullish coalescing for SSR safety
- Files: `src/components/GoogleOneTapSignIn.tsx` (lines 46, 57, 76, 86, 109), `src/contexts/ThemeContext.tsx`, `src/lib/useSpeechSynthesis.ts`, `src/lib/useViewportHeight.ts`
- Current mitigation: Component marked with 'use client'; AppShell renders only after hydration
- Recommendations: Consistent use of `typeof window !== 'undefined'` checks; extract window usage to custom hooks

**Missing CSRF Protection on Sensitive Actions:**
- Risk: Password reset and password update endpoints lack CSRF token validation
- Files: `src/contexts/SupabaseAuthContext.tsx` (lines 200-220), `src/pages/PasswordResetPage.tsx`, `src/pages/PasswordUpdatePage.tsx`
- Current mitigation: Supabase auth handles CSRF server-side
- Recommendations: Verify Supabase request signature validation; implement request deduplication on client

## Performance Bottlenecks

**Synchronous Test Result Mapping:**
- Problem: Large test response objects mapped during hydration without pagination
- Files: `src/contexts/SupabaseAuthContext.tsx` (lines 85-118)
- Cause: All historical test results fetched and mapped on auth state change; nested join on mock_test_responses
- Impact: Dashboard load time scales with number of past tests; poor performance after 100+ attempts
- Improvement path: Implement pagination in dashboard; lazy-load test history; cache history in localStorage

**Inefficient Category Breakdown Calculation:**
- Problem: Dashboard recalculates category stats from all test results on every render
- Files: `src/pages/Dashboard.tsx` (lines 26-38)
- Cause: No memoization of computed category breakdown
- Impact: O(n*m) complexity where n=tests, m=results per test
- Improvement path: Memoize category breakdown calculation; consider pre-computing on backend

**Speech Synthesis Voice Initialization Retry Loop:**
- Problem: 8 retries with 250ms intervals (2 seconds total) block voice functionality startup
- Files: `src/lib/useSpeechSynthesis.ts` (lines 4, 40-46)
- Cause: Browser voice API loads asynchronously; no timeout after max retries
- Impact: Delayed speech button availability on slow devices; memory leak if component unmounts during retry
- Improvement path: Reduce retries to 3; implement exponential backoff; defer voice initialization to first use

**Questions Constant File Loading at Module Level:**
- Problem: All 1691 lines of question data parsed and kept in memory even if user never takes test
- Files: `src/constants/civicsQuestions.ts`
- Cause: Imported in TestPage and StudyGuidePage without code-splitting
- Impact: Larger initial bundle; slower app startup
- Improvement path: Lazy-load questions via dynamic import; serve from API with client-side caching

## Fragile Areas

**SupabaseAuthContext - Complex State Synchronization:**
- Files: `src/contexts/SupabaseAuthContext.tsx`
- Why fragile: Manages user state, auth flow, session hydration, and test persistence. Multiple useCallbacks depend on each other; listener subscription relies on effect cleanup. Easy to introduce race conditions when modifying callbacks.
- Safe modification: Add integration tests for auth state transitions; use strict mode to catch effects running twice; test listener cleanup on unmount
- Test coverage: No unit tests for mapResponses function; no tests for concurrent auth state changes

**TestPage - Complex Timing and State Logic:**
- Files: `src/pages/TestPage.tsx`
- Why fragile: Timer, progress tracking, answer handling, and test completion all interdependent. Multiple effects manage timer, history, and data persistence. Quiz end-state logic depends on result count triggers. Changes to one effect can break others.
- Safe modification: Extract timer logic to custom hook; separate test completion logic; add E2E tests for edge cases (timeout, rapid answers, navigation)
- Test coverage: No tests for timer countdown; no tests for pass/fail threshold logic; no tests for back button prevention

**AppNavigation Lock Mechanism:**
- Files: `src/components/AppNavigation.tsx`
- Why fragile: Locked navigation state prevents access to all routes except `/test` during active test. Relies on toast notification for user feedback. Poor UX if user dismisses toast and retries navigation.
- Safe modification: Add clear visual indicator (e.g., disabled state overlay); implement modal confirmation instead of toast; test with keyboard navigation
- Test coverage: No tests for locked state behavior; no tests for accessibility with disabled state

**GoogleOneTapSignIn - External Script Dependency:**
- Files: `src/components/GoogleOneTapSignIn.tsx`
- Why fragile: Depends on external Google script loading; fallback OAuth flow duplicates auth logic. Multiple state flags (scriptLoaded, gsiReady, buttonRendered, dismissed) must coordinate. Easy to miss states during refactoring.
- Safe modification: Extract Google initialization to custom hook; centralize fallback logic; add retry on script load failure
- Test coverage: No tests for script load failure; no tests for fallback OAuth flow; no tests for rapid button clicks

## Scaling Limits

**Database Queries for Test History:**
- Current capacity: Handles ~1000 historical test records per user with nested joins to responses table
- Limit: When user has >5000 test attempts, dashboard hydration becomes slow (aggregate function on 100K+ response rows)
- Scaling path: Implement pagination API; denormalize test stats to profiles table; cache dashboard data in Redis

**Questions in Memory:**
- Current capacity: 1691 questions (all civics) fit in memory
- Limit: If expanded to 5000+ questions or multi-language variants, bundle size and parse time become problematic
- Scaling path: Server-side question storage; implement question preview API; paginated question fetches

**Real-time Test Session Updates:**
- Current capacity: Supabase realtime subscription for single user session
- Limit: Not suitable for multi-user concurrent test monitoring or live leaderboards
- Scaling path: Migrate to dedicated WebSocket server; implement message queuing for session events

## Dependencies at Risk

**react-router-dom in Next.js:**
- Risk: Using react-router-dom inside Next.js app router architecture is unconventional; potential conflicts with page-level routing
- Impact: Navigation may conflict with Next.js prefetching; dynamic imports may not work as expected; future React Router versions may drop Next.js support
- Migration plan: Migrate to Next.js native `useRouter` from 'next/navigation'; rewrite routing structure to match file-based convention

**Sentry integration partially incomplete:**
- Risk: Sentry config files exist (`sentry.server.config.ts`, `sentry.edge.config.ts`) but not fully integrated into error handling
- Impact: Many errors caught in try-catch blocks never reported to Sentry; exception tracking is sparse
- Migration plan: Wire error boundaries to Sentry; add middleware to capture server-side errors; implement captureException in all catch blocks

## Missing Critical Features

**No Offline Support:**
- Problem: App requires network connection to load questions and save progress; no service worker or offline queue
- Blocks: Mobile users with spotty connectivity; international users with high-latency networks
- Recommendation: Add service worker for question caching; implement offline test mode with local save queue

**No Test Feedback Explanations:**
- Problem: Results show correct/incorrect but lack study materials or explanations
- Blocks: Learners can't understand why their answer was wrong; reduces learning effectiveness
- Recommendation: Add explanation field to questions; link to study materials after test completion

**No Test Difficulty Adjustment:**
- Problem: All tests draw 20 random questions; no adaptive difficulty based on performance
- Blocks: Advanced learners get too many easy questions; struggling learners can't focus on weak areas
- Recommendation: Implement spaced repetition; track weak categories; offer category-focused tests

## Test Coverage Gaps

**SupabaseAuthContext mapResponses function:**
- What's not tested: Response data transformation from DB schema to app types; null/undefined handling; data integrity after mapping
- Files: `src/contexts/SupabaseAuthContext.tsx` (lines 29-67)
- Risk: Database schema changes could silently produce incorrect data without test failures
- Priority: High

**TestPage timer and completion logic:**
- What's not tested: Countdown accuracy; pass/fail threshold detection; end reason assignment under edge cases (timeout, rapid answers)
- Files: `src/pages/TestPage.tsx` (lines 103-177)
- Risk: Test ending prematurely or incorrectly due to timer bugs; users may not realize they failed/passed
- Priority: High

**Question shuffle randomness:**
- What's not tested: Distribution of shuffled orderings; bias detection; reproducibility of sort order
- Files: `src/pages/TestPage.tsx` (lines 17-19, 32-41)
- Risk: Non-uniform distribution affects fairness; some learners may get easier question orderings
- Priority: Medium

**GoogleOneTapSignIn initialization:**
- What's not tested: Script load failure handling; missing GOOGLE_CLIENT_ID fallback; gsi state coordination
- Files: `src/components/GoogleOneTapSignIn.tsx`
- Risk: Silent failures when Google script unavailable; no clear error feedback to user
- Priority: Medium

**Auth state persistence and hydration:**
- What's not tested: Listener cleanup on unmount; session expired scenario; concurrent login attempts
- Files: `src/contexts/SupabaseAuthContext.tsx` (lines 120-137)
- Risk: Memory leaks from uncleaned listeners; stale session data after network interruption
- Priority: High

---

*Concerns audit: 2026-02-05*
