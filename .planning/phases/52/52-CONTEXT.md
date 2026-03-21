# Phase 52: E2E Critical Flows + Accessibility - Context

**Gathered:** 2026-03-20
**Status:** Ready for planning

<domain>
## Phase Boundary

7 Playwright E2E tests covering critical user flows (auth, mock test, practice, flashcard sort, offline sync, interview, SW update). Automated WCAG 2.2 AA scans via axe-core on 4 pages. Touch target 44px audit and fixes across 30+ component directories. Glass-morphism dark mode contrast verification and fixes (VISC-05 resolution). InterviewSession decomposition is Phase 53.

</domain>

<decisions>
## Implementation Decisions

### E2E Test Coverage & Assertion Depth
- **D-01:** Each E2E test covers happy path + 1 key error/edge case (not exhaustive error testing)
- **D-02:** Mock test lifecycle (TEST-04) answers 3 questions (1 correct, 1 wrong, 1 skip) then fast-forwards to results — full 20 is too slow for E2E
- **D-03:** Offline sync (TEST-07) tests answer sync + settings LWW merge. Bookmark sync deferred.
- **D-04:** Flow tests run in default theme only. Dark mode coverage via WCAG scans (A11Y-01).
- **D-05:** Interview E2E (TEST-08) tests Practice mode only — has more UI surface (colored progress, keyword feedback, answer read-aloud). Real mode is a visual subset.
- **D-06:** 60-second timeout per E2E test. Animation waits + CI rendering overhead require headroom.
- **D-07:** At least one E2E test verifies bilingual rendering — language toggle switches visible content.
- **D-08:** SW update E2E (TEST-09) must test session-lock deferral — mock active session, verify toast deferred until session ends. Key Phase 50 deliverable.

### Accessibility Fix Visual Impact
- **D-09:** Glass-heavy dark mode contrast fix: increase opacity from 0.35 to 0.45. Minimal visual change, maximum contrast improvement.
- **D-10:** Touch target 44px fixes use `min-h-[44px]` with unchanged padding — tap area grows, visual footprint stays similar.
- **D-11:** Color-only indicators get `aria-label` attributes for screen readers. No visible icon additions — preserves visual design.
- **D-12:** Success/warning contrast fix: darken text to green-700/amber-700. Don't change background tokens (cascading risk).
- **D-13:** Myanmar text on glass surfaces: increase font-weight to 500 (medium) in dark mode. Improves legibility without visual disruption.
- **D-14:** Focus rings on dark glass use `--color-primary` instead of `--color-ring` for higher contrast.
- **D-15:** Touch target audit is standalone `e2e/touch-targets.spec.ts` with custom size-checking logic, not part of WCAG scan.
- **D-16:** Tab-bar items get explicit `focus-visible:ring-2` — active state color serves mouse users, focus ring serves keyboard users.

### Test Organization & CI Integration
- **D-17:** E2E fixtures use Playwright `test.extend()` pattern — auto-cleanup, composable, idiomatic.
- **D-18:** E2E tests run on PR only, not every push. Unit tests are the push-level regression gate.
- **D-19:** axe-core scans in separate `e2e/wcag-scan.spec.ts` — compliance is orthogonal to flow correctness.
- **D-20:** 1 retry on CI, 0 retries locally. Trace captured on first retry for debugging.
- **D-21:** All E2E tests use `emulateMedia({ reducedMotion: 'reduce' })` — faster execution + covers reduced-motion accessibility path.
- **D-22:** Parallel execution (`fullyParallel: true` already configured). Fresh context per test ensures isolation.
- **D-23:** vitest-axe expansion targets prioritized list of components with known violations (from precontext gotchas), not all 183 component files.
- **D-24:** A11y unit tests go in `src/__tests__/a11y/` — matches existing pattern from Phase 48.

### Compliance Scope & Exceptions
- **D-25:** axe-core `color-contrast` rule disabled per-element on `.glass-*` selectors, not globally. Other elements must pass.
- **D-26:** SHOULD-HAVE recommendations included: #7 (reduced motion E2E path), #8 (focus ring standardization). Deferred: #9 (Myanmar weight bump — D-13 covers glass only), #10 (error boundary E2E — defer to Phase 53).
- **D-27:** NICE-TO-HAVE #12 (touch target regression test) included for CI enforcement. #11 (glass contrast doc) deferred — inline comments in CSS suffice.
- **D-28:** WCAG AA baseline. AAA for touch targets (44px = 2.5.5 AAA; project standard since Phase 17).
- **D-29:** Fix all 9+ touch target violation families. Only exception: TourTooltip buttons (onboarding-only, low-priority, low-frequency).
- **D-30:** Error boundary E2E verification deferred to Phase 53. Phase 49 unit tests provide sufficient coverage.
- **D-31:** Glass contrast documented via inline comments in `globals.css` with measured ratios. No separate accessibility doc.
- **D-32:** Documented axe exceptions require: element selector, measured contrast ratio, and justification as inline test comments.

### Claude's Discretion
- Exact Playwright fixture API design and helper naming
- E2E selector strategy (ARIA roles vs text vs CSS selectors)
- Number of vitest-axe component tests to add (prioritized from gotcha list)
- Specific CSS value adjustments for contrast fixes (exact HSL values)
- Test file naming conventions beyond the established `*.spec.ts` pattern
- Whether to split plans by E2E-first vs accessibility-first or interleaved

