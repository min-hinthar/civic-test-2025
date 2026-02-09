'use client';

import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { ChevronLeft, ChevronDown, ChevronRight, TrendingUp, Trophy } from 'lucide-react';
import clsx from 'clsx';
import AppNavigation from '@/components/AppNavigation';
import { SectionHeading } from '@/components/bilingual/BilingualHeading';
import { BilingualButton } from '@/components/bilingual/BilingualButton';
import { Card, CardContent } from '@/components/ui/Card';
import { CategoryRing } from '@/components/progress/CategoryRing';
import { MasteryBadge } from '@/components/progress/MasteryBadge';
import { SkillTreePath } from '@/components/progress/SkillTreePath';
import { StaggeredList, StaggeredItem, FadeIn } from '@/components/animations/StaggeredList';
import { useCategoryMastery } from '@/hooks/useCategoryMastery';
import {
  USCIS_CATEGORIES,
  CATEGORY_COLORS,
  SUB_CATEGORY_NAMES,
  getCategoryQuestionIds,
  calculateQuestionAccuracy,
  getAnswerHistory,
} from '@/lib/mastery';
import type { USCISCategory, StoredAnswer } from '@/lib/mastery';
import { allQuestions, totalQuestions } from '@/constants/questions';
import { useLanguage } from '@/contexts/LanguageContext';
import { strings } from '@/lib/i18n/strings';
import { useAuth } from '@/contexts/SupabaseAuthContext';

/** Color values for chart lines, matching category color tokens */
const CHART_COLORS: Record<string, string> = {
  blue: '#3B82F6',
  amber: '#F59E0B',
  emerald: '#10B981',
};

/** Tailwind ring color classes per category color */
const ringColorClasses: Record<string, string> = {
  blue: 'text-blue-500',
  amber: 'text-amber-500',
  emerald: 'text-emerald-500',
};

/** Category card border accent classes */
const cardAccentClasses: Record<string, string> = {
  blue: 'border-l-blue-500',
  amber: 'border-l-amber-500',
  emerald: 'border-l-emerald-500',
};

/** Sub-category progress bar color classes */
const barColorClasses: Record<string, { bg: string; track: string }> = {
  blue: { bg: 'bg-blue-500', track: 'bg-blue-100 dark:bg-blue-950/30' },
  amber: { bg: 'bg-amber-500', track: 'bg-amber-100 dark:bg-amber-950/30' },
  emerald: { bg: 'bg-emerald-500', track: 'bg-emerald-100 dark:bg-emerald-950/30' },
};

/**
 * Build trend chart data from test history.
 * Groups tests by date and computes per-category accuracy for each date.
 */
function buildTrendData(
  history: Array<{
    date: string;
    results: Array<{ questionId: string; category: string; isCorrect: boolean }>;
  }>
): Array<Record<string, string | number>> {
  if (!history || history.length < 2) return [];

  // Group results by date
  const byDate = new Map<string, Record<string, { correct: number; total: number }>>();

  // Process in chronological order
  const sorted = [...history].reverse();
  for (const session of sorted) {
    const dateStr = new Date(session.date).toLocaleDateString();
    if (!byDate.has(dateStr)) {
      byDate.set(dateStr, {});
    }
    const dateEntry = byDate.get(dateStr)!;

    for (const result of session.results) {
      // Find which USCIS main category this belongs to
      const mainCategory = findMainCategory(result.category);
      if (!mainCategory) continue;

      if (!dateEntry[mainCategory]) {
        dateEntry[mainCategory] = { correct: 0, total: 0 };
      }
      dateEntry[mainCategory].total++;
      if (result.isCorrect) {
        dateEntry[mainCategory].correct++;
      }
    }
  }

  // Convert to chart data format
  const chartData: Array<Record<string, string | number>> = [];
  for (const [date, categories] of byDate.entries()) {
    const point: Record<string, string | number> = { date };
    for (const [cat, stats] of Object.entries(categories)) {
      point[cat] = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    }
    chartData.push(point);
  }

  return chartData;
}

/** Find the main USCIS category for a sub-category string */
function findMainCategory(subCategory: string): USCISCategory | null {
  for (const [mainCat, def] of Object.entries(USCIS_CATEGORIES)) {
    if (def.subCategories.includes(subCategory as never) || mainCat === subCategory) {
      return mainCat as USCISCategory;
    }
  }
  return null;
}

