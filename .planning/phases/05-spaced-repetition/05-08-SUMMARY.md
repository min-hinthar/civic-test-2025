---
phase: 05-spaced-repetition
plan: 08
subsystem: srs-dashboard-widget
tags: [srs, dashboard, heatmap, widget, animation]
depends_on: ["05-03"]
provides: ["SRSWidget", "ReviewHeatmap", "dashboard-srs-integration"]
affects: ["05-09"]
tech-stack:
  added: []
  patterns: ["compact-expandable-widget", "css-grid-heatmap", "animatepresence-expand"]
key-files:
  created:
    - src/components/srs/SRSWidget.tsx
    - src/components/srs/ReviewHeatmap.tsx
  modified:
    - src/pages/Dashboard.tsx
decisions:
  - "ReviewHeatmap uses pure CSS Grid + Tailwind (no external chart library)"
  - "Heatmap 60 days desktop / 30 days mobile via responsive hidden/block classes"
  - "SRSWidget navigates to /study#deck on compact tap"
  - "Widget placed after ReadinessIndicator, before CategoryGrid in dashboard"
metrics:
  duration: "5 min"
  completed: "2026-02-07"
---

# Phase 5 Plan 8: Dashboard SRS Widget Summary

Dashboard SRS widget with compact/expanded states, GitHub-style review heatmap, and category breakdown using useSRSWidget() hook data.

## Task Commits

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create ReviewHeatmap and SRSWidget components | 7bc9bcb | ReviewHeatmap.tsx, SRSWidget.tsx |
| 2 | Integrate SRSWidget into Dashboard page | 7809097 | Dashboard.tsx |

## What Was Built

### ReviewHeatmap (`src/components/srs/ReviewHeatmap.tsx`)
- GitHub-style CSS grid activity heatmap for SRS review history
- Responsive: 60-day range on desktop, 30-day range on mobile
- 7-row grid (days of week) by N-column (weeks) layout
- Color intensity: muted (0), primary-200 (1-2), primary-400 (3-5), primary-500 (6+)
- Day labels, month labels, legend with bilingual "Less/More" text
- Pure Tailwind CSS grid, no external chart library

### SRSWidget (`src/components/srs/SRSWidget.tsx`)
- Self-contained dashboard widget consuming useSRSWidget() and useSRS()
- **Compact mode**: due card count, review streak flame icon, expand chevron
- **Expanded mode**: streak message, category breakdown with colored dots, ReviewHeatmap, "Go to Review Deck" button
- **Empty deck state**: icon + bilingual message + "Add" button navigating to study guide
- **All caught up state**: checkmark icon + next review time + expandable for heatmap
- AnimatePresence expand/collapse with reduced motion support
- Full bilingual support via useLanguage().showBurmese

### Dashboard Integration (`src/pages/Dashboard.tsx`)
- SRSWidget placed prominently after ReadinessIndicator, before CategoryGrid
- Wrapped in FadeIn animation with 50ms delay
- No prop drilling needed -- widget is fully self-contained

## Decisions Made

1. **Pure CSS Grid heatmap**: No chart library needed. CSS Grid with 7 rows x N weeks columns handles the layout efficiently with Tailwind utility classes.
2. **Responsive day count**: Desktop shows 60 days, mobile shows 30 days using `hidden sm:block` / `block sm:hidden` pattern.
3. **Compact tap navigates**: Tapping the compact widget navigates to `/study#deck` rather than expanding (expand is via chevron button).
4. **Widget placement**: After ReadinessIndicator section for high visibility, before the collapsible CategoryGrid.

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- TypeScript: `pnpm exec tsc --noEmit` passes cleanly
- ESLint: All new files pass with React Compiler rules
- No `useMemo<T>()` generic syntax used
- No setState in effects
- No ref.current during render

## Self-Check: PASSED
