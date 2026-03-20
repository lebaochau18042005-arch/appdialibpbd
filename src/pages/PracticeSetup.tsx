import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpen, Target, Play } from 'lucide-react';
import { lessons, topics } from '../data';
import { cn } from '../utils/cn';
import AITutorChatbot from '../components/ai/AITutorChatbot';

export default function PracticeSetup() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') as 'lesson' | 'topic' || 'lesson';
  
  const [mode, setMode] = useState<'lesson' | 'topic'>(initialMode);
  const [selection, setSelection] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [questionCount, setQuestionCount] = useState<string>('20');
  const [useAI, setUseAI] = useState(false);
  const navigate = useNavigate();

  const handleStart = () => {
    if (!selection) return;
    navigate(`/quiz?mode=${mode}&filter=${encodeURIComponent(selection)}&count=${questionCount}&useAI=${useAI}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto pb-20 md:pb-0"
    >
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Thiết lập bài luyện tập</h1>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">Chọn chế độ luyện tập</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => { setMode('lesson'); setSelection(''); }}
              className={cn(
                "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                mode === 'lesson' ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 hover:border-emerald-200 text-slate-600"
              )}
            >
              <BookOpen className="w-6 h-6 mb-2" />
              <span className="font-medium">Theo bài học</span>
            </button>
            <button
              onClick={() => { setMode('topic'); setSelection(''); }}
              className={cn(
                "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                mode === 'topic' ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 hover:border-emerald-200 text-slate-600"
              )}
            >
              <Target className="w-6 h-6 mb-2" />
              <span className="font-medium">Theo chủ đề</span>
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-700">
              {mode === 'lesson' ? 'Chọn bài học cụ thể' : 'Chọn chủ đề trọng tâm'}
            </label>
            <div className="relative">
              <input 
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-xs p-2 pl-8 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 w-40"
              />
              <Target className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {(mode === 'lesson' ? lessons : topics)
              .filter(item => item.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((item) => (
              <button
                key={item}
                onClick={() => setSelection(item)}
                className={cn(
                  "text-left p-4 rounded-xl border-2 transition-all text-sm font-medium",
                  selection === item 
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm" 
                    : "border-slate-100 bg-slate-50 text-slate-600 hover:border-emerald-200 hover:bg-white"
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Số lượng câu hỏi
          </label>
          <select
            value={questionCount}
            onChange={(e) => setQuestionCount(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow bg-white"
          >
            <option value="10">10 câu</option>
            <option value="20">20 câu</option>
            <option value="30">30 câu</option>
            <option value="40">40 câu</option>
            <option value="all">Tất cả</option>
          </select>
        </div>

        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center">
              <input 
                type="checkbox" 
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </div>
            <div className="flex-1">
              <span className="text-sm font-bold text-emerald-800 block">Sử dụng AI tạo câu hỏi mới</span>
              <span className="text-xs text-emerald-600">AI sẽ biên soạn câu hỏi bám sát nội dung đã chọn theo cấu trúc 2025.</span>
            </div>
          </label>
        </div>

        <button
          onClick={handleStart}
          disabled={!selection}
          className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
        >
          <Play className="w-5 h-5" />
          Bắt đầu làm bài
        </button>
      </div>

      <AITutorChatbot />
    </motion.div>
  );
}
