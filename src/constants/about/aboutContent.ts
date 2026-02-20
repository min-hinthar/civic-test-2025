/**
 * Bilingual About page content constants.
 *
 * All narrative text, dedication card content, and external links for the About page.
 * Content follows the app's language toggle (English / Burmese).
 *
 * Note: Burmese narrative text may need native speaker review (BRMSE-01).
 * Burmese is kept simple and direct rather than attempting literary flourish.
 */

import type { BilingualString } from '@/lib/i18n/strings';

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

export interface DedicationPerson {
  name: BilingualString;
  role: BilingualString;
  briefTribute: BilingualString;
  fullTribute: BilingualString;
}

export interface AboutSection {
  title: BilingualString;
  paragraphs: BilingualString[];
}

export interface ExternalLink {
  label: BilingualString;
  url: string;
}

export interface AboutContent {
  hero: {
    title: BilingualString;
    subtitle: BilingualString;
  };
  sections: AboutSection[];
  dedications: {
    sectionTitle: BilingualString;
    dwightClark: DedicationPerson;
    guyots: DedicationPerson;
  };
  callToAction: {
    title: BilingualString;
    message: BilingualString;
  };
  externalLinks: ExternalLink[];
  footer: {
    version: string;
    year: number;
    repoUrl: string;
    openSourceNotice: BilingualString;
    developerCredit: BilingualString;
  };
}

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

