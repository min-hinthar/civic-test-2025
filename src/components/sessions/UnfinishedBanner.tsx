'use client';

/**
 * UnfinishedBanner -- Amber banner cards for unfinished sessions.
 *
 * Shows one card per unfinished session on the Dashboard. Each card displays:
 * - Session type icon (ClipboardCheck, BookOpen, or Mic)
 * - Bilingual session type name + relative timestamp
 * - Dismiss button (per-visit only, not persisted)
 * - Click navigates to the relevant page
 *
 * Uses motion/react for slide-in entrance and slide-out exit animations.
 */

import { AnimatePresence, motion } from 'motion/react';
import { BookOpen, ClipboardCheck, Clock, Layers, Mic, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useLanguage } from '@/contexts/LanguageContext';
import { timeAgo } from '@/lib/sessions/timeAgo';
import type { SessionSnapshot } from '@/lib/sessions/sessionTypes';

interface UnfinishedBannerProps {
  sessions: SessionSnapshot[];
  onDismiss: (sessionId: string) => void;
}

/** Map session type to icon component */
function getSessionIcon(type: SessionSnapshot['type']) {
  switch (type) {
    case 'mock-test':
      return ClipboardCheck;
    case 'practice':
      return BookOpen;
    case 'interview':
      return Mic;
    case 'sort':
      return Layers;
  }
}

/** Map session type to bilingual label */
function getSessionLabel(type: SessionSnapshot['type']): { en: string; my: string } {
  switch (type) {
    case 'mock-test':
      return {
        en: 'Unfinished Mock Test',
        my: 'မပြီးသေးတဲ့ စမ်းသပ်စာမေးပွဲ',
      };
    case 'practice':
      return {
        en: 'Unfinished Practice',
        my: 'မပြီးသေးတဲ့ လေ့ကျင့်ခန်း',
      };
    case 'interview':
      return {
        en: 'Unfinished Interview',
        my: 'မပြီးသေးတဲ့ အင်တာဗျူး',
      };
    case 'sort':
      return {
        en: 'Unfinished Flashcard Sort',
        my: 'မပြီးသေးတဲ့ ကဒ်စီစုံ',
      };
  }
}

/** Map session type to navigation path */
function getSessionRoute(type: SessionSnapshot['type']): string {
  switch (type) {
    case 'mock-test':
      return '/test';
    case 'practice':
      return '/practice';
    case 'interview':
      return '/interview';
    case 'sort':
      return '/sort';
  }
}

export function UnfinishedBanner({ sessions, onDismiss }: UnfinishedBannerProps) {
  const navigate = useNavigate();
  const { showBurmese } = useLanguage();

  const handleCardClick = (session: SessionSnapshot) => {
    try {
      navigator.vibrate?.(10);
    } catch {
      // Vibration API not available
    }
    navigate(getSessionRoute(session.type));
  };

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence mode="popLayout">
        {sessions.map(session => {
          const Icon = getSessionIcon(session.type);
          const label = getSessionLabel(session.type);
          const relative = timeAgo(session.savedAt);

          return (
            <motion.div
              key={session.id}
              layout
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              onClick={() => handleCardClick(session)}
              className="relative cursor-pointer rounded-2xl border border-warning/30 bg-warning-subtle/10 p-4 transition-colors hover:bg-warning-subtle/20"
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCardClick(session);
                }
              }}
            >
              <div className="flex items-center gap-3">
                {/* Icon */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/10">
                  <Icon className="h-5 w-5 text-warning" strokeWidth={2} />
                </div>

                {/* Text */}
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-medium text-foreground ${showBurmese ? 'font-myanmar' : ''}`}
                  >
                    {showBurmese ? label.my : label.en}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" strokeWidth={2} />
                    <span className={showBurmese ? 'font-myanmar' : ''}>
                      {showBurmese ? relative.my : relative.en}
                    </span>
                  </p>
                </div>

                {/* Dismiss button */}
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    onDismiss(session.id);
                  }}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-warning/20 hover:text-foreground"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
