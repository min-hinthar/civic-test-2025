# Architecture Research

**Domain:** Bilingual Civics Test Prep PWA (evolving existing Next.js + Supabase SPA)
**Researched:** 2026-02-05
**Confidence:** MEDIUM-HIGH

## Executive Summary

This architecture research addresses integrating PWA capabilities, spaced repetition, and social features into an existing Next.js 15 + Supabase + React Router DOM SPA. The current architecture uses a catch-all Pages Router route delegating to client-side React Router, with Context API for state management.

**Key architectural decisions:**
1. **Service Worker via Serwist** (next-pwa successor) for PWA/offline support
2. **IndexedDB + Sync Queue** for offline-first data persistence
3. **SM-2 algorithm** with PostgreSQL-backed spaced repetition state
4. **Supabase tables** for social features (follow system, leaderboards)
5. **Static bilingual JSON** maintained in codebase (no runtime i18n library needed)

## Current Architecture Analysis

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Next.js 15 (Pages Router)                        │
├─────────────────────────────────────────────────────────────────────────┤
│  pages/[[...slug]].tsx ──────────────────────────────────────────────── │
│         │                                                                │
│         ▼                                                                │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                     src/AppShell.tsx                              │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌────────────────────────┐    │   │
│  │  │ThemeProvider│  │AuthProvider │  │ React Router <Routes>  │    │   │
│  │  │  (Context)  │  │  (Context)  │  │   /dashboard, /test    │    │   │
│  │  └─────────────┘  └─────────────┘  │   /study, /history     │    │   │
│  │                                     └────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────┤
│                           Supabase Backend                               │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐              │
│  │  profiles  │  │ mock_tests │  │ mock_test_responses  │              │
│  └────────────┘  └────────────┘  └──────────────────────┘              │
└─────────────────────────────────────────────────────────────────────────┘
```

**Current limitations:**
- No service worker, no offline support
- No PWA manifest, not installable
- Questions embedded in JS bundle (civicsQuestions.ts)
- All data requires network connectivity
- No spaced repetition - random question selection only
- No social features

## Recommended Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            Service Worker (Serwist)                      │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────────┐    │
│  │ Asset Caching  │  │ API Caching    │  │ Background Sync        │    │
│  │ (precache)     │  │ (stale-while-  │  │ (sync queue replay)    │    │
│  │                │  │  revalidate)   │  │                        │    │
│  └────────────────┘  └────────────────┘  └────────────────────────┘    │
├─────────────────────────────────────────────────────────────────────────┤
│                         Next.js 15 (Pages Router)                        │
├─────────────────────────────────────────────────────────────────────────┤
│  pages/[[...slug]].tsx ──► src/AppShell.tsx                             │
│                                     │                                    │
│                    ┌────────────────┼────────────────┐                  │
│                    ▼                ▼                ▼                  │
│           ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│           │ThemeProvider │  │ AuthProvider │  │  SRSProvider │         │
│           │  (Context)   │  │  (Context)   │  │  (Context)   │         │
│           └──────────────┘  └──────────────┘  └──────────────┘         │
│                                     │                                    │
│                    ┌────────────────┼────────────────┐                  │
│                    ▼                ▼                ▼                  │
│           ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│           │OfflineProvider│  │SocialProvider│  │React Router  │         │
│           │  (IndexedDB)  │  │ (Context)    │  │  <Routes>    │         │
│           └──────────────┘  └──────────────┘  └──────────────┘         │
├─────────────────────────────────────────────────────────────────────────┤
│                            Data Layer                                    │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                        IndexedDB (idb)                          │    │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐   │    │
│  │  │ questions │  │srs_state  │  │sync_queue │  │  cache    │   │    │
│  │  │  (100)    │  │(per user) │  │(pending)  │  │ (misc)    │   │    │
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘   │    │
│  └────────────────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────────────────┤
│                         Supabase Backend                                 │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     Existing Tables                               │  │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐        │  │
│  │  │  profiles  │  │ mock_tests │  │ mock_test_responses  │        │  │
│  │  └────────────┘  └────────────┘  └──────────────────────┘        │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │                     New Tables (SRS)                              │  │
│  │  ┌────────────────────────────────────────────────────────┐      │  │
│  │  │                    srs_cards                            │      │  │
│  │  │ user_id, question_id, ease_factor, interval,           │      │  │
│  │  │ repetitions, next_review_at, last_reviewed_at          │      │  │
│  │  └────────────────────────────────────────────────────────┘      │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │                     New Tables (Social)                           │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐      │  │
│  │  │  follows   │  │study_streak│  │    achievements        │      │  │
│  │  │follower_id │  │ user_id    │  │ user_id, type, earned  │      │  │
│  │  │followed_id │  │ current    │  │                        │      │  │
│  │  │created_at  │  │ longest    │  │                        │      │  │
│  │  └────────────┘  │ last_date  │  └────────────────────────┘      │  │
│  │                  └────────────┘                                   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|----------------|-------------------|
| Service Worker (Serwist) | Asset precaching, API response caching, background sync | Browser cache, IndexedDB, Network |
| AppShell | Root component, provider composition | All providers, React Router |
| AuthProvider | Supabase auth state, user session | Supabase Auth, IndexedDB (cache) |
| SRSProvider | Spaced repetition state, SM-2 calculations | IndexedDB (local), Supabase (remote) |
| OfflineProvider | Online/offline detection, sync queue management | IndexedDB, Service Worker, Supabase |
| SocialProvider | Follow state, leaderboard data, achievements | Supabase, IndexedDB (cache) |
| IndexedDB Layer | Local persistence, offline-first storage | All providers via idb wrapper |
| Supabase | Auth, remote persistence, realtime updates | IndexedDB (sync), Providers |

## Recommended Project Structure

```
src/
├── components/
│   ├── ui/                    # Existing UI components
│   ├── AppNavigation.tsx      # Existing
│   ├── ProtectedRoute.tsx     # Existing
│   ├── InstallPrompt.tsx      # NEW: PWA install banner
│   ├── OfflineIndicator.tsx   # NEW: Connection status
│   └── SyncStatus.tsx         # NEW: Sync queue status
├── contexts/
│   ├── SupabaseAuthContext.tsx # Existing (enhanced for offline)
│   ├── ThemeContext.tsx        # Existing
│   ├── SRSContext.tsx          # NEW: Spaced repetition state
│   ├── OfflineContext.tsx      # NEW: Offline/sync management
│   └── SocialContext.tsx       # NEW: Social features
├── lib/
│   ├── supabaseClient.ts       # Existing
│   ├── db/                     # NEW: IndexedDB layer
│   │   ├── index.ts            # idb database initialization
│   │   ├── questions.ts        # Question store operations
│   │   ├── srs.ts              # SRS state operations
│   │   └── syncQueue.ts        # Sync queue operations
│   ├── srs/                    # NEW: Spaced repetition logic
│   │   ├── sm2.ts              # SM-2 algorithm implementation
│   │   ├── scheduler.ts        # Review scheduling logic
│   │   └── types.ts            # SRS type definitions
│   └── sync/                   # NEW: Sync utilities
│       ├── manager.ts          # Sync queue manager
│       └── strategies.ts       # Conflict resolution
├── pages/                      # React Router pages (existing)
│   ├── Dashboard.tsx           # Enhanced with SRS stats
│   ├── TestPage.tsx            # Existing
│   ├── StudyGuidePage.tsx      # Enhanced with SRS mode
│   ├── HistoryPage.tsx         # Existing
│   └── LeaderboardPage.tsx     # NEW: Social leaderboard
├── constants/
│   └── civicsQuestions.ts      # Existing (bilingual data)
├── types/
│   ├── index.ts                # Existing
│   └── srs.ts                  # NEW: SRS types
├── hooks/                      # NEW: Custom hooks
│   ├── useOnlineStatus.ts      # Online/offline detection
│   ├── useSRS.ts               # SRS operations hook
│   └── useSyncQueue.ts         # Sync queue hook
└── styles/
    └── globals.css             # Existing

