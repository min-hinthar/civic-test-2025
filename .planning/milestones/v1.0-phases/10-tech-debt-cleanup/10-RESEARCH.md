# Phase 10: Tech Debt Cleanup - Research

**Researched:** 2026-02-08
**Domain:** Codebase cleanup, test coverage, bilingual consistency, verification artifacts
**Confidence:** HIGH

## Summary

Phase 10 closes all 8 tech debt items identified in the v1.0 Milestone Audit. The work is entirely internal to the existing codebase -- no new libraries, no new features, no architectural changes. Every item has been investigated in the source code and the exact changes needed are documented below.

The work divides cleanly into 4 plans across 2 waves: (1) bilingual toast audit + code cleanup can run in parallel, then (2) test coverage + verification/accessibility audit can run in parallel.

**Primary recommendation:** Address each tech debt item surgically. The toast system has a clear dual-architecture issue (two separate toast systems coexist) that must be understood before converting callsites.

## Standard Stack

No new libraries needed. This phase operates entirely within the existing stack:

### Core (already installed)
| Library | Purpose | Relevance |
|---------|---------|-----------|
| Vitest + @vitejs/plugin-react | Test runner | Adding new test files |
| @vitest/coverage-v8 | Coverage provider | Measuring coverage improvement |
| @radix-ui/react-toast | Toast primitives | The Radix-based toast system (in `src/components/ui/Toast.tsx`) |
| BilingualToast (custom) | Bilingual toast context | The newer bilingual toast system (in `src/components/BilingualToast.tsx`) |

### Alternatives Considered
None. This is cleanup work, not new feature work.

**Installation:** No installs needed.

## Architecture Patterns

### Critical Finding: Dual Toast Architecture

The codebase has TWO independent toast systems that coexist:

**System A: Radix-based toast (`src/components/ui/use-toast.ts` + `Toast.tsx` + `toaster.tsx`)**
- Imported as `import { toast } from '@/components/ui/use-toast'`
- Accepts `{ title, titleMy?, description, descriptionMy?, variant? }`
- Uses `@radix-ui/react-toast` primitives with spring animations
- Positioned at bottom-center
- **Used by:** TestPage, AuthPage, PasswordUpdatePage, PasswordResetPage, GoogleOneTapSignIn, AppNavigation, OfflineContext, useSyncQueue
- The legacy `toast()` export is a **console.warn shim** -- it does NOT actually show toasts. It says "Legacy shim - this gets overridden by the context provider" but the context provider is `ToastContextProvider` from `toaster.tsx`, and in `AppShell.tsx`, the app wraps with `BilingualToast.ToastProvider` instead.
- **KEY INSIGHT:** Looking at AppShell.tsx, the app wraps with `<ToastProvider>` imported from `@/components/BilingualToast`, NOT from `@/components/ui/toaster.tsx`. This means `toast()` calls from `@/components/ui/use-toast` go to the **console.warn shim** and produce NO visible toast.

**System B: BilingualToast (`src/components/BilingualToast.tsx`)**
- Imported as `import { useToast } from '@/components/BilingualToast'`
- Uses `showError()`, `showSuccess()`, `showInfo()`, `showWarning()` methods
- Accepts `BilingualMessage { en: string, my: string }`
- Custom implementation (no Radix), positioned top-right
- **Used by:** useStreak, AddToDeckButton, ShareCardPreview

**CRITICAL FINDING:** The `<ToastContextProvider>` from `toaster.tsx` is NOT mounted in `AppShell.tsx`. Only the `<ToastProvider>` from `BilingualToast.tsx` is mounted. This means:
1. All files importing `toast` from `@/components/ui/use-toast` are calling the **console.warn shim**
2. These toast calls produce **no visible notification** to users
3. The files that DO show visible toasts use `useToast()` from `BilingualToast.tsx`

**Verification needed:** The planner should verify whether the `ToastContextProvider` is mounted somewhere else (e.g., `_app.tsx` or another wrapper), or whether these toast calls are genuinely broken. Based on my reading of AppShell.tsx (the root component), only BilingualToast.ToastProvider is used.

**UPDATE after deeper analysis:** Looking more carefully at `AppShell.tsx` line 133, the `<ToastProvider>` import on line 13 is from `'@/components/BilingualToast'`. However, `toaster.tsx` exports `ToastSetup` which wraps BOTH `ToastContextProvider` and `Toaster`. Since `ToastSetup` is not used in AppShell, the Radix toast system appears unmounted. The `toast()` function from `use-toast.ts` is a legacy shim that logs a warning.

