# Phase 7: Social Features - Research

**Researched:** 2026-02-07
**Domain:** Gamification, social sharing, leaderboards, Canvas API image generation, Supabase RLS
**Confidence:** HIGH

## Summary

Phase 7 adds an optional social engagement layer to the civic test prep app: study streak tracking with badges, shareable result cards, opt-in leaderboards, and privacy controls. The phase is largely self-contained - it hooks into existing activity sources (test sessions, SRS reviews, practice sessions, study guide visits) to derive streak data, uses the native Canvas API for score card generation, and extends the existing Supabase schema for leaderboard data.

No new npm dependencies are required. The entire phase can be implemented using existing project libraries (lucide-react for icons, motion/react for animations, idb-keyval for local storage, Supabase for persistence, Radix Dialog for modals) plus native browser APIs (Canvas API for image generation, Web Share API for sharing, clipboard API as fallback). The existing codebase already has strong patterns for everything needed: heatmap rendering (ReviewHeatmap), celebration modals (MasteryMilestone + Confetti), bilingual UI, toast notifications, and Supabase CRUD.

**Primary recommendation:** Build streak/badge tracking as a local-first system (idb-keyval) with Supabase sync for signed-in users. Use native Canvas API directly (no library) for score card generation. Use Supabase RPC functions for leaderboard ranking computation. Follow existing tab navigation pattern (HistoryPage style) for social hub.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Any activity counts as a study day (test, practice, SRS review, study guide visit)
- Streak freeze system: earned by completing study goals (full practice test or 10+ SRS reviews in a day)
- Max 3 freezes can be banked at a time
- When a freeze is auto-used: bilingual toast notification on next visit + visual indicator on calendar heatmap
- Display both current streak and longest streak ("Current: 5 days | Best: 14 days")
- Streak data synced to Supabase for cross-device persistence
- Streaks tracked locally for all users regardless of social opt-in status
- Dashboard: Fire icon + count as primary widget (compact)
- Detail view: Calendar heatmap on progress page or social hub
- Three badge categories: streak milestones (7, 14, 30 days), accuracy milestones (e.g., 90%, 100% on test), coverage milestones (studied all questions, mastered all categories)
- Locked badges show requirements ("Get 90% on a test") - transparent goals
- Badge earned triggers celebration modal with animation and bilingual congrats message
- Badges display in two places: badge highlights row on dashboard + full achievements page showing all badges (earned + locked)
- Badges also appear on shareable score card
- Offered after passing scores (currently 6/10 threshold) and from history page entries
- All result types shareable: tests, practice sessions, and interview simulations
- Card content: score + current streak + top earned badge + category breakdown
- Always bilingual (EN + Burmese) regardless of user's language setting
- App branding footer with app name + URL
- Visual style: celebratory/distinct - vibrant gradient background, gold accents
- Square format (1080x1080) for universal social media compatibility
- Generated using Canvas API for full control and offline capability
- Preview shown in modal before sharing - user confirms before sending
- Distribution via Web Share API (native share sheet) with clipboard fallback on desktop
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
- Dedicated social hub page accessible from main navigation
- Tab navigation: Leaderboard | Badges | Streak
- Private by default - opt-in required for leaderboard participation and profile visibility
- Opt-in triggered on first visit to social hub page (bilingual privacy notice)
- Combined opt-in flow: privacy notice + display name setup + confirm (one smooth flow)
- Single toggle controls all social features
- Opt-out: immediately removed from leaderboard, data stays in DB but hidden
- View-only access without authentication
- Sign-in required to opt-in and participate

### Claude's Discretion
- Streak-at-risk push notification strategy (evening reminder if no activity)
- Settings page social section layout
- Composite score formula weights (streak vs accuracy vs coverage)
- Badge icon/visual design
- Heatmap color scheme
- Leaderboard update/refresh frequency

### Deferred Ideas (OUT OF SCOPE)
- **Update USCIS test format to 20 questions / 12 to pass** - This is a fundamental change to the test mode that affects the entire app. Should be its own inserted phase.
</user_constraints>

## Standard Stack

### Core (Already in Project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Canvas API (native) | Browser built-in | Score card image generation | Full control, offline-capable, no dependency. User decision locked. |
| Web Share API (native) | Browser built-in | Native share sheet for score cards | Mobile-first sharing with system UI. User decision locked. |
| idb-keyval | ^6.2.2 | Local streak/badge storage | Already used for mastery store, SRS, offline DB. Consistent pattern. |
| @supabase/supabase-js | ^2.81.1 | Leaderboard data, streak sync, social profiles | Already the project's backend. RLS policies for public read / private write. |
| lucide-react | ^0.475.0 | Icons (Flame, Crown, Trophy, Award, Medal, Share2, Snowflake) | Already the project's icon library. All needed icons available. |
| motion/react | ^12.33.0 | Badge celebration animations, transitions | Already the project's animation library. |
| @radix-ui/react-dialog | ^1.1.15 | Opt-in modal, share preview modal, badge celebration modal | Already used for MasteryMilestone. |
| react-canvas-confetti | ^2.0.7 | Badge earned celebrations | Already used in Confetti component. |
| clsx | ^2.1.1 | Conditional class composition | Already used project-wide. |

