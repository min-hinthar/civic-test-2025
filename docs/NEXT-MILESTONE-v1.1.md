# Milestone v1.1: Ship-Ready Hardening + UX Refinement

## Document Meta

- **Owner:** Product + Engineering
- **Status:** Draft — pending review
- **Predecessor:** PRD-next-milestone.md (Epics A–G, mostly complete)
- **Target:** v1.1 release candidate
- **Audience:** Burmese ESL civics learners (beta community active)
- **Date:** 2026-03-03

---

## 0) Deep Dive Findings Summary

### What's working well

- Solid architecture: 10-provider hierarchy, offline-first with IndexedDB + Supabase sync, SRS via ts-fsrs
- Rich feature set: 6 study modes (Study, Practice, Test, Drill, Interview, Sort/SRS), celebrations, badges, leaderboard
- 128 bilingual questions with explanations, mnemonics, fun facts, related questions
- 256 pre-generated audio files for offline TTS
- PWA with service worker, push notifications, install prompt
- Good separation of concerns: reducers for quiz/sort state, engines for mastery/readiness/SRS/NBA

### Critical weaknesses found

**1. Test coverage is dangerously low**

| Layer | Tested | Total | Coverage |
|-------|--------|-------|----------|
| Hooks | 1 | 37 | 2.7% |
| Contexts | 0 | 8 | 0% |
| Lib modules | 22 | 86 | 25.6% |
| Components | 1 folder | 35+ folders | ~3% |
| A11y tests | 2 | needed: 20+ | minimal |

Critical untested code:
- `quizReducer.ts` — 10+ state transitions, pass/fail thresholds, skipped-review flow
- `syncQueue.ts` — exponential backoff retry, partial failure, network recovery
- `SupabaseAuthContext.tsx` — auth state, session management, RLS enforcement
- `srsSync.ts` / `srsStore.ts` — SRS cloud sync and persistence
- `offlineDb.ts` — IndexedDB schema, migrations, data integrity
- `interviewSync.ts` / `interviewStore.ts` — interview grading persistence

**2. Logic inconsistencies**

- PRD says 120 questions but codebase has 128 — PRD outdated, 128 is correct. All UI copy referencing question counts must use `totalQuestions` constant.
- PRD says "pass at 12 correct, fail at 9 incorrect" for 20 questions — need to verify this matches `quizReducer.ts` thresholds and `TestPage` UI copy exactly.
- `uscis-2025-additions.ts` exists as separate file — these should be merged into canonical category files or clearly documented why they're separate.
- Dynamic answers (state-aware: governor, senators) — no tests verify these update correctly per user's state selection.
- Interview grading pipeline: `answerGrader.ts` tested in isolation but the full flow (speech → grading → SRS card creation → sync) has zero integration tests.

**3. Sync & offline risks**

- Sync queue retry logic (5 retries, 2^n backoff) is completely untested — users on flaky connections (common for target demographic) could lose test results silently.
- No conflict resolution strategy documented for IndexedDB ↔ Supabase race conditions.
- No test for "complete quiz offline → come online → sync" full path.
- `useSyncQueue` hook's reconnection behavior and toast notifications untested.

**4. UX/UI gaps for target users**

- Onboarding flow exists but no tests verify it completes end-to-end.
- Dashboard has multiple competing CTAs — NBA hero card should dominate but other cards may distract ESL users.
- Burmese text expansion: no automated tests verify layouts don't clip/overflow in Burmese mode.
- Interview mode's speech recognition — no graceful fallback documented for browsers that don't support Web Speech API.
- Settings page voice picker — TTS engine async init can leave users in a broken state if engine fails.

**5. Security gaps**

- Push subscription endpoints: G1/G2 from prior PRD (auth verification, rate limiting) — verify completion status.
- CSP nonce generation in `proxy.ts` — test file exists but coverage unknown.
- PII sanitizer has 90% threshold but no test for edge cases (Burmese script PII, mixed-language strings).

---

## 1) Goals & Success Metrics

### Goals

1. **Test confidence** — raise critical-path test coverage to ship-ready levels
2. **Data integrity** — prove offline sync works reliably for target users on mobile/flaky connections
3. **USCIS accuracy** — verify all 128 questions, thresholds, and dynamic answers are correct
4. **UX clarity** — reduce cognitive load on Dashboard and improve study→test→interview conversion
5. **Burmese trust** — automated checks for text overflow and translation completeness
6. **Ship readiness** — full verification pipeline passes: lint + typecheck + test + build

### Success Metrics

