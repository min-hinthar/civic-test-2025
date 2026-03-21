import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SyncStatusIndicator } from '@/components/pwa/SyncStatusIndicator';

// Mock OfflineContext hook
vi.mock('@/contexts/OfflineContext', () => ({
  useOffline: () => ({
    pendingSyncCount: 3,
    isSyncing: true,
    syncFailed: false,
  }),
}));

describe('SyncStatusIndicator accessibility', () => {
  it('has no a11y violations when syncing', async () => {
    const { container } = render(<SyncStatusIndicator />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has role="status" and descriptive aria-label', () => {
    const { container } = render(<SyncStatusIndicator />);

    const status = container.querySelector('[role="status"]');
    expect(status).toBeTruthy();
    expect(status?.getAttribute('aria-label')).toBe('3 items syncing');
  });

  it('icons are hidden from screen readers', () => {
    const { container } = render(<SyncStatusIndicator />);

    const hiddenIcons = container.querySelectorAll('[aria-hidden="true"]');
    expect(hiddenIcons.length).toBeGreaterThan(0);
  });
});

describe('SyncStatusIndicator accessibility (failed state)', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('has no a11y violations when sync failed', async () => {
    // Re-mock with failed state
    vi.doMock('@/contexts/OfflineContext', () => ({
      useOffline: () => ({
        pendingSyncCount: 2,
        isSyncing: false,
        syncFailed: true,
      }),
    }));

    const { SyncStatusIndicator: FailedIndicator } = await import(
      '@/components/pwa/SyncStatusIndicator'
    );
    const { container } = render(<FailedIndicator />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
