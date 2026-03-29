import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wifi, WifiOff, Users, Clock, CheckCircle2, Loader2, Bell, X, Send, RefreshCw, Radio, Eye } from 'lucide-react';
import { cn } from '../../utils/cn';
import { liveTrackingService, LiveStudent } from '../../services/liveTrackingService';
import { sessionService, StudentSession } from '../../services/sessionService';
import LiveExamMonitor from './LiveExamMonitor';
import { db } from '../../firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

interface ToastItem { id: string; message: string; studentName: string; timestamp: number; }

export default function LiveStudentTracker() {
  const [connected, setConnected] = useState(false);
  const [students, setStudents] = useState<LiveStudent[]>([]);
  const [sessions, setSessions] = useState<StudentSession[]>([]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [alertMsg, setAlertMsg] = useState('');
  const [alertClass, setAlertClass] = useState('all');
  const [alertSent, setAlertSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [view, setView] = useState<'exam' | 'sessions' | 'monitor'>('sessions');
  const [monitorExamId, setMonitorExamId] = useState('');
  const [assignments, setAssignments] = useState<any[]>([]);
  const examId = 'exam_local';

  const addToast = (message: string, studentName: string) => {
    const id = `${Date.now()}_${Math.random()}`;
    setToasts(prev => [...prev.slice(-4), { id, message, studentName, timestamp: Date.now() }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  };

  // Load assignment list for exam selector
  useEffect(() => {
    const q = query(collection(db, 'exams'), where('type', '==', 'assignment'));
    const unsub = onSnapshot(q, snap => {
      setAssignments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {
      try {
        const ls = JSON.parse(localStorage.getItem('geo_pro_assignments') || '[]');
        setAssignments(ls);
      } catch {}
    });
    return () => unsub();
  }, []);

  // Live exam tracking (legacy)
  useEffect(() => {
    setConnected(true);
    const unsubscribe = liveTrackingService.subscribeToLiveStudents(examId, (updatedStudents, newStudents) => {
      setStudents(updatedStudents);
      newStudents.forEach(student => addToast(`${student.name} vừa vào thi!`, student.name));
    });
    return () => { unsubscribe(); setConnected(false); };
  }, [examId]);

  // Session (login) tracking
  useEffect(() => {
    const unsub = sessionService.subscribeToSessions(setSessions);
    return () => unsub();
  }, []);

  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));
  const formatTime = (s?: number) => s ? `${Math.floor(s / 60)}p ${s % 60}s` : '--';
  const activeCount = students.filter(s => !s.isFinished).length;
  const finishedCount = students.filter(s => s.isFinished).length;

  // Sessions grouped by class
  const onlineSessions = sessions.filter(s => s.isOnline);
  const offlineSessions = sessions.filter(s => !s.isOnline);
  const classGroups = [...new Set(sessions.map(s => s.className))];

  const handleSendAlert = async () => {
    const msg = alertMsg.trim() || 'Giáo viên đang theo dõi — Vào học ngay!';
    setSending(true);
    await sessionService.sendLiveAlert(alertClass, msg);
    setAlertSent(true);
    setSending(false);
    setTimeout(() => setAlertSent(false), 3000);
  };

  const handleClearAlert = async () => {
    await sessionService.clearLiveAlert(alertClass);
  };

  return (
    <>
      {/* Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 items-end">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div key={toast.id}
              initial={{ opacity: 0, x: 80, scale: 0.85 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 80, scale: 0.85 }}
              className="flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-white/10 max-w-xs"
            >
              <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0 text-sm font-black">
                {toast.studentName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Bell size={11} className="text-emerald-400" />
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Học sinh vào thi</span>
                </div>
                <p className="text-sm font-bold truncate">{toast.message}</p>
              </div>
              <button onClick={() => removeToast(toast.id)} className="shrink-0 text-white/30 hover:text-white/70"><X size={14} /></button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Send Alert Panel ── */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-3xl p-5 text-white mb-4 shadow-xl shadow-indigo-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center"><Radio size={18} /></div>
          <div>
            <p className="font-black text-sm">Gửi thông báo tới học sinh</p>
            <p className="text-indigo-200 text-xs">Học sinh nhận ngay khi đang mở app</p>
          </div>
        </div>
        <div className="flex gap-2 mb-2">
          <select value={alertClass} onChange={e => setAlertClass(e.target.value)}
            className="flex-shrink-0 bg-white/20 border border-white/30 text-white text-xs font-bold rounded-xl px-3 py-2 outline-none">
            <option value="all">Tất cả lớp</option>
            {classGroups.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input value={alertMsg} onChange={e => setAlertMsg(e.target.value)}
            placeholder="Nhập nội dung thông báo..."
            className="flex-1 bg-white/20 border border-white/30 text-white placeholder-white/50 text-xs rounded-xl px-3 py-2 outline-none"
          />
          <button onClick={handleSendAlert} disabled={sending || alertSent}
            className="px-4 py-2 bg-white text-indigo-700 rounded-xl font-black text-xs hover:bg-indigo-50 transition-colors disabled:opacity-70 flex items-center gap-1.5 shrink-0">
            {sending ? <RefreshCw size={12} className="animate-spin" /> : alertSent ? <CheckCircle2 size={12} /> : <Send size={12} />}
            {alertSent ? 'Đã gửi!' : 'Gửi'}
          </button>
        </div>
        <button onClick={handleClearAlert} className="text-indigo-200 text-[11px] underline hover:text-white">Xóa thông báo đang hiển thị</button>
      </div>

      {/* ── Main tracker panel ── */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Header with view toggle */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
              <Wifi size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Theo dõi học sinh</h2>
              <p className="text-sm text-slate-400">
                {onlineSessions.length} online · {offlineSessions.length} offline
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 rounded-xl p-0.5 text-xs font-black">
              {[
                { key: 'sessions', label: '🟢 Sĩ số' },
                { key: 'monitor', label: '👁️ Giám sát' },
                { key: 'exam', label: '📊 Live cũ' }
              ].map(({ key, label }) => (
                <button key={key} onClick={() => setView(key as any)}
                  className={cn('px-3 py-1.5 rounded-xl transition-all whitespace-nowrap', view === key ? 'bg-white shadow text-slate-800' : 'text-slate-500')}>
                  {label}
                </button>
              ))}
            </div>
            <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black', connected ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400')}>
              {connected ? <><Wifi size={12} /> LIVE</> : <><WifiOff size={12} /> OFFLINE</>}
            </div>
          </div>
        </div>

        {/* ── Monitor view (Anti-cheat grid) ── */}
        {view === 'monitor' && (
          <div className="p-4 space-y-3">
            <div>
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Chọn đề cần giám sát</label>
              <select value={monitorExamId} onChange={e => setMonitorExamId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 font-medium outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
                <option value="">-- Chọn đề đang thi --</option>
                {assignments.map((a: any) => (
                  <option key={a.id} value={a.examId || a.id}>{a.examTitle || a.title}</option>
                ))}
              </select>
            </div>
            <LiveExamMonitor examId={monitorExamId} totalQuestions={28} />
          </div>
        )}

        {/* ── Sessions view ── */}
        {view === 'sessions' && (
          sessions.length === 0 ? (
            <div className="p-12 text-center">
              <Users size={40} className="mx-auto mb-3 text-slate-200" />
              <p className="text-slate-400 font-medium text-sm">Chưa có học sinh nào đăng nhập.</p>
              <p className="text-slate-300 text-xs mt-1">Khi học sinh mở app, tên sẽ xuất hiện ở đây.</p>
            </div>
          ) : (
            <div>
              {/* Summary */}
              <div className="grid grid-cols-3 gap-px bg-slate-100">
                <div className="bg-emerald-50 p-4 text-center">
                  <div className="text-2xl font-black text-emerald-600">{onlineSessions.length}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Online</div>
                </div>
                <div className="bg-slate-50 p-4 text-center">
                  <div className="text-2xl font-black text-slate-500">{offlineSessions.length}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Offline</div>
                </div>
                <div className="bg-white p-4 text-center">
                  <div className="text-2xl font-black text-slate-800">{sessions.length}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tổng</div>
                </div>
              </div>
              {/* Student list */}
              <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
                {sessions.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                    <div className={cn('w-2.5 h-2.5 rounded-full shrink-0', s.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-300')} />
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-sm shrink-0">
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm truncate">{s.name}</p>
                      <p className="text-[11px] text-slate-400">{s.className}{s.school ? ` · ${s.school}` : ''}</p>
                    </div>
                    <div className="text-right">
                      <span className={cn('text-[10px] font-black px-2 py-0.5 rounded-lg', s.isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500')}>
                        {s.isOnline ? 'Online' : 'Offline'}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">{sessionService.formatLastSeen(s.lastSeen)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        {/* ── Live exam view ── */}
        {view === 'exam' && (
          <>
            {students.length > 0 && (
              <div className="grid grid-cols-3 gap-px bg-slate-100">
                {[
                  { label: 'Đang thi', value: activeCount, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                  { label: 'Đã nộp', value: finishedCount, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: 'Tổng', value: students.length, color: 'text-slate-700', bg: 'bg-white' },
                ].map(item => (
                  <div key={item.label} className={`${item.bg} p-4 text-center`}>
                    <div className={`text-2xl font-black ${item.color}`}>{item.value}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</div>
                  </div>
                ))}
              </div>
            )}
            {students.length === 0 ? (
              <div className="p-12 text-center">
                <Users size={40} className="mx-auto mb-3 text-slate-200" />
                <p className="text-slate-400 font-medium text-sm">Chưa có học sinh nào vào phòng thi.</p>
                <p className="text-slate-300 text-xs mt-1">Khi học sinh bắt đầu làm bài, tên sẽ xuất hiện ở đây.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {students.map(student => (
                  <div key={student.id} className="p-5 flex items-center gap-4 hover:bg-slate-50/70 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-sm shrink-0">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-800 text-sm truncate">{student.name}</span>
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-500 rounded-lg">{student.className}</span>
                        {student.isFinished
                          ? <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg"><CheckCircle2 size={10}/>Đã nộp</span>
                          : <span className="flex items-center gap-1 text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg"><Loader2 size={10} className="animate-spin"/>Đang thi</span>
                        }
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={cn('h-full rounded-full transition-all duration-500', student.isFinished ? 'bg-emerald-400' : 'bg-indigo-400')}
                            style={{ width: `${Math.min((student.progress / 28) * 100, 100)}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{student.progress}/28 câu</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-lg font-black text-slate-800">{student.score.toFixed(2)}</div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase">Điểm</div>
                      {student.isFinished && (
                        <div className="flex items-center gap-1 text-[9px] text-slate-400 mt-0.5">
                          <Clock size={9}/>{formatTime(student.timeSpent)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
