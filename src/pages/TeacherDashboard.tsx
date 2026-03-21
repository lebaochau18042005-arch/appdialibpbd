import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSearchParams } from 'react-router-dom';
import { Upload, History, MessageSquare, FileText, ShieldCheck, RefreshCw, Download, Search, User, BarChart, Lock, LogIn, Sparkles, CheckCircle2, XCircle, AlertCircle, Trash2, Brain } from 'lucide-react';
import { examService } from '../services/examService';
import { QuizAttempt, Exam, Question } from '../types';
import { cn } from '../utils/cn';
import { useAuth } from '../contexts/AuthContext';
import { generateExamFromContext } from '../services/ai';
import TeacherStats from '../components/teacher/TeacherStats';
import ExamManager from '../components/teacher/ExamManager';
import HistoryTable from '../components/teacher/HistoryTable';

export default function TeacherDashboard() {
  const { user, profile, loading: authLoading, login } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentingId, setCommentingId] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [progress, setProgress] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [viewingExam, setViewingExam] = useState<Exam | null>(null);
  const [uploadingType, setUploadingType] = useState<'word' | 'pdf' | 'html' | null>(null);
  const [isUploadDropdownOpen, setIsUploadDropdownOpen] = useState(false);
  const [shouldTriggerClick, setShouldTriggerClick] = useState(false);
  
  // AI Generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[] | null>(null);
  const [generatedExamTitle, setGeneratedExamTitle] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showUploadConfirm, setShowUploadConfirm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');

  const [examSearchTerm, setExamSearchTerm] = useState('');

  // AI Question Extraction from uploaded file
  const [extractingExam, setExtractingExam] = useState<Exam | null>(null);
  const [extractText, setExtractText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  const handleExtractQuestions = (exam: Exam) => {
    setExtractingExam(exam);
    setExtractText('');
  };

  const confirmExtract = async () => {
    if (!extractingExam || !extractText.trim() || isExtracting) return;
    setIsExtracting(true);
    try {
      const { generateExamFromContext } = await import('../services/ai');
      const questions = await generateExamFromContext(extractText);
      const updatedExam: Exam = { ...extractingExam, questions, type: 'ai' as const };
      // Update in localStorage
      const lsKey = 'geo_pro_local_exams';
      const allExams: Exam[] = JSON.parse(localStorage.getItem(lsKey) || '[]');
      const newExams = allExams.map(e => e.id === updatedExam.id ? updatedExam : e);
      localStorage.setItem(lsKey, JSON.stringify(newExams));
      setExams(prev => prev.map(e => e.id === updatedExam.id ? updatedExam : e));
      alert(`Đã trích xuất ${questions.length} câu hỏi từ nội dung!`);
      setExtractingExam(null);
    } catch (e) {
      alert('Không thể trích xuất câu hỏi. Vui lòng thử lại.');
    } finally {
      setIsExtracting(false);
    }
  };

  useEffect(() => {
    let unsubscribeAttempts: (() => void) | undefined;
    let unsubscribeExams: (() => void) | undefined;

    setLoading(true);
    
    unsubscribeAttempts = examService.subscribeToAttempts((data) => {
      setAttempts(data);
      setLoading(false);
    });

    if (user) {
      unsubscribeExams = examService.subscribeToExams(user.uid, (data) => {
        setExams(data);
      });
    } else {
      // Load all exams if not logged in
      examService.getAllExams().then(data => setExams(data));
      setLoading(false);
    }

    return () => {
      if (unsubscribeAttempts) unsubscribeAttempts();
      if (unsubscribeExams) unsubscribeExams();
    };
  }, [user, profile]);

  const loadData = async () => {
    // This is now handled by real-time listeners, 
    // but we keep it for manual refresh if needed
    setLoading(true);
    try {
      const attemptsData = await examService.getAllAttempts();
      const examsData = user ? await examService.getExamsByCreator(user.uid) : await examService.getAllExams();
      setAttempts(attemptsData);
      setExams(examsData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const questions = await examService.generateAIExam();
      setGeneratedQuestions(questions);
      setGeneratedExamTitle(`Đề thi AI - ${new Date().toLocaleDateString('vi-VN')}`);
      setShowConfirmModal(true);
    } catch (error) {
      alert('Có lỗi xảy ra khi tạo đề AI. Vui lòng thử lại.');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const autoContext = searchParams.get('autoContext');
    if (autoContext) {
      setIsGenerating(true);
      generateExamFromContext(autoContext)
        .then(questions => {
          setGeneratedQuestions(questions);
          setGeneratedExamTitle(`Đề thi từ Extension - ${new Date().toLocaleDateString('vi-VN')}`);
          setShowConfirmModal(true);
          // Remove the query param so it doesn't fire again on reload
          setSearchParams({});
        })
        .catch(err => {
          console.error(err);
          alert('Có lỗi khi tạo câu hỏi từ văn bản Extension.');
        })
        .finally(() => setIsGenerating(false));
    }
  }, [searchParams, setSearchParams]);

  const handleSaveGeneratedExam = async () => {
    if (!generatedQuestions || isUploading) return;
    
    if (!generatedExamTitle.trim()) {
      alert('Vui lòng nhập tiêu đề cho đề thi!');
      return;
    }

    setIsUploading(true);
    try {
      const examData: Omit<Exam, 'id'> = {
        title: generatedExamTitle,
        creatorId: user?.uid || 'anonymous-teacher',
        type: 'ai',
        questions: generatedQuestions,
        createdAt: new Date().toISOString()
      };

      const id = await examService.saveExam(examData);
      if (id) {
        alert('Đã lưu đề thi vào ngân hàng đề!');
        setShowConfirmModal(false);
        setGeneratedQuestions(null);
        setGeneratedExamTitle('');
        await loadData();
      } else {
        alert('Không thể lưu đề thi. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error("Save Exam Error:", error);
      alert('Có lỗi xảy ra khi lưu đề thi.');
    } finally {
      setIsUploading(false);
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

  // No login/role gates - teacher dashboard is open to all

  useEffect(() => {
    if (shouldTriggerClick && fileInputRef.current) {
      fileInputRef.current.click();
      setShouldTriggerClick(false);
    }
  }, [shouldTriggerClick]);

  const handleTriggerUpload = (type: 'word' | 'pdf' | 'html') => {
    setUploadingType(type);
    setIsUploadDropdownOpen(false);
    setShouldTriggerClick(true);
  };

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!uploadingType || !e.target.files?.[0]) return;
    
    const file = e.target.files[0];
    setSelectedFile(file);
    setUploadTitle(file.name.split('.')[0]);
    setShowUploadConfirm(true);
  };

  const confirmUpload = async () => {
    if (!uploadingType || !selectedFile || !uploadTitle || isUploading) return;

    setIsUploading(true);
    try {
      const id = await examService.saveUploadedExam(uploadTitle, user?.uid || 'anonymous-teacher', selectedFile, uploadingType);
      if (id) {
        alert(`Đã tải lên đề thi ${uploadingType.toUpperCase()} thành công!`);
        await loadData();
        setShowUploadConfirm(false);
        setUploadingType(null);
        setSelectedFile(null);
        setUploadTitle('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra khi tải lên file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đề thi này?')) return;
    
    try {
      await examService.deleteExam(examId);
      loadData();
    } catch (error) {
      console.error("Error deleting exam:", error);
      alert('Không thể xóa đề thi.');
    }
  };

  const handleSubmitComment = async (attemptId: string) => {
    await examService.addTeacherComment(attemptId, comment, progress);
    setCommentingId(null);
    setComment('');
    setProgress('');
    loadData();
  };

  const classes = Array.from(new Set(attempts.map(a => a.className || 'Chưa xác định'))) as string[];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">CẤU HÌNH GIÁO VIÊN</h2>
          <p className="text-slate-500 mt-1">Quản lý đề thi & Theo dõi tiến độ học sinh (TT 17/2025 BGDĐT)</p>
        </div>
        <div className="flex items-center gap-3">
            <button 
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50"
            >
              {isGenerating ? <RefreshCw size={20} className="animate-spin" /> : <Sparkles size={20} />}
              {isGenerating ? 'ĐANG TẠO ĐỀ...' : 'TẠO ĐỀ THI THẬT (AI)'}
            </button>
          <div className="relative">
            <button 
              onClick={() => setIsUploadDropdownOpen(!isUploadDropdownOpen)}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
            >
              <Upload size={20} /> TẢI ĐỀ THI LÊN
            </button>
            
            {isUploadDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-2xl z-20 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <button 
                  onClick={() => handleTriggerUpload('word')} 
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-xl flex items-center gap-3 font-medium text-slate-700 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center"><FileText size={18} /></div>
                  File Word (.docx)
                </button>
                <button 
                  onClick={() => handleTriggerUpload('pdf')} 
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-xl flex items-center gap-3 font-medium text-slate-700 transition-colors"
                >
                  <div className="w-8 h-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center"><FileText size={18} /></div>
                  File PDF (.pdf)
                </button>
                <button 
                  onClick={() => handleTriggerUpload('html')} 
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-xl flex items-center gap-3 font-medium text-slate-700 transition-colors"
                >
                  <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center"><FileText size={18} /></div>
                  File HTML (.html)
                </button>
              </div>
            )}
            
            <input 
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept={uploadingType === 'word' ? '.doc,.docx' : uploadingType === 'pdf' ? '.pdf' : '.html'}
              onChange={handleUploadFile}
            />
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <TeacherStats attempts={attempts} />

      {/* Exam Bank Section */}
      <ExamManager
        exams={exams}
        examSearchTerm={examSearchTerm}
        setExamSearchTerm={setExamSearchTerm}
        handleDownload={handleDownload}
        handleDeleteExam={handleDeleteExam}
        setViewingExam={setViewingExam}
        onExtractQuestions={handleExtractQuestions}
      />

      {/* History Table Section */}
      <HistoryTable
        attempts={attempts}
        classes={classes}
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        loading={loading}
        loadData={loadData}
        setCommentingId={setCommentingId}
        setComment={setComment}
        setProgress={setProgress}
      />

      {/* Upload Confirmation Modal */}
      {/* AI Extract Questions Modal */}
      {extractingExam && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[80] p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl"
          >
            <div className="p-8 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                  <Brain size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">TRÍCH XUẤT CÂU HỎI BẰNG AI</h3>
                  <p className="text-sm text-slate-500">{extractingExam.title}</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 bg-purple-50 p-4 rounded-2xl border border-purple-100">
                📋 <strong>Hướng dẫn:</strong> Mở file PDF hoặc Word, <strong>chọn tất cả nội dung</strong> (Ctrl+A), <strong>copy</strong> (Ctrl+C) rồi dán vào ô bên dưới.
              </p>
              <textarea
                value={extractText}
                onChange={e => setExtractText(e.target.value)}
                placeholder="Dán nội dung đề thi vào đây... (Ctrl+V)\n\nVí dụ:\nCâu 1: Đặc điểm nào sau đây đúng với vị trí địa lí của nước ta?\nA. Nằm ở rìa phía đông bán đảo Đông Dương\n..."
                rows={10}
                className="w-full p-4 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-purple-400 outline-none resize-none font-mono"
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setExtractingExam(null)}
                  className="px-6 py-3 text-slate-600 border border-slate-200 rounded-xl font-bold hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmExtract}
                  disabled={!extractText.trim() || isExtracting}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50 transition-all"
                >
                  <Brain size={18} />
                  {isExtracting ? 'Đang trích xuất...' : 'Trích xuất câu hỏi'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {showUploadConfirm && selectedFile && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[80] p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-white/20"
            >
              <div className="p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-100">
                  <Upload size={40} />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">XÁC NHẬN TẢI ĐỀ THI</h3>
                  <p className="text-slate-500 font-medium">Bạn có chắc chắn muốn tải đề thi này lên ngân hàng đề không?</p>
                </div>

                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-left space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Tên đề thi</label>
                    <input 
                      type="text"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700"
                      placeholder="Nhập tên đề thi..."
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 font-medium">Định dạng file:</span>
                    <span className="font-black text-indigo-600 uppercase">{uploadingType}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 font-medium">Tên file gốc:</span>
                    <span className="font-bold text-slate-600 truncate max-w-[200px]">{selectedFile.name}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button 
                    onClick={() => {
                      if (isUploading) return;
                      setShowUploadConfirm(false);
                      setSelectedFile(null);
                      setUploadTitle('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    disabled={isUploading}
                    className="px-6 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XCircle size={20} /> HỦY BỎ
                  </button>
                  <button 
                    onClick={confirmUpload}
                    disabled={isUploading || !uploadTitle.trim()}
                    className="px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw size={20} className="animate-spin" /> ĐANG TẢI...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={20} /> XÁC NHẬN
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[60] p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-200">
                    <Sparkles size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">ĐỀ THI AI ĐÃ SẴN SÀNG</h3>
                    <p className="text-slate-500 text-sm">Hệ thống đã tạo thành công đề thi theo cấu trúc 2025.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right hidden md:block">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng số câu hỏi</div>
                    <div className="text-lg font-black text-emerald-600">28 CÂU</div>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-white">
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Tiêu đề đề thi</label>
                  <input 
                    type="text"
                    value={generatedExamTitle}
                    onChange={(e) => setGeneratedExamTitle(e.target.value)}
                    placeholder="Nhập tiêu đề đề thi..."
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Phần I</div>
                    <div className="text-sm font-bold text-indigo-700">18 Câu Trắc Nghiệm</div>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Phần II</div>
                    <div className="text-sm font-bold text-emerald-700">4 Câu Đúng/Sai</div>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Phần III</div>
                    <div className="text-sm font-bold text-amber-700">6 Câu Trả Lời Ngắn</div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">Nội dung chi tiết đề thi</h4>
                  {generatedQuestions?.map((q, i) => (
                    <div key={q.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <div className="flex items-start gap-4 mb-4">
                        <span className="w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center font-bold text-slate-400 text-sm shrink-0">
                          {i + 1}
                        </span>
                        <div className="flex-1">
                          <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">
                            {q.type === 'multiple_choice' ? 'Trắc nghiệm' : q.type === 'true_false' ? 'Đúng/Sai' : 'Trả lời ngắn'}
                          </div>
                          <p className="text-slate-800 font-bold text-base leading-relaxed">{q.text}</p>
                        </div>
                      </div>
                      
                      {q.type === 'multiple_choice' && q.options && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-12">
                          {q.options.map((opt, idx) => (
                            <div key={idx} className={cn(
                              "p-2.5 rounded-xl border text-sm font-medium",
                              idx === q.correctAnswerIndex ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-white border-slate-100 text-slate-500"
                            )}>
                              {String.fromCharCode(65 + idx)}. {opt}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {q.type === 'true_false' && q.statements && (
                        <div className="space-y-2 ml-12">
                          {q.statements.map((s, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2.5 bg-white border border-slate-100 rounded-xl text-sm">
                              <span className="text-slate-600 font-medium">{s.text}</span>
                              <span className={cn(
                                "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase",
                                s.isTrue ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                              )}>
                                {s.isTrue ? 'Đúng' : 'Sai'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {q.type === 'short_answer' && (
                        <div className="ml-12 p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-700 font-bold">
                          Đáp án: {q.correctAnswer} {q.unit}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex flex-col md:flex-row gap-4 items-center justify-between">
                <p className="text-slate-600 font-bold text-sm">Bạn có muốn lưu đề thi này vào ngân hàng đề không?</p>
                <div className="flex gap-4 w-full md:w-auto">
                  <button 
                    onClick={() => {
                      if (isUploading) return;
                      setShowConfirmModal(false);
                      setGeneratedQuestions(null);
                    }}
                    disabled={isUploading}
                    className="flex-1 md:flex-none px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XCircle size={20} /> KHÔNG LƯU
                  </button>
                  <button 
                    onClick={handleSaveGeneratedExam}
                    disabled={isUploading}
                    className="flex-1 md:flex-none px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw size={20} className="animate-spin" /> ĐANG LƯU...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={20} /> CÓ, LƯU LẠI
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Exam Preview Modal */}
      <AnimatePresence>
        {viewingExam && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[70] p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{viewingExam.title}</h3>
                    <p className="text-slate-500 text-sm">Xem trước nội dung đề thi</p>
                  </div>
                </div>
                <button 
                  onClick={() => setViewingExam(null)}
                  className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm"
                >
                  <XCircle size={24} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {viewingExam.questions.map((q, i) => (
                  <div key={q.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="flex items-start gap-4 mb-4">
                      <span className="w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center font-bold text-slate-400 text-sm">
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <div className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-2">
                          {q.type === 'multiple_choice' ? 'Trắc nghiệm' : q.type === 'true_false' ? 'Đúng/Sai' : 'Trả lời ngắn'}
                        </div>
                        <p className="text-slate-800 font-bold text-lg leading-relaxed">{q.text}</p>
                      </div>
                    </div>
                    
                    {q.type === 'multiple_choice' && q.options && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-12">
                        {q.options.map((opt, idx) => (
                          <div key={idx} className={cn(
                            "p-3 rounded-xl border text-sm font-medium",
                            idx === q.correctAnswerIndex ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-white border-slate-100 text-slate-500"
                          )}>
                            {String.fromCharCode(65 + idx)}. {opt}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {q.type === 'true_false' && q.statements && (
                      <div className="space-y-2 ml-12">
                        {q.statements.map((s, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl text-sm">
                            <span className="text-slate-600 font-medium">{s.text}</span>
                            <span className={cn(
                              "px-3 py-1 rounded-lg text-[10px] font-black uppercase",
                              s.isTrue ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                            )}>
                              {s.isTrue ? 'Đúng' : 'Sai'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {q.type === 'short_answer' && (
                      <div className="ml-12 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-700 font-bold">
                        Đáp án: {q.correctAnswer} {q.unit}
                      </div>
                    )}

                    {/* AI Explanation in Review */}
                    {(q.explanation || q.tips || q.mnemonics) && (
                      <div className="mt-6 ml-12 space-y-4 pt-6 border-t border-slate-100">
                        {q.explanation && (
                          <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                            <h4 className="flex items-center gap-2 text-indigo-700 font-bold mb-2 text-xs uppercase tracking-wider">
                              <Sparkles className="w-4 h-4" />
                              Giải thích chi tiết
                            </h4>
                            <p className="text-slate-600 text-sm leading-relaxed">{q.explanation}</p>
                          </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {q.tips && (
                            <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                              <h4 className="text-emerald-700 font-bold mb-1 text-[10px] uppercase tracking-wider">Mẹo làm bài</h4>
                              <p className="text-slate-600 text-xs leading-relaxed">{q.tips}</p>
                            </div>
                          )}
                          {q.mnemonics && (
                            <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                              <h4 className="text-amber-700 font-bold mb-1 text-[10px] uppercase tracking-wider">Mẹo ghi nhớ</h4>
                              <p className="text-slate-600 text-xs leading-relaxed">{q.mnemonics}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex justify-end gap-4">
                <button 
                  onClick={() => handleDownload(viewingExam.id)}
                  className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 flex items-center gap-2"
                >
                  <Download size={20} /> TẢI ĐỀ THI
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Comment Modal */}
      {commentingId && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl border border-slate-100"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200">
                <MessageSquare size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">NHẬN XÉT TIẾN BỘ</h3>
                <p className="text-slate-500 text-sm">Đánh giá chi tiết để học sinh cải thiện kết quả.</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Lời nhận xét của giáo viên</label>
                <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-500 outline-none transition-all resize-none text-slate-700 font-medium"
                  placeholder="Ví dụ: Em cần chú ý hơn phần biểu đồ và bảng số liệu..."
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Đánh giá mức độ tiến bộ</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Xuất sắc', 'Rất tốt', 'Có tiến bộ', 'Cần cố gắng', 'Chưa đạt'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setProgress(p)}
                      className={cn(
                        "px-4 py-3 rounded-xl text-xs font-bold transition-all border",
                        progress === p 
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100" 
                          : "bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setCommentingId(null)}
                  className="flex-1 px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                >
                  HỦY BỎ
                </button>
                <button 
                  onClick={() => handleSubmitComment(commentingId)}
                  disabled={!comment || !progress}
                  className="flex-1 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 disabled:opacity-50 disabled:shadow-none"
                >
                  LƯU KẾT QUẢ
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
