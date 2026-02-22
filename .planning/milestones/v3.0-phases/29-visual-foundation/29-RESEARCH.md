# Phase 29: Visual Foundation - Research

**Researched:** 2026-02-19
**Domain:** CSS design tokens, Tailwind configuration, visual consistency audit
**Confidence:** HIGH

## Summary

Phase 29 is primarily an internal consistency phase with no new library dependencies. The codebase already has strong foundations: a complete design token system in `tokens.css`, border radius tokens registered in Tailwind config, a proven JS spring motion system in `motion-config.ts`, and semantic color tokens. The biggest gap is **typography** -- 1,084 text-size usages with no named semantic scale, and 23 occurrences of `text-[10px]` as the most common arbitrary value.

Secondary gaps are: (1) four legacy `.glass-panel` usages needing migration to the three-tier glass system, (2) three touch target violations at 32px, (3) unused CSS duration tokens that should be resolved, and (4) the QuestionReviewList radius inconsistency.

**Primary recommendation:** Define the typography scale in `tailwind.config.js` using Tailwind's array/object fontSize syntax, migrate `text-[10px]` to the new `caption` utility, and fix the handful of targeted inconsistencies across radius, touch targets, and glass panels.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Spacing Grid
- Already enforced via Tailwind's default 4px spacing scale -- no migration needed
- 3 approved arbitrary-pixel exceptions: `gap-[2px]`, `bottom-[140px]`, `h-[5px]`
- Half-step values (0.5 = 2px) acceptable
- Phase 29 work is documentation/enforcement, not migration

#### Typography Scale
- No named type scale exists currently -- must be created
- Scale tiers locked: caption (10px), body-xs (12px), body-sm (14px), body (16px), body-lg (18px), heading-sm (20-24px), heading (28-30px), display (36-48px)
- Burmese font sizing is co-equal with English -- no separate scale needed
- 23 occurrences of `text-[10px]` across 13+ components are strongest migration candidate

#### Border Radius
- Token scale fully registered in Tailwind config -- no new tokens needed
- Component-to-radius mapping locked:
  - `rounded-full` = pill buttons, badges, circles
  - `rounded-xl` = standard action buttons, inputs
  - `rounded-2xl` = cards, modals, containers, dialogs
  - `rounded-lg` = tooltips, nav chrome
  - `rounded-md` = flag toggles, inline secondary actions only
  - `rounded-sm` = data-viz cells only
  - `rounded-none` = full-bleed nav bars
- One fix: `QuestionReviewList.tsx` filter buttons use `rounded-md`, should be `rounded-xl`

#### Touch Targets
- 44px minimum standard
- Three fixes: `ShareButton.tsx` compact (32px), `AddToDeckButton.tsx` compact (32px), `Dialog.tsx` close button (~32px)
- `FlagToggle.tsx` at 36px approved as-is (inside 56px wrapper)

#### Dark Mode Glass Contrast
- Three-tier system already specified in `globals.css`
- Legacy `.glass-panel` class used in 4 page-level components must migrate to three-tier
- `.glass-heavy` (0.30 opacity) forbidden for content-bearing surfaces in dark mode

#### Motion Tokens
- JS springs in `motion-config.ts` are the authoritative motion system (93 usages across 35 files)
- CSS duration tokens (`--duration-fast` etc.) defined in tokens.css, registered in Tailwind config, but consumed by zero components
- Phase 29 should resolve the CSS/JS motion split

### Claude's Discretion
- Exact semantic name choices for typography scale (tiers locked, naming flexible)
- Whether to audit and migrate all `text-[10px]` to `caption` in this phase or defer
- Whether CSS duration tokens get wired to glass transitions or documented as deprecated
- Exact approach to `.glass-panel` migration (replace in-place vs migration path)
- Approach to enforcing radius mapping going forward (ESLint rule vs documentation)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| VISC-01 | 4px spacing grid enforcement | Already achieved; need documentation + approved exceptions list |
| VISC-02 | Typography scale locked to semantic names | Define fontSize in tailwind.config.js, migrate `text-[10px]` to `caption` |
| VISC-03 | Border radius per component type | Fix QuestionReviewList `rounded-md` -> `rounded-xl`, document mapping |
| VISC-04 | 44x44px touch targets on all interactive elements | Fix ShareButton, AddToDeckButton, Dialog close button (3 violations) |
| VISC-05 | Dark mode glass panel contrast and readability | Migrate 4 `.glass-panel` usages to three-tier system, verify contrast |
| VISC-06 | Motion tokens unified between CSS and JS | Wire CSS tokens to glass transitions OR deprecate; document JS springs as authoritative |
| VISC-07 | Micro-interactions on every interactive element | Audit interactive elements for whileTap/whileHover; 36 usages exist across 18 files |
</phase_requirements>

