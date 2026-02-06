/**
 * Centralized bilingual strings for the app.
 *
 * Pattern: English on top, Burmese below (stacked)
 * All user-facing text should be defined here for consistency.
 */

export interface BilingualString {
  en: string;
  my: string;
}

export const strings = {
  // Navigation
  nav: {
    home: { en: 'Home', my: 'ပင်မ' },
    dashboard: { en: 'Dashboard', my: 'ဒက်ရှ်ဘုတ်' },
    studyGuide: { en: 'Study Guide', my: 'လေ့လာမှုအညွှန်း' },
    mockTest: { en: 'Mock Test', my: 'စမ်းသပ်စာမေးပွဲ' },
    testHistory: { en: 'Test History', my: 'စာမေးပွဲမှတ်တမ်း' },
    settings: { en: 'Settings', my: 'ဆက်တင်များ' },
    signIn: { en: 'Sign In', my: 'ဝင်ရောက်ပါ' },
    signOut: { en: 'Sign Out', my: 'ထွက်ရန်' },
  },

  // Common actions
  actions: {
    startTest: { en: 'Start Test', my: 'စာမေးပွဲစတင်ပါ' },
    submit: { en: 'Submit', my: 'တင်သွင်းပါ' },
    continue: { en: 'Continue', my: 'ဆက်လက်ပါ' },
    cancel: { en: 'Cancel', my: 'ပယ်ဖျက်ပါ' },
    back: { en: 'Back', my: 'နောက်သို့' },
    next: { en: 'Next', my: 'ရှေ့သို့' },
    skip: { en: 'Skip', my: 'ကျော်ပါ' },
    done: { en: 'Done', my: 'ပြီးပါပြီ' },
    tryAgain: { en: 'Try Again', my: 'ထပ်ကြိုးစားပါ' },
    viewResults: { en: 'View Results', my: 'ရလဒ်များကြည့်ပါ' },
    startStudying: { en: 'Start Studying', my: 'လေ့လာမှုစတင်ပါ' },
    iAmReady: { en: "I'm Ready", my: 'အဆင်သင့်ဖြစ်ပါပြီ' },
    hideTimer: { en: 'Hide Timer', my: 'အချိန်ပြဝှက်ပါ' },
    showTimer: { en: 'Show Timer', my: 'အချိန်ပြပါ' },
    takeBreak: { en: 'Take a Break', my: 'အနားယူပါ' },
    quitTest: { en: 'Quit Test', my: 'စာမေးပွဲထွက်ပါ' },
  },

  // Dashboard
  dashboard: {
    welcome: { en: 'Welcome back', my: 'ပြန်လာတာကို ကြိုဆိုပါတယ်' },
    yourProgress: { en: 'Your Progress', my: 'သင့်တိုးတက်မှု' },
    recentTests: { en: 'Recent Tests', my: 'မကြာသေးမီ စာမေးပွဲများ' },
    weakAreas: { en: 'Areas to Improve', my: 'တိုးတက်ရမည့်နေရာများ' },
    studyStreak: { en: 'Study Streak', my: 'လေ့လာမှုဆက်တိုက်' },
    questionsAnswered: { en: 'Questions Answered', my: 'ဖြေဆိုပြီး မေးခွန်းများ' },
    accuracy: { en: 'Accuracy', my: 'မှန်ကန်မှု' },
    readyForTest: { en: 'Ready for the Test?', my: 'စာမေးပွဲအတွက် အဆင်သင့်ဖြစ်ပါသလား' },
  },

  // Study Guide
  study: {
    categories: { en: 'Categories', my: 'အမျိုးအစားများ' },
    allQuestions: { en: 'All Questions', my: 'မေးခွန်းအားလုံး' },
    tapToFlip: { en: 'Tap to flip', my: 'လှည့်ရန် နှိပ်ပါ' },
    question: { en: 'Question', my: 'မေးခွန်း' },
    answer: { en: 'Answer', my: 'အဖြေ' },
    of: { en: 'of', my: 'မှ' },
    studyGuide: { en: 'Study Guide', my: 'လေ့လာမှုအညွှန်း' },
  },

  // Test
  test: {
    mockTest: { en: 'Mock Test', my: 'စမ်းသပ်စာမေးပွဲ' },
    question: { en: 'Question', my: 'မေးခွန်း' },
    timeRemaining: { en: 'Time Remaining', my: 'ကျန်ရှိသည့်အချိန်' },
    correct: { en: 'Correct', my: 'မှန်ပါသည်' },
    incorrect: { en: 'Incorrect', my: 'မှားပါသည်' },
    yourAnswer: { en: 'Your Answer', my: 'သင့်အဖြေ' },
    correctAnswer: { en: 'Correct Answer', my: 'မှန်ကန်သောအဖြေ' },
    testComplete: { en: 'Test Complete!', my: 'စာမေးပွဲပြီးပါပြီ!' },
    youScored: { en: 'You scored', my: 'သင်ရမှတ်' },
    passed: { en: 'Passed', my: 'အောင်မြင်' },
    needsWork: { en: 'Keep Practicing', my: 'ဆက်လေ့ကျင့်ပါ' },
    passThreshold: { en: '6 out of 10 to pass', my: 'အောင်ရန် ၁၀ ခုမှ ၆ ခုလို' },
  },

  // Encouragement messages (rotating variety)
  encouragement: {
    correct: [
      { en: 'Great job!', my: 'အရမ်းကောင်းပါတယ်!' },
      { en: 'Excellent!', my: 'အထူးကောင်းမွန်ပါတယ်!' },
      { en: 'Keep it up!', my: 'ဆက်လက်ကြိုးစားပါ!' },
      { en: 'You got it!', my: 'သင်လုပ်နိုင်ပါတယ်!' },
      { en: 'Perfect!', my: 'ပြည့်စုံပါတယ်!' },
    ],
    incorrect: [
      { en: "Almost there! Let's learn this one.", my: 'နီးပါပြီ! ဒါကိုလေ့လာလိုက်ရအောင်' },
      { en: 'Good try! Now you know.', my: 'ကြိုးစားမှုကောင်းပါတယ်! ခုသိပြီ' },
      { en: "Don't worry, keep going!", my: 'စိတ်မပူပါနဲ့၊ ဆက်သွားပါ!' },
      { en: 'Learning is a journey!', my: 'သင်ယူခြင်းက ခရီးရှည်ပါ!' },
      { en: 'Every question makes you stronger!', my: 'မေးခွန်းတိုင်းက သင့်ကိုပိုအားကောင်းစေတယ်!' },
    ],
    streak: [
      { en: "You're on fire!", my: 'သင်အရမ်းကောင်းနေတယ်!' },
      { en: 'Amazing streak!', my: 'အံ့သြစရာကောင်းတဲ့ဆက်တိုက်မှု!' },
      { en: 'Unstoppable!', my: 'ရပ်လို့မရဘူး!' },
    ],
    milestone: [
      {
        en: 'Every question brings you closer to your citizenship!',
        my: 'မေးခွန်းတိုင်းက သင့်နိုင်ငံသားဖြစ်မှုနီးစေတယ်!',
      },
      { en: "You're doing amazing!", my: 'သင်အရမ်းကောင်းနေပါတယ်!' },
      { en: 'Keep going - you can do this!', my: 'ဆက်သွားပါ - သင်လုပ်နိုင်ပါတယ်!' },
    ],
  },

  // Error messages (gentle, solution-focused)
  errors: {
    generic: {
      en: 'Oops! Something went wrong. Please try again.',
      my: 'အို! တစ်ခုခုမှားသွားပါတယ်။ ထပ်ကြိုးစားပါ။',
    },
    network: {
      en: "You're offline. Your progress is saved locally.",
      my: 'သင်အင်တာနက်မရပါ။ သင့်တိုးတက်မှုကို ဒီမှာသိမ်းထားပါတယ်။',
    },
    saveError: {
      en: "Couldn't save right now. We'll try again later.",
      my: 'ခုသိမ်းလို့မရပါ။ နောက်မှထပ်ကြိုးစားပါမယ်။',
    },
    loadError: { en: "Couldn't load data. Please refresh.", my: 'ဒေတာဖတ်လို့မရပါ။ ပြန်လည်စတင်ပါ။' },
  },

  // Confirmation dialogs
  confirm: {
    quitTest: {
      title: { en: 'Take a break?', my: 'အနားယူမလား?' },
      message: {
        en: 'Your progress will be saved. You can continue later.',
        my: 'သင့်တိုးတက်မှုကို သိမ်းထားပါမယ်။ နောက်မှဆက်လုပ်နိုင်ပါတယ်။',
      },
      confirm: { en: 'Take a Break', my: 'အနားယူပါ' },
      cancel: { en: 'Continue Test', my: 'စာမေးပွဲဆက်ပါ' },
    },
  },

  // App meta
  app: {
    title: { en: 'U.S. Citizenship Test Prep', my: 'အမေရိကန်နိုင်ငံသားရေးရာစာမေးပွဲသင်ရိုး' },
    tagline: { en: 'Prepare with confidence', my: 'ယုံကြည်မှုနဲ့ပြင်ဆင်ပါ' },
  },
} as const;

/**
 * Get a random encouragement message for correct answers
 */
export function getRandomCorrectEncouragement(): BilingualString {
  const messages = strings.encouragement.correct;
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Get a random encouragement message for incorrect answers
 */
export function getRandomIncorrectEncouragement(): BilingualString {
  const messages = strings.encouragement.incorrect;
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Get a streak celebration message
 */
export function getStreakMessage(streak: number): BilingualString | null {
  if (streak >= 3 && streak < 5) {
    return strings.encouragement.streak[0];
  } else if (streak >= 5) {
    return strings.encouragement.streak[
      Math.floor(Math.random() * strings.encouragement.streak.length)
    ];
  }
  return null;
}
