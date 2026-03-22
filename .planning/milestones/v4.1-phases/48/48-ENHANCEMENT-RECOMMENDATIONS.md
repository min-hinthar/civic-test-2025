# Phase 48 Enhancement Recommendations

**Phase:** 48 - Test Infrastructure + Quick Wins
**Generated:** 2026-03-19

---

## Priority Matrix Summary

| Priority | Count | Items |
|----------|-------|-------|
| MUST-HAVE | 4 | E-01, E-02, E-03, E-04 |
| SHOULD-HAVE | 4 | E-05, E-06, E-07, E-08 |
| NICE-TO-HAVE | 4 | E-09, E-10, E-11, E-12 |

---

## Recommendations

### E-01: MockAudioElement in Global Test Setup (MUST-HAVE)

**What:** Add a MockAudioElement class to `src/__tests__/setup.ts` that supports both property-based event handlers (`el.onended = fn`) and `addEventListener` patterns.

**Why:** Production audio code (`src/lib/audio/audioPlayer.ts`) uses property assignment (`el.onended`, `el.onerror`, `el.onloadedmetadata`). Current test setup only mocks `speechSynthesis`, not `Audio`. Any future audio tests will hit timeouts without this mock.

**Design compliance:** Matches existing global mock pattern (matchMedia, speechSynthesis already mocked in setup.ts).

**Implementation hint:** Add after the speechSynthesis mock block in setup.ts:
```typescript
class MockAudioElement {
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onloadedmetadata: (() => void) | null = null;
  src = '';
  currentTime = 0;
  play() { Promise.resolve().then(() => this.onended?.()); return Promise.resolve(); }
  pause() {}
  load() { Promise.resolve().then(() => this.onloadedmetadata?.()); }
}
window.Audio = MockAudioElement as unknown as typeof Audio;
```

---

### E-02: Pre-commit CSS Linting (MUST-HAVE)

**What:** Add `*.css` pattern to `.lintstagedrc.json` to run stylelint on changed CSS files before commit.

**Why:** CSS specificity bugs (prismatic-border overriding .fixed, Tailwind class order shifts) were caught only in production or manual testing. The prismatic-border bug (learnings/css-specificity.md) would have been caught by pre-commit stylelint.

**Design compliance:** Extends existing Husky + lint-staged infrastructure. Consistent with project's "catch regressions at commit time" philosophy.

**Implementation hint:**
```json
{
  "*.{ts,tsx}": ["pnpm exec eslint --fix", "pnpm exec prettier --write"],
  "*.{js,mjs,json}": ["pnpm exec prettier --write"],
  "*.css": ["pnpm exec stylelint --fix", "pnpm exec prettier --write"]
}
```

---

### E-03: Sentry Fingerprinting Unit Test (MUST-HAVE)

**What:** Write a unit test for `beforeSendHandler` in src/lib/sentry.ts verifying all 6 fingerprint categories work correctly (hydration-mismatch, chunk-load-failure, AbortError filter, network-error, indexeddb-error, tts-error).

**Why:** ERRS-05 is already implemented but has zero test coverage. Any refactor could silently break fingerprinting, causing Sentry issue explosion. The test validates the requirement is complete and prevents regression.

**Design compliance:** Follows existing errorSanitizer.test.ts pattern (90% threshold). Same module boundary.

**Implementation hint:** Create `src/lib/sentry.test.ts`. Mock `@sentry/nextjs`. Call `beforeSendHandler` with synthetic events matching each fingerprint pattern. Assert fingerprint arrays match expected values.

---

### E-04: IndexedDB Mock Utility for renderWithProviders (MUST-HAVE)

**What:** Create a lightweight IndexedDB mock factory that renderWithProviders uses when OfflineProvider, SRSProvider, or SocialProvider are included.

**Why:** 4 of 11 providers call IndexedDB on mount (Auth for bookmarks/settings, Offline for question cache, SRS for deck, Social for streak). Without a mock, provider tests will error silently or require per-test manual setup. Phase 51 needs this for 8 context provider tests.

**Design compliance:** Follows existing mock pattern in bookmarkSync.test.ts and settingsSync.test.ts. Uses vi.mock for idb-keyval.

**Implementation hint:** Create `src/__tests__/utils/mocks/indexedDb.ts` with get/set/del/keys stubs backed by a Map. Auto-applied when preset includes offline/srs/social providers.

---

### E-05: Coverage Snapshot Before Threshold Setting (SHOULD-HAVE)

**What:** Run `pnpm test:coverage` and capture actual per-file coverage numbers BEFORE setting thresholds. Store snapshot in `.planning/phases/48/coverage-baseline.md`.

**Why:** Setting aspirational thresholds higher than actual coverage will immediately break CI. The git history shows this was learned the hard way (commit f46e647: "fix(ci): use per-file coverage thresholds instead of global 70%").

**Design compliance:** Data-driven approach consistent with project's evidence-based decision making.

**Implementation hint:** Run coverage, extract JSON summary, set each file's threshold to floor(actual - 2%) for buffer.

---

### E-06: Playwright .gitignore Entries (SHOULD-HAVE)

**What:** Add Playwright-specific entries to `.gitignore`: `test-results/`, `playwright-report/`, `blob-report/`, `e2e/.auth/`.