export const aboutContent: AboutContent = {
  // ── Hero ──────────────────────────────────────────────────────────────
  hero: {
    title: {
      en: 'Our Story',
      my: 'ကျွန်ုပ်တို့၏ ဇာတ်ကြောင်း',
    },
    subtitle: {
      en: 'Born from a community. Built for humanity.',
      my: 'အသိုင်းအဝိုင်းတစ်ခုမှ မွေးဖွားခဲ့သည်။ လူတိုင်းအတွက် တည်ဆောက်ထားသည်။',
    },
  },

  // ── Narrative sections ────────────────────────────────────────────────
  sections: [
    // 1. Origin story
    {
      title: {
        en: 'Where It Began',
        my: 'အစပြုရာ',
      },
      paragraphs: [
        {
          en: 'This app was born from a kitchen table in a Burmese household, where a mother sat with a stack of USCIS civics flashcards, quietly memorizing answers she would need to recite in a language that was not her own. The questions were simple on paper, but the stakes were not. Passing meant belonging. Failing meant waiting, wondering, trying again.',
          my: 'ဤအက်ပ်သည် မြန်မာအိမ်တစ်အိမ်၏ မီးဖိုချောင်စားပွဲမှ စတင်ခဲ့သည်။ မိခင်တစ်ဦးသည် USCIS နိုင်ငံသားရေးရာ ကတ်ပြားများကို ကိုင်ကာ သူမ၏ မိခင်ဘာသာစကားမဟုတ်သည့် ဘာသာစကားဖြင့် ပြန်ပြောရမည့် အဖြေများကို တိတ်ဆိတ်စွာ အလွတ်ကျက်နေခဲ့သည်။ မေးခွန်းများသည် စာရွက်ပေါ်တွင် ရိုးရှင်းသော်လည်း အခြေအနေမှာ မရိုးရှင်းပါ။ အောင်မြင်ခြင်းသည် ပိုင်ဆိုင်ခွင့်ကို ဆိုလိုသည်။ ကျရှုံးခြင်းသည် စောင့်ဆိုင်းရခြင်း၊ စိုးရိမ်ရခြင်း၊ ထပ်မံကြိုးစားရခြင်းကို ဆိုလိုသည်။',
        },
        {
          en: 'We built this app so that no one has to study alone, struggle with unfamiliar words, or feel ashamed of needing help. Whether you are a Burmese immigrant preparing for the biggest test of your new life or anyone from any background pursuing the dream of American citizenship, this app is for you.',
          my: 'ဘယ်သူမှ တစ်ယောက်တည်း လေ့လာစရာမလိုအောင်၊ မရင်းနှီးသော စကားလုံးများနှင့် ရုန်းကန်စရာမလိုအောင်၊ အကူအညီလိုအပ်ခြင်းကို ရှက်စရာမလိုအောင် ဤအက်ပ်ကို တည်ဆောက်ခဲ့ပါသည်။ သင်သည် ဘဝသစ်၏ အကြီးဆုံးစာမေးပွဲအတွက် ပြင်ဆင်နေသော မြန်မာရွှေ့ပြောင်းနေထိုင်သူဖြစ်စေ၊ အမေရိကန်နိုင်ငံသားဖြစ်ခြင်း အိပ်မက်ကို လိုက်စားနေသူဖြစ်စေ ဤအက်ပ်သည် သင့်အတွက် ဖြစ်ပါသည်။',
        },
      ],
    },

    // 2. Mission
    {
      title: {
        en: 'Our Mission',
        my: 'ကျွန်ုပ်တို့၏ ရည်ရွယ်ချက်',
      },
      paragraphs: [
        {
          en: "We believe that preparing for the U.S. citizenship test should not be stressful or isolating. It should be a journey of discovery and pride. Every one of the 128 civics questions tells a piece of America's story, and learning those answers means understanding the country you are choosing to call home.",
          my: 'အမေရိကန်နိုင်ငံသားစာမေးပွဲအတွက် ပြင်ဆင်ခြင်းသည် စိတ်ဖိစီးစရာ သို့မဟုတ် အထီးကျန်ဖြစ်စရာ မဖြစ်သင့်ဟု ကျွန်ုပ်တို့ ယုံကြည်ပါသည်။ ၎င်းသည် ရှာဖွေတွေ့ရှိမှုနှင့် ဂုဏ်ယူမှု၏ ခရီးဖြစ်သင့်ပါသည်။ နိုင်ငံသားရေးရာ မေးခွန်း ၁၂၈ ခု တစ်ခုစီတိုင်းသည် အမေရိကန်ဇာတ်ကြောင်း၏ အစိတ်အပိုင်းတစ်ခုကို ပြောပြနေပြီး ထိုအဖြေများကို လေ့လာခြင်းသည် သင်အိမ်ဟု ခေါ်ရန် ရွေးချယ်ထားသော နိုင်ငံကို နားလည်ခြင်းပင် ဖြစ်ပါသည်။',
        },
        {
          en: 'This app puts everything in our languages. Explanations in both English and Burmese. Spaced repetition that adapts to how you learn. A practice interview so you know what to expect on the real day. All of it free, all of it offline-ready, and all of it built with the care that your journey deserves.',
          my: 'ဤအက်ပ်သည် အရာအားလုံးကို သင့်ဘာသာစကားဖြင့် ပေးပါသည်။ အင်္ဂလိပ်နှင့် မြန်မာ နှစ်ဘာသာဖြင့် ရှင်းလင်းချက်များ။ သင်၏ လေ့လာမှုပုံစံနှင့် လိုက်လျောညီထွေဖြစ်သော spaced repetition။ တကယ့်နေ့တွင် ဘာမျှော်လင့်ရမည်ကို သိစေရန် လေ့ကျင့်အင်တာဗျူး။ အားလုံး အခမဲ့၊ အားလုံး အင်တာနက်မလိုဘဲ သုံးနိုင်ပြီး အားလုံးကို သင့်ခရီးနှင့် ထိုက်တန်သော ဂရုတစိုက်ဖြင့် တည်ဆောက်ထားပါသည်။',
        },
      ],
    },

    // 3. VIA (Volunteers in Asia)
    {
      title: {
        en: 'Volunteers in Asia',
        my: 'Volunteers in Asia (VIA)',
      },
      paragraphs: [
        {
          en: 'In 1963, a Stanford dean named Dwight D. Clark organized a summer volunteer project that sent 23 undergraduates to Hong Kong, where they helped Chinese refugees through rooftop schools, medical clinics, and community programs. That first summer grew into Volunteers in Asia (VIA), a nonprofit that for over four decades sent thousands of Americans to live and serve across East Asia.',
          my: '၁၉၆၃ ခုနှစ်တွင် Stanford တက္ကသိုလ်မှ ဒိန်းတစ်ဦးဖြစ်သော Dwight D. Clark သည် ကျောင်းသား ၂၃ ဦးကို ဟောင်ကောင်သို့ စေလွှတ်သည့် နွေရာသီ စေတနာ့ဝန်ထမ်းစီမံကိန်းတစ်ခုကို စတင်ခဲ့ပြီး တရုတ်ဒုက္ခသည်များကို အမိုးထပ်ကျောင်းများ၊ ဆေးခန်းများနှင့် ရပ်ရွာအစီအစဉ်များမှတစ်ဆင့် ကူညီခဲ့ကြသည်။ ထိုပထမဆုံးနွေရာသီသည် Volunteers in Asia (VIA) အဖြစ် ဖွံ့ဖြိုးလာခဲ့ပြီး ဆယ်စုနှစ်လေးခုကျော် အမေရိကန်ထောင်ပေါင်းများစွာကို အရှေ့အာရှတစ်ဝှမ်း နေထိုင်ကာ အမှုတော်ဆောင်ရန် စေလွှတ်ခဲ့သော အကျိုးအမြတ်မယူသည့် အဖွဲ့အစည်းဖြစ်သည်။',
        },
        {
          en: 'What made VIA different was its two-way philosophy. In 1977, Dwight pioneered bringing Japanese university students to Stanford, proving that cultural exchange works best when it flows in both directions. VIA maintained volunteer positions in Burma and led study tours through Yangon, Mandalay, and Bagan, building bridges between American volunteers and the people of Myanmar. After retiring from VIA he founded Learning Across Borders (LAB) to connect East Asian youth with Southeast Asian communities.',
          my: 'VIA ကို ထူးခြားစေသည်မှာ ၎င်း၏ နှစ်ဖက်ယဉ်ကျေးမှုဖလှယ်ရေး ဒဿနဖြစ်သည်။ ၁၉၇၇ ခုနှစ်တွင် Dwight သည် ဂျပန်တက္ကသိုလ်ကျောင်းသားများကို Stanford သို့ ခေါ်ဆောင်လာခြင်းဖြင့် ယဉ်ကျေးမှုဖလှယ်မှုသည် နှစ်ဖက်စီးဆင်းသောအခါ အကောင်းဆုံးဖြစ်ကြောင်း သက်သေပြခဲ့သည်။ VIA သည် မြန်မာနိုင်ငံတွင် စေတနာ့ဝန်ထမ်းရာထူးများ ထိန်းသိမ်းခဲ့ပြီး ရန်ကုန်၊ မန္တလေးနှင့် ပုဂံတို့ကို လေ့လာရေးခရီးများ ဦးဆောင်ကာ အမေရိကန်စေတနာ့ဝန်ထမ်းများနှင့် မြန်မာပြည်သူများအကြား တံတားများ တည်ဆောက်ခဲ့သည်။ VIA မှ အနားယူပြီးနောက် အရှေ့အာရှ လူငယ်များကို အရှေ့တောင်အာရှ အသိုင်းအဝိုင်းများနှင့် ချိတ်ဆက်ရန် Learning Across Borders ကို တည်ထောင်ခဲ့သည်။',
        },
        {
          en: 'The spirit of Dwight, VIA, & LAB lives on in this app. Just as Dwight believed that understanding comes from showing up, living alongside, and learning together, we believe that preparing for citizenship is richer when you can do it in the language of your heart.',
          my: 'VIA & LAB နှင့် Dwight ၏ စိတ်ဓာတ်သည် ဤအက်ပ်တွင် ဆက်လက်ရှင်သန်နေသည်။ Dwight သည် နားလည်မှုသည် ရောက်ရှိခြင်း၊ အတူနေထိုင်ခြင်းနှင့် အတူလေ့လာခြင်းမှ လာသည်ဟု ယုံကြည်ခဲ့သကဲ့သို့ နိုင်ငံသားဖြစ်ရေးအတွက် ပြင်ဆင်ခြင်းသည် သင့်နှလုံးသား၏ ဘာသာစကားဖြင့် လုပ်ဆောင်နိုင်သောအခါ ပိုမိုကြွယ်ဝကြောင်း ကျွန်ုပ်တို့ ယုံကြည်ပါသည်။',
        },
      ],
    },

    // 4. Pre-Collegiate Program
    {
      title: {
        en: 'The Pre-Collegiate Program',
        my: 'Pre-Collegiate Program (PCP)',
      },
      paragraphs: [
        {
          en: 'In 2003, Dorothy and James Guyot, together with Sayar-Gyi Khin Maung Win, founded the Pre-Collegiate Program in Yangon. Dorothy and Jim had first lived in Burma in 1961, spending eighteen months conducting research and welcoming their first child there. Their connection to the country and its people ran deep, and decades later they returned to give something back.',
          my: '၂၀၀၃ ခုနှစ်တွင် Dorothy နှင့် James Guyot တို့သည် ဆရာကြီး ခင်မောင်ဝင်းနှင့်အတူ ရန်ကုန်တွင် Pre-Collegiate Program ကို တည်ထောင်ခဲ့သည်။ Dorothy နှင့် Jim တို့သည် ၁၉၆၁ ခုနှစ်တွင် မြန်မာနိုင်ငံတွင် ပထမဆုံး နေထိုင်ခဲ့ပြီး တစ်နှစ်ခွဲကြာ သုတေသနပြုကာ ၎င်းတို့၏ ပထမဆုံးကလေးကို ထိုနိုင်ငံတွင် မွေးဖွားခဲ့သည်။ နိုင်ငံနှင့် ပြည်သူများအပေါ် ၎င်းတို့၏ ချိတ်ဆက်မှုသည် နက်ရှိုင်းခဲ့ပြီး ဆယ်စုနှစ်များ အကြာတွင် တစ်စုံတစ်ရာ ပြန်လည်ပေးဆပ်ရန် ပြန်လာခဲ့ကြသည်။',
        },
        {
          en: "Sayar-Gyi Khin Maung Win, a distinguished philosophy professor and former Head of the Department of Philosophy at the University of Yangon, brought the intellectual foundation that shaped PCP's liberal arts curriculum. His vision of critical thinking and civic engagement became the heart of what PCP teaches.",
          my: 'ဆရာကြီး ခင်မောင်ဝင်းသည် ဂုဏ်သရေရှိ ဒဿနိကဗေဒ ပါမောက္ခနှင့် ရန်ကုန်တက္ကသိုလ် ဒဿနိကဗေဒဌာန အကြီးအကဲဟောင်းဖြစ်ပြီး PCP ၏ liberal arts သင်ရိုးညွှန်းတမ်းကို ပုံဖော်ပေးခဲ့သော ပညာရေးအခြေခံကို ပေးခဲ့သည်။ ဝေဖန်ပိုင်းခြားတွေးခေါ်မှုနှင့် နိုင်ငံသားပါဝင်မှုအပေါ် သူ၏ အမြင်သည် PCP သင်ကြားသည့် အနှစ်သာရ ဖြစ်လာခဲ့သည်။',
        },
        {
          en: 'Over eighteen months of intensive study, PCP students from diverse religious, ethnic, and socio-economic backgrounds across Myanmar develop critical reasoning and an understanding of the wider world. More than eighty graduates have gone on to attend colleges in the United States, Canada, and Japan on full scholarships. The program proves that when you invest in young people with care and rigor, they rise.',
          my: 'တစ်နှစ်ခွဲကြာ အထူးပြင်းထန်သော လေ့လာမှုတစ်လျှောက် မြန်မာနိုင်ငံတစ်ဝှမ်းမှ ဘာသာရေး၊ လူမျိုးနှင့် လူမှုစီးပွားနောက်ခံ အမျိုးမျိုးရှိ PCP ကျောင်းသားများသည် ဝေဖန်ပိုင်းခြားတွေးခေါ်မှုနှင့် ကမ္ဘာကြီးအပေါ် နားလည်မှုကို ဖွံ့ဖြိုးစေပါသည်။ ဘွဲ့ရကျောင်းသား ရှစ်ဆယ်ကျော်သည် အမေရိကန်၊ ကနေဒါနှင့် ဂျပန်နိုင်ငံတို့ရှိ တက္ကသိုလ်များတွင် ပညာသင်ဆုအပြည့်ဖြင့် တက်ရောက်ခဲ့ကြသည်။ ဤအစီအစဉ်သည် လူငယ်များကို ဂရုတစိုက်နှင့် စနစ်တကျ ရင်းနှီးမြှုပ်နှံလျှင် သူတို့ တက်လာကြောင်း သက်သေပြပါသည်။',
        },
      ],
    },

    // 5. True Americans at Heart
    {
      title: {
        en: 'True Americans at Heart',
        my: 'နှလုံးသားစစ်စစ် အမေရိကန်များ',
      },
      paragraphs: [
        {
          en: 'Dwight Clark, Dorothy and James Guyot, and Sayar-Gyi Khin Maung Win each dedicated decades of their lives to Burma. They did not have to. Dwight could have stayed on campus; the Guyots could have moved on after their first eighteen months in Rangoon; Khin Maung Win could have pursued a quieter retirement. Instead, they chose to serve. That choice — service without expectation, generosity across cultures, the belief that lifting others is the highest expression of citizenship — embodies the virtues of being a true American at heart.',
          my: 'Dwight Clark, Dorothy နှင့် James Guyot, နှင့် ဆရာကြီး ခင်မောင်ဝင်း တို့သည် ၎င်းတို့၏ ဘဝမှ ဆယ်စုနှစ်များစွာကို မြန်မာနိုင်ငံအတွက် အနစ်နာခံ ပေးဆပ်ခဲ့ကြသည်။ သူတို့ မလုပ်လည်း ရပါသည်။ Dwight သည် ကျောင်းဝင်းထဲတွင် နေနိုင်ခဲ့သည်။ Guyot တို့သည် ရန်ကုန်တွင် ပထမ တစ်နှစ်ခွဲပြီးနောက် ထွက်ခွာနိုင်ခဲ့သည်။ ခင်မောင်ဝင်းသည် ပိုတိတ်ဆိတ်သော အနားယူမှုကို ရွေးချယ်နိုင်ခဲ့သည်။ သို့သော် သူတို့သည် အမှုတော်ဆောင်ရန် ရွေးချယ်ခဲ့ကြသည်။ ထိုရွေးချယ်မှု — မျှော်လင့်ချက်မဲ့ အမှုတော်ဆောင်ခြင်း၊ ယဉ်ကျေးမှုများကို ဖြတ်ကျော်သော ရက်ရောမှု၊ အခြားသူများကို မြှင့်တင်ခြင်းသည် နိုင်ငံသားတစ်ယောက်၏ အမြင့်ဆုံးဖော်ပြမှုဖြစ်သည်ဟု ယုံကြည်ခြင်း — သည် နှလုံးသားစစ်စစ် အမေရိကန်တစ်ယောက်ဖြစ်ခြင်း၏ ဂုဏ်ရည်များကို ကိုယ်စားပြုပါသည်။',
        },
        {
          en: "For me, their example is personal. I was a student of PCP's seventh cohort and a participant in the 2009 Learning Across Borders program. I saw firsthand how Dwight's vision of cross-cultural exchange and the Guyots' investment in Myanmar's young people could change a life — because they changed mine. This app exists because of what they built. If it helps even one person feel less alone while studying for the citizenship test, then their legacy continues in a small but meaningful way.",
          my: 'ကျွန်တော့်အတွက် သူတို့၏ နမူနာသည် ကိုယ်ပိုင်ခံစားချက်ဖြစ်ပါသည်။ ကျွန်တော်သည် PCP ၏ သတ္တမမျိုးဆက်ကျောင်းသားတစ်ဦးဖြစ်ပြီး ၂၀၀၉ Learning Across Borders အစီအစဉ်တွင် ပါဝင်သူတစ်ဦးဖြစ်ပါသည်။ Dwight ၏ ယဉ်ကျေးမှုဖလှယ်ရေး အမြင်နှင့် Guyot တို့၏ မြန်မာလူငယ်များအပေါ် ရင်းနှီးမြှုပ်နှံမှုသည် ဘဝတစ်ခုကို မည်သို့ ပြောင်းလဲနိုင်သည်ကို ကိုယ်တိုင်ကိုယ်ကျ မြင်တွေ့ခဲ့ရပါသည် — အဘယ်ကြောင့်ဆိုသော် သူတို့သည် ကျွန်တော့်ဘဝကို ပြောင်းလဲပေးခဲ့သောကြောင့်ဖြစ်သည်။ ဤအက်ပ်သည် သူတို့ တည်ဆောက်ခဲ့သည့်အရာကြောင့် ရှိနေပါသည်။ နိုင်ငံသားစာမေးပွဲအတွက် လေ့လာနေစဉ် လူတစ်ယောက်တည်းကိုမှ အထီးကျန်မခံစားရအောင် ကူညီနိုင်လျှင်ပင် သူတို့၏ အမွေအနှစ်သည် သေးငယ်သော်လည်း အဓိပ္ပာယ်ရှိသော နည်းလမ်းဖြင့် ဆက်လက်ရှင်သန်နေမည်ဖြစ်ပါသည်။',
        },
      ],
    },
  ],

  // ── Dedications ───────────────────────────────────────────────────────
  dedications: {
    sectionTitle: {
      en: 'Dedicated With Gratitude',
      my: 'ကျေးဇူးတင်လျက် ဂုဏ်ပြုအပ်ပါသည်',
    },

    dwightClark: {
      name: {
        en: 'Dwight D. Clark',
        my: 'ဒွိုက် ဒီ ကလတ်',
      },
      role: {
        en: 'Founder of Volunteers in Asia & Learning Across Borders',
        my: 'Volunteers in Asia နှင့် Learning Across Borders တည်ထောင်သူ',
      },
      briefTribute: {
        en: 'In 1963, Dwight Clark sent 23 Stanford students to serve in Hong Kong and sparked a movement that would connect Americans and Asians for over forty years.',
        my: '၁၉၆၃ ခုနှစ်တွင် Dwight Clark သည် Stanford ကျောင်းသား ၂၃ ဦးကို ဟောင်ကောင်သို့ စေလွှတ်ခဲ့ပြီး အမေရိကန်နှင့် အာရှလူမျိုးများကို နှစ်ပေါင်း လေးဆယ်ကျော် ချိတ်ဆက်ပေးမည့် လှုပ်ရှားမှုတစ်ခုကို ဖန်တီးခဲ့သည်။',
      },
      fullTribute: {
        en: "As Dean of Freshman Men at Stanford, Dwight D. Clark believed that true understanding comes from crossing borders, not just reading about them. He founded Volunteers in Asia in 1963 and led it for four decades, sending thousands of Americans to live and work alongside communities across eight East Asian countries. In 1977, he pioneered two-way exchange by bringing Japanese students to Stanford, proving that cultural bridges must carry traffic in both directions. His Burma study tours connected VIA alumni with the people and places of Myanmar, and after retiring from VIA he founded Learning Across Borders to connect East Asian youth with Southeast Asian communities. His life's work reminds us that service and understanding are the same journey.",
        my: 'Stanford တက္ကသိုလ်၏ Freshman Men ဒိန်းအဖြစ် Dwight D. Clark သည် စစ်မှန်သော နားလည်မှုသည် နယ်စပ်ကို ဖြတ်ကျော်ခြင်းမှ လာသည်ဟု ယုံကြည်ခဲ့သည်။ သူသည် ၁၉၆၃ ခုနှစ်တွင် Volunteers in Asia ကို တည်ထောင်ခဲ့ပြီး ဆယ်စုနှစ်လေးခုကြာ ဦးဆောင်ကာ အမေရိကန်ထောင်ပေါင်းများစွာကို အရှေ့အာရှ ရှစ်နိုင်ငံရှိ အသိုင်းအဝိုင်းများနှင့်အတူ နေထိုင်ကာ အလုပ်လုပ်ရန် စေလွှတ်ခဲ့သည်။ ၁၉၇၇ ခုနှစ်တွင် ဂျပန်ကျောင်းသားများကို Stanford သို့ ခေါ်ဆောင်လာခြင်းဖြင့် နှစ်ဖက်ဖလှယ်ရေးကို ရှေ့ဆောင်ခဲ့ပြီး ယဉ်ကျေးမှုတံတားများသည် နှစ်ဖက်စလုံးမှ ဖြတ်သန်းနိုင်ရမည်ဟု သက်သေပြခဲ့သည်။ သူ၏ မြန်မာလေ့လာရေးခရီးများသည် VIA ကျောင်းသားဟောင်းများကို မြန်မာပြည်သူများနှင့် နေရာများနှင့် ချိတ်ဆက်ပေးခဲ့ပြီး VIA မှ အနားယူပြီးနောက် အရှေ့အာရှ လူငယ်များကို အရှေ့တောင်အာရှ အသိုင်းအဝိုင်းများနှင့် ချိတ်ဆက်ရန် Learning Across Borders ကို တည်ထောင်ခဲ့သည်။ သူ၏ ဘဝတစ်သက်တာ လုပ်ငန်းသည် အမှုတော်ဆောင်ခြင်းနှင့် နားလည်ခြင်းသည် ခရီးတစ်ခုတည်း ဖြစ်ကြောင်း သတိပေးပါသည်။',
      },
    },

    guyots: {
      name: {
        en: 'Dorothy & James Guyot',
        my: 'ဒေါ်ရသီ နှင့် ဂျိမ်းစ် ဂိုရော',
      },
      role: {
        en: 'Co-founders of the Pre-Collegiate Program, Yangon (with Sayar-Gyi Khin Maung Win)',
        my: 'Pre-Collegiate Program ပူးတွဲတည်ထောင်သူများ၊ ရန်ကုန် (ဆရာကြီး ခင်မောင်ဝင်းနှင့်အတူ)',
      },
      briefTribute: {
        en: 'Dorothy and Jim Guyot, together with Sayar-Gyi Khin Maung Win, created a program in Yangon that has sent more than eighty Myanmar students to colleges around the world on full scholarships.',
        my: 'Dorothy နှင့် Jim Guyot တို့သည် ဆရာကြီး ခင်မောင်ဝင်းနှင့်အတူ ရန်ကုန်တွင် အစီအစဉ်တစ်ခုကို ဖန်တီးခဲ့ပြီး မြန်မာကျောင်းသား ရှစ်ဆယ်ကျော်ကို ပညာသင်ဆုအပြည့်ဖြင့် ကမ္ဘာတစ်ဝှမ်းရှိ တက္ကသိုလ်များသို့ စေလွှတ်ခဲ့သည်။',
      },
      fullTribute: {
        en: "Dorothy and James Guyot first came to Burma in 1961, spending eighteen months living in the country where their first child was born. Both pursued doctorates at Yale; Dorothy's dissertation explored the political impact of Japan's occupation of Burma. Their bond with Myanmar never faded. In 2003, they partnered with Sayar-Gyi Khin Maung Win, the distinguished philosopher and former Head of the Department of Philosophy at the University of Yangon, to found the Pre-Collegiate Program. Over eighteen months of intensive liberal arts study, PCP prepares students from diverse backgrounds across Myanmar for college abroad. More than eighty graduates have earned full-ride scholarships to universities in the United States, Canada, and Japan. PCP stands as proof that education, offered with deep respect for a community, can change the course of lives.",
        my: 'Dorothy နှင့် James Guyot တို့သည် ၁၉၆၁ ခုနှစ်တွင် မြန်မာနိုင်ငံသို့ ပထမဆုံး ရောက်ရှိခဲ့ပြီး ၎င်းတို့၏ ပထမဆုံးကလေး မွေးဖွားခဲ့သော နိုင်ငံတွင် တစ်နှစ်ခွဲကြာ နေထိုင်ခဲ့သည်။ နှစ်ဦးစလုံး Yale တွင် ဒေါက်တာဘွဲ့ ယူခဲ့ပြီး Dorothy ၏ ကျမ်းပြုစာတမ်းသည် ဂျပန်၏ မြန်မာသိမ်းပိုက်မှု၏ နိုင်ငံရေးသက်ရောက်မှုကို လေ့လာခဲ့သည်။ မြန်မာနိုင်ငံနှင့် ၎င်းတို့၏ ချိတ်ဆက်မှုသည် ဘယ်တော့မှ မပျောက်ခဲ့ပါ။ ၂၀၀၃ ခုနှစ်တွင် ရန်ကုန်တက္ကသိုလ် ဒဿနိကဗေဒဌာန အကြီးအကဲဟောင်းနှင့် ဂုဏ်သရေရှိ ဒဿနပညာရှင် ဆရာကြီး ခင်မောင်ဝင်းနှင့် ပူးပေါင်းကာ Pre-Collegiate Program ကို တည်ထောင်ခဲ့သည်။ တစ်နှစ်ခွဲကြာ အထူးပြင်းထန်သော liberal arts လေ့လာမှုဖြင့် PCP သည် မြန်မာနိုင်ငံတစ်ဝှမ်းမှ နောက်ခံအမျိုးမျိုးရှိ ကျောင်းသားများကို နိုင်ငံခြားတက္ကသိုလ်အတွက် ပြင်ဆင်ပေးပါသည်။ ဘွဲ့ရကျောင်းသား ရှစ်ဆယ်ကျော်သည် အမေရိကန်၊ ကနေဒါနှင့် ဂျပန်နိုင်ငံတို့ရှိ တက္ကသိုလ်များတွင် ပညာသင်ဆုအပြည့် ရရှိခဲ့ကြသည်။ PCP သည် အသိုင်းအဝိုင်းအပေါ် နက်ရှိုင်းစွာ လေးစားမှုဖြင့် ပေးသော ပညာရေးသည် ဘဝ၏လမ်းကြောင်းကို ပြောင်းလဲနိုင်ကြောင်း သက်သေအဖြစ် ရပ်တည်နေပါသည်။',
      },
    },
  },

  // ── Call to action ────────────────────────────────────────────────────
  callToAction: {
    title: {
      en: 'Share This With Someone Who Needs It',
      my: 'လိုအပ်သူတစ်ဦးထံ ဝေမျှပါ',
    },
    message: {
      en: 'If you know someone preparing for the U.S. citizenship test, share this app with them. It might be a family member, a neighbor, a coworker, or someone at your place of worship. Passing the civics test is one step on a long road, and no one should have to walk it alone.',
      my: 'အမေရိကန်နိုင်ငံသားစာမေးပွဲအတွက် ပြင်ဆင်နေသူတစ်ဦးကို သိပါက ဤအက်ပ်ကို သူတို့ထံ ဝေမျှပါ။ မိသားစုဝင်တစ်ဦး၊ အိမ်နီးချင်းတစ်ဦး၊ လုပ်ဖော်ကိုင်ဖက်တစ်ဦး သို့မဟုတ် သင့်ဘုရားကျောင်းရှိ တစ်စုံတစ်ဦး ဖြစ်နိုင်ပါသည်။ နိုင်ငံသားရေးရာ စာမေးပွဲအောင်ခြင်းသည် ခရီးရှည်တစ်ခုပေါ်ရှိ ခြေလှမ်းတစ်လှမ်းဖြစ်ပြီး ဘယ်သူမှ တစ်ယောက်တည်း လျှောက်စရာ မလိုသင့်ပါ။',
    },
  },

  // ── External links ────────────────────────────────────────────────────
  externalLinks: [
    {
      label: {
        en: 'USCIS Civics Test Study Materials',
        my: 'USCIS နိုင်ငံသားရေးရာ စာမေးပွဲ လေ့လာရေးပစ္စည်းများ',
      },
      url: 'https://www.uscis.gov/citizenship/find-study-materials-and-resources/study-for-the-test',
    },
    {
      label: {
        en: 'VIA Programs',
        my: 'VIA Programs',
      },
      url: 'https://viaprograms.org',
    },
    {
      label: {
        en: 'Pre-Collegiate Program, Yangon',
        my: 'Pre-Collegiate Program၊ ရန်ကုန်',
      },
      url: 'https://precollegiateyangon.info/',
    },
  ],

  // ── Footer ────────────────────────────────────────────────────────────
  footer: {
    version: '3.0',
    year: 2026,
    repoUrl: 'https://github.com/min-hinthar/civic-test-2025',
    openSourceNotice: {
      en: 'This app is free and open source. Built with love for the community.',
      my: 'ဤအက်ပ်သည် အခမဲ့နှင့် open source ဖြစ်ပါသည်။ အသိုင်းအဝိုင်းအတွက် ချစ်ခြင်းမေတ္တာဖြင့် တည်ဆောက်ထားပါသည်။',
    },
    developerCredit: {
      en: 'Developed by Min, PCP 7th Cohort and 2009 Learning Across Borders alumnus.',
      my: 'Min မှ ဖန်တီးတည်ဆောက်သည်။ PCP သတ္တမမျိုးဆက်နှင့် ၂၀၀၉ Learning Across Borders ကျောင်းသားဟောင်း။',
    },
  },
};
