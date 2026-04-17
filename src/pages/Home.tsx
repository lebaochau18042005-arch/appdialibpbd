import { Link } from 'react-router-dom';
import { BookOpen, Map, Target, Award, ArrowRight, Settings, LayoutDashboard, Users, FileText, Sparkles, ShieldCheck, History, Bell, Clock, Pencil, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { QuizAttempt, UserProfile, Exam } from '../types';
import { cn } from '../utils/cn';
import { useAuth } from '../contexts/AuthContext';
import { examService } from '../services/examService';
import { db } from '../firebase';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';


export default function Home() {
  const { user, isTeacherMode } = useAuth();
  const [recentAttempts, setRecentAttempts] = useState<QuizAttempt[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [pendingAssignments, setPendingAssignments] = useState<Array<Exam & { examId: string; examTitle: string; assignedBy: string; targetClass: string; dueDate?: string }>>([]);

  // Edit name inline
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editClass, setEditClass] = useState('');

  const openEdit = () => {
    setEditName(profile?.name || '');
    setEditClass(profile?.className || '');
    setEditMode(true);
  };

  const saveEdit = () => {
    if (!editName.trim() || !editClass.trim()) return;
    const updated = { ...(profile || {}), name: editName.trim(), className: editClass.trim() } as UserProfile;
    localStorage.setItem('examGeoProfile', JSON.stringify(updated));
    setProfile(updated);
    setEditMode(false);
  };

  useEffect(() => {

    if (user) {
      loadUserData();
    } else {
      const history = JSON.parse(localStorage.getItem('examGeoHistory') || '[]');
      setRecentAttempts(history.slice(0, 3));
      const savedProfile = localStorage.getItem('examGeoProfile');
      if (savedProfile) setProfile(JSON.parse(savedProfile));
    }
  }, [user]);

  // Subscribe to pending assignments for student's class
  useEffect(() => {
    if (isTeacherMode) return;
    const className = (() => {
      try { return (JSON.parse(localStorage.getItem('examGeoProfile') || '{}').className || '').trim().toLowerCase(); } catch { return ''; }
    })();
    if (!className) return;

    const lsAttempts: any[] = (() => { try { return JSON.parse(localStorage.getItem('geo_pro_local_attempts') || '[]'); } catch { return []; } })();
    const doneIds = new Set<string>(lsAttempts.map((a: any) => a.examId).filter(Boolean));

    // Simple query — no compound where+orderBy (no composite index needed)
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
      const lsA: any[] = (() => { try { return JSON.parse(localStorage.getItem('geo_pro_assignments') || '[]'); } catch { return []; } })();
      setPendingAssignments(lsA.filter((a: any) => {
        const tc = (a.targetClass || '').trim().toLowerCase();
        return (tc === className || tc === 'all') && !doneIds.has(a.examId);
      }));
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTeacherMode]);


  const loadUserData = async () => {
    if (!user) return;
    try {
      const [attempts, userProfile] = await Promise.all([
        examService.getStudentAttempts(user.uid),
        examService.getProfile(user.uid)
      ]);
      setRecentAttempts(attempts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3));
      setProfile(userProfile);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-20 md:pb-0"
    >
      {/* ─── Pending Assignment Banner ─────────────────────────────── */}
      {!isTeacherMode && pendingAssignments.length > 0 && (
        <section className="bg-rose-50 border-2 border-rose-200 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-rose-500 text-white rounded-xl flex items-center justify-center animate-pulse">
              <Bell size={18} />
            </div>
            <div>
              <h2 className="font-black text-rose-700 text-base">Đề thi được giao cho lớp bạn!</h2>
              <p className="text-rose-500 text-xs font-medium">{pendingAssignments.length} đề chưa làm — hãy hoàn thành sớm</p>
            </div>
          </div>
          <div className="space-y-2">
            {pendingAssignments.map((a: any) => (
              <Link
                key={a.id}
                to={`/exam-room?examId=${a.examId || a.id}`}
                className="flex items-center gap-3 p-3.5 bg-white rounded-2xl border border-rose-100 hover:border-rose-300 hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shrink-0">
                  <BookOpen size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-sm line-clamp-1">{a.examTitle || a.title}</p>
                  <p className="text-xs text-slate-500">GV: {a.assignedBy || 'Giáo viên'}</p>
                  {a.dueDate && (
                    <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1 mt-0.5">
                      <Clock size={8} /> Hạn: {new Date(a.dueDate).toLocaleDateString('vi-VN')}
                    </p>
                  )}
                </div>
                <span className="px-3 py-1.5 text-xs font-black bg-indigo-600 text-white rounded-xl group-hover:bg-indigo-700 transition-colors shrink-0">
                  Làm ngay →
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="bg-emerald-600 text-white rounded-3xl p-8 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-500 opacity-50 blur-3xl"></div>
        <div className="relative z-10 max-w-2xl">
          {(profile?.name || user?.displayName) ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex items-center flex-wrap gap-3 mb-2"
              >
                <h1 className="text-3xl md:text-4xl font-bold">
                  Chào {profile?.name || user?.displayName}, sẵn sàng ôn thi chưa?
                </h1>
                {!isTeacherMode && (
                  <button
                    onClick={openEdit}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-bold"
                    style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)', color: 'white' }}
                  >
                    <Pencil size={13} /> Sửa tên
                  </button>
                )}
              </motion.div>
              {profile?.className && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-emerald-200 font-medium mb-4 text-lg"
                >
                  Lớp: {profile.className}
                </motion.p>
              )}
            </>
          ) : (
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              ÔN THI TNTHPTQG 2026 MÔN ĐỊA LÍ
            </motion.h1>
          )}

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-emerald-100 text-lg mb-8"
          >
            Hệ thống luyện tập thông minh với AI phân tích lỗi sai, giúp bạn nắm vững kiến thức và tự tin đạt điểm cao.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap gap-4"
          >
            <Link to="/practice" className="bg-white text-emerald-700 px-6 py-3 rounded-xl font-semibold hover:bg-emerald-50 transition-colors flex items-center gap-2 shadow-sm">
              <BookOpen className="w-5 h-5" />
              Bắt đầu luyện tập
            </Link>
            <Link to="/exam" className="bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-800 transition-colors flex items-center gap-2 shadow-sm">
              <Map className="w-5 h-5" />
              Thi thử ngay
            </Link>
            {!profile?.name && (
              <Link to="/profile" className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-400 transition-colors flex items-center gap-2 shadow-sm">
                <Settings className="w-5 h-5" />
                Cài đặt hồ sơ
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      <section className="grid md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group hover:border-blue-200 transition-all">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Luyện theo bài</h3>
          <p className="text-slate-600 text-sm mb-4">Ôn tập chi tiết từng bài học trong SGK Địa lí 12.</p>
          <Link to="/practice?mode=lesson" className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-600 hover:text-white transition-all">
            Vào luyện tập <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group hover:border-amber-200 transition-all">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Luyện theo chủ đề</h3>
          <p className="text-slate-600 text-sm mb-4">Tổng hợp kiến thức theo các chuyên đề trọng tâm.</p>
          <Link to="/practice?mode=topic" className="inline-flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-amber-600 hover:text-white transition-all">
            Vào luyện tập <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group hover:border-rose-200 transition-all">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Đề thi tổng hợp</h3>
          <p className="text-slate-600 text-sm mb-4">Thi thử theo cấu trúc đề thi tốt nghiệp 2025.</p>
          <Link to="/exam" className="inline-flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-rose-600 hover:text-white transition-all">
            Làm đề ngay <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-800 group hover:border-indigo-500 transition-all text-white">
          <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Settings className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold mb-2">Dành cho Giáo viên</h3>
          <p className="text-slate-400 text-sm mb-4">Quản lý đề thi, tải file và theo dõi học sinh.</p>
          <Link to="/teacher" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-all">
            Vào Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {recentAttempts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800">Hoạt động gần đây</h2>
            <Link to="/history" className="text-emerald-600 text-sm font-medium hover:underline">Xem tất cả</Link>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {recentAttempts.map((attempt, idx) => (
              <div key={attempt.id} className={cn("p-4 flex items-center justify-between", idx !== recentAttempts.length - 1 && "border-b border-slate-100")}>
                <div>
                  <h4 className="font-medium text-slate-800">{attempt.examTitle}</h4>
                  <p className="text-xs text-slate-500 mt-1">{new Date(attempt.date).toLocaleString('vi-VN')}</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-600 text-lg">{attempt.score}/{attempt.totalQuestions}</div>
                  <div className="text-xs text-slate-500">Điểm</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Edit Name Modal */}
      <AnimatePresence>
        {editMode && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
            onClick={() => setEditMode(false)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <p className="font-black text-slate-800 text-lg">✑️ Sửa thông tin</p>
                <button onClick={() => setEditMode(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">Họ và tên *</label>
                <input
                  autoFocus value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveEdit()}
                  placeholder="Họ và tên..."
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-400 outline-none text-sm font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">Lớp *</label>
                <input
                  value={editClass}
                  onChange={e => setEditClass(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveEdit()}
                  placeholder="VD: 12C1"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-400 outline-none text-sm font-medium"
                />
              </div>
              <button
                onClick={saveEdit}
                disabled={!editName.trim() || !editClass.trim()}
                className="w-full py-3 rounded-2xl font-black flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 transition-all"
              >
                <Check size={16} /> Lưu thay đổi
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
