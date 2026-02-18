'use client';

/**
 * ResumePromptModal - Non-dismissible modal for resuming saved sessions.
 *
 * Shows saved session cards and three action buttons: Resume, Start Fresh,
 * and Not Now. Cannot be closed via backdrop click, Escape key, or X button.
 * User must choose one of the three actions.
 *
 * Features:
 * - Non-dismissible (onInteractOutside + onEscapeKeyDown prevented)
 * - Session cards with type-specific visual treatment
 * - Multiple sessions: selectable stacked cards
 * - Start Fresh triggers inline confirmation before discarding
 * - Resume shows brief loading state before callback
 * - Full keyboard navigation with focus trap (Radix Dialog)
 * - Bilingual text follows language mode
 */

import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { ResumeSessionCard } from '@/components/sessions/ResumeSessionCard';
import { StartFreshConfirm } from '@/components/sessions/StartFreshConfirm';
import type { SessionSnapshot } from '@/lib/sessions/sessionTypes';

// ---------------------------------------------------------------------------
// Bilingual strings
// ---------------------------------------------------------------------------

const TEXT = {
  title: {
    en: 'Welcome back!',
    my: 'ပြန်လာတာ ကြိုဆိုပါတယ်!',
  },
  subtitle: {
    en: 'Pick up where you left off',
    my: 'ရပ်ထားတဲ့နေရာကနေ ဆက်လက်ဖြေဆိုပါ',
  },
  resume: {
    en: 'Resume',
    my: 'ဆက်ဖြေမယ်',
  },
  resuming: {
    en: 'Resuming...',
    my: 'ပြန်ဖွင့်နေပါသည်...',
  },
  startFresh: {
    en: 'Start Fresh',
    my: 'အသစ်ဖြေမယ်',
  },
  notNow: {
    en: 'Not Now',
    my: 'နောက်မှ',
  },
  selectSession: {
    en: 'Select a session to continue',
    my: 'ဆက်လက်ဖြေဆိုရန် ရွေးချယ်ပါ။',
  },
} as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ResumePromptModalProps {
  sessions: SessionSnapshot[];
  open: boolean;
  onResume: (session: SessionSnapshot) => void;
  onStartFresh: (session: SessionSnapshot) => void;
  onNotNow: () => void;
}

export function ResumePromptModal({
  sessions,
  open,
  onResume,
  onStartFresh,
  onNotNow,
}: ResumePromptModalProps) {
  const { showBurmese } = useLanguage();

  // Selected session ID (auto-selected when single session)
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    sessions.length === 1 ? sessions[0].id : null
  );

  // Inline confirmation state
  const [confirmingFresh, setConfirmingFresh] = useState(false);

  // Loading state for resume
  const [resuming, setResuming] = useState(false);

  const selectedSession = sessions.find(s => s.id === selectedId) ?? null;
  const hasMultiple = sessions.length > 1;

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleResume = useCallback(() => {
    if (!selectedSession || resuming) return;
    setResuming(true);
    // Brief loading animation before calling onResume
    setTimeout(() => {
      onResume(selectedSession);
    }, 600);
  }, [selectedSession, resuming, onResume]);

  const handleStartFreshClick = useCallback(() => {
    if (!selectedSession) return;
    setConfirmingFresh(true);
  }, [selectedSession]);

  const handleStartFreshConfirm = useCallback(() => {
    if (!selectedSession) return;
    onStartFresh(selectedSession);
  }, [selectedSession, onStartFresh]);

  const handleStartFreshCancel = useCallback(() => {
    setConfirmingFresh(false);
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        showCloseButton={false}
        onInteractOutside={e => e.preventDefault()}
        onEscapeKeyDown={e => e.preventDefault()}
      >
        {/* Title */}
        <DialogTitle className="text-center text-xl">
          {TEXT.title.en}
          {showBurmese && (
            <span className="mt-0.5 block font-myanmar text-base font-semibold text-foreground/70">
              {TEXT.title.my}
            </span>
          )}
        </DialogTitle>

        {/* Subtitle */}
        <DialogDescription className="text-center">
          {TEXT.subtitle.en}
          {showBurmese && (
            <span className="mt-0.5 block font-myanmar text-xs text-muted-foreground/80">
              {TEXT.subtitle.my}
            </span>
          )}
        </DialogDescription>

        {/* Session cards */}
        <div className="mt-4 space-y-3">
          {sessions.map(session => (
            <ResumeSessionCard
              key={session.id}
              session={session}
              isSelected={session.id === selectedId}
              onSelect={hasMultiple ? () => setSelectedId(session.id) : undefined}
            />
          ))}
        </div>

        {/* Selection prompt for multiple sessions */}
        {hasMultiple && !selectedId && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {showBurmese ? TEXT.selectSession.my : TEXT.selectSession.en}
          </p>
        )}

        {/* Action buttons / confirmation */}
        <div className="mt-5">
          <AnimatePresence mode="wait">
            {confirmingFresh ? (
              <StartFreshConfirm
                key="confirm"
                onConfirm={handleStartFreshConfirm}
                onCancel={handleStartFreshCancel}
              />
            ) : (
              <motion.div
                key="actions"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-2"
              >
                {/* Resume button (primary, auto-focused) */}
                <button
                  type="button"
                  autoFocus
                  onClick={handleResume}
                  disabled={!selectedSession || resuming}
                  className={clsx(
                    'flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3',
                    'text-base font-bold shadow-chunky transition-all',
                    'bg-primary text-primary-foreground',
                    'hover:bg-primary-hover active:shadow-chunky-active active:translate-y-0.5',
                    'disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
                  )}
                >
                  {resuming ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className={showBurmese ? 'font-myanmar' : ''}>
                        {showBurmese ? TEXT.resuming.my : TEXT.resuming.en}
                      </span>
                    </>
                  ) : (
                    <span className={showBurmese ? 'font-myanmar' : ''}>
                      {showBurmese ? TEXT.resume.my : TEXT.resume.en}
                    </span>
                  )}
                </button>

                {/* Start Fresh + Not Now row */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleStartFreshClick}
                    disabled={!selectedSession || resuming}
                    className={clsx(
                      'flex-1 rounded-xl border border-border px-4 py-2.5',
                      'text-sm font-semibold text-foreground transition-colors',
                      'hover:bg-muted',
                      'disabled:cursor-not-allowed disabled:opacity-50',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
                    )}
                  >
                    <span className={showBurmese ? 'font-myanmar' : ''}>
                      {showBurmese ? TEXT.startFresh.my : TEXT.startFresh.en}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={onNotNow}
                    disabled={resuming}
                    className={clsx(
                      'flex-1 rounded-xl px-4 py-2.5',
                      'text-sm font-medium text-muted-foreground transition-colors',
                      'hover:text-foreground hover:bg-muted/50',
                      'disabled:cursor-not-allowed disabled:opacity-50',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
                    )}
                  >
                    <span className={showBurmese ? 'font-myanmar' : ''}>
                      {showBurmese ? TEXT.notNow.my : TEXT.notNow.en}
                    </span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
