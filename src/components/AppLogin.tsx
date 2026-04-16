import { useState } from 'react';
import { Lock, User, KeyRound, ArrowRight } from 'lucide-react';
import { ACCOUNTS } from '../data/accounts';
import { cn } from '../utils/cn';

interface AppLoginProps {
  onLoginSuccess: () => void;
}

export default function AppLogin({ onLoginSuccess }: AppLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const account = ACCOUNTS.find(
      acc => acc.username === username.trim() && acc.password === password
    );

    if (account) {
      setError('');
      onLoginSuccess();
    } else {
      setError('Tài khoản hoặc mật khẩu không đúng!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: '#060d1a' }}>
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-20 pointer-events-none" style={{ background: '#0ea5e9' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-20 pointer-events-none" style={{ background: '#14b8a6' }} />

      <form 
        onSubmit={handleLogin}
        className="relative z-10 w-full max-w-sm p-8 rounded-3xl"
        style={{
          background: 'rgba(11,22,40,0.85)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(0,191,255,0.2)',
          boxShadow: '0 0 40px rgba(0,191,255,0.1), 0 20px 40px rgba(0,0,0,0.5)',
        }}
      >
        <div className="flex flex-col items-center mb-8">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{
              background: 'linear-gradient(135deg, rgba(14,165,233,0.2), rgba(20,184,166,0.2))',
              border: '1px solid rgba(0,191,255,0.4)',
              boxShadow: '0 0 20px rgba(0,191,255,0.2)'
            }}
          >
            <Lock size={28} style={{ color: '#00bfff' }} />
          </div>
          <h1 className="text-2xl font-black text-white text-center">Bảo mật hệ thống</h1>
          <p className="text-sm mt-2 text-center" style={{ color: 'rgba(148,163,184,0.8)' }}>
            Vui lòng đăng nhập để tiếp tục sử dụng ứng dụng.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User size={18} style={{ color: 'rgba(0,191,255,0.5)' }} />
            </div>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Tên đăng nhập"
              className="w-full pl-10 pr-4 py-3 rounded-xl outline-none transition-all font-medium"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(0,191,255,0.2)',
                color: 'white',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(0,191,255,0.8)'}
              onBlur={e => e.target.style.borderColor = 'rgba(0,191,255,0.2)'}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <KeyRound size={18} style={{ color: 'rgba(0,191,255,0.5)' }} />
            </div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mật khẩu"
              className="w-full pl-10 pr-4 py-3 rounded-xl outline-none transition-all font-medium text-lg tracking-widest"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(0,191,255,0.2)',
                color: 'white',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(0,191,255,0.8)'}
              onBlur={e => e.target.style.borderColor = 'rgba(0,191,255,0.2)'}
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 text-center text-sm font-medium animate-pulse" style={{ color: '#f87171' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          style={{
            background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)',
            color: 'white',
            boxShadow: '0 4px 15px rgba(14,165,233,0.3)'
          }}
        >
          Mở ứng dụng
          <ArrowRight size={18} />
        </button>

        <div className="mt-8 text-center text-xs font-mono" style={{ color: 'rgba(148,163,184,0.4)', letterSpacing: '2px' }}>
          APP PROTECTION GATE
        </div>
      </form>
    </div>
  );
}
