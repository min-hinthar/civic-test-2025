# Phase 36: Mock Test Celebration Unification - Research

**Researched:** 2026-02-21
**Domain:** React component refactoring, animation choreography integration
**Confidence:** HIGH

## Summary

Phase 36 closes the gap between the Mock Test and Practice result experiences. During Phase 32, the `TestResultsScreen` component was built with a full multi-stage celebration choreography system (card scale-in, count-up, pass/fail reveal, confetti, sound, haptics, staggered buttons). The `PracticeResults` component correctly delegates to `TestResultsScreen` with `mode="practice"`, receiving the full choreographed experience. However, the **Mock Test results in `TestPage.tsx` still use a legacy inline `resultView` JSX block** (lines 1029-1377) that predates the Phase 32 celebration system. This inline view uses basic `Confetti` + `CountUpScore` with `playMilestone()`/`playLevelUp()` callbacks -- it does **not** use `celebrate()`, `playCelebrationSequence()`, `hapticHeavy()`, or the multi-stage choreography state machine.

The fix is surgical: replace the inline `resultView` in `TestPage.tsx` with the shared `TestResultsScreen` component, exactly as `PracticeResults.tsx` does. The shared component already handles both `mode="mock-test"` and `mode="practice"` correctly -- it has the proper pass threshold logic (12 for mock test), appropriate choreography paths, teaser confetti, haptic progression, and fail-state handling.

**Primary recommendation:** Replace the 350-line inline `resultView` in `TestPage.tsx` with a `<TestResultsScreen>` component invocation, passing the necessary props. Remove the now-unused inline results state/handlers (`showConfetti`, `showAllResults`, `handleScoreCountComplete`, `shareCardData`, `completionMessage`, inline `resultView` JSX). This also removes ~15 unused imports and 300+ lines of duplicated code.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CELB-04 | Multi-stage TestResultsScreen choreography: card scale-in, count-up, pass/fail reveal, confetti, sound, action buttons stagger | TestResultsScreen already implements full choreography for both modes. TestPage's inline resultView lacks it entirely. Replacing with TestResultsScreen closes the gap. |
| CELB-05 | Haptic patterns fire at celebration peaks -- synchronized with confetti and sound | TestResultsScreen's `runChoreography()` calls `hapticLight()` (card-enter), `hapticMedium()` (count-up-land), `hapticHeavy()` (pass-fail reveal). TestPage's inline view has zero haptic calls in results. Replacing with TestResultsScreen closes the gap. |
| CELB-08 | `playCelebrationSequence(stage)` sound function for multi-stage choreography timing | TestResultsScreen's `runChoreography()` calls `playCelebrationSequence('card-enter')`, `playCelebrationSequence('count-up-land')`, `playCelebrationSequence('pass-reveal')`, `playCelebrationSequence('count-up-tick')`. TestPage's inline view only calls `playMilestone()`/`playLevelUp()` in a simple callback. Replacing with TestResultsScreen closes the gap. |
</phase_requirements>

## Standard Stack

### Core (already in project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react | 19.x | UI framework | Already in project |
| motion/react | 12.x | Animation (spring physics, AnimatePresence) | Already used by TestResultsScreen |
| react-countup | ^6 | CountUpScore dramatic easing | Already used by TestResultsScreen |
| canvas-confetti | ^1 | Confetti particle effects | Already used via Confetti.tsx |

### Supporting (already in project)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| clsx | ^2 | Conditional class composition | Already used throughout |
| lucide-react | latest | Icons (Trophy, RotateCcw, etc.) | Already used by TestResultsScreen |

### Alternatives Considered
None. No new libraries needed. This phase uses only existing project infrastructure.

**Installation:** No new packages required.

## Architecture Patterns

### Current Architecture (The Gap)

```
Practice Flow:
  PracticeSession → (finishes) → PracticeResults → TestResultsScreen (mode="practice")
                                                     ↳ Full choreography, haptics, sounds

Mock Test Flow:
  TestPage → (finishes) → TestPage inline resultView  ← PROBLEM: No choreography
                          ↳ Basic Confetti + CountUpScore + playMilestone()
                          ↳ No celebrate(), no haptics, no playCelebrationSequence()
                          ↳ 350 lines of duplicated result rendering code
```

### Target Architecture (After Phase 36)

```
Practice Flow:
  PracticeSession → (finishes) → PracticeResults → TestResultsScreen (mode="practice")
                                                     ↳ Full choreography, haptics, sounds

Mock Test Flow:
  TestPage → (finishes) → TestResultsScreen (mode="mock-test")  ← UNIFIED
                           ↳ Full choreography, haptics, sounds
                           ↳ Same component as Practice, different mode
```

