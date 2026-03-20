import React from 'react';
import { User, BarChart, ShieldCheck } from 'lucide-react';
import { QuizAttempt } from '../../types';
import ScoreDistributionChart from '../charts/ScoreDistributionChart';
import ProgressChart from '../charts/ProgressChart';

interface TeacherStatsProps {
  attempts: QuizAttempt[];
}

export default function TeacherStats({ attempts }: TeacherStatsProps) {
  const totalStudents = Array.from(new Set(attempts.map(a => a.userId))).length;
  const commentedCount = attempts.filter(a => a.teacherComment).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <User size={28} />
          </div>
          <div>
            <div className="text-sm text-slate-400 font-bold uppercase tracking-wider">Tổng học sinh</div>
            <div className="text-2xl font-black text-slate-900">{totalStudents}</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <BarChart size={28} />
          </div>
          <div>
            <div className="text-sm text-slate-400 font-bold uppercase tracking-wider">Lượt làm bài</div>
            <div className="text-2xl font-black text-slate-900">{attempts.length}</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
            <ShieldCheck size={28} />
          </div>
          <div>
            <div className="text-sm text-slate-400 font-bold uppercase tracking-wider">Đã nhận xét</div>
            <div className="text-2xl font-black text-slate-900">{commentedCount}</div>
          </div>
        </div>
      </div>
      
      {attempts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-2 pl-2">Phân bố điểm số</h3>
            <ScoreDistributionChart attempts={attempts} />
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-2 pl-2">Tiến độ học tập theo ngày</h3>
            <ProgressChart attempts={attempts} />
          </div>
        </div>
      )}
    </div>
  );
}
