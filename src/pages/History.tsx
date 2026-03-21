import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { History as HistoryIcon, Clock, Target, Calendar, MessageSquare, ShieldCheck, Download, RefreshCw, Lock, LogIn } from 'lucide-react';
import { QuizAttempt } from '../types';
import { examService } from '../services/examService';
import { cn } from '../utils/cn';
import { useAuth } from '../contexts/AuthContext';
import ProgressChart from '../components/charts/ProgressChart';

export default function History() {
  const { user, loading: authLoading, login } = useAuth();
  const [history, setHistory] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [user]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      if (user && !user.isAnonymous) {
        // Logged-in user: fetch from Firestore
        const data = await examService.getStudentAttempts(user.uid);
        setHistory(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      } else {
        // Guest user: load from localStorage
        const lsAttempts: QuizAttempt[] = JSON.parse(localStorage.getItem('geo_pro_local_attempts') || '[]');
        setHistory(lsAttempts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}p ${s}s`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto pb-20 md:pb-0 px-4"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-100">
            <HistoryIcon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">LỊCH SỬ LÀM BÀI</h1>
            <p className="text-slate-500 font-medium">Theo dõi tiến độ và nhận xét từ giáo viên</p>
          </div>
        </div>
        <button 
          onClick={loadHistory}
          className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100"
        >
          <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="p-24 text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent mb-4"></div>
          <p className="text-slate-500 font-medium tracking-wide">Đang tải lịch sử học tập...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="bg-white p-16 rounded-[2.5rem] shadow-sm border border-slate-100 text-center">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <HistoryIcon className="w-12 h-12 text-slate-200" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Chưa có dữ liệu ôn luyện</h3>
          <p className="text-slate-500 max-w-sm mx-auto">Bạn chưa hoàn thành bài thi nào. Hãy bắt đầu ôn luyện để theo dõi tiến độ nhé!</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mb-8">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Tiến độ điểm số</h3>
            <ProgressChart attempts={history} />
          </div>
          {history.map((attempt) => (
            <motion.div 
              key={attempt.id} 
              layout
              className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-all group"
            >
              <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-indigo-100">
                      ĐỀ THI TỔNG HỢP
                    </span>
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{attempt.examTitle}</h3>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-slate-300" />
                      {new Date(attempt.date).toLocaleDateString('vi-VN')}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-slate-300" />
                      {formatTime(attempt.timeSpent)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Target size={16} className="text-slate-300" />
                      {attempt.score.toFixed(1)}/10 ĐIỂM
                    </div>
                  </div>

                  {attempt.teacherComment && (
                    <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <MessageSquare size={48} />
                      </div>
                      <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] mb-3 uppercase tracking-[0.2em]">
                        <MessageSquare size={14} /> Nhận xét từ giáo viên
                      </div>
                      <p className="text-slate-700 font-medium leading-relaxed italic">"{attempt.teacherComment}"</p>
                      {attempt.studentProgress && (
                        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-white text-indigo-600 rounded-xl text-xs font-black border border-indigo-100 shadow-sm">
                          <ShieldCheck size={14} /> TIẾN ĐỘ: {attempt.studentProgress.toUpperCase()}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end gap-4 w-full md:w-auto border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">
                  <div className="text-center md:text-right flex-1 md:flex-none">
                    <div className="text-4xl font-black text-indigo-600 leading-none">{attempt.score.toFixed(1)}</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Điểm số</div>
                  </div>
                  <button 
                    onClick={() => examService.downloadExam(attempt.examId)}
                    className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-indigo-600 transition-all shadow-lg shadow-slate-100"
                  >
                    <Download size={16} /> TẢI ĐỀ THI
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
