# Phase 18: Language Mode - Research

**Researched:** 2026-02-13
**Domain:** Global language mode system (English-only / bilingual) across entire app
**Confidence:** HIGH

## Summary

Phase 18 implements a consistent global language mode toggle across all 59+ consuming components. The app already has the core infrastructure: `LanguageContext` with `mode`, `showBurmese`, `toggleMode`, and `setMode`; three reusable bilingual components (`BilingualText`, `BilingualHeading`, `BilingualButton`); and a centralized `strings.ts` catalog. The existing `LanguageToggle` and `LanguageToggleCompact` components already provide a working toggle UI, and 57 files already consume `useLanguage()`.

The main work is NOT building new infrastructure -- it is replacing the current generic icon-based toggle with custom flag-based SVGs, adding a flag toggle to the navbar (both Sidebar and BottomTabBar), creating the settings page extended controls, ensuring 100% of 332 `font-myanmar` occurrences across 75 files respect the language mode (many already do via `showBurmese` checks, but some render Burmese unconditionally), and adding USCIS simulation messages to the test/interview pre-screens.

**Primary recommendation:** Enhance the existing `LanguageContext` to emit events for TTS coordination and analytics. Replace the icon-based toggle with flag SVGs. Audit all 75 `font-myanmar` files for unconditional Burmese rendering and wrap with `showBurmese` guards. The architecture is already in place -- this is a consistency and UI polish pass, not a greenfield build.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Toggle UX & Placement
- Dual placement: Compact flag toggle in navbar + extended controls in settings page
- Navbar position: Far right, before settings icon
- Flag style: Custom SVG icons, rounded rectangle shape, 24px (same size as other nav icons)
- Both flags always visible: Active flag highlighted, inactive flag dimmed -- user taps inactive flag to switch
- Switch animation: Subtle bounce/highlight animation on the tapped flag before switching (not instant)
- Brief spinner: Tiny loading indicator on the flag for 100-200ms during switch for tactile feedback
- Haptic feedback: Light vibration on mobile devices when toggling
- First-time tooltip: One-time onboarding hint pointing at the flags
- Screen reader labels: Accessible labels (e.g., "English mode active, switch to Myanmar")
- Default mode: Myanmar (bilingual) -- target audience is Burmese immigrants
- Settings page: Extended controls with explanation text describing what each mode does
- Navbar visibility during tests: Claude's discretion on whether to hide toggle during active sessions

#### English-Only Behavior
- 100% English, zero exceptions: English mode means English text only on ALL screens
- No bilingual exceptions: No UI strings remain bilingual in English mode (not even app title or nav labels)
- Category names: English-only in English mode
- TTS matches mode: In English mode, TTS reads English only; in Myanmar mode, TTS reads both languages
- Font loading: Always load Padauk/Noto Sans Myanmar font regardless of mode
- Bilingual layout: In Myanmar mode, English text first, Burmese translation below
- USCIS simulation message: Shown every time before mock test AND interview when in English mode
- USCIS message language: Follows current mode

#### Transition & Switching
- Scroll position: Preserved when switching language
- TTS during switch: If TTS is playing, finish current utterance then future TTS follows new mode
- Analytics: Track language preference and mode switches

#### Interview Behavior (NO Exception)
- No special interview mode: Interview follows global language mode
- English mode interview: English-only everything, USCIS simulation message before start
- Myanmar mode interview: Bilingual everything
- Interview TTS: Always English TTS for examiner's spoken questions (even in Myanmar mode)
- Interview STT: Always English speech-to-text regardless of language mode
- Burmese question display: In Myanmar mode, Burmese translation appears simultaneously with English text
- Answer prompt in Myanmar mode: Include Burmese guidance hint "Answer in English"
- Examiner label: "USCIS Officer" translated to bilingual in Myanmar mode
- Interview results: Follow language mode
- Interview analytics: Track which language mode was active during each session

#### Persistence
- Language preference persists across sessions