### Supporting (Already in Project)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @radix-ui/react-toast | ^1.2.15 | Streak freeze notifications | Already used. Bilingual toast system exists. |
| recharts | ^3.4.1 | If any charts needed for score visualization | Already installed. Likely not needed for this phase. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native Canvas API | html-to-image / html2canvas | Simpler markup-based approach, but less control over output, CORS issues with fonts, larger bundle. Canvas API is locked decision. |
| Native Web Share API | react-share | Social-platform-specific sharing buttons, but heavier dependency and less native feel. Web Share is locked decision. |
| Custom tab navigation | @radix-ui/react-tabs | Would add a new dependency. Existing hand-rolled tab pattern (HistoryPage) works well and is consistent. |
| Supabase RPC functions | Client-side ranking computation | Would expose all user scores to client. Server-side ranking is more secure and efficient. |

**Installation:**
```bash
# No new packages needed. All dependencies already in project.
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   └── social/
│       ├── streakTracker.ts          # Core streak calculation logic
│       ├── streakStore.ts            # idb-keyval storage for streak data
│       ├── streakSync.ts             # Supabase sync for streak data
│       ├── badgeDefinitions.ts       # Badge config: thresholds, icons, messages
│       ├── badgeEngine.ts            # Badge evaluation logic
│       ├── badgeStore.ts             # idb-keyval storage for earned badges
│       ├── compositeScore.ts         # Composite score formula
│       └── shareCardRenderer.ts      # Canvas API score card generation
├── hooks/
│   ├── useStreak.ts                  # Streak state hook (local + sync)
│   ├── useBadges.ts                  # Badge state and detection hook
│   ├── useLeaderboard.ts            # Leaderboard data fetching hook
│   └── useSocialProfile.ts          # Social opt-in state, display name
├── contexts/
│   └── SocialContext.tsx             # Social state provider (opt-in, profile)
├── components/
│   └── social/
│       ├── StreakWidget.tsx           # Dashboard fire icon + count widget
│       ├── StreakHeatmap.tsx          # Calendar heatmap (reuses ReviewHeatmap pattern)
│       ├── StreakFreezeIndicator.tsx  # Freeze count display + visual
│       ├── BadgeGrid.tsx             # Full badge collection (earned + locked)
│       ├── BadgeHighlights.tsx       # Dashboard badge row
│       ├── BadgeCelebration.tsx      # Celebration modal (reuses MasteryMilestone pattern)
│       ├── ShareCardPreview.tsx      # Modal with canvas preview + share button
│       ├── ShareButton.tsx           # Share trigger (Web Share + clipboard fallback)
│       ├── LeaderboardTable.tsx      # Top 25 + user's rank table
│       ├── LeaderboardWidget.tsx     # Dashboard compact widget (rank + top 3)
│       ├── LeaderboardProfile.tsx    # Mini read-only profile on row tap
│       ├── SocialOptInFlow.tsx       # Privacy notice + display name + confirm
│       └── SocialSettings.tsx        # Settings page social section
├── pages/
│   └── SocialHubPage.tsx             # Tabbed page: Leaderboard | Badges | Streak
└── supabase/
    └── schema.sql                    # Extended with social tables + RPC functions
```

### Pattern 1: Local-First Streak Tracking
**What:** Track activity dates in IndexedDB (idb-keyval). On each app activity (test complete, SRS review, practice done, study guide visit), record the date. Streak calculation is pure function over activity dates.
**When to use:** Always - streaks must work for all users regardless of auth status.
**Example:**
```typescript
// Source: Existing idb-keyval pattern from src/lib/mastery/masteryStore.ts
import { createStore, get, set } from 'idb-keyval';

const streakDb = createStore('civic-prep-streaks', 'streak-data');

interface StreakData {
  activityDates: string[];   // ISO date strings 'YYYY-MM-DD'
  freezesAvailable: number;  // 0-3
  freezesUsed: string[];     // dates when freezes were auto-consumed
  longestStreak: number;
}

export async function recordActivity(): Promise<void> {
  const data = await getStreakData();
  const today = new Date().toISOString().slice(0, 10);
  if (!data.activityDates.includes(today)) {
    data.activityDates.push(today);
    await set('streak', data, streakDb);
  }
}

export function calculateStreak(
  activityDates: string[],
  freezesUsed: string[]
): { current: number; longest: number } {
  // Pure function: sort dates descending, walk back checking
  // each day is either an activity day or a freeze day
  // ...
}
```

