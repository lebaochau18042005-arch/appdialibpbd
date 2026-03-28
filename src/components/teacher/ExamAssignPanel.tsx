import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send, Calendar, Users, CheckCircle2, XCircle, Clock, RefreshCw,
  BookOpen, ClipboardList, ChevronDown, ChevronUp, MessageSquare, Save, X
} from 'lucide-react';
import { Exam, ExamAssignment, QuizAttempt } from '../../types';
import { assignmentService } from '../../services/assignmentService';
import { examService } from '../../services/examService';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/cn';

interface Props {
  exams: Exam[];
  attempts: QuizAttempt[];
}

// ─── Roster panel for one assignment ──────────────────────────────────────────
function AssignmentRoster({
  assignment,
  attempts,
  onComment,
}: {
  assignment: ExamAssignment;
  attempts: QuizAttempt[];
  onComment: (attempt: QuizAttempt) => void;
}) {
  const [open, setOpen] = useState(false);

  // Get all attempts for this exam
  const related = useMemo(
    () => attempts.filter(a => a.examId === assignment.examId),
    [attempts, assignment.examId]
  );

  // Unique students who submitted
  const done: QuizAttempt[] = useMemo(() => {
    const seen = new Set<string>();
    return related.filter(a => {
      const key = a.userId || a.userName;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [related]);

  const doneCount = done.length;

  return (
    <div className="border border-slate-100 rounded-2xl overflow-hidden">
      {/* Assignment header row */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
          <BookOpen size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-800 text-sm line-clamp-1">{assignment.examTitle}</p>
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
              <Users size={10} /> Lớp: <span className="text-indigo-600">{assignment.targetClass}</span>
            </span>
            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 size={10} /> {doneCount} đã làm
            </span>
            {assignment.dueDate && (
              <span className="text-[11px] font-bold text-rose-500 flex items-center gap-1">
                <Clock size={10} /> Hạn: {new Date(assignment.dueDate).toLocaleDateString('vi-VN')}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-slate-400 font-medium">
            {new Date(assignment.createdAt).toLocaleDateString('vi-VN')}
          </span>
          {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </button>

      {/* Expandable roster */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-100"
          >
            <div className="p-4 space-y-2 bg-slate-50/50">
              {done.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-4">
                  Chưa có học sinh nào làm bài cho đề này.
                </p>
              ) : (
                <>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                    Học sinh đã làm ({done.length})
                  </p>
                  <div className="space-y-2">
                    {done.map(attempt => (
                      <div key={attempt.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-sm shrink-0">
                          {(attempt.userName || 'H').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-slate-800 truncate">{attempt.userName || 'Học sinh ẩn danh'}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                            <span>Điểm: <span className={cn('font-black', attempt.score >= 8 ? 'text-emerald-600' : attempt.score >= 5 ? 'text-amber-600' : 'text-rose-600')}>{attempt.score.toFixed(1)}</span></span>
                            <span>{new Date(attempt.date).toLocaleDateString('vi-VN')}</span>
                            {attempt.className && <span className="px-1.5 py-0.5 bg-slate-100 rounded-md">{attempt.className}</span>}
                          </div>
                          {attempt.teacherComment && (
                            <p className="text-[11px] text-indigo-600 italic mt-1 line-clamp-1">"{attempt.teacherComment}"</p>
                          )}
                        </div>
                        <button
                          onClick={() => onComment(attempt)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors shrink-0"
                        >
                          <MessageSquare size={11} />
                          {attempt.teacherComment ? 'Sửa' : 'Nhận xét'}
                        </button>
                      </div>
                    ))}
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

// ─── Comment modal ─────────────────────────────────────────────────────────────
function CommentModal({ attempt, onClose, onSaved }: { attempt: QuizAttempt; onClose: () => void; onSaved: () => void }) {
  const [comment, setComment] = useState(attempt.teacherComment || '');
  const [progress, setProgress] = useState(attempt.studentProgress || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!comment.trim()) return;
    setSaving(true);
    await examService.addTeacherComment(attempt.id, comment, progress);
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-slate-900">Nhận xét học sinh</h3>
            <p className="text-sm text-slate-500">{attempt.userName} — Điểm: {attempt.score.toFixed(1)}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Nhận xét cho học sinh..."
          rows={4}
          className="w-full p-4 border border-slate-200 rounded-2xl resize-none focus:ring-2 focus:ring-indigo-400 outline-none text-sm font-medium"
        />
        <input
          value={progress}
          onChange={e => setProgress(e.target.value)}
          placeholder="Đánh giá tiến độ (VD: Xuất sắc, Tốt, Cần cố gắng...)"
          className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none text-sm font-medium"
        />
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-500 border border-slate-200 rounded-xl font-bold hover:bg-slate-50">
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={!comment.trim() || saving}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            Lưu nhận xét
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ExamAssignPanel({ exams, attempts }: Props) {
  const { user, profile } = useAuth();
  const [assignments, setAssignments] = useState<ExamAssignment[]>([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [targetClass, setTargetClass] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState('');
  const [commentingAttempt, setCommentingAttempt] = useState<QuizAttempt | null>(null);
  const [attemptsList, setAttemptsList] = useState<QuizAttempt[]>(attempts);

  const teacherName = (profile as any)?.name || user?.displayName || 'Giáo viên';

  // Subscribe to assignment list realtime
  useEffect(() => {
    const unsub = assignmentService.subscribeToAssignments(setAssignments);
    return () => unsub();
  }, []);

  // Subscribe to attempts realtime so teacher sees new submissions immediately
  useEffect(() => {
    const unsub = examService.subscribeToAttempts(setAttemptsList);
    return () => unsub();
  }, []);

  const handleAssign = async () => {
    if (!selectedExamId || !targetClass.trim()) {
      alert('Vui lòng chọn đề thi và nhập lớp nhận đề!');
      return;
    }
    setIsSending(true);
    const exam = exams.find(e => e.id === selectedExamId);
    if (!exam) { alert('Không tìm thấy đề thi!'); setIsSending(false); return; }
    await assignmentService.assignExam(exam.id, exam.title, teacherName, targetClass.trim(), dueDate || undefined);
    setSuccess(`Đã giao đề "${exam.title}" cho lớp "${targetClass}"!`);
    setSelectedExamId('');
    setTargetClass('');
    setDueDate('');
    setTimeout(() => setSuccess(''), 4000);
    setIsSending(false);
  };

  const handleCommentSaved = () => {
    // Re-fetch attempts
    examService.subscribeToAttempts(newAttempts => {
      setAttemptsList(newAttempts);
    });
  };

  const aiExams = exams.filter(e => e.type !== 'assignment');

  return (
    <div className="space-y-6">
      {/* Assign Form */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
            <Send size={20} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Giao đề thi cho lớp</h2>
            <p className="text-sm text-slate-500">Học sinh sẽ nhận thông báo ngay lập tức trên mọi thiết bị</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Chọn đề thi</label>
            <select
              value={selectedExamId}
              onChange={e => setSelectedExamId(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none bg-white font-medium text-slate-700"
            >
              <option value="">-- Chọn đề --</option>
              {aiExams.map(exam => (
                <option key={exam.id} value={exam.id}>{exam.title} ({exam.questions?.length || 0} câu)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Lớp nhận đề</label>
            <input
              type="text"
              value={targetClass}
              onChange={e => setTargetClass(e.target.value)}
              placeholder='VD: 12A1, 12B2, hoặc "all" để giao tất cả...'
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none font-medium text-slate-700"
            />
            <p className="text-[11px] text-slate-400 mt-1">Tên lớp phải khớp chính xác với lớp học sinh đã đăng ký trong họ sơ</p>
          </div>
          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Hạn nộp bài (tùy chọn)</label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none font-medium text-slate-700"
            />
          </div>
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 font-bold text-sm"
              >
                <CheckCircle2 size={18} /> {success}
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={handleAssign}
            disabled={isSending || !selectedExamId || !targetClass.trim()}
            className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? <><RefreshCw size={18} className="animate-spin" /> Đang gửi...</> : <><Send size={18} /> GIAO ĐỀ CHO LỚP</>}
          </button>
        </div>
      </div>

      {/* Assignment history with roster */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
              <ClipboardList size={18} />
            </div>
            <div>
              <h3 className="font-black text-slate-900">Đề đã giao & Theo dõi học sinh</h3>
              <p className="text-xs text-slate-400">{assignments.length} đề — click để xem ai đã/chưa làm</p>
            </div>
          </div>
        </div>

        {assignments.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList size={36} className="mx-auto text-slate-200 mb-3" />
            <p className="text-slate-400 text-sm">Chưa giao đề nào. Sử dụng form bên trên để giao đề cho học sinh.</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {assignments.map(assignment => (
              <AssignmentRoster
                key={assignment.id}
                assignment={assignment}
                attempts={attemptsList}
                onComment={setCommentingAttempt}
              />
            ))}
          </div>
        )}
      </div>

      {/* Comment Modal */}
      <AnimatePresence>
        {commentingAttempt && (
          <CommentModal
            attempt={commentingAttempt}
            onClose={() => setCommentingAttempt(null)}
            onSaved={handleCommentSaved}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
