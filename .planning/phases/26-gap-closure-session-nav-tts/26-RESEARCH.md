# Phase 26: Gap Closure -- Session, Navigation & TTS Fixes - Research

**Researched:** 2026-02-18
**Domain:** React state management, routing, TTS voice selection, language context override
**Confidence:** HIGH

## Summary

This is a gap-closure phase addressing five specific audit findings from v2.1-MILESTONE-AUDIT.md. Each gap has a precisely identified root cause, making all fixes surgical rather than architectural. No new libraries are needed; all fixes use existing patterns already established in the codebase.

The four gaps break down as:
1. **SESS-01 (Mock test resume)**: `quizReducer` has no `RESUME_SESSION` action -- `handleCountdownComplete` clears `resumeDataRef` without dispatching restored state to the reducer, so the quiz always starts at index 0 with empty results.
2. **TTS-01 (Voice picker)**: `VoicePicker.tsx` was never created. `TTSSettings` type lacks `preferredVoiceName`. `TTSContext` already exposes `voices` and `updateSettings` -- the picker just needs to be built and wired.
3. **LANG-03 (Interview English-only)**: `InterviewSession.tsx:157` reads global `showBurmese` from `useLanguage()` without overriding it. Burmese labels appear at 13+ locations in the JSX when `showBurmese` is true.
4. **SESS-06/FLSH-07 (Sort route)**: `UnfinishedBanner.getSessionRoute('sort')` returns `'/sort'` (dead route). Sort lives at `/study#sort` within `StudyGuidePage`'s tab system.

**Primary recommendation:** Fix each gap independently as a targeted edit to the identified file(s), following existing patterns (PracticeSession resume for Gap 1, SettingsPage rows for Gap 2, local override for Gap 3, navigate path for Gap 4).

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SESS-01 | User can resume interrupted mock test session (prompt with session info) | Gap 1: Add `RESUME_SESSION` action to `quizReducer`, dispatch in `handleCountdownComplete` using data from `resumeDataRef`. Pattern exists in PracticeSession (line 349-356). |
| SESS-06 | Dashboard shows warning when unfinished session exists | Gap 4: Fix `getSessionRoute('sort')` return value from `'/sort'` to `'/study#sort'` in UnfinishedBanner.tsx line 78. Banner component itself works correctly. |
| FLSH-07 | Sort session state persists (resume mid-sort after closing app) | Gap 4: Same fix as SESS-06 -- the sort persistence mechanism already works (SortSnapshot exists in sessionTypes.ts), but the dashboard banner navigates to a dead route. |
| LANG-03 | Interview simulation forces English-only mode regardless of global toggle | Gap 3: Override `showBurmese` to `false` when `mode === 'realistic'` in InterviewSession.tsx. Affects 13+ JSX locations that conditionally render Burmese text. |
| TTS-01 | User can select preferred TTS voice from available voices in Settings | Gap 2: Create VoicePicker component using native `<select>`, add `preferredVoiceName` to `TTSSettings` type, wire into SettingsPage's Speech & Audio section. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react | 19 | UI framework | Already in use |
| react-router-dom | (current) | Client routing | Already in use, `useNavigate` for sort route fix |
| lucide-react | (current) | Icons | Already in use for settings icons |

### Supporting
No new libraries required. All gaps are resolved using existing project code and browser APIs.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native `<select>` for VoicePicker | Custom dropdown with voice preview | Prior decision locks native select for accessibility |
| Override `showBurmese` locally | Create separate `InterviewLanguageProvider` | Overkill for a boolean override; local const is simpler |

