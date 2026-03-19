/**
 * Bilingual Op-Ed content constants.
 *
 * "Pardoning Turkeys, Deporting Dreams" — a bilingual editorial on TPS for Burma.
 * Content restored from git history (faae9fb) during App Router migration.
 *
 * Note: Burmese text is the author's original writing.
 */

import type { BilingualString } from '@/lib/i18n/strings';

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

export interface OpEdSection {
  title: BilingualString;
  intro?: BilingualString;
  paragraphs?: BilingualString[];
  bullets?: BilingualString[];
  closing?: BilingualString;
}

export interface OpEdContent {
  hero: {
    tag: BilingualString;
    title: BilingualString;
    subtitle: BilingualString;
  };
  meta: {
    author: BilingualString;
    authorNote: BilingualString;
    thesis: BilingualString;
    thesisNote: BilingualString;
    readTime: BilingualString;
    docLink: { en: string; my: string };
    tweetText: BilingualString;
  };
  introParagraphs: BilingualString[];
  sections: OpEdSection[];
  share: {
    headline: BilingualString;
    body: BilingualString;
  };
}

// ---------------------------------------------------------------------------
// Share config
// ---------------------------------------------------------------------------

export const opEdShareUrl = 'https://civic-test-2025.vercel.app/op-ed';

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

