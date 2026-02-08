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
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // Extended primary blue shades (Phase 3)
        'primary-50': 'hsl(214 100% 97%)',
        'primary-100': 'hsl(214 95% 93%)',
        'primary-200': 'hsl(213 97% 87%)',
        'primary-300': 'hsl(212 96% 78%)',
        'primary-400': 'hsl(213 94% 68%)',
        'primary-500': 'hsl(217 91% 60%)',
        'primary-600': 'hsl(221 83% 53%)',
        'primary-700': 'hsl(224 76% 48%)',
        'primary-800': 'hsl(226 71% 40%)',
        'primary-900': 'hsl(224 64% 33%)',
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        'accent-purple': {
          DEFAULT: 'hsl(var(--accent-purple))',
          foreground: 'hsl(var(--accent-purple-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Feedback colors (Phase 3)
        success: {
          50: 'hsl(142 76% 95%)',
          100: 'hsl(141 84% 86%)',
          500: 'hsl(142 71% 45%)',
          600: 'hsl(142 76% 36%)',
        },
        warning: {
          50: 'hsl(38 92% 95%)',
          100: 'hsl(39 96% 89%)',
          500: 'hsl(32 95% 52%)',
          600: 'hsl(26 90% 45%)',
        },
        patriotic: {
          500: 'hsl(0 72% 51%)',
          600: 'hsl(0 74% 42%)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        // Extended radii for bubbly Phase 3 design
        '3xl': '2rem',
        '4xl': '2.5rem',
      },
      boxShadow: {
        chunky: '0 4px 0 hsl(var(--primary-700))',
        'chunky-active': '0 1px 0 hsl(var(--primary-700))',
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