**Installation:**
```bash
# No new dependencies needed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── settings/
│   │   └── VoicePicker.tsx         # NEW: voice selection dropdown
│   ├── sessions/
│   │   └── UnfinishedBanner.tsx    # FIX: sort route
│   └── interview/
│       └── InterviewSession.tsx    # FIX: English-only override
├── lib/
│   ├── quiz/
│   │   ├── quizReducer.ts         # FIX: add RESUME_SESSION action
│   │   └── quizTypes.ts           # FIX: add RESUME_SESSION to QuizAction union
│   └── ttsTypes.ts                # FIX: add preferredVoiceName to TTSSettings
├── contexts/
│   └── TTSContext.tsx              # FIX: sync preferredVoiceName to engine defaults
└── pages/
    ├── TestPage.tsx                # FIX: dispatch RESUME_SESSION in handleCountdownComplete
    └── SettingsPage.tsx            # FIX: add VoicePicker to Speech & Audio section
```

### Pattern 1: Quiz Reducer Resume (from PracticeSession)
**What:** PracticeSession initializes quizReducer with restored state by spreading saved data into the initial state object.
**When to use:** When resuming a session that uses quizReducer.
**Example:**
```typescript
// Source: src/components/practice/PracticeSession.tsx:340-356
const [quizState, dispatch] = useReducer(quizReducer, quizConfig, config => {
  const state = initialQuizState(config);
  if (initialResults && initialResults.length > 0) {
    return {
      ...state,
      currentIndex: initialIndex ?? initialResults.length,
      results: initialResults,
      skippedIndices: initialSkippedIndices ?? [],
    };
  }
  return state;
});
```

**Note for TestPage:** TestPage uses a different flow. It creates the reducer first, then loads saved sessions async from IndexedDB. The resume data arrives AFTER the reducer is initialized, so it needs a dispatch-based approach (new `RESUME_SESSION` action) rather than PracticeSession's initializer approach.

### Pattern 2: Settings Row with Native Select (from SettingsPage)
**What:** SettingsPage uses native `<select>` elements for state selection, styled with the project's design tokens.
**When to use:** For the VoicePicker dropdown.
**Example:**
```typescript
// Source: src/pages/SettingsPage.tsx:358-371
<select
  value={selectedState ?? ''}
  onChange={e => setSelectedState(e.target.value || null)}
  className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground min-h-[48px] min-w-[140px]"
  aria-label="Select your state or territory"
>
  <option value="">Select state...</option>
  {allStates.map(s => (
    <option key={s.code} value={s.code}>{s.name}</option>
  ))}
</select>
```

### Pattern 3: Language Override (Local)
**What:** Override `showBurmese` for realistic interview mode using a simple local constant.
**When to use:** When a component needs to force English-only regardless of global language setting.
**Example:**
```typescript
// In InterviewSession, line 157 currently reads:
const { showBurmese, mode: languageMode } = useLanguage();

// Fix approach: override for realistic mode
const { showBurmese: globalShowBurmese, mode: languageMode } = useLanguage();
const showBurmese = mode === 'realistic' ? false : globalShowBurmese;
```

### Anti-Patterns to Avoid
- **Creating a new context provider for language override:** Wrapping InterviewSession in a LanguageProvider override would work but adds unnecessary component tree complexity for a single boolean.
- **Mutating resumeDataRef.current after clearing it:** The current bug is that `handleCountdownComplete` sets `resumeDataRef.current = null` before the resume data is consumed. The fix must dispatch BEFORE clearing.
- **Using `useEffect` to sync resume state to reducer:** This would violate React 19's strict rule against calling setState in effects. Use an action dispatch instead.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Voice filtering | Custom voice matching | Filter `voices` array from `TTSContext` by `lang.startsWith('en')` | Already tested in tts.integration.test.tsx:331-358 |
| Voice persistence | Custom localStorage wrapper | Add `preferredVoiceName` to `TTSSettings` and let `TTSContext.updateSettings` handle persistence | TTSContext already persists all settings to localStorage |
| Session navigation | Custom route resolver | Fix the existing `getSessionRoute` function | One-line change, already correctly handles all other session types |

**Key insight:** Every fix in this phase leverages an existing pattern or API surface. No custom solutions needed.

