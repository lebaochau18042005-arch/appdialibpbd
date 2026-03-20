import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, History, Home, Map, User, Users, LogIn, LogOut, Settings } from 'lucide-react';
import { cn } from '../utils/cn';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import ApiKeyModal from './ApiKeyModal';

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { user, profile, login, logout } = useAuth();
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('GEMINI_API_KEY');
    if (!savedKey) {
      setIsApiKeyModalOpen(true);
    }
  }, []);

  const navItems = [
    { path: '/', label: 'Trang chủ', icon: Home },
    { path: '/practice', label: 'Luyện tập', icon: BookOpen },
    { path: '/exam', label: 'Thi thử', icon: Map },
    { path: '/history', label: 'Lịch sử', icon: History },
    { path: '/profile', label: 'Cấu hình', icon: User },
    { path: '/teacher', label: 'Giáo viên', icon: Users },
  ];

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
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors font-medium",
                    isActive ? "bg-emerald-700 text-white" : "text-emerald-100 hover:bg-emerald-500 hover:text-white"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
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
            {user ? (
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors font-medium text-emerald-100 hover:bg-emerald-500 hover:text-white"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </button>
            ) : (
              <button
                onClick={login}
                className="flex items-center gap-2 px-4 py-2 bg-white text-emerald-600 rounded-lg transition-colors font-bold shadow-sm hover:bg-emerald-50"
              >
                <LogIn className="w-4 h-4" />
                Đăng nhập
              </button>
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
    </div>
  );
}
