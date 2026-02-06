import type { Category } from './index';

/**
 * Row type for the profiles table
 */
export interface ProfileRow {
  id: string;
  email: string;
  full_name: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Row type for the mock_test_responses table
 */
export interface MockTestResponseRow {
  id?: string;
  mock_test_id: string;
  question_id: string;
  question_en: string;
  question_my: string;
  category: Category;
  selected_answer_en: string;
  selected_answer_my: string;
  correct_answer_en: string;
  correct_answer_my: string;
  is_correct: boolean;
  created_at?: string;
}

/**
 * Row type for the mock_tests table with nested responses
 */
export interface MockTestRow {
  id: string;
  user_id: string;
  completed_at: string;
  score: number;
  total_questions: number;
  duration_seconds: number;
  incorrect_count: number;
  end_reason: string;
  passed: boolean;
  created_at?: string;
  mock_test_responses?: MockTestResponseRow[];
}

/**
 * Google OAuth user_metadata structure from Supabase
 */
export interface GoogleUserMetadata {
  avatar_url?: string;
  email?: string;
  email_verified?: boolean;
  full_name?: string;
  iss?: string;
  name?: string;
  phone_verified?: boolean;
  picture?: string;
  provider_id?: string;
  sub?: string;
}

/**
 * Standard email/password user_metadata structure
 */
export interface StandardUserMetadata {
  full_name?: string;
}

/**
 * Union type for all possible user metadata structures
 */
export type UserMetadata = GoogleUserMetadata | StandardUserMetadata;

/**
 * Type guard to check if user_metadata is from Google OAuth
 */
export function isGoogleMetadata(
  metadata: UserMetadata | undefined
): metadata is GoogleUserMetadata {
  if (!metadata) return false;
  // Google OAuth metadata always includes these fields
  return 'iss' in metadata || 'sub' in metadata || 'picture' in metadata;
}
