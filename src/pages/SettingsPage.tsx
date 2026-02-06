'use client';

/**
 * Settings Page
 *
 * User preferences including notification settings.
 * Bilingual English-Burmese interface.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings } from 'lucide-react';
import { NotificationSettings } from '@/components/pwa/NotificationSettings';

export default function SettingsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="container mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="rounded-md p-1 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Settings className="h-5 w-5 text-[#002868]" />
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="font-myanmar text-sm text-gray-500 dark:text-gray-400">
              {'\u1006\u1000\u103A\u1010\u1004\u103A\u1019\u103B\u102C\u1038'}
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto max-w-2xl px-4 py-6">
        <section className="mb-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-200">
            Notifications /{' '}
            <span className="font-myanmar">
              {
                '\u1021\u1000\u103C\u1031\u102C\u1004\u103A\u1038\u1000\u103C\u102C\u1038\u1001\u103B\u1000\u103A\u1019\u103B\u102C\u1038'
              }
            </span>
          </h2>
          <NotificationSettings />
        </section>
      </main>
    </div>
  );
}
