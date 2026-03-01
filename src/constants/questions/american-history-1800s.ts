import type { Question } from '@/types';

/**
 * American History: 1800s
 *
 * ID Prefix: HIST-1## (7 questions)
 * @verified claude-initial-pass 2026-02-18 — pending 3-AI consensus
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
    explanation: {
      brief_en:
        'In 1803, President Thomas Jefferson purchased the Louisiana Territory from France for $15 million. This "Louisiana Purchase" doubled the size of the United States and opened the West for expansion.',
      brief_my:
        '၁၈၀၃ ခုနှစ်တွင် သမ္မတ သောမတ်စ် ဂျက်ဖာဆင်သည် လူးဝစ်စီယားနားနယ်မြေကို ပြင်သစ်ထံမှ ဒေါ်လာ ၁၅ သန်းဖြင့် ဝယ်ယူခဲ့သည်။ ဤ "လူးဝစ်စီယားနားဝယ်ယူမှု" က အမေရိကန်ပြည်ထောင်စု၏ အကျယ်အဝန်းကို နှစ်ဆ တိုးစေခဲ့သည်။',
      mnemonic_en:
        'Think "Jefferson Doubled" — Jefferson bought Louisiana and doubled the country\'s size in 1803.',
      funFact_en:
        'The Louisiana Purchase cost about 4 cents per acre — one of the greatest real estate deals in history! It covered 828,000 square miles.',
      funFact_my:
        'လူးဝစ်စီယားနားဝယ်ယူမှုသည် ဧက တစ်ဧကလျှင် ၄ စင့်ခန့် ကုန်ကျခဲ့သည် — သမိုင်းတွင် အကြီးမားဆုံး အိမ်ခြံမြေ သဘောတူညီချက်များထဲမှ တစ်ခု!',
      commonMistake_en:
        'Alaska was purchased from Russia in 1867, not France in 1803. Florida was acquired from Spain. The Louisiana Purchase was specifically from France under Napoleon.',
      commonMistake_my:
        'အလက်စကာကို ၁၈၆၇ ခုနှစ်တွင် ရုရှားထံမှ ဝယ်ယူခဲ့ပြီး ပြင်သစ်ထံမှ မဟုတ်ပါ။ ဖလော်ရီဒါကို စပိန်ထံမှ ရယူခဲ့သည်။ လူးဝစ်စီယားနားဝယ်ယူမှုသည် နပိုလီယံလက်ထက် ပြင်သစ်ထံမှ ဖြစ်သည်။',
      citation: 'Louisiana Purchase Treaty, 1803',
      relatedQuestionIds: ['HIST-C05'],
    },
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
    explanation: {
      brief_en:
        'The U.S. fought four major wars in the 1800s: the War of 1812, the Mexican-American War, the Civil War, and the Spanish-American War. The Civil War (1861-1865) was the deadliest, fought between the North and South.',
      brief_my:
        'အမေရိကန်သည် ၁၈၀၀ ပြည့်နှစ်များတွင် အဓိကစစ်ပွဲ ၄ ခု တိုက်ခိုက်ခဲ့သည် — ၁၈၁၂ စစ်ပွဲ၊ မက္ကဆီကန်-အမေရိကန်စစ်ပွဲ၊ ပြည်တွင်းစစ်နှင့် စပိန်-အမေရိကန်စစ်ပွဲ။ ပြည်တွင်းစစ် (၁၈၆၁-၁၈၆၅) သည် အသက်ဆုံးရှုံးမှု အများဆုံးဖြစ်သည်။',
      mnemonic_en: 'Four 1800s wars: "1-M-C-S" — 1812, Mexican-American, Civil, Spanish-American.',
      commonMistake_en:
        'The Revolutionary War (1775-1783) was in the 1700s, not the 1800s. World War I (1914-1918) was in the 1900s.',
      commonMistake_my:
        'တော်လှန်ရေးစစ်ပွဲ (၁၇၇၅-၁၇၈၃) သည် ၁၇၀၀ ပြည့်နှစ်များတွင် ဖြစ်သည်၊ ၁၈၀၀ ပြည့်နှစ်များ မဟုတ်ပါ။ ပထမကမ္ဘာစစ် (၁၉၁၄-၁၉၁၈) သည် ၁၉၀၀ ပြည့်နှစ်များတွင် ဖြစ်သည်။',
      citation:
        'Various conflicts: War of 1812, Mexican-American War (1846-1848), Civil War (1861-1865), Spanish-American War (1898)',
      funFact_en:
        'The War of 1812 is sometimes called "the Second War of Independence" because America fought Britain again. The White House was burned during this war.',
      funFact_my:
        '၁၈၁၂ စစ်ပွဲကို "ဒုတိယလွတ်လပ်ရေးစစ်ပွဲ" ဟု တခါတရံ ခေါ်ကြသည်၊ အကြောင်းမှာ အမေရိကက ဗြိတိန်ကို ထပ်မံတိုက်ခိုက်ခဲ့သောကြောင့် ဖြစ်သည်။ ဤစစ်ပွဲတွင် အိမ်ဖြူတော်ကို မီးရှို့ခံခဲ့ရသည်။',
      relatedQuestionIds: ['HIST-103', 'HIST-R01'],
    },
  },
  {
    id: 'HIST-103',
    question_en: 'Name the U.S. war between the North and the South.',
    question_my: 'မြောက်ပိုင်းနဲ့ တောင်ပိုင်းကြားက အမေရိကန်စစ်ပွဲကို ဘယ်လိုခေါ်သလဲ။',
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
    explanation: {
      brief_en:
        'The Civil War (1861-1865) was fought between the Northern states (the Union) and the Southern states (the Confederacy). It is also called the War Between the States. It remains the deadliest war in American history.',
      brief_my:
        'ပြည်တွင်းစစ် (၁၈၆၁-၁၈၆၅) သည် မြောက်ပိုင်းပြည်နယ်များ (ပြည်ထောင်စု) နှင့် တောင်ပိုင်းပြည်နယ်များ (ကွန်ဖက်ဒရေးရှင်း) ကြားတိုက်ခိုက်ခဲ့သည်။ အမေရိကန်သမိုင်းတွင် အသက်ဆုံးရှုံးမှု အများဆုံးစစ်ပွဲ ဖြစ်သည်။',
      mnemonic_en:
        '"North vs South" — the Civil War was the war between the North (Union) and South (Confederacy).',
      funFact_en:
        'About 620,000 soldiers died in the Civil War — more American deaths than in World War I, World War II, and the Vietnam War combined.',
      funFact_my:
        'ပြည်တွင်းစစ်တွင် စစ်သား ၆၂၀,၀၀၀ ခန့် ကျဆုံးခဲ့သည် — ပထမကမ္ဘာစစ်၊ ဒုတိယကမ္ဘာစစ်နှင့် ဗီယက်နမ်စစ်ပွဲ ပေါင်းထားသည်ထက် ပို၍ များသည်။',
      commonMistake_en:
        'The War of 1812 was against Britain, not between North and South. The Revolutionary War was also against Britain. Only the Civil War was an internal North vs South conflict.',
      commonMistake_my:
        '၁၈၁၂ စစ်ပွဲသည် ဗြိတိန်ကို ဆန့်ကျင်ခဲ့သည်၊ မြောက်နှင့်တောင်ကြား မဟုတ်ပါ။ တော်လှန်ရေးစစ်ပွဲသည်လည်း ဗြိတိန်ကို ဆန့်ကျင်ခဲ့သည်။ ပြည်တွင်းစစ်သာလျှင် အတွင်းပိုင်း မြောက် vs တောင် ပဋိပက္ခ ဖြစ်သည်။',
      citation: 'U.S. Civil War, 1861-1865',
      relatedQuestionIds: ['HIST-102', 'HIST-104', 'HIST-105'],
    },
  },
  {
    id: 'HIST-104',
    question_en: 'Name one problem that led to the Civil War.',
    question_my: 'ပြည်တွင်းစစ် (Civil War) ဆီ ဦးတည်စေခဲ့တဲ့ ပြဿနာတစ်ခုကို ပြောပါ။',
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
    explanation: {
      brief_en:
        "Slavery was the primary cause of the Civil War. The North wanted to stop slavery from spreading, while the South relied on enslaved labor for its economy. States' rights and economic differences also played roles.",
      brief_my:
        'ကျွန်စနစ်သည် ပြည်တွင်းစစ်၏ အဓိကအကြောင်းရင်း ဖြစ်သည်။ မြောက်ပိုင်းက ကျွန်စနစ်ပြန့်ပွားမှုကို ရပ်တန့်လိုပြီး တောင်ပိုင်းက ၎င်းတို့၏ စီးပွားရေးအတွက် ကျွန်လုပ်အားကို မှီခိုခဲ့သည်။',
      mnemonic_en:
        'Think "S-E-S" — Slavery, Economic reasons, States\' rights — three causes of the Civil War.',
      citation: 'Multiple factors leading to Civil War, 1820s-1860s',
      funFact_en:
        'The phrase "states\' rights" was often used as a cover for defending slavery. Most historians agree slavery was the central issue.',
      funFact_my:
        '"ပြည်နယ်များ၏အခွင့်အရေး" ဆိုသောစကားရပ်ကို ကျွန်စနစ်ကိုကာကွယ်ရန် ဖုံးကွယ်ချက်အဖြစ် မကြာခဏ အသုံးပြုခဲ့သည်။ သမိုင်းပညာရှင်အများစုက ကျွန်စနစ်သည် အဓိကကိစ္စဖြစ်ကြောင်း သဘောတူကြသည်။',
      commonMistake_en:
        '"Taxation without representation" was a cause of the Revolutionary War (1700s), not the Civil War. The Civil War was about slavery and states\' rights in the 1800s.',
      commonMistake_my:
        '"ကိုယ်စားပြုမှုမရှိဘဲ အခွန်ကောက်ခြင်း" သည် တော်လှန်ရေးစစ်ပွဲ (၁၇၀၀ ပြည့်နှစ်များ) ၏ အကြောင်းရင်းဖြစ်ပြီး ပြည်တွင်းစစ် မဟုတ်ပါ။ ပြည်တွင်းစစ်သည် ၁၈၀၀ ပြည့်နှစ်များတွင် ကျွန်စနစ်နှင့် ပြည်နယ်များ၏ အခွင့်အရေးအကြောင်း ဖြစ်သည်။',
      relatedQuestionIds: ['HIST-103', 'HIST-105', 'HIST-106', 'HIST-C03'],
    },
  },
  {
    id: 'HIST-105',
    question_en: 'What was one important thing that Abraham Lincoln did?',
    question_my: 'အေဘရာဟမ် လင်ကွန်း (Abraham Lincoln) လုပ်ခဲ့တဲ့ အရေးကြီးတဲ့အရာတစ်ခုက ဘာလဲ။',
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
    explanation: {
      brief_en:
        "Abraham Lincoln freed the slaves through the Emancipation Proclamation, preserved the Union by winning the Civil War, and led the country through its most difficult period. He is widely considered one of America's greatest presidents.",
      brief_my:
        'အေဘရာဟမ် လင်ကွန်း (Abraham Lincoln)သည် လွတ်မြောက်ရေးကြေညာချက်ဖြင့် ကျွန်များကို လွတ်မြောက်စေခဲ့ပြီး ပြည်တွင်းစစ်ကို အနိုင်ရကာ ပြည်ထောင်စုကို ထိန်းသိမ်းခဲ့သည်။ အမေရိက၏ အကြီးမြတ်ဆုံးသမ္မတများထဲမှ တစ်ဦးအဖြစ် လူသိများသည်။',
      funFact_en:
        'Lincoln taught himself law by reading books — he never went to law school. He is on both the penny and the $5 bill.',
      funFact_my:
        'လင်ကွန်းသည် စာအုပ်ဖတ်၍ ဥပဒေကို ကိုယ်တိုင်သင်ယူခဲ့သည် — ဥပဒေကျောင်းကို တက်ခဲ့ဖူးခြင်း မရှိပါ။ ပဲနီအပြားနှင့် ဒေါ်လာ ၅ ငွေစက္ကူတွင် သူ့ပုံပါသည်။',
      mnemonic_en:
        'Lincoln = "Free, Save, Lead" — Freed slaves, Saved the Union, Led during Civil War.',
      commonMistake_en:
        "Jefferson wrote the Declaration of Independence, not Lincoln. Franklin was the first Postmaster General. Lincoln's key achievements were about the Civil War and ending slavery.",
      commonMistake_my:
        'ဂျက်ဖာဆင်က လွတ်လပ်ရေးကြေညာစာတမ်းကို ရေးသားခဲ့သည်၊ လင်ကွန်းမဟုတ်ပါ။ ဖရန်ကလင်က ပထမဆုံးစာတိုက်ဦးစီးချုပ် ဖြစ်ခဲ့သည်။ လင်ကွန်း၏ အဓိကအောင်မြင်မှုများသည် ပြည်တွင်းစစ်နှင့် ကျွန်စနစ်အဆုံးသတ်ခြင်း ဖြစ်သည်။',
      citation: 'Emancipation Proclamation, 1863; Civil War leadership, 1861-1865',
      relatedQuestionIds: ['HIST-103', 'HIST-104', 'HIST-106'],
    },
  },
  {
    id: 'HIST-106',
    question_en: 'What did the Emancipation Proclamation do?',
    question_my: 'ကျွန်စနစ်ဖျက်သိမ်းကြေညာစာ (Emancipation Proclamation) က ဘာလုပ်ခဲ့သလဲ။',
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
    explanation: {
      brief_en:
        'The Emancipation Proclamation, issued by President Lincoln in 1863, declared that enslaved people in Confederate states were free. It did not immediately free all slaves, but it changed the purpose of the Civil War to include ending slavery.',
      brief_my:
        'သမ္မတလင်ကွန်းက ၁၈၆၃ ခုနှစ်တွင် ထုတ်ပြန်ခဲ့သော လွတ်မြောက်ရေးကြေညာချက်သည် ကွန်ဖက်ဒရေးရှင်းပြည်နယ်များရှိ ကျွန်များကို လွတ်မြောက်စေကြောင်း ကြေညာခဲ့သည်။ ကျွန်အားလုံးကို ချက်ချင်းမလွတ်မြောက်စေသော်လည်း ပြည်တွင်းစစ်၏ ရည်ရွယ်ချက်ကို ကျွန်စနစ်အဆုံးသတ်ခြင်း ပါဝင်အောင် ပြောင်းလဲစေခဲ့သည်။',
      citation: '13th Amendment (formally abolished slavery in 1865)',
      mnemonic_en:
        '"Emancipation = Freedom" — the Proclamation freed enslaved people in Confederate states.',
      commonMistake_en:
        'The Emancipation Proclamation did not end the Civil War — the war continued until 1865. It also did not give women the right to vote; that came with the 19th Amendment in 1920.',
      commonMistake_my:
        'လွတ်မြောက်ရေးကြေညာချက်သည် ပြည်တွင်းစစ်ကို အဆုံးမသတ်ခဲ့ပါ — စစ်ပွဲသည် ၁၈၆၅ အထိ ဆက်လက်ဖြစ်ပွားခဲ့သည်။ အမျိုးသမီးများကို မဲပေးခွင့်လည်း မပေးခဲ့ပါ — ၎င်းသည် ၁၉၂၀ ခုနှစ် ၁၉ ကြိမ်မြောက် ပြင်ဆင်ချက်ဖြင့် လာခဲ့သည်။',
      funFact_en:
        'The Emancipation Proclamation only freed slaves in Confederate states — not in border states that stayed in the Union. Full abolition came with the 13th Amendment in 1865.',
      funFact_my:
        'လွတ်မြောက်ရေးကြေညာချက်သည် ကွန်ဖက်ဒရေးရှင်းပြည်နယ်များရှိ ကျွန်များကိုသာ လွတ်မြောက်စေခဲ့ပြီး ပြည်ထောင်စုတွင် ကျန်ရှိသော နယ်စပ်ပြည်နယ်များတွင် မဟုတ်ပါ။ အပြည့်အဝ ဖျက်သိမ်းခြင်းသည် ၁၈၆၅ ခုနှစ် ၁၃ ကြိမ်မြောက် ပြင်ဆင်ချက်ဖြင့် ဖြစ်ခဲ့သည်။',
      relatedQuestionIds: ['HIST-105', 'HIST-104', 'HIST-C03'],
    },
  },
  {
    id: 'HIST-107',
    question_en: 'What did Susan B. Anthony do?',
    question_my: 'ဆူဆန် ဘီ အန်သနီ (Susan B. Anthony) က ဘာလုပ်ခဲ့သလဲ။',
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
    explanation: {
      brief_en:
        "Susan B. Anthony was a leader in the women's rights and civil rights movements. She fought tirelessly for women's right to vote, which was finally achieved with the 19th Amendment in 1920 — 14 years after her death.",
      brief_my:
        'ဆူဆန် ဘီ အန်သနီ (Susan B. Anthony)သည် အမျိုးသမီးအခွင့်အရေးနှင့် ပြည်သူ့အခွင့်အရေး လှုပ်ရှားမှုများ၏ ခေါင်းဆောင် ဖြစ်ခဲ့သည်။ အမျိုးသမီးမဲပေးခွင့်အတွက် မနားမနေ တိုက်ပွဲဝင်ခဲ့ပြီး ၁၉၂၀ ခုနှစ် ၁၉ ကြိမ်မြောက် ပြင်ဆင်ချက်ဖြင့် အောင်မြင်ခဲ့သည်။',
      mnemonic_en: 'Susan B. Anthony = "SBA" = She Battled for All (women\'s voting rights).',
      funFact_en:
        'In 1872, Anthony was arrested for voting illegally as a woman. She was fined $100 but refused to pay. She appears on the U.S. dollar coin.',
      funFact_my:
        '၁၈၇၂ ခုနှစ်တွင် အန်သိုနီသည် အမျိုးသမီးအဖြစ် တရားမဝင်မဲပေးမှုဖြင့် ဖမ်းဆီးခံရသည်။ ဒေါ်လာ ၁၀၀ ဒဏ်ရိုက်ခံရသော်လည်း ပေးဆောင်ရန် ငြင်းဆန်ခဲ့သည်။ အမေရိကန်ဒေါ်လာ ဒင်္ဂါးပြားတွင် သူမ၏ ပုံပါသည်။',
      commonMistake_en:
        'Anthony was not elected to Congress — she fought for the right to vote, not for office. She also did not found the Red Cross (Clara Barton did that).',
      commonMistake_my:
        'အန်သနီသည် ကွန်ဂရက်သို့ ရွေးချယ်ခံရခြင်း မဟုတ်ပါ — သူမသည် မဲပေးခွင့်အတွက် တိုက်ပွဲဝင်ခဲ့ပြီး ရာထူးအတွက် မဟုတ်ပါ။ ကြက်ခြေနီအသင်းကို တည်ထောင်ခြင်းလည်း မဟုတ်ပါ (Clara Barton က လုပ်ခဲ့သည်)။',
      citation: "19th Amendment, 1920 (women's suffrage achieved 14 years after Anthony's death)",
      relatedQuestionIds: ['HIST-R07', 'RR-01'],
    },
  },
];
