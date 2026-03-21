import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Save, CheckCircle2, RefreshCw, Lock, LogIn } from 'lucide-react';
import { UserProfile } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { examService } from '../services/examService';
import { cn } from '../utils/cn';

export default function Profile() {
  const { user, loading: authLoading, login } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({ name: '', className: '', school: '', targetScore: '' });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const LS_PROFILE_KEY = 'geo_pro_guest_profile';

  useEffect(() => {
    if (user && !user.isAnonymous) {
      loadProfile();
    } else {
      // Guest: load from localStorage
      const saved = localStorage.getItem(LS_PROFILE_KEY);
      if (saved) setProfile(JSON.parse(saved));
      setLoading(false);
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await examService.getProfile(user.uid);
      if (data) {
        setProfile(data);
      } else {
        setProfile({
          name: user.displayName || '',
          email: user.email || '',
          className: '',
          school: '',
          targetScore: ''
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || user.isAnonymous) {
      // Guest: save to localStorage
      localStorage.setItem(LS_PROFILE_KEY, JSON.stringify(profile));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      return;
    }
    try {
      await examService.updateProfile(user.uid, profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error(error);
    }
  };

  if (authLoading || (user && loading)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto pb-20 md:pb-0"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Cấu hình học sinh</h1>
          <p className="text-slate-500">Cập nhật thông tin và mục tiêu học tập (Theo TT 17/BGD)</p>
        </div>
      </div>

      {(!user || user.isAnonymous) && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3 text-sm text-amber-700">
          <span className="text-lg">💡</span>
          <p>Bạn đang dùng tư cách khách. Thông tin sẽ lưu trên trình duyệt này. <button onClick={login} className="font-bold underline">Đăng nhập Google</button> để đồng bộ nhiều thiết bị.</p>
        </div>
      )}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Họ và tên</label>
            <input
              type="text"
              value={profile.name}
              onChange={e => setProfile({...profile, name: e.target.value})}
              placeholder="Nhập tên của bạn..."
              className="w-full p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Lớp</label>
            <input
              type="text"
              value={profile.className}
              onChange={e => setProfile({...profile, className: e.target.value})}
              placeholder="Ví dụ: 12A1"
              className="w-full p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Trường THPT</label>
            <input
              type="text"
              value={profile.school || ''}
              onChange={e => setProfile({...profile, school: e.target.value})}
              placeholder="Ví dụ: THPT Chuyên..."
              className="w-full p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Mục tiêu điểm số (Địa lí)</label>
            <input
              type="number"
              step="0.25"
              min="0"
              max="10"
              value={profile.targetScore || ''}
              onChange={e => setProfile({...profile, targetScore: e.target.value})}
              placeholder="Ví dụ: 8.5"
              className="w-full p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
            />
          </div>
          {user && !user.isAnonymous && user.email === 'binhanchau2000@gmail.com' && (
            <div className="md:col-span-2 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
              <label className="block text-sm font-bold text-indigo-700 mb-2">Quyền hạn (Admin Tool)</label>
              <div className="flex gap-4">
                <button
                  onClick={() => setProfile({...profile, role: 'student'})}
                  className={cn(
                    "flex-1 py-2 rounded-lg font-bold transition-all",
                    profile.role === 'student' ? "bg-indigo-600 text-white" : "bg-white text-indigo-600 border border-indigo-200"
                  )}
                >
                  Học sinh
                </button>
                <button
                  onClick={() => setProfile({...profile, role: 'teacher'})}
                  className={cn(
                    "flex-1 py-2 rounded-lg font-bold transition-all",
                    profile.role === 'teacher' ? "bg-indigo-600 text-white" : "bg-white text-indigo-600 border border-indigo-200"
                  )}
                >
                  Giáo viên
                </button>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={handleSave}
          className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-sm mt-4"
        >
          {saved ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Đã lưu thành công!
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Lưu cấu hình
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
