# Phase 45: Content Enrichment - Research

**Researched:** 2026-03-01
**Domain:** Content data population + UI component updates for civic test question enrichment
**Confidence:** HIGH

## Summary

Phase 45 is primarily a content-generation and UI-refinement phase, not a technology-introduction phase. All 128 questions already have `explanation` objects with `relatedQuestionIds` fully populated (128/128). The remaining work fills sparse enrichment fields: mnemonics (17/128), funFacts (25/128), commonMistakes (28/128), and citations (48/128). The `Explanation` TypeScript interface already defines all needed fields. UI components (`ExplanationCard`, `RelatedQuestions`, `FeedbackPanel`, `Flashcard3D`) exist and render enrichment content — the changes are visual updates (mnemonic treatment, tricky badge) and a new study tip card component.

The biggest risk is data quality and volume: generating ~400+ bilingual content entries across 7 question files. The existing question test suite validates structure (128 questions, unique IDs, bilingual text) but does not validate enrichment completeness — new tests are needed to enforce CONT-01 through CONT-04 coverage.

**Primary recommendation:** Split into 3 waves: (1) content data generation for all 128 questions, (2) UI component updates (mnemonic treatment, tricky badge, study tip cards), (3) integration wiring and verification.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- AI-generated batch with manual review — use Claude to generate all missing enrichment fields, then review before committing
- Mnemonics use a mix of acronyms (for list-type answers like branches of gov, amendments) and story-based connections (for concept questions)
- Burmese mnemonics are culturally adapted — use Burmese wordplay/references where possible, not direct translations
- Citations use broad sourcing: constitutional refs for gov questions, historical dates/acts for history, USC references for rights — every question gets a citation where applicable
- Fun facts and common mistakes follow existing bilingual pattern (English + Burmese)
- Study tip cards appear at the top of category practice/drill only (DrillPage) — not in study guide, dashboard, or hub
- Dismissal is permanent — once dismissed, never shows again for that category (stored in localStorage/user state)
- Content is actionable category strategy tips (e.g., "System of Government has the most questions (35). Focus on the 3 branches and how they check each other.")
- Bilingual: English primary, Burmese below when language toggle is on
- Manually curated tricky question tags — specific questions tagged as tricky based on common test-taker mistakes, not performance data
- Tricky badge appears in both FeedbackPanel (quiz) and Flashcard3D (study)
- Visual: small pill badge with warning icon, amber/warning color (similar to existing DrillBadge, ModeBadge patterns)
- Bilingual badge text
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

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CONT-01 | All 128 questions have mnemonic fields populated (English) | Currently 17/128 populated. Existing `mnemonic_en` field in Explanation type. Generate 111 new mnemonics. |
| CONT-02 | All 128 questions have fun fact fields populated (English + Burmese) | Currently 25/128 populated. Existing `funFact_en`/`funFact_my` fields. Generate ~103 new pairs. |
| CONT-03 | All 128 questions have common mistake fields populated (English + Burmese) | Currently 28/128 populated. Existing `commonMistake_en`/`commonMistake_my` fields. Generate ~100 new pairs. |
| CONT-04 | All 128 questions have citation fields populated | Currently 48/128 populated. Existing `citation` field. Generate ~80 new citations. |
| CONT-05 | Mnemonics display with distinct visual treatment (lightbulb icon, accent border) | ExplanationCard currently uses Brain icon + primary-500/30 border. Update to Lightbulb + amber accent left border. |
| CONT-06 | 7 category study tips shown as dismissible cards in category practice | New StudyTipCard component needed. Insert at top of DrillPage when category drill active. localStorage dismissal. |
| CONT-07 | "Tricky Questions" difficulty badges on hard questions | New `tricky` boolean field on Question type. TrickyBadge component following DrillBadge/ModeBadge pattern. |
| CONT-08 | "See Also" related question chips rendered in study/review contexts | Already fully implemented: RelatedQuestions component + relatedQuestionIds populated 128/128. Verify rendering contexts. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.x | UI framework | Already in use |
| Next.js | 16.x | App framework | Already in use |
| lucide-react | latest | Icons (Lightbulb, AlertTriangle) | Already in use throughout |
| motion/react | latest | Animation for cards | Already in use throughout |
| clsx | latest | Conditional classnames | Already in use throughout |
| vitest | 4.x | Test framework | Already configured |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Tailwind CSS | 3.x | Styling | All component styling |

