
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TestSession } from '../types';

interface ProgressChartProps {
  testHistory: TestSession[];
}

const COLORS = ['#16A34A', '#DC2626']; // Green for correct, Red for incorrect

const ProgressChart: React.FC<ProgressChartProps> = ({ testHistory }) => {
  const allResults = useMemo(() => testHistory.flatMap(t => t.results), [testHistory]);

  const chartData = useMemo(() => {
    if (!allResults || allResults.length === 0) {
      return [{ name: 'No Data', value: 1, fill: '#A0AEC0' }];
    }
    const correct = allResults.filter(r => r.isCorrect).length;
    const incorrect = allResults.length - correct;
    return [
      { name: 'Correct', value: correct, fill: COLORS[0] },
      { name: 'Incorrect', value: incorrect, fill: COLORS[1] },
    ];
  }, [allResults]);

  const total = allResults.length;
  const correctCount = chartData.find(d => d.name === 'Correct')?.value || 0;
  const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  if (total === 0) {
    return (
      <div className="text-center text-text-secondary-light dark:text-text-secondary-dark flex flex-col items-center justify-center h-full">
        <p>No quiz data yet.</p>
        <p>သင်ဖြေဆိုထားသော ဉာဏ်စမ်းမေးခွန်းများမရှိသေးပါ။</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center h-full">
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
       <div className="mt-4 text-center">
            <div className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">Total Answered: {total}</div>
            <div className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">Overall Accuracy: <span className="text-brand-primary dark:text-brand-primary-dark font-bold">{accuracy}%</span></div>
       </div>
    </div>
  );
};

export default ProgressChart;
