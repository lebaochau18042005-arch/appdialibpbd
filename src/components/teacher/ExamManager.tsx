import React from 'react';
import { FileText, Search, Download, Trash2, Sparkles, Presentation, Brain, PencilLine } from 'lucide-react';
import { Exam } from '../../types';
import { cn } from '../../utils/cn';
import { exportExamToWord } from '../../utils/exportDocs';
import { generatePptx } from '../../utils/exportPptx';

interface ExamManagerProps {
  exams: Exam[];
  examSearchTerm: string;
  setExamSearchTerm: (term: string) => void;
  handleDownload: (id: string) => void;
  handleDeleteExam: (id: string) => void;
  setViewingExam: (exam: Exam) => void;
  onExtractQuestions?: (exam: Exam) => void;
  onEditExam?: (exam: Exam) => void;
}

export default function ExamManager({
  exams,
  examSearchTerm,
  setExamSearchTerm,
  handleDownload,
  handleDeleteExam,
  setViewingExam,
  onExtractQuestions,
  onEditExam,
}: ExamManagerProps) {
  const filteredExams = exams.filter(e => 
    e.title.toLowerCase().includes(examSearchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">NGÂN HÀNG ĐỀ THI</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Đang lưu trữ {exams.length} / 100 đề thi</p>
          </div>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Tìm tên đề thi..."
            value={examSearchTerm}
            onChange={(e) => setExamSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
          />
        </div>
      </div>
      
      <div className="p-8">
        {filteredExams.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText size={24} className="text-slate-200" />
            </div>
            <p className="text-slate-400 font-medium">
              {examSearchTerm ? 'Không tìm thấy đề thi nào khớp với từ khóa.' : 'Chưa có đề thi nào trong ngân hàng.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExams.map((exam) => (
              <div key={exam.id} className="p-6 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    exam.type === 'ai' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                  )}>
                    {exam.type === 'ai' ? <Sparkles size={20} /> : <FileText size={20} />}
                  </div>
                  <div className="flex items-center gap-2">
                    {/* AI Extract button: only for uploaded exams with 0 questions */}
                    {exam.type === 'upload' && (!exam.questions || exam.questions.length === 0) && onExtractQuestions && (
                      <button 
                        onClick={() => onExtractQuestions(exam)}
                        className="p-2 text-slate-400 hover:text-purple-600 transition-colors"
                        title="Trích xuất câu hỏi bằng AI"
                      >
                        <Brain size={20} />
                      </button>
                    )}
                    {/* Edit button: opens ExamEditor for all exams with questions */}
                    {onEditExam && (exam.questions?.length ?? 0) > 0 && (
                      <button
                        onClick={() => onEditExam(exam)}
                        className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                        title="Sửa đề thi (thêm ảnh, bảng số liệu)"
                      >
                        <PencilLine size={20} />
                      </button>
                    )}
                    <button 
                      onClick={() => exportExamToWord(exam)}
                      className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                      title="Xuất File Word"
                    >
                      <FileText size={20} />
                    </button>
                    <button 
                      onClick={() => generatePptx(exam)}
                      className="p-2 text-slate-400 hover:text-orange-500 transition-colors"
                      title="Xuất PowerPoint"
                    >
                      <Presentation size={20} />
                    </button>
                    <button 
                      onClick={() => handleDownload(exam.id)}
                      className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                      title="Tải xuống"
                    >
                      <Download size={20} />
                    </button>
                    <button 
                      onClick={() => handleDeleteExam(exam.id)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      title="Xóa đề thi"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                <h4 className="font-bold text-slate-800 mb-1 line-clamp-1">{exam.title}</h4>
                <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-4">
                  {exam.type === 'ai' ? 'Đề thi AI' : 'Đề thi tải lên'} • {new Date(exam.createdAt).toLocaleDateString('vi-VN')}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">{exam.questions?.length || 0} câu hỏi</span>
                  <button 
                    onClick={() => setViewingExam(exam)}
                    className="text-xs font-black text-emerald-600 hover:underline"
                  >
                    CHI TIẾT
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
