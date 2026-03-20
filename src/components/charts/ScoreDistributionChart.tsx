import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { QuizAttempt } from '../../types';

interface Props {
  attempts: QuizAttempt[];
}

export default function ScoreDistributionChart({ attempts }: Props) {
  const distribution = [
    { range: '0-2', count: 0 },
    { range: '2-4', count: 0 },
    { range: '4-6', count: 0 },
    { range: '6-8', count: 0 },
    { range: '8-10', count: 0 },
  ];

  attempts.forEach(a => {
    if (a.score <= 2) distribution[0].count++;
    else if (a.score <= 4) distribution[1].count++;
    else if (a.score <= 6) distribution[2].count++;
    else if (a.score <= 8) distribution[3].count++;
    else distribution[4].count++;
  });

  return (
    <div className="h-64 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={distribution} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
          <XAxis dataKey="range" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip 
            cursor={{ fill: '#f1f5f9' }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]}>
            {distribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.count > 0 ? '#4f46e5' : '#e2e8f0'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
