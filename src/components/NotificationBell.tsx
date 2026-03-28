import React, { useEffect, useState } from 'react';
import { Bell, X, BookOpen, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { assignmentService } from '../services/assignmentService';
import { Notification } from '../types';
import { cn } from '../utils/cn';

export default function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  // Get userId from localStorage profile if no Firebase user
  const getUserId = () => {
    if (user?.uid) return user.uid;
    try {
      const p = JSON.parse(localStorage.getItem('examGeoProfile') || '{}');
      return p.uid || p.guestId || null;
    } catch { return null; }
  };

  useEffect(() => {
    const uid = getUserId();
    if (!uid) return;

    const unsub = assignmentService.subscribeToNotifications(uid, (notifs) => {
      setNotifications(notifs);
    });
    return () => unsub();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const unread = notifications.filter(n => !n.read).length;

  const handleOpen = (notif: Notification) => {
    const uid = getUserId();
    if (uid) assignmentService.markNotificationRead(uid, notif.id);
    setOpen(false);
    navigate(`/exam-room?examId=${notif.examId}`);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (!getUserId()) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="relative w-10 h-10 flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
        title="Thông báo"
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-bounce">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              className="absolute right-0 top-12 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-indigo-600" />
                  <span className="font-black text-sm text-slate-800">THÔNG BÁO</span>
                  {unread > 0 && (
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-[10px] font-black rounded-full">{unread} mới</span>
                  )}
                </div>
                <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-700">
                  <X size={16} />
                </button>
              </div>

              {/* Notification List */}
              <div className="max-h-96 overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell size={32} className="mx-auto text-slate-200 mb-3" />
                    <p className="text-slate-400 text-sm">Chưa có thông báo nào.</p>
                  </div>
                ) : (
                  notifications.map(notif => (
                    <button
                      key={notif.id}
                      onClick={() => handleOpen(notif)}
                      className={cn(
                        'w-full text-left px-4 py-3.5 hover:bg-slate-50 transition-colors flex items-start gap-3',
                        !notif.read && 'bg-indigo-50/60'
                      )}
                    >
                      <div className={cn(
                        'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
                        notif.read ? 'bg-slate-100 text-slate-400' : 'bg-indigo-600 text-white'
                      )}>
                        <BookOpen size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className={cn('text-xs font-black uppercase tracking-wider', notif.read ? 'text-slate-400' : 'text-indigo-600')}>
                            Đề thi mới
                          </span>
                          {!notif.read && <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />}
                        </div>
                        <p className="font-bold text-sm text-slate-800 line-clamp-1">{notif.examTitle}</p>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{notif.message}</p>
                        {notif.dueDate && (
                          <p className="text-[10px] text-rose-500 font-bold mt-1">
                            Hạn nộp: {new Date(notif.dueDate).toLocaleDateString('vi-VN')}
                          </p>
                        )}
                        <p className="text-[10px] text-slate-400 mt-1">{formatDate(notif.createdAt)}</p>
                      </div>
                      <ChevronRight size={14} className="text-slate-300 shrink-0 mt-1" />
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
