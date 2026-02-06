import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

const shareUrl = 'https://civic-test-2025.vercel.app/op-ed';

type Section = {
  title: string;
  intro?: string;
  paragraphs?: string[];
  paragraphs1?: string[];
  bullet?: string[];
  bullets?: string[];
  paragraphs2?: string[];
  closing?: string;
};

type LanguageContent = {
  label: string;
  headTitle: string;
  headDescription: string;
  heroTag: string;
  heroTitle: string;
  heroSubtitle: string;
  author: string;
  authorNote: string;
  thesis: string;
  thesisNote: string;
  readTime: string;
  docLink: string;
  tweetText: string;
  introParagraphs: string[];
  sections: Section[];
  shareHeadline: string;
  shareBody: string;
};

const englishIntroParagraphs = [
  'Every Thanksgiving, America does something beautifully strange: it pardons a turkey.',
  'This year it was Gobble and Waddle—two ‘Make America Healthy Again’ certified birds who, with full Hollywood optics, were spared and sent off to a comfortable retirement instead of the oven. It’s lighthearted, theatrical, and oddly touching. Surely, a nation that can still make time for a symbolic act of mercy is a nation that hasn’t entirely forgotten its virtues?',
  'Meanwhile, in the backdrop of that feel-good moment, the Administration announced that Temporary Protected Status (TPS) for Burma (Myanmar) will end, on the grounds that it is now “safe” for Burmese seeking refuge in the United States to go back to where they belong.',
  'The turkeys got clemency.',
  'The refugees, a deadline.',
  'I say that with a little heaviness and a little humor—no offence to the blessed birds or the many Americans who honestly believe TPS has to end sometime. They’re right about one thing: TPS is temporary by design. It should be consistently reviewed and definitely not become a back door for people who do not face imminent danger in Burma or those who might pose a risk to the American people.',
  'The question is not whether TPS will end.',
  'It’s how and on whose narrative. ',
  'Right now, the story being used to justify terminating TPS for Burma sounds suspiciously like it was drafted in Naypyidaw, not in Washington.',
  'And that is dangerous—for Burmese lives, for American credibility, and for the broader project of making the world a little safer from scam centres, critically dirty minerals, and fashionably trending authoritarian strongmen.',
];

