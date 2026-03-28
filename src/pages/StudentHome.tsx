import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Bell, BookOpen, BarChart2, Map, History, Clock,
  ChevronRight, Flame, Trophy, Target, ArrowRight, Sparkles
} from 'lucide-react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { cn } from '../utils/cn';

interface AssignedExam {
  id: string; examId: string; examTitle: string;
  assignedBy: string; targetClass: string;
  dueDate?: string; createdAt: string;
}

function getProfile() {
  try { return JSON.parse(localStorage.getItem('examGeoProfile') || '{}'); } catch { return {}; }
}
function getDoneIds(): Set<string> {
  try {
    const a: any[] = JSON.parse(localStorage.getItem('geo_pro_local_attempts') || '[]');
    return new Set(a.map((x: any) => x.examId).filter(Boolean));
  } catch { return new Set(); }
}

const FEATURES = [
  {
    id: 'assigned', label: 'Đề Được Giao', icon: Bell, color: 'from-rose-500 to-rose-600',
    bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-700',
    desc: 'Xem đề giáo viên giao', href: '/assigned', badge: true,
  },
  {
    id: 'exam', label: 'Thi Thử', icon: BookOpen, color: 'from-indigo-500 to-indigo-700',
    bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-700',
    desc: 'Thi thử đề hoàn chỉnh', href: '/exam',
  },
  {
    id: 'practice', label: 'Luyện Tập', icon: Target, color: 'from-emerald-500 to-emerald-700',
    bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700',
    desc: 'Luyện từng chủ đề', href: '/practice',
  },
  {
    id: 'learning-path', label: 'Lộ Trình', icon: Map, color: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700',
    desc: 'Học có hệ thống', href: '/learning-path',
  },
  {
    id: 'history', label: 'Lịch Sử', icon: History, color: 'from-slate-500 to-slate-700',
    bg: 'bg-slate-50', border: 'border-slate-100', text: 'text-slate-700',
    desc: 'Kết quả đã làm', href: '/history',
  },
  {
    id: 'stats', label: 'Thống Kê', icon: BarChart2, color: 'from-purple-500 to-purple-700',
    bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-700',
    desc: 'Tiến trình học tập', href: '/history',
  },
];

