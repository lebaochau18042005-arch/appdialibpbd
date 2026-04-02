import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BookOpen, History, Home, Map, User, Users, LogIn, LogOut,
  Settings, Compass, ShieldCheck, X, KeyRound, Library, Globe
} from 'lucide-react';
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('GEMINI_API_KEY');
    if (!savedKey) setIsApiKeyModalOpen(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
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
    { path: '/library', label: 'Thư Viện', icon: Library },
  ];

  const teacherNavItems = [
    { path: '/', label: 'Trang chủ', icon: Home },
    { path: '/practice', label: 'Luyện tập', icon: BookOpen },
    { path: '/exam', label: 'Thi thử', icon: Map },
    { path: '/history', label: 'Lịch sử', icon: History },
    { path: '/library', label: 'Thư viện', icon: Library },
    { path: '/teacher', label: 'Giáo viên', icon: Users },
  ];

  const navItems = isTeacherMode ? teacherNavItems : studentNavItems;

  const [assignedCount, setAssignedCount] = useState(0);
  useEffect(() => {
    if (isTeacherMode) return;
    const profile = (() => { try { return JSON.parse(localStorage.getItem('examGeoProfile') || '{}'); } catch { return {}; } })();
    const className = (profile.className || '').trim().toLowerCase();
    if (!className) return;
    const doneIds = new Set(
      (() => { try { return JSON.parse(localStorage.getItem('geo_pro_local_attempts') || '[]').map((a: any) => a.examId).filter(Boolean); } catch { return []; } })()
    );
    const lsA = (() => { try { return JSON.parse(localStorage.getItem('geo_pro_assignments') || '[]'); } catch { return []; } })();
    const pending = lsA.filter((a: any) => {
      const tc = (a.targetClass || '').toLowerCase();
      return (tc === className || tc === 'all') && !doneIds.has(a.examId);
    });
    setAssignedCount(pending.length);
  }, [isTeacherMode]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#060d1a', color: '#e2e8f0' }}>

      {/* === ANIMATED BACKGROUND === */}
      <div className="geo-grid-bg" />
      <div className="geo-orb geo-orb-1" />
      <div className="geo-orb geo-orb-2" />

      {/* ==================== HEADER ==================== */}
      <header
        className={cn(
          "geo-header transition-all duration-300",
          scrolled && "shadow-[0_8px_40px_rgba(0,0,0,0.7)]"
        )}
      >
        {/* Top micro-bar: author credit */}
        <div
          className="hidden md:flex items-center justify-center gap-2 py-1 px-4 text-[10px] font-mono tracking-widest"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(0,191,255,0.06), transparent)',
            borderBottom: '1px solid rgba(0,191,255,0.08)',
            color: 'rgba(0,191,255,0.5)'
          }}
        >
          <span>📍</span>
          <span>Thiết kế bởi</span>
          <strong className="text-sky-400" style={{ color: '#7dd3fc' }}>Lê Thị Thái</strong>
          <span>•</span>
          <span>THPT Bình Phú • Bình Dương</span>
          <span>•</span>
          <span>Zalo: 0916791779</span>
        </div>

        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="relative w-9 h-9 flex items-center justify-center">
              <div
                className="absolute inset-0 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(14,165,233,0.3), rgba(20,184,166,0.3))',
                  border: '1px solid rgba(0,191,255,0.4)',
                  boxShadow: '0 0 16px rgba(0,191,255,0.25)'
                }}
              />
              <Globe
                size={20}
                className="relative z-10 geo-logo-icon"
                style={{ color: '#00bfff', filter: 'drop-shadow(0 0 6px #00bfff)' }}
              />
            </div>
            <div className="leading-none">
              <span
                className="geo-logo text-lg"
                style={{
                  background: 'linear-gradient(135deg, #00bfff, #00ffcc)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 900,
                  letterSpacing: '-0.03em'
                }}
              >
                Địa Lí BP
              </span>
              <div className="text-[9px] font-mono tracking-[0.15em]" style={{ color: 'rgba(0,191,255,0.45)' }}>
                GEO·EXAM·PRO
              </div>
            </div>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              const showBadge = (item as any).badge && assignedCount > 0;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn('geo-nav-link', isActive && 'active')}
                >
                  <Icon size={15} />
                  {item.label}
                  {showBadge && (
                    <span
                      className="absolute -top-1 -right-1 w-4 h-4 text-white text-[9px] font-black rounded-full flex items-center justify-center"
                      style={{ background: '#ef4444', boxShadow: '0 0 8px rgba(239,68,68,0.7)' }}
                    >
                      {assignedCount > 9 ? '9+' : assignedCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-2 shrink-0">
            {/* API Key button */}
            <button
              onClick={() => setIsApiKeyModalOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all"
              style={{
                background: 'rgba(245,158,11,0.1)',
                border: '1px solid rgba(245,158,11,0.4)',
                color: '#fbbf24',
                boxShadow: '0 0 8px rgba(245,158,11,0.15)'
              }}
              title="Cài đặt API Key AI"
            >
              <Settings size={12} />
              API Key
            </button>

            {(user || isTeacherMode) ? (
              <div className="flex items-center gap-2">
                {isTeacherMode && (
                  <span
                    className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black"
                    style={{
                      background: 'rgba(250,204,21,0.15)',
                      border: '1px solid rgba(250,204,21,0.4)',
                      color: '#facc15',
                      boxShadow: '0 0 10px rgba(250,204,21,0.2)'
                    }}
                  >
                    <ShieldCheck size={12} /> Giáo viên
                  </span>
                )}
                {!isTeacherMode && <NotificationBell />}
                <button
                  onClick={() => { logoutTeacherMode(); logout(); }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                  style={{
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    color: 'rgba(252,165,165,0.8)'
                  }}
                >
                  <LogOut size={13} />
                  <span className="hidden md:inline">Đăng xuất</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <NotificationBell />
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all"
                  style={{
                    background: 'linear-gradient(135deg, rgba(14,165,233,0.2), rgba(20,184,166,0.2))',
                    border: '1px solid rgba(0,191,255,0.4)',
                    color: '#00bfff',
                    boxShadow: '0 0 12px rgba(0,191,255,0.15)'
                  }}
                >
                  <LogIn size={13} />
                  GV
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ==================== MAIN CONTENT ==================== */}
      <main className="flex-1 relative z-10 max-w-5xl w-full mx-auto p-4 md:p-6">
        {children}
      </main>

      {/* ==================== DESKTOP FOOTER CREDIT ==================== */}
      <footer className="hidden md:block relative z-10 geo-credit">
        ◈ Thiết kế bởi <strong style={{ color: '#7dd3fc' }}>Lê Thị Thái</strong> · THPT Bình Phú · Bình Dương · Zalo: 0916791779 ◈
      </footer>

      {/* ==================== MOBILE BOTTOM NAV ==================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 geo-bottom-nav pb-safe z-20">
        <div className="flex justify-around py-1.5 px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            const showBadge = (item as any).badge && assignedCount > 0;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn('geo-mobile-link', isActive && 'active')}
              >
                <div className="relative">
                  <Icon size={20} />
                  {showBadge && (
                    <span
                      className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 text-white text-[8px] font-black rounded-full flex items-center justify-center"
                      style={{ background: '#ef4444', boxShadow: '0 0 6px rgba(239,68,68,0.7)' }}
                    >
                      {assignedCount > 9 ? '!' : assignedCount}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '0.6rem', fontWeight: 600 }}>
                  {item.label.split(' ')[0]}
                </span>
              </Link>
            );
          })}
        </div>
        {/* Mobile credit bar */}
        <div
          className="text-center pb-1 text-[9px] font-mono"
          style={{ color: 'rgba(0,191,255,0.25)' }}
        >
          ⬡ Địa Lí BP · Lê Thị Thái · THPT Bình Phú
        </div>
      </nav>

      {/* ==================== API KEY MODAL ==================== */}
      <ApiKeyModal isOpen={isApiKeyModalOpen} onClose={() => setIsApiKeyModalOpen(false)} />

      {/* ==================== TEACHER LOGIN MODAL ==================== */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
          <div
            className="w-full max-w-sm p-8 rounded-3xl"
            style={{
              background: 'rgba(11,22,40,0.95)',
              border: '1px solid rgba(0,191,255,0.3)',
              boxShadow: '0 0 60px rgba(0,191,255,0.12), 0 32px 80px rgba(0,0,0,0.6)',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(14,165,233,0.25), rgba(20,184,166,0.25))',
                    border: '1px solid rgba(0,191,255,0.4)',
                  }}
                >
                  <KeyRound size={18} style={{ color: '#00bfff' }} />
                </div>
                <div>
                  <h2 className="font-black text-white text-lg">Mã Giáo Viên</h2>
                  <p style={{ fontSize: '0.7rem', color: 'rgba(0,191,255,0.5)', fontFamily: 'monospace' }}>TEACHER ACCESS</p>
                </div>
              </div>
              <button
                onClick={() => { setIsLoginModalOpen(false); setCodeError(''); setCodeInput(''); }}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                style={{ color: 'rgba(148,163,184,0.6)', background: 'rgba(255,255,255,0.05)' }}
              >
                <X size={16} />
              </button>
            </div>

            <p style={{ color: 'rgba(148,163,184,0.7)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Nhập mã bí mật để truy cập bảng điều khiển giáo viên.
            </p>

            <input
              type="password"
              value={codeInput}
              onChange={e => { setCodeInput(e.target.value); setCodeError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleCodeSubmit()}
              placeholder="••••••••"
              className="geo-input text-center text-xl font-mono tracking-[0.3em] mb-3"
              autoFocus
            />

            {codeError && (
              <p className="text-center text-sm mb-2" style={{ color: '#f87171' }}>{codeError}</p>
            )}

            <button
              onClick={handleCodeSubmit}
              className="btn-geo-primary w-full text-sm"
              style={{
                background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)',
                padding: '0.875rem',
                borderRadius: '0.875rem',
                border: 'none',
                color: 'white',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 20px rgba(14,165,233,0.4)',
              }}
            >
              Xác nhận
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
