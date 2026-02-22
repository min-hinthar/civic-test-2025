import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('installHistoryGuard', () => {
  let originalPushState: typeof window.history.pushState;
  let originalReplaceState: typeof window.history.replaceState;

  beforeEach(() => {
    originalPushState = window.history.pushState;
    originalReplaceState = window.history.replaceState;
  });

  afterEach(() => {
    window.history.pushState = originalPushState;
    window.history.replaceState = originalReplaceState;
    vi.resetModules();
  });

  it('catches SecurityError from replaceState', async () => {
    // Simulate Safari rate-limit error
    window.history.replaceState = vi.fn(() => {
      const error = new DOMException('Rate limit exceeded', 'SecurityError');
      throw error;
    });

    // Dynamic import to get a fresh module (installed = false)
    const { installHistoryGuard } = await import('./historyGuard');
    installHistoryGuard();

    // Should NOT throw
    expect(() => {
      window.history.replaceState(null, '', '/');
    }).not.toThrow();
  });

  it('catches SecurityError from pushState', async () => {
    window.history.pushState = vi.fn(() => {
      const error = new DOMException('Rate limit exceeded', 'SecurityError');
      throw error;
    });

    const { installHistoryGuard } = await import('./historyGuard');
    installHistoryGuard();

    expect(() => {
      window.history.pushState(null, '', '/');
    }).not.toThrow();
  });

  it('re-throws non-SecurityError exceptions', async () => {
    window.history.replaceState = vi.fn(() => {
      throw new TypeError('not a security error');
    });

    const { installHistoryGuard } = await import('./historyGuard');
    installHistoryGuard();

    expect(() => {
      window.history.replaceState(null, '', '/');
    }).toThrow(TypeError);
  });
});
