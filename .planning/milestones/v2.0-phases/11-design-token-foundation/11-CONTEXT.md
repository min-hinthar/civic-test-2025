# Phase 11: Design Token Foundation - Context

**Gathered:** 2026-02-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Consolidate all visual styling into a single CSS custom property source of truth (`src/styles/tokens.css`), eliminating the three-way fragmentation between globals.css, tailwind.config.js, and design-tokens.ts. Includes full dark mode support with toggle UI. Does NOT include glass-morphism, micro-interactions, or touch target enforcement (Phase 17).

</domain>

<decisions>
## Implementation Decisions

### Token Taxonomy
- **Two-tier naming**: Primitive layer (raw palette values like --blue-500) + semantic layer (purpose-named like --color-surface referencing primitives). Components only use semantic tokens.
- **Flat with prefixes**: All tokens at root level with naming convention: --color-*, --space-*, --shadow-*, --radius-*, --duration-*, --ease-*. No nesting.
- **Both layers in Tailwind**: Primitive palette classes (bg-blue-500) available for flexibility, semantic classes (bg-surface) preferred by convention. Lint/convention to favor semantic.
- **Opacity variants in tokens**: Define semi-transparent variants (e.g., --color-primary-50a) as explicit tokens for overlays and glass effects (Phase 17 prep).
- **Explicit state tokens**: Define --color-primary-hover, --color-primary-active, --color-primary-disabled as separate tokens. Full control over interactive states.
- **Inline documentation comments**: Each semantic token includes a short comment explaining its intended use.
- **Motion tokens included**: Define --duration-fast, --duration-normal, --duration-slow, --ease-out, --ease-spring, etc. as part of this foundation.
- **Breakpoints stay in Tailwind config**: Not tokenized as CSS custom properties (can't be used in @media queries).
- **No z-index tokenization**: Z-index values stay as Tailwind utilities.
- **Token file location**: `src/styles/tokens.css`, imported by globals.css.

### Dark Mode Strategy
- **System preference + manual override**: Defaults to OS preference, user can override via in-app toggle. Preference stored in localStorage.
- **Smooth fade transition**: CSS transition on background-color and color when toggling modes. Polished feel.
- **Toggle in header/nav**: Sun/moon icon always accessible from any page. Animated morph between sun and moon using motion/react.
- **Two-state toggle**: Light | Dark switch. Defaults to system preference on first visit. No explicit "System" option.
- **Soft dark palette**: Dark backgrounds are dark grays/deep navy, not pure black. Easier on eyes, sets up Phase 17 glass-morphism.
- **Focus rings adapt**: Lighter/brighter focus ring colors in dark mode for proper contrast.
- **Charts use semantic tokens**: Any data visualizations adapt their colors via the token system in dark mode.
- **PWA theme-color updates**: `<meta name="theme-color">` updates dynamically when mode changes. Status bar matches app theme.
- **Extensible theme architecture**: Token structure supports adding future themes (high-contrast, custom) without restructuring.

### Migration Approach
- **Big-bang replacement**: Replace all hardcoded values across all files in one coordinated sweep. No dual system coexistence.
- **Delete design-tokens.ts**: CSS variables become the single source of truth. No legacy TS file retained.
- **Swap + cleanup**: Replace hardcoded values AND remove unused/redundant CSS along the way. Thorough migration.
- **Lint rule enforcement**: Add ESLint/stylelint rule to flag hardcoded hex colors, rgb values, and pixel spacing not from tokens. Covers both CSS files and inline styles.
- **Visual regression verification**: Before/after screenshots of key pages to catch unintended visual changes during migration.
- **Equal priority**: Token system completeness and dark mode polish are equally important. Neither ships without the other.

### Token Scope & Boundaries
- **Extensible for future themes**: Architecture supports adding themes beyond dark/light without restructuring.
- **Lint covers inline styles**: Enforcement catches hardcoded values in both CSS/Tailwind and style={{}} objects.

### Claude's Discretion
- Semantic naming: Generic UI semantics vs app-domain-specific names (balance determined by codebase audit)
- Number of semantic color roles (audit codebase to determine ~8-15 roles needed)
- Primitive color palette approach (keep Tailwind defaults or custom brand)
- Typography token granularity (full type scale vs size + weight only)
- Spacing scale (strict mathematical vs audit-based)
- design-tokens.ts replacement strategy (typed JS wrapper vs raw getComputedStyle)
- Shadow token structure (single composite vs layered)
- Border-radius organization (scale-based vs semantic)
- Tailwind config restructure approach
- globals.css restructure approach
- Radix UI component tokenization
- Migration fidelity (pixel-perfect vs snap-to-scale)
- motion/react animation tokenization scope
- Responsive token values
- Icon size tokenization
- JS token access helper
- Dark mode FOUC prevention mechanism
- Burmese text dark mode contrast
- Image brightness in dark mode
- Scrollbar theming
- Form input dark mode tokens
- Component-specific vs global token boundaries
- Supabase status color tokenization
- Gradient tokenization

</decisions>

<specifics>
## Specific Ideas

- Token file lives at `src/styles/tokens.css` as a dedicated file, imported by globals.css
- Dark mode toggle goes in the header/nav bar as an always-accessible sun/moon icon
- Sun-to-moon icon morph animation using motion/react for the toggle
- Soft dark palette (not true black) to prepare for Phase 17 glass-morphism effects
- PWA status bar color must track the current theme
- Extensible architecture so high-contrast or custom themes could be added later without restructuring

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 11-design-token-foundation*
*Context gathered: 2026-02-09*
