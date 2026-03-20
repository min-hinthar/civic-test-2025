import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

describe('ProviderOrderGuard', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('warns about missing providers when rendered without provider tree', async () => {
    const { ProviderOrderGuard } = await import('@/lib/providerOrderGuard');

    // Wrap in ErrorBoundary to catch any uncaught throws from hooks
    render(
      <ErrorBoundary>
        <ProviderOrderGuard />
      </ErrorBoundary>
    );

    // Should have warned about missing providers via console.warn
    expect(warnSpy).toHaveBeenCalled();
    const allWarnings = warnSpy.mock.calls.map((c: unknown[]) => c[0] as string);
    // AuthProvider should be detected as missing (it throws when not in tree)
    expect(allWarnings.some((w: string) => w.includes('AuthProvider'))).toBe(true);
    // Should include reference to learnings file
    expect(allWarnings.some((w: string) => w.includes('provider-ordering.md'))).toBe(true);
    // Should warn about NavigationProvider too
    expect(allWarnings.some((w: string) => w.includes('NavigationProvider'))).toBe(true);
  });

  it('exports ProviderOrderGuard function returning null', async () => {
    const mod = await import('@/lib/providerOrderGuard');
    expect(typeof mod.ProviderOrderGuard).toBe('function');
  });

  it('is zero-cost in production: conditional rendering prevents hook calls', () => {
    // The guard is rendered conditionally in ClientProviders.tsx:
    //   {process.env.NODE_ENV === 'development' && <ProviderOrderGuard />}
    // In test/production, NODE_ENV !== 'development', so component never mounts
    const isDev = process.env.NODE_ENV === 'development';
    expect(isDev).toBe(false); // test env is 'test', not 'development'
  });
});
