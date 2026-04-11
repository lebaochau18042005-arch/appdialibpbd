import React from 'react';
import { Users, BookOpen, ClipboardCheck, MessageSquare, TrendingUp, GraduationCap } from 'lucide-react';
import { QuizAttempt } from '../../types';
import ScoreDistributionChart from '../charts/ScoreDistributionChart';
import ProgressChart from '../charts/ProgressChart';

interface TeacherStatsProps {
  attempts: QuizAttempt[];
}

/** Same key logic as StudentManagement.buildStudentList – group by name+class for anonymous users */
function uniqueStudentCount(attempts: QuizAttempt[]): number {
  const keys = new Set<string>();
  for (const a of attempts) {
    const isAnon = !a.userId
      || a.userId === 'anonymous'
      || a.userId.includes('anonymous')
      || a.userId.startsWith('guest_');
    const key = isAnon
      ? `${(a.userName || 'unknown').trim().toLowerCase()}::${(a.className || '').trim().toLowerCase()}`
      : a.userId;
    keys.add(key);
  }
  return keys.size;
}

export default function TeacherStats({ attempts }: TeacherStatsProps) {
  const totalStudents = uniqueStudentCount(attempts);
  const commentedCount = attempts.filter(a => a.teacherComment).length;

  // Split by mode
  const examAttempts  = attempts.filter(a => a.mode === 'exam');
  const practiceAttempts = attempts.filter(a => a.mode !== 'exam');

  // Unique students from exam vs practice
  const examStudents     = uniqueStudentCount(examAttempts);
  const practiceStudents = uniqueStudentCount(practiceAttempts);

  // Most practiced topic
  const topicMap = new Map<string, number>();
  for (const a of practiceAttempts) {
    if (a.examTitle && a.examTitle !== 'Luyện tập') {
      topicMap.set(a.examTitle, (topicMap.get(a.examTitle) || 0) + 1);
    }
  }
  const topTopics = Array.from(topicMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const stats = [
    {
      label: 'Tổng học sinh',
      value: totalStudents,
      sub: 'học sinh duy nhất',
      icon: Users,
      color: 'blue',
    },
    {
      label: 'Lượt làm bài',
      value: attempts.length,
      sub: `${examAttempts.length} đề giao · ${practiceAttempts.length} tự luyện`,
      icon: BookOpen,
      color: 'emerald',
    },
    {
      label: 'HS làm đề giao',
      value: examStudents,
      sub: `${examAttempts.length} lượt thi`,
      icon: ClipboardCheck,
      color: 'indigo',
    },
    {
      label: 'HS tự luyện tập',
      value: practiceStudents,
      sub: `${practiceAttempts.length} lượt luyện`,
      icon: GraduationCap,
      color: 'violet',
    },
    {
      label: 'Đã nhận xét',
      value: commentedCount,
      sub: `${attempts.length - commentedCount} chưa nhận xét`,
      icon: MessageSquare,
      color: 'amber',
    },
    {
      label: 'TB điểm toàn trường',
      value: attempts.length > 0
        ? (attempts.filter(a => typeof a.score === 'number' && !isNaN(a.score))
            .reduce((s, a) => s + a.score, 0) /
           attempts.filter(a => typeof a.score === 'number' && !isNaN(a.score)).length
          ).toFixed(2)
        : '—',
      sub: 'trên thang 10',
      icon: TrendingUp,
      color: 'rose',
    },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    violet: 'bg-violet-50 text-violet-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
  };
  const textMap: Record<string, string> = {
    blue: 'text-blue-700',
    emerald: 'text-emerald-700',
    indigo: 'text-indigo-700',
    violet: 'text-violet-700',
    amber: 'text-amber-700',
    rose: 'text-rose-700',
  };

  return (
    <div className="space-y-6">
      {/* 6-stat grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${colorMap[color]}`}>
              <Icon size={22} />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider truncate">{label}</div>
              <div className={`text-2xl font-black ${textMap[color]}`}>{value}</div>
              <div className="text-[10px] text-slate-400 font-medium truncate">{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Top practice topics */}
      {topTopics.length > 0 && (
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
            <GraduationCap size={15} className="text-violet-500" /> Nội dung học sinh tự luyện nhiều nhất
          </h3>
          <div className="space-y-2">
            {topTopics.map(([topic, count], idx) => (
              <div key={topic} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-600 text-[10px] font-black flex items-center justify-center shrink-0">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-sm font-medium text-slate-700 truncate">{topic}</span>
                    <span className="text-xs font-black text-violet-600 shrink-0 ml-2">{count} lượt</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-1.5 bg-violet-400 rounded-full"
                      style={{ width: `${Math.min(100, (count / (topTopics[0]?.[1] || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
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
