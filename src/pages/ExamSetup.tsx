import LearningTools from '../components/LearningTools';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Play, Upload, ArrowRight, Loader2, Sparkles, FileText, Search, History, ShieldCheck, Download, Calculator, Map } from 'lucide-react';
import { cn } from '../utils/cn';
import { examService } from '../services/examService';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Exam } from '../types';
import { libraryService, LibraryFile } from '../services/libraryService';
import GeoFormulasModal from '../components/exam/GeoFormulasModal';
import InteractiveMapModal from '../components/exam/InteractiveMapModal';

export default function ExamSetup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isTeacherMode, profile } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [exams, setExams] = useState<Exam[]>([]);
  const [loadingExams, setLoadingExams] = useState(true);

  const [libraryFiles, setLibraryFiles] = useState<LibraryFile[]>([]);
  const [selectedLibraryFileId, setSelectedLibraryFileId] = useState<string>('');
  const [isFormulasOpen, setIsFormulasOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);

  // Auto-select if coming from Library page with ?libraryFileId=...
  useEffect(() => {
    const fromLib = searchParams.get('libraryFileId');
    if (fromLib) setSelectedLibraryFileId(fromLib);
  }, [searchParams]);

  useEffect(() => {
    // Fetch files for AI reference
    const authorId = isTeacherMode ? user?.uid : (profile as any)?.creatorId;
    const unsubFiles = libraryService.subscribeToFiles(authorId, setLibraryFiles);
    return () => unsubFiles();
  }, [isTeacherMode, user, profile]);

  useEffect(() => {
    setLoadingExams(true);
    // Subscribe realtime to Firestore exams collection
    const q = query(collection(db, 'exams'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fsExams = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() } as Exam))
        .filter(e => e.type !== 'assignment'); // exclude assignment-marker docs

      // Merge with any localStorage exams (for guests)
      const lsExams: Exam[] = (() => {
        try { return JSON.parse(localStorage.getItem('geo_pro_local_exams') || '[]'); } catch { return []; }
      })();
      const onlyLocal = lsExams.filter(le => !fsExams.find(fe => fe.id === le.id));
      const all = [...fsExams, ...onlyLocal].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setExams(all);
      setLoadingExams(false);
    }, (_err) => {
      // Firestore unavailable — fallback to localStorage
      try {
        const lsExams: Exam[] = JSON.parse(localStorage.getItem('geo_pro_local_exams') || '[]');
        setExams(lsExams);
      } catch { setExams([]); }
      setLoadingExams(false);
    });
    return () => unsubscribe();
  }, []);

  const handleStartAI = async () => {
    setIsCreating(true);
    try {
      const url = `/exam-room?mode=mock${selectedLibraryFileId ? `&libraryFileId=${selectedLibraryFileId}` : ''}`;
      navigate(url);
    } catch (error) {
      console.error("AI Generation Error:", error);
      alert('Có lỗi xảy ra khi tạo đề AI. Hệ thống đang bận, vui lòng thử lại sau.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDownload = async (examId: string) => {
    try {
      await examService.downloadExam(examId);
    } catch (error) {
      console.error("Download failed:", error);
      alert('Không thể tải đề thi. Vui lòng thử lại sau.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-14">
      <LearningTools />

      {/* Trợ thủ tra cứu nhanh */}
      <div className="flex flex-col sm:flex-row gap-2.5 max-w-xl mx-auto">
        <button
          type="button"
          onClick={() => setIsMapOpen(true)}
          className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all flex items-center justify-center gap-2 text-xs font-bold shadow-sm"
        >
          <Map size={15} className="text-cyan-400" />
          🗺️ Tra cứu 34 Tỉnh & 6 Vùng mới (TT17)
        </button>
        <button
          type="button"
          onClick={() => setIsFormulasOpen(true)}
          className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all flex items-center justify-center gap-2 text-xs font-bold shadow-sm"
        >
          <Calculator size={15} className="text-cyan-400" />
          📐 Sổ tay Công thức & Máy tính Địa lí
        </button>
      </div>

      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-500/20"
        >
          <ShieldCheck size={14} /> Hệ thống ôn luyện chuẩn 2025
        </motion.div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-100 tracking-tight">ĐỀ THI TỔNG HỢP</h1>
        <p className="text-slate-300 max-w-2xl mx-auto font-medium text-sm sm:text-base">
          Lựa chọn phương thức ôn luyện phù hợp với mục tiêu của bạn. <br />
          Tất cả đề thi bám sát cấu trúc tham khảo 2025 & Thông tư 17/2025/TT-BGDĐT.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* AI Option */}
        <motion.div
          whileHover={{ y: -8 }}
          className="p-8 sm:p-10 rounded-[2.5rem] shadow-2xl border flex flex-col group relative overflow-hidden transition-all"
          style={{
            background: 'rgba(15, 23, 42, 0.88)',
            borderColor: 'rgba(99, 102, 241, 0.35)',
            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.15)',
          }}
        >
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors" />

          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center mb-6 sm:mb-8 shadow-2xl shadow-indigo-500/30 group-hover:rotate-12 transition-transform">
            <Sparkles size={36} />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight">ĐỀ THI THỬ (AI)</h2>
          <p className="text-slate-300 mb-6 flex-1 leading-relaxed text-sm sm:text-base font-medium">
            Hệ thống AI tự động tổng hợp 28 câu hỏi (18 trắc nghiệm, 4 đúng/sai, 6 trả lời ngắn) bám sát ma trận đề thi 2025.
          </p>

          <div className="mb-6 p-4 bg-slate-950/80 rounded-2xl border border-indigo-500/30">
            <label className="block text-xs font-bold text-indigo-300 mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              Dựa trên tài liệu Thư viện (Tùy chọn)
            </label>
            <select
              value={selectedLibraryFileId}
              onChange={(e) => setSelectedLibraryFileId(e.target.value)}
              className="w-full text-sm p-3 rounded-xl border border-indigo-500/30 bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium text-slate-200"
            >
              <option value="">-- Tạo đề thi ngẫu nhiên theo cấu trúc --</option>
              {libraryFiles.filter(f => f.fileType === 'word' || f.fileName.endsWith('.docx') || f.fileName.endsWith('.doc')).map(f => (
                <option key={f.id} value={f.id}>{f.title}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleStartAI}
            disabled={isCreating}
            className="w-full py-4 sm:py-5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-2xl font-black hover:from-indigo-500 hover:to-indigo-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/30 disabled:opacity-50"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                ĐANG KHỞI TẠO...
              </>
            ) : (
              <>
                BẮT ĐẦU NGAY
                <ArrowRight className="w-6 h-6" />
              </>
            )}
          </button>
        </motion.div>

        {/* Manual Option */}
        <motion.div
          whileHover={{ y: -8 }}
          className="p-8 sm:p-10 rounded-[2.5rem] shadow-2xl border flex flex-col group relative overflow-hidden transition-all"
          style={{
            background: 'rgba(15, 23, 42, 0.88)',
            borderColor: 'rgba(16, 185, 129, 0.35)',
            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.15)',
          }}
        >
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors" />

          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-600 text-white rounded-3xl flex items-center justify-center mb-6 sm:mb-8 shadow-2xl shadow-emerald-500/30 group-hover:rotate-12 transition-transform">
            <Upload size={36} />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight">ĐỀ THI THẬT (GIÁO VIÊN)</h2>
          <p className="text-slate-300 mb-6 flex-1 leading-relaxed text-sm sm:text-base font-medium">
            Làm các bộ đề thi được giáo viên biên soạn và tải lên dưới định dạng Word, PDF hoặc HTML.
          </p>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Nhập mã đề hoặc tìm tên đề..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-950 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all font-medium text-slate-200 placeholder-slate-500 text-sm"
              />
            </div>
            <div className="max-h-[280px] overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
              {loadingExams ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                </div>
              ) : exams.filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm font-medium">
                  Không tìm thấy đề thi nào.
                </div>
              ) : (
                exams.filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase())).map(exam => (
                  <div
                    key={exam.id}
                    className="w-full p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between hover:bg-slate-900 hover:border-emerald-500/40 transition-all group/item"
                  >
                    <div
                      className="flex-1 flex items-center gap-3 cursor-pointer min-w-0"
                      onClick={() => {
                        if (exam.type === 'upload') {
                          alert('Đề thi này là file tải lên. Bạn có thể tải xuống để xem nội dung.');
                          handleDownload(exam.id);
                        } else {
                          navigate(`/exam-room?examId=${exam.id}`);
                        }
                      }}
                    >
                      <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                        exam.type === 'ai' ? "bg-indigo-500/20 text-indigo-400" : "bg-emerald-500/20 text-emerald-400"
                      )}>
                        {exam.type === 'ai' ? <Sparkles size={16} /> : <FileText size={16} />}
                      </div>
                      <div className="text-left min-w-0">
                        <div className="font-bold text-slate-200 text-sm truncate">{exam.title}</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                          {exam.type === 'ai' ? 'Đề thi AI' : 'Đề thi giáo viên'} • {exam.questions?.length || 0} câu
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(exam.id);
                      }}
                      className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors ml-2 shrink-0"
                      title="Tải xuống đề thi"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Info Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-[2.5rem] p-8 sm:p-12 text-white overflow-hidden relative shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] -mr-48 -mt-48" />
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <FileText className="text-indigo-400" />
            </div>
            <h4 className="text-lg font-black">Cấu trúc chuẩn</h4>
            <p className="text-slate-400 text-sm leading-relaxed">Đề thi được thiết kế bám sát 100% cấu trúc tham khảo 2025 của Bộ Giáo dục và Đào tạo.</p>
          </div>
          <div className="space-y-3">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <History size={24} className="text-emerald-400" />
            </div>
            <h4 className="text-lg font-black">Lưu trữ lịch sử</h4>
            <p className="text-slate-400 text-sm leading-relaxed">Mọi kết quả làm bài đều được lưu trữ cố định để học sinh và giáo viên dễ dàng theo dõi tiến độ.</p>
          </div>
          <div className="space-y-3">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <Download size={24} className="text-amber-400" />
            </div>
            <h4 className="text-lg font-black">Tải đề thi</h4>
            <p className="text-slate-400 text-sm leading-relaxed">Sau khi tạo hoặc tải lên, bạn có thể tải đề thi xuống dưới dạng file văn bản để ôn luyện offline.</p>
          </div>
        </div>
      </div>

      <GeoFormulasModal isOpen={isFormulasOpen} onClose={() => setIsFormulasOpen(false)} />
      <InteractiveMapModal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} />
    </div>
  );
}