## Common Pitfalls

### Pitfall 1: Resume Dispatch Timing
**What goes wrong:** `handleCountdownComplete` clears `resumeDataRef.current = null` BEFORE the resume data is dispatched to `quizReducer`. Quiz starts at index 0 with empty results.
**Why it happens:** The countdown completion handler was written without the dispatch step.
**How to avoid:** Read `resumeDataRef.current` into a local variable, dispatch `RESUME_SESSION`, THEN clear the ref.
**Warning signs:** User resumes mock test but sees Question 1 with 0/0 score.

### Pitfall 2: TTSSettings Type Mismatch
**What goes wrong:** `preferredVoiceName` exists on `TTSEngineDefaults` but NOT on `TTSSettings`. If you only add the VoicePicker UI without extending `TTSSettings`, the preference won't persist.
**Why it happens:** `TTSSettings` is the user-facing type persisted to localStorage. `TTSEngineDefaults` is the engine-internal type. They're separate by design.
**How to avoid:** Add `preferredVoiceName?: string` to `TTSSettings` in `ttsTypes.ts`. Then in `TTSContext.updateSettings`, forward it to `engine.setDefaults({ preferredVoiceName })`.
**Warning signs:** Voice selection resets on page reload.

### Pitfall 3: Browser Voice Loading Async
**What goes wrong:** `speechSynthesis.getVoices()` returns an empty array on first call in Chrome. Voices load asynchronously.
**Why it happens:** Chrome loads online voices after page load; `voiceschanged` event fires later.
**How to avoid:** Use `voices` from `TTSContext` which already handles the `voiceschanged` listener (TTSContext.tsx:117-123). VoicePicker should re-render when voices update.
**Warning signs:** Voice dropdown is empty on first render.

### Pitfall 4: Hash Navigation in BrowserRouter
**What goes wrong:** `navigate('/sort')` goes to a non-existent route. The app uses `BrowserRouter`, and sort is a hash-based tab within `/study`.
**Why it happens:** `StudyGuidePage` uses `location.hash` (e.g., `#sort`) for tab state, NOT a separate route.
**How to avoid:** Use `navigate('/study#sort')` to navigate to the study page with the sort tab active.
**Warning signs:** Dashboard sort banner navigates to 404 or landing page.

### Pitfall 5: Interview Burmese in Practice vs Realistic
**What goes wrong:** Overriding `showBurmese` to `false` globally in InterviewSession would hide Burmese in Practice mode too.
**Why it happens:** Both modes share the same component with different `mode` prop.
**How to avoid:** Only override when `mode === 'realistic'`. Practice mode should still respect the global language setting.
**Warning signs:** Interview practice mode shows no Burmese even when global language is bilingual.

### Pitfall 6: Voice Preview in VoicePicker
**What goes wrong:** Playing a preview on every dropdown change could overlap with active speech or cause rapid speech queue buildup.
**Why it happens:** User rapidly switching voices while previous preview is still playing.
**How to avoid:** Cancel any active speech before playing preview. Use the shared TTS engine's `cancel()` before `speak()`. Prior decision says preview plays "What is the supreme law of the land?" on selection change.
**Warning signs:** Overlapping speech, garbled audio.

### Pitfall 7: React Compiler and setState in Effects
**What goes wrong:** Calling `dispatch` synchronously inside `useEffect` for resume would trigger the React Compiler's `set-state-in-effect` rule.
**Why it happens:** React 19 strict mode with React Compiler lint rules.
**How to avoid:** The `RESUME_SESSION` dispatch should happen in the `handleCountdownComplete` event handler (a callback), not in an effect. This is already the correct architecture -- the handler just needs the dispatch added.
**Warning signs:** ESLint errors from React Compiler plugin.

## Code Examples

### Example 1: RESUME_SESSION Action Type (quizTypes.ts)
```typescript
// Add to QuizAction union in src/lib/quiz/quizTypes.ts
| { type: 'RESUME_SESSION'; currentIndex: number; results: QuestionResult[] }
```

