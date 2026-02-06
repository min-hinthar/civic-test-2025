import type { Question } from '@/types';

/**
 * American History: 1800s
 *
 * ID Prefix: HIST-1## (7 questions)
 */

export const history1800sQuestions: Question[] = [
  {
    id: 'HIST-101',
    question_en: 'What territory did the United States buy from France in 1803?',
    question_my:
      '၁၈၀၃ ခုနှစ်တွင် အမေရိကန်ပြည်ထောင်စုသည် ပြင်သစ်ထံမှ မည်သည့်နယ်မြေကို ဝယ်ယူခဲ့သနည်း။',
    category: 'American History: 1800s',
    studyAnswers: [
      { text_en: 'the Louisiana Territory', text_my: 'လူးဝစ်စီယားနား နယ်မြေ' },
      { text_en: 'Louisiana', text_my: 'လူးဝစ်စီယားနား' },
    ],
    answers: [
      {
        text_en: 'the Louisiana Territory',
        text_my: 'လူးဝစ်စီယားနား နယ်မြေ',
        correct: true,
      },
      { text_en: 'Alaska', text_my: 'အလက်စကာ', correct: false },
      { text_en: 'Florida', text_my: 'ဖလော်ရီဒါ', correct: false },
      { text_en: 'California', text_my: 'ကယ်လီဖိုးနီးယား', correct: false },
    ],
  },
  {
    id: 'HIST-102',
    question_en: 'Name one war fought by the United States in the 1800s.',
    question_my:
      '၁၈၀၀ ပြည့်နှစ်များတွင် အမေရိကန်ပြည်ထောင်စု တိုက်ခိုက်ခဲ့သော စစ်ပွဲတစ်ခုကို အမည်ပေးပါ။',
    category: 'American History: 1800s',
    studyAnswers: [
      { text_en: 'War of 1812', text_my: '၁၈၁၂ စစ်ပွဲ' },
      { text_en: 'Mexican-American War', text_my: 'မက္ကဆီကန်-အမေရိကန် စစ်ပွဲ' },
      { text_en: 'Civil War', text_my: 'ပြည်တွင်းစစ်' },
      { text_en: 'Spanish-American War', text_my: 'စပိန်-အမေရိကန် စစ်ပွဲ' },
    ],
    answers: [
      { text_en: 'Civil War', text_my: 'ပြည်တွင်းစစ်', correct: true },
      { text_en: 'Revolutionary War', text_my: 'တော်လှန်ရေးစစ်ပွဲ', correct: false },
      { text_en: 'World War I', text_my: 'ပထမကမ္ဘာစစ်', correct: false },
      { text_en: 'Korean War', text_my: 'ကိုရီးယားစစ်ပွဲ', correct: false },
    ],
  },
  {
    id: 'HIST-103',
    question_en: 'Name the U.S. war between the North and the South.',
    question_my: 'မြောက်ပိုင်းနှင့် တောင်ပိုင်းကြားရှိ အမေရိကန်စစ်ပွဲကို အမည်ပေးပါ။',
    category: 'American History: 1800s',
    studyAnswers: [
      { text_en: 'the Civil War', text_my: 'ပြည်တွင်းစစ်' },
      { text_en: 'the War between the States', text_my: 'ပြည်နယ်များကြား စစ်ပွဲ' },
    ],
    answers: [
      { text_en: 'the Civil War', text_my: 'ပြည်တွင်းစစ်', correct: true },
      { text_en: 'the War of 1812', text_my: '၁၈၁၂ စစ်ပွဲ', correct: false },
      { text_en: 'the Revolutionary War', text_my: 'တော်လှန်ရေးစစ်ပွဲ', correct: false },
      {
        text_en: 'the Mexican-American War',
        text_my: 'မက္ကဆီကန်-အမေရိကန် စစ်ပွဲ',
        correct: false,
      },
    ],
  },
  {
    id: 'HIST-104',
    question_en: 'Name one problem that led to the Civil War.',
    question_my: 'ပြည်တွင်းစစ်သို့ ဦးတည်စေသော ပြဿနာတစ်ခုကို အမည်ပေးပါ။',
    category: 'American History: 1800s',
    studyAnswers: [
      { text_en: 'slavery', text_my: 'ကျွန်စနစ်' },
      { text_en: 'economic reasons', text_my: 'စီးပွားရေးအကြောင်းရင်းများ' },
      { text_en: "states' rights", text_my: 'ပြည်နယ်များ၏ အခွင့်အရေးများ' },
    ],
    answers: [
      { text_en: 'slavery', text_my: 'ကျွန်စနစ်', correct: true },
      {
        text_en: 'taxation without representation',
        text_my: 'ကိုယ်စားပြုမှုမရှိဘဲ အခွန်ကောက်ခံခြင်း',
        correct: false,
      },
      { text_en: 'the price of tea', text_my: 'လက်ဖက်ရည်စျေးနှုန်း', correct: false },
      { text_en: 'oil disputes', text_my: 'ရေနံအငြင်းပွားမှုများ', correct: false },
    ],
  },
  {
    id: 'HIST-105',
    question_en: 'What was one important thing that Abraham Lincoln did?',
    question_my: 'အာဗြဟံ လင်ကွန်း လုပ်ခဲ့သော အရေးကြီးသည့်အရာတစ်ခုကား အဘယ်နည်း။',
    category: 'American History: 1800s',
    studyAnswers: [
      {
        text_en: 'freed the slaves (Emancipation Proclamation)',
        text_my: 'ကျွန်များကို လွတ်မြောက်စေခဲ့သည် (လွတ်မြောက်ရေး ကြေညာချက်)',
      },
      {
        text_en: 'saved (or preserved) the Union',
        text_my: 'ပြည်ထောင်စုကို ကယ်တင်ခဲ့သည် (သို့မဟုတ် ထိန်းသိမ်းခဲ့သည်)',
      },
      {
        text_en: 'led the United States during the Civil War',
        text_my: 'ပြည်တွင်းစစ်အတွင်း အမေရိကန်ပြည်ထောင်စုကို ဦးဆောင်ခဲ့သည်',
      },
    ],
    answers: [
      {
        text_en: 'freed the slaves (Emancipation Proclamation)',
        text_my: 'ကျွန်များကို လွတ်မြောက်စေခဲ့သည် (လွတ်မြောက်ရေး ကြေညာချက်)',
        correct: true,
      },
      {
        text_en: 'wrote the Declaration of Independence',
        text_my: 'လွတ်လပ်ရေးကြေညာစာတမ်းကို ရေးသားခဲ့သည်',
        correct: false,
      },
      {
        text_en: 'was the first Postmaster General',
        text_my: 'ပထမဆုံး စာတိုက်ဦးစီးချုပ်ဖြစ်ခဲ့သည်',
        correct: false,
      },
      {
        text_en: 'purchased the Louisiana Territory',
        text_my: 'လူးဝစ်စီယားနား နယ်မြေကို ဝယ်ယူခဲ့သည်',
        correct: false,
      },
    ],
  },
  {
    id: 'HIST-106',
    question_en: 'What did the Emancipation Proclamation do?',
    question_my: 'လွတ်မြောက်ရေး ကြေညာချက်က ဘာလုပ်ခဲ့သလဲ။',
    category: 'American History: 1800s',
    studyAnswers: [
      { text_en: 'freed the slaves', text_my: 'ကျွန်များကို လွတ်မြောက်စေခဲ့သည်' },
      {
        text_en: 'freed slaves in the Confederacy',
        text_my: 'ကွန်ဖက်ဒရေးရှင်းရှိ ကျွန်များကို လွတ်မြောက်စေခဲ့သည်',
      },
      {
        text_en: 'freed slaves in the Confederate states',
        text_my: 'ကွန်ဖက်ဒရေးရှင်းပြည်နယ်များရှိ ကျွန်များကို လွတ်မြောက်စေခဲ့သည်',
      },
      {
        text_en: 'freed slaves in most Southern states',
        text_my: 'တောင်ပိုင်းပြည်နယ်အများစုရှိ ကျွန်များကို လွတ်မြောက်စေခဲ့သည်',
      },
    ],
    answers: [
      {
        text_en: 'freed the slaves',
        text_my: 'ကျွန်များကို လွတ်မြောက်စေခဲ့သည်',
        correct: true,
      },
      {
        text_en: 'gave women the right to vote',
        text_my: 'အမျိုးသမီးများကို မဲပေးခွင့်ပေးခဲ့သည်',
        correct: false,
      },
      {
        text_en: 'ended the Civil War',
        text_my: 'ပြည်တွင်းစစ်ကို အဆုံးသတ်ခဲ့သည်',
        correct: false,
      },
      {
        text_en: 'declared independence from Britain',
        text_my: 'ဗြိတိန်ထံမှ လွတ်လပ်ရေးကြေညာခဲ့သည်',
        correct: false,
      },
    ],
  },
  {
    id: 'HIST-107',
    question_en: 'What did Susan B. Anthony do?',
    question_my: 'ဆူဇန် ဘီ အန်သိုနီက ဘာလုပ်ခဲ့သလဲ။',
    category: 'American History: 1800s',
    studyAnswers: [
      {
        text_en: "fought for women's rights",
        text_my: 'အမျိုးသမီးအခွင့်အရေးအတွက် တိုက်ပွဲဝင်ခဲ့သည်',
      },
      {
        text_en: 'fought for civil rights',
        text_my: 'ပြည်သူ့အခွင့်အရေးအတွက် တိုက်ပွဲဝင်ခဲ့သည်',
      },
    ],
    answers: [
      {
        text_en: "fought for women's rights",
        text_my: 'အမျိုးသမီးအခွင့်အရေးအတွက် တိုက်ပွဲဝင်ခဲ့သည်',
        correct: true,
      },
      {
        text_en: 'was the first woman elected to Congress',
        text_my: 'ကွန်ဂရက်သို့ ပထမဆုံးရွေးကောက်တင်မြှောက်ခံရသော အမျိုးသမီးဖြစ်ခဲ့သည်',
        correct: false,
      },
      {
        text_en: 'founded the Red Cross',
        text_my: 'ကြက်ခြေနီအသင်းကို တည်ထောင်ခဲ့သည်',
        correct: false,
      },
      {
        text_en: 'was a general in the Civil War',
        text_my: 'ပြည်တွင်းစစ်တွင် ဗိုလ်ချုပ်တစ်ဦးဖြစ်ခဲ့သည်',
        correct: false,
      },
    ],
  },
];
