# Pitfalls Research

**Domain:** Bilingual Civics Test Prep PWA (English/Burmese) for Immigrant Users
**Researched:** 2026-02-05
**Confidence:** HIGH (verified through official docs, WebSearch, and codebase analysis)

---

## Critical Pitfalls

### Pitfall 1: Biased Shuffle Algorithm Produces Non-Uniform Question Distribution

**What goes wrong:**
The current shuffle implementation `[...array].sort(() => Math.random() - 0.5)` produces a biased distribution. Elements near the start of the array are more likely to remain near the start. This means certain civics questions appear more frequently than others across test sessions.

**Why it happens:**
Developers reach for the shortest solution. The `sort()` comparator approach seems clever but violates the comparison contract that sort algorithms rely on - comparisons must be consistent (if A < B and B < C, then A < C).

**How to avoid:**
Use the Fisher-Yates (Knuth) shuffle algorithm:
```typescript
const shuffle = <T,>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};
```

**Warning signs:**
- Users report seeing the same questions repeatedly
- Statistical analysis shows certain question IDs appear more frequently
- Questions from early in the source array dominate test sessions

**Phase to address:**
Technical Debt / Foundation phase - fix before any new features

---

### Pitfall 2: Race Condition in Test Session Save

**What goes wrong:**
The current implementation sets `hasSavedSession = true` before the async `saveTestSession()` completes. If the save fails, the flag is reset to `false`, but by then another effect cycle may have started, or the user may have navigated away.

**Why it happens:**
Optimistic state updates without proper async coordination. The flag is used both to prevent duplicate saves AND as a UI indicator, conflating two concerns.

**How to avoid:**
1. Use a ref to track "save in progress" separately from "save completed"
2. Implement proper async state machine: `idle` -> `saving` -> `saved` | `error`
3. Consider using React Query or SWR for mutation state management

```typescript
type SaveState = 'idle' | 'saving' | 'saved' | 'error';
const [saveState, setSaveState] = useState<SaveState>('idle');
const saveAttempted = useRef(false);

useEffect(() => {
  if (!isFinished || !results.length || saveAttempted.current) return;
  saveAttempted.current = true;
  setSaveState('saving');

  saveTestSession(session)
    .then(() => setSaveState('saved'))
    .catch(() => setSaveState('error'));
}, [isFinished, results]);
```

**Warning signs:**
- Duplicate test sessions appearing in history
- Test results occasionally lost without error message
- "Save failed" toast appears after user navigated away

**Phase to address:**
Technical Debt / Foundation phase - critical data integrity issue

---

### Pitfall 3: history.pushState Memory Leak During Tests

**What goes wrong:**
The current navigation lock implementation calls `window.history.pushState(null, '', window.location.href)` on every `popstate` event. Each call adds an entry to the browser's history stack. Users pressing back repeatedly or automated tests can cause memory exhaustion.

**Why it happens:**
The pattern "push state to block back navigation" is common but naive. Browsers don't limit history stack size, and continuous pushState calls in a loop compound rapidly.

**How to avoid:**
Use `replaceState` instead of `pushState` when blocking navigation:
```typescript
const handlePopState = () => {
  window.history.replaceState(null, '', window.location.href);
  // Show toast...
};
```

Or use a single pushState on mount, then replaceState on popstate:
```typescript
useEffect(() => {
  window.history.pushState({ testLock: true }, '', window.location.href);
  const handlePopState = () => {
    window.history.replaceState({ testLock: true }, '', window.location.href);
  };
  // ...
}, []);
```

**Warning signs:**
- Browser becomes sluggish during long test sessions
- Memory usage grows linearly with user's back-button attempts
- Tab crashes on mobile devices with limited memory

**Phase to address:**
Technical Debt / Foundation phase - affects stability

---

### Pitfall 4: React Router Inside Next.js Causes 404 on Page Refresh

**What goes wrong:**
The app uses `react-router-dom` inside Next.js. When users refresh a page like `/test` or `/dashboard`, Next.js doesn't know about these routes and returns 404. The SPA routing only works after initial page load.

**Why it happens:**
Next.js has its own file-based routing. React Router intercepts client-side navigation but can't handle server-side requests. This is a fundamental architectural conflict.

**How to avoid:**
Two approaches:
1. **Migrate to Next.js App Router** (recommended for PWA): Move routes to `/app/[route]/page.tsx` files. Get SSR, better SEO, and proper PWA integration.
2. **Catch-all route workaround**: Create `pages/[[...slug]].tsx` that renders the React Router shell. All routes fall through to client-side routing.

