---
phase: 29-visual-foundation
plan: 07
type: audit
---

# Micro-Interaction Audit

Baseline: 36 whileTap/whileHover occurrences across 18 source files.
88 files have onClick handlers. Classification below.

## HAS: whileTap/whileHover with spring config

| File | Mechanism |
|------|-----------|
| Button.tsx | whileTap + whileHover, SPRING_BOUNCY |
| BilingualButton.tsx | whileTap + whileHover, SPRING_BOUNCY |
| Card.tsx | whileHover (interactive variant) |
| NavItem.tsx | whileTap |
| ThemeToggle.tsx | whileTap |
| LanguageToggle.tsx | whileTap + whileHover |
| FlagToggle.tsx | whileTap + whileHover |
| Sidebar.tsx | whileTap |
| ReviewCard.tsx | whileTap |
| SelfGradeButtons.tsx | whileTap + whileHover |
| RatingButtons.tsx | whileTap + whileHover, spring |
| ShareButton.tsx | whileTap + whileHover |
| AddToDeckButton.tsx | whileTap + whileHover |
| BadgeGrid.tsx | whileTap + whileHover |
| BadgeHighlights.tsx | whileTap + whileHover |
| SessionSetup.tsx | whileTap, spring |
| AchievementsTab.tsx | whileTap + whileHover |
| InterviewResults.tsx | whileTap on "Add All" and "Dashboard" buttons |

## N/A: CSS chunky 3D active press feedback (no whileTap needed)

| File | Mechanism |
|------|-----------|
| AnswerOption.tsx | active:translate-y-[3px] + active:shadow 3D press |
| SkipButton.tsx | active:translate-y-[2px] + active:shadow 3D press |
| KnowDontKnowButtons.tsx | active:translate-y-[3px] + active:shadow 3D press |

## N/A: Non-interactive or parent handles interaction

| File | Reason |
|------|--------|
| ErrorBoundary.tsx | Error recovery, rare interaction |
| GoogleOneTapSignIn.tsx | External Google widget |
| SegmentedProgressBar.tsx | Non-interactive display |
| CircularTimer.tsx | Non-interactive display |
| SessionCountdown.tsx | Non-interactive display |
| SortCountdown.tsx | Non-interactive display |
| UnfinishedBanner.tsx | Uses BilingualButton (HAS) |
| ResumePromptModal.tsx | Uses ResumeSessionCard (below) |
| StartFreshConfirm.tsx | Uses BilingualButton (HAS) |
| ExitConfirmDialog.tsx | Uses BilingualButton (HAS) |
| WelcomeModal.tsx | Uses Button (HAS) |
| NotificationPrePrompt.tsx | Uses Button (HAS) |
| InstallPrompt.tsx | Uses Button (HAS) |
| IOSTip.tsx | Simple dismiss button, minimal priority |
| WhatsNewModal.tsx | Uses BilingualButton (HAS) |
| WelcomeScreen.tsx | Uses BilingualButton (HAS) |
| SocialOptInFlow.tsx | Uses BilingualButton (HAS) |
| SocialSettings.tsx | Toggle switches, minimal priority |
| AuthPage.tsx | Uses Button (HAS) |
| LandingPage.tsx | Uses BilingualButton/Button (HAS) |
| InterviewSetup.tsx | Uses BilingualButton (HAS) |
| InterviewSession.tsx | Uses SelfGradeButtons (HAS) |
| TranscriptionReview.tsx | Uses BilingualButton (HAS) |
| AnswerReveal.tsx | Uses BilingualButton (HAS) |
| ReviewSession.tsx | Uses RatingButtons (HAS) |
| DeckManager.tsx | Uses Button (HAS) |
| SessionSummary.tsx | Uses BilingualButton (HAS) |
| SRSBatchAdd.tsx | Uses Button (HAS) |
| FlashcardStack.tsx | Card flip interaction, specialized |
| Flashcard3D.tsx | 3D flip interaction, specialized |
| MasteryMilestone.tsx | Celebration dismissal only |
| SRSWidget.tsx | Uses Button (HAS) |
| RoundSummary.tsx | Uses BilingualButton (HAS) |
| SortModeContainer.tsx | Uses KnowDontKnowButtons (N/A) |
| BottomTabBar.tsx | Uses NavItem (HAS) |
| QuizHeader.tsx | Back button, minimal priority |
| FeedbackPanel.tsx | Container only |
| TimerExtensionToast.tsx | Transient toast button |
| BadgeCelebration.tsx | Uses BilingualButton (HAS) |
| LeaderboardTable.tsx | Non-interactive rows |
| LeaderboardProfile.tsx | Non-interactive display |
| ShareCardPreview.tsx | Non-interactive preview |
| WeakAreaNudge.tsx | Uses BilingualButton (HAS) |
| InterviewTranscript.tsx | Uses SpeechButton (interactive) |
| SpeechButton.tsx | CSS animation-based feedback |
| BurmeseSpeechButton.tsx | CSS animation-based feedback |
| CompactStatRow.tsx | Non-interactive display |
| RecentActivityCard.tsx | Non-interactive display |
| MissedCardsList.tsx | Non-interactive list |
| SkillTreePath.tsx | Non-interactive display |
| SkippedReviewPhase.tsx | Uses BilingualButton (HAS) |
| TestResultsScreen.tsx | Uses BilingualButton (HAS) |
| PracticeSession.tsx | Uses AnswerOption (N/A) |
| TestPage.tsx | Uses Button/BilingualButton (HAS) |
| SettingsPage.tsx | Toggle switches, minimal priority |
| StudyGuidePage.tsx | Uses BilingualButton (HAS) |

## MISSING: Needs whileTap/whileHover added

| File | Element | Tier |
|------|---------|------|
| PillTabBar.tsx | Tab `<button>` (line 85) | Secondary (SPRING_SNAPPY) |
| NBAHeroCard.tsx | CTA `<Link>` (line 187) | Primary (SPRING_BOUNCY) |
| NBAHeroCard.tsx | Skip `<Link>` (line 197) | Tertiary (opacity) |
| QuestionReviewList.tsx | 3 filter `<button>` (lines 130, 143, 159) | Secondary (SPRING_SNAPPY) |
| QuestionReviewList.tsx | "Add All" `<button>` (line 197) | Primary (SPRING_BOUNCY) |
| PracticeConfig.tsx | "Weak Areas" `<motion.button>` (line 195) | Primary (SPRING_BOUNCY) |
| PracticeConfig.tsx | 3 main category `<button>` (line 239) | Secondary (SPRING_SNAPPY) |
| PracticeConfig.tsx | Sub-category `<button>` (line 294) | Secondary (SPRING_SNAPPY) |
| PracticeConfig.tsx | Speed pill `<button>` (line 443) | Secondary (SPRING_SNAPPY) |
| StatCard.tsx | Interactive `<button>` (line 63) | Secondary (SPRING_SNAPPY) |
| CategoryPreviewCard.tsx | "View all" `<button>` (line 160) | Tertiary (opacity) |
| ResumeSessionCard.tsx | Session card `<button>` (line 94) | Secondary (SPRING_SNAPPY) |
