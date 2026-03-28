import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, School, BookOpen, ArrowRight, MapPin, GraduationCap, ShieldCheck, Eye, EyeOff, Lock, Chrome, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LS_PROFILE_KEY = 'examGeoProfile';
const LS_ROLE_KEY = 'examGeoRole'; // 'student' | 'teacher'
const TEACHER_CODE = 'GEO2025VN';

function isProfileComplete(profile: any): boolean {
  return !!(profile?.name?.trim() && profile?.className?.trim());
}

type Step = 'role' | 'student-info' | 'teacher-code';

export default function StudentProfileGate({ children }: { children: React.ReactNode }) {
  const { isTeacherMode, loginWithTeacherCode, user, login, isSynced } = useAuth();
  const [step, setStep] = useState<Step | null>(null);
  const [name, setName] = useState('');
  const [className, setClassName] = useState('');
  const [school, setSchool] = useState('');
  const [teacherCode, setTeacherCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    // Already authenticated as teacher → no gate needed
    if (isTeacherMode) { setStep(null); return; }
    // Check if role was already chosen
    const savedRole = localStorage.getItem(LS_ROLE_KEY);
    if (savedRole === 'teacher') { setStep(null); return; }
    if (savedRole === 'student') {
      try {
        const saved = JSON.parse(localStorage.getItem(LS_PROFILE_KEY) || '{}');
        if (isProfileComplete(saved)) { setStep(null); return; }
        setStep('student-info');
        setName(saved.name || '');
        setClassName(saved.className || '');
        setSchool(saved.school || '');
        return;
      } catch { /* fall through to show gate */ }
    }
    // First time → show role selection
    setStep('role');
  }, [isTeacherMode, user, isSynced]);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      await login();
      // After Google login, AuthContext will auto-sync → localStorage → gate closes
      localStorage.setItem(LS_ROLE_KEY, 'student');
    } catch (e) {
      setError('Đăng nhập Google thất bại. Hãy thử lại.');
    }
    setGoogleLoading(false);
  };

  const handleStudentSubmit = () => {
    if (!name.trim()) { setError('Vui lòng nhập họ và tên.'); return; }
    if (!className.trim()) { setError('Vui lòng nhập lớp học.'); return; }
    setSaving(true);
    const profile = { name: name.trim(), className: className.trim(), school: school.trim() };
    localStorage.setItem(LS_PROFILE_KEY, JSON.stringify(profile));
    localStorage.setItem(LS_ROLE_KEY, 'student');
    setTimeout(() => { setSaving(false); setStep(null); }, 400);
  };

  const handleTeacherSubmit = () => {
    const ok = loginWithTeacherCode(teacherCode.trim());
    if (!ok) { setError('Mã giáo viên không đúng. Vui lòng thử lại.'); return; }
    localStorage.setItem(LS_ROLE_KEY, 'teacher');
    setStep(null);
  };

  if (step === null) return <>{children}</>;

  return (
    <>
      {/* Background: show app blurred behind gate */}
      <div className="fixed inset-0 z-[998] pointer-events-none">
        {children}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-center justify-center p-4"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1a2f5f 50%, #064e3b 100%)' }}
        >
          {/* Animated bg */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
            <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />
          </div>

          <motion.div
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
            className="relative w-full max-w-md"
          >
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-indigo-500 shadow-2xl shadow-emerald-500/30 mb-4">
                <MapPin size={36} className="text-white" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">ExamGeography</h1>
              <p className="text-white/50 text-sm mt-1 font-medium">Ôn thi Địa lí THPT 2025</p>
            </div>

            {/* ════ STEP 1: Role Selection ════ */}
            {step === 'role' && (
              <div className="space-y-4">
                <p className="text-white font-black text-xl text-center mb-6">Bạn đăng nhập với tư cách?</p>
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setStep('student-info'); setError(''); }}
                  className="w-full p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl flex items-center gap-5 hover:bg-white/15 hover:border-emerald-400/50 transition-all group"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/30 shrink-0">
                    <GraduationCap size={32} className="text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-white font-black text-xl">Học sinh</p>
                    <p className="text-white/50 text-sm font-medium mt-0.5">Xem đề được giao, luyện tập, thi thử</p>
                  </div>
                  <ArrowRight size={22} className="text-white/40 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setStep('teacher-code'); setError(''); }}
                  className="w-full p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl flex items-center gap-5 hover:bg-white/15 hover:border-indigo-400/50 transition-all group"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/30 shrink-0">
                    <ShieldCheck size={32} className="text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-white font-black text-xl">Giáo viên</p>
                    <p className="text-white/50 text-sm font-medium mt-0.5">Giao đề, theo dõi và nhận xét học sinh</p>
                  </div>
                  <ArrowRight size={22} className="text-white/40 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </motion.button>
              </div>
            )}

            {/* ════ STEP 2a: Student Info ════ */}
            {step === 'student-info' && (
              <div className="bg-white/10 backdrop-blur-2xl rounded-[2rem] p-8 border border-white/20 shadow-2xl space-y-5">
                <div className="text-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xl">
                    <GraduationCap size={28} className="text-white" />
                  </div>
                  <p className="text-white font-black text-lg">Thông tin học sinh</p>
                  <p className="text-white/50 text-sm mt-0.5">Điền để giáo viên có thể theo dõi và giao bài</p>
                </div>

                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input type="text" value={name} onChange={e => { setName(e.target.value); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleStudentSubmit()}
                    placeholder="Họ và tên *" autoFocus
                    className="w-full pl-11 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 font-medium outline-none focus:border-emerald-400 focus:bg-white/15 transition-all" />
                </div>
                <div className="relative">
                  <BookOpen size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input type="text" value={className} onChange={e => { setClassName(e.target.value); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleStudentSubmit()}
                    placeholder="Lớp học *  (VD: 12A1, 12C1)"
                    className="w-full pl-11 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 font-medium outline-none focus:border-emerald-400 focus:bg-white/15 transition-all" />
                </div>
                <div className="relative">
                  <School size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input type="text" value={school} onChange={e => setSchool(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleStudentSubmit()}
                    placeholder="Trường học (không bắt buộc)"
                    className="w-full pl-11 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 font-medium outline-none focus:border-emerald-400 focus:bg-white/15 transition-all" />
                </div>

                {error && <p className="text-rose-400 text-sm font-medium flex items-center gap-2">⚠️ {error}</p>}

                {/* Google sync option */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-transparent text-white/40 font-medium">hoặc đồng bộ đa thiết bị</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                  type="button"
                  className="w-full py-3.5 bg-white/10 border border-white/20 text-white font-bold rounded-2xl hover:bg-white/15 transition-all flex items-center justify-center gap-3 disabled:opacity-60"
                >
                  {googleLoading ? (
                    <RefreshCw size={18} className="animate-spin" />
                  ) : (
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  )}
                  Đăng nhập Google để đồng bộ đa thiết bị
                </motion.button>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleStudentSubmit} disabled={saving}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black text-lg rounded-2xl hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-2xl shadow-emerald-500/30 flex items-center justify-center gap-3 disabled:opacity-60">
                  {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>VÀO HỌC <ArrowRight size={22} /></>}
                </motion.button>
                <button onClick={() => { setStep('role'); setError(''); }} className="w-full text-white/40 text-sm font-medium hover:text-white/60 transition-colors">← Quay lại</button>
              </div>
            )}

            {/* ════ STEP 2b: Teacher Code ════ */}
            {step === 'teacher-code' && (
              <div className="bg-white/10 backdrop-blur-2xl rounded-[2rem] p-8 border border-white/20 shadow-2xl space-y-5">
                <div className="text-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xl">
                    <Lock size={28} className="text-white" />
                  </div>
                  <p className="text-white font-black text-lg">Xác thực giáo viên</p>
                  <p className="text-white/50 text-sm mt-0.5">Nhập mã bí mật do nhà trường cấp</p>
                </div>

                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type={showCode ? 'text' : 'password'}
                    value={teacherCode}
                    onChange={e => { setTeacherCode(e.target.value); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleTeacherSubmit()}
                    placeholder="Nhập mã giáo viên..."
                    autoFocus
                    className="w-full pl-11 pr-12 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 font-mono text-lg tracking-widest outline-none focus:border-indigo-400 focus:bg-white/15 transition-all"
                  />
                  <button onClick={() => setShowCode(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60">
                    {showCode ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {error && <p className="text-rose-400 text-sm font-medium flex items-center gap-2">⚠️ {error}</p>}

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleTeacherSubmit}
                  className="w-full py-4 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white font-black text-lg rounded-2xl hover:from-indigo-400 hover:to-indigo-600 transition-all shadow-2xl shadow-indigo-500/30 flex items-center justify-center gap-3">
                  <ShieldCheck size={22} /> VÀO DASHBOARD GIÁO VIÊN
                </motion.button>
                <button onClick={() => { setStep('role'); setError(''); }} className="w-full text-white/40 text-sm font-medium hover:text-white/60 transition-colors">← Quay lại</button>
              </div>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