## Standard Stack

### Core (Already in Project)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| tailwindcss | 3.x | Utility-first CSS with design token integration | Active, config at `tailwind.config.js` |
| motion/react | Latest | Spring physics animations (whileTap, whileHover) | Active, 93 spring usages across 35 files |
| tokens.css | N/A | CSS custom properties for colors, radius, shadows, motion | Active, single source of truth |

### No New Dependencies Required
This phase is purely configuration, auditing, and migration work within the existing stack. No `npm install` needed.

## Architecture Patterns

### Pattern 1: Tailwind Custom fontSize with Typography Metadata

Tailwind v3 supports tuple and object syntax for custom font sizes that bundle line-height, letter-spacing, and font-weight into a single utility class.

**Recommended approach for the typography scale:**

```javascript
// tailwind.config.js theme.extend.fontSize
fontSize: {
  'caption': ['0.625rem', { lineHeight: '0.875rem', letterSpacing: '0.01em' }],  // 10px/14px
  'body-xs': ['0.75rem', { lineHeight: '1rem' }],                                 // 12px/16px
  'body-sm': ['0.875rem', { lineHeight: '1.25rem' }],                             // 14px/20px
  'body': ['1rem', { lineHeight: '1.5rem' }],                                     // 16px/24px
  'body-lg': ['1.125rem', { lineHeight: '1.75rem' }],                             // 18px/28px
  'heading-sm': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],        // 20px/28px
  'heading': ['1.75rem', { lineHeight: '2.25rem', fontWeight: '700' }],           // 28px/36px
  'display': ['2.25rem', { lineHeight: '2.75rem', fontWeight: '800' }],           // 36px/44px
}
```

Source: Context7 /websites/v3_tailwindcss — fontSize configuration docs

**Key insight:** Using `theme.extend.fontSize` preserves all default Tailwind sizes (`text-xs`, `text-sm`, `text-base`, etc.) while adding the semantic names alongside them. This avoids a breaking migration -- both old and new classes work during gradual adoption.

### Pattern 2: Glass Panel Migration (In-Place Replacement)

The legacy `.glass-panel` class in `globals.css` is a monolithic `@apply` rule. The three-tier system (`.glass-light`, `.glass-medium`, `.glass-heavy`) is already defined and production-ready.

**Migration approach:** Replace `.glass-panel` className with the appropriate tier class in each of the 4 usages:

| Component | Current | Target Tier | Rationale |
|-----------|---------|-------------|-----------|
| `TestPage.tsx` (2 usages) | `.glass-panel` | `.glass-light` | Content cards, need readability |
| `PracticeSession.tsx` | `.glass-panel` | `.glass-light` | Content card |
| `TestResultsScreen.tsx` | `.glass-panel` | `.glass-light` | Results display |
| `SkippedReviewPhase.tsx` | `.glass-panel` | `.glass-light` | Review card |
| `OpEdPage.tsx` | `.glass-panel` | `.glass-medium` | Header with gradient overlay |

After migration, the `.glass-panel` class definition can be removed from `globals.css`.

### Pattern 3: Touch Target Fix Pattern

For icon-only compact buttons at 32px (h-8 w-8):

```tsx
// Before: 32px hit area
className="h-8 w-8"

// After: Visual size unchanged, 44px hit area via min sizing
className="h-8 w-8 min-h-[44px] min-w-[44px]"
```

This preserves the visual icon size while expanding the touchable area. For the Dialog close button, adding `p-3` instead of `p-2` achieves the 44px target (16px icon + 2*14px padding = 44px).