const ProgressPage = () => {
  const navigate = useNavigate();
  const { showBurmese } = useLanguage();
  const { user } = useAuth();
  const { categoryMasteries, subCategoryMasteries, overallMastery, isLoading } =
    useCategoryMastery();

  // Track which categories are expanded
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  // Track which sub-categories show individual questions
  const [expandedSubCategories, setExpandedSubCategories] = useState<Set<string>>(new Set());

  // Load raw answer history for per-question accuracy
  const [answers, setAnswers] = useState<StoredAnswer[]>([]);
  useEffect(() => {
    let cancelled = false;
    getAnswerHistory().then(history => {
      if (!cancelled) setAnswers(history);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const history = useMemo(() => user?.testHistory ?? [], [user?.testHistory]);

  // Count questions practiced
  const practicedQuestionIds = useMemo(() => {
    const ids = new Set<string>();
    for (const answer of answers) {
      ids.add(answer.questionId);
    }
    return ids;
  }, [answers]);

  // Build trend chart data
  const trendData = useMemo(() => buildTrendData(history), [history]);

  const categories = Object.keys(USCIS_CATEGORIES) as USCISCategory[];

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const toggleSubCategory = (subCategory: string) => {
    setExpandedSubCategories(prev => {
      const next = new Set(prev);
      if (next.has(subCategory)) {
        next.delete(subCategory);
      } else {
        next.add(subCategory);
      }
      return next;
    });
  };

  // Handle skill tree node click -- navigate to practice that sub-category
  const handleNodeClick = (subCategory: string) => {
    navigate(`/study?category=${encodeURIComponent(subCategory)}#cards`);
  };

  return (
    <div className="page-shell">
      <AppNavigation />
      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* Page header with trophy -- Duolingo bold style */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-3 mb-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <h1 className="text-3xl font-extrabold text-foreground">Skill Progress</h1>
            <Trophy className="h-8 w-8 text-yellow-500" />
          </div>
          {showBurmese && (
            <p className="text-lg font-myanmar text-muted-foreground">
              {'ကျွမ်းကျင်မှု တိုးတက်မှု'}
            </p>
          )}
        </div>

        {/* Back to dashboard link */}
        <Link
          to="/dashboard"
          className="mb-8 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline min-h-[44px]"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>
            Back to Dashboard
            {showBurmese && (
              <span className="font-myanmar ml-1 text-muted-foreground">/{'ဒက်ရှ်ဘုတ်သို့'}</span>
            )}
          </span>
        </Link>

        {/* Loading state */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Overall mastery summary card */}
            <FadeIn>
              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <CategoryRing
                      percentage={overallMastery}
                      color="text-primary-500"
                      size={140}
                      strokeWidth={12}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-3xl font-extrabold text-foreground tabular-nums">
                          {overallMastery}%
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          {strings.progress.overallReadiness.en}
                        </span>
                      </div>
                    </CategoryRing>

                    <div className="flex-1 text-center sm:text-left">
                      <h2 className="text-xl font-bold text-foreground mb-1">
                        {overallMastery >= 80
                          ? 'Almost Ready!'
                          : overallMastery >= 50
                            ? 'Making Progress!'
                            : 'Keep Going!'}
                      </h2>
                      {showBurmese && (
                        <p className="text-sm font-myanmar text-muted-foreground mb-2">
                          {overallMastery >= 80
                            ? 'အဆင်သင့်ဖြစ်ပြီ!'
                            : overallMastery >= 50
                              ? 'တိုးတက်နေပါတယ်!'
                              : 'ဆက်လက်ပါ!'}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {practicedQuestionIds.size} of {totalQuestions} questions practiced
                        {showBurmese && (
                          <span className="block font-myanmar mt-0.5">
                            {'မေးခွန်း'} {practicedQuestionIds.size} / {totalQuestions}{' '}
                            {'လေ့ကျင့်ပြီး'}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            {/* Skill Tree Path -- main content */}
            <FadeIn delay={100}>
              <section className="mb-10">
                <SectionHeading
                  text={{
                    en: 'Skill Tree',
                    my: 'ကျွမ်းကျင်မှု လမ်းကြောင်း',
                  }}
                />
                <Card className="overflow-visible">
                  <CardContent className="px-2 py-6 sm:px-6">
                    {practicedQuestionIds.size === 0 ? (
                      /* Empty state */
                      <div className="text-center py-8">
                        <div className="text-5xl mb-4">{'\u{1F331}'}</div>
                        <p className="text-base font-semibold text-foreground mb-1">
                          Start your journey!
                        </p>
                        {showBurmese && (
                          <p className="text-sm font-myanmar text-muted-foreground mb-4">
                            {'သင့်ခရီးစတင်ပါ!'}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                          Practice questions to unlock nodes and earn bronze, silver, and gold
                          medals.
                          {showBurmese && (
                            <span className="block font-myanmar mt-1">
                              {'မေးခွန်းများ လေ့ကျင့်ပြီး တံဆိပ်များ ရယူပါ။'}
                            </span>
                          )}
                        </p>
                      </div>
                    ) : (
                      <SkillTreePath
                        subcategoryMastery={subCategoryMasteries}
                        onNodeClick={handleNodeClick}
                      />
                    )}
                  </CardContent>
                </Card>
              </section>
            </FadeIn>

            {/* Category breakdown cards */}
            <section className="mb-10">
              <SectionHeading text={strings.progress.categoryProgress} />

              <StaggeredList className="space-y-4">
                {categories.map(category => {
                  const def = USCIS_CATEGORIES[category];
                  const color = CATEGORY_COLORS[category];
                  const mastery = categoryMasteries[category] ?? 0;
                  const ringColor = ringColorClasses[color] ?? 'text-blue-500';
                  const isExpanded = expandedCategories.has(category);
                  const barColors = barColorClasses[color] ?? barColorClasses.blue;
                  const accent = cardAccentClasses[color] ?? '';

                  return (
                    <StaggeredItem key={category}>
                      <Card className={clsx('border-l-4 overflow-hidden', accent)}>
                        <CardContent className="p-5">
                          {/* Category header row */}
                          <button
                            type="button"
                            className="flex w-full items-center gap-4 text-left min-h-[44px]"
                            onClick={() => toggleCategory(category)}
                            aria-expanded={isExpanded}
                            aria-label={`${category} - ${mastery}% mastery`}
                          >
                            <CategoryRing
                              percentage={mastery}
                              color={ringColor}
                              size={80}
                              strokeWidth={7}
                            >
                              <span className="text-lg font-bold text-foreground tabular-nums">
                                {mastery}%
                              </span>
                            </CategoryRing>

                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-semibold text-foreground">
                                {def.name.en}
                              </h3>
                              {showBurmese && (
                                <p className="text-sm font-myanmar text-muted-foreground">
                                  {def.name.my}
                                </p>
                              )}
                            </div>

                            <MasteryBadge mastery={mastery} size="md" />

                            <ChevronDown
                              className={clsx(
                                'h-5 w-5 text-muted-foreground transition-transform',
                                isExpanded && 'rotate-180'
                              )}
                            />
                          </button>

                          {/* Expanded sub-categories */}
                          {isExpanded && (
                            <div className="mt-5 space-y-4 border-t border-border/60 pt-4">
                              {def.subCategories.map(subCategory => {
                                const subMastery = subCategoryMasteries[subCategory] ?? 0;
                                const subName = SUB_CATEGORY_NAMES[subCategory];
                                const isSubExpanded = expandedSubCategories.has(subCategory);
                                const subQuestionIds = getCategoryQuestionIds(
                                  subCategory,
                                  allQuestions
                                );

                                return (
                                  <div key={subCategory}>
                                    {/* Sub-category header */}
                                    <button
                                      type="button"
                                      className="flex w-full items-center gap-2 text-left min-h-[36px]"
                                      onClick={() => toggleSubCategory(subCategory)}
                                      aria-expanded={isSubExpanded}
                                    >
                                      <ChevronRight
                                        className={clsx(
                                          'h-4 w-4 text-muted-foreground transition-transform flex-shrink-0',
                                          isSubExpanded && 'rotate-90'
                                        )}
                                      />
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                          <span className="text-sm font-medium text-foreground truncate">
                                            {subName?.en ?? subCategory}
                                          </span>
                                          <span className="text-sm font-semibold text-muted-foreground tabular-nums ml-2">
                                            {subMastery}%
                                          </span>
                                        </div>
                                        {showBurmese && subName?.my && (
                                          <p className="text-xs font-myanmar text-muted-foreground truncate">
                                            {subName.my}
                                          </p>
                                        )}
                                      </div>
                                    </button>

                                    {/* Progress bar */}
                                    <div className="ml-6 mt-1">
                                      <div
                                        className={clsx(
                                          'h-1.5 rounded-full overflow-hidden',
                                          barColors.track
                                        )}
                                      >
                                        <div
                                          className={clsx(
                                            'h-full rounded-full transition-all',
                                            barColors.bg
                                          )}
                                          style={{ width: `${subMastery}%` }}
                                        />
                                      </div>
                                    </div>

                                    {/* Individual question rows */}
                                    {isSubExpanded && (
                                      <div className="ml-6 mt-2 space-y-1.5">
                                        {subQuestionIds.map(qId => {
                                          const question = allQuestions.find(q => q.id === qId);
                                          if (!question) return null;
                                          const accuracy = calculateQuestionAccuracy(answers, qId);

                                          return (
                                            <div
                                              key={qId}
                                              className="flex items-start gap-2 rounded-lg bg-muted/30 px-3 py-2 text-sm"
                                            >
                                              <div className="flex-1 min-w-0">
                                                <p className="text-foreground leading-snug">
                                                  {question.question_en}
                                                </p>
                                                {showBurmese && (
                                                  <p className="text-xs font-myanmar text-muted-foreground mt-0.5 leading-relaxed">
                                                    {question.question_my}
                                                  </p>
                                                )}
                                              </div>
                                              <span
                                                className={clsx(
                                                  'text-xs font-semibold tabular-nums whitespace-nowrap mt-0.5',
                                                  accuracy.total === 0
                                                    ? 'text-muted-foreground'
                                                    : accuracy.accuracy >= 80
                                                      ? 'text-emerald-600 dark:text-emerald-400'
                                                      : accuracy.accuracy >= 50
                                                        ? 'text-amber-600 dark:text-amber-400'
                                                        : 'text-warning-500'
                                                )}
                                              >
                                                {accuracy.total === 0
                                                  ? 'Not tried'
                                                  : `${accuracy.correct}/${accuracy.total} (${Math.round(accuracy.accuracy)}%)`}
                                              </span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}

                              {/* Practice this category button */}
                              <div className="pt-2">
                                <BilingualButton
                                  label={{
                                    en: `Practice ${def.name.en} (${mastery}%)`,
                                    my: `${def.name.my} လေ့ကျင့်ပါ`,
                                  }}
                                  variant="outline"
                                  size="sm"
                                  fullWidth
                                  onClick={() =>
                                    navigate(
                                      `/study?category=${encodeURIComponent(category)}#cards`
                                    )
                                  }
                                />
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </StaggeredItem>
                  );
                })}
              </StaggeredList>
            </section>

            {/* Mastery trend line chart */}
            {trendData.length > 1 && (
              <FadeIn delay={200}>
                <section className="mb-10">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <SectionHeading text={strings.progress.masteryTrend} className="mb-0" />
                  </div>

                  <Card>
                    <CardContent className="p-4">
                      <div className="h-64 w-full">
                        <ResponsiveContainer>
                          <LineChart
                            data={trendData}
                            margin={{ left: 0, right: 10, top: 10, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.3} />
                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                            <YAxis
                              domain={[0, 100]}
                              tickFormatter={value => `${value}%`}
                              stroke="#94a3b8"
                              fontSize={12}
                            />
                            <Tooltip
                              formatter={value => `${Number(value).toFixed(0)}%`}
                              contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                borderRadius: '1rem',
                                border: '1px solid hsl(var(--border))',
                              }}
                            />
                            <Legend />
                            {categories.map(cat => {
                              const color = CATEGORY_COLORS[cat];
                              return (
                                <Line
                                  key={cat}
                                  type="monotone"
                                  dataKey={cat}
                                  name={USCIS_CATEGORIES[cat].name.en}
                                  stroke={CHART_COLORS[color] ?? '#6366f1'}
                                  strokeWidth={2.5}
                                  dot={{ r: 3 }}
                                  connectNulls
                                />
                              );
                            })}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </section>
              </FadeIn>
            )}

            {/* Empty state for trend */}
            {trendData.length <= 1 && (
              <FadeIn delay={200}>
                <section className="mb-10 text-center py-8">
                  <TrendingUp className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Complete at least 2 tests to see your mastery trend chart.
                    {showBurmese && (
                      <span className="block font-myanmar mt-0.5">
                        {"လမ်းကြောင်းချက်ကိုကြည့်ရန် အနည်းဆုံး စာမေးပွဲ '2' ခု ဖြေဆိုပါ။"}
                      </span>
                    )}
                  </p>
                </section>
              </FadeIn>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProgressPage;