public/
├── manifest.json               # NEW: PWA manifest
├── sw.js                       # Generated by Serwist
├── icons/                      # NEW: PWA icons
│   ├── icon-192.png
│   ├── icon-512.png
│   └── apple-touch-icon.png
└── offline.html                # NEW: Offline fallback page

service-worker/                 # NEW: Service worker source
└── index.ts                    # Serwist configuration
```

### Structure Rationale

- **lib/db/**: Separates IndexedDB operations into focused modules for maintainability
- **lib/srs/**: Isolates SM-2 algorithm logic from React components for testability
- **lib/sync/**: Encapsulates sync logic that could be reused across features
- **hooks/**: Custom hooks provide clean API for components to access complex functionality
- **service-worker/**: Separate directory for service worker source (Pages Router compatible)

## Architectural Patterns

### Pattern 1: Offline-First Data Flow

**What:** All mutations write to IndexedDB first, then queue for sync to Supabase. The local database is the source of truth.

**When to use:** Any user action that modifies data (submitting test results, updating SRS state, social actions)

**Trade-offs:**
- PRO: Instant UI feedback, works offline
- CON: Eventual consistency, requires conflict resolution

**Data flow:**
```
User Action
    │
    ▼
IndexedDB Write (optimistic)
    │
    ├──► UI Updates Immediately
    │
    ▼
