# Phase 51 Enhancement Recommendations

## Priority Matrix

| # | Recommendation | Priority | Effort | Impact |
|---|---------------|----------|--------|--------|
| 1 | Test consumer hooks outside provider tree | MUST-HAVE | Low | High |
| 2 | State fixture factories for all providers | MUST-HAVE | Medium | High |
| 3 | Async lifecycle coverage (mount/unmount/cancel) | MUST-HAVE | Medium | High |
| 4 | Offline error path testing | MUST-HAVE | Medium | High |
| 5 | LWW merge scenario coverage | SHOULD-HAVE | Medium | High |
| 6 | Provider isolation via renderHook pattern | SHOULD-HAVE | Low | Medium |
| 7 | Cleanup function verification for all useEffects | SHOULD-HAVE | Low | Medium |
| 8 | Global coverage floor escalation | SHOULD-HAVE | Low | Medium |
| 9 | Knip-flagged dead code removal | NICE-TO-HAVE | Low | Low |
| 10 | Provider ordering integration test | NICE-TO-HAVE | Low | Medium |
| 11 | Derived state reactivity tests | NICE-TO-HAVE | Low | Low |
| 12 | Mock completeness audit | NICE-TO-HAVE | Low | Low |

---

## Detailed Recommendations

### 1. Test Consumer Hooks Outside Provider Tree
**Priority:** MUST-HAVE

**What:** Every provider exposes a `useX()` hook. Test that calling `useAuth()`, `useLanguage()`, etc. outside the provider tree throws a meaningful error.

**Why:** Provider ordering is the #1 historical source of production crashes (commit e2dfdb9). The ProviderOrderGuard (Phase 49) catches dev-mode violations but doesn't cover production. Hook throw tests document the contract.

**Design compliance:** Aligns with provider-ordering.md learning: "Any provider calling useContext of another provider must be nested INSIDE that provider."

**Implementation hint:** For each provider, render a component calling the hook without the provider wrapper. Assert `expect(() => render(...)).toThrow()`. Use `console.error = vi.fn()` to suppress React error boundary noise.

---

### 2. State Fixture Factories for All Providers
**Priority:** MUST-HAVE

**What:** Create test-local fixture constants for each provider's state: `MOCK_USER_AUTHENTICATED`, `MOCK_SRS_CARD_NEW`, `MOCK_SOCIAL_PROFILE`, `MOCK_STREAK_DATA`, etc.

**Why:** The 28+ existing mocks return empty/null defaults. Provider behavior tests need realistic data to exercise state transitions, merge logic, and derived computations.

**Design compliance:** Follows established pattern from errorBoundary.test.tsx and sentry.test.ts where fixture data drives test scenarios.

**Implementation hint:** Define fixtures at the top of each test file. Use TypeScript `satisfies` to type-check against provider interfaces. Keep fixtures minimal — only fields needed for the test case.

---

### 3. Async Lifecycle Coverage (Mount/Unmount/Cancel)
**Priority:** MUST-HAVE

**What:** For every provider with async initialization (Auth, SRS, Social, Offline), test:
- Mount → async completes → state updated correctly
- Mount → unmount before async completes → no setState after unmount
- Mount → error during async → error captured, state degraded gracefully

**Why:** 4 of 8 providers use `cancelled`/`mounted` flags to prevent stale updates. This is a common React pattern that needs explicit test coverage, especially since React 19 strict mode double-mounts in development.

**Design compliance:** Matches Phase 48 lesson: "speechSynthesis mock needed addEventListener for TTSProvider full preset" — async lifecycle issues surface during testing, not before.

**Implementation hint:** Use `vi.useFakeTimers()` to control async timing. Unmount component mid-async with `result.unmount()`. Verify mock state functions were NOT called after unmount.

---

### 4. Offline Error Path Testing
**Priority:** MUST-HAVE

**What:** Test SupabaseAuthContext's network error classification:
- `navigator.onLine === false` → queue to IndexedDB
- `TypeError` with 'fetch' or 'Failed to fetch' → queue to IndexedDB
- `TypeError` with 'NetworkError' → queue to IndexedDB
- Non-network errors → propagate after Sentry capture

**Why:** Offline test result queueing is the safety net for the primary user flow (take test → save results). Misclassification means either lost results (network error not caught) or swallowed bugs (non-network error silenced).

**Design compliance:** Core value: "Offline-first for unreliable connectivity" — Burmese immigrant users frequently on flaky mobile connections.

**Implementation hint:** Mock `navigator.onLine` as a getter. Mock `supabase.from().insert()` to throw various TypeError patterns. Verify `queueTestResult()` called for network errors but NOT for auth/validation errors.

---

### 5. LWW Merge Scenario Coverage
**Priority:** SHOULD-HAVE

**What:** Test SupabaseAuthContext's settings merge with per-field LWW timestamps:
- Dirty field always wins over remote
- Local-newer field wins over remote-older
- Remote-newer field wins over local-older
- Only changed fields written to localStorage
- Device-local `preferredVoiceName` preserved during TTS merge
- Dirty flags cleared after successful merge

**Why:** Phase 50 added per-field LWW merge (ARCH-03). SupabaseAuthContext is the integration point where local/remote settings converge on login. Incorrect merge = user loses offline settings changes.

**Design compliance:** Phase 50 contract: "dirty > local-newer > remote-newer per field."

**Implementation hint:** Mock `loadSettingsRowFromSupabase()` to return remote settings with known timestamps. Set local localStorage with different timestamps. Verify `mergeSettingsWithTimestamps()` called with correct args.

