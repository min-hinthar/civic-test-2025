'use client';

import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Megaphone, Shield, Share2, Users } from 'lucide-react';
import { GlassHeader } from '@/components/navigation/GlassHeader';

const opEdShareUrl = 'https://civic-test-2025.vercel.app/op-ed';
const opEdShareText =
  'Read and share our op-ed on why the TPS story for Burma matters for families, safety, and democracy.';

const OpEdPage = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const target = document.getElementById(location.hash.replace('#', ''));
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash]);

  return (
    <div className="page-shell">
      <GlassHeader showBack backHref="/" />
      <main className="mx-auto max-w-4xl px-6 py-10 space-y-10">
        <header className="glass-medium relative overflow-hidden border border-border/70 bg-gradient-to-br from-[hsl(var(--color-background))] via-[hsl(var(--color-surface))] to-[hsl(var(--color-background))] p-8 text-white shadow-2xl shadow-primary/25 transition duration-500 hover:-translate-y-1 hover:shadow-primary/30">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/30 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-20 right-10 h-64 w-64 rounded-full bg-accent/20 blur-[120px]" />
          <div className="relative space-y-4">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-white/70 hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to landing page
            </Link>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Op-ed · TPS for Burma
            </p>
            <h1 className="text-3xl font-bold sm:text-4xl">Why the TPS story for Burma matters</h1>
            <p className="text-base text-white/80">
              A bilingual editorial on how Temporary Protected Status intersects with safety,
              propaganda, and the everyday lives of Burmese families in the United States.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
              <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1">
                English · <span className="font-myanmar">မြန်မာ</span>
              </span>
              <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1">
                5 min read
              </span>
              <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1">
                Updated for 2024 renewals
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="https://civic-test-2025.vercel.app/op-ed"
                className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm font-semibold text-foreground shadow-lg shadow-primary/30 transition hover:-translate-y-0.5"
              >
                Read the Op-Ed
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(opEdShareText)}&url=${encodeURIComponent(opEdShareUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-white/60"
              >
                <Share2 className="h-4 w-4" /> Share the op-ed
              </a>
            </div>
          </div>
        </header>

        <section
          id="families"
          className="space-y-4 rounded-3xl border border-border/70 bg-card/80 p-6 shadow-xl shadow-primary/10"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            <Users className="h-4 w-4" /> Families
          </div>
          <h2 className="text-2xl font-semibold text-foreground">
            Protect Burmese families during TPS renewals
          </h2>
          <p className="text-muted-foreground">
            When renewals drag on, households face impossible choices: pay for legal help they
            cannot afford or risk gaps in work authorization. The op-ed tells the story of a Burmese
            college student translating every form for her parents, hoping USCIS receipts arrive
            before their restaurant misses payroll.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="interactive-tile rounded-2xl border border-border/70 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 p-4 shadow-inner">
              <h3 className="text-lg font-semibold text-foreground">Everyday logistics</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Transportation, childcare, and translation costs all spike when biometrics
                appointments shift.
              </p>
            </div>
            <div className="interactive-tile rounded-2xl border border-border/70 bg-gradient-to-br from-success/10 via-success/5 to-success/10 p-4 shadow-inner">
              <h3 className="text-lg font-semibold text-foreground">What communities ask for</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Clearer renewal timelines, multilingual alerts, and protections for mixed-status
                households.
              </p>
            </div>
          </div>
        </section>

        <section
          id="propaganda"
          className="space-y-4 rounded-3xl border border-border/70 bg-card/80 p-6 shadow-xl shadow-primary/10"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            <Shield className="h-4 w-4" /> Counter-propaganda
          </div>
          <h2 className="text-2xl font-semibold text-foreground">
            Debunk misinformation targeting TPS holders
          </h2>
          <p className="text-muted-foreground">
            The op-ed traces how disinformation reduces Burmese families to talking points. It
            documents the real risks of being labeled as political pawns instead of people seeking
            safety.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: 'Narrative checks',
                description:
                  'Side-by-side comparisons of propaganda claims vs. documented facts from USCIS and DHS.',
                icon: BookOpen,
              },
              {
                title: 'Media literacy prompts',
                description:
                  'Questions Burmese youth use with elders before resharing viral posts.',
                icon: Megaphone,
              },
              {
                title: 'Community guardrails',
                description: (
                  <>
                    Ways churches, mosques, and temples can post accurate renewal steps in English
                    and <span className="font-myanmar">မြန်မာ</span>.
                  </>
                ),
                icon: Shield,
              },
            ].map(tile => (
              <div
                key={tile.title}
                className="interactive-tile rounded-2xl border border-border/70 bg-gradient-to-br from-slate-900/5 via-[hsl(var(--color-surface))]/10 to-slate-900/5 p-4 shadow-inner"
              >
                <div className="flex items-center gap-2 text-primary">
                  <tile.icon className="h-5 w-5" />
                  <span className="text-sm font-semibold">{tile.title}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{tile.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="next-steps"
          className="space-y-4 rounded-3xl border border-border/70 bg-card/80 p-6 shadow-xl shadow-primary/10"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            <ArrowRight className="h-4 w-4" /> Next steps
          </div>
          <h2 className="text-2xl font-semibold text-foreground">
            Actionable steps readers can take
          </h2>
          <p className="text-muted-foreground">
            The piece ends with invitations to act. Whether you are a student, faith leader, or
            policymaker, the op-ed offers specific next steps to keep TPS honest and
            people-centered.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="interactive-tile rounded-2xl border border-border/70 bg-gradient-to-br from-warning/10 via-warning/10 to-warning/5 p-4 shadow-inner">
              <h3 className="text-lg font-semibold text-foreground">Share with lawmakers</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Send the op-ed with a note about why Burmese TPS families need timely renewals.
              </p>
            </div>
            <div className="interactive-tile rounded-2xl border border-border/70 bg-gradient-to-br from-destructive/10 via-destructive/10 to-destructive/5 p-4 shadow-inner">
              <h3 className="text-lg font-semibold text-foreground">Host a bilingual teach-in</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Use the talking points to hold community sessions in English and{' '}
                <span className="font-myanmar">မြန်မာ</span>.
              </p>
            </div>
            <div className="interactive-tile rounded-2xl border border-border/70 bg-gradient-to-br from-primary/10 via-primary/10 to-primary/5 p-4 shadow-inner">
              <h3 className="text-lg font-semibold text-foreground">Circulate on social</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Share the link on X/Twitter, Facebook, Instagram, and LinkedIn using the buttons
                below.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-border/70 bg-card/80 p-6 shadow-lg shadow-primary/10">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="text-foreground font-semibold">Share the op-ed</span>
            {[
              {
                label: 'X / Twitter',
                href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(opEdShareText)}&url=${encodeURIComponent(opEdShareUrl)}`,
                classes: 'bg-surface text-foreground',
              },
              {
                label: 'Facebook',
                href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(opEdShareUrl)}`,
                classes: 'bg-[#1877F2] text-white',
              },
              {
                label: 'Instagram',
                href: `https://www.instagram.com/?url=${encodeURIComponent(opEdShareUrl)}`,
                classes: 'bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white',
              },
              {
                label: 'LinkedIn',
                href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(opEdShareUrl)}`,
                classes: 'bg-[#0A66C2] text-white',
              },
            ].map(button => (
              <a
                key={button.label}
                href={button.href}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-lg transition hover:-translate-y-0.5 hover:shadow-primary/30 ${button.classes}`}
              >
                {button.label}
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default OpEdPage;
