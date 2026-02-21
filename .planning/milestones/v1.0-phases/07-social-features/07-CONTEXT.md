# Phase 7: Social Features - Context

**Gathered:** 2026-02-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Optional social engagement layer for the civic test prep app. Includes study streak tracking with badges, shareable result cards, opt-in leaderboards, and privacy controls. All social features are additive — the core study experience works fully without them. Streaks and badges are personal motivation tools available to all users; leaderboard participation requires explicit opt-in.

</domain>

<decisions>
## Implementation Decisions

### Streak tracking
- Any activity counts as a study day (test, practice, SRS review, study guide visit)
- Streak freeze system: earned by completing study goals (full practice test or 10+ SRS reviews in a day)
- Max 3 freezes can be banked at a time
- When a freeze is auto-used: bilingual toast notification on next visit + visual indicator on calendar heatmap
- Display both current streak and longest streak ("Current: 5 days | Best: 14 days")
- Streak data synced to Supabase for cross-device persistence
- Streaks tracked locally for all users regardless of social opt-in status

### Streak display
- Dashboard: Fire icon + count as primary widget (compact)
- Detail view: Calendar heatmap on progress page or social hub
- Both views available — widget on dashboard, heatmap in detail

### Badge system
- Three badge categories: streak milestones (7, 14, 30 days), accuracy milestones (e.g., 90%, 100% on test), coverage milestones (studied all questions, mastered all categories)
- Locked badges show requirements ("Get 90% on a test") — transparent goals
- Badge earned triggers celebration modal with animation and bilingual congrats message
- Badges display in two places: badge highlights row on dashboard + full achievements page showing all badges (earned + locked)
- Badges also appear on shareable score card

### Score sharing card
- Offered after passing scores (currently 6/10 threshold, will adapt with USCIS format update) and from history page entries
- All result types shareable: tests, practice sessions, and interview simulations
- Card content: score + current streak + top earned badge + category breakdown
- Always bilingual (EN + Burmese) regardless of user's language setting
- App branding footer with app name + URL
- Visual style: celebratory/distinct — vibrant gradient background, gold accents, stands out on social feeds
- Use `/frontend-design` skill during implementation for high-quality card design
- Square format (1080x1080) for universal social media compatibility
- Generated using Canvas API for full control and offline capability
- Preview shown in modal before sharing — user confirms before sending
- Distribution via Web Share API (native share sheet) with clipboard fallback on desktop

### Leaderboard
- Ranking metric: combined composite score of streak + accuracy + coverage
- User identity: editable display name, defaults to Google sign-in name
- No content moderation filter for display names (trusted community)
- Board size: top 25 + user's own rank shown regardless of position
- Two views: all-time leaderboard and weekly leaderboard (tab toggle)
- Weekly winner gets crown icon next to name until next reset
- Each row shows: rank, display name, composite score, and top earned badge
- Tapping a leaderboard entry shows minimal read-only profile (badges, streak)
- Dashboard widget showing user's rank + top 3
- Non-opted-in and unauthenticated users can VIEW leaderboard (read-only)
- Participating (appearing on board) requires sign-in + social opt-in

### Social hub page
- Dedicated page accessible from main navigation
- Tab navigation: Leaderboard | Badges | Streak
- Contains leaderboard, user's badge collection, and streak display with heatmap
- Serves as the central place for all social features

### Privacy & opt-in
- Private by default — opt-in required for leaderboard participation and profile visibility
- Opt-in triggered on first visit to social hub page (bilingual privacy notice)
- Combined opt-in flow: privacy notice + display name setup + confirm (one smooth flow)
- Privacy notice explains: what's shared (display name, scores) + how to withdraw (anytime from Settings)
- Single toggle controls all social features (leaderboard appearance, profile visibility, display name)
- Opt-out: immediately removed from leaderboard, data stays in DB but hidden
- Display name editable from both Settings page and social hub
- View-only access without authentication (can see leaderboard, can't participate)
- Sign-in required to opt-in and participate

### Claude's Discretion
- Streak-at-risk push notification strategy (evening reminder if no activity)
- Settings page social section layout
- Composite score formula weights (streak vs accuracy vs coverage)
- Badge icon/visual design
- Heatmap color scheme
- Leaderboard update/refresh frequency

</decisions>

<specifics>
## Specific Ideas

- Fire icon + count for streak widget (Duolingo-style compact display)
- Crown icon for weekly leaderboard winner
- Share card should feel celebratory and distinct — gradient background, gold accents, not just the app's standard blue palette
- Use `/frontend-design` skill for the share card UI to achieve high design quality
- Calendar heatmap similar to the existing SRS ReviewHeatmap pattern (CSS Grid + Tailwind)
- Freeze days marked differently on calendar heatmap (e.g., snowflake icon or distinct color)
- "Current: 5 days | Best: 14 days" dual streak display

</specifics>

<deferred>
## Deferred Ideas

- **Update USCIS test format to 20 questions / 12 to pass** — This is a fundamental change to the test mode that affects the entire app (scoring, history, test flow). Should be its own inserted phase (e.g., 6.1 or 7.1) rather than part of social features. Share card threshold will adapt once this is implemented.

</deferred>

---

*Phase: 07-social-features*
*Context gathered: 2026-02-07*
