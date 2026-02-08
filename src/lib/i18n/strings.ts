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
    practiceInterview: { en: 'Interview', my: 'အင်တာဗျူး' },
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
    incorrectOnly: { en: 'Incorrect Only', my: 'မှားသောမေးခွန်းများသာ' },
    showAll: { en: 'Show All', my: 'အားလုံးပြပါ' },
    showing: { en: 'Showing', my: 'ပြသနေသည်' },
    ofQuestions: { en: 'of', my: 'မှ' },
    questions: { en: 'questions', my: 'မေးခွန်းများ' },
    reviewAnswer: { en: 'Review this answer', my: 'ပြန်လည်လေ့လာပါ' },
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

  // Explanation components
  explanations: {
    why: { en: 'Why?', my: 'ဘာကြောင့်လဲ' },
    memoryTip: { en: 'Memory Tip', my: 'မှတ်ဉာဏ်အကူ' },
    commonMistake: { en: 'Common Mistake', my: 'အဖြစ်များသောအမှား' },
    funFact: { en: 'Fun Fact', my: 'စိတ်ဝင်စားစရာ' },
    seeAlso: { en: 'See also', my: 'ဆက်စပ်မေးခွန်းများ' },
    source: { en: 'Source', my: 'အရင်းအမြစ်' },
    showExplanation: { en: 'Show explanation', my: 'ရှင်းလင်းချက်ပြပါ' },
    hideExplanation: { en: 'Hide explanation', my: 'ရှင်းလင်းချက်ဝှက်ပါ' },
  },

  // Category progress & mastery
  progress: {
    categoryProgress: { en: 'Category Progress', my: 'အမျိုးအစားတိုးတက်မှု' },
    mastery: { en: 'Mastery', my: 'ကျွမ်းကျင်မှု' },
    practiceNow: { en: 'Practice Now', my: 'ယခုလေ့ကျင့်ပါ' },
    reviewInGuide: { en: 'Review in Guide', my: 'အညွှန်းတွင်ပြန်ကြည့်ပါ' },
    suggestedFocus: { en: 'Suggested Focus', my: 'အကြံပြုအာရုံစိုက်ရာ' },
    notStarted: { en: 'Not Started', my: 'မစတင်ရသေး' },
    bronze: { en: 'Bronze', my: 'ကြေးတံဆိပ်' },
    silver: { en: 'Silver', my: 'ငွေတံဆိပ်' },
    gold: { en: 'Gold', my: 'ရွှေတံဆိပ်' },
    questionsCorrect: { en: 'Questions Correct', my: 'မှန်ကန်သောမေးခွန်းများ' },
    overallReadiness: { en: 'Overall Readiness', my: 'အလုံးစုံအဆင်သင့်ဖြစ်မှု' },
    masteryTrend: { en: 'Mastery Trend', my: 'ကျွမ်းကျင်မှုလမ်းကြောင်း' },
  },

  // Practice mode
  practice: {
    practiceMode: { en: 'Practice Mode', my: 'လေ့ကျင့်ရေးမုဒ်' },
    selectCategory: { en: 'Select Category', my: 'အမျိုးအစားရွေးပါ' },
    questionCount: { en: 'Question Count', my: 'မေးခွန်းအရေအတွက်' },
    quick: { en: 'Quick', my: 'အမြန်' },
    standard: { en: 'Standard', my: 'ပုံမှန်' },
    full: { en: 'Full', my: 'အပြည့်' },
    startPractice: { en: 'Start Practice', my: 'လေ့ကျင့်မှုစတင်ပါ' },
    practiceComplete: { en: 'Practice Complete!', my: 'လေ့ကျင့်မှုပြီးပါပြီ!' },
    masteryUpdate: { en: 'Mastery Updated', my: 'ကျွမ်းကျင်မှုအသစ်ပြင်ဆင်ပြီး' },
    practiceAllWeak: { en: 'Practice All Weak Areas', my: 'အားနည်းရာအားလုံးလေ့ကျင့်ပါ' },
    alreadyMastered: { en: 'Already Mastered', my: 'ကျွမ်းကျင်ပြီးသား' },
    practiceAnyway: { en: 'Practice Anyway', my: 'ဒါပေမယ့်လေ့ကျင့်ပါ' },
    practiceSessions: { en: 'Practice Sessions', my: 'လေ့ကျင့်မှုအကြိမ်များ' },
    timer: { en: 'Timer', my: 'အချိန်တိုင်း' },
    timerOff: { en: 'Timer Off', my: 'အချိန်တိုင်းပိတ်' },
    timerOn: { en: 'Timer On', my: 'အချိန်တိုင်းဖွင့်' },
  },

  // Interview simulation
  interview: {
    practiceInterview: { en: 'Practice Interview', my: 'အင်တာဗျူးလေ့ကျင့်မှု' },
    realisticMode: { en: 'Realistic Interview', my: 'လက်တွေ့အင်တာဗျူး' },
    practiceMode: { en: 'Practice Interview', my: 'လေ့ကျင့်အင်တာဗျူး' },
    startInterview: { en: 'Start Interview', my: 'အင်တာဗျူးစတင်ပါ' },
    showAnswer: { en: 'Show Answer', my: 'အဖြေပြပါ' },
    correct: { en: 'Correct', my: 'မှန်ပါတယ်' },
    incorrect: { en: 'Incorrect', my: 'မှားပါတယ်' },
    nextQuestion: { en: 'Next Question', my: 'နောက်မေးခွန်း' },
    whatToExpect: { en: 'What to Expect', my: 'ဘာကိုမျှော်လင့်ရမလဲ' },
    recentScores: { en: 'Recent Scores', my: 'မကြာသေးမီရမှတ်များ' },
    interviewResults: { en: 'Interview Results', my: 'အင်တာဗျူးရလဒ်များ' },
    passed: { en: 'Passed', my: 'အောင်မြင်ပါတယ်' },
    failed: { en: 'Did Not Pass', my: 'မအောင်မြင်ပါ' },
    replaysUsed: { en: 'replays used', my: 'ပြန်ဖွင့်မှုအကြိမ်' },
    alsoAccepted: { en: 'Also accepted', my: 'လက်ခံနိုင်သောအဖြေများ' },
    yourAnswer: { en: 'Your Recording', my: 'သင့်အသံဖမ်းမှု' },
    realisticTip: { en: 'Like the real USCIS interview. 15 seconds per question.', my: 'တကယ့် USCIS အင်တာဗျူးကဲ့သို့။ မေးခွန်းတစ်ခုလျှင် ၁၅ စက္ကန့်။' },
    practiceTip: { en: 'Self-paced with explanations. Take your time.', my: 'ရှင်းလင်းချက်များနှင့်အတူ သင့်အချိန်ယူပါ။' },
    speechRate: { en: 'Speech Rate', my: 'စကားပြောနှုန်း' },
    slow: { en: 'Slow', my: 'နှေးနှေး' },
    normal: { en: 'Normal', my: 'ပုံမှန်' },
    fast: { en: 'Fast', my: 'မြန်မြန်' },
    interviewHistory: { en: 'Interviews', my: 'အင်တာဗျူးများ' },
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
