# CSS Specificity & Tailwind Class Conflicts

## prismatic-border Overrides position: fixed

**Context:** Sidebar and BottomTabBar both use `prismatic-border fixed` classes. In production, the sidebar was `position: relative` instead of `fixed`, pushing all page content down ~600px and overlapping.

**Learning:** `.prismatic-border` in `src/styles/prismatic-border.css` sets `position: relative` (needed for its `::before` pseudo-element). Both `.prismatic-border` and Tailwind's `.fixed` have specificity 0-1-0. Since `.prismatic-border` appears later in the compiled CSS, it wins — silently overriding `fixed` to `relative`.

**Fix applied:** Added `.prismatic-border.fixed { position: fixed; }` (specificity 0-2-0) which always wins. This works because `position: fixed` also creates a containing block for `::before`, so the rainbow border renders correctly.

**Why it hid:** In dev mode with HMR, CSS injection order can differ from the production build. The compiled production CSS places Tailwind utilities before custom styles, so the override only manifests in production.

**Apply when:** Adding `prismatic-border` to any fixed/absolute/sticky element. Or adding any custom CSS class that sets `position` alongside Tailwind positioning utilities.

## Tailwind Class Conflicts on Component Overrides

**Context:** `StudyGuidePage.tsx` passes `bg-black/20 [&_*]:text-white` to `ExplanationCard` via className on flip card backs. After Phase 29 added new entries to `tailwind.config.js`, CSS generation order shifted — `ExplanationCard`'s internal `bg-card` (white) appeared later in compiled CSS and won over the parent's `bg-black/20`, causing white-on-white text in light theme.

**Learning:** Tailwind utility conflicts between parent className overrides and child component internals are **CSS source order dependent**, not HTML class order. Adding/removing entries in `tailwind.config.js` can silently shift which utility appears last in the compiled CSS. The fix is to use Tailwind's `!important` modifier (`!bg-black/20`, `[&_*]:!text-white`) on the parent override classes — this guarantees they win regardless of source order.

**Why it hid:** Worked in dev (HMR injection order differs from production build). Also worked before Phase 29 because the old CSS generation order happened to place `bg-black/20` after `bg-card`.

**Apply when:** Passing Tailwind className overrides to child components that have their own background/text classes. Especially after modifying `tailwind.config.js` — always recheck component overrides for visual regressions.

## Tailwind `landscape:` Variant Triggers on Desktop

**Context:** `src/components/interview/LandscapeOverlay.tsx` used `landscape:flex` to show a "rotate to portrait" overlay. This appeared on desktop browsers because wide windows match the `landscape` media query.

**Learning:** CSS `@media (orientation: landscape)` — and Tailwind's `landscape:` variant — fires based on viewport aspect ratio, not device type. A 1920x1080 desktop window is "landscape". To restrict orientation-dependent UI to mobile devices, stack with a max-width variant: `max-md:landscape:flex` (Tailwind v3.2+).

**Apply when:** Using `landscape:` or `portrait:` Tailwind variants for mobile-specific behavior. Always pair with a responsive breakpoint (`max-sm:`, `max-md:`) to exclude desktop viewports.
