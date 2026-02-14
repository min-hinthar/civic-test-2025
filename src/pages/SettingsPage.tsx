'use client';

/**
 * Settings Page
 *
 * Duolingo-inspired settings with grouped sections in rounded cards,
 * icons, bilingual labels, and toggle switches.
 * Bilingual English-Burmese interface.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  Clock,
  Globe,
  LogOut,
  MapPin,
  Mic,
  Palette,
  RotateCcw,
  Settings,
  Trash2,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { clsx } from 'clsx';
import { NotificationSettings } from '@/components/pwa/NotificationSettings';
import { useLanguage } from '@/contexts/LanguageContext';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { FlagToggle } from '@/components/ui/FlagToggle';
import { SocialSettings } from '@/components/social/SocialSettings';
import { useUserState } from '@/contexts/StateContext';
import { isSoundMuted, setSoundMuted, playCorrect } from '@/lib/audio/soundEffects';
import { useTTSSettings } from '@/hooks/useTTSSettings';

const SRS_REMINDER_TIME_KEY = 'civic-prep-srs-reminder-time';

type SpeechRate = 'slow' | 'normal' | 'fast';

const SPEECH_RATE_OPTIONS: { value: SpeechRate; en: string; my: string }[] = [
  { value: 'slow', en: 'Slow', my: '\u1014\u103E\u1031\u1038' },
  { value: 'normal', en: 'Normal', my: '\u1015\u102F\u1036\u1019\u103E\u1014\u103A' },
  { value: 'fast', en: 'Fast', my: '\u1019\u103C\u1014\u103A' },
];

/** Reusable toggle switch component */
function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  ariaLabel,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onChange}
      className="relative inline-flex min-h-[48px] min-w-[48px] shrink-0 cursor-pointer items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span
        className={`inline-flex h-7 w-12 items-center rounded-full border-2 border-transparent transition-colors duration-200 ${
          checked ? 'bg-primary' : 'bg-muted'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-surface shadow-md ring-0 transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </span>
    </button>
  );
}

/** Section card wrapper with icon and bilingual title */
function SettingsSection({
  icon,
  titleEn,
  titleMy,
  showBurmese,
  children,
  variant = 'default',
}: {
  icon: React.ReactNode;
  titleEn: string;
  titleMy: string;
  showBurmese: boolean;
  children: React.ReactNode;
  variant?: 'default' | 'danger';
}) {
  const borderColor = variant === 'danger' ? 'border-destructive/30' : 'border-border/60';
  const bgColor = variant === 'danger' ? 'bg-destructive/5' : 'bg-card';

  return (
    <section className="mb-5">
      <div
        className={`rounded-2xl border ${borderColor} ${bgColor} shadow-lg shadow-primary/5 overflow-hidden`}
      >
        {/* Section header */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${
              variant === 'danger'
                ? 'bg-destructive/10 text-destructive'
                : 'bg-primary-subtle text-primary'
            }`}
          >
            {icon}
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">{titleEn}</h2>
            {showBurmese && <p className="font-myanmar text-xs text-muted-foreground">{titleMy}</p>}
          </div>
        </div>

        {/* Section content */}
        <div className="px-5 pb-5">{children}</div>
      </div>
    </section>
  );
}