### Pattern 2: Canvas API Score Card Generation
**What:** Use an offscreen canvas element (1080x1080) to draw the score card programmatically, then convert to Blob for sharing.
**When to use:** When user triggers share from test results or history page.
**Example:**
```typescript
// Source: MDN Canvas API + Web Share API docs
export async function generateShareCard(data: ShareCardData): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d')!;

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
  gradient.addColorStop(0, '#1e3a8a'); // Deep blue
  gradient.addColorStop(1, '#7c3aed'); // Purple
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1080, 1080);

  // Score text
  ctx.fillStyle = '#FFD700'; // Gold
  ctx.font = 'bold 120px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText(`${data.score}/${data.total}`, 540, 400);

  // ... more drawing (streak, badge, category breakdown, bilingual text)

  // Convert to Blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error('Canvas toBlob failed')),
      'image/png'
    );
  });
}

export async function shareCard(blob: Blob): Promise<void> {
  const file = new File([blob], 'civic-test-score.png', { type: 'image/png' });

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: 'My Civic Test Score',
      text: 'Check out my civic test prep progress!',
    });
  } else {
    // Clipboard fallback for desktop
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob }),
    ]);
  }
}
```

### Pattern 3: Supabase Leaderboard with RPC + Public Read RLS
**What:** Use a Supabase RPC function to compute rankings server-side. RLS allows public read (anyone can view leaderboard) but private write (only authenticated users can update their own data).
**When to use:** Leaderboard data fetching and display.
**Example:**
```sql
-- Supabase RPC function for leaderboard
CREATE OR REPLACE FUNCTION get_leaderboard(
  board_type text DEFAULT 'all-time',
  result_limit int DEFAULT 25
)
RETURNS TABLE (
  rank bigint,
  user_id uuid,
  display_name text,
  composite_score numeric,
  current_streak int,
  top_badge text,
  is_weekly_winner boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    row_number() OVER (ORDER BY sp.composite_score DESC)::bigint,
    sp.user_id,
    sp.display_name,
    sp.composite_score,
    sp.current_streak,
    sp.top_badge,
    sp.is_weekly_winner
  FROM social_profiles sp
  WHERE sp.social_opt_in = true
    AND (board_type = 'all-time' OR sp.weekly_score_updated_at >= date_trunc('week', now()))
  ORDER BY sp.composite_score DESC
  LIMIT result_limit;
END;
$$;
```

```typescript
// Client call
const { data, error } = await supabase.rpc('get_leaderboard', {
  board_type: 'all-time',
  result_limit: 25,
});
```

### Pattern 4: Social Hub Tab Navigation (Matches HistoryPage Pattern)
**What:** Hash-based tab navigation using react-router-dom's `useLocation().hash`, consistent with existing HistoryPage implementation.
**When to use:** Social hub page with Leaderboard | Badges | Streak tabs.
**Example:**
```typescript
// Source: Existing pattern from src/pages/HistoryPage.tsx
const location = useLocation();

const tabFromHash = useMemo(() => {
  const hash = location.hash.replace('#', '');
  if (hash === 'badges') return 'badges';
  if (hash === 'streak') return 'streak';
  return 'leaderboard'; // default tab
}, [location.hash]);

const [userSelectedTab, setUserSelectedTab] = useState<string | null>(null);
const activeTab = userSelectedTab ?? tabFromHash ?? 'leaderboard';
```

### Pattern 5: Badge Detection via Derived State
**What:** Badge eligibility computed as pure derived state (useMemo) from current data. Matches the existing `useMasteryMilestones` pattern - no setState in effects.
**When to use:** Badge earned detection on any data change.
**Example:**
```typescript
// Source: Existing pattern from src/hooks/useMasteryMilestones.ts
const newlyEarnedBadge = useMemo(() => {
  const shownBadges = getShownBadges(); // from localStorage
  for (const badge of BADGE_DEFINITIONS) {
    if (badge.check(streakData, testHistory, masteryData) && !shownBadges.has(badge.id)) {
      return badge;
    }
  }
  return null;
}, [streakData, testHistory, masteryData]);
```

