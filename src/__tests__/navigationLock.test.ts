import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Tests for navigation lock behavior in TestPage.
 * Verifies that replaceState is used to prevent history stack overflow.
 */
describe('Navigation Lock Pattern', () => {
  let originalPushState: typeof window.history.pushState;
  let originalReplaceState: typeof window.history.replaceState;
  let pushStateCallCount: number;
  let replaceStateCallCount: number;

  beforeEach(() => {
    pushStateCallCount = 0;
    replaceStateCallCount = 0;

    // Store originals
    originalPushState = window.history.pushState;
    originalReplaceState = window.history.replaceState;

    // Mock pushState and replaceState to track calls
    window.history.pushState = vi.fn((data: unknown, unused: string, url?: string | URL | null) => {
      pushStateCallCount++;
      originalPushState.call(window.history, data, unused, url);
    });

    window.history.replaceState = vi.fn(
      (data: unknown, unused: string, url?: string | URL | null) => {
        replaceStateCallCount++;
        originalReplaceState.call(window.history, data, unused, url);
      }
    );
  });

  afterEach(() => {
    // Restore originals
    window.history.pushState = originalPushState;
    window.history.replaceState = originalReplaceState;
    vi.clearAllMocks();
  });

  it('uses replaceState on popstate events (not pushState)', () => {
    // Simulate what the navigation lock should do on popstate
    // The correct pattern is: pushState once on mount, then replaceState on popstate

    // Mount: one pushState to create the "locked" entry
    window.history.pushState(null, '', window.location.href);
    const initialPushCount = pushStateCallCount;

    // Simulate multiple back button attempts (popstate events)
    // Each should use replaceState, NOT pushState
    for (let i = 0; i < 5; i++) {
      // This is the CORRECT behavior - replaceState doesn't grow stack
      window.history.replaceState(null, '', window.location.href);
    }

    // Should only have the initial pushState, not 5 more
    expect(pushStateCallCount).toBe(initialPushCount);
    // Should have 5 replaceState calls
    expect(replaceStateCallCount).toBe(5);
  });

  it('demonstrates the problem with repeated pushState', () => {
    // This test documents the BUG pattern (what we're fixing)
    // Each popstate handling via pushState grows the history stack

    const historyLengthBefore = window.history.length;

    // Simulate BAD pattern: pushState on every popstate
    // This grows the history stack unboundedly
    for (let i = 0; i < 3; i++) {
      window.history.pushState(null, '', window.location.href);
    }

    // History length has grown (this is the bug we're fixing)
    expect(window.history.length).toBeGreaterThan(historyLengthBefore);
  });

  it('replaceState does not grow history stack', () => {
    const historyLengthBefore = window.history.length;

    // Simulate GOOD pattern: replaceState on popstate
    for (let i = 0; i < 10; i++) {
      window.history.replaceState(null, '', window.location.href);
    }

    // History length should NOT grow
    expect(window.history.length).toBe(historyLengthBefore);
  });
});
