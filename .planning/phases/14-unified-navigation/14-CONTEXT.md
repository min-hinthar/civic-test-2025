# Phase 14: Unified Navigation - Context

**Gathered:** 2026-02-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Add a desktop sidebar navigation and restructure both mobile and desktop nav from 8 tabs to 6 tabs. Route renames (/dashboard -> /home, /progress -> /hub), redirects for removed routes (/history, /social -> /hub), glass-morphism styling on both nav surfaces, and updated onboarding tour to target nav items. Mobile bottom bar keeps scroll-hide behavior; desktop sidebar overlays content with spring animations.

</domain>

<decisions>
## Implementation Decisions

### Tab Structure (6 tabs + 3 controls)
- **6 navigation tabs:** Home, Study Guide, Mock Test, Interview, Progress Hub, Settings
- **3 utility controls (inline after tabs):** Language toggle, Theme toggle, Logout
- History and Social dropped from nav (redirect to Progress Hub)
- Tab labels show **primary language only** (not bilingual) on both mobile and desktop
- Language and Theme toggles available in **both** nav bar AND Settings page (under "Appearance" section)
- Logout button stays in nav bar

### Route Changes
- `/dashboard` renamed to `/home` (old URL redirects)
- `/progress` renamed to `/hub` (old URL redirects)
- `/history` redirects to `/hub` (with brief loading state before redirect)
- `/social` redirects to `/hub` (with brief loading state before redirect)
- `/study`, `/test`, `/interview`, `/settings` unchanged
- Push notification targets updated to new routes; hub deep-links use hash routing (e.g., `/hub#social`)

### Desktop Sidebar
- **Position:** Left side, overlays content (no push/resize layout)
- **Width:** ~240px expanded, icon-rail when collapsed
- **Glass-morphism:** Translucent with backdrop-blur, subtle vertical gradient, soft drop shadow (no border)
- **Dark mode:** Subtle border glow (1px white/10-20% opacity) on edges
- **Header:** Logo + app name at top; collapses to app icon only when collapsed
- **Scroll behavior:** Hides on scroll-down, shows on scroll-up (spring physics animation via motion/react)
- **Collapse/expand:** Both auto-collapse at breakpoints AND visible toggle button (chevron)
- **Click outside:** Collapses the sidebar when clicking content area
- **No backdrop scrim** — sidebar floats over content with glass effect and shadow
- **Tooltips on collapsed state:** Show label tooltip on hover when collapsed
- **Tablet tap behavior:** Tapping icon in collapsed mode expands sidebar first (user taps again to navigate)
- **Utility controls:** Below nav items (inline, after separator)
- **Nav item spacing:** Spacious (gap-3, 12px)
- **Expand/collapse animation:** Full morph — logo transitions between full name and icon, labels fade in/out

### Three-Tier Responsive Layout
- **Mobile (< 768px/md):** Bottom tab bar (6 tabs + 3 controls, scrollable)
- **Tablet (768px-1280px / md-lg):** Collapsed sidebar (icons only), auto-collapsed
- **Desktop (1280px+ / lg):** Expanded sidebar (icons + labels)

### Mobile Bottom Bar Updates
- Reduced from 8 to 6 tabs (both mobile and desktop updated in Phase 14)
- Glass-morphism applied (translucent backdrop-blur, matching sidebar gradient)
- Keeps scroll-hide/show behavior on scroll (unchanged)
- Keeps horizontal scroll (defensive for narrow screens)
- Utility controls remain inline after tabs (scroll to access)

### Badge & Indicator System
- **Study tab:** Numeric count badge (SRS due count), orange/warning color, cap at 99+
- **Progress Hub tab:** Dot badge (no number), accent/blue color; priority: new achievements > streak-at-risk
- **Both mobile and desktop:** Badges shown on both nav surfaces
- **Badge position:** Dot/number on the icon (same positioning in collapsed and expanded sidebar)
- **Badge animation:** Subtle scale/bounce entrance when appearing or count changes
- **SW update:** Settings tab shows a badge dot when app update is available

### Visual Styling
- **Icons:** Increased to h-6 w-6 (24px) from current h-4 w-4
- **Mobile labels:** Increased to text-xs (12px) from current text-[10px]
- **Active state:** Bold/filled icon + primary color (inactive = outline style, iOS convention)
- **Hover effect (desktop):** Background tint + slight scale-up (1.02)
- **Nav item corners:** Pill shape (rounded-full) for active/hover state
- **Tap animation:** Spring bounce on release (press down + bounce back with spring physics)
- Glass-morphism always enabled (no reduced-motion fallback for blur)
- Animations always play (no prefers-reduced-motion disabling)

### Test Lock Behavior
- Desktop sidebar: Show warning indicator + all nav items grayed out/unclickable
- Mobile bottom bar: Same warning + lock treatment (consistent with desktop)
- Tapping locked item: Shake animation + toast message ("Complete or exit the test first")

### Page Transitions
- Slide transitions between tabs based on tab order (higher tab = slide left, lower tab = slide right)
- Auth -> Home: Sidebar slides in from left + page content fades in (sign-in entrance)
- Home -> Auth: Sidebar slides out left + page content fades out (sign-out exit)
- Sidebar entrance uses spring physics (motion/react)

### Onboarding Tour
- Replace all 4 dashboard widget steps (study-action, test-action, srs-deck, interview-sim) with nav tab highlights (Study, Test, Interview, Progress Hub)
- Responsive targets: Tour highlights bottom bar tabs on mobile, sidebar items on desktop
- Both mobile and desktop get the adapted tour

### Landing & Standalone Pages
- Landing page (`/`): Add minimal glass header with logo + "Sign In" button
- OpEd page (`/op-ed`): Add minimal glass header with logo + "Back"/"Home" link
- Auth pages: No changes discussed (keep current no-nav layout)

### Settings Page Additions
- Language toggle and Theme toggle added under an "Appearance" section
- Supplements the nav bar toggles (both locations available)

### Claude's Discretion
- Sidebar state persistence (localStorage vs reset-on-load)
- User profile/avatar in sidebar (include or omit)
- Practice page (/practice) placement (sub-section of Study or hidden route)
- Icon choices (keep current Lucide icons or swap any)
- Separator style between nav items and utility controls
- Badge update frequency (on-navigation vs periodic polling)
- Keyboard accessibility implementation (WCAG compliance level)
- Screen reader announcement strategy
- Sidebar z-index relative to modals and toasts
- Offline navigation behavior
- PWA install prompt nav behavior
- No keyboard shortcut for sidebar toggle
- Swipe gesture navigation (evaluate horizontal scroll conflicts)
- Interview page lock behavior (lock like test or leave unlocked)
- Nav badge data architecture (existing contexts vs unified hook)
- Testing/verification strategy

</decisions>

<specifics>
## Specific Ideas

- Sidebar should feel like a modern app sidebar (VS Code, Linear, Slack-style)
- Glass-morphism with subtle gradient — premium iOS-inspired aesthetic
- Spring physics animations throughout (motion/react, not CSS transitions)
- Full morph animation on sidebar collapse: logo smoothly transitions between full text and icon
- Three distinct responsive tiers: mobile bottom bar, tablet collapsed sidebar, desktop expanded sidebar
- Push notifications deep-link into hub tabs via hash routing (`/hub#social`, `/hub#history`)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 14-unified-navigation*
*Context gathered: 2026-02-10*
