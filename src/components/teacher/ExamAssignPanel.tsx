import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Calendar, Users, CheckCircle2, XCircle, Clock, RefreshCw, BookOpen, ClipboardList } from 'lucide-react';
import { Exam, ExamAssignment, QuizAttempt } from '../../types';
import { assignmentService } from '../../services/assignmentService';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/cn';

interface Props {
  exams: Exam[];
  attempts: QuizAttempt[];
}

export default function ExamAssignPanel({ exams, attempts }: Props) {
  const { user, profile, isTeacherMode } = useAuth();
  const [assignments, setAssignments] = useState<ExamAssignment[]>([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [targetClass, setTargetClass] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState('');

  const teacherName = profile?.name || user?.displayName || 'Giáo viên';

  useEffect(() => {
    const unsub = assignmentService.subscribeToAssignments((data) => {
      setAssignments(data);
    });
    return () => unsub();
  }, []);

  const handleAssign = async () => {
    if (!selectedExamId || !targetClass.trim()) {
      alert('Vui lòng chọn đề thi và nhập lớp nhận đề!');
      return;
    }
    setIsSending(true);
    try {
      const exam = exams.find(e => e.id === selectedExamId);
      if (!exam) { alert('Không tìm thấy đề thi!'); return; }
      await assignmentService.assignExam(exam.id, exam.title, teacherName, targetClass.trim(), dueDate || undefined);
      setSuccess(`Đã giao đề "${exam.title}" cho lớp "${targetClass}" thành công!`);
      setSelectedExamId('');
      setTargetClass('');
      setDueDate('');
      setTimeout(() => setSuccess(''), 4000);
    } catch (e) {
      alert('Giao đề thất bại: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setIsSending(false);
    }
  };

  // For each assignment, compute completion stats
  const getStats = (assignment: ExamAssignment) => {
    const relatedAttempts = attempts.filter(a => a.examId === assignment.examId);
    const uniqueStudents = new Set(relatedAttempts.map(a => a.userId || a.userName));
    return { done: uniqueStudents.size, attempts: relatedAttempts.length };
  };

  const aiExams = exams.filter(e => e.type === 'ai' && e.questions?.length > 0);

  return (
    <div className="space-y-6">
      {/* Assign New Exam Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
              <Send size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Giao đề thi cho lớp</h2>
              <p className="text-sm text-slate-500">Học sinh sẽ nhận thông báo ngay lập tức</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Exam Selector */}
          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Chọn đề thi</label>
            <select
              value={selectedExamId}
              onChange={e => setSelectedExamId(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none bg-white font-medium text-slate-700"
            >
              <option value="">-- Chọn đề --</option>
              {aiExams.map(exam => (
                <option key={exam.id} value={exam.id}>{exam.title} ({exam.questions.length} câu)</option>
              ))}
              {aiExams.length === 0 && <option disabled>Chưa có đề thi (hãy tạo đề ở tab Ngân hàng đề)</option>}
            </select>
          </div>

          {/* Target Class */}
          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Lớp nhận đề</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={targetClass}
                onChange={e => setTargetClass(e.target.value)}
                placeholder="VD: 12A1, 12B2, hoặc 'all' để giao tất cả..."
                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none font-medium text-slate-700"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Nhập tên lớp (phải khớp với lớp học sinh đã đăng ký trong hồ sơ)</p>
          </div>

          {/* Due Date */}
          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Hạn nộp bài (tùy chọn)</label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none font-medium text-slate-700"
            />
          </div>

          {/* Success */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
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
            {isSending ? <><RefreshCw size={18} className="animate-spin" /> Đang gửi thông báo...</> : <><Send size={18} /> GIAO ĐỀ CHO LỚP</>}
          </button>
        </div>
      </div>

      {/* Assignment History */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
              <ClipboardList size={18} />
            </div>
            <div>
              <h3 className="font-black text-slate-900">Lịch sử giao đề</h3>
              <p className="text-xs text-slate-400">{assignments.length} đề đã giao</p>
            </div>
          </div>
        </div>

        {assignments.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList size={36} className="mx-auto text-slate-200 mb-3" />
            <p className="text-slate-400 text-sm">Chưa giao đề nào. Sử dụng form bên trên để giao đề cho học sinh.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {assignments.map(assignment => {
              const stats = getStats(assignment);
              return (
                <div key={assignment.id} className="p-5 flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                    <BookOpen size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm line-clamp-1">{assignment.examTitle}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                        <Users size={11} /> Lớp: <span className="text-indigo-600">{assignment.targetClass}</span>
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                        <CheckCircle2 size={11} /> {stats.done} học sinh đã làm
                      </span>
                      {assignment.dueDate && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-rose-500">
                          <Clock size={11} /> Hạn: {new Date(assignment.dueDate).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Giao lúc</div>
                    <div className="text-xs font-bold text-slate-600">{new Date(assignment.createdAt).toLocaleDateString('vi-VN')}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
