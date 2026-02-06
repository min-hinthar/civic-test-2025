import type { Question } from '@/types';

/**
 * American Government Questions
 *
 * ID Prefixes:
 * - GOV-P##: Principles of American Democracy (12 questions)
 * - GOV-S##: System of Government (35 questions)
 */

export const americanGovernmentQuestions: Question[] = [
  // ============================================
  // PRINCIPLES OF AMERICAN DEMOCRACY (GOV-P01-12)
  // ============================================
  {
    id: 'GOV-P01',
    question_en: 'What is the supreme law of the land?',
    question_my: 'နိုင်ငံ၏ အမြင့်ဆုံးဥပဒေကား အဘယ်နည်း။',
    category: 'Principles of American Democracy',
    studyAnswers: [{ text_en: 'the Constitution', text_my: 'ဖွဲ့စည်းပုံအခြေခံဥပဒေ' }],
    answers: [
      { text_en: 'the Constitution', text_my: 'ဖွဲ့စည်းပုံအခြေခံဥပဒေ', correct: true },
      {
        text_en: 'the Declaration of Independence',
        text_my: 'လွတ်လပ်ရေးကြေညာစာတမ်း',
        correct: false,
      },
      {
        text_en: 'the Articles of Confederation',
        text_my: 'ကွန်ဖက်ဒရေးရှင်း ဆောင်းပါးများ',
        correct: false,
      },
      {
        text_en: 'the Emancipation Proclamation',
        text_my: 'လွတ်မြောက်ရေး ကြေညာချက်',
        correct: false,
      },
    ],
  },
  {
    id: 'GOV-P02',
    question_en: 'What does the Constitution do?',
    question_my: 'ဖွဲ့စည်းပုံအခြေခံဥပဒေက ဘာလုပ်သလဲ။',
    category: 'Principles of American Democracy',
    studyAnswers: [
      { text_en: 'sets up the government', text_my: 'အစိုးရကိုဖွဲ့စည်းတယ်' },
      { text_en: 'defines the government', text_my: 'အစိုးရကို သတ်မှတ်သည်' },
      {
        text_en: 'protects basic rights of Americans',
        text_my: 'အမေရိကန်များ၏ အခြေခံအခွင့်အရေးများကို ကာကွယ်ပေးသည်',
      },
    ],
    answers: [
      { text_en: 'sets up the government', text_my: 'အစိုးရကိုဖွဲ့စည်းတယ်', correct: true },
      {
        text_en: 'declares our independence',
        text_my: 'ကျွန်ုပ်တို့၏လွတ်လပ်ရေးကိုကြေငြာသည်',
        correct: false,
      },
      {
        text_en: 'defines the role of the states',
        text_my: 'ပြည်နယ်များ၏အခန်းကဏ္ဍကိုသတ်မှတ်သည်',
        correct: false,
      },
      { text_en: 'sets the tax rate', text_my: 'အခွန်နှုန်းထားကိုသတ်မှတ်သည်', correct: false },
    ],
  },
  {
    id: 'GOV-P03',
    question_en:
      'The idea of self-government is in the first three words of the Constitution. What are these words?',
    question_my:
      'ကိုယ်ပိုင်အုပ်ချုပ်ရေးဆိုတဲ့ စိတ်ကူးက ဖွဲ့စည်းပုံအခြေခံဥပဒေရဲ့ ပထမဆုံး စကားလုံးသုံးလုံးမှာ ရှိပါတယ်။ ဒီစကားလုံးတွေက ဘာတွေလဲ။',
    category: 'Principles of American Democracy',
    studyAnswers: [{ text_en: 'We the People', text_my: 'ငါတို့ပြည်သူတွေ' }],
    answers: [
      { text_en: 'We the People', text_my: 'ငါတို့ပြည်သူတွေ', correct: true },
      { text_en: 'We the States', text_my: 'ငါတို့ပြည်နယ်တွေ', correct: false },
      { text_en: 'Congress shall make', text_my: 'ကွန်ဂရက်ကလုပ်ရမယ်။', correct: false },
      {
        text_en: 'Life, Liberty, Happiness',
        text_my: 'အသက်ရှင်သန်မှု၊ လွတ်လပ်မှု၊ ပျော်ရွှင်မှု',
        correct: false,
      },
    ],
  },
  {
    id: 'GOV-P04',
    question_en: 'What is an amendment?',
    question_my: 'ပြင်ဆင်ချက်ဆိုတာ ဘာလဲ။',
    category: 'Principles of American Democracy',
    studyAnswers: [
      {
        text_en: 'a change (to the Constitution)',
        text_my: 'ဖွဲ့စည်းပုံအခြေခံဥပဒေကို ပြောင်းလဲခြင်း',
      },
      {
        text_en: 'an addition (to the Constitution)',
        text_my: 'ဖွဲ့စည်းပုံအခြေခံဥပဒေတွင် ထပ်လောင်းထည့်ခြင်း',
      },
    ],
    answers: [
      {
        text_en: 'a change (to the Constitution)',
        text_my: 'ဖွဲ့စည်းပုံအခြေခံဥပဒေကို ပြောင်းလဲခြင်း',
        correct: true,
      },
      { text_en: 'a new law', text_my: 'ဥပဒေအသစ်', correct: false },
      { text_en: 'a court order', text_my: 'တရားရုံးအမိန့်', correct: false },
      { text_en: 'a presidential decree', text_my: 'သမ္မတအမိန့်', correct: false },
    ],
  },
  {
    id: 'GOV-P05',
    question_en: 'What do we call the first ten amendments to the Constitution?',
    question_my: 'ဖွဲ့စည်းပုံအခြေခံဥပဒေရဲ့ ပထမဆုံး ပြင်ဆင်ချက် ဆယ်ခုကို ဘယ်လိုခေါ်လဲ။',
    category: 'Principles of American Democracy',
    studyAnswers: [{ text_en: 'the Bill of Rights', text_my: 'အခွင့်အရေးဥပဒေကြမ်း' }],
    answers: [
      { text_en: 'the Bill of Rights', text_my: 'အခွင့်အရေးဥပဒေကြမ်း', correct: true },
      {
        text_en: 'the Declaration of Independence',
        text_my: 'လွတ်လပ်ရေးကြေညာစာတမ်း',
        correct: false,
      },
      {
        text_en: 'the Articles of Confederation',
        text_my: 'ကွန်ဖက်ဒရေးရှင်း ဆောင်းပါးများ',
        correct: false,
      },
      { text_en: 'the Freedom Amendments', text_my: 'လွတ်လပ်ရေး ပြင်ဆင်ချက်များ', correct: false },
    ],
  },
  {
    id: 'GOV-P06',
    question_en: 'What is one right or freedom from the First Amendment?',
    question_my: 'ပထမပြင်ဆင်ချက်ပါ အခွင့်အရေး ဒါမှမဟုတ် လွတ်လပ်ခွင့်တစ်ခုက ဘာလဲ။',
    category: 'Principles of American Democracy',
    studyAnswers: [
      { text_en: 'speech', text_my: 'ပြောဆိုခွင့်' },
      { text_en: 'religion', text_my: 'ဘာသာရေး' },
      { text_en: 'assembly', text_my: 'စည်းဝေးခွင့်' },
      { text_en: 'press', text_my: 'စာနယ်ဇင်း' },
      { text_en: 'petition the government', text_my: 'အစိုးရကို အသနားခံစာတင်ခြင်း' },
    ],
    answers: [
      { text_en: 'Speech', text_my: 'ပြောဆိုခွင့်', correct: true },
      { text_en: 'To bear arms', text_my: 'လက်နက်ကိုင်ဆောင်ရန်', correct: false },
      { text_en: 'Trial by jury', text_my: 'ဂျူရီလူကြီးဖြင့် စစ်ဆေးခြင်း။', correct: false },
      { text_en: 'To vote', text_my: 'မဲပေးရန်', correct: false },
    ],
  },
  {
    id: 'GOV-P07',
    question_en: 'How many amendments does the Constitution have?',
    question_my: 'ဖွဲ့စည်းပုံအခြေခံဥပဒေမှာ ပြင်ဆင်ချက် ဘယ်လောက်ရှိလဲ။',
    category: 'Principles of American Democracy',
    studyAnswers: [{ text_en: 'twenty-seven (27)', text_my: 'နှစ်ဆယ့်ခုနစ် (၂၇)' }],
    answers: [
      { text_en: 'twenty-seven (27)', text_my: 'နှစ်ဆယ့်ခုနစ် (၂၇)', correct: true },
      { text_en: 'ten (10)', text_my: 'ဆယ် (၁၀)', correct: false },
      { text_en: 'fifty (50)', text_my: 'ငါးဆယ် (၅၀)', correct: false },
      { text_en: 'one hundred (100)', text_my: 'တစ်ရာ (၁၀၀)', correct: false },
    ],
  },
  {
    id: 'GOV-P08',
    question_en: 'What did the Declaration of Independence do?',
    question_my: 'လွတ်လပ်ရေးကြေညာစာတမ်းက ဘာလုပ်ခဲ့လဲ။',
    category: 'Principles of American Democracy',
    studyAnswers: [
      {
        text_en: 'announced our independence (from Great Britain)',
        text_my: 'ကျွန်ုပ်တို့၏လွတ်လပ်ရေးကို ကြေညာခဲ့သည် (ဂရိတ်ဗြိတိန်မှ)',
      },
      {
        text_en: 'declared our independence (from Great Britain)',
        text_my: 'ကျွန်ုပ်တို့၏လွတ်လပ်ရေးကို ကြေညာခဲ့သည် (ဂရိတ်ဗြိတိန်မှ)',
      },
      {
        text_en: 'said that the United States is free (from Great Britain)',
        text_my: 'အမေရိကန်ပြည်ထောင်စုသည် လွတ်လပ်သည်ဟု ဆိုသည် (ဂရိတ်ဗြိတိန်မှ)',
      },
    ],
    answers: [
      {
        text_en: 'announced our independence (from Great Britain)',
        text_my: 'ကျွန်ုပ်တို့၏လွတ်လပ်ရေးကို ကြေညာခဲ့သည် (ဂရိတ်ဗြိတိန်မှ)',
        correct: true,
      },
      { text_en: 'freed the slaves', text_my: 'ကျွန်တွေကို လွှတ်ပေးခဲ့တယ်', correct: false },
      {
        text_en: 'gave women the right to vote',
        text_my: 'အမျိုးသမီးတွေကို မဲပေးခွင့်ပေးခဲ့တယ်',
        correct: false,
      },
      {
        text_en: 'established the U.S. government',
        text_my: 'အမေရိကန်အစိုးရကို တည်ထောင်ခဲ့တယ်',
        correct: false,
      },
    ],
  },
  {
    id: 'GOV-P09',
    question_en: 'What are two rights in the Declaration of Independence?',
    question_my: 'လွတ်လပ်ရေးကြေညာစာတမ်းပါ အခွင့်အရေးနှစ်ခုက ဘာတွေလဲ။',
    category: 'Principles of American Democracy',
    studyAnswers: [
      { text_en: 'life', text_my: 'အသက်ရှင်သန်မှု' },
      { text_en: 'liberty', text_my: 'လွတ်လပ်မှု' },
      { text_en: 'pursuit of happiness', text_my: 'ပျော်ရွှင်မှုကိုရှာဖွေခြင်း' },
    ],
    answers: [
      { text_en: 'life and liberty', text_my: 'အသက်ရှင်သန်မှုနှင့်လွတ်လပ်မှု', correct: true },
      {
        text_en: 'freedom of speech and religion',
        text_my: 'လွတ်လပ်စွာပြောဆိုခွင့်နှင့် ကိုးကွယ်ယုံကြည်ခွင့်',
        correct: false,
      },
      {
        text_en: 'the right to bear arms and the right to a trial',
        text_my: 'လက်နက်ကိုင်ဆောင်ခွင့်နှင့် တရားစီရင်ခွင့်',
        correct: false,
      },
      {
        text_en: 'the right to vote and the right to work',
        text_my: 'မဲပေးခွင့်နှင့် အလုပ်လုပ်ခွင့်',
        correct: false,
      },
    ],
  },
  {
    id: 'GOV-P10',
    question_en: 'What is freedom of religion?',
    question_my: 'ဘာသာရေးလွတ်လပ်ခွင့်ဆိုတာ ဘာလဲ။',
    category: 'Principles of American Democracy',
    studyAnswers: [
      {
        text_en: 'You can practice any religion, or not practice a religion.',
        text_my:
          'သင်သည် မည်သည့်ဘာသာကိုမဆို ကျင့်သုံးနိုင်သည်၊ သို့မဟုတ် ဘာသာတစ်ခုကို မကျင့်သုံးဘဲနေနိုင်သည်။',
      },
    ],
    answers: [
      {
        text_en: 'You can practice any religion, or not practice a religion.',
        text_my:
          'သင်သည် မည်သည့်ဘာသာကိုမဆို ကျင့်သုံးနိုင်သည်၊ သို့မဟုတ် ဘာသာတစ်ခုကို မကျင့်သုံးဘဲနေနိုင်သည်။',
        correct: true,
      },
      {
        text_en: 'You must choose a religion.',
        text_my: 'ဘာသာတစ်ခုကို ရွေးချယ်ရမည်။',
        correct: false,
      },
      {
        text_en: 'The government can establish a national religion.',
        text_my: 'အစိုးရသည် နိုင်ငံတော်ဘာသာကို ထူထောင်နိုင်သည်။',
        correct: false,
      },
      {
        text_en: 'You can only practice the religion of your parents.',
        text_my: 'မိဘဘာသာကိုသာ ကျင့်သုံးနိုင်သည်။',
        correct: false,
      },
    ],
  },
  {
    id: 'GOV-P11',
    question_en: 'What is the economic system in the United States?',
    question_my: 'အမေရိကန်ပြည်ထောင်စု၏ စီးပွားရေးစနစ်ကား အဘယ်နည်း။',
    category: 'Principles of American Democracy',
    studyAnswers: [
      { text_en: 'capitalist economy', text_my: 'အရင်းရှင်စီးပွားရေး' },
      { text_en: 'market economy', text_my: 'စျေးကွက်စီးပွားရေး' },
    ],
    answers: [
      { text_en: 'capitalist economy', text_my: 'အရင်းရှင်စျေးကွက်စီးပွားရေး', correct: true },
      { text_en: 'socialist economy', text_my: 'ဆိုရှယ်လစ်စီးပွားရေး', correct: false },
      { text_en: 'communist economy', text_my: 'ကွန်မြူနစ်စီးပွားရေး', correct: false },
      { text_en: 'barter economy', text_my: 'ကုန်စည်ဖလှယ်ရေးစီးပွားရေး', correct: false },
    ],
  },
  {
    id: 'GOV-P12',
    question_en: 'What is the "rule of law"?',
    question_my: '"တရားဥပဒေစိုးမိုးရေး" ဆိုတာ ဘာလဲ။',
    category: 'Principles of American Democracy',
    studyAnswers: [
      { text_en: 'Everyone must follow the law.', text_my: 'လူတိုင်း ဥပဒေကို လိုက်နာရမယ်။' },
      { text_en: 'Leaders must obey the law.', text_my: 'ခေါင်းဆောင်များသည် ဥပဒေကို လိုက်နာရမည်။' },
      { text_en: 'Government must obey the law.', text_my: 'အစိုးရသည် ဥပဒေကို လိုက်နာရမည်။' },
      { text_en: 'No one is above the law.', text_my: 'ဘယ်သူမှ ဥပဒေအထက်မှာ မရှိပါဘူး။' },
    ],
    answers: [
      {
        text_en: 'Everyone must follow the law.',
        text_my: 'လူတိုင်း ဥပဒေကို လိုက်နာရမယ်။',
        correct: true,
      },
      {
        text_en: 'The law only applies to citizens.',
        text_my: 'ဥပဒေသည် နိုင်ငံသားများနှင့်သာ သက်ဆိုင်သည်။',
        correct: false,
      },
      {
        text_en: 'The government is above the law.',
        text_my: 'အစိုးရသည် ဥပဒေအထက်တွင် ရှိသည်။',
        correct: false,
      },
      {
        text_en: 'Laws can be ignored if you disagree with them.',
        text_my: 'သင်သဘောမတူပါက ဥပဒေများကို လျစ်လျူရှုနိုင်သည်။',
        correct: false,
      },
    ],
  },

  // ============================================
  // SYSTEM OF GOVERNMENT (GOV-S01-35)
  // ============================================
  {
    id: 'GOV-S01',
    question_en: 'Name one branch or part of the government.',
    question_my: 'အစိုးရ၏ ဌာနခွဲ သို့မဟုတ် အစိတ်အပိုင်းတစ်ခုကို အမည်ပေးပါ။',
    category: 'System of Government',
    studyAnswers: [
      { text_en: 'Congress', text_my: 'ကွန်ဂရက်' },
      { text_en: 'legislative', text_my: 'ဥပဒေပြု' },
      { text_en: 'President', text_my: 'သမ္မတ' },
      { text_en: 'executive', text_my: 'အမှုဆောင်' },
      { text_en: 'the courts', text_my: 'တရားရုံးများ' },
      { text_en: 'judicial', text_my: 'တရားစီရင်ရေး' },
    ],
    answers: [
      { text_en: 'Congress', text_my: 'ကွန်ဂရက်', correct: true },
      { text_en: 'The States', text_my: 'ပြည်နယ်များ', correct: false },
      { text_en: 'The Military', text_my: 'စစ်တပ်', correct: false },
      { text_en: 'The Treasury', text_my: 'ဘဏ္ဍာရေးဝန်ကြီးဌာန', correct: false },
    ],
  },
  {
    id: 'GOV-S02',
    question_en: 'What stops one branch of government from becoming too powerful?',
    question_my: 'အစိုးရဌာနခွဲတစ်ခု အလွန်အင်အားကြီးမားလာခြင်းကို အဘယ်အရာက တားဆီးသနည်း။',
    category: 'System of Government',
    studyAnswers: [
      { text_en: 'checks and balances', text_my: 'စစ်ဆေးမှုများနှင့် ဟန်ချက်ညီမှုများ' },
      { text_en: 'separation of powers', text_my: 'အာဏာခွဲဝေမှု' },
    ],
    answers: [
      {
        text_en: 'checks and balances',
        text_my: 'စစ်ဆေးမှုများနှင့် ဟန်ချက်ညီမှုများ',
        correct: true,
      },
      { text_en: 'the President', text_my: 'သမ္မတ', correct: false },
      { text_en: 'the people', text_my: 'ပြည်သူတွေ', correct: false },
      { text_en: 'the states', text_my: 'ပြည်နယ်များ', correct: false },
    ],
  },
  {
    id: 'GOV-S03',
    question_en: 'Who is in charge of the executive branch?',
    question_my: 'အမှုဆောင်ဌာနကို ဘယ်သူက တာဝန်ယူသလဲ။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'the President', text_my: 'သမ္မတ' }],
    answers: [
      { text_en: 'the President', text_my: 'သမ္မတ', correct: true },
      { text_en: 'the Chief Justice', text_my: 'တရားသူကြီးချုပ်', correct: false },
      { text_en: 'the Speaker of the House', text_my: 'အောက်လွှတ်တော်ဥက္ကဋ္ဌ', correct: false },
      {
        text_en: 'the Senate Majority Leader',
        text_my: 'အထက်လွှတ်တော်အမတ်အများစုခေါင်းဆောင်',
        correct: false,
      },
    ],
  },
  {
    id: 'GOV-S04',
    question_en: 'Who makes federal laws?',
    question_my: 'ဖက်ဒရယ်ဥပဒေတွေကို ဘယ်သူက ပြုလုပ်တာလဲ။',
    category: 'System of Government',
    studyAnswers: [
      { text_en: 'Congress', text_my: 'ကွန်ဂရက်' },
      {
        text_en: 'Senate and House (of Representatives)',
        text_my: 'အထက်လွှတ်တော်နှင့် အောက်လွှတ်တော် (ကိုယ်စားလှယ်များ)',
      },
      {
        text_en: '(U.S. or national) legislature',
        text_my: '(အမေရိကန် သို့မဟုတ် နိုင်ငံတော်) ဥပဒေပြုလွှတ်တော်',
      },
    ],
    answers: [
      { text_en: 'Congress', text_my: 'ကွန်ဂရက်', correct: true },
      { text_en: 'the Supreme Court', text_my: 'တရားရုံးချုပ်', correct: false },
      { text_en: 'the President', text_my: 'သမ္မတ', correct: false },
      { text_en: 'the states', text_my: 'ပြည်နယ်များ', correct: false },
    ],
  },
  {
    id: 'GOV-S05',
    question_en: 'What are the two parts of the U.S. Congress?',
    question_my: 'အမေရိကန်ကွန်ဂရက်ရဲ့ အစိတ်အပိုင်းနှစ်ခုက ဘာတွေလဲ။',
    category: 'System of Government',
    studyAnswers: [
      {
        text_en: 'the Senate and House (of Representatives)',
        text_my: 'အထက်လွှတ်တော်နှင့် အောက်လွှတ်တော် (ကိုယ်စားလှယ်များ)',
      },
    ],
    answers: [
      {
        text_en: 'the Senate and House (of Representatives)',
        text_my: 'အထက်လွှတ်တော်နှင့် အောက်လွှတ်တော် (ကိုယ်စားလှယ်များ)',
        correct: true,
      },
      {
        text_en: 'the President and the Cabinet',
        text_my: 'သမ္မတနှင့် အစိုးရအဖွဲ့',
        correct: false,
      },
      {
        text_en: 'the Supreme Court and the federal courts',
        text_my: 'တရားရုံးချုပ်နှင့် ဖက်ဒရယ်တရားရုံးများ',
        correct: false,
      },
      {
        text_en: 'the Democratic and Republican parties',
        text_my: 'ဒီမိုကရက်တစ်နှင့် ရီပတ်ဘလစ်ကန်ပါတီများ',
        correct: false,
      },
    ],
  },
  {
    id: 'GOV-S06',
    question_en: 'How many U.S. Senators are there?',
    question_my: 'အမေရိကန် အထက်လွှတ်တော်အမတ် ဘယ်လောက်ရှိလဲ။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'one hundred (100)', text_my: 'တစ်ရာ (၁၀၀)' }],
    answers: [
      { text_en: 'one hundred (100)', text_my: 'တစ်ရာ (၁၀၀)', correct: true },
      { text_en: 'fifty (50)', text_my: 'ငါးဆယ် (၅၀)', correct: false },
      {
        text_en: 'four hundred thirty-five (435)',
        text_my: 'လေးရာ့သုံးဆယ့်ငါး (၄၃၅)',
        correct: false,
      },
      { text_en: 'two for each state', text_my: 'ပြည်နယ်တစ်ခုစီအတွက် နှစ်ယောက်', correct: false },
    ],
  },
  {
    id: 'GOV-S07',
    question_en: 'We elect a U.S. Senator for how many years?',
    question_my: 'အမေရိကန် အထက်လွှတ်တော်အမတ်ကို ဘယ်နှစ်နှစ်အတွက် ရွေးကောက်တင်မြှောက်ပါသလဲ။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'six (6)', text_my: 'ခြောက် (၆)' }],
    answers: [
      { text_en: 'six (6)', text_my: 'ခြောက် (၆)', correct: true },
      { text_en: 'two (2)', text_my: 'နှစ် (၂)', correct: false },
      { text_en: 'four (4)', text_my: 'လေး (၄)', correct: false },
      { text_en: 'eight (8)', text_my: 'ရှစ် (၈)', correct: false },
    ],
  },
  {
    id: 'GOV-S08',
    question_en: "Who is one of your state's U.S. Senators now?",
    question_my: 'ယခု သင့်ပြည်နယ်၏ အမေရိကန် အထက်လွှတ်တော်အမတ်တစ်ဦးက မည်သူနည်း။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'Adam Schiff', text_my: 'အက်ဒမ် ရှစ်ဖ်' }],
    answers: [
      { text_en: 'Adam Schiff', text_my: 'အက်ဒမ် ရှစ်ဖ်', correct: true },
      {
        text_en: 'The Governor of your state',
        text_my: 'သင်၏ပြည်နယ်အုပ်ချုပ်ရေးမှူး',
        correct: false,
      },
      { text_en: "The state's Attorney General", text_my: 'ပြည်နယ်၏ ရှေ့နေချုပ်', correct: false },
      {
        text_en: 'The Speaker of the State House',
        text_my: 'ပြည်နယ်လွှတ်တော်ဥက္ကဋ္ဌ',
        correct: false,
      },
    ],
  },
  {
    id: 'GOV-S09',
    question_en: 'The House of Representatives has how many voting members?',
    question_my: 'အောက်လွှတ်တော်တွင် မဲပေးခွင့်ရှိသူ ဘယ်နှစ်ဦးရှိပါသလဲ။',
    category: 'System of Government',
    studyAnswers: [
      { text_en: 'four hundred thirty-five (435)', text_my: 'လေးရာ့သုံးဆယ့်ငါး (၄၃၅)' },
    ],
    answers: [
      {
        text_en: 'four hundred thirty-five (435)',
        text_my: 'လေးရာ့သုံးဆယ့်ငါး (၄၃၅)',
        correct: true,
      },
      { text_en: 'one hundred (100)', text_my: 'တစ်ရာ (၁၀၀)', correct: false },
      { text_en: 'fifty (50)', text_my: 'ငါးဆယ် (၅၀)', correct: false },
      { text_en: 'two hundred seventy (270)', text_my: 'နှစ်ရာ့ခုနစ်ဆယ် (၂၇၀)', correct: false },
    ],
  },
  {
    id: 'GOV-S10',
    question_en: 'We elect a U.S. Representative for how many years?',
    question_my: 'အမေရိကန် ကိုယ်စားလှယ်တစ်ဦးကို ဘယ်နှစ်နှစ်အတွက် ရွေးကောက်တင်မြှောက်ပါသလဲ။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'two (2)', text_my: 'နှစ် (၂)' }],
    answers: [
      { text_en: 'two (2)', text_my: 'နှစ် (၂)', correct: true },
      { text_en: 'four (4)', text_my: 'လေး (၄)', correct: false },
      { text_en: 'six (6)', text_my: 'ခြောက် (၆)', correct: false },
      { text_en: 'there is no term limit', text_my: 'သက်တမ်းကန့်သတ်ချက်မရှိပါ', correct: false },
    ],
  },
  {
    id: 'GOV-S11',
    question_en: 'Name your U.S. Representative.',
    question_my: 'သင်၏ အမေရိကန် ကိုယ်စားလှယ်ကို အမည်ပေးပါ။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'Judy Chu', text_my: 'ဂျူဒီ ချူး' }],
    answers: [
      { text_en: 'Judy Chu', text_my: 'ဂျူဒီ ချူး', correct: true },
      { text_en: 'The Speaker of the House', text_my: 'အောက်လွှတ်တော်ဥက္ကဋ္ဌ', correct: false },
      {
        text_en: 'The Governor of your state',
        text_my: 'သင်၏ပြည်နယ်အုပ်ချုပ်ရေးမှူး',
        correct: false,
      },
      {
        text_en: 'The Senator from your district',
        text_my: 'သင်၏ခရိုင်မှ အထက်လွှတ်တော်အမတ်',
        correct: false,
      },
    ],
  },
  {
    id: 'GOV-S12',
    question_en: 'Who does a U.S. Senator represent?',
    question_my: 'အမေရိကန် အထက်လွှတ်တော်အမတ်သည် မည်သူ့ကို ကိုယ်စားပြုသနည်း။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'all people of the state', text_my: 'ပြည်နယ်၏ ပြည်သူအားလုံး' }],
    answers: [
      { text_en: 'all people of the state', text_my: 'ပြည်နယ်၏ ပြည်သူအားလုံး', correct: true },
      {
        text_en: 'only the people in their district',
        text_my: 'သူတို့ခရိုင်ကလူတွေပဲ',
        correct: false,
      },
      {
        text_en: 'only the people who voted for them',
        text_my: 'သူတို့ကိုမဲပေးတဲ့လူတွေပဲ',
        correct: false,
      },
      { text_en: 'the state legislature', text_my: 'ပြည်နယ်ဥပဒေပြုလွှတ်တော်', correct: false },
    ],
  },
  {
    id: 'GOV-S13',
    question_en: 'Why do some states have more Representatives than other states?',
    question_my:
      'အချို့ပြည်နယ်များတွင် အခြားပြည်နယ်များထက် ကိုယ်စားလှယ်များ အဘယ်ကြောင့် ပိုများသနည်း။',
    category: 'System of Government',
    studyAnswers: [
      { text_en: "(because of) the state's population", text_my: 'ပြည်နယ်၏ လူဦးရေကြောင့်' },
      { text_en: '(because) they have more people', text_my: 'သူတို့မှာ လူပိုများလို့' },
      {
        text_en: '(because) some states have more people',
        text_my: 'အချို့ပြည်နယ်များတွင် လူပိုများသောကြောင့်',
      },
    ],
    answers: [
      {
        text_en: "(because of) the state's population",
        text_my: 'ပြည်နယ်၏ လူဦးရေကြောင့်',
        correct: true,
      },
      {
        text_en: "(because of) the state's land area",
        text_my: 'ပြည်နယ်၏ မြေဧရိယာကြောင့်',
        correct: false,
      },
      {
        text_en: "(because of) the state's wealth",
        text_my: 'ပြည်နယ်၏ ကြွယ်ဝမှုကြောင့်',
        correct: false,
      },
      {
        text_en: '(because) the Constitution says so',
        text_my: 'ဖွဲ့စည်းပုံအခြေခံဥပဒေက ဒီလိုပြောလို့',
        correct: false,
      },
    ],
  },
  {
    id: 'GOV-S14',
    question_en: 'We elect a President for how many years?',
    question_my: 'သမ္မတကို ဘယ်နှစ်နှစ်အတွက် ရွေးကောက်တင်မြှောက်ပါသလဲ။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'four (4)', text_my: 'လေး (၄)' }],
    answers: [
      { text_en: 'four (4)', text_my: 'လေး (၄)', correct: true },
      { text_en: 'two (2)', text_my: 'နှစ် (၂)', correct: false },
      { text_en: 'six (6)', text_my: 'ခြောက် (၆)', correct: false },
      { text_en: 'eight (8)', text_my: 'ရှစ် (၈)', correct: false },
    ],
  },
  {
    id: 'GOV-S15',
    question_en: 'In what month do we vote for President?',
    question_my: 'သမ္မတကို ဘယ်လမှာ မဲပေးကြလဲ။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'November', text_my: 'နိုဝင်ဘာ' }],
    answers: [
      { text_en: 'November', text_my: 'နိုဝင်ဘာ', correct: true },
      { text_en: 'January', text_my: 'ဇန်နဝါရီ', correct: false },
      { text_en: 'October', text_my: 'အောက်တိုဘာ', correct: false },
      { text_en: 'July', text_my: 'ဇူလိုင်', correct: false },
    ],
  },
  {
    id: 'GOV-S16',
    question_en: 'What is the name of the President of the United States now?',
    question_my: 'ယခု အမေရိကန်ပြည်ထောင်စု၏ သမ္မတအမည်ကား အဘယ်နည်း။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'Donald Trump', text_my: 'ဒေါ်နယ်ထရန့်' }],
    answers: [
      { text_en: 'Joe Biden', text_my: 'ဂျိုးဘိုင်ဒင်', correct: false },
      { text_en: 'Donald Trump', text_my: 'ဒေါ်နယ်ထရန့်', correct: true },
      { text_en: 'Barack Obama', text_my: 'ဘားရက်အိုဘားမား', correct: false },
      { text_en: 'Kamala Harris', text_my: 'ကမလာ ဟားရစ်', correct: false },
    ],
  },
  {
    id: 'GOV-S17',
    question_en: 'What is the name of the Vice President of the United States now?',
    question_my: 'ယခု အမေရိကန်ပြည်ထောင်စု၏ ဒုတိယသမ္မတအမည်ကား အဘယ်နည်း။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'JD Vance', text_my: 'ဂျေဒီ ဗန်စ်' }],
    answers: [
      { text_en: 'JD Vance', text_my: 'ဂျေဒီ ဗန်စ်', correct: true },
      { text_en: 'Mike Pence', text_my: 'မိုက်ပင့်', correct: false },
      { text_en: 'Joe Biden', text_my: 'ဂျိုးဘိုင်ဒင်', correct: false },
      { text_en: 'Nancy Pelosi', text_my: 'နန်စီ ပလိုစီ', correct: false },
    ],
  },
  {
    id: 'GOV-S18',
    question_en: 'If the President can no longer serve, who becomes President?',
    question_my: 'သမ္မတက တာဝန်မထမ်းဆောင်နိုင်တော့ရင် ဘယ်သူက သမ္မတဖြစ်လာမလဲ။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'the Vice President', text_my: 'ဒုတိယသမ္မတ' }],
    answers: [
      { text_en: 'the Vice President', text_my: 'ဒုတိယသမ္မတ', correct: true },
      { text_en: 'the Speaker of the House', text_my: 'အောက်လွှတ်တော်ဥက္ကဋ္ဌ', correct: false },
      { text_en: 'the Secretary of State', text_my: 'နိုင်ငံခြားရေးဝန်ကြီး', correct: false },
      { text_en: 'the Chief Justice', text_my: 'တရားသူကြီးချုပ်', correct: false },
    ],
  },
  {
    id: 'GOV-S19',
    question_en:
      'If both the President and the Vice President can no longer serve, who becomes President?',
    question_my:
      'သမ္မတနဲ့ ဒုတိယသမ္မတ နှစ်ယောက်စလုံး တာဝန်မထမ်းဆောင်နိုင်တော့ရင် ဘယ်သူက သမ္မတဖြစ်လာမလဲ။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'the Speaker of the House', text_my: 'အောက်လွှတ်တော်ဥက္ကဋ္ဌ' }],
    answers: [
      { text_en: 'the Speaker of the House', text_my: 'အောက်လွှတ်တော်ဥက္ကဋ္ဌ', correct: true },
      { text_en: 'the President pro tempore', text_my: 'ယာယီသမ္မတ', correct: false },
      { text_en: 'the Secretary of State', text_my: 'နိုင်ငံခြားရေးဝန်ကြီး', correct: false },
      { text_en: 'the Chief Justice', text_my: 'တရားသူကြီးချုပ်', correct: false },
    ],
  },
  {
    id: 'GOV-S20',
    question_en: 'Who is the Commander in Chief of the military?',
    question_my: 'စစ်တပ်၏ ကာကွယ်ရေးဦးစီးချုပ်သည် မည်သူနည်း။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'the President', text_my: 'သမ္မတ' }],
    answers: [
      { text_en: 'the President', text_my: 'သမ္မတ', correct: true },
      { text_en: 'the Secretary of Defense', text_my: 'ကာကွယ်ရေးဝန်ကြီး', correct: false },
      {
        text_en: 'the Chairman of the Joint Chiefs of Staff',
        text_my: 'ပူးတွဲစစ်ဦးစီးချုပ်များအဖွဲ့ ဥက္ကဋ္ဌ',
        correct: false,
      },
      { text_en: 'the Vice President', text_my: 'ဒုတိယသမ္မတ', correct: false },
    ],
  },
  {
    id: 'GOV-S21',
    question_en: 'Who signs bills to become laws?',
    question_my: 'ဥပဒေဖြစ်လာရန် ဥပဒေကြမ်းများကို မည်သူက လက်မှတ်ရေးထိုးသနည်း။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'the President', text_my: 'သမ္မတ' }],
    answers: [
      { text_en: 'the President', text_my: 'သမ္မတ', correct: true },
      { text_en: 'the Vice President', text_my: 'ဒုတိယသမ္မတ', correct: false },
      { text_en: 'the Chief Justice', text_my: 'တရားသူကြီးချုပ်', correct: false },
      { text_en: 'the Speaker of the House', text_my: 'အောက်လွှတ်တော်ဥက္ကဋ္ဌ', correct: false },
    ],
  },
  {
    id: 'GOV-S22',
    question_en: 'Who vetoes bills?',
    question_my: 'ဥပဒေကြမ်းများကို မည်သူက ဗီတိုအာဏာသုံးသနည်း။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'the President', text_my: 'သမ္မတ' }],
    answers: [
      { text_en: 'the President', text_my: 'သမ္မတ', correct: true },
      { text_en: 'the Senate', text_my: 'အထက်လွှတ်တော်', correct: false },
      { text_en: 'the House of Representatives', text_my: 'အောက်လွှတ်တော်', correct: false },
      { text_en: 'the Supreme Court', text_my: 'တရားရုံးချုပ်', correct: false },
    ],
  },
  {
    id: 'GOV-S23',
    question_en: "What does the President's Cabinet do?",
    question_my: 'သမ္မတ၏ အစိုးရအဖွဲ့က ဘာလုပ်သလဲ။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'advises the President', text_my: 'သမ္မတကို အကြံပေးသည်' }],
    answers: [
      { text_en: 'advises the President', text_my: 'သမ္မတကို အကြံပေးသည်', correct: true },
      { text_en: 'makes laws', text_my: 'ဥပဒေပြုသည်', correct: false },
      { text_en: 'interprets laws', text_my: 'ဥပဒေများကို အဓိပ္ပာယ်ဖွင့်ဆိုသည်', correct: false },
      { text_en: 'commands the military', text_my: 'စစ်တပ်ကို အမိန့်ပေးသည်', correct: false },
    ],
  },
  {
    id: 'GOV-S24',
    question_en: 'What are two Cabinet-level positions?',
    question_my: 'အစိုးရအဖွဲ့အဆင့် ရာထူးနှစ်ခုက ဘာတွေလဲ။',
    category: 'System of Government',
    studyAnswers: [
      { text_en: 'Secretary of Agriculture', text_my: 'စိုက်ပျိုးရေးဝန်ကြီး' },
      { text_en: 'Secretary of Commerce', text_my: 'ကူးသန်းရောင်းဝယ်ရေးဝန်ကြီး' },
      { text_en: 'Secretary of Defense', text_my: 'ကာကွယ်ရေးဝန်ကြီး' },
      { text_en: 'Secretary of Education', text_my: 'ပညာရေးဝန်ကြီး' },
      { text_en: 'Secretary of Energy', text_my: 'စွမ်းအင်ဝန်ကြီး' },
      {
        text_en: 'Secretary of Health and Human Services',
        text_my: 'ကျန်းမာရေးနှင့် လူသားဝန်ဆောင်မှုဝန်ကြီး',
      },
      { text_en: 'Secretary of Homeland Security', text_my: 'ပြည်တွင်းလုံခြုံရေးဝန်ကြီး' },
      {
        text_en: 'Secretary of Housing and Urban Development',
        text_my: 'အိမ်ရာနှင့် မြို့ပြဖွံ့ဖြိုးရေးဝန်ကြီး',
      },
      { text_en: 'Secretary of the Interior', text_my: 'ပြည်ထဲရေးဝန်ကြီး' },
      { text_en: 'Secretary of Labor', text_my: 'အလုပ်သမားဝန်ကြီး' },
      { text_en: 'Secretary of State', text_my: 'နိုင်ငံခြားရေးဝန်ကြီး' },
      { text_en: 'Secretary of Transportation', text_my: 'ပို့ဆောင်ရေးဝန်ကြီး' },
      { text_en: 'Secretary of the Treasury', text_my: 'ဘဏ္ဍာရေးဝန်ကြီး' },
      { text_en: 'Secretary of Veterans Affairs', text_my: 'စစ်မှုထမ်းဟောင်းရေးရာဝန်ကြီး' },
      { text_en: 'Attorney General', text_my: 'ရှေ့နေချုပ်' },
      { text_en: 'Vice President', text_my: 'ဒုတိယသမ္မတ' },
    ],
    answers: [
      {
        text_en: 'Secretary of State and Secretary of Labor',
        text_my: 'နိုင်ငံခြားရေးဝန်ကြီးနှင့် အလုပ်သမားရေးရာဝန်ကြီး',
        correct: true,
      },
      {
        text_en: 'Chief Justice and Speaker of the House',
        text_my: 'တရားသူကြီးချုပ်နှင့် အောက်လွှတ်တော်ဥက္ကဋ္ဌ',
        correct: false,
      },
      {
        text_en: 'Senator and Representative',
        text_my: 'အထက်လွှတ်တော်အမတ်နှင့် ကိုယ်စားလှယ်',
        correct: false,
      },
      {
        text_en: 'Governor and Mayor',
        text_my: 'အုပ်ချုပ်ရေးမှူးနှင့် မြို့တော်ဝန်',
        correct: false,
      },
    ],
  },
  {
    id: 'GOV-S25',
    question_en: 'What does the judicial branch do?',
    question_my: 'တရားစီရင်ရေးဌာနက ဘာလုပ်သလဲ။',
    category: 'System of Government',
    studyAnswers: [
      { text_en: 'reviews laws', text_my: 'ဥပဒေများကို ပြန်လည်သုံးသပ်သည်' },
      { text_en: 'explains laws', text_my: 'ဥပဒေများကို ရှင်းပြသည်' },
      { text_en: 'resolves disputes (disagreements)', text_my: 'အငြင်းပွားမှုများကို ဖြေရှင်းသည်' },
      {
        text_en: 'decides if a law goes against the Constitution',
        text_my: 'ဥပဒေတစ်ခုသည် ဖွဲ့စည်းပုံအခြေခံဥပဒေနှင့် ဆန့်ကျင်ခြင်း ရှိ၊ မရှိ ဆုံးဖြတ်သည်',
      },
    ],
    answers: [
      { text_en: 'reviews laws', text_my: 'ဥပဒေများကို ပြန်လည်သုံးသပ်သည်', correct: true },
      { text_en: 'makes laws', text_my: 'ဥပဒေပြုသည်', correct: false },
      { text_en: 'enforces laws', text_my: 'ဥပဒေများကို အာဏာတည်စေသည်', correct: false },
      { text_en: 'vetoes bills', text_my: 'ဥပဒေကြမ်းများကို ဗီတိုအာဏာသုံးသည်', correct: false },
    ],
  },
  {
    id: 'GOV-S26',
    question_en: 'What is the highest court in the United States?',
    question_my: 'အမေရိကန်ပြည်ထောင်စု၏ အမြင့်ဆုံးတရားရုံးကား အဘယ်နည်း။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'the Supreme Court', text_my: 'တရားရုံးချုပ်' }],
    answers: [
      { text_en: 'the Supreme Court', text_my: 'တရားရုံးချုပ်', correct: true },
      { text_en: 'the Federal Court', text_my: 'ဖက်ဒရယ်တရားရုံး', correct: false },
      { text_en: 'the Superior Court', text_my: 'အထက်တရားရုံး', correct: false },
      {
        text_en: 'the International Court of Justice',
        text_my: 'အပြည်ပြည်ဆိုင်ရာတရားရုံး',
        correct: false,
      },
    ],
  },
  {
    id: 'GOV-S27',
    question_en: 'How many justices are on the Supreme Court?',
    question_my: 'တရားရုံးချုပ်တွင် တရားသူကြီး ဘယ်နှစ်ဦးရှိပါသလဲ။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'nine (9)', text_my: 'ကိုး (၉)' }],
    answers: [
      { text_en: 'nine (9)', text_my: 'ကိုး (၉)', correct: true },
      { text_en: 'seven (7)', text_my: 'ခုနစ် (၇)', correct: false },
      { text_en: 'eleven (11)', text_my: 'တစ်ဆယ့်တစ် (၁၁)', correct: false },
      { text_en: 'thirteen (13)', text_my: 'တစ်ဆယ့်သုံး (၁၃)', correct: false },
    ],
  },
  {
    id: 'GOV-S28',
    question_en: 'Who is the Chief Justice of the United States now?',
    question_my: 'ယခု အမေရိကန်ပြည်ထောင်စု၏ တရားသူကြီးချုပ်သည် မည်သူနည်း။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'John Roberts', text_my: 'ဂျွန် ရောဘတ်' }],
    answers: [
      { text_en: 'John Roberts', text_my: 'ဂျွန် ရောဘတ်', correct: true },
      { text_en: 'Clarence Thomas', text_my: 'ကလာရင့် သောမတ်', correct: false },
      { text_en: 'Sonia Sotomayor', text_my: 'ဆိုနီယာ ဆိုတိုမေယာ', correct: false },
      { text_en: 'Ruth Bader Ginsburg', text_my: 'ရုသ် ဘေဒါ ဂင်စဘာ့ဂ်', correct: false },
    ],
  },
  {
    id: 'GOV-S29',
    question_en:
      'Under our Constitution, some powers belong to the federal government. What is one power of the federal government?',
    question_my:
      'ကျွန်ုပ်တို့၏ ဖွဲ့စည်းပုံအခြေခံဥပဒေအရ အချို့သော အာဏာများသည် ဖက်ဒရယ်အစိုးရနှင့် သက်ဆိုင်သည်။ ဖက်ဒရယ်အစိုးရ၏ အာဏာတစ်ခုကား အဘယ်နည်း။',
    category: 'System of Government',
    studyAnswers: [
      { text_en: 'to print money', text_my: 'ငွေစက္ကူရိုက်နှိပ်ရန်' },
      { text_en: 'to declare war', text_my: 'စစ်ကြေညာရန်' },
      { text_en: 'to create an army', text_my: 'စစ်တပ်ဖွဲ့စည်းရန်' },
      { text_en: 'to make treaties', text_my: 'စာချုပ်များချုပ်ဆိုရန်' },
    ],
    answers: [
      { text_en: 'to print money', text_my: 'ငွေစက္ကူရိုက်နှိပ်ရန်', correct: true },
      {
        text_en: 'to provide schooling and education',
        text_my: 'ကျောင်းပညာရေးနှင့် ပညာရေးကို ပံ့ပိုးပေးရန်',
        correct: false,
      },
      { text_en: 'to provide protection (police)', text_my: 'အကာအကွယ်ပေးရန် (ရဲ)', correct: false },
      {
        text_en: "to issue driver's licenses",
        text_my: 'ယာဉ်မောင်းလိုင်စင်ထုတ်ပေးရန်',
        correct: false,
      },
    ],
  },
  {
    id: 'GOV-S30',
    question_en:
      'Under our Constitution, some powers belong to the states. What is one power of the states?',
    question_my:
      'ကျွန်ုပ်တို့၏ ဖွဲ့စည်းပုံအခြေခံဥပဒေအရ အချို့သော အာဏာများသည် ပြည်နယ်များနှင့် သက်ဆိုင်သည်။ ပြည်နယ်များ၏ အာဏာတစ်ခုကား အဘယ်နည်း။',
    category: 'System of Government',
    studyAnswers: [
      {
        text_en: 'provide schooling and education',
        text_my: 'ကျောင်းပညာရေးနှင့် ပညာရေးကို ပံ့ပိုးပေးသည်',
      },
      { text_en: 'provide protection (police)', text_my: 'အကာအကွယ်ပေးသည် (ရဲ)' },
      {
        text_en: 'provide safety (fire departments)',
        text_my: 'ဘေးကင်းရေး (မီးသတ်ဌာနများ) ပံ့ပိုးပေးသည်',
      },
      { text_en: "give a driver's license", text_my: 'ယာဉ်မောင်းလိုင်စင်ပေးသည်' },
      {
        text_en: 'approve zoning and land use',
        text_my: 'ဇုန်သတ်မှတ်ခြင်းနှင့် မြေအသုံးချမှု အတည်ပြုသည်',
      },
    ],
    answers: [
      { text_en: "give a driver's license", text_my: 'ယာဉ်မောင်းလိုင်စင်ပေးသည်', correct: true },
      { text_en: 'to print money', text_my: 'ငွေစက္ကူရိုက်နှိပ်ရန်', correct: false },
      { text_en: 'to declare war', text_my: 'စစ်ကြေညာရန်', correct: false },
      { text_en: 'to make treaties', text_my: 'စာချုပ်များချုပ်ဆိုရန်', correct: false },
    ],
  },
  {
    id: 'GOV-S31',
    question_en: 'Who is the Governor of your state now?',
    question_my: 'ယခု သင်၏ပြည်နယ်အုပ်ချုပ်ရေးမှူးသည် မည်သူနည်း။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'Gavin Newsom', text_my: 'ဂက်ဗင် နျူးစမ်' }],
    answers: [
      { text_en: 'Gavin Newsom', text_my: 'ဂက်ဗင် နျူးစမ်', correct: true },
      { text_en: 'The President', text_my: 'သမ္မတ', correct: false },
      { text_en: 'The Mayor of your city', text_my: 'သင်၏မြို့တော်ဝန်', correct: false },
      {
        text_en: 'The Speaker of the State House',
        text_my: 'ပြည်နယ်လွှတ်တော်ဥက္ကဋ္ဌ',
        correct: false,
      },
    ],
  },
  {
    id: 'GOV-S32',
    question_en: 'What is the capital of your state?',
    question_my: 'သင်၏ပြည်နယ်၏ မြို့တော်ကား အဘယ်နည်း။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'Sacramento', text_my: 'ဆက်ကရမေန်တို' }],
    answers: [
      { text_en: 'Sacramento', text_my: 'ဆက်ကရမေန်တို', correct: true },
      { text_en: 'Washington, D.C.', text_my: 'ဝါရှင်တန်ဒီစီ', correct: false },
      { text_en: 'New York City', text_my: 'နယူးယောက်မြို့', correct: false },
      {
        text_en: 'The largest city in your state',
        text_my: 'သင်၏ပြည်နယ်၏ အကြီးဆုံးမြို့',
        correct: false,
      },
    ],
  },
  {
    id: 'GOV-S33',
    question_en: 'What are the two major political parties in the United States?',
    question_my: 'အမေရိကန်ပြည်ထောင်စု၏ အဓိကနိုင်ငံရေးပါတီကြီးနှစ်ခုကား အဘယ်နည်း။',
    category: 'System of Government',
    studyAnswers: [
      { text_en: 'Democratic and Republican', text_my: 'ဒီမိုကရက်တစ်နှင့် ရီပတ်ဘလစ်ကန်' },
    ],
    answers: [
      {
        text_en: 'Democratic and Republican',
        text_my: 'ဒီမိုကရက်တစ်နှင့် ရီပတ်ဘလစ်ကန်',
        correct: true,
      },
      { text_en: 'Liberal and Conservative', text_my: 'လစ်ဘရယ်နှင့် ကွန်ဆာဗေးတစ်', correct: false },
      {
        text_en: 'Federalist and Anti-Federalist',
        text_my: 'ဖက်ဒရယ်လစ်နှင့် ဖက်ဒရယ်လစ်ဆန့်ကျင်ရေး',
        correct: false,
      },
      { text_en: 'Labor and Green', text_my: 'အလုပ်သမားနှင့် အစိမ်းရောင်', correct: false },
    ],
  },
  {
    id: 'GOV-S34',
    question_en: 'What is the political party of the President now?',
    question_my: 'ယခု သမ္မတ၏ နိုင်ငံရေးပါတီကား အဘယ်နည်း။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'Republican Party', text_my: 'ရီပတ်ဘလစ်ကန်ပါတီ' }],
    answers: [
      { text_en: 'Democratic Party', text_my: 'ဒီမိုကရက်တစ်ပါတီ', correct: false },
      { text_en: 'Republican Party', text_my: 'ရီပတ်ဘလစ်ကန်ပါတီ', correct: true },
      { text_en: 'Independent', text_my: 'လွတ်လပ်သော', correct: false },
      { text_en: 'Libertarian Party', text_my: 'လစ်ဘရယ်ပါတီ', correct: false },
    ],
  },
  {
    id: 'GOV-S35',
    question_en: 'What is the name of the Speaker of the House of Representatives now?',
    question_my: 'ယခု အောက်လွှတ်တော်ဥက္ကဋ္ဌ၏ အမည်ကား အဘယ်နည်း။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'Mike Johnson', text_my: 'မိုက် ဂျွန်ဆင်' }],
    answers: [
      { text_en: 'Mike Johnson', text_my: 'မိုက် ဂျွန်ဆင်', correct: true },
      { text_en: 'Nancy Pelosi', text_my: 'နန်စီ ပလိုစီ', correct: false },
      { text_en: 'Kevin McCarthy', text_my: 'ကီဗင် မက်ကာသီ', correct: false },
      { text_en: 'Chuck Schumer', text_my: 'ချားလ်စ် ရှူးမား', correct: false },
    ],
  },
];
