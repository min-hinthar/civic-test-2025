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
import { NotificationSettings } from '@/components/pwa/NotificationSettings';
import { useLanguage } from '@/contexts/LanguageContext';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { SocialSettings } from '@/components/social/SocialSettings';
import { useUserState } from '@/contexts/StateContext';
import { isSoundMuted, setSoundMuted, playCorrect } from '@/lib/audio/soundEffects';

const SRS_REMINDER_TIME_KEY = 'civic-prep-srs-reminder-time';
const SPEECH_RATE_KEY = 'civic-prep-speech-rate';

type SpeechRate = 'slow' | 'normal' | 'fast';

const SPEECH_RATE_OPTIONS: { value: SpeechRate; en: string; my: string }[] = [
  { value: 'slow', en: 'Slow', my: 'နှေး' },
  { value: 'normal', en: 'Normal', my: 'ပုံမှန်' },
  { value: 'fast', en: 'Fast', my: 'မြန်' },
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
      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? 'bg-primary' : 'bg-muted'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-surface shadow-md ring-0 transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
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
      className={`flex items-center justify-between py-3 min-h-[44px] ${
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
  const [speechRate, setSpeechRate] = React.useState<SpeechRate>(() => {
    if (typeof window === 'undefined') return 'normal';
    return (localStorage.getItem(SPEECH_RATE_KEY) as SpeechRate) ?? 'normal';
  });
  const { selectedState, setSelectedState, allStates } = useUserState();
  const [soundMuted, setSoundMutedState] = React.useState(() => isSoundMuted());

  const handleReminderTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setReminderTime(value);
    localStorage.setItem(SRS_REMINDER_TIME_KEY, value);
  };

  const handleSpeechRateChange = (rate: SpeechRate) => {
    setSpeechRate(rate);
    localStorage.setItem(SPEECH_RATE_KEY, rate);
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
            className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted/40 transition-colors"
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
                  {'ဆက်တင်များ'}
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
          titleMy={'အသွင်အပြင်'}
          showBurmese={showBurmese}
        >
          <SettingsRow
            label="Display Language"
            labelMy={'ပြသည့်ဘာသာ'}
            description="Bilingual or English-only"
            descriptionMy={'နှစ်ဘာသာ သို့မဟုတ် အင်္ဂလစ်သီးသန့်'}
            showBurmese={showBurmese}
            action={<LanguageToggle showLabel />}
          />
          <SettingsRow
            label="Theme"
            labelMy={'အပြင်အဆင်'}
            description="Switch between light and dark mode"
            descriptionMy={'အလင်းနှင့် အမှာင်မုဒ် ပြောင်းလဲပါ'}
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
          <div className="mt-2 rounded-xl bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">
              <strong>English-only mode</strong> simulates the real USCIS interview where questions
              are asked in English only.
            </p>
            {showBurmese && (
              <p className="text-xs text-muted-foreground font-myanmar mt-1">
                <strong>{'အင်္ဂလစ်သီးသန့်မုဒ်'}</strong>
                {'က တကယ့်USCIS အင်တာဗျူးကိုတူစေပါတယ်။'}
              </p>
            )}
          </div>
        </SettingsSection>

        {/* ======= Location Section ======= */}
        <SettingsSection
          icon={<MapPin className="h-5 w-5" />}
          titleEn="Location"
          titleMy={'တည်နေရာ'}
          showBurmese={showBurmese}
        >
          <SettingsRow
            label="Your State"
            labelMy={'သင့်ပြည်နယ်'}
            description="Used for governor, senator, and capital questions"
            descriptionMy={
              'အုပ်ချုပ်ရေးမှူး၊ အထက်လွှတ်တော်အမတ်နှင့် မြို့တော်မေးခွန်းများအတွက် အသုံးပြုသည်'
            }
            showBurmese={showBurmese}
            action={
              <select
                value={selectedState ?? ''}
                onChange={e => setSelectedState(e.target.value || null)}
                className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground min-h-[44px] min-w-[140px]"
                aria-label="Select your state or territory"
              >
                <option value="">{showBurmese ? 'ပြည်နယ်ရွေးချယ်ပါ...' : 'Select state...'}</option>
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
          titleMy={'အသံနှင့် အကြောင်းကြားချက်များ'}
          showBurmese={showBurmese}
        >
          {/* Sound Effects toggle */}
          <SettingsRow
            label="Sound Effects"
            labelMy={'အသံစေဖက်များ'}
            description="Correct answers, milestones, level-ups"
            descriptionMy={'အဖြေမှန်များ၍ မိုင်းတိုင်များ'}
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
                  {'လေ့လာရန်သတိပေးချက်'}
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
                  {'သတိပေးချက်အချိန်'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <label htmlFor="srs-reminder-time" className="text-xs text-muted-foreground">
                Time / <span className="font-myanmar">{'အချိန်'}</span>:
              </label>
              <input
                type="time"
                id="srs-reminder-time"
                value={reminderTime}
                onChange={handleReminderTimeChange}
                className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground min-h-[44px]"
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
                    {'ပြန်လှည့်သတိပေးချက်များရရှိရန် push notification ဖွင့်ပါ။'}
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
          titleMy={'အင်တာဗျူး'}
          showBurmese={showBurmese}
        >
          <div className="py-3">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">Speech Speed</p>
              {showBurmese && (
                <span className="font-myanmar text-xs text-muted-foreground">
                  {'အင်တာဗျူးစကားပြောနှုန်း'}
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
                {'လေ့ကျင့်စစ်သန်းများအတွင်း အင်တာဗျူးစကားပြောသည့်အမြန်ကို ထိန်းချုပ်ပါ။'}
              </p>
            )}
          </div>
        </SettingsSection>

        {/* ======= Social Section ======= */}
        <SettingsSection
          icon={<Users className="h-5 w-5" />}
          titleEn="Social & Community"
          titleMy={'လူမှုဥရေးနှင့် အသိုင်းအဝိုင်း'}
          showBurmese={showBurmese}
        >
          <SocialSettings />
        </SettingsSection>

        {/* ======= Help Section ======= */}
        <SettingsSection
          icon={<RotateCcw className="h-5 w-5" />}
          titleEn="Help & Guidance"
          titleMy={'အကူအညီနှင့် လမ်းညွှန်'}
          showBurmese={showBurmese}
        >
          <SettingsRow
            label="Replay Onboarding Tour"
            labelMy={'လမ်းညွှန်မှုခရီးကို ပြန်ကြည့်ရှုပါ'}
            description="Walk through the guided introduction again"
            descriptionMy={'လမ်းညွှန်ပြမှုခရီးကို ထပ်မံဖြတ်သွားပါ။'}
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
          titleMy={'အန္တရာယ်ဇုန်'}
          showBurmese={showBurmese}
          variant="danger"
        >
          {user && (
            <SettingsRow
              label="Sign Out"
              labelMy={'ထွက်ရန်'}
              description="You can sign back in anytime"
              descriptionMy={'မည်သည့်အချိန်မှာမဆို ပြန်အကောင့်ဖွင့်နိုင်ပါသည်'}
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
                  {'အကောင့်လုပ်ဆောင်ချက်များရရှိရန် အကောင့်ဖွင့်ပါ'}
                </span>
              )}
            </p>
          )}
        </SettingsSection>
      </main>
    </div>
  );
}
