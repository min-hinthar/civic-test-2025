import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

const shareUrl = 'https://civic-test-2025.vercel.app/op-ed';

type Section = {
  title: string;
  intro?: string;
  paragraphs?: string[];
  bullets?: string[];
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
  "Every Thanksgiving, America does something beautifully strange: it pardons a turkey. This year it was Gobble and Waddle—two ‘Make America Healthy Again’ certified birds who, with full Hollywood optics, were spared and sent off to a comfortable retirement instead of the oven. It’s lighthearted, theatrical, and oddly touching. A country that can still make time for a symbolic act of mercy is a country that hasn’t entirely forgotten its virtues.",
  "Meanwhile, in the backdrop of that feel-good moment, the Administration announced that Temporary Protected Status (TPS) for Burma (Myanmar) will end, on the grounds that it is now “safe” for Burmese seeking refuge in the United States to go back to where they belong. The turkeys got clemency. The refugees, a deadline.",
  "I say that with a little heaviness and a little humor—no offence to the blessed birds or the many Americans who honestly believe TPS has to end sometime. They’re right about one thing: TPS is temporary by design. It should be consistently reviewed and definitely not become a back door for people who do not face imminent danger in Burma or those who might pose a risk to the American people. The question is not whether TPS will end. Rather it’s how and on whose narrative. Right now, the story being used to justify terminating TPS for Burma sounds suspiciously like it was drafted in Naypyidaw, not in Washington. And that is dangerous—for Burmese lives, for American credibility, and for the broader project of making the world a little safer from scam centres, critically dirty minerals, and fashionably trending authoritarian strongmen.",
];