### Anti-Patterns to Avoid

- **Don't replace the Tailwind defaults:** Use `theme.extend.fontSize`, not `theme.fontSize`. Overriding removes all default sizes and breaks existing code.
- **Don't add font-weight to every scale entry:** Only heading and display tiers benefit from bundled weight. Body tiers should leave weight flexible for bold/semibold variations.
- **Don't create a separate Burmese typography scale:** The `.font-myanmar` class handles letter-spacing and line-height adjustments independently of font size.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Typography scale enforcement | Custom CSS classes for each size | Tailwind fontSize config | Tailwind purging, IDE autocomplete, consistency |
| Glass morphism tiers | New CSS variables per component | Existing `.glass-light/medium/heavy` classes | Already defined, dark-mode tested, with fallbacks |
| Touch target enforcement | Custom wrapper components | `min-h-[44px] min-w-[44px]` on existing elements | Simpler, no component tree changes |
| Motion tokens | New animation library | Existing `motion-config.ts` + Tailwind transitionDuration | Already proven across 35 files |

## Common Pitfalls

### Pitfall 1: Breaking Tailwind Default Sizes
**What goes wrong:** Using `theme.fontSize` instead of `theme.extend.fontSize` removes ALL default text sizes, breaking hundreds of existing usages.
**Why it happens:** Tailwind's `theme` key replaces defaults; `theme.extend` merges with them.
**How to avoid:** Always use `theme.extend.fontSize` for additive changes.
**Warning signs:** `text-xs`, `text-sm`, `text-base`, etc. stop working after config change.

### Pitfall 2: Glass Migration Breaking Hover Effects
**What goes wrong:** The legacy `.glass-panel` includes `hover:-translate-y-1 hover:shadow-primary/30` transitions. The new `.glass-*` tier classes don't include hover effects.
**Why it happens:** The three-tier system separates visual tier from behavior (hover, focus).
**How to avoid:** When replacing `.glass-panel`, explicitly add hover transition classes that were bundled in the old class.
**Warning signs:** Cards stop lifting on hover after migration.

### Pitfall 3: Typography Scale Name Collision
**What goes wrong:** Custom fontSize names like `body` or `display` might collide with Tailwind's existing `text-base` or future utility names.
**Why it happens:** Tailwind reserves certain utility prefixes.
**How to avoid:** The names `caption`, `body-xs`, `body-sm`, `body`, `body-lg`, `heading-sm`, `heading`, `display` don't collide with any existing Tailwind utility. `text-caption`, `text-body`, etc. are all safe.
**Warning signs:** None -- these names are verified safe in Tailwind v3.

### Pitfall 4: min-h/min-w Touch Targets Breaking Flex Layouts
**What goes wrong:** Adding `min-h-[44px]` to a flex child can cause unexpected layout expansion.
**Why it happens:** Minimum sizing constraints interact with flex-grow/shrink.
**How to avoid:** Test each fix in context. For the compact icon buttons (ShareButton, AddToDeckButton), the buttons are typically flex children with shrink-0, so min sizing is safe.
**Warning signs:** Layout shifts in surrounding content after adding min-h/min-w.

## Code Examples

### Typography Scale Definition
```javascript
// tailwind.config.js - theme.extend.fontSize
// Verified pattern from Tailwind v3 docs (Context7)
fontSize: {
  'caption': ['0.625rem', { lineHeight: '0.875rem', letterSpacing: '0.01em' }],
  'body-xs': ['0.75rem', { lineHeight: '1rem' }],
  'body-sm': ['0.875rem', { lineHeight: '1.25rem' }],
  'body': ['1rem', { lineHeight: '1.5rem' }],
  'body-lg': ['1.125rem', { lineHeight: '1.75rem' }],
  'heading-sm': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],
  'heading': ['1.75rem', { lineHeight: '2.25rem', fontWeight: '700' }],
  'display': ['2.25rem', { lineHeight: '2.75rem', fontWeight: '800' }],
}
```

### Glass Panel Migration Example
```tsx
// Before (legacy)
<div className="glass-panel rounded-2xl p-6 shadow-2xl shadow-primary/20">

// After (three-tier + explicit hover)
<div className="glass-light rounded-2xl p-6 shadow-2xl shadow-primary/20 transition duration-500 hover:-translate-y-1 hover:shadow-primary/30">
```

