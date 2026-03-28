import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wifi, WifiOff, Users, Clock, CheckCircle2, Loader2, Bell, X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface LiveStudent {
  id: string;
  name: string;
  className: string;
  score: number;
  progress: number;
  isFinished: boolean;
  timeSpent?: number;
}

interface ToastItem {
  id: string;
  message: string;
  studentName: string;
  timestamp: number;
}

export default function LiveStudentTracker() {
  const [connected, setConnected] = useState(false);
  const [students, setStudents] = useState<LiveStudent[]>([]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const socketRef = useRef<any>(null);
  const examId = 'exam_local'; // listen to all generic exams

  // Try to connect to socket — works only in dev or if server.ts is running
  useEffect(() => {
    let socket: any = null;
    try {
      // Dynamic import to avoid crash when socket.io-client not available
      import('socket.io-client').then(({ io }) => {
        socket = io({ transports: ['websocket', 'polling'] });
        socketRef.current = socket;

        socket.on('connect', () => {
          setConnected(true);
          socket.emit('teacher_join', { examId });
        });

        socket.on('disconnect', () => setConnected(false));

        socket.on('initial_state', (data: LiveStudent[]) => {
          setStudents(data);
        });

        socket.on('student_joined', (data: LiveStudent[]) => {
          setStudents(data);
          const newest = data[data.length - 1];
          if (newest) addToast(`${newest.name} vừa vào thi!`, newest.name);
        });

        socket.on('student_updated', (data: LiveStudent[]) => {
          setStudents(data);
        });
      }).catch(() => {
        // socket.io-client not available — silent fail
      });
    } catch {
      // silent fail
    }

    return () => {
      socket?.disconnect();
    };
  }, []);

  const addToast = (message: string, studentName: string) => {
    const id = `${Date.now()}_${Math.random()}`;
    setToasts(prev => [...prev.slice(-4), { id, message, studentName, timestamp: Date.now() }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  const formatTime = (s?: number) => s ? `${Math.floor(s / 60)}p ${s % 60}s` : '--';
  const activeCount = students.filter(s => !s.isFinished).length;
  const finishedCount = students.filter(s => s.isFinished).length;

  return (
    <>
      {/* Toast Notifications — fixed bottom-right */}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 items-end">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 80, scale: 0.85 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.85 }}
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
              <button onClick={() => removeToast(toast.id)} className="shrink-0 text-white/30 hover:text-white/70">
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main tracker panel */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
              <Wifi size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Theo dõi thi trực tiếp</h2>
              <p className="text-sm text-slate-400">
                {connected
                  ? `${students.length} học sinh trong phòng thi`
                  : 'Đang chờ kết nối... (chỉ hoạt động khi có server)'}
              </p>
            </div>
          </div>
          <div className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black',
            connected ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'
          )}>
            {connected ? <><Wifi size={12} /> LIVE</> : <><WifiOff size={12} /> OFFLINE</>}
          </div>
        </div>

        {/* Stats row */}
        {students.length > 0 && (
          <div className="grid grid-cols-3 gap-px bg-slate-100">
            {[
              { label: 'Đang thi', value: activeCount, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { label: 'Đã nộp bài', value: finishedCount, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Tổng cộng', value: students.length, color: 'text-slate-700', bg: 'bg-white' },
            ].map(item => (
              <div key={item.label} className={`${item.bg} p-4 text-center`}>
                <div className={`text-2xl font-black ${item.color}`}>{item.value}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Student list */}
        {students.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={40} className="mx-auto mb-3 text-slate-200" />
            <p className="text-slate-400 font-medium text-sm">
              {connected
                ? 'Chưa có học sinh nào vào phòng thi.'
                : 'Tính năng này hoạt động trong môi trường có server (npm run dev).'}
            </p>
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
                      ? <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg"><CheckCircle2 size={10} />Đã nộp</span>
                      : <span className="flex items-center gap-1 text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg"><Loader2 size={10} className="animate-spin" />Đang thi</span>
                    }
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all duration-500', student.isFinished ? 'bg-emerald-400' : 'bg-indigo-400')}
                        style={{ width: `${Math.min((student.progress / 28) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                      {student.progress}/28 câu
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-black text-slate-800">{student.score.toFixed(2)}</div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase">Điểm</div>
                  {student.isFinished && (
                    <div className="flex items-center gap-1 text-[9px] text-slate-400 mt-0.5">
                      <Clock size={9} />{formatTime(student.timeSpent)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
