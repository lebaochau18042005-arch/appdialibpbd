import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpen, Target, Play, FileCheck2, FileText, Search, CheckSquare, Zap } from 'lucide-react';
import { lessons, topics } from '../data';
import { cn } from '../utils/cn';
import AITutorChatbot from '../components/ai/AITutorChatbot';
import { libraryService, LibraryFile } from '../services/libraryService';

export default function PracticeSetup() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') as 'lesson' | 'topic' | 'format' || 'lesson';
  
  const [mode, setMode] = useState<'lesson' | 'topic' | 'format'>(initialMode);
  const [selection, setSelection] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [questionCount, setQuestionCount] = useState<string>('20');
  const [useAI, setUseAI] = useState(false);
  const [libraryFiles, setLibraryFiles] = useState<LibraryFile[]>([]);
  const [selectedLibraryFileId, setSelectedLibraryFileId] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch files mapping
    const unsubFiles = libraryService.subscribeToFiles(setLibraryFiles);
    return () => unsubFiles();
  }, []);

  const handleStart = () => {
    if (!selection) return;
    const url = `/quiz?mode=${mode}&filter=${encodeURIComponent(selection)}&count=${questionCount}&useAI=${useAI}&libraryFileId=${selectedLibraryFileId}`;
    navigate(url);
  };

  const getFormatDisplay = (fmt: string) => {
    if (fmt === 'multiple_choice') return 'Trắc nghiệm nhiều lựa chọn';
    if (fmt === 'true_false') return 'Trắc nghiệm đúng/sai';
    if (fmt === 'short_answer') return 'Trả lời ngắn / Điền khuyết';
    return fmt;
  };
  
  const formats = ['multiple_choice', 'true_false', 'short_answer'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto pb-20 md:pb-0"
    >
      <h1 className="text-2xl font-bold text-slate-800 mb-4">Thiết lập bài luyện tập</h1>

      {/* Quick-start Đúng/Sai banner */}
      <motion.div
        initial={{ scale: 0.97, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 shadow-lg shadow-emerald-200 cursor-pointer group"
        onClick={() => {
          setMode('format');
          setSelection('true_false');
          window.scrollTo({ top: 200, behavior: 'smooth' });
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-white/30 transition-colors">
            <CheckSquare className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-white font-black text-base">Luyện dạng ĐÚng/Sai (Phần II)</span>
              <span className="text-[10px] font-black bg-white/25 text-white px-2 py-0.5 rounded-full">CHUẨN MA TRẬN 2025</span>
            </div>
            <p className="text-emerald-100 text-xs">
              Bảng số liệu chính xác • 4 mệnh đề đúng/sai • Bám sát chương trình TT 17/2025 và số liệu mới nhất
            </p>
          </div>
          <div className="flex items-center gap-1 bg-white/20 group-hover:bg-white/30 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors shrink-0">
            <Zap className="w-3.5 h-3.5" />
            Bắt đầu ngay
          </div>
        </div>
      </motion.div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">Chọn chế độ luyện tập</label>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => { setMode('lesson'); setSelection(''); }}
              className={cn(
                "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                mode === 'lesson' ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 hover:border-emerald-200 text-slate-600"
              )}
            >
              <BookOpen className="w-5 h-5 mb-2" />
              <span className="font-medium text-sm">Theo bài học</span>
            </button>
            <button
              onClick={() => { setMode('topic'); setSelection(''); }}
              className={cn(
                "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                mode === 'topic' ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 hover:border-emerald-200 text-slate-600"
              )}
            >
              <Target className="w-5 h-5 mb-2" />
              <span className="font-medium text-sm">Theo chủ đề</span>
            </button>
            <button
              onClick={() => { setMode('format'); setSelection(''); }}
              className={cn(
                "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                mode === 'format' ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 hover:border-emerald-200 text-slate-600"
              )}
            >
              <FileCheck2 className="w-5 h-5 mb-2" />
              <span className="font-medium text-sm text-center">Theo dạng thức</span>
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-700">
              {mode === 'lesson' ? 'Chọn bài học cụ thể' : mode === 'topic' ? 'Chọn chủ đề trọng tâm' : 'Chọn dạng câu hỏi'}
            </label>
            {mode !== 'format' && (
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="text-xs p-2 pl-8 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 w-40"
                />
                <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {(mode === 'lesson' ? lessons : mode === 'topic' ? topics : formats)
              .filter(item => mode === 'format' || item.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((item) => (
              <button
                key={item}
                onClick={() => setSelection(item)}
                className={cn(
                  "text-left p-4 rounded-xl border-2 transition-all text-sm font-medium",
                  selection === item 
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm" 
                    : item === 'true_false' && mode === 'format'
                      ? "border-teal-200 bg-teal-50/50 text-slate-600 hover:border-teal-400 hover:bg-teal-50"
                      : "border-slate-100 bg-slate-50 text-slate-600 hover:border-emerald-200 hover:bg-white"
                )}
              >
                <span className="flex items-center gap-2">
                  {item === 'true_false' && mode === 'format' && <CheckSquare className="w-4 h-4 text-teal-500 shrink-0" />}
                  {mode === 'format' ? getFormatDisplay(item) : item}
                  {item === 'true_false' && mode === 'format' && (
                    <span className="ml-auto text-[9px] font-black bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded-full">Phần II</span>
                  )}
                </span>
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

        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-4">
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
          
          {useAI && (
            <div className="pt-2 border-t border-emerald-100">
              <label className="block text-xs font-bold text-emerald-800 mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Dựa trên tài liệu Thư viện (Tùy chọn)
              </label>
              <select
                value={selectedLibraryFileId}
                onChange={(e) => setSelectedLibraryFileId(e.target.value)}
                className="w-full text-sm p-2.5 rounded-lg border border-emerald-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <option value="">-- Không sử dụng tài liệu nền --</option>
                {libraryFiles.filter(f => f.fileType === 'word' || f.fileName.endsWith('.docx') || f.fileName.endsWith('.doc')).map(f => (
                  <option key={f.id} value={f.id}>{f.title}</option>
                ))}
              </select>
              <div className="text-[10px] text-emerald-600 mt-1 italic">
                Lưu ý: Chỉ hỗ trợ trích xuất văn bản từ tài liệu Word (.docx). AI sẽ bám sát nội dung tài liệu này.
              </div>
            </div>
          )}
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