</decisions>

<specifics>
## Specific Ideas

- E2E auth mocking via `page.route('**/auth/**')` + localStorage session injection — no real Supabase accounts (resolved in precontext research, Decision 1)
- Interview E2E uses `TextAnswerInput.tsx` text fallback, not speech recognition (precontext Decision 7)
- Flashcard sort E2E uses button clicks (Know/Don't Know), not drag gestures — Playwright `dragTo()` flaky on motion/react transforms (precontext Decision 8)
- Questions are bundled in the app (128 hardcoded) — no data seeding infrastructure needed
- `context.setOffline(true/false)` for offline simulation — app checks `navigator.onLine`
- SW update mock: programmatic `updatefound`/`controllerchange` events on mock registration object

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### E2E Infrastructure
- `.planning/phases/52/52-PRECONTEXT-RESEARCH.md` — Full precontext research with 47 gotchas, data contracts, animation timings, and 12 resolved gray areas
- `.planning/phases/52/52-ENHANCEMENT-RECOMMENDATIONS.md` — Ranked recommendations with implementation hints for all 12 items
- `playwright.config.ts` — Existing Playwright config (Chromium-only, webServer, baseURL)
- `e2e/smoke.spec.ts` — Existing smoke test pattern (only 2 tests, no auth/interaction)

### Accessibility baseline
- `src/__tests__/a11y/feedbackPanel.a11y.test.tsx` — Existing vitest-axe pattern with `renderWithProviders`
- `src/__tests__/a11y/toast.a11y.test.tsx` — Existing ARIA structure test pattern

### Glass-morphism & design tokens
- `src/styles/globals.css` §414-578 — Glass-morphism tier definitions, dark mode overrides, fallbacks
- `src/styles/tokens.css` — Design token variables (glass blur, opacity, colors)

### Touch target violations (9+ families)
- `src/components/bilingual/BilingualButton.tsx` — sm variant 40px (D-10)
- `src/components/ui/FlagToggle.tsx` — 36px buttons (D-10)
- `src/components/hub/SubcategoryBar.tsx` — 36px trigger (D-10)
- `src/components/interview/InterviewTranscript.tsx` — 28px buttons (D-10)
- `src/components/practice/PracticeConfig.tsx` — 36px inline buttons (D-10)
- `src/components/explanations/RelatedQuestions.tsx` — 36px buttons (D-10)
- `src/components/hub/AchievementsTab.tsx` — 36px chips and buttons (D-10)

### Phase contracts consumed
- `src/__tests__/utils/renderWithProviders.tsx` — Phase 48: test utility with presets
- `src/lib/pwa/swUpdateManager.ts` — Phase 50: SW update manager for TEST-09 mocking
- `src/lib/settings/settingsSync.ts` — Phase 50: LWW merge for TEST-07 offline sync
- `src/lib/pwa/offlineDb.ts` — Phase 50: IndexedDB cache versioning

### Requirements
- `.planning/REQUIREMENTS.md` — TEST-03 through TEST-09, A11Y-01 through A11Y-04

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `renderWithProviders` (Phase 48): 3 presets (minimal/core/full) — use for vitest-axe component tests
- `e2e/smoke.spec.ts`: Playwright test pattern baseline — extend for 7 flow tests
- `src/__tests__/a11y/feedbackPanel.a11y.test.tsx`: vitest-axe pattern with `axe(container)` → `toHaveNoViolations()`
- `src/lib/a11y/announcer.ts`: Persistent aria-live regions — verify E2E assertions against these
- `src/constants/questions/index.ts`: 128 bundled questions — E2E data source, no seeding needed

### Established Patterns
- Provider test consumer pattern (Phase 51): component reads context, exposes actions via buttons — adapt for a11y tests
- `vi.hoisted()` for mutable mock refs (Phase 51): reuse for auth mocking in vitest-axe tests
- Glass-morphism 3-tier system (`globals.css`): CSS custom properties control opacity/blur — fix via variable override, not class rewrite
- `STORAGE_VERSIONS` constants (Phase 50): as-const pattern for type-safe versioning

### Integration Points
- `ClientProviders.tsx`: Provider tree root — E2E validates full stack renders correctly
- `playwright.config.ts`: Extend with E2E-specific settings (timeouts, retries, reduced motion)
- `vitest.config.ts`: Add per-file thresholds for new a11y test files
- `package.json`: Add `@axe-core/playwright` dev dependency
- `src/styles/globals.css`: Glass contrast fixes (opacity, text color, focus rings)
- `src/styles/tokens.css`: Design token adjustments for contrast compliance

</code_context>

<deferred>
## Deferred Ideas

- Error boundary E2E verification — Phase 53 (after InterviewSession decomposition provides cleaner test surface)
- Myanmar text font-weight boost on non-glass surfaces — evaluate after glass-specific fix (D-13) ships
- Glass contrast formal documentation (`docs/ACCESSIBILITY.md`) — inline CSS comments sufficient for now
- Multi-browser E2E matrix (Firefox, WebKit) — Phase 53+ after Chromium tests prove stable
- Visual regression screenshot baselines — explicitly out of scope (PROJECT.md exclusion)
- Full 20-question mock test E2E — current 3-question fast-forward provides sufficient coverage
- Bookmark sync E2E — lower priority than answer/settings sync

</deferred>

---

*Phase: 52-e2e-critical-flows-accessibility*
*Context gathered: 2026-03-20*
