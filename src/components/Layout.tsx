import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, History, Home, Map, User, Users, LogIn, LogOut, Settings, Compass, ShieldCheck, X, KeyRound } from 'lucide-react';
import { cn } from '../utils/cn';
import { useAuth } from '../contexts/AuthContext';
import ApiKeyModal from './ApiKeyModal';
import NotificationBell from './NotificationBell';

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { user, isTeacherMode, logout, loginWithTeacherCode, logoutTeacherMode } = useAuth();
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');

  useEffect(() => {
    const savedKey = localStorage.getItem('GEMINI_API_KEY');
    if (!savedKey) {
      setIsApiKeyModalOpen(true);
    }
  }, []);

  const handleCodeSubmit = () => {
    const ok = loginWithTeacherCode(codeInput);
    if (ok) {
      setIsLoginModalOpen(false);
      setCodeInput('');
      setCodeError('');
    } else {
      setCodeError('Mã không đúng. Vui lòng thử lại.');
    }
  };

  const studentNavItems = [
    { path: '/', label: 'Trang Chủ', icon: Home },
    { path: '/assigned', label: 'Đề Được Giao', icon: BookOpen, badge: true },
    { path: '/exam', label: 'Thi Thử', icon: Map },
    { path: '/practice', label: 'Luyện Tập', icon: Compass },
    { path: '/history', label: 'Lịch Sử', icon: History },
    { path: '/profile', label: 'Cấu Hình', icon: User },
  ];

  const teacherNavItems = [
    { path: '/', label: 'Trang chủ', icon: Home },
    { path: '/practice', label: 'Luyện tập', icon: BookOpen },
    { path: '/exam', label: 'Thi thử', icon: Map },
    { path: '/history', label: 'Lịch sử', icon: History },
    { path: '/learning-path', label: 'Lộ trình', icon: Compass },
    { path: '/profile', label: 'Cấu hình', icon: User },
    { path: '/teacher', label: 'Giáo viên', icon: Users },
  ];

  const navItems = isTeacherMode ? teacherNavItems : studentNavItems;

  // Count pending assignments for badge
  const [assignedCount, setAssignedCount] = useState(0);
  useEffect(() => {
    if (isTeacherMode) return;
    const profile = (() => { try { return JSON.parse(localStorage.getItem('examGeoProfile') || '{}'); } catch { return {}; } })();
    const className = (profile.className || '').trim().toLowerCase();
    if (!className) return;
    const doneIds = new Set(
      (() => { try { return JSON.parse(localStorage.getItem('geo_pro_local_attempts') || '[]').map((a: any) => a.examId).filter(Boolean); } catch { return []; } })()
    );
    // Read from localStorage assignments for badge
    const lsA = (() => { try { return JSON.parse(localStorage.getItem('geo_pro_assignments') || '[]'); } catch { return []; } })();
    const pending = lsA.filter((a: any) => {
      const tc = (a.targetClass || '').toLowerCase();
      return (tc === className || tc === 'all') && !doneIds.has(a.examId);
    });
    setAssignedCount(pending.length);
  }, [isTeacherMode]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-emerald-600 text-white shadow-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <Map className="w-6 h-6" />
            <span>ExamGeography</span>
          </Link>
          <nav className="hidden md:flex gap-6 items-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              const showBadge = (item as any).badge && assignedCount > 0;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "relative flex items-center gap-2 px-3 py-2 rounded-lg transition-colors font-medium",
                    isActive ? "bg-emerald-700 text-white" : "text-emerald-100 hover:bg-emerald-500 hover:text-white"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                  {showBadge && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                      {assignedCount > 9 ? '9+' : assignedCount}
                    </span>
                  )}
                </Link>
              );
            })}

            <button
              onClick={() => setIsApiKeyModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all font-bold text-sm shadow-sm bg-white"
              title="Cài đặt API Key AI"
            >
              <Settings className="w-4 h-4" />
              Lấy API key để sử dụng app
            </button>
            {(user || isTeacherMode) ? (
              <div className="flex items-center gap-2">
                {isTeacherMode && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-yellow-400 text-yellow-900 rounded-lg text-xs font-bold">
                    <ShieldCheck className="w-3 h-3" /> Giáo viên
                  </span>
                )}
                {/* Notification Bell — only for students (not teacher mode) */}
                {!isTeacherMode && <NotificationBell />}
                <button
                  onClick={() => { logoutTeacherMode(); logout(); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors font-medium text-emerald-100 hover:bg-emerald-500 hover:text-white"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Notification Bell for guests too if they have a profile */}
                <NotificationBell />
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-emerald-600 rounded-lg transition-colors font-bold shadow-sm hover:bg-emerald-50"
                >
                  <LogIn className="w-4 h-4" />
                  Đăng nhập
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6">
        {children}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe z-10">
        <div className="flex justify-around p-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-xl min-w-[64px]",
                  isActive ? "text-emerald-600" : "text-slate-500 hover:text-emerald-500"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      
      <ApiKeyModal isOpen={isApiKeyModalOpen} onClose={() => setIsApiKeyModalOpen(false)} />

      {/* Teacher Code Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black text-slate-900">Mã Giáo Viên</h2>
              </div>
              <button onClick={() => { setIsLoginModalOpen(false); setCodeError(''); setCodeInput(''); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-slate-500 text-sm mb-4">Nhập mã bí mật để truy cập bảng điều khiển giáo viên.</p>
            <input
              type="password"
              value={codeInput}
              onChange={e => { setCodeInput(e.target.value); setCodeError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleCodeSubmit()}
              placeholder="Nhập mã giáo viên..."
              className="w-full p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none mb-2 text-center text-lg font-mono tracking-widest"
              autoFocus
            />
            {codeError && <p className="text-red-500 text-sm text-center mb-2">{codeError}</p>}
            <button
              onClick={handleCodeSubmit}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors mt-2"
            >
              Xác nhận
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