| Metric | Target |
|--------|--------|
| Critical-path test coverage (quiz, sync, auth, SRS) | >80% lines |
| Hook test coverage | >40% (up from 2.7%) |
| Context test coverage | >50% (up from 0%) |
| Sync queue reliability | 0 silent data loss in 100 offline→online cycles |
| Burmese text overflow | 0 clipping on core screens (Dashboard, Study, Test, Interview) |
| `pnpm verify` pass rate | 100% (lint + css + format + typecheck + test + build) |
| Beta user retention (study→test) | +15% from current baseline |

---

## 2) Epics & Tickets

### Epic H: Critical Test Coverage

**Goal:** Cover the code paths where bugs = data loss or broken core flows.

**H1: Quiz reducer test suite**
- All state transitions (IDLE → ANSWERING → CHECKED → FEEDBACK → TRANSITIONING → COMPLETE)
- Pass/fail threshold logic (12 correct = pass, 9 incorrect = fail)
- Skipped question review flow
- Timer expiration edge cases
- Invalid action sequence handling
- AC: `quizReducer.ts` >90% branch coverage

**H2: Sync queue test suite**
- Exponential backoff (5 retries, 2^n delay)
- Partial Supabase insert failure → retry
- Network dies mid-sync → queue preserved
- IndexedDB cleanup after successful sync
- Concurrent sync prevention
- AC: `syncQueue.ts` >85% coverage; `useSyncQueue.ts` hook tested

**H3: Auth context test suite**
- Login/logout state transitions
- Session refresh and token expiry
- Cross-device sync trigger on auth
- RLS enforcement (user can only access own data)
- Google One Tap flow
- AC: `SupabaseAuthContext.tsx` >70% coverage

**H4: SRS sync + store tests**
- Card persistence to IndexedDB
- Sync to Supabase (new cards, updated cards)
- Conflict resolution (local edit + server edit)
- Deck load from IndexedDB vs Supabase
- AC: `srsSync.ts` + `srsStore.ts` >80% coverage

**H5: Interview pipeline integration test**
- Speech input → answer grading → result display → SRS card creation → sync
- Graceful fallback when Web Speech API unavailable
- Session persistence across page refresh
- AC: end-to-end interview flow covered

**H6: Offline database tests**
- IndexedDB schema creation
- Migration between schema versions
- Quota exceeded handling
- Data retrieval after browser restart
- AC: `offlineDb.ts` >70% coverage

**H7: Context provider integration tests**
- Provider nesting order enforcement (test that wrong order throws)
- LanguageProvider uses useAuth correctly
- OfflineProvider uses useToast correctly
- TTSProvider async init error handling
- AC: integration test file covering the full provider tree

---

### Epic I: Logic Consistency & USCIS Accuracy

**Goal:** Eliminate discrepancies between content, UI copy, and business logic.

**I1: Audit question count references**
- Grep for hardcoded "100", "120", "128" in all UI strings and logic
- Ensure all references use `totalQuestions` constant from `src/constants/questions/index.ts`
- Update PRD to reflect 128 as the correct count
- AC: zero hardcoded question count strings; PRD updated

**I2: Verify test/interview thresholds**
- Read `quizReducer.ts` pass/fail logic
- Read `TestPage.tsx` and `InterviewPage.tsx` UI copy
- Cross-reference with USCIS 2025 guidance
- Ensure consistency: pass at 12 correct OR fail at 9 incorrect (out of 20)
- AC: thresholds match in reducer, UI, and documentation

**I3: Dynamic answer validation**
- Test that state-aware answers (governor, senators, representative) update when user changes state
- Test that time-aware answers (current president, election year) are correct for 2025/2026
- Add unit tests for `DynamicAnswerMeta` processing
- AC: all dynamic answers have test coverage

**I4: Question bank integrity check**
- Validate all 128 questions have: `question_en`, `question_my`, at least 1 answer, explanation
- Validate no duplicate IDs
- Validate category distribution matches USCIS categories
- Strengthen `questions.test.ts` to cover all fields
- AC: questions.test.ts validates every field on every question

**I5: Consolidate uscis-2025-additions**
- Either merge additions into canonical category files OR document why they're separate
- Ensure additions are properly categorized and have full bilingual content
- AC: clear structure, no orphaned questions

---

### Epic J: Offline Sync Reliability

**Goal:** Prove data doesn't get lost on flaky connections.

**J1: Offline→online integration test**
- Complete a mock test while offline (mock IndexedDB)
- Simulate coming online
- Verify sync queue processes and data reaches Supabase mock
- AC: automated test proving the full cycle

**J2: Conflict resolution strategy**
- Document behavior when local and server data diverge
- Implement "last write wins" or "merge" strategy for SRS cards
- Add test for concurrent edits scenario
- AC: strategy documented in ARCHITECTURE.md; test exists

