import { Question } from '@/types';

export const civicsQuestions: Question[] = [
  // Principles of American Democracy
  {
    id: 1,
    question_en: 'What is the supreme law of the land?',
    question_my: 'နိုင်ငံ၏ အမြင့်ဆုံးဥပဒေကား အဘယ်နည်း။',
    category: 'Principles of American Democracy',
    studyAnswers: [
      { text_en: 'the Constitution', text_my: 'ဖွဲ့စည်းပုံအခြေခံဥပဒေ' }
    ],
    answers: [
      { text_en: 'the Constitution', text_my: 'ဖွဲ့စည်းပုံအခြေခံဥပဒေ', correct: true },
      { text_en: 'the Declaration of Independence', text_my: 'လွတ်လပ်ရေးကြေညာစာတမ်း', correct: false },
      { text_en: 'the Articles of Confederation', text_my: 'ကွန်ဖက်ဒရေးရှင်း ဆောင်းပါးများ', correct: false },
      { text_en: 'the Emancipation Proclamation', text_my: 'လွတ်မြောက်ရေး ကြေညာချက်', correct: false },
    ],
  },
  {
    id: 2,
    question_en: 'What does the Constitution do?',
    question_my: 'ဖွဲ့စည်းပုံအခြေခံဥပဒေက ဘာလုပ်သလဲ။',
    category: 'Principles of American Democracy',
    studyAnswers: [
      { text_en: 'sets up the government', text_my: 'အစိုးရကိုဖွဲ့စည်းတယ်' },
      { text_en: 'defines the government', text_my: 'အစိုးရကို သတ်မှတ်သည်' },
      { text_en: 'protects basic rights of Americans', text_my: 'အမေရိကန်များ၏ အခြေခံအခွင့်အရေးများကို ကာကွယ်ပေးသည်' },
    ],
    answers: [
      { text_en: 'sets up the government', text_my: 'အစိုးရကိုဖွဲ့စည်းတယ်', correct: true },
      { text_en: 'declares our independence', text_my: 'ကျွန်ုပ်တို့၏လွတ်လပ်ရေးကိုကြေငြာသည်', correct: false },
      { text_en: 'defines the role of the states', text_my: 'ပြည်နယ်များ၏အခန်းကဏ္ဍကိုသတ်မှတ်သည်', correct: false },
      { text_en: 'sets the tax rate', text_my: 'အခွန်နှုန်းထားကိုသတ်မှတ်သည်', correct: false },
    ],
  },
  {
    id: 3,
    question_en: 'The idea of self-government is in the first three words of the Constitution. What are these words?',
    question_my: 'ကိုယ်ပိုင်အုပ်ချုပ်ရေးဆိုတဲ့ စိတ်ကူးက ဖွဲ့စည်းပုံအခြေခံဥပဒေရဲ့ ပထမဆုံး စကားလုံးသုံးလုံးမှာ ရှိပါတယ်။ ဒီစကားလုံးတွေက ဘာတွေလဲ။',
    category: 'Principles of American Democracy',
    studyAnswers: [
        { text_en: 'We the People', text_my: 'ငါတို့ပြည်သူတွေ' }
    ],
    answers: [
      { text_en: 'We the People', text_my: 'ငါတို့ပြည်သူတွေ', correct: true },
      { text_en: 'We the States', text_my: 'ငါတို့ပြည်နယ်တွေ', correct: false },
      { text_en: 'Congress shall make', text_my: 'ကွန်ဂရက်ကလုပ်ရမယ်။', correct: false },
      { text_en: 'Life, Liberty, Happiness', text_my: 'ဘဝ၊ လွတ်လပ်မှု၊ ပျော်ရွှင်မှု', correct: false },
    ],
  },
  {
    id: 4,
    question_en: "What is an amendment?",
    question_my: "ပြင်ဆင်ချက်ဆိုတာ ဘာလဲ။",
    category: 'Principles of American Democracy',
    studyAnswers: [
        { text_en: 'a change (to the Constitution)', text_my: 'ဖွဲ့စည်းပုံအခြေခံဥပဒေကို ပြောင်းလဲခြင်း' },
        { text_en: 'an addition (to the Constitution)', text_my: 'ဖွဲ့စည်းပုံအခြေခံဥပဒေတွင် ထပ်လောင်းထည့်ခြင်း' }
    ],
    answers: [
      { text_en: "a change (to the Constitution)", text_my: "ဖွဲ့စည်းပုံအခြေခံဥပဒေကို ပြောင်းလဲခြင်း", correct: true },
      { text_en: "a new law", text_my: "ဥပဒေအသစ်", correct: false },
      { text_en: "a court order", text_my: "တရားရုံးအမိန့်", correct: false },
      { text_en: "a presidential decree", text_my: "သမ္မတအမိန့်", correct: false }
    ]
  },
  {
    id: 5,
    question_en: "What do we call the first ten amendments to the Constitution?",
    question_my: "ဖွဲ့စည်းပုံအခြေခံဥပဒေရဲ့ ပထမဆုံး ပြင်ဆင်ချက် ဆယ်ခုကို ဘယ်လိုခေါ်လဲ။",
    category: 'Principles of American Democracy',
    studyAnswers: [
        { text_en: 'the Bill of Rights', text_my: 'အခွင့်အရေးဥပဒေကြမ်း' }
    ],
    answers: [
      { text_en: "the Bill of Rights", text_my: "အခွင့်အရေးဥပဒေကြမ်း", correct: true },
      { text_en: "the Declaration of Independence", text_my: "လွတ်လပ်ရေးကြေညာစာတမ်း", correct: false },
      { text_en: "the Articles of Confederation", text_my: "ကွန်ဖက်ဒရေးရှင်း ဆောင်းပါးများ", correct: false },
      { text_en: "the Freedom Amendments", text_my: 'လွတ်လပ်ရေး ပြင်ဆင်ချက်များ', correct: false }
    ]
  },
  {
    id: 6,
    question_en: "What is one right or freedom from the First Amendment?",
    question_my: "ပထမပြင်ဆင်ချက်ပါ အခွင့်အရေး ဒါမှမဟုတ် လွတ်လပ်ခွင့်တစ်ခုက ဘာလဲ။",
    category: 'Principles of American Democracy',
    studyAnswers: [
        { text_en: 'speech', text_my: 'မိန့်ခွန်း' },
        { text_en: 'religion', text_my: 'ဘာသာ' },
        { text_en: 'assembly', text_my: 'စည်းဝေး' },
        { text_en: 'press', text_my: 'စာနယ်ဇင်း' },
        { text_en: 'petition the government', text_my: 'အစိုးရကို အသနားခံစာတင်ခြင်း' },
    ],
    answers: [
      { text_en: "Speech", text_my: "မိန့်ခွန်း", correct: true },
      { text_en: "To bear arms", text_my: "လက်နက်ကိုင်ဆောင်ရန်", correct: false },
      { text_en: "Trial by jury", text_my: "ဂျူရီလူကြီးဖြင့် စစ်ဆေးခြင်း။", correct: false },
      { text_en: "To vote", text_my: "မဲပေးရန်", correct: false }
    ]
  },
  {
    id: 7,
    question_en: "How many amendments does the Constitution have?",
    question_my: "ဖွဲ့စည်းပုံအခြေခံဥပဒေမှာ ပြင်ဆင်ချက် ဘယ်လောက်ရှိလဲ။",
    category: 'Principles of American Democracy',
    studyAnswers: [
        { text_en: 'twenty-seven (27)', text_my: 'နှစ်ဆယ့်ခုနစ် (၂၇)' }
    ],
    answers: [
      { text_en: "twenty-seven (27)", text_my: "နှစ်ဆယ့်ခုနစ် (၂၇)", correct: true },
      { text_en: "ten (10)", text_my: "ဆယ် (၁၀)", correct: false },
      { text_en: "fifty (50)", text_my: "ငါးဆယ် (၅၀)", correct: false },
      { text_en: "one hundred (100)", text_my: "တစ်ရာ (၁၀၀)", correct: false }
    ]
  },
  {
    id: 8,
    question_en: "What did the Declaration of Independence do?",
    question_my: "လွတ်လပ်ရေးကြေညာစာတမ်းက ဘာလုပ်ခဲ့လဲ။",
    category: 'Principles of American Democracy',
    studyAnswers: [
        { text_en: 'announced our independence (from Great Britain)', text_my: 'ကျွန်ုပ်တို့၏လွတ်လပ်ရေးကို ကြေညာခဲ့သည် (ဂရိတ်ဗြိတိန်မှ)' },
        { text_en: 'declared our independence (from Great Britain)', text_my: 'ကျွန်ုပ်တို့၏လွတ်လပ်ရေးကို ကြေညာခဲ့သည် (ဂရိတ်ဗြိတိန်မှ)' },
        { text_en: 'said that the United States is free (from Great Britain)', text_my: 'အမေရိကန်ပြည်ထောင်စုသည် လွတ်လပ်သည်ဟု ဆိုသည် (ဂရိတ်ဗြိတိန်မှ)' }
    ],
    answers: [
      { text_en: "announced our independence (from Great Britain)", text_my: "ကျွန်ုပ်တို့၏လွတ်လပ်ရေးကို ကြေညာခဲ့သည် (ဂရိတ်ဗြိတိန်မှ)", correct: true },
      { text_en: "freed the slaves", text_my: "ကျွန်တွေကို လွှတ်ပေးခဲ့တယ်", correct: false },
      { text_en: "gave women the right to vote", text_my: "အမျိုးသမီးတွေကို မဲပေးခွင့်ပေးခဲ့တယ်", correct: false },
      { text_en: "established the U.S. government", text_my: "အမေရိကန်အစိုးရကို တည်ထောင်ခဲ့တယ်", correct: false }
    ]
  },
  {
    id: 9,
    question_en: "What are two rights in the Declaration of Independence?",
    question_my: "လွတ်လပ်ရေးကြေညာစာတမ်းပါ အခွင့်အရေးနှစ်ခုက ဘာတွေလဲ။",
    category: 'Principles of American Democracy',
    studyAnswers: [
        { text_en: 'life', text_my: 'ဘဝ' },
        { text_en: 'liberty', text_my: 'လွတ်လပ်မှု' },
        { text_en: 'pursuit of happiness', text_my: 'ပျော်ရွှင်မှုကိုရှာဖွေခြင်း' }
    ],
    answers: [
      { text_en: "life and liberty", text_my: "ဘဝနှင့်လွတ်လပ်မှု", correct: true },
      { text_en: "freedom of speech and religion", text_my: "လွတ်လပ်စွာပြောဆိုခွင့်နှင့် ကိုးကွယ်ယုံကြည်ခွင့်", correct: false },
      { text_en: "the right to bear arms and the right to a trial", text_my: "လက်နက်ကိုင်ဆောင်ခွင့်နှင့် တရားစီရင်ခွင့်", correct: false },
      { text_en: "the right to vote and the right to work", text_my: "မဲပေးခွင့်နှင့် အလုပ်လုပ်ခွင့်", correct: false }
    ]
  },
  {
    id: 10,
    question_en: "What is freedom of religion?",
    question_my: "ဘာသာရေးလွတ်လပ်ခွင့်ဆိုတာ ဘာလဲ။",
    category: 'Principles of American Democracy',
    studyAnswers: [
        { text_en: 'You can practice any religion, or not practice a religion.', text_my: 'သင်သည် မည်သည့်ဘာသာကိုမဆို ကျင့်သုံးနိုင်သည်၊ သို့မဟုတ် ဘာသာတစ်ခုကို မကျင့်သုံးဘဲနေနိုင်သည်။' }
    ],
    answers: [
      { text_en: "You can practice any religion, or not practice a religion.", text_my: "သင်သည် မည်သည့်ဘာသာကိုမဆို ကျင့်သုံးနိုင်သည်၊ သို့မဟုတ် ဘာသာတစ်ခုကို မကျင့်သုံးဘဲနေနိုင်သည်။", correct: true },
      { text_en: "You must choose a religion.", text_my: "ဘာသာတစ်ခုကို ရွေးချယ်ရမည်။", correct: false },
      { text_en: "The government can establish a national religion.", text_my: "အစိုးရသည် နိုင်ငံတော်ဘာသာကို ထူထောင်နိုင်သည်။", correct: false },
      { text_en: "You can only practice the religion of your parents.", text_my: "မိဘဘာသာကိုသာ ကျင့်သုံးနိုင်သည်။", correct: false }
    ]
  },
  {
    id: 11,
    question_en: "What is the economic system in the United States?",
    question_my: "အမေရိကန်ပြည်ထောင်စု၏ စီးပွားရေးစနစ်ကား အဘယ်နည်း။",
    category: 'Principles of American Democracy',
    studyAnswers: [
        { text_en: 'capitalist economy', text_my: 'အရင်းရှင်စီးပွားရေး' },
        { text_en: 'market economy', text_my: 'စျေးကွက်စီးပွားရေး' }
    ],
    answers: [
      { text_en: "capitalist economy", text_my: "အရင်းရှင်စီးပွားရေး", correct: true },
      { text_en: "socialist economy", text_my: "ဆိုရှယ်လစ်စီးပွားရေး", correct: false },
      { text_en: "communist economy", text_my: "ကွန်မြူနစ်စီးပွားရေး", correct: false },
      { text_en: "barter economy", text_my: "ကုန်စည်ဖလှယ်ရေးစီးပွားရေး", correct: false }
    ]
  },
  {
    id: 12,
    question_en: "What is the “rule of law”?",
    question_my: "“တရားဥပဒေစိုးမိုးရေး” ဆိုတာ ဘာလဲ။",
    category: 'Principles of American Democracy',
    studyAnswers: [
        { text_en: 'Everyone must follow the law.', text_my: 'လူတိုင်း ဥပဒေကို လိုက်နာရမယ်။' },
        { text_en: 'Leaders must obey the law.', text_my: 'ခေါင်းဆောင်များသည် ဥပဒေကို လိုက်နာရမည်။' },
        { text_en: 'Government must obey the law.', text_my: 'အစိုးရသည် ဥပဒေကို လိုက်နာရမည်။' },
        { text_en: 'No one is above the law.', text_my: 'ဘယ်သူမှ ဥပဒေအထက်မှာ မရှိပါဘူး။' },
    ],
    answers: [
      { text_en: "Everyone must follow the law.", text_my: "လူတိုင်း ဥပဒေကို လိုက်နာရမယ်။", correct: true },
      { text_en: "The law only applies to citizens.", text_my: "ဥပဒေသည် နိုင်ငံသားများနှင့်သာ သက်ဆိုင်သည်။", correct: false },
      { text_en: "The government is above the law.", text_my: "အစိုးရသည် ဥပဒေအထက်တွင် ရှိသည်။", correct: false },
      { text_en: "Laws can be ignored if you disagree with them.", text_my: "သင်သဘောမတူပါက ဥပဒေများကို လျစ်လျူရှုနိုင်သည်။", correct: false }
    ]
  },
  // System of Government
  {
    id: 13,
    question_en: "Name one branch or part of the government.",
    question_my: "အစိုးရ၏ ဌာနခွဲ သို့မဟုတ် အစိတ်အပိုင်းတစ်ခုကို အမည်ပေးပါ။",
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
      { text_en: "Congress", text_my: "ကွန်ဂရက်", correct: true },
      { text_en: "The States", text_my: "ပြည်နယ်များ", correct: false },
      { text_en: "The Military", text_my: "စစ်တပ်", correct: false },
      { text_en: "The Treasury", text_my: "ဘဏ္ဍာရေးဝန်ကြီးဌာန", correct: false }
    ]
  },
  {
    id: 14,
    question_en: "What stops one branch of government from becoming too powerful?",
    question_my: "အစိုးရဌာနခွဲတစ်ခု အလွန်အင်အားကြီးမားလာခြင်းကို အဘယ်အရာက တားဆီးသနည်း။",
    category: 'System of Government',
    studyAnswers: [
        { text_en: 'checks and balances', text_my: 'စစ်ဆေးမှုများနှင့် ဟန်ချက်ညီမှုများ' },
        { text_en: 'separation of powers', text_my: 'အာဏာခွဲဝေမှု' }
    ],
    answers: [
      { text_en: "checks and balances", text_my: "စစ်ဆေးမှုများနှင့် ဟန်ချက်ညီမှုများ", correct: true },
      { text_en: "the President", text_my: "သမ္မတ", correct: false },
      { text_en: "the people", text_my: "ပြည်သူတွေ", correct: false },
      { text_en: "the states", text_my: "ပြည်နယ်များ", correct: false }
    ]
  },
  {
    id: 15,
    question_en: "Who is in charge of the executive branch?",
    question_my: "အမှုဆောင်ဌာနကို ဘယ်သူက တာဝန်ယူသလဲ။",
    category: 'System of Government',
    studyAnswers: [
        { text_en: 'the President', text_my: 'သမ္မတ' }
    ],
    answers: [
      { text_en: "the President", text_my: "သမ္မတ", correct: true },
      { text_en: "the Chief Justice", text_my: "တရားသူကြီးချုပ်", correct: false },
      { text_en: "the Speaker of the House", text_my: "အောက်လွှတ်တော်ဥက္ကဋ္ဌ", correct: false },
      { text_en: "the Senate Majority Leader", text_my: "အထက်လွှတ်တော်အမတ်အများစုခေါင်းဆောင်", correct: false }
    ]
  },
  {
    id: 16,
    question_en: "Who makes federal laws?",
    question_my: "ဖက်ဒရယ်ဥပဒေတွေကို ဘယ်သူက ပြုလုပ်တာလဲ။",
    category: 'System of Government',
    studyAnswers: [
        { text_en: 'Congress', text_my: 'ကွန်ဂရက်' },
        { text_en: 'Senate and House (of Representatives)', text_my: 'အထက်လွှတ်တော်နှင့် အောက်လွှတ်တော် (ကိုယ်စားလှယ်များ)' },
        { text_en: '(U.S. or national) legislature', text_my: '(အမေရိကန် သို့မဟုတ် နိုင်ငံတော်) ဥပဒေပြုလွှတ်တော်' }
    ],
    answers: [
      { text_en: "Congress", text_my: "ကွန်ဂရက်", correct: true },
      { text_en: "the Supreme Court", text_my: "တရားရုံးချုပ်", correct: false },
      { text_en: "the President", text_my: "သမ္မတ", correct: false },
      { text_en: "the states", text_my: "ပြည်နယ်များ", correct: false }
    ]
  },
  {
    id: 17,
    question_en: "What are the two parts of the U.S. Congress?",
    question_my: "အမေရိကန်ကွန်ဂရက်ရဲ့ အစိတ်အပိုင်းနှစ်ခုက ဘာတွေလဲ။",
    category: 'System of Government',
    studyAnswers: [
        { text_en: 'the Senate and House (of Representatives)', text_my: 'အထက်လွှတ်တော်နှင့် အောက်လွှတ်တော် (ကိုယ်စားလှယ်များ)' }
    ],
    answers: [
      { text_en: "the Senate and House (of Representatives)", text_my: "အထက်လွှတ်တော်နှင့် အောက်လွှတ်တော် (ကိုယ်စားလှယ်များ)", correct: true },
      { text_en: "the President and the Cabinet", text_my: "သမ္မတနှင့် အစိုးရအဖွဲ့", correct: false },
      { text_en: "the Supreme Court and the federal courts", text_my: "တရားရုံးချုပ်နှင့် ဖက်ဒရယ်တရားရုံးများ", correct: false },
      { text_en: "the Democratic and Republican parties", text_my: "ဒီမိုကရက်တစ်နှင့် ရီပတ်ဘလစ်ကန်ပါတီများ", correct: false }
    ]
  },
  {
    id: 18,
    question_en: "How many U.S. Senators are there?",
    question_my: "အမေရိကန် အထက်လွှတ်တော်အမတ် ဘယ်လောက်ရှိလဲ။",
    category: 'System of Government',
    studyAnswers: [
        { text_en: 'one hundred (100)', text_my: 'တစ်ရာ (၁၀၀)' }
    ],
    answers: [
      { text_en: "one hundred (100)", text_my: "တစ်ရာ (၁၀၀)", correct: true },
      { text_en: "fifty (50)", text_my: "ငါးဆယ် (၅၀)", correct: false },
      { text_en: "four hundred thirty-five (435)", text_my: "လေးရာ့သုံးဆယ့်ငါး (၄၃၅)", correct: false },
      { text_en: "two for each state", text_my: 'ပြည်နယ်တစ်ခုစီအတွက် နှစ်ယောက်', correct: false }
    ]
  },
  {
    id: 19,
    question_en: "We elect a U.S. Senator for how many years?",
    question_my: "အမေရိကန် အထက်လွှတ်တော်အမတ်ကို ဘယ်နှစ်နှစ်အတွက် ရွေးကောက်တင်မြှောက်ပါသလဲ။",
    category: 'System of Government',
    studyAnswers: [
        { text_en: 'six (6)', text_my: 'ခြောက် (၆)' }
    ],
    answers: [
      { text_en: "six (6)", text_my: "ခြောက် (၆)", correct: true },
      { text_en: "two (2)", text_my: "နှစ် (၂)", correct: false },
      { text_en: "four (4)", text_my: "လေး (၄)", correct: false },
      { text_en: "eight (8)", text_my: "ရှစ် (၈)", correct: false }
    ]
  },
  {
    id: 20,
    question_en: "Who is one of your state’s U.S. Senators now?",
    question_my: "ယခု သင့်ပြည်နယ်၏ အမေရိကန် အထက်လွှတ်တော်အမတ်တစ်ဦးက မည်သူနည်း။",
    category: 'System of Government',
    studyAnswers: [
        { text_en: 'Answers will vary.', text_my: 'အဖြေများ ကွဲပြားပါမည်။' }
    ],
    answers: [
      { text_en: "Answers will vary.", text_my: "အဖြေများ ကွဲပြားပါမည်။", correct: true },
      { text_en: "The Governor of your state", text_my: "သင်၏ပြည်နယ်အုပ်ချုပ်ရေးမှူး", correct: false },
      { text_en: "The state's Attorney General", text_my: "ပြည်နယ်၏ ရှေ့နေချုပ်", correct: false },
      { text_en: "The Speaker of the State House", text_my: "ပြည်နယ်လွှတ်တော်ဥက္ကဋ္ဌ", correct: false }
    ]
  },
  {
    id: 21,
    question_en: "The House of Representatives has how many voting members?",
    question_my: "အောက်လွှတ်တော်တွင် မဲပေးခွင့်ရှိသူ ဘယ်နှစ်ဦးရှိပါသလဲ။",
    category: 'System of Government',
    studyAnswers: [
        { text_en: 'four hundred thirty-five (435)', text_my: 'လေးရာ့သုံးဆယ့်ငါး (၄၃၅)' }
    ],
    answers: [
      { text_en: "four hundred thirty-five (435)", text_my: "လေးရာ့သုံးဆယ့်ငါး (၄၃၅)", correct: true },
      { text_en: "one hundred (100)", text_my: "တစ်ရာ (၁၀၀)", correct: false },
      { text_en: "fifty (50)", text_my: "ငါးဆယ် (၅၀)", correct: false },
      { text_en: "two hundred seventy (270)", text_my: "နှစ်ရာ့ခုနစ်ဆယ် (၂၇၀)", correct: false }
    ]
  },
  {
    id: 22,
    question_en: "We elect a U.S. Representative for how many years?",
    question_my: "အမေရိကန် ကိုယ်စားလှယ်တစ်ဦးကို ဘယ်နှစ်နှစ်အတွက် ရွေးကောက်တင်မြှောက်ပါသလဲ။",
    category: 'System of Government',
    studyAnswers: [
        { text_en: 'two (2)', text_my: 'နှစ် (၂)' }
    ],
    answers: [
      { text_en: "two (2)", text_my: "နှစ် (၂)", correct: true },
      { text_en: "four (4)", text_my: "လေး (၄)", correct: false },
      { text_en: "six (6)", text_my: "ခြောက် (၆)", correct: false },
      { text_en: "there is no term limit", text_my: 'သက်တမ်းကန့်သတ်ချက်မရှိပါ', correct: false }
    ]
  },
  {
    id: 23,
    question_en: "Name your U.S. Representative.",
    question_my: "သင်၏ အမေရိကန် ကိုယ်စားလှယ်ကို အမည်ပေးပါ။",
    category: 'System of Government',
    studyAnswers: [
        { text_en: 'Answers will vary.', text_my: 'အဖြေများ ကွဲပြားပါမည်။' }
    ],
    answers: [
      { text_en: "Answers will vary.", text_my: "အဖြေများ ကွဲပြားပါမည်။", correct: true },
      { text_en: "The Speaker of the House", text_my: "အောက်လွှတ်တော်ဥက္ကဋ္ဌ", correct: false },
      { text_en: "The Governor of your state", text_my: "သင်၏ပြည်နယ်အုပ်ချုပ်ရေးမှူး", correct: false },
      { text_en: "The Senator from your district", text_my: "သင်၏ခရိုင်မှ အထက်လွှတ်တော်အမတ်", correct: false }
    ]
  },
  {
    id: 24,
    question_en: "Who does a U.S. Senator represent?",
    question_my: "အမေရိကန် အထက်လွှတ်တော်အမတ်သည် မည်သူ့ကို ကိုယ်စားပြုသနည်း။",
    category: 'System of Government',
    studyAnswers: [
        { text_en: 'all people of the state', text_my: 'ပြည်နယ်၏ ပြည်သူအားလုံး' }
    ],
    answers: [
      { text_en: "all people of the state", text_my: "ပြည်နယ်၏ ပြည်သူအားလုံး", correct: true },
      { text_en: "only the people in their district", text_my: "သူတို့ခရိုင်ကလူတွေပဲ", correct: false },
      { text_en: "only the people who voted for them", text_my: "သူတို့ကိုမဲပေးတဲ့လူတွေပဲ", correct: false },
      { text_en: "the state legislature", text_my: "ပြည်နယ်ဥပဒေပြုလွှတ်တော်", correct: false }
    ]
  },
  {
    id: 25,
    question_en: "Why do some states have more Representatives than other states?",
    question_my: "အချို့ပြည်နယ်များတွင် အခြားပြည်နယ်များထက် ကိုယ်စားလှယ်များ အဘယ်ကြောင့် ပိုများသနည်း။",
    category: 'System of Government',
    studyAnswers: [
        { text_en: '(because of) the state’s population', text_my: 'ပြည်နယ်၏ လူဦးရေကြောင့်' },
        { text_en: '(because) they have more people', text_my: 'သူတို့မှာ လူပိုများလို့' },
        { text_en: '(because) some states have more people', text_my: 'အချို့ပြည်နယ်များတွင် လူပိုများသောကြောင့်' }
    ],
    answers: [
      { text_en: "(because of) the state's population", text_my: "ပြည်နယ်၏ လူဦးရေကြောင့်", correct: true },
      { text_en: "(because of) the state's land area", text_my: "ပြည်နယ်၏ မြေဧရိယာကြောင့်", correct: false },
      { text_en: "(because of) the state's wealth", text_my: "ပြည်နယ်၏ ကြွယ်ဝမှုကြောင့်", correct: false },
      { text_en: "(because) the Constitution says so", text_my: "ဖွဲ့စည်းပုံအခြေခံဥပဒေက ဒီလိုပြောလို့", correct: false }
    ]
  },
  {
    id: 26,
    question_en: "We elect a President for how many years?",
    question_my: "သမ္မတကို ဘယ်နှစ်နှစ်အတွက် ရွေးကောက်တင်မြှောက်ပါသလဲ။",
    category: 'System of Government',
    studyAnswers: [
        { text_en: 'four (4)', text_my: 'လေး (၄)' }
    ],
    answers: [
      { text_en: "four (4)", text_my: "လေး (၄)", correct: true },
      { text_en: "two (2)", text_my: "နှစ် (၂)", correct: false },
      { text_en: "six (6)", text_my: "ခြောက် (၆)", correct: false },
      { text_en: "eight (8)", text_my: "ရှစ် (၈)", correct: false }
    ]
  },
  {
    id: 27,
    question_en: "In what month do we vote for President?",
    question_my: "သမ္မတကို ဘယ်လမှာ မဲပေးကြလဲ။",
    category: 'System of Government',
    studyAnswers: [
        { text_en: 'November', text_my: 'နိုဝင်ဘာ' }
    ],
    answers: [
      { text_en: "November", text_my: "နိုဝင်ဘာ", correct: true },
      { text_en: "January", text_my: "ဇန်နဝါရီ", correct: false },
      { text_en: "October", text_my: "အောက်တိုဘာ", correct: false },
      { text_en: "July", text_my: "ဇူလိုင်", correct: false }
    ]
  },
  {
    id: 28,
    question_en: "What is the name of the President of the United States now?",
    question_my: "ယခု အမေရိကန်ပြည်ထောင်စု၏ သမ္မတအမည်ကား အဘယ်နည်း။",
    category: 'System of Government',
    studyAnswers: [
        { text_en: 'Joe Biden', text_my: 'ဂျိုးဘိုင်ဒင်' }
    ],
    answers: [
      { text_en: "Joe Biden", text_my: "ဂျိုးဘိုင်ဒင်", correct: true },
      { text_en: "Donald Trump", text_my: "ဒေါ်နယ်ထရန့်", correct: false },
      { text_en: "Barack Obama", text_my: "ဘားရက်အိုဘားမား", correct: false },
      { text_en: "Kamala Harris", text_my: "ကမလာ ဟားရစ်", correct: false }
    ]
  },
  {
    id: 29,
    question_en: "What is the name of the Vice President of the United States now?",
    question_my: "ယခု အမေရိကန်ပြည်ထောင်စု၏ ဒုတိယသမ္မတအမည်ကား အဘယ်နည်း။",
    category: 'System of Government',
    studyAnswers: [
        { text_en: 'Kamala Harris', text_my: 'ကမလာ ဟားရစ်' }
    ],
    answers: [
      { text_en: "Kamala Harris", text_my: "ကမလာ ဟားရစ်", correct: true },
      { text_en: "Mike Pence", text_my: "မိုက်ပင့်", correct: false },
      { text_en: "Joe Biden", text_my: "ဂျိုးဘိုင်ဒင်", correct: false },
      { text_en: "Nancy Pelosi", text_my: "နန်စီ ပလိုစီ", correct: false }
    ]
  },
  {
    id: 30,
    question_en: "If the President can no longer serve, who becomes President?",
    question_my: "သမ္မတက တာဝန်မထမ်းဆောင်နိုင်တော့ရင် ဘယ်သူက သမ္မတဖြစ်လာမလဲ။",
    category: 'System of Government',
    studyAnswers: [
        { text_en: 'the Vice President', text_my: 'ဒုတိယသမ္မတ' }
    ],
    answers: [
      { text_en: "the Vice President", text_my: "ဒုတိယသမ္မတ", correct: true },
      { text_en: "the Speaker of the House", text_my: "အောက်လွှတ်တော်ဥက္ကဋ္ဌ", correct: false },
      { text_en: "the Secretary of State", text_my: "နိုင်ငံခြားရေးဝန်ကြီး", correct: false },
      { text_en: "the Chief Justice", text_my: "တရားသူကြီးချုပ်", correct: false }
    ]
  },
  {
    id: 31,
    question_en: "If both the President and the Vice President can no longer serve, who becomes President?",
    question_my: "သမ္မတနဲ့ ဒုတိယသမ္မတ နှစ်ယောက်စလုံး တာဝန်မထမ်းဆောင်နိုင်တော့ရင် ဘယ်သူက သမ္မတဖြစ်လာမလဲ။",
    category: 'System of Government',
    studyAnswers: [
        { text_en: 'the Speaker of the House', text_my: 'အောက်လွှတ်တော်ဥက္ကဋ္ဌ' }
    ],
    answers: [
      { text_en: "the Speaker of the House", text_my: "အောက်လွှတ်တော်ဥက္ကဋ္ဌ", correct: true },
      { text_en: "the President pro tempore", text_my: "ယာယီသမ္မတ", correct: false },
      { text_en: "the Secretary of State", text_my: "နိုင်ငံခြားရေးဝန်ကြီး", correct: false },
      { text_en: "the Chief Justice", text_my: "တရားသူကြီးချုပ်", correct: false }
    ]
  },
  {
    id: 32,
    question_en: "Who is the Commander in Chief of the military?",
    question_my: "စစ်တပ်၏ ကာကွယ်ရေးဦးစီးချုပ်သည် မည်သူနည်း။",
    category: 'System of Government',
    studyAnswers: [
        { text_en: 'the President', text_my: 'သမ္မတ' }
    ],
    answers: [
      { text_en: "the President", text_my: "သမ္မတ", correct: true },
      { text_en: "the Secretary of Defense", text_my: "ကာကွယ်ရေးဝန်ကြီး", correct: false },
      { text_en: "the Chairman of the Joint Chiefs of Staff", text_my: "ပူးတွဲစစ်ဦးစီးချုပ်များအဖွဲ့ ဥက္ကဋ္ဌ", correct: false },
      { text_en: "the Vice President", text_my: "ဒုတိယသမ္မတ", correct: false }
    ]
  },
  {
    id: 33,
    question_en: "Who signs bills to become laws?",
    question_my: "ဥပဒေဖြစ်လာရန် ဥပဒေကြမ်းများကို မည်သူက လက်မှတ်ရေးထိုးသနည်း။",
    category: 'System of Government',
    studyAnswers: [
        { text_en: 'the President', text_my: 'သမ္မတ' }
    ],
    answers: [
      { text_en: "the President", text_my: "သမ္မတ", correct: true },
      { text_en: "the Vice President", text_my: "ဒုတိယသမ္မတ", correct: false },
      { text_en: "the Chief Justice", text_my: "တရားသူကြီးချုပ်", correct: false },
      { text_en: "the Speaker of the House", text_my: "အောက်လွှတ်တော်ဥက္ကဋ္ဌ", correct: false }
    ]
  },
  {
    id: 34,
    question_en: "Who vetoes bills?",
    question_my: "ဥပဒေကြမ်းများကို မည်သူက ဗီတိုအာဏာသုံးသနည်း။",
    category: 'System of Government',
    studyAnswers: [
        { text_en: 'the President', text_my: 'သမ္မတ' }
    ],
    answers: [
      { text_en: "the President", text_my: "သမ္မတ", correct: true },
      { text_en: "the Senate", text_my: "အထက်လွှတ်တော်", correct: false },
      { text_en: "the House of Representatives", text_my: "အောက်လွှတ်တော်", correct: false },
      { text_en: "the Supreme Court", text_my: "တရားရုံးချုပ်", correct: false }
    ]
  },
  {
    id: 35,
    question_en: "What does the President’s Cabinet do?",
    question_my: "သမ္မတ၏ အစိုးရအဖွဲ့က ဘာလုပ်သလဲ။",
    category: 'System of Government',
    studyAnswers: [
        { text_en: 'advises the President', text_my: 'သမ္မတကို အကြံပေးသည်' }
    ],
    answers: [
      { text_en: "advises the President", text_my: "သမ္မတကို အကြံပေးသည်", correct: true },
      { text_en: "makes laws", text_my: "ဥပဒေပြုသည်", correct: false },
      { text_en: "interprets laws", text_my: "ဥပဒေများကို အဓိပ္ပာယ်ဖွင့်ဆိုသည်", correct: false },
      { text_en: "commands the military", text_my: "စစ်တပ်ကို အမိန့်ပေးသည်", correct: false }
    ]
  },
  {
    id: 36,
    question_en: "What are two Cabinet-level positions?",
    question_my: "အစိုးရအဖွဲ့အဆင့် ရာထူးနှစ်ခုက ဘာတွေလဲ။",
    category: 'System of Government',
    studyAnswers: [
        { text_en: 'Secretary of Agriculture', text_my: 'စိုက်ပျိုးရေးဝန်ကြီး' },
        { text_en: 'Secretary of Commerce', text_my: 'ကူးသန်းရောင်းဝယ်ရေးဝန်ကြီး' },
        { text_en: 'Secretary of Defense', text_my: 'ကာကွယ်ရေးဝန်ကြီး' },
        { text_en: 'Secretary of Education', text_my: 'ပညာရေးဝန်ကြီး' },
        { text_en: 'Secretary of Energy', text_my: 'စွမ်းအင်ဝန်ကြီး' },
        { text_en: 'Secretary of Health and Human Services', text_my: 'ကျန်းမာရေးနှင့် လူသားဝန်ဆောင်မှုဝန်ကြီး' },
        { text_en: 'Secretary of Homeland Security', text_my: 'ပြည်တွင်းလုံခြုံရေးဝန်ကြီး' },
        { text_en: 'Secretary of Housing and Urban Development', text_my: 'အိမ်ရာနှင့် မြို့ပြဖွံ့ဖြိုးရေးဝန်ကြီး' },
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
      { text_en: "Secretary of State and Secretary of Labor", text_my: "နိုင်ငံခြားရေးဝန်ကြီးနှင့် အလုပ်သမားရေးရာဝန်ကြီး", correct: true },
      { text_en: "Chief Justice and Speaker of the House", text_my: "တရားသူကြီးချုပ်နှင့် အောက်လွှတ်တော်ဥက္ကဋ္ဌ", correct: false },
      { text_en: "Senator and Representative", text_my: "အထက်လွှတ်တော်အမတ်နှင့် ကိုယ်စားလှယ်", correct: false },
      { text_en: "Governor and Mayor", text_my: "အုပ်ချုပ်ရေးမှူးနှင့် မြို့တော်ဝန်", correct: false }
    ]
  },
  {
    id: 37,
    question_en: "What does the judicial branch do?",
    question_my: "တရားစီရင်ရေးဌာနက ဘာလုပ်သလဲ။",
    category: 'System of Government',
    studyAnswers: [
        { text_en: 'reviews laws', text_my: 'ဥပဒေများကို ပြန်လည်သုံးသပ်သည်' },
        { text_en: 'explains laws', text_my: 'ဥပဒေများကို ရှင်းပြသည်' },
        { text_en: 'resolves disputes (disagreements)', text_my: 'အငြင်းပွားမှုများကို ဖြေရှင်းသည်' },
        { text_en: 'decides if a law goes against the Constitution', text_my: 'ဥပဒေတစ်ခုသည် ဖွဲ့စည်းပုံအခြေခံဥပဒေနှင့် ဆန့်ကျင်ခြင်း ရှိ၊ မရှိ ဆုံးဖြတ်သည်' },
    ],
    answers: [
      { text_en: "reviews laws", text_my: "ဥပဒေများကို ပြန်လည်သုံးသပ်သည်", correct: true },
      { text_en: "makes laws", text_my: "ဥပဒေပြုသည်", correct: false },
      { text_en: "enforces laws", text_my: "ဥပဒေများကို အာဏာတည်စေသည်", correct: false },
      { text_en: "vetoes bills", text_my: "ဥပဒေကြမ်းများကို ဗီတိုအာဏာသုံးသည်", correct: false }
    ]
  },
  {
    id: 38,
    question_en: "What is the highest court in the United States?",
    question_my: "အမေရိကန်ပြည်ထောင်စု၏ အမြင့်ဆုံးတရားရုံးကား အဘယ်နည်း။",
    category: 'System of Government',
    studyAnswers: [
        { text_en: 'the Supreme Court', text_my: 'တရားရုံးချုပ်' }
    ],
    answers: [
      { text_en: "the Supreme Court", text_my: "တရားရုံးချုပ်", correct: true },
      { text_en: "the Federal Court", text_my: "ဖက်ဒရယ်တရားရုံး", correct: false },
      { text_en: "the Superior Court", text_my: "အထက်တရားရုံး", correct: false },
      { text_en: "the International Court of Justice", text_my: "အပြည်ပြည်ဆိုင်ရာတရားရုံး", correct: false }
    ]
  },
  {
    id: 39,
    question_en: "How many justices are on the Supreme Court?",
    question_my: "တရားရုံးချုပ်တွင် တရားသူကြီး ဘယ်နှစ်ဦးရှိပါသလဲ။",
    category: 'System of Government',
    studyAnswers: [
        { text_en: 'nine (9)', text_my: 'ကိုး (၉)' }
    ],
    answers: [
      { text_en: "nine (9)", text_my: "ကိုး (၉)", correct: true },
      { text_en: "seven (7)", text_my: "ခုနစ် (၇)", correct: false },
      { text_en: "eleven (11)", text_my: "တစ်ဆယ့်တစ် (၁၁)", correct: false },
      { text_en: "thirteen (13)", text_my: "တစ်ဆယ့်သုံး (၁၃)", correct: false }
    ]
  },
  {
    id: 40,
    question_en: "Who is the Chief Justice of the United States now?",
    question_my: "ယခု အမေရိကန်ပြည်ထောင်စု၏ တရားသူကြီးချုပ်သည် မည်သူနည်း။",
    category: 'System of Government',
    studyAnswers: [
        { text_en: 'John Roberts', text_my: 'ဂျွန် ရောဘတ်' }
    ],
    answers: [
      { text_en: "John Roberts", text_my: "ဂျွန် ရောဘတ်", correct: true },
      { text_en: "Clarence Thomas", text_my: "ကလာရင့် သောမတ်", correct: false },
      { text_en: "Sonia Sotomayor", text_my: "ဆိုနီယာ ဆိုတိုမေယာ", correct: false },
      { text_en: "Ruth Bader Ginsburg", text_my: "ရုသ် ဘေဒါ ဂင်စဘာ့ဂ်", correct: false }
    ]
  },
  {
    id: 41,
    question_en: "Under our Constitution, some powers belong to the federal government. What is one power of the federal government?",
    question_my: "ကျွန်ုပ်တို့၏ ဖွဲ့စည်းပုံအခြေခံဥပဒေအရ အချို့သော အာဏာများသည် ဖက်ဒရယ်အစိုးရနှင့် သက်ဆိုင်သည်။ ဖက်ဒရယ်အစိုးရ၏ အာဏာတစ်ခုကား အဘယ်နည်း။",
    category: 'System of Government',
    studyAnswers: [
        { text_en: 'to print money', text_my: 'ငွေစက္ကူရိုက်နှိပ်ရန်' },
        { text_en: 'to declare war', text_my: 'စစ်ကြေညာရန်' },
        { text_en: 'to create an army', text_my: 'စစ်တပ်ဖွဲ့စည်းရန်' },
        { text_en: 'to make treaties', text_my: 'စာချုပ်များချုပ်ဆိုရန်' },
    ],
    answers: [
      { text_en: "to print money", text_my: "ငွေစက္ကူရိုက်နှိပ်ရန်", correct: true },
      { text_en: "to provide schooling and education", text_my: "ကျောင်းပညာရေးနှင့် ပညာရေးကို ပံ့ပိုးပေးရန်", correct: false },
      { text_en: "to provide protection (police)", text_my: "အကာအကွယ်ပေးရန် (ရဲ)", correct: false },
      { text_en: "to issue driver's licenses", text_my: "ယာဉ်မောင်းလိုင်စင်ထုတ်ပေးရန်", correct: false }
    ]
  },
  {
    id: 42,
    question_en: "Under our Constitution, some powers belong to the states. What is one power of the states?",
    question_my: "ကျွန်ုပ်တို့၏ ဖွဲ့စည်းပုံအခြေခံဥပဒေအရ အချို့သော အာဏာများသည် ပြည်နယ်များနှင့် သက်ဆိုင်သည်။ ပြည်နယ်များ၏ အာဏာတစ်ခုကား အဘယ်နည်း။",
    category: 'System of Government',
    studyAnswers: [
        { text_en: 'provide schooling and education', text_my: 'ကျောင်းပညာရေးနှင့် ပညာရေးကို ပံ့ပိုးပေးသည်' },
        { text_en: 'provide protection (police)', text_my: 'အကာအကွယ်ပေးသည် (ရဲ)' },
        { text_en: 'provide safety (fire departments)', text_my: 'ဘေးကင်းရေး (မီးသတ်ဌာနများ) ပံ့ပိုးပေးသည်' },
        { text_en: 'give a driver’s license', text_my: 'ယာဉ်မောင်းလိုင်စင်ပေးသည်' },
        { text_en: 'approve zoning and land use', text_my: 'ဇုန်သတ်မှတ်ခြင်းနှင့် မြေအသုံးချမှု အတည်ပြုသည်' },
    ],
    answers: [
      { text_en: "give a driver's license", text_my: "ယာဉ်မောင်းလိုင်စင်ပေးသည်", correct: true },
      { text_en: "to print money", text_my: "ငွေစက္ကူရိုက်နှိပ်ရန်", correct: false },
      { text_en: "to declare war", text_my: "စစ်ကြေညာရန်", correct: false },
      { text_en: "to make treaties", text_my: "စာချုပ်များချုပ်ဆိုရန်", correct: false }
    ]
  },
  {
    id: 43,
    question_en: "Who is the Governor of your state now?",
    question_my: "ယခု သင်၏ပြည်နယ်အုပ်ချုပ်ရေးမှူးသည် မည်သူနည်း။",
    category: 'System of Government',
    studyAnswers: [
        { text_en: 'Answers will vary.', text_my: 'အဖြေများ ကွဲပြားပါမည်။' }
    ],
    answers: [
      { text_en: "Answers will vary.", text_my: "အဖြေများ ကွဲပြားပါမည်။", correct: true },
      { text_en: "The President", text_my: "သမ္မတ", correct: false },
      { text_en: "The Mayor of your city", text_my: "သင်၏မြို့တော်ဝန်", correct: false },
      { text_en: "The Speaker of the State House", text_my: "ပြည်နယ်လွှတ်တော်ဥက္ကဋ္ဌ", correct: false }
    ]
  },
  {
    id: 44,
    question_en: "What is the capital of your state?",
    question_my: "သင်၏ပြည်နယ်၏ မြို့တော်ကား အဘယ်နည်း။",
    category: 'System of Government',
    studyAnswers: [
        { text_en: 'Answers will vary.', text_my: 'အဖြေများ ကွဲပြားပါမည်။' }
    ],
    answers: [
      { text_en: "Answers will vary.", text_my: "အဖြေများ ကွဲပြားပါမည်။", correct: true },
      { text_en: "Washington, D.C.", text_my: "ဝါရှင်တန်ဒီစီ", correct: false },
      { text_en: "New York City", text_my: "နယူးယောက်မြို့", correct: false },
      { text_en: "The largest city in your state", text_my: "သင်၏ပြည်နယ်၏ အကြီးဆုံးမြို့", correct: false }
    ]
  },
  {
    id: 45,
    question_en: "What are the two major political parties in the United States?",
    question_my: "အမေရိကန်ပြည်ထောင်စု၏ အဓိကနိုင်ငံရေးပါတီကြီးနှစ်ခုကား အဘယ်နည်း။",
    category: 'System of Government',
    studyAnswers: [
        { text_en: 'Democratic and Republican', text_my: 'ဒီမိုကရက်တစ်နှင့် ရီပတ်ဘလစ်ကန်' }
    ],
    answers: [
      { text_en: "Democratic and Republican", text_my: "ဒီမိုကရက်တစ်နှင့် ရီပတ်ဘလစ်ကန်", correct: true },
      { text_en: "Liberal and Conservative", text_my: "လစ်ဘရယ်နှင့် ကွန်ဆာဗေးတစ်", correct: false },
      { text_en: "Federalist and Anti-Federalist", text_my: "ဖက်ဒရယ်လစ်နှင့် ဖက်ဒရယ်လစ်ဆန့်ကျင်ရေး", correct: false },
      { text_en: "Labor and Green", text_my: "အလုပ်သမားနှင့် အစိမ်းရောင်", correct: false }
    ]
  },
  {
    id: 46,
    question_en: "What is the political party of the President now?",
    question_my: "ယခု သမ္မတ၏ နိုင်ငံရေးပါတီကား အဘယ်နည်း။",
    category: 'System of Government',
    studyAnswers: [
        { text_en: 'Democratic Party', text_my: 'ဒီမိုကရက်တစ်ပါတီ' }
    ],
    answers: [
      { text_en: "Democratic Party", text_my: "ဒီမိုကရက်တစ်ပါတီ", correct: true },
      { text_en: "Republican Party", text_my: "ရီပတ်ဘလစ်ကန်ပါတီ", correct: false },
      { text_en: "Independent", text_my: "လွတ်လပ်သော", correct: false },
      { text_en: "Libertarian Party", text_my: "လစ်ဘရယ်ပါတီ", correct: false }
    ]
  },
  {
    id: 47,
    question_en: "What is the name of the Speaker of the House of Representatives now?",
    question_my: "ယခု အောက်လွှတ်တော်ဥက္ကဋ္ဌ၏ အမည်ကား အဘယ်နည်း။",
    category: 'System of Government',
    studyAnswers: [
        { text_en: 'Mike Johnson', text_my: 'မိုက် ဂျွန်ဆင်' }
    ],
    answers: [
      { text_en: "Mike Johnson", text_my: "မိုက် ဂျွန်ဆင်", correct: true },
      { text_en: "Nancy Pelosi", text_my: "နန်စီ ပလိုစီ", correct: false },
      { text_en: "Kevin McCarthy", text_my: "ကီဗင် မက်ကာသီ", correct: false },
      { text_en: "Chuck Schumer", text_my: "ချားလ်စ် ရှူးမား", correct: false }
    ]
  },
  // Rights and Responsibilities
  {
    id: 48,
    question_en: "There are four amendments to the Constitution about who can vote. Describe one of them.",
    question_my: "ဖွဲ့စည်းပုံအခြေခံဥပဒေတွင် မည်သူမဲပေးနိုင်သည်နှင့် ပတ်သက်၍ ပြင်ဆင်ချက်လေးခုရှိသည်။ ၎င်းတို့ထဲမှ တစ်ခုကို ဖော်ပြပါ။",
    category: 'Rights and Responsibilities',
    studyAnswers: [
        { text_en: 'Citizens eighteen (18) and older (can vote).', text_my: 'နိုင်ငံသား ဆယ့်ရှစ် (၁၈) နှစ်နှင့်အထက် (မဲပေးနိုင်သည်)။' },
        { text_en: 'You don’t have to pay (a poll tax) to vote.', text_my: 'မဲပေးရန် (မဲခွန်) ပေးဆောင်ရန် မလိုအပ်ပါ။' },
        { text_en: 'Any citizen can vote. (Women and men can vote.)', text_my: 'မည်သည့်နိုင်ငံသားမဆို မဲပေးနိုင်သည်။ (အမျိုးသမီးနှင့် အမျိုးသား မဲပေးနိုင်သည်။)' },
        { text_en: 'A male citizen of any race (can vote).', text_my: 'မည်သည့်လူမျိုးမဆို အမျိုးသားနိုင်ငံသား (မဲပေးနိုင်သည်)။' },
    ],
    answers: [
      { text_en: "Citizens eighteen (18) and older can vote.", text_my: "နိုင်ငံသား ဆယ့်ရှစ် (၁၈) နှစ်နှင့်အထက် မဲပေးနိုင်သည်။", correct: true },
      { text_en: "Only citizens with a job can vote.", text_my: "အလုပ်ရှိသော နိုင်ငံသားများသာ မဲပေးနိုင်သည်။", correct: false },
      { text_en: "Only people who own land can vote.", text_my: "မြေပိုင်ဆိုင်သူများသာ မဲပေးနိုင်သည်။", correct: false },
      { text_en: "Citizens must be twenty-one (21) to vote.", text_my: "နိုင်ငံသားများသည် မဲပေးရန် အသက်နှစ်ဆယ့်တစ် (၂၁) နှစ်ရှိရမည်။", correct: false }
    ]
  },
  {
    id: 49,
    question_en: "What is one responsibility that is only for United States citizens?",
    question_my: "အမေရိကန်နိုင်ငံသားများအတွက်သာဖြစ်သော တာဝန်တစ်ခုကား အဘယ်နည်း။",
    category: 'Rights and Responsibilities',
    studyAnswers: [
        { text_en: 'serve on a jury', text_my: 'ဂျူရီလူကြီးအဖြစ် တာဝန်ထမ်းဆောင်ရန်' },
        { text_en: 'vote in a federal election', text_my: 'ဖက်ဒရယ်ရွေးကောက်ပွဲတွင် မဲပေးရန်' }
    ],
    answers: [
      { text_en: "vote in a federal election", text_my: "ဖက်ဒရယ်ရွေးကောက်ပွဲတွင် မဲပေးရန်", correct: true },
      { text_en: "pay taxes", text_my: "အခွန်ပေးဆောင်ရန်", correct: false },
      { text_en: "obey the law", text_my: "ဥပဒေကို လိုက်နာရန်", correct: false },
      { text_en: "attend school", text_my: "ကျောင်းတက်ရန်", correct: false }
    ]
  },
  {
    id: 50,
    question_en: "Name one right only for United States citizens.",
    question_my: "အမေရိကန်နိုင်ငံသားများအတွက်သာဖြစ်သော အခွင့်အရေးတစ်ခုကို အမည်ပေးပါ။",
    category: 'Rights and Responsibilities',
    studyAnswers: [
        { text_en: 'vote in a federal election', text_my: 'ဖက်ဒရယ်ရွေးကောက်ပွဲတွင် မဲပေးရန်' },
        { text_en: 'run for federal office', text_my: 'ဖက်ဒရယ်ရုံးအတွက် အရွေးခံရန်' }
    ],
    answers: [
      { text_en: "run for federal office", text_my: "ဖက်ဒရယ်ရုံးအတွက် အရွေးခံရန်", correct: true },
      { text_en: "freedom of speech", text_my: "လွတ်လပ်စွာပြောဆိုခွင့်", correct: false },
      { text_en: "freedom of religion", text_my: "ဘာသာရေးလွတ်လပ်ခွင့်", correct: false },
      { text_en: "the right to bear arms", text_my: "လက်နက်ကိုင်ဆောင်ခွင့်", correct: false }
    ]
  },
  {
    id: 51,
    question_en: "What are two rights of everyone living in the United States?",
    question_my: "အမေရိကန်ပြည်ထောင်စုတွင် နေထိုင်သူတိုင်း၏ အခွင့်အရေးနှစ်ခုကား အဘယ်နည်း။",
    category: 'Rights and Responsibilities',
    studyAnswers: [
        { text_en: 'freedom of expression', text_my: 'လွတ်လပ်စွာထုတ်ဖော်ပြောဆိုခွင့်' },
        { text_en: 'freedom of speech', text_my: 'လွတ်လပ်စွာပြောဆိုခွင့်' },
        { text_en: 'freedom of assembly', text_my: 'လွတ်လပ်စွာစည်းဝေးခွင့်' },
        { text_en: 'freedom to petition the government', text_my: 'အစိုးရကို အသနားခံစာတင်ခွင့်' },
        { text_en: 'freedom of religion', text_my: 'ဘာသာရေးလွတ်လပ်ခွင့်' },
        { text_en: 'the right to bear arms', text_my: 'လက်နက်ကိုင်ဆောင်ခွင့်' },
    ],
    answers: [
      { text_en: "freedom of speech and freedom of religion", text_my: "လွတ်လပ်စွာပြောဆိုခွင့်နှင့် ဘာသာရေးလွတ်လပ်ခွင့်", correct: true },
      { text_en: "the right to vote and the right to run for office", text_my: "မဲပေးခွင့်နှင့် ရုံးအတွက်အရွေးခံခွင့်", correct: false },
      { text_en: "the right to a passport and the right to federal employment", text_my: "နိုင်ငံကူးလက်မှတ်ရရှိခွင့်နှင့် ဖက်ဒရယ်အလုပ်အကိုင်ရရှိခွင့်", correct: false },
      { text_en: "the right to free housing and free healthcare", text_my: "အခမဲ့အိမ်ရာနှင့် အခမဲ့ကျန်းမာရေးစောင့်ရှောက်မှုရရှိခွင့်", correct: false }
    ]
  },
  {
    id: 52,
    question_en: "What do we show loyalty to when we say the Pledge of Allegiance?",
    question_my: "သစ္စာဆိုသည့်အခါ ကျွန်ုပ်တို့သည် မည်သည့်အရာကို သစ္စာစောင့်သိကြောင်း ပြသသနည်း။",
    category: 'Rights and Responsibilities',
    studyAnswers: [
        { text_en: 'the United States', text_my: 'အမေရိကန်ပြည်ထောင်စု' },
        { text_en: 'the flag', text_my: 'အလံ' }
    ],
    answers: [
      { text_en: "the flag", text_my: "အလံ", correct: true },
      { text_en: "the President", text_my: "သမ္မတ", correct: false },
      { text_en: "Congress", text_my: "ကွန်ဂရက်", correct: false },
      { text_en: "your state of residence", text_my: "သင်နေထိုင်ရာပြည်နယ်", correct: false }
    ]
  },
  {
    id: 53,
    question_en: "What is one promise you make when you become a United States citizen?",
    question_my: "သင် အမေရိကန်နိုင်ငံသားဖြစ်လာသည့်အခါ သင်ပေးသော ကတိတစ်ခုကား အဘယ်နည်း။",
    category: 'Rights and Responsibilities',
    studyAnswers: [
        { text_en: 'give up loyalty to other countries', text_my: 'အခြားနိုင်ငံများအပေါ် သစ္စာစောင့်သိမှုကို စွန့်လွှတ်ပါ' },
        { text_en: 'defend the Constitution and laws of the United States', text_my: 'အမေရိကန်ပြည်ထောင်စု၏ ဖွဲ့စည်းပုံအခြေခံဥပဒေနှင့် ဥပဒေများကို ကာကွယ်ပါ' },
        { text_en: 'obey the laws of the United States', text_my: 'အမေရိကန်ပြည်ထောင်စု၏ ဥပဒေများကို လိုက်နာပါ' },
        { text_en: 'serve in the U.S. military (if needed)', text_my: 'အမေရိကန်စစ်တပ်တွင် တာဝန်ထမ်းဆောင်ပါ (လိုအပ်လျှင်)' },
        { text_en: 'serve (do important work for) the nation (if needed)', text_my: 'နိုင်ငံတော်အတွက် အရေးကြီးသောအလုပ်ကို ထမ်းဆောင်ပါ (လိုအပ်လျှင်)' },
        { text_en: 'be loyal to the United States', text_my: 'အမေရိကန်ပြည်ထောင်စုအပေါ် သစ္စာစောင့်သိပါ' },
    ],
    answers: [
      { text_en: "obey the laws of the United States", text_my: "အမေရိကန်ပြည်ထောင်စု၏ ဥပဒေများကို လိုက်နာပါ", correct: true },
      { text_en: "never travel to another country", text_my: "အခြားနိုင်ငံသို့ ဘယ်တော့မှ မသွားပါ", correct: false },
      { text_en: "vote in every election", text_my: "ရွေးကောက်ပွဲတိုင်းတွင် မဲပေးပါ", correct: false },
      { text_en: "speak only English", text_my: "အင်္ဂလိပ်ဘာသာစကားကိုသာ ပြောပါ", correct: false }
    ]
  },
  {
    id: 54,
    question_en: "How old do citizens have to be to vote for President?",
    question_my: "သမ္မတကို မဲပေးရန် နိုင်ငံသားများသည် အသက်ဘယ်လောက်ရှိရမည်နည်း။",
    category: 'Rights and Responsibilities',
    studyAnswers: [
        { text_en: 'eighteen (18) and older', text_my: 'ဆယ့်ရှစ် (၁၈) နှစ်နှင့်အထက်' }
    ],
    answers: [
      { text_en: "eighteen (18) and older", text_my: "ဆယ့်ရှစ် (၁၈) နှစ်နှင့်အထက်", correct: true },
      { text_en: "sixteen (16) and older", text_my: "ဆယ့်ခြောက် (၁၆) နှစ်နှင့်အထက်", correct: false },
      { text_en: "twenty-one (21) and older", text_my: "နှစ်ဆယ့်တစ် (၂၁) နှစ်နှင့်အထက်", correct: false },
      { text_en: "any age, if they are a citizen", text_my: "နိုင်ငံသားဖြစ်လျှင် မည်သည့်အသက်အရွယ်မဆို", correct: false }
    ]
  },
  {
    id: 55,
    question_en: "What are two ways that Americans can participate in their democracy?",
    question_my: "အမေရိကန်များသည် ၎င်းတို့၏ ဒီမိုကရေစီတွင် မည်သည့်နည်းလမ်းနှစ်ခုဖြင့် ပါဝင်နိုင်သနည်း။",
    category: 'Rights and Responsibilities',
    studyAnswers: [
        { text_en: 'vote', text_my: 'မဲပေးပါ' },
        { text_en: 'join a political party', text_my: 'နိုင်ငံရေးပါတီတစ်ခုတွင် ပါဝင်ပါ' },
        { text_en: 'help with a campaign', text_my: 'လှုံ့ဆော်ရေးတွင် ကူညီပါ' },
        { text_en: 'join a civic group', text_my: 'ပြည်သူ့အဖွဲ့အစည်းတစ်ခုတွင် ပါဝင်ပါ' },
        { text_en: 'join a community group', text_my: 'ရပ်ရွာအဖွဲ့အစည်းတစ်ခုတွင် ပါဝင်ပါ' },
        { text_en: 'give an elected official your opinion on an issue', text_my: 'ရွေးကောက်တင်မြှောက်ခံရသော အရာရှိတစ်ဦးအား ပြဿနာတစ်ခုအပေါ် သင်၏ထင်မြင်ချက်ကို ပေးပါ' },
        { text_en: 'call Senators and Representatives', text_my: 'အထက်လွှတ်တော်အမတ်များနှင့် ကိုယ်စားလှယ်များကို ခေါ်ဆိုပါ' },
        { text_en: 'publicly support or oppose an issue or policy', text_my: 'ပြဿနာတစ်ခု သို့မဟုတ် မူဝါဒတစ်ခုကို လူသိရှင်ကြား ထောက်ခံပါ သို့မဟုတ် ဆန့်ကျင်ပါ' },
        { text_en: 'run for office', text_my: 'ရုံးအတွက် အရွေးခံပါ' },
        { text_en: 'write to a newspaper', text_my: 'သတင်းစာသို့ စာရေးပါ' },
    ],
    answers: [
      { text_en: "vote and run for office", text_my: "မဲပေးပြီး ရုံးအတွက်အရွေးခံပါ", correct: true },
      { text_en: "pay taxes and obey the law", text_my: "အခွန်ပေးဆောင်ပြီး ဥပဒေကို လိုက်နာပါ", correct: false },
      { text_en: "fly the American flag and say the Pledge of Allegiance", text_my: "အမေရိကန်အလံလွှင့်ပြီး သစ္စာဆိုပါ", correct: false },
      { text_en: "get a job and open a bank account", text_my: "အလုပ်ရပြီး ဘဏ်အကောင့်ဖွင့်ပါ", correct: false }
    ]
  },
  {
    id: 56,
    question_en: "When is the last day you can send in federal income tax forms?",
    question_my: "ဖက်ဒရယ်ဝင်ငွေခွန်ပုံစံများကို သင် နောက်ဆုံး ဘယ်နေ့ ပေးပို့နိုင်သနည်း။",
    category: 'Rights and Responsibilities',
    studyAnswers: [
        { text_en: 'April 15', text_my: 'ဧပြီ ၁၅' }
    ],
    answers: [
      { text_en: "April 15", text_my: "ဧပြီ ၁၅", correct: true },
      { text_en: "January 1", text_my: "ဇန်နဝါရီ ၁", correct: false },
      { text_en: "December 31", text_my: "ဒီဇင်ဘာ ၃၁", correct: false },
      { text_en: "July 4", text_my: "ဇူလိုင် ၄", correct: false }
    ]
  },
  {
    id: 57,
    question_en: "When must all men register for the Selective Service?",
    question_my: "အမျိုးသားအားလုံးသည် Selective Service အတွက် ဘယ်အချိန်မှာ မှတ်ပုံတင်ရမလဲ။",
    category: 'Rights and Responsibilities',
    studyAnswers: [
        { text_en: 'at age eighteen (18)', text_my: 'အသက် ဆယ့်ရှစ် (၁၈) နှစ်တွင်' },
        { text_en: 'between eighteen (18) and twenty-six (26)', text_my: 'ဆယ့်ရှစ် (၁၈) နှင့် နှစ်ဆယ့်ခြောက် (၂၆) နှစ်ကြား' }
    ],
    answers: [
      { text_en: "at age eighteen (18)", text_my: "အသက် ဆယ့်ရှစ် (၁၈) နှစ်တွင်", correct: true },
      { text_en: "at age sixteen (16)", text_my: "အသက် ဆယ့်ခြောက် (၁၆) နှစ်တွင်", correct: false },
      { text_en: "when they get a driver's license", text_my: "ယာဉ်မောင်းလိုင်စင်ရသည့်အခါ", correct: false },
      { text_en: "they are not required to register", text_my: "မှတ်ပုံတင်ရန် မလိုအပ်ပါ", correct: false }
    ]
  },
  // American History: Colonial Period and Independence
  {
    id: 58,
    question_en: "What is one reason colonists came to America?",
    question_my: "ကိုလိုနီနယ်ချဲ့များ အမေရိကသို့ လာရောက်ရသည့် အကြောင်းရင်းတစ်ခုကား အဘယ်နည်း။",
    category: 'American History: Colonial Period and Independence',
    studyAnswers: [
        { text_en: 'freedom', text_my: 'လွတ်လပ်မှု' },
        { text_en: 'political liberty', text_my: 'နိုင်ငံရေးလွတ်လပ်ခွင့်' },
        { text_en: 'religious freedom', text_my: 'ဘာသာရေးလွတ်လပ်ခွင့်' },
        { text_en: 'economic opportunity', text_my: 'စီးပွားရေးအခွင့်အလမ်း' },
        { text_en: 'practice their religion', text_my: '၎င်းတို့၏ဘာသာကို ကျင့်သုံးရန်' },
        { text_en: 'escape persecution', text_my: 'နှိပ်စက်ညှဉ်းပန်းမှုမှ လွတ်မြောက်ရန်' },
    ],
    answers: [
      { text_en: "religious freedom", text_my: "ဘာသာရေးလွတ်လပ်ခွင့်", correct: true },
      { text_en: "to join the British army", text_my: "ဗြိတိသျှစစ်တပ်တွင် ပါဝင်ရန်", correct: false },
      { text_en: "for vacation", text_my: "အားလပ်ရက်အတွက်", correct: false },
      { text_en: "to pay higher taxes", text_my: "အခွန်ပိုပေးဆောင်ရန်", correct: false }
    ]
  },
  {
    id: 59,
    question_en: "Who lived in America before the Europeans arrived?",
    question_my: "ဥရောပသားများ မရောက်လာမီ အမေရိကတွင် မည်သူ နေထိုင်ခဲ့သနည်း။",
    category: 'American History: Colonial Period and Independence',
    studyAnswers: [
        { text_en: 'American Indians', text_my: 'အမေရိကန် အင်ဒီးယန်းများ' },
        { text_en: 'Native Americans', text_my: 'ဇာတိ အမေရိကန်များ' }
    ],
    answers: [
      { text_en: "Native Americans", text_my: "ဇာတိ အမေရိကန်များ", correct: true },
      { text_en: "Canadians", text_my: "ကနေဒါလူမျိုးများ", correct: false },
      { text_en: "Mexicans", text_my: "မက္ကဆီကိုလူမျိုးများ", correct: false },
      { text_en: "No one", text_my: "ဘယ်သူမှ မရှိ", correct: false }
    ]
  },
  {
    id: 60,
    question_en: "What group of people was taken to America and sold as slaves?",
    question_my: "မည်သည့်လူမျိုးအုပ်စုကို အမေရိကသို့ ခေါ်ဆောင်ပြီး ကျွန်အဖြစ် ရောင်းချခဲ့သနည်း။",
    category: 'American History: Colonial Period and Independence',
    studyAnswers: [
        { text_en: 'Africans', text_my: 'အာဖရိကန်များ' },
        { text_en: 'people from Africa', text_my: 'အာဖရိကမှ လူများ' }
    ],
    answers: [
      { text_en: "Africans", text_my: "အာဖရိကန်များ", correct: true },
      { text_en: "Europeans", text_my: "ဥရောပသားများ", correct: false },
      { text_en: "Asians", text_my: "အာရှတိုက်သားများ", correct: false },
      { text_en: "Native Americans", text_my: "ဇာတိ အမေရိကန်များ", correct: false }
    ]
  },
  {
    id: 61,
    question_en: "Why did the colonists fight the British?",
    question_my: "ကိုလိုနီနယ်ချဲ့များသည် ဗြိတိသျှတို့ကို အဘယ်ကြောင့် တိုက်ခိုက်ခဲ့သနည်း။",
    category: 'American History: Colonial Period and Independence',
    studyAnswers: [
        { text_en: 'because of high taxes (taxation without representation)', text_my: 'အခွန်ကြီးမြင့်မှုကြောင့် (ကိုယ်စားပြုမှုမရှိဘဲ အခွန်ကောက်ခံခြင်း)' },
        { text_en: 'because the British army stayed in their houses (boarding, quartering)', text_my: 'ဗြိတိသျှစစ်တပ်သည် ၎င်းတို့၏အိမ်များတွင် နေထိုင်သောကြောင့် (တည်းခိုခြင်း၊ နေရာချထားခြင်း)' },
        { text_en: 'because they didn’t have self-government', text_my: 'ကိုယ်ပိုင်အုပ်ချုပ်ရေး မရှိသောကြောင့်' }
    ],
    answers: [
      { text_en: "because of high taxes", text_my: "အခွန်ကြီးမြင့်မှုကြောင့်", correct: true },
      { text_en: "because they wanted to join France", text_my: "ပြင်သစ်နှင့် ပူးပေါင်းလိုသောကြောင့်", correct: false },
      { text_en: "because of religious differences", text_my: "ဘာသာရေးကွဲပြားမှုကြောင့်", correct: false },
      { text_en: "because the British invaded Canada", text_my: "ဗြိတိသျှတို့က ကနေဒါကို ကျူးကျော်သောကြောင့်", correct: false }
    ]
  },
  {
    id: 62,
    question_en: "Who wrote the Declaration of Independence?",
    question_my: "လွတ်လပ်ရေးကြေညာစာတမ်းကို မည်သူ ရေးသားခဲ့သနည်း။",
    category: 'American History: Colonial Period and Independence',
    studyAnswers: [
        { text_en: 'Thomas Jefferson', text_my: 'သောမတ်စ် ဂျက်ဖာဆင်' }
    ],
    answers: [
      { text_en: "Thomas Jefferson", text_my: "သောမတ်စ် ဂျက်ဖာဆင်", correct: true },
      { text_en: "George Washington", text_my: "ဂျော့ခ်ျ ဝါရှင်တန်", correct: false },
      { text_en: "Abraham Lincoln", text_my: "အာဗြဟံ လင်ကွန်း", correct: false },
      { text_en: "Benjamin Franklin", text_my: "ဘင်ဂျမင် ဖရန်ကလင်", correct: false }
    ]
  },
  {
    id: 63,
    question_en: "When was the Declaration of Independence adopted?",
    question_my: "လွတ်လပ်ရေးကြေညာစာတမ်းကို ဘယ်အချိန်မှာ အတည်ပြုခဲ့သလဲ။",
    category: 'American History: Colonial Period and Independence',
    studyAnswers: [
        { text_en: 'July 4, 1776', text_my: 'ဇူလိုင် ၄၊ ၁၇၇၆' }
    ],
    answers: [
      { text_en: "July 4, 1776", text_my: "ဇူလိုင် ၄၊ ၁၇၇၆", correct: true },
      { text_en: "December 7, 1941", text_my: "ဒီဇင်ဘာ ၇၊ ၁၉၄၁", correct: false },
      { text_en: "April 12, 1861", text_my: "ဧပြီ ၁၂၊ ၁၈၆၁", correct: false },
      { text_en: "September 17, 1787", text_my: "စက်တင်ဘာ ၁၇၊ ၁၇၈၇", correct: false }
    ]
  },
  {
    id: 64,
    question_en: "There were 13 original states. Name three.",
    question_my: "မူလပြည်နယ် ၁၃ ခုရှိခဲ့သည်။ သုံးခုကို အမည်ပေးပါ။",
    category: 'American History: Colonial Period and Independence',
    studyAnswers: [
        { text_en: 'New Hampshire', text_my: 'နယူးဟမ်ရှိုင်းယား' },
        { text_en: 'Massachusetts', text_my: 'မက်ဆာချူးဆက်' },
        { text_en: 'Rhode Island', text_my: 'ရုတ်ကျွန်း' },
        { text_en: 'Connecticut', text_my: 'ကွန်နက်တီကတ်' },
        { text_en: 'New York', text_my: 'နယူးယောက်' },
        { text_en: 'New Jersey', text_my: 'နယူးဂျာစီ' },
        { text_en: 'Pennsylvania', text_my: 'ပင်ဆယ်ဗေးနီးယား' },
        { text_en: 'Delaware', text_my: 'ဒယ်လာဝဲ' },
        { text_en: 'Maryland', text_my: 'မေရီလန်း' },
        { text_en: 'Virginia', text_my: 'ဗာဂျီးနီးယား' },
        { text_en: 'North Carolina', text_my: 'မြောက်ကယ်ရိုလိုင်းနား' },
        { text_en: 'South Carolina', text_my: 'တောင်ကယ်ရိုလိုင်းနား' },
        { text_en: 'Georgia', text_my: 'ဂျော်ဂျီယာ' },
    ],
    answers: [
      { text_en: "New York, New Jersey, New Hampshire", text_my: "နယူးယောက်၊ နယူးဂျာစီ၊ နယူးဟမ်ရှိုင်းယား", correct: true },
      { text_en: "Florida, Texas, California", text_my: "ဖလော်ရီဒါ၊ တက္ကဆက်၊ ကယ်လီဖိုးနီးယား", correct: false },
      { text_en: "Ohio, Michigan, Indiana", text_my: "အိုဟိုင်းယိုး၊ မီရှီဂန်၊ အင်ဒီယားနား", correct: false },
      { text_en: "Washington, Oregon, Alaska", text_my: "ဝါရှင်တန်၊ အော်ရီဂွန်၊ အလက်စကာ", correct: false }
    ]
  },
  {
    id: 65,
    question_en: "What happened at the Constitutional Convention?",
    question_my: "ဖွဲ့စည်းပုံအခြေခံဥပဒေညီလာခံတွင် ဘာဖြစ်ခဲ့သလဲ။",
    category: 'American History: Colonial Period and Independence',
    studyAnswers: [
        { text_en: 'The Constitution was written.', text_my: 'ဖွဲ့စည်းပုံအခြေခံဥပဒေကို ရေးသားခဲ့သည်။' },
        { text_en: 'The Founding Fathers wrote the Constitution.', text_my: 'တည်ထောင်သူဖခင်ကြီးများသည် ဖွဲ့စည်းပုံအခြေခံဥပဒေကို ရေးသားခဲ့သည်။' }
    ],
    answers: [
      { text_en: "The Constitution was written.", text_my: "ဖွဲ့စည်းပုံအခြေခံဥပဒေကို ရေးသားခဲ့သည်။", correct: true },
      { text_en: "The Declaration of Independence was written.", text_my: "လွတ်လပ်ရေးကြေညာစာတမ်းကို ရေးသားခဲ့သည်။", correct: false },
      { text_en: "The Emancipation Proclamation was signed.", text_my: "လွတ်မြောက်ရေး ကြေညာချက်ကို လက်မှတ်ရေးထိုးခဲ့သည်။", correct: false },
      { text_en: "George Washington was elected President.", text_my: "ဂျော့ခ်ျ ဝါရှင်တန်ကို သမ္မတအဖြစ် ရွေးကောက်တင်မြှောက်ခဲ့သည်။", correct: false }
    ]
  },
  {
    id: 66,
    question_en: "When was the Constitution written?",
    question_my: "ဖွဲ့စည်းပုံအခြေခံဥပဒေကို ဘယ်အချိန်မှာ ရေးသားခဲ့သလဲ။",
    category: 'American History: Colonial Period and Independence',
    studyAnswers: [
        { text_en: '1787', text_my: '၁၇၈၇' }
    ],
    answers: [
      { text_en: "1787", text_my: "၁၇၈၇", correct: true },
      { text_en: "1776", text_my: "၁၇၇၆", correct: false },
      { text_en: "1865", text_my: "၁၈၆၅", correct: false },
      { text_en: "1901", text_my: "၁၉၀၁", correct: false }
    ]
  },
  {
    id: 67,
    question_en: "The Federalist Papers supported the passage of the U.S. Constitution. Name one of the writers.",
    question_my: "ဖက်ဒရယ်လစ်စာတမ်းများသည် အမေရိကန်ဖွဲ့စည်းပုံအခြေခံဥပဒေကို အတည်ပြုရန် ထောက်ခံခဲ့သည်။ စာရေးဆရာတစ်ဦးကို အမည်ပေးပါ။",
    category: 'American History: Colonial Period and Independence',
    studyAnswers: [
        { text_en: '(James) Madison', text_my: '(ဂျိမ်းစ်) မက်ဒီဆင်' },
        { text_en: '(Alexander) Hamilton', text_my: '(အလက်ဇန္ဒား) ဟာမီလ်တန်' },
        { text_en: '(John) Jay', text_my: '(ဂျွန်) ဂျေး' },
        { text_en: 'Publius', text_my: 'ပတ်ဘလီရပ်စ်' }
    ],
    answers: [
      { text_en: "(Alexander) Hamilton", text_my: "(အလက်ဇန္ဒား) ဟာမီလ်တန်", correct: true },
      { text_en: "Thomas Jefferson", text_my: "သောမတ်စ် ဂျက်ဖာဆင်", correct: false },
      { text_en: "George Washington", text_my: "ဂျော့ခ်ျ ဝါရှင်တန်", correct: false },
      { text_en: "Abraham Lincoln", text_my: "အာဗြဟံ လင်ကွန်း", correct: false }
    ]
  },
  {
    id: 68,
    question_en: "What is one thing Benjamin Franklin is famous for?",
    question_my: "ဘင်ဂျမင် ဖရန်ကလင်သည် မည်သည့်အရာတစ်ခုကြောင့် ကျော်ကြားသနည်း။",
    category: 'American History: Colonial Period and Independence',
    studyAnswers: [
        { text_en: 'U.S. diplomat', text_my: 'အမေရိကန် သံတမန်' },
        { text_en: 'oldest member of the Constitutional Convention', text_my: 'ဖွဲ့စည်းပုံအခြေခံဥပဒေညီလာခံ၏ အသက်အကြီးဆုံးအဖွဲ့ဝင်' },
        { text_en: 'first Postmaster General of the United States', text_my: 'အမေရိကန်ပြည်ထောင်စု၏ ပထမဆုံး စာတိုက်ဦးစီးချုပ်' },
        { text_en: 'writer of “Poor Richard’s Almanac”', text_my: '“ဆင်းရဲသော ရစ်ချတ်၏ ပြက္ခဒိန်” ကို ရေးသားသူ' },
        { text_en: 'started the first free libraries', text_my: 'ပထမဆုံး အခမဲ့စာကြည့်တိုက်များကို စတင်ခဲ့သည်' },
    ],
    answers: [
      { text_en: "U.S. diplomat", text_my: "အမေရိကန် သံတမန်", correct: true },
      { text_en: "Third President of the United States", text_my: "အမေရိကန်ပြည်ထောင်စု၏ တတိယမြောက်သမ္မတ", correct: false },
      { text_en: "General of the Continental Army", text_my: "တိုက်ကြီးစစ်တပ်၏ ဗိုလ်ချုပ်", correct: false },
      { text_en: "Wrote the Star-Spangled Banner", text_my: "ကြယ်စုံလွှင့်အလံကို ရေးသားခဲ့သည်", correct: false }
    ]
  },
  {
    id: 69,
    question_en: "Who is the “Father of Our Country”?",
    question_my: "“ကျွန်ုပ်တို့နိုင်ငံ၏ ဖခင်” သည် မည်သူနည်း။",
    category: 'American History: Colonial Period and Independence',
    studyAnswers: [
        { text_en: '(George) Washington', text_my: '(ဂျော့ခ်ျ) ဝါရှင်တန်' }
    ],
    answers: [
      { text_en: "(George) Washington", text_my: "(ဂျော့ခ်ျ) ဝါရှင်တန်", correct: true },
      { text_en: "Abraham Lincoln", text_my: "အာဗြဟံ လင်ကွန်း", correct: false },
      { text_en: "Thomas Jefferson", text_my: "သောမတ်စ် ဂျက်ဖာဆင်", correct: false },
      { text_en: "Benjamin Franklin", text_my: "ဘင်ဂျမင် ဖရန်ကလင်", correct: false }
    ]
  },
  {
    id: 70,
    question_en: "Who was the first President?",
    question_my: "ပထမဆုံးသမ္မတသည် မည်သူနည်း။",
    category: 'American History: Colonial Period and Independence',
    studyAnswers: [
        { text_en: '(George) Washington', text_my: '(ဂျော့ခ်ျ) ဝါရှင်တန်' }
    ],
    answers: [
      { text_en: "(George) Washington", text_my: "(ဂျော့ခ်ျ) ဝါရှင်တန်", correct: true },
      { text_en: "John Adams", text_my: "ဂျွန် အဒမ်", correct: false },
      { text_en: "Thomas Jefferson", text_my: "သောမတ်စ် ဂျက်ဖာဆင်", correct: false },
      { text_en: "Abraham Lincoln", text_my: "အာဗြဟံ လင်ကွန်း", correct: false }
    ]
  },
  // American History: 1800s
  {
    id: 71,
    question_en: "What territory did the United States buy from France in 1803?",
    question_my: "၁၈၀၃ ခုနှစ်တွင် အမေရိကန်ပြည်ထောင်စုသည် ပြင်သစ်ထံမှ မည်သည့်နယ်မြေကို ဝယ်ယူခဲ့သနည်း။",
    category: 'American History: 1800s',
    studyAnswers: [
        { text_en: 'the Louisiana Territory', text_my: 'လူးဝစ်စီယားနား နယ်မြေ' },
        { text_en: 'Louisiana', text_my: 'လူးဝစ်စီယားနား' }
    ],
    answers: [
      { text_en: "the Louisiana Territory", text_my: "လူးဝစ်စီယားနား နယ်မြေ", correct: true },
      { text_en: "Alaska", text_my: "အလက်စကာ", correct: false },
      { text_en: "Florida", text_my: "ဖလော်ရီဒါ", correct: false },
      { text_en: "California", text_my: "ကယ်လီဖိုးနီးယား", correct: false }
    ]
  },
  {
    id: 72,
    question_en: "Name one war fought by the United States in the 1800s.",
    question_my: "၁၈၀၀ ပြည့်နှစ်များတွင် အမေရိကန်ပြည်ထောင်စု တိုက်ခိုက်ခဲ့သော စစ်ပွဲတစ်ခုကို အမည်ပေးပါ။",
    category: 'American History: 1800s',
    studyAnswers: [
        { text_en: 'War of 1812', text_my: '၁၈၁၂ စစ်ပွဲ' },
        { text_en: 'Mexican-American War', text_my: 'မက္ကဆီကန်-အမေရိကန် စစ်ပွဲ' },
        { text_en: 'Civil War', text_my: 'ပြည်တွင်းစစ်' },
        { text_en: 'Spanish-American War', text_my: 'စပိန်-အမေရိကန် စစ်ပွဲ' }
    ],
    answers: [
      { text_en: "Civil War", text_my: "ပြည်တွင်းစစ်", correct: true },
      { text_en: "Revolutionary War", text_my: "တော်လှန်ရေးစစ်ပွဲ", correct: false },
      { text_en: "World War I", text_my: "ပထမကမ္ဘာစစ်", correct: false },
      { text_en: "Korean War", text_my: "ကိုရီးယားစစ်ပွဲ", correct: false }
    ]
  },
  {
    id: 73,
    question_en: "Name the U.S. war between the North and the South.",
    question_my: "မြောက်ပိုင်းနှင့် တောင်ပိုင်းကြားရှိ အမေရိကန်စစ်ပွဲကို အမည်ပေးပါ။",
    category: 'American History: 1800s',
    studyAnswers: [
        { text_en: 'the Civil War', text_my: 'ပြည်တွင်းစစ်' },
        { text_en: 'the War between the States', text_my: 'ပြည်နယ်များကြား စစ်ပွဲ' }
    ],
    answers: [
      { text_en: "the Civil War", text_my: "ပြည်တွင်းစစ်", correct: true },
      { text_en: "the War of 1812", text_my: "၁၈၁၂ စစ်ပွဲ", correct: false },
      { text_en: "the Revolutionary War", text_my: "တော်လှန်ရေးစစ်ပွဲ", correct: false },
      { text_en: "the Mexican-American War", text_my: "မက္ကဆီကန်-အမေရိကန် စစ်ပွဲ", correct: false }
    ]
  },
  {
    id: 74,
    question_en: "Name one problem that led to the Civil War.",
    question_my: "ပြည်တွင်းစစ်သို့ ဦးတည်စေသော ပြဿနာတစ်ခုကို အမည်ပေးပါ။",
    category: 'American History: 1800s',
    studyAnswers: [
        { text_en: 'slavery', text_my: 'ကျွန်စနစ်' },
        { text_en: 'economic reasons', text_my: 'စီးပွားရေးအကြောင်းရင်းများ' },
        { text_en: "states' rights", text_my: "ပြည်နယ်များ၏ အခွင့်အရေးများ" }
    ],
    answers: [
      { text_en: "slavery", text_my: "ကျွန်စနစ်", correct: true },
      { text_en: "taxation without representation", text_my: "ကိုယ်စားပြုမှုမရှိဘဲ အခွန်ကောက်ခံခြင်း", correct: false },
      { text_en: "the price of tea", text_my: "လက်ဖက်ရည်စျေးနှုန်း", correct: false },
      { text_en: "oil disputes", text_my: "ရေနံအငြင်းပွားမှုများ", correct: false }
    ]
  },
  {
    id: 75,
    question_en: "What was one important thing that Abraham Lincoln did?",
    question_my: "အာဗြဟံ လင်ကွန်း လုပ်ခဲ့သော အရေးကြီးသည့်အရာတစ်ခုကား အဘယ်နည်း။",
    category: 'American History: 1800s',
    studyAnswers: [
        { text_en: 'freed the slaves (Emancipation Proclamation)', text_my: 'ကျွန်များကို လွတ်မြောက်စေခဲ့သည် (လွတ်မြောက်ရေး ကြေညာချက်)' },
        { text_en: 'saved (or preserved) the Union', text_my: 'ပြည်ထောင်စုကို ကယ်တင်ခဲ့သည် (သို့မဟုတ် ထိန်းသိမ်းခဲ့သည်)' },
        { text_en: 'led the United States during the Civil War', text_my: 'ပြည်တွင်းစစ်အတွင်း အမေရိကန်ပြည်ထောင်စုကို ဦးဆောင်ခဲ့သည်' }
    ],
    answers: [
      { text_en: "freed the slaves (Emancipation Proclamation)", text_my: "ကျွန်များကို လွတ်မြောက်စေခဲ့သည် (လွတ်မြောက်ရေး ကြေညာချက်)", correct: true },
      { text_en: "wrote the Declaration of Independence", text_my: "လွတ်လပ်ရေးကြေညာစာတမ်းကို ရေးသားခဲ့သည်", correct: false },
      { text_en: "was the first Postmaster General", text_my: "ပထမဆုံး စာတိုက်ဦးစီးချုပ်ဖြစ်ခဲ့သည်", correct: false },
      { text_en: "purchased the Louisiana Territory", text_my: "လူးဝစ်စီယားနား နယ်မြေကို ဝယ်ယူခဲ့သည်", correct: false }
    ]
  },
  {
    id: 76,
    question_en: "What did the Emancipation Proclamation do?",
    question_my: "လွတ်မြောက်ရေး ကြေညာချက်က ဘာလုပ်ခဲ့သလဲ။",
    category: 'American History: 1800s',
    studyAnswers: [
        { text_en: 'freed the slaves', text_my: 'ကျွန်များကို လွတ်မြောက်စေခဲ့သည်' },
        { text_en: 'freed slaves in the Confederacy', text_my: 'ကွန်ဖက်ဒရေးရှင်းရှိ ကျွန်များကို လွတ်မြောက်စေခဲ့သည်' },
        { text_en: 'freed slaves in the Confederate states', text_my: 'ကွန်ဖက်ဒရေးရှင်းပြည်နယ်များရှိ ကျွန်များကို လွတ်မြောက်စေခဲ့သည်' },
        { text_en: 'freed slaves in most Southern states', text_my: 'တောင်ပိုင်းပြည်နယ်အများစုရှိ ကျွန်များကို လွတ်မြောက်စေခဲ့သည်' },
    ],
    answers: [
      { text_en: "freed the slaves", text_my: "ကျွန်များကို လွတ်မြောက်စေခဲ့သည်", correct: true },
      { text_en: "gave women the right to vote", text_my: "အမျိုးသမီးများကို မဲပေးခွင့်ပေးခဲ့သည်", correct: false },
      { text_en: "ended the Civil War", text_my: "ပြည်တွင်းစစ်ကို အဆုံးသတ်ခဲ့သည်", correct: false },
      { text_en: "declared independence from Britain", text_my: "ဗြိတိန်ထံမှ လွတ်လပ်ရေးကြေညာခဲ့သည်", correct: false }
    ]
  },
  {
    id: 77,
    question_en: "What did Susan B. Anthony do?",
    question_my: "ဆူဇန် ဘီ အန်သိုနီက ဘာလုပ်ခဲ့သလဲ။",
    category: 'American History: 1800s',
    studyAnswers: [
        { text_en: 'fought for women’s rights', text_my: 'အမျိုးသမီးအခွင့်အရေးအတွက် တိုက်ပွဲဝင်ခဲ့သည်' },
        { text_en: 'fought for civil rights', text_my: 'ပြည်သူ့အခွင့်အရေးအတွက် တိုက်ပွဲဝင်ခဲ့သည်' }
    ],
    answers: [
      { text_en: "fought for women's rights", text_my: "အမျိုးသမီးအခွင့်အရေးအတွက် တိုက်ပွဲဝင်ခဲ့သည်", correct: true },
      { text_en: "was the first woman elected to Congress", text_my: "ကွန်ဂရက်သို့ ပထမဆုံးရွေးကောက်တင်မြှောက်ခံရသော အမျိုးသမီးဖြစ်ခဲ့သည်", correct: false },
      { text_en: "founded the Red Cross", text_my: "ကြက်ခြေနီအသင်းကို တည်ထောင်ခဲ့သည်", correct: false },
      { text_en: "was a general in the Civil War", text_my: "ပြည်တွင်းစစ်တွင် ဗိုလ်ချုပ်တစ်ဦးဖြစ်ခဲ့သည်", correct: false }
    ]
  },
  // Recent American History and Other Important Historical Information
  {
    id: 78,
    question_en: "Name one war fought by the United States in the 1900s.",
    question_my: "၁၉၀၀ ပြည့်နှစ်များတွင် အမေရိကန်ပြည်ထောင်စု တိုက်ခိုက်ခဲ့သော စစ်ပွဲတစ်ခုကို အမည်ပေးပါ။",
    category: 'Recent American History and Other Important Historical Information',
    studyAnswers: [
        { text_en: 'World War I', text_my: 'ပထမကမ္ဘာစစ်' },
        { text_en: 'World War II', text_my: 'ဒုတိယကမ္ဘာစစ်' },
        { text_en: 'Korean War', text_my: 'ကိုရီးယားစစ်ပွဲ' },
        { text_en: 'Vietnam War', text_my: 'ဗီယက်နမ်စစ်ပွဲ' },
        { text_en: '(Persian) Gulf War', text_my: '(ပါရှန်) ပင်လယ်ကွေ့စစ်ပွဲ' },
    ],
    answers: [
      { text_en: "World War I", text_my: "ပထမကမ္ဘာစစ်", correct: true },
      { text_en: "Civil War", text_my: "ပြည်တွင်းစစ်", correct: false },
      { text_en: "Revolutionary War", text_my: "တော်လှန်ရေးစစ်ပွဲ", correct: false },
      { text_en: "War of 1812", text_my: "၁၈၁၂ စစ်ပွဲ", correct: false }
    ]
  },
  {
    id: 79,
    question_en: "Who was President during World War I?",
    question_my: "ပထမကမ္ဘာစစ်အတွင်း သမ္မတသည် မည်သူနည်း။",
    category: 'Recent American History and Other Important Historical Information',
    studyAnswers: [
        { text_en: '(Woodrow) Wilson', text_my: '(ဝုဒ်ရိုး) ဝီလ်ဆင်' }
    ],
    answers: [
      { text_en: "(Woodrow) Wilson", text_my: "(ဝုဒ်ရိုး) ဝီလ်ဆင်", correct: true },
      { text_en: "Franklin Roosevelt", text_my: "ဖရန်ကလင် ရုစဗဲ့", correct: false },
      { text_en: "Theodore Roosevelt", text_my: "သီအိုဒေါ ရုစဗဲ့", correct: false },
      { text_en: "Abraham Lincoln", text_my: "အာဗြဟံ လင်ကွန်း", correct: false }
    ]
  },
  {
    id: 80,
    question_en: "Who was President during the Great Depression and World War II?",
    question_my: "မဟာစီးပွားပျက်ကပ်နှင့် ဒုတိယကမ္ဘာစစ်အတွင်း သမ္မတသည် မည်သူနည်း။",
    category: 'Recent American History and Other Important Historical Information',
    studyAnswers: [
        { text_en: '(Franklin) Roosevelt', text_my: '(ဖရန်ကလင်) ရုစဗဲ့' }
    ],
    answers: [
      { text_en: "(Franklin) Roosevelt", text_my: "(ဖရန်ကလင်) ရုစဗဲ့", correct: true },
      { text_en: "Harry Truman", text_my: "ဟယ်ရီ ထရူးမင်း", correct: false },
      { text_en: "Herbert Hoover", text_my: "ဟာဘတ် ဟူဗာ", correct: false },
      { text_en: "Woodrow Wilson", text_my: "ဝုဒ်ရိုး ဝီလ်ဆင်", correct: false }
    ]
  },
  {
    id: 81,
    question_en: "Who did the United States fight in World War II?",
    question_my: "ဒုတိယကမ္ဘာစစ်တွင် အမေရိကန်ပြည်ထောင်စုသည် မည်သူ့ကို တိုက်ခိုက်ခဲ့သနည်း။",
    category: 'Recent American History and Other Important Historical Information',
    studyAnswers: [
        { text_en: 'Japan, Germany, and Italy', text_my: 'ဂျပန်၊ ဂျာမနီနှင့် အီတလီ' }
    ],
    answers: [
      { text_en: "Japan, Germany, and Italy", text_my: "ဂျပန်၊ ဂျာမနီနှင့် အီတလီ", correct: true },
      { text_en: "The Soviet Union, China, and Korea", text_my: "ဆိုဗီယက်ယူနီယံ၊ တရုတ်နှင့် ကိုရီးယား", correct: false },
      { text_en: "Great Britain, France, and Russia", text_my: "ဂရိတ်ဗြိတိန်၊ ပြင်သစ်နှင့် ရုရှား", correct: false },
      { text_en: "Vietnam, Cambodia, and Laos", text_my: "ဗီယက်နမ်၊ ကမ္ဘောဒီးယားနှင့် လာအို", correct: false }
    ]
  },
  {
    id: 82,
    question_en: "Before he was President, Eisenhower was a general. What war was he in?",
    question_my: "သမ္မတမဖြစ်မီ၊ အိုက်စင်ဟောင်ဝါသည် ဗိုလ်ချုပ်တစ်ဦးဖြစ်ခဲ့သည်။ သူသည် မည်သည့်စစ်ပွဲတွင် ပါဝင်ခဲ့သနည်း။",
    category: 'Recent American History and Other Important Historical Information',
    studyAnswers: [
        { text_en: 'World War II', text_my: 'ဒုတိယကမ္ဘာစစ်' }
    ],
    answers: [
      { text_en: "World War II", text_my: "ဒုတိယကမ္ဘာစစ်", correct: true },
      { text_en: "World War I", text_my: "ပထမကမ္ဘာစစ်", correct: false },
      { text_en: "The Civil War", text_my: "ပြည်တွင်းစစ်", correct: false },
      { text_en: "The Korean War", text_my: "ကိုရီးယားစစ်ပွဲ", correct: false }
    ]
  },
  {
    id: 83,
    question_en: "During the Cold War, what was the main concern of the United States?",
    question_my: "စစ်အေးတိုက်ပွဲအတွင်း၊ အမေရိကန်ပြည်ထောင်စု၏ အဓိကစိုးရိမ်မှုကား အဘယ်နည်း။",
    category: 'Recent American History and Other Important Historical Information',
    studyAnswers: [
        { text_en: 'Communism', text_my: 'ကွန်မြူနစ်ဝါဒ' }
    ],
    answers: [
      { text_en: "Communism", text_my: "ကွန်မြူနစ်ဝါဒ", correct: true },
      { text_en: "Climate Change", text_my: "ရာသီဥတုပြောင်းလဲမှု", correct: false },
      { text_en: "The Great Depression", text_my: "မဟာစီးပွားပျက်ကပ်", correct: false },
      { text_en: "Terrorism", text_my: "အကြမ်းဖက်ဝါဒ", correct: false }
    ]
  },
  {
    id: 84,
    question_en: "What movement tried to end racial discrimination?",
    question_my: "မည်သည့်လှုပ်ရှားမှုက လူမျိုးရေးခွဲခြားမှုကို အဆုံးသတ်ရန် ကြိုးစားခဲ့သနည်း။",
    category: 'Recent American History and Other Important Historical Information',
    studyAnswers: [
        { text_en: 'civil rights (movement)', text_my: 'ပြည်သူ့အခွင့်အရေး (လှုပ်ရှားမှု)' }
    ],
    answers: [
      { text_en: "civil rights (movement)", text_my: "ပြည်သူ့အခွင့်အရေး (လှုပ်ရှားမှု)", correct: true },
      { text_en: "the women's suffrage movement", text_my: "အမျိုးသမီးမဲပေးခွင့်လှုပ်ရှားမှု", correct: false },
      { text_en: "the conservation movement", text_my: "ထိန်းသိမ်းရေးလှုပ်ရှားမှု", correct: false },
      { text_en: "the prohibition movement", text_my: "တားမြစ်ရေးလှုပ်ရှားမှု", correct: false }
    ]
  },
  {
    id: 85,
    question_en: "What did Martin Luther King, Jr. do?",
    question_my: "မာတင် လူသာ ကင်း၊ ဂျူနီယာက ဘာလုပ်ခဲ့သလဲ။",
    category: 'Recent American History and Other Important Historical Information',
    studyAnswers: [
        { text_en: 'fought for civil rights', text_my: 'ပြည်သူ့အခွင့်အရေးအတွက် တိုက်ပွဲဝင်ခဲ့သည်' },
        { text_en: 'worked for equality for all Americans', text_my: 'အမေရိကန်အားလုံးအတွက် တန်းတူညီမျှမှုအတွက် လုပ်ဆောင်ခဲ့သည်' }
    ],
    answers: [
      { text_en: "fought for civil rights", text_my: "ပြည်သူ့အခွင့်အရေးအတွက် တိုက်ပွဲဝင်ခဲ့သည်", correct: true },
      { text_en: "was the first African American Senator", text_my: "ပထမဆုံး အာဖရိကန်အမေရိကန် အထက်လွှတ်တော်အမတ်ဖြစ်ခဲ့သည်", correct: false },
      { text_en: "ran for President of the United States", text_my: "အမေရိကန်ပြည်ထောင်စုသမ္မတအဖြစ် အရွေးခံခဲ့သည်", correct: false },
      { text_en: "was a justice on the Supreme Court", text_my: "တရားရုံးချုပ်တွင် တရားသူကြီးတစ်ဦးဖြစ်ခဲ့သည်", correct: false }
    ]
  },
  {
    id: 86,
    question_en: "What major event happened on September 11, 2001, in the United States?",
    question_my: "၂၀၀၁ ခုနှစ်၊ စက်တင်ဘာလ ၁၁ ရက်နေ့တွင် အမေရိကန်ပြည်ထောင်စု၌ မည်သည့်အဓိကဖြစ်ရပ်ကြီး ဖြစ်ပွားခဲ့သနည်း။",
    category: 'Recent American History and Other Important Historical Information',
    studyAnswers: [
        { text_en: 'Terrorists attacked the United States.', text_my: 'အကြမ်းဖက်သမားများက အမေရိကန်ပြည်ထောင်စုကို တိုက်ခိုက်ခဲ့သည်။' }
    ],
    answers: [
      { text_en: "Terrorists attacked the United States.", text_my: "အကြမ်းဖက်သမားများက အမေရိကန်ပြည်ထောင်စုကို တိုက်ခိုက်ခဲ့သည်။", correct: true },
      { text_en: "The stock market crashed.", text_my: "စတော့စျေးကွက် ပျက်စီးခဲ့သည်။", correct: false },
      { text_en: "The United States declared war on Japan.", text_my: "အမေရိကန်ပြည်ထောင်စုက ဂျပန်ကို စစ်ကြေညာခဲ့သည်။", correct: false },
      { text_en: "Hurricane Katrina struck New Orleans.", text_my: "ဟာရီကိန်း ကက်ထရီနာက နယူးအော်လင်းကို တိုက်ခတ်ခဲ့သည်။", correct: false }
    ]
  },
  {
    id: 87,
    question_en: "Name one American Indian tribe in the United States.",
    question_my: "အမေရိကန်ပြည်ထောင်စုရှိ အမေရိကန်အင်ဒီးယန်းမျိုးနွယ်စုတစ်ခုကို အမည်ပေးပါ။",
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
      { text_en: "Cherokee", text_my: "ချာရိုကီ", correct: true },
      { text_en: "Zulu", text_my: "ဇူးလူး", correct: false },
      { text_en: "Samoan", text_my: "ဆာမိုအန်", correct: false },
      { text_en: "Celtic", text_my: "ကယ်လ်တစ်", correct: false }
    ]
  },
  // Civics: Symbols and Holidays
  {
    id: 88,
    question_en: "Name one of the two longest rivers in the United States.",
    question_my: "အမေရိကန်ပြည်ထောင်စုရှိ အရှည်ဆုံးမြစ်နှစ်စင်းထဲမှ တစ်စင်းကို အမည်ပေးပါ။",
    category: 'Civics: Symbols and Holidays',
    studyAnswers: [
        { text_en: 'Missouri (River)', text_my: 'မစ်ဆူရီ (မြစ်)' },
        { text_en: 'Mississippi (River)', text_my: 'မစ္စစ္စပီ (မြစ်)' }
    ],
    answers: [
      { text_en: "Mississippi (River)", text_my: "မစ္စစ္စပီ (မြစ်)", correct: true },
      { text_en: "Colorado (River)", text_my: "ကော်လိုရာဒို (မြစ်)", correct: false },
      { text_en: "Ohio (River)", text_my: "အိုဟိုင်းယိုး (မြစ်)", correct: false },
      { text_en: "Hudson (River)", text_my: "ဟဒ်ဆန် (မြစ်)", correct: false }
    ]
  },
  {
    id: 89,
    question_en: "What ocean is on the West Coast of the United States?",
    question_my: "အမေရိကန်ပြည်ထောင်စု၏ အနောက်ဘက်ကမ်းရိုးတန်းတွင် မည်သည့်သမုဒ္ဒရာ ရှိသနည်း။",
    category: 'Civics: Symbols and Holidays',
    studyAnswers: [
        { text_en: 'Pacific (Ocean)', text_my: 'ပစိဖိတ် (သမုဒ္ဒရာ)' }
    ],
    answers: [
      { text_en: "Pacific (Ocean)", text_my: "ပစိဖိတ် (သမုဒ္ဒရာ)", correct: true },
      { text_en: "Atlantic (Ocean)", text_my: "အတ္တလန္တိတ် (သမုဒ္ဒရာ)", correct: false },
      { text_en: "Arctic (Ocean)", text_my: "အာတိတ် (သမုဒ္ဒရာ)", correct: false },
      { text_en: "Indian (Ocean)", text_my: "အိန္ဒိယ (သမုဒ္ဒရာ)", correct: false }
    ]
  },
  {
    id: 90,
    question_en: "What ocean is on the East Coast of the United States?",
    question_my: "အမေရိကန်ပြည်ထောင်စု၏ အရှေ့ဘက်ကမ်းရိုးတန်းတွင် မည်သည့်သမုဒ္ဒရာ ရှိသနည်း။",
    category: 'Civics: Symbols and Holidays',
    studyAnswers: [
        { text_en: 'Atlantic (Ocean)', text_my: 'အတ္တလန္တိတ် (သမုဒ္ဒရာ)' }
    ],
    answers: [
      { text_en: "Atlantic (Ocean)", text_my: "အတ္တလန္တိတ် (သမုဒ္ဒရာ)", correct: true },
      { text_en: "Pacific (Ocean)", text_my: "ပစိဖိတ် (သမုဒ္ဒရာ)", correct: false },
      { text_en: "Arctic (Ocean)", text_my: "အာတိတ် (သမုဒ္ဒရာ)", correct: false },
      { text_en: "Southern (Ocean)", text_my: "တောင်ပိုင်း (သမုဒ္ဒရာ)", correct: false }
    ]
  },
  {
    id: 91,
    question_en: "Name one U.S. territory.",
    question_my: "အမေရိကန်နယ်မြေတစ်ခုကို အမည်ပေးပါ။",
    category: 'Civics: Symbols and Holidays',
    studyAnswers: [
        { text_en: 'Puerto Rico', text_my: 'ပေါ်တိုရီကို' },
        { text_en: 'U.S. Virgin Islands', text_my: 'အမေရိကန် ဗာဂျင်ကျွန်းစု' },
        { text_en: 'American Samoa', text_my: 'အမေရိကန် ဆာမိုအာ' },
        { text_en: 'Northern Mariana Islands', text_my: 'မြောက်ပိုင်း မာရီယာနာကျွန်းစု' },
        { text_en: 'Guam', text_my: 'ဂူအမ်' },
    ],
    answers: [
      { text_en: "Puerto Rico", text_my: "ပေါ်တိုရီကို", correct: true },
      { text_en: "Haiti", text_my: "ဟေတီ", correct: false },
      { text_en: "Cuba", text_my: "ကျူးဘား", correct: false },
      { text_en: "The Bahamas", text_my: "ဘဟားမား", correct: false }
    ]
  },
  {
    id: 92,
    question_en: "Name one state that borders Canada.",
    question_my: "ကနေဒါနှင့် နယ်နိမိတ်ချင်းထိစပ်နေသော ပြည်နယ်တစ်ခုကို အမည်ပေးပါ။",
    category: 'Civics: Symbols and Holidays',
    studyAnswers: [
        { text_en: 'Maine', text_my: 'မိန်း' },
        { text_en: 'New Hampshire', text_my: 'နယူးဟမ်ရှိုင်းယား' },
        { text_en: 'Vermont', text_my: 'ဗားမောင့်' },
        { text_en: 'New York', text_my: 'နယူးယောက်' },
        { text_en: 'Pennsylvania', text_my: 'ပင်ဆယ်ဗေးနီးယား' },
        { text_en: 'Ohio', text_my: 'အိုဟိုင်းယိုး' },
        { text_en: 'Michigan', text_my: 'မီရှီဂန်' },
        { text_en: 'Minnesota', text_my: 'မီနီဆိုတာ' },
        { text_en: 'North Dakota', text_my: 'မြောက်ဒါကိုတာ' },
        { text_en: 'Montana', text_my: 'မွန်တာနာ' },
        { text_en: 'Idaho', text_my: 'အိုင်ဒါဟို' },
        { text_en: 'Washington', text_my: 'ဝါရှင်တန်' },
        { text_en: 'Alaska', text_my: 'အလက်စကာ' },
    ],
    answers: [
      { text_en: "Washington", text_my: "ဝါရှင်တန်", correct: true },
      { text_en: "California", text_my: "ကယ်လီဖိုးနီးယား", correct: false },
      { text_en: "Texas", text_my: "တက္ကဆက်", correct: false },
      { text_en: "Florida", text_my: "ဖလော်ရီဒါ", correct: false }
    ]
  },
  {
    id: 93,
    question_en: "Name one state that borders Mexico.",
    question_my: "မက္ကဆီကိုနှင့် နယ်နိမိတ်ချင်းထိစပ်နေသော ပြည်နယ်တစ်ခုကို အမည်ပေးပါ။",
    category: 'Civics: Symbols and Holidays',
    studyAnswers: [
        { text_en: 'California', text_my: 'ကယ်လီဖိုးနီးယား' },
        { text_en: 'Arizona', text_my: 'အရီဇိုးနား' },
        { text_en: 'New Mexico', text_my: 'နယူးမက္ကဆီကို' },
        { text_en: 'Texas', text_my: 'တက္ကဆက်' }
    ],
    answers: [
      { text_en: "California", text_my: "ကယ်လီဖိုးနီးယား", correct: true },
      { text_en: "Washington", text_my: "ဝါရှင်တန်", correct: false },
      { text_en: "Nevada", text_my: "နီဗားဒါး", correct: false },
      { text_en: "Florida", text_my: "ဖလော်ရီဒါ", correct: false }
    ]
  },
  {
    id: 94,
    question_en: "What is the capital of the United States?",
    question_my: "အမေရိကန်ပြည်ထောင်စု၏ မြို့တော်ကား အဘယ်နည်း။",
    category: 'Civics: Symbols and Holidays',
    studyAnswers: [
        { text_en: 'Washington, D.C.', text_my: 'ဝါရှင်တန်ဒီစီ' }
    ],
    answers: [
      { text_en: "Washington, D.C.", text_my: "ဝါရှင်တန်ဒီစီ", correct: true },
      { text_en: "New York, NY", text_my: "နယူးယောက်၊ နယူးယောက်", correct: false },
      { text_en: "Philadelphia, PA", text_my: "ဖီလဒဲလ်ဖီးယား၊ ပင်ဆယ်ဗေးနီးယား", correct: false },
      { text_en: "Boston, MA", text_my: "ဘော်စတွန်၊ မက်ဆာချူးဆက်", correct: false }
    ]
  },
  {
    id: 95,
    question_en: "Where is the Statue of Liberty?",
    question_my: "လွတ်လပ်ရေးရုပ်ထုသည် ဘယ်မှာလဲ။",
    category: 'Civics: Symbols and Holidays',
    studyAnswers: [
        { text_en: 'New York (Harbor)', text_my: 'နယူးယောက် (ဆိပ်ကမ်း)' },
        { text_en: 'Liberty Island', text_my: 'လစ်ဘာတီကျွန်း' }
    ],
    answers: [
      { text_en: "New York (Harbor)", text_my: "နယူးယောက် (ဆိပ်ကမ်း)", correct: true },
      { text_en: "Washington, D.C.", text_my: "ဝါရှင်တန်ဒီစီ", correct: false },
      { text_en: "San Francisco, CA", text_my: "ဆန်ဖရန်စစ္စကို၊ ကယ်လီဖိုးနီးယား", correct: false },
      { text_en: "Boston, MA", text_my: "ဘော်စတွန်၊ မက်ဆာချူးဆက်", correct: false }
    ]
  },
  {
    id: 96,
    question_en: "Why does the flag have 13 stripes?",
    question_my: "အလံတွင် အစင်းကြောင်း ၁၃ ခု အဘယ်ကြောင့် ရှိသနည်း။",
    category: 'Civics: Symbols and Holidays',
    studyAnswers: [
        { text_en: 'because there were 13 original colonies', text_my: 'မူလကိုလိုနီ ၁၃ ခု ရှိသောကြောင့်' },
        { text_en: 'because the stripes represent the original colonies', text_my: 'အစင်းကြောင်းများသည် မူလကိုလိုနီများကို ကိုယ်စားပြုသောကြောင့်' }
    ],
    answers: [
      { text_en: "because there were 13 original colonies", text_my: "မူလကိုလိုနီ ၁၃ ခု ရှိသောကြောင့်", correct: true },
      { text_en: "because there are 13 amendments", text_my: "ပြင်ဆင်ချက် ၁၃ ခု ရှိသောကြောင့်", correct: false },
      { text_en: "because it is a lucky number", text_my: "ကံကောင်းသောဂဏန်းဖြစ်သောကြောင့်", correct: false },
      { text_en: "because 13 ships sailed from Europe", text_my: "ဥရောပမှ သင်္ဘော ၁၃ စင်း ရွက်လွှင့်ခဲ့သောကြောင့်", correct: false }
    ]
  },
  {
    id: 97,
    question_en: "Why does the flag have 50 stars?",
    question_my: "အလံတွင် ကြယ် ၅၀ အဘယ်ကြောင့် ရှိသနည်း။",
    category: 'Civics: Symbols and Holidays',
    studyAnswers: [
        { text_en: 'because there is one star for each state', text_my: 'ပြည်နယ်တစ်ခုစီအတွက် ကြယ်တစ်ပွင့် ရှိသောကြောင့်' },
        { text_en: 'because each star represents a state', text_my: 'ကြယ်တစ်ပွင့်စီသည် ပြည်နယ်တစ်ခုကို ကိုယ်စားပြုသောကြောင့်' },
        { text_en: 'because there are 50 states', text_my: 'ပြည်နယ် ၅၀ ရှိသောကြောင့်' }
    ],
    answers: [
      { text_en: "because there are 50 states", text_my: "ပြည်နယ် ၅၀ ရှိသောကြောင့်", correct: true },
      { text_en: "because there were 50 original colonies", text_my: "မူလကိုလိုနီ ၅၀ ရှိသောကြောင့်", correct: false },
      { text_en: "because there are 50 amendments to the Constitution", text_my: "ဖွဲ့စည်းပုံအခြေခံဥပဒေတွင် ပြင်ဆင်ချက် ၅၀ ရှိသောကြောင့်", correct: false },
      { text_en: "because 50 states signed the Declaration of Independence", text_my: "ပြည်နယ် ၅၀ က လွတ်လပ်ရေးကြေညာစာတမ်းကို လက်မှတ်ရေးထိုးခဲ့သောကြောင့်", correct: false }
    ]
  },
  {
    id: 98,
    question_en: "What is the name of the national anthem?",
    question_my: "နိုင်ငံတော်သီချင်း၏ အမည်ကား အဘယ်နည်း။",
    category: 'Civics: Symbols and Holidays',
    studyAnswers: [
        { text_en: 'The Star-Spangled Banner', text_my: 'ကြယ်စုံလွှင့်အလံ' }
    ],
    answers: [
      { text_en: "The Star-Spangled Banner", text_my: "ကြယ်စုံလွှင့်အလံ", correct: true },
      { text_en: "America the Beautiful", text_my: "လှပသောအမေရိက", correct: false },
      { text_en: "God Bless America", text_my: "ဘုရားသခင် အမေရိကကို ကောင်းချီးပေးပါစေ", correct: false },
      { text_en: "My Country, 'Tis of Thee", text_my: "ငါ့နိုင်ငံ၊ မင်းရဲ့", correct: false }
    ]
  },
  {
    id: 99,
    question_en: "When do we celebrate Independence Day?",
    question_my: "လွတ်လပ်ရေးနေ့ကို ဘယ်အချိန်မှာ ကျင်းပသလဲ။",
    category: 'Civics: Symbols and Holidays',
    studyAnswers: [
        { text_en: 'July 4', text_my: 'ဇူလိုင် ၄' }
    ],
    answers: [
      { text_en: "July 4", text_my: "ဇူလိုင် ၄", correct: true },
      { text_en: "December 25", text_my: "ဒီဇင်ဘာ ၂၅", correct: false },
      { text_en: "January 1", text_my: "ဇန်နဝါရီ ၁", correct: false },
      { text_en: "The last Monday in May", text_my: "မေလ၏ နောက်ဆုံး တနင်္လာနေ့", correct: false }
    ]
  },
  {
    id: 100,
    question_en: "Name two national U.S. holidays.",
    question_my: "အမေရိကန်နိုင်ငံ၏ နိုင်ငံတော်အားလပ်ရက်နှစ်ခုကို အမည်ပေးပါ။",
    category: 'Civics: Symbols and Holidays',
    studyAnswers: [
        { text_en: 'New Year’s Day', text_my: 'နှစ်သစ်ကူးနေ့' },
        { text_en: 'Martin Luther King, Jr. Day', text_my: 'မာတင် လူသာ ကင်း၊ ဂျူနီယာ နေ့' },
        { text_en: 'Presidents\' Day', text_my: 'သမ္မတများနေ့' },
        { text_en: 'Memorial Day', text_my: 'အထိမ်းအမှတ်နေ့' },
        { text_en: 'Juneteenth', text_my: 'ဇွန်လဆယ့်ကိုးရက်နေ့' },
        { text_en: 'Independence Day', text_my: 'လွတ်လပ်ရေးနေ့' },
        { text_en: 'Labor Day', text_my: 'အလုပ်သမားနေ့' },
        { text_en: 'Columbus Day', text_my: 'ကိုလံဘတ်စ်နေ့' },
        { text_en: 'Veterans Day', text_my: 'စစ်မှုထမ်းဟောင်းများနေ့' },
        { text_en: 'Thanksgiving Day', text_my: 'ကျေးဇူးတော်နေ့' },
        { text_en: 'Christmas Day', text_my: 'ခရစ္စမတ်နေ့' },
    ],
    answers: [
      { text_en: "Thanksgiving and Christmas", text_my: "ကျေးဇူးတော်နေ့နှင့် ခရစ္စမတ်", correct: true },
      { text_en: "April Fool's Day and Valentine's Day", text_my: "ဧပြီလ၏ လူမိုက်နေ့နှင့် ချစ်သူများနေ့", correct: false },
      { text_en: "Super Bowl Sunday and Election Day", text_my: "စူပါဘိုးလ် တနင်္ဂနွေနေ့နှင့် ရွေးကောက်ပွဲနေ့", correct: false },
      { text_en: "St. Patrick's Day and Halloween", text_my: "စိန့် ပက်ထရစ်နေ့နှင့် ဟယ်လိုဝင်း", correct: false }
    ]
  }
];

export const totalCivicsQuestions = civicsQuestions.length;