### Pattern: Replace Inline View with Shared Component

**What:** Replace TestPage's 350-line inline `resultView` with `<TestResultsScreen>` component call
**When to use:** When a shared component already handles the exact use case with a `mode` prop

**Prop mapping (TestPage inline → TestResultsScreen props):**

```typescript
// Current TestPage inline resultView uses these data points:
// - finalResults (quizState.results when finished)
// - finalCorrect, finalIncorrect
// - questions
// - endReasonForDisplay
// - timeLeft (TEST_DURATION_SECONDS - timeLeft = timeTaken)
// - showBurmese
// - shareCardData (derived from finalResults)
// - navigate('/dashboard') for home
// - window.location.reload() for retry

// TestResultsScreen expects:
<TestResultsScreen
  results={finalResults}
  questions={questions}
  mode="mock-test"
  endReason={endReasonForDisplay}
  timeTaken={TEST_DURATION_SECONDS - timeLeft}
  showBurmese={showBurmese}
  onRetry={() => window.location.reload()}
  onReviewWrongOnly={() => {/* scroll handled internally */}}
  onHome={() => navigate('/dashboard')}
/>
```

### Pattern: Dead Code Removal

After replacing the inline `resultView`, the following become unused in TestPage.tsx and can be removed:

**State that becomes unused:**
- `showConfetti` / `setShowConfetti`
- `showAllResults` / `setShowAllResults`

**Handlers that become unused:**
- `handleScoreCountComplete` (simple callback that just triggered confetti + played sounds)

**Computed values that become unused:**
- `shareCardData` (TestResultsScreen computes its own internally)
- `completionMessage` record (TestResultsScreen has its own `completionMessages`)
- `finalIncorrect` (only used in inline resultView)

**Imports that become unused after removing the inline resultView and associated code:**
- `Sparkles` from lucide-react (only used in retry button in resultView)
- `BilingualHeading` (only used in resultView header)
- `BilingualButton` (only used in resultView buttons)
- `Confetti` (the direct Confetti component; celebrate() is used via CelebrationOverlay instead)
- `CountUpScore` (TestResultsScreen imports its own)
- `ExplanationCard` (used in inline result cards)
- `WeakAreaNudge` (TestResultsScreen has its own)
- `ShareButton` (TestResultsScreen has its own)
- `Filter` from lucide-react (only used in inline filter toggle)
- `FadeIn` (only used in inline resultView)
- `playCorrect`, `playIncorrect` stay (used during quiz)
- `playLevelUp`, `playMilestone` may become unused (only used in handleScoreCountComplete)
- `detectWeakAreas`, `getCategoryQuestionIds`, `USCIS_CATEGORIES` (used in inline weak area nudge)
- `USCISCategory`, `CategoryMasteryEntry` types (used in inline weak area)
- `AddToDeckButton` (used in inline result cards)
- `DynamicAnswerNote` -- check if also used in active quiz view (yes, line 924) so keep it

**Note:** Must verify each import/variable is actually unused after the change. Some imports serve double duty between activeView and resultView.

### Anti-Patterns to Avoid

- **Don't modify TestResultsScreen to accommodate TestPage specifics.** The shared component already handles `mode="mock-test"` correctly. If something seems wrong, it is the inline view that was wrong, not the shared component.
- **Don't keep the inline resultView as a fallback.** Full replacement is the goal. The shared component is battle-tested via PracticeResults.
- **Don't add new props to TestResultsScreen.** It already accepts everything needed: `results`, `questions`, `mode`, `endReason`, `timeTaken`, `showBurmese`, `onRetry`, `onReviewWrongOnly`, `onHome`. The `previousAttempts` and `skippedQuestionIds` props are optional and not needed for basic mock test results.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Celebration choreography | Custom animation sequencing in TestPage | `TestResultsScreen` component | Already implements 5-stage choreography with AbortController cleanup, promise-resolve bridges, haptic progression, and reduced motion support |
| Confetti + haptics + sound sync | Inline `showConfetti` state + `playMilestone()` | `celebrate()` + `playCelebrationSequence()` via TestResultsScreen | CelebrationOverlay handles queue management, first-time elevation, surprise variations, and blocking overlay timing |
| Score count-up with dramatic easing | Basic CountUpScore invocation | TestResultsScreen's choreographed CountUpScore with onUpdate tick sync | TestResultsScreen adds teaser confetti at pass threshold, tick sounds, color transitions |

**Key insight:** The entire celebration infrastructure was built in Phase 32 and wired into TestResultsScreen. TestPage just never adopted it. This is a pure integration gap, not a feature gap.

