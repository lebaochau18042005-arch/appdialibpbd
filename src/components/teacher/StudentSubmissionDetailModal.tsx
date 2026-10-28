import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, CheckCircle2, XCircle, AlertTriangle, Clock, Calendar,
  Award, BookOpen, Filter, Printer, MessageSquare, Save, RefreshCw,
  HelpCircle, ChevronRight, Sparkles, Check, ChevronDown, Eye
} from 'lucide-react';
import { QuizAttempt, Exam, Question, MultipleChoiceQuestion, TrueFalseQuestion, ShortAnswerQuestion } from '../../types';
import { questions as standardQuestions } from '../../data';
import { cn } from '../../utils/cn';
import RichContent from '../exam/RichContent';
import DataTableChart from '../exam/DataTableChart';
import { isShortAnswerCorrect, normalizeShortAnswer } from '../../utils/scoreUtils';

interface StudentSubmissionDetailModalProps {
  attempt: QuizAttempt | null;
  exams?: Exam[];
  onClose: () => void;
  onSaveComment?: (attemptId: string, comment: string, progress: string) => Promise<void>;
}

export default function StudentSubmissionDetailModal({
  attempt,
  exams = [],
  onClose,
  onSaveComment,
}: StudentSubmissionDetailModalProps) {
  const [filterResult, setFilterResult] = useState<'all' | 'correct' | 'wrong'>('all');
  const [filterType, setFilterType] = useState<'all' | 'multiple_choice' | 'true_false' | 'short_answer'>('all');
  const [commentText, setCommentText] = useState(attempt?.teacherComment || '');
  const [progressText, setProgressText] = useState(attempt?.studentProgress || '');
  const [isSavingComment, setIsSavingComment] = useState(false);
  const [commentSavedToast, setCommentSavedToast] = useState(false);

  // Sync comment state when attempt changes
  React.useEffect(() => {
    if (attempt) {
      setCommentText(attempt.teacherComment || '');
      setProgressText(attempt.studentProgress || '');
    }
  }, [attempt]);

  // Safely parse raw answers
  const rawAnswers = useMemo(() => {
    try {
      if (!attempt?.answers) return {};
      if (typeof attempt.answers === 'string') {
        return JSON.parse(attempt.answers);
      }
      return attempt.answers;
    } catch {
      return {};
    }
  }, [attempt?.answers]);

  // Resolve questions for this attempt with multi-layer fallback
  const resolvedQuestions: Question[] = useMemo(() => {
    if (!attempt) return [];

    // 1. Snapshot stored with the attempt (most accurate)
    if (attempt.questionsSnapshot && Array.isArray(attempt.questionsSnapshot) && attempt.questionsSnapshot.length > 0) {
      return attempt.questionsSnapshot;
    }

    // 2. Exam found from teacher exams list
    if (exams.length > 0) {
      const matchExam = exams.find(e =>
        e.id === attempt.examId ||
        (e.title && attempt.examTitle && e.title.trim().toLowerCase() === attempt.examTitle.trim().toLowerCase())
      );
      if (matchExam?.questions?.length) {
        return matchExam.questions;
      }
    }

    // 3. Exam found from localStorage
    try {
      const localExams: Exam[] = JSON.parse(localStorage.getItem('geo_pro_local_exams') || '[]');
      const match = localExams.find(e =>
        e.id === attempt.examId ||
        (e.title && attempt.examTitle && e.title.trim().toLowerCase() === attempt.examTitle.trim().toLowerCase())
      );
      if (match?.questions?.length) return match.questions;
    } catch { }

    // 4. Match questions from standard textbook question bank (e.g. for "bai-2-dia-li-12", "bai-1", lesson quizzes)
    if (rawAnswers && typeof rawAnswers === 'object') {
      const answerKeys = Object.keys(rawAnswers);
      const matchedFromBank = standardQuestions.filter(q => answerKeys.includes(q.id));
      if (matchedFromBank.length > 0) {
        // Return in same order as answers
        return answerKeys.map(k => matchedFromBank.find(q => q.id === k)).filter(Boolean) as Question[];
      }
    }

    // 5. Match by lesson name or slug in attempt.examTitle or examId (e.g. "bai-2-dia-li-12")
    const titleOrId = ((attempt.examTitle || '') + ' ' + (attempt.examId || '')).toLowerCase();
    const lessonMatch = standardQuestions.filter(q => {
      if (q.lesson && titleOrId.includes(q.lesson.toLowerCase())) return true;
      if (titleOrId.includes('bai-2') && (q.lesson?.toLowerCase().includes('vị trí') || q.topic?.toLowerCase().includes('tự nhiên'))) return true;
      return false;
    });
    if (lessonMatch.length > 0 && Object.keys(rawAnswers).length > 0) {
      return lessonMatch.slice(0, Object.keys(rawAnswers).length || 20);
    }

    // 6. Synthesize question items from attempt.answers so teacher can always review every answer!
    if (rawAnswers && typeof rawAnswers === 'object' && Object.keys(rawAnswers).length > 0) {
      return Object.entries(rawAnswers).map(([key, val], idx) => {
        const itemVal: any = val || {};
        return {
          id: key,
          type: itemVal.questionType || (typeof itemVal.userAnswer === 'object' && itemVal.userAnswer !== null ? 'true_false' : typeof itemVal.userAnswer === 'string' ? 'short_answer' : 'multiple_choice'),
          text: itemVal.questionText || `Câu ${idx + 1}: ${itemVal.topic ? `Chủ đề ${itemVal.topic}` : 'Câu hỏi kiểm tra'}`,
          topic: itemVal.topic || 'Địa lí',
          options: itemVal.options || ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'],
          correctAnswerIndex: itemVal.correctAnswerIndex ?? 0,
          explanation: itemVal.explanation || '',
        } as Question;
      });
    }

    return [];
  }, [attempt, exams, rawAnswers]);

  // Helper to extract student's answer for question index or id with type safety
  const getStudentAnswer = (q: Question, idx: number) => {
    // 1. Direct match by index from answersByIndex if present
    if (attempt?.answersByIndex && attempt.answersByIndex[idx] !== undefined) {
      return attempt.answersByIndex[idx];
    }

    // 2. Direct match by string index (e.g. "0", "1", "2"...)
    const byIndex = rawAnswers[String(idx)] ?? rawAnswers[idx];
    if (byIndex !== undefined) {
      if (byIndex && typeof byIndex === 'object' && 'userAnswer' in byIndex) {
        return byIndex.userAnswer;
      }
      return byIndex;
    }

    // 3. Match by q.id with strict question-type validation to prevent cross-part collisions
    if (q.id && rawAnswers[q.id] !== undefined) {
      const item = rawAnswers[q.id];
      const val = (item && typeof item === 'object' && 'userAnswer' in item) ? item.userAnswer : item;

      if (q.type === 'multiple_choice') {
        if (typeof val === 'number' || (typeof val === 'string' && /^[0-3]$/.test(val))) {
          return typeof val === 'number' ? val : parseInt(val, 10);
        }
      } else if (q.type === 'true_false') {
        if (val && typeof val === 'object' && !Array.isArray(val)) {
          return val;
        }
      } else if (q.type === 'short_answer') {
        if (typeof val === 'string' || typeof val === 'number') {
          return val;
        }
      }
    }

    return undefined;
  };

  // Helper to check question correctness and calculate points
  const getQuestionResult = (q: Question, idx: number) => {
    const studentAns = getStudentAnswer(q, idx);

    // Look for precomputed item with type compatibility check
    const richItem = (rawAnswers[String(idx)] ?? rawAnswers[idx]) ?? (q.id ? rawAnswers[q.id] : undefined);
    let precomputedIsCorrect: boolean | null = null;
    let precomputedEarnedPoints: number | null = null;

    if (richItem && typeof richItem === 'object') {
      if (studentAns !== undefined && 'isCorrect' in richItem) {
        precomputedIsCorrect = Boolean(richItem.isCorrect);
      }
      if ('earnedPoints' in richItem && typeof richItem.earnedPoints === 'number') {
        precomputedEarnedPoints = richItem.earnedPoints;
      }
    }

    if (q.type === 'multiple_choice') {
      const mc = q as MultipleChoiceQuestion;
      const isCorrect = precomputedIsCorrect !== null
        ? precomputedIsCorrect
        : (studentAns !== undefined && studentAns === mc.correctAnswerIndex);
      return {
        isCorrect,
        earnedPoints: precomputedEarnedPoints ?? (isCorrect ? 0.25 : 0),
        maxPoints: 0.25,
        studentAns,
        correctCount: isCorrect ? 1 : 0,
        totalParts: 1
      };
    }

    if (q.type === 'true_false') {
      const tf = q as TrueFalseQuestion;
      let correctParts = 0;
      const stmts = Array.isArray(tf.statements) ? tf.statements : [];
      const statementDetails = stmts.map(stmt => {
        const userChoice = (studentAns && typeof studentAns === 'object') ? studentAns[stmt.id] : undefined;
        const isStatementCorrect = userChoice !== undefined && userChoice === stmt.isTrue;
        if (isStatementCorrect) correctParts++;
        return {
          id: stmt.id,
          text: stmt.text,
          expected: stmt.isTrue,
          userChoice,
          isStatementCorrect,
        };
      });

      let earnedPoints = 0;
      if (correctParts === 1) earnedPoints = 0.1;
      else if (correctParts === 2) earnedPoints = 0.25;
      else if (correctParts === 3) earnedPoints = 0.5;
      else if (correctParts === 4) earnedPoints = 1.0;

      if (precomputedEarnedPoints !== null) {
        earnedPoints = precomputedEarnedPoints;
      }

      const isFullyCorrect = precomputedIsCorrect !== null
        ? precomputedIsCorrect
        : (correctParts === (stmts.length || 4) && studentAns !== undefined);

      return {
        isCorrect: isFullyCorrect,
        isPartiallyCorrect: correctParts > 0 && !isFullyCorrect,
        earnedPoints,
        maxPoints: 1.0,
        studentAns,
        correctCount: correctParts,
        totalParts: stmts.length || 4,
        statementDetails,
      };
    }

    if (q.type === 'short_answer') {
      const sa = q as ShortAnswerQuestion;
      const isCorrect = precomputedIsCorrect !== null
        ? precomputedIsCorrect
        : (studentAns !== undefined && studentAns !== null && studentAns !== '' ? isShortAnswerCorrect(String(studentAns), sa.correctAnswer) : false);
      return {
        isCorrect,
        earnedPoints: precomputedEarnedPoints ?? (isCorrect ? 0.25 : 0),
        maxPoints: 0.25,
        studentAns,
        correctCount: isCorrect ? 1 : 0,
        totalParts: 1
      };
    }

    const fallbackCorrect = Boolean(precomputedIsCorrect);
    return {
      isCorrect: fallbackCorrect,
      earnedPoints: fallbackCorrect ? 0.25 : 0,
      maxPoints: 0.25,
      studentAns,
      correctCount: fallbackCorrect ? 1 : 0,
      totalParts: 1
    };
  };

  // Compile evaluation for all questions
  const evaluatedQuestions = useMemo(() => {
    return resolvedQuestions.map((q, idx) => ({
      question: q,
      index: idx,
      ...getQuestionResult(q, idx),
    }));
  }, [resolvedQuestions, rawAnswers]);

  // Overall statistics
  const stats = useMemo(() => {
    const total = evaluatedQuestions.length;
    const fullyCorrect = evaluatedQuestions.filter(e => e.isCorrect).length;
    const partiallyCorrect = evaluatedQuestions.filter(e => (e as any).isPartiallyCorrect).length;
    const wrong = total - fullyCorrect - partiallyCorrect;

    // Breakdown by type
    const mcList = evaluatedQuestions.filter(e => e.question.type === 'multiple_choice');
    const tfList = evaluatedQuestions.filter(e => e.question.type === 'true_false');
    const saList = evaluatedQuestions.filter(e => e.question.type === 'short_answer');

    const mcCorrect = mcList.filter(e => e.isCorrect).length;
    const mcEarned = mcList.reduce((acc, cur) => acc + cur.earnedPoints, 0);

    const tfEarned = tfList.reduce((acc, cur) => acc + cur.earnedPoints, 0);
    const tfMax = tfList.length * 1.0;

    const saCorrect = saList.filter(e => e.isCorrect).length;
    const saEarned = saList.reduce((acc, cur) => acc + cur.earnedPoints, 0);

    const calculatedTotal = Number((mcEarned + tfEarned + saEarned).toFixed(2));
    const recordedScore = Number((attempt?.score ?? 0).toFixed(2));
    const hasDiscrepancy = Math.abs(calculatedTotal - recordedScore) > 0.05;

    return {
      total,
      fullyCorrect,
      partiallyCorrect,
      wrong,
      mcTotal: mcList.length,
      mcCorrect,
      mcEarned,
      tfTotal: tfList.length,
      tfEarned,
      tfMax,
      saTotal: saList.length,
      saCorrect,
      saEarned,
      calculatedTotal,
      recordedScore,
      hasDiscrepancy,
    };
  }, [evaluatedQuestions, attempt?.score]);

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    return evaluatedQuestions.filter(item => {
      // Filter by result
      if (filterResult === 'correct' && !item.isCorrect) return false;
      if (filterResult === 'wrong' && item.isCorrect) return false;

      // Filter by type
      if (filterType !== 'all' && item.question.type !== filterType) return false;

      return true;
    });
  }, [evaluatedQuestions, filterResult, filterType]);

  const handleSaveCommentClick = async () => {
    if (!onSaveComment || !commentText.trim()) return;
    setIsSavingComment(true);
    try {
      await onSaveComment(attempt?.id || '', commentText, progressText);
      setCommentSavedToast(true);
      setTimeout(() => setCommentSavedToast(false), 3000);
    } finally {
      setIsSavingComment(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const scrollToQuestion = (idx: number) => {
    const el = document.getElementById(`sub-q-${idx}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const formatTime = (seconds: number) => {
    const s = Number(seconds) || 0;
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m} phút ${sec} giây`;
  };

  const formattedDate = useMemo(() => {
    try {
      if (!attempt?.date) return '—';
      const d = new Date(attempt.date);
      return isNaN(d.getTime()) ? String(attempt.date) : d.toLocaleString('vi-VN');
    } catch {
      return '—';
    }
  }, [attempt?.date]);

  // Performance classification
  const getRating = (score: number) => {
    if (score >= 9.0) return { label: 'Xuất sắc', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    if (score >= 8.0) return { label: 'Giỏi', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' };
    if (score >= 6.5) return { label: 'Khá', color: 'bg-blue-100 text-blue-800 border-blue-300' };
    if (score >= 5.0) return { label: 'Trung bình', color: 'bg-amber-100 text-amber-800 border-amber-300' };
    return { label: 'Chưa đạt / Cần ôn luyện', color: 'bg-rose-100 text-rose-800 border-rose-300' };
  };

  if (!attempt) return null;

  const rating = getRating(attempt.score ?? 0);

  // Render via React Portal to document.body to break out of any overflow-hidden containers
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-md cursor-pointer transition-opacity"
        onClick={onClose}
      />

      {/* Main Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative bg-white w-full max-w-5xl h-[92vh] max-h-[95vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-100 z-10"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between gap-4 shrink-0 shadow-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/30 border border-indigo-400/30 flex items-center justify-center text-xl font-black text-indigo-300 shrink-0">
              {(attempt.userName || 'H').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg md:text-xl font-black text-white truncate">
                  {attempt.userName || 'Học sinh ẩn danh'}
                </h2>
                {attempt.className && (
                  <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                    Lớp {attempt.className}
                  </span>
                )}
                {attempt.attemptNumber && attempt.attemptNumber > 1 && (
                  <span className="px-2 py-0.5 rounded-lg text-xs font-black bg-amber-500/30 text-amber-300 border border-amber-400/30">
                    Lần làm bài #{attempt.attemptNumber}
                  </span>
                )}
              </div>
              <p className="text-xs text-indigo-200/80 line-clamp-1 mt-0.5">
                Bài kiểm tra: <span className="font-bold text-white">{attempt.examTitle}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              title="In bài thi"
            >
              <Printer size={15} />
              <span>In bài</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-300 hover:text-white cursor-pointer"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Sub-Header: Score & Key Stats Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">Tổng điểm:</span>
              <span className="text-xl md:text-2xl font-black text-indigo-700 tracking-tight">
                {(attempt.score ?? 0).toFixed(2)}
                <span className="text-xs text-slate-400 font-bold ml-1">/ 10.0</span>
              </span>
              <span className={cn('px-2.5 py-1 rounded-full text-[11px] font-black border', rating.color)}>
                {rating.label}
              </span>
            </div>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-3 text-slate-600 font-medium text-xs">
              <span className="flex items-center gap-1">
                <Calendar size={13} className="text-slate-400" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={13} className="text-slate-400" />
                {formatTime(attempt.timeSpent || 0)}
              </span>
            </div>
          </div>

          {/* Anti-cheat status */}
          <div className="flex items-center gap-2">
            {attempt.tabSwitches !== undefined && attempt.tabSwitches > 0 ? (
              <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-black flex items-center gap-1.5 animate-pulse">
                <AlertTriangle size={13} className="text-rose-600" />
                Rời màn hình: {attempt.tabSwitches} lần
              </span>
            ) : (
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-600" />
                Thi nghiêm túc (Không rời tab)
              </span>
            )}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Discrepancy Notice for legacy attempts */}
          {stats.hasDiscrepancy && (
            <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-2xl flex items-start gap-3.5 text-xs text-amber-950 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <AlertTriangle size={18} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-amber-950 text-sm">
                    Lưu ý về dữ liệu điểm:
                  </span>
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 font-black rounded-lg text-xs">
                    Điểm chính thức: {stats.recordedScore.toFixed(2)}đ
                  </span>
                  <span className="px-2 py-0.5 bg-amber-200/80 text-amber-900 font-bold rounded-lg text-xs">
                    Điểm chi tiết: {stats.calculatedTotal.toFixed(2)}đ
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed text-xs">
                  Điểm số <strong>{stats.recordedScore.toFixed(2)}/10.0</strong> hiển thị ở tiêu đề là điểm số chính thức được hệ thống chấm tự động và ghi nhận khi học sinh nộp bài. Trong phiên bản đề thi trước, các câu hỏi giữa các phần có mã định danh (id) trùng nhau nên một số câu chưa được hiển thị đầy đủ đáp án gốc bên dưới ({stats.calculatedTotal.toFixed(2)}đ). Hệ thống đã được nâng cấp lưu mã độc lập cho từng câu đối với toàn bộ bài làm từ nay về sau.
                </p>
              </div>
            </div>
          )}

          {/* 3-Section Score Summary Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Phần I */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black text-indigo-500 uppercase tracking-wider">Phần I: Trắc nghiệm</p>
                <p className="text-lg font-black text-indigo-900 mt-0.5">
                  {stats.mcEarned.toFixed(2)}đ <span className="text-xs text-indigo-400 font-bold">({stats.mcCorrect}/{stats.mcTotal} câu đúng)</span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm">
                I
              </div>
            </div>

            {/* Phần II */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black text-amber-600 uppercase tracking-wider">Phần II: Đúng / Sai</p>
                <p className="text-lg font-black text-amber-900 mt-0.5">
                  {stats.tfEarned.toFixed(2)}đ <span className="text-xs text-amber-500 font-bold">/ {stats.tfMax.toFixed(1)}đ ({stats.tfTotal} câu)</span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black text-sm">
                II
              </div>
            </div>

            {/* Phần III */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black text-emerald-600 uppercase tracking-wider">Phần III: Trả lời ngắn</p>
                <p className="text-lg font-black text-emerald-900 mt-0.5">
                  {stats.saEarned.toFixed(2)}đ <span className="text-xs text-emerald-500 font-bold">({stats.saCorrect}/{stats.saTotal} câu đúng)</span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
                III
              </div>
            </div>
          </div>

          {/* Question Navigation Map & Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Bản đồ câu hỏi:</span>
                <span className="text-xs text-slate-400">({evaluatedQuestions.length} câu)</span>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="inline-flex rounded-xl bg-slate-100 p-0.5 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setFilterResult('all')}
                    className={cn('px-2.5 py-1 rounded-lg transition-colors cursor-pointer', filterResult === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900')}
                  >
                    Tất cả ({evaluatedQuestions.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterResult('wrong')}
                    className={cn('px-2.5 py-1 rounded-lg transition-colors cursor-pointer', filterResult === 'wrong' ? 'bg-rose-600 text-white shadow-2xs' : 'text-rose-600 hover:text-rose-700')}
                  >
                    Câu sai ({stats.wrong + stats.partiallyCorrect})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterResult('correct')}
                    className={cn('px-2.5 py-1 rounded-lg transition-colors cursor-pointer', filterResult === 'correct' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-emerald-700 hover:text-emerald-800')}
                  >
                    Câu đúng ({stats.fullyCorrect})
                  </button>
                </div>

                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value as any)}
                  className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="all">Tất cả dạng thức</option>
                  <option value="multiple_choice">Phần I (Trắc nghiệm)</option>
                  <option value="true_false">Phần II (Đúng/Sai)</option>
                  <option value="short_answer">Phần III (Trả lời ngắn)</option>
                </select>
              </div>
            </div>

            {/* Navigation Grid Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {evaluatedQuestions.map((item, i) => {
                const isPartially = (item as any).isPartiallyCorrect;
                const isDone = item.studentAns !== undefined && item.studentAns !== null && item.studentAns !== '';

                return (
                  <button
                    type="button"
                    key={i}
                    onClick={() => scrollToQuestion(i)}
                    className={cn(
                      'w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-black flex items-center justify-center border transition-transform hover:scale-105 cursor-pointer',
                      item.isCorrect
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                        : isPartially
                          ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                          : !isDone
                            ? 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
                            : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                    )}
                    title={`Câu ${i + 1}: ${item.isCorrect ? 'Đúng' : isPartially ? 'Đúng một phần' : 'Sai'} (+${item.earnedPoints}đ)`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Question Review List */}
          {resolvedQuestions.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 rounded-3xl border border-slate-200">
              <HelpCircle size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-600 font-bold text-base">Không tìm thấy nội dung câu hỏi gốc của đề thi này.</p>
              <p className="text-slate-400 text-xs mt-1">Đề thi có thể đã bị xóa hoặc được sinh ngẫu nhiên mà chưa tạo bản snapshot.</p>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-3xl border border-slate-200">
              <p className="text-slate-500 font-bold text-sm">Không có câu hỏi nào khớp với bộ lọc hiện tại.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredQuestions.map((item) => {
                const q = item.question;
                const idx = item.index;
                const isPartially = (item as any).isPartiallyCorrect;
                const isDone = item.studentAns !== undefined && item.studentAns !== null && item.studentAns !== '';

                return (
                  <div
                    key={q.id || idx}
                    id={`sub-q-${idx}`}
                    className={cn(
                      'bg-white rounded-3xl border-2 overflow-hidden shadow-xs transition-all',
                      item.isCorrect
                        ? 'border-emerald-200'
                        : isPartially
                          ? 'border-amber-200'
                          : !isDone
                            ? 'border-slate-200'
                            : 'border-rose-200'
                    )}
                  >
                    {/* Question Card Header */}
                    <div className={cn(
                      'px-5 py-3.5 border-b flex items-center justify-between flex-wrap gap-2',
                      item.isCorrect
                        ? 'bg-emerald-50/70 border-emerald-100'
                        : isPartially
                          ? 'bg-amber-50/70 border-amber-100'
                          : !isDone
                            ? 'bg-slate-50 border-slate-200'
                            : 'bg-rose-50/70 border-rose-100'
                    )}>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs text-white shadow-xs',
                          item.isCorrect ? 'bg-emerald-600' : isPartially ? 'bg-amber-500' : !isDone ? 'bg-slate-400' : 'bg-rose-600'
                        )}>
                          {idx + 1}
                        </span>
                        <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                          {q.type === 'multiple_choice' ? 'Phần I — Trắc nghiệm' : q.type === 'true_false' ? 'Phần II — Đúng/Sai' : 'Phần III — Trả lời ngắn'}
                        </span>
                        {q.topic && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white text-slate-600 border border-slate-200">
                            {q.topic}
                          </span>
                        )}
                        {q.cognitiveLevel && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {q.cognitiveLevel}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'px-2.5 py-1 rounded-full text-xs font-black border flex items-center gap-1',
                          item.isCorrect
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : isPartially
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : !isDone
                                ? 'bg-slate-100 text-slate-600 border-slate-300'
                                : 'bg-rose-100 text-rose-800 border-rose-300'
                        )}>
                          {item.isCorrect ? (
                            <><CheckCircle2 size={13} className="text-emerald-600" /> Đúng (+{item.earnedPoints}đ)</>
                          ) : isPartially ? (
                            <><CheckCircle2 size={13} className="text-amber-600" /> Đúng {item.correctCount}/{item.totalParts} ý (+{item.earnedPoints}đ)</>
                          ) : !isDone ? (
                            <><HelpCircle size={13} className="text-slate-500" /> Chưa lưu chi tiết</>
                          ) : (
                            <><XCircle size={13} className="text-rose-600" /> Sai (0.0đ)</>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Question Content */}
                    <div className="p-5 sm:p-6 space-y-4">
                      {/* Question Text */}
                      <div className="text-slate-800 font-bold text-sm sm:text-base leading-relaxed">
                        <RichContent content={q.text || ''} />
                      </div>

                      {/* Image / Diagram if present */}
                      {q.imageUrl && (
                        <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center p-2 max-h-80">
                          <img src={q.imageUrl} alt="Minh họa" className="max-w-full max-h-72 object-contain rounded-xl" />
                        </div>
                      )}

                      {/* Context / Data Table */}
                      {q.context && (
                        <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1.5">📊 Bảng số liệu / Tư liệu:</p>
                          <DataTableChart content={q.context} />
                        </div>
                      )}

                      {/* Answer Section */}
                      <div className="pt-2">
                        {/* 1. Multiple Choice Options */}
                        {q.type === 'multiple_choice' && (
                          <div className="space-y-2.5">
                            {((q as MultipleChoiceQuestion).options || []).map((opt, oIdx) => {
                              const isStudentSelected = item.studentAns === oIdx;
                              const isCorrectAnswer = (q as MultipleChoiceQuestion).correctAnswerIndex === oIdx;

                              let cardStyle = 'border-slate-100 bg-slate-50/50 text-slate-700';
                              if (isCorrectAnswer) {
                                cardStyle = 'border-emerald-300 bg-emerald-50/80 text-emerald-900 ring-2 ring-emerald-200';
                              } else if (isStudentSelected && !isCorrectAnswer) {
                                cardStyle = 'border-rose-300 bg-rose-50/80 text-rose-900 ring-2 ring-rose-200';
                              }

                              return (
                                <div
                                  key={oIdx}
                                  className={cn('p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-sm font-medium transition-all', cardStyle)}
                                >
                                  <div className="flex items-center gap-3">
                                    <span className={cn(
                                      'w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0',
                                      isCorrectAnswer
                                        ? 'bg-emerald-600 text-white'
                                        : isStudentSelected
                                          ? 'bg-rose-600 text-white'
                                          : 'bg-slate-200 text-slate-600'
                                    )}>
                                      {String.fromCharCode(65 + oIdx)}
                                    </span>
                                    <span>{opt}</span>
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {isStudentSelected && (
                                      <span className={cn(
                                        'px-2 py-0.5 rounded-md text-[10px] font-black',
                                        isCorrectAnswer ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
                                      )}>
                                        Học sinh chọn
                                      </span>
                                    )}
                                    {isCorrectAnswer && (
                                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-600 text-white flex items-center gap-1">
                                        <Check size={11} /> Đáp án đúng
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* 2. True / False Statements */}
                        {q.type === 'true_false' && (
                          <div className="space-y-2">
                            <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                              <span>Bảng kiểm tra 4 ý (a, b, c, d)</span>
                              <span>Thang điểm: 1 ý=0.1đ | 2 ý=0.25đ | 3 ý=0.5đ | 4 ý=1.0đ</span>
                            </div>

                            {((item as any).statementDetails || []).map((stmt: any, sIdx: number) => {
                              const label = ['a', 'b', 'c', 'd'][sIdx] || String(sIdx + 1);
                              return (
                                <div
                                  key={stmt.id}
                                  className={cn(
                                    'p-3.5 rounded-2xl border flex items-start justify-between gap-3 text-sm',
                                    stmt.isStatementCorrect
                                      ? 'border-emerald-200 bg-emerald-50/40'
                                      : 'border-rose-200 bg-rose-50/40'
                                  )}
                                >
                                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                    <span className={cn(
                                      'w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0 mt-0.5',
                                      stmt.isStatementCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                                    )}>
                                      {label}
                                    </span>
                                    <p className="text-slate-800 leading-relaxed font-medium">{stmt.text}</p>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <div className="text-right text-xs">
                                      <div className="font-bold">
                                        HS: <span className={cn('font-black uppercase', stmt.userChoice === true ? 'text-indigo-600' : stmt.userChoice === false ? 'text-slate-600' : 'text-slate-400 italic')}>
                                          {stmt.userChoice === true ? 'Đúng' : stmt.userChoice === false ? 'Sai' : 'Chưa chọn'}
                                        </span>
                                      </div>
                                      <div className="text-[10px] text-slate-400 font-bold">
                                        Đáp án: <span className="text-emerald-700 font-black">{stmt.expected ? 'Đúng' : 'Sai'}</span>
                                      </div>
                                    </div>
                                    <div className="w-6 h-6 flex items-center justify-center">
                                      {stmt.isStatementCorrect ? (
                                        <CheckCircle2 size={18} className="text-emerald-600" />
                                      ) : (
                                        <XCircle size={18} className="text-rose-600" />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* 3. Short Answer */}
                        {q.type === 'short_answer' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className={cn(
                              'p-4 rounded-2xl border',
                              item.isCorrect ? 'border-emerald-200 bg-emerald-50/60' : 'border-rose-200 bg-rose-50/60'
                            )}>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Câu trả lời của học sinh:
                              </p>
                              <p className={cn('text-lg font-black', item.isCorrect ? 'text-emerald-700' : 'text-rose-700')}>
                                {item.studentAns !== undefined && item.studentAns !== null && item.studentAns !== ''
                                  ? String(item.studentAns)
                                  : <span className="italic text-slate-400 font-normal text-sm">(Học sinh bỏ trống / Chưa điền)</span>}
                              </p>
                            </div>

                            <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/60">
                              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
                                Đáp án chính xác:
                              </p>
                              <p className="text-lg font-black text-emerald-800">
                                {(q as ShortAnswerQuestion).correctAnswer}
                                {(q as ShortAnswerQuestion).unit ? ` ${(q as ShortAnswerQuestion).unit}` : ''}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Explanation Section */}
                      {q.explanation && (
                        <div className="mt-3 p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-xs">
                          <h4 className="flex items-center gap-1.5 font-black text-indigo-700 uppercase tracking-wider mb-1.5">
                            <Sparkles size={13} className="text-indigo-600" /> Hướng dẫn giải chi tiết
                          </h4>
                          <p className="text-slate-700 leading-relaxed font-medium">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Teacher Feedback Section inside Modal */}
          {onSaveComment && (
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-sm font-black text-slate-800">
                <MessageSquare size={16} className="text-indigo-600" />
                <span>Nhận xét và lời phê của giáo viên cho bài thi này</span>
              </div>
              <textarea
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Nhập nhận xét chi tiết (khen ngợi, nhắc nhở phần kiến thức còn yếu, dặn dò ôn tập lại)..."
                rows={3}
                className="w-full p-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-indigo-800 focus:ring-2 focus:ring-indigo-400 outline-none resize-none"
              />
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <input
                  value={progressText}
                  onChange={e => setProgressText(e.target.value)}
                  placeholder="Đánh giá tiến độ (VD: Xuất sắc, Tiến bộ rõ rệt, Cần cố gắng...)"
                  className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-indigo-800 focus:ring-2 focus:ring-indigo-400 outline-none flex-1"
                />
                <button
                  type="button"
                  onClick={handleSaveCommentClick}
                  disabled={isSavingComment || !commentText.trim()}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-100 disabled:opacity-50 cursor-pointer"
                >
                  {isSavingComment ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
                  Lưu nhận xét
                </button>
              </div>
              {commentSavedToast && (
                <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={13} /> Đã lưu nhận xét thành công!
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-slate-400 font-medium">
            Học sinh: <strong className="text-slate-700">{attempt.userName}</strong> • Đề: <strong className="text-slate-700">{attempt.examTitle}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
