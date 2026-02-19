# Phase 29: Visual Foundation - Context

**Gathered:** 2026-02-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Enforce spacing grid, typography scale, border radius rules, touch targets, dark mode contrast, and unified motion tokens across all screens. This phase creates a consistent visual language so subsequent animation and interaction work (Phases 30-33) builds on a solid, uniform canvas.

</domain>

<decisions>
## Implementation Decisions

### Spacing Grid
- The codebase already enforces a 4px grid via Tailwind's default spacing scale — no custom spacing tokens needed
- Only 3 intentional arbitrary-pixel exceptions exist: `gap-[2px]` (SegmentedProgressBar segment gaps), `bottom-[140px]` (TestPage toast offset), `h-[5px]` (decorative card accent stripes) — all approved as-is
- Half-step values (0.5 = 2px increments) are recognized Tailwind patterns and acceptable
- `tokens.css` documents `--space-1` through `--space-8` as informational only — Tailwind handles enforcement
- Phase 29 should document the 4px grid standard and flag the 3 exceptions as approved

### Typography Scale
- No named type scale currently exists — components use raw Tailwind size classes ad-hoc
- 23 occurrences of `text-[10px]` across 13+ components for micro-labels/badges — strongest candidate for formalization
- `BilingualText` and `BilingualHeading` have component-level size APIs (xs/sm/md/lg/xl) mapping to Tailwind steps — closest to a named scale
- Burmese font sizing is co-equal (same sizes as English) with only `letter-spacing: 0.02em` and `line-height: 1.4` adjustments in `.font-myanmar` — no separate size scale needed
- Font weight tokens exist in `tokens.css` but are not wired into Tailwind config — purely informational
- Define a named type scale in `tailwind.config.js` mapping semantic names to existing heavy-use steps: caption (10px), body-xs (12px), body-sm (14px), body (16px), body-lg (18px), heading-sm (20-24px), heading (28-30px), display (36-48px)

### Border Radius
- Token scale fully defined in `tokens.css` (`--radius-sm` through `--radius-full`) and registered in `tailwind.config.ts` — no arbitrary `rounded-[Npx]` values exist
- Component-to-radius mapping established:
  - `rounded-full` = pill buttons, badges, circles
  - `rounded-xl` (20px) = standard action buttons, inputs
  - `rounded-2xl` (24px) = cards, modals, containers, dialogs
  - `rounded-lg` (16px) = tooltips, nav chrome
  - `rounded-md` (12px) = flag toggles, inline secondary actions only
  - `rounded-sm` (8px) = data-viz cells only
  - `rounded-none` = full-bleed nav bars
- One inconsistency to fix: `QuestionReviewList.tsx` filter buttons use `rounded-md` instead of `rounded-xl`

### Touch Targets
- 44px minimum is the standard (documented in `Button.tsx`)
- Three violations to fix:
  1. `ShareButton.tsx` compact variant — 32x32px, needs `min-h-[44px] min-w-[44px]`
  2. `AddToDeckButton.tsx` compact variant — 32x32px, needs `min-h-[44px] min-w-[44px]`
  3. `Dialog.tsx` close button — ~32px hit area, needs minimum sizing
- `FlagToggle.tsx` at 36px is a deliberate tradeoff (inside a 56px outer wrapper) — borderline acceptable, leave as-is

### Dark Mode Glass Contrast
- Three-tier glassmorphism system fully specified and dark-mode-aware:
  - `.glass-light` — blur 18px, opacity 0.50 (dark) — cards, list items
  - `.glass-medium` — blur 28px, opacity 0.40 (dark) — GlassHeader nav
  - `.glass-heavy` — blur 36px, opacity 0.30 (dark) — sidebar, bottom tab bar, dialogs/modals
- Dark mode adds purple tint overlay (`--color-accent-purple` at 0.05) and reduced white inset sheen
- Text uses semantic tokens (`--color-text-primary`, `--color-text-secondary`) that auto-switch in dark mode — no glass-specific text overrides needed
- Avoid `.glass-heavy` (0.30 opacity) for content-bearing surfaces in dark mode — use `.glass-medium` (0.40) minimum for readability
- Legacy `.glass-panel` class (used in TestPage, PracticeSession, TestResultsScreen, SkippedReviewPhase) should migrate to the three-tier system

### Motion Tokens
- Real motion system is JS springs in `src/lib/motion-config.ts` — widely consumed across 30+ components:
  - `SPRING_BOUNCY` (stiffness 400, damping 15) — primary interactions
  - `SPRING_SNAPPY` (stiffness 500, damping 25) — secondary interactions
  - `SPRING_GENTLE` (stiffness 200, damping 20) — large elements, page transitions
  - Stagger presets: FAST (40ms), DEFAULT (60ms), SLOW (100ms)
- CSS duration tokens (`--duration-fast`, `--duration-normal`, `--duration-slow`, `--ease-out`, etc.) exist in `tokens.css` but are consumed by nothing — purely aspirational
- Phase 29 should either wire CSS tokens to actual CSS transitions (glass hover effects, etc.) or formally deprecate them in favor of the JS spring system as the authoritative motion layer

### Claude's Discretion
- Exact semantic name choices for the typography scale (the tiers are locked, naming is flexible)
- Whether to audit and migrate all `text-[10px]` instances to the new `caption` token in this phase or defer to subsequent phases
- Whether CSS duration tokens get wired to glass transitions or get documented as deprecated
- Exact approach to `.glass-panel` migration (replace in-place vs introduce migration path)
- Approach to enforcing the radius mapping going forward (ESLint rule vs documentation)

</decisions>

<specifics>
## Specific Ideas

- The 4px spacing grid is already achieved — Phase 29 work here is documentation/enforcement, not migration
- Typography scale is the biggest gap: 1,084 text-size usages with no named system
- `text-[10px]` (23 occurrences) is the single most common arbitrary value — formalizing it as `caption` eliminates a scattered pattern
- The motion system split (CSS tokens unused, JS springs authoritative) should be resolved for clarity
- `.glass-panel` → three-tier migration affects 4 page-level components

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 29-visual-foundation*
*Context gathered: 2026-02-19*