const englishSections: Section[] = [
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

const burmeseIntroParagraphs = [
  'နှစ်စဉ်နှစ်တိုင်း ကျေးဇူးတော်နေ့ (Thanksgiving) ရောက်တိုင်း အမေရိကန်နိုင်ငံဟာ ထူးဆန်းပြီး လှပတဲ့ အလုပ်တစ်ခုကို လုပ်လေ့ရှိပါတယ်။ အဲဒါကတော့ ကြက်ဆင်တစ်ကောင်ကို လွတ်ငြိမ်းချမ်းသာခွင့် ပေးခြင်းပါပဲ။',
  'ဒီနှစ်မှာတော့ "Make America Healthy Again" (အမေရိကကို ပြန်လည်ကျန်းမာစေမည်) လက်မှတ်ရထားတဲ့ "Gobble" နဲ့ "Waddle" လို့ အမည်ရတဲ့ ကြက်ဆင်ကြီး နှစ်ကောင်ဟာ ဟောလိဝုဒ်ဆန်ဆန် အခမ်းအနားတွေနဲ့ သမ္မတရဲ့ လွတ်ငြိမ်းခွင့်ကို ရရှိခဲ့ပါတယ်။ မီးဖိုထဲ ရောက်မယ့်အစား မြောက်ကယ်ရိုလိုင်းနားပြည်နယ်က ကောလိပ်ပိုင် ခြံဝင်းတစ်ခုမှာ အေးအေးဆေးဆေး အငြိမ်းစားယူခွင့် ရသွားကြပါပြီ။ ဒါဟာ ပေါ့ပါးတယ်၊ ပြဇာတ်ဆန်တယ်၊ ပြီးတော့ ထူးဆန်းစွာနဲ့ပဲ စိတ်ထိခိုက် ကြည်နူးစရာ ကောင်းပါတယ်။ သင်္ကေတသဘောဆောင်တဲ့ ကရုဏာသက်မှုလေးတစ်ခုအတွက် အချိန်ပေးနိုင်သေးတဲ့ တိုင်းပြည်တစ်ခုဟာ သူ့ရဲ့ မွန်မြတ်တဲ့ စိတ်ထားတွေကို လုံးဝ မမေ့သေးဘူးလို့ ဆိုရမှာပါ။',
  'ဒါပေမဲ့ အဲဒီလို ကြည်နူးစရာကောင်းတဲ့ မြင်ကွင်းရဲ့ နောက်ကွယ်မှာတော့ အစိုးရအဖွဲ့က "မြန်မာနိုင်ငံသားများအတွက် ယာယီအကာအကွယ်ပေးထားမှု အစီအစဉ် (TPS) ကို အဆုံးသတ်တော့မယ်" လို့ ကြေညာခဲ့ပါတယ်။ အမေရိကန်မှာ ခိုလှုံခွင့် တောင်းခံနေရသူတွေအတွက် နေရပ်ပြန်ဖို့ "လုံခြုံစိတ်ချရပြီ" လို့ အကြောင်းပြပါတယ်။',
  'ကြက်ဆင်တွေက လွတ်ငြိမ်းချမ်းသာခွင့် ရသွားပါတယ်။',
  'ဒုက္ခသည်တွေကတော့ သတ်မှတ်ရက် (Deadline) တစ်ခု ရလိုက်ပါတယ်။',
  'ကျွန်တော် ဒီစကားကို လေးလံတဲ့စိတ်၊ ဟာသဉာဏ် နည်းနည်းနှောပြီး ပြောနေတာဟာ ကံကောင်းတဲ့ ကြက်ဆင်တွေကို စော်ကားလိုလို့ မဟုတ်သလို၊ TPS ဆိုတာ တချိန်ချိန်မှာ ပြီးဆုံးရမယ်လို့ ရိုးသားစွာ ယုံကြည်တဲ့ အမေရိကန် ပြည်သူတွေကို စော်ကားလိုလို့လည်း မဟုတ်ပါဘူး။ သူတို့ အချက်တစ်ချက် မှန်ပါတယ်။ TPS ဆိုတာ မူလရည်ရွယ်ချက်ကတည်းက ယာယီ (Temporary) ပါ။ ဒါကို စဉ်ဆက်မပြတ် ပြန်လည်သုံးသပ်သင့်တာ မှန်ပါတယ်။ မြန်မာပြည်မှာ အန္တရာယ်ကြီးကြီးမားမား မရှိတဲ့သူတွေ (သို့) အမေရိကန် ပြည်သူတွေအတွက် အန္တရာယ်ဖြစ်စေနိုင်တဲ့ သူတွေအတွက် နောက်ဖေးပေါက် ဖြစ်မသွားသင့်တာလည်း မှန်ပါတယ်။',
  'မေးခွန်းက TPS အဆုံးသတ်မှာလား၊ မသတ်ဘူးလား ဆိုတာ မဟုတ်ပါဘူး။',
  'မေးခွန်းက ဘယ်လို အဆုံးသတ်မှာလဲ နဲ့ ဘယ်သူ့ရဲ့ ဇာတ်လမ်း (Narrative) အပေါ် အခြေခံပြီး ဆုံးဖြတ်မှာလဲ ဆိုတာသာ ဖြစ်ပါတယ်။',
  'အခုလောလောဆယ်မှာ မြန်မာ TPS ရပ်စဲဖို့ အကြောင်းပြချက်အဖြစ် သုံးနေတဲ့ ဇာတ်လမ်းက ဝါရှင်တန်မှာ ရေးဆွဲထားတာ မဟုတ်ဘဲ နေပြည်တော်မှာ ရေးဆွဲထားတာနဲ့ သံသယဖြစ်စရာကောင်းလောက်အောင် တူလွန်းနေပါတယ်။',
  'ဒါဟာ အန္တရာယ် ရှိပါတယ်။ မြန်မာပြည်သူတွေရဲ့ အသက်အိုးအိမ်အတွက် အန္တရာယ်ရှိသလို၊ အမေရိကန်ရဲ့ ဂုဏ်သိက္ခာအတွက်၊ ပြီးတော့ ကျားဖြန့်စခန်းတွေ၊ ညစ်ပတ်တဲ့ သယံဇာတတွေနဲ့ ခေတ်စားနေတဲ့ အာဏာရှင်တွေ ရန်ကနေ ကမ္ဘာကြီးကို ပိုလုံခြုံအောင် လုပ်မယ့် စီမံကိန်းကြီးတစ်ခုလုံးအတွက်လည်း အန္တရာယ် ရှိပါတယ်။',
];

const burmeseSections: Section[] = [
  {
    title: 'ရှေးရိုးစွဲ ပြည်နယ်တစ်ခုဆီ ရောက်သွားတဲ့ အသားညိုညို မြန်မာကျောင်းသားလေး',
    paragraphs: [
      'နည်းနည်းလောက် နောက်ကြောင်းပြန်ပါရစေ။',
      '၂၀၁၀ ပြည့်လွန်နှစ်တွေရဲ့ အစပိုင်းကာလမှာ အိုဟိုင်းယိုး (Ohio) ပြည်နယ်၊ The College of Wooster မှာ ကျွန်တော် ဘွဲ့ကြိုတန်း တက်ခဲ့ပါတယ်။ စာရွက်ပေါ်မှာ ကြည့်ရင်တော့ "ဝိဇ္ဇာပညာသင် (Liberal Arts) အသားညိုညို မြန်မာကျောင်းသားလေး တစ်ယောက် အမေရိကန် အနောက်အလယ်ပိုင်း (Midwest) အသည်းနှလုံးထဲ ရောက်သွားခြင်း" ဆိုတာ ဟာသတစ်ခုလို ဖြစ်နေနိုင်ပါတယ်။ ဒါပေမဲ့ လက်တွေ့မှာတော့ အဲဒီအချိန်တွေဟာ ကျွန်တော့်ဘဝရဲ့ အရေးအပါဆုံး အတွေ့အကြုံတွေ ဖြစ်ခဲ့ပါတယ်။',
      'စရောက်ကာစကတော့ တော်တော် ကွာခြားတယ်လို့ ခံစားရပါတယ်။ ကျောင်းဝင်းထဲမှာ ကမ္ဘာအရပ်ရပ်က ထူးချွန်ကျောင်းသားတွေ ရှိနေပေမယ့်၊ ကျောင်းပြင်ပမှာတော့ ပြောင်းခင်းတွေ၊ အေမစ် (Amish) လူမျိုးတွေရဲ့ မြင်းလှည်းတွေနဲ့ Beall လမ်းမကြီးပေါ်က ပစ်ကပ်ကားတွေ ဝန်းရံနေပါတယ်။ ဒါပေမဲ့ ဝေဖန်ပိုင်းခြား တွေးခေါ်မှု (Critical Thinking) နဲ့ Midwestern တန်ဖိုးထားမှုများ ပေါင်းစပ်လိုက်တဲ့အခါ အံ့ဩစရာကောင်းတဲ့ အရာတစ်ခု ဖြစ်လာပါတယ်။ ရာသီပေါ် အစားအသောက်တွေနဲ့ Thanksgiving ထမင်းဝိုင်းတွေမှာ သူတို့ဆီက ပိုလေးနက်တဲ့ ဇာတ်လမ်းတွေကို ကြားလာရပါတယ် -',
    ],
    bullets: [
      'တစ်ချိန်က မြို့လုံးကျွတ် မှီခိုခဲ့ရတဲ့ စက်ရုံကြီးတွေ ပိတ်သိမ်းသွားပြီး ဘယ်တော့မှ ပြန်မဖွင့်တော့တဲ့ အကြောင်း။',
      'မိဘတွေက အလုပ် ၂ ခု၊ ၃ ခု လုပ်ရင်း ဖန်တာနိုင်း (Fentanyl) နဲ့ ဘိန်းဖြူ အန္တရာယ်၊ ကျောင်းတွင်း ပစ်ခတ်မှုတွေနဲ့ သူတို့ကလေးတွေ အိမ်ပိုင်နိုင်ပါ့မလား ဆိုတာကို စိုးရိမ်နေရတဲ့ အကြောင်း။',
      '"ငါတို့က လူဝင်မှုကြီးကြပ်ရေးကို ဆန့်ကျင်တာ မဟုတ်ဘူး၊ ဖရိုဖရဲဖြစ်နေတာ (Chaos) ကို ဆန့်ကျင်တာ" လို့ ပြောတဲ့အခါ အထက်စီးက ဆက်ဆံခံရသလို ခံစားရပြီး လစ်လျူရှုခံရတဲ့ လူတွေအကြောင်း။',
    ],
    closing: 'Facebook ပေါ်က သတင်းတွေကိုပဲ ဖတ်ကြည့်ရင်တော့ ဒီအကြောက်တရားတွေကို "လူမျိုးခြားကြောက်ရောဂါ (Xenophobia)" လို့ ထင်စရာ ရှိပါတယ်။ ဒါပေမဲ့ Wooster မြို့က ထမင်းစားပွဲမှာ အတူထိုင်ပြီး နားထောင်ကြည့်လိုက်ရင်တော့ ဒါတွေဟာ ရုပ်ဖျက်ထားတဲ့ ဝမ်းနည်းပူဆွေးမှု (Grief in disguise) တွေ ဖြစ်ကြောင်း သိလာရပါတယ်။ လုံခြုံမှုတွေ ပျောက်ဆုံးသွားလို့၊ ဂုဏ်သိက္ခာတွေ ပျောက်ဆုံးသွားလို့၊ ပြီးတော့ သူတို့ သဘောဆန္ဒမပါဘဲ ပြောင်းလဲသွားတဲ့ ကမ္ဘာကြီးအတွက် ဝမ်းနည်းနေကြတာပါ။ ဒါပေမဲ့ အဲဒီ Midwestern သားတွေကပဲ ကျွန်တော်တို့လို အသားညိုညို ကလေးတွေ မိုးထဲလေထဲ လမ်းလျှောက်နေတာတွေ့ရင် Walmart ကို ကားလိုက်ပို့ပေးတတ်ကြပါတယ်။ Thanksgiving ပွဲတွေ၊ တနင်္လာနေ့ည ဘောလုံးပွဲတွေမှာ မိသားစုဝင်လို ခေါ်ကျွေးတတ်ကြပါတယ်။ ကမ္ဘာ့ဟိုဘက်ခြမ်း မိုင် ၈၀၀၀ အကွာမှာ အခြေအနေဆိုးနေတယ်လို့ TV မှာ တွေ့ရင် ကျွန်တော့်မိသားစု အဆင်ပြေရဲ့လားဆိုပြီး မေးမြန်းပေးကြပါတယ်။ မြန်မာ့နိုင်ငံရေးအကြောင်း ကျွန်တော့်ကို (ကြင်နာစွာနဲ့) မေးခွန်းထုတ်ပြီးရင်တော့ ကန်စွန်းဥဟင်း (Sweet potato casserole) တစ်ပန်းကန်နဲ့ Pecan သီးတွေပါတဲ့ ရွှေဖရုံသီးမုန့် (Pumpkin Pie) တစ်စိတ် ထပ်ထည့်ပေးတတ်ပါတယ်။ သူတို့ရဲ့ ကိုယ်ကျင့်တရား စံနှုန်းက ရိုးရှင်းပြီး ခရစ်ယာန်ဆန်ပါတယ် - "အိမ်နီးချင်းကို ချစ်ပါ၊ ကောင်းသော အမှုတော်ကို ဆောင်ပါ၊ မကောင်းမှု ဒုစရိုက်ကို တားဆီးနိုင်တဲ့ အင်အားရှိလျက်နဲ့ လစ်လျူမရှုပါနဲ့။" ဒါဟာ ကျွန်တော်သိတဲ့ အမေရိကန်ပါပဲ - အလွန် ဂုဏ်ယူတတ်သလို၊ အလွန်လည်း ရက်ရောတတ်တဲ့ နိုင်ငံ။ ဒါကြောင့် ရှေးရိုးစွဲဝါဒီ (Conservatives) တွေက "TPS ဆိုတာ ထာဝရ မဖြစ်သင့်ဘူး၊ ခိုင်မာတဲ့ နယ်စပ်နဲ့ စေ့စေ့စပ်စပ် စိစစ်မှုတွေ လိုတယ်" လို့ ပြောရင် ကျွန်တော်က ဒါကို ရက်စက်မှုလို့ မမြင်ပါဘူး။ ဖရိုဖရဲနိုင်မှုတွေ၊ ပျက်ကွက်ခဲ့တဲ့ ကတိတွေ များလွန်းလို့ နောက်ထပ် အလိမ်မခံချင်တော့တဲ့ လူတွေရဲ့ စကားသံလို့ပဲ ကြားပါတယ်။ ရယ်စရာကောင်းတာက... ကျွန်တော်တို့လည်း အဲဒီလိုပဲ ခံစားရလို့ပါပဲ။',
  },
  {
    title: 'TPS ဆိုတာ ယာယီပါ - ဒါပေမဲ့ "ခေါင်းစဉ်တပ်ပုံ (Framing)" က လက်ရှိအမှန်တရားကို ထင်ဟပ်ရပါမယ်',
    paragraphs: [
      'ဥပဒေအရရော ယုတ္တိဗေဒအရပါ TPS ဆိုတာ ယာယီ (Temporary) ပါ။ စစ်ပွဲတွေ၊ သဘာဝဘေးတွေလို "ထူးခြားပြီး ယာယီအခြေအနေတွေ" ကြောင့် နေရပ်ပြန်ဖို့ မဖြစ်နိုင်တဲ့အခါ ပေးထားတဲ့ အရာပါ။ အဲဒီအခြေအနေတွေ တကယ်ပြောင်းလဲသွားရင် TPS ကို ပြန်လည်သုံးသပ်သင့်ပါတယ်။',
      'အကယ်၍ အမိမြေလုံခြုံရေးဌာန (DHS) ကသာ အခုလို တည်ငြိမ်စွာ ပြောခဲ့မယ်ဆိုရင် -',
      '... အဲဒီလိုသာ ပြောရင် ကျွန်တော်တို့ ကြောက်နေရဦးမှာ ဖြစ်ပေမယ့်၊ အနည်းဆုံးတော့ ဇာတ်လမ်းက Midwest ရိုးသားမှုမျိုး ရှိပါသေးတယ်။',
      'ဒါပေမဲ့ လက်တွေ့မှာတော့ တရားဝင် အကြောင်းပြချက်တွေက "အုပ်ချုပ်ရေးနှင့် တည်ငြိမ်မှုတွင် သိသာထင်ရှားသော တိုးတက်မှုများ"၊ အရေးပေါ်အခြေအနေ ရုပ်သိမ်းခြင်း၊ "လွတ်လပ်ပြီး တရားမျှတသော ရွေးကောက်ပွဲများ"၊ အပစ်အခတ်ရပ်စဲရေးများ စတဲ့ စကားလုံးတွေကို မှီခိုနေပါတယ်။ မြန်မာပြည်က ပုံမှန်အခြေအနေဆီ တရွေ့ရွေ့သွားနေသယောင် ပြောဆိုနေပါတယ်။',
      'ဒီလို ခေါင်းစဉ်တပ်တာ (Framing) ဟာ မြန်မာပြည် တစ်နိုင်ငံတည်း ဆိုရင်တောင် မေးခွန်းထုတ်စရာ ဖြစ်နေပါပြီ။',
      'ဒါပေမဲ့ TPS ဟာ မြန်မာပြည် တစ်နိုင်ငံတည်းအတွက် ရပ်စဲခံရတာ မဟုတ်ပါဘူး။ လူသားချင်းစာနာမှုဆိုင်ရာ အကာအကွယ်တွေကို တင်းကျပ်ပြီး "TPS ကို မူလရည်ရွယ်ချက်အတိုင်း ယာယီအဖြစ် ပြန်ရောက်စေရေး" ဆိုတဲ့ မူဝါဒအောက်မှာ နိုင်ငံ ၂၀ နီးပါးအတွက် တပြိုင်နက်တည်း ရပ်စဲခံရတာ ဖြစ်ပါတယ်။ အစီအစဉ်အများအပြားကို ရပ်စဲတာက နိုင်ငံရေး ရွေးချယ်မှု (Political Choice) ပါ။ ဒါပေမဲ့ တစ်ခုချင်းစီကို ဘယ်လို ခေါင်းစဉ်တပ်မလဲ ဆိုတာကတော့ ကိုယ်ကျင့်တရားနဲ့ မဟာဗျူဟာဆိုင်ရာ ရွေးချယ်မှု ဖြစ်ပါတယ်။',
      'မြန်မာ့ကိစ္စမှာတော့ ဒီအဖြစ်အပျက် အစီအစဉ်နဲ့ ဇာတ်လမ်းဟာ ဗိုလ်ချုပ်တွေအတွက် \'Jet2 holiday\' ခရီးစဉ် လက်ဆောင်ရသလို ထီပေါက်ခြင်းပါပဲ။ တကယ်ပါ... ဒီထက်ကောင်းတာ ဘာရှိဦးမှာလဲ။',
      'အကယ်၍ ခင်ဗျားသာ စစ်ကောင်စီအတွက် ဝါဒဖြန့်ချိရေး အောင်ပွဲတစ်ခု ဖန်တီးပေးချင်တယ် ဆိုရင်တောင် ဒီထက်ပိုကောင်းအောင် လုပ်ပေးနိုင်မှာ မဟုတ်ပါဘူး -',
    ],
    bullets: [
      'ကျားဖြန့်စခန်းတွေကို ဝင်စီးပြတာ ရုပ်သံလွှင့်မယ်။',
      'တရုတ်ကြားဝင်တဲ့ တန်ဖိုးနည်း ငြိမ်းချမ်းရေး စာချုပ်တွေ ချုပ်မယ်။',
      'ဒေါ်အောင်ဆန်းစုကြည်နဲ့ သမ္မတ ဦးဝင်းမြင့်ကို ဆက်ဖမ်းထားပြီး၊ ရွေးချယ်ထားတဲ့ အကျဉ်းသားတချို့ကို ဟန်ပြ လွှတ်ပေးမယ်။',
      'အဲဒီအချိန်မှာပဲ DHS က မြန်မာပြည်မှာ "သိသာထင်ရှားသော တိုးတက်မှုများ" ရှိနေပြီ၊ ဒါကြောင့် TPS ရပ်စဲလို့ ရပြီလို့ ကြေညာမယ်။',
      'ချက်ချင်းဆိုသလို စစ်ကောင်စီက တီဗီမှာ ထွက်ပြောမယ် - "တွေ့လား... အမေရိကန်ကတောင် ငါတို့ တည်ငြိမ်နေပြီလို့ ပြောနေတယ်။ အားလုံးပဲ အိမ်ပြန်လာပြီး မဲပေးကြပါ။ ငါတို့ ဒီတခါတော့ ကြင်နာပါ့မယ်လို့ ကတိပေးပါတယ်" ဆိုပြီး။',
      'ရိုးရိုးသားသား ပြောရရင်... DCI Group လို လော်ဘီအဖွဲ့နဲ့ သူတို့ရဲ့ PR လုပ်ငန်းတွေအပေါ် ရင်းနှီးမြှုပ်နှံမှု အကျိုးအမြတ် (ROI) ဟာ ကြောက်စရာကောင်းလောက်အောင် အောင်မြင်နေပါတယ်။ အကယ်၍ ခင်ဗျားသာ ကန်ထရိုက်တာ ရှာနေတဲ့ အာဏာရှင်တစ်ယောက် ဆိုရင်၊ ကိုယ်ပြောချင်တဲ့ စကားလုံးတွေကို အမေရိကန် ပြည်ထောင်စု အစိုးရမှတ်တမ်း (Federal Register) မှာ စာလုံးမရွေ့ ပြန်ပါလာအောင် လုပ်နိုင်တာဟာ ကြယ်ငါးပွင့်အဆင့် Yelp Review ရသလို ဖြစ်နေမှာပါ။',
    ],
    closing: 'ဒါဟာ ပြဿနာပါပဲ - TPS ရပ်စဲလိုက်တာ သက်သက် မဟုတ်ဘဲ၊ ရပ်စဲဖို့ အကြောင်းပြချက်ပေးပုံက ပြည်သူလူထုကို ဓားစာခံလို ဆက်ဆံနေဆဲဖြစ်တဲ့ လူမိုက်အစိုးရတစ်ရပ်က ပြန်ပေးဆွဲ (Hijack) သွားခြင်း ပါပဲ။ ________________',
  },
  {
    title: 'စစ်ကောင်စီ၏ "တိုးတက်မှုများ" - နိုင်ငံသားများ မဟုတ်၊ ဓားစာခံများသာ',
    intro: 'မြန်မာစစ်တပ်ဟာ မကြာသေးမီက အသံကျယ်ကျယ်ထွက်တဲ့ ဟန်ပြလုပ်ရပ်တချို့ လုပ်ခဲ့ပါတယ် - * တရားဝင် အရေးပေါ်အခြေအနေကို ရုပ်သိမ်းလိုက်တယ်။ ဒါပေမဲ့ အခြေခံအချက်တွေက မပြောင်းလဲပါဘူး -',
    bullets: [
      'ရွေးကောက်ပွဲ ကြေညာတယ်။',
      'အာဏာသိမ်းကာလ ပုဒ်မတွေကို ပြင်ဆင်ပြီး အဲဒီပုဒ်မနဲ့ ထောင်ချခံထားရသူ တချို့ကို လွှတ်ပေးတယ်။',
      'အဝေးကြီးကနေ မျက်လုံးမှေးပြီး ကြည့်မယ်ဆိုရင်တော့ ဒါဟာ နေ့ခင်းကြောင်တောင် နေသာနေသလို ထင်ရပါတယ်။',
      'သမ္မတ ဦးဝင်းမြင့် ဆက်လက် အထိန်းသိမ်းခံ နေရဆဲပါ။',
      'ကျောင်းသားခေါင်းဆောင်တွေ၊ သတင်းစာဆရာတွေ၊ ရပ်မိရပ်ဖတွေ အပါအဝင် ထောင်ပေါင်းများစွာသော နိုင်ငံရေးအကျဉ်းသားတွေ ဆက်လက် ဖမ်းဆီးခံထားရဆဲ (သို့) ပျောက်ဆုံးနေဆဲပါ။',
      'NUG နဲ့ တိုင်းရင်းသားလက်နက်ကိုင် အများစုကို စစ်မှန်တဲ့ ဆွေးနွေးပွဲတွေကနေ ဖယ်ထုတ်ထားပါတယ်။',
      'လေကြောင်းတိုက်ခိုက်မှုတွေ၊ လက်နက်ကြီးပစ်ခတ်မှုတွေနဲ့ ရွာမီးရှို့မှုတွေ၊ ဘုရားကျောင်း၊ ကျောင်း၊ ဆေးရုံ မီးရှို့မှုတွေ ဆက်လက် ဖြစ်ပွားနေပါတယ်။',
      'မန္တလေးကနေ မော်လမြိုင်အထိ စစ်ကောင်စီ လက်အောက်မှာ နေရသူတိုင်း အခြေအနေကို သိကြပါတယ် -',
    ],
    closing: 'ခင်ဗျားဟာ မလွတ်လပ်မချင်း လွတ်လပ်နေတာပါ (You are free until you are not)။ "လွတ်လာသူ" ဘယ်သူမဆို Facebook ပို့စ်တစ်ခုကြောင့်၊ ကောလဟာလတစ်ခုကြောင့် (သို့) ဘာအကြောင်းပြချက်မှ မရှိဘဲ ပြန်ဖမ်းခံရနိုင်ပါတယ်။ ရွေးကောက်ပွဲအကြောင်း၊ စစ်ပွဲအကြောင်း၊ စီးပွားရေးအကြောင်း ရိုးရိုးသားသား ပြောမိသူတိုင်း ညသန်းခေါင် တံခါးလာခေါက်ခံရမယ့် အန္တရာယ် ရှိပါတယ်။ အဲဒီအထဲမှာ ပြန်ပို့ခံရတဲ့ သူတွေလည်း ပါပါတယ်။ ဒါကြောင့် DHS က မြန်မာပြည်ဟာ လူအများအပြား နေရပ်ပြန်ဖို့ လုံခြုံနေပြီလို့ ပြောလိုက်တာဟာ ကိုယ်ကျင့်တရားအရ မှားယွင်းရုံတင် မကပါဘူး၊ လက်တွေ့မှာလည်း အန္တရာယ် များပါတယ်။ စစ်ကောင်စီလက်ထဲကို "အလားအလာရှိသော ဓားစာခံစာရင်း" တစ်ခု ထည့်ပေးလိုက်သလို ဖြစ်နေပြီး၊ သူတို့ ပြောချင်တဲ့ စကားအတွက် အခွင့်အရေး ပေးလိုက်သလို ဖြစ်နေပါတယ် - "ဝါရှင်တန်ကတောင် အခြေအနေ တိုးတက်နေပြီလို့ လက်ခံတယ်။ ဒါကြောင့် အခု ပြန်လာပြီး ပြဿနာရှာတဲ့ ကောင်တွေကတော့ ရှင်းပါတယ်... သားကောင်တွေ မဟုတ်ဘူး၊ ရာဇဝတ်ကောင်တွေပဲ" ဆိုပြီး ပြောလာမှာပါ။ ပုံမှန်အားဖြင့် သံခင်းတမန်ခင်း ပြောဆိုတတ်တဲ့ အာဆီယံ သံတမန်တွေတောင် စစ်ကောင်စီရဲ့ ရိုးသားမှုကို မယုံကြပါဘူး။ ပြည်တွင်းရေး ဝင်မစွက်ဖက်ရေး မူဝါဒကို ကိုင်စွဲတဲ့ နိုင်ငံတွေ (ပွင့်ပွင့်လင်းလင်း ပြောရရင် လူ့အခွင့်အရေး ချန်ပီယံ မဟုတ်တဲ့ နိုင်ငံတွေ) ကတောင် ဒီရွေးကောက်ပွဲဟာ အတုအယောင် ဖြစ်တယ်၊ ဒေါ်စုကို ဆက်ဖမ်းထားသရွေ့ ဘယ်လို "အကူးအပြောင်း" မှ တရားမဝင်နိုင်ဘူးလို့ တိတ်တဆိတ် ဝန်ခံနေကြပြီ ဆိုရင်... ဝါရှင်တန်အနေနဲ့ နားထောင်သင့်ပါပြီ။ ________________',
  },
  {
    title: 'လွှတ်တော် (Congress) က သဘောပေါက်ပါတယ်၊ DHS လည်း အမီလိုက်သင့်ပါပြီ',
    paragraphs: [
      'အမေရိကန်ရဲ့ လက်တွေ့ကျတဲ့ သဘောထား ဘယ်လိုရှိသင့်သလဲ သိချင်ရင် မကြာသေးမီက ပြုလုပ်ခဲ့တဲ့ အောက်လွှတ်တော် နိုင်ငံခြားရေးရာ ကော်မတီရဲ့ ပူးတွဲကြားနာပွဲ ကို ကြည့်ပါ။ ခေါင်းစဉ်က "ထွက်ပေါက်မရှိသော မဟာဗျူဟာ - မြန်မာ့အဆုံးမဲ့ အကျပ်အတည်းနှင့် အမေရိကန်၏ အကန့်အသတ်ရှိသော ရွေးချယ်စရာများ" ဖြစ်ပါတယ်။ ပါတီနှစ်ရပ်လုံး (ရီပတ်ဘလစ်ကန်နဲ့ ဒီမိုကရက်) က အမတ်တွေ ပါဝင်ပြီး သဘောထားတွေ ထူးခြားစွာ တူညီနေကြပါတယ် -',
      '* လာမယ့် ရွေးကောက်ပွဲကို ဒီမိုကရေစီ မှတ်တိုင်မဟုတ်ဘဲ "အတုအယောင် (Sham)" နဲ့ "ပြဇာတ်" သာ ဖြစ်ကြောင်း ပြောကြားခဲ့ကြပါတယ်။',
      '* ဒေါ်အောင်ဆန်းစုကြည်နဲ့ အဓိကခေါင်းဆောင်တွေ ထောင်ထဲရှိနေသရွေ့၊ ပြည်သူအများအပြား ဗုံးကြဲခံနေရသရွေ့ ဘယ်ရွေးကောက်ပွဲမှ ယုံကြည်လက်ခံနိုင်ဖွယ် မရှိကြောင်း အလေးပေး ပြောကြားခဲ့ကြပါတယ်။',
      '* စစ်ကောင်စီရဲ့ အစီအစဉ်ကို လူသိရှင်ကြား ရှုတ်ချဖို့ နဲ့ ပိတ်ဆို့မှု၊ သံတမန်ရေး၊ ဒီမိုကရေစီ ထောက်ခံမှုတွေကို မဟာဗျူဟာကျကျ ပေါင်းစပ်ဖို့ မြန်မာနိုင်ငံဆိုင်ရာ အထူးကိုယ်စားလှယ် ခန့်အပ်ဖို့ အစိုးရကို တိုက်တွန်းခဲ့ကြပါတယ်။',
      'ဒါဟာ "တက်ကြွလှုပ်ရှားသူတွေနဲ့ အစိုးရ" တိုက်နေတာ မဟုတ်ပါဘူး။ "လွှတ်တော် (Congress) နဲ့ မှားယွင်းသော ဇာတ်လမ်း (Bad Narrative)" တိုက်နေကြတာပါ။',
      'DHS အနေနဲ့ မူဝါဒကို ချက်ချင်း ပြောင်းစရာ မလိုပါဘူး၊ အသုံးအနှုန်း (Language) ကို ပြောင်းလိုက်ရုံပါပဲ။ အောက်ပါအတိုင်း ပြင်ဆင်ပြောဆိုနိုင်ပါတယ် -',
    ],
    closing: '* မြန်မာပြည်ဟာ အလွန်အမင်း မလုံခြုံသေးပါဘူး။ * TPS ရပ်စဲတာဟာ မူဝါဒ အပြောင်းအလဲရဲ့ အစိတ်အပိုင်း တစ်ခုသာ ဖြစ်ပြီး၊ စစ်ကောင်စီက လွတ်လပ်မှုနဲ့ တည်ငြိမ်မှုကို ပြန်လည် ဖော်ဆောင်ပေးနိုင်လို့ မဟုတ်ပါဘူး။ * အမေရိကန် ပြည်ထောင်စုအနေနဲ့ ကွန်ဂရက်လွှတ်တော်၊ တခြား ဒီမိုကရေစီ နိုင်ငံတွေနဲ့အတူ ရပ်တည်ပြီး စစ်ကောင်စီရဲ့ အတုအယောင် ရွေးကောက်ပွဲကို ငြင်းပယ်ကြောင်း၊ ဒေါ်အောင်ဆန်းစုကြည်နဲ့ နိုင်ငံရေး အကျဉ်းသားအားလုံး လွှတ်ပေးဖို့ တောင်းဆိုကြောင်း ပြောနိုင်ပါတယ်။ အဲဒီလို ဇာတ်လမ်း အပြောင်းအလဲလေး လုပ်လိုက်ရုံနဲ့ DHS ဟာ သူ့ရဲ့ လူဝင်မှုကြီးကြပ်ရေး အစီအစဉ်ကို ဆက်လုပ်နိုင်သလို၊ တချိန်တည်းမှာပဲ စစ်ကောင်စီရဲ့ ဝါဒဖြန့်ချိရေး အောင်ပွဲကို တားဆီးနိုင် ပါလိမ့်မယ်။ ဥပဒေအရ ဘာမှ ကုန်ကျစရိတ် မရှိဘဲ၊ ကိုယ်ကျင့်တရားဆိုင်ရာ ရှင်းလင်းပြတ်သားမှု (Moral Clarity) ကို အများကြီး ရရှိစေမယ့် နည်းလမ်းပါ။',
  },
  {
    title: 'TPS ဆွေးနွေးပွဲတွေမှာ လေးလေးနက်နက် ထည့်သွင်းစဉ်းစားရမယ့် နောက်ထပ် စိုးရိမ်ပူပန်မှု တစ်ခုကတော့ လုံခြုံရေး (Security) ပါ။',
    paragraphs: [
      'နိုင်ငံခြား အဆက်အသွယ်ရှိသူတွေရဲ့ အကြမ်းဖက်မှု (သို့) အကြမ်းဖက်ဝါဒ သတင်းတွေဟာ လူထုရဲ့ စိတ်ကို ထိခိုက်စေပါတယ်။ ခိုလှုံခွင့်တောင်းခံသူ တစ်ယောက်က ပစ်ခတ်မှု ကျူးလွန်တယ် ဆိုတဲ့ ခေါင်းစဉ်မျိုး (သို့) ပိတ်ဆို့ခံထားရတဲ့ အစိုးရနဲ့ ပတ်သက်သူတွေက ငွေကြေးခဝါချဖို့ ဝင်ရောက်လာတယ် ဆိုတဲ့ သတင်းမျိုး မြင်ရတဲ့အခါ အမေရိကန်တွေက "တော်ပါတော့" လို့ ပြောချင်ကြတာ နားလည်ပေးလို့ ရပါတယ်။',
      'ဒုက္ခသည် တစ်ယောက်အနေနဲ့ အဲဒီလို ပြောချင်တဲ့ စိတ်ဆန္ဒကို လစ်လျူရှုဖို့ ကျွန်တော် မတိုက်တွန်းပါဘူး။ ကျွန်တော်တို့လည်း အဲဒီလိုပဲ ခံစားရပါတယ်။',
      'စစ်ကောင်စီ ခရိုနီတွေ က ကျွန်တော်တို့ရဲ့ အသိုင်းအဝိုင်းတွေကို သူတို့ရဲ့ ခိုလှုံရာ (Safe Havens) (သို့) ပိတ်ဆို့မှု ရှောင်ရှားရာ နောက်ဖေးပေါက်တွေအဖြစ် သုံးနေတာကို ကျွန်တော်တို့ လုံးဝ မလိုလားပါဘူး။ အမေရိကန်ရဲ့ တံခါးဖွင့်ဝါဒကို အခွင့်ကောင်းယူပြီး အမေရိကန်တွေကို ဒုက္ခပေးမယ့် ဘယ်သူ့ကိုမှ (မြန်မာဖြစ်စေ၊ တခြားဖြစ်စေ) ကျွန်တော်တို့ သည်းမခံပါဘူး။ "ပုပ်နေတဲ့ ပန်းသီး" တစ်လုံးကြောင့် တည်ငြိမ်အေးချမ်းစွာ နေထိုင်နေကြတဲ့ ထောင်ပေါင်းများစွာသော ဘဝတွေ အရိပ်မည်း ဖုံးသွားတတ်တာကိုလည်း ကျွန်တော်တို့ ကောင်းကောင်း သိပါတယ်။',
      'ဒါပေမဲ့ အဖြေကတော့... ဥယျာဉ်တစ်ခုလုံးကို ခုတ်လှဲပစ်လိုက်ဖို့ မဟုတ်ပါဘူး။',
      'လုပ်သင့်တာတွေက -',
    ],
    bullets: [
      'ပိတ်ဆို့မှု ရှောင်ရှားသူတွေကို လိုက်လံ ဖော်ထုတ်ပါ (Sanctions evasion should be hunted down). အထူးသဖြင့် ဟန်ပြကုမ္ပဏီတွေ၊ Crypto အကောင့်တွေနဲ့ အိမ်ခြံမြေ ဈေးကွက်တွေကနေတဆင့် လုပ်ဆောင်နေတာတွေကို ဖော်ထုတ်ပါ။',
      'အကောက်ခွန်နှင့် နယ်စပ်ကာကွယ်ရေး (CBP) ဖောင်တွေမှာ လိမ်ညာသူတွေ၊ ကြီးလေးတဲ့ ရာဇဝတ်မှု ကျူးလွန်သူတွေ (သို့) အန္တရာယ် ရှိသူတွေကို တရားစွဲပြီး လိုအပ်ရင် နေရပ်ပြန်ပို့ပါ။',
      'စစ်ကောင်စီလက်က ထွက်ပြေးလာတဲ့ ကျွန်တော်တို့ အများစုကလည်း အဲဒါကိုပဲ လိုလား ပါတယ်။ ရာဇဝတ်ကောင် တစ်သိုက်ဆီကနေ အသက်လု ထွက်ပြေးလာပြီးမှ၊ ဒီမှာ သူတို့ထက် နည်းနည်း ပိုယဉ်ကျေးတဲ့၊ ဝတ်ကောင်းစားလှ ဝတ်ထားတဲ့ ရာဇဝတ်ကောင် နောက်တစ်သိုက်ရဲ့ လက်အောက်မှာ မနေချင်ပါဘူး။',
    ],
    closing: 'နယ်စပ်လုံခြုံရေးနဲ့ ဒုက္ခသည် ကာကွယ်စောင့်ရှောက်ရေး ဆိုတာ ဆန့်ကျင်ဘက်တွေ မဟုတ်ပါဘူး။ ဥပဒေ စိုးမိုးပြီး၊ အားနည်းသူတွေကို အမြတ်မထုတ်ဘဲ ကာကွယ်ပေးတဲ့ လူ့ဘောင်အဖွဲ့အစည်း တစ်ခုကို တည်ဆောက်ခြင်း ဆိုတဲ့ စီမံကိန်းကြီး တစ်ခုတည်းရဲ့ အစိတ်အပိုင်း နှစ်ခုသာ ဖြစ်ပါတယ်။ ________________',
  },
  {
    title: 'မျက်နှာစာ တစ်ခုမှာတော့ အစိုးရဟာ မှန်ကန်တဲ့ ဦးတည်ချက်အတိုင်း ရွေ့လျားနေပါတယ်။ အဲဒါကတော့ မြန်မာနိုင်ငံ အပါအဝင် အရှေ့တောင်အာရှက ကျားဖြန့် အခြေစိုက်စခန်းတွေကို ပစ်မှတ်ထားမယ့် Scam Centre Strike Force ဖွဲ့စည်းလိုက်ခြင်းပါပဲ။',
    paragraphs: [
      'ဒါဟာ စစ်မှန်တဲ့ ခေါင်းဆောင်မှုပါပဲ။ ကျားဖြန့်စခန်းတွေဟာ လူကုန်ကူးခံရသူတွေကို နှိပ်စက်ပြီး၊ သားကောင်တွေ (အမေရိကန် ပြည်သူတွေ အပါအဝင်) ဆီကနေ ဒေါ်လာ ဘီလီယံပေါင်းများစွာ လိမ်ယူနေတာပါ။ သူတို့ကို နှိမ်နင်းတာဟာ အလှူဒါန မဟုတ်ပါဘူး။ အရေးကြီးတဲ့ အမျိုးသားလုံခြုံရေးနဲ့ စီးပွားရေး ဦးစားပေး လုပ်ငန်းစဉ် ဖြစ်ပါတယ်။',
      'ဒါပေမဲ့ အရေးကြီးတဲ့ နောက်တဆင့် ကျန်ပါသေးတယ် - မှန်ကန်တဲ့ မိတ်ဆွေကို ရွေးချယ်ဖို့ပါ။',
      'အကယ်၍ ဝါရှင်တန်က "ပူးပေါင်းဆောင်ရွက်ရေး" အတွက် စစ်ကောင်စီကို အဓိက အားကိုးမယ် ဆိုရင် ရလာမယ့် အရာတွေကတော့ -',
      '* ဟန်ပြစီးနင်းမှုတွေနဲ့ ဓာတ်ပုံရိုက်ပွဲတွေ (Photo-ops)၊',
      '* အောက်ခြေအဆင့် ပြစ်ဒဏ်ခံ ကောင်လေးတွေ (Scapegoats)၊',
      '* ပြီးတော့ သတိထား ကန့်သတ်ထားတဲ့ ပိုင်ဆိုင်မှု သိမ်းဆည်းခြင်းတွေပဲ ဖြစ်ပါလိမ့်မယ်။',
      'အကယ်၍ ဒေသခံ တော်လှန်ရေး အင်အားစုတွေ (ဥပမာ - KNU၊ NUG ဆက်စပ် အဖွဲ့အစည်းတွေနဲ့ နယ်မြေစိုးမိုးမှုရော တရားဝင်မှုပါ ရှိတဲ့ EROs တွေ) နဲ့ ပူးပေါင်းဆောင်ရွက်မယ် ဆိုရင်တော့ Strike Force အနေနဲ့ အောက်ပါတို့ကို လုပ်ဆောင်နိုင်ပါလိမ့်မယ် -',
      '* ကျားဖြန့် ကွန်ရက်တွေကို ပိုမိုတိကျစွာ မြေပုံဖော်နိုင်မယ်။',
      '* အမြတ်ငွေ စီးဆင်းနေတဲ့ Crypto ပိုက်လိုင်း တွေကို ဖြတ်တောက်နိုင်မယ်။',
      '* ကွင်းဆက်တွေကို လိုက်ပြီး စစ်တပ်၊ ရဲ နဲ့ ပြည်သူ့စစ် စပွန်ဆာတွေ၊ နိုင်ငံဖြတ်ကျော် ရာဇဝတ်ကောင်တွေ အထိ ဖော်ထုတ်နိုင်မယ်။',
      'စဉ်းစားကြည့်ပါ... ကျားဖြန့်လုပ်ငန်းတွေဆီကနေ သိမ်းဆည်းရမိတဲ့ Crypto ပိုင်ဆိုင်မှု ဘီလီယံပေါင်းများစွာထဲက တစိတ်တပိုင်းကို တရားမျှတမှုအတွက် မဟာဗျူဟာမြောက် Crypto ရန်ပုံငွေ (Strategic Crypto Reserve for Justice) အဖြစ် ထားရှိပြီး၊ သားကောင်တွေကို လျော်ကြေးပေးတာ၊ လူကုန်ကူးခံရသူတွေကို ပြန်လည်ထူထောင်ပေးတာ၊ ပြီးတော့ တနေ့ကျရင် ဒီမိုကရေစီ မြန်မာနိုင်ငံကို ပြန်လည်တည်ဆောက်ရာမှာ ကူညီပေးတာတွေ လုပ်နိုင်ရင် ဘယ်လောက် ကောင်းမလဲ။',
      'အဲဒါမှ တကယ့် "လက်တွေ့နိုင်ငံရေး (Realpolitik)" ပါ။ ခိုးရာပါ ပစ္စည်းတွေကို တာဝန်ခံမှု ရှိစေမယ့် လက်နက်အဖြစ် ပြောင်းလဲလိုက်တာပါ။ ကျားဖြန့် အင်ပါယာကို တည်ထောင်ခဲ့တဲ့ သူတွေလက်ထဲ ပြန်ထည့်ပေးလိုက်တာမျိုး မဟုတ်ပါဘူး။',
      '________________',
    ],
  },
  {
    title: 'နောက်ထပ် တိတ်ဆိတ်ပြီး ညစ်ပတ်နေတဲ့ ကိစ္စတစ်ခုကတော့ - ရှားပါးမြေသား (Rare Earths) နဲ့ အရေးပါတဲ့ သတ္တုတွင်းထွက်များ ပါပဲ။',
    paragraphs: [
      'မြန်မာပြည် မြောက်ပိုင်းမှာ လျှပ်စစ်ကားတွေ၊ လေအားလျှပ်စစ် တာဘိုင်တွေ၊ F-22 လေယာဉ်တွေနဲ့ အဆင့်မြင့် မိုက်ခရိုပရိုဆက်ဆာတွေအတွက် လိုအပ်တဲ့ ရှားပါးမြေသားတွေ အများအပြား ရှိပါတယ်။ ဒီနေ့ခေတ်မှာ အဲဒီ ထုတ်လုပ်မှု အများစုဟာ -',
      '* သဘာဝပတ်ဝန်းကျင်ကို ဆိုးရွားစွာ ပျက်စီးစေတယ်၊',
      'ဒါပေမဲ့ ဒါဟာ မှားယွင်းတဲ့ ဖြတ်လမ်းနည်း ပါ။ စစ်ရာဇဝတ်မှုတွေ၊ မြေသိမ်းမှုတွေနဲ့ ရာဇဝတ်ဂိုဏ်းတွေကတဆင့် လာတဲ့ ထောက်ပံ့ရေးကွင်းဆက် (Supply Chain) ဟာ မဟာဗျူဟာမြောက် ပိုင်ဆိုင်မှု (Asset) မဟုတ်ပါဘူး၊ ဝန်ထုပ်ဝန်ပိုး (Liability) သာ ဖြစ်ပါတယ်။ အဲဒါက ကျိုးပဲ့လွယ်တယ်၊ ခြိမ်းခြောက်ခံရလွယ်တယ်၊ ပြီးတော့ ကိုယ်ကျင့်တရားကို ပျက်စီးစေပါတယ်။',
      'ပိုပြီး ဉာဏ်ရှိတဲ့ နည်းလမ်းကတော့ -',
    ],
    bullets: [
      'ပြည်သူ့စစ်တွေ၊ ခရိုနီတွေ (သို့) နိုင်ငံခြား ပွဲစားတွေက ထိန်းချုပ်ထားတယ်၊',
      'ပြီးတော့ စစ်ကောင်စီရဲ့ စစ်စီးပွားရေးနဲ့ ပေကျင်းရဲ့ မဟာဗျူဟာ ကွန်ရက်တွေထဲမှာ နက်နက်ရှိုင်းရှိုင်း ရှုပ်ထွေးနေပါတယ်။',
      'ဝါရှင်တန်က တချို့လူတွေက တွေးမိကောင်း တွေးမိပါလိမ့်မယ် - "တရုတ်ရဲ့ လက်ဝါးကြီးအုပ်မှုကို ဖြိုခွင်းနိုင်မယ် ဆိုရင်တော့ မပြည့်စုံတဲ့ မိတ်ဖက် (စစ်ကောင်စီ) နဲ့ တွဲလုပ်တာကို သည်းခံနိုင်ပါတယ်" လို့။',
      'သဘာဝပတ်ဝန်းကျင်နဲ့ အလုပ်သမား စံနှုန်းတွေကို လိုက်နာနိုင်တဲ့ မဟာမိတ် စီးပွားရေး နိုင်ငံတွေ (မလေးရှား၊ ထိုင်း၊ ဂျပန်၊ တောင်ကိုရီးယား၊ ဩစတြေးလျ) နဲ့ သန့်စင်ရေး (Refining) ပူးပေါင်းဆောင်ရွက်မှုတွေ တည်ဆောက်ပါ။',
      'စစ်ကောင်စီ ဆက်စပ် ရှားပါးမြေသား တင်ပို့မှုတွေကို အပေးအယူ ပစ္စည်းအဖြစ် မသတ်မှတ်ဘဲ အန္တရာယ်များပြီး ပိတ်ဆို့သင့်တဲ့ အရာအဖြစ် သတ်မှတ်ပါ။',
      'နောက်တစ်ကြိမ် ပြောပါရစေ - ရွေးချယ်စရာက "စင်ကြယ်ခြင်း" နဲ့ "လက်တွေ့ကျခြင်း" ကြားမှာ မဟုတ်ပါဘူး။ "ရာဇဝတ်ကောင်တွေရဲ့ ထိန်းချုပ်မှုကို ပိုခိုင်မာစေတဲ့ ရေတိုသဘောတူညီချက်များ" နဲ့ "မှီခိုအားထားရမှုနဲ့ မတည်ငြိမ်မှုတွေကို လျှော့ချပေးမယ့် ရေရှည် အစီအစဉ်များ" ကြားက ရွေးချယ်စရာသာ ဖြစ်ပါတယ်။',
    ],
    closing: '________________',
  },
  {
    title: 'အဲဒီ လွှတ်တော်ကြားနာပွဲ ခေါင်းစဉ်ဖြစ်တဲ့ "ထွက်ပေါက်မရှိသော မဟာဗျူဟာ - မြန်မာ့အဆုံးမဲ့ အကျပ်အတည်းနှင့် အမေရိကန်၏ အကန့်အသတ်ရှိသော ရွေးချယ်စရာများ" ဆိုတာ အဝေးကကြည့်ရင်တော့ မှန်သလို ရှိပါတယ်။ ဝေးလံတဲ့ နေရာက ဖြေရှင်းရခက်တဲ့ ပဋိပက္ခတစ်ခု လိုပေါ့။',
    paragraphs: [
      'ဒါပေမဲ့ "အဆုံးမဲ့ (Endless)" ဆိုတာ စစ်ကောင်စီရဲ့ စီမံကိန်း သာ ဖြစ်ပြီး၊ ကျွန်တော်တို့ရဲ့ ကံကြမ္မာ မဟုတ်ပါဘူး။',
      'ကျွန်တော် စစ်အာဏာရှင် လက်အောက်မှာ ကြီးပြင်းခဲ့ရသူပါ။ "အဆုံးမဲ့ အကျပ်အတည်း" ဆိုတဲ့ ခေါင်းစဉ်ကို စစ်တပ်ကိုယ်တိုင်က အရင်ကတည်းက သုံးခဲ့တာကို ကျွန်တော် မြင်ဖူးပါတယ်။ "ဘာမှ လုပ်လို့မရဘူး၊ တိုင်းပြည်က အရမ်း ကွဲပြားလွန်းတယ်၊ ပြည်သူတွေက စိတ်လိုက်မာန်ပါ များလွန်းတယ်၊ တပ်မတော်ရဲ့ စည်းကမ်းရှိတဲ့ ဒီမိုကရေစီကို လက်ခံတာက ပိုကောင်းတယ်" ဆိုပြီး သူတို့ ပြောလေ့ရှိပါတယ်။',
      'အကယ်၍ အမေရိကန် အဖွဲ့အစည်းတွေကသာ ဒီဝါဒကို လက်ခံလိုက်ရင် ဗိုလ်ချုပ်တွေ နှစ်ခါနိုင်သွားပါလိမ့်မယ် - ပြည်တွင်းမှာ အတိုက်အခံတွေကို နှိပ်ကွပ်ခွင့်ရသွားသလို၊ ပြည်ပမှာလည်း သူတို့ထက် ပိုကောင်းတာ ဘာမှမရှိဘူးလို့ နိုင်ငံတကာကို ယုံကြည်သွားစေပါလိမ့်မယ်။',
      'ဒါပေမဲ့ အမှန်တရားကတော့ ပိုခက်ခဲပေမယ့် မျှော်လင့်ချက် ရှိပါတယ် -',
    ],
    bullets: [
      'ဗုံးဒဏ်တွေအောက်မှာပဲ ဒေသခံတွေက ကျောင်းတွေ၊ ဆေးပေးခန်းတွေ၊ တရားစီရင်ရေး စနစ်တွေကို တည်ဆောက်နေကြပါပြီ။',
      'NUG ဟာ မစုံလင်သေးပေမယ့် ဗမာနဲ့ တိုင်းရင်းသား ခေါင်းဆောင်မှုတွေကို စုစည်းဖို့ ရှားပါးတဲ့ နိုင်ငံတည်ဆောက်ရေး ကြိုးပမ်းမှုတစ်ခု ဖြစ်ပါတယ်။',
      'ဒီအကျပ်အတည်းဟာ သဘာဝအရ "အဆုံးမဲ့" နေတာ မဟုတ်ပါဘူး။ ရည်ရွယ်ချက်ရှိရှိ ဆွဲဆန့်ထားလို့ ရှည်ကြာနေတာပါ။ အမေရိကန်ပြည်ထောင်စု၊ အာဆီယံ နဲ့ မြန်မာပြည်သူတွေရဲ့ ရွေးချယ်မှုတွေကသာ ဒါကို တိုတောင်းသွားစေနိုင်မှာ ဖြစ်ပါတယ်။',
    ],
    closing: '________________',
  },
  {
    title: 'ကျွန်တော် ဒီစာကိုရေးတာ လက်ရှိ အစိုးရကို တိုက်ခိုက်ဖို့ ရေးတာ မဟုတ်ပါဘူး။ ဒီအစိုးရမှာ တခြားသူတွေ မရှိခဲ့တဲ့ "သြဇာအာဏာ (Leverage)" ရှိတယ် ဆိုတာကို သိတဲ့သူ တစ်ယောက်အနေနဲ့ ရေးတာပါ။ ဒီအစိုးရ အနေနဲ့ -',
    paragraphs: [
      '* အတုအယောင် ရွေးကောက်ပွဲကို ရှုတ်ချဖို့နဲ့ အထူးကိုယ်စားလှယ် ခန့်အပ်ဖို့ တောင်းဆိုထားတဲ့ ကွန်ဂရက်လွှတ်တော်ရဲ့ ပါတီစုံ သဘောထားနဲ့ တသားတည်း ရပ်တည်နိုင်ပါတယ်။',
      '* တရားဝင် ဒေသခံ အင်အားစုတွေနဲ့ လက်တွဲပြီး Scam Centre Strike Force စစ်ဆင်ရေးတွေကို ပိုတင်းကြပ်နိုင်ပါတယ်။',
      '* စစ်ကောင်စီ ဝါဒဖြန့်လို့ မရအောင် TPS ရပ်စဲမှု ခေါင်းစဉ်တပ်ပုံ (Framing) ကို ပြောင်းလဲနိုင်ပါတယ်။',
      '* စစ်ကောင်စီနဲ့ ဆက်စပ်တဲ့ သတ္တုတွင်းထွက်တွေနဲ့ ကျားဖြန့်တွေကို "ထွန်းသစ်စ ဈေးကွက် အခွင့်အလမ်းတွေ" အဖြစ် မဟုတ်ဘဲ ရေဒီယိုသတ္တိကြွ ပစ္စည်းတွေလို (အန္တရာယ်ရှိတဲ့ အရာတွေလို) သဘောထားဖို့ မဟာမိတ်တွေနဲ့ စီးပွားရေးလုပ်ငန်းတွေကို ဖိအားပေးနိုင်ပါတယ်။',
      'အကယ်၍သာ ဒီအရာတွေကို လုပ်ဆောင်ခဲ့မယ်ဆိုရင်... အမေရိကန်ရဲ့ အာဏာစွမ်းပကားကို သုံးပြီး မြန်မာ့အဆုံးမဲ့ အကျပ်အတည်းကို ဒီအတိုင်း စီမံခန့်ခွဲနေရုံ (Manage) မဟုတ်ဘဲ တိုတောင်းသွားအောင် (Shorten) လုပ်နိုင်မယ်ဆိုရင်... အမေရိကန်ကို ပိုလုံခြုံစေရုံတင် မကပါဘူး။ သမိုင်းဝင်မယ့် အလုပ်တစ်ခုကို လုပ်လိုက်တာ ဖြစ်ပါလိမ့်မယ်။',
      'ကျွန်တော် လှောင်ပြောင်ပြီး ပြောနေတာ မဟုတ်ပါဘူး -',
      'အကယ်၍ ဒီအစိုးရကသာ မြန်မာနိုင်ငံမှာ စစ်မှန်တဲ့ နိုင်ငံရေး အဖြေတစ်ခု (ဒေါ်စု လွတ်မြောက်ရေး၊ အစုလိုက်အပြုံလိုက် သတ်ဖြတ်မှုတွေ ရပ်တန့်ရေး၊ ဖက်ဒရယ် ဒီမိုကရေစီ လမ်းကြောင်းပေါ် ပြန်ရောက်ရေး) ကို ဆောင်ကြဉ်းပေးနိုင်မယ်ဆိုရင်... ကမ္ဘာတစ်ဝန်းက မြန်မာပြည်သူတွေ တန်းစီပြီး သမ္မတ ထရမ့်ကို ငြိမ်းချမ်းရေး နိုဘယ်ဆုအတွက် အမည်စာရင်း တင်သွင်းကြတာကို မြင်တွေ့ရပါလိမ့်မယ်။',
      'ကျွန်တော်တို့ တိုင်းပြည်ကို ဘယ်သူက ကယ်တင်မလဲ ဆိုတာ ကျွန်တော်တို့ ဇီဇာမကြောင်ပါဘူး။ အလုပ်ပြီးမြောက်ဖို့ကိုပဲ ကျွန်တော်တို့ ဂရုစိုက်ပါတယ်။',
      '________________',
    ],
  },
  {
    title: 'သမ္မတရဲ့ ကြက်ဆင်တွေကတောင် ကျွန်တော်တို့ထက် ပိုပြီး ဘေးကင်းလုံခြုံမှု ရှိနေတယ်ဆိုတာ မြန်မာ TPS သမားတွေကြားမှာ ရယ်စရာတစ်ခု ဖြစ်နေပေမယ့် ဒါဟာ နာကျင်စရာ ဟာသတစ်ခုပါ။',
    paragraphs: [
      'ဒါပေမဲ့ ကျွန်တော့်ဘဝကို ပြန်ကြည့်တဲ့အခါ - ရွှေဖရုံသီးမုန့် (Pumpkin Pie) နောက်ဆုံးတစ်စိတ်ကို ဇွတ်ခေါ်ကျွေးခဲ့တဲ့ Wooster က မိသားစုကနေ၊ အခုနောက်ပိုင်း ရောက်လာသူတွေအတွက် စားနပ်ရိက္ခာ လိုက်စုပေးနေတဲ့ မြန်မာ-အမေရိကန် အန်တီကြီးတွေအထိ မြင်ယောင်မိတဲ့အခါ - အစိုးရမှတ်တမ်း (Federal Register) တစ်စောင်တည်းနဲ့ ဒီနိုင်ငံကို အကဲမဖြတ်လိုပါဘူး။',
      'သမ္မတ ရေဂင် ပြောခဲ့တဲ့ အမေရိကန်ကို ကျွန်တော် မြင်နေပါသေးတယ်။ အဲဒါကတော့ "ကမ္ဘာ့ဘယ်ထောင့်ကပဲ လာလာ အမေရိကန် ဖြစ်လာနိုင်တယ်" ဆိုတဲ့ အချက်ပါပဲ။ အဲဒီ အယူအဆဟာ ဘယ်ပါတီ၊ ဘယ် DHS မူဝါဒ၊ ဘယ်လို ပထဝီနိုင်ငံရေး မောပန်းနွမ်းနယ်မှုတွေထက်မဆို ပိုပြီး အားကောင်းပါတယ်။',
      '"Peace through strength" (အင်အားဖြင့် ငြိမ်းချမ်းရေး ရယူမည်) ဆိုတာ နိုင်ငံခြားရေး မူဝါဒမှာ သုံးလေ့ရှိတဲ့ စကားပါ။ သမ္မတ ရေဂင်ရဲ့ အမေရိကန်ကို ယုံကြည်ဆဲ ကျွန်တော်တို့အတွက်ကတော့ "အင်အားနှင့် ဉာဏ်ပညာဖြင့် ငြိမ်းချမ်းရေး ရယူခြင်း (Peace through strength and wisdom)" လိုအပ်ပါတယ် -',
      '* အင်အား - လူကုန်ကူးသူတွေ၊ အကြမ်းဖက်သမားတွေနဲ့ စစ်တပ်ခရိုနီတွေကို တံခါးပိတ်ထားနိုင်တဲ့ အင်အား။',
    ],
    bullets: [
      'အင်အား - "တည်ငြိမ်မှု" ဆိုတာ ဘာလဲဆိုတာကို အာဏာရှင်တွေ လော်ဘီလုပ်ပြီး အဓိပ္ပာယ်ဖွင့်ခွင့် မပေးတဲ့ အင်အား။',
      'ဉာဏ်ပညာ - ကွန်ဂရက် လွှတ်တော်ရဲ့ သတိပေးချက်တွေ၊ မဟာမိတ်တွေနဲ့ စုံစမ်းစစ်ဆေးမှုတွေကို နားထောင်ပြီး၊ စစ်မှန်တဲ့ ပြုပြင်ပြောင်းလဲမှု (Genuine Reform) မရှိဘဲ ဟန်ဆောင်ခြင်း (Performance) သက်သက်ကို ဆုမချတဲ့ ဉာဏ်ပညာ။',
      'ဉာဏ်ပညာ - TPS ဆိုတာ ယာယီဖြစ်ပေမယ့်၊ လူ့အသက်ရဲ့ တန်ဖိုးကတော့ ယာယီ မဟုတ်ဘူး ဆိုတာကို သတိရတဲ့ ဉာဏ်ပညာ။',
      'အကယ်၍ ဒီနှစ် ကျေးဇူးတော်နေ့ရဲ့ ဇာတ်လမ်းက "ကြက်ဆင်တွေ ကယ်တင်ခံရတယ်၊ ဒုက္ခသည်တွေ ပြည်နှင်ဒဏ် ခံရတယ်၊ ဘာလို့လဲဆိုတော့ စစ်ကောင်စီက အခြေအနေ ကောင်းသွားပြီလို့ ပြောလို့" ဆိုတာလောက်ပဲ ဖြစ်မယ်ဆိုရင်... အမေရိကန်ရဲ့ စမ်းသပ်မှုကြီး (American Experiment) မှာ တစ်ခုခု မှားယွင်းသွားပါပြီ။',
    ],
    closing: 'အကယ်၍ ဇာတ်လမ်းက "ကြက်ဆင်တွေ လွတ်ငြိမ်းခွင့်ရတယ်၊ ဒုက္ခသည်တွေ အသံကို နားထောင်ပေးတယ်၊ စစ်ကောင်စီကို ဖော်ထုတ်တယ်၊ ကျားဖြန့်စခန်းတွေကို ဖြိုခွင်းတယ်၊ ညစ်ပတ်တဲ့ ကုန်သွယ်မှုတွေကို ဖြတ်တောက်တယ်" လို့ ပြောင်းလဲသွားမယ်ဆိုရင်တော့... အမေရိကန်ဟာ သူ့ရဲ့ နယ်စပ်တွေကို ကာကွယ်ရုံထက် ပိုပါလိမ့်မယ်။ သမ္မတ ရေဂင် ယုံကြည်ခဲ့တဲ့ အယူအဆအတိုင်း နောက်တစ်ကြိမ် ပြန်လည် ရှင်သန်လာတာ ဖြစ်ပါလိမ့်မယ်။ "ကမ္ဘာ့ဘယ်ထောင့်က ဘယ်သူမဆို" သူတို့ရဲ့ အနာဂတ်ကို ဒီမှာ ပုံအောရဲကြတာဟာ အမေရိကန်က ပြည့်စုံလွန်းလို့ မဟုတ်ပါဘူး။ အားလုံးကို ပါဝင်ခွင့်ပေးပြီး (Inclusive)၊ မူဝါဒ ခိုင်မာကာ၊ သက်တောင့်သက်သာ ရှိမှုထက် သတ္တိတရားကို ရွေးချယ်နိုင်စွမ်း ရှိသေးလို့ ဖြစ်ပါတယ်။ မြန်မာ့ အကျပ်အတည်းဟာ ကျွန်တော့် တသက်တာလုံး - ကျွန်တော့် အဖေ၊ ကျွန်တော့် အဘိုး လက်ထက်ကတည်းက - မျိုးဆက် ၃ ဆက်တိုင်အောင် ကြာမြင့်ခဲ့ပါပြီ။ အဆုံးမဲ့လို့ ခံစားရတာ သဘာဝပါပဲ။ ဒါပေမဲ့ "အဆုံးမဲ့" ဆိုတာ အခြေအနေကို ဖော်ပြချက် (Description) သာ ဖြစ်ပြီး၊ ကံကြမ္မာ (Destiny) မဟုတ်ပါဘူး။ လုံလောက်တဲ့ အင်အား၊ ဉာဏ်ပညာ နဲ့ Midwestern သားတွေရဲ့ ကြင်နာမှု နည်းနည်း သာ ရှိမယ်ဆိုရင်... ဒီအကျပ်အတည်းဟာ ကျွန်တော်တို့ မျိုးဆက်မှာတင် အဆုံးသတ်သွားနိုင်ပါတယ်။ ဒီအစိုးရ လက်ထက်မှာတင် ဖြစ်ချင် ဖြစ်နိုင်ပါတယ်။',
  },
];

const contentByLanguage: Record<'en' | 'my', LanguageContent> = {
  en: {
    label: 'English',
    headTitle: 'Pardoning Turkeys, Deporting Dreams | Burmese TPS Op-Ed',
    headDescription: 'A Burmese refugee’s plea for a kinder, wiser American leadership as TPS for Burma sunsets.',
    heroTag: 'Pardoning Turkeys, Deporting Dreams',
    heroTitle: 'A Burmese Refugee’s Plea for a Kinder, Wiser American Leadership',
    heroSubtitle:
      'How a Thanksgiving tradition of mercy collides with the decision to end Temporary Protected Status for Burma—and why the narrative America chooses matters for refugees, democracy, and national security alike.',
    author: 'Burmese TPS Holder & Refugee Advocate',
    authorNote: 'Writing from lived experience across Burma and the American Midwest.',
    thesis: 'Mercy should extend beyond turkeys',
    thesisNote: 'Ending TPS without honest framing risks handing the junta propaganda and real human lives.',
    readTime: '12 minutes',
    docLink: 'https://docs.google.com/document/d/1EeBxEaGfnpwbr6mmQ-ZVkB-yrvlOEO-9D0e85Ao4gQs/edit?usp=sharing',
    tweetText: 'Pardoning Turkeys, Deporting Dreams – a Burmese refugee’s plea for kinder, wiser leadership on TPS for Burma.',
    introParagraphs: englishIntroParagraphs,
    sections: englishSections,
    shareHeadline: 'Help keep Burmese families safe and heard',
    shareBody:
      'If this perspective resonates, please share it with policymakers, journalists, and community leaders. The story America tells about TPS will shape real lives—and the future of democracy in Burma.',
  },
  my: {
    label: 'မြန်မာဘာသာ',
    headTitle: 'ကြက်ဆင်တွေကို လွတ်ပေး၊ လူတွေကို ပြန်ပို့မလား | မြန်မာ TPS ဆောင်းပါး',
    headDescription:
      'သင်္ကေတကြက်ဆင်တွေကို လွတ်ပေးနေချိန် မြန်မာ TPS ရပ်စဲရေးမှာ ကိုယ်တွေ့အတွေ့အကြုံနဲ့ ခွင့်တောင်းသံ.',
    heroTag: 'ကြက်ဆင်တွေ လွတ်၊ ဒုက္ခသည်တွေ နောက်ပြန်ပို့?',
    heroTitle: 'မြန်မာ TPS ရပ်စဲမှုကို ရိုးသားတင်းကြပ်စွာ စဉ်းစားပေးပါ',
    heroSubtitle:
      'Thanksgiving ကရုဏာအမွန်အတရားနဲ့ ရိုက်ပျက်နေတဲ့ TPS ရပ်စဲခြင်းကြားက ကြားမြင်တွေ့ရှိချက်တွေကို မြန်မာဘာသာနဲ့ ဖော်ပြထားပါတယ်။',
    author: 'မြန်မာ TPS ကိုင်ဆောင်သူ၊ ဒုက္ခသည်အခွင့်အရေး ကြိုးပမ်းသူ',
    authorNote: 'မြန်မာပြည်နဲ့ အမေရိကန် Midwest လောကကြားမှာ ရှေ့ဆက်နေသူတစ်ယောက်ရဲ့ အသံ။',
    thesis: 'ကရုဏာကို ကြက်ဆင်တွေပေါ်မှာပဲ မရပ်သင့်ဘူး',
    thesisNote: 'မြန်မာပြည် လုံခြုံသွားပြီလို့ မှားယွင်းထင်မြင်ပြီး TPS ရပ်စဲခြင်းဟာ စစ်ကောင်စီရဲ့ ဝါဒဖြန့်ချိမှုကို အားပေးစေပါလိမ့်မယ်။',
    readTime: '၁၂ မိနစ်',
    docLink: 'https://docs.google.com/document/d/1XJUT7r_08mB0SIlFu8fPCJqHvnSzVpNFRcmcPYSwyM4/edit?usp=sharing',
    tweetText:
      'ကြက်ဆင်တွေကို လွတ်ပေးနေချိန် မြန်မာ TPS ကို ရပ်စဲတာ ဘာကြောင့် အန္တရာယ်ရှိနေသလဲ ဆိုတာ ဖော်ပြတဲ့ ဆောင်းပါးကို ဖတ်ပေးပါ။',
    introParagraphs: burmeseIntroParagraphs,
    sections: burmeseSections,
    shareHeadline: 'မြန်မာ့အသံ မပျက်စေဖို့ မျှဝေကြစို့',
    shareBody:
      'မြန်မာ TPS ရပ်စဲမှုရဲ့ ကိုယ်တိုင်ခံစားချက်နဲ့ အန္တရာယ်တွေကို တိုးတက်စွာ ပြောပြထားပါတယ်။ မဲပေးခွင့်ရှိသူတွေ၊ မူဝါဒပေါင်းစပ်သူတွေ ဆီကို မျှဝေဖို့ တောင်းဆိုအပ်ပါတယ်။',
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
                {languageOrder.map((lang) => (
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
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-200">{content.heroTag}</p>
              <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">{content.heroTitle}</h1>
              <p className="max-w-3xl text-lg text-slate-200 sm:text-xl">{content.heroSubtitle}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-indigo-100/80">
                <span className="rounded-full bg-indigo-500/20 px-3 py-1 font-semibold text-indigo-100">Opinion</span>
                <span className="rounded-full bg-white/10 px-3 py-1">November</span>
                <Link
                  href={content.docLink}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 font-semibold text-indigo-100 transition hover:border-indigo-300/60 hover:text-white"
                  target="_blank"
                  rel="noreferrer"
                >
                  {language === 'en' ? 'View original document' : 'မူလစာရွက်ကို ကြည့်ရှုရန်'}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14.25 9.75h6m0 0v-6m0 6L12 3 3.75 11.25M9.75 14.25h-6m0 0v6m0-6L12 21l8.25-8.25" />
                  </svg>
                </Link>
              </div>
            </div>
            <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur sm:grid-cols-3 sm:gap-6">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-200">{language === 'en' ? 'Author' : 'ရေးသူ'}</p>
                <p className="text-base font-semibold text-white">{content.author}</p>
                <p className="text-sm text-slate-200">{content.authorNote}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-200">{language === 'en' ? 'Thesis' : 'အဓိကအကြောင်းအရာ'}</p>
                <p className="text-base font-semibold text-white">{content.thesis}</p>
                <p className="text-sm text-slate-200">{content.thesisNote}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-200">{language === 'en' ? 'Read time' : 'ဖတ်ရှုချိန်'}</p>
                <p className="text-base font-semibold text-white">{content.readTime}</p>
                <p className="text-sm text-slate-200">{language === 'en' ? 'Structured for policy staff, advocates, and concerned Americans.' : 'မူဝါဒဆိုင်ရာ လူများ၊ လှုပ်ရှားသူများ အတွက် ရိုးရှင်းစွာ တိကျစွာ ဖော်ပြထားသည်။'}</p>
              </div>
            </div>
          </header>
        </div>

        <div className="relative -mt-10 lg:-mt-16">
          <div className="mx-auto max-w-5xl space-y-14 px-6 pb-20 sm:px-10">
            <section className="rounded-3xl border border-white/10 bg-white/5 px-6 py-8 shadow-2xl shadow-indigo-500/10 backdrop-blur-sm sm:px-10 sm:py-12">
              <div className="space-y-5 text-lg leading-relaxed text-slate-100">
                {content.introParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>

            {content.sections.map((section) => (
              <article key={section.title} className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-2xl shadow-slate-900/40 ring-1 ring-white/5 backdrop-blur sm:p-10">
                <div className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/30 text-sm font-semibold text-indigo-100">
                    ●
                  </span>
                  <div className="space-y-4">
                    <header className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-200">{language === 'en' ? 'Section' : 'အပိုင်း'}</p>
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
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-100">{language === 'en' ? 'Share the op-ed' : 'ဆောင်းပါးကို မျှဝေပါ'}</p>
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
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14.25 9.75h6m0 0v-6m0 6L12 3 3.75 11.25" />
                      </svg>
                    </Link>
                    <Link
                      href={tweetUrl}
                      className="inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-3 text-white transition hover:-translate-y-0.5 hover:border-white hover:bg-white/10"
                    >
                      {language === 'en' ? 'Share on X' : 'X မှာ မျှဝေပါ'}
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