**Why:** Playwright generates large report/result directories that should not be committed. Standard Playwright project setup includes these entries.

**Design compliance:** Consistent with existing .gitignore patterns (coverage/, .next/, node_modules/).

**Implementation hint:** Append to existing .gitignore file.

---

### E-07: CI Build-Then-Test Pattern for Playwright (SHOULD-HAVE)

**What:** In CI, build the app once and reuse for both unit tests and Playwright. Avoids building twice.

**Why:** `next build --webpack` takes 30-60 seconds. If Playwright webServer uses `pnpm build && pnpm start`, the app builds twice in CI (once for the build step, once for Playwright). A smarter CI caches the build.

**Design compliance:** Performance optimization consistent with project's webpack build constraint.

**Implementation hint:** In ci.yml, run build step first (already exists), then Playwright uses `pnpm start` (reuses .next/ output).

---

### E-08: requestIdleCallback Mock in Test Setup (SHOULD-HAVE)

**What:** Add `requestIdleCallback` and `cancelIdleCallback` mocks to `src/__tests__/setup.ts`.

**Why:** TTSProvider uses `requestIdleCallback` for engine creation. jsdom doesn't provide this API. Without a mock, TTSProvider tests that include the real provider (not just a mock) will fail silently.

**Design compliance:** Follows existing setup.ts pattern of mocking missing jsdom APIs.

**Implementation hint:**
```typescript
window.requestIdleCallback = (cb: IdleRequestCallback) => setTimeout(() => cb({} as IdleDeadline), 0) as unknown as number;
window.cancelIdleCallback = (id: number) => clearTimeout(id);
```

---

### E-09: Knip Baseline Report (NICE-TO-HAVE)

**What:** Run Knip with `--reporter json` and save initial findings to `.planning/phases/48/knip-baseline.json`. Categorize findings as "fix now" vs "known acceptable".

**Why:** Knip will likely flag 10-20 items on first run. Documenting the baseline prevents future developers from re-investigating known acceptable items.

**Design compliance:** Consistent with project's documentation-first approach to technical decisions.

**Implementation hint:** Run `npx knip --reporter json > .planning/phases/48/knip-baseline.json`. Review output, create `.knipignore` or `knip.json` entries for acceptable items.

---

### E-10: Navigator.onLine Mock for Offline Tests (NICE-TO-HAVE)

**What:** Add a configurable `navigator.onLine` mock to the renderWithProviders utility.

**Why:** OfflineProvider reads `navigator.onLine` to determine network state. Tests for offline behavior need to control this value. Currently no mock exists in setup.ts.

**Design compliance:** Follows existing mock pattern. Enables Phase 50 PWA resilience testing.

**Implementation hint:** In renderWithProviders options, accept `onLine: boolean` and set `Object.defineProperty(navigator, 'onLine', { value: options.onLine, configurable: true })` before render.

---

### E-11: Test File Organization Guide (NICE-TO-HAVE)

**What:** Add a comment block at the top of `src/__tests__/utils/renderWithProviders.tsx` documenting: when to use each preset, what mocks each preset includes, and examples for common test scenarios.

**Why:** The codebase currently has 4 different wrapper patterns across test files (KeywordHighlight, tts.integration, feedbackPanel, errorBoundary). Without clear documentation, developers will continue creating ad-hoc wrappers.

**Design compliance:** Follows project convention of inline documentation over separate docs files.

**Implementation hint:** JSDoc block with @example tags showing minimal, core, and full preset usage.

---

### E-12: RLS Policy Cleanup Migration Script (NICE-TO-HAVE)

**What:** Create a SQL migration script in `supabase/migrations/` (or append to schema.sql) that removes the 5 redundant INSERT policies.

**Why:** Direct schema.sql edits require re-applying the full schema. A migration script is safer for production databases and provides an audit trail.

**Design compliance:** Follows Supabase migration conventions.

**Implementation hint:**
```sql
-- Migration: remove redundant INSERT policies (covered by ALL policies)
drop policy if exists "Users can insert own streak data" on public.streak_data;
drop policy if exists "Users can insert own badges" on public.earned_badges;
drop policy if exists "Users can insert own settings" on public.user_settings;
drop policy if exists "Users can insert own bookmarks" on public.user_bookmarks;
drop policy if exists "Users can insert their own mock tests" on public.mock_tests;
```

---

## Implementation Priority Flow

```
MUST-HAVE (block Phase 49):
  E-01 MockAudioElement  ─┐
  E-04 IndexedDB mock     ├─→ renderWithProviders depends on these
  E-08 requestIdleCallback─┘
  E-02 Pre-commit CSS     ─→  CI hardening
  E-03 Sentry test        ─→  ERRS-05 verification

SHOULD-HAVE (improve quality):
  E-05 Coverage snapshot  ─→  Before setting thresholds
  E-06 Playwright gitignore ─→  With Playwright setup
  E-07 CI build optimization ─→  With CI changes

NICE-TO-HAVE (polish):
  E-09 Knip baseline      ─→  After Knip install
  E-10 navigator.onLine   ─→  After renderWithProviders
  E-11 Test org guide      ─→  After renderWithProviders
  E-12 RLS migration       ─→  After schema.sql cleanup
```

---

*Enhancement recommendations generated: 2026-03-19*
*Protocol: 12-agent deep analysis synthesis*
