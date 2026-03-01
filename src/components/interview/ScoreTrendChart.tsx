'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { getTokenColor } from '@/lib/tokens';
import { useThemeContext } from '@/contexts/ThemeContext';

interface ScoreTrendChartProps {
  data: Array<{ date: string; score: number }>;
}

/**
 * Score trend line chart extracted from InterviewResults for dynamic import.
 * Loads recharts (~200KB) only when rendered, keeping it out of the initial bundle.
 */
export function ScoreTrendChart({ data }: ScoreTrendChartProps) {
  // Subscribe to theme changes so getTokenColor() re-resolves on toggle
  useThemeContext();

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={getTokenColor('--color-border', 0.3)}
            opacity={0.3}
          />
          <XAxis dataKey="date" stroke={getTokenColor('--color-text-secondary')} fontSize={11} />
          <YAxis
            domain={[0, 20]}
            stroke={getTokenColor('--color-text-secondary')}
            fontSize={11}
            tickFormatter={(value: number) => `${value}`}
          />
          <Tooltip
            formatter={value => [`${Number(value)} / 20`, 'Score']}
            contentStyle={{
              backgroundColor: getTokenColor('--color-surface'),
              borderRadius: '1rem',
              border: `1px solid ${getTokenColor('--color-border')}`,
            }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke={getTokenColor('--color-chart-blue')}
            strokeWidth={3}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