## Common Pitfalls

### Pitfall 1: Breaking the Active Quiz View
**What goes wrong:** Removing imports/state that are shared between `activeView` and `resultView` breaks the quiz flow
**Why it happens:** Some state variables and imports serve both the active quiz and the results screen
**How to avoid:** Before removing anything, grep for usage in the `activeView` block (lines 805-1023). Only remove code exclusively used by `resultView`.
**Warning signs:** TypeScript errors after removing imports; quiz answering breaks

### Pitfall 2: Missing `timeTaken` Calculation
**What goes wrong:** Passing wrong duration to TestResultsScreen
**Why it happens:** TestPage tracks `timeLeft` (countdown), but TestResultsScreen expects `timeTaken` (elapsed)
**How to avoid:** Calculate `timeTaken = TEST_DURATION_SECONDS - timeLeft`. For practice mode within mock test, check if timer was enabled.
**Warning signs:** Duration shows 20 minutes when test only lasted 5 minutes

### Pitfall 3: Retry Handler Behavior
**What goes wrong:** Retry button navigates instead of reloading
**Why it happens:** TestResultsScreen's `onRetry` is a callback; TestPage's current retry uses `window.location.reload()`
**How to avoid:** Pass `() => window.location.reload()` as `onRetry`
**Warning signs:** Clicking retry goes to wrong page

### Pitfall 4: Forgetting `onReviewWrongOnly` Callback
**What goes wrong:** TestResultsScreen expects this callback but it's not critical
**Why it happens:** The inline resultView had its own filter toggle; TestResultsScreen has a built-in "Review Wrong Only" button that calls this callback AND scrolls internally
**How to avoid:** Pass a no-op: `() => {}`. The TestResultsScreen handles its own scroll.
**Warning signs:** Runtime error from missing prop

### Pitfall 5: EndReason Null on Unmount Race
**What goes wrong:** `endReasonForDisplay` might be null briefly during transition
**Why it happens:** It's derived from `isFinished` which depends on `quizState.phase === 'finished'`
**How to avoid:** TestResultsScreen already handles `endReason: null` gracefully (conditionally renders the message). The useMemo that computes `endReasonForDisplay` fires synchronously when `isFinished` becomes true, so the value is available immediately.
**Warning signs:** End reason message missing on results screen

### Pitfall 6: Imports Used in Both Views
**What goes wrong:** Removing an import breaks the active quiz view
**Why it happens:** Some components like `DynamicAnswerNote`, `ExplanationCard` (if used during feedback), or `SpeechButton` appear in both active quiz and results
**How to avoid:** Check each import against the `activeView` block before removing
**Warning signs:** TypeScript "not found" errors after import cleanup

## Code Examples

### Example 1: Replacing resultView with TestResultsScreen

```typescript
// BEFORE (TestPage.tsx, lines 1029-1377): 350 lines of inline JSX
const resultView = (
  <div className="mx-auto max-w-5xl px-4 pb-16 pt-8">
    <Confetti fire={showConfetti} intensity={...} />
    <div className="glass-light ...">
      {/* ... 350 lines of non-choreographed results ... */}
    </div>
  </div>
);

// AFTER: ~15 lines
const resultView = (
  <TestResultsScreen
    results={finalResults}
    questions={questions}
    mode="mock-test"
    endReason={endReasonForDisplay}
    timeTaken={TEST_DURATION_SECONDS - timeLeft}
    showBurmese={showBurmese}
    onRetry={() => window.location.reload()}
    onReviewWrongOnly={() => {}}
    onHome={() => navigate('/dashboard')}
  />
);
```

### Example 2: Import Cleanup

```typescript
// Imports to ADD:
import { TestResultsScreen } from '@/components/results/TestResultsScreen';

// Imports to REMOVE (after verifying no activeView usage):
// - Sparkles (only resultView retry button)
// - BilingualHeading (only resultView)
// - BilingualButton (only resultView buttons)
// - Confetti (direct component; CelebrationOverlay handles celebration)
// - CountUpScore (TestResultsScreen imports its own)
// - ShareButton (TestResultsScreen has its own)
// - Filter from lucide-react (only resultView filter toggle)
// - playLevelUp, playMilestone (only handleScoreCountComplete)

// Imports to KEEP (used in activeView):
// - Trophy (NOT used in activeView -- check) -- actually only in resultView, REMOVE
// - ExplanationCard (used in activeView feedback, line 1361 -- check) -- only in resultView, REMOVE
// - DynamicAnswerNote (used in activeView line 924 -- KEEP)
// - AddToDeckButton (only in resultView result cards -- REMOVE)
// - WeakAreaNudge (only in resultView -- REMOVE)
// - FadeIn (only in resultView -- REMOVE)
```

