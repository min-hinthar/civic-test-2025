'use client';

import { useCallback, useState } from 'react';
import { ExternalLink, Share2, Check } from 'lucide-react';
import { GlassHeader } from '@/components/navigation/GlassHeader';
import { useLanguage } from '@/contexts/LanguageContext';
import { opEdContent, opEdShareUrl } from '@/constants/opEd/opEdContent';
import { FadeIn } from '@/components/animations/StaggeredList';
const OpEdPage = () => {
  const { showBurmese } = useLanguage();
  const [copied, setCopied] = useState(false);

  const c = opEdContent;
  const lang = showBurmese ? 'my' : 'en';

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(c.meta.tweetText[lang])}&url=${encodeURIComponent(opEdShareUrl)}`;

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: c.hero.title.en,
          text: c.meta.tweetText.en,
          url: opEdShareUrl,
        });
        return;
      } catch {
        // User cancelled or share failed, fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(opEdShareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  }, [c]);

  return (
    <div className="page-shell">
      <GlassHeader showBack backHref="/" />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 space-y-10">
        {/* Hero */}
        <FadeIn>
          <header className="space-y-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {c.hero.tag.en}
            </p>
            {showBurmese && <p className="font-myanmar text-sm text-primary/80">{c.hero.tag.my}</p>}
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{c.hero.title.en}</h1>
            {showBurmese && (
              <p className="font-myanmar text-2xl text-foreground/80 sm:text-3xl">
                {c.hero.title.my}
              </p>
            )}
            <p className="text-lg text-muted-foreground">{c.hero.subtitle.en}</p>
            {showBurmese && (
              <p className="font-myanmar text-base text-muted-foreground/80">
                {c.hero.subtitle.my}
              </p>
            )}
          </header>
        </FadeIn>

        {/* Meta card */}
        <FadeIn delay={80}>
          <div className="grid gap-4 rounded-2xl border border-border/60 bg-card/80 p-6 sm:grid-cols-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Author</p>
              <p className="text-sm font-semibold text-foreground">{c.meta.author.en}</p>
              {showBurmese && (
                <p className="font-myanmar text-sm text-foreground/80">{c.meta.author.my}</p>
              )}
              <p className="text-xs text-muted-foreground">{c.meta.authorNote.en}</p>
              {showBurmese && (
                <p className="font-myanmar text-xs text-muted-foreground/70">
                  {c.meta.authorNote.my}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Thesis</p>
              <p className="text-sm font-semibold text-foreground">{c.meta.thesis.en}</p>
              {showBurmese && (
                <p className="font-myanmar text-sm text-foreground/80">{c.meta.thesis.my}</p>
              )}
              <p className="text-xs text-muted-foreground">{c.meta.thesisNote.en}</p>
              {showBurmese && (
                <p className="font-myanmar text-xs text-muted-foreground/70">
                  {c.meta.thesisNote.my}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                Read time
              </p>
              <p className="text-sm font-semibold text-foreground">{c.meta.readTime.en}</p>
              {showBurmese && (
                <p className="font-myanmar text-sm text-foreground/80">{c.meta.readTime.my}</p>
              )}
              <a
                href={c.meta.docLink[lang]}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline min-h-[44px]"
              >
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
                {showBurmese ? 'Google Doc ကိုဖွင့်ကြည့်ရန်' : 'View original document'}
              </a>
            </div>
          </div>
        </FadeIn>

        {/* Intro paragraphs */}
        <FadeIn delay={160}>
          <section className="space-y-5">
            {c.introParagraphs.map((para, i) => (
              <div key={i} className="space-y-2">
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

        {/* Editorial sections */}
        {c.sections.map((section, sectionIdx) => (
          <FadeIn key={section.title.en} delay={200 + sectionIdx * 60}>
            <article className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">{section.title.en}</h2>
              {showBurmese && (
                <p className="font-myanmar text-xl text-foreground/80">{section.title.my}</p>
              )}

              {section.intro && (
                <div className="space-y-2">
                  <p className="text-base leading-relaxed text-muted-foreground">
                    {section.intro.en}
                  </p>
                  {showBurmese && section.intro.my && (
                    <p className="font-myanmar text-base leading-relaxed text-muted-foreground/80">
                      {section.intro.my}
                    </p>
                  )}
                </div>
              )}

              {section.paragraphs?.map((para, paraIdx) => (
                <div key={paraIdx} className="space-y-2">
                  <p className="text-base leading-relaxed text-muted-foreground">{para.en}</p>
                  {showBurmese && (
                    <p className="font-myanmar text-base leading-relaxed text-muted-foreground/80">
                      {para.my}
                    </p>
                  )}
                </div>
              ))}

              {section.bullets && (
                <ul className="space-y-3 rounded-xl border border-border/40 bg-card/50 p-4">
                  {section.bullets.map((bullet, bulletIdx) => (
                    <li key={bulletIdx} className="flex gap-3 text-base leading-relaxed">
                      <span
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                        aria-hidden
                      />
                      <div className="space-y-1">
                        <span className="text-muted-foreground">{bullet.en}</span>
                        {showBurmese && (
                          <p className="font-myanmar text-muted-foreground/80">{bullet.my}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {section.closing && (
                <div className="space-y-2">
                  <p className="text-base leading-relaxed text-muted-foreground">
                    {section.closing.en}
                  </p>
                  {showBurmese && section.closing.my && (
                    <p className="font-myanmar text-base leading-relaxed text-muted-foreground/80">
                      {section.closing.my}
                    </p>
                  )}
                </div>
              )}
            </article>
          </FadeIn>
        ))}

        {/* Share section */}
        <FadeIn delay={800}>
          <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-lg space-y-4 text-center">
            <Share2 className="mx-auto h-6 w-6 text-primary" aria-hidden="true" />
            <h2 className="text-xl font-semibold text-foreground">{c.share.headline.en}</h2>
            {showBurmese && (
              <p className="font-myanmar text-lg text-foreground/80">{c.share.headline.my}</p>
            )}
            <p className="text-sm leading-relaxed text-muted-foreground">{c.share.body.en}</p>
            {showBurmese && (
              <p className="font-myanmar text-sm leading-relaxed text-muted-foreground/80">
                {c.share.body.my}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-center gap-3">
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
                    Share
                  </>
                )}
              </button>
              <a
                href={tweetUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-border/40 px-5 py-2.5 min-h-[44px] text-sm font-semibold text-foreground transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Share on X
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(opEdShareUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-border/40 px-5 py-2.5 min-h-[44px] text-sm font-semibold text-foreground transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Facebook
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(opEdShareUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-border/40 px-5 py-2.5 min-h-[44px] text-sm font-semibold text-foreground transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                LinkedIn
              </a>
              <a
                href={c.meta.docLink[lang]}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-border/40 px-5 py-2.5 min-h-[44px] text-sm font-semibold text-foreground transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <ExternalLink className="h-4 w-4" />
                Google Doc
              </a>
            </div>
          </section>
        </FadeIn>
      </main>
    </div>
  );
};

export default OpEdPage;
