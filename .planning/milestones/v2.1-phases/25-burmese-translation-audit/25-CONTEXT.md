# Phase 25: Burmese Translation Audit - Context

**Gathered:** 2026-02-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Every Burmese translation in the app reads naturally to a native speaker with consistent terminology. Zero missing translations across all user-facing screens. Recurring concepts use the same Burmese terms throughout. This is a content quality and consistency phase, not a new feature.

Includes: translation quality improvement, missing translation gaps, terminology standardization, font-myanmar class verification, showBurmese toggle logic verification, Burmese text overflow/wrapping fixes, Burmese audio regeneration for changed strings, and 28 missing USCIS 2025 explanation objects.

</domain>

<decisions>
## Implementation Decisions

### Translation Quality Standard
- **Register:** Casual conversational — how you'd talk to a friend, informal pronouns, colloquial phrasing
- **English terms:** Hybrid approach — translate to Burmese first, then show English in parentheses for key terms: e.g., နိုင်ငံသား (Citizen)
- **UI action words:** Burmese + English subtitle on buttons — Burmese primary text with smaller English below
- **Button layout:** Claude's discretion — stacked vs inline per context based on available space
- **Proper nouns:** Burmese transliteration + English — both scripts: ဂျော့ချ် ဝါရှင်တန် (George Washington)
- **Number formatting:** Mix by context — Myanmar numerals (၀၁၂၃) in narrative text, Arabic numerals (0123) for scores/counts/technical numbers
- **Ordinals:** Burmese ordinal pattern — ပထမ ပြင်ဆင်ချက် (First Amendment), not "1st ပြင်ဆင်ချက်"
- **Plurals/counting:** Burmese classifier pattern — use proper Burmese counting classifiers: မေးခွန်း ၅ ခု
- **Explanations:** Light pass only — quick readability check but don't rewrite explanations; focus effort on UI strings and question text
- **Line breaking:** Fix Burmese word-wrap issues — ensure text doesn't break mid-syllable, may need CSS adjustments
- **String location:** Claude's discretion — pick best approach based on codebase patterns (centralized vs co-located)
- **Grammatical particles:** Claude's discretion — determine if AI consensus approach can practically verify particle correctness

### AI Cross-Check Process
- **Models:** Claude + Gemini + GPT — three-way cross-check for maximum coverage
- **Consensus rule:** 2 of 3 agree = use it. Only flag all-3-disagree cases for manual review
- **Execution:** Claude generates translations; user independently runs them through Gemini/GPT and shares disagreements
- **Tiebreaker:** User reviews flagged strings (all-3-disagree cases) via a separate review file
- **Auto-apply:** Apply all 2-of-3 consensus strings immediately. Only pause for all-3-disagree cases
- **Change log:** Summary only — high-level summary of categories changed, no per-string detail
- **Verified marker:** Mark strings that passed 3-AI consensus. Format at Claude's discretion (TSDoc comment or separate file)
- **No back-translation** — trust the forward translation process

### Audit Scope & Coverage
- **Priority order:** Questions/answers > buttons/labels > toasts/modals > error messages > accessibility strings
- **Wave structure:** Plan in priority waves — if we run out of time, most important strings are already done
- **28 missing explanations:** Write both English and Burmese explanations for all 28 USCIS 2025 questions
- **Error messages:** Keep in English — users may need to share them for support/debugging
- **Accessibility labels:** Claude's discretion — assess Burmese screen reader support and make pragmatic choice
- **Onboarding:** Fully translate — new users benefit most from Burmese
- **Landing/auth pages:** Full coverage — landing page, auth screens, and all pre-login content bilingual
- **Date formatting:** Keep English dates — Burmese users are familiar with Western date formats
- **Navigation labels:** Bilingual — sidebar items and tab labels show Burmese + English subtitle
- **Toast messages:** Bilingual — even toasts show Burmese with English subtitle for consistency
- **Toggle logic verification:** Yes — verify every showBurmese conditional correctly hides/shows content
- **Font-myanmar audit:** Full audit — verify every Burmese string has the font-myanmar class
- **Responsive layout:** Check Burmese text overflow — verify no containers overflow, truncate awkwardly, or break layouts on mobile
- **Rendering check:** Visual spot-check in Chrome + Safari for obvious Myanmar font rendering issues
- **Known problem areas:** Dashboard, study/flashcards, settings page flagged for particular attention
- **Dynamic strings:** Claude's discretion — audit and determine best approach per case

### Terminology Consistency
- **Glossary:** Create .planning/burmese-glossary.md as permanent living reference — grouped by domain (Civics/Government, UI Actions, Navigation, Study Modes, etc.)
- **Practice vs Test:** Clearly distinct Burmese terms — separate words to avoid confusion
- **Category names:** Standardize all 7 category names with fixed canonical Burmese translations
- **Achievement names:** Creative Burmese with English in parentheses — fun/motivating names
- **Study mode tabs:** Bilingual — Browse, Sort, Deck, Review get Burmese + English subtitle treatment
- **USCIS terms:** AI consensus determines best Burmese terms for USCIS-specific concepts
- **No-translate list:** Include in glossary — terms like 'USCIS', 'N-400', 'Form I-485' must remain in English
- **Sentence patterns:** Terms only — no sentence pattern templates in glossary

### Audio Regeneration
- **Sync policy:** Re-generate affected Burmese MP3 audio files when translations change
- **Commit strategy:** Claude's discretion on whether to bundle with translation changes or separate

### Verification
- **Build check:** Full build + test (npm run build + npm run test:run) after all changes
- **Visual QA:** Code review only — no visual testing needed
- **Review file:** Separate file with flagged disagreements for user review at own pace
- **Review flow:** Claude's discretion on practical review format

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

</decisions>

<specifics>
## Specific Ideas

- Three-AI consensus approach (Claude + Gemini + GPT) for translation quality — user verifies through external tools
- Dashboard, study/flashcards, and settings page specifically flagged as having translation quality issues
- Burmese + English subtitle pattern applies universally: buttons, tabs, navigation, toasts
- 28 USCIS 2025 questions need both English and Burmese explanations written from scratch
- Burmese glossary as permanent living project artifact, not just phase artifact
- Priority waves ensure highest-impact strings are addressed first

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 25-burmese-translation-audit*
*Context gathered: 2026-02-17*
