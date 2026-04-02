import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Bell, BookOpen, BarChart2, Map, History, Clock,
  ChevronRight, Trophy, Target, ArrowRight, Sparkles, AlertTriangle, X, Compass, Library, Globe2
} from 'lucide-react';
import { cn } from '../utils/cn';
import { sessionService, LiveAlert } from '../services/sessionService';
import { assignmentService } from '../services/assignmentService';

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
    id: 'assigned', label: 'Đề Được Giao', icon: Bell,
    gradient: 'linear-gradient(135deg, #ef4444, #f97316)',
    glow: 'rgba(239,68,68,0.3)',
    border: 'rgba(239,68,68,0.25)',
    desc: 'Xem đề giáo viên giao', href: '/assigned', badge: true,
  },
  {
    id: 'exam', label: 'Thi Thử', icon: BookOpen,
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    glow: 'rgba(99,102,241,0.3)',
    border: 'rgba(99,102,241,0.25)',
    desc: 'Thi thử đề hoàn chỉnh', href: '/exam',
  },
  {
    id: 'practice', label: 'Luyện Tập', icon: Target,
    gradient: 'linear-gradient(135deg, #0ea5e9, #14b8a6)',
    glow: 'rgba(14,165,233,0.3)',
    border: 'rgba(0,191,255,0.25)',
    desc: 'Luyện từng chủ đề', href: '/practice',
  },
  {
    id: 'learning-path', label: 'Lộ Trình', icon: Map,
    gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    glow: 'rgba(245,158,11,0.3)',
    border: 'rgba(245,158,11,0.25)',
    desc: 'Học có hệ thống', href: '/learning-path',
  },
  {
    id: 'history', label: 'Lịch Sử', icon: History,
    gradient: 'linear-gradient(135deg, #64748b, #475569)',
    glow: 'rgba(100,116,139,0.3)',
    border: 'rgba(100,116,139,0.25)',
    desc: 'Kết quả đã làm', href: '/history',
  },
  {
    id: 'library', label: 'Thư Viện', icon: Library,
    gradient: 'linear-gradient(135deg, #a855f7, #6366f1)',
    glow: 'rgba(168,85,247,0.3)',
    border: 'rgba(168,85,247,0.25)',
    desc: 'Tài liệu học tập', href: '/library',
  },
];

