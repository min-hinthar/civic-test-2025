# Technology Stack

**Analysis Date:** 2026-02-05

## Languages

**Primary:**
- TypeScript 5.8.2 - All source code (`src/` directory)
- React 19.2.0 - UI components and frontend logic

**Secondary:**
- JavaScript - Configuration files (Next.js, Tailwind, PostCSS)
- CSS - Tailwind-based styling with HSL variables

## Runtime

**Environment:**
- Node.js - Required for development and build

**Package Manager:**
- npm - Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js 15.1.6 - Full-stack React framework with built-in routing
- React Router DOM 7.0.2 - Client-side routing for single-page navigation

**UI & Styling:**
- Tailwind CSS 3.4.17 - Utility-first CSS framework
- Tailwind CSS Animate 1.0.7 - Animation utilities
- Autoprefixer 10.4.20 - CSS vendor prefixes
- PostCSS 8.4.49 - CSS transformations
- Lucide React 0.475.0 - Icon library

**Utilities:**
- Marked 17.0.0 - Markdown parsing
- clsx 2.1.1 - Conditional className utility
- dotenv 17.2.3 - Environment variable management

**Testing:**
- Not detected - No test framework configured

**Build/Dev:**
- ESLint 9.17.0 - Linting
- ESLint Config Next 15.1.6 - Next.js specific linting rules
- TypeScript - Type checking

## Key Dependencies

**Critical:**
- @supabase/supabase-js 2.81.1 - Database and authentication backend
- react-router-dom 7.0.2 - Essential for page navigation and routing
- next 15.1.6 - Framework for React application

**Infrastructure:**
- @sentry/nextjs 10.26.0 - Error tracking and monitoring

## Configuration

**Environment:**
- `.env.local` file present - Development environment variables
- Environment variables required:
  - `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
  - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - Google OAuth Client ID
  - Sentry DSN (configured in `sentry.server.config.ts`)

**Build:**
- `next.config.mjs` - Next.js configuration with Sentry wrapper
- `tsconfig.json` - TypeScript compiler options
- `tailwind.config.js` - Tailwind CSS theme configuration
- `postcss.config.js` - PostCSS processing pipeline

## Platform Requirements

**Development:**
- Node.js runtime
- npm or compatible package manager
- Modern browser with ES2017+ support

**Production:**
- Vercel (inferred from `next.config.mjs` - Sentry Vercel Cron Monitors enabled)
- Server runtime compatible with Node.js

## Scripts

**Build & Run:**
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build optimized production bundle
- `npm start` - Start production server
- `npm run lint` - Run ESLint checks

---

*Stack analysis: 2026-02-05*
