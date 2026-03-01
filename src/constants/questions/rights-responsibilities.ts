import type { Question } from '@/types';

/**
 * Rights and Responsibilities
 *
 * ID Prefix: RR-## (10 questions)
 * @verified claude-initial-pass 2026-02-18 — pending 3-AI consensus
 */

export const rightsResponsibilitiesQuestions: Question[] = [
  {
    id: 'RR-01',
    tricky: true,
    question_en:
      'There are four amendments to the Constitution about who can vote. Describe one of them.',
    question_my:
      'ဖွဲ့စည်းပုံအခြေခံဥပဒေ (Constitution) မှာ ဘယ်သူတွေ မဲပေးနိုင်တယ်ဆိုတဲ့ ပြင်ဆင်ချက် (Amendment) လေးခု ရှိတယ်။ တစ်ခုကို ပြောပြပါ။',
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
    explanation: {
      brief_en:
        'Four amendments expanded voting rights: the 15th (any race can vote), 19th (women can vote), 24th (no poll tax required), and 26th (age 18 and older). Each one removed a barrier to voting.',
      brief_my:
        'ပြင်ဆင်ချက် ၄ ခုသည် မဲပေးခွင့်ကို ချဲ့ထွင်ခဲ့သည် — ၁၅ ကြိမ်မြောက် (မည်သည့်လူမျိုးမဆို)၊ ၁၉ ကြိမ်မြောက် (အမျိုးသမီးများ)၊ ၂၄ ကြိမ်မြောက် (မဲခွန်မလိုအပ်) နှင့် ၂၆ ကြိမ်မြောက် (အသက် ၁၈ နှစ်နှင့်အထက်)။ တစ်ခုစီက မဲပေးရာတွင် အတားအဆီးတစ်ခုကို ဖယ်ရှားခဲ့သည်။',
      mnemonic_en: 'Remember "15-19-24-26" — four amendments, each expanded voting to more people.',
      citation: '15th, 19th, 24th, 26th Amendments',
      funFact_en:
        'The 15th Amendment (1870) gave Black men the right to vote, but many Southern states used poll taxes and literacy tests to block them until the Voting Rights Act of 1965.',
      funFact_my:
        '၁၅ ကြိမ်မြောက်ပြင်ဆင်ချက် (၁၈၇၀) သည် အသားမည်းအမျိုးသားများကို မဲပေးခွင့်ပေးခဲ့သော်လည်း တောင်ပိုင်းပြည်နယ်များစွာက ၁၉၆၅ မဲပေးခွင့်ဥပဒေအထိ မဲခွန်နှင့် စာတတ်စာမေးပွဲများဖြင့် ပိတ်ဆို့ခဲ့သည်။',
      commonMistake_en:
        'The voting age was 21 before the 26th Amendment (1971) lowered it to 18. Do not confuse the four voting amendments with the Bill of Rights.',
      commonMistake_my:
        '၂၆ ကြိမ်မြောက်ပြင်ဆင်ချက် (၁၉၇၁) မတိုင်မီ မဲပေးအသက်သည် ၂၁ နှစ် ဖြစ်ခဲ့သည်။ မဲပေးခွင့်ပြင်ဆင်ချက် ၄ ခုကို အခွင့်အရေးဥပဒေကြမ်းနှင့် မရောထွေးပါနှင့်။',
      relatedQuestionIds: ['RR-07', 'HIST-107'],
    },
  },
  {
    id: 'RR-02',
    question_en: 'What is one responsibility that is only for United States citizens?',
    question_my: 'အမေရိကန်နိုင်ငံသား (Citizen) တွေအတွက်ပဲ ဖြစ်တဲ့ တာဝန်တစ်ခုက ဘာလဲ။',
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
    explanation: {
      brief_en:
        'Two responsibilities belong only to citizens: voting in federal elections and serving on a jury. Paying taxes and obeying the law are responsibilities for everyone living in the U.S., not just citizens.',
      brief_my:
        'တာဝန်နှစ်ခုသည် နိုင်ငံသားများအတွက်သာ ဖြစ်သည် — ဖက်ဒရယ်ရွေးကောက်ပွဲတွင် မဲပေးခြင်းနှင့် ဂျူရီလူကြီးအဖြစ် တာဝန်ထမ်းဆောင်ခြင်း။ အခွန်ပေးဆောင်ခြင်းနှင့် ဥပဒေလိုက်နာခြင်းတို့သည် နိုင်ငံသားများအတွက်သာ မဟုတ်ဘဲ အမေရိကန်တွင် နေထိုင်သူတိုင်း၏ တာဝန်ဖြစ်သည်။',
      mnemonic_en: 'Citizens-only: "VJ" — Vote and Jury duty. Everything else is for everyone.',
      citation: 'U.S. Constitution; Jury Selection and Service Act (28 U.S.C. 1861)',
      funFact_en:
        'Jury duty has roots going back to ancient Athens. In the U.S., about 32 million people are summoned for jury service each year, but only about 8 million actually serve.',
      funFact_my:
        'ဂျူရီတာဝန်သည် ရှေးအေသင်မြို့ပြနိုင်ငံအထိ အစဉ်အလာရှိသည်။ အမေရိကန်တွင် နှစ်စဉ် လူ ၃၂ သန်းကို ဂျူရီတာဝန်အတွက် ခေါ်ယူသော်လည်း ၈ သန်းခန့်သာ အမှန်တကယ် တာဝန်ထမ်းဆောင်ကြသည်။',
      commonMistake_en:
        'Paying taxes and obeying the law are for everyone in the U.S., not just citizens. Only voting and jury duty are citizen-only responsibilities.',
      commonMistake_my:
        'အခွန်ပေးဆောင်ခြင်းနှင့် ဥပဒေလိုက်နာခြင်းတို့သည် နိုင်ငံသားများအတွက်သာ မဟုတ်ဘဲ အမေရိကန်ရှိ လူတိုင်းအတွက် ဖြစ်သည်။ မဲပေးခြင်းနှင့် ဂျူရီတာဝန်သာ နိုင်ငံသားသီးသန့် တာဝန်ဖြစ်သည်။',
      relatedQuestionIds: ['RR-03', 'RR-08'],
    },
  },
  {
    id: 'RR-03',
    tricky: true,
    question_en: 'Name one right only for United States citizens.',
    question_my: 'အမေရိကန်နိုင်ငံသား (Citizen) တွေအတွက်ပဲ ဖြစ်တဲ့ အခွင့်အရေးတစ်ခုကို ပြောပါ။',
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
    explanation: {
      brief_en:
        'Only citizens can vote in federal elections and run for federal office. Rights like free speech and freedom of religion belong to everyone in the U.S., whether citizen or not.',
      brief_my:
        'ဖက်ဒရယ်ရွေးကောက်ပွဲတွင် မဲပေးခြင်းနှင့် ဖက်ဒရယ်ရုံးအတွက် အရွေးခံခြင်းတို့ကို နိုင်ငံသားများသာ လုပ်နိုင်သည်။ ပြောဆိုခွင့်နှင့် ဘာသာရေးလွတ်လပ်ခွင့်ကဲ့သို့ အခွင့်အရေးများသည် နိုင်ငံသားဖြစ်ဖြစ် မဖြစ်ဖြစ် အမေရိကန်ရှိ လူတိုင်းအတွက် ဖြစ်သည်။',
      mnemonic_en:
        'Citizens-only rights: "Vote and Run." Everyone else gets the freedoms (speech, religion, etc.).',
      citation: 'Article I (eligibility for office); various Amendments',
      funFact_en:
        'Non-citizens in the U.S. have many of the same constitutional protections as citizens, including free speech and due process. The main exceptions are voting and running for federal office.',
      funFact_my:
        'အမေရိကန်ရှိ နိုင်ငံသားမဟုတ်သူများသည် ပြောဆိုခွင့်နှင့် တရားမျှတစွာစစ်ဆေးခံပိုင်ခွင့်အပါအဝင် နိုင်ငံသားများကဲ့သို့ ဖွဲ့စည်းပုံကာကွယ်မှုများ ရရှိသည်။ အဓိကခြွင်းချက်မှာ မဲပေးခြင်းနှင့် ဖက်ဒရယ်ရုံးအတွက်အရွေးခံခြင်း ဖြစ်သည်။',
      commonMistake_en:
        'Freedom of speech and religion are for EVERYONE in the U.S., not just citizens. Voting and running for office are citizen-only rights.',
      commonMistake_my:
        'ပြောဆိုခွင့်နှင့် ဘာသာရေးလွတ်လပ်ခွင့်တို့သည် နိုင်ငံသားများအတွက်သာ မဟုတ်ဘဲ အမေရိကန်ရှိ လူတိုင်းအတွက် ဖြစ်သည်။ မဲပေးခြင်းနှင့် ရုံးအတွက်အရွေးခံခြင်းသာ နိုင်ငံသားသီးသန့် အခွင့်အရေး ဖြစ်သည်။',
      relatedQuestionIds: ['RR-02', 'RR-04'],
    },
  },
  {
    id: 'RR-04',
    question_en: 'What are two rights of everyone living in the United States?',
    question_my: 'အမေရိကန်မှာ နေထိုင်သူတိုင်းရဲ့ အခွင့်အရေး (Rights) နှစ်ခုက ဘာတွေလဲ။',
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
    explanation: {
      brief_en:
        'Everyone living in the U.S. has these rights, whether they are a citizen or not: freedom of expression, speech, assembly, religion, the right to petition the government, and the right to bear arms.',
      brief_my:
        'အမေရိကန်တွင် နေထိုင်သူတိုင်းသည် နိုင်ငံသားဖြစ်ဖြစ် မဖြစ်ဖြစ် ဒီအခွင့်အရေးများ ရှိသည် — ထုတ်ဖော်ပြောဆိုခွင့်၊ ပြောဆိုခွင့်၊ စည်းဝေးခွင့်၊ ဘာသာရေး၊ အစိုးရကို အသနားခံစာတင်ခွင့်နှင့် လက်နက်ကိုင်ဆောင်ခွင့်တို့ ဖြစ်သည်။',
      mnemonic_en:
        'Everyone gets "RAPPS + Arms" — Religion, Assembly, Press, Petition, Speech, plus bear Arms.',
      citation: '1st and 2nd Amendments',
      funFact_en:
        'The right to bear arms (2nd Amendment) applies to everyone in the U.S., not just citizens. The Supreme Court confirmed this extends to lawful permanent residents.',
      funFact_my:
        'လက်နက်ကိုင်ဆောင်ခွင့် (ဒုတိယပြင်ဆင်ချက်) သည် နိုင်ငံသားများအတွက်သာ မဟုတ်ဘဲ အမေရိကန်ရှိ လူတိုင်းအတွက် သက်ဆိုင်သည်။ ဥပဒေနှင့်အညီ အမြဲတမ်းနေထိုင်သူများအထိ ကျယ်ပြန့်ကြောင်း တရားရုံးချုပ်က အတည်ပြုခဲ့သည်။',
      commonMistake_en:
        'Voting and running for office are citizen-only rights. The rights listed here (speech, religion, arms, etc.) belong to EVERYONE in the U.S.',
      commonMistake_my:
        'မဲပေးခြင်းနှင့် ရုံးအတွက်အရွေးခံခြင်းတို့သည် နိုင်ငံသားသီးသန့် အခွင့်အရေးဖြစ်သည်။ ဤနေရာတွင် ဖော်ပြထားသော အခွင့်အရေးများ (ပြောဆိုခွင့်၊ ဘာသာရေး စသည်) သည် အမေရိကန်ရှိ လူတိုင်းအတွက် ဖြစ်သည်။',
      relatedQuestionIds: ['RR-03', 'GOV-P06'],
    },
  },
  {
    id: 'RR-05',
    question_en: 'What do we show loyalty to when we say the Pledge of Allegiance?',
    question_my: 'သစ္စာခံကတိ (Pledge of Allegiance) ဆိုတဲ့အခါ ငါတို့ ဘာကို သစ္စာခံတာလဲ။',
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
    explanation: {
      brief_en:
        'When saying the Pledge of Allegiance, we show loyalty to the United States and its flag. The pledge is a promise of loyalty to the country and what it stands for — "one nation, under God, indivisible, with liberty and justice for all."',
      brief_my:
        'သစ္စာဆိုသည့်အခါ ကျွန်ုပ်တို့သည် အမေရိကန်ပြည်ထောင်စုနှင့် ၎င်း၏အလံအပေါ် သစ္စာစောင့်သိကြောင်း ပြသသည်။ ၎င်းသည် နိုင်ငံနှင့် ၎င်း၏ ကိုယ်စားပြုသော အရာများအပေါ် သစ္စာဆိုခြင်း ဖြစ်သည်။',
      mnemonic_en:
        '"I pledge allegiance to the FLAG" — the very first line tells you the answer: the flag and the country it represents.',
      citation: 'Flag Code, 4 U.S.C. 4',
      funFact_en:
        'The original Pledge was written in 1892 by Francis Bellamy. The words "under God" were not added until 1954 during the Cold War.',
      funFact_my:
        'မူရင်းသစ္စာခံကတိကို ၁၈၉၂ ခုနှစ်တွင် ဖရန်စစ်စ် ဘယ်လာမီက ရေးသားခဲ့သည်။ "ဘုရားသခင့်အောက်" ဟူသော စကားလုံးများကို ၁၉၅၄ စစ်အေးကာလတွင်မှ ထည့်သွင်းခဲ့သည်။',
      commonMistake_en:
        'The Pledge shows loyalty to the flag and the nation — NOT to the President, Congress, or any individual leader.',
      commonMistake_my:
        'သစ္စာခံကတိသည် အလံနှင့် နိုင်ငံအပေါ် သစ္စာစောင့်သိမှုကို ပြသသည် — သမ္မတ၊ ကွန်ဂရက် သို့မဟုတ် ခေါင်းဆောင်တစ်ဦးဦးအပေါ် မဟုတ်ပါ။',
      relatedQuestionIds: ['RR-06', 'SYM-09', 'SYM-10'],
    },
  },
  {
    id: 'RR-06',
    question_en: 'What is one promise you make when you become a United States citizen?',
    question_my: 'သင် အမေရိကန်နိုင်ငံသား (Citizen) ဖြစ်လာတဲ့အခါ ပေးတဲ့ ကတိတစ်ခုက ဘာလဲ။',
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
    explanation: {
      brief_en:
        'The Oath of Allegiance includes several promises: give up loyalty to other countries, defend the Constitution, obey U.S. laws, serve in the military if needed, and do important work for the nation if needed.',
      brief_my:
        'သစ္စာဆိုသည့် ကတိတွင် ကတိများစွာ ပါဝင်သည် — အခြားနိုင်ငံများအပေါ် သစ္စာကို စွန့်လွှတ်ခြင်း၊ ဖွဲ့စည်းပုံကို ကာကွယ်ခြင်း၊ အမေရိကန်ဥပဒေများ လိုက်နာခြင်း၊ လိုအပ်ပါက စစ်တပ်တွင် တာဝန်ထမ်းဆောင်ခြင်းနှင့် နိုင်ငံအတွက် အရေးကြီးသော အလုပ်လုပ်ခြင်း။',
      mnemonic_en:
        'Oath promises: "GOLDS" — Give up foreign loyalty, Obey laws, Loyalty to U.S., Defend Constitution, Serve if needed.',
      citation: 'Immigration and Nationality Act, 8 U.S.C. 1448',
      funFact_en:
        'The Oath of Allegiance has been used since 1790 but has been modified several times. Conscientious objectors can take a modified oath that does not require bearing arms.',
      funFact_my:
        'သစ္စာဆိုစာကို ၁၇၉၀ ခုနှစ်ကတည်းက အသုံးပြုခဲ့သော်လည်း အကြိမ်ကြိမ် ပြင်ဆင်ခဲ့သည်။ ကိုယ်ကျင့်တရားအရ ကန့်ကွက်သူများသည် လက်နက်ကိုင်ရန် မလိုအပ်သော ပြင်ဆင်ထားသည့် သစ္စာဆိုစာကို ဆိုနိုင်သည်။',
      commonMistake_en:
        'You do NOT have to speak only English or vote in every election. You CAN travel to other countries. The oath is about loyalty and following the law.',
      commonMistake_my:
        'အင်္ဂလိပ်ဘာသာသာ ပြောရန် သို့မဟုတ် ရွေးကောက်ပွဲတိုင်းတွင် မဲပေးရန် မလိုပါ။ အခြားနိုင်ငံများသို့ သွားရောက်နိုင်ပါသည်။ ကတိသည် သစ္စာစောင့်သိမှုနှင့် ဥပဒေလိုက်နာမှုအကြောင်း ဖြစ်သည်။',
      relatedQuestionIds: ['RR-05'],
    },
  },
  {
    id: 'RR-07',
    question_en: 'How old do citizens have to be to vote for President?',
    question_my: 'သမ္မတ (President) ကို မဲပေးဖို့ နိုင်ငံသားတွေ အသက်ဘယ်လောက် ရှိရမလဲ။',
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
    explanation: {
      brief_en:
        'You must be at least 18 years old to vote. The 26th Amendment (1971) lowered the voting age from 21 to 18. This was partly because 18-year-olds could be drafted to fight in the Vietnam War but could not vote.',
      brief_my:
        'မဲပေးရန် အနည်းဆုံး အသက် ၁၈ နှစ် ရှိရမည်။ ၂၆ ကြိမ်မြောက် ပြင်ဆင်ချက် (၁၉၇၁) သည် မဲပေးအသက်ကို ၂၁ မှ ၁၈ သို့ လျှော့ချခဲ့သည်။ အသက် ၁၈ နှစ်သားများ ဗီယက်နမ်စစ်ပွဲတွင် စစ်မှုထမ်းခံရသော်လည်း မဲပေးခွင့်မရှိသောကြောင့် ဖြစ်သည်။',
      mnemonic_en:
        '18 to vote — "Old enough to fight, old enough to vote" was the slogan that led to the 26th Amendment.',
      citation: '26th Amendment (1971)',
      funFact_en:
        'Before the 26th Amendment, the voting age was 21 in most states. The amendment was ratified in just 107 days — the fastest ratification of any constitutional amendment.',
      funFact_my:
        '၂၆ ကြိမ်မြောက် ပြင်ဆင်ချက်မတိုင်မီ ပြည်နယ်အများစုတွင် မဲပေးအသက်သည် ၂၁ နှစ် ဖြစ်ခဲ့သည်။ ဤပြင်ဆင်ချက်ကို ရက် ၁၀၇ အတွင်းသာ အတည်ပြုခဲ့ပြီး ဖွဲ့စည်းပုံပြင်ဆင်ချက်များထဲတွင် အမြန်ဆုံး ဖြစ်သည်။',
      commonMistake_en:
        'The voting age is 18, not 21. Before 1971, it was 21 — but the 26th Amendment changed it. Do not confuse with the drinking age, which remains 21.',
      commonMistake_my:
        'မဲပေးအသက်သည် ၁၈ နှစ် ဖြစ်သည်၊ ၂၁ နှစ် မဟုတ်ပါ။ ၁၉၇၁ မတိုင်မီ ၂၁ နှစ် ဖြစ်ခဲ့သော်လည်း ၂၆ ကြိမ်မြောက်ပြင်ဆင်ချက်က ပြောင်းလဲခဲ့သည်။ အရက်သောက်အသက် ၂၁ နှစ်နှင့် မရောထွေးပါနှင့်။',
      relatedQuestionIds: ['RR-01', 'RR-10'],
    },
  },
  {
    id: 'RR-08',
    question_en: 'What are two ways that Americans can participate in their democracy?',
    question_my:
      'အမေရိကန်တွေက သူတို့ရဲ့ ဒီမိုကရေစီ (Democracy) မှာ ဘယ်လိုနည်းလမ်းနှစ်ခုနဲ့ ပါဝင်နိုင်သလဲ။',
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
    explanation: {
      brief_en:
        'There are many ways to participate in democracy beyond voting: join a political party, help with a campaign, join a civic or community group, contact your elected officials, run for office, or write to a newspaper.',
      brief_my:
        'မဲပေးခြင်းအပြင် ဒီမိုကရေစီတွင် ပါဝင်ရန် နည်းလမ်းများစွာ ရှိသည် — နိုင်ငံရေးပါတီ ပါဝင်ခြင်း၊ လှုံ့ဆော်ရေးတွင် ကူညီခြင်း၊ ပြည်သူ့အဖွဲ့အစည်း ပါဝင်ခြင်း၊ ရွေးကောက်ခံ အရာရှိများကို ဆက်သွယ်ခြင်း သို့မဟုတ် ရုံးအတွက် အရွေးခံခြင်းတို့ ဖြစ်သည်။',
      mnemonic_en:
        'Democracy participation goes beyond voting: "VOICE" — Vote, Organize, Inform officials, Campaign, Engage in community.',
      citation: '1st Amendment (right to petition, assembly, speech)',
      funFact_en:
        'In the 2020 presidential election, about 66.8% of eligible voters cast a ballot — the highest turnout in over a century.',
      funFact_my:
        '၂၀၂၀ သမ္မတရွေးကောက်ပွဲတွင် မဲပေးခွင့်ရှိသူ ၆၆.၈% ခန့် မဲပေးခဲ့ပြီး ရာစုနှစ်တစ်ခုကျော်အတွင်း အများဆုံး မဲပေးသူဦးရေ ဖြစ်ခဲ့သည်။',
      commonMistake_en:
        'Paying taxes and obeying the law are obligations, not forms of democratic participation. Flying the flag and saying the Pledge are patriotic acts but not specific democratic participation.',
      commonMistake_my:
        'အခွန်ပေးဆောင်ခြင်းနှင့် ဥပဒေလိုက်နာခြင်းတို့သည် တာဝန်ဝတ္တရားများဖြစ်ပြီး ဒီမိုကရေစီပါဝင်မှုပုံစံ မဟုတ်ပါ။ အလံလွှင့်ခြင်းနှင့် သစ္စာဆိုခြင်းတို့သည် မျိုးချစ်လုပ်ရပ်များ ဖြစ်သော်လည်း တိကျသော ဒီမိုကရေစီပါဝင်မှု မဟုတ်ပါ။',
      relatedQuestionIds: ['RR-02', 'RR-03'],
    },
  },
  {
    id: 'RR-09',
    question_en: 'When is the last day you can send in federal income tax forms?',
    question_my: 'ဖက်ဒရယ် (Federal) ဝင်ငွေခွန်ပုံစံတွေကို နောက်ဆုံးဘယ်နေ့ ပေးပို့နိုင်သလဲ။',
    category: 'Rights and Responsibilities',
    studyAnswers: [{ text_en: 'April 15', text_my: 'ဧပြီ ၁၅' }],
    answers: [
      { text_en: 'April 15', text_my: 'ဧပြီ ၁၅', correct: true },
      { text_en: 'January 1', text_my: 'ဇန်နဝါရီ ၁', correct: false },
      { text_en: 'December 31', text_my: 'ဒီဇင်ဘာ ၃၁', correct: false },
      { text_en: 'July 4', text_my: 'ဇူလိုင် ၄', correct: false },
    ],
    explanation: {
      brief_en:
        'April 15 is "Tax Day" — the deadline to file your federal income tax return. Everyone who earns income in the U.S. must pay federal taxes, whether they are a citizen or not.',
      brief_my:
        'ဧပြီ ၁၅ သည် "အခွန်နေ့" ဖြစ်သည် — ဖက်ဒရယ်ဝင်ငွေခွန် ပုံစံကို တင်ရန် နောက်ဆုံးရက် ဖြစ်သည်။ အမေရိကန်တွင် ဝင်ငွေရှာသူတိုင်း နိုင်ငံသားဖြစ်ဖြစ် မဖြစ်ဖြစ် ဖက်ဒရယ်အခွန် ပေးဆောင်ရမည်။',
      mnemonic_en: 'April 15 = Tax Day. Just remember: taxes in April!',
      mnemonic_my: 'ဧပြီ ၁၅ = အခွန်နေ့။ ဧပြီလမှာ အခွန်! ဟု မှတ်ထားပါ။',
      citation: 'Internal Revenue Code, 26 U.S.C. 6072',
      funFact_en:
        'Tax Day was not always April 15. Before 1955, taxes were due on March 15. The IRS moved it to April 15 to give people more time to file.',
      funFact_my:
        'အခွန်နေ့သည် အမြဲတမ်း ဧပြီ ၁၅ မဖြစ်ခဲ့ပါ။ ၁၉၅၅ မတိုင်မီ အခွန်ကို မတ်လ ၁၅ ရက်တွင် ပေးဆောင်ရသည်။ IRS က လူများကို အချိန်ပိုပေးရန် ဧပြီ ၁၅ သို့ ပြောင်းခဲ့သည်။',
      commonMistake_en:
        'Do not confuse Tax Day (April 15) with Independence Day (July 4) or New Year (January 1). April 15 is specifically for federal income tax filing.',
      commonMistake_my:
        'အခွန်နေ့ (ဧပြီ ၁၅) ကို လွတ်လပ်ရေးနေ့ (ဇူလိုင် ၄) သို့မဟုတ် နှစ်သစ်ကူး (ဇန်နဝါရီ ၁) နှင့် မရောထွေးပါနှင့်။ ဧပြီ ၁၅ သည် ဖက်ဒရယ်ဝင်ငွေခွန် တင်သွင်းရန် အထူးဖြစ်သည်။',
      relatedQuestionIds: ['RR-02'],
    },
  },
  {
    id: 'RR-10',
    question_en: 'When must all men register for the Selective Service?',
    question_my:
      'အမျိုးသားအားလုံး ဆီလက်တစ်ဆားဗစ် (Selective Service) အတွက် ဘယ်အချိန်မှာ မှတ်ပုံတင်ရမလဲ။',
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
    explanation: {
      brief_en:
        'All men living in the U.S. must register for the Selective Service between ages 18 and 26. This is a requirement for both citizens and non-citizens. Women are not currently required to register.',
      brief_my:
        'အမေရိကန်မှာ နေထိုင်တဲ့ အမျိုးသားအားလုံးက အသက် ၁၈ နှစ်နဲ့ ၂၆ နှစ်ကြား ဆီလက်တစ်ဆားဗစ် (Selective Service) အတွက် မှတ်ပုံတင်ရတယ်။ နိုင်ငံသား (Citizen) ရော နိုင်ငံသားမဟုတ်သူပါ နှစ်မျိုးလုံးအတွက် လိုအပ်ချက်ပါ။',
      mnemonic_en:
        '18 to register — same age as voting! "18 = Vote + Register for Selective Service."',
      citation: 'Military Selective Service Act, 50 U.S.C. 3802',
      funFact_en:
        'The U.S. has not had a military draft since 1973, but Selective Service registration is still required by law. Failing to register can result in losing eligibility for federal student aid.',
      funFact_my:
        'အမေရိကန်တွင် ၁၉၇၃ ခုနှစ်ကတည်းက စစ်မှုထမ်းခေါ်ယူမှု မရှိတော့သော်လည်း ဆီလက်တစ်ဆားဗစ် မှတ်ပုံတင်ခြင်းသည် ဥပဒေအရ ယနေ့တိုင် လိုအပ်သည်။ မှတ်ပုံမတင်ပါက ဖက်ဒရယ်ကျောင်းသားထောက်ပံ့ရေး အရည်အချင်း ဆုံးရှုံးနိုင်သည်။',
      commonMistake_en:
        'Selective Service is not the same as joining the military — it is only registration. Also, it applies to all men (citizens and non-citizens), not just citizens.',
      commonMistake_my:
        'ဆီလက်တစ်ဆားဗစ်သည် စစ်တပ်ဝင်ခြင်းနှင့် မတူပါ — မှတ်ပုံတင်ခြင်းသာ ဖြစ်သည်။ ထို့ပြင် နိုင်ငံသားများသာ မဟုတ်ဘဲ အမျိုးသားအားလုံး (နိုင်ငံသားနှင့် နိုင်ငံသားမဟုတ်သူ) အတွက် သက်ဆိုင်သည်။',
      relatedQuestionIds: ['RR-07'],
    },
  },
];
