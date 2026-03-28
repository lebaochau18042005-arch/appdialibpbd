import React, { useEffect, useState } from 'react';
import { Bell, X, BookOpen, ChevronRight, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { assignmentService } from '../services/assignmentService';
import { cn } from '../utils/cn';
import { Exam } from '../types';

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

export default function NotificationBell() {
  const { user, isTeacherMode } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [assignments, setAssignments] = useState<AssignedExam[]>([]);

  // Get student's className and userId
  const getProfile = () => {
    try {
      return JSON.parse(localStorage.getItem('examGeoProfile') || '{}');
    } catch { return {}; }
  };

  const getUserId = () => {
    if (user?.uid) return user.uid;
    const p = getProfile();
    return p.uid || p.guestId || null;
  };

  useEffect(() => {
    // Teachers don't need assignment notifications
    if (isTeacherMode) return;

    const profile = getProfile();
    const className = profile.className || '';
    if (!className) return;

    // Get attempts done by this user to compute "already done"
    const userId = getUserId();
    const lsAttempts = (() => {
      try { return JSON.parse(localStorage.getItem('geo_pro_local_attempts') || '[]'); } catch { return []; }
    })();
    const doneExamIds = new Set<string>(lsAttempts.map((a: any) => a.examId));

    // Subscribe to Firestore exams with type='assignment' for this class or 'all'
    // Uses simple orderBy (no compound where+orderBy = no index needed)
    const q = query(
      collection(db, 'exams'),
      where('type', '==', 'assignment'),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const all: AssignedExam[] = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as Exam & { examId: string; examTitle: string; assignedBy: string; targetClass: string; dueDate?: string; createdAt: string }))
        .filter(e => e.targetClass === className || e.targetClass === 'all')
        .map(e => ({
          id: e.id,
          examId: e.examId || e.id,
          examTitle: e.examTitle || e.title,
          assignedBy: e.assignedBy || 'Giáo viên',
          targetClass: e.targetClass,
          dueDate: e.dueDate,
          createdAt: e.createdAt,
          alreadyDone: doneExamIds.has(e.examId || e.id),
        }));

      // Merge with localStorage assignments (for offline / permission fallback)
      const lsAssigns = (() => {
        try { return JSON.parse(localStorage.getItem('geo_pro_assignments') || '[]'); } catch { return []; }
      })();
      const fsIds = new Set(all.map(a => a.id));
      const lsFiltered: AssignedExam[] = lsAssigns
        .filter((a: any) => !fsIds.has(a.id) && (a.targetClass === className || a.targetClass === 'all'))
        .map((a: any) => ({ ...a, alreadyDone: doneExamIds.has(a.examId) }));

      setAssignments([...all, ...lsFiltered].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    }, () => {
      // Firestore failed → use localStorage only
      const profile2 = getProfile();
      const cn2 = profile2.className || '';
      const lsAssigns = (() => {
        try { return JSON.parse(localStorage.getItem('geo_pro_assignments') || '[]'); } catch { return []; }
      })();
      const lsAttempts2 = (() => {
        try { return JSON.parse(localStorage.getItem('geo_pro_local_attempts') || '[]'); } catch { return []; }
      })();
      const doneIds = new Set<string>(lsAttempts2.map((a: any) => a.examId));
      setAssignments(
        lsAssigns
          .filter((a: any) => a.targetClass === cn2 || a.targetClass === 'all')
          .map((a: any) => ({ ...a, alreadyDone: doneIds.has(a.examId) }))
      );
    });

    return () => unsub();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isTeacherMode]);

  const undone = assignments.filter(a => !a.alreadyDone);
  const unreadCount = undone.length;

  const handleClick = (a: AssignedExam) => {
    setOpen(false);
    navigate(`/exam-room?examId=${a.examId}`);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  // Don't show for teachers or if no class set
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
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
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
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-[10px] font-black rounded-full">
                      {unreadCount} chưa làm
                    </span>
                  )}
                </div>
                <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto divide-y divide-slate-50">
                {assignments.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell size={28} className="mx-auto text-slate-200 mb-2" />
                    <p className="text-slate-400 text-sm">Chưa có đề thi nào được giao.</p>
                  </div>
                ) : (
                  assignments.map(a => (
                    <button
                      key={a.id}
                      onClick={() => handleClick(a)}
                      className={cn(
                        'w-full text-left px-4 py-3.5 hover:bg-slate-50 transition-colors flex items-start gap-3',
                        !a.alreadyDone && 'bg-indigo-50/60'
                      )}
                    >
                      <div className={cn(
                        'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
                        a.alreadyDone ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-600 text-white'
                      )}>
                        <BookOpen size={15} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={cn('text-[10px] font-black uppercase tracking-wider',
                            a.alreadyDone ? 'text-emerald-500' : 'text-indigo-600'
                          )}>
                            {a.alreadyDone ? '✓ Đã làm' : '● Chưa làm'}
                          </span>
                        </div>
                        <p className="font-bold text-sm text-slate-800 line-clamp-2">{a.examTitle}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Giáo viên: {a.assignedBy}</p>
                        {a.dueDate && (
                          <p className="text-[10px] text-rose-500 font-bold mt-0.5 flex items-center gap-1">
                            <AlertCircle size={9} /> Hạn: {formatDate(a.dueDate)}
                          </p>
                        )}
                      </div>
                      {!a.alreadyDone && <ChevronRight size={14} className="text-indigo-400 shrink-0 mt-1" />}
                    </button>
                  ))
                )}
              </div>

              {unreadCount > 0 && (
                <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
                  <p className="text-[11px] text-slate-400 text-center">
                    Click vào đề để bắt đầu làm bài
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