---

### 6. Provider Isolation via renderHook Pattern
**Priority:** SHOULD-HAVE

**What:** Use `renderHook()` from @testing-library/react instead of rendering test components for hook-only tests. This reduces boilerplate and makes intent clearer.

**Why:** Most provider tests verify hook return values and state changes, not rendered DOM. `renderHook()` is the idiomatic pattern for testing React hooks.

**Design compliance:** Follows React Testing Library best practices. Established pattern in the ecosystem.

**Implementation hint:**
```typescript
const { result } = renderHook(() => useLanguage(), {
  wrapper: ({ children }) => renderWithProviders(children, { preset: 'full' }).container,
});
expect(result.current.mode).toBe('bilingual');
```
Alternatively, create a thin wrapper component that exposes context values via data-testid attributes.

---

### 7. Cleanup Function Verification for All useEffects
**Priority:** SHOULD-HAVE

**What:** For every provider with event listeners (Language: storage/keydown, Theme: matchMedia, SRS: visibilitychange, Navigation: pointerdown), verify:
- Listener added on mount
- Listener removed on unmount
- No memory leaks

**Why:** Event listener cleanup is a common source of memory leaks in SPAs. Providers persist for the app lifetime but tests mount/unmount rapidly.

**Design compliance:** React best practice: useEffect cleanup functions must mirror setup.

**Implementation hint:** Spy on `document.addEventListener` and `document.removeEventListener`. After unmount, verify removeEventListener called with same event type and handler reference.

---

### 8. Global Coverage Floor Escalation
**Priority:** SHOULD-HAVE

**What:** After adding 8 provider test files, raise the global coverage floor from 40/40/30/40 to 45/45/35/45.

**Why:** Phase 48 established 40% as the baseline for the codebase before provider tests existed. Adding ~1000 lines of tests covering 8 previously-untested files should measurably lift the global average.

**Design compliance:** Phase 48 contract: "Coverage thresholds are incremental and per-file."

**Implementation hint:** Run `pnpm test:coverage` after all tests pass. Check global average. Set new floor to 5 points below the observed average (conservative buffer for future changes).

---

### 9. Knip-Flagged Dead Code Removal
**Priority:** NICE-TO-HAVE

**What:** Remove 5 unused files flagged by Knip (952 LOC):
- `src/components/explanations/WhyButton.tsx`
- `src/components/social/BadgeGrid.tsx`
- `src/components/srs/ReviewHeatmap.tsx`
- `src/components/srs/SRSWidget.tsx`
- `src/lib/pwa/sw.ts`

**Why:** Dead code inflates the denominator in coverage calculations. Removing it raises the effective coverage percentage without writing new tests.

**Design compliance:** Phase 48 removed 10 dead files via Knip. This continues the pattern.

**Implementation hint:** Verify each file is truly unused with `grep -r "WhyButton" src/` before deleting. Knip has known false positives (5 were identified in Phase 48).

---

### 10. Provider Ordering Integration Test
**Priority:** NICE-TO-HAVE

**What:** Add a test that renders ALL providers in the correct order and verifies each context is accessible from a deeply-nested child component.

**Why:** renderWithProviders.test.tsx already tests preset rendering but doesn't verify all 10 context values are accessible simultaneously. A single integration test provides a safety net for provider tree changes.

**Design compliance:** Complements ProviderOrderGuard (dev-mode only) with an automated test.

**Implementation hint:** Render a component that calls all 10 useX() hooks. Assert none throw and all return expected default values. Use `full` preset.

---

### 11. Derived State Reactivity Tests
**Priority:** NICE-TO-HAVE

**What:** Test that derived values (SRS dueCount, Social isOptedIn/displayName, Language showBurmese) update correctly when their source state changes.

**Why:** useMemo dependencies must be correct. If a memo dependency is missing, derived state becomes stale — a subtle bug that only manifests under specific re-render conditions.

**Design compliance:** React best practice: verify computed values track their dependencies.

**Implementation hint:** For SRS: add a card to deck, verify dueCount increments. For Social: set socialOptIn to true, verify isOptedIn reflects. For Language: toggle mode, verify showBurmese flips.

---

### 12. Mock Completeness Audit
**Priority:** NICE-TO-HAVE

**What:** After writing all 8 test files, verify that every `vi.mock()` in renderWithProviders.test.tsx is still accurate by cross-referencing with current provider import statements.

**Why:** Provider implementations evolve across phases. A mock that returned `[]` may now need to return `{ data: [], meta: null }` after a schema change. Stale mocks cause false-passing tests.

**Design compliance:** Phase 48 lesson: "Mock enhancements follow implementation patterns."

**Implementation hint:** For each provider file, list all imports. Cross-check against mock declarations. Flag any import without a corresponding mock.

---

## Summary

| Priority | Count | Recommendations |
|----------|-------|----------------|
| MUST-HAVE | 4 | Hook throw tests, fixtures, async lifecycle, offline errors |
| SHOULD-HAVE | 4 | LWW merge, renderHook pattern, cleanup verification, coverage floor |
| NICE-TO-HAVE | 4 | Dead code removal, ordering integration, derived state, mock audit |

**Implementation estimate:** 8 test files, ~900-1100 test lines, 88-110 test cases, covering 2249 lines of provider code across 8 files.

---

*Recommendations generated: 2026-03-20*
*Based on: 12-agent research protocol across project artifacts, codebase, git history, and learnings*
