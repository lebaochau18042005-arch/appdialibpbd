import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Key, X, CheckCircle2, AlertCircle, Link as LinkIcon } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MODELS = [
  { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro', desc: 'Chất lượng cao nhất, logic phức tạp (Mặc định)' },
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash', desc: 'Nhanh, hiệu suất cao' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'Bản ổn định, dự phòng' }
];

export default function ApiKeyModal({ isOpen, onClose }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-3-pro-preview');

  useEffect(() => {
    if (isOpen) {
      const savedKey = localStorage.getItem('GEMINI_API_KEY') || '';
      const savedModel = localStorage.getItem('GEMINI_MODEL') || 'gemini-3-pro-preview';
      setApiKey(savedKey);
      setSelectedModel(savedModel);
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('GEMINI_API_KEY', apiKey.trim());
    localStorage.setItem('GEMINI_MODEL', selectedModel);
    onClose();
    // Dispatch event to notify AI service of the change
    window.dispatchEvent(new Event('apiKeyChanged'));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
                  <Key size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">Cấu hình Google AI</h3>
                  <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">Dành cho tạo đề và AI Tutor</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-8">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Google Gemini API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Nhập API Key bắt đầu bằng AIza..."
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-slate-800"
                />
                <div className="mt-3 text-sm flex gap-1 items-center bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                  <span className="text-blue-700">Chưa có API Key?</span>
                  <a href="https://aistudio.google.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline flex items-center gap-1 ml-1 cursor-pointer">
                    Lấy mã miễn phí tại đây <LinkIcon size={14} />
                  </a>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Lựa chọn Model AI</label>
                <div className="space-y-3">
                  {MODELS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedModel(m.id)}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex justify-between items-center ${selectedModel === m.id ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-slate-100 hover:border-emerald-200 hover:bg-slate-50'}`}
                    >
                      <div>
                        <div className={`font-bold ${selectedModel === m.id ? 'text-emerald-700' : 'text-slate-700'}`}>{m.name}</div>
                        <div className="text-xs font-medium text-slate-500 mt-1">{m.desc}</div>
                      </div>
                      {selectedModel === m.id && <CheckCircle2 className="text-emerald-500 shrink-0 ml-4" size={24} />}
                    </button>
                  ))}
                </div>
              </div>

              {!apiKey && (
                <div className="p-4 bg-rose-50 text-rose-600 text-sm rounded-2xl flex gap-3 items-start border border-rose-100 font-medium leading-relaxed">
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  Bạn cần nhập API Key để sử dụng các tính năng tạo đề thi thông minh và Trợ lý AI. Nếu không có, một số tính năng sẽ không hoạt động.
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
              <button 
                onClick={onClose} 
                className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-200 rounded-xl transition-colors"
              >
                Đóng
              </button>
              <button 
                onClick={handleSave} 
                disabled={!apiKey.trim()}
                className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
              >
                LƯU CẤU HÌNH
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