### Claude's Discretion
- Active flag visual indicator style (opacity, ring, or border)
- Toggle visibility during active test/practice sessions
- Content transition animation (fade vs instant)
- Layout shift handling approach
- Switch confirmation feedback (flag animation alone or toast)
- Rapid toggle debounce implementation
- Multi-tab language sync behavior
- Cached content update timing
- HTML lang attribute handling
- Keyboard shortcut for language toggle
- URL state for language mode
- Data handling approach (don't render vs filter)
- Burmese text visual differentiation in bilingual mode
- Settings page preview inclusion
- First-time tooltip style (popover vs toast)
- Animation scope (per-element vs page-level)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| React Context API | 19.x | `LanguageContext` for global state | Already built |
| localStorage | Native | Persistence via `civic-test-language-mode` key | Already built |
| motion/react | 12.x | Toggle animations, layout transitions | Already installed |
| clsx | 2.x | Conditional class composition | Already installed |
| lucide-react | 0.4x | Icons (Languages icon currently used) | Already installed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @fontsource/noto-sans-myanmar | 5.2.7 | Myanmar font (weights 400, 500, 700) | Already installed, loaded in `_app.tsx` |
| react-joyride | N/A | Onboarding tours (existing) | For first-time tooltip hint |

### No New Dependencies Required
This phase uses entirely existing libraries. No new npm packages needed.

## Architecture Patterns

### Existing Architecture (Already Built)

```
src/
├── contexts/
│   └── LanguageContext.tsx      # Provider + useLanguage hook (EXISTS)
├── components/
│   ├── bilingual/
│   │   ├── BilingualText.tsx    # Stacked text component (EXISTS)
│   │   ├── BilingualHeading.tsx # Heading component (EXISTS)
│   │   ├── BilingualButton.tsx  # Button component (EXISTS)
│   │   └── index.ts            # Barrel export (EXISTS)
│   ├── ui/
│   │   └── LanguageToggle.tsx   # Current icon toggle (EXISTS, needs replacement)
│   └── navigation/
│       ├── Sidebar.tsx          # Desktop nav (needs flag toggle)
│       ├── BottomTabBar.tsx     # Mobile nav (needs flag toggle)
│       ├── NavItem.tsx          # Nav item (already uses showBurmese)
│       └── navConfig.ts         # Tab config with labelMy (already bilingual)
├── lib/
│   └── i18n/
│       └── strings.ts          # Centralized bilingual string catalog (EXISTS)
└── pages/
    └── SettingsPage.tsx         # Settings (already has LanguageToggle row)
```

### Pattern 1: Existing `showBurmese` Guard Pattern (95% of components)
**What:** Components check `showBurmese` from `useLanguage()` and conditionally render `font-myanmar` text blocks.
**Already used in:** 57 files
**Example (from InterviewSession.tsx line 437-440):**
```typescript
{showBurmese && (
  <p className="mt-1 font-myanmar text-sm text-muted-foreground">
    {currentQuestion.question_my}
  </p>
)}
```

### Pattern 2: Bilingual Component Pattern (for structured bilingual content)
**What:** Use `BilingualText`, `BilingualHeading`, or `BilingualButton` which internally call `useLanguage()`.
**Example (from PreTestScreen.tsx):**
```typescript
<BilingualHeading
  text={{ en: "You've Got This!", my: 'သင်လုပ်နိုင်ပါတယ်!' }}
  level={1}
  size="2xl"
/>
```

### Pattern 3: NavItem Bilingual Label Pattern
**What:** NavItem selects between `tab.label` (English) and `tab.labelMy` (Myanmar) based on `showBurmese`.
**Already implemented (NavItem.tsx line 55):**
```typescript
const label = showBurmese ? tab.labelMy : tab.label;
```

### Pattern 4: Toast Always Shows Both Languages
**What:** BilingualToast always renders both `message.en` and `message.my` -- does NOT check `showBurmese`.
**Location:** `BilingualToast.tsx` line 231
**Action needed:** Add `showBurmese` guard to the Burmese text line in toast rendering.

### Pattern 5: Inline Bilingual Rendering (ad-hoc)
**What:** Many components render bilingual content inline without using bilingual components.
**Example (from SettingsPage.tsx):**
```typescript
{showBurmese && (
  <p className="font-myanmar text-xs text-muted-foreground">{titleMy}</p>
)}
```

### Proposed New Patterns

### Pattern 6: Flag Toggle Component
**What:** Custom dual-flag segmented control replacing the `Languages` icon toggle.
**Where:** New component replacing `LanguageToggle` and `LanguageToggleCompact`.
**Design:**
```typescript
// Both flags always visible, side by side
// Active flag: full opacity + ring indicator
// Inactive flag: 40% opacity, clickable to switch
// 24px flag SVGs, rounded rectangle shape
export function FlagToggle({ compact?: boolean }) {
  const { mode, setMode } = useLanguage();
  // Renders US flag + Myanmar flag side by side
  // Tap inactive flag -> bounce animation -> spinner -> switch
  // Haptic feedback on mobile via navigator.vibrate(10)
}
```

### Pattern 7: USCIS Simulation Message
**What:** Message shown before mock test and interview in English mode.
**Where:** PreTestScreen and InterviewSetup components.
**Design:** Conditional banner based on `!showBurmese` that says "This simulates the real USCIS test -- questions are in English only."

### Anti-Patterns to Avoid
- **Unconditional `font-myanmar` rendering:** Several files render Burmese text without checking `showBurmese`. These must be wrapped with guards.
- **Inline hard-coded bilingual strings without `showBurmese` check:** e.g., PreTestScreen line 91 always shows Myanmar text.
- **TTS reading Burmese content in English mode:** The TTS system must check `mode` before reading Burmese translations.
- **Separate interview language mode:** Per user decision, interview does NOT have its own language mode -- it follows the global setting.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Language state management | Custom state management | Existing `LanguageContext` | Already built and working in 57 files |
| Bilingual text rendering | New text components | Existing `BilingualText`, `BilingualHeading`, `BilingualButton` | Already handles `showBurmese` internally |
| String catalog | Per-component strings | Existing `strings.ts` | Centralized, typed, already has 200+ strings |
| Onboarding hints | Custom tooltip system | Existing react-joyride / `useOnboarding` pattern | Already has tour infrastructure |
| Scroll preservation | Manual scroll save/restore | React's natural re-render behavior | React preserves scroll when DOM updates without unmounting |
| Multi-tab sync | Custom BroadcastChannel | `storage` event listener on `localStorage` | Native browser API, simple |

## Common Pitfalls

### Pitfall 1: Unconditional Burmese Text in Toasts
**What goes wrong:** `BilingualToast.tsx` always renders both `.en` and `.my` text (line 231) regardless of language mode.
**Why it happens:** The toast was built before language mode was a concern -- it always shows both languages.
**How to avoid:** Add `showBurmese` guard in the Toast component's Burmese text line. Toast needs to consume `useLanguage()`.
**Warning signs:** Burmese text appearing in toasts when in English-only mode.

### Pitfall 2: PreTestScreen Hard-coded Bilingual Content
**What goes wrong:** Lines 91, 99, 104, and 118 in PreTestScreen.tsx render Burmese text unconditionally (e.g., `Questions / မေးခွန်းများ` always shows).
**Why it happens:** These were written as always-bilingual without `showBurmese` checks.
**How to avoid:** Wrap each Burmese text block with `{showBurmese && ...}` guard.
**Warning signs:** Burmese text visible on pre-test screen in English mode.

### Pitfall 3: Navigation Label Font Class Without Mode Check
**What goes wrong:** BottomTabBar applies `font-myanmar` class conditionally but uses it for utility button labels, which show Burmese text based on `showBurmese` -- this is already correct. However, the utility labels show the OPPOSITE language label (e.g., "English" when in Myanmar mode) which is intentional UX.
**How to avoid:** When replacing with flag toggle, ensure the toggle button itself does not render text labels that break the mode.
**Warning signs:** Mixed language labels in the nav bar.

### Pitfall 4: Layout Shift When Toggling
**What goes wrong:** Burmese text blocks (subtitle lines below English) appear/disappear, causing content to jump.
**Why it happens:** Adding or removing DOM elements changes layout height.
**How to avoid:** Use brief CSS transition on the container height, or use a shimmer placeholder that collapses smoothly. The `motion/react` `AnimatePresence` with height animation handles this well.
**Warning signs:** Content jumps when switching modes.

### Pitfall 5: Haptic API Availability
**What goes wrong:** `navigator.vibrate()` is not available on iOS Safari.
**Why it happens:** iOS has never supported the Vibration API.
**How to avoid:** Always guard with `if ('vibrate' in navigator)` before calling. Haptic feedback is a progressive enhancement only.
**Warning signs:** JavaScript errors on iOS devices.

### Pitfall 6: React Compiler ESLint Rules
**What goes wrong:** Using `setState` directly in effect bodies or accessing ref `.current` during render.
**Why it happens:** This project uses React Compiler ESLint rules which are stricter than standard.
**How to avoid:** Use `useMemo` for derived state, `useState` for user-interactive state. Avoid refs for tracking previous values. See MEMORY.md for patterns.
**Warning signs:** ESLint errors during pre-commit.

### Pitfall 7: Interview TTS Always English for Examiner
**What goes wrong:** Interview TTS might accidentally switch to reading Burmese translations.
**Why it happens:** The examiner's voice must always be English (simulating USCIS officer), even in Myanmar mode.
**How to avoid:** The existing `useInterviewTTS` hook already hard-codes `en-US` for the voice. Keep this. Burmese translations are visual-only in interview mode.
**Warning signs:** TTS reading Myanmar text during interview.

### Pitfall 8: BilingualToast BilingualMessage Type
**What goes wrong:** The `BilingualMessage` type always requires both `.en` and `.my` fields.
**Why it happens:** The error sanitizer and toast system were designed to always carry both translations.
**How to avoid:** Keep both fields in the data. Only suppress the `.my` rendering in the Toast component based on `showBurmese`. Data stays bilingual; rendering respects the mode.
**Warning signs:** TypeScript errors if trying to omit `.my` from BilingualMessage.

## Code Examples

### Example 1: Enhanced LanguageContext with Analytics Tracking
```typescript
// Source: Existing LanguageContext.tsx + enhancement
const setMode = useCallback((newMode: LanguageMode) => {
  setModeState(newMode);
  localStorage.setItem(STORAGE_KEY, newMode);
  // Analytics event (future integration point)
  // trackEvent('language_mode_changed', { mode: newMode });
}, []);
```

### Example 2: Flag SVG Toggle Component Structure
```typescript
// Compact flag toggle for navbar
// Both flags visible, active highlighted, inactive dimmed
export function FlagToggle({ className }: { className?: string }) {
  const { mode, setMode } = useLanguage();
  const isEnglish = mode === 'english-only';

  const handleSwitch = (targetMode: LanguageMode) => {
    if (mode === targetMode) return;
    // Haptic feedback (progressive enhancement)
    if ('vibrate' in navigator) navigator.vibrate(10);
    setMode(targetMode);
  };

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Language mode">
      <button
        role="radio"
        aria-checked={isEnglish}
        aria-label="English mode active, switch to Myanmar"
        onClick={() => handleSwitch('english-only')}
        className={clsx('transition-opacity', isEnglish ? 'opacity-100' : 'opacity-40')}
      >
        <USFlagIcon className="h-6 w-6" />
      </button>
      <button
        role="radio"
        aria-checked={!isEnglish}
        aria-label="Myanmar mode active, switch to English"
        onClick={() => handleSwitch('bilingual')}
        className={clsx('transition-opacity', !isEnglish ? 'opacity-100' : 'opacity-40')}
      >
        <MyanmarFlagIcon className="h-6 w-6" />
      </button>
    </div>
  );
}
```

### Example 3: USCIS Simulation Message Pattern
```typescript
// Shown on PreTestScreen and InterviewSetup in English mode
{!showBurmese && (
  <div className="rounded-xl border border-primary/30 bg-primary-subtle/30 px-4 py-3 mb-4">
    <p className="text-sm font-medium text-foreground">
      This simulates the real USCIS test -- questions are in English only.
    </p>
  </div>
)}
{showBurmese && (
  <div className="rounded-xl border border-primary/30 bg-primary-subtle/30 px-4 py-3 mb-4">
    <p className="text-sm font-medium text-foreground">
      This simulates the real USCIS test -- questions are in English only.
    </p>
    <p className="font-myanmar text-xs text-muted-foreground mt-1">
      ဤလေ့ကျင့်ခန်းသည် တကယ့် USCIS စာမေးပွဲကို တူညီစေပါသည် -- မေးခွန်းများသည် အင်္ဂလိပ်ဘာသာဖြင့်သာ ဖြစ်ပါသည်။
    </p>
  </div>
)}
```

### Example 4: Guarding Unconditional Burmese Text
```typescript
// BEFORE (unconditional -- always shows Burmese):
<span className="block font-myanmar mt-1">
  အသက်ရှုနက်နက်ရှူပါ။
</span>

// AFTER (respects language mode):
{showBurmese && (
  <span className="block font-myanmar mt-1">
    အသက်ရှူနက်နက်ရှူပါ။
  </span>
)}
```

### Example 5: First-Time Tooltip for Flag Toggle
```typescript
// Use existing onboarding pattern from useOnboarding.ts
const LANG_TOOLTIP_KEY = 'civic-test-lang-tooltip-shown';

function useLanguageTooltip() {
  const [shown, setShown] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(LANG_TOOLTIP_KEY) === 'true';
  });

  const dismiss = useCallback(() => {
    setShown(true);
    localStorage.setItem(LANG_TOOLTIP_KEY, 'true');
  }, []);

  return { shouldShow: !shown, dismiss };
}
```

### Example 6: TTS Mode-Aware Speaking
```typescript
// In components that use TTS for study/review (not interview):
const { showBurmese } = useLanguage();

// Only speak Burmese translation when in bilingual mode
speak(question.question_en);
if (showBurmese && question.question_my) {
  // Queue Burmese TTS after English (future Burmese TTS support)
  // For now, Burmese is display-only since browser TTS doesn't support Myanmar
}
```

## Discretion Recommendations

Based on research of the codebase patterns and UX best practices:

### Active Flag Indicator
**Recommendation: Opacity + subtle ring.** Active flag at full opacity with a 2px ring-primary ring. Inactive flag at 40% opacity. This is consistent with the app's existing active state patterns (nav items use `bg-primary/20` for active).

### Toggle Visibility During Tests
**Recommendation: Keep visible but functional.** The navigation is already locked during active tests (via `NavigationProvider.setLock`). The language toggle should remain accessible even during tests -- changing language mid-test is a valid accessibility need. No warning needed.

### Content Transition Animation
**Recommendation: Instant swap with micro-animation.** Use `AnimatePresence` with a fast 150ms fade on the Burmese text blocks. Full page-level transitions would be distracting. The flag toggle animation (bounce + spinner) provides sufficient visual feedback that the mode changed.

### Layout Shift Handling
**Recommendation: Let natural reflow handle it.** Since Burmese text is typically a single subtitle line below English, the layout shift is small and natural. Adding shimmer placeholders would over-engineer this. The content simply grows or shrinks smoothly.

### Switch Confirmation
**Recommendation: Flag animation alone is sufficient.** The bounce animation on the tapped flag + brief spinner provides clear visual confirmation. A toast would be redundant noise for a simple toggle.

### Rapid Toggle Debounce
**Recommendation: 300ms debounce.** Prevent rapid toggling by disabling the inactive flag button for 300ms after a switch. This matches the spinner duration and prevents accidental double-taps.

### Multi-Tab Sync
**Recommendation: `storage` event listener.** Add a `storage` event listener in `LanguageContext` to detect changes from other tabs. This is a 5-line addition and follows the same pattern localStorage already uses.

### Cached Content Reactivity
**Recommendation: Immediate update.** Since all components derive their display from `useLanguage().showBurmese` via React context, changes propagate immediately via React re-render. No special cache invalidation needed.

### HTML Lang Attribute
**Recommendation: Set `document.documentElement.lang` on mode change.** Set to `en` for English-only mode, `en-my` for bilingual mode. This follows the same pattern as `ThemeContext` which sets `color-scheme` on the root element.

### Keyboard Shortcut
**Recommendation: `Alt+L` (or `Option+L` on Mac).** Simple, non-conflicting shortcut. Register via `useEffect` with `keydown` listener in `LanguageContext`.

### URL State
**Recommendation: Do not include in URL.** Language mode is a user preference, not page state. It belongs in localStorage (already there). Adding it to URL would complicate sharing and deep-linking.

### Data Handling
**Recommendation: Don't render approach.** Keep all bilingual data in the question/string objects. Only suppress rendering in the JSX via `showBurmese` guards. This is simpler, avoids data pipeline changes, and matches the existing pattern used in 57 files.

### Settings Page Preview
**Recommendation: No inline preview.** The settings page already has a description explaining each mode. A live preview would add complexity for minimal benefit since the user can see the change immediately on the current page.

### First-Time Tooltip Style
**Recommendation: Simple popover arrow pointing at flag toggle.** Use a small floating `motion.div` with `absolute` positioning near the flag toggle. Auto-dismiss after 5 seconds or on tap. Lighter than react-joyride for a single tooltip.

### Animation Scope
**Recommendation: Per-element.** Each Burmese text block individually fades in/out. No page-level transitions needed since the content change is granular, not a full page swap.

## Scope Analysis: Files Requiring Changes

### Category 1: Core Infrastructure (3 files)
- `src/contexts/LanguageContext.tsx` -- Add multi-tab sync, analytics hook, HTML lang update
- `src/components/ui/LanguageToggle.tsx` -- Replace with flag-based toggle
- `src/pages/SettingsPage.tsx` -- Enhanced language section with mode descriptions

### Category 2: Navigation (3 files)
- `src/components/navigation/Sidebar.tsx` -- Replace Languages icon with flag toggle
- `src/components/navigation/BottomTabBar.tsx` -- Replace Languages icon with flag toggle
- `src/components/navigation/navConfig.ts` -- Potentially no changes needed (already bilingual)

### Category 3: USCIS Message Addition (2 files)
- `src/components/test/PreTestScreen.tsx` -- Add USCIS simulation message
- `src/components/interview/InterviewSetup.tsx` -- Add USCIS simulation message

### Category 4: Toast Language Mode (1 file)
- `src/components/BilingualToast.tsx` -- Add `showBurmese` guard to Myanmar text

### Category 5: Unconditional Burmese Text Fixes (estimated 15-20 files)
Files that render `font-myanmar` text WITHOUT `showBurmese` guards. Based on the audit:
- `src/components/test/PreTestScreen.tsx` -- lines 91, 99, 104, 118
- Many other files where inline Burmese text is always visible

Note: Many of the 75 files with `font-myanmar` ALREADY have `showBurmese` guards. The audit must identify which ones do NOT.

### Category 6: Interview Language Mode (4 files)
- `src/components/interview/InterviewSession.tsx` -- Ensure mode-aware rendering
- `src/components/interview/InterviewSetup.tsx` -- USCIS message + mode labels
- `src/components/interview/InterviewResults.tsx` -- Follow mode for result display
- `src/components/interview/AnswerReveal.tsx` -- Follow mode for answer display

### Category 7: New SVG Assets (1 directory)
- Custom US flag and Myanmar flag SVG components (24px rounded rectangles)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `Languages` icon toggle | Custom flag toggle (to be built) | Phase 18 | More intuitive UX |
| Some unconditional Burmese | All Burmese gated by `showBurmese` | Phase 18 | True English-only mode |
| Interview has own language logic | Interview follows global mode | Phase 18 | Consistency |
| Toast always bilingual | Toast respects language mode | Phase 18 | True English-only mode |

**Already current:**
- `LanguageContext` with React Context API -- standard React pattern, no migration needed
- `localStorage` persistence -- proven pattern, no changes needed
- `BilingualString` type with `en`/`my` keys -- clean type system, no changes needed

## Open Questions

1. **Exact Count of Unconditional Burmese Renders**
   - What we know: 332 `font-myanmar` occurrences across 75 TSX files, 57 files use `useLanguage()`
   - What's unclear: Exactly how many of the 332 occurrences lack `showBurmese` guards
   - Recommendation: The planner should create an audit task as the first plan step. An executor agent can grep for `font-myanmar` in files that do NOT import `useLanguage` -- those are guaranteed misses. Then within files that DO import it, check for unguarded occurrences.

2. **Flag SVG Design Details**
   - What we know: 24px rounded rectangle, custom SVG
   - What's unclear: Exact SVG path data for US flag and Myanmar flag at 24px
   - Recommendation: Create simple, recognizable flag SVGs inline (not external files). US flag: blue canton with white elements + red/white stripes. Myanmar flag: yellow/green/red horizontal stripes with white star. Simplified for 24px size.

3. **Analytics Integration Point**
   - What we know: No analytics system currently exists in the app (no PostHog, Mixpanel, etc.)
   - What's unclear: How analytics events should be tracked
   - Recommendation: Add console.log-based analytics stubs that can be replaced when an analytics system is added. Track: `language_mode_changed`, `interview_language_mode`.

## Sources

### Primary (HIGH confidence)
- Codebase analysis of `src/contexts/LanguageContext.tsx` -- full implementation reviewed
- Codebase analysis of all 57 `useLanguage()` consumer files
- Codebase analysis of 75 `font-myanmar` files (332 occurrences)
- Codebase analysis of `BilingualText.tsx`, `BilingualHeading.tsx`, `BilingualButton.tsx`
- Codebase analysis of `LanguageToggle.tsx` (current toggle implementation)
- Codebase analysis of `Sidebar.tsx`, `BottomTabBar.tsx`, `NavItem.tsx`
- Codebase analysis of `InterviewSession.tsx`, `InterviewSetup.tsx`, `InterviewResults.tsx`
- Codebase analysis of `BilingualToast.tsx` (always-bilingual toast rendering)
- Codebase analysis of `PreTestScreen.tsx` (unconditional Burmese text)
- Codebase analysis of `ThemeContext.tsx` (pattern reference for root element updates)
- Codebase analysis of `useOnboarding.ts` (pattern for one-time tooltip)
- Codebase analysis of `useInterviewTTS.ts` (always en-US voice)
- Codebase analysis of font loading: `@fontsource/noto-sans-myanmar` in `_app.tsx` and `globals.css`

### Secondary (MEDIUM confidence)
- Vibration API: `navigator.vibrate()` not available on iOS Safari -- progressive enhancement only
- Multi-tab sync via `storage` event: standard Web API, well-supported

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new libraries, all infrastructure exists
- Architecture: HIGH -- patterns verified directly in 57+ consuming files
- Pitfalls: HIGH -- identified from actual codebase issues (toast, PreTestScreen, etc.)

**Research date:** 2026-02-13
**Valid until:** 2026-03-15 (stable -- no external dependency changes expected)