const englishSections: Section[] = [
  {
    title: 'A brown Burmese kid in a big red state',
    intro: 'Let me back up and take you a way back.',
    paragraphs: [
      'For the first half of the 2010s, I was at The College of Wooster in Ohio for my undergrad studies. On paper, a "liberal arts pursuing Burmese kid walks right into the middle of the Midwest" definitely sounds like a setup for a standup comedy skit. In practice, it was one of the most formative experiences of my life.',
      'At first, it did feel like a juxtaposition: best and brightest students from all over the world living on campus surrounded by cornfields, Amish buggies, and pickup trucks revving down Beall Ave on Rumspringa. But when critical thinking meets Midwestern values, something surprising happens. Over seasonal potlucks and Thanksgiving meals, you start hearing the deeper story:',
    ],
    bullet: [
      'Factories that once anchored whole towns closing down and never coming back.',
      'Parents working two or three jobs while worrying about fentanyl and opioids, school shootings, and whether their kids will ever afford a home.',
      'People who feel talked down to by elites but ignored when they say, “We’re not against immigration, we’re against chaos.”',
    ],
    paragraphs1: [
      'If you only scroll through your newsfeeds, you might think these fears are just “xenophobia.” Sitting down together at a dining table in Wooster, you soon realize they’re often grief in disguise—grief for lost security, lost dignity, and a world that has moved on without their consent.',
      'And yet, those same Midwesterners would go out of their way to drive brown kids like me to Walmart, invite us in like their own family, and check on our families when they saw something terrible happening 8,000 miles away. Their moral compass was simple and biblical: love thy neighbor, be a good steward, do not ignore evil when you have the power to stop it.',
      "That's the America I knew:",
      'deeply proud, but also deeply generous.',
      'So when conservatives say, “TPS can’t be forever; we need firm borders and serious vetting,” I don’t hear cruelty. I hear people who have seen too much chaos and simply don’t want to be caught off-guard again.',
    ],
    closing: 'The irony is: we feel exactly the same way.',
  },
  {
    title: 'TPS is temporary—but the framing must reflect contemporary reality',
    paragraphs: [
      'By law and by logic, TPS is temporary. It’s meant for “extraordinary and temporary conditions”—a war, a disaster—that make safe return impossible. When those conditions truly change, TPS should be revised outright.',
      'If DHS had calmly said: ',
    ],
    bullet: [
      '“Burma remains extremely dangerous, but TPS was never designed as a permanent solution. We’re ending it while simultaneously working with Congress on a path for long-resident Burmese TPS holders to adjust, and we’re ramping up pressure on the junta,” ',
    ],
    paragraphs1: [
      '... we would still be pretty bummed out, but hey, at least the story would be Midwest honesty!',
      'Instead, the official justification leans on phrases like “notable progress in governance and stability,” the lifting of the state of emergency, planned “free and fair elections,” and ceasefires—as if Burma were staggering toward normalcy.',
      'That framing would be questionable even if Burma stood alone.',
      'But TPS wasn’t just ended for Burma. It was terminated for a big cluster of countries at once—nearly twenty designations—under a general offensive to tighten humanitarian protections and “return TPS to its original, temporary purpose.” Ending multiple programs is a political choice; how you frame each one is a moral and strategic one.',
      'In Burma’s case, the sequence and the narrative are a ‘Jet2 holiday’ gift to the generals. Seriously, how can anything beat that?',
      'If you were trying to design a propaganda win for the junta, you really couldn’t do much better than:',
    ],
    bullets: [
      'Announce an election everyone calls a sham. Televise choreographed scam center raids. Orchestrate China-brokered cheap peace deals.',
      'Stage highly selective prisoner releases, but keep Aung San Suu Kyi and President Win Myint locked up.',
      'DHS, in that same window, declare Burma has made “notable progress” and TPS can safely end.',
      'The junta then goes on TV and says, “Even America says we are stabilizing. Come one, come all, welcome home to cast your votes. We promise we’ll be kind this time!”',
    ],
    paragraphs2: [
      'Honestly, the junta’s Return-on-Investment with DCI Group on their lobbying and PR operation is almost impressive in a dark way. If you are a dictator shopping around for a contractor, the ability to get your talking points echoed almost verbatim in the U.S. Federal Register notice must look like a five-star Yelp review!',
      '⭐⭐⭐⭐⭐',
    ],
    closing:
      'That is the problem—not just that TPS is ending, but that the narrative of its termination is being hijacked by a thuggish regime that only treats its population as hostages.',
  },
  {
    title: 'The junta’s “improvements”: hostages, not citizens',
    intro: 'The Burmese military has indeed made some loud gestures lately:',
    bullet: [
      'It ended the formal state of emergency.',
      'It announced elections.',
      'It released a batch of prisoners mostly convicted under the post-coup amended incitement law.',
    ],
    paragraphs1: [
      'If you squint hard enough from far enough away, this can look like sunshine on a gloomy day. But the basics haven’t changed:',
    ],
    bullets: [
      'Aung San Suu Kyi is still held captive.',
      'President Win Myint is still detained.',
      'Thousands of political prisoners—including student activists, journalists, and community leaders—remain imprisoned or disappeared.',
      'The National Unity Government and most Ethnic Resistance Organizations have been excluded from any real dialogue.',
      'Airstrikes, artillery attacks, and burnings of churches, schools, hospitals, and villages continue in many parts of the country.',
    ],
    paragraphs2: [
      'Everyone under junta control from Mandalay to Moulmein knows the score:',
      'you are free until you are not.',
      'Anyone “released” can be re-detained with a Facebook post, a rumor, or no reason at all. Anyone who speaks too honestly about the elections, the war, or the economy risks a knock on the door in the middle of the night.',
      'That includes people deported back.',
      'So when DHS implies Burma is now safe enough for mass return, it isn’t just morally wrong; it’s practically dangerous. It hands the junta a list of potential hostages and a ready-made talking point:',
      '“Washington agrees conditions have improved. Those who come back now but cause trouble? Clearly, they are criminals, not victims.”',
    ],
    closing:
      'Even ASEAN—who normally specialize in understatement—ain’t buying it. When countries that only communicate in non-interference language, and quite frankly many of whom not exactly human-rights crusaders, start quietly conceding that the polls are a sham and that Aung San Suu Kyi’s continued detention makes any “transition” illegitimate, Washington should listen.',
  },
  {
    title: 'Congress gets it. DHS should catch up.',
    paragraphs: [
      'If you want to see what a more realistic American position looks like, watch the most recent House Foreign Affairs Committee joint hearing: “No Exit Strategy: Burma’s Endless Crisis and America’s Limited Options.” It brought together the East Asia & Pacific and South & Central Asia subcommittees—Republican and Democrat members alike—and the message was remarkably aligned.',
      'In resolute bi-partisan spirit, members:',
    ],
    bullet: [
      'Called the upcoming election a “sham” and “theatre”, not a democratization milestone.',
      'Emphasized that no election can be credible while Aung San Suu Kyi and other key leaders remain imprisoned and large parts of the population are under bombardment.',
      'Urged the Administration to publicly condemn the junta’s plans and to appoint a Special Representative and Policy Coordinator for Burma to pull together sanctions, diplomacy, and support for democracy in a coherent strategy.',
    ],
    paragraphs1: [
      'This isn’t activists versus the establishment. It’s Congress versus a bad narrative.',
      'DHS doesn’t have to change its legal conclusion tomorrow to change its language today. It could revise the framing to say:',
    ],
    bullets: [
      'Burma remains profoundly unsafe.',
      'TPS is being ended as part of a broader policy shift, not because the junta has restored freedom or stability.',
      'The U.S. stands with Congress and other democracies in rejecting the junta’s sham election and demanding the release of Aung San Suu Kyi and all political prisoners.',
    ],
    paragraphs2: [
      'That small narrative shift would deny the junta a propaganda trophy while still allowing DHS to pursue its immigration agenda.',
    ],
    closing: 'It costs nothing, but gains a great deal in moral clarity.',
  },
  {
    title: 'Yes, vet carefully. But don’t mow down the entire orchard.',
    intro:
      'There is another concern underlying the TPS debate that deserves to be taken seriously: security.',
    paragraphs: [
      'Stories of violent crimes or terrorism by people with foreign ties hit a nerve, and rightly so. When Americans see a headline about an asylum seeker involved in a brutal shooting—or about sanctioned regime affiliates trying to sneak in to launder money and reputation—the instinct to say “enough” is understandable.',
      'As refugees, we do not ask you to ignore that instinct. On the contrary, we too share it.',
      'We have no interest in seeing junta cronies use our communities as safe havens or backdoors for sanctions evasion. We have no tolerance for anyone—Burmese or otherwise—who uses America’s openness to harm Americans. And we are painfully aware that one “bad apple” story can overshadow thousands of quiet, law-abiding lives.',
      'The answer, though, is not to decimate the whole orchard.',
      'By all means:',
    ],
    bullet: [
      'Vetting should be meticulous. If someone has ties to the military, its militias, or its financial networks, scrutinize them harder than anyone else.',
      'Sanctions evasion should be hunted down, especially through shell companies, crypto accounts, and high-end real estate.',
      'People who lie on Customs & Borders Protection forms, commit serious crimes, or pose real threats should be prosecuted and, if necessary, removed.',
    ],
    paragraphs2: [
      'Most of us who fled the junta want exactly that. We did not risk our lives to escape one set of criminals only to live under a softer, better-dressed version of them.',
    ],
    closing:
      'Border security and refugee protection are not opposites. They are two equal parts of the same project: defending a society where the law means exactly what it means and the vulnerable are shielded, not exploited.',
  },
  {
    title: 'Scam Centre Strike Force: good start, now choose the right partners',
    paragraphs: [
      'On one front, the Administration has moved in exactly the right direction: the creation of a Scam Centre Strike Force that targets cyber-fraud hubs in Southeast Asia, including those in Burma.',
      'That is real leadership. Scam compounds have tortured trafficked workers and stripped victims—many in the U.S.—of billions of dollars. Going after them is not charity; it is a vital national-security and economic priority.',
      'But there is a crucial next step: choose the right friends!',
      'If Washington leans primarily on the junta for “cooperation,” it will only get:',
    ],
    bullet: [
      'choreographed raids and photo-ops,',
      'low-level scapegoats,',
      'and carefully limited asset seizures.',
    ],
    paragraphs1: [
      'If it broadens cooperation to include local resistance actors—the Karen National Union, NUG-linked structures, and EROs that actually control territory and have moral legitimacy—then the Strike Force can:',
    ],
    bullets: [
      'map scam networks more accurately,',
      'cut into the crypto pipelines that move profits,',
      'and trace every possible linkage back to military, police, militia, and transnational sponsors.',
    ],
    paragraphs2: [
      'Imagine if a portion of the billions in confiscated crypto assets linked to scam operations were held as a kind of strategic crypto reserve for justice—used to compensate victims, support rehabilitation for trafficked workers, and, yes, help fund the rebuilding of a democratic Burma one day.',
    ],
    closing:
      'That would be real realpolitik: turning stolen value into leverage for accountability, not handing it back to the same people who built the scam empires.',
  },
  {
    title: 'Rare earths: cut the criminal middleman, not corners',
    intro: 'Then there is the quieter, dirtier issue: rare earths and critical minerals.',
    paragraphs: [
      'Burma’s north is rich in heavy rare earth elements needed for electric vehicles, wind turbines, F-22s, and advanced microprocessors. Today, much of that extraction is:',
    ],
    bullet: [
      'environmentally devastating,',
      'controlled by militias, cronies, or foreign brokers,',
      'and deeply entangled in the junta’s war economy and Beijing’s strategic networks.',
    ],
    paragraphs1: [
      'Some in Washington may be tempted to think: “We can stomach a less-than-perfect partner if it helps break China’s stranglehold on these minerals.”',
      'But that is a false shortcut. A supply chain that runs through war crimes, land grabs, and criminal syndicates is a strategic liability, not an asset. It is brittle, blackmailable, and morally corrosive.',
    ],
    bullets: [
      'Work with NUG-aligned authorities and EROs in liberated areas to shut down the most abusive operations and pilot legal, monitored extraction under federal principles.',
      'Integrate Burma into refinery supply-chain partnerships with allied economies—Malaysia, Thailand, Japan, South Korea, Australia—where environmental and labor standards can be enforced.',
      'Treat junta-linked rare-earth exports as radioactive, high-risk, and sanctionable, not as bargaining chips.',
    ],
    closing:
      'Again, the choice is not between purity and pragmatism. It is between short-sighted deals that entrench criminal control and long-term arrangements that actually reduce dependence and volatility.',
  },
  {
    title: 'Endless crisis does not mean hopeless crisis',
    paragraphs: [
      'The title of that House hearing—“No Exit Strategy: Burma’s Endless Crisis and America’s Limited Options”—captures how Burma can feel from afar: a tragic, intractable conflict in a far-off land.',
      'But “endless” should describe the junta’s plan, not our imagination.',
      'I grew up under military rule. I have seen the “endless crisis” frame deployed before—by the regime itself. “Nothing can be done,” they say. “The country is too fractured, democracy too naive, the people too volatile. Better to accept the disciplined democracy of the Tatmadaw.”',
      'If America’s institutions internalize that fatalism, the generals win twice: at home, by crushing dissent; abroad, by convincing powerful democracies that nothing better is possible.',
      'The truth is harder but not without hope:',
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
    title:
      'If President Trump ends Burma’s nightmare, 60 million Burmese has your back for the Nobel',
    paragraphs: [
      'I do not write this to throw shade at the administration. I write as someone who knows that this administration has leverage that others did not. It can:',
    ],
    bullet: [
      'align with Congress’s bipartisan calls to condemn the sham elections and appoint a Burma Special Representative;',
      'toughen Scam Centre Strike Force operations while partnering with legitimate local actors;',
      'reframe TPS termination in a way that denies propaganda value to the junta;',
      'and push allied economies and businesses to treat junta-linked critical minerals and scam transactions as radioactive, not “emerging market opportunities.”',
    ],
    paragraphs1: [
      'If it did those things—if it used American prowess to shorten, rather than simply manage, Burma’s endless crisis—it would not just be making America safer. It would be doing something truly historic.',
      'I say this without sarcasm:',
      'if this administration could help bring about a genuine political settlement in Burma—one that frees Aung San Suu Kyi, ends mass atrocities, and puts the country on a federal democratic path—you would see Burmese people across the world line up to nominate President Trump for the Nobel Peace Prize! 🕊️',
    ],
    closing: 'We are not picky about who helps save our country. We only care that it gets done.',
  },
  {
    title: 'Thanksgiving, identity, and the America we still believe in',
    paragraphs: [
      'TPS holders from Burma sometimes joke darkly that even the president’s turkeys have a clearer path to safety than we do. It is gallows humor that masks real grief and real fear.',
      'But when I think about my life here—from the Wooster host families who insisted I always have the last piece of pumpkin pie, to the Burmese-American aunties who now organize food drives for new arrivals and monthly fundraisers—I cannot see this country only through the lens of one Federal Register notice.',
      'I see the America President Reagan profoundly spoke of: that you can move to many countries and never truly belong, but “anyone from any corner of the world can come to America and become an American.”',
      'American values as such is more heartfelt than any one party victory, any one DHS policy, any one moment of panic about immigration or geopolitical fatigue.',
      '“Peace through strength” has been a catchphrase often thrown around in foreign policy. In President Reagan’s America that most still believe in, we sorely need peace through strength and wisdom:',
    ],
    bullets: [
      'Strength that locks the doors against traffickers, terrorists, and junta cronies.',
      'Strength that doesn’t let dictatorships lobby and influence our criteria of “security” and "moral clarity"',
      'Wisdom that hears the bipartisan warnings from Congress, listens to allies and investigations, and refuses to reward performance in place of genuine reform.',
      'Wisdom that remembers that TPS is temporary, but the value of a human life is not.',
    ],
    paragraphs2: [
      'If the story of this Thanksgiving is simply “Turkeys saved, refugees deported because the junta says things are better now,” then something has gone wrong in the American experiment.',
      'If instead the story becomes “Turkeys pardoned, refugees heard, junta called out, scam centres dismantled, dirty critical minerals supply chains disrupted”—then America will have done more than protect its borders. It will have lived up, once again, to President Reagan’s America: that anyone from any corner of the world can stake their future here, not because America is perfect, but because it is inclusive and principled, capable of choosing courage over convenience.',
      'The Burma crisis has lasted my entire life—and that of my father’s and grandfather’s—across three generations and counting. Naturally, it has often felt endless. But “endless” is a description, not a destiny.',
      'With enough strength, wisdom, and yes, a little Midwestern kindness, it can end in our generation.',
    ],
    closing: 'Maybe even under this administration.',
  },
];

const burmeseIntroParagraphs = [
  'နှစ်စဉ်နှစ်တိုင်း ကျေးဇူးတော်နေ့ (Thanksgiving) ရောက်တိုင်း အမေရိကန်နိုင်ငံဟာ ထူးဆန်းပြီး ချစ်စရာကောင်းတဲ့ ဓလေ့တစ်ခုကို လုပ်လေ့ရှိပါတယ်၊ သမ္မတမှကိုယ်တိုင် ကြက်ဆင်တွေကို အသက်ဘေးကနေ လွတ်ငြိမ်းချမ်းသာခွင့် ပေးတဲ့ပွဲလေးပါပဲ။ ',
  'ဒီနှစ်မှာတော့ "Make America Healthy Again" (အမေရိကကို ပြန်လည်ကျန်းမာစေမည်) လက်မှတ်ရထားတဲ့ "Gobble" နဲ့ "Waddle" လို့ အမည်ရတဲ့ ကြက်ဆင်ကြီး နှစ်ကောင်ဟာ ဟောလိဝုဒ်ဆန်ဆန် အခမ်းအနားတွေနဲ့ သမ္မတရဲ့ လွတ်ငြိမ်းခွင့်ကို ရရှိခဲ့ပါတယ်။ မီးဖိုထဲ ရောက်မယ့်အစား မြောက်ကယ်ရိုလိုင်းနားပြည်နယ်က ကောလိပ်ပိုင် ခြံဝင်းတစ်ခုမှာ အေးအေးဆေးဆေး အငြိမ်းစားယူခွင့် ရသွားကြပါပြီ။ ပေါ့ပေါ့ပါးပါးနဲ့ ပြဇာတ်ဆန်သလို ကြည်နူးစရာလဲ ကောင်းပါတယ်။ အပြုသဘောဆောင်တဲ့ ကရုဏာသက်မှုလေးတစ်ခုအတွက် အချိန်ပေးနိုင်သေးတဲ့ တိုင်းပြည်တစ်ခုဟာ သူ့ တို့ရဲ့ မွန်မြတ်တဲ့ စိတ်နေစိတ်ထားကို လုံးဝ မမေ့ပြောက်သေးပါကြောင်း အဓိပ္ပာယ်သက်ရောက်နေသလိုပါပဲ။',
  'ဒါပေမဲ့ အဲဒီလို ကြည်နူးစရာကောင်းတဲ့ မြင်ကွင်းရဲ့ နောက်ကွယ်မှာတော့ အစိုးရအဖွဲ့က "မြန်မာနိုင်ငံသားများအတွက် ယာယီအကာအကွယ်ပေးထားမှု အစီအစဉ် (TPS) ကို အဆုံးသတ်တော့မယ်" လို့ ကြေညာခဲ့ပါတယ်။ အမေရိကန်မှာ ခိုလှုံခွင့် တောင်းခံနေရသူတွေအတွက် နေရပ်ပြန်ဖို့ "လုံခြုံစိတ်ချရပြီ" လို့ အကြောင်းပြပါတယ်။',
  'ကြက်ဆင်တွေကတော့ လွတ်ငြိမ်းချမ်းသာခွင့် ရသွားပြီး၊',
  'ရွှေ့ပြောင်းခိုလှုံသူတွေကတော့ သတ်မှတ်ရက် (Deadline) တစ်ခု ရလိုက်ပါတယ်။',
  'အခုလိုပြောဆိုခြင်းဟာ ကံကောင်းသွားတဲ့ ကြက်ဆင်တွေနဲ့ ချစ်စရာကောင်းတဲ့ ဓလေ့စရိုက်ကို စော်ကားလိုလို့ မဟုတ်သလို၊ TPS ဆိုတာ တချိန်ချိန်မှာ ပြီးဆုံးရမယ်လို့ ရိုးသားစွာ ယုံကြည်တဲ့ အမေရိကန် ပြည်သူတွေကို စော်ကားလိုလို့လည်း မဟုတ်ပါဘူး။ သူတို့ အချက်တစ်ချက် မှန်ပါတယ်။ TPS ဆိုတာ မူလရည်ရွယ်ချက်ကတည်းက ယာယီ (Temporary) ပါ။ ဒါကို စဉ်ဆက်မပြတ် ပြန်လည်သုံးသပ်သင့်တာ မှန်ပါတယ်။ မြန်မာပြည်မှာ အန္တရာယ်ကြီးကြီးမားမား မရှိတဲ့သူတွေ (သို့) အမေရိကန် ပြည်သူတွေအတွက် အန္တရာယ်ဖြစ်စေနိုင်တဲ့ သူတွေအတွက် နောက်ဖေးပေါက် ဖြစ်မသွားသင့်တာလည်း မှန်ပါတယ်။',
  'မေးခွန်းက TPS အဆုံးသတ်မှာလား၊ မသတ်ဘူးလား ဆိုတာ မဟုတ်ပါဘူး။',
  'မေးခွန်းက ဘယ်လို အဆုံးသတ်မှာလဲ နဲ့ ဘယ်သူ့ရဲ့ ဇာတ်လမ်း (Narrative) အပေါ် အခြေခံပြီး ဆုံးဖြတ်မှာလဲ ဆိုတာသာ ဖြစ်ပါတယ်။',
  'အခုလောလောဆယ်မှာ မြန်မာ TPS ရပ်စဲဖို့ အကြောင်းပြချက်အဖြစ် သုံးနေတဲ့ ဇာတ်လမ်းက ဝါရှင်တန်မှာ ရေးဆွဲထားတာ မဟုတ်ဘဲ နေပြည်တော်မှာ ရေးဆွဲထားသရောင်ရောင် သံသယဖြစ်စရာကောင်းလောက်အောင် တူလွန်းနေပါတယ်။',
  'ဒါဟာ အင်မတန်မှ အန္တရာယ် ရှိပါတယ်။ မြန်မာပြည်သူတွေရဲ့ အသက်အိုးအိမ်အတွက် အန္တရာယ်ရှိသလို၊ အမေရိကန်ရဲ့ ဂုဏ်သိက္ခာအတွက်၊ ပြီးတော့ ကျားဖြန့်စခန်းတွေ၊ ညစ်ပတ်တဲ့ သယံဇာတတွေနဲ့ ခေတ်စားနေတဲ့ အာဏာရှင်တွေ ရန်ကနေ ကမ္ဘာကြီးကို ပိုလုံခြုံအောင် လုပ်မယ့် စီမံကိန်းကြီးတစ်ခုလုံးအတွက်လည်း အန္တရာယ် ရှိပါတယ်။',
];

const burmeseSections: Section[] = [
  {
    title: 'အနီရောင်လွှမ်း ပြည်နယ်တစ်ခုဆီ ရောက်သွားတဲ့ အသားညိုညို မြန်မာကျောင်းသားလေး',
    paragraphs: [
      'နည်းနည်းလောက်တော့ နောက်ကြောင်းပြန်ပါရစေ။',
      '၂၀၁၀ ပြည့်လွန်နှစ်တွေရဲ့ အစပိုင်းကာလမှာ အိုဟိုင်းယိုး (Ohio) ပြည်နယ်၊ The College of Wooster မှာ ကျွန်တော် ဘွဲ့ကြိုတန်း တက်ခဲ့ပါတယ်။ အဲ့ဒီဝန်းကျင်လောက်တုန်းကတော့ "ဝိဇ္ဇာပညာတော်သင် (Liberal Arts) အသားညိုညို မြန်မာကျောင်းသားလေး တစ်ယောက် အမေရိကန် အနောက်အလယ်ပိုင်း (Midwest) တောထဲရောင်လည်လည်နဲ့ စွန့်စားခန်းထွက်ခြင်း" ဆိုတာ ဟာသတစ်ခုလို ဖြစ်နေနိုင်ပါတယ်။ ဒါပေမဲ့ လက်တွေ့မှာတော့ အဲဒီအချိန်တွေဟာ ကျွန်တော့်ဘဝရဲ့ အရေးအပါဆုံး အတွေ့အကြုံတွေ ဖြစ်ခဲ့ပါတယ်။',
      'စရောက်ကာစကတော့ အစွန်းနှစ်ဘက်ဆန့်ကျင်ဘက်များစွာများနဲ့ ပြည့်နက်နေသလိုပါပဲ။ ကျောင်းဝင်းထဲမှာ ကမ္ဘာအရပ်ရပ်က ထူးချွန်ကျောင်းသားတွေ၊ ကျောင်းပြင်ပမှာတော့ ပြောင်းခင်းတွေရယ်၊ လျှပ်စစ်မီးတောင်မသုံးတဲ့ အေမစ် (Amish) လူမျိုးတွေရဲ့ မြင်းလှည်းတွေနဲ့ Beall လမ်းမကြီးပေါ်မှာ ပစ်ကပ်ကားကြီးတွေ မောင်းနှင်သွားလာနေတာ မြို့ခံမဟုတ်သူတိုင်းအတွက်တော့ အိမ်မက်ကမ္ဘာတစ်ခုထဲရောက်နေသလိုပါပဲ။ ဒါပေမဲ့ ဝေဖန်ပိုင်းခြား တွေးခေါ်မှု (Critical Thinking) နဲ့ Midwestern တန်ဖိုးထားမှုများ ပေါင်းစပ်လိုက်တဲ့အခါ အံ့ဩစရာကောင်းတဲ့ အရာတစ်ခု ဖြစ်လာပါတယ်။ ရာသီပေါ် စားသောက်ဖွယ်ရာတွေနဲ့ Thanksgiving မိသားစုထမင်းစားပွဲတွေမှာတော့ သူတို့ဆီက ပိုလေးနက်တဲ့ ဇာတ်လမ်းတွေကို ကြားလာရပါတယ် -',
    ],
    bullets: [
      'တစ်ချိန်က မြို့လုံးကျွတ် မှီခိုခဲ့ရတဲ့ စက်ရုံကြီးတွေ ပိတ်သိမ်းသွားပြီး ဘယ်တော့မှ ပြန်မဖွင့်တော့တဲ့ အကြောင်း။',
      'မိဘတွေက အလုပ် ၂ ခု၊ ၃ ခု လုပ်ရင်း ဖန်တာနိုင်း (Fentanyl) နဲ့ ဘိန်းဖြူ အန္တရာယ်၊ ကျောင်းတွင်း ပစ်ခတ်မှုတွေနဲ့ သူတို့ကလေးတွေ အိမ်ပိုင်နိုင်ပါ့မလား ဆိုတာကို စိုးရိမ်နေရတဲ့ အကြောင်း။',
      '"ငါတို့က လူဝင်မှုကြီးကြပ်ရေးကို ဆန့်ကျင်တာ မဟုတ်ဘူး၊ ဖရိုဖရဲဖြစ်နေတာ (Chaos) ကို ဆန့်ကျင်တာ" လို့ ပြောတဲ့အခါ အထက်စီးက ဆက်ဆံခံရသလို ခံစားရပြီး လစ်လျူရှုခံရတဲ့ လူတွေအကြောင်း။',
    ],
    paragraphs2: [
      'Facebook ပေါ်က သတင်းတွေကိုပဲ ဖတ်ကြည့်ရင်တော့ ဒီအကြောက်တရားတွေကို "လူမျိုးခြားကြောက်ရောဂါ (Xenophobia)" လို့ ထင်စရာ ရှိပါတယ်။ ဒါပေမဲ့ Wooster မြို့က ထမင်းစားပွဲမှာ အတူထိုင်ပြီး နားထောင်ကြည့်လိုက်ရင်တော့ ဒါတွေဟာ ရုပ်ဖျက်ထားတဲ့ ဝမ်းနည်းပူဆွေးမှု (Grief in disguise) တွေ ဖြစ်ကြောင်း သိလာရပါတယ်။ လုံခြုံမှုတွေ ပျောက်ဆုံးသွားလို့၊ ဂုဏ်သိက္ခာတွေ ပျောက်ဆုံးသွားလို့၊ သူတို့ သဘောဆန္ဒမပါဘဲ ပြောင်းလဲသွားတဲ့ ကမ္ဘာကြီးအတွက် ဝမ်းနည်းနေကြတာပါ။ ',
      'အဲဒီ Midwestern သားတွေကပဲ ကျွန်တော်တို့လို အသားညိုညို ကလေးတွေ မိုးထဲလေထဲ လမ်းလျှောက်နေတာတွေ့ရင် Walmart သော်လိုရာခရီးသို့ ကားကြုံပို့ပေးတတ်ကြပါတယ်။ Thanksgiving ပွဲတွေ၊ တနင်္လာနေ့ည ဘောလုံးပွဲတွေမှာ မိသားစုဝင်လို ခေါ်ကျွေးတတ်ကြပါတယ်။ ကမ္ဘာ့ဟိုဘက်ခြမ်း မိုင် ၈၀၀၀ အကွာမှာ အခြေအနေဆိုးနေတယ်လို့ TV မှာ တွေ့ရင် ကျွန်တော့်မိသားစု အဆင်ပြေရဲ့လားဆိုပြီး မေးမြန်းပေးကြပါတယ်။ မြန်မာ့နိုင်ငံရေးအကြောင်းစုံ နိုင်ငံရေးသိပ္ပံကျောင်းသားလေးကျွန်တော့်ကို လပတ်စာမေးပွဲစစ်နေသလိုပင် မေးခွန်းတွေထုတ်ပြီးရင်တော့ ကန်စွန်းဥဟင်း (Sweet potato casserole) တစ်ပန်းကန်နဲ့ Pecan သီးတွေပါတဲ့ ရွှေဖရုံသီးမုန့် (Pumpkin Pie) တစ်စိတ်ပို ထပ်ထည့်ပေးတတ်ပါတယ်။',
      'သူတို့ရဲ့ ကိုယ်ကျင့်တရား စံနှုန်းဟာ ရိုးရှင်းပြီး သမ္မာကျမ်းစာကြေညှက်ပါပေတယ် - "အိမ်နီးချင်းကို ချစ်ပါ၊ ကောင်းသော အမှုတော်ကို ဆောင်ပါ၊ မကောင်းမှု ဒုစရိုက်ကို တားဆီးနိုင်တဲ့ အင်အားရှိလျက်နဲ့ လစ်လျူမရှုပါနဲ့။"',
      'ဒါဟာ ကျွန်တော်သိခဲ့ရတဲ့ အမေရိကပါပဲ - ',
      'အလွန် ဂုဏ်ယူတတ်သလို၊ အလွန်လည်း လူသားဆန်တတ်တဲ့ နိုင်ငံပါ။',
    ],
    closing:
      'ဒါကြောင့် ရှေးရိုးစွဲဝါဒီ (Conservatives) တွေက "TPS ဆိုတာ ထာဝရ မဖြစ်သင့်ဘူး၊ ခိုင်မာတဲ့ နယ်စပ်နဲ့ စေ့စေ့စပ်စပ် စိစစ်မှုတွေ လိုတယ်" လို့ ပြောရင် ကျွန်တော်က ဒါကို ရက်စက်မှုလို့ မမြင်ပါဘူး။ ဖရိုဖရဲနိုင်မှုတွေ၊ ပျက်ကွက်ခဲ့တဲ့ ကတိတွေ များလွန်းလို့ နောက်ထပ် အလိမ်မခံချင်တော့တဲ့ လူတွေရဲ့ စကားသံလို့ပဲ ကြားပါတယ်။ ရယ်စရာကောင်းတာက... ကျွန်တော်တို့လည်း အဲဒီလိုပဲ ခံစားရလို့ပါပဲ။',
  },
  {
    title:
      'TPS ဆိုတာ ယာယီပါ - ဒါပေမဲ့ "ခေါင်းစဉ်တပ်ပုံ (Framing)" က လက်ရှိအမှန်တရားကို ထင်ဟပ်ရပါမယ်',
    paragraphs: [
      'ဥပဒေအရရော ယုတ္တိဗေဒအရပါ TPS ဆိုတာ ယာယီ (Temporary) ပါ။ စစ်ပွဲတွေ၊ သဘာဝဘေးတွေလို "ထူးခြားပြီး ယာယီအခြေအနေတွေ" ကြောင့် နေရပ်ပြန်ဖို့ မဖြစ်နိုင်တဲ့အခါ ပေးထားတဲ့ အရာပါ။ အဲဒီအခြေအနေတွေ တကယ်ပြောင်းလဲသွားရင် TPS ကို ပြန်လည်သုံးသပ်သင့်ပါတယ်။',
      'အကယ်၍ အမိမြေလုံခြုံရေးဌာန (DHS) ကသာ အခုလို တည်ငြိမ်စွာ ပြောခဲ့မယ်ဆိုရင် -',
    ],
    bullet: [
      '"မြန်မာပြည် အခြေအနေက အလွန်အန္တရာယ်များနေဆဲ ဖြစ်ပေမယ့်၊ TPS ဆိုတာ ထာဝရအဖြေတစ်ခု မဟုတ်ပါဘူး။ ဒါကြောင့် ကျွန်တော်တို့က ဒီအစီအစဉ်ကို အဆုံးသတ်လိုက်ပြီး၊ တချိန်တည်းမှာပဲ ကွန်ဂရက်လွှတ်တော်နဲ့ ပူးပေါင်းကာ နှစ်ရှည်နေထိုင်သူ မြန်မာ TPS သမားတွေအတွက် ဥပဒေလမ်းကြောင်း ရှာဖွေပေးမယ်၊ စစ်ကောင်စီကိုလည်း ဖိအားတွေ တိုးမြှင့်သွားမယ်"',
    ],
    paragraphs1: [
      '... အဲဒီလိုသာ ပြောရင် ကျွန်တော်တို့ ကြောက်နေရဦးမှာ ဖြစ်ပေမယ့်၊ အနည်းဆုံးတော့ ဇာတ်လမ်းက Midwest ရိုးသားမှုမျိုး ရှိပါသေးတယ်။',
      'ဒါပေမဲ့ လက်တွေ့မှာတော့ တရားဝင် အကြောင်းပြချက်တွေက "အုပ်ချုပ်ရေးနှင့် တည်ငြိမ်မှုတွင် သိသာထင်ရှားသော တိုးတက်မှုများ"၊ အရေးပေါ်အခြေအနေ ရုပ်သိမ်းခြင်း၊ "လွတ်လပ်ပြီး တရားမျှတသော ရွေးကောက်ပွဲများ"၊ အပစ်အခတ်ရပ်စဲရေးများ စတဲ့ စကားလုံးတွေကို မှီခိုနေပါတယ်။ မြန်မာပြည်က ပုံမှန်အခြေအနေဆီ တရွေ့ရွေ့သွားနေသယောင် ပြောဆိုနေပါတယ်။',
      'ဒီလို ခေါင်းစဉ်တပ်တာ (Framing) ဟာ မြန်မာပြည် တစ်နိုင်ငံတည်း ဆိုရင်တောင် မေးခွန်းထုတ်စရာ ဖြစ်နေပါပြီ။',
      'ဒါပေမဲ့ TPS ဟာ မြန်မာပြည် တစ်နိုင်ငံတည်းအတွက် ရပ်စဲခံရတာ မဟုတ်ပါဘူး။ လူသားချင်းစာနာမှုဆိုင်ရာ အကာအကွယ်တွေကို တင်းကျပ်ပြီး "TPS ကို မူလရည်ရွယ်ချက်အတိုင်း ယာယီအဖြစ် ပြန်ရောက်စေရေး" ဆိုတဲ့ မူဝါဒအောက်မှာ နိုင်ငံ ၂၀ နီးပါးအတွက် တပြိုင်နက်တည်း ရပ်စဲခံရတာ ဖြစ်ပါတယ်။ အစီအစဉ်အများအပြားကို ရပ်စဲတာက နိုင်ငံရေး ရွေးချယ်မှု (Political Choice) ပါ။ ဒါပေမဲ့ တစ်ခုချင်းစီကို ဘယ်လို ခေါင်းစဉ်တပ်မလဲ ဆိုတာကတော့ ကိုယ်ကျင့်တရားနဲ့ မဟာဗျူဟာဆိုင်ရာ ရွေးချယ်မှု ဖြစ်ပါတယ်။',
      "မြန်မာ့ကိစ္စမှာတော့ ဒီအဖြစ်အပျက် အစီအစဉ်နဲ့ ဇာတ်လမ်းဟာ ဗိုလ်ချုပ်တွေအတွက် 'Jet2 holiday' ခရီးစဉ် လက်ဆောင်ရသလို ထီပေါက်ခြင်းပါပဲ။ တကယ်ပါ... ဒီထက်ကောင်းတာ ဘာရှိဦးမှာလဲ။",
      'အကယ်၍ ခင်ဗျားသာ စစ်ကောင်စီအတွက် ဝါဒဖြန့်ချိရေး အောင်ပွဲတစ်ခု ဖန်တီးပေးချင်တယ် ဆိုရင်တောင် ဒီထက်ပိုကောင်းအောင် လုပ်ပေးနိုင်မှာ မဟုတ်ပါဘူး -',
    ],
    bullets: [
      'ကျားဖြန့်စခန်းတွေကို ဝင်စီးပြတာ ရုပ်သံလွှင့်မယ်။',
      'တရုတ်ကြားဝင်တဲ့ တန်ဖိုးနည်း ငြိမ်းချမ်းရေး စာချုပ်တွေ ချုပ်မယ်။',
      'ဒေါ်အောင်ဆန်းစုကြည်နဲ့ သမ္မတ ဦးဝင်းမြင့်ကို ဆက်ဖမ်းထားပြီး၊ ရွေးချယ်ထားတဲ့ အကျဉ်းသားတချို့ကို ဟန်ပြ လွှတ်ပေးမယ်။',
      'အဲဒီအချိန်မှာပဲ DHS က မြန်မာပြည်မှာ "သိသာထင်ရှားသော တိုးတက်မှုများ" ရှိနေပြီ၊ ဒါကြောင့် TPS ရပ်စဲလို့ ရပြီလို့ ကြေညာမယ်။',
      'ချက်ချင်းဆိုသလို စစ်ကောင်စီက တီဗီမှာ ထွက်ပြောမယ် - "တွေ့လား... အမေရိကန်ကတောင် ငါတို့ တည်ငြိမ်နေပြီလို့ ပြောနေတယ်။ အားလုံးပဲ အိမ်ပြန်လာပြီး မဲပေးကြပါ။ ငါတို့ ဒီတခါတော့ ကြင်နာပါ့မယ်လို့ ကတိပေးပါတယ်" ဆိုပြီး။',
    ],
    paragraphs2: [
      'စစ်ကောင်စီအတွက်တော့ DCI Group လို လော်ဘီအဖွဲ့နဲ့ သူတို့ရဲ့ PR လုပ်ငန်းတွေအပေါ် ရင်းနှီးမြှုပ်နှံမှု အကျိုးအမြတ် (ROI) ဟာ ကြောက်စရာကောင်းလောက်အောင် အောင်မြင်နေပါတယ်။ အကယ်၍ ခင်ဗျားသာ ကန်ထရိုက်တာ ရှာနေတဲ့ အာဏာရှင်တစ်ယောက် ဆိုရင်၊ ကိုယ်ပြောချင်တဲ့ စကားလုံးတွေကို အမေရိကန် ပြည်ထောင်စု အစိုးရမှတ်တမ်း (Federal Register) မှာ စာလုံးမရွေ့ ပြန်ပါလာအောင် လုပ်နိုင်တာဟာ ကြယ်ငါးပွင့်အဆင့် Yelp Review ရသလို ဖြစ်နေမှာပါ။',
      '- ဒါဟာလဲ တိုက်ဆိုင်မှုတစ်ခုသက်သက်ပါပဲလို့ ထင်ကောင်းထင်နိုင်ပါသေးတယ် - ',
      ' သို့ပေသိ TPS ရပ်စဲလိုက်တာ သက်သက် မဟုတ်ဘဲ၊ ရပ်စဲဖို့ အကြောင်းပြချက်ပေးပုံက ပြည်သူလူထုကို ဓားစာခံလို ဆက်ဆံသက်မှတ်နေဆဲဖြစ်တဲ့ လူမိုက်ဓားပြအစိုးရတစ်ရပ်က ဇတ်လမ်းဇတ်အိမ် (narrative) ပြန်ပေးဆွဲ (hijack) သွားခြင်းပါပဲ။',
    ],
    closing:
      'ကျွန်တော်တို့ နိုင်ငံရေးသိပ္ပံပညာရပ်ဝန်းမှာ‌တော့ "နိုင်ငံရေးမှာ တိုက်ဆိုင်မှုဆိုတာ မရှိဘူး" ဆိုတာကိုပဲအခြေခံပြီး ဖြစ်ပျက်မှုများကိုကြည့်မြင်တက်အောင် သင်ကြားလာရတော့လဲ တစ်ခြားသူအမြင်မှာတော့ "ဒီကောင်တွေက အဆိုးမြင်ဝါဒီသမားတွေပါကွာ" လို့ပြောရင်လဲ ခံရတော့မှာပါပဲ။',
  },
  {
    title: 'စစ်ကောင်စီ၏ "တိုးတက်မှုများ" - နိုင်ငံသားများ မဟုတ်၊ ဓားစာခံများသာ',
    intro:
      'မြန်မာစစ်တပ်ဟာ မကြာသေးမီက အသံကျယ်ကျယ်ထွက်တဲ့ ဟန်ပြလုပ်ရပ်တချို့ လုပ်ခဲ့ပါတယ် - ဒါပေမဲ့ အခြေခံအချက်တွေက မပြောင်းလဲပါဘူး -',
    bullet: [
      'တရားဝင် အရေးပေါ်အခြေအနေကို ရုပ်သိမ်းလိုက်တယ်။',
      'ရွေးကောက်ပွဲ ကြေညာတယ်။',
      'အာဏာသိမ်းကာလ ပုဒ်မတွေကို ပြင်ဆင်ပြီး အဲဒီပုဒ်မနဲ့ ထောင်ချခံထားရသူ တချို့ကို လွှတ်ပေးတယ်။',
    ],
    paragraphs1: [
      'အဝေးကြီးကနေ မျက်လုံးမှေးပြီး ကြည့်မယ်ဆိုရင်တော့ ဒါဟာ နေ့ခင်းကြောင်တောင် နေသာနေသလို ထင်ရပါတယ်။',
      'မန္တလေးကနေ မော်လမြိုင်အထိ စစ်ကောင်စီ လက်အောက်မှာ နေရသူတိုင်း အခြေအနေကို သိကြပါတယ် -',
    ],
    bullets: [
      'ဒေါ်အောင်ဆန်းစုကြည် ဆက်လက် အထိန်းသိမ်းခံ နေရဆဲပါ။',
      'သမ္မတ ဦးဝင်းမြင့် ဆက်လက် အထိန်းသိမ်းခံ နေရဆဲပါ။',
      'ကျောင်းသားခေါင်းဆောင်တွေ၊ သတင်းစာဆရာတွေ၊ ရပ်မိရပ်ဖတွေ အပါအဝင် ထောင်ပေါင်းများစွာသော နိုင်ငံရေးအကျဉ်းသားတွေ ဆက်လက် ဖမ်းဆီးခံထားရဆဲ (သို့) ပျောက်ဆုံးနေဆဲပါ။',
      'NUG နဲ့ တိုင်းရင်းသားလက်နက်ကိုင် အများစုကို စစ်မှန်တဲ့ ဆွေးနွေးပွဲတွေကနေ ဖယ်ထုတ်ထားဆဲပါ။',
      'လေကြောင်းတိုက်ခိုက်မှုတွေ၊ လက်နက်ကြီးပစ်ခတ်မှုတွေနဲ့ ရွာမီးရှို့မှုတွေ၊ ဘုရားကျောင်း၊ ကျောင်း၊ ဆေးရုံ မီးရှို့မှုတွေ ဆက်လက် ဖြစ်ပွားနေဆဲပါ။',
    ],
    paragraphs2: [
      'မန္တလေးကနေ မော်လမြိုင်အထိ စစ်ကောင်စီ လက်အောက်မှာ နေရသူတိုင်း အခြေအနေကို သိကြပါတယ် -',
      'ခင်ဗျားဟာ မလွတ်လပ်မချင်း လွတ်လပ်နေတာပါ (You are free until you are not)။ "လွတ်လာသူ" ဘယ်သူမဆို Facebook ပို့စ်တစ်ခုကြောင့်၊ ကောလဟာလတစ်ခုကြောင့် (သို့) ဘာအကြောင်းပြချက်မှ မရှိဘဲ ပြန်ဖမ်းခံရနိုင်ပါတယ်။ ရွေးကောက်ပွဲအကြောင်း၊ စစ်ပွဲအကြောင်း၊ စီးပွားရေးအကြောင်း ရိုးရိုးသားသား ပြောမိသူတိုင်း ညသန်းခေါင် တံခါးလာခေါက်ခံရမယ့် အန္တရာယ် ရှိပါတယ်။ အဲဒီအထဲမှာ ပြန်ပို့ခံရတဲ့ သူတွေလည်း ပါပါတယ်။ ဒါကြောင့် DHS က မြန်မာပြည်ဟာ လူအများအပြား နေရပ်ပြန်ဖို့ လုံခြုံနေပြီလို့ ပြောလိုက်တာဟာ ကိုယ်ကျင့်တရားအရ မှားယွင်းရုံတင် မကပါဘူး၊ လက်တွေ့မှာလည်း အန္တရာယ် များပါတယ်။ စစ်ကောင်စီလက်ထဲကို "ဓားစာခံစာရင်း" တစ်ခု ထည့်ပေးလိုက်သလို ဖြစ်နေပြီး၊ သူတို့ ပြောချင်တဲ့ စကားအတွက် အခွင့်အရေး ပေးလိုက်သလို ဖြစ်နေပါတယ် ________________',
      '"ဝါရှင်တန်ကတောင် အခြေအနေ တိုးတက်နေပြီလို့ လက်ခံတယ်။ ဒါကြောင့် အခု ပြန်လာပြီး ပြဿနာရှာတဲ့ ကောင်တွေကတော့ ရှင်းပါတယ်... သားကောင်တွေ မဟုတ်ဘူး၊ ရာဇဝတ်ကောင်တွေပဲ" ဆိုပြီး ပြောလာမှာပါ။',
    ],
    closing:
      'ပုံမှန်အားဖြင့် သံခင်းတမန်ခင်း ပြောဆိုတတ်တဲ့ အာဆီယံ သံတမန်တွေတောင် စစ်ကောင်စီရဲ့ ရိုးသားမှုကို မယုံကြပါဘူး။ ပြည်တွင်းရေး ဝင်မစွက်ဖက်ရေး မူဝါဒကို ကိုင်စွဲတဲ့ နိုင်ငံတွေ (ပွင့်ပွင့်လင်းလင်း ပြောရရင် လူ့အခွင့်အရေး ချန်ပီယံ မဟုတ်တဲ့ နိုင်ငံတွေ) ကတောင် ဒီရွေးကောက်ပွဲဟာ အတုအယောင် ဖြစ်တယ်၊ ဒေါ်အောင်ဆန်းစုကြည်ကို ဆက်ဖမ်းထားသရွေ့ ဘယ်လို "အကူးအပြောင်း" မှ တရားမဝင်နိုင်ဘူးလို့ တိတ်တဆိတ် ဝန်ခံနေကြပြီ ဆိုရင်... ဝါရှင်တန်အနေနဲ့ နားထောင်သင့်ပါပြီ။ ________________',
  },
  {
    title: 'လွှတ်တော် (Congress) က သဘောပေါက်ပါတယ်၊ DHS လည်း အမီလိုက်သင့်ပါပြီ',
    paragraphs: [
      'အမေရိကန်ရဲ့ လက်တွေ့ကျတဲ့ သဘောထား ဘယ်လိုရှိသင့်သလဲ သိချင်ရင် မကြာသေးမီက ပြုလုပ်ခဲ့တဲ့ အောက်လွှတ်တော် နိုင်ငံခြားရေးရာ ကော်မတီရဲ့ ပူးတွဲကြားနာပွဲ ကို ကြည့်ပါ။ ခေါင်းစဉ်က "ထွက်ပေါက်မရှိသော မဟာဗျူဟာ - မြန်မာ့အဆုံးမဲ့ အကျပ်အတည်းနှင့် အမေရိကန်၏ အကန့်အသတ်ရှိသော ရွေးချယ်စရာများ" ဖြစ်ပါတယ်။ ပါတီနှစ်ရပ်လုံး (ရီပတ်ဘလစ်ကန်နဲ့ ဒီမိုကရက်) က အမတ်တွေ ပါဝင်ပြီး သဘောထားတွေ ထူးခြားစွာ တူညီနေကြပါတယ် -',
    ],
    bullet: [
      '* လာမယ့် ရွေးကောက်ပွဲကို ဒီမိုကရေစီ မှတ်တိုင်မဟုတ်ဘဲ "အတုအယောင် (Sham)" နဲ့ "ပြဇာတ်" သာ ဖြစ်ကြောင်း ပြောကြားခဲ့ကြပါတယ်။',
      '* ဒေါ်အောင်ဆန်းစုကြည်နဲ့ အဓိကခေါင်းဆောင်တွေ ထောင်ထဲရှိနေသရွေ့၊ ပြည်သူအများအပြား ဗုံးကြဲခံနေရသရွေ့ ဘယ်ရွေးကောက်ပွဲမှ ယုံကြည်လက်ခံနိုင်ဖွယ် မရှိကြောင်း အလေးပေး ပြောကြားခဲ့ကြပါတယ်။',
      '* စစ်ကောင်စီရဲ့ အစီအစဉ်ကို လူသိရှင်ကြား ရှုတ်ချဖို့ နဲ့ ပိတ်ဆို့မှု၊ သံတမန်ရေး၊ ဒီမိုကရေစီ ထောက်ခံမှုတွေကို မဟာဗျူဟာကျကျ ပေါင်းစပ်ဖို့ မြန်မာနိုင်ငံဆိုင်ရာ အထူးကိုယ်စားလှယ် ခန့်အပ်ဖို့ အစိုးရကို တိုက်တွန်းခဲ့ကြပါတယ်။',
    ],
    paragraphs1: [
      'ဒါဟာ "တက်ကြွလှုပ်ရှားသူတွေနဲ့ အစိုးရကြား" ထိပ်တိုက်တွေ့မှုဖြစ်နေတာ မဟုတ်ပါဘူး။ "လွှတ်တော် (Congress) နဲ့ အစိုးရကြား" မှားယွင်းနေသော ဇာတ်လမ်း (Bad Narrative) တစ်ပုဒ်ကိုပြန်လည် အဖတ်ဆယ်ကြရဖို့ပါ။',
      'DHS အနေနဲ့ မူဝါဒကို ချက်ချင်း ပြောင်းစရာ မလိုပါဘူး၊ အသုံးအနှုန်း (Language) ကို ပြောင်းလိုက်ရုံပါပဲ။ အောက်ပါအတိုင်း ပြင်ဆင်ပြောဆိုနိုင်ပါတယ် -',
    ],
    bullets: [
      '* မြန်မာပြည်ဟာ အလွန်အမင်း မလုံခြုံသေးပါဘူး။',
      '* TPS ရပ်စဲတာဟာ မူဝါဒ အပြောင်းအလဲရဲ့ အစိတ်အပိုင်း တစ်ခုသာ ဖြစ်ပြီး၊ စစ်ကောင်စီက လွတ်လပ်မှုနဲ့ တည်ငြိမ်မှုကို ပြန်လည် ဖော်ဆောင်ပေးနိုင်လို့ မဟုတ်ပါဘူး။',
      '* အမေရိကန် ပြည်ထောင်စုအနေနဲ့ ကွန်ဂရက်လွှတ်တော်၊ တခြား ဒီမိုကရေစီ နိုင်ငံတွေနဲ့အတူ ရပ်တည်ပြီး စစ်ကောင်စီရဲ့ အတုအယောင် ရွေးကောက်ပွဲကို ငြင်းပယ်ကြောင်း၊ ဒေါ်အောင်ဆန်းစုကြည်နဲ့ နိုင်ငံရေး အကျဉ်းသားအားလုံး လွှတ်ပေးဖို့ တောင်းဆိုကြောင်း ပြောနိုင်ပါတယ်။',
    ],
    closing:
      'အဲဒီလို ဇာတ်လမ်း အပြောင်းအလဲလေး လုပ်လိုက်ရုံနဲ့ DHS ဟာ သူ့ရဲ့ လူဝင်မှုကြီးကြပ်ရေး အစီအစဉ်ကို ဆက်လုပ်နိုင်သလို၊ တချိန်တည်းမှာပဲ စစ်ကောင်စီရဲ့ ဝါဒဖြန့်ချိရေး အောင်ပွဲကို တားဆီးနိုင် ပါလိမ့်မယ်။ ဥပဒေအရ ဘာမှ ကုန်ကျစရိတ် မရှိဘဲ၊ ကိုယ်ကျင့်တရားဆိုင်ရာ ရှင်းလင်းပြတ်သားမှု (Moral Clarity) ကို အများကြီး ရရှိစေမယ့် နည်းလမ်းပါ။',
  },
  {
    title: 'သေချာ စိစစ်ပါ၊ ဒါပေမဲ့ ဥယျာဉ်တစ်ခုလုံးကိုတော့ ခုတ်မလှဲပါနဲ့',
    intro:
      'TPS ဆွေးနွေးပွဲတွေမှာ လေးလေးနက်နက် ထည့်သွင်းစဉ်းစားရမယ့် နောက်ထပ် စိုးရိမ်ပူပန်မှု တစ်ခုကတော့ လုံခြုံရေး (Security) ပါ။',
    paragraphs: [
      'နိုင်ငံခြား အဆက်အသွယ်ရှိသူတွေရဲ့ အကြမ်းဖက်မှု (သို့) အကြမ်းဖက်ဝါဒ သတင်းတွေတိုင်းဟာ အမေရိကန်လူထုရဲ့ စိတ်ကို ထိခိုက်စေပါတယ်။ ခိုလှုံခွင့်တောင်းခံသူ တစ်ယောက်က ပစ်ခတ်မှု ကျူးလွန်တယ် ဆိုတဲ့ ခေါင်းစဉ်မျိုး (သို့) ပိတ်ဆို့ခံထားရတဲ့ အစိုးရနဲ့ ပတ်သက်သူတွေက ငွေကြေးခဝါချဖို့ ဝင်ရောက်လာတယ် ဆိုတဲ့ သတင်းမျိုး မြင်ရတဲ့အခါ အမေရိကန်တွေက "တော်ပါတော့" လို့ ပြောချင်ကြတာ နားလည်ပေးလို့ ရပါတယ်။',
      'ရွှေ့ပြောင်းခိုလှုံသူ တစ်ယောက်အနေနဲ့ အဲဒီလို ပြောချင်တဲ့ စိတ်ဆန္ဒကို လစ်လျူရှုဖို့ ကျွန်တော် မတိုက်တွန်းပါဘူး။ အမှန်အတိုင်းဝန်ခံရင် ကျွန်တော်တို့ရဲ့ စိတ်ဆန္ဒဟာလဲ အတူတူပါပဲ။',
      'စစ်ကောင်စီ ခရိုနီတွေ က ကျွန်တော်တို့ရဲ့ အသိုင်းအဝိုင်းတွေကို သူတို့ရဲ့ ခိုလှုံရာ (Safe Havens) (သို့) ပိတ်ဆို့မှု ရှောင်ရှားရာ နောက်ဖေးပေါက်တွေအဖြစ် သုံးနေတာကို ကျွန်တော်တို့ လုံးဝ မလိုလားပါဘူး။ အမေရိကန်ရဲ့ တံခါးဖွင့်ဝါဒကို အခွင့်ကောင်းယူပြီး အမေရိကန်တွေကို ဒုက္ခပေးမယ့် ဘယ်သူ့ကိုမှ (မြန်မာဖြစ်စေ၊ တခြားဖြစ်စေ) ကျွန်တော်တို့ သည်းမခံပါဘူး။ "ပုပ်နေတဲ့ ပန်းသီး" တစ်လုံးကြောင့် တည်ငြိမ်အေးချမ်းစွာ နေထိုင်နေကြတဲ့ ထောင်ပေါင်းများစွာသော ဘဝတွေ အရိပ်မည်း ဖုံးသွားတတ်တာကိုလည်း ကျွန်တော်တို့ ကောင်းကောင်း သိပါတယ်။',
      'ဒါပေမဲ့ အဖြေကတော့... ဥယျာဉ်တစ်ခုလုံးကို ခုတ်လှဲပစ်လိုက်ဖို့ မဟုတ်ပါဘူး။',
      'လုပ်သင့်တာတွေက -',
    ],
    bullets: [
      'ပိတ်ဆို့မှု ရှောင်ရှားသူတွေကို လိုက်လံ ဖော်ထုတ်ပါ (Sanctions evasion should be hunted down). အထူးသဖြင့် ဟန်ပြကုမ္ပဏီတွေ၊ Crypto အကောင့်တွေနဲ့ အိမ်ခြံမြေ ဈေးကွက်တွေကနေတဆင့် လုပ်ဆောင်နေတာတွေကို ဖော်ထုတ်ပါ။',
      'အကောက်ခွန်နှင့် နယ်စပ်ကာကွယ်ရေး (CBP) ဖောင်တွေမှာ လိမ်ညာသူတွေ၊ ကြီးလေးတဲ့ ရာဇဝတ်မှု ကျူးလွန်သူတွေ (သို့) အန္တရာယ် ရှိသူတွေကို တရားစွဲပြီး လိုအပ်ရင် နေရပ်ပြန်ပို့ပါ။',
    ],
    paragraphs2: [
      'စစ်ကောင်စီလက်က ထွက်ပြေးလာတဲ့ ကျွန်တော်တို့ အများစုကလည်း အဲဒါကိုပဲ လိုလား ပါတယ်။ ရာဇဝတ်ကောင် တစ်သိုက်ဆီကနေ အသက်လု ထွက်ပြေးလာပြီးမှ၊ ဒီမှာ သူတို့ထက် နည်းနည်း ပိုယဉ်ကျေးတဲ့၊ ဝတ်ကောင်းစားလှ ဝတ်ထားတဲ့ ရာဇဝတ်ကောင် နောက်တစ်သိုက်ရဲ့ လက်အောက်မှာ မနေချင်ပါဘူး။',
    ],
    closing:
      'နယ်စပ်လုံခြုံရေးနဲ့ ရွှေ့ပြောင်းခိုလှုံသူ ကာကွယ်စောင့်ရှောက်ရေး ဆိုတာ ဆန့်ကျင်ဘက်တွေ မဟုတ်ပါဘူး။ ဥပဒေ စိုးမိုးပြီး၊ အားနည်းသူတွေကို အမြတ်မထုတ်ဘဲ ကာကွယ်ပေးတဲ့ လူ့ဘောင်အဖွဲ့အစည်း တစ်ခုကို တည်ဆောက်ခြင်း ဆိုတဲ့ စီမံကိန်းကြီး တစ်ခုတည်းရဲ့ အစိတ်အပိုင်း နှစ်ခုသာ ဖြစ်ပါတယ်။ ________________',
  },
  {
    title:
      'Scam Centre Strike Force: ကောင်းမွန်တဲ့ အစပျိုးမှုပါ၊ အခု မိတ်ဖက်အမှန်ကို ရွေးချယ်ဖို့ လိုပါတယ်',
    intro:
      'ဒီနေရာမှာတော့ သမ္မတထရမ့်အစိုးရဟာ မှန်ကန်တဲ့ ဦးတည်ချက်အတိုင်း ရွေ့လျားနေပါတယ်။ မြန်မာနိုင်ငံ အပါအဝင် အရှေ့တောင်အာရှက ကျားဖြန့် အခြေစိုက်စခန်းတွေကို ပစ်မှတ်ထားမယ့် Scam Centre Strike Force ဖွဲ့စည်းလိုက်ခြင်းဟာ မဟာဗျူဟာမြှောက်တဲ့ အရွှေ့ကြီးတစ်ခုပါ။',
    paragraphs: [
      'ဒါဟာ စစ်မှန်တဲ့ ခေါင်းဆောင်မှုပါပဲ။ ကျားဖြန့်စခန်းတွေဟာ လူကုန်ကူးခံရသူတွေကို နှိပ်စက်ပြီး၊ သားကောင်တွေ (အမေရိကန် ပြည်သူတွေ အပါအဝင်) ဆီကနေ ဒေါ်လာ ဘီလီယံပေါင်းများစွာ လိမ်ယူနေတာပါ။ သူတို့ကို နှိမ်နင်းတာဟာ အလှူဒါန မဟုတ်ပါဘူး။ အရေးကြီးတဲ့ အမျိုးသားလုံခြုံရေးနဲ့ စီးပွားရေး ဦးစားပေး လုပ်ငန်းစဉ် ဖြစ်ပါတယ်။',
      'ဒါပေမဲ့ အရေးကြီးတဲ့ နောက်တဆင့် ကျန်ပါသေးတယ် - မှန်ကန်တဲ့ မိတ်ဆွေကို ရွေးချယ်ဖို့ပါ။',
      'အကယ်၍ ဝါရှင်တန်က "ပူးပေါင်းဆောင်ရွက်ရေး" အတွက် စစ်ကောင်စီကို အဓိက အားကိုးမယ် ဆိုရင် ရလာမယ့် အရာတွေကတော့ -',
    ],
    bullet: [
      '* ဟန်ပြစီးနင်းမှုတွေနဲ့ ဓာတ်ပုံရိုက်ပွဲတွေ (Photo-ops)၊',
      '* အောက်ခြေအဆင့် ပြစ်ဒဏ်ခံ ကောင်လေးတွေ (Scapegoats)၊',
      '* ပြီးတော့ သတိထား ကန့်သတ်ထားတဲ့ ပိုင်ဆိုင်မှု သိမ်းဆည်းခြင်းတွေပဲ ဖြစ်ပါလိမ့်မယ်။',
    ],
    paragraphs1: [
      'အကယ်၍ ဒေသခံ တော်လှန်ရေး အင်အားစုတွေ (ဥပမာ - KNU၊ NUG ဆက်စပ် အဖွဲ့အစည်းတွေနဲ့ နယ်မြေစိုးမိုးမှုရော တရားဝင်မှုပါ ရှိတဲ့ EROs တွေ) နဲ့ ပူးပေါင်းဆောင်ရွက်မယ် ဆိုရင်တော့ Strike Force အနေနဲ့ အောက်ပါတို့ကို လုပ်ဆောင်နိုင်ပါလိမ့်မယ် -',
    ],
    bullets: [
      '* ကျားဖြန့် ကွန်ရက်တွေကို ပိုမိုတိကျစွာ မြေပုံဖော်နိုင်မယ်။',
      '* အမြတ်ငွေ စီးဆင်းနေတဲ့ Crypto ပိုက်လိုင်း တွေကို ဖြတ်တောက်နိုင်မယ်။',
      '* ကွင်းဆက်တွေကို လိုက်ပြီး စစ်တပ်၊ ရဲ နဲ့ ပြည်သူ့စစ် စပွန်ဆာတွေ၊ နိုင်ငံဖြတ်ကျော် ရာဇဝတ်ကောင်တွေ အထိ ဖော်ထုတ်နိုင်မယ်။',
    ],
    paragraphs2: [
      'အကယ်၍သာ ... ကျားဖြန့်လုပ်ငန်းတွေဆီကနေ သိမ်းဆည်းရမိတဲ့ Crypto ပိုင်ဆိုင်မှု ဘီလီယံပေါင်းများစွာထဲက တစိတ်တပိုင်းကို တရားမျှတမှုအတွက် မဟာဗျူဟာမြောက် Crypto ရန်ပုံငွေ (Strategic Crypto Reserve for Justice) အဖြစ် ထားရှိပြီး၊ သားကောင်တွေကို လျော်ကြေးပေးတာ၊ လူကုန်ကူးခံရသူတွေကို ပြန်လည်ထူထောင်ပေးတာ၊ ပြီးတော့ တနေ့ကျရင် ဒီမိုကရေစီ မြန်မာနိုင်ငံကို ပြန်လည်တည်ဆောက်ရာမှာ ကူညီပေးတာတွေ လုပ်နိုင်ရင် ဘယ်လောက် ကောင်းလိုက်မလဲ။',
    ],
    closing:
      'ခိုးရာပါ ပစ္စည်းတွေကို တာဝန်ခံမှု ရှိစေမယ့် လက်နက်အဖြစ် ပြောင်းလဲလိုက်တာပါမျိုးမှ တကယ့် "လက်တွေ့နိုင်ငံရေး (Realpolitik)" ပါ၊  ကျားဖြန့် အင်ပါယာကို တည်ထောင်ခဲ့တဲ့ သူတွေလက်ထဲ ပြန်ထည့်ပေးလိုက်တာမျိုး မဖြစ်သင့်ပါ။ ________________',
  },
  {
    title: 'ရှားပါးမြေသား - ရာဇဝတ်ကောင် ပွဲစားတွေကို ဖြတ်ထုတ်ပါ',
    intro:
      'နောက်ထပ် တိတ်ဆိတ်ပြီး ညစ်ပတ်နေတဲ့ ကိစ္စတစ်ခုကတော့ - ရှားပါးမြေသား (Rare Earths) နဲ့ အရေးပါတဲ့ သတ္တုတွင်းထွက်များ ပါပဲ။',
    paragraphs: [
      'မြန်မာပြည် မြောက်ပိုင်းမှာ လျှပ်စစ်ကားတွေ၊ လေအားလျှပ်စစ် တာဘိုင်တွေ၊ F-22 လေယာဉ်တွေနဲ့ အဆင့်မြင့် မိုက်ခရိုပရိုဆက်ဆာတွေအတွက် လိုအပ်တဲ့ ရှားပါးမြေသားတွေ အများအပြား ရှိပါတယ်။ ဒီနေ့ခေတ်မှာ အဲဒီ ထုတ်လုပ်မှု အများစုဟာ -',
    ],
    bullet: [
      '* သဘာဝပတ်ဝန်းကျင်ကို ဆိုးရွားစွာ ပျက်စီးစေတယ်၊',
      'ပြည်သူ့စစ်တွေ၊ ခရိုနီတွေ (သို့) နိုင်ငံခြား ပွဲစားတွေက ထိန်းချုပ်ထားတယ်၊',
      'ပြီးတော့ စစ်ကောင်စီရဲ့ စစ်စီးပွားရေးနဲ့ ပေကျင်းရဲ့ မဟာဗျူဟာ ကွန်ရက်တွေထဲမှာ နက်နက်ရှိုင်းရှိုင်း ရှုပ်ထွေးနေပါတယ်။',
    ],
    paragraphs1: [
      'ဝါရှင်တန်က တချို့လူတွေက တွေးမိကောင်း တွေးမိပါလိမ့်မယ် - "တရုတ်ရဲ့ လက်ဝါးကြီးအုပ်မှုကို ဖြိုခွင်းနိုင်မယ် ဆိုရင်တော့ မပြည့်စုံတဲ့ မိတ်ဖက် (စစ်ကောင်စီ) နဲ့ တွဲလုပ်တာကို သည်းခံနိုင်ပါတယ်" လို့။',
      'ဒါပေမဲ့ ဒါဟာ မှားယွင်းတဲ့ ဖြတ်လမ်းနည်း ပါ။ စစ်ရာဇဝတ်မှုတွေ၊ မြေသိမ်းမှုတွေနဲ့ ရာဇဝတ်ဂိုဏ်းတွေကတဆင့် လာတဲ့ ထောက်ပံ့ရေးကွင်းဆက် (Supply Chain) ဟာ မဟာဗျူဟာမြောက် ပိုင်ဆိုင်မှု (Asset) မဟုတ်ပါဘူး၊ ဝန်ထုပ်ဝန်ပိုး (Liability) သာ ဖြစ်ပါတယ်။ အဲဒါက ကျိုးပဲ့လွယ်တယ်၊ ခြိမ်းခြောက်ခံရလွယ်တယ်၊ ပြီးတော့ ကိုယ်ကျင့်တရားကို ပျက်စီးစေပါတယ်။',
      'ပိုပြီး ဉာဏ်ရှိတဲ့ နည်းလမ်းကတော့ -',
    ],
    bullets: [
      'လွတ်မြောက်နယ်မြေတွေမှာရှိတဲ့ NUG မဟာမိတ် အာဏာပိုင်တွေ၊ EROs တွေ နဲ့ ပူးပေါင်းပြီး အဆိုးရွားဆုံး လုပ်ကွက်တွေကို ပိတ်သိမ်းကာ ဖက်ဒရယ် မူဝါဒတွေနဲ့အညီ တရားဝင် စောင့်ကြည့်မှုရှိသော တူးဖော်ရေး ကို စမ်းသပ်လုပ်ဆောင်ပါ။',
      'သဘာဝပတ်ဝန်းကျင်နဲ့ အလုပ်သမား စံနှုန်းတွေကို လိုက်နာနိုင်တဲ့ မဟာမိတ် စီးပွားရေး နိုင်ငံတွေ (မလေးရှား၊ ထိုင်း၊ ဂျပန်၊ တောင်ကိုရီးယား၊ ဩစတြေးလျ) နဲ့ သန့်စင်ရေး (Refining) ပူးပေါင်းဆောင်ရွက်မှုတွေ တည်ဆောက်ပါ။',
      'စစ်ကောင်စီ ဆက်စပ် ရှားပါးမြေသား တင်ပို့မှုတွေကို အပေးအယူ ပစ္စည်းအဖြစ် မသတ်မှတ်ဘဲ အန္တရာယ်များပြီး ပိတ်ဆို့သင့်တဲ့ အရာအဖြစ် သတ်မှတ်ပါ။',
    ],
    paragraphs2: [],
    closing:
      'နောက်တစ်ကြိမ် ပြောပါရစေ - ရွေးချယ်စရာက "စင်ကြယ်ခြင်း" နဲ့ "လက်တွေ့ကျခြင်း" ကြားမှာ မဟုတ်ပါဘူး။ "ရာဇဝတ်ကောင်တွေရဲ့ ထိန်းချုပ်မှုကို ပိုခိုင်မာစေတဲ့ ရေတိုသဘောတူညီချက်များ" နဲ့ "မှီခိုအားထားရမှုနဲ့ မတည်ငြိမ်မှုတွေကို လျှော့ချပေးမယ့် ရေရှည် အစီအစဉ်များ" ကြားက ရွေးချယ်စရာသာ ဖြစ်ပါတယ်။ ________________',
  },
  {
    title: '"အဆုံးမဲ့ အကျပ်အတည်း" ဟာ "မျှော်လင့်ချက်မဲ့ အကျပ်အတည်း" မဟုတ်ပါ',
    intro:
      'လွှတ်တော်ကြားနာပွဲ ခေါင်းစဉ်ဖြစ်တဲ့ "ထွက်ပေါက်မရှိသော မဟာဗျူဟာ - မြန်မာ့အဆုံးမဲ့ အကျပ်အတည်းနှင့် အမေရိကန်၏ အကန့်အသတ်ရှိသော ရွေးချယ်စရာများ" ဆိုတာ အဝေးကကြည့်ရင်တော့ မှန်သလို ရှိပါတယ်။ ဝေးလံတဲ့ နေရာက ဖြေရှင်းရခက်တဲ့ ပဋိပက္ခတစ်ခု လိုပေါ့။',
    paragraphs: [
      'ဒါပေမဲ့ "အဆုံးမဲ့ (Endless)" ဆိုတာ စစ်ကောင်စီရဲ့ စီမံကိန်း သာ ဖြစ်ပြီး၊ ကျွန်တော်တို့ရဲ့ ကံကြမ္မာ မဟုတ်ပါဘူး။',
      'ကျွန်တော်တို့မျိုးဆက်ဟာ စစ်အာဏာရှင် လက်အောက်မှာ ကြီးပြင်းခဲ့ရသူများပါ။ "အဆုံးမဲ့ အကျပ်အတည်း" ဆိုတဲ့ ခေါင်းစဉ်ကိုက စစ်တပ်ကိုယ်တိုင်ကပဲ အရင်ကတည်းက သုံးခဲ့တာကို ကျွန်တော်တို့တစ်သက်လုံး ကြားလာရတာပါပဲ။ "ဒီနိုင်ငံက ဘာမှ လုပ်လို့မရတော့ဘူး၊ တိုင်းပြည်က အရမ်း ကွဲပြားလွန်းတယ်၊ ပြည်သူတွေက စိတ်လိုက်မာန်ပါ များလွန်းတယ်၊ တပ်မတော်ရဲ့ စည်းကမ်းရှိတဲ့ ဒီမိုကရေစီကို လက်ခံတာက ပိုကောင်းတယ်" ဆိုပြီး သူတို့ ပြောလေ့ရှိပါတယ်။',
      'အကယ်၍ အမေရိကန် အဖွဲ့အစည်းတွေကသာ ဒီအယူဝါဒကို လက်ခံလိုက်ရင် ဗိုလ်ချုပ်တွေ နှစ်ခါနိုင်သွားပါလိမ့်မယ် - ပြည်တွင်းမှာ အတိုက်အခံတွေကို နှိပ်ကွပ်ခွင့်ရသွားသလို၊ ပြည်ပမှာလည်း သူတို့ထက် ပိုကောင်းတာ ဘာမှမရှိဘူးလို့ နိုင်ငံတကာကို ယုံကြည်သွားစေပါလိမ့်မယ်။',
      'ဒါပေမဲ့ အမှန်တရားကတော့ ပိုခက်ခဲပေမယ့် မျှော်လင့်ချက်မဲ့မနေပါဘူး -',
    ],
    bullets: [
      'EROs နဲ့ PDFs တွေဟာ နယ်မြေအများအပြားကနေ စစ်တပ်ကို မောင်းထုတ်နိုင်ခဲ့ပြီး၊ အရင်က မဖြစ်နိုင်ဘူးလို့ ထင်ရတဲ့ ပူးပေါင်းဆောင်ရွက်မှုတွေကို တည်ဆောက်နေကြပါပြီ။',
      'စိုးမိုးနည်မြေများမှာ ဗုံးဒဏ်တွေအောက်မှာပဲ ဒေသခံတွေက ကျောင်းတွေ၊ ဆေးပေးခန်းတွေ၊ တရားစီရင်ရေး စနစ်တွေကို တည်ဆောက်နေကြပါပြီ။',
      'NUG ဟာ မစုံလင်သေးပေမယ့် ဗမာနဲ့ တိုင်းရင်းသား ခေါင်းဆောင်မှုတွေကို စုစည်းဖို့ ရှားပါးတဲ့ နိုင်ငံတည်ဆောက်ရေး ကြိုးပမ်းမှုတစ်ခု ဖြစ်ပါတယ်။',
    ],
    closing:
      'ဒီအကျပ်အတည်းဟာ သဘာဝအရ "အဆုံးမဲ့" နေတာ မဟုတ်ပါဘူး။ ရည်ရွယ်ချက်ရှိရှိ ဆွဲဆန့်ထားလို့ ရှည်ကြာနေတာပါ။ အမေရိကန်ပြည်ထောင်စု၊ အာဆီယံ နဲ့ မြန်မာပြည်သူတွေရဲ့ ရွေးချယ်မှုတွေကသာ ဒါကို တိုတောင်းသွားစေနိုင်မှာ ဖြစ်ပါတယ်။ ________________',
  },
  {
    title:
      'အကယ်၍ အမေရိကန်အစိုးရကသာ မြန်မာ့အိပ်မက်ဆိုးကြီးကို အဆုံးသတ်ပေးနိုင်မယ်ဆိုရင်၊ ကမ္ဘာတစ်ဝှမ်းရှိ သန်း ၆၀ သောမြန်မာများသည် သမ္မတထရမ့် နိုဘယ်ဆုရရှိဖို့ကို 2020 ရွှေးကောက်ပွဲကြီးတုန်းကလိုပင် တန်းစီပြီးတော့ကိုထောက်ခံပါလိမ့်မယ်',
    intro:
      'ကျွန်တော် ဒီစာကိုရေးတာ လက်ရှိ အစိုးရကို တိုက်ခိုက်ဖို့ ရေးတာ မဟုတ်ပါဘူး။ ဒီအစိုးရမှာ တခြားသူတွေ မရှိခဲ့တဲ့ "သြဇာအာဏာ (Leverage)" ရှိတယ် ဆိုတာကို သိတဲ့သူ တစ်ယောက်အနေနဲ့ ရေးတာပါ။ ဒီအစိုးရ အနေနဲ့ -',
    bullet: [
      '* အတုအယောင် ရွေးကောက်ပွဲကို ရှုတ်ချဖို့နဲ့ အထူးကိုယ်စားလှယ် ခန့်အပ်ဖို့ တောင်းဆိုထားတဲ့ ကွန်ဂရက်လွှတ်တော်ရဲ့ ပါတီစုံ သဘောထားနဲ့ တသားတည်း ရပ်တည်နိုင်ပါတယ်။',
      '* တရားဝင် ဒေသခံ အင်အားစုတွေနဲ့ လက်တွဲပြီး Scam Centre Strike Force စစ်ဆင်ရေးတွေကို ပိုတင်းကြပ်နိုင်ပါတယ်။',
      '* စစ်ကောင်စီ ဝါဒဖြန့်လို့ မရအောင် TPS ရပ်စဲမှု ခေါင်းစဉ်တပ်ပုံ (Framing) ကို ပြောင်းလဲနိုင်ပါတယ်။',
      '* စစ်ကောင်စီနဲ့ ဆက်စပ်တဲ့ သတ္တုတွင်းထွက်တွေနဲ့ ကျားဖြန့်တွေကို "ထွန်းသစ်စ ဈေးကွက် အခွင့်အလမ်းတွေ" အဖြစ် မဟုတ်ဘဲ ရေဒီယိုသတ္တိကြွ ပစ္စည်းတွေလို (အန္တရာယ်ရှိတဲ့ အရာတွေလို) သဘောထားဖို့ မဟာမိတ်တွေနဲ့ စီးပွားရေးလုပ်ငန်းတွေကို ဖိအားပေးနိုင်ပါတယ်။',
    ],
    paragraphs1: [
      'အကယ်၍သာ ဒီအရာတွေကို လုပ်ဆောင်ခဲ့မယ်ဆိုရင်... အမေရိကန်ရဲ့ အာဏာစွမ်းပကားကို သုံးပြီး မြန်မာ့အဆုံးမဲ့ အကျပ်အတည်းကို ဒီအတိုင်း စီမံခန့်ခွဲနေရုံ (Manage) မဟုတ်ဘဲ တိုတောင်းသွားအောင် (Shorten) လုပ်နိုင်မယ်ဆိုရင်... အမေရိကန်ကို ပိုလုံခြုံစေရုံတင် မကပါဘူး။ သမိုင်းဝင်မယ့် အလုပ်တစ်ခုကို လုပ်လိုက်တာ ဖြစ်ပါလိမ့်မယ်။',
      'ကျွန်တော်တို့က လှောင်ပြောင်ပြီး ပြောနေတာ မဟုတ်ပါ -',
      'အကယ်၍ ဒီအစိုးရကသာ မြန်မာနိုင်ငံမှာ စစ်မှန်တဲ့ နိုင်ငံရေး အဖြေတစ်ခု (ဒေါ်အောင်ဆန်းစုကြည် နှင့် နိုင်ငံရေးအကျဥ်းသားများအားလုံး လွတ်မြောက်ရေး၊ အစုလိုက်အပြုံလိုက် သတ်ဖြတ်မှုတွေ ရပ်တန့်ရေး၊ ဖက်ဒရယ် ဒီမိုကရေစီ လမ်းကြောင်းပေါ် ပြန်ရောက်ရေး) တို့ကို ဆောင်ကြဉ်းပေးနိုင်မယ်ဆိုရင်ဖြင့်... ကမ္ဘာတစ်ဝန်းက မြန်မာပြည်သူတွေ တန်းစီပြီး သမ္မတ ထရမ့်ကို ငြိမ်းချမ်းရေး နိုဘယ်ဆုအတွက် အမည်စာရင်း တင်သွင်းကြတာကို မြင်တွေ့ရပါလိမ့်မယ်။',
      'ကျွန်တော်တို့ တိုင်းပြည်ကို ဘယ်သူက ကယ်တင်မလဲ ဆိုတာ ကျွန်တော်တို့ ဇီဇာမကြောင်ပါဘူး။ အလုပ်ပြီးမြောက်ဖို့ကိုပဲ ကျွန်တော်တို့ လိုလားပါတယ်။',
      '________________',
    ],
  },
  {
    title: 'ကျေးဇူးတော်နေ့၊ မည်သူမည်ဝါဖြစ်ခြင်း (Identity) နှင့် သမ္မတ ရေဂင်၏ အမေရိက',
    intro:
      'သမ္မတရဲ့ ကြက်ဆင်တွေကတောင် ကျွန်တော်တို့ထက် ပိုပြီး ဘေးကင်းလုံခြုံမှု ရှိနေတယ်ဆိုတာ မြန်မာ TPS သမားတွေကြားမှာ ရယ်စရာတစ်ခု ဖြစ်နေပေမယ့် ဒါဟာ နာကျင်စရာ အမှန်တရားတစ်ခုပါ။',
    paragraphs: [
      'ဒါပေမဲ့ ကျွန်တော့်ဘဝကို ပြန်ကြည့်တဲ့အခါ - ရွှေဖရုံသီးမုန့် (Pumpkin Pie) နောက်ဆုံးတစ်စိတ်ကို ဇွတ်ခေါ်ကျွေးခဲ့တဲ့ Wooster က မိသားစုကနေ၊ အခုနောက်ပိုင်း ရောက်လာသူတွေအတွက် စားနပ်ရိက္ခာ လိုက်စုပေးနေတဲ့ မြန်မာ-အမေရိကန် အန်တီကြီးတွေအထိ မြင်ယောင်မိတဲ့အခါ - အစိုးရမှတ်တမ်း (Federal Register) တစ်စောင်တည်းနဲ့ ဒီနိုင်ငံကို အကဲမဖြတ်လိုပါဘူး။',
      'သမ္မတ ရေဂင် ပြောခဲ့တဲ့ အမေရိကန်ကို ကျွန်တော် မြင်နေပါသေးတယ်။ အဲဒါကတော့ "ကမ္ဘာ့ဘယ်ထောင့်ကပဲ လာလာ အမေရိကန် ဖြစ်လာနိုင်တယ်" ဆိုတဲ့ အချက်ပါပဲ။ အဲဒီ အယူအဆဟာ ဘယ်ပါတီ၊ ဘယ် DHS မူဝါဒ၊ ဘယ်လို ပထဝီနိုင်ငံရေး မောပန်းနွမ်းနယ်မှုတွေထက်မဆို ပိုပြီး အားကောင်းပါတယ်။',
      '"Peace through strength" (အင်အားဖြင့် ငြိမ်းချမ်းရေး ရယူမည်) ဆိုတာ နိုင်ငံခြားရေး မူဝါဒမှာ သုံးလေ့ရှိတဲ့ စကားပါ။ သမ္မတ ရေဂင်ရဲ့ အမေရိကန်ကို ယုံကြည်ဆဲ ကျွန်တော်တို့အတွက်ကတော့ "အင်အားနှင့် ဉာဏ်ပညာဖြင့် ငြိမ်းချမ်းရေး ရယူခြင်း (Peace through strength and wisdom)" လိုအပ်ပါတယ် -',
    ],
    bullets: [
      ' လူကုန်ကူးသူတွေ၊ အကြမ်းဖက်သမားတွေနဲ့ စစ်တပ်ခရိုနီတွေကို တံခါးပိတ်ထားနိုင်တဲ့ အင်အား။',
      ' "တည်ငြိမ်မှု" ဆိုတာ ဘာလဲဆိုတာကို အာဏာရှင်တွေ လော်ဘီလုပ်ပြီး အဓိပ္ပာယ်ဖွင့်ခွင့် မပေးတဲ့ အင်အား။',
      ' ကွန်ဂရက် လွှတ်တော်ရဲ့ သတိပေးချက်တွေ၊ မဟာမိတ်တွေနဲ့ စုံစမ်းစစ်ဆေးမှုတွေကို နားထောင်ပြီး၊ စစ်မှန်တဲ့ ပြုပြင်ပြောင်းလဲမှု (Genuine Reform) မရှိဘဲ ဟန်ဆောင်ခြင်း (Performance) သက်သက်ကို ဆုမချတဲ့ ဉာဏ်ပညာ။',
      ' TPS ဆိုတာ ယာယီဖြစ်ပေမယ့်၊ လူ့အသက်ရဲ့ တန်ဖိုးကတော့ ယာယီ မဟုတ်ဘူး ဆိုတာကို သတိရတဲ့ ဉာဏ်ပညာ။',
    ],
    paragraphs2: [
      'အကယ်၍ ဒီနှစ် ကျေးဇူးတော်နေ့ရဲ့ ဇာတ်လမ်းက "ကြက်ဆင်တွေ ကယ်တင်ခံရတယ်၊ ရွှေ့ပြောင်းခိုလှုံသူတွေ ပြည်နှင်ဒဏ် ခံရတယ်၊ ဘာလို့လဲဆိုတော့ စစ်ကောင်စီက အခြေအနေ ကောင်းသွားပြီလို့ ပြောလို့" ဆိုတာလောက်ပဲ ဖြစ်မယ်ဆိုရင်... အမေရိကန်ရဲ့ စမ်းသပ်မှုကြီး (American Experiment) မှာ တစ်ခုခု မှားယွင်းသွားပါပြီ။',
      'အကယ်၍သာ ဇာတ်လမ်းက "ကြက်ဆင်တွေ လွတ်ငြိမ်းခွင့်ရတယ်၊ ရွှေ့ပြောင်းခိုလှုံသူတွေ အသံကို နားထောင်ပေးတယ်၊ စစ်ကောင်စီကို ဖော်ထုတ်တယ်၊ ကျားဖြန့်စခန်းတွေကို ဖြိုခွင်းတယ်၊ ညစ်ပတ်တဲ့ ကုန်သွယ်မှုတွေကို ဖြတ်တောက်တယ်" လို့ ပြောင်းလဲသွားမယ်ဆိုရင်တော့... အမေရိကန်ဟာ သူ့ရဲ့ နယ်စပ်တွေကို ကာကွယ်ရုံထက် ပိုပါလိမ့်မယ်။ သမ္မတ ရေဂင် ယုံကြည်ခဲ့တဲ့ အယူအဆအတိုင်း နောက်တစ်ကြိမ် ပြန်လည် ရှင်သန်လာတာ ဖြစ်ပါလိမ့်မယ်။ "ကမ္ဘာ့ဘယ်ထောင့်က ဘယ်သူမဆို" သူတို့ရဲ့ အနာဂတ်ကို ဒီမှာ ပုံအောရဲကြတာဟာ အမေရိကန်က ပြည့်စုံလွန်းလို့ မဟုတ်ပါဘူး။ အားလုံးကို ပါဝင်ခွင့်ပေးပြီး (Inclusive)၊ မူဝါဒ ခိုင်မာကာ၊ သက်တောင့်သက်သာ ရှိမှုထက် သတ္တိတရားကို ရွေးချယ်နိုင်စွမ်း ရှိသေးလို့ ဖြစ်ပါတယ်။',
      'မြန်မာ့ အကျပ်အတည်းဟာ ကျွန်တော့် တသက်တာလုံး - ကျွန်တော့် အဖေ၊ ကျွန်တော့် အဘိုး လက်ထက်ကတည်းက - မျိုးဆက် ၃ ဆက်တိုင်အောင် ကြာမြင့်ခဲ့ပါပြီ။ အဆုံးမဲ့လို့ ခံစားရတာ သဘာဝပါပဲ။ ဒါပေမဲ့ "အဆုံးမဲ့" ဆိုတာ အခြေအနေကို ဖော်ပြချက် (Description) သာ ဖြစ်ပြီး၊ ကံကြမ္မာ (Destiny) မဟုတ်ပါဘူး။ လုံလောက်တဲ့ အင်အား၊ ဉာဏ်ပညာ နဲ့ Midwestern သားတွေရဲ့ ကြင်နာမှု နည်းနည်း သာ ရှိမယ်ဆိုရင်... ဒီအကျပ်အတည်းဟာ ကျွန်တော်တို့ မျိုးဆက်မှာတင် အဆုံးသတ်သွားနိုင်ပါတယ်။',
    ],
    closing: 'ဒီအစိုးရ လက်ထက်မှာတင် ဖြစ်ချင် ဖြစ်နိုင်ပါတယ်။',
  },
];

const contentByLanguage: Record<'en' | 'my', LanguageContent> = {
  en: {
    label: 'English',
    headTitle: 'Pardoning Turkeys, Deporting Dreams | Burmese TPS Op-Ed',
    headDescription:
      'A Burmese refugee’s plea for a kinder, wiser American leadership as TPS for Burma sunsets.',
    heroTag: 'Pardoning Turkeys, Deporting Dreams',
    heroTitle: 'A Burmese Refugee’s Plea for a Kinder, Wiser American Leadership',
    heroSubtitle:
      'How a Thanksgiving tradition of mercy collides with the decision to end Temporary Protected Status for Burma—and why the narrative America chooses matters for refugees, democracy, and national security alike.',
    author: 'Min K',
    authorNote:
      'Burmese-American Refugees Advocate. Writing from lived experience across Burma and the American Midwest.',
    thesis: 'Peace through strength, wisdom, and kindess',
    thesisNote:
      'Ending TPS without honest framing risks handing the junta propaganda and real human lives.',
    readTime: '12 minutes',
    docLink:
      'https://docs.google.com/document/d/1EeBxEaGfnpwbr6mmQ-ZVkB-yrvlOEO-9D0e85Ao4gQs/edit?usp=sharing',
    tweetText:
      'Pardoning Turkeys, Deporting Dreams – a Burmese refugee’s plea for kinder, wiser leadership on TPS for Burma.',
    introParagraphs: englishIntroParagraphs,
    sections: englishSections,
    shareHeadline: 'Help keep Burmese families safe and heard',
    shareBody:
      'If this perspective resonates, please share it with policymakers, journalists, and community leaders. The story America tells about TPS will shape real lives—and the future of democracy in Burma.',
  },
  my: {
    label: 'မြန်မာဘာသာ',
    headTitle:
      'ကြက်ဆင်များကို လွတ်ငြိမ်းခွင့်ပေးသော်လည်း အိပ်မက်များကို ပြည်နှင်ဒဏ်ခတ်ခြင်း | မြန်မာ TPS ဆောင်းပါး',
    headDescription:
      'ကျေးဇူးတော်ချီးမွမ်းပွဲ (Thanksgiving) ၏ သနားညှာတာမှု အစဉ်အလာတစ်ခုနှင့် မြန်မာနိုင်ငံအတွက် ယာယီအကာအကွယ်ပေးထားမှု (TPS) ရပ်စဲမည့် ဆုံးဖြတ်ချက်တို့ မည်သို့ ထိပ်တိုက်တွေ့နေသနည်း — ထို့အပြင် အမေရိကန်က ရွေးချယ်လိုက်သည့် ဇာတ်လမ်းပုံဖော်မှု (Narrative) သည် ဒုက္ခသည်များ၊ ဒီမိုကရေစီရေးနှင့် အမျိုးသားလုံခြုံရေးတို့အတွက်ပါ အဘယ်ကြောင့် အရေးပါနေသနည်း။',
    heroTag:
      'ပိုမိုကြင်နာ၍ ဉာဏ်ပညာပြည့်ဝသော အမေရိကန် ခေါင်းဆောင်မှုတစ်ခုအတွက် မြန်မာရွှေ့ပြောင်းခိုလှုံသူတစ်ဦး၏ အကြံပြုရှောက်ထားချက်',
    heroTitle:
      'ကြက်ဆင်များကိုလွတ်ငြိမ်းခွင့်ပေးသော်လည်း ရွှေ့ပြောင်းခိုလှုံသူများကိုပြည်နှင်ဒဏ်ခတ်ခြင်း',
    heroSubtitle:
      'ကျေးဇူးတော်ချီးမွမ်းပွဲ (Thanksgiving) ၏ သနားညှာတာမှု အစဉ်အလာတစ်ခုနှင့် မြန်မာနိုင်ငံအတွက် ယာယီအကာအကွယ်ပေးထားမှု (TPS) ရပ်စဲမည့် ဆုံးဖြတ်ချက်တို့ မည်သို့ ထိပ်တိုက်တွေ့နေသနည်း — ထို့အပြင် အမေရိကန်က ရွေးချယ်လိုက်သည့် ဇာတ်လမ်းပုံဖော်မှု (Narrative) သည် ဒုက္ခသည်များ၊ ဒီမိုကရေစီရေးနှင့် အမျိုးသားလုံခြုံရေးတို့အတွက်ပါ အဘယ်ကြောင့် အရေးပါနေသနည်း။',
    author: ' Min K ',
    authorNote:
      'မြန်မာ-အမေရိကန် ရွှေ့ပြောင်းခိုလှုံသူအခွင့်အရေး လှုပ်ရှားဆောင်ရွက်သူ။ မြန်မာနိုင်ငံနှင့် အမေရိကန် (Midwest) တို့တွင် ဖြတ်သန်းခဲ့ရသည့် ကိုယ်တွေ့ဘဝ အတွေ့အကြုံများကို အခြေခံ၍ ရေးသားပါသည်။',
    thesis: 'အင်အား၊ ပညာဉာဏ်နှင့် ကြင်နာမှုတို့မှတဆင့် ငြိမ်းချမ်းရေး',
    thesisNote:
      'ရိုးသားမှန်ကန်သော ပုံဖော်မှုမပါဘဲ TPS ကို ရပ်စဲလိုက်ခြင်းသည် စစ်ကောင်စီလက်ထဲသို့ ဝါဒဖြန့်ချိရေး အခွင့်အလမ်းနှင့် လူသားတို့၏ အသက်များကို ထိုးအပ်လိုက်သလို ဖြစ်စေနိုင်သည့် အန္တရာယ်ရှိပါသည်။',
    readTime: '၁၂ မိနစ်',
    docLink:
      'https://docs.google.com/document/d/1XJUT7r_08mB0SIlFu8fPCJqHvnSzVpNFRcmcPYSwyM4/edit?usp=sharing',
    tweetText:
      'မြန်မာမိသားစုများ ဘေးကင်းလုံခြုံစေရန်နှင့် သူတို့၏အသံကို ကမ္ဘာက ကြားသိစေရန် ဝိုင်းဝန်းကူညီပေးကြပါ',
    introParagraphs: burmeseIntroParagraphs,
    sections: burmeseSections,
    shareHeadline:
      'မြန်မာမိသားစုများ ဘေးကင်းလုံခြုံစေရန်နှင့် သူတို့၏အသံများကို ကမ္ဘာက ကြားသိစေရန် ဝိုင်းဝန်းကူညီပေးကြပါ',
    shareBody:
      'ဤဆောင်းပါးပါ သဘောထားအမြင်များကို သင် လက်ခံသဘောတူပါက၊ မူဝါဒချမှတ်သူများ၊ သတင်းမီဒီယာများနှင့် လူထုခေါင်းဆောင်များထံ ရောက်ရှိစေရန် ကျေးဇူးပြု၍ မျှဝေပေးပါ။ TPS နှင့်ပတ်သက်၍ အမေရိကန်က ပြောပြမည့် ဇာတ်လမ်းသည် လူသားတို့၏ ဘဝအစစ်အမှန်များနှင့် မြန်မာ့ဒီမိုကရေစီ အနာဂတ်ကို ပုံဖော်ရာရောက်ပါလိမ့်မည်။',
  },
};

const languageOrder: Array<'en' | 'my'> = ['en', 'my'];

const OpEdPage = () => {
  const [language, setLanguage] = useState<'en' | 'my'>('en');
  const content = contentByLanguage[language];
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(content.tweetText)}&url=${encodeURIComponent(shareUrl)}`;

  return (
    <>
      <Head>
        <title>{content.headTitle}</title>
        <meta name="description" content={content.headDescription} />
      </Head>
      <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
        <div className="relative isolate overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(99,102,241,0.12),transparent_35%),radial-gradient(circle_at_50%_80%,rgba(45,212,191,0.12),transparent_35%)]" />
          <header className="mx-auto flex max-w-5xl flex-col gap-8 px-6 pb-16 pt-20 sm:px-10 sm:pt-24 lg:pt-28">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="inline-flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-100 backdrop-blur">
                Op-Ed Feature
              </div>
              <div className="flex gap-2 rounded-full border border-white/10 bg-white/5 p-1 text-xs font-semibold text-indigo-100 backdrop-blur">
                {languageOrder.map(lang => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLanguage(lang)}
                    className={`rounded-full px-3 py-1 transition ${language === lang ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/30' : 'text-indigo-100 hover:text-white'}`}
                  >
                    {contentByLanguage[lang].label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-200">
                {content.heroTag}
              </p>
              <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                {content.heroTitle}
              </h1>
              <p className="max-w-3xl text-lg text-slate-200 sm:text-xl">{content.heroSubtitle}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-indigo-100/80">
                <span className="rounded-full bg-indigo-500/20 px-3 py-1 font-semibold text-indigo-100">
                  Opinion
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1">November 2025</span>
                <Link
                  href={content.docLink}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 font-semibold text-indigo-100 transition hover:border-indigo-300/60 hover:text-white"
                  target="_blank"
                  rel="noreferrer"
                >
                  {language === 'en' ? 'Download PDF' : 'PDF ဒေါင်းလုပ်ယူရန်'}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M14.25 9.75h6m0 0v-6m0 6L12 3 3.75 11.25M9.75 14.25h-6m0 0v6m0-6L12 21l8.25-8.25"
                    />
                  </svg>
                </Link>
              </div>
            </div>
            <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur sm:grid-cols-3 sm:gap-6">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-200">
                  {language === 'en' ? 'Author' : 'ရေးသူ'}
                </p>
                <p className="text-base font-semibold text-white">{content.author}</p>
                <p className="text-sm text-slate-200">{content.authorNote}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-200">
                  {language === 'en' ? 'Thesis' : 'အဓိကအကြောင်းအရာ'}
                </p>
                <p className="text-base font-semibold text-white">{content.thesis}</p>
                <p className="text-sm text-slate-200">{content.thesisNote}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-200">
                  {language === 'en' ? 'Read time' : 'ဖတ်ရှုချိန်'}
                </p>
                <p className="text-base font-semibold text-white">{content.readTime}</p>
                <p className="text-sm text-slate-200">
                  {language === 'en'
                    ? 'Structured for policy staff, advocates, and concerned Americans.'
                    : 'မူဝါဒရေးရာ တာဝန်ရှိသူများ၊ အရေးဆို တက်ကြွလှုပ်ရှားသူများနှင့် စိုးရိမ်ပူပန်သူ အမေရိကန်ပြည်သူများအတွက် ရည်ရွယ် ပြုစုထားပါသည်။'}
                </p>
              </div>
            </div>
          </header>
        </div>

        <div className="relative -mt-10 lg:-mt-16">
          <div className="mx-auto max-w-5xl space-y-14 px-6 pb-20 sm:px-10">
            <section className="rounded-3xl border border-white/10 bg-white/5 px-6 py-8 shadow-2xl shadow-indigo-500/10 backdrop-blur-sm sm:px-10 sm:py-12">
              <div className="space-y-5 text-lg leading-relaxed text-slate-100">
                {content.introParagraphs.map(paragraph => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>

            {content.sections.map(section => (
              <article
                key={section.title}
                className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-2xl shadow-slate-900/40 ring-1 ring-white/5 backdrop-blur sm:p-10"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/30 text-sm font-semibold text-indigo-100">
                    ●
                  </span>
                  <div className="space-y-4">
                    <header className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-200">
                        {language === 'en' ? 'Section' : 'အပိုင်း'}
                      </p>
                      <h2 className="text-2xl font-bold text-white sm:text-3xl">{section.title}</h2>
                    </header>
                    {section.intro && (
                      <p className="text-lg leading-relaxed text-slate-100">{section.intro}</p>
                    )}
                    {section.paragraphs && (
                      <div className="space-y-4 text-lg leading-relaxed text-slate-100">
                        {section.paragraphs.map(paragraph => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                      </div>
                    )}
                    {section.bullet && (
                      <ul className="mt-2 space-y-3 rounded-2xl border border-indigo-200/10 bg-indigo-500/5 p-4 text-base text-indigo-50">
                        {section.bullet.map(bullet => (
                          <li key={bullet} className="flex gap-3 leading-relaxed">
                            <span className="mt-1 h-2 w-2 rounded-full bg-indigo-300" aria-hidden />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {section.paragraphs1 && (
                      <div className="space-y-4 text-lg leading-relaxed text-slate-100">
                        {section.paragraphs1.map(paragraph => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                      </div>
                    )}
                    {section.bullets && (
                      <ul className="mt-2 space-y-3 rounded-2xl border border-indigo-200/10 bg-indigo-500/5 p-4 text-base text-indigo-50">
                        {section.bullets.map(bullet => (
                          <li key={bullet} className="flex gap-3 leading-relaxed">
                            <span className="mt-1 h-2 w-2 rounded-full bg-indigo-300" aria-hidden />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {section.paragraphs2 && (
                      <div className="space-y-4 text-lg leading-relaxed text-slate-100">
                        {section.paragraphs2.map(paragraph => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                      </div>
                    )}
                    {section.closing && (
                      <p className="text-lg leading-relaxed text-slate-100">{section.closing}</p>
                    )}
                  </div>
                </div>
              </article>
            ))}

            <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-500 p-[1px] shadow-2xl shadow-indigo-600/20">
              <div className="h-full rounded-3xl bg-slate-950/80 p-8 sm:p-10">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-3 text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-100">
                      {language === 'en' ? 'Share the op-ed' : 'ဆောင်းပါးကို မျှဝေပါ'}
                    </p>
                    <h3 className="text-2xl font-bold sm:text-3xl">{content.shareHeadline}</h3>
                    <p className="max-w-2xl text-base text-indigo-50">{content.shareBody}</p>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm font-semibold">
                    <Link
                      href={content.docLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-slate-900 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-white/30"
                    >
                      {language === 'en' ? 'Open Google Doc' : 'Google Doc ကိုဖွင့်ကြည့်ရန်'}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M14.25 9.75h6m0 0v-6m0 6L12 3 3.75 11.25"
                        />
                      </svg>
                    </Link>
                    <Link
                      href={tweetUrl}
                      className="inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-3 text-white transition hover:-translate-y-0.5 hover:border-white hover:bg-white/10"
                    >
                      {language === 'en' ? 'Share on (Twitter)' : 'X/Twitter မှာ မျှဝေပါ'}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
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