### Anti-Patterns to Avoid
- **setState in useEffect for derived data:** Use useMemo for badge detection, tab state from hash. React Compiler rules are strict in this project.
- **useRef for render-time tracking:** Use useState with lazy initializer instead (`useState(() => Date.now())`). See MEMORY.md pitfalls.
- **useMemo<Type>() generic syntax:** Breaks React Compiler. Use `const x: Type = useMemo(() => ...)` instead.
- **Client-side leaderboard sorting of all users:** Exposes all user scores to the client. Use Supabase RPC function instead.
- **Direct Supabase query for rankings without RLS:** Always use RLS policies. Public read for leaderboard, owner-only write for social profiles.
- **Storing streak as a single counter:** Store activity dates array. Counter-only storage can't handle freeze logic, timezone changes, or streak recovery.
- **Loading all 100 questions' history for badge checks:** Cache badge earned states in IndexedDB. Only re-check when new activity happens.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image generation from React components | Custom React-to-canvas renderer | Direct Canvas API (ctx.fillText, fillRect, drawImage) | Canvas API is simple for a fixed-layout card. html2canvas/html-to-image add CORS complexity and font issues. |
| File sharing on mobile | Custom share button per platform | Web Share API with clipboard fallback | Native share sheet handles all installed apps. Feature detection + fallback covers desktop. |
| Celebration animations | Custom CSS keyframe celebrations | Existing Confetti component + motion/react | Already built and tested. Scales to badge celebrations. |
| Bilingual toast notifications | New toast system | Existing BilingualToast (showSuccess/showError/showInfo) | Already handles EN+MY stacked layout with auto-dismiss. |
| Calendar heatmap | New heatmap from scratch | Fork/adapt existing ReviewHeatmap component | Same CSS grid + Tailwind pattern. Add freeze-day styling and activity-type colors. |
| Tab navigation | Custom tab state management | Existing hash-based tab pattern (HistoryPage) | Consistent UX, works with browser back/forward, React Compiler safe. |
| Modal dialogs | Custom overlay + portal | Radix Dialog via existing Dialog component | Already handles focus trapping, keyboard nav, accessibility. |
| Server-side ranking | Client-side sort of all users | Supabase RPC function | Secure, efficient, handles ties and pagination properly. |

**Key insight:** This phase has zero new library dependencies. Everything is either a browser API or already in the project. The main engineering challenge is wiring together existing systems (activity tracking, Supabase sync, UI components) into a cohesive social layer.

## Common Pitfalls

### Pitfall 1: Canvas API Font Loading Race Condition
**What goes wrong:** Canvas ctx.fillText() uses the default font if the desired web font hasn't loaded yet. The Burmese font (@fontsource/noto-sans-myanmar) is particularly affected since it's a non-Latin font.
**Why it happens:** Canvas API draws immediately - it doesn't wait for CSS fonts to load.
**How to avoid:** Use `document.fonts.ready` promise before drawing. Or load fonts with `document.fonts.load('bold 48px "Noto Sans Myanmar"')` explicitly before canvas operations.
**Warning signs:** Score card preview shows fallback font or Burmese characters render as boxes.

### Pitfall 2: Timezone-Dependent Streak Breaks
**What goes wrong:** A user studies at 11:30 PM, then at 12:30 AM the next day in their timezone, but the server records them as 2 days apart (UTC). Or vice versa - two activities on different UTC days but same local day.
**Why it happens:** Streak calculation uses dates, and date boundaries depend on timezone.
**How to avoid:** Always calculate streaks using the user's local date (`new Date().toISOString().slice(0, 10)` in their timezone, NOT UTC). Store dates as local date strings, not timestamps. For Supabase sync, include timezone offset.
**Warning signs:** Users report "my streak broke even though I studied yesterday."

### Pitfall 3: Web Share API Not Available on Desktop Browsers
**What goes wrong:** navigator.share is undefined or navigator.canShare({ files }) returns false on desktop Chrome/Firefox (file sharing support varies).
**Why it happens:** Web Share API has limited desktop support. File sharing is even more limited than text/URL sharing.
**How to avoid:** Always feature-detect with `navigator.canShare?.({ files: [testFile] })`. Provide clipboard fallback (`navigator.clipboard.write` with ClipboardItem). Show "Copied to clipboard" toast on fallback path.
**Warning signs:** Share button does nothing or throws on desktop.

### Pitfall 4: React Compiler ESLint Violations
**What goes wrong:** Using `setState` in `useEffect`, `useRef` for render-time value tracking, or `useMemo<Type>()` generic syntax causes lint failures that block the pre-commit hook.
**Why it happens:** This project uses React Compiler ESLint rules (see MEMORY.md).
**How to avoid:** Follow patterns from existing code: `useMemo` for derived state, `useState(() => initial)` for lazy init, avoid `useRef` for values read during render.
**Warning signs:** Pre-commit hook fails on `react-hooks/set-state-in-effect` or `react-hooks/refs`.

