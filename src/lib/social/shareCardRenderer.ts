/**
 * Share Card Renderer
 *
 * Canvas API renderer that generates 1080x1080 celebratory score cards
 * for social sharing. Cards are always bilingual (EN + MY) regardless
 * of user language setting.
 *
 * Design: Vibrant gradient background with gold accents.
 * No external images used (CORS-safe).
 */

/** Data needed to render a share card */
export interface ShareCardData {
  score: number;
  total: number;
  sessionType: 'test' | 'practice' | 'interview';
  streak: number;
  topBadge: { name: { en: string; my: string }; icon: string } | null;
  categories: Array<{ name: string; correct: number; total: number }>;
  date: string;
}

/** Session type labels (always bilingual on card) */
const SESSION_LABELS: Record<ShareCardData['sessionType'], { en: string; my: string }> = {
  test: {
    en: 'Mock Test Results',
    my: 'စမ်းသပ်စာမေးပွဲ ရလဒ်များ',
  },
  practice: {
    en: 'Practice Results',
    my: 'လေ့ကျင့်ခန်း ရလဒ်များ',
  },
  interview: {
    en: 'Interview Results',
    my: 'အင်တာဗျူး ရလဒ်များ',
  },
};

/**
 * Wait for the Noto Sans Myanmar font to be available for canvas rendering.
 * Handles the FOUF (Flash of Unstyled Font) pitfall by explicitly loading
 * the font before drawing.
 */
async function waitForFonts(): Promise<void> {
  await document.fonts.ready;
  try {
    await document.fonts.load('bold 36px "Noto Sans Myanmar"');
  } catch {
    // Font may already be loaded or unavailable; proceed with fallback
  }
}

/**
 * Draw decorative gold corner accents on the canvas.
 */
function drawCornerAccents(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const size = 40;
  const gold = '#FFD700';
  ctx.fillStyle = gold;
  ctx.globalAlpha = 0.6;

  // Top-left
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size, 0);
  ctx.lineTo(0, size);
  ctx.closePath();
  ctx.fill();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(w, 0);
  ctx.lineTo(w - size, 0);
  ctx.lineTo(w, size);
  ctx.closePath();
  ctx.fill();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.lineTo(size, h);
  ctx.lineTo(0, h - size);
  ctx.closePath();
  ctx.fill();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(w, h);
  ctx.lineTo(w - size, h);
  ctx.lineTo(w, h - size);
  ctx.closePath();
  ctx.fill();

  ctx.globalAlpha = 1;
}

/**
 * Draw a horizontal progress bar on the canvas.
 */
function drawProgressBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  ratio: number
): void {
  // Track (dark background)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, height / 2);
  ctx.fill();

  // Fill (gold)
  if (ratio > 0) {
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.roundRect(x, y, Math.max(width * ratio, height), height, height / 2);
    ctx.fill();
  }
}

/**
 * Render a celebratory 1080x1080 share card as a PNG Blob.
 *
 * Uses Canvas API only — no external images for CORS safety.
 * Always bilingual (EN + MY) regardless of user language setting.
 */
export async function renderShareCard(data: ShareCardData): Promise<Blob> {
  await waitForFonts();

  const W = 1080;
  const H = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // --- Background gradient ---
  const gradient = ctx.createLinearGradient(0, 0, W, H);
  gradient.addColorStop(0, '#1e3a8a'); // Deep blue
  gradient.addColorStop(0.5, '#4338ca'); // Indigo
  gradient.addColorStop(1, '#7c3aed'); // Purple
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);

  // --- Gold accent bars ---
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(0, 0, W, 8); // Top bar
  ctx.fillRect(0, H - 8, W, 8); // Bottom bar

  // --- Corner accents ---
  drawCornerAccents(ctx, W, H);

  // --- Session type label (y ~120) ---
  const labels = SESSION_LABELS[data.sessionType];
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 36px system-ui, "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(labels.en, W / 2, 100);

  ctx.font = 'bold 36px "Noto Sans Myanmar", system-ui, sans-serif';
  ctx.fillText(labels.my, W / 2, 150);

  // --- Decorative divider ---
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W * 0.3, 195);
  ctx.lineTo(W * 0.7, 195);
  ctx.stroke();

  // --- Score (large, centered) ---
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 140px system-ui, "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${data.score}/${data.total}`, W / 2, 330);

  // Score percentage subtitle
  const pct = data.total > 0 ? Math.round((data.score / data.total) * 100) : 0;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = 'bold 40px system-ui, "Segoe UI", sans-serif';
  ctx.fillText(`${pct}%`, W / 2, 415);

  // --- Streak line (y ~480) ---
  if (data.streak > 0) {
    ctx.fillStyle = '#FFA500';
    ctx.font = 'bold 48px system-ui, "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${data.streak} day streak`, W / 2, 490);
  }

  // --- Top badge (y ~560) ---
  let nextY = 560;
  if (data.topBadge) {
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 36px system-ui, "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${data.topBadge.name.en}`, W / 2, nextY);
    ctx.font = '32px "Noto Sans Myanmar", system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
    ctx.fillText(data.topBadge.name.my, W / 2, nextY + 42);
    nextY = nextY + 85;
  } else {
    nextY = 580;
  }

  // --- Category breakdown ---
  const categoriesToShow = data.categories.slice(0, 4);
  if (categoriesToShow.length > 0) {
    const barWidth = W * 0.55;
    const barStartX = (W - barWidth) / 2;
    const barHeight = 16;
    const rowSpacing = 65;
    let catY = nextY + 30;

    for (const cat of categoriesToShow) {
      const ratio = cat.total > 0 ? cat.correct / cat.total : 0;

      // Category name (left-aligned within bar area)
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '28px system-ui, "Segoe UI", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(cat.name, barStartX, catY);

      // Score text (right-aligned)
      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText(`${cat.correct}/${cat.total}`, barStartX + barWidth, catY);

      // Progress bar
      drawProgressBar(ctx, barStartX, catY + 10, barWidth, barHeight, ratio);

      catY += rowSpacing;
    }
  }

  // --- Date ---
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = '24px system-ui, "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(data.date, W / 2, 910);

  // --- Branding footer ---
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 32px system-ui, "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('US Citizenship Civic Test Prep', W / 2, 960);

  ctx.font = '28px "Noto Sans Myanmar", system-ui, sans-serif';
  ctx.fillText(
    'အမေရိကန်နိုင်ငံသားရေးရာရာ စာမေးပွဲပြင်ဆင်ခြင်း',
    W / 2,
    1005
  );

  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.font = '22px system-ui, "Segoe UI", sans-serif';
  ctx.fillText('civic-test-prep.vercel.app', W / 2, 1045);

  // --- Convert to Blob ---
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Canvas toBlob returned null'));
      }
    }, 'image/png');
  });
}
