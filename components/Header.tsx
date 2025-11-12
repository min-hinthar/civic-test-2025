
import React from 'react';
import { User } from '../types';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeToggleButton: React.FC<{ theme: 'light' | 'dark'; toggleTheme: () => void; }> = ({ theme, toggleTheme }) => {
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-brand-accent dark:text-brand-primary-dark hover:bg-white/20 dark:hover:bg-black/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-primary dark:focus:ring-offset-brand-accent focus:ring-white transition-colors duration-200"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
    </button>
  );
};


const Header: React.FC<HeaderProps> = ({ user, onLogout, theme, toggleTheme }) => {
  return (
    <header className="bg-brand-primary text-brand-accent dark:bg-card-dark dark:border-b dark:border-border-dark shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-bold">U.S. Civics Quiz</h1>
            <h2 className="text-sm md:text-md text-brand-accent/80 dark:text-brand-primary-dark/80">အမေရိကန်နိုင်ငံသား စာမေးပွဲ</h2>
        </div>
        <div className="flex items-center space-x-4">
            <ThemeToggleButton theme={theme} toggleTheme={toggleTheme} />
            {user && (
              <button
                onClick={onLogout}
                className="bg-brand-secondary hover:bg-red-700 dark:bg-brand-secondary-dark dark:hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
              >
                Logout
              </button>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;
