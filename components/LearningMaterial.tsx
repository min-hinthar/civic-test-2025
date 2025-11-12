import React, { useState, useMemo } from 'react';
import { civicsQuestions } from '../constants/civicsQuestions';
import { Category, Question } from '../types';

const categories: { en: Category | 'All'; my: string }[] = [
    { en: 'All', my: 'အားလုံး' },
    { en: 'Principles of American Democracy', my: 'အမေရိကန်ဒီမိုကရေစီ၏ အခြေခံမူများ' },
    { en: 'System of Government', my: 'အစိုးရစနစ်' },
    { en: 'Rights and Responsibilities', my: 'အခွင့်အရေးနှင့် တာဝန်များ' },
    { en: 'American History: Colonial Period and Independence', my: 'အမေရိကန်သမိုင်း- ကိုလိုနီခေတ်နှင့် လွတ်လပ်ရေး' },
    { en: 'American History: 1800s', my: 'အမေရိကန်သမိုင်း- ၁၈၀၀ ပြည့်နှစ်များ' },
    { en: 'Recent American History and Other Important Historical Information', my: 'မကြာသေးမီက အမေရိကန်သမိုင်းနှင့် အခြားအရေးကြီးသော သမိုင်းဆိုင်ရာ အချက်အလက်များ' },
    { en: 'Civics: Symbols and Holidays', my: 'နိုင်ငံသား- သင်္ကေတများနှင့် အားလပ်ရက်များ' },
];

const categoryColors: Record<Category, { bg: string, tagBg: string, text: string, border: string }> = {
    'Principles of American Democracy': { bg: 'bg-blue-100 dark:bg-blue-900/50', tagBg: 'bg-blue-500', text: 'text-blue-800 dark:text-blue-200', border: 'border-blue-200 dark:border-blue-700' },
    'System of Government': { bg: 'bg-indigo-100 dark:bg-indigo-900/50', tagBg: 'bg-indigo-500', text: 'text-indigo-800 dark:text-indigo-200', border: 'border-indigo-200 dark:border-indigo-700' },
    'Rights and Responsibilities': { bg: 'bg-purple-100 dark:bg-purple-900/50', tagBg: 'bg-purple-500', text: 'text-purple-800 dark:text-purple-200', border: 'border-purple-200 dark:border-purple-700' },
    'American History: Colonial Period and Independence': { bg: 'bg-red-100 dark:bg-red-900/50', tagBg: 'bg-red-500', text: 'text-red-800 dark:text-red-200', border: 'border-red-200 dark:border-red-700' },
    'American History: 1800s': { bg: 'bg-yellow-100 dark:bg-yellow-900/50', tagBg: 'bg-yellow-500', text: 'text-yellow-800 dark:text-yellow-200', border: 'border-yellow-200 dark:border-yellow-700' },
    'Recent American History and Other Important Historical Information': { bg: 'bg-green-100 dark:bg-green-900/50', tagBg: 'bg-green-500', text: 'text-green-800 dark:text-green-200', border: 'border-green-200 dark:border-green-700' },
    'Civics: Symbols and Holidays': { bg: 'bg-pink-100 dark:bg-pink-900/50', tagBg: 'bg-pink-500', text: 'text-pink-800 dark:text-pink-200', border: 'border-pink-200 dark:border-pink-700' },
};

const FlipCard: React.FC<{ question: Question; categoryMy: string }> = ({ question, categoryMy }) => {
    const colors = categoryColors[question.category];

    return (
        <div className="flip-card w-full h-80 rounded-xl" tabIndex={0}>
            <div className="flip-card-inner rounded-xl shadow-md">
                {/* Front of the card */}
                <div className={`flip-card-front ${colors.bg} ${colors.text} border ${colors.border} flex flex-col p-4`}>
                    <div className="self-end text-right">
                        <div className={`text-xs text-center font-semibold text-white px-2 py-1 rounded-full ${colors.tagBg}`}>
                            <p>{question.category}</p>
                            <p className="opacity-80">{categoryMy}</p>
                        </div>
                    </div>
                    <div className="flex-grow flex flex-col items-center justify-center text-center px-2">
                        <p className="font-semibold text-lg md:text-xl">
                           <span className="text-text-secondary-light dark:text-text-secondary-dark font-bold mr-2">#{question.id}</span>
                           {question.question_en}
                        </p>
                        <p className="mt-2 text-base md:text-lg">{question.question_my}</p>
                    </div>
                </div>
                {/* Back of the card */}
                <div className={`flip-card-back ${colors.bg} ${colors.text} border ${colors.border} flex flex-col p-4 justify-center items-center`}>
                    <div className="space-y-4 text-center overflow-y-auto px-2 w-full">
                         {question.studyAnswers.slice(0, 3).map((ans, idx) => (
                            <div key={idx} className="pb-2 border-b border-gray-200/50 dark:border-gray-600/50 last:border-b-0">
                                <p className="font-semibold text-base md:text-lg">{ans.text_en}</p>
                                <p className="opacity-90 text-base">{ans.text_my}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};


const LearningMaterial: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
    
    const categoryMap = useMemo(() => {
        const map = new Map<string, string>();
        categories.forEach(c => map.set(c.en, c.my));
        return map;
    }, []);

    const filteredQuestions = useMemo(() => {
        const sortedQuestions = [...civicsQuestions].sort((a, b) => a.id - b.id);
        if (activeCategory === 'All') {
            return sortedQuestions;
        }
        return sortedQuestions.filter(q => q.category === activeCategory);
    }, [activeCategory]);

    return (
        <div>
            <div className="mb-6">
                <label htmlFor="category-select" className="block text-lg font-semibold mb-2 text-text-primary-light dark:text-text-primary-dark">
                    Filter by Category:
                </label>
                <select 
                    id="category-select"
                    value={activeCategory}
                    onChange={(e) => setActiveCategory(e.target.value as Category | 'All')}
                    className="w-full md:w-1/2 p-3 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                    {categories.map(category => (
                        <option key={category.en} value={category.en}>
                            {category.en} / {category.my}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredQuestions.map(question => (
                    <FlipCard key={question.id} question={question} categoryMy={categoryMap.get(question.category) || ''} />
                ))}
            </div>
        </div>
    );
};

export default LearningMaterial;