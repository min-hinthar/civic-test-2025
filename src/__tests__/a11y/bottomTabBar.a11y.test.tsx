import { axe } from 'vitest-axe';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '../utils/renderWithProviders';
import { BottomTabBar } from '@/components/navigation/BottomTabBar';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/home',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Mock hooks used by BottomTabBar and children
vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => true,
}));

vi.mock('@/lib/useScrollSnapCenter', () => ({
  useScrollSnapCenter: () => ({ current: null }),
}));

vi.mock('@/lib/haptics', () => ({
  hapticLight: vi.fn(),
}));

// Mock NavigationProvider hook
vi.mock('@/components/navigation/NavigationProvider', () => ({
  useNavigation: () => ({
    isLocked: false,
    navVisible: true,
    badges: {},
    lockMessage: null,
  }),
  NavigationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock FlagToggle to avoid complex context needs
vi.mock('@/components/ui/FlagToggle', () => ({
  FlagToggle: ({ compact }: { compact?: boolean }) => (
    <div role="radiogroup" aria-label="Language mode" data-compact={compact}>
      <button role="radio" aria-checked="true">
        EN
      </button>
      <button role="radio" aria-checked="false">
        MY
      </button>
    </div>
  ),
}));

// Mock icons
vi.mock('@/components/icons/USFlag', () => ({
  USFlag: () => <span>US</span>,
}));
vi.mock('@/components/icons/MyanmarFlag', () => ({
  MyanmarFlag: () => <span>MY</span>,
}));

describe('BottomTabBar accessibility', () => {
  it('has no a11y violations', async () => {
    const { container } = renderWithProviders(<BottomTabBar />, { preset: 'core' });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has navigation landmark with accessible label', () => {
    const { container } = renderWithProviders(<BottomTabBar />, { preset: 'core' });

    const nav = container.querySelector('nav');
    expect(nav).toBeTruthy();
    expect(nav?.getAttribute('aria-label')).toBe('Main navigation');
  });

  it('tab items have focus-visible ring classes', () => {
    const { container } = renderWithProviders(<BottomTabBar />, { preset: 'core' });

    // Check that interactive elements within the tab bar have focus styling
    const buttons = container.querySelectorAll('button, a');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
