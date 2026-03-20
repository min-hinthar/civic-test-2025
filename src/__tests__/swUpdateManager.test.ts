import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createSWUpdateManager } from '@/lib/pwa/swUpdateManager';

// Mock sentry to avoid @sentry/nextjs import issues in test
vi.mock('@/lib/sentry', () => ({
  captureError: vi.fn(),
}));

describe('swUpdateManager', () => {
  // Mock navigator.serviceWorker
  let controllerChangeListeners: Array<() => void>;
  let mockRegistration: {
    waiting: ServiceWorker | null;
    installing: ServiceWorker | null;
    addEventListener: ReturnType<typeof vi.fn>;
  };
  let mockServiceWorker: {
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
    getRegistration: ReturnType<typeof vi.fn>;
    controller: ServiceWorker | null;
  };

  beforeEach(() => {
    controllerChangeListeners = [];
    mockRegistration = {
      waiting: null,
      installing: null,
      addEventListener: vi.fn(),
    };
    mockServiceWorker = {
      addEventListener: vi.fn((event: string, handler: () => void) => {
        if (event === 'controllerchange') {
          controllerChangeListeners.push(handler);
        }
      }),
      removeEventListener: vi.fn(),
      getRegistration: vi.fn().mockResolvedValue(mockRegistration),
      controller: {} as ServiceWorker,
    };

    Object.defineProperty(navigator, 'serviceWorker', {
      value: mockServiceWorker,
      writable: true,
      configurable: true,
    });

    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
      configurable: true,
    });

    // Mock window.location.reload
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload: vi.fn() },
      writable: true,
      configurable: true,
    });

    // Mock history.state
    Object.defineProperty(window.history, 'state', {
      value: null,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('registers controllerchange listener on init', () => {
    const manager = createSWUpdateManager();
    const callback = vi.fn();

    manager.init(callback);

    expect(mockServiceWorker.addEventListener).toHaveBeenCalledWith(
      'controllerchange',
      expect.any(Function)
    );

    manager.destroy();
  });

  it('calls onUpdateAvailable when controllerchange fires and session is NOT locked', () => {
    const manager = createSWUpdateManager();
    const callback = vi.fn();

    manager.init(callback);

    // Fire controllerchange
    controllerChangeListeners.forEach(handler => handler());

    expect(callback).toHaveBeenCalledTimes(1);
    expect(manager.getState().updateAvailable).toBe(true);
    expect(manager.getState().deferred).toBe(false);

    manager.destroy();
  });

  it('defers update when session IS locked via setSessionLocked', () => {
    const manager = createSWUpdateManager();
    const callback = vi.fn();

    manager.init(callback);
    manager.setSessionLocked(true);

    // Fire controllerchange
    controllerChangeListeners.forEach(handler => handler());

    expect(callback).not.toHaveBeenCalled();
    expect(manager.getState().updateAvailable).toBe(true);
    expect(manager.getState().deferred).toBe(true);

    manager.destroy();
  });

  it('fires deferred update when setSessionLocked(false) is called', () => {
    const manager = createSWUpdateManager();
    const callback = vi.fn();

    manager.init(callback);
    manager.setSessionLocked(true);

    // Fire controllerchange while locked
    controllerChangeListeners.forEach(handler => handler());
    expect(callback).not.toHaveBeenCalled();

    // Unlock session
    manager.setSessionLocked(false);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(manager.getState().deferred).toBe(false);

    manager.destroy();
  });

  it('calls location.reload() when acceptUpdate is called and online', () => {
    const manager = createSWUpdateManager();

    manager.acceptUpdate();

    expect(window.location.reload).toHaveBeenCalledTimes(1);

    manager.destroy();
  });

  it('does NOT reload when acceptUpdate is called offline', () => {
    const manager = createSWUpdateManager();

    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true,
      configurable: true,
    });

    manager.acceptUpdate();

    expect(window.location.reload).not.toHaveBeenCalled();

    manager.destroy();
  });

  it('detects history.state interviewGuard as session locked', () => {
    const manager = createSWUpdateManager();
    const callback = vi.fn();

    // Set history.state to have interviewGuard
    Object.defineProperty(window.history, 'state', {
      value: { interviewGuard: true },
      writable: true,
      configurable: true,
    });

    manager.init(callback);

    // Fire controllerchange -- should be deferred because interviewGuard is active
    controllerChangeListeners.forEach(handler => handler());

    expect(callback).not.toHaveBeenCalled();
    expect(manager.getState().deferred).toBe(true);

    manager.destroy();
  });
});
