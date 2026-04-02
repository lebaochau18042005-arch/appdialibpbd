import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen, Target, Play, FileCheck2, FileText, Search,
  CheckSquare, Zap, Library, Sparkles, AlertCircle, ChevronDown, X
} from 'lucide-react';
import { lessons, topics } from '../data';
import { cn } from '../utils/cn';
import AITutorChatbot from '../components/ai/AITutorChatbot';
import { libraryService, LibraryFile } from '../services/libraryService';

// ── Keyword matcher: score a library file based on selection term ──────────────
function scoreMatch(file: LibraryFile, query: string): number {
  if (!query) return 0;
  const q = query.toLowerCase();
  const title = file.title.toLowerCase();
  const name = file.fileName.toLowerCase();
  // Exact substring match in title = high score
  if (title.includes(q)) return 10;
  // Check significant keywords individually
  const keywords = q.split(/[\s,/–-]+/).filter(k => k.length > 2);
  let score = 0;
  for (const kw of keywords) {
    if (title.includes(kw)) score += 3;
    if (name.includes(kw)) score += 1;
  }
  return score;
}

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
  const [autoMatchDismissed, setAutoMatchDismissed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubFiles = libraryService.subscribeToFiles(setLibraryFiles);
    return () => unsubFiles();
  }, []);

  // ── Auto-match library file when selection changes ─────────────────────────
  const wordFiles = useMemo(
    () => libraryFiles.filter(f => f.fileType === 'word' || f.fileName.endsWith('.docx') || f.fileName.endsWith('.doc')),
    [libraryFiles]
  );

  const autoMatchedFile = useMemo<LibraryFile | null>(() => {
    if (!selection || mode === 'format') return null;
    let best: LibraryFile | null = null;
    let bestScore = 0;
    for (const file of wordFiles) {
      const s = scoreMatch(file, selection);
      if (s > bestScore) { bestScore = s; best = file; }
    }
    return bestScore >= 3 ? best : null;
  }, [selection, wordFiles, mode]);

  // Auto-select matched file when useAI is enabled and a match is found
  useEffect(() => {
    if (useAI && autoMatchedFile && !autoMatchDismissed) {
      setSelectedLibraryFileId(autoMatchedFile.id);
    }
  }, [useAI, autoMatchedFile, autoMatchDismissed]);

  // Reset auto-match dismissed when selection changes
  useEffect(() => {
    setAutoMatchDismissed(false);
    setSelectedLibraryFileId('');
  }, [selection, mode]);

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

  // Determine AI source mode
  const aiSourceDoc = useAI && selectedLibraryFileId;
  const aiSourceAuto = useAI && !selectedLibraryFileId;
  const selectedFile = wordFiles.find(f => f.id === selectedLibraryFileId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto pb-20 md:pb-0"
    >
      <h1 className="text-2xl font-black mb-4" style={{ color: '#e2e8f0', letterSpacing: '-0.02em' }}>
        Thiết lập bài luyện tập
      </h1>

      {/* Quick-start Đúng/Sai banner */}
      <motion.div
        initial={{ scale: 0.97, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-5 p-4 rounded-2xl cursor-pointer group"
        style={{
          background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)',
          boxShadow: '0 8px 32px rgba(14,165,233,0.35)',
        }}
        onClick={() => {
          setMode('format');
          setSelection('true_false');
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(255,255,255,0.2)' }}>
            <CheckSquare className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-white font-black text-base">Luyện dạng Đúng/Sai (Phần II)</span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.25)', color: 'white' }}>
                CHUẨN MA TRẬN 2025
              </span>
            </div>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Biểu đồ • Bảng số liệu • 4 mệnh đề đúng/sai • Bám sát TT 17/2025
            </p>
          </div>
          <div className="flex items-center gap-1 text-white text-xs font-bold px-3 py-2 rounded-xl shrink-0"
            style={{ background: 'rgba(255,255,255,0.2)' }}>
            <Zap className="w-3.5 h-3.5" /> Bắt đầu ngay
          </div>
        </div>
      </motion.div>

      {/* Main card */}
      <div
        className="rounded-2xl p-6 space-y-6"
        style={{
          background: 'rgba(11,22,40,0.85)',
          border: '1px solid rgba(0,191,255,0.15)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        {/* Mode tabs */}
        <div>
          <label className="block text-xs font-black uppercase tracking-widest mb-3"
            style={{ color: 'rgba(0,191,255,0.5)' }}>
            ◈ Chế độ luyện tập
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { val: 'lesson', label: 'Theo bài học', icon: BookOpen },
              { val: 'topic', label: 'Theo chủ đề', icon: Target },
              { val: 'format', label: 'Theo dạng thức', icon: FileCheck2 },
            ].map(({ val, label, icon: Icon }) => (
              <button
                key={val}
                onClick={() => { setMode(val as any); setSelection(''); }}
                className="flex flex-col items-center justify-center p-4 rounded-xl transition-all"
                style={{
                  border: `2px solid ${mode === val ? 'rgba(0,191,255,0.6)' : 'rgba(0,191,255,0.12)'}`,
                  background: mode === val ? 'rgba(0,191,255,0.1)' : 'rgba(255,255,255,0.03)',
                  color: mode === val ? '#00bfff' : 'rgba(148,163,184,0.7)',
                  boxShadow: mode === val ? '0 0 16px rgba(0,191,255,0.1)' : 'none',
                }}
              >
                <Icon className="w-5 h-5 mb-2" />
                <span className="font-semibold text-xs text-center">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Selection list */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-black uppercase tracking-widest"
              style={{ color: 'rgba(0,191,255,0.5)' }}>
              ◈ {mode === 'lesson' ? 'Chọn bài học' : mode === 'topic' ? 'Chọn chủ đề' : 'Chọn dạng câu hỏi'}
            </label>
            {mode !== 'format' && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="text-xs p-2 pl-7 rounded-lg outline-none w-36"
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(0,191,255,0.2)',
                    color: '#e2e8f0',
                  }}
                />
                <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2"
                  style={{ color: 'rgba(0,191,255,0.4)' }} />
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
            {(mode === 'lesson' ? lessons : mode === 'topic' ? topics : formats)
              .filter(item => mode === 'format' || item.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(item => {
                const isSelected = selection === item;
                const hasLibraryMatch = mode !== 'format' && wordFiles.some(f => scoreMatch(f, item) >= 3);
                return (
                  <button
                    key={item}
                    onClick={() => setSelection(item)}
                    className="text-left p-3.5 rounded-xl transition-all text-sm font-medium flex items-center gap-2"
                    style={{
                      border: `2px solid ${isSelected ? 'rgba(0,191,255,0.6)' : item === 'true_false' && mode === 'format' ? 'rgba(20,184,166,0.35)' : 'rgba(0,191,255,0.1)'}`,
                      background: isSelected ? 'rgba(0,191,255,0.1)' : 'rgba(255,255,255,0.03)',
                      color: isSelected ? '#00bfff' : 'rgba(203,213,225,0.8)',
                      boxShadow: isSelected ? '0 0 12px rgba(0,191,255,0.1)' : 'none',
                    }}
                  >
                    {item === 'true_false' && mode === 'format' && (
                      <CheckSquare size={14} style={{ color: '#14b8a6', flexShrink: 0 }} />
                    )}
                    <span className="flex-1">{mode === 'format' ? getFormatDisplay(item) : item}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {item === 'true_false' && mode === 'format' && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                          style={{ background: 'rgba(20,184,166,0.2)', color: '#14b8a6' }}>Phần II</span>
                      )}
                      {hasLibraryMatch && (mode as string) !== 'format' && (
                        <span title="Có tài liệu thư viện phù hợp">
                          <Library size={11} style={{ color: 'rgba(168,85,247,0.7)' }} />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Question count */}
        <div>
          <label className="block text-xs font-black uppercase tracking-widest mb-2"
            style={{ color: 'rgba(0,191,255,0.5)' }}>
            ◈ Số lượng câu hỏi
          </label>
          <select
            value={questionCount}
            onChange={e => setQuestionCount(e.target.value)}
            className="w-full p-3 rounded-xl outline-none transition-all"
            style={{
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(0,191,255,0.2)',
              color: '#e2e8f0',
            }}
          >
            <option value="10">10 câu</option>
            <option value="20">20 câu</option>
            <option value="30">30 câu</option>
            <option value="40">40 câu</option>
            <option value="all">Tất cả</option>
          </select>
        </div>

        {/* AI Section */}
        <div
          className="rounded-2xl p-4 space-y-4"
          style={{
            background: useAI ? 'rgba(14,165,233,0.07)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${useAI ? 'rgba(0,191,255,0.3)' : 'rgba(0,191,255,0.1)'}`,
            transition: 'all 0.3s ease',
          }}
        >
          {/* Toggle */}
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={useAI}
                onChange={e => setUseAI(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                style={{
                  background: useAI ? 'linear-gradient(135deg,#0ea5e9,#14b8a6)' : 'rgba(100,116,139,0.4)',
                  boxShadow: useAI ? '0 0 12px rgba(14,165,233,0.5)' : 'none',
                }} />
            </div>
            <div className="flex-1">
              <span className="text-sm font-black block" style={{ color: useAI ? '#00bfff' : '#e2e8f0' }}>
                🤖 Sử dụng AI tạo câu hỏi mới
              </span>
              <span className="text-xs" style={{ color: 'rgba(148,163,184,0.6)' }}>
                AI biên soạn câu hỏi bám sát nội dung, chuẩn cấu trúc 2025
              </span>
            </div>
          </label>

          {/* AI source details */}
          <AnimatePresence>
            {useAI && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 overflow-hidden"
              >
                {/* Auto-match notification */}
                {autoMatchedFile && !autoMatchDismissed && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{
                      background: 'rgba(168,85,247,0.12)',
                      border: '1px solid rgba(168,85,247,0.35)',
                    }}
                  >
                    <Library size={16} style={{ color: '#c084fc', flexShrink: 0 }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black" style={{ color: '#c084fc' }}>
                        📚 Tìm thấy tài liệu phù hợp trong Thư viện!
                      </p>
                      <p className="text-[11px] truncate mt-0.5" style={{ color: 'rgba(192,132,252,0.7)' }}>
                        {autoMatchedFile.title}
                      </p>
                    </div>
                    <button
                      onClick={() => { setAutoMatchDismissed(true); setSelectedLibraryFileId(''); }}
                      title="Bỏ qua, AI tự tạo"
                      style={{ color: 'rgba(192,132,252,0.5)' }}
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                )}

                {/* Library file selector */}
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider mb-2"
                    style={{ color: 'rgba(0,191,255,0.5)' }}>
                    <FileText size={11} />
                    Nguồn tài liệu cho AI
                  </label>

                  <select
                    value={selectedLibraryFileId}
                    onChange={e => { setSelectedLibraryFileId(e.target.value); setAutoMatchDismissed(true); }}
                    className="w-full text-sm p-3 rounded-xl outline-none transition-all"
                    style={{
                      background: 'rgba(0,0,0,0.4)',
                      border: `1px solid ${selectedLibraryFileId ? 'rgba(168,85,247,0.4)' : 'rgba(0,191,255,0.2)'}`,
                      color: '#e2e8f0',
                    }}
                  >
                    <option value="">🤖 AI tự tạo (không dùng tài liệu)</option>
                    {wordFiles.map(f => (
                      <option key={f.id} value={f.id}>
                        📄 {f.title}
                        {autoMatchedFile?.id === f.id ? ' ✨ (Gợi ý)' : ''}
                      </option>
                    ))}
                  </select>

                  {/* AI source indicator */}
                  <div className="mt-2 flex items-start gap-2 text-[11px] rounded-lg p-2.5"
                    style={{
                      background: aiSourceDoc ? 'rgba(168,85,247,0.08)' : 'rgba(14,165,233,0.08)',
                      border: `1px solid ${aiSourceDoc ? 'rgba(168,85,247,0.2)' : 'rgba(0,191,255,0.15)'}`,
                    }}
                  >
                    {aiSourceDoc ? (
                      <>
                        <Library size={12} style={{ color: '#c084fc', flexShrink: 0, marginTop: 1 }} />
                        <span style={{ color: 'rgba(192,132,252,0.8)' }}>
                          AI sẽ dựa trên tài liệu <strong style={{ color: '#c084fc' }}>"{selectedFile?.title}"</strong> để biên soạn câu hỏi bám sát nội dung.
                        </span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={12} style={{ color: '#00bfff', flexShrink: 0, marginTop: 1 }} />
                        <span style={{ color: 'rgba(0,191,255,0.7)' }}>
                          AI sẽ <strong style={{ color: '#00bfff' }}>tự biên soạn</strong> câu hỏi dựa trên kiến thức và chương trình địa lí 2025. Chỉ hỗ trợ tài liệu Word (.docx).
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Start button */}
        <button
          onClick={handleStart}
          disabled={!selection}
          className="w-full py-4 rounded-xl font-black text-base transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: selection ? 'linear-gradient(135deg, #0ea5e9, #14b8a6)' : 'rgba(100,116,139,0.3)',
            color: 'white',
            boxShadow: selection ? '0 4px 20px rgba(14,165,233,0.45)' : 'none',
            transform: 'translateY(0)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { if (selection) (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
        >
          <Play size={18} />
          {selection
            ? useAI
              ? aiSourceDoc ? `🤖 AI tạo từ tài liệu "${selectedFile?.title?.slice(0, 20)}..."` : '🤖 AI tự tạo câu hỏi'
              : 'Bắt đầu làm bài'
            : 'Vui lòng chọn nội dung trước'
          }
        </button>
      </div>

      <AITutorChatbot />
    </motion.div>
  );
}