```typescript
// pages/[[...slug]].tsx (workaround, not recommended long-term)
export default function CatchAll() {
  return typeof window !== 'undefined' ? <AppShell /> : null;
}
```

**Warning signs:**
- Users bookmarking pages get 404 on return
- Share links don't work
- PWA "Add to Home Screen" opens to blank/error page
- Browser refresh loses current page

**Phase to address:**
PWA phase - must resolve before PWA deployment

---

### Pitfall 5: iOS Safari PWA Data Eviction After 7 Days

**What goes wrong:**
iOS Safari automatically purges IndexedDB, Cache API, and localStorage for PWAs that haven't been used in 7 days. Users who study weekly lose all their offline data and test history.

**Why it happens:**
Apple's storage policy for web apps. Unlike native apps, PWAs don't get persistent storage by default on iOS.

**How to avoid:**
1. **Request persistent storage** early in the app lifecycle:
```typescript
if (navigator.storage?.persist) {
  const granted = await navigator.storage.persist();
  if (!granted) {
    // Show notice that data may be cleared after 7 days of inactivity
  }
}
```

2. **Implement cloud sync as primary storage** (Supabase)
3. **Design for data loss**: Assume offline data is ephemeral, sync to server whenever online
4. **Prompt regular usage**: Push notifications for daily practice to keep the 7-day clock reset

**Warning signs:**
- iOS users report "lost progress" after vacation/break
- Spaced repetition schedules reset unexpectedly
- Test history disappears on iOS but not Android

**Phase to address:**
PWA phase - critical for iOS users

---

### Pitfall 6: Burmese (Myanmar) Font Rendering Failures

**What goes wrong:**
Burmese text appears as boxes, garbled characters, or wrong glyphs. The two encoding systems (Zawgyi and Unicode) are incompatible - text encoded in one appears corrupted in the other.

**Why it happens:**
The Zawgyi font, still widely used in Myanmar, is not Unicode-compliant. If users have Zawgyi as their system default, Unicode text won't render correctly. Additionally, some browsers on older devices lack proper Myanmar script support.

