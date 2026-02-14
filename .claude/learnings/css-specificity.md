# CSS Specificity Issues

## prismatic-border Overrides position: fixed

**Context:** Sidebar and BottomTabBar both use `prismatic-border fixed` classes. In production, the sidebar was `position: relative` instead of `fixed`, pushing all page content down ~600px and overlapping.

**Learning:** `.prismatic-border` in `src/styles/prismatic-border.css` sets `position: relative` (needed for its `::before` pseudo-element). Both `.prismatic-border` and Tailwind's `.fixed` have specificity 0-1-0. Since `.prismatic-border` appears later in the compiled CSS, it wins — silently overriding `fixed` to `relative`.

**Fix applied:** Added `.prismatic-border.fixed { position: fixed; }` (specificity 0-2-0) which always wins. This works because `position: fixed` also creates a containing block for `::before`, so the rainbow border renders correctly.

**Why it hid:** In dev mode with HMR, CSS injection order can differ from the production build. The compiled production CSS places Tailwind utilities before custom styles, so the override only manifests in production.

**Apply when:** Adding `prismatic-border` to any fixed/absolute/sticky element. Or adding any custom CSS class that sets `position` alongside Tailwind positioning utilities.