### Alternatives Considered
None — this phase uses only existing stack. No new dependencies needed.

**Installation:** None required. All libraries already installed.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── constants/questions/     # 7 category files + additions (enrichment data lives here)
├── components/explanations/ # ExplanationCard, RelatedQuestions (mnemonic treatment update here)
├── components/drill/        # DrillBadge pattern (TrickyBadge follows this)
├── components/study/        # Flashcard3D (tricky badge + mnemonic integration)
├── components/quiz/         # FeedbackPanel (tricky badge + mnemonic integration)
├── lib/i18n/               # strings.ts (new bilingual labels)
└── types/                   # index.ts (Question type update for tricky flag)
```

### Pattern 1: Bilingual Rendering
**What:** All user-facing text renders English primary, Burmese conditionally
**When to use:** Every new text element (study tips, badge text, etc.)
**Example:**
```typescript
// From ExplanationCard.tsx — established pattern
<p className="text-xs font-semibold text-foreground">
  {strings.explanations.memoryTip.en}
</p>
{showBurmese && (
  <p className="font-myanmar text-xs text-muted-foreground">
    {strings.explanations.memoryTip.my}
  </p>
)}
```

### Pattern 2: Pill Badge Component
**What:** Small rounded pill with icon + text, color-coded by meaning
**When to use:** TrickyBadge follows DrillBadge and ModeBadge patterns
**Example:**
```typescript
// From DrillBadge.tsx — the exact pattern to follow
<span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/15 px-3 py-1 text-xs font-semibold text-orange-600 dark:text-orange-400">
  <Target className="h-3.5 w-3.5" />
  Drill Mode
  {showBurmese && <span className="font-myanmar">...</span>}
