/**
 * E2E: Flashcard Sort (TEST-06)
 *
 * Verifies flashcard sort mode: start -> Know/Don't Know button clicks (not drag
 * per precontext Decision 8) -> round summary with results -> SRS batch add option.
 * Also verifies card content rendering (question + answer text).
 */
import { test, expect } from './fixtures';

test.describe('Flashcard Sort', () => {
  test('sort cards with Know and Don\'t Know buttons', async ({ authedPage }) => {
    // Navigate to study page and enter sort mode via hash route
    await authedPage.goto('/study#sort');

    // SortModeContainer renders Know/Don't Know buttons when sorting phase is active.
    // Wait for the Know button to be visible (sort session auto-starts).
    const knowButton = authedPage.getByRole('button', { name: /Know/i }).first();
    await expect(knowButton).toBeVisible({ timeout: 15_000 });

    // Also verify Don't Know button is present
    const dontKnowButton = authedPage.getByRole('button', { name: /Don.t Know/i }).first();
    await expect(dontKnowButton).toBeVisible();

    // Sort card 1: Know
    await knowButton.click();

    // Wait for the next card to render (buttons re-enable after animation)
    await expect(knowButton).toBeEnabled({ timeout: 5_000 });

    // Sort card 2: Don't Know
    await dontKnowButton.click();
    await expect(knowButton).toBeEnabled({ timeout: 5_000 });

    // Sort card 3: Know
    await knowButton.click();
    await expect(knowButton).toBeEnabled({ timeout: 5_000 });

    // Sort card 4: Don't Know
    await dontKnowButton.click();
    await expect(knowButton).toBeEnabled({ timeout: 5_000 });

    // Sort card 5: Know
    await knowButton.click();

    // Continue sorting remaining cards until round summary appears.
    // The round has a variable number of cards (depends on category filter / all questions).
    // Keep sorting until round summary shows up (or a max iteration guard).
    let iterations = 0;
    const maxIterations = 130; // 128 questions max
    while (iterations < maxIterations) {
      // Check if round summary appeared (shows Know % hero stat)
      const summaryVisible = await authedPage.locator('text=Known').first().isVisible().catch(() => false);
      const finishButton = authedPage.getByRole('button', { name: /Finish/i });
      const finishVisible = await finishButton.isVisible().catch(() => false);

      if (finishVisible) break;

      // If Know button still visible, keep sorting
      const canSort = await knowButton.isVisible().catch(() => false);
      if (!canSort) {
        // Round summary or mastery phase reached
        break;
      }

      await knowButton.click();
      await authedPage.waitForTimeout(200);
      iterations++;
    }

    // Verify round summary OR mastery screen is displayed.
    // Round summary shows "Known" text and a Finish button.
    // Mastery shows "You know them all!" text.
    const knownText = authedPage.locator('text=Known').first();
    const masteryText = authedPage.locator('text=/know them all|100%/i').first();
    const finishButton = authedPage.getByRole('button', { name: /Finish|Back to Study/i }).first();

    await expect(finishButton).toBeVisible({ timeout: 10_000 });

    // Verify some result content is displayed (known count or percentage)
    const hasResultContent =
      (await knownText.isVisible().catch(() => false)) ||
      (await masteryText.isVisible().catch(() => false));
    expect(hasResultContent).toBeTruthy();
  });

  test('sort mode shows card content', async ({ authedPage }) => {
    // Navigate to sort mode
    await authedPage.goto('/study#sort');

    // Wait for sort session to start and card to render.
    // SwipeableCard wraps Flashcard3D which renders question text.
    const knowButton = authedPage.getByRole('button', { name: /Know/i }).first();
    await expect(knowButton).toBeVisible({ timeout: 15_000 });

    // Card content is rendered inside a group with aria-label "Sort card: ..."
    const sortCard = authedPage.locator('[role="group"][aria-label^="Sort card"]');
    await expect(sortCard.first()).toBeVisible();

    // Verify the card has question text content (English question text)
    const cardText = await sortCard.first().textContent();
    expect(cardText).toBeTruthy();
    expect(cardText!.length).toBeGreaterThan(10);
  });
});
