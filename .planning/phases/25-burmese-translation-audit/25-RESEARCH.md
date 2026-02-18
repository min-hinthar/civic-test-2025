# Phase 25: Burmese Translation Audit - Research

**Researched:** 2026-02-17
**Domain:** Content quality, bilingual translation, UI string audit, CSS typography
**Confidence:** HIGH

## Summary

This phase is a content quality and consistency audit, not a feature build. The codebase has a well-established bilingual architecture with 3 distinct string storage locations: (1) a centralized `src/lib/i18n/strings.ts` file with ~250 keyed BilingualString objects, (2) 7 question data files with 128 questions each containing `question_my`, `studyAnswers[].text_my`, `answers[].text_my`, and `explanation.brief_my` fields, and (3) ~70+ components with inline Burmese strings hardcoded directly in JSX (Unicode escapes or literal Myanmar text). The audit must touch all three locations.

**Critical discovery:** The 28 USCIS 2025 additions already have complete explanation objects with both `brief_en` and `brief_my` fields. The CLAUDE.md/MEMORY.md note about "28 missing USCIS 2025 explanations" is outdated -- they were added in a previous phase. This removes a significant work item from the phase scope.

**Primary recommendation:** Organize work in priority waves (questions > UI strings > toasts/modals > PWA/social components). For each wave: generate translations, produce a cross-check file for user to run through Gemini/GPT, apply 2-of-3 consensus strings, and flag disagreements. Create the glossary first as a reference anchor for all subsequent translation work.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Register:** Casual conversational -- how you'd talk to a friend, informal pronouns, colloquial phrasing
- **English terms:** Hybrid approach -- translate to Burmese first, then show English in parentheses for key terms: e.g., naingansar (Citizen)
- **UI action words:** Burmese + English subtitle on buttons -- Burmese primary text with smaller English below
- **Proper nouns:** Burmese transliteration + English -- both scripts
- **Number formatting:** Mix by context -- Myanmar numerals in narrative text, Arabic numerals for scores/counts/technical
- **Ordinals:** Burmese ordinal pattern
- **Plurals/counting:** Burmese classifier pattern
- **Explanations:** Light pass only -- quick readability check, don't rewrite
- **Line breaking:** Fix Burmese word-wrap issues -- ensure text doesn't break mid-syllable
- **AI Cross-Check:** Claude + Gemini + GPT, 2-of-3 agree = use it, all-3-disagree = flag for manual review
- **Auto-apply:** Apply all 2-of-3 consensus strings immediately
- **Verified marker:** Mark strings that passed 3-AI consensus (format at Claude's discretion)
- **Priority order:** Questions/answers > buttons/labels > toasts/modals > error messages > accessibility strings
- **Wave structure:** Plan in priority waves
- **Error messages:** Keep in English
- **Date formatting:** Keep English dates
- **28 missing explanations:** Write both English and Burmese (NOTE: already done -- see Key Discovery below)
- **Onboarding:** Fully translate
- **Landing/auth pages:** Full bilingual coverage
- **Navigation labels:** Bilingual with Burmese + English subtitle
- **Toast messages:** Bilingual with Burmese + English subtitle
- **Toggle logic verification:** Verify every showBurmese conditional
- **Font-myanmar audit:** Full audit -- verify every Burmese string has font-myanmar class
- **Responsive layout:** Check Burmese text overflow
- **Rendering check:** Visual spot-check in Chrome + Safari
- **Known problem areas:** Dashboard, study/flashcards, settings page flagged for particular attention
- **Glossary:** Create .planning/burmese-glossary.md as permanent living reference
- **Practice vs Test:** Clearly distinct Burmese terms
- **Category names:** Standardize all 7 category names
- **Achievement names:** Creative Burmese with English in parentheses
- **Study mode tabs:** Bilingual -- Browse, Sort, Deck, Review get Burmese + English subtitle treatment
- **No-translate list:** Include in glossary (USCIS, N-400, Form I-485, etc.)
- **Audio regeneration:** Re-generate affected Burmese MP3 audio files when translations change
- **Build check:** Full build + test after all changes
- **Review file:** Separate file with flagged disagreements for user review

### Claude's Discretion
- Button layout (stacked vs inline per context)
- String centralization approach
- Grammatical particle verification depth
- Audio commit strategy
- Verified marker format (TSDoc vs separate file)
- AI batching strategy for cross-checks
- Dynamic string handling approach
- Accessibility label translation decision
- Review file format and flow

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

## Key Discovery: USCIS 2025 Explanations Already Complete

**All 28 USCIS 2025 additions already have full explanation objects** with `brief_en` and `brief_my` fields. Verified by counting `brief_en:` occurrences in `uscis-2025-additions.ts` -- exactly 28, matching the 28 questions. The CONTEXT.md requirement to "Write both English and Burmese explanations for all 28 USCIS 2025 questions" is already satisfied. The phase should instead focus on **quality-checking** the existing translations rather than writing them from scratch.

## Architecture Patterns

### Three String Storage Locations

The codebase stores Burmese translations in three distinct patterns:

**1. Centralized strings file** (`src/lib/i18n/strings.ts`)
- ~250 keyed BilingualString objects organized by domain (nav, actions, dashboard, study, test, encouragement, errors, confirm, explanations, progress, practice, interview, hub, quiz, app)
- Type: `{ en: string; my: string }` (BilingualString interface)
- Used by 32 component files via `import { strings } from '@/lib/i18n/strings'`
- Also re-exports `BilingualString` type used by bilingual components

**2. Question data files** (7 files in `src/constants/questions/`)
- 128 questions across 7 category files + `uscis-2025-additions.ts`
- Each question has: `question_my`, `studyAnswers[].text_my`, `answers[].text_my`
- Each explanation has: `brief_my`, optional `mnemonic_my`, `funFact_my`, `commonMistake_my`
- Type: `Question` interface in `src/types/index.ts`

**3. Inline component strings** (~70+ component files)
- Burmese text directly in JSX as Unicode escapes (`\u1000\u103B\u103D...`) or literal Myanmar characters
- 54 TSX files contain Myanmar Unicode characters (U+1000-U+109F)
- NOT imported from centralized strings -- hardcoded per-component
- Examples: `SettingsPage.tsx` (many inline), `navConfig.ts` (labelMy fields), `badgeDefinitions.ts`, `nudgeMessages.ts`, `nbaStrings.ts`

### Bilingual Component Architecture

**BilingualText** (`src/components/bilingual/BilingualText.tsx`)
- Stacked: English on top, Burmese below (lighter/smaller)
- Also has `BilingualTextInline` variant (side-by-side with separator)
- Always applies `font-myanmar` class to Burmese text
- Guarded by `showBurmese` from `useLanguage()`

**BilingualButton** (`src/components/bilingual/BilingualButton.tsx`)
- Stacked: English label + smaller Burmese below
- Animated pill button with spring physics
- Always applies `font-myanmar` class

**BilingualHeading** (`src/components/bilingual/BilingualHeading.tsx`)
- Stacked: English heading + Burmese subtitle
- Creates semantic HTML heading elements (h1-h6)
- Always applies `font-myanmar` class
- Includes `PageTitle` and `SectionHeading` convenience exports

**BilingualToast** (`src/components/BilingualToast.tsx`)
- Uses `BilingualMessage` type from `errorSanitizer.ts` (same as `BilingualString`)
- English on top, Burmese below with `font-myanmar` class
- Guarded by `showBurmese`

### Language Toggle System

**LanguageContext** (`src/contexts/LanguageContext.tsx`)
- Two modes: `'bilingual'` | `'english-only'`
- `showBurmese = mode === 'bilingual'` (derived boolean)
- Persisted to localStorage key `'civic-test-language-mode'`
- Multi-tab sync via storage event
- Alt+L keyboard shortcut to toggle
- Updates `document.documentElement.lang` attribute

### The showBurmese Guard Pattern

109 files use the `showBurmese` variable. The standard pattern is:
```tsx
const { showBurmese } = useLanguage();
// ...
{showBurmese && (
  <span className="font-myanmar text-muted-foreground">{burmeseText}</span>
)}
```

### Category Mapping System

`src/lib/mastery/categoryMapping.ts` defines:
- 3 main USCIS categories with bilingual names (`USCIS_CATEGORY_NAMES`)
- 7 sub-categories with bilingual names (`SUB_CATEGORY_NAMES`)
- Color mappings for each category/sub-category

### Audio System

- Pre-generated MP3 files via edge-tts (Microsoft Neural voices)
- Burmese: `my-MM-NilarNeural` (female), stored at `public/audio/my-MM/female/`
- English: Ava voice, stored at `public/audio/en-US/ava/`
- 384 audio files per language (128 questions x 3 types: q, a, e)
- Export script: `scripts/export-questions.ts` -> `scripts/questions-export.json`
- Generate script: `scripts/generate-burmese-audio.py` (requires `pip install edge-tts`)
- URL pattern: `/audio/my-MM/female/{questionId}-{q|a|e}.mp3`

### Font Loading

- **Noto Sans Myanmar** is referenced in `globals.css` and `tokens.css` but is **NOT loaded from Google Fonts**
- Only `Inter` is loaded via `@import url('https://fonts.googleapis.com/css2?family=Inter...')`
- Noto Sans Myanmar relies on system availability or browser fallback
- `.font-myanmar` CSS class defined in `globals.css` with font-family priority: `'Noto Sans Myanmar', 'Inter', system-ui...`
- The share card renderer (`shareCardRenderer.ts`) explicitly waits for Noto Sans Myanmar font load before canvas drawing

### No CSS Line-Breaking Rules for Burmese

- **No `word-break`, `overflow-wrap`, or `hyphens` rules** exist in `globals.css` or `tokens.css` for Burmese text
- Myanmar script does not use spaces between words; browsers may break lines at any character boundary
- This can cause mid-syllable breaks that are unreadable
- CSS `word-break: keep-all` or Myanmar-specific line-breaking rules may be needed

## Recommended Project Structure

The audit should NOT restructure files. Work within existing patterns:

```
src/
├── lib/i18n/strings.ts           # Centralized UI strings (EDIT)
├── constants/questions/*.ts       # Question data (EDIT)
├── lib/mastery/categoryMapping.ts # Category names (EDIT)
├── lib/social/badgeDefinitions.ts # Badge names (EDIT)
├── lib/nba/nbaStrings.ts          # NBA content (EDIT)
├── lib/mastery/nudgeMessages.ts   # Nudge messages (EDIT)
├── components/**/*.tsx            # Inline strings (EDIT per-component)
├── pages/**/*.tsx                 # Page-level inline strings (EDIT)
├── styles/globals.css             # Myanmar CSS rules (ADD line-breaking)
└── scripts/                       # Audio regeneration tools (USE)

.planning/
├── burmese-glossary.md            # NEW: Permanent glossary artifact
└── phases/25-burmese-translation-audit/
    ├── cross-check-wave-N.md      # NEW: Strings for AI cross-checking
    └── flagged-disagreements.md   # NEW: All-3-disagree strings for user
```

### String Centralization Recommendation (Claude's Discretion)

**Do NOT centralize all inline strings** into `strings.ts`. The existing pattern works:
- `strings.ts` for reusable, cross-component strings (nav, actions, common labels)
- Inline for component-specific strings used only once (settings descriptions, modal content)
- Question data stays in question files (tightly coupled to question structure)

Rationale: Moving 70+ component files' inline strings to a central file would be a massive refactor with high regression risk and no user-visible benefit. Instead, **audit inline strings in place**.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Myanmar line breaking | Custom JS tokenizer | CSS `word-break: keep-all` + `overflow-wrap: anywhere` | Browser engines handle Myanmar Unicode line-breaking rules |
| Font loading | Custom font loader | Google Fonts `@import` for Noto Sans Myanmar | Reliable CDN, consistent rendering across platforms |
| Audio generation | Custom TTS pipeline | Existing `edge-tts` scripts | Already proven, generates all 128x3 files |
| Translation management | i18n library (react-intl, next-intl) | Existing BilingualString pattern | Overkill for 2-language app with established pattern |

**Key insight:** This is a content quality phase, not an architecture phase. The bilingual infrastructure is solid. The work is in the strings themselves, not in the plumbing.

## Common Pitfalls

### Pitfall 1: Myanmar Font Not Loading on Some Platforms
**What goes wrong:** Noto Sans Myanmar is NOT loaded from Google Fonts -- the CSS references it but relies on system availability. On Windows/Mac without Noto Sans Myanmar installed, text renders in Inter/system-ui (wrong glyphs, tofu boxes).
**Why it happens:** `globals.css` imports only `Inter` from Google Fonts.
**How to avoid:** Add `@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Myanmar:wght@400;500;600;700&display=swap')` to `globals.css`. Verify CSP allows `fonts.googleapis.com` and `fonts.gstatic.com` (check middleware.ts).
**Warning signs:** Myanmar text appears as empty boxes or wrong characters in Vercel deployment.

### Pitfall 2: Missing font-myanmar Class on Burmese Text
**What goes wrong:** Burmese text renders in the wrong font (Inter) without the `font-myanmar` CSS class, causing poor glyph rendering even when Noto Sans Myanmar is available.
**Why it happens:** Inline Burmese strings in components may not always have `font-myanmar` applied, especially in complex conditional rendering paths.
**How to avoid:** Systematic grep for Myanmar Unicode characters (U+1000-U+109F) in TSX files and verify each has `font-myanmar` class on its container.
**Warning signs:** Some Burmese text looks subtly different from other Burmese text on the same page.

### Pitfall 3: Myanmar Text Breaking Mid-Syllable
**What goes wrong:** Myanmar script uses combining characters for complex syllables. Browsers may break lines in the middle of a syllable cluster, making text unreadable.
**Why it happens:** No `word-break` or `overflow-wrap` CSS rules exist for Myanmar text. The default `word-break: normal` may not handle Myanmar correctly.
**How to avoid:** Add `.font-myanmar { overflow-wrap: anywhere; word-break: keep-all; }` to globals.css. Test with long Burmese strings in narrow containers (mobile viewport).
**Warning signs:** Text that looks like individual characters instead of word groups, especially on mobile.

### Pitfall 4: Unicode Escape vs Literal Characters
**What goes wrong:** Some components use `\u1000\u103B\u103D...` escape sequences while others use literal Myanmar characters. Both are valid but escapes are harder to audit for translation quality.
**Why it happens:** Different developers/phases wrote different components.
**How to avoid:** When editing translations, always use literal Myanmar characters for readability. Let Prettier handle any re-encoding.
**Warning signs:** Cannot read Burmese strings in source code to verify quality.

### Pitfall 5: Audio Files Out of Sync with Changed Translations
**What goes wrong:** Translation text is updated but the pre-generated MP3 audio still reads the old text.
**Why it happens:** Audio files are static assets generated from exported JSON; changing the source strings requires re-running the generation pipeline.
**How to avoid:** Track which questions had translations changed. After all translation edits, run `npx tsx scripts/export-questions.ts && python scripts/generate-burmese-audio.py` for affected files.
**Warning signs:** Spoken Burmese differs from on-screen Burmese text.

### Pitfall 6: Burmese Text Overflow in Fixed-Width Containers
**What goes wrong:** Burmese translations are often longer than English equivalents. Fixed-width containers (buttons, cards, tab bars) may overflow, truncate, or break layout.
**Why it happens:** Burmese requires more characters to express the same concept. The app was designed around English text widths.
**How to avoid:** After each wave of translations, check components in mobile viewport (390px) for overflow. Use `flex-shrink` and `min-w-0` to allow text to wrap.
**Warning signs:** Horizontal scroll appearing, text being cut off, buttons with unreadable labels.

### Pitfall 7: showBurmese Guard Missing in Conditional Paths
**What goes wrong:** A component shows Burmese text even when the user has set English-only mode, or doesn't show Burmese when bilingual mode is active.
**Why it happens:** Complex conditional rendering paths may not check `showBurmese` in all branches. Dynamic content (template strings, mapped arrays) may skip the guard.
**How to avoid:** For each component using inline Burmese, verify ALL Burmese text paths are guarded by `showBurmese` or rendered through a bilingual component that handles it.
**Warning signs:** Burmese text appearing in English-only mode, or missing in bilingual mode.

## Code Examples

### Pattern 1: Updating a Centralized String
```typescript
// src/lib/i18n/strings.ts
export const strings = {
  nav: {
    // BEFORE: Robotic/formal translation
    dashboard: { en: 'Dashboard', my: 'ဒက်ရှ်ဘုတ်' },
    // AFTER: Natural, with English in parentheses per user decision
    dashboard: { en: 'Dashboard', my: 'အဓိကစာမျက်နှာ (Dashboard)' },
  },
};
```

### Pattern 2: Updating Question Data Translation
```typescript
// src/constants/questions/american-government.ts
{
  id: 'GOV-P01',
  question_en: 'What is the supreme law of the land?',
  // BEFORE: Formal/stiff
  question_my: 'နိုင်ငံ၏ အမြင့်ဆုံးဥပဒေကား အဘယ်နည်း။',
  // AFTER: Casual conversational per user decision
  question_my: 'တိုင်းပြည်ရဲ့ အမြင့်ဆုံးဥပဒေက ဘာလဲ။',
}
```

### Pattern 3: Inline Component String Update
```tsx
// src/pages/SettingsPage.tsx
<SettingsSection
  icon={<Palette className="h-5 w-5" />}
  titleEn="Appearance"
  // BEFORE
  titleMy={'\u1021\u101E\u103D\u1004\u103A\u1021\u1015\u103C\u1004\u103A'}
  // AFTER: Use literal characters for readability
  titleMy="ပုံပန်းသဏ္ဍာန် (Appearance)"
  showBurmese={showBurmese}
>
```

### Pattern 4: Adding Myanmar Line-Breaking CSS
```css
/* src/styles/globals.css -- add to .font-myanmar rule */
.font-myanmar {
  font-family: 'Noto Sans Myanmar', 'Inter', system-ui, sans-serif;
  letter-spacing: 0.02em;
  /* Myanmar line-breaking: prevent mid-syllable breaks */
  overflow-wrap: anywhere;
  word-break: keep-all;
  line-break: strict;
}
```

### Pattern 5: Cross-Check File Format for AI Verification
```markdown
<!-- .planning/phases/25-burmese-translation-audit/cross-check-wave-1.md -->
## Wave 1: Questions & Answers - Cross-Check

| ID | Context | English | Proposed Burmese |
|----|---------|---------|-----------------|
| GOV-P01-q | question text | What is the supreme law of the land? | တိုင်းပြည်ရဲ့ အမြင့်ဆုံးဥပဒေက ဘာလဲ။ |
| GOV-P01-a1 | study answer | the Constitution | ဖွဲ့စည်းပုံအခြေခံဥပဒေ (Constitution) |

Instructions: Copy this table to Gemini and GPT. Ask each to verify/improve the Burmese column.
Report back disagreements.
```

### Pattern 6: Audio Regeneration Pipeline
```bash
# 1. Export updated Burmese text to JSON
npx tsx scripts/export-questions.ts

# 2. Generate Burmese audio (requires pip install edge-tts)
python scripts/generate-burmese-audio.py

# 3. Compress audio files (optional, reduces size)
bash scripts/compress-audio.sh
```

## Scope Inventory

### Files to Audit by Priority

**Wave 1: Question Data (highest priority)**
- `src/constants/questions/american-government.ts` (47 questions)
- `src/constants/questions/rights-responsibilities.ts` (10 questions)
- `src/constants/questions/american-history-colonial.ts` (13 questions)
- `src/constants/questions/american-history-1800s.ts` (7 questions)
- `src/constants/questions/american-history-recent.ts` (10 questions)
- `src/constants/questions/symbols-holidays.ts` (13 questions)
- `src/constants/questions/uscis-2025-additions.ts` (28 questions)
- Total: 128 questions x (question_my + studyAnswers[].text_my + answers[].text_my + explanation.brief_my + optional mnemonic_my/funFact_my/commonMistake_my)

**Wave 2: Centralized Strings + Navigation**
- `src/lib/i18n/strings.ts` (~250 keyed strings)
- `src/components/navigation/navConfig.ts` (6 nav tab labels)
- `src/lib/mastery/categoryMapping.ts` (3 main + 7 sub-category names)
- `src/lib/social/badgeDefinitions.ts` (7 badge names/descriptions)
- `src/lib/mastery/nudgeMessages.ts` (~25 message templates)
- `src/lib/nba/nbaStrings.ts` (8 NBA state contents)

**Wave 3: Core UI Components (buttons/labels)**
- `src/pages/LandingPage.tsx` (landing page strings)
- `src/pages/AuthPage.tsx` (auth flow strings)
- `src/pages/SettingsPage.tsx` (settings labels/descriptions)
- `src/pages/Dashboard.tsx` (dashboard component strings)
- `src/pages/StudyGuidePage.tsx` (study mode tabs, labels)
- `src/pages/TestPage.tsx` (test page strings)
- `src/pages/InterviewPage.tsx` (interview strings)
- `src/pages/HubPage.tsx` (hub page strings)
- `src/components/onboarding/WelcomeScreen.tsx`
- `src/components/onboarding/OnboardingTour.tsx`

**Wave 4: Toasts, Modals, PWA Components**
- `src/components/pwa/WelcomeModal.tsx`
- `src/components/pwa/NotificationSettings.tsx`
- `src/components/pwa/NotificationPrePrompt.tsx`
- `src/components/pwa/IOSTip.tsx`
- `src/components/pwa/InstallPrompt.tsx`
- `src/components/update/WhatsNewModal.tsx`
- `src/components/update/UpdateBanner.tsx`
- `src/components/sessions/ResumeSessionCard.tsx`
- `src/components/sessions/UnfinishedBanner.tsx`
- `src/components/sessions/StartFreshConfirm.tsx`
- `src/components/sessions/ResumePromptModal.tsx`
- `src/components/sessions/SessionCountdown.tsx`
- `src/lib/errorSanitizer.ts` (error messages -- keep English per decision)

**Wave 5: Social, SRS, Sort, Quiz Components**
- `src/components/social/BadgeCelebration.tsx`
- `src/components/social/BadgeHighlights.tsx`
- `src/components/social/BadgeGrid.tsx`
- `src/components/social/ShareCardPreview.tsx`
- `src/components/social/LeaderboardTable.tsx`
- `src/components/social/SocialSettings.tsx`
- `src/components/social/SocialOptInFlow.tsx`
- `src/components/social/StreakHeatmap.tsx`
- `src/components/srs/DeckManager.tsx`
- `src/components/srs/ReviewCard.tsx`
- `src/components/srs/SessionSetup.tsx`
- `src/components/srs/SessionSummary.tsx`
- `src/components/srs/RatingButtons.tsx`
- `src/components/srs/SRSWidget.tsx`
- `src/components/srs/ReviewSession.tsx`
- `src/components/srs/ReviewHeatmap.tsx`
- `src/components/srs/AddToDeckButton.tsx`
- `src/components/sort/SortModeContainer.tsx`
- `src/components/sort/SwipeableCard.tsx`
- `src/components/sort/KnowDontKnowButtons.tsx`
- `src/components/sort/SRSBatchAdd.tsx`
- `src/components/sort/RoundSummary.tsx`
- `src/components/sort/MissedCardsList.tsx`
- `src/components/sort/SortProgress.tsx`
- `src/components/sort/SortCountdown.tsx`
- `src/components/quiz/*.tsx` (FeedbackPanel, QuizHeader, AnswerOption, etc.)
- `src/components/results/*.tsx` (TestResultsScreen, CategoryBreakdown, etc.)
- `src/components/interview/*.tsx` (InterviewSession, InterviewResults, etc.)
- `src/components/progress/MasteryMilestone.tsx`
- `src/components/progress/SkillTreePath.tsx`

**Cross-Cutting: Font & Layout Verification**
- 102 files with `font-myanmar` class usage (verify completeness)
- `src/styles/globals.css` (add Myanmar line-breaking rules)
- Responsive overflow checks across all waves

### Quantitative Summary
- **Centralized strings:** ~250 in `strings.ts`
- **Question data fields:** 128 questions x ~8-12 MY fields each = ~1000-1500 Burmese strings
- **Inline component strings:** ~308 Myanmar Unicode occurrences across 54 TSX files
- **Category/badge/nudge strings:** ~50 in supporting files
- **Audio files to potentially regenerate:** up to 384 (128 x 3 types)
- **Files using showBurmese:** 109
- **Files using font-myanmar:** 102
- **Accessibility labels with Burmese:** 0 (all English-only currently)

## Discretion Recommendations

### String Centralization Approach
**Recommendation: Leave inline, audit in place.** Moving 70+ files' inline strings to `strings.ts` is high-risk refactor with no user benefit. Only centralize if a string is genuinely reused across multiple components (currently rare for inline strings).

### Grammatical Particle Verification
**Recommendation: Light-touch.** AI consensus (Claude/Gemini/GPT) can catch major particle errors but cannot guarantee native-level correctness. Flag obviously wrong particles (e.g., subject/object marker confusion) but don't attempt deep grammatical analysis. The 3-AI consensus approach is the practical limit.

### Audio Commit Strategy
**Recommendation: Separate commit after translation wave.** Audio files are large binary blobs (384 files). Commit translation code changes first, then regenerate and commit audio separately. This keeps code review clean and allows selective audio regeneration.

### Verified Marker Format
**Recommendation: TSDoc comment on each string group.** Add `/** @verified 3-AI consensus 2026-02-XX */` above string objects in `strings.ts` and question files. Avoids separate tracking file that goes stale. For inline strings, add HTML comment or nothing (inline strings are verified by wave completion).

### Accessibility Label Translation
**Recommendation: Keep aria-labels in English.** Myanmar screen reader support (NVDA, JAWS, VoiceOver) for Myanmar language is extremely limited. Most Myanmar-speaking users who need screen readers use English-language screen readers. Bilingual aria-labels would add complexity without practical benefit. This is consistent with the "error messages stay English" decision.

### Dynamic String Handling
**Recommendation: Template-based approach (already used).** The existing pattern in `nudgeMessages.ts` and `nbaStrings.ts` using `{category}` placeholders with `.replace()` works well. No changes needed to the approach -- just audit the Burmese templates for quality.

### Review File Format
**Recommendation: Markdown table per wave.** Each wave produces a `cross-check-wave-N.md` file with ID, context, English, proposed Burmese columns. User copies table to Gemini/GPT for independent verification. Disagreements go into a single `flagged-disagreements.md` file the user reviews at their pace.

### Button Layout
**Recommendation: Context-dependent.** Buttons in navigation and main actions: stacked (Burmese above, English below per BilingualButton pattern). Small inline buttons (e.g., "Skip", "Cancel"): side-by-side if space allows, stacked if not. Use the existing BilingualButton component for consistency.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Unicode escapes in source | Literal Myanmar characters | Phase 18 | Readability -- literal chars easier to audit |
| No Myanmar font loading | System-dependent | Original build | FOUT risk on devices without Noto Sans Myanmar |
| No line-breaking rules | Browser defaults | Original build | Mid-syllable breaks possible |
| Missing explanations for 28 Qs | All 128 have explanations | Phase pre-25 | Scope reduction for this phase |

## Open Questions

1. **Myanmar font loading via Google Fonts**
   - What we know: Noto Sans Myanmar is referenced but not loaded from CDN. The CSP middleware must allow `fonts.googleapis.com` and `fonts.gstatic.com`.
   - What's unclear: Whether the current CSP already allows these domains (it likely does since Inter is loaded from Google Fonts, but must verify).
   - Recommendation: Check `middleware.ts` CSP headers before adding the font import. If CSP blocks it, add the domain to the allowlist.

2. **Edge cases in showBurmese conditional coverage**
   - What we know: 109 files use `showBurmese`. The variable is derived from context.
   - What's unclear: Whether every Burmese text in those files is properly guarded. Components might render Burmese text through child components that don't check the flag.
   - Recommendation: Systematic file-by-file verification during font-myanmar audit wave.

3. **Myanmar numerals in existing strings**
   - What we know: User decided Myanmar numerals for narrative, Arabic for scores/technical.
   - What's unclear: How many existing strings already use Myanmar numerals vs need conversion.
   - Recommendation: Audit during translation quality pass. Many existing strings already mix formats.

## Sources

### Primary (HIGH confidence)
- Direct codebase analysis of all files listed above
- `src/lib/i18n/strings.ts` -- 387 lines, full BilingualString catalog
- `src/types/index.ts` -- Question/Explanation/Answer interfaces
- `src/constants/questions/*.ts` -- all 7 question files verified
- `src/styles/globals.css` + `tokens.css` -- font configuration verified
- `scripts/generate-burmese-audio.py` -- audio pipeline verified
- `public/audio/my-MM/female/` -- 384 files confirmed

### Secondary (MEDIUM confidence)
- Myanmar line-breaking CSS -- based on general CSS typography knowledge, not Myanmar-specific testing
- Screen reader recommendation -- based on known limited Myanmar language support in assistive technology

## Metadata

**Confidence breakdown:**
- Architecture patterns: HIGH -- direct codebase analysis of all relevant files
- Scope inventory: HIGH -- file counts and string counts verified via grep/glob
- CSS typography: MEDIUM -- Myanmar line-breaking behavior varies by browser engine
- Audio pipeline: HIGH -- scripts and output verified directly

**Research date:** 2026-02-17
**Valid until:** 2026-03-17 (stable -- content audit, no external dependencies changing)
