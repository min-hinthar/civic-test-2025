'use client';

import { motion } from 'motion/react';
import clsx from 'clsx';
import { useLanguage } from '@/contexts/LanguageContext';

/** Tab definition with bilingual labels */
interface HubTab {
  id: string;
  label: string;
  labelMy: string;
}

const HUB_TABS: HubTab[] = [
  { id: 'overview', label: 'Overview', labelMy: '\u1021\u1001\u103C\u1031\u1021\u1014\u1031' },
  { id: 'history', label: 'History', labelMy: '\u1019\u103E\u1010\u103A\u1010\u1019\u103A\u1038' },
  {
    id: 'achievements',
    label: 'Achievements',
    labelMy:
      '\u1021\u1031\u102C\u1004\u103A\u1019\u103C\u1004\u103A\u1019\u103E\u102F\u1019\u103B\u102C\u1038',
  },
];

interface HubTabBarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

/**
 * Premium tab bar with bilingual labels and spring-animated pill indicator.
 *
 * Uses motion/react layoutId for smooth spring-physics pill animation
 * between tabs. Sticky positioned so users can always switch tabs.
 * Minimum 44px touch target for mobile accessibility.
 */
export function HubTabBar({ activeTab, onTabChange }: HubTabBarProps) {
  const { showBurmese } = useLanguage();

  return (
    <div className="sticky top-0 z-20 -mx-4 mb-6 px-4 pt-2 pb-0">
      <nav
        className="flex gap-1 rounded-2xl border border-border/40 bg-surface/80 p-1 backdrop-blur-lg"
        role="tablist"
        aria-label="Progress Hub tabs"
      >
        {HUB_TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`hub-tabpanel-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={clsx(
                'relative flex min-h-[44px] flex-1 flex-col items-center justify-center rounded-xl px-2 py-2 text-sm font-medium transition-colors duration-200',
                isActive ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="hub-tab-indicator"
                  className="absolute inset-0 rounded-xl bg-primary/10 shadow-sm"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <span className="relative z-10 leading-tight">{tab.label}</span>
              {showBurmese && (
                <span className="font-myanmar relative z-10 mt-0.5 text-[10px] leading-tight opacity-70">
                  {tab.labelMy}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
