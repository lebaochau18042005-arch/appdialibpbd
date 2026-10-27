import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Bell, BookOpen, CheckCircle2, Clock, ArrowLeft, Inbox, RotateCcw, Award, AlertCircle, Sparkles } from 'lucide-react';
import { assignmentService } from '../services/assignmentService';
import { cn } from '../utils/cn';

function getProfile() {
  try { return JSON.parse(localStorage.getItem('examGeoProfile') || '{}'); } catch { return {}; }
}

function getLocalAttempts(): any[] {
  try {
    return JSON.parse(localStorage.getItem('geo_pro_local_attempts') || '[]');
  } catch { return []; }
}

interface AssigmentItem {
  id: string;
  examId: string;
  examTitle: string;
  assignedBy: string;
  targetClass: string;
  dueDate?: string;
  createdAt: string;
  done: boolean;
  shuffleQuestions?: boolean;
  antiCheat?: boolean;
  maxTabSwitches?: number;
  allowRetake?: boolean;
  maxRetakes?: number;
  retakeCondition?: 'always' | 'below_score' | 'has_mistakes';
  retakeThresholdScore?: number;
  gradingPolicy?: 'highest' | 'latest';
  attemptCount: number;
  highestScore: number;
  latestScore: number;
  canRetake: boolean;
  retakeReason?: string;
}

