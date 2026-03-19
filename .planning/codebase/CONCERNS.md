# Codebase Concerns

**Analysis Date:** 2026-03-19
**Sources:** Milestone audits (v2.0–v4.0), security audit, 4 debug sessions, grep/wc analysis of production source

---

## Known Gaps (Carry-Forward From Milestone Audits)

**CELB-06 — DotLottie animation assets absent:**
- Issue: `public/lottie/` directory is empty. Code expects `checkmark.lottie`, `trophy.lottie`, `badge-glow.lottie`, `star-burst.lottie`.
- Files: `src/components/celebrations/DotLottieAnimation.tsx`, `src/components/celebrations/CelebrationOverlay.tsx`
- Impact: Celebration animations never render. Confetti, sound, and haptics still fire; visual animation tier is missing.
- Current mitigation: `Suspense fallback={null}` provides graceful degradation — no crash.
- Fix: Source `.lottie` files from LottieFiles marketplace and copy into `public/lottie/`.
- Carried from: v3.0 (Phase 32 audit, CELB-06)

**VISC-05 — Dark mode glass panel readability not human-verified:**
- Issue: Dark mode glass-morphism panel contrast has not been tested by a human on actual hardware.
- Files: `src/styles/tokens.css`, `src/components/ui/GlassCard.tsx`, all glass-tier components
- Impact: Potential readability failure on OLED displays or high-brightness environments; 3-tier glass system (light/medium/heavy) is complex enough that automated checks miss perceptual issues.
- Fix: Manual visual QA session on iOS (OLED) and Android with dark mode enabled.
- Carried from: v3.0 (Phase 29 audit, VISC-05)

**BRMSE-01 — Burmese translation naturalness not native-speaker reviewed:**
- Issue: All 503 Myanmar-text usages have been verified for completeness and font rendering, but translation naturalness (phrasing, register, idiom) requires a native Myanmar speaker.
- Files: `src/lib/i18n/strings.ts`, `src/constants/questions/**/*.ts` (128 files), `src/lib/mastery/nudgeMessages.ts`
- Impact: Unnatural phrasing in a learner-facing app used by the Burmese-American community.
- Fix: Native speaker review session; maintain `.planning/burmese-glossary.md` as reference.
- Carried from: v2.1 (Phase 25 audit), v3.0, v4.0

**STAT-06 — Screen reader announcement missing under reduced-motion celebration path:**
- Issue: `announce('Celebration!')` is in `Confetti.tsx`, which is not mounted when `prefers-reduced-motion` is set. `CelebrationOverlay.tsx` line 200 only calls `announce()` when `shouldReduceMotion` is true, but the `ReducedMotionTimer` path bypasses this.
- Files: `src/components/celebrations/CelebrationOverlay.tsx` (line 200–201), `src/components/celebrations/Confetti.tsx`
- Impact: Test-pass celebrations produce no screen reader announcement for users with reduced-motion preference.
- Fix: Move `announce('Celebration!')` to the shared `useEffect` in `CelebrationOverlay` that fires on `current` change, unconditionally of `shouldReduceMotion`.
- Carried from: v3.0 (Phase 33 audit, STAT-06)

---

## Tech Debt

**`safeAsync` utility has zero production consumers:**
- Issue: `src/lib/async/safeAsync.ts` is exported and tested, but no production file calls it. Only `withRetry` is used (14+ call sites across sync layers).
- Files: `src/lib/async/safeAsync.ts`, `src/lib/async/index.ts`
- Impact: Dead infrastructure; future devs may not know the pattern exists. Not harmful, but adds surface area.
- Fix: Either adopt `safeAsync` in 2–3 appropriate fire-and-forget call sites (e.g., `recordStudyActivity` in `masteryStore.ts`) or remove it and its tests.

