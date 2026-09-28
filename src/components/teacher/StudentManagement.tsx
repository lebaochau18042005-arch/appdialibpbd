import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, Search, X, BarChart2, Calendar, Clock, Target,
  MessageSquare, ChevronRight, TrendingUp, TrendingDown,
  Award, BookOpen, Download, Filter, CheckCircle2, XCircle, RefreshCw,
  ClipboardList, ChevronDown, ChevronUp, Edit3, Save, Plus, FileSpreadsheet
} from 'lucide-react';
import { QuizAttempt, StudentSummary, TopicStats } from '../../types';
import { examService } from '../../services/examService';
import { sanitizeEmailKey, teacherWorkspaceService } from '../../services/teacherWorkspaceService';
import { rosterService, ClassRoster, StudentEntry } from '../../services/rosterService';
import { isStudentNameMatch, isClassMatch, normalizeClassName } from '../../utils/studentMatcher';
import { useAuth } from '../../contexts/AuthContext';
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
    const isAnon = !a.userId
      || a.userId === 'anonymous'
      || a.userId.includes('anonymous')
      || a.userId.startsWith('guest_');
    const key = isAnon
      ? `${(a.userName || 'unknown').trim().toLowerCase()}::${(a.className || '').trim().toLowerCase()}`
      : a.userId;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(a);
  }

  return Array.from(map.entries()).map(([key, atts]) => {
    const validScores = atts.map(a => a.score).filter(s => typeof s === 'number' && !isNaN(s));
    const sorted = [...atts].sort((a, b) => {
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db = b.date ? new Date(b.date).getTime() : 0;
      return db - da;
    });
    const lastDate = sorted.find(a => a.date && !isNaN(new Date(a.date).getTime()))?.date || '';
    return {
      key,
      userName: sorted[0].userName || 'Học sinh ẩn danh',
      className: sorted[0].className || 'Chưa xác định',
      totalAttempts: atts.length,
      avgScore: validScores.length > 0 ? validScores.reduce((s, v) => s + v, 0) / validScores.length : 0,
      highestScore: validScores.length > 0 ? Math.max(...validScores) : 0,
      lowestScore: validScores.length > 0 ? Math.min(...validScores) : 0,
      lastAttemptDate: lastDate,
      attempts: sorted,
    } as StudentSummary;
  }).sort((a, b) => {
    const da = a.lastAttemptDate ? new Date(a.lastAttemptDate).getTime() : 0;
    const db = b.lastAttemptDate ? new Date(b.lastAttemptDate).getTime() : 0;
    return db - da;
  });
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
function exportCSV(students: StudentSummary[], className?: string) {
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
  link.download = `danh_sach_hoc_sinh_${className ? className.replace(/\s+/g, '_') + '_' : ''}${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const ScoreBadge = ({ score }: { score: number }) => {
  if (typeof score !== 'number' || isNaN(score)) {
    return <span className="inline-block px-2 py-0.5 rounded-lg border text-xs font-black bg-slate-50 text-slate-400 border-slate-100">—</span>;
  }
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
          <div className="flex gap-2 mb-3">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
              <ClipboardList size={10} /> Đề giao: {student.attempts.filter(a => a.mode === 'exam').length}
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-violet-50 text-violet-600 border border-violet-100">
              <BookOpen size={10} /> Tự luyện: {student.attempts.filter(a => a.mode !== 'exam').length}
            </span>
          </div>
          <div className="space-y-3">
            {student.attempts.map(attempt => (
              <div key={attempt.id} className={`p-4 rounded-2xl border ${
                attempt.mode === 'exam' ? 'bg-indigo-50/40 border-indigo-100' : 'bg-slate-50 border-slate-100'
              }`}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        attempt.mode === 'exam'
                          ? 'bg-indigo-500 text-white'
                          : 'bg-violet-100 text-violet-600'
                      }`}>
                        {attempt.mode === 'exam' ? '📋 Đề GV giao' : '📚 Tự luyện'}
                      </span>
                    </div>
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
                      className="w-full p-3 text-xs border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-indigo-400 outline-none font-bold text-indigo-700"
                    />
                    <input
                      value={progress}
                      onChange={e => setProgress(e.target.value)}
                      placeholder="Đánh giá tiến độ (VD: Xuất sắc, Tốt, Cần cố gắng...)"
                      className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none font-bold text-indigo-700"
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