**Resolution path for Plan 10-01:** Convert all `toast()` calls to use `useToast()` from BilingualToast, OR wire up the Radix `ToastContextProvider`/`Toaster` in AppShell alongside BilingualToast. The simpler approach is converting to BilingualToast since it's the active system.

### Toast Callsite Inventory (files needing conversion)

Files importing `toast` from `@/components/ui/use-toast` (System A - broken shim):
1. **`src/pages/TestPage.tsx`** - 3 toast calls (lines 262, 298, 305)
   - "Please finish the mock test first!" (warning, has Burmese in `lockMessage`)
   - "Mock test saved" + description (default, English-only description)
   - "Unable to save test" (warning, English-only)
2. **`src/pages/AuthPage.tsx`** - 3 toast calls (lines 24, 30, 36)
   - "Welcome back!" (has inline Burmese in description)
   - "Account created!" (has inline Burmese in description)
   - "Check your inbox" (has inline Burmese in description)
3. **`src/pages/PasswordUpdatePage.tsx`** - 4 toast calls (lines 20, 33, 41, 51)
   - "Open from the secure email link" (destructive, has Burmese)
   - "Passwords must match" (warning, has Burmese)
   - "Password too short" (warning, has Burmese)
   - "Password updated!" (default, has Burmese)
4. **`src/pages/PasswordResetPage.tsx`** - 1 toast call (line 21)
   - "Reset email sent" (default, has Burmese in description)
5. **`src/components/GoogleOneTapSignIn.tsx`** - 3 toast calls (lines 24, 30, 90)
   - "Signed in with Google" (default, English-only description with emoji)
   - "Google sign-in blocked" (destructive, English-only)
   - "Google sign-in unavailable" (destructive, English-only)
6. **`src/components/AppNavigation.tsx`** - 1 toast call (line 58)
   - "Please finish your mock test first!" (warning, has Burmese in lockMessage)
7. **`src/contexts/OfflineContext.tsx`** - 2 toast calls (lines 145, 151)
   - Sync success (default, has Burmese in description field)
   - Sync failure (warning, has Burmese in description field)
8. **`src/hooks/useSyncQueue.ts`** - 2 toast calls (lines 79, 84)
   - Sync success (default, has Burmese in description)
   - Sync failure (warning, has Burmese in description)

**Total: 8 files, 19 toast calls need conversion to BilingualToast system.**

Files already using BilingualToast (System B - working):
- `src/hooks/useStreak.ts` - uses `useToast()` from BilingualToast
- `src/components/srs/AddToDeckButton.tsx` - uses `useToast()` from BilingualToast
- `src/components/social/ShareCardPreview.tsx` - uses `useToast()` from BilingualToast

### Conversion Pattern

Current broken pattern:
```typescript
import { toast } from '@/components/ui/use-toast';
// ...
toast({
  title: 'English title',
  description: 'English description. မြန်မာစာ။',
  variant: 'warning',
});
```

Target working pattern:
```typescript
import { useToast } from '@/components/BilingualToast';
// Inside component:
const { showSuccess, showWarning, showError, showInfo } = useToast();
// ...
showWarning({
  en: 'English title: English description',
  my: 'မြန်မာစာ ခေါင်းစဉ်: မြန်မာစာ ဖော်ပြချက်',
});
```

**Important constraint:** BilingualToast uses `useToast()` hook, which requires being inside a React component (not a plain function). Files like `OfflineContext.tsx` and `useSyncQueue.ts` that use `toast()` as a standalone function will need refactoring to use the hook pattern. The OfflineContext is a component so it can use hooks. useSyncQueue is a hook so it can also use hooks.

**Variant mapping:**
- `variant: 'destructive'` -> `showError()`
- `variant: 'warning'` -> `showWarning()`
- no variant / `variant: 'default'` -> `showSuccess()` or `showInfo()`

### Deprecated Import Path

Files using deprecated `@/constants/civicsQuestions`:
1. **`src/pages/TestPage.tsx`** line 10: `import { civicsQuestions } from '@/constants/civicsQuestions'`
2. **`src/pages/StudyGuidePage.tsx`** line 8: `import { civicsQuestions } from '@/constants/civicsQuestions'`

Both should change to:
```typescript
import { allQuestions } from '@/constants/questions';
```

And update all references from `civicsQuestions` to `allQuestions`. The compatibility layer at `src/constants/civicsQuestions.ts` can then be deleted.

**TestPage already imports `allQuestions`** (line 35): `import { allQuestions } from '@/constants/questions'` -- it has BOTH imports. The deprecated one is used for question pool, while the new one is used elsewhere. Need to consolidate.

