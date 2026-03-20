import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/types/**',
        'src/__tests__/**',
      ],
      thresholds: {
        // Global coverage floor
        global: {
          lines: 40,
          functions: 40,
          branches: 30,
          statements: 40,
        },
        // Existing per-file thresholds (preserved)
        'src/lib/shuffle.ts': {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100,
        },
        'src/lib/saveSession.ts': {
          lines: 70,
          functions: 70,
          branches: 70,
          statements: 70,
        },
        'src/lib/errorSanitizer.ts': {
          lines: 90,
          functions: 90,
          branches: 90,
          statements: 90,
        },
        'src/components/ErrorBoundary.tsx': {
          lines: 70,
          functions: 70,
          branches: 70,
          statements: 70,
        },
        // Per-file thresholds based on actual coverage (floored to integer)
        // Coverage output columns: % Stmts | % Branch | % Funcs | % Lines
        'src/lib/async/safeAsync.ts': {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
        'src/lib/async/withRetry.ts': {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
        'src/lib/audio/audioPrecache.ts': {
          statements: 97,
          branches: 100,
          functions: 100,
          lines: 97,
        },
        'src/lib/historyGuard.ts': {
          statements: 85,
          branches: 75,
          functions: 100,
          lines: 94,
        },
        'src/lib/interview/answerGrader.ts': {
          statements: 85,
          branches: 69,
          functions: 100,
          lines: 87,
        },
        'src/lib/mastery/calculateMastery.ts': {
          statements: 95,
          branches: 83,
          functions: 100,
          lines: 94,
        },
        'src/lib/mastery/nudgeMessages.ts': {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
        'src/lib/mastery/weakAreaDetection.ts': {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
        'src/lib/nba/determineNBA.ts': {
          statements: 78,
          branches: 76,
          functions: 80,
          lines: 79,
        },
        'src/lib/readiness/drillSelection.ts': {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
        'src/lib/readiness/readinessEngine.ts': {
          statements: 100,
          branches: 79,
          functions: 100,
          lines: 100,
        },
        'src/lib/social/badgeEngine.ts': {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
        'src/lib/social/compositeScore.ts': {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
        'src/lib/social/streakTracker.ts': {
          statements: 98,
          branches: 92,
          functions: 100,
          lines: 100,
        },
        'src/lib/sort/sortReducer.ts': {
          statements: 96,
          branches: 95,
          functions: 100,
          lines: 96,
        },
        'src/lib/srs/fsrsEngine.ts': {
          statements: 100,
          branches: 96,
          functions: 100,
          lines: 100,
        },
        'src/lib/ttsCore.ts': {
          statements: 80,
          branches: 70,
          functions: 87,
          lines: 82,
        },
        'src/lib/studyPlan/studyPlanEngine.ts': {
          statements: 98,
          branches: 89,
          functions: 100,
          lines: 98,
        },
        'src/lib/bookmarks/bookmarkSync.ts': {
          statements: 72,
          branches: 75,
          functions: 100,
          lines: 80,
        },
        'src/lib/settings/settingsSync.ts': {
          statements: 40,
          branches: 57,
          functions: 83,
          lines: 40,
        },
        'src/lib/social/streakSync.ts': {
          statements: 31,
          branches: 0,
          functions: 33,
          lines: 32,
        },
      },
    },
  },
});
