'use client';

import { motion } from 'motion/react';
import clsx from 'clsx';
import { useLanguage } from '@/contexts/LanguageContext';
import { strings } from '@/lib/i18n/strings';
import { SPRING_SNAPPY } from '@/lib/motion-config';

/** Tab definition with bilingual labels */
interface HubTab {
  id: string;
  label: string;
  labelMy: string;
}

const HUB_TABS: HubTab[] = [
  { id: 'overview', label: strings.hub.overview.en, labelMy: strings.hub.overview.my },
  { id: 'history', label: strings.hub.history.en, labelMy: strings.hub.history.my },
  { id: 'achievements', label: strings.hub.achievements.en, labelMy: strings.hub.achievements.my },
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
  const activeIndex = Math.max(
    0,
    HUB_TABS.findIndex(t => t.id === activeTab)
  );

  return (
    <div className="sticky top-0 z-20 -mx-4 mb-6 px-4 pt-2 pb-0">
      <nav
        className="rounded-2xl border border-border/40 bg-surface/80 p-1 backdrop-blur-lg"
        role="tablist"
        aria-label="Hub tabs"
      >
        <div className="relative grid grid-cols-3">
          {/* Sliding pill — fixed width (1 grid cell), translateX by own width */}
          <motion.div
            className="absolute inset-y-0 rounded-xl bg-primary/10 dark:bg-primary/20 shadow-sm"
            style={{ width: `${100 / HUB_TABS.length}%` }}
            animate={{ x: `${activeIndex * 100}%` }}
            transition={SPRING_SNAPPY}
          />
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
                  'relative z-10 flex min-h-[44px] flex-col items-center justify-center rounded-xl px-2 py-2 text-sm font-medium transition-colors duration-200',
                  isActive ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
                )}
              >
                <motion.span
                  className="leading-tight"
                  animate={{ scale: isActive ? 1.05 : 1 }}
                  transition={SPRING_SNAPPY}
                >
                  {tab.label}
                </motion.span>
                {showBurmese && (
                  <motion.span
                    className="font-myanmar mt-0.5 text-[10px] leading-tight opacity-70"
                    animate={{ scale: isActive ? 1.05 : 1 }}
                    transition={SPRING_SNAPPY}
                  >
                    {tab.labelMy}
                  </motion.span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
