# Phase 45: Content Enrichment - Context

**Gathered:** 2026-03-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Populate ALL 128 questions with mnemonics, fun facts, common mistakes, citations, study tips, and related question links. Surface them visually with updated mnemonic treatment (lightbulb + accent border), category study tip cards, and tricky question badges. The Explanation type and ExplanationCard component already exist with partial data — this phase fills gaps and adds new UI elements.

</domain>

<decisions>
## Implementation Decisions

### Content generation approach
- AI-generated batch with manual review — use Claude to generate all missing enrichment fields, then review before committing
- Mnemonics use a mix of acronyms (for list-type answers like branches of gov, amendments) and story-based connections (for concept questions)
- Burmese mnemonics are culturally adapted — use Burmese wordplay/references where possible, not direct translations
- Citations use broad sourcing: constitutional refs for gov questions, historical dates/acts for history, USC references for rights — every question gets a citation where applicable
- Fun facts and common mistakes follow existing bilingual pattern (English + Burmese)

### Study tip cards
- Appear at the top of category practice/drill only (DrillPage) — not in study guide, dashboard, or hub
- Dismissal is permanent — once dismissed, never shows again for that category (stored in localStorage/user state)
- Content is actionable category strategy tips (e.g., "System of Government has the most questions (35). Focus on the 3 branches and how they check each other.")
- Bilingual: English primary, Burmese below when language toggle is on

### Tricky question badges
- Manually curated — specific questions tagged as tricky based on common test-taker mistakes, not performance data
- Badge appears in both FeedbackPanel (quiz) and Flashcard3D (study)
- Visual: small pill badge with warning icon, amber/warning color (similar to existing DrillBadge, ModeBadge patterns)
- Bilingual badge text

### Mnemonic visual treatment
- Switch from current Brain icon to Lightbulb icon with distinct accent-colored left border (callout style)
- Fixed primary/amber accent color regardless of category — makes mnemonics instantly recognizable as "memory tip"
- Always visible inline (no collapsed/tap-to-reveal) — they're short and the whole point is at-a-glance memorability
- Show in both FeedbackPanel (quiz feedback) and Flashcard3D (back of flashcards)

### Claude's Discretion
- Exact amber shade for mnemonic accent border (within existing design token system)
- Study tip card visual design (icon, border treatment, padding)
- Batch script implementation details for content generation
- Which specific questions to tag as "tricky" (though user may review the list)
- Exact wording of the 7 category study tips

</decisions>

<specifics>
## Specific Ideas

- Mnemonics should feel like memory tricks a tutor would give — not academic, not childish
- Study tips should be strategic ("focus on X because it has the most questions") not motivational ("you can do it!")
- Tricky badge should feel like a friendly heads-up, not a warning — similar to how Duolingo marks hard exercises

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ExplanationCard` (`src/components/explanations/ExplanationCard.tsx`): Already renders mnemonic, funFact, commonMistake, citation, and relatedQuestions sections. Needs mnemonic section updated (Brain icon → Lightbulb + accent border)
- `RelatedQuestions` (`src/components/explanations/RelatedQuestions.tsx`): Fully implemented inline-expandable related question links
- `FeedbackPanel` (`src/components/quiz/FeedbackPanel.tsx`): Already accepts and renders Explanation prop
- `Flashcard3D` (`src/components/study/Flashcard3D.tsx`): Has difficulty tier system (Beginner/Intermediate/Advanced) and renders ExplanationCard on back
- `DrillBadge`, `ModeBadge` (`src/components/drill/`, `src/components/interview/`): Existing pill badge patterns to follow for tricky badge
- `Explanation` type (`src/types/index.ts`): All enrichment fields already defined (mnemonic_en/my, funFact_en/my, commonMistake_en/my, citation, relatedQuestionIds)

### Established Patterns
- Bilingual rendering: English primary, Burmese with `font-myanmar` class shown when `showBurmese` is true (via `useLanguage` hook)
- Design tokens: `bg-card`, `text-foreground`, `border-border`, `bg-primary-subtle`, `text-warning`, etc.
- Animation: motion/react with `useReducedMotion` hook for a11y
- Icon library: lucide-react throughout
- Dismissal state: localStorage patterns exist in ThemeContext and other components

### Integration Points
- Question data files: `src/constants/questions/*.ts` (7 category files + uscis-2025-additions)
- DrillPage (`src/views/DrillPage.tsx`): Where study tip cards will be inserted
- FeedbackPanel: Mnemonic treatment update flows through ExplanationCard
- Flashcard3D: Tricky badge placement + mnemonic visibility via ExplanationCard
- Current enrichment coverage: ~17/128 mnemonics, ~25/128 fun facts, ~28/128 common mistakes populated

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 45-content-enrichment*
*Context gathered: 2026-03-01*
