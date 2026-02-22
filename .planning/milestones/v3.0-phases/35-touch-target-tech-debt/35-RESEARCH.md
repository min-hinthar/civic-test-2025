# Phase 35: Touch Target Fix + Tech Debt Cleanup - Research

**Researched:** 2026-02-20
**Domain:** CSS touch targets, dead code removal, documentation sync
**Confidence:** HIGH

## Summary

Phase 35 is a gap closure phase that addresses three categories of tech debt identified in the v3.0 milestone audit (`v3.0-MILESTONE-AUDIT.md`): (1) touch target regressions introduced when Phase 34 added new interactive elements without the 44px minimum enforced in Phase 29, (2) orphaned function exports in celebration sound code, and (3) stale documentation checkboxes in ROADMAP.md.

The scope is well-defined and entirely mechanical. No new libraries, no architectural decisions, no risky refactors. The additional user request to scan for broader dead code across v3.0 identified several more orphaned exports and unused code beyond the three items in the success criteria.

**Primary recommendation:** Fix the 3-4 touch target elements with `min-h-[44px]` / `min-w-[44px]`, remove orphaned exports, update ROADMAP.md plan checkboxes from `[ ]` to `[x]` for all completed phases 29-34, and optionally clean up additional dead code discovered during research.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| VISC-04 | Touch targets minimum 44x44px on all interactive elements (audit and fix gaps) | Research identified exact elements, current dimensions, and Tailwind classes needed. See Touch Target Fixes section. |
</phase_requirements>

## Standard Stack

### Core
No new libraries needed. All changes use existing Tailwind CSS classes and TypeScript.

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Tailwind CSS | 3.x (existing) | `min-h-[44px]`, `min-w-[44px]` utility classes | Already used project-wide for touch targets |

### Supporting
None needed.

### Alternatives Considered
None -- this is purely mechanical cleanup.

## Architecture Patterns

### Pattern 1: Touch Target Minimum with min-h/min-w
**What:** Apply `min-h-[44px] min-w-[44px]` to interactive elements that fall below the 44px WCAG touch target threshold.
**When to use:** Any clickable/tappable element (link, button, icon button) that renders below 44x44px.
**Example:**
```typescript
// BEFORE: GlassHeader heart icon (36x36px)
<Link
  to="/about"
  className="flex items-center justify-center h-9 w-9 rounded-full ..."
>
  <Heart className="h-4 w-4" />
</Link>

// AFTER: Add min-h/min-w to guarantee 44px minimum
<Link
  to="/about"
  className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full ..."
>
  <Heart className="h-4 w-4" />
</Link>
```

### Pattern 2: Dead Export Removal
**What:** Remove exported functions that have zero imports across the codebase.
**When to use:** When `Grep` confirms an export has no corresponding import in any file.
**Example:**
```typescript
// BEFORE: Exported but never imported
export function playXPDing(consecutiveCorrect: number): void { ... }

// AFTER: Remove the entire function (or convert to non-exported if used internally)
// (In this case, playXPDing is not called internally either -- delete entirely)
```

### Pattern 3: ROADMAP.md Checkbox Sync
**What:** Update plan-level checkboxes from `[ ]` to `[x]` and phase-level status from `[ ]` to `[x]` for completed phases.
**When to use:** After verifying completion via progress table and SUMMARY.md presence.

### Anti-Patterns to Avoid
- **Removing barrel re-exports aggressively:** Some unused barrel exports (like `DotLottieAnimation` from celebrations/index.ts) serve as the public API surface. Only remove exports from source files, not barrel re-exports, unless the source export itself is removed.
- **Changing touch target sizes on elements that don't need it:** Only fix elements confirmed below 44px. Don't audit the entire app again -- Phase 29 already did that.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Touch target sizing | Custom JS resize logic | Tailwind `min-h-[44px] min-w-[44px]` | CSS is the standard approach; already used in 42 files |

## Common Pitfalls

### Pitfall 1: Changing h-9 to h-11 Instead of Using min-h
**What goes wrong:** Replacing `h-9 w-9` with `h-11 w-11` changes the visual size of the icon container, making it look larger than intended.
**Why it happens:** Confusing minimum touch area with visual size.
**How to avoid:** Use `min-h-[44px] min-w-[44px]` alongside the existing h-9 w-9 so the visual appearance stays the same but the touch/click area meets 44px minimum.
**Warning signs:** Icon button looks visually larger than before.

### Pitfall 2: Breaking the Share Button's Inline-Flex Layout
**What goes wrong:** Adding `min-h-[44px]` to a button with `inline-flex` may cause layout shift if the button is inside a `text-center` container.
**Why it happens:** `min-h-[44px]` applies to the button itself, not padding.
**How to avoid:** Test visually that the button still centers correctly and the text remains aligned.

### Pitfall 3: Removing Exports That Are Used Internally
**What goes wrong:** Deleting a function that is called by another function in the same file.
**Why it happens:** Grep shows no imports from other files, but the function is used locally.
**How to avoid:** Check both imports AND local references within the same file before removing.