**Multiple `eslint-disable` suppressions for `react-hooks/exhaustive-deps`:**
- Issue: 15+ `// eslint-disable-next-line react-hooks/exhaustive-deps` comments across hooks and contexts. Some are justified (one-time mount effects, stable refs); others may hide subtle stale-closure bugs.
- Files: `src/components/celebrations/CelebrationOverlay.tsx:229`, `src/components/interview/InterviewSession.tsx:944`, `src/components/practice/PracticeSession.tsx:623`, `src/components/results/TestResultsScreen.tsx:397`, `src/components/sort/SortModeContainer.tsx:173`, `src/contexts/LanguageContext.tsx:89`, `src/contexts/SRSContext.tsx:198`, `src/contexts/StateContext.tsx:94`, `src/hooks/useAutoPlay.ts:265`, `src/hooks/useAutoRead.ts:165`, `src/hooks/useSortSession.ts:233`, `src/hooks/useSortSession.ts:501`, `src/hooks/useStreak.ts:120`, `src/hooks/useTTS.ts:88`, `src/hooks/useTTS.ts:162`
- Impact: Each suppression is a manual safety claim that requires ongoing correctness verification when surrounding code changes.
- Fix: Audit each suppression case — migrate to `useRef`-based stable callbacks or `useReducer` where the dependency exclusion is not clearly justified.

**Redundant RLS INSERT policies on `streak_data` and `earned_badges`:**
- Issue: Both tables have a `FOR ALL` policy AND a separate `INSERT` policy. The `FOR ALL` covers insert, making the insert policy redundant.
- Files: `supabase/schema.sql` lines 248–253 (streak_data), schema.sql earned_badges section
- Impact: No functional impact; adds confusion during schema audits.
- Fix: Drop the standalone INSERT policies in the next schema migration.

**Phase 23 (Flashcard Sort) missing formal VERIFICATION.md:**
- Issue: Phase 23 was verified only via plan summaries (`23-09-SUMMARY.md`), not a dedicated VERIFICATION.md.
- Files: `.planning/milestones/v2.1-phases/23-flashcard-sort/` (no VERIFICATION.md)
- Impact: Documentation gap; requirements FLSH-01 through FLSH-09 are satisfied but only partially traceable.
- Fix: Backfill VERIFICATION.md from plan summaries on next audit cycle.

**Console output in production (32 non-test call sites):**
- Issue: 32 `console.error` calls across production source files. All are error-path logging in catch blocks — no PII exposure — but expose error categories to DevTools users.
- Files: `src/contexts/SRSContext.tsx`, `src/contexts/OfflineContext.tsx`, `src/contexts/SocialContext.tsx`, `src/lib/interview/interviewSync.ts`, `src/lib/social/streakSync.ts`, `src/components/interview/InterviewSession.tsx` (3 suppressed with `// eslint-disable-next-line no-console`)
- Impact: Low security risk (no sensitive data); minor info disclosure (error categories visible in DevTools). Verbose in production.
- Fix: Route through `captureError()` from `src/lib/sentry.ts` instead of `console.error` at call sites that already import Sentry.

**`react-joyride` pinned to pre-release version:**
- Issue: `package.json` has `"react-joyride": "3.0.0-7"` — a pre-release tag that was pinned during v1.0 development.
- Files: `src/components/onboarding/OnboardingTour.tsx`, `src/components/onboarding/TourTooltip.tsx`
- Impact: Pre-release package; may be missing security patches, stability fixes, or React 19 compatibility improvements from the stable `3.x` release (if published).
- Fix: Evaluate current stable release of `react-joyride`; upgrade after testing onboarding tour flow.

---

## Security Concerns

**In-memory rate limiting resets on serverless cold start:**
- Issue: `app/api/push/subscribe/route.ts` uses a module-level `Map` for rate limiting (10 req/min/user). Vercel serverless functions are stateless; each cold start clears the map.
- Files: `app/api/push/subscribe/route.ts` (lines 21–56)
- Impact: A burst of subscribe requests across concurrent cold-start instances bypasses the limit. For current traffic levels (low-volume app), this is acceptable risk. With traffic growth, this becomes exploitable.
- Current mitigation: Acknowledged and documented in Phase 13 and Phase 38 audits as "sufficient for single-instance Vercel deployment."
- Fix (if traffic warrants): Replace with Upstash Redis or Vercel KV rate limiting.

**Two CVEs accepted as acceptable risk:**
- `CVE-2026-26996` (high) and `CVE-2025-69873` (high): Both in `ignoreCves` in `package.json`. Assessed as server-side-only, not exploitable in this app's usage pattern.
- Files: `package.json` (`pnpm.auditConfig.ignoreCves`)
- Impact: Requires ongoing assessment; if the usage pattern changes, these may become exploitable.
- Fix: Re-evaluate on each major dependency update cycle; document reassessment in security checklist.