Sync Queue Entry Added
    │
    ├── Online? ──► Process Queue ──► Supabase API
    │                    │
    │                    ▼
    │              Success? ──► Remove from queue
    │                    │
    │                    No ──► Retry with backoff
    │
    └── Offline? ──► Queue persists, retry on 'online' event
```

**Example:**
```typescript
// lib/sync/manager.ts
interface SyncQueueItem {
  id: string;
  operation: 'create' | 'update' | 'delete';
  table: string;
  data: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
}

async function queueOperation(item: Omit<SyncQueueItem, 'id' | 'retryCount'>) {
  // 1. Write to local IndexedDB first
  await db.put(item.table, item.data);

  // 2. Add to sync queue
  await db.add('syncQueue', {
    ...item,
    id: crypto.randomUUID(),
    retryCount: 0
  });

  // 3. Attempt immediate sync if online
  if (navigator.onLine) {
    await processSyncQueue();
  }
}
```

### Pattern 2: SM-2 Spaced Repetition

**What:** Each question has per-user SRS state (ease factor, interval, next review date). After each review, state updates based on quality of recall.

**When to use:** Study mode (not mock test mode - that remains random selection)

**Trade-offs:**
- PRO: Optimal learning efficiency, personalized review schedule
- CON: Requires state management per user per question (100 questions x N users)

**Schema:**
```sql
-- New Supabase table
create table public.srs_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  question_id integer not null,
  ease_factor real not null default 2.5,
  interval integer not null default 0,
  repetitions integer not null default 0,
  next_review_at timestamptz not null default now(),
  last_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(user_id, question_id)
);

alter table public.srs_cards enable row level security;
create policy "Users can manage their own cards" on public.srs_cards
  using (auth.uid() = user_id);
create policy "Users can insert their own cards" on public.srs_cards
  for insert with check (auth.uid() = user_id);
```

**Algorithm:**
```typescript
// lib/srs/sm2.ts
interface SRSCard {
  questionId: number;
  easeFactor: number;  // >= 1.3, default 2.5
  interval: number;    // days
  repetitions: number;
  nextReviewAt: Date;
}

interface SM2Result {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewAt: Date;
}

