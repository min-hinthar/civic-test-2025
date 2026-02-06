import type { Question } from '@/types';

/**
 * American History: Colonial Period and Independence
 *
 * ID Prefix: HIST-C## (13 questions)
 */

export const colonialHistoryQuestions: Question[] = [
  {
    id: 'HIST-C01',
    question_en: 'What is one reason colonists came to America?',
    question_my: 'ကိုလိုနိစ်များ အမေရိကသို့ လာရောက်ရသည့် အကြောင်းရင်းတစ်ခုကား အဘယ်နည်း။',
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
      { text_en: 'religious freedom', text_my: 'ဘာသာရေးလွတ်လပ်ခွင့်', correct: true },
      {
        text_en: 'to join the British army',
        text_my: 'ဗြိတိသျှစစ်တပ်တွင် ပါဝင်ရန်',
        correct: false,
      },
      { text_en: 'for vacation', text_my: 'အားလပ်ရက်အတွက်', correct: false },
      { text_en: 'to pay higher taxes', text_my: 'အခွန်ပိုပေးဆောင်ရန်', correct: false },
    ],
  },
  {
    id: 'HIST-C02',
    question_en: 'Who lived in America before the Europeans arrived?',
    question_my: 'ဥရောပသားများ မရောက်လာမီ အမေရိကတွင် မည်သူ နေထိုင်ခဲ့သနည်း။',
    category: 'American History: Colonial Period and Independence',
    studyAnswers: [
      { text_en: 'American Indians', text_my: 'အမေရိကန် အင်ဒီးယန်းများ' },
      { text_en: 'Native Americans', text_my: 'ဇာတိ အမေရိကန်များ' },
    ],
    answers: [
      { text_en: 'Native Americans', text_my: 'ဇာတိအမေရိကန် အင်ဒီးယန်းများ', correct: true },
      { text_en: 'Canadians', text_my: 'ကနေဒါလူမျိုးများ', correct: false },
      { text_en: 'Mexicans', text_my: 'မက္ကဆီကိုလူမျိုးများ', correct: false },
      { text_en: 'No one', text_my: 'ဘယ်သူမှ မရှိ', correct: false },
    ],
  },
  {
    id: 'HIST-C03',
    question_en: 'What group of people was taken to America and sold as slaves?',
    question_my: 'မည်သည့်လူမျိုးအုပ်စုကို အမေရိကသို့ ခေါ်ဆောင်ပြီး ကျွန်အဖြစ် ရောင်းချခဲ့သနည်း။',
    category: 'American History: Colonial Period and Independence',
    studyAnswers: [
      { text_en: 'Africans', text_my: 'အာဖရိကန်များ' },
      { text_en: 'people from Africa', text_my: 'အာဖရိကမှ လူများ' },
    ],
    answers: [
      { text_en: 'Africans', text_my: 'အာဖရိကန်များ', correct: true },
      { text_en: 'Europeans', text_my: 'ဥရောပသားများ', correct: false },
      { text_en: 'Asians', text_my: 'အာရှတိုက်သားများ', correct: false },
      { text_en: 'Native Americans', text_my: 'ဇာတိ အမေရိကန်များ', correct: false },
    ],
  },
  {
    id: 'HIST-C04',
    question_en: 'Why did the colonists fight the British?',
    question_my: 'ကိုလိုနိစ်များသည် ဗြိတိသျှတို့ကို အဘယ်ကြောင့် တိုက်ခိုက်ခဲ့သနည်း။',
    category: 'American History: Colonial Period and Independence',
    studyAnswers: [
      {
        text_en: 'because of high taxes (taxation without representation)',
        text_my: 'အခွန်ကြီးမြင့်မှုကြောင့် (ကိုယ်စားပြုမှုမရှိဘဲ အခွန်ကောက်ခံခြင်း)',
      },
      {
        text_en: 'because the British army stayed in their houses (boarding, quartering)',
        text_my:
          'ဗြိတိသျှစစ်တပ်သည် ၎င်းတို့၏အိမ်များတွင် နေထိုင်သောကြောင့် (တည်းခိုခြင်း၊ နေရာချထားခြင်း)',
      },
      {
        text_en: "because they didn't have self-government",
        text_my: 'ကိုယ်ပိုင်အုပ်ချုပ်ရေး မရှိသောကြောင့်',
      },
    ],
    answers: [
      { text_en: 'because of high taxes', text_my: 'အခွန်ကြီးမြင့်မှုကြောင့်', correct: true },
      {
        text_en: 'because they wanted to join France',
        text_my: 'ပြင်သစ်နှင့် ပူးပေါင်းလိုသောကြောင့်',
        correct: false,
      },
      {
        text_en: 'because of religious differences',
        text_my: 'ဘာသာရေးကွဲပြားမှုကြောင့်',
        correct: false,
      },
      {
        text_en: 'because the British invaded Canada',
        text_my: 'ဗြိတိသျှတို့က ကနေဒါကို ကျူးကျော်သောကြောင့်',
        correct: false,
      },
    ],
  },
  {
    id: 'HIST-C05',
    question_en: 'Who wrote the Declaration of Independence?',
    question_my: 'လွတ်လပ်ရေးကြေညာစာတမ်းကို မည်သူ ရေးသားခဲ့သနည်း။',
    category: 'American History: Colonial Period and Independence',
    studyAnswers: [{ text_en: 'Thomas Jefferson', text_my: 'သောမတ်စ် ဂျက်ဖာဆင်' }],
    answers: [
      { text_en: 'Thomas Jefferson', text_my: 'သောမတ်စ် ဂျက်ဖာဆင်', correct: true },
      { text_en: 'George Washington', text_my: 'ဂျော့ခ်ျ ဝါရှင်တန်', correct: false },
      { text_en: 'Abraham Lincoln', text_my: 'အာဗြဟံ လင်ကွန်း', correct: false },
      { text_en: 'Benjamin Franklin', text_my: 'ဘင်ဂျမင် ဖရန်ကလင်', correct: false },
    ],
  },
  {
    id: 'HIST-C06',
    question_en: 'When was the Declaration of Independence adopted?',
    question_my: 'လွတ်လပ်ရေးကြေညာစာတမ်းကို ဘယ်အချိန်မှာ အတည်ပြုခဲ့သလဲ။',
    category: 'American History: Colonial Period and Independence',
    studyAnswers: [{ text_en: 'July 4, 1776', text_my: 'ဇူလိုင် ၄၊ ၁၇၇၆' }],
    answers: [
      { text_en: 'July 4, 1776', text_my: 'ဇူလိုင် ၄၊ ၁၇၇၆', correct: true },
      { text_en: 'December 7, 1941', text_my: 'ဒီဇင်ဘာ ၇၊ ၁၉၄၁', correct: false },
      { text_en: 'April 12, 1861', text_my: 'ဧပြီ ၁၂၊ ၁၈၆၁', correct: false },
      { text_en: 'September 17, 1787', text_my: 'စက်တင်ဘာ ၁၇၊ ၁၇၈၇', correct: false },
    ],
  },
  {
    id: 'HIST-C07',
    question_en: 'There were 13 original states. Name three.',
    question_my: 'မူလပြည်နယ် ၁၃ ခုရှိခဲ့သည်။ သုံးခုကို အမည်ပေးပါ။',
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
      {
        text_en: 'New York, New Jersey, New Hampshire',
        text_my: 'နယူးယောက်၊ နယူးဂျာစီ၊ နယူးဟမ်ရှိုင်းယား',
        correct: true,
      },
      {
        text_en: 'Florida, Texas, California',
        text_my: 'ဖလော်ရီဒါ၊ တက္ကဆက်၊ ကယ်လီဖိုးနီးယား',
        correct: false,
      },
      {
        text_en: 'Ohio, Michigan, Indiana',
        text_my: 'အိုဟိုင်းယိုး၊ မီရှီဂန်၊ အင်ဒီယားနား',
        correct: false,
      },
      {
        text_en: 'Washington, Oregon, Alaska',
        text_my: 'ဝါရှင်တန်၊ အော်ရီဂွန်၊ အလက်စကာ',
        correct: false,
      },
    ],
  },
  {
    id: 'HIST-C08',
    question_en: 'What happened at the Constitutional Convention?',
    question_my: 'ဖွဲ့စည်းပုံအခြေခံဥပဒေညီလာခံတွင် ဘာဖြစ်ခဲ့သလဲ။',
    category: 'American History: Colonial Period and Independence',
    studyAnswers: [
      {
        text_en: 'The Constitution was written.',
        text_my: 'ဖွဲ့စည်းပုံအခြေခံဥပဒေကို ရေးသားခဲ့သည်။',
      },
      {
        text_en: 'The Founding Fathers wrote the Constitution.',
        text_my: 'တည်ထောင်သူဖခင်ကြီးများသည် ဖွဲ့စည်းပုံအခြေခံဥပဒေကို ရေးသားခဲ့သည်။',
      },
    ],
    answers: [
      {
        text_en: 'The Constitution was written.',
        text_my: 'ဖွဲ့စည်းပုံအခြေခံဥပဒေကို ရေးသားခဲ့သည်။',
        correct: true,
      },
      {
        text_en: 'The Declaration of Independence was written.',
        text_my: 'လွတ်လပ်ရေးကြေညာစာတမ်းကို ရေးသားခဲ့သည်။',
        correct: false,
      },
      {
        text_en: 'The Emancipation Proclamation was signed.',
        text_my: 'လွတ်မြောက်ရေး ကြေညာချက်ကို လက်မှတ်ရေးထိုးခဲ့သည်။',
        correct: false,
      },
      {
        text_en: 'George Washington was elected President.',
        text_my: 'ဂျော့ခ်ျ ဝါရှင်တန်ကို သမ္မတအဖြစ် ရွေးကောက်တင်မြှောက်ခဲ့သည်။',
        correct: false,
      },
    ],
  },
  {
    id: 'HIST-C09',
    question_en: 'When was the Constitution written?',
    question_my: 'ဖွဲ့စည်းပုံအခြေခံဥပဒေကို ဘယ်အချိန်မှာ ရေးသားခဲ့သလဲ။',
    category: 'American History: Colonial Period and Independence',
    studyAnswers: [{ text_en: '1787', text_my: '၁၇၈၇' }],
    answers: [
      { text_en: '1787', text_my: '၁၇၈၇', correct: true },
      { text_en: '1776', text_my: '၁၇၇၆', correct: false },
      { text_en: '1865', text_my: '၁၈၆၅', correct: false },
      { text_en: '1901', text_my: '၁၉၀၁', correct: false },
    ],
  },
  {
    id: 'HIST-C10',
    question_en:
      'The Federalist Papers supported the passage of the U.S. Constitution. Name one of the writers.',
    question_my:
      'ဖက်ဒရယ်လစ်စာတမ်းများသည် အမေရိကန်ဖွဲ့စည်းပုံအခြေခံဥပဒေကို အတည်ပြုရန် ထောက်ခံခဲ့သည်။ စာရေးဆရာတစ်ဦးကို အမည်ပေးပါ။',
    category: 'American History: Colonial Period and Independence',
    studyAnswers: [
      { text_en: '(James) Madison', text_my: '(ဂျိမ်းစ်) မက်ဒီဆင်' },
      { text_en: '(Alexander) Hamilton', text_my: '(အလက်ဇန္ဒား) ဟာမီလ်တန်' },
      { text_en: '(John) Jay', text_my: '(ဂျွန်) ဂျေး' },
      { text_en: 'Publius', text_my: 'ပတ်ဘလီရပ်စ်' },
    ],
    answers: [
      { text_en: '(Alexander) Hamilton', text_my: '(အလက်ဇန္ဒား) ဟာမီလ်တန်', correct: true },
      { text_en: 'Thomas Jefferson', text_my: 'သောမတ်စ် ဂျက်ဖာဆင်', correct: false },
      { text_en: 'George Washington', text_my: 'ဂျော့ခ်ျ ဝါရှင်တန်', correct: false },
      { text_en: 'Abraham Lincoln', text_my: 'အာဗြဟံ လင်ကွန်း', correct: false },
    ],
  },
  {
    id: 'HIST-C11',
    question_en: 'What is one thing Benjamin Franklin is famous for?',
    question_my: 'ဘင်ဂျမင် ဖရန်ကလင်သည် မည်သည့်အရာတစ်ခုကြောင့် ကျော်ကြားသနည်း။',
    category: 'American History: Colonial Period and Independence',
    studyAnswers: [
      { text_en: 'U.S. diplomat', text_my: 'အမေရိကန် သံတမန်' },
      {
        text_en: 'oldest member of the Constitutional Convention',
        text_my: 'ဖွဲ့စည်းပုံအခြေခံဥပဒေညီလာခံ၏ အသက်အကြီးဆုံးအဖွဲ့ဝင်',
      },
      {
        text_en: 'first Postmaster General of the United States',
        text_my: 'အမေရိကန်ပြည်ထောင်စု၏ ပထမဆုံး စာတိုက်ဦးစီးချုပ်',
      },
      {
        text_en: 'writer of "Poor Richard\'s Almanac"',
        text_my: '"ဆင်းရဲသော ရစ်ချတ်၏ ပြက္ခဒိန်" ကို ရေးသားသူ',
      },
      {
        text_en: 'started the first free libraries',
        text_my: 'ပထမဆုံး အခမဲ့စာကြည့်တိုက်များကို စတင်ခဲ့သည်',
      },
    ],
    answers: [
      { text_en: 'U.S. diplomat', text_my: 'အမေရိကန် သံတမန်', correct: true },
      {
        text_en: 'Third President of the United States',
        text_my: 'အမေရိကန်ပြည်ထောင်စု၏ တတိယမြောက်သမ္မတ',
        correct: false,
      },
      {
        text_en: 'General of the Continental Army',
        text_my: 'တိုက်ကြီးစစ်တပ်၏ ဗိုလ်ချုပ်',
        correct: false,
      },
      {
        text_en: 'Wrote the Star-Spangled Banner',
        text_my: 'ကြယ်စုံလွှင့်အလံကို ရေးသားခဲ့သည်',
        correct: false,
      },
    ],
  },
  {
    id: 'HIST-C12',
    question_en: 'Who is the "Father of Our Country"?',
    question_my: '"ကျွန်ုပ်တို့နိုင်ငံ၏ ဖခင်" သည် မည်သူနည်း။',
    category: 'American History: Colonial Period and Independence',
    studyAnswers: [{ text_en: '(George) Washington', text_my: '(ဂျော့ခ်ျ) ဝါရှင်တန်' }],
    answers: [
      { text_en: '(George) Washington', text_my: '(ဂျော့ခ်ျ) ဝါရှင်တန်', correct: true },
      { text_en: 'Abraham Lincoln', text_my: 'အာဗြဟံ လင်ကွန်း', correct: false },
      { text_en: 'Thomas Jefferson', text_my: 'သောမတ်စ် ဂျက်ဖာဆင်', correct: false },
      { text_en: 'Benjamin Franklin', text_my: 'ဘင်ဂျမင် ဖရန်ကလင်', correct: false },
    ],
  },
  {
    id: 'HIST-C13',
    question_en: 'Who was the first President?',
    question_my: 'ပထမဆုံးသမ္မတသည် မည်သူနည်း။',
    category: 'American History: Colonial Period and Independence',
    studyAnswers: [{ text_en: '(George) Washington', text_my: '(ဂျော့ခ်ျ) ဝါရှင်တန်' }],
    answers: [
      { text_en: '(George) Washington', text_my: '(ဂျော့ခ်ျ) ဝါရှင်တန်', correct: true },
      { text_en: 'John Adams', text_my: 'ဂျွန် အဒမ်', correct: false },
      { text_en: 'Thomas Jefferson', text_my: 'သောမတ်စ် ဂျက်ဖာဆင်', correct: false },
      { text_en: 'Abraham Lincoln', text_my: 'အာဗြဟံ လင်ကွန်း', correct: false },
    ],
  },
];