**TipTopJar widget loaded without SRI:**
- Issue: `src/components/hub/TipJarWidget.tsx` dynamically creates a `<script>` tag loading from `tiptopjar.com` without a Subresource Integrity hash.
- Files: `src/components/hub/TipJarWidget.tsx`
- Impact: If `tiptopjar.com` CDN is compromised, the script could be tampered. CSP restricts to `tiptopjar.com` origin (mitigating arbitrary injection), and the widget is sandboxed in an iframe. Optional feature.
- Fix: No practical fix for third-party CDN scripts that update frequently; the CSP origin restriction is the best available mitigation.

**`mock_test_responses` RLS subquery may degrade at scale:**
- Issue: RLS policy on `mock_test_responses` uses a correlated subquery to `mock_tests` to verify ownership (the table has no direct `user_id` column). Correct but potentially slow at large row counts.
- Files: `supabase/schema.sql` (mock_test_responses RLS policies)
- Impact: Query performance degrades as `mock_test_responses` grows. Currently low-traffic app, so not observed. At scale (10K+ sessions), per-query subquery evaluation adds latency to every SELECT.
- Fix: Add denormalized `user_id` column with direct RLS policy. Migration required.

---

## Fragile Areas

**Provider ordering in `ClientProviders.tsx` — critical and regression-prone:**
- Issue: The 10-provider nesting order is load-bearing. `OfflineProvider` must be inside `ToastProvider`. `AuthProvider` must be above `LanguageProvider`, `ThemeProvider`, and `TTSProvider` (all call `useAuth()`). This was broken in production by commit `d78f1ba` (Phase 46 cross-device sync) which added `useAuth()` calls without adjusting hierarchy.
- Files: `src/components/ClientProviders.tsx`, `.claude/CLAUDE.md` (provider hierarchy docs)
- Why fragile: Any developer adding a new context dependency to an existing provider can silently break the ordering constraint. The error manifests as "useAuth must be used within an AuthProvider" in production — not caught by lint or typecheck.
- Safe modification: Always verify `ClientProviders.tsx` nesting order against the hierarchy documented in `CLAUDE.md` when adding any inter-provider dependency.
- Debug record: `.planning/debug/useauth-provider-missing.md`

**`onAuthStateChange` deadlock pattern:**
- Issue: Calling async Supabase API methods inside `onAuthStateChange` creates a deadlock (Supabase holds an auth lock during the callback). Was present in production until detected and fixed with `setTimeout(0)` deferral.
- Files: `src/contexts/SupabaseAuthContext.tsx` (lines ~221+)
- Why fragile: The fix is a `setTimeout(0)` workaround around an undocumented Supabase internal lock. Future modifications to the auth hydration flow (e.g., adding new `onAuthStateChange` side effects) could reintroduce the deadlock.
- Safe modification: Never `await` a Supabase query inside an `onAuthStateChange` callback. Use `setTimeout(0)` to defer any such calls.
- Debug record: `.planning/debug/session-expired.md`

**`InterviewSession.tsx` — 1,474 lines, 29 memoized callbacks, complex state:**
- Issue: `src/components/interview/InterviewSession.tsx` is the largest UI component (1,474 lines). It manages a multi-phase interview state machine (GREETING → QUESTION → RECORDING → FEEDBACK → COMPLETE) inline with useState, 29 `useCallback`/`useMemo` calls, 41 imports, and direct audio/TTS/speech-recognition side effects.
- Impact: High cognitive load for any modification. State transitions are managed via sequential `useEffect` chains rather than a formal reducer, making phase bugs (e.g., the v4.0 interview bugs: single answer display, real-mode feedback leak) easy to introduce.
- Debug record: `.planning/debug/interview-mode-bugs.md`
- Fix path: Extract phase logic into a `useInterviewStateMachine` hook; move audio orchestration into dedicated hooks already partially done (`useSpeechRecognition`, `useSilenceDetection`, `useAudioRecorder`).

