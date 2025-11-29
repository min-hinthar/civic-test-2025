import Head from 'next/head';
import Link from 'next/link';

const introParagraphs = [
  "Every Thanksgiving, America does something beautifully strange: it pardons a turkey. This year it was Gobble and Waddle—two ‘Make America Healthy Again’ certified birds who, with full Hollywood optics, were spared and sent off to a comfortable retirement instead of the oven. It’s lighthearted, theatrical, and oddly touching. A country that can still make time for a symbolic act of mercy is a country that hasn’t entirely forgotten its virtues.",
  "Meanwhile, in the backdrop of that feel-good moment, the Administration announced that Temporary Protected Status (TPS) for Burma (Myanmar) will end, on the grounds that it is now “safe” for Burmese seeking refuge in the United States to go back to where they belong. The turkeys got clemency. The refugees, a deadline.",
  "I say that with a little heaviness and a little humor—no offence to the blessed birds or the many Americans who honestly believe TPS has to end sometime. They’re right about one thing: TPS is temporary by design. It should be consistently reviewed and definitely not become a back door for people who do not face imminent danger in Burma or those who might pose a risk to the American people. The question is not whether TPS will end. Rather it’s how and on whose narrative. Right now, the story being used to justify terminating TPS for Burma sounds suspiciously like it was drafted in Naypyidaw, not in Washington. And that is dangerous—for Burmese lives, for American credibility, and for the broader project of making the world a little safer from scam centres, critically dirty minerals, and fashionably trending authoritarian strongmen.",
];

