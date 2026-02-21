'use client';

import { useState, useCallback } from 'react';
import { Heart, ExternalLink, Share2, Github, Check } from 'lucide-react';
import { GlassHeader } from '@/components/navigation/GlassHeader';
import { useLanguage } from '@/contexts/LanguageContext';
import { aboutContent } from '@/constants/about/aboutContent';
import { DedicationCard } from '@/components/about/DedicationCard';
import { FadeIn } from '@/components/animations/StaggeredList';

const APP_URL = 'https://civic-test-2025.vercel.app';
const SHARE_TITLE = 'Civic Test Prep - Free Bilingual U.S. Citizenship Test Prep';
const SHARE_TEXT =
  'Free bilingual civics test prep app for the U.S. citizenship test. Study in English and Burmese with spaced repetition, mock tests, and interview practice.';

const AboutPage = () => {
  const { showBurmese } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: SHARE_TITLE, text: SHARE_TEXT, url: APP_URL });
        return;
      } catch {
        // User cancelled or share failed, fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(APP_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  }, []);

  return (
    <div className="page-shell">
      <GlassHeader showBack backHref="/" />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 space-y-10">
        {/* Hero */}
        <FadeIn>
          <header className="space-y-3 text-center">
            <Heart
              className="mx-auto h-8 w-8 text-primary"
              fill="currentColor"
              aria-hidden="true"
            />
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
              {aboutContent.hero.title.en}
            </h1>
            {showBurmese && (
              <p className="font-myanmar text-2xl text-foreground/80 sm:text-3xl">
                {aboutContent.hero.title.my}
              </p>
            )}
            <p className="text-lg text-muted-foreground">{aboutContent.hero.subtitle.en}</p>
            {showBurmese && (
              <p className="font-myanmar text-base text-muted-foreground/80">
                {aboutContent.hero.subtitle.my}
              </p>
            )}
          </header>
        </FadeIn>

        {/* Narrative sections */}
        {aboutContent.sections.map((section, sectionIdx) => (
          <FadeIn key={section.title.en} delay={100 + sectionIdx * 80}>
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">{section.title.en}</h2>
              {showBurmese && (
                <p className="font-myanmar text-xl text-foreground/80">{section.title.my}</p>
              )}

              {section.paragraphs.map((para, paraIdx) => (
                <div key={paraIdx} className="space-y-2">
                  <p className="text-base leading-relaxed text-muted-foreground">{para.en}</p>
                  {showBurmese && (
                    <p className="font-myanmar text-base leading-relaxed text-muted-foreground/80">
                      {para.my}
                    </p>
                  )}
                </div>
              ))}
            </section>
          </FadeIn>
        ))}

        {/* Dedications */}
        <FadeIn delay={500}>
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary/70" aria-hidden="true" />
              <h2 className="text-2xl font-semibold text-foreground">
                {aboutContent.dedications.sectionTitle.en}
              </h2>
            </div>
            {showBurmese && (
              <p className="font-myanmar text-xl text-foreground/80">
                {aboutContent.dedications.sectionTitle.my}
              </p>
            )}

            <div className="space-y-4">
              <DedicationCard person={aboutContent.dedications.dwightClark} />
              <DedicationCard person={aboutContent.dedications.guyots} />
            </div>
          </section>
        </FadeIn>

        {/* Call to action */}
        <FadeIn delay={600}>
          <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-lg space-y-4 text-center">
            <Share2 className="mx-auto h-6 w-6 text-primary" aria-hidden="true" />
            <h2 className="text-xl font-semibold text-foreground">
              {aboutContent.callToAction.title.en}
            </h2>
            {showBurmese && (
              <p className="font-myanmar text-lg text-foreground/80">
                {aboutContent.callToAction.title.my}
              </p>
            )}
            <p className="text-sm leading-relaxed text-muted-foreground">
              {aboutContent.callToAction.message.en}
            </p>
            {showBurmese && (
              <p className="font-myanmar text-sm leading-relaxed text-muted-foreground/80">
                {aboutContent.callToAction.message.my}
              </p>
            )}
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 rounded-xl bg-primary/10 px-5 py-2.5 min-h-[44px] text-sm font-semibold text-primary transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Link Copied!
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  Share This App
                </>
              )}
            </button>
          </section>
        </FadeIn>

        {/* External links */}
        <FadeIn delay={700}>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Resources</h2>
            <div className="space-y-2">
              {aboutContent.externalLinks.map(link => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-xl border border-border/40 bg-card/50 px-4 py-3 min-h-[44px] text-sm text-foreground transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <ExternalLink className="h-4 w-4 shrink-0 text-primary/70" aria-hidden="true" />
                  <span className="flex-1">
                    <span className="font-medium">{link.label.en}</span>
                    {showBurmese && (
                      <span className="font-myanmar ml-2 text-muted-foreground">
                        {link.label.my}
                      </span>
                    )}
                  </span>
                </a>
              ))}
            </div>
          </section>
        </FadeIn>

        {/* Footer */}
        <FadeIn delay={800}>
          <footer className="border-t border-border/40 pt-6 pb-8 text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              {aboutContent.footer.openSourceNotice.en}
            </p>
            {showBurmese && (
              <p className="font-myanmar text-xs text-muted-foreground/80">
                {aboutContent.footer.openSourceNotice.my}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground/80 italic">
              {aboutContent.footer.developerCredit.en}
            </p>
            {showBurmese && (
              <p className="font-myanmar text-xs text-muted-foreground/60 italic">
                {aboutContent.footer.developerCredit.my}
              </p>
            )}
            <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground/70">
              <span>
                v{aboutContent.footer.version} &middot; {aboutContent.footer.year}
              </span>
              <a
                href={aboutContent.footer.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 min-h-[44px] px-2 text-muted-foreground/70 transition-colors hover:text-foreground"
              >
                <Github className="h-3.5 w-3.5" aria-hidden="true" />
                GitHub
              </a>
            </div>
          </footer>
        </FadeIn>
      </main>
    </div>
  );
};

export default AboutPage;