### Pitfall 4: ROADMAP.md Checkbox Regex Mistakes
**What goes wrong:** Mass find-replace of `[ ]` to `[x]` accidentally checks off Phase 35/36 (not yet complete).
**Why it happens:** Blanket regex without scope restriction.
**How to avoid:** Only update checkboxes for phases 29-34 plan items and the Phase 29-34 top-level status markers.

## Code Examples

### Touch Target Fix: GlassHeader Heart Icon
```typescript
// File: src/components/navigation/GlassHeader.tsx
// Line ~48: Change h-9 w-9 to include min touch target
<Link
  to="/about"
  className="flex items-center justify-center h-9 w-9 min-h-[44px] min-w-[44px] rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
  aria-label="About this app"
>
  <Heart className="h-4 w-4" />
</Link>
```

### Touch Target Fix: AboutPage Share Button
```typescript
// File: src/pages/AboutPage.tsx
// Line ~137: Add min-h-[44px] to ensure button meets minimum
className="inline-flex items-center gap-2 rounded-xl bg-primary/10 px-5 py-2.5 min-h-[44px] text-sm font-semibold text-primary ..."
```

### Touch Target Fix: AboutPage External Links
```typescript
// File: src/pages/AboutPage.tsx
// Line ~165: Add min-h-[44px] to link cards
className="flex items-center gap-2 rounded-xl border border-border/40 bg-card/50 px-4 py-3 min-h-[44px] text-sm text-foreground ..."
```

### Touch Target Fix: AboutPage GitHub Footer Link
```typescript
// File: src/pages/AboutPage.tsx
// Line ~205-213: GitHub link in footer is small inline text
// Add min-h-[44px] and padding to make it tappable
<a
  href={aboutContent.footer.repoUrl}
  target="_blank"
  rel="noreferrer"
  className="inline-flex items-center gap-1 min-h-[44px] px-2 text-muted-foreground/70 transition-colors hover:text-foreground"
>
```

### Dead Export Removal: celebrationSounds.ts
```typescript
// File: src/lib/audio/celebrationSounds.ts
// Remove lines 139-166 (playXPDing function) and lines 168-220 (playErrorSoft function)
// Both are exported but never imported anywhere. Neither is called internally.
// playCelebrationSequence does NOT reference either function.
```

## Detailed Findings

### 1. Touch Target Violations (3-4 elements)

| Element | File | Current Size | Fix |
|---------|------|-------------|-----|
| GlassHeader heart icon | `src/components/navigation/GlassHeader.tsx:48` | h-9 w-9 = 36x36px | Add `min-h-[44px] min-w-[44px]` |
| AboutPage Share button | `src/pages/AboutPage.tsx:137` | py-2.5 + text-sm ~40px | Add `min-h-[44px]` |
| AboutPage external links | `src/pages/AboutPage.tsx:165` | py-3 + text-sm ~38-40px | Add `min-h-[44px]` |
| AboutPage GitHub footer link | `src/pages/AboutPage.tsx:205-213` | Inline text, ~20px | Add `min-h-[44px] px-2` |

**Confidence: HIGH** -- Dimensions confirmed from Tailwind class analysis and v3.0 audit document.

### 2. Orphaned Exports (Success Criteria Items)

| Export | File | Lines | Status | Action |
|--------|------|-------|--------|--------|
| `playXPDing` | `src/lib/audio/celebrationSounds.ts` | 149-166 | Exported, never imported, not called internally | **Remove** |
| `playErrorSoft` | `src/lib/audio/celebrationSounds.ts` | 176-220 | Exported, never imported, not called internally | **Remove** |

**Confidence: HIGH** -- Grep confirmed zero imports and zero internal calls.

### 3. Documentation Sync

| Item | File | Current State | Fix |
|------|------|---------------|-----|
| VISC-01 to VISC-07 checkboxes | `.planning/REQUIREMENTS.md` | Already `[x]` (fixed in commit 8ec026a) | **Already done -- no action needed** |
| Phase 29 plan checkboxes | `.planning/ROADMAP.md:90-96` | All `[ ]` | Change to `[x]` |
| Phase 29 top-level status | `.planning/ROADMAP.md:68` | `[ ]` | Change to `[x]` |
| Phase 30 plan checkboxes | `.planning/ROADMAP.md:110-113` | All `[ ]` | Change to `[x]` |
| Phase 31 plan checkboxes | `.planning/ROADMAP.md:127-131` | All `[ ]` | Change to `[x]` |
| Phase 32 plan checkboxes | `.planning/ROADMAP.md:145-152` | All `[ ]` | Change to `[x]` |
| Phase 33 plan checkboxes | `.planning/ROADMAP.md:166-170` | All `[ ]` | Change to `[x]` |
| Phase 34 plan checkboxes | `.planning/ROADMAP.md:184-186` | All `[ ]` | Change to `[x]` |

**Confidence: HIGH** -- All plan checkboxes verified stale against progress table showing 7/7, 4/4, 5/5, 8/8, 5/5, 3/3 complete.