const sections = [
  {
    title: 'A brown Burmese kid in a red state',
    paragraphs: [
      'For the first half of the 2010s, I studied at The College of Wooster in Ohio. On paper, a “liberal arts pursuing Burmese kid” in the Midwest sounds like a setup for a standup routine. In practice, it was one of the most formative experiences of my life.',
      'At first, it did feel like a juxtaposition: best and brightest students from all over the world living on campus surrounded by cornfields, Amish buggies, and pickup trucks revving down Beall Ave on Rumspringa. But when critical thinking meets Midwestern values, something surprising happens. Over seasonal potlucks and Thanksgiving meals, you start hearing the deeper story.',
    ],
    bullets: [
      'Factories that once anchored whole towns closing down and never coming back.',
      'Parents working two or three jobs while worrying about fentanyl and opioids, school shootings, and whether their kids will ever afford a home.',
      'People who feel talked down to by elites but ignored when they say, “We’re not against immigration, we’re against chaos.”',
    ],
    closing:
      'If you only scroll through your newsfeed, you might think these fears are just “xenophobia.” Sitting down together at a dining table in Wooster, you soon realize they’re often grief in disguise—grief for lost security, lost dignity, and a world that has moved on without their consent. And yet, those same Midwesterners would go out of their way to drive brown kids like me to Walmart, invite us in like their own family, and check on our families when they saw something terrible happening 8,000 miles away. Their moral compass was simple and biblical: love thy neighbor, be a good steward, do not ignore evil when you have the power to stop it. That’s the America I know: deeply proud, but also deeply generous. So when conservatives say, “TPS can’t be forever; we need firm borders and serious vetting,” I don’t hear cruelty. I hear people who have seen too much chaos and simply don’t want to be caught off-guard again. The irony is: we feel exactly the same way.',
  },
  {
    title: 'TPS is temporary—but the framing must reflect contemporary reality',
    paragraphs: [
      'By law and by logic, TPS is temporary. It’s meant for “extraordinary and temporary conditions”—a war, a disaster—that make safe return impossible. When those conditions truly change, TPS should be revised outright.',
      'If DHS had calmly said: “Burma remains extremely dangerous, but TPS was never designed as a permanent solution. We’re ending it while simultaneously working with Congress on a path for long-resident Burmese TPS holders to adjust, and we’re ramping up pressure on the junta,” we would still be scared, but at least the story would be Midwest honesty.',
      'Instead, the official justification leans on phrases like “notable progress in governance and stability,” the lifting of the state of emergency, planned “free and fair elections,” and ceasefires—as if Burma were staggering toward normalcy. That framing would be questionable even if Burma stood alone. But TPS wasn’t just ended for Burma. It was terminated for a big cluster of countries at once—nearly twenty designations—under a general offensive to tighten humanitarian protections and “return TPS to its original, temporary purpose.”',
      'Ending multiple programs is a political choice; how you frame each one is a moral and strategic one. In Burma’s case, the sequence and the narrative are a propaganda gift to the generals. If you were trying to design a propaganda win for the junta, you couldn’t do much better than choreographed raids, selective prisoner releases, and DHS language echoing “notable progress.” The problem is not just that TPS is ending, but that the narrative of its termination is being hijacked by a thuggish regime that only treats its population as hostages.',
    ],
  },
  {
    title: 'The junta’s “improvements”: hostages, not citizens',
    intro:
      'The Burmese military has indeed made some loud gestures lately: ending the formal state of emergency, announcing elections, and releasing a batch of prisoners mostly convicted under the post-coup amended incitement law. If you squint hard enough from far enough away, this can look like sunshine on a gloomy day. But the basics haven’t changed.',
    bullets: [
      'Aung San Suu Kyi and President Win Myint remain detained alongside thousands of political prisoners, student activists, and journalists.',
      'The National Unity Government and most Ethnic Resistance Organizations are excluded from any real dialogue.',
      'Airstrikes, artillery attacks, and burnings of churches, schools, hospitals, and villages continue in many parts of the country.',
    ],
    closing:
      'Everyone under junta control knows the score: you are free until you are not. Anyone “released” can be re-detained with a Facebook post, a rumor, or no reason at all—including people deported back. When DHS implies Burma is now safe enough for mass return, it isn’t just morally wrong; it’s practically dangerous. It hands the junta a list of potential hostages and a ready-made talking point: “Washington agrees conditions have improved. Those who come back now but cause trouble? Clearly, they are criminals, not victims.” Even ASEAN—who normally specialize in understatement—aren’t buying it. When countries that rarely champion human rights start conceding that the polls are a sham and that Aung San Suu Kyi’s continued detention makes any “transition” illegitimate, Washington should listen.',
  },
  {
    title: 'Congress gets it. DHS should catch up.',
    paragraphs: [
      'A recent House Foreign Affairs Committee joint hearing—“No Exit Strategy: Burma’s Endless Crisis and America’s Limited Options”—brought together Republican and Democrat members with a remarkably aligned message.',
      'In resolute bi-partisan spirit, members called the upcoming election a “sham,” emphasized that no election can be credible while Aung San Suu Kyi and other key leaders remain imprisoned and large parts of the population are under bombardment, and urged the Administration to appoint a Special Representative and Policy Coordinator for Burma to pull together sanctions, diplomacy, and support for democracy in a coherent strategy.',
      'DHS doesn’t have to change its legal conclusion tomorrow to change its language today. A small narrative shift—stating that Burma remains profoundly unsafe, that TPS is ending as part of a broader policy shift, and that the U.S. rejects the junta’s sham election while demanding the release of all political prisoners—would deny the junta a propaganda trophy while still allowing DHS to pursue its immigration agenda. It costs nothing, but gains a great deal in moral clarity.',
    ],
  },
  {
    title: 'Yes, vet carefully. But don’t mow down the entire orchard.',
    paragraphs: [
      'Stories of violent crimes or terrorism by people with foreign ties hit a nerve, and rightly so. When Americans see a headline about an asylum seeker involved in a brutal shooting—or about sanctioned regime affiliates trying to sneak in to launder money and reputation—the instinct to say “enough” is understandable. As a refugee, I don’t ask you to ignore that instinct. We too share it.',
      'We have no interest in seeing junta cronies use our communities as safe havens or backdoors for sanctions evasion. We have no tolerance for anyone—Burmese or otherwise—who uses America’s openness to harm Americans. And we are painfully aware that one “bad apple” story can overshadow thousands of quiet, law-abiding lives. The answer, though, is not to decimate the whole orchard.',
    ],
    bullets: [
      'Vetting should be meticulous. If someone has ties to the military, its militias, or its financial networks, scrutinize them harder than anyone else.',
      'Sanctions evasion should be hunted down, especially through shell companies, crypto accounts, and high-end real estate.',
      'People who lie on Customs & Border Protection forms, commit serious crimes, or pose real threats should be prosecuted and, if necessary, removed.',
    ],
    closing:
      'Most of us who fled the junta want exactly that. We did not risk our lives to escape one set of criminals only to live under a softer, better-dressed version of them. Border security and refugee protection are not opposites. They are two equal parts of the same project: defending a society where the law means exactly what it means and the vulnerable are shielded, not exploited.',
  },
  {
    title: 'Scam Centre Strike Force: good start, now choose the right partners',
    paragraphs: [
      'On one front, the Administration has moved in exactly the right direction: the creation of a Scam Centre Strike Force that targets cyber-fraud hubs in Southeast Asia, including those in Burma. That is real leadership. Scam compounds have tortured trafficked workers and stripped victims—many in the U.S.—of billions of dollars. Going after them is not charity; it is a vital national-security and economic priority.',
      'But there is a crucial next step: choose the right friends. If Washington leans primarily on the junta for “cooperation,” it will only get choreographed raids and photo-ops, low-level scapegoats, and carefully limited asset seizures. If it broadens cooperation to include local resistance actors—the Karen National Union, NUG-linked structures, and EROs that actually control territory and have moral legitimacy—then the Strike Force can map scam networks more accurately, cut into the crypto pipelines that move profits, and follow every linkage back to military, police, militia, and transnational sponsors.',
      'Imagine if a portion of the billions in confiscated crypto assets linked to scam operations were held as a kind of strategic crypto reserve for justice—used to compensate victims, support rehabilitation for trafficked workers, and, yes, help fund the rebuilding of a democratic Burma one day. That would be real realpolitik: turning stolen value into leverage for accountability, not handing it back to the same people who built the scam empires.',
    ],
  },
  {
    title: 'Rare earths: cut the criminal middleman, not corners',
    paragraphs: [
      'Burma’s north is rich in heavy rare earth elements needed for electric vehicles, wind turbines, F-22s, and advanced microprocessors. Today, much of that extraction is environmentally devastating, controlled by militias, cronies, or foreign brokers, and deeply entangled in the junta’s war economy and Beijing’s strategic networks.',
      'Some in Washington may be tempted to think: “We can stomach a less-than-perfect partner if it helps break China’s stranglehold on these minerals.” But that is a false shortcut. A supply chain that runs through war crimes, land grabs, and criminal syndicates is a strategic liability, not an asset. It is brittle, blackmailable, and morally corrosive.',
    ],
    bullets: [
      'Work with NUG-aligned authorities and EROs in liberated areas to shut down the most abusive operations and pilot legal, monitored extraction under federal principles.',
      'Integrate Burma into refinery supply-chain partnerships with allied economies—Malaysia, Thailand, Japan, South Korea, Australia—where environmental and labor standards can be enforced.',
      'Treat junta-linked rare-earth exports as radioactive, high-risk, and sanctionable, not as bargaining chips.',
    ],
    closing:
      'The choice is not between purity and pragmatism. It is between short-sighted deals that entrench criminal control and long-term arrangements that actually reduce dependence and volatility.',
  },
  {
    title: 'Endless crisis does not mean hopeless crisis',
    paragraphs: [
      'The title of that House hearing—“No Exit Strategy: Burma’s Endless Crisis and America’s Limited Options”—captures how Burma can feel from afar: a tragic, intractable conflict in a far-off land. But “endless” should describe the junta’s plan, not our imagination.',
      'If America’s institutions internalize that fatalism, the generals win twice: at home, by crushing dissent; abroad, by convincing powerful democracies that nothing better is possible. The truth is harder but not without hope.',
    ],
    bullets: [
      'Ethnic resistance organizations and People’s Defense Forces have pushed the military out of large swathes of territory, sometimes cooperating in ways that would have seemed impossible a decade ago.',
      'Local communities have built parallel governance structures—schools, clinics, courts—in liberated areas, even under bombardment.',
      'The National Unity Government, while imperfect, represents a rare attempt to knit together Burman and ethnic leadership in a shared nation-building project.',
    ],
    closing:
      'The crisis is not endless by nature; it has been prolonged by deliberate choices. And that means different choices—by the people of Burma, by ASEAN, and crucially by the United States—can shorten it.',
  },
  {
    title: 'If President Trump ends Burma’s nightmare, 60 million Burmese has your back for the Nobel',
    paragraphs: [
      'I do not write this to throw shade at the administration. I write as someone who knows that this administration has leverage that others did not. It can align with Congress’s bipartisan calls to condemn the sham elections and appoint a Burma Special Representative; toughen Scam Centre Strike Force operations while partnering with legitimate local actors; reframe TPS termination in a way that denies propaganda value to the junta; and push allied economies and businesses to treat junta-linked critical minerals and scam transactions as radioactive, not “emerging market opportunities.”',
      'If it did those things—if it used American prowess to shorten, rather than simply manage, Burma’s endless crisis—it would not just be making America safer. It would be doing something truly historic. I say this without sarcasm: if this administration could help bring about a genuine political settlement in Burma—one that frees Aung San Suu Kyi, ends mass atrocities, and puts the country on a federal democratic path—you would see Burmese people across the world line up to nominate President Trump for the Nobel Peace Prize. We are not picky about who helps save our country. We only care that it gets done.',
    ],
  },
  {
    title: 'Thanksgiving, identity, and the America we still believe in',
    paragraphs: [
      'TPS holders from Burma sometimes joke darkly that even the president’s turkeys have a clearer path to safety than we do. It is gallows humor that masks real grief and real fear. But when I think about my life here—from the Wooster host families who insisted I always have the last piece of pumpkin pie, to the Burmese-American aunties who now organize food drives for new arrivals and monthly fundraisers—I cannot see this country only through the lens of one Federal Register notice.',
      'I see the America President Reagan spoke of: that you can move to many countries and never truly belong, but “anyone from any corner of the world can come to America and become an American.” That idea is more powerful than any one party, any one DHS policy, any one moment of panic about immigration or geopolitical fatigue.',
    ],
    bullets: [
      'Strength that locks the doors against traffickers, terrorists, and junta cronies.',
      'Strength that doesn’t let a dictatorship lobby and dictate our criteria of “stability.”',
      'Wisdom that hears the bipartisan warnings from Congress, listens to allies and investigations, and refuses to reward performance in place of genuine reform.',
      'Wisdom that remembers that TPS is temporary, but the value of a human life is not.',
    ],
    closing:
      'If the story of this Thanksgiving is simply “Turkeys saved, refugees deported because the junta says things are better now,” then something has gone wrong in the American experiment. If instead the story becomes “Turkeys pardoned, refugees heard, junta called out, scam centres dismantled, dirty critical minerals supply chains disrupted”—then America will have done more than protect its borders. It will have lived up, once again, to President Reagan’s America: that anyone from any corner of the world can stake their future here, not because America is perfect, but because it is inclusive and principled, capable of choosing courage over convenience. The Burma crisis has lasted my entire life—and that of my father’s and grandfather’s—across three generations and counting. Naturally, it has often felt endless. But “endless” is a description, not a destiny. With enough strength, wisdom, and yes, a little Midwestern kindness, it can end in our generation. Maybe even under this administration.',
  },
];