// Quality: 0-5 (0-2 = fail, 3-5 = pass)
function sm2(card: SRSCard, quality: number): SM2Result {
  let { easeFactor, interval, repetitions } = card;

  if (quality >= 3) {
    // Correct response
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else {
    // Incorrect - reset
    repetitions = 0;
    interval = 1;
  }

  // Adjust ease factor (minimum 1.3)
  easeFactor = Math.max(1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + interval);

  return { easeFactor, interval, repetitions, nextReviewAt };
}
```

### Pattern 3: Service Worker with Serwist

**What:** Serwist (next-pwa successor) configures Workbox-based service worker for precaching and runtime caching.

**When to use:** Always - required for PWA installability and offline support.

**Trade-offs:**
- PRO: Zero-config PWA setup, well-maintained, Workbox-based
- CON: Requires webpack (not Turbopack), adds build complexity

**Setup:**
```typescript
// next.config.mjs
import { withSerwist } from '@serwist/next';

const nextConfig = {
  reactStrictMode: true,
  // ... existing config
};

export default withSerwist({
  swSrc: 'service-worker/index.ts',
  swDest: 'public/sw.js',
  cacheOnFrontendNav: true,
  reloadOnOnline: true,
})(nextConfig);
```

```typescript
// service-worker/index.ts
import { defaultCache } from '@serwist/next/browser';
import { Serwist } from 'serwist';

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  runtimeCaching: [
    ...defaultCache,
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-api',
        networkTimeoutSeconds: 10,
        cacheableResponse: { statuses: [0, 200] }
      }
    }
  ]
});

serwist.addEventListeners();
```

### Pattern 4: Social Feature Schema

**What:** Follow system and leaderboard data stored in Supabase with RLS protection.

**When to use:** Social features like following users, viewing leaderboards, achievements.

**Trade-offs:**
- PRO: Enables community features, gamification
- CON: Privacy considerations, moderation needs

**Schema:**
```sql
-- Follow relationship (one-way, Twitter-style)
create table public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.profiles(id) on delete cascade,
  followed_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(follower_id, followed_id),
  constraint no_self_follow check (follower_id != followed_id)
);

alter table public.follows enable row level security;
create policy "Anyone can view follows" on public.follows for select using (true);
create policy "Users can manage their own follows" on public.follows
  for insert with check (auth.uid() = follower_id);
create policy "Users can unfollow" on public.follows
  for delete using (auth.uid() = follower_id);

-- Study streaks for gamification
create table public.study_streaks (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_study_date date,
  updated_at timestamptz not null default now()
);

alter table public.study_streaks enable row level security;
create policy "Streaks are publicly readable" on public.study_streaks
  for select using (true);
create policy "Users can manage their own streak" on public.study_streaks
  using (auth.uid() = user_id);

-- Achievements
create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  achievement_type text not null,
  earned_at timestamptz not null default now(),
  unique(user_id, achievement_type)
);

create type achievement_type as enum (
  'first_test', 'perfect_score', 'streak_7', 'streak_30',
  'all_categories_studied', 'first_follower', 'helped_10'
);

alter table public.achievements enable row level security;
create policy "Achievements are publicly readable" on public.achievements
  for select using (true);
create policy "System can grant achievements" on public.achievements
  for insert with check (auth.uid() = user_id);

-- Leaderboard view (computed)
create or replace view public.leaderboard as
select
  p.id as user_id,
  p.full_name,
  coalesce(s.current_streak, 0) as current_streak,
  count(distinct mt.id) as total_tests,
  coalesce(avg(mt.score::float / mt.total_questions * 100), 0) as avg_score,
  count(distinct a.id) as achievement_count
