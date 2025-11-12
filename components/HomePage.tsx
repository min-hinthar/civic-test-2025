import React from 'react';
import { User } from '../types';
import ProgressChart from './ProgressChart';
import LearningMaterial from './LearningMaterial';

interface HomePageProps {
  user: User;
  onStartQuiz: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ user, onStartQuiz }) => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">Welcome back, {user.name}!</h2>
        <p className="text-md text-text-secondary-light dark:text-text-secondary-dark">သင်ပြန်လည်ရောက်ရှိလာသည်ကို ကြိုဆိုပါ၏, {user.name}!</p>
      </div>

      <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-md border border-border-light dark:border-border-dark flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-semibold mb-2 text-text-primary-light dark:text-text-primary-dark">Start a New Quiz</h3>
            <p className="text-text-secondary-light dark:text-text-secondary-dark mb-4 md:mb-0">Test your knowledge with the adaptive practice test.</p>
          </div>
          <button
              onClick={onStartQuiz}
              className="w-full md:w-auto bg-brand-primary hover:bg-blue-900 dark:bg-brand-primary-dark dark:hover:bg-blue-400 text-white dark:text-brand-primary font-bold py-3 px-8 rounded-lg focus:outline-none focus:shadow-outline transition-transform duration-200 hover:scale-105"
          >
              Take the Test
          </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-md border border-border-light dark:border-border-dark">
          <h3 className="text-xl font-semibold mb-4 text-text-primary-light dark:text-text-primary-dark">Overall Progress</h3>
          <div className="h-[300px]">
            <ProgressChart testHistory={user.testHistory} />
          </div>
        </div>
        <div className="lg:col-span-3 bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-md border border-border-light dark:border-border-dark">
            <h3 className="text-xl font-semibold mb-4 text-text-primary-light dark:text-text-primary-dark">Test History</h3>
            <div className="max-h-[300px] overflow-y-auto pr-2">
                {user.testHistory.length > 0 ? (
                    <ul className="space-y-3">
                        {user.testHistory.map((session, index) => (
                            <li key={index} className={`flex justify-between items-center p-3 rounded-lg border-l-4 ${session.passed ? 'border-green-500' : 'border-red-500'} bg-background-light dark:bg-background-dark`}>
                                <div>
                                    <p className="font-semibold">{new Date(session.date).toLocaleDateString()}</p>
                                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Answered: {session.totalQuestions}</p>
                                </div>
                                <div className={`font-bold text-lg ${session.passed ? 'text-green-500' : 'text-red-500'}`}>
                                    {session.score} / {session.totalQuestions} ({session.passed ? 'Pass' : 'Fail'})
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-text-secondary-light dark:text-text-secondary-dark pt-12">No test history yet.</p>
                )}
            </div>
        </div>
      </div>
      
      <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-md border border-border-light dark:border-border-dark">
        <h3 className="text-2xl font-bold mb-4 text-text-primary-light dark:text-text-primary-dark">Study Materials</h3>
        <LearningMaterial />
      </div>
    </div>
  );
};

export default HomePage;