const OpEdPage = () => {
  return (
    <>
      <Head>
        <title>Pardoning Turkeys, Deporting Dreams | Burmese TPS Op-Ed</title>
        <meta
          name="description"
          content="A Burmese refugee’s plea for a kinder, wiser American leadership as TPS for Burma sunsets."
        />
      </Head>
      <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
        <div className="relative isolate overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(99,102,241,0.12),transparent_35%),radial-gradient(circle_at_50%_80%,rgba(45,212,191,0.12),transparent_35%)]" />
          <header className="mx-auto flex max-w-5xl flex-col gap-8 px-6 pb-16 pt-20 sm:px-10 sm:pt-24 lg:pt-28">
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-100 backdrop-blur">
              Op-Ed Feature
            </div>
            <div className="space-y-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-200">Pardoning Turkeys, Deporting Dreams</p>
              <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                A Burmese Refugee’s Plea for a Kinder, Wiser American Leadership
              </h1>
              <p className="max-w-3xl text-lg text-slate-200 sm:text-xl">
                How a Thanksgiving tradition of mercy collides with the decision to end Temporary Protected Status for Burma—and
                why the narrative America chooses matters for refugees, democracy, and national security alike.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-indigo-100/80">
                <span className="rounded-full bg-indigo-500/20 px-3 py-1 font-semibold text-indigo-100">Opinion</span>
                <span className="rounded-full bg-white/10 px-3 py-1">November</span>
                <Link
                  href="https://docs.google.com/document/d/1EeBxEaGfnpwbr6mmQ-ZVkB-yrvlOEO-9D0e85Ao4gQs/edit?usp=sharing"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 font-semibold text-indigo-100 transition hover:border-indigo-300/60 hover:text-white"
                  target="_blank"
                  rel="noreferrer"
                >
                  View original document
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14.25 9.75h6m0 0v-6m0 6L12 3 3.75 11.25M9.75 14.25h-6m0 0v6m0-6L12 21l8.25-8.25" />
                  </svg>
                </Link>
              </div>
            </div>
            <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur sm:grid-cols-3 sm:gap-6">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-200">Author</p>
                <p className="text-base font-semibold text-white">Burmese TPS Holder & Refugee Advocate</p>
                <p className="text-sm text-slate-200">Writing from lived experience across Burma and the American Midwest.</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-200">Thesis</p>
                <p className="text-base font-semibold text-white">Mercy should extend beyond turkeys</p>
                <p className="text-sm text-slate-200">Ending TPS without honest framing risks handing the junta propaganda and real human lives.</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-200">Read time</p>
                <p className="text-base font-semibold text-white">12 minutes</p>
                <p className="text-sm text-slate-200">Structured for policy staff, advocates, and concerned Americans.</p>
              </div>
            </div>
          </header>
        </div>

        <div className="relative -mt-10 lg:-mt-16">
          <div className="mx-auto max-w-5xl space-y-14 px-6 pb-20 sm:px-10">
            <section className="rounded-3xl border border-white/10 bg-white/5 px-6 py-8 shadow-2xl shadow-indigo-500/10 backdrop-blur-sm sm:px-10 sm:py-12">
              <div className="space-y-5 text-lg leading-relaxed text-slate-100">
                {introParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>

            {sections.map((section) => (
              <article key={section.title} className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-2xl shadow-slate-900/40 ring-1 ring-white/5 backdrop-blur sm:p-10">
                <div className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/30 text-sm font-semibold text-indigo-100">
                    ●
                  </span>
                  <div className="space-y-4">
                    <header className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-200">Section</p>
                      <h2 className="text-2xl font-bold text-white sm:text-3xl">{section.title}</h2>
                    </header>
                    {section.intro && <p className="text-lg leading-relaxed text-slate-100">{section.intro}</p>}
                    {section.paragraphs && (
                      <div className="space-y-4 text-lg leading-relaxed text-slate-100">
                        {section.paragraphs.map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                      </div>
                    )}
                    {section.bullets && (
                      <ul className="mt-2 space-y-3 rounded-2xl border border-indigo-200/10 bg-indigo-500/5 p-4 text-base text-indigo-50">
                        {section.bullets.map((bullet) => (
                          <li key={bullet} className="flex gap-3 leading-relaxed">
                            <span className="mt-1 h-2 w-2 rounded-full bg-indigo-300" aria-hidden />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {section.closing && <p className="text-lg leading-relaxed text-slate-100">{section.closing}</p>}
                  </div>
                </div>
              </article>
            ))}

            <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-500 p-[1px] shadow-2xl shadow-indigo-600/20">
              <div className="h-full rounded-3xl bg-slate-950/80 p-8 sm:p-10">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-3 text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-100">Share the op-ed</p>
                    <h3 className="text-2xl font-bold sm:text-3xl">Help keep Burmese families safe and heard</h3>
                    <p className="max-w-2xl text-base text-indigo-50">
                      If this perspective resonates, please share it with policymakers, journalists, and community leaders. The story America tells about TPS will shape real lives—and the future of democracy in Burma.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm font-semibold">
                    <Link
                      href="https://docs.google.com/document/d/1EeBxEaGfnpwbr6mmQ-ZVkB-yrvlOEO-9D0e85Ao4gQs/edit?usp=sharing"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-slate-900 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-white/30"
                    >
                      Open Google Doc
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14.25 9.75h6m0 0v-6m0 6L12 3 3.75 11.25" />
                      </svg>
                    </Link>
                    <Link
                      href="https://twitter.com/intent/tweet?text=Pardoning%20Turkeys%2C%20Deporting%20Dreams%20%E2%80%93%20a%20Burmese%20refugee%E2%80%99s%20plea%20for%20a%20kinder%2C%20wiser%20American%20leadership.&url=https%3A%2F%2Fcivic-test-2025.vercel.app%2Fop-ed"
                      className="inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-3 text-white transition hover:-translate-y-0.5 hover:border-white hover:bg-white/10"
                    >
                      Share on X
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 3h3.308l-7.227 8.26L22.5 21h-5.906l-4.622-5.826L6.6 21H3.29l7.72-8.82L1.5 3h6.094l4.157 5.27L18.244 3zm-1.162 16.17h1.833L7.026 4.744H5.07l12.012 14.426z" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
};

export default OpEdPage;