### Pitfall 5: Supabase RLS Blocking Leaderboard Reads for Unauthenticated Users
**What goes wrong:** Leaderboard page shows empty for non-signed-in users because RLS policies require `auth.uid()`.
**Why it happens:** Default RLS patterns use `auth.uid() = user_id` which returns null for unauthenticated users.
**How to avoid:** Leaderboard read policy must use `USING (true)` for SELECT on opt-in social profiles. Write policies still check `auth.uid() = user_id`. Use `anon` role access for public reads.
**Warning signs:** Leaderboard works when signed in, empty when signed out.

### Pitfall 6: Canvas CORS Issues with External Images
**What goes wrong:** If the score card includes the user's avatar or any external image, canvas becomes "tainted" and toBlob() throws a SecurityError.
**Why it happens:** Cross-origin images on canvas violate same-origin policy.
**How to avoid:** Don't use external images on the canvas. Use drawn shapes, text, and inline SVG paths for icons/badges. If avatar is needed, proxy it through same-origin endpoint or skip it.
**Warning signs:** toBlob() throws SecurityError in production but works in dev (same-origin).

### Pitfall 7: Streak Freeze Auto-Use Without User Awareness
**What goes wrong:** User returns after a day off, their freeze was silently consumed, and they don't understand why their freeze count decreased.
**Why it happens:** Freeze consumption happens automatically on the next visit.
**How to avoid:** Show a prominent bilingual toast on the first visit after a freeze was auto-used. Include a visual indicator (snowflake icon) on the heatmap for freeze days. Freeze usage should be clearly communicated.
**Warning signs:** User confusion about freeze count changes.

## Code Examples

### Streak Recording on Activity Completion
```typescript
// Hook into existing activity completion points
// Source: Pattern from src/lib/mastery/masteryStore.ts (idb-keyval store)

import { createStore, get, set } from 'idb-keyval';

const streakDb = createStore('civic-prep-streaks', 'streak-data');
const STREAK_KEY = 'streak';

export interface StreakData {
  activityDates: string[];       // 'YYYY-MM-DD' in user's local timezone
  freezesAvailable: number;      // 0-3
  freezesUsed: string[];         // dates when freezes were auto-consumed
  freezeEligibleToday: boolean;  // whether today's activity qualifies for freeze earn
  longestStreak: number;
  lastSyncedAt: string | null;   // ISO timestamp of last Supabase sync
}

const DEFAULT_STREAK: StreakData = {
  activityDates: [],
  freezesAvailable: 0,
  freezesUsed: [],
  freezeEligibleToday: false,
  longestStreak: 0,
  lastSyncedAt: null,
};

export async function getStreakData(): Promise<StreakData> {
  return (await get<StreakData>(STREAK_KEY, streakDb)) ?? DEFAULT_STREAK;
}

export async function recordStudyActivity(
  activityType: 'test' | 'practice' | 'srs_review' | 'study_guide'
): Promise<{ freezeEarned: boolean; streakUpdated: boolean }> {
  const data = await getStreakData();
  const today = new Date().toISOString().slice(0, 10);
  let freezeEarned = false;
  let streakUpdated = false;

  // Record activity date
  if (!data.activityDates.includes(today)) {
    data.activityDates.push(today);
    streakUpdated = true;
  }

  // Check freeze eligibility (full practice test OR 10+ SRS reviews)
  // This is tracked separately per activity type
  // ...

  await set(STREAK_KEY, data, streakDb);
  return { freezeEarned, streakUpdated };
}
```

### Canvas Score Card with Bilingual Text
```typescript
// Source: MDN Canvas API docs
// Pattern: Generate 1080x1080 PNG with gradient, text, and shapes

export async function renderShareCard(data: {
  score: number;
  total: number;
  streak: number;
  topBadge: string | null;
  categories: Array<{ name: string; correct: number; total: number }>;
  sessionType: 'test' | 'practice' | 'interview';
}): Promise<Blob> {
  // Wait for fonts to be ready
  await document.fonts.ready;
  // Explicitly load Burmese font
  await document.fonts.load('bold 36px "Noto Sans Myanmar"');

  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d')!;

  // Gradient background
  const bg = ctx.createLinearGradient(0, 0, 1080, 1080);
  bg.addColorStop(0, '#1e3a8a');  // Deep blue
  bg.addColorStop(0.5, '#4338ca'); // Indigo
  bg.addColorStop(1, '#7c3aed');  // Purple
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1080, 1080);

  // Gold accent bar
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(0, 0, 1080, 8);

  // Score (large, centered)
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 140px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${data.score}/${data.total}`, 540, 350);

  // Streak (fire emoji + count)
  ctx.font = 'bold 48px system-ui, sans-serif';
  ctx.fillStyle = '#FFA500';
  ctx.fillText(`${data.streak} day streak`, 540, 450);

  // Bilingual text
  ctx.fillStyle = '#E2E8F0';
  ctx.font = '36px "Noto Sans Myanmar", system-ui';
  ctx.fillText('U.S. Citizenship Civic Test Prep', 540, 950);
  ctx.font = '28px "Noto Sans Myanmar"';
  ctx.fillText('အမေရိကန်နိုင်ငံသားရေးရာ', 540, 1000);

  // Convert to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error('toBlob failed')),
      'image/png'
    );
  });
}
```

### Web Share with Clipboard Fallback
```typescript
// Source: MDN Navigator.share() docs + Web Share API patterns
// Must be called from user gesture (click handler)

