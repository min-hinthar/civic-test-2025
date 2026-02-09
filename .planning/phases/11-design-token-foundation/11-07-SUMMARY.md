---
phase: 11-design-token-foundation
plan: 07
subsystem: ui
tags: [stylelint, lint-enforcement, visual-verification, design-tokens]

# Dependency graph
requires:
  - "11-04: High/medium complexity migration complete"
  - "11-05: Bulk component migration complete"
  - "11-06: globals.css tokenization complete"
provides:
  - "Stylelint config preventing hardcoded color regression"
  - "Human-verified visual correctness in light and dark mode"
---

# Summary: 11-07 — Lint enforcement + visual verification

## What was done

### Task 1: Lint enforcement
- Installed `stylelint` and `stylelint-config-standard` as dev dependencies
- Created `.stylelintrc.json` with `color-no-hex` and `color-named: "never"` rules
- Disabled non-color stylistic rules that produced false positives with Tailwind
- Added `lint:css` script to package.json
- `pnpm lint:css` passes with zero violations

### Task 2: Visual verification (human checkpoint)
- User visually verified all key pages in both light and dark mode
- Issues found and fixed during verification:
  1. **Primitive token blending** (fix commit `ba83c96`): `warning-50/500` and `success-50/500` classes referenced primitive tokens that don't adapt to dark mode. Replaced 141 instances across 36 files with semantic equivalents (`warning-subtle`, `warning`, `success-subtle`, `success`).
  2. **Migration script ordering bug** (fix commit `451bf6d`): `bg-success-500` was incorrectly matched by `bg-success-50` pattern, creating invalid `bg-success-subtle0` class in 8 instances. Fixed to `bg-success`.
  3. **Dashboard button colors** (fix commit `451bf6d`): Interview button used `bg-accent` which becomes a dark surface tint in dark mode. Switched to `bg-accent-purple` (stays vibrant). Test button shadow uses green-600 token reference.
  4. **Nav highlight visibility** (fix commit `eb645d1`): Active tab `bg-primary/12` too faint. Boosted to `bg-primary/20` with shadow. Hover states improved with primary tint. Dashboard action buttons get `hover:-translate-y-0.5` lift effect.
- User approved after all fixes applied

## Commits
- `be776da` — feat(11-07): install stylelint and configure color enforcement
- `ba83c96` — fix(11): replace primitive token classes with semantic for dark mode
- `451bf6d` — fix(11): fix broken subtle0 classes and dashboard button colors
- `eb645d1` — fix(11): improve nav highlight and button hover visibility

## key-files
created:
  - .stylelintrc.json
modified:
  - package.json
  - pnpm-lock.yaml
  - tailwind.config.js (added subtle keys to success/warning)
  - 36 component/page files (semantic token replacement)
  - 9 files (subtle0 fix + dashboard buttons + nav highlights)

## Deviations
- **[Rule 3] Disabled non-color stylelint rules**: `stylelint-config-standard` enables many stylistic rules unrelated to color enforcement. Disabled them to keep only color guards active.
- **[Rule 3] Four additional fix commits during verification**: Migration quality issues discovered during human visual testing required iterative fixes.

## Self-Check: PASSED
- [x] Stylelint installed and configured
- [x] `pnpm lint:css` passes with zero violations
- [x] User visually verified light mode across key pages
- [x] User visually verified dark mode across key pages
- [x] All migration quality issues fixed and committed
