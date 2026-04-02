import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Home, Sparkles, Loader2, LayoutGrid } from 'lucide-react';
import { NavigateFunction } from 'react-router-dom';
import { Question } from '../../types';
import { cn } from '../../utils/cn';
import RichContent from './RichContent';


// Note: QuestionTextBlock replaced by shared RichContent (supports LaTeX + GFM tables)

interface ExamReviewCardProps {
  examQuestions: Question[];
  answers: Record<number, any>;
  finalScore: number;
  maxPossibleScore: number;
  detailedExplanations: Record<number, { explanation: string, tips: string, mnemonics: string }>;
  loadingExplanation: number | null;
  handleGetDetailedExplanation: (idx: number) => Promise<void>;
  setIsReviewMode: (show: boolean) => void;
  navigate: NavigateFunction;
  isCorrect: (idx: number) => boolean;
  isStatementCorrect: (questionIndex: number, statementId: string) => boolean;
}

export default function ExamReviewCard({
  examQuestions,
  answers,
  finalScore,
  maxPossibleScore,
  detailedExplanations,
  loadingExplanation,
  handleGetDetailedExplanation,
  setIsReviewMode,
  navigate,
  isCorrect,
  isStatementCorrect
}: ExamReviewCardProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 pb-24">
      <div className="sticky top-0 z-20 bg-slate-50/80 backdrop-blur-md py-4 mb-6 border-b border-slate-200 -mx-4 px-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsReviewMode(false)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-slate-600" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Xem lại bài làm</h1>
              <p className="text-xs text-slate-500">Điểm số: {finalScore.toFixed(2)} / {maxPossibleScore.toFixed(2)}</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-slate-800 text-white px-5 py-2 rounded-xl font-bold hover:bg-slate-900 transition-colors"
          >
            <Home className="w-4 h-4" />
            Thoát
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          {examQuestions.map((q, idx) => (
            <div key={q.id} id={q.id} className={cn(
              "bg-white rounded-3xl shadow-sm border overflow-hidden transition-all",
              isCorrect(idx) ? "border-emerald-100" : "border-rose-100"
            )}>
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm">
                      {idx + 1}
                    </span>
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded",
                      isCorrect(idx) ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                    )}>
                      {isCorrect(idx) ? 'Chính xác' : 'Chưa đúng'}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {q.type === 'multiple_choice' ? 'Trắc nghiệm' : q.type === 'true_false' ? 'Đúng/Sai' : 'Trả lời ngắn'}
                  </span>
                </div>

                <div className="mb-4 text-base font-medium text-slate-800">
                  <RichContent content={q.text} />
                </div>

                {q.imageUrl && (
                  <div className="mb-4 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                    <img src={q.imageUrl} alt="Hình minh họa" className="max-w-full max-h-72 object-contain" />
                  </div>
                )}

                {q.context && (
                  <div className="mb-6 p-4 bg-blue-50/60 rounded-2xl border border-blue-200">
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">📊 Bảng số liệu / Dữ liệu tham khảo</p>
                    <RichContent content={q.context} />
                  </div>
                )}

                <div className="space-y-3 mb-8">
                  {q.type === 'multiple_choice' && q.options.map((opt, oIdx) => (
                    <div key={oIdx} className={cn(
                      "p-4 rounded-xl border-2 flex items-center gap-3",
                      oIdx === q.correctAnswerIndex ? "border-emerald-500 bg-emerald-50" :
                      answers[idx] === oIdx ? "border-rose-500 bg-rose-50" : "border-slate-50 bg-slate-50/50"
                    )}>
                      <span className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                        oIdx === q.correctAnswerIndex ? "bg-emerald-500 text-white" :
                        answers[idx] === oIdx ? "bg-rose-500 text-white" : "bg-slate-200 text-slate-500"
                      )}>
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span className={cn(
                        "font-medium",
                        oIdx === q.correctAnswerIndex ? "text-emerald-700" :
                        answers[idx] === oIdx ? "text-rose-700" : "text-slate-600"
                      )}>{opt}</span>
                    </div>
                  ))}

                  {q.type === 'true_false' && q.statements.map((stmt) => (
                    <div key={stmt.id} className={cn(
                      "p-4 rounded-xl border transition-all",
                      isStatementCorrect(idx, stmt.id) ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100"
                    )}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={cn(
                          "font-medium",
                          isStatementCorrect(idx, stmt.id) ? "text-emerald-800" : "text-rose-800"
                        )}>{stmt.text}</span>
                        <div className="flex gap-2">
                          <span className={cn(
                            "px-2 py-1 rounded text-[10px] font-bold uppercase",
                            stmt.isTrue ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                          )}>
                            Đáp án: {stmt.isTrue ? 'Đúng' : 'Sai'}
                          </span>
                          {answers[idx]?.[stmt.id] !== undefined && (
                            <span className={cn(
                              "px-2 py-1 rounded text-[10px] font-bold uppercase border-2",
                              answers[idx][stmt.id] === stmt.isTrue ? "border-emerald-500 text-emerald-600" : "border-rose-500 text-rose-600"
                            )}>
                              Bạn chọn: {answers[idx][stmt.id] ? 'Đúng' : 'Sai'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {q.type === 'short_answer' && (
                    <div className="space-y-2">
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-1">Đáp án đúng</span>
                        <span className="text-lg font-bold text-emerald-700">{q.correctAnswer} {q.unit}</span>
                      </div>
                      <div className={cn(
                        "p-4 rounded-xl border",
                        isCorrect(idx) ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100"
                      )}>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Bạn trả lời</span>
                        <span className="text-lg font-bold text-slate-700">{answers[idx] || '(Bỏ trống)'}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Explanation Section */}
                <div className="mt-8 pt-8 border-t border-slate-100">
                  {!detailedExplanations[idx] ? (
                    <button 
                      onClick={() => handleGetDetailedExplanation(idx)}
                      disabled={loadingExplanation === idx}
                      className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-100 transition-all border border-indigo-100"
                    >
                      {loadingExplanation === idx ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Sparkles className="w-5 h-5" />
                      )}
                      Xem chi tiết giải thích AI
                    </button>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                        <h4 className="flex items-center gap-2 text-indigo-700 font-bold mb-3">
                          <Sparkles className="w-5 h-5" />
                          Giải thích chi tiết
                        </h4>
                        <p className="text-slate-700 leading-relaxed">{detailedExplanations[idx].explanation}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
                          <h4 className="text-emerald-700 font-bold mb-2 text-sm uppercase tracking-wider">Mẹo làm bài</h4>
                          <p className="text-slate-600 text-sm leading-relaxed">{detailedExplanations[idx].tips}</p>
                        </div>
                        <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100">
                          <h4 className="text-amber-700 font-bold mb-2 text-sm uppercase tracking-wider">Mẹo ghi nhớ</h4>
                          <p className="text-slate-600 text-sm leading-relaxed">{detailedExplanations[idx].mnemonics}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden lg:block">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sticky top-28">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-indigo-600" />
              Tổng quan kết quả
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {examQuestions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const element = document.getElementById(examQuestions[idx].id);
                    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className={cn(
                    "aspect-square rounded-lg text-xs font-bold flex items-center justify-center border-2 transition-all",
                    isCorrect(idx) ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-rose-50 border-rose-200 text-rose-600"
                  )}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Số câu đúng</span>
                <span className="font-bold text-emerald-600">{examQuestions.filter((_, i) => isCorrect(i)).length} / {examQuestions.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Điểm số</span>
                <span className="font-bold text-indigo-600">{finalScore.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
