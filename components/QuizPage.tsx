import React, { useState, useMemo } from 'react';
import { Question, Answer, QuestionResult, TestSession } from '../types';

interface QuizPageProps {
  questions: Question[];
  onQuizComplete: (session: TestSession) => void;
  onBack: () => void;
}

const QuizSummary: React.FC<{ session: TestSession; onBack: () => void }> = ({ session, onBack }) => {
  const { passed, score, totalQuestions } = session;

  return (
    <div className="text-center p-6">
      {passed ? (
        <>
          <h2 className="text-3xl font-bold text-green-500 mb-4">Congratulations! You Passed! 🎉</h2>
          <h3 className="text-2xl font-bold text-green-400 mb-6">ဂုဏ်ယူပါတယ်။ သင်အောင်မြင်သွားပါပြီ! 🥳</h3>
          <p className="text-lg text-text-primary-light dark:text-text-primary-dark mb-2">
            You're one step closer to your goal. Keep up the great work!
          </p>
          <p className="text-md text-text-secondary-light dark:text-text-secondary-dark mb-8">
            သင့်ရဲ့ပန်းတိုင်နဲ့ တစ်လှမ်းပိုနီးစပ်သွားပါပြီ။ ဆက်ပြီးကြိုးစားပါ။
          </p>
        </>
      ) : (
        <>
          <h2 className="text-3xl font-bold text-red-500 mb-4">Don't Give Up! Try Again! 💪</h2>
          <h3 className="text-2xl font-bold text-red-400 mb-6">လက်မလျှော့ပါနဲ့! ပြန်ကြိုးစားပါ။</h3>
          <p className="text-lg text-text-primary-light dark:text-text-primary-dark mb-2">
            Every practice test is a learning opportunity. You can do this!
          </p>
          <p className="text-md text-text-secondary-light dark:text-text-secondary-dark mb-8">
            လေ့ကျင့်ခန်းတိုင်းဟာ သင်ယူဖို့အခွင့်အလမ်းတစ်ခုဖြစ်ပါတယ်။ သင်လုပ်နိုင်မှာပါ။
          </p>
        </>
      )}
      <div className={`text-4xl font-bold mb-8 border-2 border-dashed p-6 rounded-xl bg-background-light dark:bg-background-dark mx-auto max-w-sm ${passed ? 'border-green-400 text-green-500' : 'border-red-400 text-red-500'}`}>
        Your Score<br/>{score} / {totalQuestions}
      </div>
      <button
        onClick={onBack}
        className="bg-brand-primary hover:bg-blue-900 dark:bg-brand-primary-dark dark:hover:bg-blue-400 text-white dark:text-brand-primary font-bold py-3 px-8 rounded-lg focus:outline-none focus:shadow-outline transition-transform duration-200 hover:scale-105"
      >
        Back to Home
      </button>
    </div>
  );
};

const QuizPage: React.FC<QuizPageProps> = ({ questions, onQuizComplete, onBack }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [finalSession, setFinalSession] = useState<TestSession | null>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const correctAnswer = useMemo(() => currentQuestion.answers.find(a => a.correct)!, [currentQuestion]);
  const shuffledAnswers = useMemo(() => [...currentQuestion.answers].sort(() => Math.random() - 0.5), [currentQuestion]);

  const handleAnswerSelect = (answer: Answer) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const handleNext = () => {
    if (!selectedAnswer) return;

    const isCorrect = selectedAnswer.correct;
    const newResult: QuestionResult = {
      questionId: currentQuestion.id,
      isCorrect,
      selectedAnswer,
      correctAnswer,
      questionText_en: currentQuestion.question_en,
      questionText_my: currentQuestion.question_my,
    };
    const updatedResults = [...results, newResult];
    const newCorrectCount = isCorrect ? correctCount + 1 : correctCount;
    const newIncorrectCount = !isCorrect ? incorrectCount + 1 : incorrectCount;

    setResults(updatedResults);
    setShowResult(true);

    setTimeout(() => {
      setShowResult(false);
      setSelectedAnswer(null);
      
      const shouldFinish = newCorrectCount >= 12 || newIncorrectCount >= 9 || currentQuestionIndex === questions.length - 1;

      if (shouldFinish) {
        finishQuiz(updatedResults, newCorrectCount);
      } else {
        setCorrectCount(newCorrectCount);
        setIncorrectCount(newIncorrectCount);
        setCurrentQuestionIndex(prev => prev + 1);
      }
    }, 2000);
  };

  const finishQuiz = (finalResults: QuestionResult[], finalCorrectCount: number) => {
    const session: TestSession = {
      date: new Date().toISOString(),
      score: finalCorrectCount,
      totalQuestions: finalResults.length,
      passed: finalCorrectCount >= 12,
      results: finalResults,
    };
    onQuizComplete(session);
    setFinalSession(session);
    setQuizFinished(true);
  };

  const getButtonClass = (answer: Answer) => {
    let baseClass = "w-full text-left p-4 rounded-lg border-2 transition-all duration-300 mb-4 flex items-center justify-between";
    if (!showResult) {
      return `${baseClass} ${selectedAnswer === answer ? 'bg-blue-200 dark:bg-blue-900 border-brand-primary' : 'bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark hover:border-brand-primary dark:hover:border-brand-primary-dark'}`;
    }
    if (answer.correct) {
      return `${baseClass} bg-green-200 dark:bg-green-900 border-green-500`;
    }
    if (answer === selectedAnswer && !answer.correct) {
      return `${baseClass} bg-red-200 dark:bg-red-900 border-red-500`;
    }
    return `${baseClass} bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark`;
  };

  if (quizFinished && finalSession) {
    return (
      <div className="max-w-3xl mx-auto bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-md border border-border-light dark:border-border-dark">
        <QuizSummary session={finalSession} onBack={onBack} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-md border border-border-light dark:border-border-dark">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Question {currentQuestionIndex + 1} / {questions.length}</h2>
        <div className="flex space-x-4">
            <span className="font-semibold text-green-500">Correct: {correctCount}</span>
            <span className="font-semibold text-red-500">Incorrect: {incorrectCount}</span>
        </div>
      </div>
      
      <div className="mb-8 space-y-3">
        <p className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark">{currentQuestion.question_en}</p>
        <p className="text-lg text-text-secondary-light dark:text-text-secondary-dark">{currentQuestion.question_my}</p>
      </div>

      <div>
        {shuffledAnswers.map((answer, index) => (
          <button
            key={index}
            onClick={() => handleAnswerSelect(answer)}
            disabled={showResult}
            className={getButtonClass(answer)}
          >
            <div>
              <span className="font-semibold">{answer.text_en}</span>
              <span className="block text-sm opacity-80">{answer.text_my}</span>
            </div>
            {showResult && answer.correct && <span className="text-green-600 dark:text-green-300">✓</span>}
            {showResult && selectedAnswer === answer && !answer.correct && <span className="text-red-600 dark:text-red-300">✗</span>}
          </button>
        ))}
      </div>
      
      <div className="mt-8 text-right">
        <button
          onClick={handleNext}
          disabled={!selectedAnswer || showResult}
          className="bg-brand-primary hover:bg-blue-900 dark:bg-brand-primary-dark dark:hover:bg-blue-400 text-white dark:text-brand-primary font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {showResult ? 'Next...' : 'Submit Answer'}
        </button>
      </div>
    </div>
  );
};

export default QuizPage;