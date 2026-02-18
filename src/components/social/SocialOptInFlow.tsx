'use client';

/**
 * Social Opt-In Flow - Multi-step dialog for enabling social features.
 *
 * Three-step flow inside a single Radix Dialog:
 * 1. Privacy Notice - explains what's shared and how to withdraw
 * 2. Display Name Setup - user picks a leaderboard name
 * 3. Confirm - summary and enable button
 *
 * Bilingual (English + Burmese) throughout.
 * Uses AnimatePresence for smooth step transitions.
 */

import React, { useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, Shield, User } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSocial } from '@/contexts/SocialContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SocialOptInFlowProps {
  open: boolean;
  onComplete: () => void;
  onCancel: () => void;
}

// ---------------------------------------------------------------------------
// Animation variants for step transitions
// ---------------------------------------------------------------------------

const stepVariants = {
  enter: { opacity: 0, x: 30 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

const stepTransition = {
  type: 'tween' as const,
  duration: 0.2,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SocialOptInFlow({ open, onComplete, onCancel }: SocialOptInFlowProps) {
  const { showBurmese } = useLanguage();
  const { optIn } = useSocial();
  const { user } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [displayName, setDisplayName] = useState(user?.name ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation
  const nameValid = displayName.trim().length >= 2 && displayName.trim().length <= 30;

  const handleConfirm = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await optIn(displayName.trim());
      onComplete();
    } catch (error) {
      console.error('[SocialOptInFlow] Opt-in failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [optIn, displayName, onComplete]);

  const handleCancel = useCallback(() => {
    setStep(1);
    onCancel();
  }, [onCancel]);

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        handleCancel();
      }
    },
    [handleCancel]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogTitle>
          Social Features
          {showBurmese && (
            <span className="block font-myanmar text-base font-normal text-muted-foreground mt-1">
              လူမှုရေးလုပ်ဆောင်ချက်များ
            </span>
          )}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Enable social features to appear on the leaderboard
        </DialogDescription>

        <div className="mt-4 min-h-[200px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step-1"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={stepTransition}
              >
                <StepPrivacyNotice
                  showBurmese={showBurmese}
                  onContinue={() => setStep(2)}
                  onCancel={handleCancel}
                />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={stepTransition}
              >
                <StepDisplayName
                  showBurmese={showBurmese}
                  displayName={displayName}
                  onDisplayNameChange={setDisplayName}
                  nameValid={nameValid}
                  onContinue={() => setStep(3)}
                  onBack={() => setStep(1)}
                />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step-3"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={stepTransition}
              >
                <StepConfirm
                  showBurmese={showBurmese}
                  displayName={displayName.trim()}
                  isSubmitting={isSubmitting}
                  onConfirm={handleConfirm}
                  onBack={() => setStep(2)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Step indicator */}
        <div className="mt-4 flex items-center justify-center gap-2">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`h-2 w-2 rounded-full transition-colors ${
                s === step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Step 1: Privacy Notice
// ---------------------------------------------------------------------------

function StepPrivacyNotice({
  showBurmese,
  onContinue,
  onCancel,
}: {
  showBurmese: boolean;
  onContinue: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-primary">
        <Shield className="h-5 w-5" />
        <span className="font-semibold">Privacy Notice</span>
        {showBurmese && (
          <span className="font-myanmar text-muted-foreground">/ ကိုယ်ရေးသတိပေးချက်</span>
        )}
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">
        By enabling social features, your display name and scores will be visible on the
        leaderboard. You can disable this at any time from Settings.
      </p>

      {showBurmese && (
        <p className="font-myanmar text-sm text-muted-foreground leading-relaxed">
          လူမှုရေးလုပ်ဆောင်ချက်များကို ဖွင့်ခြင်းဖြင့် သင့်ပြသမည့်အမည်နှင့် အမှတ်များကို
          အဆင့်ဇယားတွင် မြင်ရပါမည်။ Settings မှ အချိန်မရွေး ပိတ်နိုင်ပါသည်။
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <Button variant="ghost" size="sm" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button size="sm" onClick={onContinue} className="flex-1">
          <span className="flex items-center gap-1">
            Continue
            <ArrowRight className="h-4 w-4" />
          </span>
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2: Display Name Setup
// ---------------------------------------------------------------------------

function StepDisplayName({
  showBurmese,
  displayName,
  onDisplayNameChange,
  nameValid,
  onContinue,
  onBack,
}: {
  showBurmese: boolean;
  displayName: string;
  onDisplayNameChange: (name: string) => void;
  nameValid: boolean;
  onContinue: () => void;
  onBack: () => void;
}) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && nameValid) {
      onContinue();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-primary">
        <User className="h-5 w-5" />
        <span className="font-semibold">Display Name</span>
        {showBurmese && <span className="font-myanmar text-muted-foreground">/ ပြသမည့်အမည်</span>}
      </div>

      <div>
        <label htmlFor="social-display-name" className="mb-1 block text-sm text-muted-foreground">
          This name will appear on the leaderboard
          {showBurmese && (
            <span className="font-myanmar block text-sm mt-0.5">
              ဤအမည်သည် အဆင့်ဇယားတွင် ပေါ်လာပါမည်
            </span>
          )}
        </label>
        <input
          id="social-display-name"
          type="text"
          value={displayName}
          onChange={e => onDisplayNameChange(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={30}
          autoFocus
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          placeholder="Enter display name..."
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {displayName.trim().length}/30 characters (min 2)
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="flex-1">
          <span className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back
          </span>
        </Button>
        <Button size="sm" onClick={onContinue} disabled={!nameValid} className="flex-1">
          <span className="flex items-center gap-1">
            Continue
            <ArrowRight className="h-4 w-4" />
          </span>
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 3: Confirm
// ---------------------------------------------------------------------------

function StepConfirm({
  showBurmese,
  displayName,
  isSubmitting,
  onConfirm,
  onBack,
}: {
  showBurmese: boolean;
  displayName: string;
  isSubmitting: boolean;
  onConfirm: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-primary">
        <Check className="h-5 w-5" />
        <span className="font-semibold">Ready!</span>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
        <p className="text-sm text-foreground">
          You&apos;re all set! Your profile will appear on the leaderboard as:
        </p>
        <p className="text-lg font-bold text-primary">{displayName}</p>
        {showBurmese && (
          <p className="font-myanmar text-sm text-muted-foreground">
            သင့်ပရိုဖိုင်ကို အဆင့်ဇယားတွင် ပြသပါမည်။
          </p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="ghost" size="md" onClick={onBack} className="shrink-0">
          <span className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back
          </span>
        </Button>
        <Button size="md" onClick={onConfirm} loading={isSubmitting} className="flex-1">
          {showBurmese ? (
            <span className="flex flex-col items-center leading-tight py-1">
              <span>Enable Social</span>
              <span className="font-myanmar text-white/80 font-normal">လူမှုရေး ဖွင့်ပါ</span>
            </span>
          ) : (
            'Enable Social'
          )}
        </Button>
      </div>
    </div>
  );
}
