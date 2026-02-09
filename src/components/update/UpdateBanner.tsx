'use client';

/**
 * Update Banner Component
 *
 * Thin bilingual banner indicating the app has been updated for the
 * USCIS 2025 Civics Test with 128 questions. Placed at the top of
 * relevant pages (Dashboard, Study, Mock Test, Interview).
 *
 * Features:
 * - Bilingual text (English + optional Burmese)
 * - Compact, non-intrusive design
 * - Semantic design tokens (no dark: overrides needed)
 * - Accepts showBurmese prop from LanguageContext
 */

interface UpdateBannerProps {
  /** Whether to show the Burmese translation line */
  showBurmese?: boolean;
  /** Additional CSS classes for positioning customization */
  className?: string;
}

/**
 * Thin informational banner showing "Updated for USCIS 2025 Civics Test".
 *
 * @example
 * ```tsx
 * const { showBurmese } = useLanguage();
 * <UpdateBanner showBurmese={showBurmese} />
 * ```
 */
export function UpdateBanner({ showBurmese = true, className }: UpdateBannerProps) {
  return (
    <div
      className={`bg-primary-subtle border-b border-primary/20 px-4 py-1.5 text-center ${className ?? ''}`}
    >
      <p className="text-xs font-semibold text-primary">
        Updated for USCIS 2025 Civics Test &mdash; 128 Questions
      </p>
      {showBurmese && (
        <p className="font-myanmar text-xs text-primary/80">
          USCIS 2025 နိုင်ငံသားရေးရာစာမေးပွဲအတွက် မွမ်းမံပြီး &mdash; မေးခွန်း ၁၂၈ ခု
        </p>
      )}
    </div>
  );
}