from public.profiles p
left join public.study_streaks s on p.id = s.user_id
left join public.mock_tests mt on p.id = mt.user_id
left join public.achievements a on p.id = a.user_id
group by p.id, p.full_name, s.current_streak;
```

## Data Flow

### Authentication Flow (Enhanced for Offline)

```
App Load
    │
    ├── Check IndexedDB for cached session
    │       │
    │       ├── Found valid ──► Hydrate user from cache
    │       │                        │
    │       │                        └── Background: Verify with Supabase
    │       │
    │       └── Not found ──► Check Supabase session
    │
    └── Supabase Session
            │
            ├── Valid ──► Cache to IndexedDB ──► Hydrate user
            │
            └── Invalid ──► Show auth screen
```

### Study Session Flow (SRS Mode)

```
User Opens Study Mode
    │
    ▼
Load SRS State from IndexedDB
    │
    ├── Has due cards? ──► Show due cards first (sorted by overdue)
    │
    └── No due cards ──► Show new cards (never studied)
                              │
                              ▼
                         Present Question
                              │
                              ▼
                         User Answers
                              │
                    ┌────────┴────────┐
                    ▼                 ▼
               Correct            Incorrect
            (quality 4-5)       (quality 0-2)
                    │                 │
                    └────────┬────────┘
                             ▼
                      Run SM-2 Algorithm
                             │
                             ▼
                    Update IndexedDB (immediate)
                             │
                             ▼
                    Queue Supabase Sync
                             │
                             ▼
                    Show Next Card
```

### Sync Queue Flow

```
Mutation Occurs
    │
    ▼
Write to IndexedDB ────────────────────► UI Updates
    │
    ▼
Add to Sync Queue (IndexedDB)
    │
    ▼
Is Online? ────────────────────────────► No: Wait for 'online' event
    │
    Yes
    │
    ▼
Process Queue (FIFO)
    │
    ├── For each item:
    │       │
    │       ▼
    │   Send to Supabase
    │       │
    │       ├── Success ──► Remove from queue
    │       │
    │       └── Failure ──► Increment retry count
    │                           │
    │                           ├── < Max retries ──► Keep in queue
    │                           │
    │                           └── >= Max retries ──► Move to dead letter
    │
    └── Continue until queue empty or offline
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Current architecture is fine. IndexedDB per-user, Supabase free tier. |
| 1k-10k users | Consider Supabase Pro for realtime, add Redis for leaderboard caching if needed. |
| 10k+ users | Evaluate PowerSync for offline sync at scale, Supabase Pro/Team tier. |

### Scaling Priorities

1. **First bottleneck: Supabase free tier limits** - 500MB database, 2GB bandwidth/month
   - Monitor usage, upgrade to Pro ($25/mo) when approaching limits
   - Optimize queries, add pagination to leaderboard

2. **Second bottleneck: IndexedDB storage limits** - ~50% of available disk
   - Implement data pruning for old sync queue items
   - Warn users approaching storage limits (Safari 7-day eviction risk)

## Anti-Patterns

### Anti-Pattern 1: Storing All Data in React Context

**What people do:** Put all offline data in React Context/state
**Why it's wrong:** Context re-renders all consumers on any change; data lost on page refresh
**Do this instead:** Use IndexedDB as source of truth, Context only for current UI state

### Anti-Pattern 2: Sync on Every Mutation

**What people do:** Call Supabase API directly on every user action
**Why it's wrong:** Fails offline, creates inconsistent state, poor UX
**Do this instead:** Write to IndexedDB first, queue sync, process queue in background

### Anti-Pattern 3: Complex i18n Library for 2 Languages

**What people do:** Add react-i18next for bilingual support
**Why it's wrong:** Overkill for 2 static languages, adds bundle size and complexity
**Do this instead:** Keep bilingual data in civicsQuestions.ts, use simple conditional rendering

### Anti-Pattern 4: Server-Side Rendering with React Router DOM

**What people do:** Try to enable SSR for React Router routes
**Why it's wrong:** React Router DOM is client-side only in this setup
**Do this instead:** Keep SSR disabled via dynamic import, accept SPA tradeoffs

