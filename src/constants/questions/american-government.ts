import type { Question } from '@/types';

/**
 * American Government Questions
 *
 * ID Prefixes:
 * - GOV-P##: Principles of American Democracy (12 questions)
 * - GOV-S##: System of Government (35 questions)
 *
 * @verified claude-initial-pass 2026-02-18 — pending 3-AI consensus
 */

export const americanGovernmentQuestions: Question[] = [
  // ============================================
  // PRINCIPLES OF AMERICAN DEMOCRACY (GOV-P01-12)
  // ============================================
  {
    id: 'GOV-P01',
    question_en: 'What is the supreme law of the land?',
    question_my: 'နိုင်ငံရဲ့ အမြင့်ဆုံးဥပဒေက ဘာလဲ။',
    category: 'Principles of American Democracy',
    studyAnswers: [
      { text_en: 'the Constitution', text_my: 'ဖွဲ့စည်းပုံအခြေခံဥပဒေ (Constitution)' },
    ],
    answers: [
      {
        text_en: 'the Constitution',
        text_my: 'ဖွဲ့စည်းပုံအခြေခံဥပဒေ (Constitution)',
        correct: true,
      },
      {
        text_en: 'the Declaration of Independence',
        text_my: 'လွတ်လပ်ရေးကြေညာစာ (Declaration of Independence)',
        correct: false,
      },
      {
        text_en: 'the Articles of Confederation',
        text_my: 'ကွန်ဖက်ဒရေးရှင်းစာချုပ် (Articles of Confederation)',
        correct: false,
      },
      {
        text_en: 'the Emancipation Proclamation',
        text_my: 'ကျွန်စနစ်ဖျက်သိမ်းကြေညာစာ (Emancipation Proclamation)',
        correct: false,
      },
    ],
    explanation: {
      brief_en:
        'The Constitution is the highest legal authority in the United States. All other laws must follow it, and no person or government body is above it.',
      brief_my:
        'ဖွဲ့စည်းပုံအခြေခံဥပဒေ (Constitution) ဟာ အမေရိကန်ရဲ့ အမြင့်ဆုံးဥပဒေဖြစ်တယ်။ အခြားဥပဒေအားလုံး ဒီဟာကို လိုက်နာရပြီး ဘယ်သူမှ ဒီဥပဒေအထက်မှာ မရှိဘူး။',
      citation: 'Article VI, Clause 2 (Supremacy Clause)',
      commonMistake_en:
        "The Declaration of Independence declared freedom from Britain but does not set up how the government works — that is the Constitution's job.",
      commonMistake_my:
        'လွတ်လပ်ရေးကြေညာစာ (Declaration of Independence) က ဗြိတိန်ဆီက လွတ်လပ်ရေးကို ကြေညာခဲ့ပေမယ့် အစိုးရလုပ်ပုံလုပ်နည်းကို မသတ်မှတ်ဘူး — အဲဒါက ဖွဲ့စည်းပုံ (Constitution) ရဲ့ တာဝန်ပဲ။',
      relatedQuestionIds: ['GOV-P02', 'GOV-P03'],

      mnemonic_en: 'SUPREME = Constitution. It is the highest law — all other laws must follow it.',
      funFact_en:
        'The U.S. Constitution is the oldest written national constitution still in use, ratified in 1788.',
      funFact_my:
        'အမေရိကန်ဖွဲ့စည်းပုံအခြေခံဥပဒေသည် ၁၇၈၈ ခုနှစ်တွင် အတည်ပြုခဲ့ပြီး ဆက်လက်အသုံးပြုနေသော အဟောင်းဆုံးဖွဲ့စည်းပုံ ဖြစ်သည်။',
    },
    tricky: true,
  },
  {
    id: 'GOV-P02',
    question_en: 'What does the Constitution do?',
    question_my: 'ဖွဲ့စည်းပုံအခြေခံဥပဒေ (Constitution) က ဘာလုပ်သလဲ။',
    category: 'Principles of American Democracy',
    studyAnswers: [
      { text_en: 'sets up the government', text_my: 'အစိုးရ (Government) ကို ဖွဲ့စည်းတယ်' },
      { text_en: 'defines the government', text_my: 'အစိုးရ (Government) ကို သတ်မှတ်တယ်' },
      {
        text_en: 'protects basic rights of Americans',
        text_my: 'အမေရိကန်တွေရဲ့ အခြေခံအခွင့်အရေးတွေကို ကာကွယ်ပေးတယ်',
      },
    ],
    answers: [
      {
        text_en: 'sets up the government',
        text_my: 'အစိုးရ (Government) ကို ဖွဲ့စည်းတယ်',
        correct: true,
      },
      {
        text_en: 'declares our independence',
        text_my: 'ငါတို့ရဲ့ လွတ်လပ်ရေးကို ကြေညာတယ်',
        correct: false,
      },
      {
        text_en: 'defines the role of the states',
        text_my: 'ပြည်နယ် (State) တွေရဲ့ အခန်းကဏ္ဍကို သတ်မှတ်တယ်',
        correct: false,
      },
      {
        text_en: 'sets the tax rate',
        text_my: 'အခွန် (Tax) နှုန်းထားကို သတ်မှတ်တယ်',
        correct: false,
      },
    ],
    explanation: {
      brief_en:
        'The Constitution does three key things: it sets up the structure of the government, defines what each branch can do, and protects the basic rights of all Americans.',
      brief_my:
        'ဖွဲ့စည်းပုံအခြေခံဥပဒေ (Constitution) က အဓိကအရာသုံးခုကို လုပ်ဆောင်တယ် — အစိုးရဖွဲ့စည်းပုံ ချမှတ်ခြင်း၊ ဌာနခွဲတစ်ခုစီရဲ့ လုပ်ပိုင်ခွင့်တွေ သတ်မှတ်ခြင်းနဲ့ အမေရိကန်အားလုံးရဲ့ အခြေခံအခွင့်အရေးတွေကို ကာကွယ်ခြင်း ဖြစ်တယ်။',
      citation: 'Preamble and Articles I-VII',
      relatedQuestionIds: ['GOV-P01', 'GOV-P05'],

      mnemonic_en: 'S-D-P: Sets up government, Defines branches, Protects rights.',
      funFact_en:
        'The original Constitution is only about 4,400 words — shorter than most app terms of service.',
      funFact_my: 'မူရင်းဖွဲ့စည်းပုံအခြေခံဥပဒေသည် စာလုံး ၄,၄၀၀ ခန့်သာ ရှိသည်။',
      commonMistake_en:
        'The Constitution does NOT declare independence — that is the Declaration of Independence (1776).',
      commonMistake_my:
        'ဖွဲ့စည်းပုံသည် လွတ်လပ်ရေးကြေညာခြင်း မဟုတ်ပါ — ၎င်းသည် လွတ်လပ်ရေးကြေညာစာတမ်း (၁၇၇၆) ဖြစ်သည်။',
    },
  },
  {
    id: 'GOV-P03',
    question_en:
      'The idea of self-government is in the first three words of the Constitution. What are these words?',
    question_my:
      'ကိုယ်ပိုင်အုပ်ချုပ်ရေးဆိုတဲ့ အယူအဆက ဖွဲ့စည်းပုံအခြေခံဥပဒေ (Constitution) ရဲ့ ပထမဆုံးစကားလုံး ၃ လုံးမှာ ရှိတယ်။ ဒီစကားလုံးတွေက ဘာတွေလဲ။',
    category: 'Principles of American Democracy',
    studyAnswers: [{ text_en: 'We the People', text_my: 'ငါတို့ ပြည်သူတွေ (We the People)' }],
    answers: [
      { text_en: 'We the People', text_my: 'ငါတို့ ပြည်သူတွေ (We the People)', correct: true },
      { text_en: 'We the States', text_my: 'ငါတို့ ပြည်နယ်တွေ', correct: false },
      {
        text_en: 'Congress shall make',
        text_my: 'ကွန်ဂရက် (Congress) က လုပ်ရမယ်',
        correct: false,
      },
      {
        text_en: 'Life, Liberty, Happiness',
        text_my: 'အသက်ရှင်သန်မှု၊ လွတ်လပ်ခွင့်၊ ပျော်ရွှင်မှု',
        correct: false,
      },
    ],
    explanation: {
      brief_en:
        '"We the People" shows that the government gets its power from the people, not from a king or ruler. This is the core idea of self-government — citizens are in charge.',
      brief_my:
        '"ငါတို့ ပြည်သူတွေ (We the People)" ဆိုတာ အစိုးရရဲ့ အာဏာက ဘုရင် ဒါမှမဟုတ် အုပ်ချုပ်သူဆီက မဟုတ်ဘဲ ပြည်သူတွေဆီက ရတယ်ဆိုတာ ပြတာပဲ။ ဒါက ကိုယ်ပိုင်အုပ်ချုပ်ရေးရဲ့ အဓိကအယူအဆ ဖြစ်တယ်။',
      citation: 'Preamble to the Constitution',
      funFact_en:
        'The original Constitution is on display at the National Archives in Washington, D.C. The ink has faded so much that "We the People" is one of the few parts still easy to read!',
      funFact_my:
        'မူရင်းဖွဲ့စည်းပုံအခြေခံဥပဒေကို ဝါရှင်တန်ဒီစီရှိ နိုင်ငံတော်မှတ်တမ်းတိုက်တွင် ပြသထားသည်။ မင်ကုန်သွားသဖြင့် "We the People" သည် ယနေ့တိုင် ဖတ်ရလွယ်ကူသော အစိတ်အပိုင်းအနည်းငယ်ထဲမှ တစ်ခုဖြစ်သည်!',
      relatedQuestionIds: ['GOV-P01', 'GOV-P02'],

      mnemonic_en: '"We the People" — the first three words show government serves THE PEOPLE.',
      commonMistake_en:
        'The Constitution does NOT begin with "In God We Trust" — "We the People" is the opening phrase.',
      commonMistake_my:
        'ဖွဲ့စည်းပုံသည် "In God We Trust" ဖြင့် မစပါ — "We the People" သည် ဖွင့်စကား ဖြစ်သည်။',
    },
  },
  {
    id: 'GOV-P04',
    question_en: 'What is an amendment?',
    question_my: 'ပြင်ဆင်ချက် (Amendment) ဆိုတာ ဘာလဲ။',
    category: 'Principles of American Democracy',
    studyAnswers: [
      {
        text_en: 'a change (to the Constitution)',
        text_my: 'ဖွဲ့စည်းပုံအခြေခံဥပဒေ (Constitution) ကို ပြောင်းလဲခြင်း',
      },
      {
        text_en: 'an addition (to the Constitution)',
        text_my: 'ဖွဲ့စည်းပုံအခြေခံဥပဒေ (Constitution) မှာ ထပ်ဖြည့်ခြင်း',
      },
    ],
    answers: [
      {
        text_en: 'a change (to the Constitution)',
        text_my: 'ဖွဲ့စည်းပုံအခြေခံဥပဒေ (Constitution) ကို ပြောင်းလဲခြင်း',
        correct: true,
      },
      { text_en: 'a new law', text_my: 'ဥပဒေ (Law) အသစ်', correct: false },
      { text_en: 'a court order', text_my: 'တရားရုံးအမိန့်', correct: false },
      { text_en: 'a presidential decree', text_my: 'သမ္မတ (President) အမိန့်', correct: false },
    ],
    explanation: {
      brief_en:
        'An amendment is a change or addition to the Constitution. The Founders designed this process so the Constitution could grow with the country while still being hard to change on a whim.',
      brief_my:
        'ပြင်ဆင်ချက် (Amendment) ဆိုတာ ဖွဲ့စည်းပုံအခြေခံဥပဒေ (Constitution) ကို ပြောင်းလဲခြင်း ဒါမှမဟုတ် ထပ်ဖြည့်ခြင်း ဖြစ်တယ်။ နိုင်ငံနဲ့အတူ တိုးတက်နိုင်အောင် ဒီလိုလုပ်ထုံးကို ရေးဆွဲထားပေမယ့် လွယ်လွယ်ပြောင်းလဲလို့ မရဘူး။',
      citation: 'Article V',
      relatedQuestionIds: ['GOV-P05', 'GOV-P07'],

      mnemonic_en: 'Amendments = Changes to the Constitution. "Amend" means "to fix or add."',
      funFact_en:
        'Over 11,000 amendments have been proposed but only 27 ratified — less than 0.25% success rate.',
      funFact_my: 'ပြင်ဆင်ချက် ၁၁,၀၀၀ ကျော် အဆိုပြုခဲ့သော်လည်း ၂၇ ခုသာ အတည်ပြုခဲ့သည်။',
      commonMistake_en:
        'An amendment becomes PART of the Constitution once ratified, not a separate law.',
      commonMistake_my:
        'ပြင်ဆင်ချက်သည် အတည်ပြုပြီးသည်နှင့် ဖွဲ့စည်းပုံ၏ အစိတ်အပိုင်း ဖြစ်လာပြီး သီးခြားဥပဒေ မဟုတ်ပါ။',
    },
  },
  {
    id: 'GOV-P05',
    question_en: 'What do we call the first ten amendments to the Constitution?',
    question_my:
      'ဖွဲ့စည်းပုံအခြေခံဥပဒေ (Constitution) ရဲ့ ပထမဆုံး ပြင်ဆင်ချက် (Amendment) ၁၀ ခုကို ဘယ်လိုခေါ်လဲ။',
    category: 'Principles of American Democracy',
    studyAnswers: [
      {
        text_en: 'the Bill of Rights',
        text_my: 'အခွင့်အရေးဥပဒေကြမ်း (Bill of Rights)',
      },
    ],
    answers: [
      {
        text_en: 'the Bill of Rights',
        text_my: 'အခွင့်အရေးဥပဒေကြမ်း (Bill of Rights)',
        correct: true,
      },
      {
        text_en: 'the Declaration of Independence',
        text_my: 'လွတ်လပ်ရေးကြေညာစာ (Declaration of Independence)',
        correct: false,
      },
      {
        text_en: 'the Articles of Confederation',
        text_my: 'ကွန်ဖက်ဒရေးရှင်းစာချုပ် (Articles of Confederation)',
        correct: false,
      },
      {
        text_en: 'the Freedom Amendments',
        text_my: 'လွတ်လပ်ရေး ပြင်ဆင်ချက်များ',
        correct: false,
      },
    ],
    explanation: {
      brief_en:
        'The Bill of Rights is the first 10 amendments, added in 1791. They guarantee essential freedoms like speech, religion, and the right to a fair trial — protections many states demanded before agreeing to the Constitution.',
      brief_my:
        'အခွင့်အရေးဥပဒေကြမ်း (Bill of Rights) ဟာ ၁၇၉၁ ခုနှစ်မှာ ထည့်သွင်းခဲ့တဲ့ ပထမဆုံးပြင်ဆင်ချက် ၁၀ ခု ဖြစ်တယ်။ ပြောဆိုခွင့်၊ ဘာသာရေးလွတ်လပ်ခွင့်နဲ့ တရားမျှတစွာစီရင်ခံပိုင်ခွင့်တို့လို မရှိမဖြစ် လွတ်လပ်ခွင့်တွေကို အာမခံတယ်။',
      citation: 'Amendments I-X',
      mnemonic_en: 'Bill of Rights = "Bill" means a list. It is a list of your rights!',
      mnemonic_my:
        'Bill of Rights = "Bill" ဆိုတာ စာရင်းတစ်ခု ဖြစ်ပါတယ်။ သင့်အခွင့်အရေးများ စာရင်း ဖြစ်ပါတယ်!',
      relatedQuestionIds: ['GOV-P04', 'GOV-P06', 'GOV-P07'],

      funFact_en:
        'The Bill of Rights was inspired by the Virginia Declaration of Rights (1776) and the English Bill of Rights (1689).',
      funFact_my:
        'အခွင့်အရေးဥပဒေသည် ဗာဂျီးနီးယားအခွင့်အရေးကြေညာချက် (၁၇၇၆) နှင့် အင်္ဂလိပ်အခွင့်အရေးဥပဒေ (၁၆၈၉) တို့မှ မှုတ်သွင်းခံရသည်။',
      commonMistake_en: 'The Bill of Rights is the FIRST 10 amendments, not all 27.',
      commonMistake_my: 'အခွင့်အရေးဥပဒေသည် ပထမ ၁၀ ခု ပြင်ဆင်ချက် ဖြစ်ပြီး ၂၇ ခုလုံး မဟုတ်ပါ။',
    },
  },
  {
    id: 'GOV-P06',
    question_en: 'What is one right or freedom from the First Amendment?',
    question_my:
      'ပထမ ပြင်ဆင်ချက် (First Amendment) ပါ အခွင့်အရေး ဒါမှမဟုတ် လွတ်လပ်ခွင့်တစ်ခုက ဘာလဲ။',
    category: 'Principles of American Democracy',
    studyAnswers: [
      { text_en: 'speech', text_my: 'ပြောဆိုခွင့်' },
      { text_en: 'religion', text_my: 'ဘာသာရေး' },
      { text_en: 'assembly', text_my: 'စည်းဝေးခွင့်' },
      { text_en: 'press', text_my: 'စာနယ်ဇင်း' },
      {
        text_en: 'petition the government',
        text_my: 'အစိုးရ (Government) ကို အသနားခံစာတင်ခြင်း',
      },
    ],
    answers: [
      { text_en: 'Speech', text_my: 'ပြောဆိုခွင့် (Speech)', correct: true },
      { text_en: 'To bear arms', text_my: 'လက်နက်ကိုင်ဆောင်ခွင့်', correct: false },
      { text_en: 'Trial by jury', text_my: 'ဂျူရီဖြင့် စစ်ဆေးခြင်း', correct: false },
      { text_en: 'To vote', text_my: 'မဲပေးခွင့်', correct: false },
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

      funFact_en:
        'The First Amendment protects five distinct freedoms: religion, speech, press, assembly, and petition.',
      funFact_my:
        'ပထမပြင်ဆင်ချက်သည် မတူညီသော လွတ်လပ်ခွင့် ၅ ခုကို ကာကွယ်သည် — ဘာသာရေး၊ ပြောဆိုခွင့်၊ သတင်းမီဒီယာ၊ စုဝေးခွင့်နှင့် တိုင်တန်းခွင့်။',
    },
  },
  {
    id: 'GOV-P07',
    question_en: 'How many amendments does the Constitution have?',
    question_my: 'ဖွဲ့စည်းပုံအခြေခံဥပဒေ (Constitution) မှာ ပြင်ဆင်ချက် (Amendment) ဘယ်နှစ်ခုရှိလဲ။',
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

      mnemonic_en: '27 amendments total. First 10 = Bill of Rights. Most recent = 27th (1992).',
      funFact_en:
        'The 27th Amendment took 202 years to ratify — proposed in 1789, approved in 1992.',
      funFact_my:
        '၂၇ ကြိမ်မြောက်ပြင်ဆင်ချက်ကို အတည်ပြုရန် ၂၀၂ နှစ်ကြာခဲ့သည် — ၁၇၈၉ တွင် အဆိုပြုပြီး ၁၉၉၂ တွင် အတည်ပြုခဲ့သည်။',
    },
  },
  {
    id: 'GOV-P08',
    question_en: 'What did the Declaration of Independence do?',
    question_my: 'လွတ်လပ်ရေးကြေညာစာ (Declaration of Independence) က ဘာလုပ်ခဲ့လဲ။',
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

      mnemonic_en:
        'Declaration = ANNOUNCED freedom from Britain in 1776. It did NOT create the government.',
      funFact_en:
        'Jefferson wrote the first draft of the Declaration in just 17 days, and Congress edited about a quarter of his text.',
      funFact_my:
        'ဂျက်ဖာဆင်သည် ကြေညာစာတမ်း ပထမမူကြမ်းကို ၁၇ ရက်အတွင်း ရေးသားခဲ့ပြီး ကွန်ဂရက်က သူ၏စာသားကို လေးပုံတစ်ပုံခန့် ပြင်ဆင်ခဲ့သည်။',
      commonMistake_en:
        'The Declaration did NOT create the government or free the slaves — it only announced independence from Britain.',
      commonMistake_my:
        'ကြေညာစာတမ်းသည် အစိုးရဖွဲ့စည်းခြင်း/ကျွန်များလွတ်မြောက်ခြင်း မဟုတ်ဘဲ ဗြိတိန်မှ လွတ်လပ်ရေးကြေညာခြင်းသာ ဖြစ်သည်။',
      citation: 'Declaration of Independence (1776)',
    },
  },
  {
    id: 'GOV-P09',
    question_en: 'What are two rights in the Declaration of Independence?',
    question_my: 'လွတ်လပ်ရေးကြေညာစာ (Declaration of Independence) ပါ အခွင့်အရေး ၂ ခုက ဘာတွေလဲ။',
    category: 'Principles of American Democracy',
    studyAnswers: [
      { text_en: 'life', text_my: 'အသက်ရှင်သန်မှု' },
      { text_en: 'liberty', text_my: 'လွတ်လပ်ခွင့် (Liberty)' },
      { text_en: 'pursuit of happiness', text_my: 'ပျော်ရွှင်မှုကိုရှာဖွေခြင်း' },
    ],
    answers: [
      {
        text_en: 'life and liberty',
        text_my: 'အသက်ရှင်သန်မှုနဲ့ လွတ်လပ်ခွင့် (Life and Liberty)',
        correct: true,
      },
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

      mnemonic_en: 'L-L-P: Life, Liberty, Pursuit of happiness — the three unalienable rights.',
      funFact_en:
        'Jefferson originally wrote "pursuit of property" but changed it to "pursuit of Happiness."',
      funFact_my:
        'ဂျက်ဖာဆင်သည် မူလ "ပိုင်ဆိုင်မှုရှာဖွေခြင်း" ဟု ရေးခဲ့သော်လည်း "ပျော်ရွှင်မှုရှာဖွေခြင်း" သို့ ပြောင်းခဲ့သည်။',
      citation: 'Declaration of Independence, Preamble paragraph 2',
    },
  },
  {
    id: 'GOV-P10',
    question_en: 'What is freedom of religion?',
    question_my: 'ဘာသာရေးလွတ်လပ်ခွင့် (Freedom of Religion) ဆိုတာ ဘာလဲ။',
    category: 'Principles of American Democracy',
    studyAnswers: [
      {
        text_en: 'You can practice any religion, or not practice a religion.',
        text_my: 'ဘယ်ဘာသာကိုမဆို ကိုးကွယ်နိုင်တယ်၊ ဒါမှမဟုတ် ဘာသာတစ်ခုမှ မကိုးကွယ်ဘဲနေနိုင်တယ်။',
      },
    ],
    answers: [
      {
        text_en: 'You can practice any religion, or not practice a religion.',
        text_my: 'ဘယ်ဘာသာကိုမဆို ကိုးကွယ်နိုင်တယ်၊ ဒါမှမဟုတ် ဘာသာတစ်ခုမှ မကိုးကွယ်ဘဲနေနိုင်တယ်။',
        correct: true,
      },
      {
        text_en: 'You must choose a religion.',
        text_my: 'ဘာသာတစ်ခုကို ရွေးရမယ်။',
        correct: false,
      },
      {
        text_en: 'The government can establish a national religion.',
        text_my: 'အစိုးရက နိုင်ငံတော်ဘာသာကို ထူထောင်နိုင်တယ်။',
        correct: false,
      },
      {
        text_en: 'You can only practice the religion of your parents.',
        text_my: 'မိဘရဲ့ ဘာသာကိုပဲ ကိုးကွယ်နိုင်တယ်။',
        correct: false,
      },
    ],
    explanation: {
      brief_en:
        'Freedom of religion means you can follow any religion you choose, or choose not to follow any religion at all. The government cannot force a religion on you or stop you from practicing yours.',
      brief_my:
        'ဘာသာရေးလွတ်လပ်ခွင့်ဆိုတာ ကြိုက်တဲ့ဘာသာကို ကိုးကွယ်နိုင်တယ်၊ ဒါမှမဟုတ် ဘာသာတစ်ခုမှ မကိုးကွယ်ဘဲနေနိုင်တယ်။ အစိုးရက ဘာသာတစ်ခုကို အတင်းကိုးကွယ်ခိုင်းလို့ မရဘူး။',
      citation: '1st Amendment (Establishment Clause & Free Exercise Clause)',
      relatedQuestionIds: ['GOV-P06', 'RR-04'],

      mnemonic_en:
        'Freedom of Religion = practice ANY religion OR none at all. Government stays out.',
      funFact_en:
        'Freedom of religion means both freedom TO practice AND freedom FROM government-imposed religion.',
      funFact_my:
        'ဘာသာရေးလွတ်လပ်ခွင့်ဆိုသည်မှာ ကျင့်သုံးရန်လွတ်လပ်ခွင့်နှင့် အစိုးရသတ်မှတ်ဘာသာမှ ကင်းလွတ်ခွင့် နှစ်ခုလုံး ဖြစ်သည်။',
      commonMistake_en:
        'Freedom of religion is NOT just about Christianity — it covers ALL religions and the right to have no religion.',
      commonMistake_my:
        'ဘာသာရေးလွတ်လပ်ခွင့်သည် ခရစ်ယာန်ဘာသာအတွက်သာ မဟုတ်ဘဲ ဘာသာအားလုံးနှင့် ဘာသာမဲ့နေပိုင်ခွင့်ကိုလည်း ကာကွယ်သည်။',
    },
  },
  {
    id: 'GOV-P11',
    question_en: 'What is the economic system in the United States?',
    question_my: 'အမေရိကန်ပြည်ထောင်စုရဲ့ စီးပွားရေးစနစ်က ဘာလဲ။',
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

      mnemonic_en: 'Capitalism = Free market. People choose jobs, start businesses, own property.',
      funFact_en:
        'The U.S. has a "mixed economy" — mostly free market with some government regulation for safety and fairness.',
      funFact_my:
        'အမေရိကန်တွင် "ရောစပ်စီးပွားရေး" ရှိသည် — အများအားဖြင့် လွတ်လပ်သောစျေးကွက်နှင့် အစိုးရထိန်းချုပ်မှု အချို့ ပါဝင်သည်။',
      commonMistake_en:
        'The U.S. is NOT a socialist or communist economy. It is a capitalist/free market economy.',
      commonMistake_my:
        'အမေရိကန်သည် ဆိုရှယ်လစ် သို့မဟုတ် ကွန်မြူနစ်စီးပွားရေး မဟုတ်ပါ။ အရင်းရှင်/လွတ်လပ်သောစျေးကွက်စီးပွားရေး ဖြစ်သည်။',
      citation: 'Article I, Section 8 (Commerce Clause)',
    },
  },
  {
    id: 'GOV-P12',
    question_en: 'What is the "rule of law"?',
    question_my: 'ဥပဒေစိုးမိုးရေး (Rule of Law) ဆိုတာ ဘာလဲ။',
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

      mnemonic_en: 'Rule of Law = NO ONE is above the law, not even the President.',
      funFact_en:
        'The concept of "rule of law" dates back to ancient Greece and was built into the Constitution through checks and balances.',
      funFact_my:
        '"ဥပဒေစိုးမိုးရေး" သဘောတရားသည် ရှေးဂရိခေတ်မှ ဆင်းသက်လာပြီး ထိန်းညှိမှုဖြင့် ဖွဲ့စည်းပုံထဲသို့ ထည့်သွင်းခဲ့သည်။',
      commonMistake_en:
        'Rule of law does NOT mean the President makes all the rules. It means EVERYONE must follow the law equally.',
      commonMistake_my:
        'ဥပဒေစိုးမိုးရေးဆိုသည်မှာ သမ္မတက စည်းမျဉ်းအားလုံးပြုလုပ်သည်ဟု မဆိုလိုပါ။ လူတိုင်း ဥပဒေကို တန်းတူလိုက်နာရမည်ဟု ဆိုလိုသည်။',
      citation: 'Article VI; 14th Amendment, Section 1',
    },
  },

  // ============================================
  // SYSTEM OF GOVERNMENT (GOV-S01-35)
  // ============================================
  {
    id: 'GOV-S01',
    question_en: 'Name one branch or part of the government.',
    question_my: 'အစိုးရ (Government) ရဲ့ ဌာနခွဲ ဒါမှမဟုတ် အစိတ်အပိုင်းတစ်ခုကို ပြောပြပါ။',
    category: 'System of Government',
    studyAnswers: [
      { text_en: 'Congress', text_my: 'ကွန်ဂရက်လွှတ်တော် (Congress)' },
      { text_en: 'legislative', text_my: 'ဥပဒေပြုရေးဌာန (Legislative Branch)' },
      { text_en: 'President', text_my: 'သမ္မတ (President)' },
      { text_en: 'executive', text_my: 'အုပ်ချုပ်ရေးဌာန (Executive Branch)' },
      { text_en: 'the courts', text_my: 'တရားရုံးများ' },
      { text_en: 'judicial', text_my: 'တရားစီရင်ရေးဌာန (Judicial Branch)' },
    ],
    answers: [
      { text_en: 'Congress', text_my: 'ကွန်ဂရက်လွှတ်တော် (Congress)', correct: true },
      { text_en: 'The States', text_my: 'ပြည်နယ် (State) များ', correct: false },
      { text_en: 'The Military', text_my: 'စစ်တပ်', correct: false },
      { text_en: 'The Treasury', text_my: 'ဘဏ္ဍာရေးဝန်ကြီးဌာန', correct: false },
    ],
    explanation: {
      brief_en:
        'The U.S. government has three branches: legislative (Congress — makes laws), executive (President — enforces laws), and judicial (courts — interprets laws). This separation prevents any one group from having too much power.',
      brief_my:
        'အမေရိကန်အစိုးရမှာ ဌာနခွဲ ၃ ခုရှိတယ် — ဥပဒေပြုရေးဌာန (ကွန်ဂရက်)၊ အုပ်ချုပ်ရေးဌာန (သမ္မတ) နဲ့ တရားစီရင်ရေးဌာန (တရားရုံးများ)။ အုပ်စုတစ်ခုတည်းက အာဏာအလွန်ကြီးမားတာကို ကာကွယ်တယ်။',
      citation: 'Articles I, II, III',
      relatedQuestionIds: ['GOV-S02', 'GOV-S03', 'GOV-S04', 'GOV-S25'],

      mnemonic_en: 'Three branches: L-E-J = Legislative, Executive, Judicial.',
      funFact_en:
        'The three-branch system was inspired by Montesquieu\'s "The Spirit of the Laws" (1748).',
      funFact_my: 'သုံးဌာနစနစ်သည် Montesquieu ၏ "ဥပဒေ၏စိတ်ဓာတ်" (၁၇၄၈) မှ မှုတ်သွင်းခံရသည်။',
      commonMistake_en:
        'There are THREE branches, not two or four. Legislative, Executive, and Judicial.',
      commonMistake_my:
        'ဌာနခွဲ သုံးခု ရှိပြီး နှစ်ခု သို့မဟုတ် လေးခု မဟုတ်ပါ — ဥပဒေပြု၊ အုပ်ချုပ်ရေးနှင့် တရားစီရင်ရေး။',
    },
    tricky: true,
  },
  {
    id: 'GOV-S02',
    question_en: 'What stops one branch of government from becoming too powerful?',
    question_my: 'အစိုးရဌာနခွဲတစ်ခု အလွန်အင်အားကြီးလာတာကို ဘာက တားဆီးလဲ။',
    category: 'System of Government',
    studyAnswers: [
      { text_en: 'checks and balances', text_my: 'စစ်ဆေးမှုများနှင့် ဟန်ချက်ညီမှုများ' },
      { text_en: 'separation of powers', text_my: 'အာဏာခွဲဝေမှု' },
    ],
    answers: [
      {
        text_en: 'checks and balances',
        text_my: 'ထိန်းညှိမှုနဲ့ ဟန်ချက်ညီမှု (Checks and Balances)',
        correct: true,
      },
      { text_en: 'the President', text_my: 'သမ္မတ (President)', correct: false },
      { text_en: 'the people', text_my: 'ပြည်သူတွေ', correct: false },
      { text_en: 'the states', text_my: 'ပြည်နယ် (State) များ', correct: false },
    ],
    explanation: {
      brief_en:
        'Checks and balances (also called separation of powers) means each branch can limit the others. For example, the President can veto laws, Congress can override vetoes, and courts can declare laws unconstitutional.',
      brief_my:
        'စစ်ဆေးမှုများနှင့် ဟန်ချက်ညီမှုများ (အာဏာခွဲဝေမှုဟုလည်း ခေါ်သည်) ဆိုသည်မှာ ဌာနခွဲတစ်ခုစီက အခြားဌာနခွဲများကို ကန့်သတ်နိုင်သည်။ ဥပမာ — သမ္မတက ဥပဒေကို ဗီတိုပေးနိုင်ပြီး ကွန်ဂရက်က ဗီတိုကို ကျော်လွှား၍ တရားရုံးများက ဥပဒေကို ဖွဲ့စည်းပုံနှင့်မညီဟု ကြေညာနိုင်သည်။',
      citation: 'Articles I, II, III',
      relatedQuestionIds: ['GOV-S01', 'GOV-S21', 'GOV-S22', 'GOV-S25'],

      mnemonic_en:
        'Checks and Balances = each branch can CHECK and STOP the others from getting too powerful.',
      funFact_en:
        'The President vetoes laws, Congress overrides vetoes, and the Supreme Court strikes down unconstitutional laws.',
      funFact_my:
        'သမ္မတ ဗီတိုလုပ်သည်၊ ကွန်ဂရက် ဗီတိုကျော်လွန်သည်၊ တရားရုံးချုပ် ဖွဲ့စည်းပုံနှင့်မညီသော ဥပဒေများ ပယ်ဖျက်သည်။',
      commonMistake_en: '"Checks and balances" is about government POWER, not money or banking.',
      commonMistake_my:
        '"ထိန်းညှိမှု" သည် အစိုးရအာဏာအကြောင်း ဖြစ်ပြီး ငွေကြေး/ဘဏ်လုပ်ငန်း မဟုတ်ပါ။',
    },
  },
  {
    id: 'GOV-S03',
    question_en: 'Who is in charge of the executive branch?',
    question_my: 'အုပ်ချုပ်ရေးဌာန (Executive Branch) ကို ဘယ်သူက တာဝန်ယူလဲ။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'the President', text_my: 'သမ္မတ (President)' }],
    answers: [
      { text_en: 'the President', text_my: 'သမ္မတ (President)', correct: true },
      {
        text_en: 'the Chief Justice',
        text_my: 'တရားသူကြီးချုပ် (Chief Justice)',
        correct: false,
      },
      {
        text_en: 'the Speaker of the House',
        text_my: 'အောက်လွှတ်တော်ဥက္ကဋ္ဌ (Speaker of the House)',
        correct: false,
      },
      {
        text_en: 'the Senate Majority Leader',
        text_my: 'အထက်လွှတ်တော် အမတ်အများစုခေါင်းဆောင်',
        correct: false,
      },
    ],
    explanation: {
      brief_en:
        'The President leads the executive branch, which is responsible for enforcing and carrying out federal laws. The executive branch also includes the Vice President and the Cabinet.',
      brief_my:
        'သမ္မတ (President) က ဖက်ဒရယ် (Federal) ဥပဒေတွေကို အကောင်အထည်ဖော်ရတဲ့ အုပ်ချုပ်ရေးဌာန (Executive Branch) ကို ဦးဆောင်တယ်။ ဒီဌာနမှာ ဒုတိယသမ္မတ (Vice President) နဲ့ အစိုးရအဖွဲ့ (Cabinet) လည်း ပါဝင်တယ်။',
      citation: 'Article II, Section 1',
      relatedQuestionIds: ['GOV-S16', 'GOV-S20', 'GOV-S21'],

      mnemonic_en: 'Executive branch = the President. "Execute" means to carry out the laws.',
      funFact_en:
        'The Executive branch includes over 4 million employees, making it the largest branch of government.',
      funFact_my: 'အုပ်ချုပ်ရေးဌာနတွင် ဝန်ထမ်း ၄ သန်းကျော်ပါဝင်ပြီး အကြီးမားဆုံးဌာန ဖြစ်သည်။',
      commonMistake_en:
        'The President leads the Executive branch, NOT the Legislative. Congress is Legislative.',
      commonMistake_my:
        'သမ္မတ အုပ်ချုပ်ရေးဌာနကို ဦးဆောင်ပြီး ဥပဒေပြုရေးဌာန မဟုတ်ပါ။ ကွန်ဂရက်က ဥပဒေပြုရေး ဖြစ်သည်။',
    },
  },
  {
    id: 'GOV-S04',
    question_en: 'Who makes federal laws?',
    question_my: 'ဖက်ဒရယ် (Federal) ဥပဒေ (Law) တွေကို ဘယ်သူက ပြုလုပ်လဲ။',
    category: 'System of Government',
    studyAnswers: [
      { text_en: 'Congress', text_my: 'ကွန်ဂရက်လွှတ်တော် (Congress)' },
      {
        text_en: 'Senate and House (of Representatives)',
        text_my: 'အထက်လွှတ်တော် (Senate) နဲ့ အောက်လွှတ်တော် (House of Representatives)',
      },
      {
        text_en: '(U.S. or national) legislature',
        text_my: '(အမေရိကန် ဒါမှမဟုတ် နိုင်ငံတော်) ဥပဒေပြုလွှတ်တော်',
      },
    ],
    answers: [
      { text_en: 'Congress', text_my: 'ကွန်ဂရက်လွှတ်တော် (Congress)', correct: true },
      {
        text_en: 'the Supreme Court',
        text_my: 'တရားလွှတ်တော်ချုပ် (Supreme Court)',
        correct: false,
      },
      { text_en: 'the President', text_my: 'သမ္မတ (President)', correct: false },
      { text_en: 'the states', text_my: 'ပြည်နယ် (State) များ', correct: false },
    ],
    explanation: {
      brief_en:
        'Congress (the Senate and the House of Representatives) is the legislative branch that makes federal laws. Both chambers must agree on a bill before it goes to the President to be signed into law.',
      brief_my:
        'ကွန်ဂရက် (အထက်လွှတ်တော်နှင့် အောက်လွှတ်တော်) သည် ဖက်ဒရယ်ဥပဒေများ ပြုလုပ်သော ဥပဒေပြုဌာန ဖြစ်သည်။ ဥပဒေကြမ်းတစ်ခုကို သမ္မတထံ လက်မှတ်ရေးထိုးရန် မပို့မီ လွှတ်တော်နှစ်ရပ်စလုံး သဘောတူရမည်။',
      citation: 'Article I, Section 1',
      relatedQuestionIds: ['GOV-S01', 'GOV-S05', 'GOV-S21'],

      mnemonic_en: 'Congress = Senate + House = makes federal laws. They LEGISLATE.',
      funFact_en: 'The first Congress met in New York City in 1789, not Washington D.C.',
      funFact_my: 'ပထမဆုံးကွန်ဂရက်သည် ၁၇၈၉ တွင် ဝါရှင်တန်ဒီစီမဟုတ်ဘဲ နယူးယောက်တွင် တွေ့ဆုံခဲ့သည်။',
      commonMistake_en:
        'Congress makes laws, NOT the President. The President signs them into law.',
      commonMistake_my:
        'ကွန်ဂရက်က ဥပဒေပြုပြီး သမ္မတ မဟုတ်ပါ။ သမ္မတက လက်မှတ်ထိုးပြီး ဥပဒေဖြစ်စေသည်။',
    },
  },
  {
    id: 'GOV-S05',
    question_en: 'What are the two parts of the U.S. Congress?',
    question_my: 'အမေရိကန် ကွန်ဂရက်လွှတ်တော် (Congress) ရဲ့ အစိတ်အပိုင်း ၂ ခုက ဘာတွေလဲ။',
    category: 'System of Government',
    studyAnswers: [
      {
        text_en: 'the Senate and House (of Representatives)',
        text_my: 'အထက်လွှတ်တော် (Senate) နဲ့ အောက်လွှတ်တော် (House of Representatives)',
      },
    ],
    answers: [
      {
        text_en: 'the Senate and House (of Representatives)',
        text_my: 'အထက်လွှတ်တော် (Senate) နဲ့ အောက်လွှတ်တော် (House of Representatives)',
        correct: true,
      },
      {
        text_en: 'the President and the Cabinet',
        text_my: 'သမ္မတ (President) နဲ့ အစိုးရအဖွဲ့ (Cabinet)',
        correct: false,
      },
      {
        text_en: 'the Supreme Court and the federal courts',
        text_my: 'တရားလွှတ်တော်ချုပ် (Supreme Court) နဲ့ ဖက်ဒရယ်တရားရုံးများ',
        correct: false,
      },
      {
        text_en: 'the Democratic and Republican parties',
        text_my: 'ဒီမိုကရက်တစ်နဲ့ ရီပတ်ဘလစ်ကန် ပါတီများ',
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

      mnemonic_en:
        'Senate + House of Representatives = the two parts of Congress. "Bi-cameral" = two chambers.',
      funFact_en:
        'The Great Compromise of 1787 created this two-chamber system: equal representation in Senate, proportional in House.',
      funFact_my:
        '၁၇၈၇ ၏ကြီးမားသောအပေးအယူက ဤနှစ်ခန်းမစနစ်ကို ဖန်တီးခဲ့သည်: အထက်လွှတ်တော်တွင် တန်းတူ၊ အောက်လွှတ်တော်တွင် အချိုးကျ။',
      commonMistake_en:
        'The two parts are Senate and House of Representatives — NOT "Congress" and "Senate."',
      commonMistake_my:
        'နှစ်ပိုင်းမှာ အထက်လွှတ်တော်နှင့် အောက်လွှတ်တော် ဖြစ်ပြီး "ကွန်ဂရက်" နှင့် "အထက်လွှတ်တော်" မဟုတ်ပါ။',
    },
  },
  {
    id: 'GOV-S06',
    question_en: 'How many U.S. Senators are there?',
    question_my: 'အမေရိကန် အထက်လွှတ်တော်အမတ် (Senator) ဘယ်နှစ်ဦးရှိလဲ။',
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

      funFact_en:
        'Wyoming (580K people) has the same 2 senators as California (39M people) — equal representation regardless of size.',
      funFact_my:
        'ဝိုင်ယိုမင်း (လူ ၅၈၀,၀၀၀) နှင့် ကယ်လီဖိုးနီးယား (၃၉ သန်း) တွင် အထက်လွှတ်တော်အမတ် ၂ ဦးစီ တူတူရှိသည်။',
      commonMistake_en:
        'There are 100 senators total (2 x 50 states), not 50 or 435. 435 = House members.',
      commonMistake_my:
        'အထက်လွှတ်တော်အမတ် စုစုပေါင်း ၁၀၀ ရှိပြီး (ပြည်နယ် ၅၀ x ၂) ၅၀ သို့မဟုတ် ၄၃၅ မဟုတ်ပါ။',
    },
  },
  {
    id: 'GOV-S07',
    question_en: 'We elect a U.S. Senator for how many years?',
    question_my: 'အမေရိကန် အထက်လွှတ်တော်အမတ် (Senator) ကို ဘယ်နှစ်နှစ်အတွက် ရွေးကောက်တင်မြှောက်လဲ။',
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

      funFact_en:
        'Senators serve 6-year terms — the longest of any elected federal official in the regular government.',
      funFact_my:
        'အထက်လွှတ်တော်အမတ်များ ၆ နှစ်သက်တမ်း ဖြစ်ပြီး ရွေးကောက်ခံ ဖက်ဒရယ်အရာရှိများထဲတွင် အရှည်ဆုံး ဖြစ်သည်။',
      commonMistake_en:
        'Senators serve 6 years, not 2 or 4. Representatives serve 2 years, the President serves 4.',
      commonMistake_my: 'အထက်လွှတ်တော်အမတ် ၆ နှစ်၊ အောက်လွှတ်တော်အမတ် ၂ နှစ်၊ သမ္မတ ၄ နှစ်။',
    },
  },
  // DYNAMIC(state): Senators vary by state. Update state-representatives.json after Senate elections.
  {
    id: 'GOV-S08',
    question_en: "Who is one of your state's U.S. Senators now?",
    question_my: 'အခု သင့်ပြည်နယ်ရဲ့ အမေရိကန် အထက်လွှတ်တော်အမတ် (Senator) တစ်ဦးက ဘယ်သူလဲ။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'Adam Schiff', text_my: 'အဒမ် ရှစ်ဖ် (Adam Schiff)' }],
    dynamic: {
      type: 'state',
      field: 'senators',
      lastVerified: '2026-02-09',
      updateTrigger: 'Senate elections (staggered 6-year terms)',
    },
    answers: [
      { text_en: 'Adam Schiff', text_my: 'အဒမ် ရှစ်ဖ် (Adam Schiff)', correct: true },
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

      mnemonic_en: 'This is a state-specific question. Know YOUR two senators by name.',
      funFact_en:
        'Each state has exactly 2 senators regardless of population — this was the Great Compromise of 1787.',
      funFact_my:
        'လူဦးရေ မည်မျှပင်ရှိစေ ပြည်နယ်တစ်ခုစီတွင် အထက်လွှတ်တော်အမတ် ၂ ဦးတိတိ ရှိသည် — ၁၇၈၇ ကြီးမားသော အပေးအယူ။',
      commonMistake_en:
        'This asks about YOUR state senators — the answer varies by state. Look up your state.',
      commonMistake_my:
        'ဤမေးခွန်းသည် သင့်ပြည်နယ်အထက်လွှတ်တော်အမတ်များကို မေးနေပြီး အဖြေ ပြည်နယ်အလိုက် ကွဲပြားသည်။',
      citation: 'Article I, Section 3; 17th Amendment',
    },
  },
  {
    id: 'GOV-S09',
    question_en: 'The House of Representatives has how many voting members?',
    question_my: 'အောက်လွှတ်တော် (House of Representatives) မှာ မဲပေးခွင့်ရှိသူ ဘယ်နှစ်ဦးရှိလဲ။',
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

      mnemonic_en: '435 voting members in the House. Based on state population.',
      funFact_en:
        'The number 435 has been fixed since 1929. If it grew proportionally, there would be over 10,000 reps today.',
      funFact_my:
        '၄၃၅ ဟူသော ဂဏန်းကို ၁၉၂၉ ကတည်းက သတ်မှတ်ထားသည်။ အချိုးကျတိုးပါက ယနေ့ ၁၀,၀၀၀ ကျော် ရှိမည်။',
    },
  },
  {
    id: 'GOV-S10',
    question_en: 'We elect a U.S. Representative for how many years?',
    question_my:
      'အမေရိကန် အောက်လွှတ်တော်အမတ် (Representative) တစ်ဦးကို ဘယ်နှစ်နှစ်အတွက် ရွေးကောက်တင်မြှောက်လဲ။',
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

      funFact_en:
        'ALL 435 House seats are up for election every 2 years, unlike the Senate where only 1/3 are up each cycle.',
      funFact_my:
        'အောက်လွှတ်တော်နေရာ ၄၃၅ ခုလုံးကို ၂ နှစ်တိုင်း ရွေးကောက်ပွဲကျင်းပသည်။ အထက်လွှတ်တော်တွင် ၃ ပုံ ၁ ပုံသာ။',
      commonMistake_en:
        'Representatives serve 2-year terms, NOT 4 or 6. They face voters most often.',
      commonMistake_my:
        'အောက်လွှတ်တော်အမတ် ၂ နှစ်သက်တမ်းဖြစ်ပြီး ၄ သို့မဟုတ် ၆ မဟုတ်ပါ။ မဲဆန္ဒရှင်နှင့် အမြဲဆုံးတွေ့ရသူ ဖြစ်သည်။',
    },
  },
  // DYNAMIC(state): Representatives vary by district. Update state-representatives.json after House elections (every 2 years).
  {
    id: 'GOV-S11',
    question_en: 'Name your U.S. Representative.',
    question_my: 'သင့်ရဲ့ အမေရိကန် အောက်လွှတ်တော်အမတ် (Representative) ကို ပြောပြပါ။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'Judy Chu', text_my: 'ဂျူဒီ ချူး (Judy Chu)' }],
    dynamic: {
      type: 'state',
      field: 'representative',
      lastVerified: '2026-02-09',
      updateTrigger: 'House elections (every 2 years)',
    },
    answers: [
      { text_en: 'Judy Chu', text_my: 'ဂျူဒီ ချူး (Judy Chu)', correct: true },
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

      mnemonic_en:
        'This is location-specific. Know YOUR Representative by name based on your congressional district.',
      funFact_en:
        'Some congressional districts have been gerrymandered into bizarre shapes to favor one party.',
      funFact_my:
        'အချို့ ကွန်ဂရက်ခရိုင်များကို ပါတီတစ်ခုကို အားသာချက်ပေးရန် ထူးဆန်းသောပုံသဏ္ဍာန်များ ဆွဲထားသည်။',
      commonMistake_en:
        'This asks about YOUR specific Representative, not senators. The answer depends on your congressional district.',
      commonMistake_my:
        'ဤမေးခွန်းသည် သင့်အထူးသဖြင့် အောက်လွှတ်တော်အမတ်ကို မေးနေပြီး အထက်လွှတ်တော်အမတ် မဟုတ်ပါ။',
      citation: 'Article I, Section 2',
    },
  },
  {
    id: 'GOV-S12',
    question_en: 'Who does a U.S. Senator represent?',
    question_my: 'အမေရိကန် အထက်လွှတ်တော်အမတ် (Senator) က ဘယ်သူ့ကို ကိုယ်စားပြုလဲ။',
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

      mnemonic_en: 'Senator = represents ALL people of the entire state.',
      funFact_en:
        'Before the 17th Amendment (1913), senators were chosen by state legislatures, not by direct popular vote.',
      funFact_my:
        '၁၇ ကြိမ်မြောက်ပြင်ဆင်ချက် (၁၉၁၃) မတိုင်မီ အထက်လွှတ်တော်အမတ်များကို ပြည်နယ်လွှတ်တော်များက ရွေးချယ်ခဲ့ပြီး ပြည်သူ့တိုက်ရိုက်မဲ မဟုတ်ခဲ့ပါ။',
      commonMistake_en:
        'A senator represents their entire STATE, not a district. Representatives represent districts.',
      commonMistake_my:
        'အထက်လွှတ်တော်အမတ် ပြည်နယ်တစ်ခုလုံးကို ကိုယ်စားပြုပြီး ခရိုင် မဟုတ်ပါ။ အောက်လွှတ်တော်အမတ်က ခရိုင်ကိုယ်စားပြုသည်။',
    },
  },
  {
    id: 'GOV-S13',
    question_en: 'Why do some states have more Representatives than other states?',
    question_my:
      'အချို့ပြည်နယ် (State) တွေမှာ အခြားပြည်နယ်တွေထက် အောက်လွှတ်တော်အမတ် (Representative) တွေ ဘာကြောင့် ပိုများလဲ။',
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

      mnemonic_en: 'More people = more representatives. Population determines House seats.',
      funFact_en:
        'California has the most representatives (52) while states like Wyoming, Vermont, and Alaska have just 1 each.',
      funFact_my:
        'ကယ်လီဖိုးနီးယားတွင် အောက်လွှတ်တော်အမတ် အများဆုံး (၅၂) ရှိပြီး ဝိုင်ယိုမင်း၊ ဗားမောင့်၊ အလတ်စကားတွင် ၁ ဦးစီသာ ရှိသည်။',
      commonMistake_en:
        'The number of Representatives is based on POPULATION, not land area. Big states by area may have few reps.',
      commonMistake_my: 'အောက်လွှတ်တော်အမတ်အရေအတွက်သည် မြေဧရိယာ မဟုတ်ဘဲ လူဦးရေအပေါ် မူတည်သည်။',
    },
  },
  {
    id: 'GOV-S14',
    question_en: 'We elect a President for how many years?',
    question_my: 'သမ္မတ (President) ကို ဘယ်နှစ်နှစ်အတွက် ရွေးကောက်တင်မြှောက်လဲ။',
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

      mnemonic_en:
        'President = 4 years per term. Maximum 2 terms = 8 years total (22nd Amendment).',
      funFact_en:
        'Before the 22nd Amendment (1951), there was no term limit. FDR served 4 terms (12+ years).',
      funFact_my:
        '၂၂ ကြိမ်မြောက်ပြင်ဆင်ချက် (၁၉၅၁) မတိုင်မီ သက်တမ်းကန့်သတ်ချက် မရှိခဲ့ပါ။ FDR ၄ ကြိမ် တာဝန်ထမ်းဆောင်ခဲ့သည်။',
      commonMistake_en:
        'President serves 4 years per term, not 2 or 6. Senators serve 6, Representatives serve 2.',
      commonMistake_my:
        'သမ္မတ ၄ နှစ်ဖြစ်ပြီး ၂ နှစ် သို့မဟုတ် ၆ နှစ် မဟုတ်ပါ။ အထက်လွှတ်တော် ၆ နှစ်၊ အောက်လွှတ်တော် ၂ နှစ်။',
    },
  },
  {
    id: 'GOV-S15',
    question_en: 'In what month do we vote for President?',
    question_my: 'သမ္မတ (President) ကို ဘယ်လမှာ မဲပေးကြလဲ။',
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

      mnemonic_en: 'November = election month. The Tuesday after the first Monday in November.',
      commonMistake_en: 'Elections are in NOVEMBER, not January. January 20 is Inauguration Day.',
      commonMistake_my:
        'ရွေးကောက်ပွဲ နိုဝင်ဘာတွင်ဖြစ်ပြီး ဇန်နဝါရီ မဟုတ်ပါ။ ဇန်နဝါရီ ၂၀ = မင်္ဂလာခံယူပွဲနေ့။',
      citation: '3 U.S.C. Section 1; 20th Amendment',
    },
  },
  // DYNAMIC: Update answer after presidential elections (every 4 years). Next check: Nov 2028.
  {
    id: 'GOV-S16',
    question_en: 'What is the name of the President of the United States now?',
    question_my: 'အခု အမေရိကန်ပြည်ထောင်စုရဲ့ သမ္မတ (President) အမည်က ဘာလဲ။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'Donald Trump', text_my: 'ဒေါ်နယ် ထရန့် (Donald Trump)' }],
    dynamic: {
      type: 'time',
      field: 'president',
      lastVerified: '2026-02-09',
      updateTrigger: 'Presidential election (every 4 years)',
    },
    answers: [
      { text_en: 'Joe Biden', text_my: 'ဂျိုး ဘိုင်ဒင် (Joe Biden)', correct: false },
      { text_en: 'Donald Trump', text_my: 'ဒေါ်နယ် ထရန့် (Donald Trump)', correct: true },
      {
        text_en: 'Barack Obama',
        text_my: 'ဘရက် အိုဘားမား (Barack Obama)',
        correct: false,
      },
      { text_en: 'Kamala Harris', text_my: 'ကမလာ ဟားရစ် (Kamala Harris)', correct: false },
    ],
    explanation: {
      brief_en:
        'The current President is the person serving at the time of your civics test. This answer changes when a new President takes office. Always check for the most current name before your test.',
      brief_my:
        'လက်ရှိသမ္မတသည် သင့်နိုင်ငံသားအဖြစ် စာမေးပွဲအချိန်တွင် တာဝန်ထမ်းဆောင်နေသူ ဖြစ်သည်။ သမ္မတအသစ် တာဝန်ယူသောအခါ ဒီအဖြေ ပြောင်းလဲသည်။ စာမေးပွဲမတိုင်မီ နောက်ဆုံးအမည်ကို စစ်ဆေးပါ။',
      relatedQuestionIds: ['GOV-S17', 'GOV-S34'],

      mnemonic_en: 'Know the CURRENT President by name. This changes over time.',
      funFact_en:
        'The President is both head of state and head of government — many countries separate these roles.',
      funFact_my:
        'သမ္မတသည် နိုင်ငံတော်အကြီးအကဲနှင့် အစိုးရအကြီးအကဲ နှစ်ခုလုံး ဖြစ်သည် — နိုင်ငံများစွာက ဤရာထူးများကို ခွဲထားသည်။',
      commonMistake_en:
        'This question asks the current President, not a historical one. The answer changes with each election.',
      commonMistake_my:
        'ဤမေးခွန်းသည် လက်ရှိသမ္မတကို မေးပြီး သမိုင်းဝင်သမ္မတ မဟုတ်ပါ။ ရွေးကောက်ပွဲတိုင်း အဖြေပြောင်းသည်။',
      citation: 'Article II, Section 1',
    },
  },
  // DYNAMIC: Update answer after presidential elections (every 4 years). Next check: Nov 2028.
  {
    id: 'GOV-S17',
    question_en: 'What is the name of the Vice President of the United States now?',
    question_my: 'အခု အမေရိကန်ပြည်ထောင်စုရဲ့ ဒုတိယသမ္မတ (Vice President) အမည်က ဘာလဲ။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'JD Vance', text_my: 'ဂျေဒီ ဗန်စ် (JD Vance)' }],
    dynamic: {
      type: 'time',
      field: 'vicePresident',
      lastVerified: '2026-02-09',
      updateTrigger: 'Presidential election (every 4 years)',
    },
    answers: [
      { text_en: 'JD Vance', text_my: 'ဂျေဒီ ဗန်စ် (JD Vance)', correct: true },
      { text_en: 'Mike Pence', text_my: 'မိုက် ပင့်စ် (Mike Pence)', correct: false },
      { text_en: 'Joe Biden', text_my: 'ဂျိုး ဘိုင်ဒင် (Joe Biden)', correct: false },
      { text_en: 'Nancy Pelosi', text_my: 'နန်စီ ပလိုစီ (Nancy Pelosi)', correct: false },
    ],
    explanation: {
      brief_en:
        "The Vice President serves as the President's backup and also serves as President of the Senate. Like the President, this answer changes — check the current name before your test.",
      brief_my:
        'ဒုတိယသမ္မတသည် သမ္မတ၏ အရန်အဖြစ် တာဝန်ထမ်းဆောင်ပြီး အထက်လွှတ်တော်ဥက္ကဋ္ဌအဖြစ်လည်း တာဝန်ယူသည်။ သမ္မတကဲ့သို့ပင် ဒီအဖြေ ပြောင်းလဲနိုင်သည် — စာမေးပွဲမတိုင်မီ စစ်ဆေးပါ။',
      relatedQuestionIds: ['GOV-S16', 'GOV-S18'],

      mnemonic_en: 'Know the CURRENT Vice President by name. VP = #1 in presidential succession.',
      funFact_en:
        'The Vice President is also President of the Senate and can cast tie-breaking votes.',
      funFact_my: 'ဒု-သမ္မတသည် အထက်လွှတ်တော်ဥက္ကဋ္ဌလည်း ဖြစ်ပြီး မဲတူမဲခွဲ ပေးနိုင်သည်။',
      commonMistake_en:
        'This asks the CURRENT VP, not a historical one. The answer changes with each administration.',
      commonMistake_my: 'ဤမေးခွန်းသည် လက်ရှိဒု-သမ္မတကို မေးပြီး သမိုင်းဝင် မဟုတ်ပါ။',
      citation: 'Article II, Section 1; 12th Amendment',
    },
  },
  {
    id: 'GOV-S18',
    question_en: 'If the President can no longer serve, who becomes President?',
    question_my: 'သမ္မတ (President) က တာဝန်မထမ်းဆောင်နိုင်တော့ရင် ဘယ်သူက သမ္မတဖြစ်လာမလဲ။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'the Vice President', text_my: 'ဒုတိယသမ္မတ (Vice President)' }],
    answers: [
      {
        text_en: 'the Vice President',
        text_my: 'ဒုတိယသမ္မတ (Vice President)',
        correct: true,
      },
      {
        text_en: 'the Speaker of the House',
        text_my: 'အောက်လွှတ်တော်ဥက္ကဋ္ဌ (Speaker of the House)',
        correct: false,
      },
      { text_en: 'the Secretary of State', text_my: 'နိုင်ငံခြားရေးဝန်ကြီး', correct: false },
      {
        text_en: 'the Chief Justice',
        text_my: 'တရားသူကြီးချုပ် (Chief Justice)',
        correct: false,
      },
    ],
    explanation: {
      brief_en:
        'If the President cannot serve, the Vice President takes over. This succession is established by the Constitution and has happened nine times in U.S. history.',
      brief_my:
        'သမ္မတ တာဝန်မထမ်းဆောင်နိုင်ပါက ဒုတိယသမ္မတက တာဝန်ယူသည်။ ဒီဆက်ခံမှုကို ဖွဲ့စည်းပုံအခြေခံဥပဒေက သတ်မှတ်ထားပြီး အမေရိကန်သမိုင်းတွင် ကိုးကြိမ် ဖြစ်ပွားခဲ့သည်။',
      citation: 'Article II, Section 1; 25th Amendment',
      relatedQuestionIds: ['GOV-S17', 'GOV-S19'],

      mnemonic_en: 'VP = next in line. Vice President becomes President if President cannot serve.',
      funFact_en: 'Nine VPs have become President due to death or resignation of the President.',
      funFact_my: 'ဒု-သမ္မတ ၉ ဦးသည် သမ္မတ သေဆုံးခြင်း/နှုတ်ထွက်ခြင်းကြောင့် သမ္မတဖြစ်လာခဲ့သည်။',
      commonMistake_en:
        'The VICE PRESIDENT is first in line, not the Speaker of the House. Speaker is second.',
      commonMistake_my:
        'ဒု-သမ္မတ ပထမဖြစ်ပြီး အောက်လွှတ်တော်ဥက္ကဋ္ဌ မဟုတ်ပါ။ ဥက္ကဋ္ဌ ဒုတိယ ဖြစ်သည်။',
    },
  },
  {
    id: 'GOV-S19',
    question_en:
      'If both the President and the Vice President can no longer serve, who becomes President?',
    question_my:
      'သမ္မတ (President) နဲ့ ဒုတိယသမ္မတ (Vice President) နှစ်ယောက်စလုံး တာဝန်မထမ်းဆောင်နိုင်တော့ရင် ဘယ်သူက သမ္မတဖြစ်လာမလဲ။',
    category: 'System of Government',
    studyAnswers: [
      {
        text_en: 'the Speaker of the House',
        text_my: 'အောက်လွှတ်တော်ဥက္ကဋ္ဌ (Speaker of the House)',
      },
    ],
    answers: [
      {
        text_en: 'the Speaker of the House',
        text_my: 'အောက်လွှတ်တော်ဥက္ကဋ္ဌ (Speaker of the House)',
        correct: true,
      },
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

      mnemonic_en: 'Speaker of the House = #2 in succession. After VP, Speaker is next.',
      funFact_en:
        'The Speaker of the House has never actually had to assume the presidency in U.S. history.',
      funFact_my:
        'အမေရိကန်သမိုင်းတွင် အောက်လွှတ်တော်ဥက္ကဋ္ဌ သမ္မတတာဝန် တကယ်ထမ်းဆောင်ရဖူးခြင်း မရှိပါ။',
      commonMistake_en:
        'The SPEAKER becomes President next, NOT the Chief Justice or a Cabinet member.',
      commonMistake_my:
        'အောက်လွှတ်တော်ဥက္ကဋ္ဌ နောက်သမ္မတဖြစ်ပြီး တရားသူကြီးချုပ် သို့မဟုတ် အစိုးရအဖွဲ့ဝင် မဟုတ်ပါ။',
    },
  },
  {
    id: 'GOV-S20',
    question_en: 'Who is the Commander in Chief of the military?',
    question_my: 'စစ်တပ်ရဲ့ ကာကွယ်ရေးဦးစီးချုပ် (Commander in Chief) က ဘယ်သူလဲ။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'the President', text_my: 'သမ္မတ (President)' }],
    answers: [
      { text_en: 'the President', text_my: 'သမ္မတ (President)', correct: true },
      { text_en: 'the Secretary of Defense', text_my: 'ကာကွယ်ရေးဝန်ကြီး', correct: false },
      {
        text_en: 'the Chairman of the Joint Chiefs of Staff',
        text_my: 'ပူးတွဲစစ်ဦးစီးချုပ်များအဖွဲ့ ဥက္ကဋ္ဌ',
        correct: false,
      },
      { text_en: 'the Vice President', text_my: 'ဒုတိယသမ္မတ (Vice President)', correct: false },
    ],
    explanation: {
      brief_en:
        'The President is Commander in Chief of the military. This means civilian (non-military) leadership controls the armed forces, which is a key principle of American democracy.',
      brief_my:
        'သမ္မတ (President) က စစ်တပ်ရဲ့ ကာကွယ်ရေးဦးစီးချုပ် ဖြစ်တယ်။ အရပ်သား (စစ်တပ်မဟုတ်တဲ့) ခေါင်းဆောင်မှုက တပ်မတော်ကို ထိန်းချုပ်တယ်ဆိုတာ အမေရိကန် ဒီမိုကရေစီ (Democracy) ရဲ့ အဓိကမူ တစ်ခုဖြစ်တယ်။',
      citation: 'Article II, Section 2',
      relatedQuestionIds: ['GOV-S03', 'GOV-S16'],

      mnemonic_en:
        'President = Commander in Chief of the military. Civilian control of the armed forces.',
      funFact_en:
        'The President commands the military but CANNOT declare war — only Congress can declare war.',
      funFact_my:
        'သမ္မတ စစ်တပ်ကို ညွှန်ကြားသော်လည်း စစ်ကြေညာခွင့် မရှိ — ကွန်ဂရက်သာ စစ်ကြေညာနိုင်သည်။',
      commonMistake_en:
        'The Commander in Chief is the PRESIDENT (a civilian), not a military general.',
      commonMistake_my: 'စစ်ဦးစီးချုပ်သည် သမ္မတ (အရပ်သား) ဖြစ်ပြီး စစ်ဗိုလ်ချုပ် မဟုတ်ပါ။',
    },
  },
  {
    id: 'GOV-S21',
    question_en: 'Who signs bills to become laws?',
    question_my: 'ဥပဒေ (Law) ဖြစ်လာဖို့ ဥပဒေကြမ်းတွေကို ဘယ်သူက လက်မှတ်ထိုးလဲ။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'the President', text_my: 'သမ္မတ (President)' }],
    answers: [
      { text_en: 'the President', text_my: 'သမ္မတ (President)', correct: true },
      { text_en: 'the Vice President', text_my: 'ဒုတိယသမ္မတ (Vice President)', correct: false },
      {
        text_en: 'the Chief Justice',
        text_my: 'တရားသူကြီးချုပ် (Chief Justice)',
        correct: false,
      },
      {
        text_en: 'the Speaker of the House',
        text_my: 'အောက်လွှတ်တော်ဥက္ကဋ္ဌ (Speaker of the House)',
        correct: false,
      },
    ],
    explanation: {
      brief_en:
        'The President signs bills passed by Congress to make them official laws. If the President disagrees, they can veto (reject) the bill instead.',
      brief_my:
        'သမ္မတသည် ကွန်ဂရက်က အတည်ပြုထားသော ဥပဒေကြမ်းများကို တရားဝင်ဥပဒေ ဖြစ်စေရန် လက်မှတ်ရေးထိုးသည်။ သမ္မတ သဘောမတူပါက ဥပဒေကြမ်းကို ဗီတို (ပယ်ချ) နိုင်သည်။',
      citation: 'Article I, Section 7',
      relatedQuestionIds: ['GOV-S02', 'GOV-S04', 'GOV-S22'],

      mnemonic_en: 'President SIGNS bills into law. Congress WRITES them, President SIGNS them.',
      funFact_en:
        'Presidents can also issue Executive Orders, which have the force of law without Congress.',
      funFact_my:
        'သမ္မတများ ဥပဒေအာဏာရှိသော အုပ်ချုပ်ရေးအမိန့်များလည်း ကွန်ဂရက်မပါဘဲ ထုတ်ပြန်နိုင်သည်။',
      commonMistake_en: 'The President SIGNS bills but does NOT write them. Congress writes laws.',
      commonMistake_my:
        'သမ္မတ ဥပဒေကြမ်းလက်မှတ်ထိုးသည်၊ ရေးသားခြင်း မဟုတ်ပါ။ ကွန်ဂရက်က ဥပဒေရေးသားသည်။',
    },
  },
  {
    id: 'GOV-S22',
    question_en: 'Who vetoes bills?',
    question_my: 'ဥပဒေကြမ်းတွေကို ဘယ်သူက ဗီတိုအာဏာ (Veto) သုံးလဲ။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'the President', text_my: 'သမ္မတ (President)' }],
    answers: [
      { text_en: 'the President', text_my: 'သမ္မတ (President)', correct: true },
      { text_en: 'the Senate', text_my: 'အထက်လွှတ်တော် (Senate)', correct: false },
      {
        text_en: 'the House of Representatives',
        text_my: 'အောက်လွှတ်တော် (House of Representatives)',
        correct: false,
      },
      {
        text_en: 'the Supreme Court',
        text_my: 'တရားလွှတ်တော်ချုပ် (Supreme Court)',
        correct: false,
      },
    ],
    explanation: {
      brief_en:
        'The President can veto (reject) bills passed by Congress. However, Congress can override a veto with a two-thirds vote in both the Senate and the House. This is an example of checks and balances.',
      brief_my:
        'သမ္မတသည် ကွန်ဂရက်က အတည်ပြုထားသော ဥပဒေကြမ်းများကို ဗီတို (ပယ်ချ) နိုင်သည်။ သို့သော် ကွန်ဂရက်က အထက်လွှတ်တော်နှင့် အောက်လွှတ်တော် နှစ်ရပ်စလုံးတွင် သုံးပုံနှစ်ပုံ မဲဖြင့် ဗီတိုကို ကျော်လွှားနိုင်သည်။',
      citation: 'Article I, Section 7',
      relatedQuestionIds: ['GOV-S02', 'GOV-S21'],

      mnemonic_en: 'President VETOES bills (rejects them). Congress can override with 2/3 vote.',
      funFact_en:
        'FDR vetoed more bills than any president — 635 vetoes. Congress overrode only 9.',
      funFact_my:
        'FDR သည် မည်သည့်သမ္မတထက်မဆို ဥပဒေကြမ်းများ အများဆုံးဗီတိုလုပ်ခဲ့သည် — ၆၃၅ ကြိမ်။ ကွန်ဂရက်က ၉ ကြိမ်သာ ကျော်လွန်ခဲ့သည်။',
      commonMistake_en:
        'The PRESIDENT vetoes bills, not Congress. Congress can override a veto with a 2/3 supermajority.',
      commonMistake_my:
        'သမ္မတ ဗီတိုလုပ်ပြီး ကွန်ဂရက် မဟုတ်ပါ။ ကွန်ဂရက်က ၃ ပုံ ၂ ပုံမဲဖြင့် ကျော်လွန်နိုင်သည်။',
    },
  },
  {
    id: 'GOV-S23',
    question_en: "What does the President's Cabinet do?",
    question_my: 'သမ္မတ (President) ရဲ့ အစိုးရအဖွဲ့ (Cabinet) က ဘာလုပ်လဲ။',
    category: 'System of Government',
    studyAnswers: [
      { text_en: 'advises the President', text_my: 'သမ္မတ (President) ကို အကြံပေးတယ်' },
    ],
    answers: [
      {
        text_en: 'advises the President',
        text_my: 'သမ္မတ (President) ကို အကြံပေးတယ်',
        correct: true,
      },
      { text_en: 'makes laws', text_my: 'ဥပဒေ (Law) ပြုတယ်', correct: false },
      { text_en: 'interprets laws', text_my: 'ဥပဒေတွေကို အဓိပ္ပာယ်ဖွင့်ဆိုတယ်', correct: false },
      { text_en: 'commands the military', text_my: 'စစ်တပ်ကို အမိန့်ပေးတယ်', correct: false },
    ],
    explanation: {
      brief_en:
        'The Cabinet is a group of advisors who help the President make decisions. Each Cabinet member leads a federal department (like Defense, Education, or State) and is an expert in that area.',
      brief_my:
        'အစိုးရအဖွဲ့သည် သမ္မတကို ဆုံးဖြတ်ချက်များ ချမှတ်ရာတွင် ကူညီသော အကြံပေးများအဖွဲ့ ဖြစ်သည်။ အစိုးရအဖွဲ့ဝင်တစ်ဦးစီသည် ဖက်ဒရယ်ဝန်ကြီးဌာန (ကာကွယ်ရေး၊ ပညာရေး သို့မဟုတ် နိုင်ငံခြားရေးကဲ့သို့) ကို ဦးဆောင်ပြီး ထိုနယ်ပယ်တွင် ကျွမ်းကျင်သူ ဖြစ်သည်။',
      citation: 'Article II, Section 2',
      relatedQuestionIds: ['GOV-S03', 'GOV-S24'],

      mnemonic_en: 'Cabinet ADVISES the President on policy matters for their department.',
      funFact_en:
        'The Cabinet has grown from 4 members under Washington to 15 executive departments today.',
      funFact_my: 'အစိုးရအဖွဲ့ ဝါရှင်တန်လက်ထက် ၄ ဦးမှ ယနေ့ အုပ်ချုပ်ရေးဌာန ၁၅ ခုသို့ တိုးလာခဲ့သည်။',
      commonMistake_en:
        'Cabinet members ADVISE the President — they do not make final decisions. The President decides.',
      commonMistake_my:
        'အစိုးရအဖွဲ့ဝင်များ သမ္မတကို အကြံပေးသည် — နောက်ဆုံးဆုံးဖြတ်ချက်ချခြင်း မဟုတ်ပါ။',
    },
  },
  {
    id: 'GOV-S24',
    question_en: 'What are two Cabinet-level positions?',
    question_my: 'အစိုးရအဖွဲ့ (Cabinet) အဆင့် ရာထူး ၂ ခုက ဘာတွေလဲ။',
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

      mnemonic_en:
        'Secretary of State, Secretary of Defense, Attorney General, etc. — heads of executive departments.',
      funFact_en:
        'The newest Cabinet department is Homeland Security, created in 2002 after the 9/11 attacks.',
      funFact_my:
        'အသစ်ဆုံး အစိုးရအဖွဲ့ဌာနမှာ ၂၀၀၂ ခုနှစ် 9/11 အကြမ်းဖက်တိုက်ခိုက်မှုနောက် ဖွဲ့စည်းခဲ့သော ပြည်တွင်းလုံခြုံရေး ဖြစ်သည်။',
      commonMistake_en: 'Cabinet members are APPOINTED by the President, not elected by voters.',
      commonMistake_my:
        'အစိုးရအဖွဲ့ဝင်များကို သမ္မတက ခန့်အပ်ပြီး မဲဆန္ဒရှင်များ ရွေးကောက်ခြင်း မဟုတ်ပါ။',
      citation: 'Article II, Section 2',
    },
  },
  {
    id: 'GOV-S25',
    question_en: 'What does the judicial branch do?',
    question_my: 'တရားစီရင်ရေးဌာန (Judicial Branch) က ဘာလုပ်လဲ။',
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

      mnemonic_en:
        'Judicial = JUDGES = reviews and explains laws, decides if laws are constitutional.',
      funFact_en:
        'Hamilton called the judiciary the "least dangerous" branch because it has no sword (military) or purse (budget).',
      funFact_my:
        'ဟာမီလ်တန်က စစ်တပ်/ဘတ်ဂျက်မရှိသဖြင့် တရားစီရင်ရေးကို "အန္တရာယ်အနည်းဆုံးဌာန" ဟု သတ်မှတ်ခဲ့သည်။',
      commonMistake_en:
        'Judicial branch INTERPRETS laws — does NOT write them (legislative) or enforce them (executive).',
      commonMistake_my:
        'တရားစီရင်ရေးဌာန ဥပဒေအဓိပ္ပာယ်ဖွင့်ဆိုသည် — ရေးသားခြင်း (ဥပဒေပြု)/အကောင်အထည်ဖော်ခြင်း (အုပ်ချုပ်ရေး) မဟုတ်ပါ။',
    },
  },
  {
    id: 'GOV-S26',
    question_en: 'What is the highest court in the United States?',
    question_my: 'အမေရိကန်ပြည်ထောင်စုရဲ့ အမြင့်ဆုံးတရားရုံးက ဘာလဲ။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'the Supreme Court', text_my: 'တရားလွှတ်တော်ချုပ် (Supreme Court)' }],
    answers: [
      {
        text_en: 'the Supreme Court',
        text_my: 'တရားလွှတ်တော်ချုပ် (Supreme Court)',
        correct: true,
      },
      {
        text_en: 'the Federal Court',
        text_my: 'ဖက်ဒရယ် (Federal) တရားရုံး',
        correct: false,
      },
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

      mnemonic_en: 'Supreme Court = the HIGHEST court. "Supreme" = the top. No appeal above it.',
      funFact_en:
        'The Supreme Court gets about 7,000 petitions per year but only hears roughly 80 cases — about 1%.',
      funFact_my:
        'တရားရုံးချုပ် တစ်နှစ်လျှင် လျှောက်လွှာ ~၇,၀၀၀ လက်ခံပြီး ~၈၀ အမှုသာ ကြားနာ — ~၁%။',
      commonMistake_en:
        'The Supreme Court is the HIGHEST — there is no appeal above it, not even to the President.',
      commonMistake_my:
        'တရားရုံးချုပ်သည် အမြင့်ဆုံး ဖြစ်ပြီး ၎င်းအထက်တွင် အယူခံ မရှိပါ — သမ္မတထံတောင်မှ မရှိပါ။',
    },
  },
  {
    id: 'GOV-S27',
    question_en: 'How many justices are on the Supreme Court?',
    question_my: 'တရားလွှတ်တော်ချုပ် (Supreme Court) မှာ တရားသူကြီး ဘယ်နှစ်ဦးရှိလဲ။',
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

      mnemonic_en: '9 justices on the Supreme Court. Odd number prevents ties.',
      funFact_en:
        'The number started at 6 in 1789, briefly reached 10 during the Civil War, and has been 9 since 1869.',
      funFact_my:
        '၁၇၈၉ တွင် ၆ ဦးဖြင့်စတင်၊ ပြည်တွင်းစစ်တွင် ခဏ ၁၀ ဦး ဖြစ်ခဲ့ပြီး ၁၈၆၉ ကတည်းက ၉ ဦး ဖြစ်သည်။',
      commonMistake_en:
        'There are 9 justices, not 12 or 7. This number is set by Congress, not the Constitution.',
      commonMistake_my:
        'တရားသူကြီး ၉ ဦးရှိပြီး ၁၂ သို့မဟုတ် ၇ မဟုတ်ပါ။ ဤဂဏန်းကို ဖွဲ့စည်းပုံ မဟုတ်ဘဲ ကွန်ဂရက်က သတ်မှတ်သည်။',
    },
    tricky: true,
  },
  // DYNAMIC: Update on Chief Justice retirement/death/impeachment. No fixed schedule — monitor news.
  {
    id: 'GOV-S28',
    question_en: 'Who is the Chief Justice of the United States now?',
    question_my: 'အခု အမေရိကန်ပြည်ထောင်စုရဲ့ တရားသူကြီးချုပ် (Chief Justice) က ဘယ်သူလဲ။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'John Roberts', text_my: 'ဂျွန် ရောဘတ် (John Roberts)' }],
    dynamic: {
      type: 'time',
      field: 'chiefJustice',
      lastVerified: '2026-02-09',
      updateTrigger: 'Supreme Court appointment (lifetime tenure, changes on retirement/death)',
    },
    answers: [
      { text_en: 'John Roberts', text_my: 'ဂျွန် ရောဘတ် (John Roberts)', correct: true },
      {
        text_en: 'Clarence Thomas',
        text_my: 'ကလာရင့်စ် သောမတ်စ် (Clarence Thomas)',
        correct: false,
      },
      {
        text_en: 'Sonia Sotomayor',
        text_my: 'ဆိုနီယာ ဆိုတိုမေယာ (Sonia Sotomayor)',
        correct: false,
      },
      {
        text_en: 'Ruth Bader Ginsburg',
        text_my: 'ရုသ် ဘေဒါ ဂင်းစ်ဘတ် (Ruth Bader Ginsburg)',
        correct: false,
      },
    ],
    explanation: {
      brief_en:
        'The Chief Justice leads the Supreme Court. Like the President and Vice President, this answer can change — check for the current name before your civics test.',
      brief_my:
        'တရားသူကြီးချုပ်သည် တရားရုံးချုပ်ကို ဦးဆောင်သည်။ သမ္မတနှင့် ဒုတိယသမ္မတကဲ့သို့ပင် ဒီအဖြေ ပြောင်းလဲနိုင်သည် — နိုင်ငံသားအဖြစ် စာမေးပွဲမတိုင်မီ လက်ရှိအမည်ကို စစ်ဆေးပါ။',
      relatedQuestionIds: ['GOV-S26', 'GOV-S27'],

      mnemonic_en: 'Know the CURRENT Chief Justice by name. This is a time-dynamic question.',
      funFact_en:
        'There have been only 17 Chief Justices in all of U.S. history — far fewer than Presidents.',
      funFact_my:
        'အမေရိကန်သမိုင်းတစ်လျှောက်တွင် တရားသူကြီးချုပ် ၁၇ ဦးသာ ရှိခဲ့ပြီး သမ္မတများထက် များစွာ နည်းသည်။',
      commonMistake_en:
        'Chief Justice is appointed for LIFE, not a fixed term. Know the current one by name.',
      commonMistake_my:
        'တရားသူကြီးချုပ်ကို သက်တမ်းကန့်သတ်မရှိဘဲ တစ်သက်တာ ခန့်အပ်သည်။ လက်ရှိအမည်ကို သိရမည်။',
      citation: 'Article III, Section 1',
    },
  },
  {
    id: 'GOV-S29',
    question_en:
      'Under our Constitution, some powers belong to the federal government. What is one power of the federal government?',
    question_my:
      'ငါတို့ရဲ့ ဖွဲ့စည်းပုံအခြေခံဥပဒေ (Constitution) အရ အချို့အာဏာတွေက ဖက်ဒရယ် (Federal) အစိုးရနဲ့ သက်ဆိုင်တယ်။ ဖက်ဒရယ်အစိုးရရဲ့ အာဏာတစ်ခုက ဘာလဲ။',
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

      mnemonic_en: 'Federal powers: print MONEY, declare WAR, create ARMY, make TREATIES.',
      funFact_en:
        'Only the federal government can print money, declare war, and conduct foreign policy.',
      funFact_my:
        'ငွေကြေးရိုက်နှိပ်ခြင်း၊ စစ်ကြေညာခြင်းနှင့် နိုင်ငံခြားရေးမူဝါဒလုပ်ဆောင်ခြင်း ဖက်ဒရယ်အစိုးရသာ လုပ်နိုင်သည်။',
    },
  },
  {
    id: 'GOV-S30',
    question_en:
      'Under our Constitution, some powers belong to the states. What is one power of the states?',
    question_my:
      'ငါတို့ရဲ့ ဖွဲ့စည်းပုံအခြေခံဥပဒေ (Constitution) အရ အချို့အာဏာတွေက ပြည်နယ် (State) တွေနဲ့ သက်ဆိုင်တယ်။ ပြည်နယ်တွေရဲ့ အာဏာတစ်ခုက ဘာလဲ။',
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

      mnemonic_en: "State powers: SCHOOLS, police, LICENSES (driver's), zoning, elections.",
      funFact_en:
        "Education, driver's licenses, and marriage laws are all handled by states, not the federal government.",
      funFact_my:
        'ပညာရေး၊ ယာဉ်မောင်းလိုင်စင်နှင့် လက်ထပ်ဥပဒေများကို ဖက်ဒရယ်အစိုးရ မဟုတ်ဘဲ ပြည်နယ်များက ကိုင်တွယ်သည်။',
      commonMistake_en:
        'States have their own powers separate from the federal government. Education is a STATE power.',
      commonMistake_my:
        'ပြည်နယ်များတွင် ဖက်ဒရယ်အစိုးရနှင့် သီးခြားအာဏာများ ရှိသည်။ ပညာရေးသည် ပြည်နယ်အာဏာ ဖြစ်သည်။',
    },
  },
  // DYNAMIC(state): Governor varies by state. Update state-representatives.json after gubernatorial elections.
  {
    id: 'GOV-S31',
    question_en: 'Who is the Governor of your state now?',
    question_my: 'အခု သင့်ပြည်နယ်ရဲ့ ပြည်နယ်အုပ်ချုပ်ရေးမှူး (Governor) က ဘယ်သူလဲ။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'Gavin Newsom', text_my: 'ဂက်ဗင် နျူးဆုမ် (Gavin Newsom)' }],
    dynamic: {
      type: 'state',
      field: 'governor',
      lastVerified: '2026-02-09',
      updateTrigger: 'State gubernatorial elections (varies by state)',
    },
    answers: [
      { text_en: 'Gavin Newsom', text_my: 'ဂက်ဗင် နျူးဆုမ် (Gavin Newsom)', correct: true },
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

      mnemonic_en:
        'Know YOUR state Governor by name. The Governor is like a "mini-President" for the state.',
      funFact_en:
        'Most governors serve 4-year terms, but Vermont and New Hampshire have 2-year terms.',
      funFact_my:
        'ပြည်နယ်ဝန်ကြီးချုပ်အများစု ၄ နှစ်သက်တမ်းဖြစ်သော်လည်း ဗားမောင့်နှင့် နယူးဟမ်ရှိုင်းယား ၂ နှစ်သက်တမ်း ဖြစ်သည်။',
      commonMistake_en:
        'Governor heads a STATE, not the country. Do not confuse with the President.',
      commonMistake_my:
        'ပြည်နယ်ဝန်ကြီးချုပ် ပြည်နယ်ကိုဦးဆောင်ပြီး နိုင်ငံ မဟုတ်ပါ။ သမ္မတနှင့် မရောထွေးပါနှင့်။',
      citation: 'Tenth Amendment; state constitutions',
    },
  },
  // DYNAMIC(state): Capital varies by state but is effectively static. No regular updates needed.
  {
    id: 'GOV-S32',
    question_en: 'What is the capital of your state?',
    question_my: 'သင့်ပြည်နယ် (State) ရဲ့ မြို့တော်က ဘာလဲ။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'Sacramento', text_my: 'ဆက်ကရမင်တို (Sacramento)' }],
    dynamic: {
      type: 'state',
      field: 'capital',
      lastVerified: '2026-02-09',
      updateTrigger: 'Static - state capitals do not change',
    },
    answers: [
      { text_en: 'Sacramento', text_my: 'ဆက်ကရမင်တို (Sacramento)', correct: true },
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
        'ပြည်နယ်မြို့တော်သည် အကြီးဆုံးမြို့ အမြဲမဟုတ်ပါ။ ဥပမာ — ကယ်လီဖိုးနီးယား၏ မြို့တော်သည် လော့စ်အိန်ဂျယ်လိစ် မဟုတ်ဘဲ ဆက်ကရမင်တို (Sacramento) ဖြစ်သည်။',
      relatedQuestionIds: ['GOV-S31', 'SYM-07'],

      mnemonic_en: 'Know YOUR state capital. It is often NOT the biggest city in the state.',
      funFact_en:
        "California's capital is Sacramento (not LA), New York's is Albany (not NYC), Texas is Austin (not Houston).",
      funFact_my:
        'ကယ်လီဖိုးနီးယား မြို့တော် ဆက်ကရာမင်တို (LA မဟုတ်)၊ နယူးယောက် မြို့တော် အော်လ်ဘနီ (NYC မဟုတ်)။',
      citation: 'State constitutions',
    },
  },
  {
    id: 'GOV-S33',
    question_en: 'What are the two major political parties in the United States?',
    question_my: 'အမေရိကန်ပြည်ထောင်စုရဲ့ အဓိက နိုင်ငံရေးပါတီ (Political Party) ကြီး ၂ ခုက ဘာတွေလဲ။',
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

      mnemonic_en: 'D and R: Democratic Party and Republican Party are the two major parties.',
      funFact_en:
        'The Democratic Party (founded 1828) is the oldest active political party in the world.',
      funFact_my:
        'ဒီမိုကရက်ပါတီ (၁၈၂၈ တည်ထောင်) သည် ကမ္ဘာ့အဟောင်းဆုံး တက်ကြွသောနိုင်ငံရေးပါတီ ဖြစ်သည်။',
      commonMistake_en:
        'The TWO major parties are Democratic and Republican. Third parties exist but rarely win federal elections.',
      commonMistake_my:
        'အဓိကပါတီ ၂ ခု — ဒီမိုကရက်နှင့် ရီပါဘလီကန်။ တတိယပါတီ ရှိသော်လည်း ဖက်ဒရယ်ရွေးကောက်ပွဲတွင် ရှားပါးစွာ အနိုင်ရသည်။',
      citation: 'No constitutional provision; established by practice',
    },
  },
  // DYNAMIC: Update after presidential elections (every 4 years). Next check: Nov 2028.
  {
    id: 'GOV-S34',
    question_en: 'What is the political party of the President now?',
    question_my: 'အခု သမ္မတ (President) ရဲ့ နိုင်ငံရေးပါတီ (Political Party) က ဘာလဲ။',
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

      mnemonic_en: "Know the CURRENT President's party. This is a time-dynamic question.",
      funFact_en:
        'George Washington was the only President who did not belong to any political party.',
      funFact_my:
        'ဂျော့ဝါရှင်တန်သည် မည်သည့်နိုင်ငံရေးပါတီမှ မပါဝင်ခဲ့သော တစ်ခုတည်းသော သမ္မတ ဖြစ်သည်။',
      commonMistake_en: "This asks about the CURRENT President's party, not a historical one.",
      commonMistake_my: 'ဤမေးခွန်းသည် လက်ရှိသမ္မတ၏ ပါတီကို မေးနေပြီး သမိုင်းဝင် မဟုတ်ပါ။',
      citation: 'No constitutional requirement; political practice',
    },
  },
  // DYNAMIC: Update each new Congress (every 2 years) or on vacancy. Next check: Jan 2027.
  {
    id: 'GOV-S35',
    question_en: 'What is the name of the Speaker of the House of Representatives now?',
    question_my: 'အခု အောက်လွှတ်တော်ဥက္ကဋ္ဌ (Speaker of the House) ရဲ့ အမည်က ဘာလဲ။',
    category: 'System of Government',
    studyAnswers: [{ text_en: 'Mike Johnson', text_my: 'မိုက် ဂျွန်ဆင် (Mike Johnson)' }],
    dynamic: {
      type: 'time',
      field: 'speakerOfHouse',
      lastVerified: '2026-02-09',
      updateTrigger: 'Each new Congress (every 2 years) or vacancy',
    },
    answers: [
      { text_en: 'Mike Johnson', text_my: 'မိုက် ဂျွန်ဆင် (Mike Johnson)', correct: true },
      { text_en: 'Nancy Pelosi', text_my: 'နန်စီ ပလိုစီ (Nancy Pelosi)', correct: false },
      {
        text_en: 'Kevin McCarthy',
        text_my: 'ကက်ဗင် မက်ကာသီ (Kevin McCarthy)',
        correct: false,
      },
      { text_en: 'Chuck Schumer', text_my: 'ချတ်ခ် ရှူးမား (Chuck Schumer)', correct: false },
    ],
    explanation: {
      brief_en:
        'The Speaker leads the House of Representatives and is second in line for the presidency (after the Vice President). This answer changes — check the current name before your test.',
      brief_my:
        'အောက်လွှတ်တော်ဥက္ကဋ္ဌသည် အောက်လွှတ်တော်ကို ဦးဆောင်ပြီး သမ္မတရာထူးအတွက် ဒုတိယမြောက် ဆက်ခံသူ (ဒုတိယသမ္မတ ပြီးနောက်) ဖြစ်သည်။ ဒီအဖြေ ပြောင်းလဲနိုင်သည် — စာမေးပွဲမတိုင်မီ စစ်ဆေးပါ။',
      relatedQuestionIds: ['GOV-S19', 'GOV-S05'],

      mnemonic_en:
        'Know the CURRENT Speaker of the House by name. Speaker = leader of House of Representatives.',
      funFact_en:
        'The Speaker is elected by House members and is 2nd in presidential succession after the VP.',
      funFact_my:
        'ဥက္ကဋ္ဌကို အောက်လွှတ်တော်အမတ်များက ရွေးကောက်ပြီး ဒု-သမ္မတပြီးနောက် သမ္မတဆက်ခံရေးတွင် ဒုတိယ ဖြစ်သည်။',
      commonMistake_en:
        'Speaker of the House leads the HOUSE, not the Senate. The VP is President of the Senate.',
      commonMistake_my:
        'အောက်လွှတ်တော်ဥက္ကဋ္ဌသည် အောက်လွှတ်တော်ကို ဦးဆောင်ပြီး အထက်လွှတ်တော် မဟုတ်ပါ။',
      citation: 'Article I, Section 2; Presidential Succession Act of 1947',
    },
  },
];