export async function shareScoreCard(blob: Blob): Promise<'shared' | 'copied' | 'failed'> {
  const file = new File([blob], 'civic-test-score.png', {
    type: 'image/png',
    lastModified: Date.now(),
  });

  // Try native Web Share API with file
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: 'My Civic Test Score',
        text: 'Check out my U.S. citizenship test prep progress!',
      });
      return 'shared';
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return 'failed'; // User cancelled
      }
      // Fall through to clipboard
    }
  }

  // Fallback: copy image to clipboard
  try {
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob }),
    ]);
    return 'copied';
  } catch {
    // Final fallback: download the image
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'civic-test-score.png';
    a.click();
    URL.revokeObjectURL(url);
    return 'copied';
  }
}
```

### Supabase Social Tables Schema
```sql
-- Social profiles (extends existing profiles table concept)
CREATE TABLE IF NOT EXISTS public.social_profiles (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  social_opt_in boolean NOT NULL DEFAULT false,
  composite_score numeric NOT NULL DEFAULT 0,
  current_streak int NOT NULL DEFAULT 0,
  longest_streak int NOT NULL DEFAULT 0,
  top_badge text,
  is_weekly_winner boolean NOT NULL DEFAULT false,
  weekly_score_updated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.social_profiles ENABLE ROW LEVEL SECURITY;

-- Public read: anyone can view opted-in profiles (for leaderboard)
CREATE POLICY "Anyone can view opted-in social profiles"
  ON public.social_profiles FOR SELECT
  USING (social_opt_in = true);

-- Owner can read their own profile regardless of opt-in
CREATE POLICY "Users can view own social profile"
  ON public.social_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Only owner can write their own profile
CREATE POLICY "Users can upsert own social profile"
  ON public.social_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own social profile"
  ON public.social_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Streak history for cross-device sync
CREATE TABLE IF NOT EXISTS public.streak_data (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_dates text[] NOT NULL DEFAULT '{}',
  freezes_available int NOT NULL DEFAULT 0,
  freezes_used text[] NOT NULL DEFAULT '{}',
  longest_streak int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.streak_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own streak data"
  ON public.streak_data
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streak data"
  ON public.streak_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Earned badges
CREATE TABLE IF NOT EXISTS public.earned_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id text NOT NULL,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_id)
);

ALTER TABLE public.earned_badges ENABLE ROW LEVEL SECURITY;

-- Public read for opted-in users' badges (leaderboard profiles)
CREATE POLICY "Anyone can view opted-in users badges"
  ON public.earned_badges FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.social_profiles sp
      WHERE sp.user_id = earned_badges.user_id AND sp.social_opt_in = true
    )
  );

-- Owner can always read/write own badges
CREATE POLICY "Users can manage own badges"
  ON public.earned_badges
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges"
  ON public.earned_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Badge Definition Pattern
```typescript
// Declarative badge definitions - easy to extend

export interface BadgeDefinition {
  id: string;
  category: 'streak' | 'accuracy' | 'coverage';
  name: { en: string; my: string };
  description: { en: string; my: string };
  requirement: { en: string; my: string };
  icon: string; // lucide icon name
  check: (data: BadgeCheckData) => boolean;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Streak badges
  {
    id: 'streak-7',
    category: 'streak',
    name: { en: 'Week Warrior', my: 'တစ်ပတ်တိုက်သူ' },
    description: { en: '7-day study streak', my: '၇ ရက်ဆက်တိုက်လေ့လာမှု' },
    requirement: { en: 'Study for 7 consecutive days', my: '၇ ရက်ဆက်တိုက်လေ့လာပါ' },
    icon: 'Flame',
    check: (data) => data.currentStreak >= 7,
  },
  {
    id: 'streak-14',
    category: 'streak',
    name: { en: 'Fortnight Focus', my: 'နှစ်ပတ်စိုက်လျက်' },
    description: { en: '14-day study streak', my: '၁၄ ရက်ဆက်တိုက်လေ့လာမှု' },
    requirement: { en: 'Study for 14 consecutive days', my: '၁၄ ရက်ဆက်တိုက်လေ့လာပါ' },
    icon: 'Flame',
    check: (data) => data.currentStreak >= 14,
  },
  // Accuracy badges
  {
    id: 'accuracy-90',
    category: 'accuracy',
    name: { en: 'Sharp Shooter', my: 'ထိပ်တန်းတိကျသူ' },
    description: { en: 'Score 90% on a test', my: 'စာမေးပွဲတွင် ၉၀% ရမှတ်' },
    requirement: { en: 'Get 90% on a mock test', my: 'စမ်းသပ်စာမေးပွဲတွင် ၉၀% ရယူပါ' },
    icon: 'Target',
    check: (data) => data.bestTestAccuracy >= 90,
  },
  // Coverage badges
  {
    id: 'coverage-all',
    category: 'coverage',
    name: { en: 'Complete Scholar', my: 'ပြည့်စုံပညာရှင်' },
    description: { en: 'Studied all 100 questions', my: 'မေးခွန်း ၁၀၀ လုံးလေ့လာပြီး' },
    requirement: { en: 'Answer all 100 questions at least once', my: 'မေးခွန်း ၁၀၀ လုံးကို အနည်းဆုံး တစ်ကြိမ်ဖြေပါ' },
    icon: 'BookCheck',
    check: (data) => data.uniqueQuestionsAnswered >= 100,
  },
];
```

