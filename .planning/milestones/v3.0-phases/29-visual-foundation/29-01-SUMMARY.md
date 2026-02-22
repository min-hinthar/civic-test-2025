---
phase: 29-visual-foundation
plan: 01
status: complete
---

## Summary

Defined the semantic typography scale in Tailwind config with 8 named fontSize entries (caption through display) in `theme.extend.fontSize`. All existing Tailwind default text sizes continue to work. Updated tokens.css with comprehensive typography scale documentation.

## Key Files

### Created
(none)

### Modified
- `tailwind.config.js` — Added 8 semantic fontSize entries with lineHeight, letterSpacing, and fontWeight
- `src/styles/tokens.css` — Added typography scale documentation with usage guidance

## Self-Check: PASSED

- [x] All 8 semantic fontSize entries present in tailwind.config.js
- [x] Uses theme.extend.fontSize (not theme.fontSize) to preserve defaults
- [x] tokens.css documents the scale with pixel equivalents
- [x] Pre-commit hooks passed