export const opEdContent: OpEdContent = {
  hero: {
    tag: {
      en: 'Pardoning Turkeys, Deporting Dreams',
      my: 'ကြက်ဆင်တွေ လွတ်၊ ဒုက္ခသည်တွေ နောက်ပြန်ပို့?',
    },
    title: {
      en: "A Burmese Refugee's Plea for a Kinder, Wiser American Leadership",
      my: 'မြန်မာ TPS ရပ်စဲမှုကို ရိုးသားတင်းကြပ်စွာ စဉ်းစားပေးပါ',
    },
    subtitle: {
      en: 'How a Thanksgiving tradition of mercy collides with the decision to end Temporary Protected Status for Burma\u2014and why the narrative America chooses matters for refugees, democracy, and national security alike.',
      my: 'Thanksgiving ကရုဏာအမွန်အတရားနဲ့ ရိုက်ပျက်နေတဲ့ TPS ရပ်စဲခြင်းကြားက ကြားမြင်တွေ့ရှိချက်တွေကို မြန်မာဘာသာနဲ့ ဖော်ပြထားပါတယ်။',
    },
  },

  meta: {
    author: {
      en: 'Burmese TPS Holder & Refugee Advocate',
      my: 'မြန်မာ TPS ကိုင်ဆောင်သူ၊ ဒုက္ခသည်အခွင့်အရေး ကြိုးပမ်းသူ',
    },
    authorNote: {
      en: 'Writing from lived experience across Burma and the American Midwest.',
      my: 'မြန်မာပြည်နဲ့ အမေရိကန် Midwest လောကကြားမှာ ရှေ့ဆက်နေသူတစ်ယောက်ရဲ့ အသံ။',
    },
    thesis: {
      en: 'Mercy should extend beyond turkeys',
      my: 'ကရုဏာကို ကြက်ဆင်တွေပေါ်မှာပဲ မရပ်သင့်ဘူး',
    },
    thesisNote: {
      en: 'Ending TPS without honest framing risks handing the junta propaganda and real human lives.',
      my: 'မြန်မာပြည် လုံခြုံသွားပြီလို့ မှားယွင်းထင်မြင်ပြီး TPS ရပ်စဲခြင်းဟာ စစ်ကောင်စီရဲ့ ဝါဒဖြန့်ချိမှုကို အားပေးစေပါလိမ့်မယ်။',
    },
    readTime: {
      en: '12 minutes',
      my: '၁၂ မိနစ်',
    },
    docLink: {
      en: 'https://docs.google.com/document/d/1EeBxEaGfnpwbr6mmQ-ZVkB-yrvlOEO-9D0e85Ao4gQs/edit?usp=sharing',
      my: 'https://docs.google.com/document/d/1XJUT7r_08mB0SIlFu8fPCJqHvnSzVpNFRcmcPYSwyM4/edit?usp=sharing',
    },
    tweetText: {
      en: 'Pardoning Turkeys, Deporting Dreams \u2013 a Burmese refugee\u2019s plea for kinder, wiser leadership on TPS for Burma.',
      my: 'ကြက်ဆင်တွေကို လွတ်ပေးနေချိန် မြန်မာ TPS ကို ရပ်စဲတာ ဘာကြောင့် အန္တရာယ်ရှိနေသလဲ ဆိုတာ ဖော်ပြတဲ့ ဆောင်းပါးကို ဖတ်ပေးပါ။',
    },
  },

  introParagraphs: [
    {
      en: 'Every Thanksgiving, America does something beautifully strange: it pardons a turkey. This year it was Gobble and Waddle\u2014two \u2018Make America Healthy Again\u2019 certified birds who, with full Hollywood optics, were spared and sent off to a comfortable retirement instead of the oven. It\u2019s lighthearted, theatrical, and oddly touching. A country that can still make time for a symbolic act of mercy is a country that hasn\u2019t entirely forgotten its virtues.',
      my: 'နှစ်စဉ်နှစ်တိုင်း ကျေးဇူးတော်နေ့ (Thanksgiving) ရောက်တိုင်း အမေရိကန်နိုင်ငံဟာ ထူးဆန်းပြီး လှပတဲ့ အလုပ်တစ်ခုကို လုပ်လေ့ရှိပါတယ်။ အဲဒါကတော့ ကြက်ဆင်တစ်ကောင်ကို လွတ်ငြိမ်းချမ်းသာခွင့် ပေးခြင်းပါပဲ။ ဒီနှစ်မှာတော့ \u201cMake America Healthy Again\u201d (အမေရိကကို ပြန်လည်ကျန်းမာစေမည်) လက်မှတ်ရထားတဲ့ \u201cGobble\u201d နဲ့ \u201cWaddle\u201d လို့ အမည်ရတဲ့ ကြက်ဆင်ကြီး နှစ်ကောင်ဟာ ဟောလိဝုဒ်ဆန်ဆန် အခမ်းအနားတွေနဲ့ သမ္မတရဲ့ လွတ်ငြိမ်းခွင့်ကို ရရှိခဲ့ပါတယ်။ မီးဖိုထဲ ရောက်မယ့်အစား မြောက်ကယ်ရိုလိုင်းနားပြည်နယ်က ကောလိပ်ပိုင် ခြံဝင်းတစ်ခုမှာ အေးအေးဆေးဆေး အငြိမ်းစားယူခွင့် ရသွားကြပါပြီ။ ဒါဟာ ပေါ့ပါးတယ်၊ ပြဇာတ်ဆန်တယ်၊ ပြီးတော့ ထူးဆန်းစွာနဲ့ပဲ စိတ်ထိခိုက် ကြည်နူးစရာ ကောင်းပါတယ်။ သင်္ကေတသဘောဆောင်တဲ့ ကရုဏာသက်မှုလေးတစ်ခုအတွက် အချိန်ပေးနိုင်သေးတဲ့ တိုင်းပြည်တစ်ခုဟာ သူ့ရဲ့ မွန်မြတ်တဲ့ စိတ်ထားတွေကို လုံးဝ မမေ့သေးဘူးလို့ ဆိုရမှာပါ။',
    },
    {
      en: 'Meanwhile, in the backdrop of that feel-good moment, the Administration announced that Temporary Protected Status (TPS) for Burma (Myanmar) will end, on the grounds that it is now \u201csafe\u201d for Burmese seeking refuge in the United States to go back to where they belong. The turkeys got clemency. The refugees, a deadline.',
      my: 'ဒါပေမဲ့ အဲဒီလို ကြည်နူးစရာကောင်းတဲ့ မြင်ကွင်းရဲ့ နောက်ကွယ်မှာတော့ အစိုးရအဖွဲ့က \u201cမြန်မာနိုင်ငံသားများအတွက် ယာယီအကာအကွယ်ပေးထားမှု အစီအစဉ် (TPS) ကို အဆုံးသတ်တော့မယ်\u201d လို့ ကြေညာခဲ့ပါတယ်။ အမေရိကန်မှာ ခိုလှုံခွင့် တောင်းခံနေရသူတွေအတွက် နေရပ်ပြန်ဖို့ \u201cလုံခြုံစိတ်ချရပြီ\u201d လို့ အကြောင်းပြပါတယ်။ ကြက်ဆင်တွေက လွတ်ငြိမ်းချမ်းသာခွင့် ရသွားပါတယ်။ ဒုက္ခသည်တွေကတော့ သတ်မှတ်ရက် (Deadline) တစ်ခု ရလိုက်ပါတယ်။',
    },
    {
      en: 'I say that with a little heaviness and a little humor\u2014no offence to the blessed birds or the many Americans who honestly believe TPS has to end sometime. They\u2019re right about one thing: TPS is temporary by design. It should be consistently reviewed and definitely not become a back door for people who do not face imminent danger in Burma or those who might pose a risk to the American people. The question is not whether TPS will end. Rather it\u2019s how and on whose narrative. Right now, the story being used to justify terminating TPS for Burma sounds suspiciously like it was drafted in Naypyidaw, not in Washington. And that is dangerous\u2014for Burmese lives, for American credibility, and for the broader project of making the world a little safer from scam centres, critically dirty minerals, and fashionably trending authoritarian strongmen.',
      my: 'ကျွန်တော် ဒီစကားကို လေးလံတဲ့စိတ်၊ ဟာသဉာဏ် နည်းနည်းနှောပြီး ပြောနေတာဟာ ကံကောင်းတဲ့ ကြက်ဆင်တွေကို စော်ကားလိုလို့ မဟုတ်သလို၊ TPS ဆိုတာ တချိန်ချိန်မှာ ပြီးဆုံးရမယ်လို့ ရိုးသားစွာ ယုံကြည်တဲ့ အမေရိကန် ပြည်သူတွေကို စော်ကားလိုလို့လည်း မဟုတ်ပါဘူး။ သူတို့ အချက်တစ်ချက် မှန်ပါတယ်။ TPS ဆိုတာ မူလရည်ရွယ်ချက်ကတည်းက ယာယီ (Temporary) ပါ။ ဒါကို စဉ်ဆက်မပြတ် ပြန်လည်သုံးသပ်သင့်တာ မှန်ပါတယ်။ မြန်မာပြည်မှာ အန္တရာယ်ကြီးကြီးမားမား မရှိတဲ့သူတွေ (သို့) အမေရိကန် ပြည်သူတွေအတွက် အန္တရာယ်ဖြစ်စေနိုင်တဲ့ သူတွေအတွက် နောက်ဖေးပေါက် ဖြစ်မသွားသင့်တာလည်း မှန်ပါတယ်။ မေးခွန်းက TPS အဆုံးသတ်မှာလား၊ မသတ်ဘူးလား ဆိုတာ မဟုတ်ပါဘူး။ မေးခွန်းက ဘယ်လို အဆုံးသတ်မှာလဲ နဲ့ ဘယ်သူ့ရဲ့ ဇာတ်လမ်း (Narrative) အပေါ် အခြေခံပြီး ဆုံးဖြတ်မှာလဲ ဆိုတာသာ ဖြစ်ပါတယ်။ အခုလောလောဆယ်မှာ မြန်မာ TPS ရပ်စဲဖို့ အကြောင်းပြချက်အဖြစ် သုံးနေတဲ့ ဇာတ်လမ်းက ဝါရှင်တန်မှာ ရေးဆွဲထားတာ မဟုတ်ဘဲ နေပြည်တော်မှာ ရေးဆွဲထားတာနဲ့ သံသယဖြစ်စရာကောင်းလောက်အောင် တူလွန်းနေပါတယ်။ ဒါဟာ အန္တရာယ် ရှိပါတယ်။ မြန်မာပြည်သူတွေရဲ့ အသက်အိုးအိမ်အတွက် အန္တရာယ်ရှိသလို၊ အမေရိကန်ရဲ့ ဂုဏ်သိက္ခာအတွက်၊ ပြီးတော့ ကျားဖြန့်စခန်းတွေ၊ ညစ်ပတ်တဲ့ သယံဇာတတွေနဲ့ ခေတ်စားနေတဲ့ အာဏာရှင်တွေ ရန်ကနေ ကမ္ဘာကြီးကို ပိုလုံခြုံအောင် လုပ်မယ့် စီမံကိန်းကြီးတစ်ခုလုံးအတွက်လည်း အန္တရာယ် ရှိပါတယ်။',
    },
  ],

  sections: [
    // 1. A brown Burmese kid in a red state
    {
      title: {
        en: 'A brown Burmese kid in a red state',
        my: 'ရှေးရိုးစွဲ ပြည်နယ်တစ်ခုဆီ ရောက်သွားတဲ့ အသားညိုညို မြန်မာကျောင်းသားလေး',
      },
      paragraphs: [
        {
          en: 'For the first half of the 2010s, I studied at The College of Wooster in Ohio. On paper, a \u201cliberal arts pursuing Burmese kid\u201d in the Midwest sounds like a setup for a standup routine. In practice, it was one of the most formative experiences of my life.',
          my: 'နည်းနည်းလောက် နောက်ကြောင်းပြန်ပါရစေ။ ၂၀၁၀ ပြည့်လွန်နှစ်တွေရဲ့ အစပိုင်းကာလမှာ အိုဟိုင်းယိုး (Ohio) ပြည်နယ်၊ The College of Wooster မှာ ကျွန်တော် ဘွဲ့ကြိုတန်း တက်ခဲ့ပါတယ်။ စာရွက်ပေါ်မှာ ကြည့်ရင်တော့ \u201cဝိဇ္ဇာပညာသင် (Liberal Arts) အသားညိုညို မြန်မာကျောင်းသားလေး တစ်ယောက် အမေရိကန် အနောက်အလယ်ပိုင်း (Midwest) အသည်းနှလုံးထဲ ရောက်သွားခြင်း\u201d ဆိုတာ ဟာသတစ်ခုလို ဖြစ်နေနိုင်ပါတယ်။ ဒါပေမဲ့ လက်တွေ့မှာတော့ အဲဒီအချိန်တွေဟာ ကျွန်တော့်ဘဝရဲ့ အရေးအပါဆုံး အတွေ့အကြုံတွေ ဖြစ်ခဲ့ပါတယ်။',
        },
        {
          en: 'At first, it did feel like a juxtaposition: best and brightest students from all over the world living on campus surrounded by cornfields, Amish buggies, and pickup trucks revving down Beall Ave on Rumspringa. But when critical thinking meets Midwestern values, something surprising happens. Over seasonal potlucks and Thanksgiving meals, you start hearing the deeper story.',
          my: 'စရောက်ကာစကတော့ တော်တော် ကွာခြားတယ်လို့ ခံစားရပါတယ်။ ကျောင်းဝင်းထဲမှာ ကမ္ဘာအရပ်ရပ်က ထူးချွန်ကျောင်းသားတွေ ရှိနေပေမယ့်၊ ကျောင်းပြင်ပမှာတော့ ပြောင်းခင်းတွေ၊ အေမစ် (Amish) လူမျိုးတွေရဲ့ မြင်းလှည်းတွေနဲ့ Beall လမ်းမကြီးပေါ်က ပစ်ကပ်ကားတွေ ဝန်းရံနေပါတယ်။ ဒါပေမဲ့ ဝေဖန်ပိုင်းခြား တွေးခေါ်မှု (Critical Thinking) နဲ့ Midwestern တန်ဖိုးထားမှုများ ပေါင်းစပ်လိုက်တဲ့အခါ အံ့ဩစရာကောင်းတဲ့ အရာတစ်ခု ဖြစ်လာပါတယ်။ ရာသီပေါ် အစားအသောက်တွေနဲ့ Thanksgiving ထမင်းဝိုင်းတွေမှာ သူတို့ဆီက ပိုလေးနက်တဲ့ ဇာတ်လမ်းတွေကို ကြားလာရပါတယ် -',
        },
      ],
      bullets: [
        {
          en: 'Factories that once anchored whole towns closing down and never coming back.',
          my: 'တစ်ချိန်က မြို့လုံးကျွတ် မှီခိုခဲ့ရတဲ့ စက်ရုံကြီးတွေ ပိတ်သိမ်းသွားပြီး ဘယ်တော့မှ ပြန်မဖွင့်တော့တဲ့ အကြောင်း။',
        },
        {
          en: 'Parents working two or three jobs while worrying about fentanyl and opioids, school shootings, and whether their kids will ever afford a home.',
          my: 'မိဘတွေက အလုပ် ၂ ခု၊ ၃ ခု လုပ်ရင်း ဖန်တာနိုင်း (Fentanyl) နဲ့ ဘိန်းဖြူ အန္တရာယ်၊ ကျောင်းတွင်း ပစ်ခတ်မှုတွေနဲ့ သူတို့ကလေးတွေ အိမ်ပိုင်နိုင်ပါ့မလား ဆိုတာကို စိုးရိမ်နေရတဲ့ အကြောင်း။',
        },
        {
          en: 'People who feel talked down to by elites but ignored when they say, \u201cWe\u2019re not against immigration, we\u2019re against chaos.\u201d',
          my: '\u201cငါတို့က လူဝင်မှုကြီးကြပ်ရေးကို ဆန့်ကျင်တာ မဟုတ်ဘူး၊ ဖရိုဖရဲဖြစ်နေတာ (Chaos) ကို ဆန့်ကျင်တာ\u201d လို့ ပြောတဲ့အခါ အထက်စီးက ဆက်ဆံခံရသလို ခံစားရပြီး လစ်လျူရှုခံရတဲ့ လူတွေအကြောင်း။',
        },
      ],
      closing: {
        en: 'If you only scroll through your newsfeed, you might think these fears are just \u201cxenophobia.\u201d Sitting down together at a dining table in Wooster, you soon realize they\u2019re often grief in disguise\u2014grief for lost security, lost dignity, and a world that has moved on without their consent. And yet, those same Midwesterners would go out of their way to drive brown kids like me to Walmart, invite us in like their own family, and check on our families when they saw something terrible happening 8,000 miles away. Their moral compass was simple and biblical: love thy neighbor, be a good steward, do not ignore evil when you have the power to stop it. That\u2019s the America I know: deeply proud, but also deeply generous. So when conservatives say, \u201cTPS can\u2019t be forever; we need firm borders and serious vetting,\u201d I don\u2019t hear cruelty. I hear people who have seen too much chaos and simply don\u2019t want to be caught off-guard again. The irony is: we feel exactly the same way.',
        my: 'Facebook ပေါ်က သတင်းတွေကိုပဲ ဖတ်ကြည့်ရင်တော့ ဒီအကြောက်တရားတွေကို \u201cလူမျိုးခြားကြောက်ရောဂါ (Xenophobia)\u201d လို့ ထင်စရာ ရှိပါတယ်။ ဒါပေမဲ့ Wooster မြို့က ထမင်းစားပွဲမှာ အတူထိုင်ပြီး နားထောင်ကြည့်လိုက်ရင်တော့ ဒါတွေဟာ ရုပ်ဖျက်ထားတဲ့ ဝမ်းနည်းပူဆွေးမှု (Grief in disguise) တွေ ဖြစ်ကြောင်း သိလာရပါတယ်။ လုံခြုံမှုတွေ ပျောက်ဆုံးသွားလို့၊ ဂုဏ်သိက္ခာတွေ ပျောက်ဆုံးသွားလို့၊ ပြီးတော့ သူတို့ သဘောဆန္ဒမပါဘဲ ပြောင်းလဲသွားတဲ့ ကမ္ဘာကြီးအတွက် ဝမ်းနည်းနေကြတာပါ။ ဒါပေမဲ့ အဲဒီ Midwestern သားတွေကပဲ ကျွန်တော်တို့လို အသားညိုညို ကလေးတွေ မိုးထဲလေထဲ လမ်းလျှောက်နေတာတွေ့ရင် Walmart ကို ကားလိုက်ပို့ပေးတတ်ကြပါတယ်။ Thanksgiving ပွဲတွေ၊ တနင်္လာနေ့ည ဘောလုံးပွဲတွေမှာ မိသားစုဝင်လို ခေါ်ကျွေးတတ်ကြပါတယ်။ ကမ္ဘာ့ဟိုဘက်ခြမ်း မိုင် ၈၀၀၀ အကွာမှာ အခြေအနေဆိုးနေတယ်လို့ TV မှာ တွေ့ရင် ကျွန်တော့်မိသားစု အဆင်ပြေရဲ့လားဆိုပြီး မေးမြန်းပေးကြပါတယ်။ မြန်မာ့နိုင်ငံရေးအကြောင်း ကျွန်တော့်ကို (ကြင်နာစွာနဲ့) မေးခွန်းထုတ်ပြီးရင်တော့ ကန်စွန်းဥဟင်း (Sweet potato casserole) တစ်ပန်းကန်နဲ့ Pecan သီးတွေပါတဲ့ ရွှေဖရုံသီးမုန့် (Pumpkin Pie) တစ်စိတ် ထပ်ထည့်ပေးတတ်ပါတယ်။ သူတို့ရဲ့ ကိုယ်ကျင့်တရား စံနှုန်းက ရိုးရှင်းပြီး ခရစ်ယာန်ဆန်ပါတယ် - \u201cအိမ်နီးချင်းကို ချစ်ပါ၊ ကောင်းသော အမှုတော်ကို ဆောင်ပါ၊ မကောင်းမှု ဒုစရိုက်ကို တားဆီးနိုင်တဲ့ အင်အားရှိလျက်နဲ့ လစ်လျူမရှုပါနဲ့။\u201d ဒါဟာ ကျွန်တော်သိတဲ့ အမေရိကန်ပါပဲ - အလွန် ဂုဏ်ယူတတ်သလို၊ အလွန်လည်း ရက်ရောတတ်တဲ့ နိုင်ငံ။ ဒါကြောင့် ရှေးရိုးစွဲဝါဒီ (Conservatives) တွေက \u201cTPS ဆိုတာ ထာဝရ မဖြစ်သင့်ဘူး၊ ခိုင်မာတဲ့ နယ်စပ်နဲ့ စေ့စေ့စပ်စပ် စိစစ်မှုတွေ လိုတယ်\u201d လို့ ပြောရင် ကျွန်တော်က ဒါကို ရက်စက်မှုလို့ မမြင်ပါဘူး။ ဖရိုဖရဲနိုင်မှုတွေ၊ ပျက်ကွက်ခဲ့တဲ့ ကတိတွေ များလွန်းလို့ နောက်ထပ် အလိမ်မခံချင်တော့တဲ့ လူတွေရဲ့ စကားသံလို့ပဲ ကြားပါတယ်။ ရယ်စရာကောင်းတာက... ကျွန်တော်တို့လည်း အဲဒီလိုပဲ ခံစားရလို့ပါပဲ။',
      },
    },

    // 2. TPS is temporary
    {
      title: {
        en: 'TPS is temporary\u2014but the framing must reflect contemporary reality',
        my: 'TPS ဆိုတာ ယာယီပါ - ဒါပေမဲ့ \u201cခေါင်းစဉ်တပ်ပုံ (Framing)\u201d က လက်ရှိအမှန်တရားကို ထင်ဟပ်ရပါမယ်',
      },
      paragraphs: [
        {
          en: 'By law and by logic, TPS is temporary. It\u2019s meant for \u201cextraordinary and temporary conditions\u201d\u2014a war, a disaster\u2014that make safe return impossible. When those conditions truly change, TPS should be revised outright.',
          my: 'ဥပဒေအရရော ယုတ္တိဗေဒအရပါ TPS ဆိုတာ ယာယီ (Temporary) ပါ။ စစ်ပွဲတွေ၊ သဘာဝဘေးတွေလို \u201cထူးခြားပြီး ယာယီအခြေအနေတွေ\u201d ကြောင့် နေရပ်ပြန်ဖို့ မဖြစ်နိုင်တဲ့အခါ ပေးထားတဲ့ အရာပါ။ အဲဒီအခြေအနေတွေ တကယ်ပြောင်းလဲသွားရင် TPS ကို ပြန်လည်သုံးသပ်သင့်ပါတယ်။',
        },
        {
          en: 'If DHS had calmly said: \u201cBurma remains extremely dangerous, but TPS was never designed as a permanent solution. We\u2019re ending it while simultaneously working with Congress on a path for long-resident Burmese TPS holders to adjust, and we\u2019re ramping up pressure on the junta,\u201d we would still be scared, but at least the story would be Midwest honesty.',
          my: 'အကယ်၍ အမိမြေလုံခြုံရေးဌာန (DHS) ကသာ အခုလို တည်ငြိမ်စွာ ပြောခဲ့မယ်ဆိုရင် - ... အဲဒီလိုသာ ပြောရင် ကျွန်တော်တို့ ကြောက်နေရဦးမှာ ဖြစ်ပေမယ့်၊ အနည်းဆုံးတော့ ဇာတ်လမ်းက Midwest ရိုးသားမှုမျိုး ရှိပါသေးတယ်။',
        },
        {
          en: 'Instead, the official justification leans on phrases like \u201cnotable progress in governance and stability,\u201d the lifting of the state of emergency, planned \u201cfree and fair elections,\u201d and ceasefires\u2014as if Burma were staggering toward normalcy. That framing would be questionable even if Burma stood alone. But TPS wasn\u2019t just ended for Burma. It was terminated for a big cluster of countries at once\u2014nearly twenty designations\u2014under a general offensive to tighten humanitarian protections and \u201creturn TPS to its original, temporary purpose.\u201d',
          my: 'ဒါပေမဲ့ လက်တွေ့မှာတော့ တရားဝင် အကြောင်းပြချက်တွေက \u201cအုပ်ချုပ်ရေးနှင့် တည်ငြိမ်မှုတွင် သိသာထင်ရှားသော တိုးတက်မှုများ\u201d၊ အရေးပေါ်အခြေအနေ ရုပ်သိမ်းခြင်း၊ \u201cလွတ်လပ်ပြီး တရားမျှတသော ရွေးကောက်ပွဲများ\u201d၊ အပစ်အခတ်ရပ်စဲရေးများ စတဲ့ စကားလုံးတွေကို မှီခိုနေပါတယ်။ မြန်မာပြည်က ပုံမှန်အခြေအနေဆီ တရွေ့ရွေ့သွားနေသယောင် ပြောဆိုနေပါတယ်။ ဒီလို ခေါင်းစဉ်တပ်တာ (Framing) ဟာ မြန်မာပြည် တစ်နိုင်ငံတည်း ဆိုရင်တောင် မေးခွန်းထုတ်စရာ ဖြစ်နေပါပြီ။ ဒါပေမဲ့ TPS ဟာ မြန်မာပြည် တစ်နိုင်ငံတည်းအတွက် ရပ်စဲခံရတာ မဟုတ်ပါဘူး။ လူသားချင်းစာနာမှုဆိုင်ရာ အကာအကွယ်တွေကို တင်းကျပ်ပြီး \u201cTPS ကို မူလရည်ရွယ်ချက်အတိုင်း ယာယီအဖြစ် ပြန်ရောက်စေရေး\u201d ဆိုတဲ့ မူဝါဒအောက်မှာ နိုင်ငံ ၂၀ နီးပါးအတွက် တပြိုင်နက်တည်း ရပ်စဲခံရတာ ဖြစ်ပါတယ်။',
        },
        {
          en: 'Ending multiple programs is a political choice; how you frame each one is a moral and strategic one. In Burma\u2019s case, the sequence and the narrative are a propaganda gift to the generals. If you were trying to design a propaganda win for the junta, you couldn\u2019t do much better than choreographed raids, selective prisoner releases, and DHS language echoing \u201cnotable progress.\u201d The problem is not just that TPS is ending, but that the narrative of its termination is being hijacked by a thuggish regime that only treats its population as hostages.',
          my: 'အစီအစဉ်အများအပြားကို ရပ်စဲတာက နိုင်ငံရေး ရွေးချယ်မှု (Political Choice) ပါ။ ဒါပေမဲ့ တစ်ခုချင်းစီကို ဘယ်လို ခေါင်းစဉ်တပ်မလဲ ဆိုတာကတော့ ကိုယ်ကျင့်တရားနဲ့ မဟာဗျူဟာဆိုင်ရာ ရွေးချယ်မှု ဖြစ်ပါတယ်။ မြန်မာ့ကိစ္စမှာတော့ ဒီအဖြစ်အပျက် အစီအစဉ်နဲ့ ဇာတ်လမ်းဟာ ဗိုလ်ချုပ်တွေအတွက် ဝါဒဖြန့်ချိရေး အောင်ပွဲပါပဲ။ ဒါဟာ ပြဿနာပါပဲ - TPS ရပ်စဲလိုက်တာ သက်သက် မဟုတ်ဘဲ၊ ရပ်စဲဖို့ အကြောင်းပြချက်ပေးပုံက ပြည်သူလူထုကို ဓားစာခံလို ဆက်ဆံနေဆဲဖြစ်တဲ့ လူမိုက်အစိုးရတစ်ရပ်က ပြန်ပေးဆွဲ (Hijack) သွားခြင်း ပါပဲ။',
        },
      ],
    },

    // 3. The junta's "improvements"
    {
      title: {
        en: 'The junta\u2019s \u201cimprovements\u201d: hostages, not citizens',
        my: 'စစ်ကောင်စီ၏ \u201cတိုးတက်မှုများ\u201d - နိုင်ငံသားများ မဟုတ်၊ ဓားစာခံများသာ',
      },
      intro: {
        en: 'The Burmese military has indeed made some loud gestures lately: ending the formal state of emergency, announcing elections, and releasing a batch of prisoners mostly convicted under the post-coup amended incitement law. If you squint hard enough from far enough away, this can look like sunshine on a gloomy day. But the basics haven\u2019t changed.',
        my: 'မြန်မာစစ်တပ်ဟာ မကြာသေးမီက အသံကျယ်ကျယ်ထွက်တဲ့ ဟန်ပြလုပ်ရပ်တချို့ လုပ်ခဲ့ပါတယ် - တရားဝင် အရေးပေါ်အခြေအနေကို ရုပ်သိမ်းလိုက်တယ်။ ဒါပေမဲ့ အခြေခံအချက်တွေက မပြောင်းလဲပါဘူး -',
      },
      bullets: [
        {
          en: 'Aung San Suu Kyi and President Win Myint remain detained alongside thousands of political prisoners, student activists, and journalists.',
          my: 'ဒေါ်အောင်ဆန်းစုကြည်နဲ့ သမ္မတ ဦးဝင်းမြင့် ဆက်လက် အထိန်းသိမ်းခံ နေရဆဲပါ။ ကျောင်းသားခေါင်းဆောင်တွေ၊ သတင်းစာဆရာတွေ၊ ရပ်မိရပ်ဖတွေ အပါအဝင် ထောင်ပေါင်းများစွာသော နိုင်ငံရေးအကျဉ်းသားတွေ ဆက်လက် ဖမ်းဆီးခံထားရဆဲ (သို့) ပျောက်ဆုံးနေဆဲပါ။',
        },
        {
          en: 'The National Unity Government and most Ethnic Resistance Organizations are excluded from any real dialogue.',
          my: 'NUG နဲ့ တိုင်းရင်းသားလက်နက်ကိုင် အများစုကို စစ်မှန်တဲ့ ဆွေးနွေးပွဲတွေကနေ ဖယ်ထုတ်ထားပါတယ်။',
        },
        {
          en: 'Airstrikes, artillery attacks, and burnings of churches, schools, hospitals, and villages continue in many parts of the country.',
          my: 'လေကြောင်းတိုက်ခိုက်မှုတွေ၊ လက်နက်ကြီးပစ်ခတ်မှုတွေနဲ့ ရွာမီးရှို့မှုတွေ၊ ဘုရားကျောင်း၊ ကျောင်း၊ ဆေးရုံ မီးရှို့မှုတွေ ဆက်လက် ဖြစ်ပွားနေပါတယ်။',
        },
      ],
      closing: {
        en: 'Everyone under junta control knows the score: you are free until you are not. Anyone \u201creleased\u201d can be re-detained with a Facebook post, a rumor, or no reason at all\u2014including people deported back. When DHS implies Burma is now safe enough for mass return, it isn\u2019t just morally wrong; it\u2019s practically dangerous. It hands the junta a list of potential hostages and a ready-made talking point: \u201cWashington agrees conditions have improved. Those who come back now but cause trouble? Clearly, they are criminals, not victims.\u201d Even ASEAN\u2014who normally specialize in understatement\u2014aren\u2019t buying it. When countries that rarely champion human rights start conceding that the polls are a sham and that Aung San Suu Kyi\u2019s continued detention makes any \u201ctransition\u201d illegitimate, Washington should listen.',
        my: 'ခင်ဗျားဟာ မလွတ်လပ်မချင်း လွတ်လပ်နေတာပါ (You are free until you are not)။ \u201cလွတ်လာသူ\u201d ဘယ်သူမဆို Facebook ပို့စ်တစ်ခုကြောင့်၊ ကောလဟာလတစ်ခုကြောင့် (သို့) ဘာအကြောင်းပြချက်မှ မရှိဘဲ ပြန်ဖမ်းခံရနိုင်ပါတယ်။ ရွေးကောက်ပွဲအကြောင်း၊ စစ်ပွဲအကြောင်း၊ စီးပွားရေးအကြောင်း ရိုးရိုးသားသား ပြောမိသူတိုင်း ညသန်းခေါင် တံခါးလာခေါက်ခံရမယ့် အန္တရာယ် ရှိပါတယ်။ အဲဒီအထဲမှာ ပြန်ပို့ခံရတဲ့ သူတွေလည်း ပါပါတယ်။ ဒါကြောင့် DHS က မြန်မာပြည်ဟာ လူအများအပြား နေရပ်ပြန်ဖို့ လုံခြုံနေပြီလို့ ပြောလိုက်တာဟာ ကိုယ်ကျင့်တရားအရ မှားယွင်းရုံတင် မကပါဘူး၊ လက်တွေ့မှာလည်း အန္တရာယ် များပါတယ်။ စစ်ကောင်စီလက်ထဲကို \u201cအလားအလာရှိသော ဓားစာခံစာရင်း\u201d တစ်ခု ထည့်ပေးလိုက်သလို ဖြစ်နေပြီး၊ သူတို့ ပြောချင်တဲ့ စကားအတွက် အခွင့်အရေး ပေးလိုက်သလို ဖြစ်နေပါတယ်။ ပုံမှန်အားဖြင့် သံခင်းတမန်ခင်း ပြောဆိုတတ်တဲ့ အာဆီယံ သံတမန်တွေတောင် စစ်ကောင်စီရဲ့ ရိုးသားမှုကို မယုံကြပါဘူး။ ပြည်တွင်းရေး ဝင်မစွက်ဖက်ရေး မူဝါဒကို ကိုင်စွဲတဲ့ နိုင်ငံတွေကတောင် ဒီရွေးကောက်ပွဲဟာ အတုအယောင် ဖြစ်တယ်၊ ဒေါ်စုကို ဆက်ဖမ်းထားသရွေ့ ဘယ်လို \u201cအကူးအပြောင်း\u201d မှ တရားမဝင်နိုင်ဘူးလို့ တိတ်တဆိတ် ဝန်ခံနေကြပြီ ဆိုရင်... ဝါရှင်တန်အနေနဲ့ နားထောင်သင့်ပါပြီ။',
      },
    },

    // 4. Congress gets it
    {
      title: {
        en: 'Congress gets it. DHS should catch up.',
        my: 'လွှတ်တော် (Congress) က သဘောပေါက်ပါတယ်၊ DHS လည်း အမီလိုက်သင့်ပါပြီ',
      },
      paragraphs: [
        {
          en: 'A recent House Foreign Affairs Committee joint hearing\u2014\u201cNo Exit Strategy: Burma\u2019s Endless Crisis and America\u2019s Limited Options\u201d\u2014brought together Republican and Democrat members with a remarkably aligned message.',
          my: 'အမေရိကန်ရဲ့ လက်တွေ့ကျတဲ့ သဘောထား ဘယ်လိုရှိသင့်သလဲ သိချင်ရင် မကြာသေးမီက ပြုလုပ်ခဲ့တဲ့ အောက်လွှတ်တော် နိုင်ငံခြားရေးရာ ကော်မတီရဲ့ ပူးတွဲကြားနာပွဲ ကို ကြည့်ပါ။ ခေါင်းစဉ်က \u201cထွက်ပေါက်မရှိသော မဟာဗျူဟာ - မြန်မာ့အဆုံးမဲ့ အကျပ်အတည်းနှင့် အမေရိကန်၏ အကန့်အသတ်ရှိသော ရွေးချယ်စရာများ\u201d ဖြစ်ပါတယ်။ ပါတီနှစ်ရပ်လုံး (ရီပတ်ဘလစ်ကန်နဲ့ ဒီမိုကရက်) က အမတ်တွေ ပါဝင်ပြီး သဘောထားတွေ ထူးခြားစွာ တူညီနေကြပါတယ် -',
        },
        {
          en: 'In resolute bi-partisan spirit, members called the upcoming election a \u201csham,\u201d emphasized that no election can be credible while Aung San Suu Kyi and other key leaders remain imprisoned and large parts of the population are under bombardment, and urged the Administration to appoint a Special Representative and Policy Coordinator for Burma to pull together sanctions, diplomacy, and support for democracy in a coherent strategy.',
          my: 'လာမယ့် ရွေးကောက်ပွဲကို ဒီမိုကရေစီ မှတ်တိုင်မဟုတ်ဘဲ \u201cအတုအယောင် (Sham)\u201d နဲ့ \u201cပြဇာတ်\u201d သာ ဖြစ်ကြောင်း ပြောကြားခဲ့ကြပါတယ်။ ဒေါ်အောင်ဆန်းစုကြည်နဲ့ အဓိကခေါင်းဆောင်တွေ ထောင်ထဲရှိနေသရွေ့၊ ပြည်သူအများအပြား ဗုံးကြဲခံနေရသရွေ့ ဘယ်ရွေးကောက်ပွဲမှ ယုံကြည်လက်ခံနိုင်ဖွယ် မရှိကြောင်း အလေးပေး ပြောကြားခဲ့ကြပါတယ်။ စစ်ကောင်စီရဲ့ အစီအစဉ်ကို လူသိရှင်ကြား ရှုတ်ချဖို့ နဲ့ ပိတ်ဆို့မှု၊ သံတမန်ရေး၊ ဒီမိုကရေစီ ထောက်ခံမှုတွေကို မဟာဗျူဟာကျကျ ပေါင်းစပ်ဖို့ မြန်မာနိုင်ငံဆိုင်ရာ အထူးကိုယ်စားလှယ် ခန့်အပ်ဖို့ အစိုးရကို တိုက်တွန်းခဲ့ကြပါတယ်။',
        },
        {
          en: 'DHS doesn\u2019t have to change its legal conclusion tomorrow to change its language today. A small narrative shift\u2014stating that Burma remains profoundly unsafe, that TPS is ending as part of a broader policy shift, and that the U.S. rejects the junta\u2019s sham election while demanding the release of all political prisoners\u2014would deny the junta a propaganda trophy while still allowing DHS to pursue its immigration agenda. It costs nothing, but gains a great deal in moral clarity.',
          my: 'DHS အနေနဲ့ မူဝါဒကို ချက်ချင်း ပြောင်းစရာ မလိုပါဘူး၊ အသုံးအနှုန်း (Language) ကို ပြောင်းလိုက်ရုံပါပဲ။ မြန်မာပြည်ဟာ အလွန်အမင်း မလုံခြုံသေးပါဘူး။ TPS ရပ်စဲတာဟာ မူဝါဒ အပြောင်းအလဲရဲ့ အစိတ်အပိုင်း တစ်ခုသာ ဖြစ်ပြီး၊ စစ်ကောင်စီက လွတ်လပ်မှုနဲ့ တည်ငြိမ်မှုကို ပြန်လည် ဖော်ဆောင်ပေးနိုင်လို့ မဟုတ်ပါဘူး။ အဲဒီလို ဇာတ်လမ်း အပြောင်းအလဲလေး လုပ်လိုက်ရုံနဲ့ DHS ဟာ သူ့ရဲ့ လူဝင်မှုကြီးကြပ်ရေး အစီအစဉ်ကို ဆက်လုပ်နိုင်သလို၊ တချိန်တည်းမှာပဲ စစ်ကောင်စီရဲ့ ဝါဒဖြန့်ချိရေး အောင်ပွဲကို တားဆီးနိုင် ပါလိမ့်မယ်။ ဥပဒေအရ ဘာမှ ကုန်ကျစရိတ် မရှိဘဲ၊ ကိုယ်ကျင့်တရားဆိုင်ရာ ရှင်းလင်းပြတ်သားမှု (Moral Clarity) ကို အများကြီး ရရှိစေမယ့် နည်းလမ်းပါ။',
        },
      ],
    },

    // 5. Yes, vet carefully
    {
      title: {
        en: 'Yes, vet carefully. But don\u2019t mow down the entire orchard.',
        my: 'TPS ဆွေးနွေးပွဲတွေမှာ လေးလေးနက်နက် ထည့်သွင်းစဉ်းစားရမယ့် နောက်ထပ် စိုးရိမ်ပူပန်မှု တစ်ခုကတော့ လုံခြုံရေး (Security) ပါ။',
      },
      paragraphs: [
        {
          en: 'Stories of violent crimes or terrorism by people with foreign ties hit a nerve, and rightly so. When Americans see a headline about an asylum seeker involved in a brutal shooting\u2014or about sanctioned regime affiliates trying to sneak in to launder money and reputation\u2014the instinct to say \u201cenough\u201d is understandable. As a refugee, I don\u2019t ask you to ignore that instinct. We too share it.',
          my: 'နိုင်ငံခြား အဆက်အသွယ်ရှိသူတွေရဲ့ အကြမ်းဖက်မှု (သို့) အကြမ်းဖက်ဝါဒ သတင်းတွေဟာ လူထုရဲ့ စိတ်ကို ထိခိုက်စေပါတယ်။ ခိုလှုံခွင့်တောင်းခံသူ တစ်ယောက်က ပစ်ခတ်မှု ကျူးလွန်တယ် ဆိုတဲ့ ခေါင်းစဉ်မျိုး (သို့) ပိတ်ဆို့ခံထားရတဲ့ အစိုးရနဲ့ ပတ်သက်သူတွေက ငွေကြေးခဝါချဖို့ ဝင်ရောက်လာတယ် ဆိုတဲ့ သတင်းမျိုး မြင်ရတဲ့အခါ အမေရိကန်တွေက \u201cတော်ပါတော့\u201d လို့ ပြောချင်ကြတာ နားလည်ပေးလို့ ရပါတယ်။ ဒုက္ခသည် တစ်ယောက်အနေနဲ့ အဲဒီလို ပြောချင်တဲ့ စိတ်ဆန္ဒကို လစ်လျူရှုဖို့ ကျွန်တော် မတိုက်တွန်းပါဘူး။ ကျွန်တော်တို့လည်း အဲဒီလိုပဲ ခံစားရပါတယ်။',
        },
        {
          en: 'We have no interest in seeing junta cronies use our communities as safe havens or backdoors for sanctions evasion. We have no tolerance for anyone\u2014Burmese or otherwise\u2014who uses America\u2019s openness to harm Americans. And we are painfully aware that one \u201cbad apple\u201d story can overshadow thousands of quiet, law-abiding lives. The answer, though, is not to decimate the whole orchard.',
          my: 'စစ်ကောင်စီ ခရိုနီတွေ က ကျွန်တော်တို့ရဲ့ အသိုင်းအဝိုင်းတွေကို သူတို့ရဲ့ ခိုလှုံရာ (Safe Havens) (သို့) ပိတ်ဆို့မှု ရှောင်ရှားရာ နောက်ဖေးပေါက်တွေအဖြစ် သုံးနေတာကို ကျွန်တော်တို့ လုံးဝ မလိုလားပါဘူး။ အမေရိကန်ရဲ့ တံခါးဖွင့်ဝါဒကို အခွင့်ကောင်းယူပြီး အမေရိကန်တွေကို ဒုက္ခပေးမယ့် ဘယ်သူ့ကိုမှ (မြန်မာဖြစ်စေ၊ တခြားဖြစ်စေ) ကျွန်တော်တို့ သည်းမခံပါဘူး။ \u201cပုပ်နေတဲ့ ပန်းသီး\u201d တစ်လုံးကြောင့် တည်ငြိမ်အေးချမ်းစွာ နေထိုင်နေကြတဲ့ ထောင်ပေါင်းများစွာသော ဘဝတွေ အရိပ်မည်း ဖုံးသွားတတ်တာကိုလည်း ကျွန်တော်တို့ ကောင်းကောင်း သိပါတယ်။ ဒါပေမဲ့ အဖြေကတော့... ဥယျာဉ်တစ်ခုလုံးကို ခုတ်လှဲပစ်လိုက်ဖို့ မဟုတ်ပါဘူး။',
        },
      ],
      bullets: [
        {
          en: 'Vetting should be meticulous. If someone has ties to the military, its militias, or its financial networks, scrutinize them harder than anyone else.',
          my: 'ပိတ်ဆို့မှု ရှောင်ရှားသူတွေကို လိုက်လံ ဖော်ထုတ်ပါ (Sanctions evasion should be hunted down). အထူးသဖြင့် ဟန်ပြကုမ္ပဏီတွေ၊ Crypto အကောင့်တွေနဲ့ အိမ်ခြံမြေ ဈေးကွက်တွေကနေတဆင့် လုပ်ဆောင်နေတာတွေကို ဖော်ထုတ်ပါ။',
        },
        {
          en: 'Sanctions evasion should be hunted down, especially through shell companies, crypto accounts, and high-end real estate.',
          my: 'အကောက်ခွန်နှင့် နယ်စပ်ကာကွယ်ရေး (CBP) ဖောင်တွေမှာ လိမ်ညာသူတွေ၊ ကြီးလေးတဲ့ ရာဇဝတ်မှု ကျူးလွန်သူတွေ (သို့) အန္တရာယ် ရှိသူတွေကို တရားစွဲပြီး လိုအပ်ရင် နေရပ်ပြန်ပို့ပါ။',
        },
        {
          en: 'People who lie on Customs & Border Protection forms, commit serious crimes, or pose real threats should be prosecuted and, if necessary, removed.',
          my: 'စစ်ကောင်စီလက်က ထွက်ပြေးလာတဲ့ ကျွန်တော်တို့ အများစုကလည်း အဲဒါကိုပဲ လိုလား ပါတယ်။ ရာဇဝတ်ကောင် တစ်သိုက်ဆီကနေ အသက်လု ထွက်ပြေးလာပြီးမှ၊ ဒီမှာ သူတို့ထက် နည်းနည်း ပိုယဉ်ကျေးတဲ့၊ ဝတ်ကောင်းစားလှ ဝတ်ထားတဲ့ ရာဇဝတ်ကောင် နောက်တစ်သိုက်ရဲ့ လက်အောက်မှာ မနေချင်ပါဘူး။',
        },
      ],
      closing: {
        en: 'Most of us who fled the junta want exactly that. We did not risk our lives to escape one set of criminals only to live under a softer, better-dressed version of them. Border security and refugee protection are not opposites. They are two equal parts of the same project: defending a society where the law means exactly what it means and the vulnerable are shielded, not exploited.',
        my: 'နယ်စပ်လုံခြုံရေးနဲ့ ဒုက္ခသည် ကာကွယ်စောင့်ရှောက်ရေး ဆိုတာ ဆန့်ကျင်ဘက်တွေ မဟုတ်ပါဘူး။ ဥပဒေ စိုးမိုးပြီး၊ အားနည်းသူတွေကို အမြတ်မထုတ်ဘဲ ကာကွယ်ပေးတဲ့ လူ့ဘောင်အဖွဲ့အစည်း တစ်ခုကို တည်ဆောက်ခြင်း ဆိုတဲ့ စီမံကိန်းကြီး တစ်ခုတည်းရဲ့ အစိတ်အပိုင်း နှစ်ခုသာ ဖြစ်ပါတယ်။',
      },
    },

    // 6. Scam Centre Strike Force
    {
      title: {
        en: 'Scam Centre Strike Force: good start, now choose the right partners',
        my: 'မျက်နှာစာ တစ်ခုမှာတော့ အစိုးရဟာ မှန်ကန်တဲ့ ဦးတည်ချက်အတိုင်း ရွေ့လျားနေပါတယ်။ အဲဒါကတော့ မြန်မာနိုင်ငံ အပါအဝင် အရှေ့တောင်အာရှက ကျားဖြန့် အခြေစိုက်စခန်းတွေကို ပစ်မှတ်ထားမယ့် Scam Centre Strike Force ဖွဲ့စည်းလိုက်ခြင်းပါပဲ။',
      },
      paragraphs: [
        {
          en: 'On one front, the Administration has moved in exactly the right direction: the creation of a Scam Centre Strike Force that targets cyber-fraud hubs in Southeast Asia, including those in Burma. That is real leadership. Scam compounds have tortured trafficked workers and stripped victims\u2014many in the U.S.\u2014of billions of dollars. Going after them is not charity; it is a vital national-security and economic priority.',
          my: 'ဒါဟာ စစ်မှန်တဲ့ ခေါင်းဆောင်မှုပါပဲ။ ကျားဖြန့်စခန်းတွေဟာ လူကုန်ကူးခံရသူတွေကို နှိပ်စက်ပြီး၊ သားကောင်တွေ (အမေရိကန် ပြည်သူတွေ အပါအဝင်) ဆီကနေ ဒေါ်လာ ဘီလီယံပေါင်းများစွာ လိမ်ယူနေတာပါ။ သူတို့ကို နှိမ်နင်းတာဟာ အလှူဒါန မဟုတ်ပါဘူး။ အရေးကြီးတဲ့ အမျိုးသားလုံခြုံရေးနဲ့ စီးပွားရေး ဦးစားပေး လုပ်ငန်းစဉ် ဖြစ်ပါတယ်။',
        },
        {
          en: 'But there is a crucial next step: choose the right friends. If Washington leans primarily on the junta for \u201ccooperation,\u201d it will only get choreographed raids and photo-ops, low-level scapegoats, and carefully limited asset seizures. If it broadens cooperation to include local resistance actors\u2014the Karen National Union, NUG-linked structures, and EROs that actually control territory and have moral legitimacy\u2014then the Strike Force can map scam networks more accurately, cut into the crypto pipelines that move profits, and follow every linkage back to military, police, militia, and transnational sponsors.',
          my: 'ဒါပေမဲ့ အရေးကြီးတဲ့ နောက်တဆင့် ကျန်ပါသေးတယ် - မှန်ကန်တဲ့ မိတ်ဆွေကို ရွေးချယ်ဖို့ပါ။ အကယ်၍ ဝါရှင်တန်က \u201cပူးပေါင်းဆောင်ရွက်ရေး\u201d အတွက် စစ်ကောင်စီကို အဓိက အားကိုးမယ် ဆိုရင် ဟန်ပြစီးနင်းမှုတွေနဲ့ ဓာတ်ပုံရိုက်ပွဲတွေ (Photo-ops)၊ အောက်ခြေအဆင့် ပြစ်ဒဏ်ခံ ကောင်လေးတွေ (Scapegoats)၊ ပြီးတော့ သတိထား ကန့်သတ်ထားတဲ့ ပိုင်ဆိုင်မှု သိမ်းဆည်းခြင်းတွေပဲ ဖြစ်ပါလိမ့်မယ်။ အကယ်၍ ဒေသခံ တော်လှန်ရေး အင်အားစုတွေ (ဥပမာ - KNU၊ NUG ဆက်စပ် အဖွဲ့အစည်းတွေနဲ့ နယ်မြေစိုးမိုးမှုရော တရားဝင်မှုပါ ရှိတဲ့ EROs တွေ) နဲ့ ပူးပေါင်းဆောင်ရွက်မယ် ဆိုရင်တော့ Strike Force အနေနဲ့ ကျားဖြန့် ကွန်ရက်တွေကို ပိုမိုတိကျစွာ မြေပုံဖော်နိုင်မယ်၊ Crypto ပိုက်လိုင်းတွေကို ဖြတ်တောက်နိုင်မယ်၊ ကွင်းဆက်တွေကို လိုက်ပြီး စစ်တပ်၊ ရဲ နဲ့ ပြည်သူ့စစ် စပွန်ဆာတွေ၊ နိုင်ငံဖြတ်ကျော် ရာဇဝတ်ကောင်တွေ အထိ ဖော်ထုတ်နိုင်မယ်။',
        },
        {
          en: 'Imagine if a portion of the billions in confiscated crypto assets linked to scam operations were held as a kind of strategic crypto reserve for justice\u2014used to compensate victims, support rehabilitation for trafficked workers, and, yes, help fund the rebuilding of a democratic Burma one day. That would be real realpolitik: turning stolen value into leverage for accountability, not handing it back to the same people who built the scam empires.',
          my: 'စဉ်းစားကြည့်ပါ... ကျားဖြန့်လုပ်ငန်းတွေဆီကနေ သိမ်းဆည်းရမိတဲ့ Crypto ပိုင်ဆိုင်မှု ဘီလီယံပေါင်းများစွာထဲက တစိတ်တပိုင်းကို တရားမျှတမှုအတွက် မဟာဗျူဟာမြောက် Crypto ရန်ပုံငွေ (Strategic Crypto Reserve for Justice) အဖြစ် ထားရှိပြီး၊ သားကောင်တွေကို လျော်ကြေးပေးတာ၊ လူကုန်ကူးခံရသူတွေကို ပြန်လည်ထူထောင်ပေးတာ၊ ပြီးတော့ တနေ့ကျရင် ဒီမိုကရေစီ မြန်မာနိုင်ငံကို ပြန်လည်တည်ဆောက်ရာမှာ ကူညီပေးတာတွေ လုပ်နိုင်ရင် ဘယ်လောက် ကောင်းမလဲ။ အဲဒါမှ တကယ့် \u201cလက်တွေ့နိုင်ငံရေး (Realpolitik)\u201d ပါ။ ခိုးရာပါ ပစ္စည်းတွေကို တာဝန်ခံမှု ရှိစေမယ့် လက်နက်အဖြစ် ပြောင်းလဲလိုက်တာပါ။ ကျားဖြန့် အင်ပါယာကို တည်ထောင်ခဲ့တဲ့ သူတွေလက်ထဲ ပြန်ထည့်ပေးလိုက်တာမျိုး မဟုတ်ပါဘူး။',
        },
      ],
    },

    // 7. Rare earths
    {
      title: {
        en: 'Rare earths: cut the criminal middleman, not corners',
        my: 'နောက်ထပ် တိတ်ဆိတ်ပြီး ညစ်ပတ်နေတဲ့ ကိစ္စတစ်ခုကတော့ - ရှားပါးမြေသား (Rare Earths) နဲ့ အရေးပါတဲ့ သတ္တုတွင်းထွက်များ ပါပဲ။',
      },
      paragraphs: [
        {
          en: 'Burma\u2019s north is rich in heavy rare earth elements needed for electric vehicles, wind turbines, F-22s, and advanced microprocessors. Today, much of that extraction is environmentally devastating, controlled by militias, cronies, or foreign brokers, and deeply entangled in the junta\u2019s war economy and Beijing\u2019s strategic networks.',
          my: 'မြန်မာပြည် မြောက်ပိုင်းမှာ လျှပ်စစ်ကားတွေ၊ လေအားလျှပ်စစ် တာဘိုင်တွေ၊ F-22 လေယာဉ်တွေနဲ့ အဆင့်မြင့် မိုက်ခရိုပရိုဆက်ဆာတွေအတွက် လိုအပ်တဲ့ ရှားပါးမြေသားတွေ အများအပြား ရှိပါတယ်။',
        },
        {
          en: 'Some in Washington may be tempted to think: \u201cWe can stomach a less-than-perfect partner if it helps break China\u2019s stranglehold on these minerals.\u201d But that is a false shortcut. A supply chain that runs through war crimes, land grabs, and criminal syndicates is a strategic liability, not an asset. It is brittle, blackmailable, and morally corrosive.',
          my: 'ဒါပေမဲ့ ဒါဟာ မှားယွင်းတဲ့ ဖြတ်လမ်းနည်း ပါ။ စစ်ရာဇဝတ်မှုတွေ၊ မြေသိမ်းမှုတွေနဲ့ ရာဇဝတ်ဂိုဏ်းတွေကတဆင့် လာတဲ့ ထောက်ပံ့ရေးကွင်းဆက် (Supply Chain) ဟာ မဟာဗျူဟာမြောက် ပိုင်ဆိုင်မှု (Asset) မဟုတ်ပါဘူး၊ ဝန်ထုပ်ဝန်ပိုး (Liability) သာ ဖြစ်ပါတယ်။ အဲဒါက ကျိုးပဲ့လွယ်တယ်၊ ခြိမ်းခြောက်ခံရလွယ်တယ်၊ ပြီးတော့ ကိုယ်ကျင့်တရားကို ပျက်စီးစေပါတယ်။',
        },
      ],
      bullets: [
        {
          en: 'Work with NUG-aligned authorities and EROs in liberated areas to shut down the most abusive operations and pilot legal, monitored extraction under federal principles.',
          my: 'ပြည်သူ့စစ်တွေ၊ ခရိုနီတွေ (သို့) နိုင်ငံခြား ပွဲစားတွေက ထိန်းချုပ်ထားတယ်၊ ပြီးတော့ စစ်ကောင်စီရဲ့ စစ်စီးပွားရေးနဲ့ ပေကျင်းရဲ့ မဟာဗျူဟာ ကွန်ရက်တွေထဲမှာ နက်နက်ရှိုင်းရှိုင်း ရှုပ်ထွေးနေပါတယ်။',
        },
        {
          en: 'Integrate Burma into refinery supply-chain partnerships with allied economies\u2014Malaysia, Thailand, Japan, South Korea, Australia\u2014where environmental and labor standards can be enforced.',
          my: 'သဘာဝပတ်ဝန်းကျင်နဲ့ အလုပ်သမား စံနှုန်းတွေကို လိုက်နာနိုင်တဲ့ မဟာမိတ် စီးပွားရေး နိုင်ငံတွေ (မလေးရှား၊ ထိုင်း၊ ဂျပန်၊ တောင်ကိုရီးယား၊ ဩစတြေးလျ) နဲ့ သန့်စင်ရေး (Refining) ပူးပေါင်းဆောင်ရွက်မှုတွေ တည်ဆောက်ပါ။',
        },
        {
          en: 'Treat junta-linked rare-earth exports as radioactive, high-risk, and sanctionable, not as bargaining chips.',
          my: 'စစ်ကောင်စီ ဆက်စပ် ရှားပါးမြေသား တင်ပို့မှုတွေကို အပေးအယူ ပစ္စည်းအဖြစ် မသတ်မှတ်ဘဲ အန္တရာယ်များပြီး ပိတ်ဆို့သင့်တဲ့ အရာအဖြစ် သတ်မှတ်ပါ။',
        },
      ],
      closing: {
        en: 'The choice is not between purity and pragmatism. It is between short-sighted deals that entrench criminal control and long-term arrangements that actually reduce dependence and volatility.',
        my: 'ရွေးချယ်စရာက \u201cစင်ကြယ်ခြင်း\u201d နဲ့ \u201cလက်တွေ့ကျခြင်း\u201d ကြားမှာ မဟုတ်ပါဘူး။ \u201cရာဇဝတ်ကောင်တွေရဲ့ ထိန်းချုပ်မှုကို ပိုခိုင်မာစေတဲ့ ရေတိုသဘောတူညီချက်များ\u201d နဲ့ \u201cမှီခိုအားထားရမှုနဲ့ မတည်ငြိမ်မှုတွေကို လျှော့ချပေးမယ့် ရေရှည် အစီအစဉ်များ\u201d ကြားက ရွေးချယ်စရာသာ ဖြစ်ပါတယ်။',
      },
    },

    // 8. Endless crisis does not mean hopeless crisis
    {
      title: {
        en: 'Endless crisis does not mean hopeless crisis',
        my: 'အဲဒီ လွှတ်တော်ကြားနာပွဲ ခေါင်းစဉ်ဖြစ်တဲ့ \u201cထွက်ပေါက်မရှိသော မဟာဗျူဟာ - မြန်မာ့အဆုံးမဲ့ အကျပ်အတည်းနှင့် အမေရိကန်၏ အကန့်အသတ်ရှိသော ရွေးချယ်စရာများ\u201d ဆိုတာ အဝေးကကြည့်ရင်တော့ မှန်သလို ရှိပါတယ်။ ဝေးလံတဲ့ နေရာက ဖြေရှင်းရခက်တဲ့ ပဋိပက္ခတစ်ခု လိုပေါ့။',
      },
      paragraphs: [
        {
          en: 'The title of that House hearing\u2014\u201cNo Exit Strategy: Burma\u2019s Endless Crisis and America\u2019s Limited Options\u201d\u2014captures how Burma can feel from afar: a tragic, intractable conflict in a far-off land. But \u201cendless\u201d should describe the junta\u2019s plan, not our imagination.',
          my: 'ဒါပေမဲ့ \u201cအဆုံးမဲ့ (Endless)\u201d ဆိုတာ စစ်ကောင်စီရဲ့ စီမံကိန်း သာ ဖြစ်ပြီး၊ ကျွန်တော်တို့ရဲ့ ကံကြမ္မာ မဟုတ်ပါဘူး။',
        },
        {
          en: 'If America\u2019s institutions internalize that fatalism, the generals win twice: at home, by crushing dissent; abroad, by convincing powerful democracies that nothing better is possible. The truth is harder but not without hope.',
          my: 'အကယ်၍ အမေရိကန် အဖွဲ့အစည်းတွေကသာ ဒီဝါဒကို လက်ခံလိုက်ရင် ဗိုလ်ချုပ်တွေ နှစ်ခါနိုင်သွားပါလိမ့်မယ် - ပြည်တွင်းမှာ အတိုက်အခံတွေကို နှိပ်ကွပ်ခွင့်ရသွားသလို၊ ပြည်ပမှာလည်း သူတို့ထက် ပိုကောင်းတာ ဘာမှမရှိဘူးလို့ နိုင်ငံတကာကို ယုံကြည်သွားစေပါလိမ့်မယ်။ ဒါပေမဲ့ အမှန်တရားကတော့ ပိုခက်ခဲပေမယ့် မျှော်လင့်ချက် ရှိပါတယ် -',
        },
      ],
      bullets: [
        {
          en: 'Ethnic resistance organizations and People\u2019s Defense Forces have pushed the military out of large swathes of territory, sometimes cooperating in ways that would have seemed impossible a decade ago.',
          my: 'ဗုံးဒဏ်တွေအောက်မှာပဲ ဒေသခံတွေက ကျောင်းတွေ၊ ဆေးပေးခန်းတွေ၊ တရားစီရင်ရေး စနစ်တွေကို တည်ဆောက်နေကြပါပြီ။',
        },
        {
          en: 'Local communities have built parallel governance structures\u2014schools, clinics, courts\u2014in liberated areas, even under bombardment.',
          my: 'NUG ဟာ မစုံလင်သေးပေမယ့် ဗမာနဲ့ တိုင်းရင်းသား ခေါင်းဆောင်မှုတွေကို စုစည်းဖို့ ရှားပါးတဲ့ နိုင်ငံတည်ဆောက်ရေး ကြိုးပမ်းမှုတစ်ခု ဖြစ်ပါတယ်။',
        },
        {
          en: 'The National Unity Government, while imperfect, represents a rare attempt to knit together Burman and ethnic leadership in a shared nation-building project.',
          my: 'ဒီအကျပ်အတည်းဟာ သဘာဝအရ \u201cအဆုံးမဲ့\u201d နေတာ မဟုတ်ပါဘူး။ ရည်ရွယ်ချက်ရှိရှိ ဆွဲဆန့်ထားလို့ ရှည်ကြာနေတာပါ။ အမေရိကန်ပြည်ထောင်စု၊ အာဆီယံ နဲ့ မြန်မာပြည်သူတွေရဲ့ ရွေးချယ်မှုတွေကသာ ဒါကို တိုတောင်းသွားစေနိုင်မှာ ဖြစ်ပါတယ်။',
        },
      ],
      closing: {
        en: 'The crisis is not endless by nature; it has been prolonged by deliberate choices. And that means different choices\u2014by the people of Burma, by ASEAN, and crucially by the United States\u2014can shorten it.',
        my: '',
      },
    },

    // 9. If President Trump ends Burma's nightmare
    {
      title: {
        en: "If President Trump ends Burma's nightmare, 60 million Burmese has your back for the Nobel",
        my: 'ကျွန်တော် ဒီစာကိုရေးတာ လက်ရှိ အစိုးရကို တိုက်ခိုက်ဖို့ ရေးတာ မဟုတ်ပါဘူး။ ဒီအစိုးရမှာ တခြားသူတွေ မရှိခဲ့တဲ့ \u201cသြဇာအာဏာ (Leverage)\u201d ရှိတယ် ဆိုတာကို သိတဲ့သူ တစ်ယောက်အနေနဲ့ ရေးတာပါ။',
      },
      paragraphs: [
        {
          en: 'I do not write this to throw shade at the administration. I write as someone who knows that this administration has leverage that others did not. It can align with Congress\u2019s bipartisan calls to condemn the sham elections and appoint a Burma Special Representative; toughen Scam Centre Strike Force operations while partnering with legitimate local actors; reframe TPS termination in a way that denies propaganda value to the junta; and push allied economies and businesses to treat junta-linked critical minerals and scam transactions as radioactive, not \u201cemerging market opportunities.\u201d',
          my: 'ဒီအစိုးရ အနေနဲ့ အတုအယောင် ရွေးကောက်ပွဲကို ရှုတ်ချဖို့နဲ့ အထူးကိုယ်စားလှယ် ခန့်အပ်ဖို့ တောင်းဆိုထားတဲ့ ကွန်ဂရက်လွှတ်တော်ရဲ့ ပါတီစုံ သဘောထားနဲ့ တသားတည်း ရပ်တည်နိုင်ပါတယ်။ တရားဝင် ဒေသခံ အင်အားစုတွေနဲ့ လက်တွဲပြီး Scam Centre Strike Force စစ်ဆင်ရေးတွေကို ပိုတင်းကြပ်နိုင်ပါတယ်။ စစ်ကောင်စီ ဝါဒဖြန့်လို့ မရအောင် TPS ရပ်စဲမှု ခေါင်းစဉ်တပ်ပုံ (Framing) ကို ပြောင်းလဲနိုင်ပါတယ်။ စစ်ကောင်စီနဲ့ ဆက်စပ်တဲ့ သတ္တုတွင်းထွက်တွေနဲ့ ကျားဖြန့်တွေကို \u201cထွန်းသစ်စ ဈေးကွက် အခွင့်အလမ်းတွေ\u201d အဖြစ် မဟုတ်ဘဲ ရေဒီယိုသတ္တိကြွ ပစ္စည်းတွေလို (အန္တရာယ်ရှိတဲ့ အရာတွေလို) သဘောထားဖို့ မဟာမိတ်တွေနဲ့ စီးပွားရေးလုပ်ငန်းတွေကို ဖိအားပေးနိုင်ပါတယ်။',
        },
        {
          en: 'If it did those things\u2014if it used American prowess to shorten, rather than simply manage, Burma\u2019s endless crisis\u2014it would not just be making America safer. It would be doing something truly historic. I say this without sarcasm: if this administration could help bring about a genuine political settlement in Burma\u2014one that frees Aung San Suu Kyi, ends mass atrocities, and puts the country on a federal democratic path\u2014you would see Burmese people across the world line up to nominate President Trump for the Nobel Peace Prize. We are not picky about who helps save our country. We only care that it gets done.',
          my: 'အကယ်၍သာ ဒီအရာတွေကို လုပ်ဆောင်ခဲ့မယ်ဆိုရင်... အမေရိကန်ရဲ့ အာဏာစွမ်းပကားကို သုံးပြီး မြန်မာ့အဆုံးမဲ့ အကျပ်အတည်းကို ဒီအတိုင်း စီမံခန့်ခွဲနေရုံ (Manage) မဟုတ်ဘဲ တိုတောင်းသွားအောင် (Shorten) လုပ်နိုင်မယ်ဆိုရင်... အမေရိကန်ကို ပိုလုံခြုံစေရုံတင် မကပါဘူး။ သမိုင်းဝင်မယ့် အလုပ်တစ်ခုကို လုပ်လိုက်တာ ဖြစ်ပါလိမ့်မယ်။ ကျွန်တော် လှောင်ပြောင်ပြီး ပြောနေတာ မဟုတ်ပါဘူး - အကယ်၍ ဒီအစိုးရကသာ မြန်မာနိုင်ငံမှာ စစ်မှန်တဲ့ နိုင်ငံရေး အဖြေတစ်ခု (ဒေါ်စု လွတ်မြောက်ရေး၊ အစုလိုက်အပြုံလိုက် သတ်ဖြတ်မှုတွေ ရပ်တန့်ရေး၊ ဖက်ဒရယ် ဒီမိုကရေစီ လမ်းကြောင်းပေါ် ပြန်ရောက်ရေး) ကို ဆောင်ကြဉ်းပေးနိုင်မယ်ဆိုရင်... ကမ္ဘာတစ်ဝန်းက မြန်မာပြည်သူတွေ တန်းစီပြီး သမ္မတ ထရမ့်ကို ငြိမ်းချမ်းရေး နိုဘယ်ဆုအတွက် အမည်စာရင်း တင်သွင်းကြတာကို မြင်တွေ့ရပါလိမ့်မယ်။ ကျွန်တော်တို့ တိုင်းပြည်ကို ဘယ်သူက ကယ်တင်မလဲ ဆိုတာ ကျွန်တော်တို့ ဇီဇာမကြောင်ပါဘူး။ အလုပ်ပြီးမြောက်ဖို့ကိုပဲ ကျွန်တော်တို့ ဂရုစိုက်ပါတယ်။',
        },
      ],
    },

    // 10. Thanksgiving, identity, and the America we still believe in
    {
      title: {
        en: 'Thanksgiving, identity, and the America we still believe in',
        my: 'သမ္မတရဲ့ ကြက်ဆင်တွေကတောင် ကျွန်တော်တို့ထက် ပိုပြီး ဘေးကင်းလုံခြုံမှု ရှိနေတယ်ဆိုတာ မြန်မာ TPS သမားတွေကြားမှာ ရယ်စရာတစ်ခု ဖြစ်နေပေမယ့် ဒါဟာ နာကျင်စရာ ဟာသတစ်ခုပါ။',
      },
      paragraphs: [
        {
          en: 'TPS holders from Burma sometimes joke darkly that even the president\u2019s turkeys have a clearer path to safety than we do. It is gallows humor that masks real grief and real fear. But when I think about my life here\u2014from the Wooster host families who insisted I always have the last piece of pumpkin pie, to the Burmese-American aunties who now organize food drives for new arrivals and monthly fundraisers\u2014I cannot see this country only through the lens of one Federal Register notice.',
          my: 'ဒါပေမဲ့ ကျွန်တော့်ဘဝကို ပြန်ကြည့်တဲ့အခါ - ရွှေဖရုံသီးမုန့် (Pumpkin Pie) နောက်ဆုံးတစ်စိတ်ကို ဇွတ်ခေါ်ကျွေးခဲ့တဲ့ Wooster က မိသားစုကနေ၊ အခုနောက်ပိုင်း ရောက်လာသူတွေအတွက် စားနပ်ရိက္ခာ လိုက်စုပေးနေတဲ့ မြန်မာ-အမေရိကန် အန်တီကြီးတွေအထိ မြင်ယောင်မိတဲ့အခါ - အစိုးရမှတ်တမ်း (Federal Register) တစ်စောင်တည်းနဲ့ ဒီနိုင်ငံကို အကဲမဖြတ်လိုပါဘူး။',
        },
        {
          en: 'I see the America President Reagan spoke of: that you can move to many countries and never truly belong, but \u201canyone from any corner of the world can come to America and become an American.\u201d That idea is more powerful than any one party, any one DHS policy, any one moment of panic about immigration or geopolitical fatigue.',
          my: 'သမ္မတ ရေဂင် ပြောခဲ့တဲ့ အမေရိကန်ကို ကျွန်တော် မြင်နေပါသေးတယ်။ အဲဒါကတော့ \u201cကမ္ဘာ့ဘယ်ထောင့်ကပဲ လာလာ အမေရိကန် ဖြစ်လာနိုင်တယ်\u201d ဆိုတဲ့ အချက်ပါပဲ။ အဲဒီ အယူအဆဟာ ဘယ်ပါတီ၊ ဘယ် DHS မူဝါဒ၊ ဘယ်လို ပထဝီနိုင်ငံရေး မောပန်းနွမ်းနယ်မှုတွေထက်မဆို ပိုပြီး အားကောင်းပါတယ်။',
        },
      ],
      bullets: [
        {
          en: 'Strength that locks the doors against traffickers, terrorists, and junta cronies.',
          my: 'အင်အား - လူကုန်ကူးသူတွေ၊ အကြမ်းဖက်သမားတွေနဲ့ စစ်တပ်ခရိုနီတွေကို တံခါးပိတ်ထားနိုင်တဲ့ အင်အား။',
        },
        {
          en: 'Strength that doesn\u2019t let a dictatorship lobby and dictate our criteria of \u201cstability.\u201d',
          my: 'အင်အား - \u201cတည်ငြိမ်မှု\u201d ဆိုတာ ဘာလဲဆိုတာကို အာဏာရှင်တွေ လော်ဘီလုပ်ပြီး အဓိပ္ပာယ်ဖွင့်ခွင့် မပေးတဲ့ အင်အား။',
        },
        {
          en: 'Wisdom that hears the bipartisan warnings from Congress, listens to allies and investigations, and refuses to reward performance in place of genuine reform.',
          my: 'ဉာဏ်ပညာ - ကွန်ဂရက် လွှတ်တော်ရဲ့ သတိပေးချက်တွေ၊ မဟာမိတ်တွေနဲ့ စုံစမ်းစစ်ဆေးမှုတွေကို နားထောင်ပြီး၊ စစ်မှန်တဲ့ ပြုပြင်ပြောင်းလဲမှု (Genuine Reform) မရှိဘဲ ဟန်ဆောင်ခြင်း (Performance) သက်သက်ကို ဆုမချတဲ့ ဉာဏ်ပညာ။',
        },
        {
          en: 'Wisdom that remembers that TPS is temporary, but the value of a human life is not.',
          my: 'ဉာဏ်ပညာ - TPS ဆိုတာ ယာယီဖြစ်ပေမယ့်၊ လူ့အသက်ရဲ့ တန်ဖိုးကတော့ ယာယီ မဟုတ်ဘူး ဆိုတာကို သတိရတဲ့ ဉာဏ်ပညာ။',
        },
      ],
      closing: {
        en: 'If the story of this Thanksgiving is simply \u201cTurkeys saved, refugees deported because the junta says things are better now,\u201d then something has gone wrong in the American experiment. If instead the story becomes \u201cTurkeys pardoned, refugees heard, junta called out, scam centres dismantled, dirty critical minerals supply chains disrupted\u201d\u2014then America will have done more than protect its borders. It will have lived up, once again, to President Reagan\u2019s America: that anyone from any corner of the world can stake their future here, not because America is perfect, but because it is inclusive and principled, capable of choosing courage over convenience. The Burma crisis has lasted my entire life\u2014and that of my father\u2019s and grandfather\u2019s\u2014across three generations and counting. Naturally, it has often felt endless. But \u201cendless\u201d is a description, not a destiny. With enough strength, wisdom, and yes, a little Midwestern kindness, it can end in our generation. Maybe even under this administration.',
        my: 'အကယ်၍ ဒီနှစ် ကျေးဇူးတော်နေ့ရဲ့ ဇာတ်လမ်းက \u201cကြက်ဆင်တွေ ကယ်တင်ခံရတယ်၊ ဒုက္ခသည်တွေ ပြည်နှင်ဒဏ် ခံရတယ်၊ ဘာလို့လဲဆိုတော့ စစ်ကောင်စီက အခြေအနေ ကောင်းသွားပြီလို့ ပြောလို့\u201d ဆိုတာလောက်ပဲ ဖြစ်မယ်ဆိုရင်... အမေရိကန်ရဲ့ စမ်းသပ်မှုကြီး (American Experiment) မှာ တစ်ခုခု မှားယွင်းသွားပါပြီ။ အကယ်၍ ဇာတ်လမ်းက \u201cကြက်ဆင်တွေ လွတ်ငြိမ်းခွင့်ရတယ်၊ ဒုက္ခသည်တွေ အသံကို နားထောင်ပေးတယ်၊ စစ်ကောင်စီကို ဖော်ထုတ်တယ်၊ ကျားဖြန့်စခန်းတွေကို ဖြိုခွင်းတယ်၊ ညစ်ပတ်တဲ့ ကုန်သွယ်မှုတွေကို ဖြတ်တောက်တယ်\u201d လို့ ပြောင်းလဲသွားမယ်ဆိုရင်တော့... အမေရိကန်ဟာ သူ့ရဲ့ နယ်စပ်တွေကို ကာကွယ်ရုံထက် ပိုပါလိမ့်မယ်။ သမ္မတ ရေဂင် ယုံကြည်ခဲ့တဲ့ အယူအဆအတိုင်း နောက်တစ်ကြိမ် ပြန်လည် ရှင်သန်လာတာ ဖြစ်ပါလိမ့်မယ်။ \u201cကမ္ဘာ့ဘယ်ထောင့်က ဘယ်သူမဆို\u201d သူတို့ရဲ့ အနာဂတ်ကို ဒီမှာ ပုံအောရဲကြတာဟာ အမေရိကန်က ပြည့်စုံလွန်းလို့ မဟုတ်ပါဘူး။ အားလုံးကို ပါဝင်ခွင့်ပေးပြီး (Inclusive)၊ မူဝါဒ ခိုင်မာကာ၊ သက်တောင့်သက်သာ ရှိမှုထက် သတ္တိတရားကို ရွေးချယ်နိုင်စွမ်း ရှိသေးလို့ ဖြစ်ပါတယ်။ မြန်မာ့ အကျပ်အတည်းဟာ ကျွန်တော့် တသက်တာလုံး - ကျွန်တော့် အဖေ၊ ကျွန်တော့် အဘိုး လက်ထက်ကတည်းက - မျိုးဆက် ၃ ဆက်တိုင်အောင် ကြာမြင့်ခဲ့ပါပြီ။ အဆုံးမဲ့လို့ ခံစားရတာ သဘာဝပါပဲ။ ဒါပေမဲ့ \u201cအဆုံးမဲ့\u201d ဆိုတာ အခြေအနေကို ဖော်ပြချက် (Description) သာ ဖြစ်ပြီး၊ ကံကြမ္မာ (Destiny) မဟုတ်ပါဘူး။ လုံလောက်တဲ့ အင်အား၊ ဉာဏ်ပညာ နဲ့ Midwestern သားတွေရဲ့ ကြင်နာမှု နည်းနည်း သာ ရှိမယ်ဆိုရင်... ဒီအကျပ်အတည်းဟာ ကျွန်တော်တို့ မျိုးဆက်မှာတင် အဆုံးသတ်သွားနိုင်ပါတယ်။ ဒီအစိုးရ လက်ထက်မှာတင် ဖြစ်ချင် ဖြစ်နိုင်ပါတယ်။',
      },
    },
  ],

  share: {
    headline: {
      en: 'Help keep Burmese families safe and heard',
      my: 'မြန်မာ့အသံ မပျက်စေဖို့ မျှဝေကြစို့',
    },
    body: {
      en: 'If this perspective resonates, please share it with policymakers, journalists, and community leaders. The story America tells about TPS will shape real lives\u2014and the future of democracy in Burma.',
      my: 'မြန်မာ TPS ရပ်စဲမှုရဲ့ ကိုယ်တိုင်ခံစားချက်နဲ့ အန္တရာယ်တွေကို တိုးတက်စွာ ပြောပြထားပါတယ်။ မဲပေးခွင့်ရှိသူတွေ၊ မူဝါဒပေါင်းစပ်သူတွေ ဆီကို မျှဝေဖို့ တောင်းဆိုအပ်ပါတယ်။',
    },
  },
};
