import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, AlertCircle, RefreshCcw, Home } from 'lucide-react';
import { NavigateFunction } from 'react-router-dom';

interface QuizResultCardProps {
  timeRanOut: boolean;
  mode: string;
  filter: string | null;
  score: number;
  maxScore: number;
  startTime: number;
  navigate: NavigateFunction;
}

export default function QuizResultCard({
  timeRanOut,
  mode,
  filter,
  score,
  maxScore,
  startTime,
  navigate
}: QuizResultCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center"
    >
      {timeRanOut && (
        <div className="mb-6 inline-flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-2 rounded-full font-medium">
          <AlertCircle className="w-5 h-5" />
          Đã hết thời gian làm bài!
        </div>
      )}
      <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-12 h-12" />
      </div>
      <h2 className="text-3xl font-bold text-slate-800 mb-2">Hoàn thành!</h2>
      <p className="text-slate-600 mb-8">Bạn đã hoàn thành bài thi {mode === 'exam' ? 'tổng hợp' : filter}</p>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-slate-50 p-4 rounded-2xl">
          <div className="text-sm text-slate-500 mb-1">Điểm số</div>
          <div className="text-3xl font-bold text-emerald-600">{score.toFixed(2)} / {maxScore.toFixed(2)}</div>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl">
          <div className="text-sm text-slate-500 mb-1">Thời gian</div>
          <div className="text-3xl font-bold text-blue-600">{Math.floor(((Date.now() - startTime) / 1000) / 60)}p {Math.floor(((Date.now() - startTime) / 1000) % 60)}s</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button 
          onClick={() => navigate(0 as any)}
          className="px-6 py-3 bg-emerald-50 text-emerald-700 rounded-xl font-semibold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
        >
          <RefreshCcw className="w-5 h-5" />
          Làm lại
        </button>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
        >
          <Home className="w-5 h-5" />
          Về trang chủ
        </button>
      </div>
    </motion.div>
  );
}
