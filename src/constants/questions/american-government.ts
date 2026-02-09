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
    explanation: {
      brief_en:
        'The Constitution is the highest legal authority in the United States. All other laws must follow it, and no person or government body is above it.',
      brief_my:
        'ဖွဲ့စည်းပုံအခြေခံဥပဒေသည် အမေရိကန်ပြည်ထောင်စု၏ အမြင့်ဆုံးဥပဒေဖြစ်ပါသည်။ အခြားဥပဒေအားလုံးသည် ၎င်းကိုလိုက်နာရပြီး မည်သူမျှ ၎င်းအထက်တွင် မရှိပါ။',
      citation: 'Article VI, Clause 2 (Supremacy Clause)',
      commonMistake_en:
        "The Declaration of Independence declared freedom from Britain but does not set up how the government works — that is the Constitution's job.",
      commonMistake_my:
        'လွတ်လပ်ရေးကြေညာစာတမ်းသည် ဗြိတိန်မှ လွတ်လပ်ရေးကို ကြေညာခဲ့သော်လည်း အစိုးရလုပ်ပုံလုပ်နည်းကို မသတ်မှတ်ပါ — ၎င်းသည် ဖွဲ့စည်းပုံ၏ တာဝန်ဖြစ်ပါသည်။',
      relatedQuestionIds: ['GOV-P02', 'GOV-P03'],
    },
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
    explanation: {
      brief_en:
        'The Constitution does three key things: it sets up the structure of the government, defines what each branch can do, and protects the basic rights of all Americans.',
      brief_my:
        'ဖွဲ့စည်းပုံအခြေခံဥပဒေသည် အဓိကအရာသုံးခုကို လုပ်ဆောင်သည် — အစိုးရဖွဲ့စည်းပုံ ချမှတ်ခြင်း၊ ဌာနခွဲတစ်ခုစီ၏ လုပ်ပိုင်ခွင့်များ သတ်မှတ်ခြင်းနှင့် အမေရိကန်အားလုံး၏ အခြေခံအခွင့်အရေးများကို ကာကွယ်ခြင်းတို့ ဖြစ်သည်။',
      citation: 'Preamble and Articles I-VII',
      relatedQuestionIds: ['GOV-P01', 'GOV-P05'],
    },
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
    explanation: {
      brief_en:
        '"We the People" shows that the government gets its power from the people, not from a king or ruler. This is the core idea of self-government — citizens are in charge.',
      brief_my:
        '"ငါတို့ပြည်သူတွေ" ဆိုသည်မှာ အစိုးရ၏ အာဏာသည် ဘုရင် သို့မဟုတ် အုပ်ချုပ်သူထံမှ မဟုတ်ဘဲ ပြည်သူများထံမှ ရရှိကြောင်း ပြသသည်။ ၎င်းသည် ကိုယ်ပိုင်အုပ်ချုပ်ရေး၏ အဓိကအယူအဆ ဖြစ်သည်။',
      citation: 'Preamble to the Constitution',
      funFact_en:
        'The original Constitution is on display at the National Archives in Washington, D.C. The ink has faded so much that "We the People" is one of the few parts still easy to read!',
      funFact_my:
        'မူရင်းဖွဲ့စည်းပုံအခြေခံဥပဒေကို ဝါရှင်တန်ဒီစီရှိ နိုင်ငံတော်မှတ်တမ်းတိုက်တွင် ပြသထားသည်။ မင်ကုန်သွားသဖြင့် "We the People" သည် ယနေ့တိုင် ဖတ်ရလွယ်ကူသော အစိတ်အပိုင်းအနည်းငယ်ထဲမှ တစ်ခုဖြစ်သည်!',
      relatedQuestionIds: ['GOV-P01', 'GOV-P02'],
    },
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
    explanation: {
      brief_en:
        'An amendment is a change or addition to the Constitution. The Founders designed this process so the Constitution could grow with the country while still being hard to change on a whim.',
      brief_my:
        'ပြင်ဆင်ချက်ဆိုသည်မှာ ဖွဲ့စည်းပုံအခြေခံဥပဒေကို ပြောင်းလဲခြင်း သို့မဟုတ် ထပ်ဖြည့်ခြင်း ဖြစ်သည်။ နိုင်ငံနှင့်အတူ တိုးတက်နိုင်စေရန် ဒီလိုလုပ်ထုံးကို ရေးဆွဲထားသော်လည်း လွယ်လွယ်ပြောင်းလဲ၍ မရပါ။',
      citation: 'Article V',
      relatedQuestionIds: ['GOV-P05', 'GOV-P07'],
    },
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
    explanation: {
      brief_en:
        'The Bill of Rights is the first 10 amendments, added in 1791. They guarantee essential freedoms like speech, religion, and the right to a fair trial — protections many states demanded before agreeing to the Constitution.',
      brief_my:
        'အခွင့်အရေးဥပဒေကြမ်းသည် ၁၇၉၁ ခုနှစ်တွင် ထည့်သွင်းခဲ့သော ပထမဆုံးပြင်ဆင်ချက် ၁၀ ခုဖြစ်သည်။ ပြောဆိုခွင့်၊ ဘာသာရေးလွတ်လပ်ခွင့်နှင့် တရားမျှတစွာစီရင်ခံပိုင်ခွင့်ကဲ့သို့ မရှိမဖြစ် လွတ်လပ်ခွင့်များကို အာမခံသည်။',
      citation: 'Amendments I-X',
      mnemonic_en: 'Bill of Rights = "Bill" means a list. It is a list of your rights!',
      mnemonic_my:
        'Bill of Rights = "Bill" ဆိုတာ စာရင်းတစ်ခု ဖြစ်ပါတယ်။ သင့်အခွင့်အရေးများ စာရင်း ဖြစ်ပါတယ်!',
      relatedQuestionIds: ['GOV-P04', 'GOV-P06', 'GOV-P07'],
    },
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
    explanation: {
      brief_en:
        'The First Amendment protects five freedoms: speech, religion, press, assembly, and the right to petition the government. These are considered the most fundamental freedoms in American democracy.',
      brief_my:
        'ပထမပြင်ဆင်ချက်သည် လွတ်လပ်ခွင့်ငါးခုကို ကာကွယ်သည် — ပြောဆိုခွင့်၊ ဘာသာရေး၊ စာနယ်ဇင်း၊ စည်းဝေးခွင့်နှင့် အစိုးရကို အသနားခံစာတင်ပိုင်ခွင့်တို့ ဖြစ်သည်။ အမေရိကန်ဒီမိုကရေစီ၏ အခြေခံအကျဆုံး လွတ်လပ်ခွင့်များ ဖြစ်သည်။',
      citation: '1st Amendment',
      mnemonic_en: 'Remember "RAPPS": Religion, Assembly, Press, Petition, Speech.',
      mnemonic_my: 'မှတ်ထားပါ "RAPPS": ဘာသာရေး၊ စည်းဝေးခွင့်၊ စာနယ်ဇင်း၊ အသနားခံစာ၊ ပြောဆိုခွင့်။',
      commonMistake_en:
        'The right to bear arms (2nd Amendment) and trial by jury (6th/7th) are NOT in the First Amendment — they are separate amendments.',
      commonMistake_my:
        'လက်နက်ကိုင်ဆောင်ခွင့် (ဒုတိယပြင်ဆင်ချက်) နှင့် ဂျူရီလူကြီးဖြင့် စစ်ဆေးခြင်း (ခြောက်/ခုနစ်) တို့သည် ပထမပြင်ဆင်ချက်တွင် မပါဝင်ပါ။',
      relatedQuestionIds: ['GOV-P05', 'GOV-P10', 'RR-04'],
    },
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
    explanation: {
      brief_en:
        'There are 27 amendments to the Constitution. The first 10 (the Bill of Rights) were added in 1791, and the most recent (27th) was ratified in 1992 — over 200 years after it was first proposed!',
      brief_my:
        'ဖွဲ့စည်းပုံအခြေခံဥပဒေတွင် ပြင်ဆင်ချက် ၂၇ ခု ရှိသည်။ ပထမဆုံး ၁၀ ခု (အခွင့်အရေးဥပဒေကြမ်း) ကို ၁၇၉၁ တွင် ထည့်သွင်းခဲ့ပြီး နောက်ဆုံး (၂၇ ကြိမ်မြောက်) ကို ၁၉၉၂ တွင် အတည်ပြုခဲ့သည်။',
      citation: 'Article V; Amendments I-XXVII',
      commonMistake_en:
        'People sometimes confuse 27 amendments with 50 states or 10 (Bill of Rights). Remember: 27 total amendments.',
      commonMistake_my:
        'လူများက ပြင်ဆင်ချက် ၂၇ ခုကို ပြည်နယ် ၅၀ သို့မဟုတ် ၁၀ (အခွင့်အရေးဥပဒေကြမ်း) နှင့် မှားတတ်သည်။ စုစုပေါင်း ပြင်ဆင်ချက် ၂၇ ခုဟု မှတ်ထားပါ။',
      relatedQuestionIds: ['GOV-P04', 'GOV-P05'],
    },
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
    explanation: {
      brief_en:
        'The Declaration of Independence, written in 1776, announced that the American colonies were breaking free from British rule. It did not create the government — the Constitution did that 11 years later.',
      brief_my:
        'လွတ်လပ်ရေးကြေညာစာတမ်းကို ၁၇၇၆ တွင် ရေးသားခဲ့ပြီး အမေရိကန်ကိုလိုနီများသည် ဗြိတိသျှအုပ်ချုပ်ရေးမှ ခွဲထွက်ကြောင်း ကြေညာခဲ့သည်။ အစိုးရကို ဖွဲ့စည်းခြင်း မဟုတ်ပါ — ၎င်းကို ဖွဲ့စည်းပုံအခြေခံဥပဒေက ၁၁ နှစ်အကြာတွင် လုပ်ဆောင်ခဲ့သည်။',
      relatedQuestionIds: ['GOV-P01', 'GOV-P09', 'HIST-C05', 'HIST-C06'],
    },
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
    explanation: {
      brief_en:
        'The Declaration lists three "unalienable rights": life, liberty, and the pursuit of happiness. These are natural rights that every person is born with, not given by the government.',
      brief_my:
        'လွတ်လပ်ရေးကြေညာစာတမ်းတွင် "မယူငင်နိုင်သော အခွင့်အရေး" သုံးခုကို ဖော်ပြထားသည် — အသက်ရှင်သန်မှု၊ လွတ်လပ်မှုနှင့် ပျော်ရွှင်မှုကိုရှာဖွေခြင်း။ လူတိုင်း မွေးလာကတည်းက ပိုင်ဆိုင်သော သဘာဝအခွင့်အရေးများ ဖြစ်သည်။',
      commonMistake_en:
        'Freedom of speech and religion are from the Bill of Rights (1st Amendment), not the Declaration of Independence. The Declaration focuses on life, liberty, and the pursuit of happiness.',
      commonMistake_my:
        'ပြောဆိုခွင့်နှင့် ဘာသာရေးလွတ်လပ်ခွင့်တို့သည် အခွင့်အရေးဥပဒေကြမ်း (ပထမပြင်ဆင်ချက်) မှဖြစ်ပြီး လွတ်လပ်ရေးကြေညာစာတမ်းမှ မဟုတ်ပါ။',
      relatedQuestionIds: ['GOV-P08', 'HIST-C06'],
    },
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
    explanation: {
      brief_en:
        'Freedom of religion means you can follow any religion you choose, or choose not to follow any religion at all. The government cannot force a religion on you or stop you from practicing yours.',
      brief_my:
        'ဘာသာရေးလွတ်လပ်ခွင့်ဆိုသည်မှာ သင်ကြိုက်သော ဘာသာတစ်ခုခုကို ကိုးကွယ်နိုင်သည်၊ သို့မဟုတ် ဘာသာတစ်ခုမှ မကိုးကွယ်ဘဲနေနိုင်သည်။ အစိုးရက သင့်ကို ဘာသာတစ်ခုကို အတင်းမကိုးကွယ်စေနိုင်ပါ။',
      citation: '1st Amendment (Establishment Clause & Free Exercise Clause)',
      relatedQuestionIds: ['GOV-P06', 'RR-04'],
    },
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
    explanation: {
      brief_en:
        'The U.S. has a capitalist (or market) economy, meaning private businesses and individuals make most economic decisions. People can own property, start businesses, and compete freely in the market.',
      brief_my:
        'အမေရိကန်သည် အရင်းရှင် (သို့မဟုတ် စျေးကွက်) စီးပွားရေးစနစ်ကို ကျင့်သုံးပြီး ပုဂ္ဂလိကလုပ်ငန်းများနှင့် လူပုဂ္ဂိုလ်များက စီးပွားရေးဆိုင်ရာ ဆုံးဖြတ်ချက်အများစုကို ချမှတ်သည်။ လူများ ပစ္စည်းပိုင်ဆိုင်ခွင့်၊ လုပ်ငန်းထူထောင်ခွင့်နှင့် စျေးကွက်တွင် လွတ်လပ်စွာ ယှဉ်ပြိုင်ခွင့် ရှိသည်။',
      relatedQuestionIds: ['GOV-P12'],
    },
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
    explanation: {
      brief_en:
        'The rule of law means everyone — including the President, Congress, and judges — must follow the law. No one is above the law, and the law applies equally to all people.',
      brief_my:
        'တရားဥပဒေစိုးမိုးရေးဆိုသည်မှာ သမ္မတ၊ ကွန်ဂရက်နှင့် တရားသူကြီးများအပါအဝင် လူတိုင်းသည် ဥပဒေကို လိုက်နာရမည်ဟု ဆိုလိုသည်။ ဘယ်သူမှ ဥပဒေအထက်တွင် မရှိပြီး ဥပဒေသည် လူတိုင်းကို တန်းတူကျင့်သုံးသည်။',
      relatedQuestionIds: ['GOV-P01', 'GOV-P03'],
    },
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
    explanation: {
      brief_en:
        'The U.S. government has three branches: legislative (Congress — makes laws), executive (President — enforces laws), and judicial (courts — interprets laws). This separation prevents any one group from having too much power.',
      brief_my:
        'အမေရိကန်အစိုးရတွင် ဌာနခွဲသုံးခုရှိသည် — ဥပဒေပြု (ကွန်ဂရက်)၊ အမှုဆောင် (သမ္မတ) နှင့် တရားစီရင်ရေး (တရားရုံးများ)။ အုပ်စုတစ်ခုတည်းက အာဏာအလွန်ကြီးမားခြင်းကို ကာကွယ်သည်။',
      citation: 'Articles I, II, III',
      relatedQuestionIds: ['GOV-S02', 'GOV-S03', 'GOV-S04', 'GOV-S25'],
    },
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
    explanation: {
      brief_en:
        'Checks and balances (also called separation of powers) means each branch can limit the others. For example, the President can veto laws, Congress can override vetoes, and courts can declare laws unconstitutional.',
      brief_my:
        'စစ်ဆေးမှုများနှင့် ဟန်ချက်ညီမှုများ (အာဏာခွဲဝေမှုဟုလည်း ခေါ်သည်) ဆိုသည်မှာ ဌာနခွဲတစ်ခုစီက အခြားဌာနခွဲများကို ကန့်သတ်နိုင်သည်။ ဥပမာ — သမ္မတက ဥပဒေကို ဗီတိုပေးနိုင်ပြီး ကွန်ဂရက်က ဗီတိုကို ကျော်လွှား၍ တရားရုံးများက ဥပဒေကို ဖွဲ့စည်းပုံနှင့်မညီဟု ကြေညာနိုင်သည်။',
      citation: 'Articles I, II, III',
      relatedQuestionIds: ['GOV-S01', 'GOV-S21', 'GOV-S22', 'GOV-S25'],
    },
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
    explanation: {
      brief_en:
        'The President leads the executive branch, which is responsible for enforcing and carrying out federal laws. The executive branch also includes the Vice President and the Cabinet.',
      brief_my:
        'သမ္မတသည် ဖက်ဒရယ်ဥပဒေများကို အကောင်အထည်ဖော်ရန် တာဝန်ရှိသော အမှုဆောင်ဌာနကို ဦးဆောင်သည်။ အမှုဆောင်ဌာနတွင် ဒုတိယသမ္မတနှင့် အစိုးရအဖွဲ့လည်း ပါဝင်သည်။',
      citation: 'Article II, Section 1',
      relatedQuestionIds: ['GOV-S16', 'GOV-S20', 'GOV-S21'],
    },
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
    explanation: {
      brief_en:
        'Congress (the Senate and the House of Representatives) is the legislative branch that makes federal laws. Both chambers must agree on a bill before it goes to the President to be signed into law.',
      brief_my:
        'ကွန်ဂရက် (အထက်လွှတ်တော်နှင့် အောက်လွှတ်တော်) သည် ဖက်ဒရယ်ဥပဒေများ ပြုလုပ်သော ဥပဒေပြုဌာန ဖြစ်သည်။ ဥပဒေကြမ်းတစ်ခုကို သမ္မတထံ လက်မှတ်ရေးထိုးရန် မပို့မီ လွှတ်တော်နှစ်ရပ်စလုံး သဘောတူရမည်။',
      citation: 'Article I, Section 1',
      relatedQuestionIds: ['GOV-S01', 'GOV-S05', 'GOV-S21'],
    },
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
    explanation: {
      brief_en:
        'Congress has two parts: the Senate (100 members, 2 per state) and the House of Representatives (435 members, based on state population). This two-part system ensures both equal and proportional representation.',
      brief_my:
        'ကွန်ဂရက်တွင် အစိတ်အပိုင်းနှစ်ခုရှိသည် — အထက်လွှတ်တော် (အမတ် ၁၀၀၊ ပြည်နယ်တစ်ခုလျှင် ၂ ဦး) နှင့် အောက်လွှတ်တော် (အမတ် ၄၃၅၊ ပြည်နယ်လူဦးရေပေါ်မူတည်)။ တန်းတူကိုယ်စားပြုမှုနှင့် အချိုးအစားကိုယ်စားပြုမှု နှစ်ခုစလုံးကို သေချာစေသည်။',
      citation: 'Article I, Sections 2-3',
      relatedQuestionIds: ['GOV-S04', 'GOV-S06', 'GOV-S09'],
    },
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
    explanation: {
      brief_en:
        'There are 100 U.S. Senators — 2 from each of the 50 states. This gives every state equal representation in the Senate, regardless of how large or small its population is.',
      brief_my:
        'အမေရိကန် အထက်လွှတ်တော်အမတ် ၁၀၀ ရှိသည် — ပြည်နယ် ၅၀ တစ်ခုစီမှ ၂ ဦးစီ။ လူဦးရေ ကြီးသည်ဖြစ်စေ ငယ်သည်ဖြစ်စေ ပြည်နယ်တိုင်းကို အထက်လွှတ်တော်တွင် တန်းတူကိုယ်စားပြုခွင့် ရစေသည်။',
      citation: 'Article I, Section 3',
      mnemonic_en: '50 states x 2 senators each = 100 Senators total.',
      mnemonic_my: 'ပြည်နယ် ၅၀ x ၂ ဦးစီ = စုစုပေါင်း အထက်လွှတ်တော်အမတ် ၁၀၀။',
      relatedQuestionIds: ['GOV-S05', 'GOV-S07', 'GOV-S09'],
    },
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
    explanation: {
      brief_en:
        'U.S. Senators serve 6-year terms. This is longer than Representatives (2 years) so that Senators can focus on long-term issues without constantly campaigning.',
      brief_my:
        'အထက်လွှတ်တော်အမတ်များသည် ၆ နှစ်သက်တမ်းဖြင့် တာဝန်ထမ်းဆောင်သည်။ ကိုယ်စားလှယ်များ (၂ နှစ်) ထက် ပိုရှည်ပြီး ရေရှည်ကိစ္စရပ်များကို အာရုံစိုက်နိုင်ရန် ရည်ရွယ်သည်။',
      citation: 'Article I, Section 3',
      mnemonic_en: 'Senator = Six years. Both start with "S".',
      mnemonic_my: 'Senator = Six (ခြောက်) နှစ်။ နှစ်လုံးစလုံး "S" နဲ့ စတယ်။',
      relatedQuestionIds: ['GOV-S06', 'GOV-S10'],
    },
  },
  // DYNAMIC(state): Senators vary by state. Update state-representatives.json after Senate elections.
  {
    id: 'GOV-S08',
    question_en: "Who is one of your state's U.S. Senators now?",
    question_my: 'ယခု သင့်ပြည်နယ်၏ အမေရိကန် အထက်လွှတ်တော်အမတ်တစ်ဦးက မည်သူနည်း။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'Adam Schiff', text_my: 'အက်ဒမ် ရှစ်ဖ်' }],
    dynamic: {
      type: 'state',
      field: 'senators',
      lastVerified: '2026-02-09',
      updateTrigger: 'Senate elections (staggered 6-year terms)',
    },
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
    explanation: {
      brief_en:
        "Your U.S. Senators represent your entire state in Congress. This answer varies by state — check your state's current senators before the civics test.",
      brief_my:
        'သင့်ပြည်နယ်၏ အထက်လွှတ်တော်အမတ်များသည် ကွန်ဂရက်တွင် သင့်ပြည်နယ်တစ်ခုလုံးကို ကိုယ်စားပြုသည်။ နိုင်ငံသားအဖြစ် စာမေးပွဲမတိုင်မီ သင့်ပြည်နယ်၏ လက်ရှိအထက်လွှတ်တော်အမတ်များကို စစ်ဆေးပါ။',
      relatedQuestionIds: ['GOV-S06', 'GOV-S12'],
    },
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
    explanation: {
      brief_en:
        'The House has 435 voting members. Each state gets a number of Representatives based on its population — larger states like California have many more than smaller states like Wyoming.',
      brief_my:
        'အောက်လွှတ်တော်တွင် မဲပေးခွင့်ရှိသူ ၄၃၅ ဦးရှိသည်။ ပြည်နယ်တစ်ခုစီ၏ လူဦးရေပေါ်မူတည်၍ ကိုယ်စားလှယ်အရေအတွက် ရရှိပြီး ကယ်လီဖိုးနီးယားကဲ့သို့ ပြည်နယ်ကြီးများက ဝိုင်းယိုမင်းကဲ့သို့ ပြည်နယ်ငယ်များထက် များစွာ ပိုများသည်။',
      citation: 'Article I, Section 2',
      commonMistake_en:
        'Do not confuse 435 Representatives with 100 Senators. The Senate has 100 (2 per state); the House has 435 (based on population).',
      commonMistake_my:
        'ကိုယ်စားလှယ် ၄၃၅ ဦးကို အထက်လွှတ်တော်အမတ် ၁၀၀ နှင့် မမှားပါစေ။ အထက်လွှတ်တော်တွင် ၁၀၀ (ပြည်နယ်တစ်ခုလျှင် ၂ ဦး)၊ အောက်လွှတ်တော်တွင် ၄၃၅ (လူဦးရေပေါ်မူတည်)။',
      relatedQuestionIds: ['GOV-S06', 'GOV-S13'],
    },
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
    explanation: {
      brief_en:
        'Representatives serve 2-year terms, the shortest of any federal elected official. This keeps them closely accountable to the people, since they must seek re-election frequently.',
      brief_my:
        'ကိုယ်စားလှယ်များသည် ၂ နှစ်သက်တမ်းဖြင့် တာဝန်ထမ်းဆောင်ပြီး ဖက်ဒရယ်ရွေးကောက်ခံ အရာရှိများထဲတွင် အတိုဆုံး ဖြစ်သည်။ မကြာခဏ ပြန်လည်ရွေးကောက်ခံရသဖြင့် ပြည်သူများနှင့် နီးကပ်စွာ တာဝန်ယူမှုရှိစေသည်။',
      citation: 'Article I, Section 2',
      mnemonic_en: 'Representatives = 2 years. "R" for "Re-elected often".',
      mnemonic_my: 'ကိုယ်စားလှယ် = ၂ နှစ်။ မကြာခဏ ပြန်ရွေးကောက်ခံရသည်။',
      relatedQuestionIds: ['GOV-S07', 'GOV-S14'],
    },
  },
  // DYNAMIC(state): Representatives vary by district. Update state-representatives.json after House elections (every 2 years).
  {
    id: 'GOV-S11',
    question_en: 'Name your U.S. Representative.',
    question_my: 'သင်၏ အမေရိကန် ကိုယ်စားလှယ်ကို အမည်ပေးပါ။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'Judy Chu', text_my: 'ဂျူဒီ ချူး' }],
    dynamic: {
      type: 'state',
      field: 'representative',
      lastVerified: '2026-02-09',
      updateTrigger: 'House elections (every 2 years)',
    },
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
    explanation: {
      brief_en:
        'Your Representative serves your specific congressional district. This answer varies by district — check who represents your area before the civics test.',
      brief_my:
        'သင့်ကိုယ်စားလှယ်သည် သင့်ကွန်ဂရက်ခရိုင်ကို အထူးတာဝန်ယူသည်။ နိုင်ငံသားအဖြစ် စာမေးပွဲမတိုင်မီ သင့်ဒေသကို ကိုယ်စားပြုသူ ဘယ်သူလဲ စစ်ဆေးပါ။',
      relatedQuestionIds: ['GOV-S08', 'GOV-S12', 'GOV-S13'],
    },
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
    explanation: {
      brief_en:
        'A Senator represents ALL the people in their state, not just one district. This is different from a Representative, who only represents one congressional district within the state.',
      brief_my:
        'အထက်လွှတ်တော်အမတ်တစ်ဦးသည် ခရိုင်တစ်ခုတည်းကို မဟုတ်ဘဲ ပြည်နယ်ရှိ လူအားလုံးကို ကိုယ်စားပြုသည်။ ပြည်နယ်အတွင်း ကွန်ဂရက်ခရိုင်တစ်ခုတည်းကိုသာ ကိုယ်စားပြုသော ကိုယ်စားလှယ်နှင့် ကွာခြားသည်။',
      citation: 'Article I, Section 3; 17th Amendment',
      relatedQuestionIds: ['GOV-S08', 'GOV-S11', 'GOV-S13'],
    },
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
    explanation: {
      brief_en:
        'States with more people get more Representatives. A census (population count) is done every 10 years to adjust representation. California has the most (52), while states like Wyoming have only 1.',
      brief_my:
        'လူဦးရေပိုများသော ပြည်နယ်များက ကိုယ်စားလှယ်ပိုရသည်။ ၁၀ နှစ်တစ်ကြိမ် သန်းခေါင်စာရင်းကောက်ယူပြီး ကိုယ်စားပြုမှုကို ချိန်ညှိသည်။ ကယ်လီဖိုးနီးယားတွင် အများဆုံး (၅၂ ဦး) ရှိပြီး ဝိုင်းယိုမင်းကဲ့သို့ ပြည်နယ်များတွင် ၁ ဦးသာ ရှိသည်။',
      citation: 'Article I, Section 2',
      relatedQuestionIds: ['GOV-S09', 'GOV-S12'],
    },
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
    explanation: {
      brief_en:
        'The President is elected for a 4-year term and can serve a maximum of two terms (8 years total). The 22nd Amendment, passed after FDR served four terms, set this two-term limit.',
      brief_my:
        'သမ္မတကို ၄ နှစ်သက်တမ်းဖြင့် ရွေးကောက်တင်မြှောက်ပြီး အများဆုံး ၂ ကြိမ် (စုစုပေါင်း ၈ နှစ်) တာဝန်ထမ်းဆောင်နိုင်သည်။ FDR က ၄ ကြိမ်တာဝန်ထမ်းဆောင်ပြီးနောက် ၂၂ ကြိမ်မြောက် ပြင်ဆင်ချက်ဖြင့် ဒီကန့်သတ်ချက်ကို သတ်မှတ်ခဲ့သည်။',
      citation: 'Article II, Section 1; 22nd Amendment',
      relatedQuestionIds: ['GOV-S07', 'GOV-S10', 'GOV-S16'],
    },
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
    explanation: {
      brief_en:
        'Americans vote for President in November, specifically on the Tuesday after the first Monday. Election Day was set in November because it was after the fall harvest when farmers could travel.',
      brief_my:
        'အမေရိကန်များသည် နိုဝင်ဘာလတွင် သမ္မတအတွက် မဲပေးကြသည်။ ရွေးကောက်ပွဲနေ့ကို နိုဝင်ဘာတွင် သတ်မှတ်ခဲ့သည်မှာ ဆောင်းရာသီရိတ်သိမ်းပြီးချိန်ဖြစ်ပြီး လယ်သမားများ ခရီးသွားနိုင်သောကြောင့် ဖြစ်သည်။',
      funFact_en:
        'Election Day is always the Tuesday after the first Monday in November. It was chosen in 1845 because Wednesday was market day and Sunday was church day!',
      funFact_my:
        'ရွေးကောက်ပွဲနေ့သည် နိုဝင်ဘာလ ပထမဆုံးတနင်္လာနေ့ပြီးနောက် အင်္ဂါနေ့ ဖြစ်သည်။ ၁၈၄၅ တွင် ရွေးချယ်ခဲ့သည်မှာ ဗုဒ္ဓဟူးနေ့က စျေးနေ့ဖြစ်ပြီး တနင်္ဂနွေနေ့က ဘုရားကျောင်းနေ့ ဖြစ်သောကြောင့်!',
      relatedQuestionIds: ['GOV-S14', 'GOV-S16'],
    },
  },
  // DYNAMIC: Update answer after presidential elections (every 4 years). Next check: Nov 2028.
  {
    id: 'GOV-S16',
    question_en: 'What is the name of the President of the United States now?',
    question_my: 'ယခု အမေရိကန်ပြည်ထောင်စု၏ သမ္မတအမည်ကား အဘယ်နည်း။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'Donald Trump', text_my: 'ဒေါ်နယ်ထရန့်' }],
    dynamic: {
      type: 'time',
      field: 'president',
      lastVerified: '2026-02-09',
      updateTrigger: 'Presidential election (every 4 years)',
    },
    answers: [
      { text_en: 'Joe Biden', text_my: 'ဂျိုးဘိုင်ဒင်', correct: false },
      { text_en: 'Donald Trump', text_my: 'ဒေါ်နယ်ထရန့်', correct: true },
      { text_en: 'Barack Obama', text_my: 'ဘားရက်အိုဘားမား', correct: false },
      { text_en: 'Kamala Harris', text_my: 'ကမလာ ဟားရစ်', correct: false },
    ],
    explanation: {
      brief_en:
        'The current President is the person serving at the time of your civics test. This answer changes when a new President takes office. Always check for the most current name before your test.',
      brief_my:
        'လက်ရှိသမ္မတသည် သင့်နိုင်ငံသားအဖြစ် စာမေးပွဲအချိန်တွင် တာဝန်ထမ်းဆောင်နေသူ ဖြစ်သည်။ သမ္မတအသစ် တာဝန်ယူသောအခါ ဒီအဖြေ ပြောင်းလဲသည်။ စာမေးပွဲမတိုင်မီ နောက်ဆုံးအမည်ကို စစ်ဆေးပါ။',
      relatedQuestionIds: ['GOV-S17', 'GOV-S34'],
    },
  },
  // DYNAMIC: Update answer after presidential elections (every 4 years). Next check: Nov 2028.
  {
    id: 'GOV-S17',
    question_en: 'What is the name of the Vice President of the United States now?',
    question_my: 'ယခု အမေရိကန်ပြည်ထောင်စု၏ ဒုတိယသမ္မတအမည်ကား အဘယ်နည်း။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'JD Vance', text_my: 'ဂျေဒီ ဗန်စ်' }],
    dynamic: {
      type: 'time',
      field: 'vicePresident',
      lastVerified: '2026-02-09',
      updateTrigger: 'Presidential election (every 4 years)',
    },
    answers: [
      { text_en: 'JD Vance', text_my: 'ဂျေဒီ ဗန်စ်', correct: true },
      { text_en: 'Mike Pence', text_my: 'မိုက်ပင့်', correct: false },
      { text_en: 'Joe Biden', text_my: 'ဂျိုးဘိုင်ဒင်', correct: false },
      { text_en: 'Nancy Pelosi', text_my: 'နန်စီ ပလိုစီ', correct: false },
    ],
    explanation: {
      brief_en:
        "The Vice President serves as the President's backup and also serves as President of the Senate. Like the President, this answer changes — check the current name before your test.",
      brief_my:
        'ဒုတိယသမ္မတသည် သမ္မတ၏ အရန်အဖြစ် တာဝန်ထမ်းဆောင်ပြီး အထက်လွှတ်တော်ဥက္ကဋ္ဌအဖြစ်လည်း တာဝန်ယူသည်။ သမ္မတကဲ့သို့ပင် ဒီအဖြေ ပြောင်းလဲနိုင်သည် — စာမေးပွဲမတိုင်မီ စစ်ဆေးပါ။',
      relatedQuestionIds: ['GOV-S16', 'GOV-S18'],
    },
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
    explanation: {
      brief_en:
        'If the President cannot serve, the Vice President takes over. This succession is established by the Constitution and has happened nine times in U.S. history.',
      brief_my:
        'သမ္မတ တာဝန်မထမ်းဆောင်နိုင်ပါက ဒုတိယသမ္မတက တာဝန်ယူသည်။ ဒီဆက်ခံမှုကို ဖွဲ့စည်းပုံအခြေခံဥပဒေက သတ်မှတ်ထားပြီး အမေရိကန်သမိုင်းတွင် ကိုးကြိမ် ဖြစ်ပွားခဲ့သည်။',
      citation: 'Article II, Section 1; 25th Amendment',
      relatedQuestionIds: ['GOV-S17', 'GOV-S19'],
    },
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
    explanation: {
      brief_en:
        'The Speaker of the House is third in line for the presidency. The order goes: Vice President, then Speaker of the House, then President pro tempore of the Senate.',
      brief_my:
        'အောက်လွှတ်တော်ဥက္ကဋ္ဌသည် သမ္မတရာထူးအတွက် တတိယမြောက် ဆက်ခံသူ ဖြစ်သည်။ အစီအစဉ်မှာ — ဒုတိယသမ္မတ၊ ထို့နောက် အောက်လွှတ်တော်ဥက္ကဋ္ဌ၊ ထို့နောက် အထက်လွှတ်တော် ယာယီဥက္ကဋ္ဌ ဖြစ်သည်။',
      citation: 'Presidential Succession Act; 25th Amendment',
      relatedQuestionIds: ['GOV-S18', 'GOV-S35'],
    },
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
    explanation: {
      brief_en:
        'The President is Commander in Chief of the military. This means civilian (non-military) leadership controls the armed forces, which is a key principle of American democracy.',
      brief_my:
        'သမ္မတသည် စစ်တပ်၏ ကာကွယ်ရေးဦးစီးချုပ် ဖြစ်သည်။ အရပ်သား (စစ်တပ်မဟုတ်သော) ခေါင်းဆောင်မှုက တပ်မတော်ကို ထိန်းချုပ်ကြောင်း ဆိုလိုပြီး ၎င်းသည် အမေရိကန်ဒီမိုကရေစီ၏ အဓိကမူ တစ်ခုဖြစ်သည်။',
      citation: 'Article II, Section 2',
      relatedQuestionIds: ['GOV-S03', 'GOV-S16'],
    },
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
    explanation: {
      brief_en:
        'The President signs bills passed by Congress to make them official laws. If the President disagrees, they can veto (reject) the bill instead.',
      brief_my:
        'သမ္မတသည် ကွန်ဂရက်က အတည်ပြုထားသော ဥပဒေကြမ်းများကို တရားဝင်ဥပဒေ ဖြစ်စေရန် လက်မှတ်ရေးထိုးသည်။ သမ္မတ သဘောမတူပါက ဥပဒေကြမ်းကို ဗီတို (ပယ်ချ) နိုင်သည်။',
      citation: 'Article I, Section 7',
      relatedQuestionIds: ['GOV-S02', 'GOV-S04', 'GOV-S22'],
    },
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
    explanation: {
      brief_en:
        'The President can veto (reject) bills passed by Congress. However, Congress can override a veto with a two-thirds vote in both the Senate and the House. This is an example of checks and balances.',
      brief_my:
        'သမ္မတသည် ကွန်ဂရက်က အတည်ပြုထားသော ဥပဒေကြမ်းများကို ဗီတို (ပယ်ချ) နိုင်သည်။ သို့သော် ကွန်ဂရက်က အထက်လွှတ်တော်နှင့် အောက်လွှတ်တော် နှစ်ရပ်စလုံးတွင် သုံးပုံနှစ်ပုံ မဲဖြင့် ဗီတိုကို ကျော်လွှားနိုင်သည်။',
      citation: 'Article I, Section 7',
      relatedQuestionIds: ['GOV-S02', 'GOV-S21'],
    },
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
    explanation: {
      brief_en:
        'The Cabinet is a group of advisors who help the President make decisions. Each Cabinet member leads a federal department (like Defense, Education, or State) and is an expert in that area.',
      brief_my:
        'အစိုးရအဖွဲ့သည် သမ္မတကို ဆုံးဖြတ်ချက်များ ချမှတ်ရာတွင် ကူညီသော အကြံပေးများအဖွဲ့ ဖြစ်သည်။ အစိုးရအဖွဲ့ဝင်တစ်ဦးစီသည် ဖက်ဒရယ်ဝန်ကြီးဌာန (ကာကွယ်ရေး၊ ပညာရေး သို့မဟုတ် နိုင်ငံခြားရေးကဲ့သို့) ကို ဦးဆောင်ပြီး ထိုနယ်ပယ်တွင် ကျွမ်းကျင်သူ ဖြစ်သည်။',
      citation: 'Article II, Section 2',
      relatedQuestionIds: ['GOV-S03', 'GOV-S24'],
    },
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
    explanation: {
      brief_en:
        'There are 15 executive departments, each led by a Secretary (or Attorney General). You only need to name two. Common ones include Secretary of State, Secretary of Defense, and Attorney General.',
      brief_my:
        'ဝန်ကြီးဌာန ၁၅ ခုရှိပြီး တစ်ခုစီကို ဝန်ကြီး (သို့မဟုတ် ရှေ့နေချုပ်) က ဦးဆောင်သည်။ နှစ်ခုသာ ပြောရန် လိုအပ်သည်။ အဖြစ်များသည်များမှာ နိုင်ငံခြားရေးဝန်ကြီး၊ ကာကွယ်ရေးဝန်ကြီးနှင့် ရှေ့နေချုပ် တို့ဖြစ်သည်။',
      relatedQuestionIds: ['GOV-S23'],
    },
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
    explanation: {
      brief_en:
        'The judicial branch (the courts) reviews and interprets laws, resolves disputes, and decides whether laws follow the Constitution. It does NOT make laws (Congress does) or enforce them (the President does).',
      brief_my:
        'တရားစီရင်ရေးဌာန (တရားရုံးများ) သည် ဥပဒေများကို ပြန်လည်သုံးသပ်၍ အဓိပ္ပာယ်ဖွင့်ဆိုပြီး အငြင်းပွားမှုများကို ဖြေရှင်းကာ ဥပဒေများ ဖွဲ့စည်းပုံနှင့် ညီမညီ ဆုံးဖြတ်သည်။ ဥပဒေပြုခြင်း (ကွန်ဂရက်) သို့မဟုတ် ဥပဒေစိုးမိုးစေခြင်း (သမ္မတ) ကိုမူ မလုပ်ပါ။',
      citation: 'Article III',
      relatedQuestionIds: ['GOV-S01', 'GOV-S02', 'GOV-S26'],
    },
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
    explanation: {
      brief_en:
        'The Supreme Court is the highest court in the country. Its decisions are final — no other court can overrule it. It has the power of "judicial review" to strike down unconstitutional laws.',
      brief_my:
        'တရားရုံးချုပ်သည် နိုင်ငံ၏ အမြင့်ဆုံးတရားရုံး ဖြစ်သည်။ ၎င်း၏ ဆုံးဖြတ်ချက်များသည် အပြီးသတ်ဖြစ်ပြီး အခြားတရားရုံးမှ ပယ်ဖျက်၍ မရပါ။ ဖွဲ့စည်းပုံနှင့် မညီသော ဥပဒေများကို ဖျက်သိမ်းနိုင်သော "တရားစီရင်ရေး ပြန်လည်သုံးသပ်ခွင့်" ရှိသည်။',
      citation: 'Article III, Section 1',
      relatedQuestionIds: ['GOV-S25', 'GOV-S27', 'GOV-S28'],
    },
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
    explanation: {
      brief_en:
        'The Supreme Court has 9 justices. They are appointed by the President, confirmed by the Senate, and serve for life. The number is not set in the Constitution but has been 9 since 1869.',
      brief_my:
        'တရားရုံးချုပ်တွင် တရားသူကြီး ၉ ဦး ရှိသည်။ သမ္မတက ခန့်အပ်ပြီး အထက်လွှတ်တော်က အတည်ပြုကာ တသက်တာ တာဝန်ထမ်းဆောင်သည်။ အရေအတွက်ကို ဖွဲ့စည်းပုံတွင် မသတ်မှတ်ထားသော်လည်း ၁၈၆၉ ခုနှစ်ကတည်းက ၉ ဦး ဖြစ်သည်။',
      citation: 'Article III; Judiciary Act of 1869',
      relatedQuestionIds: ['GOV-S26', 'GOV-S28'],
    },
  },
  // DYNAMIC: Update on Chief Justice retirement/death/impeachment. No fixed schedule — monitor news.
  {
    id: 'GOV-S28',
    question_en: 'Who is the Chief Justice of the United States now?',
    question_my: 'ယခု အမေရိကန်ပြည်ထောင်စု၏ တရားသူကြီးချုပ်သည် မည်သူနည်း။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'John Roberts', text_my: 'ဂျွန် ရောဘတ်' }],
    dynamic: {
      type: 'time',
      field: 'chiefJustice',
      lastVerified: '2026-02-09',
      updateTrigger:
        'Supreme Court appointment (lifetime tenure, changes on retirement/death)',
    },
    answers: [
      { text_en: 'John Roberts', text_my: 'ဂျွန် ရောဘတ်', correct: true },
      { text_en: 'Clarence Thomas', text_my: 'ကလာရင့် သောမတ်', correct: false },
      { text_en: 'Sonia Sotomayor', text_my: 'ဆိုနီယာ ဆိုတိုမေယာ', correct: false },
      { text_en: 'Ruth Bader Ginsburg', text_my: 'ရုသ် ဘေဒါ ဂင်စဘာ့ဂ်', correct: false },
    ],
    explanation: {
      brief_en:
        'The Chief Justice leads the Supreme Court. Like the President and Vice President, this answer can change — check for the current name before your civics test.',
      brief_my:
        'တရားသူကြီးချုပ်သည် တရားရုံးချုပ်ကို ဦးဆောင်သည်။ သမ္မတနှင့် ဒုတိယသမ္မတကဲ့သို့ပင် ဒီအဖြေ ပြောင်းလဲနိုင်သည် — နိုင်ငံသားအဖြစ် စာမေးပွဲမတိုင်မီ လက်ရှိအမည်ကို စစ်ဆေးပါ။',
      relatedQuestionIds: ['GOV-S26', 'GOV-S27'],
    },
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
    explanation: {
      brief_en:
        'The federal government handles things that affect the whole country: printing money, declaring war, making treaties, and creating an army. States cannot do these things on their own.',
      brief_my:
        'ဖက်ဒရယ်အစိုးရသည် နိုင်ငံတစ်ခုလုံးနှင့် သက်ဆိုင်သော ကိစ္စများကို ကိုင်တွယ်သည် — ငွေစက္ကူရိုက်နှိပ်ခြင်း၊ စစ်ကြေညာခြင်း၊ စာချုပ်ချုပ်ဆိုခြင်းနှင့် စစ်တပ်ဖွဲ့စည်းခြင်း။ ပြည်နယ်များက ဒီအရာများကို သူတို့ဘာသာ မလုပ်နိုင်ပါ။',
      citation: 'Article I, Section 8',
      commonMistake_en:
        "Education, police, and driver's licenses are state powers, not federal. Think: federal = national-level things like money and military.",
      commonMistake_my:
        'ပညာရေး၊ ရဲနှင့် ယာဉ်မောင်းလိုင်စင်တို့သည် ပြည်နယ်အာဏာ ဖြစ်ပြီး ဖက်ဒရယ်မဟုတ်ပါ။ ဖက်ဒရယ် = ငွေကြေးနှင့် စစ်တပ်ကဲ့သို့ နိုင်ငံအဆင့် ကိစ္စရပ်များ ဟု မှတ်ထားပါ။',
      relatedQuestionIds: ['GOV-S30'],
    },
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
    explanation: {
      brief_en:
        "State governments handle local matters: schools, police, fire departments, driver's licenses, and zoning. These are things that directly affect daily life in your community.",
      brief_my:
        'ပြည်နယ်အစိုးရများသည် ဒေသဆိုင်ရာ ကိစ္စရပ်များကို ကိုင်တွယ်သည် — ကျောင်းများ၊ ရဲ၊ မီးသတ်ဌာနများ၊ ယာဉ်မောင်းလိုင်စင်နှင့် ဇုန်သတ်မှတ်ခြင်း။ သင့်ရပ်ရွာတွင် နေ့စဉ်ဘဝကို တိုက်ရိုက်ထိခိုက်သော အရာများ ဖြစ်သည်။',
      citation: '10th Amendment',
      relatedQuestionIds: ['GOV-S29'],
    },
  },
  // DYNAMIC(state): Governor varies by state. Update state-representatives.json after gubernatorial elections.
  {
    id: 'GOV-S31',
    question_en: 'Who is the Governor of your state now?',
    question_my: 'ယခု သင်၏ပြည်နယ်အုပ်ချုပ်ရေးမှူးသည် မည်သူနည်း။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'Gavin Newsom', text_my: 'ဂက်ဗင် နျူးစမ်' }],
    dynamic: {
      type: 'state',
      field: 'governor',
      lastVerified: '2026-02-09',
      updateTrigger: 'State gubernatorial elections (varies by state)',
    },
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
    explanation: {
      brief_en:
        'The Governor is the head of your state government, similar to how the President leads the federal government. This answer varies by state — check before your test.',
      brief_my:
        'အုပ်ချုပ်ရေးမှူးသည် သမ္မတက ဖက်ဒရယ်အစိုးရကို ဦးဆောင်သကဲ့သို့ သင့်ပြည်နယ်အစိုးရ၏ အကြီးအကဲ ဖြစ်သည်။ ဒီအဖြေသည် ပြည်နယ်အလိုက် ကွဲပြားသည် — စာမေးပွဲမတိုင်မီ စစ်ဆေးပါ။',
      relatedQuestionIds: ['GOV-S32'],
    },
  },
  // DYNAMIC(state): Capital varies by state but is effectively static. No regular updates needed.
  {
    id: 'GOV-S32',
    question_en: 'What is the capital of your state?',
    question_my: 'သင်၏ပြည်နယ်၏ မြို့တော်ကား အဘယ်နည်း။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'Sacramento', text_my: 'ဆက်ကရမေန်တို' }],
    dynamic: {
      type: 'state',
      field: 'capital',
      lastVerified: '2026-02-09',
      updateTrigger: 'Static - state capitals do not change',
    },
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
    explanation: {
      brief_en:
        "Each state has its own capital city where the state government is located. The state capital is often NOT the largest city. This answer varies — check your state's capital before the test.",
      brief_my:
        'ပြည်နယ်တစ်ခုစီတွင် ပြည်နယ်အစိုးရ တည်ရှိရာ မြို့တော်ရှိသည်။ ပြည်နယ်မြို့တော်သည် အကြီးဆုံးမြို့ မဟုတ်တတ်ပါ။ ဒီအဖြေသည် ကွဲပြားသည် — စာမေးပွဲမတိုင်မီ သင့်ပြည်နယ်မြို့တော်ကို စစ်ဆေးပါ။',
      commonMistake_en:
        "The state capital is NOT always the biggest city. For example, California's capital is Sacramento, not Los Angeles.",
      commonMistake_my:
        'ပြည်နယ်မြို့တော်သည် အကြီးဆုံးမြို့ အမြဲမဟုတ်ပါ။ ဥပမာ — ကယ်လီဖိုးနီးယား၏ မြို့တော်သည် လော့စ်အိန်ဂျယ်လိစ် မဟုတ်ဘဲ ဆက်ကရမေန်တို ဖြစ်သည်။',
      relatedQuestionIds: ['GOV-S31', 'SYM-07'],
    },
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
    explanation: {
      brief_en:
        'The U.S. has a two-party system dominated by Democrats and Republicans. While other parties exist (Libertarian, Green, etc.), these two have won virtually all major elections since the 1850s.',
      brief_my:
        'အမေရိကန်တွင် ဒီမိုကရက်တစ်နှင့် ရီပတ်ဘလစ်ကန် ပါတီနှစ်ခုက လွှမ်းမိုးသော စနစ်ရှိသည်။ အခြားပါတီများ (လစ်ဘရယ်၊ အစိမ်းရောင် စသည်) ရှိသော်လည်း ဒီနှစ်ခုက ၁၈၅၀ ပြည့်နှစ်များကတည်းက အဓိကရွေးကောက်ပွဲအားလုံးကို အနိုင်ရခဲ့သည်။',
      relatedQuestionIds: ['GOV-S34'],
    },
  },
  // DYNAMIC: Update after presidential elections (every 4 years). Next check: Nov 2028.
  {
    id: 'GOV-S34',
    question_en: 'What is the political party of the President now?',
    question_my: 'ယခု သမ္မတ၏ နိုင်ငံရေးပါတီကား အဘယ်နည်း။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'Republican Party', text_my: 'ရီပတ်ဘလစ်ကန်ပါတီ' }],
    dynamic: {
      type: 'time',
      field: 'presidentParty',
      lastVerified: '2026-02-09',
      updateTrigger: 'Presidential election (every 4 years)',
    },
    answers: [
      { text_en: 'Democratic Party', text_my: 'ဒီမိုကရက်တစ်ပါတီ', correct: false },
      { text_en: 'Republican Party', text_my: 'ရီပတ်ဘလစ်ကန်ပါတီ', correct: true },
      { text_en: 'Independent', text_my: 'လွတ်လပ်သော', correct: false },
      { text_en: 'Libertarian Party', text_my: 'လစ်ဘရယ်ပါတီ', correct: false },
    ],
    explanation: {
      brief_en:
        "This answer changes when a new President takes office. The President's party affiliation is public knowledge — check the current information before your civics test.",
      brief_my:
        'သမ္မတအသစ် တာဝန်ယူသောအခါ ဒီအဖြေ ပြောင်းလဲသည်။ သမ္မတ၏ ပါတီဝင်ဖြစ်မှုသည် လူသိရှင်ကြား ဖြစ်သည် — စာမေးပွဲမတိုင်မီ လက်ရှိအချက်အလက်ကို စစ်ဆေးပါ။',
      relatedQuestionIds: ['GOV-S16', 'GOV-S33'],
    },
  },
  // DYNAMIC: Update each new Congress (every 2 years) or on vacancy. Next check: Jan 2027.
  {
    id: 'GOV-S35',
    question_en: 'What is the name of the Speaker of the House of Representatives now?',
    question_my: 'ယခု အောက်လွှတ်တော်ဥက္ကဋ္ဌ၏ အမည်ကား အဘယ်နည်း။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'Mike Johnson', text_my: 'မိုက် ဂျွန်ဆင်' }],
    dynamic: {
      type: 'time',
      field: 'speakerOfHouse',
      lastVerified: '2026-02-09',
      updateTrigger: 'Each new Congress (every 2 years) or vacancy',
    },
    answers: [
      { text_en: 'Mike Johnson', text_my: 'မိုက် ဂျွန်ဆင်', correct: true },
      { text_en: 'Nancy Pelosi', text_my: 'နန်စီ ပလိုစီ', correct: false },
      { text_en: 'Kevin McCarthy', text_my: 'ကီဗင် မက်ကာသီ', correct: false },
      { text_en: 'Chuck Schumer', text_my: 'ချားလ်စ် ရှူးမား', correct: false },
    ],
    explanation: {
      brief_en:
        'The Speaker leads the House of Representatives and is second in line for the presidency (after the Vice President). This answer changes — check the current name before your test.',
      brief_my:
        'အောက်လွှတ်တော်ဥက္ကဋ္ဌသည် အောက်လွှတ်တော်ကို ဦးဆောင်ပြီး သမ္မတရာထူးအတွက် ဒုတိယမြောက် ဆက်ခံသူ (ဒုတိယသမ္မတ ပြီးနောက်) ဖြစ်သည်။ ဒီအဖြေ ပြောင်းလဲနိုင်သည် — စာမေးပွဲမတိုင်မီ စစ်ဆေးပါ။',
      relatedQuestionIds: ['GOV-S19', 'GOV-S05'],
    },
  },
];
