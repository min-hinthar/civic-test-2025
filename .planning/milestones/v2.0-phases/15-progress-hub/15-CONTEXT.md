# Phase 15: Progress Hub - Context

**Gathered:** 2026-02-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Consolidate progress, history, and achievements into one tabbed "My Progress" page at /#/hub. Replace three separate pages (ProgressPage, HistoryPage, SocialHubPage) with a single unified view. Old routes redirect to the appropriate Hub tab. No new data collection or metrics — repackage existing data into a better layout.

</domain>

<decisions>
## Implementation Decisions

### Tab Structure
- 3 tabs: **Overview**, **History**, **Achievements** (Categories merged into Overview)
- Tab labels are bilingual (English + Burmese), consistent with rest of app
- Page title: "My Progress" (header and sidebar nav label: "Hub")
- Hub tab in bottom bar shows a dot badge when user has earned a new unseen badge
- Horizontal slide animation when switching between tabs (direction-aware, matching Phase 14 page transitions)
- Spring physics for active tab indicator animation (motion/react)
- Tab bar: premium hybrid style combining underline animation, pill-shaped active state, and distinct button feel
- Tab switches push to browser history (Back button goes to previous tab)
- Each tab remembers its scroll position when switching away and back

### History Tab
- Shows mock tests AND real interviews (not practice/study sessions)
- Separate sections: Mock Tests section on top, Interviews section below
- Entries are expandable — tap to reveal per-question right/wrong results
- Interview detail: stage reached + per-question results (matching test detail level)
- Empty state: encouraging CTA with button to take first mock test / start first interview
- Share button on individual history entries (share result to clipboard/native share)
- Show last 20 entries + "Load more" button for additional batches

### Achievements Tab
- Badges + Leaderboard together in one tab
- Layout: side by side on desktop (badges left, leaderboard right), stacks vertically on mobile
- Badge gallery: responsive grid — 4 per row on desktop, 2 on mobile
- Badges grouped by category (Study, Test, Social, Streak) with section headers
- Unearned badges: greyed out with lock icon and criteria hint text
- Earned badges: show progress bars toward criteria (e.g., "3/5 tests completed for Bronze Tester")
- Empty state: welcome message + first badge hint + all badges shown greyed out (motivational full gallery)
- Leaderboard: top 5 by default, "Show more" to expand
- Badge earned reveal: pop + shimmer burst animation (scale from 0 with sparkle effect)
- Earned badge cards: subtle glow + shimmer effect (premium feel)

### Overview Tab
- Hero: medium-sized readiness ring (circular arc, fills up) with 4 stat cards below
- Readiness ring: gradient fill (red through amber to green), percentage + bilingual motivational text inside
- Readiness ring: colored inner glow matching gradient color (red glow at low %, green glow at high %)
- 5 motivational tiers: 0-20% (Just Starting), 20-40% (Building), 40-60% (Making Progress), 60-80% (Almost There), 80-100% (Test Ready!)
- 4 stat cards: Mastery %, Streak (number + flame icon), SRS Due (count + "Review Now" button), Questions Practiced
- Stat cards are tappable: Streak → streak history, SRS Due → opens SRS review, Mastery % → scrolls to categories, Questions Practiced → Claude decides destination
- Category mastery: donut charts per top-level category (American Government, History, Integrated Civics) with progress bars per subcategory
- Donut charts: gradient-filled ring (red to green matching readiness ring spectrum)
- Subcategory progress bars: animated striped/candy-bar pattern
- Category cards: visible by default with subcategories shown, but collapsible
- Category order: fixed USCIS order (American Government, American History, Integrated Civics)
- Mastery color coding: smooth gradient spectrum from red through amber to green
- Tapping a weak subcategory navigates to study guide filtered to that subcategory
- Charts animate fill from 0 on first render
- Brand new user (0% everything): special welcome state replacing stats area with guided first steps
- Loading states: skeleton loaders (grey shimmer placeholders matching widget shapes)
- Error states: inline error + retry per widget (not full-page error)
- Page entry: stagger children animation (elements appear one by one with delay)

### Route Redirects & Deep Links
- Route mapping: /progress → /hub/overview, /history → /hub/history, /social → /hub/achievements
- Tab state via path segments: /#/hub/overview, /#/hub/history, /#/hub/achievements
- Bare /#/hub redirects to /#/hub/overview
- Old page components (ProgressPage, HistoryPage, SocialHubPage) fully deleted — redirects at route level
- Context-aware deep links: SRS notification → /hub/overview, test result → /hub/history, badge earned → /hub/achievements
- Push notification deep links: Claude audits all existing notification link targets and maps them to Hub tabs
- Invalid tab path (e.g., /hub/nonexistent) → Claude decides fallback behavior

### Visual Style
- Glass-morphism cards (frosted glass with backdrop-blur + translucent backgrounds) throughout Hub
- Dark mode: frosted glass dark variant with subtle border glow
- Responsive density: compact on mobile, spacious on desktop
- Animations: motion/react for all transitions, charts, and interactions
- Tab content slides horizontally with direction awareness when switching tabs

### Claude's Discretion
- Sticky vs scrolling tab bar
- Swipe gestures between tabs on mobile
- History date grouping format (Today, This Week, etc. vs flat chronological)
- Share format implementation (Web Share API vs clipboard — pick based on PWA capabilities)
- Leaderboard refresh/caching strategy
- Data source architecture (IndexedDB vs Supabase primary — match existing patterns)
- Refresh behavior (auto on tab switch vs pull-to-refresh)
- Service worker precaching strategy for Hub page
- Stat card layout on mobile (2x2 grid vs row)
- Chart implementation (custom SVG vs lightweight library)
- Color accent for Hub page
- Questions Practiced card tap destination
- Invalid tab URL fallback
- Recent activity section on Overview (decide if it adds value vs duplicating History)

</decisions>

<specifics>
## Specific Ideas

- "Hub" as nav label — ultra-short, unique within the navigation tabs
- Tab indicator should feel like a hybrid of Material underline + iOS segmented control + distinct button
- Readiness ring style similar to a fitness tracker ring (Apple Watch inspired)
- Streak display: Duolingo-style number + flame icon
- SRS due card has an actionable "Review Now" button, not just a count
- Badge gallery full-visible even for new users — motivational to see what's possible
- Badge earned animation should feel celebratory (pop + shimmer burst) — reward the user
- Stagger children page entry gives a feeling of "the page is loading things just for you"
- Animated striped progress bars add playfulness to subcategory mastery tracking

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 15-progress-hub*
*Context gathered: 2026-02-10*