export default function StudentHome() {
  const navigate = useNavigate();
  const profile = getProfile();
  const [pendingAssignments, setPendingAssignments] = useState<AssignedExam[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<any[]>([]);

  // Subscribe to pending assignments from Firestore
  useEffect(() => {
    const className = (profile.className || '').trim().toLowerCase();
    if (!className) return;
    const doneIds = getDoneIds();
    const q = query(collection(db, 'exams'), orderBy('createdAt', 'desc'), limit(100));
    const unsub = onSnapshot(q, (snap) => {
      const pending = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as any))
        .filter((e: any) => {
          if (e.type !== 'assignment') return false;
          const tc = (e.targetClass || '').trim().toLowerCase();
          return (tc === className || tc === 'all') && !doneIds.has(e.examId || e.id);
        });
      setPendingAssignments(pending);
    }, () => {
      const lsA = JSON.parse(localStorage.getItem('geo_pro_assignments') || '[]');
      const doneIds2 = getDoneIds();
      setPendingAssignments(lsA.filter((a: any) => {
        const tc = (a.targetClass || '').toLowerCase();
        return (tc === className || tc === 'all') && !doneIds2.has(a.examId);
      }));
    });
    return () => unsub();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load recent attempts from localStorage
  useEffect(() => {
    const attempts = JSON.parse(localStorage.getItem('geo_pro_local_attempts') || '[]');
    setRecentAttempts(attempts.slice(0, 3));
  }, []);

  const totalAttempts = JSON.parse(localStorage.getItem('geo_pro_local_attempts') || '[]').length;
  const avgScore = (() => {
    const a = JSON.parse(localStorage.getItem('geo_pro_local_attempts') || '[]');
    if (!a.length) return 0;
    return (a.reduce((s: number, x: any) => s + (x.score || 0), 0) / a.length).toFixed(1);
  })();

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-24 md:pb-6">

      {/* ── Hero greeting ── */}
      <section className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-indigo-800 text-white rounded-3xl p-6 md:p-8 shadow-2xl shadow-emerald-900/20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full" />
          <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-white/5 rounded-full" />
        </div>
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-emerald-300" />
            <p className="text-emerald-200 text-sm font-bold uppercase tracking-widest">Chào mừng trở lại</p>
          </div>
          <h1 className="text-2xl md:text-3xl font-black mb-1">
            {profile.name || 'Học sinh'} 👋
          </h1>
          <p className="text-emerald-200 text-sm font-medium">Lớp {profile.className || '?'}{profile.school ? ` • ${profile.school}` : ''}</p>

          <div className="mt-5 flex flex-wrap gap-4">
            <div className="bg-white/10 rounded-2xl px-4 py-2.5 text-center">
              <p className="text-xl font-black">{totalAttempts}</p>
              <p className="text-emerald-200 text-[10px] font-bold uppercase tracking-wider">Đề đã làm</p>
            </div>
            <div className="bg-white/10 rounded-2xl px-4 py-2.5 text-center">
              <p className="text-xl font-black">{avgScore}</p>
              <p className="text-emerald-200 text-[10px] font-bold uppercase tracking-wider">Điểm TB</p>
            </div>
            {pendingAssignments.length > 0 && (
              <div className="bg-rose-500/80 rounded-2xl px-4 py-2.5 text-center animate-pulse">
                <p className="text-xl font-black">{pendingAssignments.length}</p>
                <p className="text-rose-100 text-[10px] font-bold uppercase tracking-wider">Chưa làm</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Pending Assignment Banner ── */}
      {pendingAssignments.length > 0 && (
        <section className="bg-white border-2 border-rose-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 bg-rose-50 border-b border-rose-100 flex items-center gap-3">
            <div className="w-8 h-8 bg-rose-500 text-white rounded-xl flex items-center justify-center animate-pulse shrink-0">
              <Bell size={16} />
            </div>
            <div className="flex-1">
              <p className="font-black text-rose-700 text-sm">Giáo viên đã giao {pendingAssignments.length} đề — hãy làm ngay!</p>
            </div>
            <Link to="/assigned" className="text-rose-600 text-xs font-black hover:text-rose-800 whitespace-nowrap">Xem tất cả →</Link>
          </div>
          <div className="p-4 space-y-2">
            {pendingAssignments.slice(0, 2).map((a: any) => (
              <Link key={a.id} to={`/exam-room?examId=${a.examId || a.id}`}
                className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-rose-50 rounded-2xl border border-slate-100 hover:border-rose-200 transition-all group">
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shrink-0">
                  <BookOpen size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate">{a.examTitle || a.title}</p>
                  <p className="text-xs text-slate-500">GV: {a.assignedBy || 'Giáo viên'}
                    {a.dueDate && <span className="ml-2 text-rose-500 font-bold flex-inline items-center gap-0.5">
                      <Clock size={9} className="inline mr-0.5" />Hạn: {new Date(a.dueDate).toLocaleDateString('vi-VN')}
                    </span>}
                  </p>
                </div>
                <span className="px-3 py-1.5 text-[11px] font-black bg-indigo-600 text-white rounded-xl group-hover:bg-indigo-700 transition-colors shrink-0">Làm ngay</span>
              </Link>
            ))}
            {pendingAssignments.length > 2 && (
              <Link to="/assigned" className="flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-rose-600 hover:text-rose-800 transition-colors">
                Xem thêm {pendingAssignments.length - 2} đề khác <ChevronRight size={14} />
              </Link>
            )}
          </div>
        </section>
      )}

      {/* ── Feature Grid ── */}
      <section>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Tính năng</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {FEATURES.map((feat, i) => {
            const Icon = feat.icon;
            const badge = feat.badge && pendingAssignments.length > 0 ? pendingAssignments.length : 0;
            return (
              <motion.div key={feat.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={feat.href}
                  className={cn('relative flex flex-col items-start p-4 rounded-2xl border transition-all hover:scale-[1.02] hover:shadow-md bg-white', feat.border)}
                >
                  {badge > 0 && (
                    <span className="absolute top-3 right-3 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">{badge}</span>
                  )}
                  <div className={cn('w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3 shadow-md', feat.color)}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <p className={cn('font-black text-sm', feat.text)}>{feat.label}</p>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">{feat.desc}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Recent activity ── */}
      {recentAttempts.length > 0 && (
        <section className="bg-white border border-slate-100 rounded-3xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History size={16} className="text-slate-500" />
              <span className="font-black text-slate-800 text-sm">Bài đã làm gần đây</span>
            </div>
            <Link to="/history" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">Xem tất cả →</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentAttempts.map((a: any, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0',
                  a.score >= 8 ? 'bg-emerald-100 text-emerald-700' : a.score >= 5 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                )}>{a.score?.toFixed(1) || '—'}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{a.examTitle || 'Bài tập'}</p>
                  <p className="text-[11px] text-slate-400">{new Date(a.date || a.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
                <Trophy size={14} className={a.score >= 8 ? 'text-amber-500' : 'text-slate-300'} />
              </div>
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}
