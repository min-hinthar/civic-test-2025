'use client';

/**
 * Settings Page
 *
 * User preferences including language and notification settings.
 * Bilingual English-Burmese interface.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Clock, Settings, Volume2 } from 'lucide-react';
import { NotificationSettings } from '@/components/pwa/NotificationSettings';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { SectionHeading } from '@/components/bilingual/BilingualHeading';
import { Card, CardContent } from '@/components/ui/Card';

const SRS_REMINDER_TIME_KEY = 'civic-prep-srs-reminder-time';
const SPEECH_RATE_KEY = 'civic-prep-speech-rate';

type SpeechRate = 'slow' | 'normal' | 'fast';

const SPEECH_RATE_OPTIONS: { value: SpeechRate; en: string; my: string }[] = [
  { value: 'slow', en: 'Slow', my: '\u1014\u103E\u1031\u1038' },
  { value: 'normal', en: 'Normal', my: '\u1015\u102F\u1036\u1019\u103E\u1014\u103A' },
  { value: 'fast', en: 'Fast', my: '\u1019\u103C\u1014\u103A' },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const { showBurmese } = useLanguage();
  const { user } = useAuth();
  const { isSubscribed } = usePushNotifications(user?.id ?? null);
  const [reminderTime, setReminderTime] = React.useState(() => {
    if (typeof window === 'undefined') return '09:00';
    return localStorage.getItem(SRS_REMINDER_TIME_KEY) ?? '09:00';
  });
  const [speechRate, setSpeechRate] = React.useState<SpeechRate>(() => {
    if (typeof window === 'undefined') return 'normal';
    return (localStorage.getItem(SPEECH_RATE_KEY) as SpeechRate) ?? 'normal';
  });

  const handleReminderTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setReminderTime(value);
    localStorage.setItem(SRS_REMINDER_TIME_KEY, value);
  };

  const handleSpeechRateChange = (rate: SpeechRate) => {
    setSpeechRate(rate);
    localStorage.setItem(SPEECH_RATE_KEY, rate);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Settings className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-xl font-bold text-foreground">Settings</h1>
            {showBurmese && (
              <p className="font-myanmar text-sm text-muted-foreground">
                {'\u1006\u1000\u103A\u1010\u1004\u103A\u1019\u103B\u102C\u1038'}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto max-w-2xl px-4 py-6">
        {/* Language Settings */}
        <section className="mb-8">
          <SectionHeading
            text={{
              en: 'Language Settings',
              my: '\u1018\u102C\u101E\u102C\u1005\u1000\u102C\u1038\u1006\u1000\u103A\u1010\u1004\u103A\u1019\u103B\u102C\u1038',
            }}
          />

          <Card>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Display Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Choose between bilingual or English-only display
                  </p>
                </div>
                <LanguageToggle showLabel />
              </div>

              <div className="border-t border-border pt-4">
                <p className="mb-2 text-sm text-muted-foreground">
                  <strong>English-only mode</strong> simulates the real USCIS interview where
                  questions are asked in English only. This helps practice under test conditions.
                </p>
                {showBurmese && (
                  <p className="text-sm text-muted-foreground font-myanmar">
                    <strong>
                      {
                        '\u1021\u1004\u103A\u1039\u1002\u101C\u1005\u103A\u101E\u102E\u1038\u101E\u1014\u103A\u1037\u1019\u102F\u1012\u103A'
                      }
                    </strong>
                    {
                      '\u1000 \u1010\u1000\u101A\u103A\u1037USCIS \u1021\u1004\u103A\u1010\u102C\u1017\u103B\u1030\u1038\u1000\u102D\u102F\u1010\u1030\u1005\u1031\u1015\u102B\u1010\u101A\u103A\u104B \u1005\u102C\u1019\u1031\u1038\u1015\u103D\u1032\u1021\u1001\u103C\u1031\u1021\u1014\u1031\u1021\u1010\u102D\u102F\u1004\u103A\u1038\u101C\u1031\u1037\u1000\u103B\u1004\u103A\u1037\u101B\u1014\u103A\u1016\u103C\u1005\u103A\u1015\u102B\u101E\u100A\u103A\u104B'
                    }
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Notifications */}
        <section className="mb-8">
          <SectionHeading
            text={{
              en: 'Notifications',
              my: '\u1021\u1000\u103C\u1031\u102C\u1004\u103A\u1038\u1000\u103C\u102C\u1038\u1001\u103B\u1000\u103A\u1019\u103B\u102C\u1038',
            }}
          />
          <NotificationSettings />
        </section>

        {/* Review Reminders */}
        <section className="mb-8">
          <SectionHeading
            text={{
              en: 'Review Reminders',
              my: '\u1015\u103C\u1014\u103A\u101C\u103E\u100A\u1037\u103A\u101E\u1010\u102D\u1015\u1031\u1038\u1001\u103B\u1000\u103A',
            }}
          />
          <Card>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">
                    Preferred Reminder Time
                  </p>
                  {showBurmese && (
                    <p className="font-myanmar text-sm text-muted-foreground">
                      {'\u101E\u1010\u102D\u1015\u1031\u1038\u1001\u103B\u1000\u103A\u1021\u1001\u103B\u102D\u1014\u103A'}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label htmlFor="srs-reminder-time" className="text-sm text-muted-foreground">
                  Time / <span className="font-myanmar">{'\u1021\u1001\u103B\u102D\u1014\u103A'}</span>:
                </label>
                <input
                  type="time"
                  id="srs-reminder-time"
                  value={reminderTime}
                  onChange={handleReminderTimeChange}
                  className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground"
                />
              </div>

              {!isSubscribed && (
                <div className="rounded-md border border-warning-200 bg-warning-50 px-3 py-2 dark:border-warning-800 dark:bg-warning-900/20">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-warning-500" />
                    <p className="text-sm text-warning-700 dark:text-warning-300">
                      Enable push notifications above to receive review reminders.
                    </p>
                  </div>
                  {showBurmese && (
                    <p className="font-myanmar text-sm text-warning-600 dark:text-warning-400 mt-1 ml-6">
                      {'\u1015\u103C\u1014\u103A\u101C\u103E\u100A\u1037\u103A\u101E\u1010\u102D\u1015\u1031\u1038\u1001\u103B\u1000\u103A\u1019\u103B\u102C\u1038\u101B\u101B\u103E\u102D\u101B\u1014\u103A \u1021\u1011\u1000\u103A\u1015\u102B\u101B\u103E\u102D push notification \u1019\u103B\u102C\u1038\u1000\u102D\u102F \u1016\u103D\u1004\u1037\u103A\u1015\u102B\u104B'}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
        {/* Speech Rate */}
        <section className="mb-6">
          <SectionHeading
            text={{
              en: 'Speech Rate',
              my: '\u1005\u1000\u102C\u1038\u1015\u103C\u1031\u102C\u1014\u103E\u102F\u1014\u103A\u1038',
            }}
          />
          <Card>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Volume2 className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">
                    Interview Speech Speed
                  </p>
                  {showBurmese && (
                    <p className="font-myanmar text-sm text-muted-foreground">
                      {'\u1021\u1004\u103A\u1010\u102C\u1017\u103B\u1030\u1038\u1005\u1000\u102C\u1038\u1015\u103C\u1031\u102C\u1014\u103E\u102F\u1014\u103A\u1038'}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2" role="radiogroup" aria-label="Speech rate">
                {SPEECH_RATE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={speechRate === option.value}
                    onClick={() => handleSpeechRateChange(option.value)}
                    className={`flex-1 rounded-md border px-3 py-2 text-center text-sm font-medium transition-colors ${
                      speechRate === option.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-card text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <span>{option.en}</span>
                    {showBurmese && (
                      <span className="block font-myanmar text-xs mt-0.5">
                        {option.my}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <p className="text-xs text-muted-foreground">
                Controls how fast the interviewer speaks during practice sessions.
              </p>
              {showBurmese && (
                <p className="font-myanmar text-xs text-muted-foreground">
                  {'\u101C\u1031\u1037\u1000\u103B\u1004\u1037\u103A\u1005\u1005\u103A\u101E\u1014\u103A\u1038\u1019\u103B\u102C\u1038\u1021\u1010\u103D\u1004\u103A\u1038 \u1021\u1004\u103A\u1010\u102C\u1017\u103B\u1030\u1038\u1005\u1000\u102C\u1038\u1015\u103C\u1031\u102C\u101E\u100A\u1037\u103A\u1021\u1019\u103C\u1014\u103A\u1000\u102D\u102F \u1011\u102D\u1014\u103A\u1038\u1001\u103B\u102F\u1015\u103A\u1015\u102B\u104B'}
                </p>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