**StudyGuidePage uses `civicsQuestions` throughout** (lines 8, 51, 59, 91, 92, 157, 284, 462, 731) -- approximately 9 references that need renaming.

### TypeScript Errors in StudyGuidePage.tsx

The audit mentions "Pre-existing TypeScript errors in StudyGuidePage.tsx reported in 09-10 and 09-12 summaries." Running `npx tsc --noEmit` produced no output (zero errors). This means either the errors were fixed in a later phase or they were transient. **No TS errors currently exist.**

### Test Coverage Analysis

Current state (from `npx vitest run --coverage`):
- **108 tests passing** across 6 test files
- **Overall coverage: 3.15% statements** (far below 70% target)
- **src/lib: 34.58% statements** (best covered area)
- **src/lib/mastery: 51.51% statements** (calculateMastery.test.ts has 32 tests)

Existing test files:
| File | Tests | Coverage Target |
|------|-------|----------------|
| `src/__tests__/shuffle.test.ts` | 7 | 100% (met) |
| `src/__tests__/saveSession.test.ts` | 6 | 70% (met) |
| `src/__tests__/errorSanitizer.test.ts` | 49 | 90% (met) |
| `src/__tests__/errorBoundary.test.tsx` | 11 | 70% (met) |
| `src/__tests__/navigationLock.test.ts` | 3 | N/A |
| `src/lib/mastery/calculateMastery.test.ts` | 32 | N/A |

**Per-file thresholds configured in vitest.config.ts:**
- `src/lib/shuffle.ts`: 100%
- `src/lib/saveSession.ts`: 70%
- `src/lib/errorSanitizer.ts`: 90%
- `src/components/ErrorBoundary.tsx`: 70%

**NOTE:** The 70% threshold in vitest.config.ts is only per-file, NOT global. There is no global threshold set. The "70% coverage threshold" from FNDN-08 refers to having these per-file thresholds configured, which they are.

### Best Candidates for New Tests (pure functions, no IndexedDB/Supabase mocks needed)

**Tier 1 - Pure functions, easy to test, high value:**
1. **`src/lib/social/compositeScore.ts`** - `calculateCompositeScore()` - pure math, 1 function, ~15 lines
2. **`src/lib/social/streakTracker.ts`** - `calculateStreak()`, `shouldAutoUseFreeze()`, `checkFreezeEligibility()` - pure functions on date arrays, ~180 lines
3. **`src/lib/mastery/weakAreaDetection.ts`** - `detectWeakAreas()`, `detectStaleCategories()`, `getNextMilestone()` - pure functions on arrays, ~137 lines
4. **`src/lib/srs/fsrsEngine.ts`** - `createNewSRSCard()`, `gradeCard()`, `isDue()`, `getNextReviewText()`, `getCardStatusLabel()`, `getIntervalStrengthColor()` - thin wrappers, ~183 lines
5. **`src/lib/mastery/nudgeMessages.ts`** - `getEncouragingMessage()`, `getNudgeMessage()`, `getLevelUpMessage()`, `getUnattemptedMessage()` - deterministic string functions, ~162 lines
6. **`src/lib/social/badgeEngine.ts`** - `evaluateBadges()`, `getNewlyEarnedBadge()` - pure functions on definitions + data, ~56 lines

**Tier 2 - Need mocks for IndexedDB/async but still valuable:**
7. **`src/lib/practice/questionSelection.ts`** - needs `getAnswerHistory()` mock
8. **`src/lib/social/badgeDefinitions.ts`** - badge definition check functions

### Phase 02 and Phase 09 Verification Artifacts

Both phases have SUMMARY.md files documenting all executed plans:
- **Phase 02:** 6 SUMMARYs (02-01 through 02-06)
- **Phase 09:** 12 SUMMARYs (09-01 through 09-12)

Neither has a formal VERIFICATION.md. The plan calls for creating these artifacts following the same format as existing verification files (see `01-VERIFICATION.md`, `08-VERIFICATION.md` for template). The verifier needs to:
1. List observable truths from each phase's plans
2. Check artifacts exist in source code
3. Run commands to verify functionality
4. Document status (passed/gaps_found)

### Keyboard Accessibility Findings

The audit item says "Keyboard accessibility and loading skeleton behavior not human-verified" (UIUX-06/UIUX-07). The plan calls for documenting findings, not necessarily fixing issues. This means:
1. Navigate through the app using keyboard only (Tab, Enter, Escape, Arrow keys)
2. Check all interactive elements are reachable
3. Check all dialogs trap focus
4. Check loading skeletons render correctly
5. Document findings in the verification artifact

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Toast notifications | Custom toast | Existing BilingualToast system | Already built and working |
| Test framework | Custom test harness | Vitest (already configured) | Already configured with coverage |
| Verification format | Ad-hoc format | Follow existing VERIFICATION.md template | Consistency with 01/03/04/05/06/07/08 |

