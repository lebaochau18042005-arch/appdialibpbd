import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { QuizAttempt } from '../../types';

interface Props {
  attempts: QuizAttempt[];
}

export default function ProgressChart({ attempts }: Props) {
  // Group by date (YYYY-MM-DD)
  const grouped = attempts.reduce((acc, curr) => {
    const date = new Date(curr.date).toLocaleDateString('vi-VN');
    if (!acc[date]) acc[date] = { count: 0, totalScore: 0 };
    acc[date].count++;
    acc[date].totalScore += curr.score;
    return acc;
  }, {} as Record<string, { count: number; totalScore: number }>);

  // Sort by date (we need to sort it back to actual date objects for ordering)
  const data = Object.entries(grouped)
    .sort((a, b) => {
      const [d1, m1, y1] = a[0].split('/').map(Number);
      const [d2, m2, y2] = b[0].split('/').map(Number);
      return new Date(y1, m1 - 1, d1).getTime() - new Date(y2, m2 - 1, d2).getTime();
    })
    .map(([date, stats]) => ({
      date: date.substring(0, 5), // Only show DD/MM
      averageScore: Number((stats.totalScore / stats.count).toFixed(2))
    }))
    .slice(-7); // Last 7 days/entries

  return (
    <div className="h-64 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} padding={{ left: 10, right: 10 }} />
          <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Line type="monotone" dataKey="averageScore" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