**Service worker `skipWaiting: true` + `clientsClaim: true` — aggressive update model:**
- Issue: `src/lib/pwa/sw.ts` uses `skipWaiting: true` and `clientsClaim: true`. New service workers activate immediately without waiting for existing clients to close.
- Files: `src/lib/pwa/sw.ts` (lines 16–17)
- Impact: If a new deployment changes IndexedDB schema or localStorage key names, existing open tabs may encounter a mismatch between old JS (still loaded) and new SW cache. No migration path is currently in place for data schema changes.
- Current mitigation: No breaking schema changes have been made across milestones; all changes use `IF NOT EXISTS` in SQL and backward-compatible localStorage additions.
- Fix: Implement a SW version check and optional tab refresh prompt for major releases.

**Turbopack dev / webpack production split:**
- Issue: `pnpm dev` uses Turbopack (Next.js 16 default); `pnpm build` requires `--webpack` flag because `@serwist/next` requires webpack for its injection mechanism. Two bundlers run in dev vs production.
- Files: `package.json` (scripts), `next.config.mjs`
- Impact: CSS hot reload behavior, chunk splitting, and import resolution may differ between dev and production. A bug visible in `pnpm build --webpack` output may not appear in `pnpm dev`. Always validate with `pnpm build` before PR.
- Fix: Monitor Serwist Turbopack support (`@serwist/turbopack` alpha) — when stable, unify on a single bundler.

---

## Answer History Sync Gap (SYNC-01 Partial Implementation)

**Answer history (`masteryStore`) is IndexedDB-only — not synced to Supabase:**
- Issue: `src/lib/mastery/masteryStore.ts` stores practice/test answer history entirely in IndexedDB (`civic-prep-mastery` db, `answers` key). There is no Supabase table for this data and no sync function. The v4.0 audit credited SYNC-01 as satisfied because SRS card sync was used as a proxy (SRS cards reflect review outcomes), but raw answer history (accuracy percentages, question-level drilling data, readiness score inputs) is device-local.
- Files: `src/lib/mastery/masteryStore.ts`, `src/lib/mastery/weakAreaDetection.ts`, `src/hooks/useReadinessScore.ts`, `src/hooks/useStudyPlan.ts`
- Impact: On a new device login, readiness score and weak-area drill suggestions start from zero. The "cross-device continuity" of the study plan requires this data. SRS cards sync, but the granular per-question accuracy that drives drill selection does not.
- Fix: Either (a) add an `answer_history` Supabase table mirroring `StoredAnswer[]` with push/pull on login, or (b) derive accuracy from `mock_test_responses` (already synced) as the source of truth and deprecate IndexedDB-only mastery tracking.

---

## Performance Concerns

**`InterviewSession.tsx` and `TestPage.tsx` — no lazy loading:**
- Issue: `src/components/interview/InterviewSession.tsx` (1,474 lines, 41 imports including audio, TTS, speech) and `src/views/TestPage.tsx` (960 lines) are not dynamically imported. They load eagerly on the interview and test routes.
- Files: `src/components/interview/InterviewSession.tsx`, `src/views/TestPage.tsx`
- Impact: Increases initial route bundle. Interview uses `useSpeechRecognition`, audio players, and waveform canvas — none of which are needed until the user starts recording.
- Fix: Dynamic import `InterviewSession` inside the interview page component (already done for `recharts` and `confetti` per Phase 47 pattern).

**`soundEffects.ts` — 568 lines of Web Audio API synthesis:**
- Issue: `src/lib/audio/soundEffects.ts` is 568 lines of programmatic Web Audio synthesis (oscillators, harmonics, ADSR envelopes). It is imported at the module level by several celebration and feedback components.
- Files: `src/lib/audio/soundEffects.ts`
- Impact: Registers AudioContext on first import even if the user has sound muted. On iOS, AudioContext must be created in response to user interaction — early registration may cause silent failures.
- Fix: Lazy-initialize `AudioContext` inside each play function (already done in some functions; audit all entry points for consistency).

**`HistoryTab.tsx` — 800 lines, no virtualization:**
- Issue: `src/components/hub/HistoryTab.tsx` renders all mock test history and session entries as a flat list (800 lines). No virtualization (e.g., `react-window`) is applied.
- Files: `src/components/hub/HistoryTab.tsx`
- Impact: At high session counts (100+ mock tests), the DOM grows unboundedly and scroll performance degrades.
- Fix: Add virtual scroll (e.g., `@tanstack/virtual`) for the session list when count exceeds ~30.