export default function StudentHome() {
  const profile = getProfile();
  const [pendingAssignments, setPendingAssignments] = useState<AssignedExam[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<any[]>([]);
  const [liveAlert, setLiveAlert] = useState<LiveAlert | null>(null);
  const [alertDismissed, setAlertDismissed] = useState(false);

  useEffect(() => {
    if (!profile.name || !profile.className) return;
    sessionService.heartbeat({ name: profile.name, className: profile.className, school: profile.school });
    const interval = setInterval(() => {
      sessionService.heartbeat({ name: profile.name, className: profile.className, school: profile.school });
    }, 2 * 60 * 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!profile.className) return;
    const unsub = sessionService.subscribeToAlerts(profile.className, (alert) => {
      setLiveAlert(alert);
      if (alert) setAlertDismissed(false);
    });
    return () => unsub();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!profile.className) return;
    const doneIds = getDoneIds();
    const unsub = assignmentService.subscribeToStudentAssignments(profile.className, (list) => {
      setPendingAssignments(list.filter(a => !doneIds.has(a.examId)));
    });
    return () => unsub();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pb-28 md:pb-8">

      {/* ── HERO GREETING ── */}
      <section
        className="relative rounded-3xl p-6 md:p-8 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(14,165,233,0.18) 0%, rgba(20,184,166,0.12) 50%, rgba(99,102,241,0.15) 100%)',
          border: '1px solid rgba(0,191,255,0.25)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.4), 0 0 60px rgba(0,191,255,0.06) inset',
        }}
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,191,255,0.12) 0%, transparent 70%)' }} />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full" style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.1) 0%, transparent 70%)' }} />
          {/* Coordinate lines decoration */}
          <div className="absolute top-4 right-4 text-[9px] font-mono" style={{ color: 'rgba(0,191,255,0.25)' }}>
            {profile.className ? `CLASS·${profile.className.toUpperCase()}` : '10°N · 108°E'}
          </div>
          <Globe2 className="absolute bottom-4 right-6 opacity-5" size={80} style={{ color: '#00bfff' }} />
        </div>

        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={13} style={{ color: '#00ffcc' }} />
            <span className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: 'rgba(0,255,204,0.7)' }}>
              Chào mừng trở lại
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black mb-1" style={{ color: '#f1f5f9', letterSpacing: '-0.02em' }}>
            {profile.name || 'Học sinh'} 👋
          </h1>
          <p className="text-sm font-medium" style={{ color: 'rgba(148,163,184,0.7)' }}>
            Lớp {profile.className || '?'}{profile.school ? ` · ${profile.school}` : ''}
          </p>

          {/* Stats row */}
          <div className="mt-5 flex flex-wrap gap-3">
            {[
              { label: 'Đề đã làm', value: totalAttempts, color: '#00bfff' },
              { label: 'Điểm TB', value: avgScore, color: '#00ffcc' },
              ...(pendingAssignments.length > 0 ? [{ label: 'Chưa làm', value: pendingAssignments.length, color: '#ef4444', pulse: true }] : []),
            ].map(stat => (
              <div
                key={stat.label}
                className="px-4 py-2.5 rounded-2xl text-center"
                style={{
                  background: 'rgba(0,0,0,0.25)',
                  border: `1px solid ${stat.color}30`,
                  animation: (stat as any).pulse ? 'geoPulse 2s ease-in-out infinite' : undefined
                }}
              >
                <p className="text-xl font-black" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'rgba(148,163,184,0.6)' }}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Quick action buttons */}
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/practice"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{
                background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)',
                color: 'white',
                boxShadow: '0 4px 16px rgba(14,165,233,0.4)',
              }}
            >
              <Compass size={15} /> Bắt đầu luyện tập
            </Link>
            <Link
              to="/exam"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(226,232,240,0.9)',
              }}
            >
              <BookOpen size={15} /> Thi thử ngay
            </Link>
          </div>
        </div>
      </section>

      {/* ── LIVE ALERT FROM TEACHER ── */}
      {liveAlert && !alertDismissed && (
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl p-4 flex items-center gap-4"
          style={{
            background: 'linear-gradient(135deg, rgba(220,38,38,0.2), rgba(234,88,12,0.2))',
            border: '1px solid rgba(239,68,68,0.5)',
            boxShadow: '0 0 30px rgba(239,68,68,0.2)',
          }}
        >
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 animate-pulse"
            style={{ background: 'rgba(239,68,68,0.25)', border: '1px solid rgba(239,68,68,0.5)' }}>
            <AlertTriangle size={18} style={{ color: '#fca5a5' }} />
          </div>
          <div className="flex-1">
            <p className="font-black text-sm" style={{ color: '#fca5a5' }}>⚠️ Thông báo từ Giáo viên</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(252,165,165,0.7)' }}>{liveAlert.message || 'Giáo viên đang theo dõi — Vào thi ngay!'}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link to="/assigned"
              className="px-3 py-1.5 rounded-xl font-black text-xs"
              style={{ background: '#ef4444', color: 'white' }}
            >Vào thi</Link>
            <button onClick={() => setAlertDismissed(true)} style={{ color: 'rgba(252,165,165,0.5)' }}>
              <X size={16} />
            </button>
          </div>
        </motion.section>
      )}

      {/* ── PENDING ASSIGNMENT BANNER ── */}
      {pendingAssignments.length > 0 && (
        <section
          className="rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(11,22,40,0.8)',
            border: '1px solid rgba(239,68,68,0.3)',
            boxShadow: '0 4px 20px rgba(239,68,68,0.1)',
          }}
        >
          <div className="px-5 py-3.5 flex items-center gap-3"
            style={{ background: 'rgba(239,68,68,0.08)', borderBottom: '1px solid rgba(239,68,68,0.15)' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center animate-pulse shrink-0"
              style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.5)' }}>
              <Bell size={14} style={{ color: '#fca5a5' }} />
            </div>
            <p className="font-black text-sm flex-1" style={{ color: '#fca5a5' }}>
              Giáo viên đã giao {pendingAssignments.length} đề — hãy làm ngay!
            </p>
            <Link to="/assigned" className="text-xs font-black whitespace-nowrap" style={{ color: '#f87171' }}>
              Xem tất cả →
            </Link>
          </div>
          <div className="p-3 space-y-2">
            {pendingAssignments.slice(0, 2).map((a: any) => (
              <Link
                key={a.id}
                to={`/exam-room?examId=${a.examId || a.id}`}
                className="flex items-center gap-3 p-3 rounded-2xl transition-all group"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  <BookOpen size={15} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate" style={{ color: '#e2e8f0' }}>{a.examTitle || a.title}</p>
                  <p className="text-xs" style={{ color: 'rgba(148,163,184,0.6)' }}>
                    GV: {a.assignedBy || 'Giáo viên'}
                    {a.dueDate && (
                      <span className="ml-2" style={{ color: '#f87171' }}>
                        <Clock size={9} className="inline mr-0.5" />
                        Hạn: {new Date(a.dueDate).toLocaleDateString('vi-VN')}
                      </span>
                    )}
                  </p>
                </div>
                <span className="px-3 py-1.5 text-[11px] font-black rounded-xl shrink-0"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' }}>
                  Làm ngay
                </span>
              </Link>
            ))}
            {pendingAssignments.length > 2 && (
              <Link to="/assigned" className="flex items-center justify-center gap-2 py-2 text-sm font-bold"
                style={{ color: '#f87171' }}>
                Xem thêm {pendingAssignments.length - 2} đề khác <ChevronRight size={14} />
              </Link>
            )}
          </div>
        </section>
      )}

      {/* ── FEATURE GRID ── */}
      <section>
        <p className="text-[10px] font-black uppercase tracking-[0.15em] mb-3" style={{ color: 'rgba(0,191,255,0.45)' }}>
          ◈ Tính năng
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {FEATURES.map((feat, i) => {
            const Icon = feat.icon;
            const badge = feat.badge && pendingAssignments.length > 0 ? pendingAssignments.length : 0;
            return (
              <motion.div key={feat.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Link
                  to={feat.href}
                  className="relative flex flex-col items-start p-4 rounded-2xl transition-all group block"
                  style={{
                    background: 'rgba(11,22,40,0.8)',
                    border: `1px solid ${feat.border}`,
                    boxShadow: `0 4px 20px rgba(0,0,0,0.3)`,
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px rgba(0,0,0,0.4), 0 0 20px ${feat.glow}`;
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                    (e.currentTarget as HTMLElement).style.borderColor = feat.border.replace('0.25)', '0.5)');
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 20px rgba(0,0,0,0.3)`;
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLElement).style.borderColor = feat.border;
                  }}
                >
                  {badge > 0 && (
                    <span
                      className="absolute top-3 right-3 w-5 h-5 text-white text-[10px] font-black rounded-full flex items-center justify-center"
                      style={{ background: '#ef4444', boxShadow: '0 0 8px rgba(239,68,68,0.6)' }}
                    >{badge}</span>
                  )}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: feat.gradient, boxShadow: `0 4px 16px ${feat.glow}` }}
                  >
                    <Icon size={20} className="text-white" />
                  </div>
                  <p className="font-black text-sm" style={{ color: '#e2e8f0' }}>{feat.label}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'rgba(148,163,184,0.55)' }}>{feat.desc}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── RECENT ACTIVITY ── */}
      {recentAttempts.length > 0 && (
        <section
          className="rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(11,22,40,0.8)',
            border: '1px solid rgba(0,191,255,0.12)',
          }}
        >
          <div className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: '1px solid rgba(0,191,255,0.08)' }}>
            <div className="flex items-center gap-2">
              <History size={15} style={{ color: 'rgba(0,191,255,0.6)' }} />
              <span className="font-black text-sm" style={{ color: '#e2e8f0' }}>Bài đã làm gần đây</span>
            </div>
            <Link to="/history" className="text-xs font-bold transition-colors"
              style={{ color: 'rgba(0,191,255,0.6)' }}>
              Xem tất cả →
            </Link>
          </div>
          <div>
            {recentAttempts.map((a: any, i) => {
              const scoreColor = a.score >= 8 ? '#00ffcc' : a.score >= 5 ? '#fbbf24' : '#f87171';
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 px-5 py-3.5"
                  style={{ borderBottom: i < recentAttempts.length - 1 ? '1px solid rgba(0,191,255,0.06)' : 'none' }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0"
                    style={{
                      background: `${scoreColor}18`,
                      border: `1px solid ${scoreColor}35`,
                      color: scoreColor
                    }}
                  >{a.score?.toFixed(1) || '—'}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: '#e2e8f0' }}>{a.examTitle || 'Bài tập'}</p>
                    <p className="text-[11px]" style={{ color: 'rgba(148,163,184,0.5)' }}>
                      {new Date(a.date || a.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <Trophy size={14} style={{ color: a.score >= 8 ? '#fbbf24' : 'rgba(100,116,139,0.3)' }} />
                </div>
              );
            })}
          </div>
        </section>
      )}
    </motion.div>
  );
}
