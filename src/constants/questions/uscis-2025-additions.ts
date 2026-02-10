import type { Question } from '@/types';

/**
 * USCIS 2025 Expanded Questions (28 additions)
 *
 * These questions extend the 100-question civics bank to 128 questions,
 * using the same category structure and stable IDs.
 */
export const uscis2025Additions: Question[] = [
  // ============================================
  // PRINCIPLES OF AMERICAN DEMOCRACY (GOV-P13-16)
  // ============================================
  {
    id: 'GOV-P13',
    question_en: 'What is popular sovereignty?',
    question_my: 'လူထုအာဏာ (popular sovereignty) ဆိုတာ ဘာလဲ။',
    category: 'Principles of American Democracy',
    studyAnswers: [
      {
        text_en: 'the people are the source of government power',
        text_my: 'အစိုးရအာဏာ၏ အရင်းအမြစ်မှာ ပြည်သူများဖြစ်သည်',
      },
    ],
    answers: [
      {
        text_en: 'the people are the source of government power',
        text_my: 'အစိုးရအာဏာ၏ အရင်းအမြစ်မှာ ပြည်သူများဖြစ်သည်',
        correct: true,
      },
      {
        text_en: 'the courts are the source of power',
        text_my: 'တရားရုံးများက အာဏာပေးသည်',
        correct: false,
      },
      { text_en: 'the army is the source of power', text_my: 'စစ်တပ်က အာဏာပေးသည်', correct: false },
      { text_en: 'a king is the source of power', text_my: 'ဘုရင်က အာဏာပေးသည်', correct: false },
    ],
  },
  {
    id: 'GOV-P14',
    question_en: 'What is the purpose of the Bill of Rights?',
    question_my: 'အခွင့်အရေးမူကြမ်း (Bill of Rights) ရဲ့ ရည်ရွယ်ချက်က ဘာလဲ။',
    category: 'Principles of American Democracy',
    studyAnswers: [
      {
        text_en: 'to protect basic rights and freedoms',
        text_my: 'အခြေခံအခွင့်အရေးများနှင့် လွတ်လပ်ခွင့်များကို ကာကွယ်ရန်',
      },
    ],
    answers: [
      {
        text_en: 'to protect basic rights and freedoms',
        text_my: 'အခြေခံအခွင့်အရေးများနှင့် လွတ်လပ်ခွင့်များကို ကာကွယ်ရန်',
        correct: true,
      },
      { text_en: 'to create new states', text_my: 'ပြည်နယ်အသစ်များ ဖန်တီးရန်', correct: false },
      { text_en: 'to collect taxes', text_my: 'အခွန်ကောက်ခံရန်', correct: false },
      { text_en: 'to select senators', text_my: 'အထက်လွှတ်တော်အမတ်များရွေးရန်', correct: false },
    ],
  },
  {
    id: 'GOV-P15',
    question_en: 'What does consent of the governed mean?',
    question_my: '“အစိုးရအား ပြည်သူ၏ သဘောတူညီမှု” ဆိုတာ ဘာကို ဆိုလိုသလဲ။',
    category: 'Principles of American Democracy',
    studyAnswers: [
      {
        text_en: 'people give the government power by voting',
        text_my: 'ပြည်သူများက မဲပေးခြင်းဖြင့် အစိုးရအား အာဏာပေးသည်',
      },
    ],
    answers: [
      {
        text_en: 'people give the government power by voting',
        text_my: 'ပြည်သူများက မဲပေးခြင်းဖြင့် အစိုးရအား အာဏာပေးသည်',
        correct: true,
      },
      {
        text_en: 'judges choose the government',
        text_my: 'တရားသူကြီးများက အစိုးရကို ရွေးသည်',
        correct: false,
      },
      {
        text_en: 'the military chooses the government',
        text_my: 'စစ်တပ်က အစိုးရကို ရွေးသည်',
        correct: false,
      },
      {
        text_en: 'the government chooses the people',
        text_my: 'အစိုးရက ပြည်သူကို ရွေးသည်',
        correct: false,
      },
    ],
  },
  {
    id: 'GOV-P16',
    question_en: 'What are two ways the Constitution can be amended?',
    question_my: 'ဖွဲ့စည်းပုံအခြေခံဥပဒေကို ဘယ်လိုနည်းလမ်းနှစ်မျိုးနဲ့ ပြင်ဆင်နိုင်သလဲ။',
    category: 'Principles of American Democracy',
    studyAnswers: [
      {
        text_en: 'Congress proposes and states ratify',
        text_my: 'ကွန်ဂရက်က အဆိုတင်ပြီး ပြည်နယ်များက အတည်ပြုသည်',
      },
      {
        text_en: 'a constitutional convention called by the states',
        text_my: 'ပြည်နယ်များခေါ်သော ဖွဲ့စည်းပုံညီလာခံဖြင့်',
      },
    ],
    answers: [
      {
        text_en: 'Congress proposes and states ratify',
        text_my: 'ကွန်ဂရက်က အဆိုတင်ပြီး ပြည်နယ်များက အတည်ပြုသည်',
        correct: true,
      },
      {
        text_en: 'the President signs an executive order',
        text_my: 'သမ္မတက အမိန့်စာထုတ်သည်',
        correct: false,
      },
      { text_en: 'the Supreme Court votes', text_my: 'တရားရုံးချုပ်က မဲပေးသည်', correct: false },
      {
        text_en: 'state governors approve by themselves',
        text_my: 'ပြည်နယ်အုပ်ချုပ်ရေးမှူးများက ကိုယ်တိုင် အတည်ပြုသည်',
        correct: false,
      },
    ],
  },
  // ============================================
  // SYSTEM OF GOVERNMENT (GOV-S36-39)
  // ============================================
  {
    id: 'GOV-S36',
    question_en: 'What is the main responsibility of the Speaker of the House?',
    question_my: 'အောက်လွှတ်တော်အမတ် ဥက္ကဋ္ဌ (Speaker) ရဲ့ အဓိကတာဝန်က ဘာလဲ။',
    category: 'System of Government',
    studyAnswers: [
      { text_en: 'to lead the House of Representatives', text_my: 'အောက်လွှတ်တော်ကို ဦးဆောင်ရန်' },
    ],
    answers: [
      {
        text_en: 'to lead the House of Representatives',
        text_my: 'အောက်လွှတ်တော်ကို ဦးဆောင်ရန်',
        correct: true,
      },
      {
        text_en: 'to lead the Supreme Court',
        text_my: 'တရားရုံးချုပ်ကို ဦးဆောင်ရန်',
        correct: false,
      },
      { text_en: 'to command the military', text_my: 'စစ်တပ်ကို အမိန့်ပေးရန်', correct: false },
      {
        text_en: 'to sign treaties',
        text_my: 'အပြည်ပြည်ဆိုင်ရာ သဘောတူစာချုပ် လက်မှတ်ထိုးရန်',
        correct: false,
      },
    ],
  },
  {
    id: 'GOV-S37',
    question_en: 'Where does the President live?',
    question_my: 'သမ္မတက ဘယ်မှာ နေထိုင်သလဲ။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'the White House', text_my: 'အိမ်ဖြူတော်' }],
    answers: [
      { text_en: 'the White House', text_my: 'အိမ်ဖြူတော်', correct: true },
      { text_en: 'the Capitol', text_my: 'ကက်ပီတိုလ် အဆောက်အအုံ', correct: false },
      { text_en: 'the Pentagon', text_my: 'ပင်တာဂွန်', correct: false },
      { text_en: 'the Supreme Court', text_my: 'တရားရုံးချုပ်', correct: false },
    ],
  },
  {
    id: 'GOV-S38',
    question_en: 'What does judicial review mean?',
    question_my: 'တရားရုံးပြန်လည်သုံးသပ်မှု (judicial review) ဆိုတာ ဘာကို ဆိုလိုသလဲ။',
    category: 'System of Government',
    studyAnswers: [
      {
        text_en: 'courts can decide if a law is constitutional',
        text_my: 'ဥပဒေသည် ဖွဲ့စည်းပုံနှင့် ကိုက်ညီမှုရှိ/မရှိကို တရားရုံးများက ဆုံးဖြတ်နိုင်သည်',
      },
    ],
    answers: [
      {
        text_en: 'courts can decide if a law is constitutional',
        text_my: 'ဥပဒေသည် ဖွဲ့စည်းပုံနှင့် ကိုက်ညီမှုရှိ/မရှိကို တရားရုံးများက ဆုံးဖြတ်နိုင်သည်',
        correct: true,
      },
      { text_en: 'Congress writes the laws', text_my: 'ကွန်ဂရက်က ဥပဒေစာရေးသည်', correct: false },
      { text_en: 'the President collects taxes', text_my: 'သမ္မတက အခွန်ကောက်သည်', correct: false },
      {
        text_en: 'states choose senators',
        text_my: 'ပြည်နယ်များက အထက်လွှတ်တော်အမတ်များကို ရွေးသည်',
        correct: false,
      },
    ],
  },
  {
    id: 'GOV-S39',
    question_en: 'Who appoints federal judges?',
    question_my: 'ဖက်ဒရယ်တရားသူကြီးများကို ဘယ်သူခန့်အပ်သလဲ။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'the President', text_my: 'သမ္မတ' }],
    answers: [
      { text_en: 'the President', text_my: 'သမ္မတ', correct: true },
      { text_en: 'the Speaker of the House', text_my: 'အောက်လွှတ်တော်ဥက္ကဋ္ဌ', correct: false },
      { text_en: 'state governors', text_my: 'ပြည်နယ်အုပ်ချုပ်ရေးမှူးများ', correct: false },
      { text_en: 'the Supreme Court', text_my: 'တရားရုံးချုပ်', correct: false },
    ],
  },
  // ============================================
  // RIGHTS AND RESPONSIBILITIES (RR-11-13)
  // ============================================
  {
    id: 'RR-11',
    question_en: 'What is one promise you make in the Oath of Allegiance?',
    question_my: 'သစ္စာဆိုစာတွင် သင်က ဘယ်လိုကတိတစ်ခု ပြုသလဲ။',
    category: 'Rights and Responsibilities',
    studyAnswers: [
      {
        text_en: 'give up loyalty to other countries',
        text_my: 'အခြားနိုင်ငံများへの သစ္စာကို စွန့်လွှတ်မည်',
      },
      { text_en: 'defend the Constitution', text_my: 'ဖွဲ့စည်းပုံအခြေခံဥပဒေကို ကာကွယ်မည်' },
      { text_en: 'obey the laws of the United States', text_my: 'အမေရိကန်ဥပဒေများကို လိုက်နာမည်' },
    ],
    answers: [
      {
        text_en: 'defend the Constitution',
        text_my: 'ဖွဲ့စည်းပုံအခြေခံဥပဒေကို ကာကွယ်မည်',
        correct: true,
      },
      {
        text_en: 'become a member of Congress',
        text_my: 'ကွန်ဂရက်အဖွဲ့ဝင်ဖြစ်မည်',
        correct: false,
      },
      {
        text_en: 'own property in every state',
        text_my: 'ပြည်နယ်တိုင်းတွင် အိမ်ခြံမြေပိုင်ဆိုင်မည်',
        correct: false,
      },
      { text_en: 'serve as President', text_my: 'သမ္မတဖြစ်မည်', correct: false },
    ],
  },
  {
    id: 'RR-12',
    question_en: 'What is one responsibility of everyone living in the United States?',
    question_my: 'အမေရိကန်တွင် နေထိုင်သူတိုင်း၏ တာဝန်တစ်ခုမှာ ဘာလဲ။',
    category: 'Rights and Responsibilities',
    studyAnswers: [
      { text_en: 'obey the law', text_my: 'ဥပဒေကို လိုက်နာရန်' },
      { text_en: 'pay taxes', text_my: 'အခွန်ပေးဆောင်ရန်' },
    ],
    answers: [
      { text_en: 'obey the law', text_my: 'ဥပဒေကို လိုက်နာရန်', correct: true },
      {
        text_en: 'vote in federal elections',
        text_my: 'ဖက်ဒရယ်ရွေးကောက်ပွဲတွင် မဲပေးရန်',
        correct: false,
      },
      { text_en: 'run for federal office', text_my: 'ဖက်ဒရယ်ရုံးအတွက် အရွေးခံရန်', correct: false },
      {
        text_en: 'serve as a juror every year',
        text_my: 'နှစ်တိုင်း ဂျူရီတာဝန်ထမ်းဆောင်ရန်',
        correct: false,
      },
    ],
  },
  {
    id: 'RR-13',
    question_en: 'What is one way Americans can serve their country?',
    question_my: 'အမေရိကန်များက နိုင်ငံကို ဘယ်လိုနည်းလမ်းနဲ့ ဝန်ဆောင်နိုင်သလဲ။',
    category: 'Rights and Responsibilities',
    studyAnswers: [
      { text_en: 'serve in the military', text_my: 'စစ်တပ်တွင် တာဝန်ထမ်းဆောင်ရန်' },
      { text_en: 'work for the government', text_my: 'အစိုးရအတွက် အလုပ်လုပ်ရန်' },
      { text_en: 'volunteer in the community', text_my: 'အသိုင်းအဝိုင်းတွင် စေတနာဝန်ထမ်းလုပ်ရန်' },
    ],
    answers: [
      { text_en: 'serve in the military', text_my: 'စစ်တပ်တွင် တာဝန်ထမ်းဆောင်ရန်', correct: true },
      {
        text_en: 'move to another country',
        text_my: 'အခြားနိုင်ငံသို့ ပြောင်းရွှေ့ရန်',
        correct: false,
      },
      { text_en: 'skip jury duty', text_my: 'ဂျူရီတာဝန်ရှောင်ရန်', correct: false },
      { text_en: 'refuse to vote', text_my: 'မဲမပေးရန်', correct: false },
    ],
  },
  // ============================================
  // AMERICAN HISTORY: COLONIAL (HIST-C14-16)
  // ============================================
  {
    id: 'HIST-C14',
    question_en: 'What was the Boston Tea Party?',
    question_my: 'ဘော့စတန်လက်ဖက်ရည်ပါတီ (Boston Tea Party) ဆိုတာ ဘာလဲ။',
    category: 'American History: Colonial Period and Independence',
    studyAnswers: [
      {
        text_en: 'a protest against British taxes where tea was dumped into the harbor',
        text_my: 'ဗြိတိသျှအခွန်ဆန့်ကျင်မှုအတွက် လက်ဖက်ရည်ကို ဆိပ်ကမ်းထဲ ပစ်ချခဲ့သည့် ဆန္ဒပြမှု',
      },
    ],
    answers: [
      {
        text_en: 'a protest against British taxes where tea was dumped into the harbor',
        text_my: 'ဗြိတိသျှအခွန်ဆန့်ကျင်မှုအတွက် လက်ဖက်ရည်ကို ဆိပ်ကမ်းထဲ ပစ်ချခဲ့သည့် ဆန္ဒပြမှု',
        correct: true,
      },
      {
        text_en: 'the signing of the Constitution',
        text_my: 'ဖွဲ့စည်းပုံအခြေခံဥပဒေ လက်မှတ်ရေးထိုးခြင်း',
        correct: false,
      },
      {
        text_en: 'a meeting to elect the President',
        text_my: 'သမ္မတရွေးချယ်ရန် အစည်းအဝေး',
        correct: false,
      },
      {
        text_en: 'a treaty to end the Civil War',
        text_my: 'ပြည်တွင်းစစ်ကို အဆုံးသတ်ရန် သဘောတူစာချုပ်',
        correct: false,
      },
    ],
  },
  {
    id: 'HIST-C15',
    question_en: 'Name one of the original 13 colonies.',
    question_my: 'မူလ ကိုလိုနီ ၁၃ ခုထဲမှ တစ်ခုကို အမည်ပေးပါ။',
    category: 'American History: Colonial Period and Independence',
    studyAnswers: [
      { text_en: 'Massachusetts', text_my: 'မက်ဆာချူဆက်' },
      { text_en: 'Virginia', text_my: 'ဗာဂျီးနီးယား' },
      { text_en: 'Pennsylvania', text_my: 'ပင်စီလ်ဗေးနီးယား' },
    ],
    answers: [
      { text_en: 'Virginia', text_my: 'ဗာဂျီးနီးယား', correct: true },
      { text_en: 'Alaska', text_my: 'အလာစကာ', correct: false },
      { text_en: 'Hawaii', text_my: 'ဟာဝိုင်', correct: false },
      { text_en: 'California', text_my: 'ကယ်လီဖိုးနီးယား', correct: false },
    ],
  },
  {
    id: 'HIST-C16',
    question_en: 'Who was the King of England during the American Revolution?',
    question_my: 'အမေရိကန်လွတ်လပ်ရေးတော်လှန်ရေးအချိန်မှာ အင်္ဂလန်ဘုရင်က ဘယ်သူလဲ။',
    category: 'American History: Colonial Period and Independence',
    studyAnswers: [{ text_en: 'King George III', text_my: 'ဘုရင် ဂျော့ဂျ် သုံး' }],
    answers: [
      { text_en: 'King George III', text_my: 'ဘုရင် ဂျော့ဂျ် သုံး', correct: true },
      { text_en: 'King Henry VIII', text_my: 'ဘုရင် ဟင်နရီ ရှစ်', correct: false },
      { text_en: 'Queen Victoria', text_my: 'ဘုရင်မ ဗစ်တိုရီးယား', correct: false },
      { text_en: 'King Charles I', text_my: 'ဘုရင် ခါလ်စ် ပထမ', correct: false },
    ],
  },
  // ============================================
  // AMERICAN HISTORY: 1800s (HIST-108-109)
  // ============================================
  {
    id: 'HIST-108',
    question_en: 'Who was Harriet Tubman?',
    question_my: 'ဟာရီယက် တပ်ဘ်မန် (Harriet Tubman) ဆိုတာ ဘယ်သူလဲ။',
    category: 'American History: 1800s',
    studyAnswers: [
      {
        text_en: 'an abolitionist who helped enslaved people escape',
        text_my: 'ကျွန်စနစ်ဆန့်ကျင်သူဖြစ်ပြီး ကျွန်များကို လွတ်လပ်ရေးသို့ ကူညီပို့ဆောင်သူ',
      },
    ],
    answers: [
      {
        text_en: 'an abolitionist who helped enslaved people escape',
        text_my: 'ကျွန်စနစ်ဆန့်ကျင်သူဖြစ်ပြီး ကျွန်များကို လွတ်လပ်ရေးသို့ ကူညီပို့ဆောင်သူ',
        correct: true,
      },
      { text_en: 'a general in World War I', text_my: 'ပထမကမ္ဘာစစ်တပ်မှူး', correct: false },
      { text_en: 'the first female senator', text_my: 'ပထမဆုံး အမျိုးသမီးဆင်နေတာ', correct: false },
      { text_en: 'a Supreme Court justice', text_my: 'တရားရုံးချုပ်တရားသူကြီး', correct: false },
    ],
  },
  {
    id: 'HIST-109',
    question_en: 'What was the Underground Railroad?',
    question_my: 'Underground Railroad ဆိုတာ ဘာလဲ။',
    category: 'American History: 1800s',
    studyAnswers: [
      {
        text_en: 'a network that helped enslaved people escape to freedom',
        text_my: 'ကျွန်များကို လွတ်လပ်ရေးသို့ ထွက်ပြေးနိုင်ရန် ကူညီသော လျှို့ဝှက်ကွန်ယက်',
      },
    ],
    answers: [
      {
        text_en: 'a network that helped enslaved people escape to freedom',
        text_my: 'ကျွန်များကို လွတ်လပ်ရေးသို့ ထွက်ပြေးနိုင်ရန် ကူညီသော လျှို့ဝှက်ကွန်ယက်',
        correct: true,
      },
      { text_en: 'the first subway system', text_my: 'ပထမဆုံး မြေအောက်ရထားစနစ်', correct: false },
      {
        text_en: 'a railroad that carried soldiers',
        text_my: 'စစ်သားများကို သယ်ဆောင်သည့် ရထားလမ်း',
        correct: false,
      },
      {
        text_en: 'a plan to build factories',
        text_my: 'စက်ရုံများဆောက်ရန် စီမံကိန်း',
        correct: false,
      },
    ],
  },
  // ============================================
  // RECENT AMERICAN HISTORY (HIST-R11-12)
  // ============================================
  {
    id: 'HIST-R11',
    question_en: 'What was the Berlin Wall?',
    question_my: 'ဘာလင်နံရံ (Berlin Wall) ဆိုတာ ဘာလဲ။',
    category: 'Recent American History and Other Important Historical Information',
    studyAnswers: [
      {
        text_en: 'a wall that divided East and West Berlin during the Cold War',
        text_my: 'စစ်အေးကာလတွင် အရှေ့နှင့် အနောက်ဘာလင်ကို ခွဲထားသော နံရံ',
      },
    ],
    answers: [
      {
        text_en: 'a wall that divided East and West Berlin during the Cold War',
        text_my: 'စစ်အေးကာလတွင် အရှေ့နှင့် အနောက်ဘာလင်ကို ခွဲထားသော နံရံ',
        correct: true,
      },
      {
        text_en: 'a wall around the White House',
        text_my: 'အိမ်ဖြူတော်ပတ်လည်နံရံ',
        correct: false,
      },
      {
        text_en: 'a wall that marked the U.S.-Mexico border',
        text_my: 'အမေရိကန်-မက်ကဆီကို နယ်စပ်နံရံ',
        correct: false,
      },
      { text_en: 'a wall around the Capitol', text_my: 'ကက်ပီတိုလ်ပတ်လည်နံရံ', correct: false },
    ],
  },
  {
    id: 'HIST-R12',
    question_en: 'What is the United Nations?',
    question_my: 'United Nations (UN) ဆိုတာ ဘာလဲ။',
    category: 'Recent American History and Other Important Historical Information',
    studyAnswers: [
      {
        text_en: 'an international organization where countries work together for peace',
        text_my:
          'နိုင်ငံများ ပူးပေါင်း၍ ငြိမ်းချမ်းရေးအတွက် လုပ်ဆောင်သော အပြည်ပြည်ဆိုင်ရာ အဖွဲ့အစည်း',
      },
    ],
    answers: [
      {
        text_en: 'an international organization where countries work together for peace',
        text_my:
          'နိုင်ငံများ ပူးပေါင်း၍ ငြိမ်းချမ်းရေးအတွက် လုပ်ဆောင်သော အပြည်ပြည်ဆိုင်ရာ အဖွဲ့အစည်း',
        correct: true,
      },
      {
        text_en: 'a U.S. state legislature',
        text_my: 'အမေရိကန်ပြည်နယ် ဥပဒေပြုအဖွဲ့',
        correct: false,
      },
      { text_en: 'a federal court', text_my: 'ဖက်ဒရယ်တရားရုံး', correct: false },
      { text_en: 'a private company', text_my: 'ပုဂ္ဂလိကကုမ္ပဏီ', correct: false },
    ],
  },
  // ============================================
  // SYMBOLS AND HOLIDAYS (SYM-14-15)
  // ============================================
  {
    id: 'SYM-14',
    question_en: 'What is the national motto of the United States?',
    question_my: 'အမေရိကန်နိုင်ငံ၏ အမျိုးသားမိုထိုး (national motto) က ဘာလဲ။',
    category: 'Civics: Symbols and Holidays',
    studyAnswers: [{ text_en: 'In God We Trust', text_my: 'ဘုရားကို ယုံကြည်သည်' }],
    answers: [
      { text_en: 'In God We Trust', text_my: 'ဘုရားကို ယုံကြည်သည်', correct: true },
      { text_en: 'E Pluribus Unum', text_my: 'E Pluribus Unum', correct: false },
      { text_en: 'Liberty and Justice', text_my: 'လွတ်လပ်ရေးနှင့် တရားမျှတမှု', correct: false },
      { text_en: 'United We Stand', text_my: 'အတူတကွရပ်တည်ကြစို့', correct: false },
    ],
  },
  {
    id: 'SYM-15',
    question_en: 'What is the national flower of the United States?',
    question_my: 'အမေရိကန်နိုင်ငံ၏ အမျိုးသားပန်း (national flower) က ဘာလဲ။',
    category: 'Civics: Symbols and Holidays',
    studyAnswers: [{ text_en: 'the rose', text_my: 'နှင်းဆီပန်း' }],
    answers: [
      { text_en: 'the rose', text_my: 'နှင်းဆီပန်း', correct: true },
      { text_en: 'the lotus', text_my: 'ကြာပန်း', correct: false },
      { text_en: 'the cherry blossom', text_my: 'ချယ်ရီပန်း', correct: false },
      { text_en: 'the lily', text_my: 'ပန်းခရမ်း', correct: false },
    ],
  },
  // ============================================
  // USCIS 2025: 8 ADDITIONAL QUESTIONS (GOV-P17, GOV-S40-S46)
  // ============================================
  {
    id: 'GOV-P17',
    question_en: 'Many documents influenced the United States Constitution. Name one.',
    question_my:
      'စာရွက်စာတမ်းများစွာက အမေရိကန်ဖွဲ့စည်းပုံအခြေခံဥပဒေကို လွှမ်းမိုးခဲ့သည်။ တစ်ခုကို အမည်ပေးပါ။',
    category: 'Principles of American Democracy',
    studyAnswers: [
      { text_en: 'Magna Carta', text_my: 'မဂ္ဂနာကာတာ' },
      {
        text_en: 'Articles of Confederation',
        text_my: 'ကွန်ဖက်ဒရေးရှင်းစာချုပ်',
      },
      { text_en: 'Federalist Papers', text_my: 'ဖက်ဒရယ်လစ်စာတမ်းများ' },
      {
        text_en: 'Anti-Federalist Papers',
        text_my: 'ဖက်ဒရယ်လစ်ဆန့်ကျင်ရေးစာတမ်းများ',
      },
      {
        text_en: 'Declaration of Independence',
        text_my: 'လွတ်လပ်ရေးကြေညာစာတမ်း',
      },
      {
        text_en: 'English Bill of Rights',
        text_my: 'အင်္ဂလိပ်အခွင့်အရေးဥပဒေ',
      },
    ],
    answers: [
      { text_en: 'Magna Carta', text_my: 'မဂ္ဂနာကာတာ', correct: true },
      { text_en: 'Treaty of Paris', text_my: 'ပါရီစာချုပ်', correct: false },
      {
        text_en: 'Monroe Doctrine',
        text_my: 'မွန်ရိုးဝါဒ',
        correct: false,
      },
      {
        text_en: 'Gettysburg Address',
        text_my: 'ဂက်တီးစဘတ်မိန့်ခွန်း',
        correct: false,
      },
    ],
  },
  {
    id: 'GOV-S40',
    question_en: 'Why do U.S. representatives serve shorter terms than U.S. senators?',
    question_my:
      'အမေရိကန်ကိုယ်စားလှယ်များသည် အထက်လွှတ်တော်အမတ်များထက် သက်တမ်းတိုရသည်မှာ အဘယ်ကြောင့်နည်း။',
    category: 'System of Government',
    studyAnswers: [
      {
        text_en: 'to more closely follow public opinion',
        text_my: 'ပြည်သူ့အမြင်ကို ပိုမိုနီးကပ်စွာ လိုက်နာနိုင်စေရန်',
      },
      {
        text_en: 'to be more responsive to the people',
        text_my: 'ပြည်သူများအပေါ် ပိုမိုတုံ့ပြန်နိုင်စေရန်',
      },
    ],
    answers: [
      {
        text_en: 'to more closely follow public opinion',
        text_my: 'ပြည်သူ့အမြင်ကို ပိုမိုနီးကပ်စွာ လိုက်နာနိုင်စေရန်',
        correct: true,
      },
      {
        text_en: 'Because they have less power',
        text_my: 'သူတို့မှာ အာဏာပိုနည်းလို့',
        correct: false,
      },
      {
        text_en: 'Because the Constitution was amended',
        text_my: 'ဖွဲ့စည်းပုံကို ပြင်ဆင်ခဲ့လို့',
        correct: false,
      },
      {
        text_en: 'Because they represent fewer people',
        text_my: 'သူတို့က လူနည်းကို ကိုယ်စားပြုလို့',
        correct: false,
      },
    ],
  },
  {
    id: 'GOV-S41',
    question_en: 'How many senators does each state have?',
    question_my: 'ပြည်နယ်တစ်ခုစီတွင် အထက်လွှတ်တော်အမတ် ဘယ်နှစ်ဦးရှိသလဲ။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'Two (2)', text_my: 'နှစ် (၂)' }],
    answers: [
      { text_en: 'Two (2)', text_my: 'နှစ် (၂)', correct: true },
      { text_en: 'One (1)', text_my: 'တစ် (၁)', correct: false },
      { text_en: 'Four (4)', text_my: 'လေး (၄)', correct: false },
      {
        text_en: "It depends on the state's population",
        text_my: 'ပြည်နယ်၏ လူဦးရေပေါ် မူတည်သည်',
        correct: false,
      },
    ],
  },
  {
    id: 'GOV-S42',
    question_en: 'Why does each state have two senators?',
    question_my: 'ပြည်နယ်တစ်ခုစီတွင် အထက်လွှတ်တော်အမတ် နှစ်ဦးရှိရသည်မှာ အဘယ်ကြောင့်နည်း။',
    category: 'System of Government',
    studyAnswers: [
      {
        text_en: 'equal representation for small and large states',
        text_my: 'ပြည်နယ်ငယ်များနှင့် ပြည်နယ်ကြီးများအတွက် တန်းတူကိုယ်စားပြုမှု',
      },
      {
        text_en: 'so all states have equal power in the Senate',
        text_my: 'ပြည်နယ်အားလုံး အထက်လွှတ်တော်တွင် အာဏာတူညီစေရန်',
      },
    ],
    answers: [
      {
        text_en: 'equal representation for small and large states',
        text_my: 'ပြည်နယ်ငယ်များနှင့် ပြည်နယ်ကြီးများအတွက် တန်းတူကိုယ်စားပြုမှု',
        correct: true,
      },
      {
        text_en: "Because it was George Washington's idea",
        text_my: 'ဂျော့ဝါရှင်တန်၏ အကြံဖြစ်လို့',
        correct: false,
      },
      {
        text_en: 'Because there are two parties',
        text_my: 'ပါတီနှစ်ခုရှိလို့',
        correct: false,
      },
      {
        text_en: 'Because senators serve two terms',
        text_my: 'အထက်လွှတ်တော်အမတ်များက သက်တမ်းနှစ်ခု တာဝန်ထမ်းဆောင်လို့',
        correct: false,
      },
    ],
  },
  {
    id: 'GOV-S43',
    question_en: 'The President of the United States can serve only two terms. Why?',
    question_my: 'အမေရိကန်သမ္မတသည် သက်တမ်းနှစ်ခုသာ တာဝန်ထမ်းဆောင်နိုင်သည်။ အဘယ်ကြောင့်နည်း။',
    category: 'System of Government',
    studyAnswers: [
      {
        text_en: 'Because of the 22nd Amendment',
        text_my: 'ပြင်ဆင်ချက် ၂၂ ကြောင့်',
      },
      {
        text_en: 'to prevent abuse of power',
        text_my: 'အာဏာအလွဲသုံးစားမှုကို တားဆီးရန်',
      },
      {
        text_en: 'to ensure peaceful transfer of power',
        text_my: 'အာဏာလွှဲပြောင်းမှု ငြိမ်းချမ်းစွာ ဖြစ်စေရန်',
      },
    ],
    answers: [
      {
        text_en: 'Because of the 22nd Amendment',
        text_my: 'ပြင်ဆင်ချက် ၂၂ ကြောင့်',
        correct: true,
      },
      {
        text_en: 'Because of the Bill of Rights',
        text_my: 'အခွင့်အရေးဥပဒေကြမ်းကြောင့်',
        correct: false,
      },
      {
        text_en: 'Because of the Supreme Court',
        text_my: 'တရားရုံးချုပ်ကြောင့်',
        correct: false,
      },
      {
        text_en: 'Because Congress limits it',
        text_my: 'ကွန်ဂရက်က ကန့်သတ်လို့',
        correct: false,
      },
    ],
  },
  {
    id: 'GOV-S44',
    question_en: 'Why is the Electoral College important?',
    question_my: 'ရွေးကောက်တင်မြှောက်ရေးအဖွဲ့ (Electoral College) သည် အဘယ်ကြောင့် အရေးကြီးသနည်း။',
    category: 'System of Government',
    studyAnswers: [
      {
        text_en: 'It decides who is elected president',
        text_my: 'မည်သူ သမ္မတအဖြစ် ရွေးကောက်တင်မြှောက်ခံရမည်ကို ဆုံးဖြတ်သည်',
      },
      {
        text_en: 'It provides a compromise between the popular vote and congressional vote',
        text_my: 'ပြည်သူ့မဲနှင့် ကွန်ဂရက်မဲကြား အလျှော့အတင်းတစ်ခု ဖန်တီးပေးသည်',
      },
    ],
    answers: [
      {
        text_en: 'It decides who is elected president',
        text_my: 'မည်သူ သမ္မတအဖြစ် ရွေးကောက်တင်မြှောက်ခံရမည်ကို ဆုံးဖြတ်သည်',
        correct: true,
      },
      {
        text_en: 'It trains future politicians',
        text_my: 'အနာဂတ်နိုင်ငံရေးသမားများကို လေ့ကျင့်ပေးသည်',
        correct: false,
      },
      {
        text_en: 'It sets the budget',
        text_my: 'ဘတ်ဂျက်သတ်မှတ်သည်',
        correct: false,
      },
      {
        text_en: 'It approves new laws',
        text_my: 'ဥပဒေအသစ်များ အတည်ပြုသည်',
        correct: false,
      },
    ],
  },
  {
    id: 'GOV-S45',
    question_en: 'How long do Supreme Court justices serve?',
    question_my: 'တရားရုံးချုပ်တရားသူကြီးများသည် ဘယ်လောက်ကြာ တာဝန်ထမ်းဆောင်သလဲ။',
    category: 'System of Government',
    studyAnswers: [
      {
        text_en: 'They are appointed for life',
        text_my: 'တသက်တာ ခန့်အပ်ခြင်း ခံရသည်',
      },
      {
        text_en: 'until they want to retire',
        text_my: 'အနားယူလိုသည်အထိ',
      },
      { text_en: 'until they die', text_my: 'သေဆုံးသည်အထိ' },
      {
        text_en: 'until they are impeached and convicted',
        text_my: 'စွပ်စွဲခံရပြီး ပြစ်ဒဏ်ချခံရသည်အထိ',
      },
    ],
    answers: [
      {
        text_en: 'They are appointed for life',
        text_my: 'တသက်တာ ခန့်အပ်ခြင်း ခံရသည်',
        correct: true,
      },
      { text_en: '20 years', text_my: '၂၀ နှစ်', correct: false },
      { text_en: '10 years', text_my: '၁၀ နှစ်', correct: false },
      {
        text_en: 'Until the next president takes office',
        text_my: 'နောက်သမ္မတ တာဝန်ယူသည်အထိ',
        correct: false,
      },
    ],
  },
  {
    id: 'GOV-S46',
    question_en: 'Why do Supreme Court justices serve for life?',
    question_my: 'တရားရုံးချုပ်တရားသူကြီးများသည် အဘယ်ကြောင့် တသက်တာ တာဝန်ထမ်းဆောင်ရသနည်း။',
    category: 'System of Government',
    studyAnswers: [
      {
        text_en: 'to be independent from politics',
        text_my: 'နိုင်ငံရေးမှ လွတ်လပ်စေရန်',
      },
      {
        text_en: 'so they can make decisions based on the Constitution rather than popular opinion',
        text_my: 'လူထုအမြင်ထက် ဖွဲ့စည်းပုံအခြေခံဥပဒေကို အခြေခံ၍ ဆုံးဖြတ်ချက်ချနိုင်စေရန်',
      },
    ],
    answers: [
      {
        text_en: 'to be independent from politics',
        text_my: 'နိုင်ငံရေးမှ လွတ်လပ်စေရန်',
        correct: true,
      },
      {
        text_en: 'Because they are elected by the people',
        text_my: 'ပြည်သူများက ရွေးကောက်တင်မြှောက်လို့',
        correct: false,
      },
      {
        text_en: 'Because the President decides',
        text_my: 'သမ္မတက ဆုံးဖြတ်လို့',
        correct: false,
      },
      {
        text_en: 'Because Congress cannot remove them',
        text_my: 'ကွန်ဂရက်က ဖယ်ရှားလို့ မရလို့',
        correct: false,
      },
    ],
  },
];