### Example 2: RESUME_SESSION Handler (quizReducer.ts)
```typescript
// Add to quizReducer switch statement
case 'RESUME_SESSION': {
  return {
    ...state,
    phase: 'answering',
    currentIndex: action.currentIndex,
    results: action.results,
  };
}
```

### Example 3: handleCountdownComplete Fix (TestPage.tsx)
```typescript
// Current (broken):
const handleCountdownComplete = useCallback(() => {
  setShowCountdown(false);
  resumeDataRef.current = null;
}, []);

// Fixed:
const handleCountdownComplete = useCallback(() => {
  setShowCountdown(false);
  const resumeData = resumeDataRef.current;
  if (resumeData) {
    dispatch({
      type: 'RESUME_SESSION',
      currentIndex: resumeData.currentIndex,
      results: resumeData.results,
    });
    setTimeLeft(resumeData.timeLeft > 0 ? resumeData.timeLeft : TEST_DURATION_SECONDS);
  }
  resumeDataRef.current = null;
}, []);
```

### Example 4: Sort Route Fix (UnfinishedBanner.tsx)
```typescript
// Current (broken):
case 'sort':
  return '/sort';

// Fixed:
case 'sort':
  return '/study#sort';
```

### Example 5: Interview English-Only Override (InterviewSession.tsx)
```typescript
// Current (broken):
const { showBurmese, mode: languageMode } = useLanguage();

// Fixed:
const { showBurmese: globalShowBurmese, mode: languageMode } = useLanguage();
const showBurmese = mode === 'realistic' ? false : globalShowBurmese;
```

### Example 6: VoicePicker Component Skeleton
```typescript
// Source: Pattern from SettingsPage.tsx state selector + TTSContext voices
interface VoicePickerProps {
  showBurmese: boolean;
}

export function VoicePicker({ showBurmese }: VoicePickerProps) {
  const { voices, settings, updateSettings, speak, cancel } = useTTS();

  // Filter to English voices only, sorted by local-first then alpha
  const englishVoices = useMemo(() =>
    voices
      .filter(v => {
        const lang = v.lang.toLowerCase().replace(/_/g, '-');
        return lang.startsWith('en-') || lang === 'en';
      })
      .sort((a, b) => {
        if (a.localService && !b.localService) return -1;
        if (!a.localService && b.localService) return 1;
        return a.name.localeCompare(b.name);
      }),
    [voices]
  );

  const handleChange = (voiceName: string) => {
    updateSettings({ preferredVoiceName: voiceName || undefined });
    // Preview: play sample text with selected voice
    cancel();
    const voice = englishVoices.find(v => v.name === voiceName);
    if (voice) {
      speak('What is the supreme law of the land?', { voice });
    }
  };

  return (
    <select
      value={settings.preferredVoiceName ?? ''}
      onChange={e => handleChange(e.target.value)}
      className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground min-h-[48px] min-w-[140px]"
      aria-label="Select TTS voice"
    >
      <option value="">Auto (best available)</option>
      {englishVoices.map(v => (
        <option key={v.voiceURI} value={v.name}>
          {v.name} {v.localService ? '(local)' : '(online)'}
        </option>
      ))}
    </select>
  );
}
```

### Example 7: TTSSettings Extension (ttsTypes.ts)
```typescript
// Add to TTSSettings type
export type TTSSettings = {
  rate: 'slow' | 'normal' | 'fast';
  pitch: number;
  lang: string;
  autoRead: boolean;
  autoReadLang: AutoReadLang;
  preferredVoiceName?: string;  // NEW
};
```

