import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import { Question } from '../../types';
import { cn } from '../../utils/cn';

interface ExamActiveCardProps {
  currentQuestion: Question;
  currentIndex: number;
  examQuestions: Question[];
  answer: any;
  handleAnswer: (ans: any) => void;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  setShowQuestionMap: (show: boolean) => void;
  isQuestionAnswered: (idx: number) => boolean;
}

export default function ExamActiveCard({
  currentQuestion,
  currentIndex,
  examQuestions,
  answer,
  handleAnswer,
  setCurrentIndex,
  setShowQuestionMap,
  isQuestionAnswered
}: ExamActiveCardProps) {
  return (
    <motion.div
      key={currentIndex}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
    >
      <div className="p-6 md:p-10">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-md">
            {currentQuestion.type === 'multiple_choice' ? 'Phần I: Trắc nghiệm' : 
             currentQuestion.type === 'true_false' ? 'Phần II: Đúng/Sai' : 
             'Phần III: Trả lời ngắn'}
          </span>
          {currentQuestion.cognitiveLevel && (
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase">
              {currentQuestion.cognitiveLevel}
            </span>
          )}
        </div>

        <h2 className="text-xl md:text-2xl font-medium text-slate-800 leading-relaxed mb-6">
          {currentQuestion.text}
        </h2>

        {currentQuestion.imageUrl && (
          <div className="mb-6 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
            <img
              src={currentQuestion.imageUrl}
              alt="Hình minh họa câu hỏi"
              className="max-w-full max-h-80 object-contain"
            />
          </div>
        )}

        {currentQuestion.context && (
          <div className="mb-8 p-5 bg-slate-50 rounded-2xl border border-slate-200 text-slate-700 italic">
            {currentQuestion.context}
          </div>
        )}


        <div className="space-y-4">
          {currentQuestion.type === 'multiple_choice' && currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              className={cn(
                "w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center gap-4 group",
                answer === idx 
                  ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm" 
                  : "border-slate-100 hover:border-emerald-200 hover:bg-slate-50 text-slate-700"
              )}
            >
              <span className={cn(
                "flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold transition-colors",
                answer === idx 
                  ? "border-emerald-500 bg-emerald-500 text-white" 
                  : "border-slate-200 text-slate-400 group-hover:border-emerald-300"
              )}>
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="text-lg">{option}</span>
            </button>
          ))}

          {currentQuestion.type === 'true_false' && (
            <div className="space-y-6">
              {currentQuestion.statements.map((stmt) => (
                <div key={stmt.id} className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50">
                  <p className="text-lg font-medium text-slate-800 mb-4">{stmt.text}</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAnswer({ ...(answer || {}), [stmt.id]: true })}
                      className={cn(
                        "flex-1 py-3 rounded-xl border-2 font-bold transition-all",
                        answer?.[stmt.id] === true
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200"
                      )}
                    >
                      Đúng
                    </button>
                    <button
                      onClick={() => handleAnswer({ ...(answer || {}), [stmt.id]: false })}
                      className={cn(
                        "flex-1 py-3 rounded-xl border-2 font-bold transition-all",
                        answer?.[stmt.id] === false
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200"
                      )}
                    >
                      Sai
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {currentQuestion.type === 'short_answer' && (
            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200">
              <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
                Đáp án của bạn
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={answer || ''}
                  onChange={(e) => handleAnswer(e.target.value)}
                  placeholder="Nhập kết quả số..."
                  className="flex-1 p-5 rounded-2xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all text-2xl font-bold text-slate-800"
                />
                {currentQuestion.unit && (
                  <span className="text-xl font-bold text-slate-400">{currentQuestion.unit}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-50 p-6 flex items-center justify-between border-t border-slate-100">
        <button
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-white disabled:opacity-30 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
          Câu trước
        </button>
        
        <div className="hidden md:flex gap-1">
          {examQuestions.map((_, idx) => (
            <div 
              key={idx}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all",
                idx === currentIndex ? "w-6 bg-emerald-500" : 
                isQuestionAnswered(idx) ? "bg-emerald-200" : "bg-slate-200"
              )}
            />
          ))}
        </div>

        <button
          onClick={() => {
            if (currentIndex < examQuestions.length - 1) {
              setCurrentIndex(prev => prev + 1);
            } else {
              setShowQuestionMap(true);
            }
          }}
          className="flex items-center gap-2 px-8 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all shadow-md"
        >
          {currentIndex < examQuestions.length - 1 ? 'Tiếp theo' : 'Kiểm tra lại'}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}
