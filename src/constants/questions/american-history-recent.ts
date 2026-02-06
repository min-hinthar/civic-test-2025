import type { Question } from '@/types';

/**
 * Recent American History and Other Important Historical Information
 *
 * ID Prefix: HIST-R## (10 questions)
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
  },
  {
    id: 'HIST-R02',
    question_en: 'Who was President during World War I?',
    question_my: 'ပထမကမ္ဘာစစ်အတွင်း သမ္မတသည် မည်သူနည်း။',
    category: 'Recent American History and Other Important Historical Information',
    studyAnswers: [{ text_en: '(Woodrow) Wilson', text_my: '(ဝုဒ်ရိုး) ဝီလ်ဆင်' }],
    answers: [
      { text_en: '(Woodrow) Wilson', text_my: '(ဝုဒ်ရိုး) ဝီလ်ဆင်', correct: true },
      { text_en: 'Franklin Roosevelt', text_my: 'ဖရန်ကလင် ရုစဗဲ့', correct: false },
      { text_en: 'Theodore Roosevelt', text_my: 'သီအိုဒေါ ရုစဗဲ့', correct: false },
      { text_en: 'Abraham Lincoln', text_my: 'အာဗြဟံ လင်ကွန်း', correct: false },
    ],
  },
  {
    id: 'HIST-R03',
    question_en: 'Who was President during the Great Depression and World War II?',
    question_my: 'မဟာစီးပွားပျက်ကပ်နှင့် ဒုတိယကမ္ဘာစစ်အတွင်း သမ္မတသည် မည်သူနည်း။',
    category: 'Recent American History and Other Important Historical Information',
    studyAnswers: [{ text_en: '(Franklin) Roosevelt', text_my: '(ဖရန်ကလင်) ရုစဗဲ့' }],
    answers: [
      { text_en: '(Franklin) Roosevelt', text_my: '(ဖရန်ကလင်) ရုစဗဲ့', correct: true },
      { text_en: 'Harry Truman', text_my: 'ဟယ်ရီ ထရူးမင်း', correct: false },
      { text_en: 'Herbert Hoover', text_my: 'ဟာဘတ် ဟူဗာ', correct: false },
      { text_en: 'Woodrow Wilson', text_my: 'ဝုဒ်ရိုး ဝီလ်ဆင်', correct: false },
    ],
  },
  {
    id: 'HIST-R04',
    question_en: 'Who did the United States fight in World War II?',
    question_my: 'ဒုတိယကမ္ဘာစစ်တွင် အမေရိကန်ပြည်ထောင်စုသည် မည်သူ့ကို တိုက်ခိုက်ခဲ့သနည်း။',
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
  },
  {
    id: 'HIST-R05',
    question_en: 'Before he was President, Eisenhower was a general. What war was he in?',
    question_my:
      'သမ္မတမဖြစ်မီ၊ အိုက်စင်ဟောင်ဝါသည် ဗိုလ်ချုပ်တစ်ဦးဖြစ်ခဲ့သည်။ သူသည် မည်သည့်စစ်ပွဲတွင် ပါဝင်ခဲ့သနည်း။',
    category: 'Recent American History and Other Important Historical Information',
    studyAnswers: [{ text_en: 'World War II', text_my: 'ဒုတိယကမ္ဘာစစ်' }],
    answers: [
      { text_en: 'World War II', text_my: 'ဒုတိယကမ္ဘာစစ်', correct: true },
      { text_en: 'World War I', text_my: 'ပထမကမ္ဘာစစ်', correct: false },
      { text_en: 'The Civil War', text_my: 'ပြည်တွင်းစစ်', correct: false },
      { text_en: 'The Korean War', text_my: 'ကိုရီးယားစစ်ပွဲ', correct: false },
    ],
  },
  {
    id: 'HIST-R06',
    question_en: 'During the Cold War, what was the main concern of the United States?',
    question_my: 'စစ်အေးတိုက်ပွဲအတွင်း၊ အမေရိကန်ပြည်ထောင်စု၏ အဓိကစိုးရိမ်မှုကား အဘယ်နည်း။',
    category: 'Recent American History and Other Important Historical Information',
    studyAnswers: [{ text_en: 'Communism', text_my: 'ကွန်မြူနစ်ဝါဒ' }],
    answers: [
      { text_en: 'Communism', text_my: 'ကွန်မြူနစ်ဝါဒ', correct: true },
      { text_en: 'Climate Change', text_my: 'ရာသီဥတုပြောင်းလဲမှု', correct: false },
      { text_en: 'The Great Depression', text_my: 'မဟာစီးပွားပျက်ကပ်', correct: false },
      { text_en: 'Terrorism', text_my: 'အကြမ်းဖက်ဝါဒ', correct: false },
    ],
  },
  {
    id: 'HIST-R07',
    question_en: 'What movement tried to end racial discrimination?',
    question_my: 'မည်သည့်လှုပ်ရှားမှုက လူမျိုးရေးခွဲခြားမှုကို အဆုံးသတ်ရန် ကြိုးစားခဲ့သနည်း။',
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
  },
  {
    id: 'HIST-R08',
    question_en: 'What did Martin Luther King, Jr. do?',
    question_my: 'မာတင် လူသာ ကင်း၊ ဂျူနီယာက ဘာလုပ်ခဲ့သလဲ။',
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
  },
];
