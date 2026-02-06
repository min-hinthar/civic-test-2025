import type { Question } from '@/types';

/**
 * Rights and Responsibilities
 *
 * ID Prefix: RR-## (10 questions)
 */

export const rightsResponsibilitiesQuestions: Question[] = [
  {
    id: 'RR-01',
    question_en:
      'There are four amendments to the Constitution about who can vote. Describe one of them.',
    question_my:
      'ဖွဲ့စည်းပုံအခြေခံဥပဒေတွင် မည်သူမဲပေးနိုင်သည်နှင့် ပတ်သက်၍ ပြင်ဆင်ချက်လေးခုရှိသည်။ ၎င်းတို့ထဲမှ တစ်ခုကို ဖော်ပြပါ။',
    category: 'Rights and Responsibilities',
    studyAnswers: [
      {
        text_en: 'Citizens eighteen (18) and older (can vote).',
        text_my: 'နိုင်ငံသား ဆယ့်ရှစ် (၁၈) နှစ်နှင့်အထက် (မဲပေးနိုင်သည်)။',
      },
      {
        text_en: "You don't have to pay (a poll tax) to vote.",
        text_my: 'မဲပေးရန် (မဲခွန်) ပေးဆောင်ရန် မလိုအပ်ပါ။',
      },
      {
        text_en: 'Any citizen can vote. (Women and men can vote.)',
        text_my: 'မည်သည့်နိုင်ငံသားမဆို မဲပေးနိုင်သည်။ (အမျိုးသမီးနှင့် အမျိုးသား မဲပေးနိုင်သည်။)',
      },
      {
        text_en: 'A male citizen of any race (can vote).',
        text_my: 'မည်သည့်လူမျိုးမဆို အမျိုးသားနိုင်ငံသား (မဲပေးနိုင်သည်)။',
      },
    ],
    answers: [
      {
        text_en: 'Citizens eighteen (18) and older can vote.',
        text_my: 'နိုင်ငံသား ဆယ့်ရှစ် (၁၈) နှစ်နှင့်အထက် မဲပေးနိုင်သည်။',
        correct: true,
      },
      {
        text_en: 'Only citizens with a job can vote.',
        text_my: 'အလုပ်ရှိသော နိုင်ငံသားများသာ မဲပေးနိုင်သည်။',
        correct: false,
      },
      {
        text_en: 'Only people who own land can vote.',
        text_my: 'မြေပိုင်ဆိုင်သူများသာ မဲပေးနိုင်သည်။',
        correct: false,
      },
      {
        text_en: 'Citizens must be twenty-one (21) to vote.',
        text_my: 'နိုင်ငံသားများသည် မဲပေးရန် အသက်နှစ်ဆယ့်တစ် (၂၁) နှစ်ရှိရမည်။',
        correct: false,
      },
    ],
  },
  {
    id: 'RR-02',
    question_en: 'What is one responsibility that is only for United States citizens?',
    question_my: 'အမေရိကန်နိုင်ငံသားများအတွက်သာဖြစ်သော တာဝန်တစ်ခုကား အဘယ်နည်း။',
    category: 'Rights and Responsibilities',
    studyAnswers: [
      {
        text_en: 'serve on a jury',
        text_my: 'ဂျူရီလူကြီးအဖြစ် တာဝန်ထမ်းဆောင်ရန်',
      },
      {
        text_en: 'vote in a federal election',
        text_my: 'ဖက်ဒရယ်ရွေးကောက်ပွဲတွင် မဲပေးရန်',
      },
    ],
    answers: [
      {
        text_en: 'vote in a federal election',
        text_my: 'ဖက်ဒရယ်ရွေးကောက်ပွဲတွင် မဲပေးရန်',
        correct: true,
      },
      { text_en: 'pay taxes', text_my: 'အခွန်ပေးဆောင်ရန်', correct: false },
      { text_en: 'obey the law', text_my: 'ဥပဒေကို လိုက်နာရန်', correct: false },
      { text_en: 'attend school', text_my: 'ကျောင်းတက်ရန်', correct: false },
    ],
  },
  {
    id: 'RR-03',
    question_en: 'Name one right only for United States citizens.',
    question_my: 'အမေရိကန်နိုင်ငံသားများအတွက်သာဖြစ်သော အခွင့်အရေးတစ်ခုကို အမည်ပေးပါ။',
    category: 'Rights and Responsibilities',
    studyAnswers: [
      {
        text_en: 'vote in a federal election',
        text_my: 'ဖက်ဒရယ်ရွေးကောက်ပွဲတွင် မဲပေးရန်',
      },
      {
        text_en: 'run for federal office',
        text_my: 'ဖက်ဒရယ်ရုံးအတွက် အရွေးခံရန်',
      },
    ],
    answers: [
      {
        text_en: 'run for federal office',
        text_my: 'ဖက်ဒရယ်ရုံးအတွက် အရွေးခံရန်',
        correct: true,
      },
      {
        text_en: 'freedom of speech',
        text_my: 'လွတ်လပ်စွာပြောဆိုခွင့်',
        correct: false,
      },
      {
        text_en: 'freedom of religion',
        text_my: 'ဘာသာရေးလွတ်လပ်ခွင့်',
        correct: false,
      },
      {
        text_en: 'the right to bear arms',
        text_my: 'လက်နက်ကိုင်ဆောင်ခွင့်',
        correct: false,
      },
    ],
  },
  {
    id: 'RR-04',
    question_en: 'What are two rights of everyone living in the United States?',
    question_my: 'အမေရိကန်ပြည်ထောင်စုတွင် နေထိုင်သူတိုင်း၏ အခွင့်အရေးနှစ်ခုကား အဘယ်နည်း။',
    category: 'Rights and Responsibilities',
    studyAnswers: [
      {
        text_en: 'freedom of expression',
        text_my: 'လွတ်လပ်စွာထုတ်ဖော်ပြောဆိုခွင့်',
      },
      { text_en: 'freedom of speech', text_my: 'လွတ်လပ်စွာပြောဆိုခွင့်' },
      { text_en: 'freedom of assembly', text_my: 'လွတ်လပ်စွာစည်းဝေးခွင့်' },
      {
        text_en: 'freedom to petition the government',
        text_my: 'အစိုးရကို အသနားခံစာတင်ခွင့်',
      },
      { text_en: 'freedom of religion', text_my: 'ဘာသာရေးလွတ်လပ်ခွင့်' },
      { text_en: 'the right to bear arms', text_my: 'လက်နက်ကိုင်ဆောင်ခွင့်' },
    ],
    answers: [
      {
        text_en: 'freedom of speech and freedom of religion',
        text_my: 'လွတ်လပ်စွာပြောဆိုခွင့်နှင့် ဘာသာရေးလွတ်လပ်ခွင့်',
        correct: true,
      },
      {
        text_en: 'the right to vote and the right to run for office',
        text_my: 'မဲပေးခွင့်နှင့် ရုံးအတွက်အရွေးခံခွင့်',
        correct: false,
      },
      {
        text_en: 'the right to a passport and the right to federal employment',
        text_my: 'နိုင်ငံကူးလက်မှတ်ရရှိခွင့်နှင့် ဖက်ဒရယ်အလုပ်အကိုင်ရရှိခွင့်',
        correct: false,
      },
      {
        text_en: 'the right to free housing and free healthcare',
        text_my: 'အခမဲ့အိမ်ရာနှင့် အခမဲ့ကျန်းမာရေးစောင့်ရှောက်မှုရရှိခွင့်',
        correct: false,
      },
    ],
  },
  {
    id: 'RR-05',
    question_en: 'What do we show loyalty to when we say the Pledge of Allegiance?',
    question_my: 'သစ္စာဆိုသည့်အခါ ကျွန်ုပ်တို့သည် မည်သည့်အရာကို သစ္စာစောင့်သိကြောင်း ပြသသနည်း။',
    category: 'Rights and Responsibilities',
    studyAnswers: [
      { text_en: 'the United States', text_my: 'အမေရိကန်ပြည်ထောင်စု' },
      { text_en: 'the flag', text_my: 'အလံ' },
    ],
    answers: [
      { text_en: 'the flag', text_my: 'အလံ', correct: true },
      { text_en: 'the President', text_my: 'သမ္မတ', correct: false },
      { text_en: 'Congress', text_my: 'ကွန်ဂရက်', correct: false },
      {
        text_en: 'your state of residence',
        text_my: 'သင်နေထိုင်ရာပြည်နယ်',
        correct: false,
      },
    ],
  },
  {
    id: 'RR-06',
    question_en: 'What is one promise you make when you become a United States citizen?',
    question_my: 'သင် အမေရိကန်နိုင်ငံသားဖြစ်လာသည့်အခါ သင်ပေးသော ကတိတစ်ခုကား အဘယ်နည်း။',
    category: 'Rights and Responsibilities',
    studyAnswers: [
      {
        text_en: 'give up loyalty to other countries',
        text_my: 'အခြားနိုင်ငံများအပေါ် သစ္စာစောင့်သိမှုကို စွန့်လွှတ်ပါ',
      },
      {
        text_en: 'defend the Constitution and laws of the United States',
        text_my: 'အမေရိကန်ပြည်ထောင်စု၏ ဖွဲ့စည်းပုံအခြေခံဥပဒေနှင့် ဥပဒေများကို ကာကွယ်ပါ',
      },
      {
        text_en: 'obey the laws of the United States',
        text_my: 'အမေရိကန်ပြည်ထောင်စု၏ ဥပဒေများကို လိုက်နာပါ',
      },
      {
        text_en: 'serve in the U.S. military (if needed)',
        text_my: 'အမေရိကန်စစ်တပ်တွင် တာဝန်ထမ်းဆောင်ပါ (လိုအပ်လျှင်)',
      },
      {
        text_en: 'serve (do important work for) the nation (if needed)',
        text_my: 'နိုင်ငံတော်အတွက် အရေးကြီးသောအလုပ်ကို ထမ်းဆောင်ပါ (လိုအပ်လျှင်)',
      },
      {
        text_en: 'be loyal to the United States',
        text_my: 'အမေရိကန်ပြည်ထောင်စုအပေါ် သစ္စာစောင့်သိပါ',
      },
    ],
    answers: [
      {
        text_en: 'obey the laws of the United States',
        text_my: 'အမေရိကန်ပြည်ထောင်စု၏ ဥပဒေများကို လိုက်နာပါ',
        correct: true,
      },
      {
        text_en: 'never travel to another country',
        text_my: 'အခြားနိုင်ငံသို့ ဘယ်တော့မှ မသွားပါ',
        correct: false,
      },
      {
        text_en: 'vote in every election',
        text_my: 'ရွေးကောက်ပွဲတိုင်းတွင် မဲပေးပါ',
        correct: false,
      },
      {
        text_en: 'speak only English',
        text_my: 'အင်္ဂလိပ်ဘာသာစကားကိုသာ ပြောပါ',
        correct: false,
      },
    ],
  },
  {
    id: 'RR-07',
    question_en: 'How old do citizens have to be to vote for President?',
    question_my: 'သမ္မတကို မဲပေးရန် နိုင်ငံသားများသည် အသက်ဘယ်လောက်ရှိရမည်နည်း။',
    category: 'Rights and Responsibilities',
    studyAnswers: [
      {
        text_en: 'eighteen (18) and older',
        text_my: 'ဆယ့်ရှစ် (၁၈) နှစ်နှင့်အထက်',
      },
    ],
    answers: [
      {
        text_en: 'eighteen (18) and older',
        text_my: 'ဆယ့်ရှစ် (၁၈) နှစ်နှင့်အထက်',
        correct: true,
      },
      {
        text_en: 'sixteen (16) and older',
        text_my: 'ဆယ့်ခြောက် (၁၆) နှစ်နှင့်အထက်',
        correct: false,
      },
      {
        text_en: 'twenty-one (21) and older',
        text_my: 'နှစ်ဆယ့်တစ် (၂၁) နှစ်နှင့်အထက်',
        correct: false,
      },
      {
        text_en: 'any age, if they are a citizen',
        text_my: 'နိုင်ငံသားဖြစ်လျှင် မည်သည့်အသက်အရွယ်မဆို',
        correct: false,
      },
    ],
  },
  {
    id: 'RR-08',
    question_en: 'What are two ways that Americans can participate in their democracy?',
    question_my:
      'အမေရိကန်များသည် ၎င်းတို့၏ ဒီမိုကရေစီတွင် မည်သည့်နည်းလမ်းနှစ်ခုဖြင့် ပါဝင်နိုင်သနည်း။',
    category: 'Rights and Responsibilities',
    studyAnswers: [
      { text_en: 'vote', text_my: 'မဲပေးပါ' },
      {
        text_en: 'join a political party',
        text_my: 'နိုင်ငံရေးပါတီတစ်ခုတွင် ပါဝင်ပါ',
      },
      { text_en: 'help with a campaign', text_my: 'လှုံ့ဆော်ရေးတွင် ကူညီပါ' },
      {
        text_en: 'join a civic group',
        text_my: 'ပြည်သူ့အဖွဲ့အစည်းတစ်ခုတွင် ပါဝင်ပါ',
      },
      {
        text_en: 'join a community group',
        text_my: 'ရပ်ရွာအဖွဲ့အစည်းတစ်ခုတွင် ပါဝင်ပါ',
      },
      {
        text_en: 'give an elected official your opinion on an issue',
        text_my:
          'ရွေးကောက်တင်မြှောက်ခံရသော အရာရှိတစ်ဦးအား ပြဿနာတစ်ခုအပေါ် သင်၏ထင်မြင်ချက်ကို ပေးပါ',
      },
      {
        text_en: 'call Senators and Representatives',
        text_my: 'အထက်လွှတ်တော်အမတ်များနှင့် ကိုယ်စားလှယ်များကို ခေါ်ဆိုပါ',
      },
      {
        text_en: 'publicly support or oppose an issue or policy',
        text_my: 'ပြဿနာတစ်ခု သို့မဟုတ် မူဝါဒတစ်ခုကို လူသိရှင်ကြား ထောက်ခံပါ သို့မဟုတ် ဆန့်ကျင်ပါ',
      },
      { text_en: 'run for office', text_my: 'ရုံးအတွက် အရွေးခံပါ' },
      { text_en: 'write to a newspaper', text_my: 'သတင်းစာသို့ စာရေးပါ' },
    ],
    answers: [
      {
        text_en: 'vote and run for office',
        text_my: 'မဲပေးပြီး ရုံးအတွက်အရွေးခံပါ',
        correct: true,
      },
      {
        text_en: 'pay taxes and obey the law',
        text_my: 'အခွန်ပေးဆောင်ပြီး ဥပဒေကို လိုက်နာပါ',
        correct: false,
      },
      {
        text_en: 'fly the American flag and say the Pledge of Allegiance',
        text_my: 'အမေရိကန်အလံလွှင့်ပြီး သစ္စာဆိုပါ',
        correct: false,
      },
      {
        text_en: 'get a job and open a bank account',
        text_my: 'အလုပ်ရပြီး ဘဏ်အကောင့်ဖွင့်ပါ',
        correct: false,
      },
    ],
  },
  {
    id: 'RR-09',
    question_en: 'When is the last day you can send in federal income tax forms?',
    question_my: 'ဖက်ဒရယ်ဝင်ငွေခွန်ပုံစံများကို သင် နောက်ဆုံး ဘယ်နေ့ ပေးပို့နိုင်သနည်း။',
    category: 'Rights and Responsibilities',
    studyAnswers: [{ text_en: 'April 15', text_my: 'ဧပြီ ၁၅' }],
    answers: [
      { text_en: 'April 15', text_my: 'ဧပြီ ၁၅', correct: true },
      { text_en: 'January 1', text_my: 'ဇန်နဝါရီ ၁', correct: false },
      { text_en: 'December 31', text_my: 'ဒီဇင်ဘာ ၃၁', correct: false },
      { text_en: 'July 4', text_my: 'ဇူလိုင် ၄', correct: false },
    ],
  },
  {
    id: 'RR-10',
    question_en: 'When must all men register for the Selective Service?',
    question_my: 'အမျိုးသားအားလုံးသည် Selective Service အတွက် ဘယ်အချိန်မှာ မှတ်ပုံတင်ရမလဲ။',
    category: 'Rights and Responsibilities',
    studyAnswers: [
      {
        text_en: 'at age eighteen (18)',
        text_my: 'အသက် ဆယ့်ရှစ် (၁၈) နှစ်တွင်',
      },
      {
        text_en: 'between eighteen (18) and twenty-six (26)',
        text_my: 'ဆယ့်ရှစ် (၁၈) နှင့် နှစ်ဆယ့်ခြောက် (၂၆) နှစ်ကြား',
      },
    ],
    answers: [
      {
        text_en: 'at age eighteen (18)',
        text_my: 'အသက် ဆယ့်ရှစ် (၁၈) နှစ်တွင်',
        correct: true,
      },
      {
        text_en: 'at age sixteen (16)',
        text_my: 'အသက် ဆယ့်ခြောက် (၁၆) နှစ်တွင်',
        correct: false,
      },
      {
        text_en: "when they get a driver's license",
        text_my: 'ယာဉ်မောင်းလိုင်စင်ရသည့်အခါ',
        correct: false,
      },
      {
        text_en: 'they are not required to register',
        text_my: 'မှတ်ပုံတင်ရန် မလိုအပ်ပါ',
        correct: false,
      },
    ],
  },
];
