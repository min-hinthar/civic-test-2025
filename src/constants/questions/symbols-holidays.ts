import type { Question } from '@/types';

/**
 * Civics: Symbols and Holidays
 *
 * ID Prefix: SYM-## (13 questions)
 * @verified claude-initial-pass 2026-02-18 — pending 3-AI consensus
 */

export const symbolsHolidaysQuestions: Question[] = [
  {
    id: 'SYM-01',
    question_en: 'Name one of the two longest rivers in the United States.',
    question_my: 'အမေရိကန်မှာ အရှည်ဆုံးမြစ်နှစ်စင်းထဲက တစ်စင်းကို ပြောပါ။',
    category: 'Civics: Symbols and Holidays',
    studyAnswers: [
      { text_en: 'Missouri (River)', text_my: 'မစ်ဆူရီ (မြစ်)' },
      { text_en: 'Mississippi (River)', text_my: 'မစ္စစ္စပီ (မြစ်)' },
    ],
    answers: [
      { text_en: 'Mississippi (River)', text_my: 'မစ္စစ္စပီ (မြစ်)', correct: true },
      { text_en: 'Colorado (River)', text_my: 'ကော်လိုရာဒို (မြစ်)', correct: false },
      { text_en: 'Ohio (River)', text_my: 'အိုဟိုင်းယိုး (မြစ်)', correct: false },
      { text_en: 'Hudson (River)', text_my: 'ဟဒ်ဆန် (မြစ်)', correct: false },
    ],
    explanation: {
      brief_en:
        "The two longest rivers in the United States are the Missouri River (2,341 miles) and the Mississippi River (2,320 miles). The Missouri flows into the Mississippi, and together they form one of the world's great river systems.",
      brief_my:
        'အမေရိကန်ပြည်ထောင်စုရှိ အရှည်ဆုံးမြစ်နှစ်စင်းမှာ မစ်ဆူရီမြစ် (မိုင် ၂,၃၄၁) နှင့် မစ္စစ္စပီမြစ် (မိုင် ၂,၃၂၀) ဖြစ်သည်။ မစ်ဆူရီသည် မစ္စစ္စပီထဲသို့ စီးဝင်ပြီး အတူတကွ ကမ္ဘာ့ကြီးမားသော မြစ်စနစ်တစ်ခု ဖြစ်ကြသည်။',
      mnemonic_en:
        'Both start with "M" and "Miss" — Missouri and Mississippi, the two longest rivers.',
      mnemonic_my: '"M" နှင့် စသော မြစ် ၂ စင်း — မစ်ဆူရီနှင့် မစ္စစ္စပီ၊ အရှည်ဆုံး မြစ်များ။',
      funFact_en:
        'The Mississippi River is so wide at some points that you can barely see the other side. It flows through 10 states from Minnesota to Louisiana.',
      funFact_my:
        'မစ္စစ္စပီမြစ်သည် အချို့နေရာများတွင် ကျယ်လွန်းသဖြင့် တစ်ဖက်ကမ်းကို မမြင်နိုင်ပါ။ မီနီဆိုတာမှ လူဝီစီယားနားအထိ ပြည်နယ် ၁၀ ခုကို ဖြတ်စီးသည်။',
      citation: 'USCIS Civics Test Item 88',
      commonMistake_en:
        'The Colorado, Ohio, and Hudson rivers are important but much shorter. Only the Missouri and Mississippi are the two longest.',
      commonMistake_my:
        'ကော်လိုရာဒို၊ အိုဟိုင်းယိုးနှင့် ဟဒ်ဆန်မြစ်များသည် အရေးကြီးသော်လည်း များစွာတိုသည်။ မစ်ဆူရီနှင့် မစ္စစ္စပီသာ အရှည်ဆုံးနှစ်စင်း ဖြစ်သည်။',
      relatedQuestionIds: ['SYM-02', 'SYM-03'],
    },
  },
  {
    id: 'SYM-02',
    question_en: 'What ocean is on the West Coast of the United States?',
    question_my: 'အမေရိကန်ရဲ့ အနောက်ဘက်ကမ်းရိုးတန်းမှာ ဘယ်သမုဒ္ဒရာ ရှိသလဲ။',
    category: 'Civics: Symbols and Holidays',
    studyAnswers: [{ text_en: 'Pacific (Ocean)', text_my: 'ပစိဖိတ် (သမုဒ္ဒရာ)' }],
    answers: [
      { text_en: 'Pacific (Ocean)', text_my: 'ပစိဖိတ် (သမုဒ္ဒရာ)', correct: true },
      { text_en: 'Atlantic (Ocean)', text_my: 'အတ္တလန္တိတ် (သမုဒ္ဒရာ)', correct: false },
      { text_en: 'Arctic (Ocean)', text_my: 'အာတိတ် (သမုဒ္ဒရာ)', correct: false },
      { text_en: 'Indian (Ocean)', text_my: 'အိန္ဒိယ (သမုဒ္ဒရာ)', correct: false },
    ],
    explanation: {
      brief_en:
        'The Pacific Ocean is on the West Coast of the United States. It is the largest and deepest ocean in the world. States like California, Oregon, and Washington border the Pacific.',
      brief_my:
        'ပစိဖိတ်သမုဒ္ဒရာသည် အမေရိကန်ပြည်ထောင်စု၏ အနောက်ဘက်ကမ်းရိုးတန်းတွင် ရှိသည်။ ကမ္ဘာ့အကြီးဆုံးနှင့် အနက်ဆုံး သမုဒ္ဒရာ ဖြစ်သည်။ ကယ်လီဖိုးနီးယား၊ အော်ရီဂွန်နှင့် ဝါရှင်တန် ပြည်နယ်များ ပစိဖိတ်နှင့် ထိစပ်နေသည်။',
      mnemonic_en:
        'West = Pacific. Think "Pacific sunset" — the sun sets in the west over the Pacific.',
      mnemonic_my:
        'အနောက် = ပစိဖိတ်။ "ပစိဖိတ်နေဝင်ချိန်" ဟု မှတ်ပါ — နေသည် အနောက်ဘက် ပစိဖိတ်ပေါ်တွင် ဝင်သည်။',
      funFact_en:
        'The Pacific Ocean covers about 63 million square miles — larger than all of Earth\'s land area combined. Its name means "peaceful" in Latin.',
      funFact_my:
        'ပစိဖိတ်သမုဒ္ဒရာသည် စတုရန်းမိုင် ၆၃ သန်းခန့် ကျယ်ပြီး ကမ္ဘာ့မြေပြင်ဧရိယာ အားလုံးပေါင်းထက် ပိုကြီးသည်။ ၎င်း၏အမည်သည် လက်တင်ဘာသာဖြင့် "ငြိမ်းချမ်းသော" ဟု အဓိပ္ပာယ်ရသည်။',
      citation: 'USCIS Civics Test Item 89',
      commonMistake_en:
        'Atlantic is on the EAST Coast, not the West. Pacific = West, Atlantic = East. Remember: "P" for Pacific comes after "A" for Atlantic, just like West comes after East on a map read left to right.',
      commonMistake_my:
        'အတ္တလန္တိတ်သည် အရှေ့ဘက်ကမ်းရိုးတန်းတွင် ရှိပြီး အနောက်ဘက် မဟုတ်ပါ။ ပစိဖိတ် = အနောက်၊ အတ္တလန္တိတ် = အရှေ့။',
      relatedQuestionIds: ['SYM-03', 'SYM-05'],
    },
    tricky: true,
  },
  {
    id: 'SYM-03',
    question_en: 'What ocean is on the East Coast of the United States?',
    question_my: 'အမေရိကန်ရဲ့ အရှေ့ဘက်ကမ်းရိုးတန်းမှာ ဘယ်သမုဒ္ဒရာ ရှိသလဲ။',
    category: 'Civics: Symbols and Holidays',
    studyAnswers: [{ text_en: 'Atlantic (Ocean)', text_my: 'အတ္တလန္တိတ် (သမုဒ္ဒရာ)' }],
    answers: [
      { text_en: 'Atlantic (Ocean)', text_my: 'အတ္တလန္တိတ် (သမုဒ္ဒရာ)', correct: true },
      { text_en: 'Pacific (Ocean)', text_my: 'ပစိဖိတ် (သမုဒ္ဒရာ)', correct: false },
      { text_en: 'Arctic (Ocean)', text_my: 'အာတိတ် (သမုဒ္ဒရာ)', correct: false },
      { text_en: 'Southern (Ocean)', text_my: 'တောင်ပိုင်း (သမုဒ္ဒရာ)', correct: false },
    ],
    explanation: {
      brief_en:
        'The Atlantic Ocean is on the East Coast of the United States. It separates North America from Europe and Africa. States like New York, Florida, and Massachusetts border the Atlantic.',
      brief_my:
        'အတ္တလန္တိတ်သမုဒ္ဒရာသည် အမေရိကန်ပြည်ထောင်စု၏ အရှေ့ဘက်ကမ်းရိုးတန်းတွင် ရှိသည်။ မြောက်အမေရိကကို ဥရောပနှင့် အာဖရိကမှ ခြားနားစေသည်။ နယူးယောက်၊ ဖလော်ရီဒါနှင့် မက်ဆာချူးဆက် ပြည်နယ်များ အတ္တလန္တိတ်နှင့် ထိစပ်နေသည်။',
      mnemonic_en:
        'East = Atlantic. Think "A" for Atlantic = "A" comes first, like the East Coast where the sun rises first.',
      mnemonic_my: 'အရှေ့ = အတ္တလန္တိတ်။ "A" = Atlantic — နေအရင်ထွက်သော အရှေ့ဘက်ကမ်းရိုးတန်း။',
      funFact_en:
        'The Titanic sank in the North Atlantic Ocean in 1912. The Atlantic is the second-largest ocean, about half the size of the Pacific.',
      funFact_my:
        'တိုင်တန်းနစ်သည် ၁၉၁၂ ခုနှစ်တွင် မြောက်အတ္တလန္တိတ်သမုဒ္ဒရာတွင် နစ်မြုပ်ခဲ့သည်။ အတ္တလန္တိတ်သည် ဒုတိယအကြီးဆုံးသမုဒ္ဒရာဖြစ်ပြီး ပစိဖိတ်၏ ထက်ဝက်ခန့် ကျယ်သည်။',
      citation: 'USCIS Civics Test Item 90',
      commonMistake_en:
        'Pacific is on the WEST Coast, not the East. This is a common mix-up with the previous question about the West Coast.',
      commonMistake_my:
        'ပစိဖိတ်သည် အနောက်ဘက်ကမ်းရိုးတန်းတွင် ရှိပြီး အရှေ့ဘက် မဟုတ်ပါ။ ယခင်မေးခွန်းနှင့် ရောထွေးလွယ်သည်။',
      relatedQuestionIds: ['SYM-02', 'SYM-06'],
    },
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
      { text_en: 'Northern Mariana Islands', text_my: 'မြောက်ပိုင်း မာရီယာနာကျွန်းစု' },
      { text_en: 'Guam', text_my: 'ဂူအမ်' },
    ],
    answers: [
      { text_en: 'Puerto Rico', text_my: 'ပေါ်တိုရီကို', correct: true },
      { text_en: 'Haiti', text_my: 'ဟေတီ', correct: false },
      { text_en: 'Cuba', text_my: 'ကျူးဘား', correct: false },
      { text_en: 'The Bahamas', text_my: 'ဘဟားမား', correct: false },
    ],
    explanation: {
      brief_en:
        'The U.S. has five main territories: Puerto Rico, U.S. Virgin Islands, American Samoa, Northern Mariana Islands, and Guam. These are areas under U.S. control that are not states.',
      brief_my:
        'အမေရိကန်တွင် အဓိကနယ်မြေ ၅ ခု ရှိသည် — ပေါ်တိုရီကို၊ အမေရိကန်ဗာဂျင်ကျွန်းစု၊ အမေရိကန်ဆာမိုအာ၊ မြောက်ပိုင်းမာရီယာနာကျွန်းစုနှင့် ဂူအမ်။ ၎င်းတို့သည် ပြည်နယ်မဟုတ်သော အမေရိကန်ထိန်းချုပ်မှုအောက်ရှိ နယ်မြေများ ဖြစ်သည်။',
      mnemonic_en:
        'PUG-VAN: Puerto Rico, U.S. Virgin Islands, Guam, (American Samoa, Northern Mariana) — 5 territories.',
      mnemonic_my:
        'PUG-VAN: ပေါ်တိုရီကို၊ ဗာဂျင်ကျွန်းစု၊ ဂူအမ်၊ (ဆာမိုအာ၊ မာရီယာနာ) — နယ်မြေ ၅ ခု။',
      funFact_en:
        'Puerto Rico has been a U.S. territory since 1898. Its residents are U.S. citizens but cannot vote for President unless they live in a state.',
      funFact_my:
        'ပေါ်တိုရီကိုသည် ၁၈၉၈ ခုနှစ်ကတည်းက အမေရိကန်နယ်မြေ ဖြစ်ခဲ့သည်။ ၎င်း၏နေထိုင်သူများသည် အမေရိကန်နိုင်ငံသားများ ဖြစ်သော်လည်း ပြည်နယ်တစ်ခုတွင် မနေထိုင်ပါက သမ္မတအတွက် မဲပေးခွင့်မရှိပါ။',
      citation: 'USCIS Civics Test Item 91',
      commonMistake_en:
        'Haiti, Cuba, and The Bahamas are independent countries in the Caribbean, NOT U.S. territories. Puerto Rico is the largest U.S. territory.',
      commonMistake_my:
        'ဟေတီ၊ ကျူးဘားနှင့် ဘဟားမားတို့သည် ကာရစ်ဘီယံတွင်ရှိသော လွတ်လပ်သောနိုင်ငံများ ဖြစ်ပြီး အမေရိကန်နယ်မြေများ မဟုတ်ပါ။ ပေါ်တိုရီကိုသည် အကြီးဆုံးအမေရိကန်နယ်မြေ ဖြစ်သည်။',
      relatedQuestionIds: ['SYM-05', 'SYM-06'],
    },
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
    explanation: {
      brief_en:
        'Thirteen states border Canada along the northern U.S. boundary, from Maine in the east to Alaska in the west. The U.S.-Canada border is the longest international border in the world.',
      brief_my:
        'ပြည်နယ် ၁၃ ခုသည် အမေရိကန်မြောက်ဘက်နယ်နိမိတ်တစ်လျှောက် ကနေဒါနှင့် ထိစပ်နေသည် — အရှေ့ဘက် မိန်းမှ အနောက်ဘက် အလက်စကာအထိ။ အမေရိကန်-ကနေဒါနယ်နိမိတ်သည် ကမ္ဘာ့အရှည်ဆုံး နိုင်ငံတကာနယ်နိမိတ် ဖြစ်သည်။',
      mnemonic_en:
        'Canada = NORTH border. Think of cold states up north: Maine, Montana, Minnesota, Michigan, Washington, Alaska.',
      mnemonic_my:
        'ကနေဒါ = မြောက်ဘက်နယ်နိမိတ်။ မြောက်ဘက်ရှိ အေးသောပြည်နယ်များ — မိန်း၊ မွန်တာနာ၊ မီနီဆိုတာ၊ မီရှီဂန်၊ ဝါရှင်တန်၊ အလက်စကာ။',
      funFact_en:
        'The U.S.-Canada border stretches 5,525 miles, making it the longest international border in the world. It is sometimes called the "longest undefended border."',
      funFact_my:
        'အမေရိကန်-ကနေဒါနယ်နိမိတ်သည် မိုင် ၅,၅၂၅ ရှည်ပြီး ကမ္ဘာ့အရှည်ဆုံး နိုင်ငံတကာနယ်နိမိတ် ဖြစ်သည်။ "အရှည်ဆုံး ကာကွယ်မှုမရှိသော နယ်နိမိတ်" ဟု တစ်ခါတစ်ရံ ခေါ်ကြသည်။',
      citation: 'USCIS Civics Test Item 92',
      commonMistake_en:
        'California, Texas, and Florida do NOT border Canada. California and Texas border Mexico. Florida is in the southeast, far from Canada.',
      commonMistake_my:
        'ကယ်လီဖိုးနီးယား၊ တက္ကဆက်နှင့် ဖလော်ရီဒါတို့သည် ကနေဒါနှင့် မထိစပ်ပါ။ ကယ်လီဖိုးနီးယားနှင့် တက္ကဆက်သည် မက္ကဆီကိုနှင့် ထိစပ်သည်။ ဖလော်ရီဒါသည် အရှေ့တောင်ဘက်တွင် ရှိပြီး ကနေဒါမှ ဝေးသည်။',
      relatedQuestionIds: ['SYM-06'],
    },
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
    explanation: {
      brief_en:
        'Four states border Mexico: California, Arizona, New Mexico, and Texas. These are all in the southern part of the United States. The U.S.-Mexico border is about 1,954 miles long.',
      brief_my:
        'ပြည်နယ် ၄ ခုသည် မက္ကဆီကိုနှင့် ထိစပ်နေသည် — ကယ်လီဖိုးနီးယား၊ အရီဇိုးနား၊ နယူးမက္ကဆီကိုနှင့် တက္ကဆက်။ ၎င်းတို့အားလုံးသည် အမေရိကန်ပြည်ထောင်စု၏ တောင်ပိုင်းတွင် ရှိသည်။',
      mnemonic_en:
        'CANT: California, Arizona, New Mexico, Texas — the four states that border Mexico, from west to east.',
      mnemonic_my:
        'CANT: ကယ်လီဖိုးနီးယား၊ အရီဇိုးနား၊ နယူးမက္ကဆီကို၊ တက္ကဆက် — အနောက်မှ အရှေ့သို့ မက္ကဆီကိုနှင့် ထိစပ်သော ပြည်နယ် ၄ ခု။',
      funFact_en:
        'Texas has the longest border with Mexico of any U.S. state — about 1,254 miles. New Mexico has the name "Mexico" in it but is a U.S. state, not part of Mexico.',
      funFact_my:
        'တက္ကဆက်သည် အမေရိကန်ပြည်နယ်များထဲတွင် မက္ကဆီကိုနှင့် အရှည်ဆုံးနယ်နိမိတ်ရှိပြီး — မိုင် ၁,၂၅၄ ခန့် ဖြစ်သည်။ နယူးမက္ကဆီကိုသည် အမည်တွင် "မက္ကဆီကို" ပါသော်လည်း အမေရိကန်ပြည်နယ်ဖြစ်ပြီး မက္ကဆီကို၏ အစိတ်အပိုင်း မဟုတ်ပါ။',
      citation: 'USCIS Civics Test Item 93',
      commonMistake_en:
        'Nevada and Florida do NOT border Mexico. Nevada is close to Mexico but Arizona separates them. Washington borders Canada, not Mexico.',
      commonMistake_my:
        'နီဗားဒါးနှင့် ဖလော်ရီဒါတို့သည် မက္ကဆီကိုနှင့် မထိစပ်ပါ။ နီဗားဒါးသည် မက္ကဆီကိုနှင့ နီးသော်လည်း အရီဇိုးနားက ခြားထားသည်။ ဝါရှင်တန်သည် ကနေဒါနှင့် ထိစပ်ပြီး မက္ကဆီကို မဟုတ်ပါ။',
      relatedQuestionIds: ['SYM-05'],
    },
  },
  {
    id: 'SYM-07',
    question_en: 'What is the capital of the United States?',
    question_my: 'အမေရိကန်ပြည်ထောင်စုရဲ့ မြို့တော်က ဘယ်မြို့လဲ။',
    category: 'Civics: Symbols and Holidays',
    studyAnswers: [{ text_en: 'Washington, D.C.', text_my: 'ဝါရှင်တန်ဒီစီ' }],
    answers: [
      { text_en: 'Washington, D.C.', text_my: 'ဝါရှင်တန်ဒီစီ', correct: true },
      { text_en: 'New York, NY', text_my: 'နယူးယောက်၊ နယူးယောက်', correct: false },
      {
        text_en: 'Philadelphia, PA',
        text_my: 'ဖီလဒဲလ်ဖီးယား၊ ပင်ဆယ်ဗေးနီးယား',
        correct: false,
      },
      { text_en: 'Boston, MA', text_my: 'ဘော်စတွန်၊ မက်ဆာချူးဆက်', correct: false },
    ],
    explanation: {
      brief_en:
        'Washington, D.C. is the capital of the United States. "D.C." stands for "District of Columbia." It is not a state — it is a special federal district where the President, Congress, and Supreme Court are located.',
      brief_my:
        'ဝါရှင်တန်ဒီစီသည် အမေရိကန်ပြည်ထောင်စု၏ မြို့တော် ဖြစ်သည်။ "D.C." သည် "ကိုလံဘီယာခရိုင်" ကို ကိုယ်စားပြုသည်။ ၎င်းသည် ပြည်နယ်တစ်ခု မဟုတ်ဘဲ သမ္မတ၊ ကွန်ဂရက်နှင့် တရားရုံးချုပ်တည်ရှိရာ အထူးဖက်ဒရယ်ခရိုင် ဖြစ်သည်။',
      mnemonic_en:
        'DC = District of Capital. Washington D.C. = the capital, named after the first president.',
      mnemonic_my:
        'DC = မြို့တော်ခရိုင်။ ဝါရှင်တန်ဒီစီ = ပထမဆုံးသမ္မတ၏ အမည်ဖြင့် မှည့်ခေါ်သော မြို့တော်။',
      funFact_en:
        'D.C. residents could not vote for President until the 23rd Amendment in 1961. They still have no voting representation in Congress.',
      funFact_my:
        'D.C. နေထိုင်သူများသည် ၁၉၆၁ ခုနှစ် ၂၃ ကြိမ်မြောက်ပြင်ဆင်ချက်အထိ သမ္မတအတွက် မဲပေးခွင့်မရှိခဲ့ပါ။ ကွန်ဂရက်တွင် မဲပေးခွင့်ရှိသော ကိုယ်စားလှယ် ယခုတိုင် မရှိပါ။',
      citation: 'USCIS Civics Test Item 94',
      commonMistake_en:
        'Washington, D.C. (the capital) is different from Washington State (on the West Coast). New York City is the largest city but is NOT the capital.',
      commonMistake_my:
        'ဝါရှင်တန်ဒီစီ (မြို့တော်) နှင့် ဝါရှင်တန်ပြည်နယ် (အနောက်ဘက်ကမ်းရိုးတန်း) တို့ မတူပါ။ နယူးယောက်စီးတီးသည် အကြီးဆုံးမြို့ ဖြစ်သော်လည်း မြို့တော် မဟုတ်ပါ။',
      relatedQuestionIds: ['HIST-C13', 'GOV-S18'],
    },
  },
  {
    id: 'SYM-08',
    question_en: 'Where is the Statue of Liberty?',
    question_my: 'လွတ်လပ်ရေးရုပ်ထု (Statue of Liberty) က ဘယ်မှာလဲ။',
    category: 'Civics: Symbols and Holidays',
    studyAnswers: [
      { text_en: 'New York (Harbor)', text_my: 'နယူးယောက် (ဆိပ်ကမ်း)' },
      { text_en: 'Liberty Island', text_my: 'လစ်ဘာတီကျွန်း' },
    ],
    answers: [
      { text_en: 'New York (Harbor)', text_my: 'နယူးယောက် (ဆိပ်ကမ်း)', correct: true },
      { text_en: 'Washington, D.C.', text_my: 'ဝါရှင်တန်ဒီစီ', correct: false },
      {
        text_en: 'San Francisco, CA',
        text_my: 'ဆန်ဖရန်စစ္စကို၊ ကယ်လီဖိုးနီးယား',
        correct: false,
      },
      { text_en: 'Boston, MA', text_my: 'ဘော်စတွန်၊ မက်ဆာချူးဆက်', correct: false },
    ],
    explanation: {
      brief_en:
        "The Statue of Liberty is in New York Harbor on Liberty Island. It was a gift from France in 1886 and has become one of America's most recognizable symbols of freedom and democracy.",
      brief_my:
        'လွတ်လပ်ရေးရုပ်ထုသည် နယူးယောက်ဆိပ်ကမ်းရှိ လစ်ဘာတီကျွန်းတွင် တည်ရှိသည်။ ၁၈၈၆ ခုနှစ်တွင် ပြင်သစ်မှ လက်ဆောင်အဖြစ် ပေးခဲ့ပြီး အမေရိက၏ လွတ်လပ်ရေးနှင့် ဒီမိုကရေစီ၏ ထင်ရှားဆုံးသင်္ကေတများထဲမှ တစ်ခု ဖြစ်လာခဲ့သည်။',
      mnemonic_en:
        'Lady Liberty lives in New York Harbor on Liberty Island — near where immigrants first arrived.',
      mnemonic_my:
        'လစ်ဘာတီအမျိုးသမီးသည် နယူးယောက်ဆိပ်ကမ်းရှိ လစ်ဘာတီကျွန်းတွင် နေထိုင်သည် — လူဝင်မှုကြီးများ ပထမဆုံးရောက်လာသောနေရာ အနီး။',
      funFact_en:
        'The Statue of Liberty\'s official name is "Liberty Enlightening the World." She stands 305 feet tall including the pedestal and was the tallest structure in New York when she was unveiled.',
      funFact_my:
        'လွတ်လပ်ရေးရုပ်ထု၏ တရားဝင်အမည်မှာ "ကမ္ဘာကို လင်းထိန်စေသော လွတ်လပ်ရေး" ဖြစ်သည်။ စင်မြင့်အပါအဝင် ပေ ၃၀၅ မြင့်ပြီး ဖွင့်ပွဲတွင် နယူးယောက်ရှိ အမြင့်ဆုံးအဆောက်အအုံ ဖြစ်ခဲ့သည်။',
      citation: 'USCIS Civics Test Item 95',
      commonMistake_en:
        'The Statue of Liberty is in New York, NOT Washington D.C. Many people confuse famous landmarks with the capital city.',
      commonMistake_my:
        'လွတ်လပ်ရေးရုပ်ထုသည် နယူးယောက်တွင် ရှိပြီး ဝါရှင်တန်ဒီစီတွင် မဟုတ်ပါ။ လူအများစုသည် ကျော်ကြားသော မှတ်တိုင်များကို မြို့တော်နှင့် ရောထွေးတတ်သည်။',
      relatedQuestionIds: ['SYM-07', 'HIST-C07'],
    },
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
    explanation: {
      brief_en:
        'The flag has 13 stripes (7 red and 6 white) to represent the 13 original colonies that declared independence and became the first states. The stripes remind us of where the country began.',
      brief_my:
        'အလံတွင် မူလကိုလိုနီ ၁၃ ခုကို ကိုယ်စားပြုရန် အစင်းကြောင်း ၁၃ ခု (အနီ ၇ နှင့် အဖြူ ၆) ရှိသည်။ ၎င်းကိုလိုနီများသည် လွတ်လပ်ရေးကြေညာပြီး ပထမဆုံးပြည်နယ်များ ဖြစ်လာခဲ့သည်။',
      mnemonic_en:
        '13 stripes = 13 colonies. Stars change (states added), but stripes stay at 13 forever.',
      mnemonic_my:
        'အစင်းကြောင်း ၁၃ = ကိုလိုနီ ၁၃။ ကြယ်များ ပြောင်းသည် (ပြည်နယ်အသစ်ထည့်)၊ အစင်းကြောင်းများ ၁၃ ခု အမြဲတမ်း ဖြစ်သည်။',
      funFact_en:
        'The first American flag (1777) had 13 stars AND 13 stripes. As states were added, only stars were added — the stripes stayed at 13.',
      funFact_my:
        'ပထမဆုံးအမေရိကန်အလံ (၁၇၇၇) တွင် ကြယ် ၁၃ ပွင့်နှင့် အစင်းကြောင်း ၁၃ ခု ရှိခဲ့သည်။ ပြည်နယ်အသစ်ထည့်သောအခါ ကြယ်များသာ ထည့်ခဲ့ပြီး အစင်းကြောင်းများ ၁၃ ခု ရှိနေဆဲ ဖြစ်သည်။',
      citation: 'USCIS Civics Test Item 96',
      commonMistake_en:
        'There are 27 amendments (not 13). The 13 stripes represent the original colonies, not amendments, ships, or any other number.',
      commonMistake_my:
        'ပြင်ဆင်ချက် ၂၇ ခု ရှိသည် (၁၃ ခု မဟုတ်)။ အစင်းကြောင်း ၁၃ ခုသည် မူလကိုလိုနီများကို ကိုယ်စားပြုပြီး ပြင်ဆင်ချက်များ၊ သင်္ဘောများ သို့မဟုတ် အခြားဂဏန်းများ မဟုတ်ပါ။',
      relatedQuestionIds: ['SYM-10', 'HIST-C07'],
    },
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
    explanation: {
      brief_en:
        'The flag has 50 stars because there are 50 states in the United States today. Each star represents one state. When a new state joins, a new star is added to the flag.',
      brief_my:
        'ယနေ့ အမေရိကန်ပြည်ထောင်စုတွင် ပြည်နယ် ၅၀ ရှိသောကြောင့် အလံတွင် ကြယ် ၅၀ ရှိသည်။ ကြယ်တစ်ပွင့်စီသည် ပြည်နယ်တစ်ခုကို ကိုယ်စားပြုသည်။ ပြည်နယ်အသစ်ပါဝင်သောအခါ ကြယ်အသစ်တစ်ပွင့် ထည့်သွင်းသည်။',
      mnemonic_en: '50 stars = 50 states. Stars grow with states; stripes stay at 13.',
      mnemonic_my:
        'ကြယ် ၅၀ = ပြည်နယ် ၅၀။ ကြယ်များ ပြည်နယ်နှင့်တိုးသည်; အစင်းကြောင်း ၁၃ ခု ဆက်ရှိသည်။',
      funFact_en:
        'Hawaii was the last state admitted (1959), bringing the star count to 50. The current 50-star flag was designed by a 17-year-old high school student, Robert Heft, as a class project.',
      funFact_my:
        'ဟာဝိုင်ယီသည် နောက်ဆုံးလက်ခံခဲ့သော ပြည်နယ်ဖြစ်ပြီး (၁၉၅၉) ကြယ်အရေအတွက်ကို ၅၀ သို့ ရောက်စေခဲ့သည်။ လက်ရှိကြယ် ၅၀ ပါအလံကို အသက် ၁၇ နှစ် အထက်တန်းကျောင်းသား ရောဘတ်ဟက်ဖ်က အတန်းစာအဖြစ် ဒီဇိုင်းဆွဲခဲ့သည်။',
      citation: 'USCIS Civics Test Item 97',
      commonMistake_en:
        'There were only 13 original colonies (represented by stripes), not 50. The 50 stars represent the current number of states, and the flag has changed 27 times as new states joined.',
      commonMistake_my:
        'မူလကိုလိုနီ ၁၃ ခုသာ ရှိခဲ့သည် (အစင်းကြောင်းများဖြင့် ကိုယ်စားပြု)၊ ၅၀ မဟုတ်ပါ။ ကြယ် ၅၀ သည် လက်ရှိပြည်နယ်အရေအတွက်ကို ကိုယ်စားပြုပြီး ပြည်နယ်အသစ်များ ပါဝင်လာစဉ် အလံ ၂၇ ကြိမ် ပြောင်းလဲခဲ့သည်။',
      relatedQuestionIds: ['SYM-09', 'HIST-C07'],
    },
  },
  {
    id: 'SYM-11',
    question_en: 'What is the name of the national anthem?',
    question_my: 'နိုင်ငံတော်သီချင်း (national anthem) ရဲ့ အမည်က ဘာလဲ။',
    category: 'Civics: Symbols and Holidays',
    studyAnswers: [{ text_en: 'The Star-Spangled Banner', text_my: 'ကြယ်စုံလွှင့်အလံ' }],
    answers: [
      { text_en: 'The Star-Spangled Banner', text_my: 'ကြယ်စုံလွှင့်အလံ', correct: true },
      { text_en: 'America the Beautiful', text_my: 'လှပသောအမေရိက', correct: false },
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
    explanation: {
      brief_en:
        '"The Star-Spangled Banner" is the U.S. national anthem. It was written by Francis Scott Key in 1814 during the Battle of Baltimore, when he saw the American flag still flying over Fort McHenry after a British attack.',
      brief_my:
        '"ကြယ်စုံလွှင့်အလံ" သည် အမေရိကန်နိုင်ငံတော်သီချင်း ဖြစ်သည်။ ၁၈၁၄ ခုနှစ် ဘော်လ်တီမိုးတိုက်ပွဲအတွင်း ဗြိတိသျှတိုက်ခိုက်မှုပြီးနောက် ဖော့မက်ဟင်နရီပေါ်တွင် အမေရိကန်အလံ ဆက်လက်လွှင့်ထူနေသည်ကို မြင်သောအခါ ဖရန်စစ်စ်ကော့ကီးက ရေးသားခဲ့သည်။',
      mnemonic_en:
        'SSB = Star-Spangled Banner = the national anthem. Think of "Stars" on the flag inspiring the song.',
      mnemonic_my:
        'SSB = ကြယ်စုံလွှင့်အလံ = နိုင်ငံတော်သီချင်း။ အလံပေါ်ရှိ "ကြယ်များ" က သီချင်းကို မှုတ်သွင်းခဲ့သည်ဟု မှတ်ပါ။',
      funFact_en:
        'It did not become the official national anthem until 1931, over 100 years after it was written! Before that, "America the Beautiful" and "Hail, Columbia" were also popular patriotic songs.',
      funFact_my:
        'ရေးသားပြီး နှစ် ၁၀၀ ကျော်အကြာ ၁၉၃၁ ခုနှစ်အထိ တရားဝင်နိုင်ငံတော်သီချင်း မဖြစ်ခဲ့ပါ! ၎င်းမတိုင်မီ "လှပသောအမေရိက" နှင့် "ကိုလံဘီယာ ဂုဏ်ပြုပါ" တို့လည်း ရေပန်းစားသော မျိုးချစ်သီချင်းများ ဖြစ်ခဲ့သည်။',
      citation: 'USCIS Civics Test Item 98',
      commonMistake_en:
        '"America the Beautiful" and "God Bless America" are patriotic songs but NOT the national anthem. Only "The Star-Spangled Banner" is the official anthem.',
      commonMistake_my:
        '"လှပသောအမေရိက" နှင့် "ဘုရားသခင် အမေရိကကို ကောင်းချီးပေးပါစေ" တို့သည် မျိုးချစ်သီချင်းများ ဖြစ်သော်လည်း နိုင်ငံတော်သီချင်း မဟုတ်ပါ။ "ကြယ်စုံလွှင့်အလံ" သာ တရားဝင်သီချင်း ဖြစ်သည်။',
      relatedQuestionIds: ['SYM-09', 'SYM-10'],
    },
  },
  {
    id: 'SYM-12',
    question_en: 'When do we celebrate Independence Day?',
    question_my: 'လွတ်လပ်ရေးနေ့ (Independence Day) ကို ဘယ်အချိန်မှာ ကျင်းပသလဲ။',
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
    explanation: {
      brief_en:
        "Independence Day is celebrated on July 4 because the Declaration of Independence was adopted on July 4, 1776. It is one of America's most important holidays, celebrated with fireworks, parades, and barbecues.",
      brief_my:
        'လွတ်လပ်ရေးကြေညာစာတမ်းကို ၁၇၇၆ ခုနှစ် ဇူလိုင်လ ၄ ရက်နေ့တွင် အတည်ပြုခဲ့သောကြောင့် လွတ်လပ်ရေးနေ့ကို ဇူလိုင် ၄ တွင် ကျင်းပသည်။ မီးပန်းများ၊ ချီတက်ပွဲများနှင့် ဘာဘီကျူးများဖြင့် ကျင်းပသော အမေရိက၏ အရေးအကြီးဆုံး ပိတ်ရက်များထဲမှ တစ်ခု ဖြစ်သည်။',
      mnemonic_en:
        '4th of July = Independence Day = birthday of America (1776). Fireworks = birthday celebration.',
      mnemonic_my: 'ဇူလိုင် ၄ = လွတ်လပ်ရေးနေ့ = အမေရိက၏ မွေးနေ့ (၁၇၇၆)။ မီးပန်း = မွေးနေ့ပွဲ။',
      funFact_en:
        'Three presidents have died on July 4: John Adams and Thomas Jefferson both died on July 4, 1826, and James Monroe died on July 4, 1831.',
      funFact_my:
        'သမ္မတ ၃ ဦး ဇူလိုင် ၄ တွင် ကွယ်လွန်ခဲ့သည် — ဂျွန်အဒမ်စ်နှင့် သောမတ်စ်ဂျက်ဖာဆင် နှစ်ဦးလုံး ၁၈၂၆ ခုနှစ် ဇူလိုင် ၄ တွင် ကွယ်လွန်ခဲ့ပြီး ဂျိမ်းစ်မွန်ရိုးသည် ၁၈၃၁ ခုနှစ် ဇူလိုင် ၄ တွင် ကွယ်လွန်ခဲ့သည်။',
      citation: 'USCIS Civics Test Item 99',
      commonMistake_en:
        "December 25 is Christmas. January 1 is New Year's Day. The last Monday in May is Memorial Day. Only July 4 is Independence Day.",
      commonMistake_my:
        'ဒီဇင်ဘာ ၂၅ သည် ခရစ္စမတ်ဖြစ်သည်။ ဇန်နဝါရီ ၁ သည် နှစ်သစ်ကူးနေ့ ဖြစ်သည်။ မေလ နောက်ဆုံးတနင်္လာသည် အထိမ်းအမှတ်နေ့ ဖြစ်သည်။ ဇူလိုင် ၄ သာ လွတ်လပ်ရေးနေ့ ဖြစ်သည်။',
      relatedQuestionIds: ['HIST-C06', 'HIST-C05', 'SYM-13'],
    },
  },
  {
    id: 'SYM-13',
    question_en: 'Name two national U.S. holidays.',
    question_my: 'အမေရိကန်ရဲ့ နိုင်ငံတော်အားလပ်ရက် နှစ်ခုကို ပြောပါ။',
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
    explanation: {
      brief_en:
        "The U.S. has 11 federal holidays, including New Year's Day, MLK Jr. Day, Presidents' Day, Memorial Day, Juneteenth, Independence Day, Labor Day, Columbus Day, Veterans Day, Thanksgiving, and Christmas.",
      brief_my:
        'အမေရိကန်တွင် ဖက်ဒရယ်အားလပ်ရက် ၁၁ ခု ရှိသည် — နှစ်သစ်ကူးနေ့၊ MLK Jr. နေ့၊ သမ္မတများနေ့၊ အထိမ်းအမှတ်နေ့၊ ဇွန်လဆယ့်ကိုးရက်နေ့၊ လွတ်လပ်ရေးနေ့၊ အလုပ်သမားနေ့၊ ကိုလံဘတ်စ်နေ့၊ စစ်မှုထမ်းဟောင်းများနေ့၊ ကျေးဇူးတော်နေ့နှင့် ခရစ္စမတ်နေ့။',
      mnemonic_en:
        'Easy two to remember: Thanksgiving (turkey) and Christmas (gifts) — both in late year, both federal holidays.',
      mnemonic_my:
        'မှတ်ရလွယ်သော ၂ ခု: ကျေးဇူးတော်နေ့ (ကြက်ဆင်) နှင့် ခရစ္စမတ် (လက်ဆောင်) — နှစ်ခုလုံး နှစ်ကုန်ပိုင်းတွင်၊ နှစ်ခုလုံး ဖက်ဒရယ်အားလပ်ရက်။',
      funFact_en:
        'Juneteenth (June 19) became a federal holiday in 2021, making it the newest federal holiday. It celebrates the end of slavery in the United States.',
      funFact_my:
        'ဇွန်လဆယ့်ကိုးရက်နေ့ (ဇွန် ၁၉) သည် ၂၀၂၁ ခုနှစ်တွင် ဖက်ဒရယ်အားလပ်ရက် ဖြစ်လာခဲ့ပြီး အသစ်ဆုံးဖက်ဒရယ်အားလပ်ရက် ဖြစ်သည်။ အမေရိကန်ပြည်ထောင်စုတွင် ကျွန်စနစ်အဆုံးသတ်ခြင်းကို ကျင်းပသည်။',
      citation: 'USCIS Civics Test Item 100',
      commonMistake_en:
        "Valentine's Day, Halloween, and St. Patrick's Day are popular celebrations but are NOT federal holidays. April Fool's Day and Super Bowl Sunday are also not holidays.",
      commonMistake_my:
        'ချစ်သူများနေ့၊ ဟယ်လိုဝင်းနှင့် စိန့်ပက်ထရစ်နေ့တို့သည် ရေပန်းစားသော ပွဲတော်များ ဖြစ်သော်လည်း ဖက်ဒရယ်အားလပ်ရက်များ မဟုတ်ပါ။',
      relatedQuestionIds: ['SYM-12', 'HIST-R08'],
    },
  },
];
