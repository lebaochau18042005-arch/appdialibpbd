import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, School, BookOpen, ArrowRight, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LS_PROFILE_KEY = 'examGeoProfile';

function isProfileComplete(profile: any): boolean {
  return !!(profile?.name?.trim() && profile?.className?.trim());
}

export default function StudentProfileGate({ children }: { children: React.ReactNode }) {
  const { isTeacherMode } = useAuth();
  const [showGate, setShowGate] = useState(false);
  const [name, setName] = useState('');
  const [className, setClassName] = useState('');
  const [school, setSchool] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isTeacherMode) {
      setShowGate(false);
      return;
    }
    try {
      const saved = JSON.parse(localStorage.getItem(LS_PROFILE_KEY) || '{}');
      if (!isProfileComplete(saved)) {
        setShowGate(true);
        setName(saved.name || '');
        setClassName(saved.className || '');
        setSchool(saved.school || '');
      }
    } catch {
      setShowGate(true);
    }
  }, [isTeacherMode]);

  const handleSubmit = () => {
    if (!name.trim()) { setError('Vui lòng nhập họ và tên của bạn.'); return; }
    if (!className.trim()) { setError('Vui lòng nhập lớp học của bạn.'); return; }

    setSaving(true);
    const profile = { name: name.trim(), className: className.trim(), school: school.trim() };
    localStorage.setItem(LS_PROFILE_KEY, JSON.stringify(profile));
    setTimeout(() => {
      setSaving(false);
      setShowGate(false);
    }, 400);
  };

  return (
    <>
      {children}

      <AnimatePresence>
        {showGate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center p-4"
            style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #064e3b 100%)' }}
          >
            {/* Animated background blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <motion.div
              initial={{ scale: 0.85, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, y: 30, opacity: 0 }}
              transition={{ type: 'spring', damping: 24, stiffness: 280 }}
              className="relative bg-white/10 backdrop-blur-2xl rounded-[2.5rem] p-10 w-full max-w-md border border-white/20 shadow-2xl"
            >
              {/* Logo */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-indigo-500 shadow-2xl mb-4">
                  <MapPin size={36} className="text-white" />
                </div>
                <h1 className="text-3xl font-black text-white tracking-tight">ExamGeography</h1>
                <p className="text-white/60 text-sm mt-1 font-medium">Ôn thi Địa lí THPT 2025</p>
              </div>

              <div className="space-y-4">
                <div className="text-center mb-6">
                  <p className="text-white font-bold text-lg">Chào mừng bạn! 👋</p>
                  <p className="text-white/60 text-sm mt-1">Vui lòng điền thông tin để bắt đầu</p>
                </div>

                {/* Name field */}
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => { setName(e.target.value); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    placeholder="Họ và tên của bạn *"
                    autoFocus
                    className="w-full pl-11 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 font-medium outline-none focus:border-emerald-400 focus:bg-white/15 transition-all"
                  />
                </div>

                {/* Class field */}
                <div className="relative">
                  <BookOpen size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    value={className}
                    onChange={e => { setClassName(e.target.value); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    placeholder="Lớp học của bạn (VD: 12A1) *"
                    className="w-full pl-11 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 font-medium outline-none focus:border-emerald-400 focus:bg-white/15 transition-all"
                  />
                </div>

                {/* School field (optional) */}
                <div className="relative">
                  <School size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    value={school}
                    onChange={e => setSchool(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    placeholder="Trường học (không bắt buộc)"
                    className="w-full pl-11 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 font-medium outline-none focus:border-emerald-400 focus:bg-white/15 transition-all"
                  />
                </div>

                {error && (
                  <p className="text-rose-400 text-sm font-medium flex items-center gap-2">
                    <span>⚠️</span> {error}
                  </p>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={saving}
                  className="w-full py-4 mt-2 bg-gradient-to-r from-emerald-500 to-indigo-500 text-white font-black text-lg rounded-2xl hover:from-emerald-400 hover:to-indigo-400 transition-all shadow-2xl shadow-emerald-500/30 flex items-center justify-center gap-3 disabled:opacity-60"
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>BẮT ĐẦU HỌC <ArrowRight size={22} /></>
                  )}
                </motion.button>

                <p className="text-white/40 text-xs text-center">
                  Thông tin của bạn được lưu cục bộ trên thiết bị này để giáo viên có thể theo dõi tiến trình học tập.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
