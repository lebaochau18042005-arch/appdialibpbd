import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Play, Upload, ArrowRight, Loader2, Sparkles, FileText, Search, History, ShieldCheck, Download } from 'lucide-react';
import { cn } from '../utils/cn';
import { examService } from '../services/examService';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Exam } from '../types';

export default function ExamSetup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [exams, setExams] = useState<Exam[]>([]);
  const [loadingExams, setLoadingExams] = useState(true);

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
      navigate('/exam-room?mode=mock');
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
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
      <div className="text-center space-y-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-100"
        >
          <ShieldCheck size={14} /> Hệ thống ôn luyện chuẩn 2025
        </motion.div>
        <h1 className="text-5xl font-black text-slate-900 tracking-tight">ĐỀ THI TỔNG HỢP</h1>
        <p className="text-slate-500 max-w-2xl mx-auto font-medium">
          Lựa chọn phương thức ôn luyện phù hợp với mục tiêu của bạn. <br />
          Tất cả đề thi bám sát cấu trúc tham khảo 2025 & Thông tư 17/2025/TT-BGDĐT.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* AI Option */}
        <motion.div
          whileHover={{ y: -8 }}
          className="bg-white p-10 rounded-[3rem] shadow-xl shadow-indigo-50 border border-slate-100 flex flex-col group relative overflow-hidden"
        >
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-50 group-hover:bg-indigo-100 transition-colors" />
          
          <div className="w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-indigo-200 group-hover:rotate-12 transition-transform">
            <Sparkles size={40} />
          </div>
          
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">ĐỀ THI THỬ (AI)</h2>
          <p className="text-slate-500 mb-10 flex-1 leading-relaxed font-medium">
            Hệ thống AI tự động tổng hợp 28 câu hỏi (18 trắc nghiệm, 4 đúng/sai, 6 trả lời ngắn) bám sát ma trận đề thi 2025.
          </p>
          
          <button
            onClick={handleStartAI}
            disabled={isCreating}
            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 disabled:opacity-50"
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
          className="bg-white p-10 rounded-[3rem] shadow-xl shadow-emerald-50 border border-slate-100 flex flex-col group relative overflow-hidden"
        >
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-50 rounded-full blur-3xl opacity-50 group-hover:bg-emerald-100 transition-colors" />

          <div className="w-20 h-20 bg-emerald-600 text-white rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-emerald-200 group-hover:rotate-12 transition-transform">
            <Upload size={40} />
          </div>
          
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">ĐỀ THI THẬT (GIÁO VIÊN)</h2>
          <p className="text-slate-500 mb-10 flex-1 leading-relaxed font-medium">
            Làm các bộ đề thi được giáo viên biên soạn và tải lên dưới định dạng Word, PDF hoặc HTML.
          </p>
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text"
                placeholder="Nhập mã đề hoặc tìm tên đề..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 outline-none transition-all font-bold text-slate-700"
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {loadingExams ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                </div>
              ) : exams.filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm font-medium">
                  Không tìm thấy đề thi nào.
                </div>
              ) : (
                exams.filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase())).map(exam => (
                  <div
                    key={exam.id}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between hover:bg-emerald-50 hover:border-emerald-200 transition-all group/item"
                  >
                    <div 
                      className="flex-1 flex items-center gap-3 cursor-pointer"
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
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        exam.type === 'ai' ? "bg-indigo-50 text-indigo-600" : "bg-emerald-50 text-emerald-600"
                      )}>
                        {exam.type === 'ai' ? <Sparkles size={18} /> : <FileText size={18} />}
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-slate-800 text-sm line-clamp-1">{exam.title}</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                          {exam.type === 'ai' ? 'Đề thi AI' : 'Đề thi giáo viên'} • {exam.questions?.length || 0} câu
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(exam.id);
                      }}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-white rounded-lg transition-colors"
                      title="Tải xuống đề thi"
                    >
                      <Download size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Info Section */}
      <div className="bg-slate-900 rounded-[3rem] p-12 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 blur-[100px] -mr-48 -mt-48" />
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <FileText className="text-indigo-400" />
            </div>
            <h4 className="text-xl font-black">Cấu trúc chuẩn</h4>
            <p className="text-slate-400 text-sm leading-relaxed">Đề thi được thiết kế bám sát 100% cấu trúc tham khảo 2025 của Bộ Giáo dục và Đào tạo.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <History size={24} className="text-emerald-400" />
            </div>
            <h4 className="text-xl font-black">Lưu trữ lịch sử</h4>
            <p className="text-slate-400 text-sm leading-relaxed">Mọi kết quả làm bài đều được lưu trữ cố định để học sinh và giáo viên dễ dàng theo dõi tiến độ.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <Download size={24} className="text-amber-400" />
            </div>
            <h4 className="text-xl font-black">Tải đề thi</h4>
            <p className="text-slate-400 text-sm leading-relaxed">Sau khi tạo hoặc tải lên, bạn có thể tải đề thi xuống dưới dạng file văn bản để ôn luyện offline.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
