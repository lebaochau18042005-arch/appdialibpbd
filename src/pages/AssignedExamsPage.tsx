import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Bell, BookOpen, CheckCircle2, Clock, ArrowLeft, Inbox } from 'lucide-react';
import { assignmentService } from '../services/assignmentService';
import { cn } from '../utils/cn';

function getProfile() {
  try { return JSON.parse(localStorage.getItem('examGeoProfile') || '{}'); } catch { return {}; }
}

function getDoneIds(): Set<string> {
  try {
    return new Set(
      JSON.parse(localStorage.getItem('geo_pro_local_attempts') || '[]')
        .map((a: any) => a.examId).filter(Boolean)
    );
  } catch { return new Set(); }
}

interface AssigmentItem {
  id: string; examId: string; examTitle: string;
  assignedBy: string; targetClass: string;
  dueDate?: string; createdAt: string; done: boolean;
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
        const doneIds = getDoneIds();
        const parsed: AssigmentItem[] = all.map((e: any) => ({
          id: e.id,
          examId: e.examId || e.id,
          examTitle: e.examTitle || e.title || 'Đề thi',
          assignedBy: e.assignedBy || 'Giáo viên',
          targetClass: e.targetClass,
          dueDate: e.dueDate,
          createdAt: e.createdAt,
          done: doneIds.has(e.examId || e.id),
        }));
        // Sort: undone first, then by dueDate
        parsed.sort((a, b) => {
          if (a.done !== b.done) return a.done ? 1 : -1;
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
                  <Link key={item.id} to={`/exam-room?examId=${item.examId}`}
                    className="flex items-center gap-4 p-4 bg-white border-2 border-rose-100 rounded-2xl hover:border-rose-300 hover:shadow-md transition-all group">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-md shadow-indigo-200">
                      <BookOpen size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-900 text-base leading-snug line-clamp-2">{item.examTitle}</p>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">Giáo viên: <span className="font-bold">{item.assignedBy}</span> • {new Date(item.createdAt).toLocaleDateString('vi-VN')}</p>
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

          {/* Done */}
          {done.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <p className="text-xs font-black text-emerald-500 uppercase tracking-wider">Đã hoàn thành ({done.length})</p>
              </div>
              <div className="space-y-2">
                {done.map(item => (
                  <div key={item.id} className={cn('flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl opacity-70')}>
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                      <CheckCircle2 size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-600 text-sm line-clamp-1">{item.examTitle}</p>
                      <p className="text-xs text-slate-400">GV: {item.assignedBy}</p>
                    </div>
                    <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-black rounded-xl shrink-0">✓ Đã làm</span>
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