**Key insight:** All 8 tech debt items are surgical changes to existing code. No new systems or abstractions needed.

## Common Pitfalls

### Pitfall 1: Converting toast() Outside React Components
**What goes wrong:** The `toast()` function from use-toast.ts can be called from anywhere (it's a standalone function). The `useToast()` hook from BilingualToast can ONLY be called inside React components/hooks.
**Why it happens:** Different API design between the two systems.
**How to avoid:** Verify each file's context. All 8 files using `toast()` are either React components or custom hooks, so `useToast()` works in all cases. For OfflineContext.tsx (a provider component) and useSyncQueue.ts (a hook), the hook pattern works fine.
**Warning signs:** ESLint rules-of-hooks violations.

### Pitfall 2: Inconsistent BilingualMessage Format
**What goes wrong:** Some current toast calls have Burmese text embedded in the `description` field (e.g., "English text. မြန်မာစာ။") rather than in a separate `descriptionMy` field. When converting to BilingualToast, the `en` and `my` fields should be clean separations.
**Why it happens:** The old Radix toast system supported both `description` (English) and `descriptionMy` (Burmese) but many callsites concatenated both into `description`.
**How to avoid:** During conversion, split concatenated English+Burmese text into separate `en` and `my` fields.

### Pitfall 3: Forgetting to Remove the Compatibility Layer
**What goes wrong:** After converting TestPage and StudyGuidePage to use `@/constants/questions`, the file `src/constants/civicsQuestions.ts` should be deleted. If left, it becomes a misleading import target.
**How to avoid:** Delete the file AND verify no other files import from it (search for `civicsQuestions` across the entire codebase after changes).

### Pitfall 4: Coverage Threshold Expectations
**What goes wrong:** Trying to reach 70% global coverage is unrealistic for this phase -- pages and components with JSX are hard to unit-test without heavy mocking.
**Why it happens:** The 70% threshold is per-file for specific modules, not global.
**How to avoid:** Focus on adding tests for pure-function modules (Tier 1 list above). Adding 6 test files for pure functions would meaningfully improve `src/lib` coverage from 34.58%.

### Pitfall 5: React Compiler ESLint Rules
**What goes wrong:** New test files may not trigger compiler issues, but modified source files could. The project uses React Compiler ESLint rules that are stricter than standard.
**Why it happens:** Rules like `react-hooks/set-state-in-effect` and `react-hooks/refs` may trigger on modified code.
**How to avoid:** Run `npm run lint` after every modification. Known patterns from MEMORY.md: no setState in effects, no ref.current during render, no `useMemo<Type>()` generic syntax.

### Pitfall 6: Two ToastProvider Wrappers Could Conflict
**What goes wrong:** If the planner decides to wire up BOTH the Radix ToastContextProvider AND BilingualToast.ToastProvider, they may conflict visually (two toast stacks at different positions).
**How to avoid:** Pick ONE system and migrate everything to it. The BilingualToast system is the one actively mounted and working -- migrate everything there and then clean up the unused Radix toast system.

## Code Examples

### Converting a toast() call to BilingualToast

Before (broken - System A shim):
```typescript
// src/pages/AuthPage.tsx
import { toast } from '@/components/ui/use-toast';

// In handler:
toast({
  title: 'Welcome back!',
  description: 'ကြိုဆိုပါတယ်! သင့်အကောင့်သို့ ဝင်ရောက်ပြီးပါပြီ',
});
```

After (working - System B):
```typescript
// src/pages/AuthPage.tsx
import { useToast } from '@/components/BilingualToast';

// In component:
const { showSuccess } = useToast();

// In handler:
showSuccess({
  en: 'Welcome back! You are signed in.',
  my: 'ကြိုဆိုပါတယ်! သင့်အကောင့်သို့ ဝင်ရောက်ပြီးပါပြီ',
});
```

### Converting deprecated import

Before:
```typescript
import { civicsQuestions } from '@/constants/civicsQuestions';
// ... civicsQuestions.filter(...)
```

After:
```typescript
import { allQuestions } from '@/constants/questions';
// ... allQuestions.filter(...)
```

### Pure function test pattern (e.g., compositeScore)

```typescript
// src/lib/social/compositeScore.test.ts
import { describe, it, expect } from 'vitest';
import { calculateCompositeScore } from './compositeScore';

describe('calculateCompositeScore', () => {
  it('returns 0 for all zeros', () => {
    expect(calculateCompositeScore({
      currentStreak: 0,
      bestTestAccuracy: 0,
      coveragePercent: 0,
    })).toBe(0);
  });

  it('caps streak at 30 days', () => {
    const with30 = calculateCompositeScore({ currentStreak: 30, bestTestAccuracy: 0, coveragePercent: 0 });
    const with60 = calculateCompositeScore({ currentStreak: 60, bestTestAccuracy: 0, coveragePercent: 0 });
    expect(with30).toBe(with60); // Both capped
  });

  it('weights accuracy at 50%', () => {
    expect(calculateCompositeScore({
      currentStreak: 0,
      bestTestAccuracy: 100,
      coveragePercent: 0,
    })).toBe(50);
  });
});
```

### Streak tracker test pattern

```typescript
// src/lib/social/streakTracker.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateStreak, shouldAutoUseFreeze, checkFreezeEligibility } from './streakTracker';

describe('calculateStreak', () => {
  it('returns 0 for empty activity', () => {
    expect(calculateStreak([], [])).toEqual({ current: 0, longest: 0 });
  });

  // Mock Date.now for deterministic date-based tests
  // Use vi.useFakeTimers() for testing getLocalDateString
});
```

## State of the Art

No version changes or library updates needed. This phase is purely about code quality.

| Item | Current State | Target State | Impact |
|------|---------------|--------------|--------|
| Toast calls | 19 calls using broken shim | All calls use working BilingualToast | Users see notifications |
| Deprecated imports | 2 files use @/constants/civicsQuestions | All use @/constants/questions | Clean imports |
| Test coverage (src/lib) | 34.58% | ~50%+ with new test files | Better regression safety |
| Phase 02 verification | Missing | 02-VERIFICATION.md created | Complete audit trail |
| Phase 09 verification | Missing | 09-VERIFICATION.md created | Complete audit trail |
| Keyboard accessibility | Not documented | Findings documented | Accessibility audit trail |
| TS errors | 0 (already clean) | 0 | Confirmed clean |
| Streak recording | Indirect via masteryStore chain | Documented as acceptable pattern | Acknowledged tech debt |

## Open Questions

1. **Are toast calls from use-toast.ts actually visible?**
   - What we know: AppShell.tsx only mounts BilingualToast.ToastProvider, not the Radix ToastContextProvider/Toaster. The `toast()` export from use-toast.ts is a console.warn shim.
   - What's unclear: Could there be another mount point in pages/_app.tsx or elsewhere that wires up the Radix system?
   - Recommendation: Verify in browser by triggering one of these toast calls and checking console for the warning. If confirmed broken, converting is both a bilingual fix AND a bug fix.
   - **Confidence: HIGH** that these are broken -- AppShell is the root component and it doesn't use the Radix toast provider.

2. **Should the Radix toast system be removed entirely?**
   - What we know: After converting all callsites to BilingualToast, the files `use-toast.ts`, `Toast.tsx`, and `toaster.tsx` become unused.
   - Recommendation: Remove them in Plan 10-02 (code cleanup) to avoid future confusion. This removes ~230 lines of dead code.

3. **Streak recording tech debt -- should it be fixed?**
   - What we know: Test streak recording flows through `masteryStore.recordAnswer` -> `recordStudyActivity`, which works but is inconsistent with direct recording for other activity types.
   - Recommendation: Document as accepted pattern in Phase 07 verification notes. The current approach is functionally correct.

## Sources

### Primary (HIGH confidence)
- Direct source code reading of all affected files (absolute paths documented in callsite inventory)
- `npx tsc --noEmit` - confirmed zero TypeScript errors
- `npx vitest run --coverage` - confirmed 108 tests, 3.15% overall / 34.58% src/lib coverage

### Secondary (MEDIUM confidence)
- v1.0-MILESTONE-AUDIT.md - authoritative list of 8 tech debt items
- Existing VERIFICATION.md files (01, 03, 04, 05, 06, 07, 08) - template for new verification artifacts

## Metadata

**Confidence breakdown:**
- Toast architecture analysis: HIGH - read all source files, traced provider mounting
- Deprecated imports: HIGH - grep confirmed exactly 2 files
- Test coverage: HIGH - ran vitest with coverage, measured actual numbers
- TS errors: HIGH - ran tsc, confirmed zero errors
- Verification format: HIGH - read existing verification files for template

**Research date:** 2026-02-08
**Valid until:** N/A (tech debt is static until addressed)