### Anti-Pattern 5: Hard-Deleting Synced Data

**What people do:** DELETE from Supabase without soft-delete
**Why it's wrong:** Offline clients miss the deletion, data reappears
**Do this instead:** Use _deleted boolean flag, filter deleted items in queries

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Supabase Auth | SDK client, session persistence | Already integrated, enhance with IndexedDB caching |
| Supabase Database | SDK client, RLS policies | Existing, add new tables for SRS/social |
| Supabase Realtime | Optional for social features | Consider for live leaderboard updates |
| Vercel | Static deployment, edge functions | Current deployment target |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Service Worker <-> Main Thread | postMessage, Background Sync API | SW cannot access DOM or React state |
| IndexedDB <-> React Components | Custom hooks (useSRS, useSyncQueue) | Wrap idb in hooks for clean API |
| SRS Logic <-> UI | SRSContext provides methods | Pure functions in lib/srs/, state in context |
| Auth <-> Offline | Cached session in IndexedDB | Validate with Supabase when online |

## Build Order Dependencies

Based on component dependencies, the recommended implementation order:

```
Phase 1: PWA Foundation
├── manifest.json + icons
├── Service Worker (Serwist) setup
├── Offline fallback page
└── InstallPrompt component

Phase 2: IndexedDB Layer
├── idb database initialization
├── Question caching (civicsQuestions.ts → IndexedDB)
├── OfflineContext + useOnlineStatus hook
└── Basic sync queue infrastructure
    │
    └── Depends on: Phase 1 (service worker for background sync)

Phase 3: Spaced Repetition
├── Supabase srs_cards table + RLS
├── SM-2 algorithm (lib/srs/sm2.ts)
├── SRS IndexedDB operations
├── SRSContext provider
└── Study mode UI enhancements
    │
    └── Depends on: Phase 2 (IndexedDB layer)

Phase 4: Social Features
├── Supabase follows, study_streaks, achievements tables
├── SocialContext provider
├── Leaderboard page
├── Follow/unfollow UI
└── Achievement notifications
    │
    └── Depends on: Phase 2 (IndexedDB for offline caching)
    └── Independent of: Phase 3 (can be built in parallel)
```

## Sources

**PWA & Service Workers:**
- [Serwist Documentation](https://serwist.pages.dev/docs/next/getting-started) - Official Serwist docs (HIGH confidence)
- [next-pwa GitHub](https://github.com/shadowwalker/next-pwa) - Original next-pwa reference (MEDIUM confidence - maintenance status unclear)
- [Next.js PWA Guide](https://nextjs.org/docs/app/guides/progressive-web-apps) - Official Next.js docs (HIGH confidence)

**Offline-First & IndexedDB:**
- [LogRocket: Offline-first frontend apps 2025](https://blog.logrocket.com/offline-first-frontend-apps-2025-indexeddb-sqlite/) - IndexedDB patterns (MEDIUM confidence)
- [RxDB Supabase Replication](https://rxdb.info/replication-supabase.html) - Sync architecture reference (MEDIUM confidence)
- [idb npm package](https://www.npmjs.com/package/idb) - IndexedDB wrapper (HIGH confidence - official docs)

**Spaced Repetition:**
- [SM-2 Algorithm Explanation](https://github.com/cnnrhill/sm-2) - SM-2 implementation (HIGH confidence)
- [supermemo npm](https://www.npmjs.com/package/supermemo) - SM-2 library (HIGH confidence)

**Social Features:**
- [Leaderboard System Design](https://systemdesign.one/leaderboard-system-design/) - Architecture reference (MEDIUM confidence)
- [PostgreSQL Follow System](https://www.geeksforgeeks.org/dbms/design-database-for-followers-following-systems-in-social-media-apps/) - Schema patterns (MEDIUM confidence)

---
*Architecture research for: Bilingual Civics Test Prep PWA*
*Researched: 2026-02-05*