### Example 3: State/Handler Cleanup

```typescript
// REMOVE these state declarations:
const [showConfetti, setShowConfetti] = useState(false);
const [showAllResults, setShowAllResults] = useState(false);

// REMOVE this handler:
const handleScoreCountComplete = useCallback(() => {
  setShowConfetti(true);
  if (finalCorrect >= PASS_THRESHOLD) {
    playMilestone();
  } else {
    playLevelUp();
  }
}, [finalCorrect]);

// REMOVE this computed value (TestResultsScreen computes its own):
const shareCardData: ShareCardData | null = useMemo(() => { ... }, [...]);
const completionMessage: Record<TestEndReason, { en: string; my: string }> = { ... };

// KEEP: finalResults, finalCorrect (used in save-session effect)
// KEEP: endReasonForDisplay (passed as prop to TestResultsScreen)
// KEEP: timeLeft (needed for timeTaken calculation)
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Inline result rendering per page | Shared TestResultsScreen component | Phase 32 (2026-02-20) | Practice mode got choreography; Mock test was left behind |
| Basic Confetti + playMilestone() | celebrate() + CelebrationOverlay + playCelebrationSequence() | Phase 32 (2026-02-20) | Multi-sensory celebration system with haptics, sounds, confetti, DotLottie |
| No haptics in results | hapticLight/Medium/Heavy progression | Phase 30+32 (2026-02-20) | Native-feel tactile feedback at each choreography stage |

**Key history:** TestResultsScreen was originally created in Phase 32 Plan 06 to handle both modes. PracticeResults was updated to delegate to it. TestPage was NOT updated because Phase 32's scope focused on building the celebration infrastructure and wiring Practice mode. The TestPage inline view was left as a known gap to be closed later.

## Open Questions

1. **`previousAttempts` prop on TestResultsScreen**
   - What we know: TestResultsScreen accepts an optional `previousAttempts` prop for showing improvement vs last attempt
   - What's unclear: TestPage's inline view didn't show this. Should it be wired up?
   - Recommendation: Out of scope for Phase 36. The prop is optional and not related to CELB-04/05/08. Can be a future enhancement.

2. **`skippedQuestionIds` prop**
   - What we know: TestResultsScreen passes this to QuestionReviewList for showing skipped questions
   - What's unclear: TestPage has `quizState.skippedIndices` (indices, not IDs). Need to convert to IDs.
   - Recommendation: Convert indices to question IDs when passing: `quizState.skippedIndices.map(i => questions[i]?.id).filter(Boolean)`. This gives users visibility into skipped questions in the results.

3. **`finalIncorrect` usage**
   - What we know: Only used in inline resultView stats grid and save-session effect
   - What's unclear: Is it used in the save-session effect?
   - Recommendation: Check save-session effect (line 414). It uses `finalIncorrect` for the session object. Keep the variable if so, or inline the computation (`finalResults.length - finalCorrect`).

## Sources

### Primary (HIGH confidence)
- **Source code investigation** of `src/pages/TestPage.tsx` (1391 lines) -- inline resultView (lines 1029-1377)
- **Source code investigation** of `src/components/results/TestResultsScreen.tsx` (958 lines) -- shared component with full choreography
- **Source code investigation** of `src/components/practice/PracticeResults.tsx` (65 lines) -- example of correct delegation pattern
- **Source code investigation** of `src/hooks/useCelebration.ts` (99 lines) -- celebrate() dispatch
- **Source code investigation** of `src/lib/audio/celebrationSounds.ts` (254 lines) -- playCelebrationSequence()
- **Source code investigation** of `src/components/celebrations/CelebrationOverlay.tsx` (371 lines) -- overlay rendering
- **Source code investigation** of `src/lib/haptics.ts` (70 lines) -- hapticLight/Medium/Heavy

### Secondary (MEDIUM confidence)
- **Phase 32 summaries** (32-06-SUMMARY.md, 32-07-SUMMARY.md) -- confirmed choreography was built for shared component

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new libraries, all existing project infrastructure
- Architecture: HIGH -- pattern is identical to PracticeResults.tsx delegation, already working
- Pitfalls: HIGH -- thorough code reading identified all shared/non-shared imports and state
- Code removal: MEDIUM -- need careful verification that each removed import/variable isn't used in activeView

**Research date:** 2026-02-21
**Valid until:** 2026-03-21 (stable -- no external dependencies changing)