**`getAnswerHistory()` called in 7+ hooks/components on every render cycle:**
- Issue: `getAnswerHistory()` is an `async` IndexedDB read called independently from `useReadinessScore`, `useStudyPlan`, `useNextBestAction`, `useCategoryMastery`, `StudyGuideHighlight`, `Dashboard`, and `DrillPage`. Each call opens an IndexedDB cursor to read the full answer array.
- Files: `src/lib/mastery/masteryStore.ts`, `src/hooks/useReadinessScore.ts`, `src/hooks/useStudyPlan.ts`, `src/hooks/useNextBestAction.ts`, `src/hooks/useCategoryMastery.ts`, `src/components/nudges/StudyGuideHighlight.tsx`, `src/views/Dashboard.tsx`, `src/views/DrillPage.tsx`
- Impact: Multiple concurrent IndexedDB reads on Dashboard mount; no shared cache layer means the same data is fetched N times.
- Fix: Add a React context or SWR-style cache for `answerHistory` with a short TTL, or hoist it to `StateContext`.

---

## Accessibility Gaps

**Touch target audit was partial (A11Y-03):**
- Issue: The v2.1 accessibility audit confirmed 44px min touch targets only for `TimerExtensionToast` button. A systematic audit across all interactive elements was not completed. Phase 35 fixed 3 specific elements (GlassHeader heart, AboutPage Share, external links). Other elements remain unaudited.
- Files: All interactive components in `src/components/`
- Impact: Some buttons/links may fall below 44px on mobile (WCAG 2.5.5 violation).
- Fix: Automated audit with `min-h-[44px]` check or `vitest-axe` tap target plugin across component tests.

**Toast accessibility test uses inline mock HTML:**
- Issue: `src/\\_\\_tests\\_\\_/a11y/toast.a11y.test.tsx` renders a hand-written `<div role="alert">` instead of the actual `BilingualToast` component. The test proves axe passes for that HTML, not for the real component.
- Files: `src/__tests__/a11y/toast.a11y.test.tsx`
- Impact: Accessibility regressions in `BilingualToast` won't be caught by this test.
- Fix: Import and render `BilingualToast` with a mock `ToastContext` in the test.

**Celebration screen reader announcement missing under reduced-motion (repeat of STAT-06):**
- See: Known Gaps section above.

---

## Test Coverage Gaps

**No coverage thresholds for contexts, hooks, or view components:**
- Issue: `vitest.config.ts` only enforces coverage thresholds for 4 specific files (`shuffle.ts`, `saveSession.ts`, `errorSanitizer.ts`, `ErrorBoundary.tsx`). No global threshold. The 10 React context providers (`SRSContext`, `OfflineContext`, `SocialContext`, `StateContext`, `NavigationContext`, `TTSContext`, `LanguageContext`, `ThemeContext`, `SupabaseAuthContext`, `ToastContext`) have zero dedicated unit tests.
- Files: `vitest.config.ts`, `src/contexts/`
- Risk: Context bugs (like the `useAuth` ordering regression or `onAuthStateChange` deadlock) are only caught when they cause runtime failures — not by tests.
- Priority: High

**`InterviewSession.tsx` has no unit or integration tests:**
- Issue: The most complex component in the codebase (1,474 lines, multi-phase state machine) has no test file.
- Files: `src/components/interview/InterviewSession.tsx`
- Risk: Phase-transition bugs (correct/incorrect feedback leak, answer display logic) have been introduced and fixed manually. Future regressions will not be caught.
- Priority: High

**`useSortSession.ts` — 521 lines, no direct tests:**
- Issue: `src/hooks/useSortSession.ts` (521 lines) orchestrates the full flashcard sort session including state, timer, IndexedDB persistence, and SRS batch updates. `sortReducer.test.ts` tests the reducer, but `useSortSession` itself is not tested.
- Files: `src/hooks/useSortSession.ts`, `src/lib/sort/sortReducer.test.ts`
- Risk: Sort session bugs (round transitions, SRS integration) are not caught automatically.
- Priority: Medium

**Sync layers lack conflict scenario tests:**
- Issue: `settingsSync.test.ts`, `streakSync.test.ts`, and `bookmarkSync.test.ts` test happy-path push/pull. No tests cover simultaneous writes from two devices (the "server wins on sign-in, client wins on change" conflict resolution strategy).
- Files: `src/lib/settings/settingsSync.test.ts`, `src/lib/social/streakSync.test.ts`, `src/lib/bookmarks/bookmarkSync.test.ts`
- Risk: Conflict resolution regression could silently overwrite user settings on login.
- Priority: Medium

