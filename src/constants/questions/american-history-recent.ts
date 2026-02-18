import type { Question } from '@/types';

/**
 * Recent American History and Other Important Historical Information
 *
 * ID Prefix: HIST-R## (10 questions)
 * @verified claude-initial-pass 2026-02-18 — pending 3-AI consensus
 */

export const recentHistoryQuestions: Question[] = [
  {
    id: 'HIST-R01',
    question_en: 'Name one war fought by the United States in the 1900s.',
    question_my:
      '၁၉၀၀ ပြည့်နှစ်များတွင် အမေရိကန်ပြည်ထောင်စု တိုက်ခိုက်ခဲ့သော စစ်ပွဲတစ်ခုကို အမည်ပေးပါ။',
    category: 'Recent American History and Other Important Historical Information',
    studyAnswers: [
      { text_en: 'World War I', text_my: 'ပထမကမ္ဘာစစ်' },
      { text_en: 'World War II', text_my: 'ဒုတိယကမ္ဘာစစ်' },
      { text_en: 'Korean War', text_my: 'ကိုရီးယားစစ်ပွဲ' },
      { text_en: 'Vietnam War', text_my: 'ဗီယက်နမ်စစ်ပွဲ' },
      { text_en: '(Persian) Gulf War', text_my: '(ပါရှန်) ပင်လယ်ကွေ့စစ်ပွဲ' },
    ],
    answers: [
      { text_en: 'World War I', text_my: 'ပထမကမ္ဘာစစ်', correct: true },
      { text_en: 'Civil War', text_my: 'ပြည်တွင်းစစ်', correct: false },
      { text_en: 'Revolutionary War', text_my: 'တော်လှန်ရေးစစ်ပွဲ', correct: false },
      { text_en: 'War of 1812', text_my: '၁၈၁၂ စစ်ပွဲ', correct: false },
    ],
    explanation: {
      brief_en:
        "The U.S. fought five major wars in the 1900s: World War I, World War II, the Korean War, the Vietnam War, and the Persian Gulf War. These conflicts shaped America's role as a global superpower.",
      brief_my:
        'အမေရိကန်သည် ၁၉၀၀ ပြည့်နှစ်များတွင် အဓိကစစ်ပွဲ ၅ ခု တိုက်ခိုက်ခဲ့သည် — ပထမကမ္ဘာစစ်၊ ဒုတိယကမ္ဘာစစ်၊ ကိုရီးယားစစ်ပွဲ၊ ဗီယက်နမ်စစ်ပွဲနှင့် ပါရှန်ပင်လယ်ကွေ့စစ်ပွဲ။ ဤပဋိပက္ခများက ကမ္ဘာ့အင်အားကြီးနိုင်ငံအဖြစ် အမေရိက၏ အခန်းကဏ္ဍကို ပုံသွင်းခဲ့သည်။',
      commonMistake_en:
        'The Civil War (1861-1865) and War of 1812 were in the 1800s, not the 1900s. The Revolutionary War was in the 1700s.',
      commonMistake_my:
        'ပြည်တွင်းစစ် (၁၈၆၁-၁၈၆၅) နှင့် ၁၈၁၂ စစ်ပွဲတို့သည် ၁၈၀၀ ပြည့်နှစ်များတွင် ဖြစ်သည်၊ ၁၉၀၀ ပြည့်နှစ်များ မဟုတ်ပါ။ တော်လှန်ရေးစစ်ပွဲသည် ၁၇၀၀ ပြည့်နှစ်များတွင် ဖြစ်သည်။',
      relatedQuestionIds: ['HIST-102', 'HIST-R02', 'HIST-R03'],
    },
  },
  {
    id: 'HIST-R02',
    question_en: 'Who was President during World War I?',
    question_my: 'ပထမကမ္ဘာစစ် (World War I) အတွင်း သမ္မတ (President) က ဘယ်သူလဲ။',
    category: 'Recent American History and Other Important Historical Information',
    studyAnswers: [{ text_en: '(Woodrow) Wilson', text_my: '(ဝုဒ်ရိုး) ဝီလ်ဆင်' }],
    answers: [
      { text_en: '(Woodrow) Wilson', text_my: '(ဝုဒ်ရိုး) ဝီလ်ဆင်', correct: true },
      {
        text_en: 'Franklin Roosevelt',
        text_my: 'ဖရန်ကလင် ရူးဆဗဲ့ (Franklin Roosevelt)',
        correct: false,
      },
      {
        text_en: 'Theodore Roosevelt',
        text_my: 'သီအိုဒေါ ရူးဆဗဲ့ (Theodore Roosevelt)',
        correct: false,
      },
      {
        text_en: 'Abraham Lincoln',
        text_my: 'အေဘရာဟမ် လင်ကွန်း (Abraham Lincoln)',
        correct: false,
      },
    ],
    explanation: {
      brief_en:
        'Woodrow Wilson was President during World War I (1914-1918). He tried to keep America neutral at first but eventually asked Congress to declare war in 1917. After the war, he proposed the League of Nations to prevent future wars.',
      brief_my:
        'ဝုဒ်ရို ဝီလ်ဆင် (Woodrow Wilson)သည် ပထမကမ္ဘာစစ် (၁၉၁၄-၁၉၁၈) အတွင်း သမ္မတဖြစ်ခဲ့သည်။ အစပိုင်းတွင် အမေရိကကို ကြားနေထားရန် ကြိုးစားခဲ့သော်လည်း ၁၉၁၇ ခုနှစ်တွင် ကွန်ဂရက်ကို စစ်ကြေညာရန် တောင်းဆိုခဲ့သည်။',
      commonMistake_en:
        "Don't confuse the two Roosevelts: Theodore Roosevelt was president before WWI; Franklin Roosevelt was president during WWII.",
      commonMistake_my:
        'ရုစဗဲ့ နှစ်ဦးကို မရောထွေးပါနှင့် — သီအိုဒေါ ရူးဆဗဲ့ (Theodore Roosevelt)သည် ပထမကမ္ဘာစစ်မတိုင်မီ သမ္မတဖြစ်ခဲ့ပြီး ဖရန်ကလင် ရူးဆဗဲ့ (Franklin Roosevelt)သည် ဒုတိယကမ္ဘာစစ်အတွင်း သမ္မတဖြစ်ခဲ့သည်။',
      relatedQuestionIds: ['HIST-R01', 'HIST-R03'],
    },
  },
  {
    id: 'HIST-R03',
    question_en: 'Who was President during the Great Depression and World War II?',
    question_my:
      'မဟာစီးပွားပျက်ကပ် (Great Depression) နဲ့ ဒုတိယကမ္ဘာစစ် (World War II) အတွင်း သမ္မတက ဘယ်သူလဲ။',
    category: 'Recent American History and Other Important Historical Information',
    studyAnswers: [{ text_en: '(Franklin) Roosevelt', text_my: '(ဖရန်ကလင်) ရုစဗဲ့' }],
    answers: [
      { text_en: '(Franklin) Roosevelt', text_my: '(ဖရန်ကလင်) ရုစဗဲ့', correct: true },
      { text_en: 'Harry Truman', text_my: 'ဟယ်ရီ ထရူးမင်း', correct: false },
      { text_en: 'Herbert Hoover', text_my: 'ဟာဘတ် ဟူဗာ', correct: false },
      { text_en: 'Woodrow Wilson', text_my: 'ဝုဒ်ရို ဝီလ်ဆင် (Woodrow Wilson)', correct: false },
    ],
    explanation: {
      brief_en:
        'Franklin Roosevelt (FDR) was President during both the Great Depression and World War II. He served an unprecedented four terms and created the New Deal programs to help Americans recover from economic hardship.',
      brief_my:
        'ဖရန်ကလင် ရူးဆဗဲ့ (Franklin Roosevelt) (FDR) သည် မဟာစီးပွားပျက်ကပ်နှင့် ဒုတိယကမ္ဘာစစ် နှစ်ခုလုံးအတွင်း သမ္မတဖြစ်ခဲ့သည်။ သမ္မတသက်တမ်း ၄ ကြိမ် တာဝန်ထမ်းဆောင်ခဲ့ပြီး စီးပွားရေးအကျပ်အတည်းမှ လူအများ ပြန်လည်ထူထောင်ရန် New Deal အစီအစဉ်များ ဖန်တီးခဲ့သည်။',
      funFact_en:
        'FDR is the only president to serve more than two terms. After his four terms, the 22nd Amendment was passed to limit presidents to two terms.',
      funFact_my:
        'FDR သည် သက်တမ်း ၂ ကြိမ်ထက် ပိုတာဝန်ထမ်းဆောင်ခဲ့သော တစ်ဦးတည်းသော သမ္မတဖြစ်သည်။ သူ့အပြီးတွင် သမ္မတများကို ၂ ကြိမ်အထိ ကန့်သတ်ရန် ၂၂ ကြိမ်မြောက် ပြင်ဆင်ချက်ကို အတည်ပြုခဲ့သည်။',
      relatedQuestionIds: ['HIST-R02', 'HIST-R04', 'HIST-R05'],
    },
  },
  {
    id: 'HIST-R04',
    question_en: 'Who did the United States fight in World War II?',
    question_my: 'ဒုတိယကမ္ဘာစစ် (World War II) မှာ အမေရိကန်က ဘယ်သူတွေကို တိုက်ခိုက်ခဲ့သလဲ။',
    category: 'Recent American History and Other Important Historical Information',
    studyAnswers: [{ text_en: 'Japan, Germany, and Italy', text_my: 'ဂျပန်၊ ဂျာမနီနှင့် အီတလီ' }],
    answers: [
      {
        text_en: 'Japan, Germany, and Italy',
        text_my: 'ဂျပန်၊ ဂျာမနီနှင့် အီတလီ',
        correct: true,
      },
      {
        text_en: 'The Soviet Union, China, and Korea',
        text_my: 'ဆိုဗီယက်ယူနီယံ၊ တရုတ်နှင့် ကိုရီးယား',
        correct: false,
      },
      {
        text_en: 'Great Britain, France, and Russia',
        text_my: 'ဂရိတ်ဗြိတိန်၊ ပြင်သစ်နှင့် ရုရှား',
        correct: false,
      },
      {
        text_en: 'Vietnam, Cambodia, and Laos',
        text_my: 'ဗီယက်နမ်၊ ကမ္ဘောဒီးယားနှင့် လာအို',
        correct: false,
      },
    ],
    explanation: {
      brief_en:
        'In World War II, the U.S. fought against the Axis powers: Japan, Germany, and Italy. The war lasted from 1939 to 1945, and the U.S. joined after Japan attacked Pearl Harbor on December 7, 1941.',
      brief_my:
        'ဒုတိယကမ္ဘာစစ်တွင် အမေရိကန်သည် ဂျပန်၊ ဂျာမနီနှင့် အီတလီ — ဝင်ရိုးတန်းနိုင်ငံများကို တိုက်ခိုက်ခဲ့သည်။ ၁၉၄၁ ခုနှစ် ဒီဇင်ဘာ ၇ ရက်နေ့တွင် ဂျပန်က ပုလဲဆိပ်ကမ်းကို တိုက်ခိုက်ပြီးနောက် အမေရိကန် ပါဝင်ခဲ့သည်။',
      mnemonic_en: 'JGI: Japan, Germany, Italy — the three Axis powers the U.S. fought.',
      mnemonic_my: 'ဂျပန်-ဂျာမနီ-အီတလီ — အမေရိကန်တိုက်ခိုက်ခဲ့သော ဝင်ရိုးတန်းနိုင်ငံ ၃ ခု။',
      commonMistake_en:
        'The Soviet Union (Russia), China, and Great Britain were ALLIES of the U.S. in WWII, not enemies. The U.S. fought AGAINST Japan, Germany, and Italy.',
      commonMistake_my:
        'ဆိုဗီယက်ယူနီယံ (ရုရှား)၊ တရုတ်နှင့် ဂရိတ်ဗြိတိန်တို့သည် ဒုတိယကမ္ဘာစစ်တွင် အမေရိကန်၏ မဟာမိတ်များ ဖြစ်သည်၊ ရန်သူများ မဟုတ်ပါ။',
      relatedQuestionIds: ['HIST-R03', 'HIST-R05'],
    },
  },
  {
    id: 'HIST-R05',
    question_en: 'Before he was President, Eisenhower was a general. What war was he in?',
    question_my:
      'သမ္မတ မဖြစ်ခင်မှာ အိုက်ဇင်ဟောဝါ (Eisenhower) က ဗိုလ်ချုပ်တစ်ဦးဖြစ်ခဲ့တယ်။ သူ ဘယ်စစ်ပွဲမှာ ပါဝင်ခဲ့သလဲ။',
    category: 'Recent American History and Other Important Historical Information',
    studyAnswers: [{ text_en: 'World War II', text_my: 'ဒုတိယကမ္ဘာစစ်' }],
    answers: [
      { text_en: 'World War II', text_my: 'ဒုတိယကမ္ဘာစစ်', correct: true },
      { text_en: 'World War I', text_my: 'ပထမကမ္ဘာစစ်', correct: false },
      { text_en: 'The Civil War', text_my: 'ပြည်တွင်းစစ်', correct: false },
      { text_en: 'The Korean War', text_my: 'ကိုရီးယားစစ်ပွဲ', correct: false },
    ],
    explanation: {
      brief_en:
        'Dwight D. Eisenhower was a five-star general who led the Allied forces in Europe during World War II, including the D-Day invasion of Normandy in 1944. He later served as the 34th President from 1953 to 1961.',
      brief_my:
        'ဒွိုက် ဒီ အိုက်ဇင်ဟောဝါ (Eisenhower)သည် ဒုတိယကမ္ဘာစစ်အတွင်း ဥရောပတွင် မဟာမိတ်တပ်ဖွဲ့များကို ဦးဆောင်ခဲ့သော ကြယ်ငါးပွင့်တပ်ချုပ် ဖြစ်ခဲ့သည်။ ၁၉၄၄ ခုနှစ် D-Day နော်မန်ဒီကျူးကျော်မှုကို ဦးဆောင်ခဲ့ပြီး ၃၄ ကြိမ်မြောက် သမ္မတအဖြစ် တာဝန်ထမ်းဆောင်ခဲ့သည်။',
      funFact_en:
        'Eisenhower created the Interstate Highway System, which is one of the largest public works projects in American history.',
      funFact_my:
        'အိုက်ဇင်ဟောဝါ (Eisenhower)သည် အပြည်ပြည်ဆိုင်ရာ အဝေးပြေးလမ်းမကြီးစနစ်ကို ဖန်တီးခဲ့ပြီး အမေရိကန်သမိုင်းတွင် အကြီးမားဆုံး အများပြည်သူ လုပ်ငန်းစီမံကိန်းများထဲမှ တစ်ခု ဖြစ်သည်။',
      relatedQuestionIds: ['HIST-R03', 'HIST-R04'],
    },
  },
  {
    id: 'HIST-R06',
    question_en: 'During the Cold War, what was the main concern of the United States?',
    question_my: 'စစ်အေးကာလ (Cold War) အတွင်း အမေရိကန်ရဲ့ အဓိကစိုးရိမ်မှုက ဘာလဲ။',
    category: 'Recent American History and Other Important Historical Information',
    studyAnswers: [{ text_en: 'Communism', text_my: 'ကွန်မြူနစ်ဝါဒ' }],
    answers: [
      { text_en: 'Communism', text_my: 'ကွန်မြူနစ်ဝါဒ', correct: true },
      { text_en: 'Climate Change', text_my: 'ရာသီဥတုပြောင်းလဲမှု', correct: false },
      { text_en: 'The Great Depression', text_my: 'မဟာစီးပွားပျက်ကပ်', correct: false },
      { text_en: 'Terrorism', text_my: 'အကြမ်းဖက်ဝါဒ', correct: false },
    ],
    explanation: {
      brief_en:
        'During the Cold War (roughly 1947-1991), the U.S. was primarily concerned about the spread of Communism, especially from the Soviet Union. This rivalry shaped American foreign policy for decades.',
      brief_my:
        'စစ်အေးတိုက်ပွဲ (၁၉၄၇-၁၉၉၁ ခန့်) အတွင်း အမေရိကန်သည် အထူးသဖြင့် ဆိုဗီယက်ယူနီယံမှ ကွန်မြူနစ်ဝါဒ ပြန့်ပွားမှုကို အဓိက စိုးရိမ်ခဲ့သည်။ ဤပြိုင်ဆိုင်မှုသည် ဆယ်စုနှစ်များစွာ အမေရိကန်နိုင်ငံခြားရေးမူဝါဒကို ပုံသွင်းခဲ့သည်။',
      funFact_en:
        'The Cold War was called "cold" because the U.S. and Soviet Union never directly fought each other. Instead, they competed through proxy wars, the space race, and nuclear arms buildup.',
      funFact_my:
        'စစ်အေးတိုက်ပွဲဟု ခေါ်ရသည်မှာ အမေရိကန်နှင့် ဆိုဗီယက်ယူနီယံသည် တိုက်ရိုက် မတိုက်ခိုက်ခဲ့သောကြောင့် ဖြစ်သည်။ ယင်းအစား ကိုယ်စားပြုစစ်ပွဲများ၊ အာကာသပြိုင်ပွဲနှင့် နျူကလီးယားလက်နက်တိုးချဲ့မှုတို့ဖြင့် ပြိုင်ဆိုင်ခဲ့ကြသည်။',
      relatedQuestionIds: ['HIST-R01', 'HIST-R09'],
    },
  },
  {
    id: 'HIST-R07',
    question_en: 'What movement tried to end racial discrimination?',
    question_my: 'ဘယ်လှုပ်ရှားမှုက လူမျိုးရေးခွဲခြားမှုကို အဆုံးသတ်ဖို့ ကြိုးစားခဲ့သလဲ။',
    category: 'Recent American History and Other Important Historical Information',
    studyAnswers: [
      { text_en: 'civil rights (movement)', text_my: 'ပြည်သူ့အခွင့်အရေး (လှုပ်ရှားမှု)' },
    ],
    answers: [
      {
        text_en: 'civil rights (movement)',
        text_my: 'ပြည်သူ့အခွင့်အရေး (လှုပ်ရှားမှု)',
        correct: true,
      },
      {
        text_en: "the women's suffrage movement",
        text_my: 'အမျိုးသမီးမဲပေးခွင့်လှုပ်ရှားမှု',
        correct: false,
      },
      {
        text_en: 'the conservation movement',
        text_my: 'ထိန်းသိမ်းရေးလှုပ်ရှားမှု',
        correct: false,
      },
      {
        text_en: 'the prohibition movement',
        text_my: 'တားမြစ်ရေးလှုပ်ရှားမှု',
        correct: false,
      },
    ],
    explanation: {
      brief_en:
        'The civil rights movement (1950s-1960s) fought to end racial discrimination and segregation in the United States. It led to landmark legislation including the Civil Rights Act of 1964 and the Voting Rights Act of 1965.',
      brief_my:
        'ပြည်သူ့အခွင့်အရေးလှုပ်ရှားမှု (၁၉၅၀-၁၉၆၀ ပြည့်နှစ်များ) သည် အမေရိကန်ပြည်ထောင်စုတွင် လူမျိုးရေးခွဲခြားမှုနှင့် သီးခြားခွဲထားမှုကို အဆုံးသတ်ရန် တိုက်ပွဲဝင်ခဲ့သည်။ ၁၉၆၄ ပြည်သူ့အခွင့်အရေးဥပဒေနှင့် ၁၉၆၅ မဲပေးခွင့်ဥပဒေတို့ကဲ့သို့ ထူးခြားသောဥပဒေပြဌာန်းမှုများ ပေါ်ထွက်လာစေခဲ့သည်။',
      commonMistake_en:
        "The women's suffrage movement focused on voting rights for women (19th Amendment, 1920). The civil rights movement focused on ending racial discrimination.",
      commonMistake_my:
        'အမျိုးသမီးမဲပေးခွင့်လှုပ်ရှားမှုသည် အမျိုးသမီးမဲပေးခွင့်ကို ဦးတည်ခဲ့သည် (၁၉ ကြိမ်မြောက်ပြင်ဆင်ချက်၊ ၁၉၂၀)။ ပြည်သူ့အခွင့်အရေးလှုပ်ရှားမှုသည် လူမျိုးရေးခွဲခြားမှုကို အဆုံးသတ်ရန် ဦးတည်ခဲ့သည်။',
      relatedQuestionIds: ['HIST-R08', 'HIST-107'],
    },
  },
  {
    id: 'HIST-R08',
    question_en: 'What did Martin Luther King, Jr. do?',
    question_my: 'မာတင်လူသာကင်းဂျူနီယာ (Martin Luther King Jr.) က ဘာလုပ်ခဲ့သလဲ။',
    category: 'Recent American History and Other Important Historical Information',
    studyAnswers: [
      {
        text_en: 'fought for civil rights',
        text_my: 'ပြည်သူ့အခွင့်အရေးအတွက် တိုက်ပွဲဝင်ခဲ့သည်',
      },
      {
        text_en: 'worked for equality for all Americans',
        text_my: 'အမေရိကန်အားလုံးအတွက် တန်းတူညီမျှမှုအတွက် လုပ်ဆောင်ခဲ့သည်',
      },
    ],
    answers: [
      {
        text_en: 'fought for civil rights',
        text_my: 'ပြည်သူ့အခွင့်အရေးအတွက် တိုက်ပွဲဝင်ခဲ့သည်',
        correct: true,
      },
      {
        text_en: 'was the first African American Senator',
        text_my: 'ပထမဆုံး အာဖရိကန်အမေရိကန် အထက်လွှတ်တော်အမတ်ဖြစ်ခဲ့သည်',
        correct: false,
      },
      {
        text_en: 'ran for President of the United States',
        text_my: 'အမေရိကန်ပြည်ထောင်စုသမ္မတအဖြစ် အရွေးခံခဲ့သည်',
        correct: false,
      },
      {
        text_en: 'was a justice on the Supreme Court',
        text_my: 'တရားရုံးချုပ်တွင် တရားသူကြီးတစ်ဦးဖြစ်ခဲ့သည်',
        correct: false,
      },
    ],
    explanation: {
      brief_en:
        'Martin Luther King, Jr. was the most prominent leader of the civil rights movement. He fought for equality through nonviolent protest and is famous for his "I Have a Dream" speech at the March on Washington in 1963.',
      brief_my:
        'မာတင် လူသာ ကင်း၊ ဂျူနီယာသည် ပြည်သူ့အခွင့်အရေးလှုပ်ရှားမှု၏ ထင်ရှားဆုံးခေါင်းဆောင် ဖြစ်ခဲ့သည်။ အကြမ်းမဖက်ဆန္ဒပြမှုဖြင့် တန်းတူညီမျှမှုအတွက် တိုက်ပွဲဝင်ခဲ့ပြီး ၁၉၆၃ ခုနှစ် ဝါရှင်တန်ချီတက်ပွဲတွင် "ကျွန်ုပ်အိပ်မက်တစ်ခုရှိသည်" မိန့်ခွန်းဖြင့် ကျော်ကြားသည်။',
      funFact_en:
        'MLK Day, celebrated on the third Monday of January, is a federal holiday. He won the Nobel Peace Prize in 1964 at age 35.',
      funFact_my:
        'MLK နေ့ကို ဇန်နဝါရီလ တတိယ တနင်္လာနေ့တွင် ကျင်းပပြီး ဖက်ဒရယ်အားလပ်ရက် ဖြစ်သည်။ ၁၉၆၄ ခုနှစ်တွင် အသက် ၃၅ နှစ်အရွယ် နိုဘယ်ငြိမ်းချမ်းရေးဆု ရရှိခဲ့သည်။',
      relatedQuestionIds: ['HIST-R07', 'SYM-13'],
    },
  },
  {
    id: 'HIST-R09',
    question_en: 'What major event happened on September 11, 2001, in the United States?',
    question_my:
      '၂၀၀၁ ခုနှစ်၊ စက်တင်ဘာလ ၁၁ ရက်နေ့တွင် အမေရိကန်ပြည်ထောင်စု၌ မည်သည့်အဓိကဖြစ်ရပ်ကြီး ဖြစ်ပွားခဲ့သနည်း။',
    category: 'Recent American History and Other Important Historical Information',
    studyAnswers: [
      {
        text_en: 'Terrorists attacked the United States.',
        text_my: 'အကြမ်းဖက်သမားများက အမေရိကန်ပြည်ထောင်စုကို တိုက်ခိုက်ခဲ့သည်။',
      },
    ],
    answers: [
      {
        text_en: 'Terrorists attacked the United States.',
        text_my: 'အကြမ်းဖက်သမားများက အမေရိကန်ပြည်ထောင်စုကို တိုက်ခိုက်ခဲ့သည်။',
        correct: true,
      },
      {
        text_en: 'The stock market crashed.',
        text_my: 'စတော့စျေးကွက် ပျက်စီးခဲ့သည်။',
        correct: false,
      },
      {
        text_en: 'The United States declared war on Japan.',
        text_my: 'အမေရိကန်ပြည်ထောင်စုက ဂျပန်ကို စစ်ကြေညာခဲ့သည်။',
        correct: false,
      },
      {
        text_en: 'Hurricane Katrina struck New Orleans.',
        text_my: 'ဟာရီကိန်း ကက်ထရီနာက နယူးအော်လင်းကို တိုက်ခတ်ခဲ့သည်။',
        correct: false,
      },
    ],
    explanation: {
      brief_en:
        'On September 11, 2001, terrorists hijacked four airplanes and attacked the United States. Two planes hit the World Trade Center in New York, one hit the Pentagon, and one crashed in Pennsylvania. Nearly 3,000 people died.',
      brief_my:
        '၂၀၀၁ ခုနှစ် စက်တင်ဘာ ၁၁ ရက်နေ့တွင် အကြမ်းဖက်သမားများသည် လေယာဉ် ၄ စီးကို ပြန်ပေးဆွဲပြီး အမေရိကန်ကို တိုက်ခိုက်ခဲ့သည်။ လေယာဉ် ၂ စီးက နယူးယောက်ရှိ ကမ္ဘာ့ကုန်သွယ်ရေးစင်တာကို၊ ၁ စီးက ပင်တဂွန်ကို တိုက်ခိုက်ခဲ့ပြီး ၁ စီးက ပင်ဆယ်ဗေးနီးယားတွင် ပျက်ကျခဲ့သည်။ လူ ၃,၀၀၀ နီးပါး ကျဆုံးခဲ့သည်။',
      funFact_en:
        'After 9/11, the U.S. created the Department of Homeland Security, the largest reorganization of the federal government since the Department of Defense was created in 1947.',
      funFact_my:
        '9/11 ပြီးနောက် အမေရိကန်သည် မိခင်နိုင်ငံလုံခြုံရေးဌာနကို ဖန်တီးခဲ့ပြီး ၁၉၄၇ ခုနှစ် ကာကွယ်ရေးဌာနဖန်တီးခဲ့ပြီးကတည်းက ဖက်ဒရယ်အစိုးရ၏ အကြီးမားဆုံး ပြန်လည်ဖွဲ့စည်းမှု ဖြစ်ခဲ့သည်။',
      relatedQuestionIds: ['HIST-R06'],
    },
  },
  {
    id: 'HIST-R10',
    question_en: 'Name one American Indian tribe in the United States.',
    question_my: 'အမေရိကန်ပြည်ထောင်စုရှိ အမေရိကန်အင်ဒီးယန်းမျိုးနွယ်စုတစ်ခုကို အမည်ပေးပါ။',
    category: 'Recent American History and Other Important Historical Information',
    studyAnswers: [
      { text_en: 'Cherokee', text_my: 'ချာရိုကီ' },
      { text_en: 'Navajo', text_my: 'နာဗာဟို' },
      { text_en: 'Sioux', text_my: 'ဆု' },
      { text_en: 'Chippewa', text_my: 'ချစ်ပီဝါ' },
      { text_en: 'Choctaw', text_my: 'ချော့တော' },
      { text_en: 'Pueblo', text_my: 'ပူအယ်ဘလို' },
      { text_en: 'Apache', text_my: 'အပါချီ' },
      { text_en: 'Iroquois', text_my: 'အီရိုကွာ' },
      { text_en: 'Creek', text_my: 'ခရစ်' },
      { text_en: 'Blackfeet', text_my: 'ဘလက်ဖိ' },
      { text_en: 'Seminole', text_my: 'ဆီမီနိုးလ်' },
      { text_en: 'Cheyenne', text_my: 'ရှိုင်ယန်' },
      { text_en: 'Arawak', text_my: 'အာရာဝပ်' },
      { text_en: 'Shawnee', text_my: 'ရှောနီ' },
      { text_en: 'Mohegan', text_my: 'မိုဟီဂန်' },
      { text_en: 'Huron', text_my: 'ဟူရွန်' },
      { text_en: 'Oneida', text_my: 'အိုနိုင်ဒါ' },
      { text_en: 'Lakota', text_my: 'လာကိုတာ' },
      { text_en: 'Crow', text_my: 'ခရိုး' },
      { text_en: 'Teton', text_my: 'တီတွန်' },
      { text_en: 'Hopi', text_my: 'ဟိုပီ' },
      { text_en: 'Inuit', text_my: 'အင်နုရစ်' },
    ],
    answers: [
      { text_en: 'Cherokee', text_my: 'ချာရိုကီ', correct: true },
      { text_en: 'Zulu', text_my: 'ဇူးလူး', correct: false },
      { text_en: 'Samoan', text_my: 'ဆာမိုအန်', correct: false },
      { text_en: 'Celtic', text_my: 'ကယ်လ်တစ်', correct: false },
    ],
    explanation: {
      brief_en:
        'There are many federally recognized American Indian tribes in the United States, including Cherokee, Navajo, Sioux, Chippewa, Choctaw, Apache, Iroquois, and many more. Each tribe has its own unique culture, language, and history.',
      brief_my:
        'အမေရိကန်ပြည်ထောင်စုတွင် ဖက်ဒရယ်အသိအမှတ်ပြု အမေရိကန်အင်ဒီးယန်းမျိုးနွယ်စုများစွာ ရှိသည် — ချာရိုကီ၊ နာဗာဟို၊ ဆု၊ ချစ်ပီဝါ၊ ချော့တော၊ အပါချီ၊ အီရိုကွာ အစရှိသဖြင့်။ မျိုးနွယ်စုတစ်ခုစီတွင် ကိုယ်ပိုင်ထူးခြားသော ယဉ်ကျေးမှု၊ ဘာသာစကားနှင့် သမိုင်း ရှိသည်။',
      funFact_en:
        'Today there are 574 federally recognized tribes in the U.S. The Cherokee Nation is the largest with over 400,000 citizens. The Navajo Nation covers parts of Arizona, New Mexico, and Utah.',
      funFact_my:
        'ယနေ့ အမေရိကန်တွင် ဖက်ဒရယ်အသိအမှတ်ပြု မျိုးနွယ်စု ၅၇၄ ခု ရှိသည်။ ချာရိုကီအမျိုးသားနိုင်ငံသည် နိုင်ငံသား ၄၀၀,၀၀၀ ကျော်ဖြင့် အကြီးဆုံးဖြစ်သည်။',
      relatedQuestionIds: ['HIST-C02'],
    },
  },
];
