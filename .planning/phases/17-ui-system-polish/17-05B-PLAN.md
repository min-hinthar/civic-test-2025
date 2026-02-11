---
phase: 17-ui-system-polish
plan: 05B
type: execute
wave: 2
depends_on: ["17-01", "17-02"]
files_modified:
  - src/components/hub/HistoryTab.tsx
  - src/components/hub/AchievementsTab.tsx
  - src/components/hub/WelcomeState.tsx
  - src/components/hub/HubSkeleton.tsx
  - src/pages/HubPage.tsx
  - src/styles/animations.css
autonomous: true

must_haves:
  truths:
    - "List items in History/Achievements tabs enter with staggered spring pop animation"
    - "Loading skeleton uses prismatic shimmer colors matching glass border palette"
    - "WelcomeState for new users uses glass-medium with gentle entrance animation"
    - "HubPage tab transitions use spring physics"
  artifacts:
    - path: "src/components/hub/HubSkeleton.tsx"
      provides: "Loading skeleton with prismatic shimmer"
      contains: "skeleton-prismatic"
    - path: "src/styles/animations.css"
      provides: "skeleton-prismatic CSS class definition"
      contains: "skeleton-prismatic"
    - path: "src/components/hub/HistoryTab.tsx"
      provides: "History tab with staggered spring entrance"
      contains: "StaggeredList"
  key_links:
    - from: "src/components/hub/HubSkeleton.tsx"
      to: "src/styles/animations.css"
      via: "CSS class"
      pattern: "skeleton-prismatic"
    - from: "src/components/hub/HistoryTab.tsx"
      to: "src/components/animations/StaggeredList.tsx"
      via: "import"
      pattern: "from.*StaggeredList"
---

<objective>
Apply glass tiers, staggered spring animations, and prismatic skeleton shimmer to the remaining Progress Hub components: HistoryTab, AchievementsTab, WelcomeState, HubSkeleton, and HubPage.

Purpose: Completes the Progress Hub premium polish. Staggered list entrances and prismatic loading skeleton are the finishing touches.
Output: History/Achievements lists stagger with bounce, loading skeleton uses prismatic shimmer, HubPage tab transitions use spring physics.
</objective>

<execution_context>
@C:/Users/minkk/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/minkk/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@.planning/phases/17-ui-system-polish/17-02-SUMMARY.md
@src/components/hub/HistoryTab.tsx
@src/components/hub/AchievementsTab.tsx
@src/components/hub/HubSkeleton.tsx
@src/components/hub/WelcomeState.tsx
@src/pages/HubPage.tsx
@src/styles/animations.css
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add skeleton-prismatic CSS and upgrade HubSkeleton + WelcomeState</name>
  <files>src/styles/animations.css, src/components/hub/HubSkeleton.tsx, src/components/hub/WelcomeState.tsx</files>
  <action>
  **animations.css (this plan owns animations.css changes):**

  Add the `.skeleton-prismatic` class definition (keep existing `skeleton-shimmer` for backward compat):
  ```css
  .skeleton-prismatic {
    background: linear-gradient(
      90deg,
      hsl(var(--muted)) 0%,
      hsl(280 60% 70% / 0.15) 25%,
      hsl(200 80% 65% / 0.2) 50%,
      hsl(280 60% 70% / 0.15) 75%,
      hsl(var(--muted)) 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
  @media (prefers-reduced-motion: reduce) {
    .skeleton-prismatic {
      animation: none;
      background: hsl(var(--muted));
    }
  }
  ```

  **HubSkeleton.tsx:**

  1. Replace existing `skeleton-shimmer` class references with `skeleton-prismatic`
  2. Verify the shimmer keyframes (`@keyframes shimmer`) already exist in animations.css; if not, add them

  **WelcomeState.tsx:**

  1. The welcome message for new users should use GlassCard tier="medium" for visual prominence
  2. Add a gentle entrance animation: scale from 0.95 + fade in with SPRING_GENTLE
  </action>
  <verify>Run `npx next build` -- zero errors. animations.css contains `.skeleton-prismatic` definition.</verify>
  <done>animations.css has skeleton-prismatic class. HubSkeleton uses prismatic shimmer. WelcomeState uses glass-medium with gentle entrance.</done>
</task>

<task type="auto">
  <name>Task 2: Upgrade HistoryTab, AchievementsTab, and HubPage with staggered springs</name>
  <files>src/components/hub/HistoryTab.tsx, src/components/hub/AchievementsTab.tsx, src/pages/HubPage.tsx</files>
  <action>
  **HistoryTab.tsx:**

  1. Wrap history list items with StaggeredList + StaggeredItem from `@/components/animations/StaggeredList`
  2. Each session card should use GlassCard tier="light"
  3. Session detail expand/collapse should use AnimatePresence with SPRING_BOUNCY for a bouncy open/close
  4. Import spring configs as needed

  **AchievementsTab.tsx:**

  1. Badge grid items: wrap in StaggeredList for staggered entrance
  2. Individual badge cards: use GlassCard tier="light"
  3. Leaderboard section: use GlassCard tier="light"
  4. Per user decision: "Badge celebration: Prismatic ripple expanding outward from badge" -- the BadgeCelebration component handles this separately (in Plan 06)

  **HubPage.tsx:**

  1. Apply GlassCard with tier="medium" to any hero sections at the page level
  2. Ensure AnimatePresence tab transitions use spring physics
  </action>
  <verify>Run `npx next build` -- zero errors. History/Achievements items stagger in with spring.</verify>
  <done>History and Achievements tabs use GlassCard + staggered spring entrance. HubPage tab transitions use spring physics.</done>
</task>

</tasks>

<verification>
1. `npx next build` succeeds with zero errors
2. animations.css contains `.skeleton-prismatic` definition
3. HubSkeleton uses `skeleton-prismatic` class
4. HistoryTab items are wrapped in StaggeredList
5. AchievementsTab badge grid uses StaggeredList
6. WelcomeState uses GlassCard tier="medium"
7. HubPage tab transitions use spring physics
</verification>

<success_criteria>
History and Achievements lists enter with staggered spring bounce. Loading skeleton shows prismatic rainbow shimmer. WelcomeState has glass-medium with gentle entrance. HubPage tab transitions are spring-animated.
</success_criteria>

<output>
After completion, create `.planning/phases/17-ui-system-polish/17-05B-SUMMARY.md`
</output>