</span>
```

### Pattern 3: localStorage Dismissal
**What:** Permanent dismissal stored in localStorage
**When to use:** Study tip card dismissal per category
**Example:**
```typescript
// Pattern from existing codebase
const STORAGE_KEY = 'dismissed-study-tips';
const dismissed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
// On dismiss:
localStorage.setItem(STORAGE_KEY, JSON.stringify([...dismissed, categoryId]));
```

### Pattern 4: Callout/Card Section in ExplanationCard
**What:** Rounded card with icon, colored border, and bilingual content
**When to use:** Mnemonic visual treatment update
**Example:**
```typescript
// Current mnemonic section in ExplanationCard (line 169-193)
// Uses Brain icon + primary-500/30 border + bg-primary-subtle
// UPDATE TO: Lightbulb icon + amber/warning left-border accent + distinct background
```

### Anti-Patterns to Avoid
- **Don't create a new data file for enrichment content:** All content goes in existing question files alongside the question objects
- **Don't use useEffect for localStorage reads:** Read synchronously on mount (localStorage is synchronous)
- **Don't add new dependencies for badge/card components:** Existing Tailwind + lucide-react covers all needs
- **Don't modify the Explanation interface for tricky:** Tricky is a Question-level flag, not explanation-level

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Badge styling | Custom badge system | Follow DrillBadge/ModeBadge pattern | Consistent visual language across app |
| Dismissal persistence | Custom storage layer | Direct localStorage with JSON array | Simple, established pattern in codebase |
| Icon library | Custom SVGs | lucide-react icons | Already used everywhere, tree-shakeable |
| Animation | Custom transitions | motion/react with useReducedMotion | Existing a11y-safe animation pattern |

**Key insight:** This phase adds no architectural complexity. Every pattern is already established — follow existing conventions exactly.

## Common Pitfalls

### Pitfall 1: Enrichment Data Volume Overwhelming Code Review
**What goes wrong:** 128 questions * 4-5 fields = 500+ content entries. Impossible to review in one PR.
**Why it happens:** Batch content generation produces huge diffs.
**How to avoid:** Split content by category file (7 files). Each plan handles specific categories. Tests validate completeness programmatically.
**Warning signs:** Plan has a single "populate all content" task.

### Pitfall 2: Mnemonic Quality Varies Widely
**What goes wrong:** AI-generated mnemonics range from genuinely helpful to forced/confusing.
**Why it happens:** Some questions (factual recall) lend themselves to mnemonics; others (concept understanding) don't.
**How to avoid:** Use acronym mnemonics for list-type answers (branches, amendments). Use story/association mnemonics for concepts. Skip forced mnemonics — a brief, clear one is better than a clever but confusing one.
**Warning signs:** Mnemonics longer than the answer itself, mnemonics that require prior knowledge.

### Pitfall 3: Burmese Content Fidelity
**What goes wrong:** Direct translations of English mnemonics don't work as memory aids in Burmese.
**Why it happens:** Mnemonics rely on language-specific wordplay, rhyme, and cultural references.
**How to avoid:** CONTEXT.md specifies culturally adapted Burmese mnemonics — but BRMSE-01 (native speaker review) is explicitly deferred. Generate best-effort Burmese and document the limitation.
**Warning signs:** Burmese mnemonics that are literal translations of English wordplay.

### Pitfall 4: Study Tip Card Blocking DrillPage Content
**What goes wrong:** Study tip card at top of DrillPage pushes actual drill content below the fold.
**Why it happens:** Card takes too much vertical space.
**How to avoid:** Keep study tip card compact (2-3 lines max). Use slim design with dismiss button. Don't use modal/overlay.
**Warning signs:** Card height > 80px.

### Pitfall 5: FeedbackPanel ExplanationSection Divergence
**What goes wrong:** FeedbackPanel has its own `ExplanationSection` inline component (lines 111-166) that renders mnemonics separately from `ExplanationCard`. Updating only ExplanationCard misses the FeedbackPanel path.
**Why it happens:** FeedbackPanel renders a simplified inline explanation (not the full ExplanationCard) when `mode === 'practice' && !isCorrect`.
**How to avoid:** Update BOTH the ExplanationSection in FeedbackPanel AND the ExplanationCard component for mnemonic visual treatment. The tricky badge should appear in the FeedbackPanel header area, not inside ExplanationSection.
**Warning signs:** Mnemonic styling looks different in quiz feedback vs flashcard view.

## Code Examples

### Mnemonic Accent Border Treatment (New)
```typescript
// Replace current Brain icon + primary border mnemonic section
// ExplanationCard.tsx lines 169-193
{hasMnemonic && (
  <div className="rounded-xl border-l-4 border-amber-500 bg-amber-500/10 dark:bg-amber-500/15 p-3">
    <div className="flex items-start gap-2">
      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
      <div className="flex-1">
        <p className="text-xs font-semibold text-foreground">
          {strings.explanations.memoryTip.en}
        </p>
        {showBurmese && (
          <p className="font-myanmar text-xs text-muted-foreground">
            {strings.explanations.memoryTip.my}
          </p>
        )}
        <p className="mt-1.5 text-xs text-foreground leading-relaxed">
          {explanation.mnemonic_en}
        </p>
        {showBurmese && explanation.mnemonic_my && (
          <p className="mt-0.5 font-myanmar text-xs text-muted-foreground leading-relaxed">
            {explanation.mnemonic_my}
          </p>
        )}
      </div>
    </div>
  </div>
)}
```

### TrickyBadge Component
```typescript
// New component: src/components/quiz/TrickyBadge.tsx
// Follows DrillBadge pattern
import { AlertTriangle } from 'lucide-react';

export function TrickyBadge({ showBurmese = false }: { showBurmese?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
      <AlertTriangle className="h-3 w-3" />
      Tricky
      {showBurmese && <span className="font-myanmar ml-1">ခက်ခဲသော</span>}
    </span>
  );
}
```

### StudyTipCard Component
```typescript
// New component: src/components/drill/StudyTipCard.tsx
import { useState } from 'react';
import { GraduationCap, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const STORAGE_KEY = 'dismissed-study-tips';

function isDismissed(category: string): boolean {
  try {
    const dismissed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return dismissed.includes(category);
  } catch { return false; }
}

function dismissTip(category: string): void {
  try {
    const dismissed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...dismissed, category]));
  } catch { /* ignore */ }
}

interface StudyTipCardProps {
  category: string;
  tipEn: string;
  tipMy: string;
}

