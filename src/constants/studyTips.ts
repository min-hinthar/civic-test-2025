import type { Category } from '@/types';

export interface StudyTip {
  category: Category;
  tipEn: string;
  tipMy: string;
}

/**
 * One actionable study tip per category.
 * Shown as a dismissible card at the top of category drill.
 * Tips are strategic ("focus on X") not motivational ("you can do it!").
 */
export const STUDY_TIPS: StudyTip[] = [
  {
    category: 'Principles of American Democracy',
    tipEn:
      'Focus on the Constitution — what it does, what the first 3 words mean, and how amendments work. These 12 questions test core concepts.',
    tipMy:
      'ဖွဲ့စည်းပုံအခြေခံဥပဒေအပေါ် အာရုံစိုက်ပါ — ၎င်းက ဘာလုပ်သလဲ၊ ပထမစကားလုံး ၃ လုံးက ဘာကိုဆိုလိုသလဲ၊ ပြင်ဆင်ချက်များ ဘယ်လိုအလုပ်လုပ်သလဲ။ ဒီမေးခွန်း ၁၂ ခုက အဓိကအယူအဆများကို စမ်းသပ်ပါတယ်။',
  },
  {
    category: 'System of Government',
    tipEn:
      'This is the biggest category (35 questions). Master the 3 branches first — who leads each, how many members, and what each branch does. Then tackle checks and balances.',
    tipMy:
      'ဒါက အကြီးဆုံးအမျိုးအစား (မေးခွန်း ၃၅ ခု) ဖြစ်ပါတယ်။ အစိုးရအဖွဲ့ ၃ ခုကို အရင်သိပါ — တစ်ခုစီကို ဘယ်သူဦးဆောင်သလဲ၊ အဖွဲ့ဝင်ဘယ်နှစ်ယောက်ရှိသလဲ၊ တစ်ခုစီက ဘာလုပ်သလဲ။',
  },
  {
    category: 'Rights and Responsibilities',
    tipEn:
      'Know the difference between rights for everyone vs. citizens only. The First Amendment freedoms (speech, religion, press, assembly, petition) come up often.',
    tipMy:
      'လူတိုင်းအတွက် အခွင့်အရေးနှင့် နိုင်ငံသားများသာရသော အခွင့်အရေး ခြားနားချက်ကို သိပါ။ ပထမပြင်ဆင်ချက် လွတ်လပ်ခွင့်များ (စကားပြော၊ ဘာသာ၊ သတင်းစာ၊ စုဝေး၊ တောင်းဆို) မကြာခဏမေးလေ့ရှိတယ်။',
  },
  {
    category: 'American History: Colonial Period and Independence',
    tipEn:
      'Remember the sequence: colonists came for freedom \u2192 problems with Britain \u2192 Declaration of Independence (1776) \u2192 Constitution. Key names: Benjamin Franklin, Thomas Jefferson, George Washington.',
    tipMy:
      'အစဉ်အတိုင်း မှတ်ပါ: ကိုလိုနီသားများ လွတ်လပ်ခွင့်အတွက် လာခဲ့ \u2192 ဗြိတိန်နှင့် ပြဿနာများ \u2192 လွတ်လပ်ရေးကြေညာစာ (၁၇၇၆) \u2192 ဖွဲ့စည်းပုံ။ အဓိကလူများ: Benjamin Franklin, Thomas Jefferson, George Washington.',
  },
  {
    category: 'American History: 1800s',
    tipEn:
      'The 1800s questions center on the Civil War. Know: why it happened (slavery), who was President (Lincoln), what the Emancipation Proclamation did, and the 13th/14th/15th Amendments.',
    tipMy:
      '၁၈၀၀ ခုနှစ်များ မေးခွန်းများက ပြည်တွင်းစစ်ကို အဓိကထားပါတယ်။ ဘာကြောင့်ဖြစ်သလဲ (ကျွန်စနစ်)၊ သမ္မတဘယ်သူ (Lincoln)၊ ကျွန်စနစ်ဖျက်သိမ်းကြေညာစာက ဘာလုပ်ခဲ့သလဲ၊ ပြင်ဆင်ချက် ၁၃/၁၄/၁၅ ကို သိပါ။',
  },
  {
    category: 'Recent American History and Other Important Historical Information',
    tipEn:
      'Focus on the World Wars (who were enemies, who were allies), the Cold War (communism concern), the Civil Rights Movement (MLK Jr.), and September 11, 2001.',
    tipMy:
      'ကမ္ဘာစစ်များ (ရန်သူ၊ မဟာမိတ်)၊ စစ်အေး (ကွန်မြူနစ်စိုးရိမ်မှု)၊ နိုင်ငံသားအခွင့်အရေးလှုပ်ရှားမှု (MLK Jr.)၊ စက်တင်ဘာ ၁၁ ၂၀၀၁ အပေါ် အာရုံစိုက်ပါ။',
  },
  {
    category: 'Civics: Symbols and Holidays',
    tipEn:
      "Know the flag (13 stripes = colonies, 50 stars = states), the national anthem, and the major holidays. Independence Day (July 4th) and Presidents' Day are frequently tested.",
    tipMy:
      'အလံ (အစင်း ၁၃ = ကိုလိုနီများ၊ ကြယ် ၅၀ = ပြည်နယ်များ)၊ နိုင်ငံတော်သီချင်း၊ အဓိကပိတ်ရက်များကို သိပါ။ လွတ်လပ်ရေးနေ့ (ဇူလိုင် ၄) နှင့် သမ္မတများနေ့ မကြာခဏမေးလေ့ရှိတယ်။',
  },
];

/**
 * Look up study tip by category name.
 */
export function getStudyTip(category: Category): StudyTip | undefined {
  return STUDY_TIPS.find(tip => tip.category === category);
}
