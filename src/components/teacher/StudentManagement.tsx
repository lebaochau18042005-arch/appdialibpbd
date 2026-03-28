import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, Search, X, BarChart2, Calendar, Clock, Target,
  MessageSquare, ChevronRight, TrendingUp, TrendingDown,
  Award, BookOpen, Download, Filter, CheckCircle2, XCircle, RefreshCw
} from 'lucide-react';
import { QuizAttempt, StudentSummary, TopicStats } from '../../types';
import { examService } from '../../services/examService';
import { cn } from '../../utils/cn';
import ProgressChart from '../charts/ProgressChart';

interface StudentManagementProps {
  attempts: QuizAttempt[];
  onRefresh: () => void;
}

// Build student summaries from attempts
function buildStudentList(attempts: QuizAttempt[]): StudentSummary[] {
  const map = new Map<string, QuizAttempt[]>();

  for (const a of attempts) {
    const key = a.userId || a.userName || 'unknown';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(a);
  }

  return Array.from(map.entries()).map(([key, atts]) => {
    const scores = atts.map(a => a.score);
    const sorted = [...atts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return {
      key,
      userName: sorted[0].userName || 'Học sinh ẩn danh',
      className: sorted[0].className || 'Chưa xác định',
      totalAttempts: atts.length,
      avgScore: scores.reduce((s, v) => s + v, 0) / scores.length,
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
      lastAttemptDate: sorted[0].date,
      attempts: sorted,
    } as StudentSummary;
  }).sort((a, b) => new Date(b.lastAttemptDate).getTime() - new Date(a.lastAttemptDate).getTime());
}

// Compute topic stats from all attempts of a student
function computeTopicStats(attempts: QuizAttempt[]): TopicStats[] {
  const topicMap = new Map<string, { correct: number; total: number }>();

  for (const attempt of attempts) {
    if (!attempt.answers) continue;
    for (const [qId, answerData] of Object.entries(attempt.answers)) {
      const topic: string = (answerData as any).topic || 'Chung';
      const isCorrect: boolean = (answerData as any).isCorrect === true;
      if (!topicMap.has(topic)) topicMap.set(topic, { correct: 0, total: 0 });
      const t = topicMap.get(topic)!;
      t.total += 1;
      if (isCorrect) t.correct += 1;
    }
  }

  return Array.from(topicMap.entries())
    .map(([topic, { correct, total }]) => ({
      topic,
      correct,
      total,
      percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
    }))
    .sort((a, b) => a.percentage - b.percentage);
}

// Export students to CSV
function exportCSV(students: StudentSummary[]) {
  const rows = [
    ['Họ tên', 'Lớp', 'Số bài làm', 'Điểm TB', 'Điểm cao nhất', 'Điểm thấp nhất', 'Ngày gần nhất'],
    ...students.map(s => [
      s.userName,
      s.className,
      s.totalAttempts,
      s.avgScore.toFixed(2),
      s.highestScore.toFixed(2),
      s.lowestScore.toFixed(2),
      new Date(s.lastAttemptDate).toLocaleDateString('vi-VN'),
    ])
  ];
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `danh_sach_hoc_sinh_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const ScoreBadge = ({ score }: { score: number }) => {
  const color =
    score >= 8 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
    score >= 6.5 ? 'bg-blue-50 text-blue-700 border-blue-100' :
    score >= 5 ? 'bg-amber-50 text-amber-700 border-amber-100' :
    'bg-rose-50 text-rose-700 border-rose-100';
  return (
    <span className={cn('inline-block px-2 py-0.5 rounded-lg border text-xs font-black', color)}>
      {score.toFixed(2)}
    </span>
  );
};

interface DetailPanelProps {
  student: StudentSummary;
  onClose: () => void;
  onRefresh: () => void;
}

function StudentDetailPanel({ student, onClose, onRefresh }: DetailPanelProps) {
  const [commentingId, setCommentingId] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [progress, setProgress] = useState('');
  const [saving, setSaving] = useState(false);

  const topicStats = useMemo(() => computeTopicStats(student.attempts), [student]);

  const handleSaveComment = async (attemptId: string) => {
    if (!comment.trim()) return;
    setSaving(true);
    await examService.addTeacherComment(attemptId, comment, progress);
    setSaving(false);
    setCommentingId(null);
    setComment('');
    setProgress('');
    onRefresh();
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}p ${s % 60}s`;

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col overflow-hidden border-l border-slate-100"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-indigo-200">
          {student.userName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-black text-slate-900 truncate">{student.userName}</h3>
          <p className="text-sm text-slate-500 font-medium">Lớp: {student.className}</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <X size={22} className="text-slate-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Số bài làm', value: student.totalAttempts, icon: BookOpen, color: 'indigo' },
            { label: 'Điểm TB', value: student.avgScore.toFixed(2), icon: Target, color: 'emerald' },
            { label: 'Điểm cao nhất', value: student.highestScore.toFixed(2), icon: Award, color: 'amber' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className={`p-4 rounded-2xl bg-${color}-50 border border-${color}-100`}>
              <Icon size={16} className={`text-${color}-500 mb-1`} />
              <div className={`text-xl font-black text-${color}-700`}>{value}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </div>

        {/* Progress chart */}
        {student.attempts.length > 1 && (
          <div className="bg-white p-5 rounded-2xl border border-slate-100">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <TrendingUp size={14} /> Biểu đồ tiến trình điểm
            </h4>
            <ProgressChart attempts={[...student.attempts].reverse()} />
          </div>
        )}

        {/* Topic analysis */}
        {topicStats.length > 0 && (
          <div className="bg-white p-5 rounded-2xl border border-slate-100">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <BarChart2 size={14} /> Phân tích theo chủ đề
            </h4>
            <div className="space-y-2">
              {topicStats.map(ts => (
                <div key={ts.topic}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-600 truncate max-w-[200px]">{ts.topic}</span>
                    <span className={cn('font-black', ts.percentage >= 70 ? 'text-emerald-600' : ts.percentage >= 50 ? 'text-amber-600' : 'text-rose-600')}>
                      {ts.correct}/{ts.total} ({ts.percentage}%)
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', ts.percentage >= 70 ? 'bg-emerald-400' : ts.percentage >= 50 ? 'bg-amber-400' : 'bg-rose-400')}
                      style={{ width: `${ts.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-3 text-[10px] font-bold text-slate-400 uppercase">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />Yếu (&lt;50%)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />TB (50-70%)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />Tốt (&gt;70%)</span>
            </div>
          </div>
        )}

        {/* Attempt list */}
        <div>
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Calendar size={14} /> Lịch sử bài làm ({student.attempts.length})
          </h4>
          <div className="space-y-3">
            {student.attempts.map(attempt => (
              <div key={attempt.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">{attempt.examTitle}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-400 font-medium">
                      <span className="flex items-center gap-1"><Calendar size={11} />{new Date(attempt.date).toLocaleDateString('vi-VN')}</span>
                      <span className="flex items-center gap-1"><Clock size={11} />{formatTime(attempt.timeSpent)}</span>
                      <span className="flex items-center gap-1"><Target size={11} />{attempt.totalQuestions} câu</span>
                    </div>
                  </div>
                  <ScoreBadge score={attempt.score} />
                </div>

                {attempt.teacherComment && (
                  <div className="mt-2 p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-xs">
                    <div className="text-indigo-500 font-black uppercase tracking-wider mb-1 flex items-center gap-1">
                      <MessageSquare size={10} /> Nhận xét GV
                    </div>
                    <p className="text-slate-600 italic">"{attempt.teacherComment}"</p>
                    {attempt.studentProgress && (
                      <span className="mt-1 inline-block px-2 py-0.5 bg-white rounded-lg border border-indigo-100 text-indigo-600 font-bold text-[10px]">
                        {attempt.studentProgress}
                      </span>
                    )}
                  </div>
                )}

                {commentingId === attempt.id ? (
                  <div className="mt-3 space-y-2">
                    <textarea
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Nhập nhận xét cho học sinh..."
                      rows={3}
                      className="w-full p-3 text-xs border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-indigo-400 outline-none"
                    />
                    <input
                      value={progress}
                      onChange={e => setProgress(e.target.value)}
                      placeholder="Đánh giá tiến độ (VD: Xuất sắc, Tốt, Cần cố gắng...)"
                      className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none"
                    />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => { setCommentingId(null); setComment(''); setProgress(''); }} className="px-3 py-2 text-xs text-slate-500 border border-slate-200 rounded-lg font-bold hover:bg-slate-50">
                        Hủy
                      </button>
                      <button
                        onClick={() => handleSaveComment(attempt.id)}
                        disabled={!comment.trim() || saving}
                        className="flex items-center gap-1 px-4 py-2 text-xs bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {saving ? <RefreshCw size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                        Lưu nhận xét
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => { setCommentingId(attempt.id); setComment(attempt.teacherComment || ''); setProgress(attempt.studentProgress || ''); }}
                    className="mt-2 flex items-center gap-1 text-[11px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors"
                  >
                    <MessageSquare size={11} />
                    {attempt.teacherComment ? 'Sửa nhận xét' : 'Thêm nhận xét'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function StudentManagement({ attempts, onRefresh }: StudentManagementProps) {
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('Tất cả');
  const [selectedStudent, setSelectedStudent] = useState<StudentSummary | null>(null);

  const students = useMemo(() => buildStudentList(attempts), [attempts]);

  const classes = useMemo(() => {
    const set = new Set(students.map(s => s.className));
    return ['Tất cả', ...Array.from(set)];
  }, [students]);

  const filtered = useMemo(() => {
    return students.filter(s => {
      const matchClass = selectedClass === 'Tất cả' || s.className === selectedClass;
      const matchSearch = s.userName.toLowerCase().includes(search.toLowerCase());
      return matchClass && matchSearch;
    });
  }, [students, search, selectedClass]);

  if (attempts.length === 0) {
    return (
      <div className="bg-white p-16 rounded-3xl border border-slate-100 text-center shadow-sm">
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Users className="w-12 h-12 text-slate-200" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Chưa có học sinh làm bài</h3>
        <p className="text-slate-500 max-w-sm mx-auto">Khi học sinh hoàn thành bài thi, dữ liệu sẽ xuất hiện ở đây để giáo viên theo dõi và đánh giá.</p>
      </div>
    );
  }

  return (
    <>
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
            <Users size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Danh sách học sinh</h2>
            <p className="text-sm text-slate-500">{filtered.length} / {students.length} học sinh</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:flex-none">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              type="text"
              placeholder="Tìm tên học sinh..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none w-full md:w-56 font-medium"
            />
          </div>

          {/* Class filter */}
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="pl-8 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none bg-white font-medium appearance-none cursor-pointer"
            >
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Export */}
          <button
            onClick={() => exportCSV(filtered)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
          >
            <Download size={16} /> Xuất CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-50">
              {['Học sinh', 'Lớp', 'Bài đã làm', 'Điểm TB', 'Cao nhất', 'Thấp nhất', 'Gần nhất', ''].map(h => (
                <th key={h} className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map(student => {
              const trend = student.attempts.length >= 2
                ? student.attempts[0].score - student.attempts[1].score
                : 0;

              return (
                <tr
                  key={student.key}
                  className="hover:bg-slate-50/70 cursor-pointer transition-colors group"
                  onClick={() => setSelectedStudent(student)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-sm shrink-0">
                        {student.userName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{student.userName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 text-xs font-bold bg-slate-100 text-slate-600 rounded-lg">{student.className}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-black text-slate-700">{student.totalAttempts}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <ScoreBadge score={student.avgScore} />
                      {student.attempts.length >= 2 && (
                        trend > 0
                          ? <TrendingUp size={14} className="text-emerald-500" />
                          : trend < 0
                            ? <TrendingDown size={14} className="text-rose-500" />
                            : null
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4"><ScoreBadge score={student.highestScore} /></td>
                  <td className="px-6 py-4"><ScoreBadge score={student.lowestScore} /></td>
                  <td className="px-6 py-4 text-xs text-slate-400 font-medium whitespace-nowrap">
                    {new Date(student.lastAttemptDate).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4">
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            <Search size={32} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Không tìm thấy học sinh phù hợp</p>
          </div>
        )}
      </div>
    </div>

    {/* Detail panel */}
    <AnimatePresence>
      {selectedStudent && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            onClick={() => setSelectedStudent(null)}
          />
          <StudentDetailPanel
            student={selectedStudent}
            onClose={() => setSelectedStudent(null)}
            onRefresh={onRefresh}
          />
        </>
      )}
    </AnimatePresence>
    </>
  );
}
