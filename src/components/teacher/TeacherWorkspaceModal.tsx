import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  User,
  Mail,
  School,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
  BookOpen,
  RotateCcw
} from 'lucide-react';
import {
  teacherWorkspaceService,
  isValidEmail,
  normalizeTeacherEmail
} from '../../services/teacherWorkspaceService';
import { TeacherWorkspace } from '../../types';
import { cn } from '../../utils/cn';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onWorkspaceChanged: (workspace: TeacherWorkspace) => void;
  initialEmail?: string;
  initialName?: string;
  forceRequired?: boolean;
}

export default function TeacherWorkspaceModal({
  isOpen,
  onClose,
  onWorkspaceChanged,
  initialEmail = '',
  initialName = '',
  forceRequired = false,
}: Props) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [error, setError] = useState('');
  const [recents, setRecents] = useState<TeacherWorkspace[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const activeEmail = teacherWorkspaceService.getActiveTeacherEmail() || initialEmail;
    setEmail(activeEmail);
    setName(initialName || '');

    // Nạp thông tin đã lưu
    if (activeEmail) {
      teacherWorkspaceService.getTeacherProfile(activeEmail).then(p => {
        if (p) {
          setName(p.name || initialName || '');
          setSchool(p.school || '');
        }
      });
    }

    setRecents(teacherWorkspaceService.getRecentTeachers());
    setError('');
  }, [isOpen, initialEmail, initialName]);

  if (!isOpen) return null;

  const handleQuickAppendGmail = () => {
    if (!email.includes('@')) {
      setEmail(prev => `${prev.trim()}@gmail.com`);
    }
  };

  const handleSelectRecent = async (ws: TeacherWorkspace) => {
    setIsSubmitting(true);
    await teacherWorkspaceService.setActiveWorkspace(ws);
    onWorkspaceChanged(ws);
    setIsSubmitting(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = normalizeTeacherEmail(email);

    if (!normalizedEmail) {
      setError('Vui lòng nhập địa chỉ Gmail của Thầy/Cô');
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      setError('Địa chỉ email không đúng định dạng. Ví dụ: giaovien@gmail.com');
      return;
    }

    setIsSubmitting(true);
    try {
      const workspace: TeacherWorkspace = {
        email: normalizedEmail,
        name: name.trim() || 'Giáo viên',
        school: school.trim() || undefined,
        lastActiveAt: new Date().toISOString(),
      };

      await teacherWorkspaceService.setActiveWorkspace(workspace);
      onWorkspaceChanged(workspace);
      onClose();
    } catch (err) {
      setError('Có lỗi khi lưu không gian làm việc. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={() => !forceRequired && onClose()}
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 16 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-100"
      >
        {/* Header Decorator */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-emerald-600 px-6 py-6 text-white relative">
          {!forceRequired && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
            >
              <X size={18} />
            </button>
          )}

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-md text-amber-300">
              <ShieldCheck size={22} />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-200">
                Không Gian Làm Việc Giáo Viên
              </span>
              <h2 className="text-lg font-black text-white leading-tight">
                Thiết Lập Tài Khoản Gmail Riêng Biệt
              </h2>
            </div>
          </div>
          <p className="text-xs text-indigo-100 font-medium leading-relaxed">
            Mỗi Thầy/Cô sẽ có một không gian độc lập: ngân hàng đề thi, bài giao học sinh, lịch sử làm bài và bảng tính Google Sheet lưu trữ riêng biệt theo Gmail này.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-700 text-xs font-bold">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Mail size={14} className="text-indigo-600" />
                Địa chỉ Gmail của Thầy / Cô <span className="text-rose-500">*</span>
              </span>
              {!email.includes('@') && email.length > 2 && (
                <button
                  type="button"
                  onClick={handleQuickAppendGmail}
                  className="text-[11px] text-indigo-600 font-bold hover:underline"
                >
                  + @gmail.com
                </button>
              )}
            </label>
            <div className="relative">
              <input
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Ví dụ: nguyenvana.dialy@gmail.com"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
                required
              />
            </div>
            <p className="text-[11px] text-slate-500">
              💡 Học sinh khi nộp bài thuộc đề do Thầy/Cô tạo sẽ tự động gửi kết quả về Google Sheet của tài khoản Gmail này.
            </p>
          </div>

          {/* Name & School Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <User size={14} className="text-indigo-600" />
                Họ và tên Giáo viên
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="VD: Thầy Nguyễn Văn A"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <School size={14} className="text-indigo-600" />
                Trường / Đơn vị công tác
              </label>
              <input
                type="text"
                value={school}
                onChange={e => setSchool(e.target.value)}
                placeholder="VD: THPT Chuyên Bình Phước"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-2xl grid grid-cols-3 gap-2 text-center">
            <div className="space-y-1">
              <div className="w-7 h-7 mx-auto rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <BookOpen size={14} />
              </div>
              <p className="text-[10px] font-black text-slate-700">Ngân hàng đề</p>
              <p className="text-[9px] text-slate-500">Độc lập theo tài khoản</p>
            </div>
            <div className="space-y-1">
              <div className="w-7 h-7 mx-auto rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <FileSpreadsheet size={14} />
              </div>
              <p className="text-[10px] font-black text-slate-700">Google Sheet</p>
              <p className="text-[9px] text-slate-500">Lưu về trang tính riêng</p>
            </div>
            <div className="space-y-1">
              <div className="w-7 h-7 mx-auto rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <ShieldCheck size={14} />
              </div>
              <p className="text-[10px] font-black text-slate-700">Chấm điểm & Giám sát</p>
              <p className="text-[9px] text-slate-500">Báo cáo riêng lớp mình</p>
            </div>
          </div>

          {/* Recent Accounts on this Device */}
          {recents.length > 1 && (
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <RotateCcw size={12} /> Tài khoản đã từng dùng trên máy này
              </span>
              <div className="flex flex-wrap gap-1.5">
                {recents.map(r => (
                  <button
                    key={r.email}
                    type="button"
                    onClick={() => handleSelectRecent(r)}
                    className={cn(
                      'text-xs px-2.5 py-1.5 rounded-lg border font-bold transition-all text-left truncate max-w-[240px]',
                      r.email.toLowerCase() === email.toLowerCase()
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    )}
                  >
                    {r.name ? `${r.name} (${r.email})` : r.email}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            {!forceRequired && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Đóng
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting || !email.trim()}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-200 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>Đang lưu...</>
              ) : (
                <>
                  <span>Kích hoạt không gian riêng</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
