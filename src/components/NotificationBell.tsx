import React, { useEffect, useState } from 'react';
import { Bell, X, BookOpen, ChevronRight, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { cn } from '../utils/cn';

interface AssignedExam {
  id: string;
  examId: string;
  examTitle: string;
  assignedBy: string;
  targetClass: string;
  dueDate?: string;
  createdAt: string;
  alreadyDone: boolean;
}

function getProfile() {
  try { return JSON.parse(localStorage.getItem('examGeoProfile') || '{}'); } catch { return {}; }
}
function getDoneExamIds(): Set<string> {
  try {
    const a: any[] = JSON.parse(localStorage.getItem('geo_pro_local_attempts') || '[]');
    return new Set(a.map(x => x.examId).filter(Boolean));
  } catch { return new Set(); }
}

export default function NotificationBell() {
  const { user, isTeacherMode } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [assignments, setAssignments] = useState<AssignedExam[]>([]);

  useEffect(() => {
    if (isTeacherMode) return;

    const profile = getProfile();
    const className = (profile.className || '').trim().toLowerCase();
    if (!className) return;

    // Use simple orderBy-only query (no compound where+orderBy → no composite index needed)
    // Filter type/class in JavaScript
    const q = query(collection(db, 'exams'), orderBy('createdAt', 'desc'), limit(100));

    const unsub = onSnapshot(q, (snap) => {
      const doneIds = getDoneExamIds();
      const filtered: AssignedExam[] = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as any))
        .filter((e: any) => {
          if (e.type !== 'assignment') return false;
          const tc = (e.targetClass || '').trim().toLowerCase();
          return tc === className || tc === 'all';
        })
        .map((e: any) => ({
          id: e.id,
          examId: e.examId || e.id,
          examTitle: e.examTitle || e.title || 'Đề thi',
          assignedBy: e.assignedBy || 'Giáo viên',
          targetClass: e.targetClass,
          dueDate: e.dueDate,
          createdAt: e.createdAt,
          alreadyDone: doneIds.has(e.examId || e.id),
        }));

      // Merge localStorage assignments as fallback
      const lsA: any[] = (() => { try { return JSON.parse(localStorage.getItem('geo_pro_assignments') || '[]'); } catch { return []; } })();
      const fsIds = new Set(filtered.map((a: any) => a.id));
      const lsFiltered: AssignedExam[] = lsA
        .filter((a: any) => {
          if (fsIds.has(a.id)) return false;
          const tc = (a.targetClass || '').trim().toLowerCase();
          return tc === className || tc === 'all';
        })
        .map((a: any) => ({ ...a, alreadyDone: getDoneExamIds().has(a.examId) }));

      setAssignments([...filtered, ...lsFiltered]);
    }, () => {
      // Firestore failed → localStorage only
      const cn2 = (getProfile().className || '').trim().toLowerCase();
      const lsA: any[] = (() => { try { return JSON.parse(localStorage.getItem('geo_pro_assignments') || '[]'); } catch { return []; } })();
      const doneIds = getDoneExamIds();
      setAssignments(lsA
        .filter((a: any) => { const tc = (a.targetClass || '').toLowerCase(); return tc === cn2 || tc === 'all'; })
        .map((a: any) => ({ ...a, alreadyDone: doneIds.has(a.examId) }))
      );
    });

    return () => unsub();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTeacherMode]);

  const undone = assignments.filter(a => !a.alreadyDone);

  const handleClick = (a: AssignedExam) => {
    setOpen(false);
    navigate(`/exam-room?examId=${a.examId}`);
  };

  const profile = getProfile();
  if (isTeacherMode || !profile.className) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="relative w-10 h-10 flex items-center justify-center rounded-xl text-emerald-100 hover:bg-emerald-500 transition-colors"
        title="Đề thi được giao"
      >
        <Bell size={20} />
        {undone.length > 0 && (
          <motion.span
            key={undone.length}
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center"
          >
            {undone.length > 9 ? '9+' : undone.length}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              className="absolute right-0 top-12 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2">
                  <Bell size={14} className="text-indigo-600" />
                  <span className="font-black text-sm text-slate-800">ĐỀ THI ĐƯỢC GIAO</span>
                  {undone.length > 0 && (
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-[10px] font-black rounded-full">
                      {undone.length} chưa làm
                    </span>
                  )}
                </div>
                <button onClick={() => setOpen(false)}><X size={14} className="text-slate-400" /></button>
              </div>

              <div className="max-h-96 overflow-y-auto divide-y divide-slate-50">
                {assignments.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell size={28} className="mx-auto text-slate-200 mb-2" />
                    <p className="text-slate-400 text-sm">Chưa có đề thi nào được giao.</p>
                    <p className="text-slate-300 text-xs mt-1">Lớp: {profile.className}</p>
                  </div>
                ) : (
                  assignments.map(a => (
                    <button
                      key={a.id}
                      onClick={() => handleClick(a)}
                      className={cn('w-full text-left px-4 py-3.5 hover:bg-slate-50 transition-colors flex items-start gap-3', !a.alreadyDone && 'bg-indigo-50/60')}
                    >
                      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5', a.alreadyDone ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-600 text-white')}>
                        <BookOpen size={15} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={cn('text-[10px] font-black uppercase tracking-wider', a.alreadyDone ? 'text-emerald-500' : 'text-rose-500')}>
                            {a.alreadyDone ? '✓ Đã làm' : '● Chưa làm'}
                          </span>
                        </div>
                        <p className="font-bold text-sm text-slate-800 line-clamp-2">{a.examTitle}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">GV: {a.assignedBy}</p>
                        {a.dueDate && (
                          <p className="text-[10px] text-rose-500 font-bold mt-0.5 flex items-center gap-1">
                            <AlertCircle size={9} /> Hạn: {new Date(a.dueDate).toLocaleDateString('vi-VN')}
                          </p>
                        )}
                      </div>
                      {!a.alreadyDone && <ChevronRight size={14} className="text-indigo-400 shrink-0 mt-1" />}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