**J3: Sync failure UX**
- Verify toast notifications fire on sync failure
- Verify retry count is visible to user
- Verify "pending sync" indicator works
- Add test for `SyncStatusIndicator` component
- AC: user always knows sync status

**J4: IndexedDB quota handling**
- Test behavior when IndexedDB is near quota
- Graceful degradation: warn user, prioritize critical data
- AC: quota exceeded scenario tested and handled

---

### Epic K: UX Refinement for Beta Users

**Goal:** Reduce friction in the core study→test→interview funnel.

**K1: Dashboard cognitive load audit**
- Reduce above-fold sections to: NBA hero card + Today's Plan + Quick Stats
- Move secondary cards (leaderboard preview, achievement highlights) below fold
- Verify NBA card selection logic covers all user states (new, returning, mid-study, test-ready)
- AC: dashboard has ≤3 sections above fold; NBA card always visible

**K2: Burmese text overflow prevention**
- Add automated layout tests for core screens in Burmese mode
- Use snapshot or visual regression approach
- Fix any clipping/overflow found
- AC: zero overflow issues on Dashboard, Study, Test, Interview, Settings in Burmese

**K3: Speech recognition fallback**
- Detect browser support for Web Speech API on interview page load
- Show clear bilingual message if unsupported
- Offer text-input fallback for interview answers
- AC: interview mode works (degraded) on all modern browsers