### 4. Additional Dead Code (User Request: Broader v3.0 Scan)

These are orphaned exports found during the broader dead code audit requested by the user. They go beyond the Phase 35 success criteria but are actionable cleanup items.

#### Definitely Orphaned (never imported, safe to remove)

| Export | File | Consumers | Action |
|--------|------|-----------|--------|
| `useRetry` hook | `src/hooks/useRetry.ts` | 0 imports (ErrorFallback uses inline retry logic instead) | Remove entire file |
| `useConfetti` hook | `src/components/celebrations/Confetti.tsx:253` | 0 imports (Confetti component used directly) | Remove function + barrel re-export |
| `OdometerNumber` | `src/components/celebrations/CountUpScore.tsx:265` | 0 imports | Remove function + barrel re-export |
| `SkeletonCard` | `src/components/ui/Skeleton.tsx:93` | 0 imports (consumers built custom skeleton layouts) | Remove function |
| `SkeletonAvatar` | `src/components/ui/Skeleton.tsx:109` | 0 imports | Remove function |
| `toggleMute` | `src/lib/audio/soundEffects.ts:32` | 0 imports (Settings uses setSoundMuted) | Remove function |
| `playSwoosh` | `src/lib/audio/soundEffects.ts:227` | 0 imports | Remove function |
| `STAGGER_FAST` | `src/lib/motion-config.ts:48` | 0 imports | Remove constant |
| `STAGGER_SLOW` | `src/lib/motion-config.ts:50` | 0 imports | Remove constant |

#### Borderline (keep for API surface or future use)

| Export | File | Notes |
|--------|------|-------|
| `DotLottieAnimation` (barrel) | `src/components/celebrations/index.ts:4` | Used internally by CelebrationOverlay. Barrel re-export is fine as public API. |
| FlagToggle `min-h-[36px]` buttons | `src/components/ui/FlagToggle.tsx:119,149` | Individual flag buttons are 36px, but the radiogroup as a whole provides adequate touch area. Borderline -- leave as-is. |

#### Missing Assets (not dead code, but noted)

| Item | Location | Status |
|------|----------|--------|
| DotLottie animation files | `public/lottie/` | Directory empty. `CelebrationOverlay` references `checkmark.lottie` and `trophy.lottie`. Degrades gracefully (Suspense fallback=null). Not a Phase 35 concern -- asset sourcing is a separate effort. |

### 5. Cross-Phase Compatibility Check

No compatibility issues found between phases 29-34:
- **Phase 29 (Visual Foundation)** tokens used consistently across all subsequent phases
- **Phase 30 (Haptics)** properly imported in ~25 files including Phase 32/33 components
- **Phase 31 (Animations)** GlassCard, StaggeredList, Dialog exit animations all properly wired
- **Phase 32 (Celebrations)** CelebrationOverlay mounted in AppShell, useCelebration dispatched from TestResultsScreen
- **Phase 33 (States/A11y)** Skeleton, EmptyState, ErrorFallback, OfflineBanner all properly wired
- **Phase 34 (Content/About)** AboutPage route registered, GlassHeader heart link working, Settings link present

The only "design split" is TestPage vs TestResultsScreen for celebrations -- this is Phase 36's scope, not Phase 35's.

## Open Questions

1. **Should the GitHub footer link be treated as a touch target violation?**
   - What we know: It's an inline text link with a tiny icon (h-3.5 w-3.5). On mobile, it would be very hard to tap.
   - What's unclear: The success criteria mentions "AboutPage external links" but the GitHub link is in the footer section, not the "Resources" section.
   - Recommendation: Fix it anyway -- it's an interactive element on a page that Phase 35 is already editing. Low effort, high impact.

2. **Should the broader dead code items be included in Phase 35 scope?**
   - What we know: 9 additional orphaned exports beyond the 2 in the success criteria.
   - What's unclear: Whether the user wants these in Phase 35 or a separate cleanup.
   - Recommendation: Include them -- they're trivial deletions that don't risk breaking anything, and cleaning them up in Phase 35 saves a separate effort.

## Sources

### Primary (HIGH confidence)
- Direct codebase analysis via Grep/Read across all `src/` files
- `v3.0-MILESTONE-AUDIT.md` -- comprehensive audit document with exact gap descriptions
- `ROADMAP.md` -- confirmed stale checkboxes via direct file read
- `REQUIREMENTS.md` -- confirmed VISC checkboxes already updated (commit 8ec026a)

### Secondary (MEDIUM confidence)
- Touch target dimensions calculated from Tailwind CSS class values (py-2.5 = 10px, text-sm line-height ~20px, etc.)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- No new libraries, purely existing Tailwind/TypeScript
- Architecture: HIGH -- Mechanical changes to 4-6 files with no structural impact
- Pitfalls: HIGH -- All items verified via codebase analysis, patterns well-established in project
- Dead code scan: HIGH -- Every orphaned export confirmed via zero-import Grep across entire src/

**Research date:** 2026-02-20
**Valid until:** Indefinitely (these are codebase facts, not library version-dependent)
