# Civic Test Prep (English • Burmese)

A Next.js-powered, mobile-first experience that helps Burmese-speaking learners master the U.S. citizenship civics interview. The app uses Supabase for authentication and attempt storage, animated bilingual study cards, and a randomized 20-question mock test with analytics.

## Highlights

- **Supabase auth + history sync** – Email/password accounts (stored in `profiles`) automatically sync attempts + per-question results to `mock_tests` and `mock_test_responses`.
- **Next.js + React Router SPA shell** – We render a single-page experience (Landing, Auth, Dashboard, Test, Study, History) inside Next.js for fast transitions, SEO via `react-helmet`, and Tailwind styling.
- **Bilingual flip-card study guide** – Category color-coded cards flip between English prompts and Burmese answers with filtering controls.
- **Timed mock exams** – Randomized 20-question set, 20-minute countdown, 3 distractors + 1 correct answer, bilingual review, and Supabase persistence.
- **Analytics dashboard** – Score trend line chart, category accuracy bars, and full attempt log so learners can target weak areas.

## Supabase setup

1. Run the SQL located at [`supabase/schema.sql`](supabase/schema.sql) inside your Supabase project to create the tables + RLS policies.
2. The project is pre-configured with the provided Supabase URL/key. To override, create `.env.local` with:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

## Development

```bash
npm install
npm run dev
```

Navigate to `http://localhost:3000` – the optional catch-all Next.js route renders the SPA shell so any deep links (e.g., `/dashboard`) work with client-side routing.

## Data source

The bilingual civics bank (100 detailed questions + 28 placeholders to reach 128) powers both the mock test and flip cards. You can edit it in [`src/constants/civicsQuestions.ts`](src/constants/civicsQuestions.ts).
