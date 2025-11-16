'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { PostgrestError, Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import type { QuestionResult, TestSession, User } from '@/types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  authError: string | null;
  isSavingSession: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  saveTestSession: (payload: Omit<TestSession, 'id'>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const PASS_THRESHOLD = 12;

const mapResponses = (test: any): TestSession => {
  const results: QuestionResult[] = (test.mock_test_responses ?? []).map((response: any): QuestionResult => ({
    questionId: response.question_id,
    questionText_en: response.question_en,
    questionText_my: response.question_my,
    selectedAnswer: {
      text_en: response.selected_answer_en,
      text_my: response.selected_answer_my,
      correct: Boolean(response.is_correct),
    },
    correctAnswer: {
      text_en: response.correct_answer_en,
      text_my: response.correct_answer_my,
      correct: true,
    },
    isCorrect: response.is_correct,
    category: response.category,
  }));

  const derivedScore = results.length
    ? results.filter(result => result.isCorrect).length
    : test.score ?? 0;
  const totalQuestions = test.total_questions ?? (results.length || 20);
  const passed = derivedScore >= PASS_THRESHOLD;

  return {
    id: test.id,
    date: test.completed_at,
    score: derivedScore,
    totalQuestions,
    durationSeconds: test.duration_seconds ?? 0,
    passed,
    results,
  };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSavingSession, setIsSavingSession] = useState(false);

  const syncProfile = useCallback(
    async (payload: { id: string; email: string; full_name: string }) => {
      const { error } = await supabase.from('profiles').upsert(payload);
      if (error && (error as PostgrestError).code !== '42501') {
        throw error;
      }
    },
    []
  );

  const hydrateFromSupabase = useCallback(
    async (session: Session | null) => {
      if (!session?.user) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const authUser: SupabaseUser = session.user;
      const [{ data: profileData }, { data: testsData }] = await Promise.all([
        supabase.from('profiles').select('full_name').eq('id', authUser.id).maybeSingle(),
        supabase
          .from('mock_tests')
          .select(
            `id, completed_at, score, total_questions, duration_seconds, mock_test_responses (
              question_id, question_en, question_my, category, selected_answer_en, selected_answer_my,
              correct_answer_en, correct_answer_my, is_correct
            )`
          )
          .eq('user_id', authUser.id)
          .order('completed_at', { ascending: false }),
      ]);

      const history: TestSession[] = (testsData ?? []).map(mapResponses);

      setUser({
        id: authUser.id,
        email: authUser.email ?? '',
        name: profileData?.full_name ?? authUser.email ?? 'Learner',
        testHistory: history,
      });
      setIsLoading(false);
    },
    []
  );

  useEffect(() => {
    let mounted = true;
    const bootstrap = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      await hydrateFromSupabase(data.session ?? null);
    };
    bootstrap();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      hydrateFromSupabase(session);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [hydrateFromSupabase]);

  const login = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(error.message);
      throw error;
    }
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setAuthError(null);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
        },
      });
      if (error) {
        setAuthError(error.message);
        throw error;
      }
      if (data.user) {
        await syncProfile({ id: data.user.id, email, full_name: name });
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          await hydrateFromSupabase(sessionData.session);
        }
      }
    },
    [hydrateFromSupabase, syncProfile]
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const saveTestSession = useCallback(
    async (session: Omit<TestSession, 'id'>) => {
      if (!user) {
        throw new Error('User must be signed in to save a mock test');
      }
      setIsSavingSession(true);
      try {
        await syncProfile({ id: user.id, email: user.email, full_name: user.name });

        const { data, error } = await supabase
          .from('mock_tests')
          .insert({
            user_id: user.id,
            completed_at: session.date,
            score: session.score,
            total_questions: session.totalQuestions,
            duration_seconds: session.durationSeconds,
          })
          .select('id, completed_at, score, total_questions, duration_seconds')
          .single();

        if (error || !data?.id) {
          throw error ?? new Error('Unable to persist mock test');
        }

        const responsesPayload = session.results.map(result => ({
          mock_test_id: data.id,
          question_id: result.questionId,
          question_en: result.questionText_en,
          question_my: result.questionText_my,
          category: result.category,
          selected_answer_en: result.selectedAnswer.text_en,
          selected_answer_my: result.selectedAnswer.text_my,
          correct_answer_en: result.correctAnswer.text_en,
          correct_answer_my: result.correctAnswer.text_my,
          is_correct: result.isCorrect,
        }));

        if (responsesPayload.length) {
          const { error: responsesError } = await supabase.from('mock_test_responses').insert(responsesPayload);
          if (responsesError) throw responsesError;
        }

        const persistedSession: TestSession = {
          ...session,
          id: data.id,
          date: data.completed_at ?? session.date,
        };

        setUser(prev => (prev ? { ...prev, testHistory: [persistedSession, ...prev.testHistory] } : prev));
        await hydrateFromSupabase((await supabase.auth.getSession()).data.session ?? null);
      } catch (error) {
        console.error('Failed to save mock test session', error);
        throw error;
      } finally {
        setIsSavingSession(false);
      }
    },
    [hydrateFromSupabase, syncProfile, user]
  );

  const value = useMemo(
    () => ({ user, isLoading, authError, isSavingSession, login, register, logout, saveTestSession }),
    [user, isLoading, authError, isSavingSession, login, register, logout, saveTestSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