### Composite Score Formula
```typescript
// Claude's Discretion: Composite score weights
// Recommended: streak (20%), accuracy (50%), coverage (30%)
// Rationale: accuracy most important for test readiness,
// coverage shows thoroughness, streak rewards consistency

export function calculateCompositeScore(data: {
  currentStreak: number;
  bestTestAccuracy: number; // 0-100
  coveragePercent: number;  // 0-100 (unique questions answered / 100)
}): number {
  const streakScore = Math.min(data.currentStreak / 30, 1) * 100; // Cap at 30 days = 100%
  const accuracyScore = data.bestTestAccuracy;
  const coverageScore = data.coveragePercent;

  return Math.round(
    streakScore * 0.20 +
    accuracyScore * 0.50 +
    coverageScore * 0.30
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| html2canvas for image generation | Native Canvas API or OffscreenCanvas | Ongoing since ~2023 | Simpler, faster, no CORS issues, smaller bundle. |
| Platform-specific share SDKs (Facebook SDK, Twitter widget) | Web Share API (level 2 with files) | ~2022 (Safari), ~2023 (Chrome Android) | Single API for all platforms, native UI, no SDK bloat. |
| Server-rendered share images (OG image generation) | Client-side Canvas API generation | Both still viable | Client-side = offline capable, instant, no server cost. |
| Global leaderboard tables with client-side rank calculation | Server-side RPC functions with windowed ranking | Best practice since PostgreSQL window functions | Secure (doesn't expose all scores), efficient, handles ties. |

**Deprecated/outdated:**
- **html2canvas for social cards:** Unreliable with custom fonts, CORS issues, large bundle. Use Canvas API directly for fixed-layout cards.
- **navigator.share() without files parameter:** Level 1 Web Share (text/URL only) is widely supported, but Level 2 (files) is what's needed for image sharing. Always feature-detect.

## Open Questions

1. **Burmese Font Rendering in Canvas**
   - What we know: `@fontsource/noto-sans-myanmar` is installed in the project. Canvas can use it via `document.fonts.load()`.
   - What's unclear: Whether the font renders correctly at all sizes on the canvas across devices. May need testing on mobile Safari specifically.
   - Recommendation: Implement with font loading, test on target devices, have fallback to Unicode text without specific font face.

2. **Clipboard API Support for Images**
   - What we know: `navigator.clipboard.write` with `ClipboardItem` works in Chrome and Safari. Firefox has limited support.
   - What's unclear: Exact support matrix for PNG clipboard write on all target devices.
   - Recommendation: Implement with try/catch, fall back to download if clipboard fails.

3. **Leaderboard Update Frequency**
   - What we know: Composite scores change whenever user completes an activity. Real-time updates via Supabase Realtime are possible.
   - What's unclear: Whether real-time leaderboard updates are worth the Supabase Realtime connection cost.
   - Recommendation: Poll-based refresh (30-second interval when leaderboard tab is active) rather than real-time subscription. Update user's own score immediately on activity, refresh full board periodically.

4. **Weekly Leaderboard Reset Timing**
   - What we know: Need to reset weekly scores. Supabase doesn't have built-in cron.
   - What's unclear: Best approach for weekly reset without a separate scheduled job.
   - Recommendation: Use the `weekly_score_updated_at` timestamp approach - filter by current week in the RPC function rather than actually resetting data. Crown assignment can happen client-side by checking if the top scorer's timestamp is in the current week.

## Discretion Recommendations

### Streak-at-Risk Push Notification Strategy
**Recommendation:** Send a push notification at the user's configured reminder time (from Settings page, default 9:00 PM) if no study activity has been recorded that day. Message should be encouraging, not guilt-inducing. Example: "Keep your 5-day streak alive! / သင့် ၅ ရက်ဆက်တိုက် လေ့လာမှုကို ဆက်လက်ထိန်းသိမ်းပါ!" Use the existing push notification infrastructure (`usePushNotifications` hook).

### Settings Page Social Section Layout
**Recommendation:** Add a new "Social Features" section between "Notifications" and "Review Reminders" on the Settings page. Contents: social opt-in toggle, display name edit field (text input), privacy notice link. Follow existing Card + SectionHeading pattern.

### Composite Score Formula Weights
**Recommendation:** Accuracy 50%, Coverage 30%, Streak 20%. Accuracy is most important for actual test readiness. Coverage ensures breadth. Streak rewards consistency but shouldn't dominate. Cap streak contribution at 30 days to prevent long-term users from being unbeatable.

### Badge Icon/Visual Design
**Recommendation:** Use lucide-react icons: `Flame` for streak badges, `Target` for accuracy badges, `BookCheck` for coverage badges, `Crown` for weekly winner, `Trophy` for leaderboard rank. Badge visual: circular container with icon, colored by earned state (gold for earned, gray for locked). Use existing MasteryBadge component styling as reference.

### Heatmap Color Scheme
**Recommendation:** Use a warm gradient for the streak heatmap (unlike the SRS heatmap which uses primary blue). Activity days: light orange -> deep orange -> red-orange (4 intensity levels). Freeze days: light blue/ice color with snowflake icon or dotted border. No-activity days: muted gray. This differentiates the streak heatmap from the SRS review heatmap.

### Leaderboard Update/Refresh Frequency
**Recommendation:** Update the user's own composite score immediately after any activity completion (recalculate and upsert to Supabase). Leaderboard display refreshes on tab focus/visibility, with a 30-second minimum interval between fetches. No real-time subscription needed - leaderboard data is not time-critical.

## Sources

### Primary (HIGH confidence)
- MDN Web API - Navigator.share() (https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share) - Parameters, security requirements, browser support
- MDN Web API - HTMLCanvasElement.toBlob() (https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob) - API signature, browser support, gotchas
- Supabase Docs - Database Functions (https://supabase.com/docs/guides/database/functions) - RPC function creation and client calling
- Supabase Docs - Row Level Security (https://supabase.com/docs/guides/database/postgres/row-level-security) - RLS policy patterns
- Context7 /supabase/supabase-js - Select, insert, upsert, RPC, real-time channel APIs
- Context7 /websites/lucide_dev_guide_packages - Available icon names (Flame, Crown, Trophy, Award, Medal confirmed)
- Existing codebase: ReviewHeatmap.tsx, MasteryMilestone.tsx, Confetti.tsx, HistoryPage.tsx, SupabaseAuthContext.tsx, masteryStore.ts, offlineDb.ts, BilingualToast.tsx, design-tokens.ts

### Secondary (MEDIUM confidence)
- Ben Kaiser - Sharing Images Using Web Share API (https://benkaiser.dev/sharing-images-using-the-web-share-api/) - Canvas to blob to File to navigator.share() pattern
- web.dev - Share files pattern (https://web.dev/patterns/files/share-files) - File sharing best practices
- Supabase RLS Complete Guide 2026 (https://vibeappscanner.com/supabase-row-level-security) - Public read, private write pattern

### Tertiary (LOW confidence)
- Plotline - Streaks and Milestones for Gamification (https://www.plotline.so/blog/streaks-for-gamification-in-mobile-apps) - Gamification best practices (7+ day retention data)
- Trophy - Streaks Gamification Case Study (https://trophy.so/blog/streaks-gamification-case-study) - Streak design patterns
- DigitalOcean - Canvas toBlob tutorial (https://www.digitalocean.com/community/tutorials/js-canvas-toblob) - Implementation details

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in the project. No new dependencies. Browser APIs well-documented.
- Architecture: HIGH - Patterns match existing codebase (heatmap, milestones, idb-keyval stores, Supabase sync, hash-based tabs).
- Pitfalls: HIGH - Font loading, timezone, Web Share availability are well-documented browser API concerns. React Compiler pitfalls documented in project MEMORY.md.
- Supabase schema/RLS: HIGH - Follows established patterns from existing schema.sql. RPC functions well-documented.
- Canvas API image generation: MEDIUM - Pattern is straightforward but Burmese font rendering needs device testing.
- Composite score formula: MEDIUM - Weights are reasonable but may need tuning after user feedback.

**Research date:** 2026-02-07
**Valid until:** 2026-03-07 (30 days - stable domain, no fast-moving library changes)
