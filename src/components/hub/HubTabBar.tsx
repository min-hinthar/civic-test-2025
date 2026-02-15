'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { strings } from '@/lib/i18n/strings';
import { PillTabBar } from '@/components/ui/PillTabBar';
import type { PillTab } from '@/components/ui/PillTabBar';

interface HubTabBarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const HUB_TABS: PillTab[] = [
  { id: 'overview', label: strings.hub.overview.en, labelMy: strings.hub.overview.my },
  { id: 'history', label: strings.hub.history.en, labelMy: strings.hub.history.my },
  { id: 'achievements', label: strings.hub.achievements.en, labelMy: strings.hub.achievements.my },
];

/**
 * Hub tab bar — thin wrapper around PillTabBar with hub-specific tabs.
 *
 * Uses the generic PillTabBar with spring-animated sliding pill indicator.
 * Sticky positioned so users can always switch tabs.
 */
export function HubTabBar({ activeTab, onTabChange }: HubTabBarProps) {
  const { showBurmese } = useLanguage();

  return (
    <PillTabBar
      tabs={HUB_TABS}
      activeTab={activeTab}
      onTabChange={onTabChange}
      ariaLabel="Hub tabs"
      showBurmese={showBurmese}
      sticky
    />
  );
}
