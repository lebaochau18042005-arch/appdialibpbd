import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Compass, Sparkles, BrainCircuit, RefreshCw, AlertCircle, History, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { examService } from '../services/examService';
import { generateLearningPath } from '../services/ai';
import { QuizAttempt } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';

export default function LearningPath() {
  const { user, profile } = useAuth();
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  
  const [learningPath, setLearningPath] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    let unsubscribeAttempts: (() => void) | undefined;

    const loadData = async () => {
      if (user && !user.isAnonymous) {
        unsubscribeAttempts = examService.subscribeToAttempts((data) => {
          const userAttempts = data.filter(a => a.userId === user.uid);
          setAttempts(userAttempts);
          setLoadingHistory(false);
        });
      } else {
        // Guest: load from localStorage
        const lsAttempts: QuizAttempt[] = JSON.parse(localStorage.getItem('geo_pro_local_attempts') || '[]');
        setAttempts(lsAttempts);
        setLoadingHistory(false);
      }
    };
    
    loadData();

    return () => {
      if (unsubscribeAttempts) unsubscribeAttempts();
    };
  }, [user]);


  const handleGeneratePath = async () => {
    if (attempts.length === 0) {
      alert("Bạn chưa làm bài thi nào! Hãy luyện tập thêm rồi quay lại lấy lộ trình nhé.");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await generateLearningPath(attempts, profile || undefined);
      setLearningPath(response);
    } catch (error) {
      console.error(error);
      alert("Không thể phân tích lộ trình lúc này. Vui lòng thử lại sau.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-bold uppercase tracking-wider mb-3 border border-indigo-500/20">
            <BrainCircuit size={15} /> Trí tuệ nhân tạo cá nhân hóa
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            LỘ TRÌNH HỌC TẬP AI
          </h1>
          <p className="text-slate-300 mt-2 text-sm sm:text-base max-w-2xl">
            Hệ thống chuyên gia AI phân tích lịch sử làm bài để đưa ra kế hoạch cải thiện điểm số tối ưu nhất dành riêng cho bạn.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lịch sử và Phân tích */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <h3 className="font-bold text-slate-200 flex items-center gap-2 mb-4 uppercase tracking-wide text-xs">
              <History className="text-emerald-400" size={18} /> Dữ liệu đầu vào
            </h3>
            
            {loadingHistory ? (
              <div className="flex justify-center py-4">
                <RefreshCw className="w-6 h-6 animate-spin text-slate-500" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-2xl">
                  <div className="text-slate-400 text-xs font-medium">Số bài đã thi</div>
                  <div className="text-xl font-black text-white">{attempts.length}</div>
                </div>
                
                {attempts.length > 0 && (
                  <div className="flex justify-between items-center p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-2xl">
                    <div className="text-slate-400 text-xs font-medium">Điểm trung bình</div>
                    <div className="text-xl font-black text-emerald-400">
                      {(attempts.reduce((acc, curr) => acc + curr.score, 0) / attempts.length).toFixed(1)}
                    </div>
                  </div>
                )}
                
                {profile?.targetScore && (
                  <div className="flex justify-between items-center p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-2xl">
                    <div className="text-slate-400 text-xs font-medium flex items-center gap-1.5">
                      <Target size={14} className="text-indigo-400" /> Mục tiêu
                    </div>
                    <div className="text-xl font-black text-indigo-400">{profile.targetScore}đ</div>
                  </div>
                )}
              </div>
            )}

            {!user && (
              <div className="mt-4 p-3.5 bg-amber-500/10 text-amber-300 text-xs font-medium rounded-xl border border-amber-500/20 flex items-start gap-2.5">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-400" />
                <p>Bạn đang sử dụng tư cách khách. Vui lòng đăng nhập để hệ thống theo dõi và lưu trữ điểm số tốt hơn.</p>
              </div>
            )}
          </div>

          <button
            onClick={handleGeneratePath}
            disabled={isGenerating || attempts.length === 0}
            className="w-full flex items-center justify-center gap-2.5 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-2xl font-black transition-all shadow-xl shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                ĐANG PHÂN TÍCH...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                {learningPath ? 'PHÂN TÍCH LẠI' : 'TẠO LỘ TRÌNH CỦA TÔI'}
              </>
            )}
          </button>
        </div>

        {/* Bảng Kế hoạch */}
        <div className="lg:col-span-2">
          {learningPath ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900/90 p-8 rounded-3xl border border-slate-800 shadow-xl"
            >
              <div className="prose prose-invert prose-emerald max-w-none text-slate-200">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {learningPath}
                </ReactMarkdown>
              </div>
            </motion.div>
          ) : (
            <div className="h-full min-h-[380px] border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-center p-8 bg-slate-900/40">
              <div className="w-20 h-20 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mb-5 border border-indigo-500/20">
                <Compass size={36} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Chưa có lộ trình nào</h3>
              <p className="text-slate-400 max-w-sm mb-6 text-xs leading-relaxed">
                Làm ít nhất một bài thi thử và nhấn nút "Tạo Lộ Trình" để nhận phân tích điểm yếu và phương pháp học từ Chuyên gia AI.
              </p>
              {attempts.length === 0 && (
                <Link to="/exam" className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl transition-colors text-xs">
                  Vào Thi Thử Ngay
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