export function StudyTipCard({ category, tipEn, tipMy }: StudyTipCardProps) {
  const [visible, setVisible] = useState(() => !isDismissed(category));
  const { showBurmese } = useLanguage();

  if (!visible) return null;

  return (
    <div className="rounded-xl border border-primary/20 bg-primary-subtle p-3 mb-4">
      <div className="flex items-start gap-2">
        <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div className="flex-1">
          <p className="text-sm text-foreground">{tipEn}</p>
          {showBurmese && (
            <p className="mt-1 font-myanmar text-sm text-muted-foreground">{tipMy}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => { dismissTip(category); setVisible(false); }}
          className="shrink-0 p-1 rounded-lg hover:bg-muted/50"
          aria-label="Dismiss study tip"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
```

### Question Type Update for Tricky Flag
```typescript
// types/index.ts — add to Question interface
export interface Question {
  // ... existing fields ...
  /** Whether this question is commonly tricky for test-takers */
  tricky?: boolean;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Brain icon for mnemonics | Lightbulb icon with amber accent border | Phase 45 | Visual distinction, instant recognition |
| No difficulty indicators | Tricky badge on hard questions | Phase 45 | Learner awareness of challenging content |
| No category study tips | Dismissible study tip cards in drills | Phase 45 | Strategic study guidance |

**Deprecated/outdated:** None — this phase updates existing patterns, doesn't replace deprecated ones.

## Open Questions

1. **Exact tricky question list**
   - What we know: Manually curated based on common test-taker mistakes
   - What's unclear: Specific question IDs to tag
   - Recommendation: Start with ~15-20 questions known to be confusing (e.g., questions about amendments, similar government roles, tricky date questions). Tag in data files, user can review.

2. **Burmese mnemonic quality**
   - What we know: Must be culturally adapted, not direct translations
   - What's unclear: Quality without native speaker review (BRMSE-01 is deferred)
   - Recommendation: Generate best-effort Burmese mnemonics using Burmese cultural references where possible. Document as draft quality pending BRMSE-01 review.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 4.x |
| Config file | vitest.config.ts |
| Quick run command | `pnpm vitest run src/constants/questions/questions.test.ts` |
| Full suite command | `pnpm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CONT-01 | All 128 questions have mnemonic_en | unit | `pnpm vitest run src/constants/questions/questions.test.ts` | Extend existing |
| CONT-02 | All 128 questions have funFact_en + funFact_my | unit | `pnpm vitest run src/constants/questions/questions.test.ts` | Extend existing |
| CONT-03 | All 128 questions have commonMistake_en + commonMistake_my | unit | `pnpm vitest run src/constants/questions/questions.test.ts` | Extend existing |
| CONT-04 | All 128 questions have citation | unit | `pnpm vitest run src/constants/questions/questions.test.ts` | Extend existing |
| CONT-05 | Mnemonic renders with Lightbulb + amber border | manual-only | Visual inspection | N/A |
| CONT-06 | Study tip cards appear and dismiss permanently | unit + manual | `pnpm vitest run src/components/drill/StudyTipCard.test.ts` | Wave 0 |
| CONT-07 | Tricky badge renders on flagged questions | unit + manual | `pnpm vitest run src/constants/questions/questions.test.ts` | Extend existing |
| CONT-08 | Related question chips render in study/review | manual-only | Visual inspection (already implemented) | N/A |

### Sampling Rate
- **Per task commit:** `pnpm vitest run src/constants/questions/questions.test.ts`
- **Per wave merge:** `pnpm test`
- **Phase gate:** Full suite green before verify

### Wave 0 Gaps
- [ ] Extend `questions.test.ts` with enrichment completeness tests (mnemonic_en, funFact_en/my, commonMistake_en/my, citation for all 128 questions)
- [ ] Add tricky flag validation test (all tricky:true questions exist in allQuestions)
- [ ] `src/components/drill/StudyTipCard.test.ts` — dismissal logic tests

## Sources

### Primary (HIGH confidence)
- Codebase analysis: `src/types/index.ts` — Explanation interface with all fields
- Codebase analysis: `src/components/explanations/ExplanationCard.tsx` — current mnemonic rendering
- Codebase analysis: `src/components/quiz/FeedbackPanel.tsx` — inline ExplanationSection
- Codebase analysis: `src/components/study/Flashcard3D.tsx` — badge rendering patterns
- Codebase analysis: `src/components/drill/DrillBadge.tsx` — pill badge pattern
- Codebase analysis: `src/constants/questions/` — enrichment coverage counts
- Codebase analysis: `questions.test.ts` — existing validation suite

### Secondary (MEDIUM confidence)
- USCIS civics test content domain knowledge — question categorization, common mistakes

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new dependencies, all existing
- Architecture: HIGH — all patterns exist in codebase, verified by code reading
- Pitfalls: HIGH — identified from actual code divergences (FeedbackPanel vs ExplanationCard)

**Research date:** 2026-03-01
**Valid until:** Indefinite — content-focused phase, no external dependency changes