// ─── Multi-Class Interactive Roster Panel ───────────────────────────────────────────────
interface RosterPanelProps {
  selectedClass: string;
  onSelectClass: (cls: string) => void;
  availableClasses: string[];
  rosterNames: string[];
  doneList: { name: string; summary?: StudentSummary; score?: number }[];
  notDoneList: string[];
  showRoster: boolean;
  setShowRoster: (v: boolean) => void;
  onSaveClassRoster: (className: string, students: StudentEntry[]) => void;
  exportNotDone: () => void;
}

function ClassRosterPanel({
  selectedClass, onSelectClass, availableClasses,
  rosterNames, doneList, notDoneList,
  showRoster, setShowRoster,
  onSaveClassRoster, exportNotDone,
}: RosterPanelProps) {
  const [editing, setEditing] = useState(false);
  const [draftText, setDraftText] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'done' | 'notDone'>('all');

  const startEdit = () => {
    setDraftText(rosterNames.join('\n'));
    setEditing(true);
  };

  const handleSave = () => {
    const lines = draftText.split('\n').map(l => l.trim()).filter(l => l.length > 1);
    const targetCls = selectedClass === 'Tất cả' ? '12C1' : selectedClass;
    onSaveClassRoster(targetCls, lines.map(name => ({ name })));
    setEditing(false);
  };

  const doneSet = useMemo(() => new Set(doneList.map(d => d.name.toLowerCase())), [doneList]);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-5">
      {/* Header */}
      <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100/80 bg-slate-50/40">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowRoster(!showRoster)}>
          <div className="w-11 h-11 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center shadow-sm">
            <ClipboardList size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-800 text-base">
                Theo dõi danh sách lớp {selectedClass !== 'Tất cả' ? <span className="text-indigo-600 font-black">Lớp {selectedClass}</span> : '(Toàn bộ)'}
              </h3>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-black rounded-full">
                {rosterNames.length} HS
              </span>
            </div>
            {rosterNames.length > 0 ? (
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                <span className="text-emerald-600 font-black">{doneList.length}</span>/{rosterNames.length} học sinh đã làm bài
                {notDoneList.length > 0 && (
                  <span className="text-rose-500 font-black"> · {notDoneList.length} chưa làm</span>
                )}
              </p>
            ) : (
              <p className="text-xs text-slate-400 font-medium">Chưa có danh sách tên học sinh cho lớp này</p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Class switcher buttons */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs max-w-full overflow-x-auto">
            {availableClasses.map(cls => (
              <button
                key={cls}
                onClick={() => onSelectClass(cls)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-black transition-all whitespace-nowrap',
                  selectedClass === cls
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                {cls}
              </button>
            ))}
          </div>

          {notDoneList.length > 0 && (
            <button
              onClick={exportNotDone}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200/80 rounded-xl hover:bg-rose-100 transition-colors shadow-xs"
            >
              <Download size={13} /> Xuất DS chưa làm ({notDoneList.length})
            </button>
          )}

          <button
            onClick={() => setShowRoster(!showRoster)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            {showRoster ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Expandable student pills */}
      <AnimatePresence>
        {showRoster && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="p-5 space-y-4">
              {editing ? (
                <div className="space-y-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60">
                  <p className="text-xs font-bold text-amber-900">
                    Nhập danh sách học sinh {selectedClass !== 'Tất cả' ? `Lớp ${selectedClass}` : ''} (mỗi tên trên một dòng):
                  </p>
                  <textarea
                    value={draftText}
                    onChange={e => setDraftText(e.target.value)}
                    rows={8}
                    placeholder={"Nguyễn Văn A\nTrần Thị B\nLê Văn C..."}
                    className="w-full p-4 text-sm border border-amber-300 rounded-xl resize-none focus:ring-2 focus:ring-amber-400 outline-none font-mono leading-relaxed bg-white font-medium"
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditing(false)} className="px-4 py-2 text-xs text-slate-500 border border-slate-200 rounded-xl font-bold hover:bg-slate-100 bg-white">Hủy</button>
                    <button onClick={handleSave} className="flex items-center gap-1.5 px-5 py-2 text-xs text-white bg-amber-600 rounded-xl font-bold hover:bg-amber-700 transition-colors shadow-sm">
                      <Save size={14} /> Lưu danh sách
                    </button>
                  </div>
                </div>
              ) : rosterNames.length === 0 ? (
                <div className="text-center py-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <ClipboardList size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-slate-500 font-bold text-sm">Chưa có danh sách học sinh cho {selectedClass !== 'Tất cả' ? `lớp ${selectedClass}` : 'mục này'}.</p>
                  <p className="text-slate-400 text-xs mt-1 mb-4">Bạn có thể dán danh sách tên học sinh để hệ thống tự động kiểm tra ai đã làm và ai chưa làm.</p>
                  <button
                    onClick={startEdit}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-100"
                  >
                    <Plus size={14} /> Nhập danh sách lớp {selectedClass !== 'Tất cả' ? selectedClass : ''}
                  </button>
                </div>
              ) : (
                <>
                  {/* Filter chips */}
                  <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setFilterMode('all')}
                        className={cn('px-3 py-1 rounded-lg text-xs font-bold transition-colors', filterMode === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}
                      >
                        Tất cả ({rosterNames.length})
                      </button>
                      <button
                        onClick={() => setFilterMode('done')}
                        className={cn('px-3 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1', filterMode === 'done' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100')}
                      >
                        <CheckCircle2 size={12} /> Đã làm ({doneList.length})
                      </button>
                      <button
                        onClick={() => setFilterMode('notDone')}
                        className={cn('px-3 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1', filterMode === 'notDone' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100')}
                      >
                        <XCircle size={12} /> Chưa làm ({notDoneList.length})
                      </button>
                    </div>

                    <button
                      onClick={startEdit}
                      className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                      <Edit3 size={13} /> Sửa danh sách
                    </button>
                  </div>

                  {/* Student pills grid */}
                  <div className="flex flex-wrap gap-2 max-h-72 overflow-y-auto pr-1">
                    {rosterNames
                      .filter(name => {
                        const isDone = doneSet.has(name.toLowerCase());
                        if (filterMode === 'done') return isDone;
                        if (filterMode === 'notDone') return !isDone;
                        return true;
                      })
                      .map((name, index) => {
                        const doneInfo = doneList.find(d => d.name.toLowerCase() === name.toLowerCase());
                        const isDone = !!doneInfo;

                        return (
                          <div
                            key={`${name}_${index}`}
                            className={cn(
                              'inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all shadow-2xs',
                              isDone
                                ? 'bg-emerald-50/80 text-emerald-800 border-emerald-200 hover:bg-emerald-100/70'
                                : 'bg-rose-50/80 text-rose-700 border-rose-200 hover:bg-rose-100/70'
                            )}
                          >
                            {isDone ? (
                              <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                            ) : (
                              <XCircle size={14} className="text-rose-500 shrink-0" />
                            )}
                            <span className="truncate max-w-[200px]">{name}</span>
                            {isDone && typeof doneInfo.score === 'number' && (
                              <span className="px-1.5 py-0.5 bg-emerald-200/60 text-emerald-900 rounded text-[10px] font-black shrink-0">
                                {doneInfo.score.toFixed(1)}đ
                              </span>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Student Management ──────────────────────────────────────────────────
export default function StudentManagement({ attempts, onRefresh }: StudentManagementProps) {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('Tất cả');
  const [selectedStudent, setSelectedStudent] = useState<StudentSummary | null>(null);
  const [showRoster, setShowRoster] = useState(true);

  const activeTeacherEmail = teacherWorkspaceService.getActiveTeacherEmail() || user?.email || '';
  const isSuperAdmin = activeTeacherEmail.toLowerCase() === 'lebaochau18042005@gmail.com';

  // Real-time synced rosters
  const [savedRosters, setSavedRosters] = useState<ClassRoster[]>(() => rosterService.getRosters(activeTeacherEmail));

  useEffect(() => {
    const subKey = user?.uid || activeTeacherEmail;
    if (!subKey) return;
    const unsub = rosterService.subscribeToRosters(subKey, setSavedRosters, activeTeacherEmail);
    return () => unsub();
  }, [user?.uid, activeTeacherEmail]);

  const students = useMemo(() => buildStudentList(attempts), [attempts]);

  // Combined available classes
  const classes = useMemo(() => {
    const set = new Set<string>();
    savedRosters.forEach(r => { if (r.className) set.add(r.className); });
    students.forEach(s => { if (s.className && s.className !== 'Chưa xác định') set.add(s.className); });
    const list = Array.from(set).sort();
    return ['Tất cả', ...list];
  }, [savedRosters, students]);

  // Roster names for the selected class
  const currentRosterNames = useMemo(() => {
    if (selectedClass !== 'Tất cả') {
      const matchRoster = savedRosters.find(r => isClassMatch(r.className, selectedClass));
      if (matchRoster && matchRoster.students.length > 0) {
        return matchRoster.students.map(s => s.name);
      }
      // Check legacy class roster in localStorage
      const legacy = localStorage.getItem('geo_pro_class_roster') || '';
      if (legacy) return legacy.split('\n').map(n => n.trim()).filter(Boolean);
      // Fallback: students from attempts of this class
      return students.filter(s => isClassMatch(s.className, selectedClass)).map(s => s.userName);
    }
    // "Tất cả": combine all students from all saved rosters
    if (savedRosters.length > 0) {
      const combined: string[] = [];
      savedRosters.forEach(r => r.students.forEach(s => {
        if (!combined.includes(s.name)) combined.push(s.name);
      }));
      if (combined.length > 0) return combined;
    }
    const legacy = localStorage.getItem('geo_pro_class_roster') || '';
    if (legacy) return legacy.split('\n').map(n => n.trim()).filter(Boolean);
    return students.map(s => s.userName);
  }, [selectedClass, savedRosters, students]);

  // Calculate done and not done list for this roster
  const { doneList, notDoneList } = useMemo(() => {
    const relevantStudents = selectedClass === 'Tất cả'
      ? students
      : students.filter(s => isClassMatch(s.className, selectedClass));

    const done: { name: string; summary?: StudentSummary; score?: number }[] = [];
    const notDone: string[] = [];

    currentRosterNames.forEach(name => {
      // Smart fuzzy & diacritic-tolerant name matcher
      const match = relevantStudents.find(s => isStudentNameMatch(name, s.userName));
      if (match) {
        done.push({ name, summary: match, score: match.highestScore });
      } else {
        notDone.push(name);
      }
    });

    return { doneList: done, notDoneList: notDone };
  }, [currentRosterNames, students, selectedClass]);

  const handleSaveClassRoster = (className: string, newStudents: StudentEntry[]) => {
    rosterService.saveRoster(className, newStudents, user?.uid, activeTeacherEmail);
    // Also update legacy key for compatibility
    localStorage.setItem('geo_pro_class_roster', newStudents.map(s => s.name).join('\n'));
    setSavedRosters(rosterService.getRosters(activeTeacherEmail));
  };

  const handleExportNotDone = () => {
    const csv = ['Họ và tên', 'Lớp', 'Trạng thái', ...notDoneList.map(n => `"${n}",${selectedClass !== 'Tất cả' ? selectedClass : 'Chưa làm'},Chưa làm bài`)].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hoc_sinh_chua_lam_bai_${selectedClass.replace(/\s+/g, '_')}_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filtered = useMemo(() => {
    return students.filter(s => {
      const matchClass = selectedClass === 'Tất cả' || isClassMatch(s.className, selectedClass);
      const matchSearch = s.userName.toLowerCase().includes(search.toLowerCase());
      return matchClass && matchSearch;
    });
  }, [students, search, selectedClass]);

  if (attempts.length === 0 && currentRosterNames.length === 0 && savedRosters.length === 0) {
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
      {/* Visual Multi-Class Roster Status Panel */}
      <ClassRosterPanel
        selectedClass={selectedClass}
        onSelectClass={setSelectedClass}
        availableClasses={classes}
        rosterNames={currentRosterNames}
        doneList={doneList}
        notDoneList={notDoneList}
        showRoster={showRoster}
        setShowRoster={setShowRoster}
        onSaveClassRoster={handleSaveClassRoster}
        exportNotDone={handleExportNotDone}
      />

      {/* Main Table Container */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
              <Users size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Danh sách bài nộp của học sinh</h2>
              <p className="text-sm text-slate-500">{filtered.length} / {students.length} học sinh có bài làm</p>
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

            {/* Class filter dropdown */}
            <div className="relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="pl-8 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none bg-white font-medium appearance-none cursor-pointer"
              >
                {classes.map(c => <option key={c} value={c}>{c === 'Tất cả' ? 'Tất cả các lớp' : `Lớp ${c}`}</option>)}
              </select>
            </div>

            {/* Export */}
            <button
              onClick={() => exportCSV(filtered, selectedClass)}
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
                      {student.lastAttemptDate && !isNaN(new Date(student.lastAttemptDate).getTime())
                        ? new Date(student.lastAttemptDate).toLocaleDateString('vi-VN')
                        : '—'}
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
              <p className="font-medium">Không tìm thấy học sinh phù hợp trong lớp này</p>
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
