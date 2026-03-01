import type { Question } from '@/types';

/**
 * American History: Colonial Period and Independence
 *
 * ID Prefix: HIST-C## (13 questions)
 * @verified claude-initial-pass 2026-02-18 — pending 3-AI consensus
 */

export const colonialHistoryQuestions: Question[] = [
  {
    id: 'HIST-C01',
    question_en: 'What is one reason colonists came to America?',
    question_my: 'ကိုလိုနီသားတွေ အမေရိကကို လာရောက်ခဲ့တဲ့ အကြောင်းရင်းတစ်ခုက ဘာလဲ။',
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
    explanation: {
      brief_en:
        'Colonists came to America for many reasons, including religious freedom, political liberty, and economic opportunity. Many were fleeing persecution in Europe and sought a fresh start in the New World.',
      brief_my:
        'ကိုလိုနိစ်များသည် ဘာသာရေးလွတ်လပ်ခွင့်၊ နိုင်ငံရေးလွတ်လပ်ခွင့်နှင့် စီးပွားရေးအခွင့်အလမ်းများ အပါအဝင် အကြောင်းရင်းများစွာဖြင့် အမေရိကသို့ လာရောက်ခဲ့ကြသည်။ အများစုမှာ ဥရောပတွင် နှိပ်စက်ညှဉ်းပန်းခံရမှုမှ ထွက်ပြေးလာကြခြင်း ဖြစ်သည်။',
      mnemonic_en: 'FRE: Freedom, Religion, Economics — the three big reasons colonists came.',
      mnemonic_my: 'လွတ်လပ် - ဘာသာ - စီးပွား: လာရောက်ရသည့် အဓိကအကြောင်းရင်း သုံးခု။',
      funFact_en:
        'The Pilgrims who arrived on the Mayflower in 1620 were seeking religious freedom — they wanted to worship differently from the Church of England.',
      funFact_my:
        '၁၆၂၀ တွင် Mayflower ဖြင့်ရောက်လာသော Pilgrim များသည် ဘာသာရေးလွတ်လပ်ခွင့်ကို ရှာဖွေခဲ့ကြသည်။',
      citation: 'USCIS Civics Test Item 58',
      commonMistake_en:
        'Colonists did not come to join the British army or pay taxes — they came seeking freedom and opportunity, often escaping difficult conditions in Europe.',
      commonMistake_my:
        'ကိုလိုနိစ်များသည် ဗြိတိသျှစစ်တပ်ပါဝင်ရန် သို့မဟုတ် အခွန်ပေးရန် လာခဲ့ကြခြင်းမဟုတ်ပါ — လွတ်လပ်ခွင့်နှင့် အခွင့်အလမ်းရှာဖွေရန် လာခဲ့ကြခြင်း ဖြစ်သည်။',
      relatedQuestionIds: ['HIST-C02', 'HIST-C04'],
    },
  },
  {
    id: 'HIST-C02',
    question_en: 'Who lived in America before the Europeans arrived?',
    question_my: 'ဥရောပသားတွေ မရောက်လာခင် အမေရိကမှာ ဘယ်သူတွေ နေထိုင်ခဲ့သလဲ။',
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
    explanation: {
      brief_en:
        'American Indians (Native Americans) lived in America for thousands of years before Europeans arrived. They had diverse cultures, languages, and civilizations across the continent.',
      brief_my:
        'ဥရောပသားများ မရောက်လာမီ ထောင်ပေါင်းများစွာသောနှစ်များ အမေရိကန်အင်ဒီးယန်းများ (ဇာတိအမေရိကန်များ) အမေရိကတွင် နေထိုင်ခဲ့ကြသည်။ တိုက်ကြီးတစ်ခုလုံးတွင် ကွဲပြားသော ယဉ်ကျေးမှု၊ ဘာသာစကားနှင့် ယဉ်ကျေးမှုများ ရှိခဲ့သည်။',
      mnemonic_en:
        'NATIVE = "N" for "Not newcomers" — Native Americans were here first, thousands of years before Europeans.',
      mnemonic_my:
        'ဇာတိ = ပထမဆုံး — ဥရောပသားများ မရောက်မီ ထောင်ပေါင်းများစွာနှစ် ကတည်းက ရှိနေသူများ။',
      funFact_en:
        'When Europeans arrived, there were an estimated 10 million Native Americans living in what is now the United States, speaking over 300 different languages.',
      funFact_my:
        'ဥရောပသားများရောက်လာသောအခါ ယခုအမေရိကန်ဖြစ်သည့်နေရာတွင် ဇာတိအမေရိကန် ၁၀ သန်းခန့် နေထိုင်ခဲ့ပြီး ဘာသာစကား ၃၀၀ ကျော် ပြောဆိုခဲ့ကြသည်။',
      citation: 'USCIS Civics Test Item 59',
      commonMistake_en:
        '"Canada" and "Mexico" as countries did not exist yet. The people living in the Americas before Europeans were Native Americans / American Indians.',
      commonMistake_my:
        '"ကနေဒါ" နှင့် "မက္ကဆီကို" နိုင်ငံများ ထိုအချိန်က မတည်ရှိသေးပါ။ ဥရောပသားများ မရောက်မီ အမေရိကတိုက်တွင် နေထိုင်သူများမှာ ဇာတိအမေရိကန်များ ဖြစ်သည်။',
      relatedQuestionIds: ['HIST-R10'],
    },
  },
  {
    id: 'HIST-C03',
    question_en: 'What group of people was taken to America and sold as slaves?',
    question_my: 'ဘယ်လူမျိုးအုပ်စုကို အမေရိကကို ခေါ်ဆောင်လာပြီး ကျွန်အဖြစ် ရောင်းချခဲ့သလဲ။',
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
    explanation: {
      brief_en:
        'Beginning in the 1600s, millions of Africans were forcibly taken from their homeland and sold into slavery in America. This horrific practice lasted until the end of the Civil War in 1865.',
      brief_my:
        '၁၆၀၀ ပြည့်နှစ်များမှ စတင်၍ အာဖရိကန်သန်းပေါင်းများစွာကို ၎င်းတို့၏ မွေးရပ်ဇာတိမှ အတင်းအဓမ္မခေါ်ဆောင်ပြီး အမေရိကတွင် ကျွန်အဖြစ် ရောင်းချခဲ့သည်။ ဤကြောက်မက်ဖွယ်ကျင့်စဉ်သည် ၁၈၆၅ ပြည်တွင်းစစ် အဆုံးသတ်သည်အထိ ကြာမြင့်ခဲ့သည်။',
      mnemonic_en:
        'Africa to America — the Atlantic slave trade brought Africans to America by force.',
      mnemonic_my:
        'အာဖရိကမှ အမေရိကသို့ — အတ္တလန္တိတ်ကျွန်ကုန်သွယ်မှုက အာဖရိကန်များကို အတင်းခေါ်ဆောင်ခဲ့သည်။',
      funFact_en:
        'An estimated 12.5 million Africans were transported across the Atlantic between 1500 and 1900. Only about 388,000 came directly to what is now the United States.',
      funFact_my:
        '၁၅၀၀ မှ ၁၉၀၀ အတွင်း အာဖရိကန် ၁၂.၅ သန်းခန့်ကို အတ္တလန္တိတ်ကို ဖြတ်၍ သယ်ဆောင်ခဲ့သည်။ ယခုအမေရိကန်ဖြစ်သည့်နေရာသို့ တိုက်ရိုက်ရောက်လာသူ ၃၈၈,၀၀၀ ခန့်သာ ရှိခဲ့သည်။',
      citation: 'USCIS Civics Test Item 60',
      commonMistake_en:
        'While many groups faced hardship in America, the question specifically asks about people brought to be sold as slaves — this was uniquely the experience of Africans during the Atlantic slave trade.',
      commonMistake_my:
        'လူအုပ်စုများစွာ အမေရိကတွင် ဒုက္ခခံစားခဲ့ရသော်လည်း မေးခွန်းသည် ကျွန်အဖြစ်ရောင်းရန် ခေါ်ဆောင်ခံရသူများကို အထူးသဖြင့် မေးနေခြင်းဖြစ်ပြီး ဤအတွေ့အကြုံသည် အတ္တလန္တိတ်ကျွန်ကုန်သွယ်မှုအတွင်း အာဖရိကန်များ၏ ထူးခြားသောအတွေ့အကြုံ ဖြစ်သည်။',
      relatedQuestionIds: ['HIST-104', 'HIST-105', 'HIST-106'],
    },
  },
  {
    id: 'HIST-C04',
    question_en: 'Why did the colonists fight the British?',
    question_my: 'ကိုလိုနီသားတွေက ဗြိတိသျှတို့ကို ဘာကြောင့် တိုက်ခိုက်ခဲ့တာလဲ။',
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
    explanation: {
      brief_en:
        'The colonists fought the British because of high taxes without representation in Parliament, British soldiers being quartered in their homes, and lack of self-government. "No taxation without representation" became a rallying cry.',
      brief_my:
        'ပါလီမန်တွင် ကိုယ်စားပြုမှုမရှိဘဲ အခွန်ကြီးမြင့်မှု၊ ဗြိတိသျှစစ်သားများ ၎င်းတို့အိမ်များတွင် နေထိုင်မှုနှင့် ကိုယ်ပိုင်အုပ်ချုပ်ခွင့်မရှိမှုတို့ကြောင့် ကိုလိုနိစ်များသည် ဗြိတိသျှတို့ကို တိုက်ခိုက်ခဲ့သည်။',
      mnemonic_en:
        'T-H-S: Taxes, Housing soldiers, Self-government — the three causes of revolution.',
      mnemonic_my:
        'အခွန် - စစ်သားနေရာ - ကိုယ်ပိုင်အုပ်ချုပ်ခွင့်: တော်လှန်ရေး အကြောင်းရင်း သုံးခု။',
      funFact_en:
        'The Boston Tea Party (1773) was a famous protest against British taxation — colonists dumped 342 chests of tea into Boston Harbor.',
      funFact_my:
        'ဘော်စတွန်လက်ဖက်ရည်ပါတီ (၁၇၇၃) သည် ဗြိတိသျှအခွန်ကောက်ခံမှုကို ဆန့်ကျင်သော ကျော်ကြားသည့်ဆန္ဒပြမှုဖြစ်ပြီး — ကိုလိုနိစ်များက လက်ဖက်ရည်ပုံး ၃၄၂ ခုကို ဘော်စတွန်ဆိပ်ကမ်းထဲသို့ ပစ်ချခဲ့သည်။',
      citation: 'USCIS Civics Test Item 61',
      commonMistake_en:
        'The colonists did not fight to join France or over religion. The main causes were political: unfair taxation, forced quartering of soldiers, and no self-governance.',
      commonMistake_my:
        'ကိုလိုနိစ်များသည် ပြင်သစ်နှင့်ပူးပေါင်းရန် သို့မဟုတ် ဘာသာရေးကြောင့် မတိုက်ခဲ့ပါ။ အဓိကအကြောင်းရင်းများမှာ နိုင်ငံရေးဆိုင်ရာ ဖြစ်သည် — မတရားအခွန်ကောက်ခံခြင်း၊ စစ်သားများအတင်းနေထိုင်စေခြင်းနှင့် ကိုယ်ပိုင်အုပ်ချုပ်ခွင့်မရှိခြင်း။',
      relatedQuestionIds: ['HIST-C05', 'HIST-C06', 'GOV-P01'],
    },
    tricky: true,
  },
  {
    id: 'HIST-C05',
    question_en: 'Who wrote the Declaration of Independence?',
    question_my: 'လွတ်လပ်ရေးကြေညာစာ (Declaration of Independence) ကို ဘယ်သူ ရေးသားခဲ့သလဲ။',
    category: 'American History: Colonial Period and Independence',
    studyAnswers: [
      { text_en: 'Thomas Jefferson', text_my: 'သောမတ်စ် ဂျက်ဖာဆင် (Thomas Jefferson)' },
    ],
    answers: [
      {
        text_en: 'Thomas Jefferson',
        text_my: 'သောမတ်စ် ဂျက်ဖာဆင် (Thomas Jefferson)',
        correct: true,
      },
      {
        text_en: 'George Washington',
        text_my: 'ဂျော့ချ် ဝါရှင်တန် (George Washington)',
        correct: false,
      },
      {
        text_en: 'Abraham Lincoln',
        text_my: 'အေဘရာဟမ် လင်ကွန်း (Abraham Lincoln)',
        correct: false,
      },
      {
        text_en: 'Benjamin Franklin',
        text_my: 'ဘင်ဂျမင် ဖရန်ကလင် (Benjamin Franklin)',
        correct: false,
      },
    ],
    explanation: {
      brief_en:
        'Thomas Jefferson wrote the Declaration of Independence in 1776. At just 33 years old, he was chosen by the Continental Congress to draft this historic document declaring America free from British rule.',
      brief_my:
        'သောမတ်စ် ဂျက်ဖာဆင် (Thomas Jefferson)သည် ၁၇၇၆ ခုနှစ်တွင် လွတ်လပ်ရေးကြေညာစာတမ်းကို ရေးသားခဲ့သည်။ အသက် ၃၃ နှစ်အရွယ်တွင် တိုက်ကြီးကွန်ဂရက်က ဤသမိုင်းဝင်စာတမ်းကို ရေးသားရန် ရွေးချယ်ခဲ့သည်။',
      mnemonic_en:
        'TJ = Thomas Jefferson wrote the DJ = Declaration of Jefferson... er, Independence.',
      mnemonic_my: 'TJ = သောမတ်စ်ဂျက်ဖာဆင် — လွတ်လပ်ရေးကြေညာစာတမ်း၏ စာရေးဆရာ။',
      funFact_en:
        'Jefferson wrote the Declaration in just 17 days while staying in a rented room in Philadelphia. He later became the 3rd President of the United States.',
      funFact_my:
        'ဂျက်ဖာဆင်သည် ဖီလဒဲလ်ဖီးယားတွင် ငှားရမ်းထားသောအခန်းတွင် ရက် ၁၇ အတွင်း ကြေညာစာတမ်းကို ရေးသားခဲ့သည်။ နောက်ပိုင်းတွင် အမေရိကန်ပြည်ထောင်စု၏ တတိယမြောက်သမ္မတ ဖြစ်လာခဲ့သည်။',
      citation: 'USCIS Civics Test Item 62',
      commonMistake_en:
        'Benjamin Franklin helped edit it, and George Washington led the army, but Jefferson was the primary author of the Declaration.',
      commonMistake_my:
        'ဘင်ဂျမင် ဖရန်ကလင် (Benjamin Franklin)က ပြင်ဆင်ကူညီခဲ့ပြီး ဂျော့ချ် ဝါရှင်တန် (George Washington)က စစ်တပ်ကို ဦးဆောင်ခဲ့သော်လည်း ဂျက်ဖာဆင်သည် ကြေညာစာတမ်း၏ အဓိကစာရေးဆရာ ဖြစ်သည်။',
      relatedQuestionIds: ['HIST-C06', 'HIST-C12', 'HIST-C13'],
    },
  },
  {
    id: 'HIST-C06',
    question_en: 'When was the Declaration of Independence adopted?',
    question_my: 'လွတ်လပ်ရေးကြေညာစာ (Declaration of Independence) ကို ဘယ်အချိန်မှာ အတည်ပြုခဲ့သလဲ။',
    category: 'American History: Colonial Period and Independence',
    studyAnswers: [{ text_en: 'July 4, 1776', text_my: 'ဇူလိုင် ၄၊ ၁၇၇၆' }],
    answers: [
      { text_en: 'July 4, 1776', text_my: 'ဇူလိုင် ၄၊ ၁၇၇၆', correct: true },
      { text_en: 'December 7, 1941', text_my: 'ဒီဇင်ဘာ ၇၊ ၁၉၄၁', correct: false },
      { text_en: 'April 12, 1861', text_my: 'ဧပြီ ၁၂၊ ၁၈၆၁', correct: false },
      { text_en: 'September 17, 1787', text_my: 'စက်တင်ဘာ ၁၇၊ ၁၇၈၇', correct: false },
    ],
    explanation: {
      brief_en:
        'The Declaration of Independence was adopted on July 4, 1776. This is why Americans celebrate Independence Day (the 4th of July) every year — it marks the day America officially declared freedom from Britain.',
      brief_my:
        'လွတ်လပ်ရေးကြေညာစာတမ်းကို ၁၇၇၆ ခုနှစ် ဇူလိုင်လ ၄ ရက်တွင် အတည်ပြုခဲ့သည်။ ထို့ကြောင့် အမေရိကန်များ နှစ်စဉ် လွတ်လပ်ရေးနေ့ (ဇူလိုင် ၄) ကို ကျင်းပကြသည် — ဗြိတိန်မှ လွတ်လပ်ရေး တရားဝင်ကြေညာသည့်နေ့ ဖြစ်သည်။',
      mnemonic_en: '7/4/76 — "76 was heaven for freedom" (July 4, 1776).',
      mnemonic_my: '၇/၄/၇၆ — ဇူလိုင် ၄၊ ၁၇၇၆ — လွတ်လပ်ရေးနေ့ ရက်စွဲ။',
      funFact_en:
        'John Adams believed July 2 (when Congress voted for independence) should be the holiday, not July 4 (when the document was formally adopted). He refused July 4 celebrations.',
      funFact_my:
        'ဂျွန်အဒမ်စ်က ဇူလိုင် ၂ (ကွန်ဂရက်က လွတ်လပ်ရေးအတွက် မဲပေးသောနေ့) ကို ပိတ်ရက်ဖြစ်သင့်သည်ဟု ယုံကြည်ခဲ့ပြီး ဇူလိုင် ၄ (စာတမ်းကို တရားဝင်အတည်ပြုသောနေ့) ကို လက်မခံခဲ့ပါ။',
      citation: 'USCIS Civics Test Item 63',
      commonMistake_en:
        'September 17, 1787 is when the Constitution was signed, not the Declaration. December 7, 1941 is Pearl Harbor Day. Do not confuse these dates.',
      commonMistake_my:
        'စက်တင်ဘာ ၁၇၊ ၁၇၈၇ သည် ဖွဲ့စည်းပုံအခြေခံဥပဒေ လက်မှတ်ရေးထိုးသောနေ့ ဖြစ်ပြီး ကြေညာစာတမ်း မဟုတ်ပါ။ ဒီဇင်ဘာ ၇၊ ၁၉၄၁ သည် ပုလဲဆိပ်ကမ်းနေ့ ဖြစ်သည်။ ဤရက်စွဲများကို မရောထွေးပါနှင့်။',
      relatedQuestionIds: ['HIST-C05', 'SYM-12'],
    },
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
    explanation: {
      brief_en:
        'The 13 original states were the former British colonies that declared independence in 1776. They were all along the East Coast, from New Hampshire in the north to Georgia in the south.',
      brief_my:
        'မူလပြည်နယ် ၁၃ ခုသည် ၁၇၇၆ တွင် လွတ်လပ်ရေးကြေညာခဲ့သော ဗြိတိသျှကိုလိုနီဟောင်းများ ဖြစ်သည်။ မြောက်ဘက်ရှိ နယူးဟမ်ရှိုင်းယားမှ တောင်ဘက်ရှိ ဂျော်ဂျီယာအထိ အရှေ့ဘက်ကမ်းရိုးတန်းတစ်လျှောက် ရှိခဲ့သည်။',
      mnemonic_en:
        'Remember the "New" states: New Hampshire, New York, New Jersey — plus 10 more along the East Coast.',
      mnemonic_my:
        '"နယူး" ပြည်နယ်များ — နယူးဟမ်ရှိုင်းယား၊ နယူးယောက်၊ နယူးဂျာစီ — နှင့် အရှေ့ကမ်းရိုးတန်းတစ်လျှောက် နောက်ထပ် ၁၀ ခု။',
      funFact_en:
        'Delaware was the first state to ratify the Constitution on December 7, 1787, which is why it is known as "The First State."',
      funFact_my:
        'ဒယ်လာဝဲသည် ၁၇၈၇ ခုနှစ် ဒီဇင်ဘာ ၇ ရက်နေ့တွင် ဖွဲ့စည်းပုံအခြေခံဥပဒေကို ပထမဆုံးအတည်ပြုခဲ့သော ပြည်နယ်ဖြစ်ပြီး "ပထမဆုံးပြည်နယ်" ဟု လူသိများသည်။',
      citation: 'USCIS Civics Test Item 64',
      commonMistake_en:
        'Florida, Texas, California, Ohio, and other western/southern states were NOT among the original 13. All 13 were on the East Coast.',
      commonMistake_my:
        'ဖလော်ရီဒါ၊ တက္ကဆက်၊ ကယ်လီဖိုးနီးယား၊ အိုဟိုင်းယိုးနှင့် အခြားအနောက်/တောင်ပိုင်းပြည်နယ်များသည် မူလ ၁၃ ခုတွင် မပါဝင်ပါ။ ၁၃ ခုလုံး အရှေ့ဘက်ကမ်းရိုးတန်းတွင် ရှိခဲ့သည်။',
      relatedQuestionIds: ['SYM-09', 'SYM-10'],
    },
    tricky: true,
  },
  {
    id: 'HIST-C08',
    question_en: 'What happened at the Constitutional Convention?',
    question_my: 'ဖွဲ့စည်းပုံအခြေခံဥပဒေ (Constitution) ညီလာခံမှာ ဘာဖြစ်ခဲ့သလဲ။',
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
        text_my: 'ဂျော့ချ် ဝါရှင်တန် (George Washington)ကို သမ္မတအဖြစ် ရွေးကောက်တင်မြှောက်ခဲ့သည်။',
        correct: false,
      },
    ],
    explanation: {
      brief_en:
        'At the Constitutional Convention in 1787 in Philadelphia, the Founding Fathers wrote the U.S. Constitution. They replaced the weaker Articles of Confederation with a stronger framework for the new national government.',
      brief_my:
        '၁၇၈၇ ခုနှစ် ဖီလဒဲလ်ဖီးယားရှိ ဖွဲ့စည်းပုံအခြေခံဥပဒေညီလာခံတွင် တည်ထောင်သူဖခင်ကြီးများသည် အမေရိကန်ဖွဲ့စည်းပုံအခြေခံဥပဒေကို ရေးသားခဲ့သည်။ အားနည်းသော ကွန်ဖက်ဒရေးရှင်းစာချုပ်ကို အစားထိုးခဲ့သည်။',
      mnemonic_en: 'CC = Constitutional Convention = Constitution Created. Philadelphia, 1787.',
      mnemonic_my: 'CC = ဖွဲ့စည်းပုံညီလာခံ = ဖွဲ့စည်းပုံဖန်တီးခြင်း။ ဖီလဒဲလ်ဖီးယား၊ ၁၇၈၇။',
      funFact_en:
        'The Convention was supposed to only fix the Articles of Confederation, but delegates decided to write an entirely new document — the Constitution we still use today.',
      funFact_my:
        'ညီလာခံသည် ကွန်ဖက်ဒရေးရှင်းစာချုပ်ကို ပြင်ဆင်ရန်သာ ဖြစ်သော်လည်း ကိုယ်စားလှယ်များက လုံးဝအသစ်စာတမ်းတစ်ခု — ယနေ့ဆက်လက်အသုံးပြုနေသော ဖွဲ့စည်းပုံကို ရေးသားရန် ဆုံးဖြတ်ခဲ့သည်။',
      citation: 'USCIS Civics Test Item 65',
      commonMistake_en:
        'The Declaration of Independence (1776) and the Constitution (1787) are different documents. The Declaration declared freedom; the Constitution created the government structure.',
      commonMistake_my:
        'လွတ်လပ်ရေးကြေညာစာတမ်း (၁၇၇၆) နှင့် ဖွဲ့စည်းပုံအခြေခံဥပဒေ (၁၇၈၇) တို့သည် မတူညီသောစာတမ်းများ ဖြစ်သည်။ ကြေညာစာတမ်းက လွတ်လပ်ရေးကြေညာခဲ့ပြီး ဖွဲ့စည်းပုံက အစိုးရဖွဲ့စည်းပုံကို ဖန်တီးခဲ့သည်။',
      relatedQuestionIds: ['HIST-C09', 'GOV-P04', 'GOV-P05'],
    },
  },
  {
    id: 'HIST-C09',
    question_en: 'When was the Constitution written?',
    question_my: 'ဖွဲ့စည်းပုံအခြေခံဥပဒေ (Constitution) ကို ဘယ်အချိန်မှာ ရေးသားခဲ့သလဲ။',
    category: 'American History: Colonial Period and Independence',
    studyAnswers: [{ text_en: '1787', text_my: '၁၇၈၇' }],
    answers: [
      { text_en: '1787', text_my: '၁၇၈၇', correct: true },
      { text_en: '1776', text_my: '၁၇၇၆', correct: false },
      { text_en: '1865', text_my: '၁၈၆၅', correct: false },
      { text_en: '1901', text_my: '၁၉၀၁', correct: false },
    ],
    explanation: {
      brief_en:
        'The Constitution was written in 1787 at the Constitutional Convention in Philadelphia. It was ratified (approved) in 1788 and took effect in 1789, making it the supreme law of the land.',
      brief_my:
        'ဖွဲ့စည်းပုံအခြေခံဥပဒေကို ၁၇၈၇ ခုနှစ် ဖီလဒဲလ်ဖီးယားရှိ ဖွဲ့စည်းပုံအခြေခံဥပဒေညီလာခံတွင် ရေးသားခဲ့သည်။ ၁၇၈၈ တွင် အတည်ပြုပြီး ၁၇၈၉ တွင် အသက်ဝင်ခဲ့သည်။',
      mnemonic_en:
        '1787 — "17-ATE-7" — the Constitution was written in the year that ends in "87."',
      mnemonic_my: '၁၇၈၇ — ကြေညာစာတမ်း ၁၇၇၆ ပြီးနောက် ၁၁ နှစ်အကြာ ဖွဲ့စည်းပုံကို ရေးသားခဲ့သည်။',
      funFact_en:
        'The U.S. Constitution is the oldest written national constitution still in use. It has been amended only 27 times in over 230 years.',
      funFact_my:
        'အမေရိကန်ဖွဲ့စည်းပုံအခြေခံဥပဒေသည် ဆက်လက်အသုံးပြုနေသော အဟောင်းဆုံးရေးသားထားသော အမျိုးသားဖွဲ့စည်းပုံ ဖြစ်သည်။ နှစ် ၂၃၀ ကျော်အတွင်း ၂၇ ကြိမ်သာ ပြင်ဆင်ခဲ့သည်။',
      citation: 'USCIS Civics Test Item 66',
      commonMistake_en:
        '1776 is when the Declaration of Independence was adopted, not the Constitution. The Constitution came 11 years later in 1787.',
      commonMistake_my:
        '၁၇၇၆ သည် လွတ်လပ်ရေးကြေညာစာတမ်း အတည်ပြုသောနှစ် ဖြစ်ပြီး ဖွဲ့စည်းပုံ မဟုတ်ပါ။ ဖွဲ့စည်းပုံသည် ၁၁ နှစ်အကြာ ၁၇၈၇ တွင် ရောက်လာခဲ့သည်။',
      relatedQuestionIds: ['HIST-C08', 'GOV-P04'],
    },
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
      {
        text_en: 'Thomas Jefferson',
        text_my: 'သောမတ်စ် ဂျက်ဖာဆင် (Thomas Jefferson)',
        correct: false,
      },
      {
        text_en: 'George Washington',
        text_my: 'ဂျော့ချ် ဝါရှင်တန် (George Washington)',
        correct: false,
      },
      {
        text_en: 'Abraham Lincoln',
        text_my: 'အေဘရာဟမ် လင်ကွန်း (Abraham Lincoln)',
        correct: false,
      },
    ],
    explanation: {
      brief_en:
        'The Federalist Papers were 85 essays written by Alexander Hamilton, James Madison, and John Jay under the pen name "Publius." They argued for ratifying the Constitution and explained how the new government would work.',
      brief_my:
        'ဖက်ဒရယ်လစ်စာတမ်းများသည် အလက်ဇန္ဒား ဟာမီလ်တန်၊ ဂျိမ်းစ် မက်ဒီဆင်နှင့် ဂျွန် ဂျေးတို့က "Publius" ကလောင်အမည်ဖြင့် ရေးသားခဲ့သော စာစီစာကုံး ၈၅ ခု ဖြစ်သည်။',
      funFact_en:
        'Hamilton wrote 51 of the 85 essays — more than half! The musical "Hamilton" helped make these historical figures famous again centuries later.',
      funFact_my:
        'ဟာမီလ်တန်သည် စာစီစာကုံး ၈၅ ခုအနက် ၅၁ ခုကို ရေးသားခဲ့သည် — ထက်ဝက်ကျော်! "Hamilton" တေးဂီတပြဇာတ်က ဤသမိုင်းဝင်ပုဂ္ဂိုလ်များကို ရာစုနှစ်များအကြာတွင် ထပ်မံကျော်ကြားစေခဲ့သည်။',
      mnemonic_en: 'H-M-J: Hamilton, Madison, Jay wrote the Federalist Papers.',
      mnemonic_my: 'H-M-J: ဟာမီလ်တန်၊ မက်ဒီဆင်၊ ဂျေး — ဖက်ဒရယ်လစ်စာတမ်း စာရေးဆရာ သုံးဦး။',
      citation: 'USCIS Civics Test Item 67',
      commonMistake_en:
        'Thomas Jefferson was NOT one of the Federalist Papers authors — he was in France as ambassador during this time. George Washington also did not write them.',
      commonMistake_my:
        'သောမတ်စ်ဂျက်ဖာဆင်သည် ဖက်ဒရယ်လစ်စာတမ်း စာရေးဆရာများထဲတွင် မပါဝင်ပါ — ထိုအချိန်တွင် သံအမတ်အဖြစ် ပြင်သစ်တွင် ရှိနေခဲ့သည်။ ဂျော့ချ်ဝါရှင်တန်လည်း ရေးသားခဲ့ခြင်း မရှိပါ။',
      relatedQuestionIds: ['HIST-C08', 'HIST-C09', 'GOV-P04'],
    },
  },
  {
    id: 'HIST-C11',
    question_en: 'What is one thing Benjamin Franklin is famous for?',
    question_my: 'ဘင်ဂျမင် ဖရန်ကလင် (Benjamin Franklin) က ဘာတစ်ခုကြောင့် ကျော်ကြားသလဲ။',
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
    explanation: {
      brief_en:
        'Benjamin Franklin was a true polymath — he served as a U.S. diplomat, was the oldest delegate at the Constitutional Convention, became the first Postmaster General, started free libraries, and invented bifocal glasses and the lightning rod.',
      brief_my:
        'ဘင်ဂျမင် ဖရန်ကလင် (Benjamin Franklin)သည် အမေရိကန်သံတမန်အဖြစ် ဆောင်ရွက်ခဲ့ပြီး ဖွဲ့စည်းပုံညီလာခံ၏ အသက်အကြီးဆုံးကိုယ်စားလှယ်ဖြစ်ကာ ပထမဆုံးစာတိုက်ဦးစီးချုပ်ဖြစ်ခဲ့ပြီး အခမဲ့စာကြည့်တိုက်များကို စတင်ခဲ့သည်။',
      mnemonic_en: 'DPLA: Diplomat, Postmaster, Libraries, Almanac — Franklin did it all.',
      mnemonic_my:
        'DPLA: သံတမန်၊ စာတိုက်ဦးစီးချုပ်၊ စာကြည့်တိုက်များ၊ ပြက္ခဒိန် — ဖရန်ကလင် အားလုံးလုပ်ခဲ့သည်။',
      funFact_en:
        'Franklin is on the $100 bill despite never being president! He was 81 at the Constitutional Convention — by far the oldest delegate.',
      funFact_my:
        'ဖရန်ကလင်သည် သမ္မတမဖြစ်ဖူးသော်လည်း ဒေါ်လာ ၁၀၀ ငွေစက္ကူတွင် ပုံပါသည်! ဖွဲ့စည်းပုံညီလာခံတွင် အသက် ၈၁ နှစ်ဖြစ်ပြီး အသက်အကြီးဆုံးကိုယ်စားလှယ် ဖြစ်ခဲ့သည်။',
      citation: 'USCIS Civics Test Item 68',
      commonMistake_en:
        'Franklin was NOT a president, NOT a military general, and did NOT write the national anthem. He was a diplomat, inventor, writer, and civic leader.',
      commonMistake_my:
        'ဖရန်ကလင်သည် သမ္မတမဖြစ်ခဲ့ပါ၊ စစ်ဗိုလ်ချုပ်မဟုတ်ပါ၊ နိုင်ငံတော်သီချင်းကိုလည်း မရေးခဲ့ပါ။ သူသည် သံတမန်၊ တီထွင်သူ၊ စာရေးဆရာနှင့် အရပ်ဘက်ခေါင်းဆောင် ဖြစ်ခဲ့သည်။',
      relatedQuestionIds: ['HIST-C08', 'HIST-C05'],
    },
  },
  {
    id: 'HIST-C12',
    question_en: 'Who is the "Father of Our Country"?',
    question_my: '"ငါတို့နိုင်ငံရဲ့ ဖခင်" (Father of Our Country) ဆိုတာ ဘယ်သူလဲ။',
    category: 'American History: Colonial Period and Independence',
    studyAnswers: [{ text_en: '(George) Washington', text_my: '(ဂျော့ခ်ျ) ဝါရှင်တန်' }],
    answers: [
      { text_en: '(George) Washington', text_my: '(ဂျော့ခ်ျ) ဝါရှင်တန်', correct: true },
      {
        text_en: 'Abraham Lincoln',
        text_my: 'အေဘရာဟမ် လင်ကွန်း (Abraham Lincoln)',
        correct: false,
      },
      {
        text_en: 'Thomas Jefferson',
        text_my: 'သောမတ်စ် ဂျက်ဖာဆင် (Thomas Jefferson)',
        correct: false,
      },
      {
        text_en: 'Benjamin Franklin',
        text_my: 'ဘင်ဂျမင် ဖရန်ကလင် (Benjamin Franklin)',
        correct: false,
      },
    ],
    explanation: {
      brief_en:
        'George Washington is called the "Father of Our Country" because he led the Continental Army to victory in the Revolutionary War and then served as the first President, setting many precedents for the new nation.',
      brief_my:
        'ဂျော့ချ် ဝါရှင်တန် (George Washington)ကို "ကျွန်ုပ်တို့နိုင်ငံ၏ ဖခင်" ဟုခေါ်သည် — တော်လှန်ရေးစစ်ပွဲတွင် တိုက်ကြီးစစ်တပ်ကို အောင်ပွဲဆင်နွှဲစေပြီး ပထမဆုံးသမ္မတအဖြစ် ဆောင်ရွက်ကာ နိုင်ငံသစ်အတွက် နမူနာများစွာ ချမှတ်ခဲ့သည်။',
      mnemonic_en:
        'Washington = "Father" — first in war, first in peace, first in the hearts of his countrymen.',
      mnemonic_my:
        'ဝါရှင်တန် = "ဖခင်" — စစ်ပွဲတွင်ပထမ၊ ငြိမ်းချမ်းရေးတွင်ပထမ၊ နိုင်ငံသားများ၏ နှလုံးသားတွင်ပထမ။',
      funFact_en:
        'Washington voluntarily stepped down after two terms as president, setting the tradition of peaceful transfer of power that continues today.',
      funFact_my:
        'ဝါရှင်တန်သည် သမ္မတသက်တမ်း နှစ်ကြိမ်အပြီးတွင် ဆန္ဒအလျောက် နှုတ်ထွက်ခဲ့ပြီး ယနေ့တိုင် ဆက်လက်ရှိနေသော ငြိမ်းချမ်းစွာ အာဏာလွှဲပြောင်းခြင်း အစဉ်အလာကို ချမှတ်ခဲ့သည်။',
      citation: 'USCIS Civics Test Item 69',
      commonMistake_en:
        'Lincoln is called "The Great Emancipator" (freed slaves), not "Father of Our Country." Jefferson wrote the Declaration but Washington is the "Father."',
      commonMistake_my:
        'လင်ကွန်းကို "ကြီးမြတ်သောလွတ်မြောက်စေသူ" (ကျွန်များကိုလွတ်မြောက်စေသူ) ဟုခေါ်ပြီး "နိုင်ငံ၏ဖခင်" မဟုတ်ပါ။ ဂျက်ဖာဆင်က ကြေညာစာတမ်းရေးသားခဲ့သော်လည်း ဝါရှင်တန်က "ဖခင်" ဖြစ်သည်။',
      relatedQuestionIds: ['HIST-C13', 'GOV-S18'],
    },
  },
  {
    id: 'HIST-C13',
    question_en: 'Who was the first President?',
    question_my: 'ပထမဆုံး သမ္မတ (President) က ဘယ်သူလဲ။',
    category: 'American History: Colonial Period and Independence',
    studyAnswers: [{ text_en: '(George) Washington', text_my: '(ဂျော့ခ်ျ) ဝါရှင်တန်' }],
    answers: [
      { text_en: '(George) Washington', text_my: '(ဂျော့ခ်ျ) ဝါရှင်တန်', correct: true },
      { text_en: 'John Adams', text_my: 'ဂျွန် အဒမ်', correct: false },
      {
        text_en: 'Thomas Jefferson',
        text_my: 'သောမတ်စ် ဂျက်ဖာဆင် (Thomas Jefferson)',
        correct: false,
      },
      {
        text_en: 'Abraham Lincoln',
        text_my: 'အေဘရာဟမ် လင်ကွန်း (Abraham Lincoln)',
        correct: false,
      },
    ],
    explanation: {
      brief_en:
        'George Washington was the first President of the United States, serving from 1789 to 1797. He was unanimously elected by the Electoral College — the only president in history to achieve this.',
      brief_my:
        'ဂျော့ချ် ဝါရှင်တန် (George Washington)သည် ၁၇၈၉ မှ ၁၇၉၇ ခုနှစ်အထိ တာဝန်ထမ်းဆောင်ခဲ့သော အမေရိကန်ပြည်ထောင်စု၏ ပထမဆုံးသမ္မတ ဖြစ်သည်။ ရွေးကောက်တင်မြှောက်ရေးအဖွဲ့က တညီတညွတ်တည်း ရွေးချယ်ခဲ့သည်။',
      mnemonic_en: '#1 = Washington — the first president, the "Father," the one on the $1 bill.',
      mnemonic_my: '#၁ = ဝါရှင်တန် — ပထမဆုံးသမ္မတ၊ "ဖခင်"၊ ဒေါ်လာ ၁ ငွေစက္ကူပေါ်ရှိသူ။',
      funFact_en:
        "Washington is the only president to have a state named after him. The nation's capital, Washington D.C., is also named in his honor.",
      funFact_my:
        'ဝါရှင်တန်သည် သူ့နာမည်ဖြင့် ပြည်နယ်အမည်ပေးခံရသော တစ်ဦးတည်းသော သမ္မတဖြစ်သည်။ နိုင်ငံ၏မြို့တော် ဝါရှင်တန်ဒီစီကိုလည်း သူ၏ ဂုဏ်ပြုအမည်ပေးထားသည်။',
      citation: 'USCIS Civics Test Item 70',
      commonMistake_en:
        'John Adams was the SECOND president, not the first. Some think Adams because he was first VP, but Washington was the first president.',
      commonMistake_my:
        'ဂျွန်အဒမ်စ်သည် ဒုတိယမြောက်သမ္မတ ဖြစ်ပြီး ပထမဆုံးမဟုတ်ပါ။ အချို့က အဒမ်စ်ဟုထင်ကြသည် — သူသည် ပထမဆုံးဒု-သမ္မတဖြစ်ခဲ့သော်လည်း ဝါရှင်တန်က ပထမဆုံးသမ္မတ ဖြစ်သည်။',
      relatedQuestionIds: ['HIST-C12', 'SYM-07'],
    },
  },
];
