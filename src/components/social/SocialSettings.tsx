'use client';

/**
 * Social Settings Section
 *
 * Settings content for social features: opt-in toggle, display name editor,
 * and status. Designed to be embedded inside a parent card wrapper (e.g.,
 * SettingsPage's SettingsSection component provides the outer card and heading).
 */

import React, { useCallback, useState } from 'react';
import { Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSocial } from '@/contexts/SocialContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { SocialOptInFlow } from './SocialOptInFlow';

export function SocialSettings() {
  const { showBurmese } = useLanguage();
  const { user } = useAuth();
  const { isOptedIn, displayName, optIn, optOut } = useSocial();

  const [showOptInFlow, setShowOptInFlow] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(displayName);
  const [isToggling, setIsToggling] = useState(false);

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  const handleToggle = useCallback(async () => {
    if (isToggling) return;

    if (isOptedIn) {
      // Opt out
      setIsToggling(true);
      try {
        await optOut();
      } finally {
        setIsToggling(false);
      }
    } else {
      // Show opt-in flow for first-time or re-enabling
      setShowOptInFlow(true);
    }
  }, [isOptedIn, isToggling, optOut]);

  const handleOptInComplete = useCallback(() => {
    setShowOptInFlow(false);
  }, []);

  const handleOptInCancel = useCallback(() => {
    setShowOptInFlow(false);
  }, []);

  const handleNameEdit = useCallback(() => {
    setNameValue(displayName);
    setEditingName(true);
  }, [displayName]);

  const handleNameSave = useCallback(async () => {
    const trimmed = nameValue.trim();
    if (trimmed.length >= 2 && trimmed.length <= 30 && trimmed !== displayName) {
      await optIn(trimmed);
    }
    setEditingName(false);
  }, [nameValue, displayName, optIn]);

  const handleNameKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleNameSave();
      } else if (e.key === 'Escape') {
        setEditingName(false);
      }
    },
    [handleNameSave]
  );

  // -------------------------------------------------------------------------
  // Unauthenticated state
  // -------------------------------------------------------------------------

  if (!user) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Sign in to enable social features</p>
        </div>
        {showBurmese && (
          <p className="font-myanmar text-sm text-muted-foreground">
            {'လူမှုဥရေးလုပ်ဆောင်ချက်များကို ဖွင့်ရန် အကောင့်ဖွင့်ပါ'}
          </p>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Authenticated state
  // -------------------------------------------------------------------------

  return (
    <>
      <div className="space-y-4">
        {/* Opt-in toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Leaderboard Visibility</p>
              {showBurmese && (
                <p className="font-myanmar text-sm text-muted-foreground">
                  {'ဥူးဆောင်ဘုတ်ပြသခြင်း'}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={isOptedIn}
            aria-label="Toggle social features"
            disabled={isToggling}
            onClick={handleToggle}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
              isOptedIn ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-surface shadow-lg ring-0 transition-transform duration-200 ${
                isOptedIn ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Status text */}
        <div className="border-t border-border pt-3">
          {isOptedIn ? (
            <>
              <p className="text-sm text-success-600 dark:text-success">
                Your profile is visible on the leaderboard
              </p>
              {showBurmese && (
                <p className="font-myanmar text-xs text-muted-foreground mt-0.5">
                  {'သင့်ပရိုဖိုင်ကို ဥူးဆောင်ဘုတ်တွင် မြင်ရပါသည်'}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">Your profile is private</p>
              {showBurmese && (
                <p className="font-myanmar text-xs text-muted-foreground mt-0.5">
                  {'သင့်ပရိုဖိုင်သည် ကိုယ်ရေးဖြစ်ပါသည်'}
                </p>
              )}
            </>
          )}
        </div>

        {/* Display name (only shown when opted in) */}
        {isOptedIn && (
          <div className="border-t border-border pt-3">
            <label className="mb-1 block text-sm font-medium text-foreground">
              Display Name
              {showBurmese && (
                <span className="font-myanmar text-xs text-muted-foreground ml-2">
                  {'ပြသမည့်အမည်'}
                </span>
              )}
            </label>

            {editingName ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nameValue}
                  onChange={e => setNameValue(e.target.value)}
                  onKeyDown={handleNameKeyDown}
                  onBlur={handleNameSave}
                  maxLength={30}
                  autoFocus
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={handleNameEdit}
                className="w-full rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-left text-sm text-foreground hover:bg-muted/50 transition-colors"
              >
                {displayName || 'Set display name...'}
              </button>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Click to edit. Press Enter to save.
            </p>
          </div>
        )}
      </div>

      {/* Opt-in flow dialog */}
      <SocialOptInFlow
        open={showOptInFlow}
        onComplete={handleOptInComplete}
        onCancel={handleOptInCancel}
      />
    </>
  );
}
