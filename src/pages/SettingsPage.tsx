'use client';

/**
 * Settings Page
 *
 * User preferences including language and notification settings.
 * Bilingual English-Burmese interface.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings } from 'lucide-react';
import { NotificationSettings } from '@/components/pwa/NotificationSettings';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { SectionHeading } from '@/components/bilingual/BilingualHeading';
import { Card, CardContent } from '@/components/ui/Card';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { showBurmese } = useLanguage();

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
        <section className="mb-6">
          <SectionHeading
            text={{
              en: 'Notifications',
              my: '\u1021\u1000\u103C\u1031\u102C\u1004\u103A\u1038\u1000\u103C\u102C\u1038\u1001\u103B\u1000\u103A\u1019\u103B\u102C\u1038',
            }}
          />
          <NotificationSettings />
        </section>
      </main>
    </div>
  );
}