/** Single settings row with label, description, and action */
function SettingsRow({
  label,
  labelMy,
  description,
  descriptionMy,
  showBurmese,
  action,
  isLast = false,
}: {
  label: string;
  labelMy?: string;
  description?: string;
  descriptionMy?: string;
  showBurmese: boolean;
  action: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between py-3 min-h-[48px] ${
        !isLast ? 'border-b border-border/40' : ''
      }`}
    >
      <div className="flex-1 mr-3">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        {showBurmese && labelMy && (
          <p className="font-myanmar text-xs text-muted-foreground">{labelMy}</p>
        )}
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        {showBurmese && descriptionMy && (
          <p className="font-myanmar text-xs text-muted-foreground mt-0.5">{descriptionMy}</p>
        )}
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { showBurmese } = useLanguage();
  const { theme, toggleTheme } = useThemeContext();
  const { user, logout } = useAuth();
  const { isSubscribed } = usePushNotifications(user?.id ?? null);
  const [reminderTime, setReminderTime] = React.useState(() => {
    if (typeof window === 'undefined') return '09:00';
    return localStorage.getItem(SRS_REMINDER_TIME_KEY) ?? '09:00';
  });
  const { settings: ttsSettings, updateSettings: updateTTSSettings } = useTTSSettings();
  const speechRate = ttsSettings.rate;
  const { selectedState, setSelectedState, allStates } = useUserState();
  const [soundMuted, setSoundMutedState] = React.useState(() => isSoundMuted());

  const handleReminderTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setReminderTime(value);
    localStorage.setItem(SRS_REMINDER_TIME_KEY, value);
  };

  const handleSpeechRateChange = (rate: SpeechRate) => {
    updateTTSSettings({ rate });
  };

  const handleSoundToggle = () => {
    const wasMuted = soundMuted;
    const next = !wasMuted;
    setSoundMuted(next);
    setSoundMutedState(next);
    if (wasMuted) {
      playCorrect();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border/60 bg-card/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex h-12 w-12 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted/40 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <div>
              <h1 className="text-lg font-extrabold text-foreground">Settings</h1>
              {showBurmese && (
                <p className="font-myanmar text-xs text-muted-foreground leading-tight">
                  {'\u1006\u1000\u103A\u1010\u1004\u103A\u1019\u103B\u102C\u1038'}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-2xl px-4 py-5">
        {/* ======= Appearance Section ======= */}
        <SettingsSection
          icon={<Palette className="h-5 w-5" />}
          titleEn="Appearance"
          titleMy={'\u1021\u101E\u103D\u1004\u103A\u1021\u1015\u103C\u1004\u103A'}
          showBurmese={showBurmese}
        >
          {/* Language mode with FlagToggle */}
          <div className="py-3 border-b border-border/40">
            <div className="flex items-center justify-between min-h-[48px]">
              <div className="flex-1 mr-3">
                <p className="text-sm font-semibold text-foreground">Display Language</p>
                {showBurmese && (
                  <p className="font-myanmar text-xs text-muted-foreground">
                    {'\u1015\u103C\u101E\u100A\u103A\u1037\u1018\u102C\u101E\u102C'}
                  </p>
                )}
              </div>
              <FlagToggle />
            </div>
          </div>

          <SettingsRow
            label="Theme"
            labelMy={'\u1021\u1015\u103C\u1004\u103A\u1021\u1006\u1004\u103A'}
            description="Switch between light and dark mode"
            descriptionMy={
              '\u1021\u101C\u1004\u103A\u1038\u1014\u103E\u1004\u103A\u1037 \u1021\u1019\u103E\u102C\u1004\u103A\u1019\u102F\u1012\u103A \u1015\u103C\u1031\u102C\u1004\u103A\u1038\u101C\u1032\u1015\u102B'
            }
            showBurmese={showBurmese}
            action={
              <ToggleSwitch
                checked={theme === 'dark'}
                onChange={toggleTheme}
                ariaLabel="Toggle dark mode"
              />
            }
            isLast
          />

          {/* Mode descriptions */}
          <div className="mt-3 space-y-2">
            {/* English mode description */}
            <div
              className={clsx(
                'rounded-xl px-3 py-2.5 border transition-colors',
                !showBurmese
                  ? 'border-primary/30 bg-primary-subtle/20'
                  : 'border-border/40 bg-muted/20'
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                {!showBurmese && <span className="h-2 w-2 rounded-full bg-primary" />}
                <p className="text-xs font-semibold text-foreground">English Only</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Shows English text only on all screens. Simulates the real USCIS civics test where
                everything is in English.
              </p>
              {showBurmese && (
                <p className="text-xs text-muted-foreground font-myanmar mt-1">
                  {
                    '\u1016\u1014\u103A\u101E\u102C\u1038\u1015\u103C\u1004\u103A\u1021\u102C\u1038\u101C\u102F\u1036\u1038\u1010\u103D\u1004\u103A \u1021\u1004\u103A\u1039\u1002\u101C\u102D\u1015\u103A\u1005\u102C\u101E\u102C \u1015\u103C\u101E\u100A\u103A\u104B \u1021\u101B\u102C\u1021\u102C\u1038\u101C\u102F\u1036\u1038 \u1021\u1004\u103A\u1039\u1002\u101C\u102D\u1015\u103A\u1018\u102C\u101E\u102C\u1016\u103C\u1004\u103A\u1037\u1016\u103C\u1005\u103A\u101E\u1031\u102C \u1010\u1000\u101A\u103A\u1037 USCIS \u1014\u102D\u102F\u1004\u103A\u1004\u1036\u101E\u102C\u1038\u1005\u102C\u1019\u1031\u1038\u1015\u103D\u1032\u1000\u102D\u102F \u1010\u1030\u100A\u102E\u1005\u1031\u1015\u102B\u101E\u100A\u103A\u104B'
                  }
                </p>
              )}
            </div>

            {/* Myanmar mode description */}
            <div
              className={clsx(
                'rounded-xl px-3 py-2.5 border transition-colors',
                showBurmese
                  ? 'border-primary/30 bg-primary-subtle/20'
                  : 'border-border/40 bg-muted/20'
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                {showBurmese && <span className="h-2 w-2 rounded-full bg-primary" />}
                <p className="text-xs font-semibold text-foreground">
                  Bilingual (English + Myanmar)
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Shows both English and Burmese text. English appears first with Burmese translations
                below.
              </p>
              {showBurmese && (
                <p className="text-xs text-muted-foreground font-myanmar mt-1">
                  {
                    '\u1021\u1004\u103A\u1039\u1002\u101C\u102D\u1015\u103A\u1014\u103E\u1004\u103A\u1037 \u1019\u103C\u1014\u103A\u1019\u102C \u1014\u103E\u1005\u103A\u1018\u102C\u101E\u102C\u101C\u102F\u1036\u1038\u1000\u102D\u102F \u1015\u103C\u101E\u100A\u103A\u104B \u1021\u1004\u103A\u1039\u1002\u101C\u102D\u1015\u103A\u1005\u102C \u1021\u101B\u1004\u103A\u1015\u103C\u1015\u103C\u102E\u1038 \u1019\u103C\u1014\u103A\u1019\u102C\u1018\u102C\u101E\u102C\u1015\u103C\u1014\u103A\u1000\u102D\u102F \u1021\u1031\u102C\u1000\u103A\u1010\u103D\u1004\u103A\u1015\u103C\u101E\u100A\u103A\u104B'
                  }
                </p>
              )}
            </div>
          </div>
        </SettingsSection>

        {/* ======= Location Section ======= */}
        <SettingsSection
          icon={<MapPin className="h-5 w-5" />}
          titleEn="Location"
          titleMy={'\u1010\u100A\u103A\u1014\u1031\u101B\u102C'}
          showBurmese={showBurmese}
        >
          <SettingsRow
            label="Your State"
            labelMy={'\u101E\u1004\u103A\u1037\u1015\u103C\u100A\u103A\u1014\u101A\u103A'}
            description="Used for governor, senator, and capital questions"
            descriptionMy={
              '\u1021\u102F\u1015\u103A\u1001\u103B\u102F\u1015\u103A\u101B\u1031\u1038\u1019\u103E\u1030\u1038\u104D \u1021\u1011\u1000\u103A\u101C\u103D\u103E\u1010\u103A\u1010\u1031\u102C\u103A\u1021\u1019\u1010\u103A\u1014\u103E\u1004\u103A\u1037 \u1019\u103C\u102D\u102F\u1037\u1010\u1031\u102C\u103A\u1019\u1031\u1038\u1001\u103D\u1014\u103A\u1038\u1019\u103B\u102C\u1038\u1021\u1010\u103D\u1000\u103A \u1021\u101E\u102F\u1036\u1038\u1015\u103C\u102F\u101E\u100A\u103A'
            }
            showBurmese={showBurmese}
            action={
              <select
                value={selectedState ?? ''}
                onChange={e => setSelectedState(e.target.value || null)}
                className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground min-h-[48px] min-w-[140px]"
                aria-label="Select your state or territory"
              >
                <option value="">
                  {showBurmese
                    ? '\u1015\u103C\u100A\u103A\u1014\u101A\u103A\u101B\u103D\u1031\u1038\u1001\u103B\u101A\u103A\u1015\u102B...'
                    : 'Select state...'}
                </option>
                {allStates.map(s => (
                  <option key={s.code} value={s.code}>
                    {s.name}
                  </option>
                ))}
              </select>
            }
            isLast
          />
        </SettingsSection>

        {/* ======= Sound & Notifications Section ======= */}
        <SettingsSection
          icon={<Volume2 className="h-5 w-5" />}
          titleEn="Sound & Notifications"
          titleMy={
            '\u1021\u101E\u1036\u1014\u103E\u1004\u103A\u1037 \u1021\u1000\u103C\u1031\u102C\u1004\u103A\u1038\u1000\u103C\u102C\u1038\u1001\u103B\u1000\u103A\u1019\u103B\u102C\u1038'
          }
          showBurmese={showBurmese}
        >
          {/* Sound Effects toggle */}
          <SettingsRow
            label="Sound Effects"
            labelMy={'\u1021\u101E\u1036\u1005\u1031\u1016\u1000\u103A\u1019\u103B\u102C\u1038'}
            description="Correct answers, milestones, level-ups"
            descriptionMy={
              '\u1021\u1016\u103C\u1031\u1019\u103E\u1014\u103A\u1019\u103B\u102C\u1038\u104D \u1019\u102D\u102F\u1004\u103A\u1038\u1010\u102D\u102F\u1004\u103A\u1019\u103B\u102C\u1038'
            }
            showBurmese={showBurmese}
            action={
              <div className="flex items-center gap-2">
                {soundMuted ? (
                  <VolumeX className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Volume2 className="h-4 w-4 text-primary" />
                )}
                <ToggleSwitch
                  checked={!soundMuted}
                  onChange={handleSoundToggle}
                  ariaLabel="Toggle sound effects"
                />
              </div>
            }
          />

          {/* Notification Settings */}
          <div className="py-3 border-b border-border/40">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">Study Reminders</p>
              {showBurmese && (
                <span className="font-myanmar text-xs text-muted-foreground">
                  {
                    '\u101C\u1031\u1037\u101C\u102C\u101B\u1014\u103A\u101E\u1010\u102D\u1015\u1031\u1038\u1001\u103B\u1000\u103A'
                  }
                </span>
              )}
            </div>
            <NotificationSettings />
          </div>

          {/* Review Reminder Time */}
          <div className="py-3">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">Preferred Reminder Time</p>
              {showBurmese && (
                <span className="font-myanmar text-xs text-muted-foreground">
                  {
                    '\u101E\u1010\u102D\u1015\u1031\u1038\u1001\u103B\u1000\u103A\u1021\u1001\u103B\u102D\u1014\u103A'
                  }
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <label htmlFor="srs-reminder-time" className="text-xs text-muted-foreground">
                Time /{' '}
                <span className="font-myanmar">{'\u1021\u1001\u103B\u102D\u1014\u103A'}</span>:
              </label>
              <input
                type="time"
                id="srs-reminder-time"
                value={reminderTime}
                onChange={handleReminderTimeChange}
                className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground min-h-[48px]"
              />
            </div>

            {!isSubscribed && (
              <div className="mt-2 rounded-xl border border-warning bg-warning-subtle px-3 py-2">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-warning" />
                  <p className="text-xs text-warning">
                    Enable push notifications above to receive reminders.
                  </p>
                </div>
                {showBurmese && (
                  <p className="font-myanmar text-xs text-warning mt-1 ml-6">
                    {
                      '\u1015\u103C\u1014\u103A\u101C\u103E\u100A\u103A\u1037\u101E\u1010\u102D\u1015\u1031\u1038\u1001\u103B\u1000\u103A\u1019\u103B\u102C\u1038\u101B\u101B\u103E\u102D\u101B\u1014\u103A push notification \u1016\u103D\u1004\u103A\u1037\u1015\u102B\u104B'
                    }
                  </p>
                )}
              </div>
            )}
          </div>
        </SettingsSection>

        {/* ======= Interview Section ======= */}
        <SettingsSection
          icon={<Mic className="h-5 w-5" />}
          titleEn="Interview"
          titleMy={'\u1021\u1004\u103A\u1010\u102C\u1017\u103B\u1030\u1038'}
          showBurmese={showBurmese}
        >
          <div className="py-3">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">Speech Speed</p>
              {showBurmese && (
                <span className="font-myanmar text-xs text-muted-foreground">
                  {
                    '\u1021\u1004\u103A\u1010\u102C\u1017\u103B\u1030\u1038\u1005\u1000\u102C\u1038\u1015\u103C\u1031\u102C\u1014\u103E\u102F\u1014\u103A\u1038'
                  }
                </span>
              )}
            </div>
            <div className="flex gap-2" role="radiogroup" aria-label="Speech rate">
              {SPEECH_RATE_OPTIONS.map(option => (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={speechRate === option.value}
                  onClick={() => handleSpeechRateChange(option.value)}
                  className={`flex-1 rounded-xl border-2 px-3 py-2.5 text-center text-sm font-bold transition-all duration-150 min-h-[44px] ${
                    speechRate === option.value
                      ? 'border-primary bg-primary-subtle text-primary shadow-[0_2px_0_0] shadow-primary-200'
                      : 'border-border bg-card text-muted-foreground hover:bg-muted/40'
                  }`}
                >
                  <span>{option.en}</span>
                  {showBurmese && (
                    <span className="block font-myanmar text-xs mt-0.5 font-normal">
                      {option.my}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Controls how fast the interviewer speaks during practice.
            </p>
            {showBurmese && (
              <p className="font-myanmar text-xs text-muted-foreground mt-0.5">
                {
                  '\u101C\u1031\u1037\u1000\u103B\u1004\u103A\u1037\u1005\u1005\u103A\u101E\u1014\u103A\u1038\u1019\u103B\u102C\u1038\u1021\u1010\u103D\u1004\u103A\u1038 \u1021\u1004\u103A\u1010\u102C\u1017\u103B\u1030\u1038\u1005\u1000\u102C\u1038\u1015\u103C\u1031\u102C\u101E\u100A\u103A\u1037\u1021\u1019\u103C\u1014\u103A\u1000\u102D\u102F \u1011\u102D\u1014\u103A\u1038\u1001\u103B\u102F\u1015\u103A\u1015\u102B\u104B'
                }
              </p>
            )}
          </div>
        </SettingsSection>

        {/* ======= Social Section ======= */}
        <SettingsSection
          icon={<Users className="h-5 w-5" />}
          titleEn="Social & Community"
          titleMy={
            '\u101C\u1030\u1019\u103E\u102F\u1025\u101B\u1031\u1038\u1014\u103E\u1004\u103A\u1037 \u1021\u101E\u102D\u102F\u1004\u103A\u1038\u1021\u101D\u102D\u102F\u1004\u103A\u1038'
          }
          showBurmese={showBurmese}
        >
          <SocialSettings />
        </SettingsSection>

        {/* ======= Help Section ======= */}
        <SettingsSection
          icon={<RotateCcw className="h-5 w-5" />}
          titleEn="Help & Guidance"
          titleMy={
            '\u1021\u1000\u1030\u1021\u100A\u102E\u1014\u103E\u1004\u103A\u1037 \u101C\u1019\u103A\u1038\u100A\u103D\u103E\u1014\u103A'
          }
          showBurmese={showBurmese}
        >
          <SettingsRow
            label="Replay Onboarding Tour"
            labelMy={
              '\u101C\u1019\u103A\u1038\u100A\u103D\u103E\u1014\u103A\u1019\u103E\u102F\u1001\u101B\u102E\u1038\u1000\u102D\u102F \u1015\u103C\u1014\u103A\u1000\u103C\u100A\u103A\u1037\u101B\u103E\u102F\u1015\u102B'
            }
            description="Walk through the guided introduction again"
            descriptionMy={
              '\u101C\u1019\u103A\u1038\u100A\u103D\u103E\u1014\u103A\u1015\u103C\u1019\u103E\u102F\u1001\u101B\u102E\u1038\u1000\u102D\u102F \u1011\u1015\u103A\u1019\u1036\u1016\u103C\u1010\u103A\u101E\u103D\u102C\u1038\u1015\u102B\u104B'
            }
            showBurmese={showBurmese}
            action={
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('civic-test-onboarding-complete');
                  navigate('/home');
                }}
                className="rounded-xl bg-primary-subtle px-4 py-2 text-sm font-bold text-primary hover:bg-primary-subtle transition-colors min-h-[44px]"
              >
                Replay
              </button>
            }
            isLast
          />
        </SettingsSection>

        {/* ======= Danger Zone Section ======= */}
        <SettingsSection
          icon={<Trash2 className="h-5 w-5" />}
          titleEn="Danger Zone"
          titleMy={'\u1021\u1014\u1039\u1010\u101B\u102C\u101A\u103A\u1007\u102F\u1014\u103A'}
          showBurmese={showBurmese}
          variant="danger"
        >
          {user && (
            <SettingsRow
              label="Sign Out"
              labelMy={'\u1011\u103D\u1000\u103A\u101B\u1014\u103A'}
              description="You can sign back in anytime"
              descriptionMy={
                '\u1019\u100A\u103A\u101E\u100A\u103A\u1037\u1021\u1001\u103B\u102D\u1014\u103A\u1019\u103E\u102C\u1019\u1006\u102D\u102F \u1015\u103C\u1014\u103A\u1021\u1000\u1031\u102C\u1004\u103A\u1037\u1016\u103D\u1004\u103A\u1037\u1014\u102D\u102F\u1004\u103A\u1015\u102B\u101E\u100A\u103A'
              }
              showBurmese={showBurmese}
              action={
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-2 text-sm font-bold text-destructive hover:bg-destructive/20 transition-colors min-h-[44px]"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              }
              isLast
            />
          )}
          {!user && (
            <p className="py-3 text-sm text-muted-foreground">
              Sign in to access account actions.
              {showBurmese && (
                <span className="block font-myanmar mt-0.5">
                  {
                    '\u1021\u1000\u1031\u102C\u1004\u103A\u1037\u101C\u102F\u1015\u103A\u1006\u1031\u102C\u1004\u103A\u1001\u103B\u1000\u103A\u1019\u103B\u102C\u1038\u101B\u101B\u103E\u102D\u101B\u1014\u103A \u1021\u1000\u1031\u102C\u1004\u103A\u1037\u1016\u103D\u1004\u103A\u1037\u1015\u102B'
                  }
                </span>
              )}
            </p>
          )}
        </SettingsSection>
      </main>
    </div>
  );
}
