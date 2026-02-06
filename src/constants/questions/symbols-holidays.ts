import type { Question } from '@/types';

/**
 * Civics: Symbols and Holidays
 *
 * ID Prefix: SYM-## (13 questions)
 */

export const symbolsHolidaysQuestions: Question[] = [
  {
    id: 'SYM-01',
    question_en: 'Name one of the two longest rivers in the United States.',
    question_my: 'အမေရိကန်ပြည်ထောင်စုရှိ အရှည်ဆုံးမြစ်နှစ်စင်းထဲမှ တစ်စင်းကို အမည်ပေးပါ။',
    category: 'Civics: Symbols and Holidays',
    studyAnswers: [
      { text_en: 'Missouri (River)', text_my: 'မစ်ဆူရီ (မြစ်)' },
      { text_en: 'Mississippi (River)', text_my: 'မစ္စစ္စပီ (မြစ်)' },
    ],
    answers: [
      {
        text_en: 'Mississippi (River)',
        text_my: 'မစ္စစ္စပီ (မြစ်)',
        correct: true,
      },
      {
        text_en: 'Colorado (River)',
        text_my: 'ကော်လိုရာဒို (မြစ်)',
        correct: false,
      },
      {
        text_en: 'Ohio (River)',
        text_my: 'အိုဟိုင်းယိုး (မြစ်)',
        correct: false,
      },
      {
        text_en: 'Hudson (River)',
        text_my: 'ဟဒ်ဆန် (မြစ်)',
        correct: false,
      },
    ],
  },
  {
    id: 'SYM-02',
    question_en: 'What ocean is on the West Coast of the United States?',
    question_my: 'အမေရိကန်ပြည်ထောင်စု၏ အနောက်ဘက်ကမ်းရိုးတန်းတွင် မည်သည့်သမုဒ္ဒရာ ရှိသနည်း။',
    category: 'Civics: Symbols and Holidays',
    studyAnswers: [{ text_en: 'Pacific (Ocean)', text_my: 'ပစိဖိတ် (သမုဒ္ဒရာ)' }],
    answers: [
      {
        text_en: 'Pacific (Ocean)',
        text_my: 'ပစိဖိတ် (သမုဒ္ဒရာ)',
        correct: true,
      },
      {
        text_en: 'Atlantic (Ocean)',
        text_my: 'အတ္တလန္တိတ် (သမုဒ္ဒရာ)',
        correct: false,
      },
      {
        text_en: 'Arctic (Ocean)',
        text_my: 'အာတိတ် (သမုဒ္ဒရာ)',
        correct: false,
      },
      {
        text_en: 'Indian (Ocean)',
        text_my: 'အိန္ဒိယ (သမုဒ္ဒရာ)',
        correct: false,
      },
    ],
  },
  {
    id: 'SYM-03',
    question_en: 'What ocean is on the East Coast of the United States?',
    question_my: 'အမေရိကန်ပြည်ထောင်စု၏ အရှေ့ဘက်ကမ်းရိုးတန်းတွင် မည်သည့်သမုဒ္ဒရာ ရှိသနည်း။',
    category: 'Civics: Symbols and Holidays',
    studyAnswers: [{ text_en: 'Atlantic (Ocean)', text_my: 'အတ္တလန္တိတ် (သမုဒ္ဒရာ)' }],
    answers: [
      {
        text_en: 'Atlantic (Ocean)',
        text_my: 'အတ္တလန္တိတ် (သမုဒ္ဒရာ)',
        correct: true,
      },
      {
        text_en: 'Pacific (Ocean)',
        text_my: 'ပစိဖိတ် (သမုဒ္ဒရာ)',
        correct: false,
      },
      {
        text_en: 'Arctic (Ocean)',
        text_my: 'အာတိတ် (သမုဒ္ဒရာ)',
        correct: false,
      },
      {
        text_en: 'Southern (Ocean)',
        text_my: 'တောင်ပိုင်း (သမုဒ္ဒရာ)',
        correct: false,
      },
    ],
  },
  {
    id: 'SYM-04',
    question_en: 'Name one U.S. territory.',
    question_my: 'အမေရိကန်နယ်မြေတစ်ခုကို အမည်ပေးပါ။',
    category: 'Civics: Symbols and Holidays',
    studyAnswers: [
      { text_en: 'Puerto Rico', text_my: 'ပေါ်တိုရီကို' },
      { text_en: 'U.S. Virgin Islands', text_my: 'အမေရိကန် ဗာဂျင်ကျွန်းစု' },
      { text_en: 'American Samoa', text_my: 'အမေရိကန် ဆာမိုအာ' },
      {
        text_en: 'Northern Mariana Islands',
        text_my: 'မြောက်ပိုင်း မာရီယာနာကျွန်းစု',
      },
      { text_en: 'Guam', text_my: 'ဂူအမ်' },
    ],
    answers: [
      { text_en: 'Puerto Rico', text_my: 'ပေါ်တိုရီကို', correct: true },
      { text_en: 'Haiti', text_my: 'ဟေတီ', correct: false },
      { text_en: 'Cuba', text_my: 'ကျူးဘား', correct: false },
      { text_en: 'The Bahamas', text_my: 'ဘဟားမား', correct: false },
    ],
  },
  {
    id: 'SYM-05',
    question_en: 'Name one state that borders Canada.',
    question_my: 'ကနေဒါနှင့် နယ်နိမိတ်ချင်းထိစပ်နေသော ပြည်နယ်တစ်ခုကို အမည်ပေးပါ။',
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
      { text_en: 'Washington', text_my: 'ဝါရှင်တန်', correct: true },
      { text_en: 'California', text_my: 'ကယ်လီဖိုးနီးယား', correct: false },
      { text_en: 'Texas', text_my: 'တက္ကဆက်', correct: false },
      { text_en: 'Florida', text_my: 'ဖလော်ရီဒါ', correct: false },
    ],
  },
  {
    id: 'SYM-06',
    question_en: 'Name one state that borders Mexico.',
    question_my: 'မက္ကဆီကိုနှင့် နယ်နိမိတ်ချင်းထိစပ်နေသော ပြည်နယ်တစ်ခုကို အမည်ပေးပါ။',
    category: 'Civics: Symbols and Holidays',
    studyAnswers: [
      { text_en: 'California', text_my: 'ကယ်လီဖိုးနီးယား' },
      { text_en: 'Arizona', text_my: 'အရီဇိုးနား' },
      { text_en: 'New Mexico', text_my: 'နယူးမက္ကဆီကို' },
      { text_en: 'Texas', text_my: 'တက္ကဆက်' },
    ],
    answers: [
      { text_en: 'California', text_my: 'ကယ်လီဖိုးနီးယား', correct: true },
      { text_en: 'Washington', text_my: 'ဝါရှင်တန်', correct: false },
      { text_en: 'Nevada', text_my: 'နီဗားဒါး', correct: false },
      { text_en: 'Florida', text_my: 'ဖလော်ရီဒါ', correct: false },
    ],
  },
  {
    id: 'SYM-07',
    question_en: 'What is the capital of the United States?',
    question_my: 'အမေရိကန်ပြည်ထောင်စု၏ မြို့တော်ကား အဘယ်နည်း။',
    category: 'Civics: Symbols and Holidays',
    studyAnswers: [{ text_en: 'Washington, D.C.', text_my: 'ဝါရှင်တန်ဒီစီ' }],
    answers: [
      { text_en: 'Washington, D.C.', text_my: 'ဝါရှင်တန်ဒီစီ', correct: true },
      {
        text_en: 'New York, NY',
        text_my: 'နယူးယောက်၊ နယူးယောက်',
        correct: false,
      },
      {
        text_en: 'Philadelphia, PA',
        text_my: 'ဖီလဒဲလ်ဖီးယား၊ ပင်ဆယ်ဗေးနီးယား',
        correct: false,
      },
      {
        text_en: 'Boston, MA',
        text_my: 'ဘော်စတွန်၊ မက်ဆာချူးဆက်',
        correct: false,
      },
    ],
  },
  {
    id: 'SYM-08',
    question_en: 'Where is the Statue of Liberty?',
    question_my: 'လွတ်လပ်ရေးရုပ်ထုသည် ဘယ်မှာလဲ။',
    category: 'Civics: Symbols and Holidays',
    studyAnswers: [
      { text_en: 'New York (Harbor)', text_my: 'နယူးယောက် (ဆိပ်ကမ်း)' },
      { text_en: 'Liberty Island', text_my: 'လစ်ဘာတီကျွန်း' },
    ],
    answers: [
      {
        text_en: 'New York (Harbor)',
        text_my: 'နယူးယောက် (ဆိပ်ကမ်း)',
        correct: true,
      },
      { text_en: 'Washington, D.C.', text_my: 'ဝါရှင်တန်ဒီစီ', correct: false },
      {
        text_en: 'San Francisco, CA',
        text_my: 'ဆန်ဖရန်စစ္စကို၊ ကယ်လီဖိုးနီးယား',
        correct: false,
      },
      {
        text_en: 'Boston, MA',
        text_my: 'ဘော်စတွန်၊ မက်ဆာချူးဆက်',
        correct: false,
      },
    ],
  },
  {
    id: 'SYM-09',
    question_en: 'Why does the flag have 13 stripes?',
    question_my: 'အလံတွင် အစင်းကြောင်း ၁၃ ခု အဘယ်ကြောင့် ရှိသနည်း။',
    category: 'Civics: Symbols and Holidays',
    studyAnswers: [
      {
        text_en: 'because there were 13 original colonies',
        text_my: 'မူလကိုလိုနီ ၁၃ ခု ရှိသောကြောင့်',
      },
      {
        text_en: 'because the stripes represent the original colonies',
        text_my: 'အစင်းကြောင်းများသည် မူလကိုလိုနီများကို ကိုယ်စားပြုသောကြောင့်',
      },
    ],
    answers: [
      {
        text_en: 'because there were 13 original colonies',
        text_my: 'မူလကိုလိုနီ ၁၃ ခု ရှိသောကြောင့်',
        correct: true,
      },
      {
        text_en: 'because there are 13 amendments',
        text_my: 'ပြင်ဆင်ချက် ၁၃ ခု ရှိသောကြောင့်',
        correct: false,
      },
      {
        text_en: 'because it is a lucky number',
        text_my: 'ကံကောင်းသောဂဏန်းဖြစ်သောကြောင့်',
        correct: false,
      },
      {
        text_en: 'because 13 ships sailed from Europe',
        text_my: 'ဥရောပမှ သင်္ဘော ၁၃ စင်း ရွက်လွှင့်ခဲ့သောကြောင့်',
        correct: false,
      },
    ],
  },
  {
    id: 'SYM-10',
    question_en: 'Why does the flag have 50 stars?',
    question_my: 'အလံတွင် ကြယ် ၅၀ အဘယ်ကြောင့် ရှိသနည်း။',
    category: 'Civics: Symbols and Holidays',
    studyAnswers: [
      {
        text_en: 'because there is one star for each state',
        text_my: 'ပြည်နယ်တစ်ခုစီအတွက် ကြယ်တစ်ပွင့် ရှိသောကြောင့်',
      },
      {
        text_en: 'because each star represents a state',
        text_my: 'ကြယ်တစ်ပွင့်စီသည် ပြည်နယ်တစ်ခုကို ကိုယ်စားပြုသောကြောင့်',
      },
      {
        text_en: 'because there are 50 states',
        text_my: 'ပြည်နယ် ၅၀ ရှိသောကြောင့်',
      },
    ],
    answers: [
      {
        text_en: 'because there are 50 states',
        text_my: 'ပြည်နယ် ၅၀ ရှိသောကြောင့်',
        correct: true,
      },
      {
        text_en: 'because there were 50 original colonies',
        text_my: 'မူလကိုလိုနီ ၅၀ ရှိသောကြောင့်',
        correct: false,
      },
      {
        text_en: 'because there are 50 amendments to the Constitution',
        text_my: 'ဖွဲ့စည်းပုံအခြေခံဥပဒေတွင် ပြင်ဆင်ချက် ၅၀ ရှိသောကြောင့်',
        correct: false,
      },
      {
        text_en: '50 states signed the Declaration of Independence',
        text_my: 'ပြည်နယ် ၅၀ က လွတ်လပ်ရေးကြေညာစာတမ်းကို လက်မှတ်ရေးထိုးခဲ့သောကြောင့်',
        correct: false,
      },
    ],
  },
  {
    id: 'SYM-11',
    question_en: 'What is the name of the national anthem?',
    question_my: 'နိုင်ငံတော်သီချင်း၏ အမည်ကား အဘယ်နည်း။',
    category: 'Civics: Symbols and Holidays',
    studyAnswers: [{ text_en: 'The Star-Spangled Banner', text_my: 'ကြယ်စုံလွှင့်အလံ' }],
    answers: [
      {
        text_en: 'The Star-Spangled Banner',
        text_my: 'ကြယ်စုံလွှင့်အလံ',
        correct: true,
      },
      {
        text_en: 'America the Beautiful',
        text_my: 'လှပသောအမေရိက',
        correct: false,
      },
      {
        text_en: 'God Bless America',
        text_my: 'ဘုရားသခင် အမေရိကကို ကောင်းချီးပေးပါစေ',
        correct: false,
      },
      {
        text_en: "My Country, 'Tis of Thee",
        text_my: 'ငါ့နိုင်ငံ၊ မင်းရဲ့',
        correct: false,
      },
    ],
  },
  {
    id: 'SYM-12',
    question_en: 'When do we celebrate Independence Day?',
    question_my: 'လွတ်လပ်ရေးနေ့ကို ဘယ်အချိန်မှာ ကျင်းပသလဲ။',
    category: 'Civics: Symbols and Holidays',
    studyAnswers: [{ text_en: 'July 4', text_my: 'ဇူလိုင် ၄' }],
    answers: [
      { text_en: 'July 4', text_my: 'ဇူလိုင် ၄', correct: true },
      { text_en: 'December 25', text_my: 'ဒီဇင်ဘာ ၂၅', correct: false },
      { text_en: 'January 1', text_my: 'ဇန်နဝါရီ ၁', correct: false },
      {
        text_en: 'The last Monday in May',
        text_my: 'မေလ၏ နောက်ဆုံး တနင်္လာနေ့',
        correct: false,
      },
    ],
  },
  {
    id: 'SYM-13',
    question_en: 'Name two national U.S. holidays.',
    question_my: 'အမေရိကန်နိုင်ငံ၏ နိုင်ငံတော်အားလပ်ရက်နှစ်ခုကို အမည်ပေးပါ။',
    category: 'Civics: Symbols and Holidays',
    studyAnswers: [
      { text_en: "New Year's Day", text_my: 'နှစ်သစ်ကူးနေ့' },
      {
        text_en: 'Martin Luther King, Jr. Day',
        text_my: 'မာတင် လူသာ ကင်း၊ ဂျူနီယာ နေ့',
      },
      { text_en: "Presidents' Day", text_my: 'သမ္မတများနေ့' },
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
      {
        text_en: 'Thanksgiving and Christmas',
        text_my: 'ကျေးဇူးတော်နေ့နှင့် ခရစ္စမတ်',
        correct: true,
      },
      {
        text_en: "April Fool's Day and Valentine's Day",
        text_my: 'ဧပြီလ၏ လူမိုက်နေ့နှင့် ချစ်သူများနေ့',
        correct: false,
      },
      {
        text_en: 'Super Bowl Sunday and Election Day',
        text_my: 'စူပါဘိုးလ် တနင်္ဂနွေနေ့နှင့် ရွေးကောက်ပွဲနေ့',
        correct: false,
      },
      {
        text_en: "St. Patrick's Day and Halloween",
        text_my: 'စိန့် ပက်ထရစ်နေ့နှင့် ဟယ်လိုဝင်း',
        correct: false,
      },
    ],
  },
];
