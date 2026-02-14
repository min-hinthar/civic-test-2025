/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        /* ── Semantic colors (preferred for components) ── */
        background: 'hsl(var(--color-background))',
        foreground: 'hsl(var(--color-text-primary))',
        surface: {
          DEFAULT: 'hsl(var(--color-surface))',
          raised: 'hsl(var(--color-surface-raised))',
          muted: 'hsl(var(--color-surface-muted))',
        },
        primary: {
          DEFAULT: 'hsl(var(--color-primary))',
          foreground: 'hsl(var(--color-text-on-primary))',
          hover: 'hsl(var(--color-primary-hover))',
          active: 'hsl(var(--color-primary-active))',
          disabled: 'hsl(var(--color-primary-disabled))',
          subtle: 'hsl(var(--color-primary-subtle))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--color-secondary))',
          foreground: 'hsl(var(--color-secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--color-destructive))',
          foreground: 'hsl(var(--color-destructive-foreground))',
          hover: 'hsl(var(--color-destructive-hover))',
        },
        muted: {
          DEFAULT: 'hsl(var(--color-surface-muted))',
          foreground: 'hsl(var(--color-text-secondary))',
        },
        accent: {
          DEFAULT: 'hsl(var(--color-accent))',
          foreground: 'hsl(var(--color-accent-foreground))',
        },
        'accent-purple': {
          DEFAULT: 'hsl(var(--color-accent-purple))',
          foreground: 'hsl(var(--color-accent-purple-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--color-surface-raised))',
          foreground: 'hsl(var(--color-text-primary))',
        },
        card: {
          DEFAULT: 'hsl(var(--color-surface))',
          foreground: 'hsl(var(--color-text-primary))',
        },
        border: 'hsl(var(--color-border))',
        input: 'hsl(var(--color-input))',
        ring: 'hsl(var(--color-ring))',

        /* ── Feedback colors (reference CSS variable tokens) ── */
        success: {
          DEFAULT: 'hsl(var(--color-success))',
          foreground: 'hsl(var(--color-success-foreground))',
          subtle: 'hsl(var(--color-success-subtle))',
          50: 'hsl(var(--green-50))',
          100: 'hsl(var(--green-100))',
          500: 'hsl(var(--green-500))',
          600: 'hsl(var(--green-600))',
        },
        warning: {
          DEFAULT: 'hsl(var(--color-warning))',
          foreground: 'hsl(var(--color-warning-foreground))',
          subtle: 'hsl(var(--color-warning-subtle))',
          50: 'hsl(var(--amber-50))',
          100: 'hsl(var(--amber-100))',
          500: 'hsl(var(--amber-500))',
          600: 'hsl(var(--amber-600))',
        },
        patriotic: {
          DEFAULT: 'hsl(var(--color-patriotic-red))',
          500: 'hsl(var(--patriotic-red))',
        },

        /* ── Primitive palette (available for flexibility) ── */
        'primary-50': 'hsl(var(--blue-50))',
        'primary-100': 'hsl(var(--blue-100))',
        'primary-200': 'hsl(var(--blue-200))',
        'primary-300': 'hsl(var(--blue-300))',
        'primary-400': 'hsl(var(--blue-400))',
        'primary-500': 'hsl(var(--blue-500))',
        'primary-600': 'hsl(var(--blue-600))',
        'primary-700': 'hsl(var(--blue-700))',
        'primary-800': 'hsl(var(--blue-800))',
        'primary-900': 'hsl(var(--blue-900))',

        /* ── Status colors ── */
        status: {
          online: 'hsl(var(--color-status-online))',
          offline: 'hsl(var(--color-status-offline))',
          syncing: 'hsl(var(--color-status-syncing))',
          error: 'hsl(var(--color-status-error))',
        },

        /* ── Chart/category colors ── */
        chart: {
          blue: 'hsl(var(--color-chart-blue))',
          amber: 'hsl(var(--color-chart-amber))',
          emerald: 'hsl(var(--color-chart-emerald))',
        },
        category: {
          democracy: 'hsl(var(--color-category-democracy))',
          government: 'hsl(var(--color-category-government))',
          rights: 'hsl(var(--color-category-rights))',
          colonial: 'hsl(var(--color-category-colonial))',
          '1800s': 'hsl(var(--color-category-1800s))',
          recent: 'hsl(var(--color-category-recent))',
          symbols: 'hsl(var(--color-category-symbols))',
        },
      },
      borderRadius: {
        DEFAULT: 'var(--radius-md)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-3xl)',
        '4xl': '2.5rem',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-md)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        chunky: 'var(--shadow-chunky)',
        'chunky-active': 'var(--shadow-chunky-active)',
      },
      transitionDuration: {
        instant: 'var(--duration-instant)',
        fast: 'var(--duration-fast)',
        normal: 'var(--duration-normal)',
        slow: 'var(--duration-slow)',
        page: 'var(--duration-page)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