### Touch Target Fix Example
```tsx
// Before: 32px hit area
<motion.button className="h-8 w-8 inline-flex items-center justify-center rounded-full">

// After: 44px hit area with same visual size
<motion.button className="h-8 w-8 min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-full">
```

### CSS Motion Token Wiring (if chosen over deprecation)
```css
/* Wire CSS duration tokens to glass tier transitions */
.glass-light,
.glass-medium,
.glass-heavy {
  transition: box-shadow var(--duration-slow) var(--ease-out),
              transform var(--duration-slow) var(--ease-out);
}
```

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Raw Tailwind text-sizes | Semantic typography scale in config | Consistent sizing, easier auditing |
| `.glass-panel` monolithic class | Three-tier `.glass-light/medium/heavy` | Dark-mode-aware, composable, tiered |
| No touch target enforcement | 44px min-h/min-w on compact buttons | WCAG compliance, mobile usability |

## Discretion Recommendations

### 1. Typography Naming: Use the context-locked tiers
The names from CONTEXT.md (`caption`, `body-xs`, `body-sm`, `body`, `body-lg`, `heading-sm`, `heading`, `display`) are all Tailwind-safe and descriptive. Recommend using exactly these.

### 2. Migrate `text-[10px]` in this phase
The 23 occurrences across 16 files are a focused, mechanical migration. Migrating them to `text-caption` in this phase eliminates the most common arbitrary value and validates the new scale immediately. Deferring means Phase 31+ inherits the technical debt.

### 3. Wire CSS tokens to glass transitions (don't deprecate)
The CSS tokens are already registered in Tailwind's `transitionDuration` config. The glass tier classes have hardcoded `0.3s ease` transitions. Wiring them to use `var(--duration-slow) var(--ease-out)` is a 3-line change that unifies CSS and JS motion philosophies. Deprecation requires documentation work for no gain.

### 4. Replace `.glass-panel` in-place
All 6 usages are straightforward replacements. No migration path needed -- the new tier classes are already defined and tested. Remove `.glass-panel` from `globals.css` after migration.

### 5. Document radius mapping (not ESLint)
An ESLint rule for border radius would be over-engineering for a solo developer + Claude workflow. A documented mapping in `tokens.css` comments + the single `rounded-md -> rounded-xl` fix is sufficient.

## Open Questions

1. **`text-[10px]` migration scope**: The 16 files with `text-[10px]` also include `text-[11px]` (1 file: `TextAnswerInput.tsx`) and `text-[13px]` (1 file: `ResumeSessionCard.tsx`). Should these also be migrated to the nearest scale step, or left as intentional exceptions?
   - Recommendation: Migrate to nearest -- `text-[11px]` -> `text-body-xs` (12px), `text-[13px]` -> `text-body-sm` (14px). The visual difference is negligible.

2. **Glass-panel hover effects preservation**: The old `.glass-panel` bundles `hover:-translate-y-1 hover:shadow-primary/30 focus-within:ring-2`. Should these be kept on migrated components?
   - Recommendation: Keep hover effects. They're part of the interactive personality. Add them explicitly alongside the tier class.

## Sources

### Primary (HIGH confidence)
- Context7 /websites/v3_tailwindcss - fontSize configuration with line-height and font-weight
- Codebase grep: `tokens.css`, `tailwind.config.js`, `globals.css`, `motion-config.ts`
- Codebase grep: 93 spring usages across 35 files, 36 whileTap/whileHover across 18 files

### Secondary (MEDIUM confidence)
- Glass tier migration: Based on existing `.glass-light/medium/heavy` definitions already in `globals.css`
- Touch target sizes: Based on existing 44px standard documented in `Button.tsx`

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new dependencies, all existing infrastructure
- Architecture: HIGH - Tailwind fontSize config verified via Context7
- Pitfalls: HIGH - Based on known Tailwind gotchas and codebase-specific patterns

**Research date:** 2026-02-19
**Valid until:** Indefinite (internal codebase patterns, no external API volatility)
