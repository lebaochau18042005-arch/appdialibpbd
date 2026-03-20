import { Link } from 'react-router-dom';
import { BookOpen, Map, Target, Award, ArrowRight, Settings, LayoutDashboard, Users, FileText, Sparkles, ShieldCheck, History } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { QuizAttempt, UserProfile } from '../types';
import { cn } from '../utils/cn';
import { useAuth } from '../contexts/AuthContext';
import { examService } from '../services/examService';

export default function Home() {
  const { user } = useAuth();
  const [recentAttempts, setRecentAttempts] = useState<QuizAttempt[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      const history = JSON.parse(localStorage.getItem('examGeoHistory') || '[]');
      setRecentAttempts(history.slice(0, 3));
      
      const savedProfile = localStorage.getItem('examGeoProfile');
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
    }
  }, [user]);

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
      <section className="bg-emerald-600 text-white rounded-3xl p-8 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-500 opacity-50 blur-3xl"></div>
        <div className="relative z-10 max-w-2xl">
          {(profile?.name || user?.displayName) ? (
            <>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl md:text-4xl font-bold mb-2"
              >
                Chào {profile?.name || user?.displayName}, sẵn sàng ôn thi chưa?
              </motion.h1>
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
              Ôn thi Địa lí THPT Quốc gia 2025
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
    </motion.div>
  );
}