**K4: TTS engine error recovery**
- Handle TTSProvider init failure gracefully (don't crash provider tree)
- Show "audio unavailable" indicator instead of broken state
- Allow study/practice to continue without audio
- AC: app functional when TTS engine fails to initialize

**K5: Session resume clarity**
- Verify `ResumePromptModal` works correctly for all modes (quiz, test, interview, drill)
- Ensure abandoned sessions are cleaned up after reasonable timeout
- Test `UnfinishedBanner` visibility and dismiss behavior
- AC: session resume works for all 6 study modes

**K6: Onboarding flow completion**
- Test full onboarding flow (WelcomeScreen → GreetingFlow → OnboardingTour)
- Ensure it only shows once (onboarding status persisted)
- Verify bilingual content in all onboarding steps
- AC: onboarding completes without errors; not re-shown

---

### Epic L: A11y & Compliance

**Goal:** Meet WCAG 2.1 AA for all core flows.

**L1: Interactive component a11y audit**
- Add vitest-axe tests for: Button, Dialog, Card, quiz AnswerOption, SRS RatingButtons, interview ChatBubble
- Verify 44px touch targets on all interactive elements
- AC: 10+ component a11y tests added

**L2: Keyboard navigation coverage**
- Test `useRovingFocus` in quiz answer selection
- Test tab order through Dashboard, Study, Test pages
- Verify focus management during page transitions
- AC: keyboard-only users can complete study→test→interview flow

**L3: Screen reader announcements**
- Test `announcer.ts` actually fires ARIA live region updates
- Verify quiz feedback, score changes, and timer warnings are announced
- AC: `announcer.ts` has test coverage; key announcements verified

**L4: Reduced motion compliance**
- Verify `useReducedMotion` disables all animations (confetti, transitions, spring physics)
- Test celebration overlay respects preference
- AC: all animations disabled when `prefers-reduced-motion: reduce`

---

### Epic M: Security & Observability

**Goal:** Close remaining security gaps and improve monitoring.

**M1: Push subscription hardening verification**
- Verify Epics G1/G2 from prior PRD are complete
- Test that unauthenticated requests to `/api/push/*` are rejected
- Test rate limiting on subscription writes
- AC: security tests for all push endpoints

**M2: PII sanitizer edge cases**
- Test Burmese script PII detection
- Test mixed-language strings (English name in Burmese text)
- Test that Supabase URLs and tokens are scrubbed
- AC: `errorSanitizer.ts` covers multilingual PII

**M3: Error boundary coverage**
- Test global `ErrorBoundary` renders fallback
- Test per-route error boundaries (public, protected)
- Verify Sentry receives sanitized error reports
- AC: `ErrorBoundary.tsx` >80% coverage

**M4: CSP nonce validation**
- Verify nonce generation and injection
- Test that inline scripts without nonce are blocked
- AC: `proxy.test.ts` covers real nonce scenarios

---

## 3) Priority Order (Execution Sequence)

### Phase 1: Foundation Tests (Week 1-2)

| Ticket | Risk if skipped | Effort |
|--------|----------------|--------|
| H1: Quiz reducer tests | Quiz bugs in production | M |
| H2: Sync queue tests | Silent data loss | M |
| H3: Auth context tests | Auth crashes | M |
| I1: Question count audit | Wrong numbers in UI | S |
| I2: Threshold verification | Wrong pass/fail logic | S |

### Phase 2: Data Integrity (Week 2-3)

| Ticket | Risk if skipped | Effort |
|--------|----------------|--------|
| H4: SRS sync tests | SRS data divergence | M |
| H6: Offline DB tests | Data corruption | M |
| J1: Offline→online test | Data loss on reconnect | L |
| J2: Conflict resolution | Data overwrite | M |
| I3: Dynamic answer tests | Wrong answers shown | S |

### Phase 3: UX & Polish (Week 3-4)

| Ticket | Risk if skipped | Effort |
|--------|----------------|--------|
| K1: Dashboard audit | User drop-off | M |
| K2: Burmese overflow | Trust erosion | M |
| K3: Speech fallback | Interview broken on some browsers | S |
| K4: TTS error recovery | App crash on TTS fail | S |
| K5: Session resume | Lost progress frustration | S |

### Phase 4: Hardening (Week 4-5)

| Ticket | Risk if skipped | Effort |
|--------|----------------|--------|
| H5: Interview integration | Interview mode unreliable | L |
| H7: Provider integration | Provider tree breaks | M |
| L1-L4: A11y suite | WCAG non-compliance | L |
| M1-M4: Security suite | Vulnerabilities | M |
| I4-I5: Question integrity | Content bugs | S |

### Phase 5: Stabilization (Week 5-6)

| Ticket | Risk if skipped | Effort |
|--------|----------------|--------|
| J3: Sync failure UX | Users don't know about failures | S |
| J4: Quota handling | Crash on full storage | S |
| K6: Onboarding test | Bad first impression | S |
| Full regression | Ship blockers | M |

---

## 4) Verification Checklist

Before marking v1.1 as release candidate:

```bash
# Must all pass
pnpm lint
pnpm lint:css
pnpm format:check
pnpm typecheck
pnpm test:run
pnpm build

# Coverage thresholds (new)
# quizReducer.ts: >90% branches
# syncQueue.ts: >85% lines
# SupabaseAuthContext.tsx: >70% lines
# srsSync.ts + srsStore.ts: >80% lines
# ErrorBoundary.tsx: >80% lines (up from 70%)
```

Manual verification:
- [ ] Complete study→test→interview flow in English
- [ ] Complete study→test→interview flow in Burmese
- [ ] Complete mock test offline → reconnect → verify sync
- [ ] Verify all 128 questions render correctly in both languages
- [ ] Verify dynamic answers update per state selection
- [ ] Verify SRS deck review → card scheduling → next review date
- [ ] Verify onboarding flow (fresh user)
- [ ] Verify push notification delivery
- [ ] Verify PWA install on iOS Safari and Android Chrome
- [ ] Lighthouse audit: Performance >80, Accessibility >90, PWA >90

---

## 5) Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Test writing takes longer than estimated | High | Schedule slip | Prioritize H1/H2/H3 first; skip L-series if behind |
| Sync conflicts harder than expected | Medium | Data issues | Start with "last write wins" — simple and predictable |
| Burmese text overflow fixes cascade | Medium | UI rework | Fix only core 5 screens; defer settings/hub |
| Beta users hit untested edge cases | High | Trust loss | Ship H1-H3 as hotfix before full v1.1 |
| Speech recognition varies by device | High | Interview broken | K3 text fallback is critical — do early |

---

## 6) Open Questions

1. Should we add Playwright/Cypress E2E tests for the study→test→interview flow, or is unit/integration sufficient for v1.1?
2. What's the conflict resolution preference for SRS cards: "last write wins" vs "server wins" vs "merge by timestamp"?
3. Are there specific Burmese translation strings beta users have flagged as confusing?
4. Should the onboarding tour be re-triggered after this milestone's UX changes?
5. Is there a target date for v1.1 release?

---

## 7) Appendix: Current Codebase Stats

| Metric | Value |
|--------|-------|
| Source lines | ~68,000 |
| Test lines | ~7,600 |
| Components | 183 files across 35+ folders |
| Hooks | 37 custom hooks |
| Contexts | 8 providers (10 including Navigation + Toast) |
| Lib modules | 86 files across 18 directories |
| Questions | 128 (7 categories, bilingual) |
| Audio files | 256 (128 × 2 languages) |
| Routes | 14 pages (6 public, 8 protected) |
| Dependencies | 47 production, 38 dev |
| Completed phases | 9 (foundation → interview simulation) |