export default function AssignedExamsPage() {
  const [items, setItems] = useState<AssigmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDebug, setShowDebug] = useState(false);
  const [classNameOverride, setClassNameOverride] = useState('');
  const [editingClass, setEditingClass] = useState(false);
  const profile = getProfile();
  const className = (classNameOverride || profile.className || '').trim();
  const studentName = (profile.name || '').trim();
  const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, '');

  useEffect(() => {
    if (!className) { setLoading(false); return; }

    // Use subscribeToStudentAssignments which filters by class AND individual name
    const unsub = assignmentService.subscribeToStudentAssignments(
      className,
      (all) => {
        const localAttempts = getLocalAttempts();

        const parsed: AssigmentItem[] = all.map((e: any) => {
          const userAttempts = localAttempts.filter(
            (a: any) => a.examId === e.examId || a.examId === e.id || (e.id && a.assignmentId === e.id)
          );
          const attemptCount = userAttempts.length;
          const isDone = attemptCount > 0;
          const scores = userAttempts.map((a: any) => a.score).filter((s: any) => typeof s === 'number');
          const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
          const latestScore = userAttempts[0]?.score ?? 0;

          // Retake rules calculation
          const allowRetake = e.allowRetake !== false; // default true
          const maxRetakes = e.maxRetakes ?? 999;
          const retakeCondition = e.retakeCondition ?? 'always';
          const retakeThreshold = e.retakeThresholdScore ?? 5.0;
          const gradingPolicy = e.gradingPolicy ?? 'highest';

          let canRetake = false;
          let retakeReason = '';

          if (!isDone) {
            canRetake = true;
          } else if (!allowRetake) {
            canRetake = false;
            retakeReason = 'Giáo viên không cho phép làm lại đề này.';
          } else if (attemptCount > maxRetakes) {
            canRetake = false;
            retakeReason = `Đã hết số lần làm lại tối đa (${maxRetakes} lần).`;
          } else {
            // Check condition
            if (retakeCondition === 'always') {
              canRetake = true;
              retakeReason = 'Được phép làm lại nhiều lần để ôn tập kiến thức';
            } else if (retakeCondition === 'below_score') {
              const checkScore = gradingPolicy === 'highest' ? highestScore : latestScore;
              if (checkScore < retakeThreshold) {
                canRetake = true;
                retakeReason = `Điểm chưa đạt (${checkScore.toFixed(1)} < ${retakeThreshold.toFixed(1)}đ) - Làm lại để đạt chuẩn`;
              } else {
                canRetake = false;
                retakeReason = `Đã đạt yêu cầu (${checkScore.toFixed(1)} ≥ ${retakeThreshold.toFixed(1)}đ)`;
              }
            } else if (retakeCondition === 'has_mistakes') {
              if (latestScore < 10.0) {
                canRetake = true;
                retakeReason = 'Có câu làm sai ở lần trước - Làm lại để sửa sai & củng cố kiến thức';
              } else {
                canRetake = false;
                retakeReason = 'Đã đạt điểm tối đa 10/10!';
              }
            }
          }

          return {
            id: e.id,
            examId: e.examId || e.id,
            examTitle: e.examTitle || e.title || 'Đề thi',
            assignedBy: e.assignedBy || 'Giáo viên',
            targetClass: e.targetClass,
            dueDate: e.dueDate,
            createdAt: e.createdAt,
            done: isDone,
            shuffleQuestions: e.shuffleQuestions,
            antiCheat: e.antiCheat,
            maxTabSwitches: e.maxTabSwitches,
            allowRetake,
            maxRetakes,
            retakeCondition,
            retakeThresholdScore: retakeThreshold,
            gradingPolicy,
            attemptCount,
            highestScore,
            latestScore,
            canRetake,
            retakeReason,
          };
        });

        // Sort: undone first, then canRetake, then dueDate
        parsed.sort((a, b) => {
          if (a.done !== b.done) return a.done ? 1 : -1;
          if (a.canRetake !== b.canRetake) return a.canRetake ? -1 : 1;
          if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          if (a.dueDate) return -1; if (b.dueDate) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        setItems(parsed);
        setLoading(false);
      },
      studentName
    );

    return () => unsub();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [className, studentName]);

  const undone = items.filter(i => !i.done);
  const done = items.filter(i => i.done);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/" className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <ArrowLeft size={20} className="text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Đề Được Giao</h1>
          <p className="text-sm text-slate-500">Lớp {profile.className || '?'} • {items.length} đề</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Inbox size={48} className="text-slate-200 mb-4" />
          <p className="text-slate-400 font-bold text-lg">Chưa có đề được giao</p>
          <p className="text-slate-300 text-sm mt-1">Giáo viên chưa giao đề cho lớp {className || '?'}</p>
          <Link to="/" className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-colors">
            Về trang chủ
          </Link>

          {/* Diagnostic panel for debugging */}
          <div className="mt-6 w-full max-w-xs">
            <button
              onClick={() => setShowDebug(v => !v)}
              className="text-xs text-slate-400 underline underline-offset-2"
            >
              {showDebug ? 'Ẩn thông tin debug' : '🔍 Kiểm tra thông tin lớp'}
            </button>
            {showDebug && (
              <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-left space-y-3">
                <p className="text-xs font-black text-amber-700 uppercase tracking-wide">Thông tin lớp học</p>
                <div className="space-y-1 text-xs text-slate-600">
                  <p>📋 Tên lớp đã lưu: <strong className="text-indigo-700">"{profile.className || '(trống)'}"</strong></p>
                  <p>🔤 Sau chuẩn hóa: <strong className="text-indigo-700">"{normalize(className)}"</strong></p>
                  <p>👤 Tên HS: <strong>{studentName || '(chưa đặt)'}</strong></p>
                </div>
                <p className="text-[11px] text-amber-600">
                  Nếu tên lớp sai (ví dụ "12D1" thay vì "12 D1"), sửa ở đây:
                </p>
                {editingClass ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      defaultValue={profile.className || ''}
                      id="classfix-input"
                      className="flex-1 px-2 py-1 text-xs border border-amber-300 rounded-lg outline-none focus:ring-1 focus:ring-amber-400"
                      placeholder="VD: 12D1"
                    />
                    <button
                      onClick={() => {
                        const val = (document.getElementById('classfix-input') as HTMLInputElement)?.value;
                        if (val) {
                          const p = getProfile();
                          localStorage.setItem('examGeoProfile', JSON.stringify({ ...p, className: val }));
                          setClassNameOverride(val);
                          setEditingClass(false);
                        }
                      }}
                      className="px-3 py-1 bg-amber-600 text-white rounded-lg text-xs font-bold"
                    >Lưu</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingClass(true)}
                    className="text-xs font-bold text-amber-700 underline"
                  >Sửa tên lớp</button>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Undone */}
          {undone.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Bell size={14} className="text-rose-500" />
                <p className="text-xs font-black text-rose-500 uppercase tracking-wider">Chưa làm ({undone.length})</p>
              </div>
              <div className="space-y-3">
                {undone.map(item => (
                  <Link key={item.id} to={`/exam-room?examId=${item.examId}&assignmentId=${item.id}`}
                    className="flex items-center gap-4 p-4 bg-white border-2 border-rose-100 rounded-2xl hover:border-rose-300 hover:shadow-md transition-all group">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-md shadow-indigo-200">
                      <BookOpen size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-900 text-base leading-snug line-clamp-2">{item.examTitle}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
                        <span>GV: <span className="font-bold">{item.assignedBy}</span></span>
                        <span>• {new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                        {item.shuffleQuestions && (
                          <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold">🔀 Đề xáo trộn</span>
                        )}
                        {item.antiCheat && (
                          <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 rounded text-[10px] font-bold">🛡️ Chống gian lận</span>
                        )}
                      </div>
                      {item.dueDate && (
                        <p className="flex items-center gap-1 text-[11px] text-rose-600 font-bold mt-1">
                          <Clock size={9} /> Hạn nộp: {new Date(item.dueDate).toLocaleString('vi-VN')}
                        </p>
                      )}
                    </div>
                    <span className="px-4 py-2 bg-indigo-600 text-white text-sm font-black rounded-xl shrink-0 group-hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-100">
                      Làm bài
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Done / Retake Section */}
          {done.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <p className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Đã làm &amp; Ôn tập lại ({done.length})
                </p>
              </div>

              <div className="space-y-3">
                {done.map(item => (
                  <div
                    key={item.id}
                    className={cn(
                      'p-4 bg-white rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4',
                      item.canRetake
                        ? 'border-purple-200/80 shadow-xs hover:border-purple-400'
                        : 'border-slate-100 opacity-80'
                    )}
                  >
                    <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                      <div className={cn(
                        'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-black shadow-xs',
                        item.canRetake
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-emerald-100 text-emerald-700'
                      )}>
                        {item.canRetake ? <RotateCcw size={22} /> : <CheckCircle2 size={22} />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-black text-slate-800 text-sm sm:text-base truncate">
                            {item.examTitle}
                          </p>
                          <span className={cn(
                            'px-2 py-0.5 rounded-lg text-xs font-black',
                            item.highestScore >= 8 ? 'bg-emerald-100 text-emerald-800' :
                            item.highestScore >= 5 ? 'bg-amber-100 text-amber-800' :
                            'bg-rose-100 text-rose-800'
                          )}>
                            Điểm cao nhất: {item.highestScore.toFixed(1)}/10
                          </span>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">
                            Đã làm: {item.attemptCount} lượt
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                          <span>GV: <strong>{item.assignedBy}</strong></span>
                          <span>• Giao ngày: {new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                          {item.dueDate && (
                            <span className="text-rose-500 font-bold">• Hạn: {new Date(item.dueDate).toLocaleDateString('vi-VN')}</span>
                          )}
                        </div>

                        {/* Retake feedback / reason badge */}
                        {item.retakeReason && (
                          <div className={cn(
                            'mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border',
                            item.canRetake
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-slate-50 text-slate-500 border-slate-200'
                          )}>
                            {item.canRetake ? <Sparkles size={12} className="text-purple-600 shrink-0" /> : <AlertCircle size={12} className="shrink-0" />}
                            <span>{item.retakeReason}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                      {item.canRetake ? (
                        <Link
                          to={`/exam-room?examId=${item.examId}&assignmentId=${item.id}&retake=true&attemptNumber=${item.attemptCount + 1}`}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-black hover:bg-purple-700 transition-colors shadow-md shadow-purple-100"
                        >
                          <RotateCcw size={13} />
                          Làm lại ôn tập (Lần #{item.attemptCount + 1})
                        </Link>
                      ) : (
                        <span className="px-3.5 py-2 bg-slate-100 text-slate-500 rounded-xl text-xs font-bold">
                          ✓ Đã hoàn thành
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </motion.div>
  );
}