---

## Scaling Limits

**`push_subscriptions` cron endpoints do not paginate:**
- Issue: `/api/push/send/route.ts` and `/api/push/srs-reminder/route.ts` query all matching push subscriptions in a single Supabase `select()`. No pagination or batch limit.
- Files: `app/api/push/send/route.ts`, `app/api/push/srs-reminder/route.ts`
- Impact: At 10,000+ subscribers, a single Supabase query and web-push loop would time out a Vercel serverless function (10s limit).
- Fix: Implement cursor-based pagination; process subscriptions in batches of 500.

**Leaderboard `get_leaderboard()` RPC — full table scan:**
- Issue: `get_leaderboard()` SECURITY DEFINER function queries all `social_profiles` with `social_opt_in = true`, computes rank via `row_number()` window function over all opted-in users. No limit on query size.
- Files: `supabase/schema.sql` (`get_leaderboard` function)
- Impact: Grows linearly with leaderboard participants. Current user base: negligible. At 10,000+ opted-in users, rank computation becomes slow.
- Fix: Cache leaderboard results in a materialized view with hourly refresh, or limit to top 100.

---

## Dependencies at Risk

**`react-joyride@3.0.0-7` — pre-release pin:**
- Risk: Pre-release package; may lack React 19 compatibility fixes or security patches in stable `3.x`.
- Impact: Onboarding tour (`src/components/onboarding/OnboardingTour.tsx`) could break on React minor updates.
- Migration: Evaluate and upgrade to stable `react-joyride@3.x` release.

**`@lottiefiles/dotlottie-react@0.18.2` — loaded but never renders:**
- Risk: Package is installed, WASM-based, and dynamically imported — but the `.lottie` files it needs are absent. It adds ~130KB to the lazy-loaded celebration chunk for zero visible benefit.
- Files: `src/components/celebrations/DotLottieAnimation.tsx`
- Migration: Either source the animation assets (preferred) or remove the package until assets are available.

**`web-push@3.6.7` — transitive `bn.js` vulnerability was overridden:**
- Risk: `bn.js` override (`>=5.2.3`) resolves the moderate DoS CVE, but `web-push` itself has not been updated in over a year. Node.js VAPID push notification libraries are a slowly-maintained niche.
- Files: `package.json`, `app/api/push/`
- Migration: Monitor `web-push` releases; consider migrating to `@web-push-libraries/vapid` (actively maintained fork) when available.

---

## Human Verification Items (Pending From All Milestones)

These items cannot be verified programmatically and have never been manually confirmed:

| Item | Source | Risk If Untested |
|------|--------|-----------------|
| Dark mode glass panel readability on OLED hardware | VISC-05 | Illegible UI on a significant device segment |
| PWA overscroll guard on Android device | MOBI-01 | Scroll bleed on Android Chrome |
| iPhone safe area with Dynamic Island | MOBI-02 | Content obscured by notch/island |
| Swipe-to-dismiss toast on mobile | MOBI-04 | Gesture doesn't work |
| Haptic feedback on Android device | MOBI-06 | No haptics on Android |
| Multi-sensory celebration synchronization (confetti + sound + haptics timing) | CELB-04/05 | Desynchronized celebration feels broken |
| DotLottie graceful degradation (no crash when `.lottie` absent) | CELB-06 | Potential null render bug |
| Auto-play audio sequencing (question → answer → next) | Phase 37 | Audio overlaps or skips |
| Burmese text rendering quality on Myanmar Unicode fonts | BRMSE-01 | Rendering artifacts on some Android fonts |
| Sentry fingerprinting grouping in production Sentry dashboard | Phase 38/39 | Noise issues in Sentry instead of grouped issues |
| Interview mode: real exam neutral feedback (no correctness reveal) | debug/interview-mode-bugs | Fixed in code but awaiting UX confirmation |
| Session persistence: no "Session expired" flash after reload | debug/session-expired | Fixed in code but awaiting UX confirmation |

---

*Concerns audit: 2026-03-19*
*Sources: v2.0/v2.1/v3.0/v4.0 milestone audits, security-checklist.md, rls-audit.md, debug/ sessions, production source grep analysis*
