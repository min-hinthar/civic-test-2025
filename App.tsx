import React, { useState } from 'react';
import { useTheme } from './hooks/useTheme';
import { useUser } from './hooks/useUser';
import Header from './components/Header';
import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';
import QuizPage from './components/QuizPage';
import { civicsQuestions } from './constants/civicsQuestions';
import { Question, TestSession } from './types';

type Page = 'home' | 'quiz';

const App: React.FC = () => {
  const [theme, toggleTheme] = useTheme();
  const { user, login, logout, addTestResult } = useUser();
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const startQuiz = () => {
    setCurrentPage('quiz');
  };

  const showHomePage = () => {
    setCurrentPage('home');
  };

  const handleQuizComplete = (session: TestSession) => {
    addTestResult(session);
    // Navigation is now handled by the QuizPage's "Back to Home" button
  };

  if (!user) {
    return (
      <div className="bg-background-light dark:bg-background-dark min-h-screen">
        <LoginPage onLogin={login} />
      </div>
    );
  }

  const getShuffledQuestions = (count: number): Question[] => {
    return [...civicsQuestions].sort(() => 0.5 - Math.random()).slice(0, count);
  };
  
  return (
    <div className={`App ${theme}`}>
      <div className="bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark min-h-screen font-sans">
        <Header user={user} onLogout={logout} theme={theme} toggleTheme={toggleTheme} />
        <main className="container mx-auto p-4 md:p-6 fade-in">
          {currentPage === 'home' && (
            <HomePage 
              user={user} 
              onStartQuiz={startQuiz}
            />
          )}
          {currentPage === 'quiz' && (
            <QuizPage
              questions={getShuffledQuestions(20)}
              onQuizComplete={handleQuizComplete}
              onBack={showHomePage}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;