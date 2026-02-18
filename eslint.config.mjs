import js from '@eslint/js';
import globals from 'globals';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import reactHooks from 'eslint-plugin-react-hooks';
import next from '@next/eslint-plugin-next';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  {
    ignores: ['.next/**', 'node_modules/**', 'dist/**', 'coverage/**', 'out/**'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      '@typescript-eslint': tseslint,
      'react-hooks': reactHooks,
      '@next/next': next,
      'jsx-a11y': jsxA11y,
    },
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.serviceworker,
        google: 'readonly',
        React: 'readonly',
        SpeechSynthesis: 'readonly',
        SpeechSynthesisVoice: 'readonly',
      },
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      // Project intentionally uses autoFocus for modal dialogs and UX flows
      'jsx-a11y/no-autofocus': 'off',
      // Flashcard, practice session, and progress bar use intentional click/key handlers on divs
      // These components manage focus programmatically (e.g., useRovingFocus, keyboard nav)
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/no-noninteractive-element-interactions': 'warn',
      // PillTabBar assigns tablist role to div (standard WAI-ARIA pattern)
      'jsx-a11y/no-noninteractive-element-to-interactive-role': 'warn',
      // AnswerOptionGroup uses roving focus on radio children, not the group container
      'jsx-a11y/interactive-supports-focus': 'warn',
      // SegmentedProgressBar listitem becomes tappable for question review
      'jsx-a11y/no-noninteractive-tabindex': 'warn',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // Disable no-undef for TS files - TypeScript compiler handles this better
      // and knows about DOM types like NotificationPermission, WindowClient, etc.
      'no-undef': 'off',
    },
  },
  prettier,
];