**How to avoid:**
1. **Always embed Unicode-compliant fonts** (don't rely on system fonts):
```css
@font-face {
  font-family: 'Myanmar';
  src: url('/fonts/NotoSansMyanmar-Regular.woff2') format('woff2');
  unicode-range: U+1000-109F, U+AA60-AA7F;
}

.font-myanmar {
  font-family: 'Myanmar', 'Padauk', 'Pyidaungsu', sans-serif;
}
```

2. **Use Noto Sans Myanmar or Padauk** - widely tested, proper Unicode support
3. **Test on actual Myanmar devices** - emulators may have different fonts installed
4. **Avoid Zawgyi-encoded content** in source files - use Unicode only

**Warning signs:**
- Burmese text appears as squares or question marks
- Characters appear in wrong order (medial vowels before consonants)
- Text looks "stacked" incorrectly
- Works on one device, broken on another

**Phase to address:**
Bilingual UX phase - foundational for Burmese display

---

### Pitfall 7: Spaced Repetition Algorithm Treats All Cards as Equally Difficult Initially

**What goes wrong:**
SM-2 and similar algorithms start all cards with the same ease factor (typically 2.5). This means "What is the capital of the United States?" gets the same initial schedule as "Name the 13 original colonies." Users waste time on easy questions while hard questions don't get enough repetition.

**Why it happens:**
Classic SRS algorithms were designed for vocabulary learning where initial difficulty is unknown. Civics questions have knowable difficulty based on complexity.

**How to avoid:**
1. **Pre-seed difficulty ratings** based on question complexity:
   - Simple factual (1 answer): ease 2.8
   - Multiple valid answers: ease 2.3
   - Historical dates/names: ease 2.0
   - Constitutional concepts: ease 1.8

2. **Track community difficulty**: After enough responses, adjust initial ease based on aggregate pass rate

3. **Consider FSRS over SM-2**: FSRS empirically outperforms SM-2 and better handles cards with pre-study history

**Warning signs:**
- Users complain about reviewing "obvious" questions too often
- Hard questions don't stabilize in memory despite many reviews
- Pass rates vary wildly between question categories

**Phase to address:**
Spaced Repetition phase

---

### Pitfall 8: PWA Service Worker Caches Stale Content Forever

**What goes wrong:**
Without proper cache invalidation, users see outdated civics content after updates. Worse, if the 2025 civics test questions change (as they did from the 2008 version), users study incorrect material.

**Why it happens:**
"Cache first" strategies are great for performance but terrible for frequently-updated content. Developers often implement caching without versioning.

**How to avoid:**
1. **Version your cache names**:
```typescript
const CACHE_VERSION = 'civics-v2.1';
const CACHE_NAME = `${CACHE_VERSION}-assets`;
```

2. **Implement "stale while revalidate" for questions**:
```typescript
// Return cached immediately, but fetch fresh in background
const cached = await caches.match(request);
const fetchPromise = fetch(request).then(response => {
  cache.put(request, response.clone());
  return response;
});
return cached || fetchPromise;
```

3. **Notify users of updates**:
```typescript
// In service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    clients.claim().then(() => {
      clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({ type: 'UPDATE_AVAILABLE' }));
      });
    })
  );
});
```

4. **Force cache clear for critical content** like civics questions

**Warning signs:**
- Users report "old" content after you've deployed updates
- Test questions don't match USCIS website
- "New version available" banner never appears
- Questions file timestamp is months old in network tab

**Phase to address:**
PWA phase

---

## Moderate Pitfalls

### Pitfall 9: Loose TypeScript Types Hide Runtime Errors

**What goes wrong:**
The codebase uses `any` types or overly permissive types. Bugs slip through that TypeScript should catch. Example: `Question.id` is typed as `number` but templates expect `string` for keys.

**Prevention:**
1. Enable strict mode in tsconfig: `"strict": true`
2. Ban `any` via ESLint: `"@typescript-eslint/no-explicit-any": "error"`
3. Use branded types for IDs: `type QuestionId = number & { __brand: 'QuestionId' }`

**Phase to address:**
Technical Debt / Foundation phase

---

### Pitfall 10: Monolithic Questions File Becomes Unmaintainable

**What goes wrong:**
All 128 civics questions in one file makes collaboration difficult, causes merge conflicts, and makes it hard to update individual questions or categories.

**Prevention:**
Split by category:
```
/src/data/questions/
  principles-of-democracy.ts
  system-of-government.ts
  rights-responsibilities.ts
  history-colonial.ts
  history-1800s.ts
  recent-history.ts
  symbols-holidays.ts
  index.ts  // aggregates all
```

**Phase to address:**
Technical Debt / Foundation phase

---

### Pitfall 11: No Test Framework Means Regressions Go Unnoticed

**What goes wrong:**
The shuffle fix, race condition fix, or any code change could break working features. Without tests, you only discover this in production.

**Prevention:**
1. Add Vitest for unit tests (fast, works with Vite/Next.js)
2. Add Playwright for E2E tests (test critical paths)
3. Critical tests:
   - Shuffle produces uniform distribution
   - Test session saves correctly
   - Navigation lock works
   - Bilingual content renders

**Phase to address:**
Technical Debt / Foundation phase

---

### Pitfall 12: Supabase Free Tier 7-Day Pause Kills Production PWA

**What goes wrong:**
Supabase free tier pauses projects after 7 days of inactivity. Users open the PWA, it tries to sync, Supabase is paused, sync fails silently.

**Prevention:**
1. **Set up a keep-alive cron job**:
```typescript
// Vercel cron job every 3 days
export const config = { schedule: '0 0 */3 * *' };
export default async function keepAlive() {
  await supabase.from('heartbeat').select('id').limit(1);
}
```

2. **Handle paused database gracefully**:
```typescript
try {
  await supabase.from('sessions').insert(data);
} catch (error) {
  if (error.message.includes('Project paused')) {
    saveToLocalStorage(data); // Queue for later
    showToast('Syncing paused. Your data is saved locally.');
  }
}
```

3. **Consider upgrading** for any production app with real users

**Phase to address:**
Infrastructure / PWA phase

---

### Pitfall 13: Social Features Expose User Privacy Without Consent

**What goes wrong:**
Leaderboards, study groups, or progress sharing reveal user activity. Immigrants may have reasons to keep their citizenship preparation private.

**Prevention:**
1. **Opt-in only**: No social visibility by default
2. **Anonymous option**: Allow participation without revealing identity
3. **Clear privacy notices** in both languages
4. **Data residency awareness**: Some users may have concerns about where data is stored

**Phase to address:**
Social Features phase

---

### Pitfall 14: Anxiety-Inducing UX for Test-Takers

**What goes wrong:**
Countdown timers, red "wrong" feedback, or competitive elements increase anxiety. For immigrants already stressed about their citizenship interview, this harms learning.

**Prevention:**
1. **Soft time display**: Show elapsed time, not countdown (or make countdown optional)
2. **Encouraging feedback**: "Good try! Here's the correct answer..." instead of harsh "WRONG"
3. **Progress celebration**: Celebrate streaks, not just perfection
4. **No public failure**: Never show others' scores unless explicitly requested
5. **Warm color palette**: Avoid harsh reds for errors; use gentle oranges or yellows

**Phase to address:**
UI Polish phase

---

### Pitfall 15: Language Switcher Uses Flags or English Labels

**What goes wrong:**
Using the Myanmar flag for Burmese language is politically complex (ethnic minorities). Using "Burmese" in English assumes users can read English to find their language.

**Prevention:**
1. **Always label languages in their own script**:
   - "English" and "မြန်မာ" (not "Burmese")
2. **No flags**: Too politically charged
3. **Consider showing both languages always** (which this app does - good!)
4. **Default to browser language detection**

**Phase to address:**
Bilingual UX phase

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| `any` types | Faster development | Runtime errors, lost refactoring confidence | Never in production code |
| Biased shuffle | Fewer lines of code | Non-uniform question distribution | Never for randomization |
| Optimistic save flag | Simpler state | Lost data, duplicate saves | Never for critical data |
| React Router in Next.js | Familiar API | 404s, PWA issues, no SSR | Only if committed to SPA-only mode |
| Single questions file | Easy to start | Merge conflicts, hard to update | Only for <20 questions |
| No tests | Ship faster initially | Regressions, fear of refactoring | Never past MVP |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Supabase + Offline | Assuming Supabase handles offline | Use IndexedDB + sync queue; Supabase is online-only |
| PWA + Next.js App Router | Using `next-pwa` (unmaintained) | Use Serwist or native service worker per Next.js docs |
| Speech Synthesis + Burmese | Assuming all browsers support Myanmar | Fallback to English; many TTS engines lack Myanmar |
| IndexedDB + iOS | Trusting data persists | Request persistent storage; design for eviction |
| Service Worker + Auth | Caching auth-gated content | Never cache auth responses; invalidate on logout |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| All questions in initial bundle | Large JS bundle, slow FCP | Dynamic import or static JSON fetch | Immediately visible in Lighthouse |
| Unoptimized Myanmar fonts | FOUT, large download | Subset to used glyphs, preload | Any user with slow connection |
| Re-rendering on every timer tick | Janky UI, battery drain | Memoize components, use refs for time | Noticeable on mid-range phones |
| Unbounded history state | Memory growth | Use replaceState | After ~50+ back attempts |
| Full test history in memory | App slows over time | Paginate, virtualize list | After ~100 tests |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Storing user data without consent notice | GDPR/privacy violation | Add clear consent flow, privacy policy |
| Exposing Supabase anon key in client | Expected for client apps, but... | Implement RLS policies properly |
| No rate limiting on save | Spam/abuse of free tier | Supabase edge functions with rate limit |
| Caching authenticated content | Leaking data between users | Never cache user-specific responses |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Countdown timer always visible | Increases test anxiety | Option to hide, or show elapsed time |
| Red/green only for right/wrong | Colorblind inaccessible | Add icons, use colorblind-friendly palette |
| English-only error messages | Burmese users confused | Bilingual for ALL user-facing text |
| Small tap targets | Frustration on mobile | Min 44x44px per WCAG |
| Auto-advancing too fast | Can't read Burmese answer | Add pause, or let user control advance |

---

## "Looks Done But Isn't" Checklist

- [ ] **Shuffle**: Tested for uniform distribution (run 10,000 iterations, check variance)
- [ ] **Offline mode**: Tested in airplane mode, not just DevTools throttling
- [ ] **PWA install**: Tested on actual iOS (not just simulator)
- [ ] **Burmese fonts**: Tested on devices without Noto Sans installed
- [ ] **Service worker update**: Tested by deploying update, verifying users get it
- [ ] **Test save**: Tested with network failure mid-save
- [ ] **Navigation lock**: Tested in Safari, Firefox, not just Chrome
- [ ] **Speech synthesis**: Tested in Safari (different API behaviors)
- [ ] **Dark mode**: Tested all screens, especially with Myanmar text

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Biased shuffle already shipped | LOW | Fix algorithm, no data migration needed |
| Lost test sessions | MEDIUM | Add local backup, attempt recovery from IndexedDB |
| React Router refresh 404s | MEDIUM | Add catch-all route as stopgap, plan migration |
| PWA caching stale content | MEDIUM | Version cache, force refresh on next load |
| Burmese font failures | LOW | Add font fallback chain, embed fonts |
| iOS data eviction | HIGH | Cannot recover purged data; implement cloud sync |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Biased shuffle | Technical Debt (Phase 1) | Unit test with chi-square test for uniformity |
| Race condition save | Technical Debt (Phase 1) | Integration test with simulated network failure |
| history.pushState leak | Technical Debt (Phase 1) | Memory profiling in Chrome DevTools |
| React Router 404s | PWA (Phase 2) | E2E test: refresh on /test route works |
| iOS data eviction | PWA (Phase 2) | Manual test on iPhone after 7+ days |
| Burmese font rendering | Bilingual UX (Phase 3) | Visual regression test on BrowserStack |
| SM-2 initial difficulty | Spaced Repetition (Phase 4) | Analytics showing difficulty calibration |
| Service worker stale cache | PWA (Phase 2) | Deploy update, verify users receive it |
| Supabase pause | Infrastructure (Phase 1/2) | Uptime monitoring |
| Social privacy | Social Features (Phase 5) | Security review, consent flow test |
| Anxiety-inducing UX | UI Polish (Phase 6) | User testing with target demographic |
| Loose TypeScript | Technical Debt (Phase 1) | `tsc --strict` passes |
| Monolithic questions | Technical Debt (Phase 1) | File split complete |
| No test framework | Technical Debt (Phase 1) | CI runs test suite |

---

## Sources

**PWA & Next.js:**
- [Next.js PWA Guide](https://nextjs.org/docs/app/guides/progressive-web-apps) - Official documentation (HIGH confidence)
- [LogRocket: Next.js 16 PWA with Offline Support](https://blog.logrocket.com/nextjs-16-pwa-offline-support) - Shallow offline pitfalls (MEDIUM confidence)
- [Safari/iOS PWA Limitations](https://vinova.sg/navigating-safari-ios-pwa-limitations/) - iOS-specific issues (MEDIUM confidence)

**Spaced Repetition:**
- [SM-2 Algorithm Explained](https://tegaru.app/en/blog/sm2-algorithm-explained) - Algorithm details (MEDIUM confidence)
- [Overdue Handling in SM-2](https://controlaltbackspace.org/overdue-handling/) - Known flaws (MEDIUM confidence)
- [FSRS Algorithm](https://www.quizcat.ai/blog/fsrs-algorithm-next-gen-spaced-repetition) - Modern alternative (MEDIUM confidence)

**Bilingual/Myanmar:**
- [Myanmar Unicode Guide for Web Developers](https://thanlwinsoft.github.io/www.thanlwinsoft.org/ThanLwinSoft/MyanmarUnicode/WebDevelopers/) - Authoritative (HIGH confidence)
- [Burmese Font Issues - Localization Lab](https://www.localizationlab.org/blog/2019/3/25/burmese-font-issues-have-real-world-consequences-for-at-risk-users) - Real-world impact (HIGH confidence)
- [Bilingual UI/UX Mistakes - Freezil](https://freezil.com/the-biggest-mistakes-in-bilingual-ui-ux-design/) - Design pitfalls (MEDIUM confidence)

**Social/Educational:**
- [Education App Development Challenges 2026](https://www.appverticals.com/blog/education-app-development-challenges/) - Current trends (MEDIUM confidence)
- [Bridging Digital Accessibility Gap for Immigrants](https://pressbooks.pub/alttexts2025/chapter/bridging-the-digital-accessibility-gap/) - UDL guidance (HIGH confidence)

**React Router + Next.js:**
- [Colin Hacks: React Router in Next.js](https://colinhacks.com/essays/building-a-spa-with-nextjs) - Why and how (MEDIUM confidence)
- [Vercel: Common Next.js App Router Mistakes](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them) - Official (HIGH confidence)

**History API:**
- [MDN: History pushState](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState) - Official (HIGH confidence)
- [Mozilla Bug: Rate-limiting pushState](https://bugzilla.mozilla.org/show_bug.cgi?id=1246773) - Memory issues (HIGH confidence)

**Supabase:**
- [Supabase Pricing 2026](https://www.metacto.com/blogs/the-true-cost-of-supabase-a-comprehensive-guide-to-pricing-integration-and-maintenance) - Free tier limits (MEDIUM confidence)
- [PowerSync for Supabase Offline](https://www.powersync.com/blog/bringing-offline-first-to-supabase) - Offline solutions (MEDIUM confidence)

---
*Pitfalls research for: Bilingual Civics Test Prep PWA*
*Researched: 2026-02-05*