### Example 8: TTSContext updateSettings Sync (TTSContext.tsx)
```typescript
// In updateSettings callback, add preferredVoiceName forwarding:
if (engine) {
  engine.setDefaults({
    rate: RATE_MAP[next.rate],
    pitch: next.pitch,
    lang: next.lang,
    preferredVoiceName: next.preferredVoiceName,  // NEW
  });
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| No resume support | IndexedDB snapshots + ResumePromptModal | Phase 20 | Session persistence infrastructure exists, just not wired for mock test |
| Single SpeechSynthesis voice | User-selectable voice with `findVoice()` priorities | Phase 22 (planned) | Engine supports `preferredVoiceName` but no UI exists |

**Deprecated/outdated:**
- None relevant to this phase.

## Open Questions

1. **Timer restoration on mock test resume**
   - What we know: `MockTestSnapshot.timeLeft` stores remaining seconds. The comment says "for display only, timer resets to full on resume."
   - What's unclear: Should we restore the saved `timeLeft` or reset to `TEST_DURATION_SECONDS`?
   - Recommendation: Restore saved `timeLeft` since mock test timing is part of the simulation. The "resets to full" comment appears to be aspirational documentation from when resume wasn't working. PracticeSession doesn't have timed resume, so no precedent exists.

2. **Voice preview sound on mobile**
   - What we know: Prior decision says "Voice preview plays 'What is the supreme law of the land?' on selection change."
   - What's unclear: On mobile, rapid voice switching could cause audio issues. Should there be debouncing?
   - Recommendation: Cancel active speech before each preview (already in example code). No debounce needed since `cancel()` is synchronous and `speak()` replaces the queue.

3. **VoicePicker placement in SettingsPage**
   - What we know: It goes in the "Speech & Audio" section. Prior decision says native `<select>`.
   - What's unclear: Should it be before or after the Speech Speed row?
   - Recommendation: Place it after Speech Speed and before Auto-Read, as a `SettingsRow` with label "Voice" / "အသံ". This groups all speech-output settings together before the input-behavior settings.

## Sources

### Primary (HIGH confidence)
- Source code analysis of all affected files (direct reading):
  - `src/pages/TestPage.tsx` -- resume flow (lines 490-517, 171)
  - `src/lib/quiz/quizReducer.ts` -- full reducer, no RESUME_SESSION action
  - `src/lib/quiz/quizTypes.ts` -- QuizAction union, QuizState shape
  - `src/components/practice/PracticeSession.tsx` -- working resume pattern (lines 340-356)
  - `src/components/sessions/UnfinishedBanner.tsx` -- dead route at line 78
  - `src/components/interview/InterviewSession.tsx` -- showBurmese at line 157, 13+ JSX refs
  - `src/pages/SettingsPage.tsx` -- current Speech & Audio section, no VoicePicker
  - `src/pages/StudyGuidePage.tsx` -- sort tab at `#sort`, PillTabBar routing
  - `src/lib/ttsTypes.ts` -- TTSSettings vs TTSEngineDefaults type gap
  - `src/contexts/TTSContext.tsx` -- voices array, updateSettings, engine sync
  - `src/hooks/useTTS.ts` -- speak/cancel/voices/updateSettings API
  - `src/lib/ttsCore.ts` -- findVoice with preferredVoiceName support
  - `src/AppShell.tsx` -- BrowserRouter, no `/sort` route exists
  - `src/__tests__/tts.integration.test.tsx` -- voice filtering test (lines 331-358)

### Secondary (MEDIUM confidence)
- `.planning/REQUIREMENTS.md` -- requirement definitions for SESS-01, SESS-06, FLSH-07, LANG-03, TTS-01
- `.planning/v2.1-MILESTONE-AUDIT.md` -- gap root cause analysis (referenced in phase context)

### Tertiary (LOW confidence)
- None. All findings are from direct code analysis.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new libraries, all existing code
- Architecture: HIGH -- each fix follows an existing pattern already working in codebase
- Pitfalls: HIGH -- root causes are precisely identified with line numbers from audit

**Research date:** 2026-02-18
**Valid until:** 2026-03-18 (stable -- no external dependencies)
