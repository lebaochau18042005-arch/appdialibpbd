import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Question } from '../../types';
import { cn } from '../../utils/cn';
import RichContent from './RichContent';

interface QuizActiveCardProps {
  currentQuestion: Question;
  currentIndex: number;
  isSubmitted: boolean;
  mcAnswer: number | null;
  tfAnswer: Record<string, boolean>;
  saAnswer: string;
  setMcAnswer: (ans: number | null) => void;
  setTfAnswer: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setSaAnswer: (ans: string) => void;
  aiExplanation: string | null;
  isAiLoading: boolean;
  isAnswerCorrect: boolean | null;
}

export default function QuizActiveCard({
  currentQuestion,
  currentIndex,
  isSubmitted,
  mcAnswer,
  tfAnswer,
  saAnswer,
  setMcAnswer,
  setTfAnswer,
  setSaAnswer,
  aiExplanation,
  isAiLoading,
  isAnswerCorrect
}: QuizActiveCardProps) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-6">
      <div className="p-6 md:p-8">
        <div className="flex items-start gap-3 mb-6">
          <span className="flex-shrink-0 w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold">
            {currentIndex + 1}
          </span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">
                {currentQuestion.type === 'multiple_choice' ? 'Phần 1: Trắc nghiệm khách quan' : 
                 currentQuestion.type === 'true_false' ? 'Phần 2: Trắc nghiệm Đúng/Sai' : 
                 'Phần 3: Trả lời ngắn'}
              </span>
              {currentQuestion.cognitiveLevel && (
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  {currentQuestion.cognitiveLevel}
                </span>
              )}
            </div>
            <div className="text-lg md:text-xl font-medium text-slate-800 leading-relaxed">
              <RichContent content={currentQuestion.text} />
            </div>
            {currentQuestion.imageUrl && (
              <div className="mt-4 mb-2 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                <img src={currentQuestion.imageUrl} alt="Hình minh họa"
                  className="max-w-full max-h-72 object-contain" />
              </div>
            )}
            {currentQuestion.context && (
              <div className="mt-4 p-4 bg-blue-50/80 rounded-xl border border-blue-200">
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">📊 Bảng số liệu / Dữ liệu tham khảo</p>
                <RichContent content={currentQuestion.context} />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {currentQuestion.type === 'multiple_choice' && currentQuestion.options.map((option, idx) => {
            const isSelected = mcAnswer === idx;
            const isCorrect = idx === currentQuestion.correctAnswerIndex;
            
            let optionStateClass = "border-slate-200 hover:border-emerald-300 hover:bg-emerald-50";
            if (isSubmitted) {
              if (isCorrect) {
                optionStateClass = "border-emerald-500 bg-emerald-50 text-emerald-800";
              } else if (isSelected) {
                optionStateClass = "border-rose-500 bg-rose-50 text-rose-800";
              } else {
                optionStateClass = "border-slate-100 opacity-50";
              }
            } else if (isSelected) {
              optionStateClass = "border-emerald-500 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-500";
            }

            return (
              <button
                key={idx}
                onClick={() => !isSubmitted && setMcAnswer(idx)}
                disabled={isSubmitted}
                className={cn(
                  "w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-4",
                  optionStateClass
                )}
              >
                <span className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm",
                  isSubmitted && isCorrect ? "border-emerald-500 bg-emerald-500 text-white" :
                  isSubmitted && isSelected && !isCorrect ? "border-rose-500 bg-rose-500 text-white" :
                  isSelected ? "border-emerald-500 text-emerald-600" : "border-slate-300 text-slate-500"
                )}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-1">{option}</span>
                {isSubmitted && isCorrect && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                {isSubmitted && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-rose-500" />}
              </button>
            );
          })}

          {currentQuestion.type === 'true_false' && (
            <div className="space-y-4">
              {currentQuestion.statements.map((stmt, idx) => {
                const isTrueSelected = tfAnswer[stmt.id] === true;
                const isFalseSelected = tfAnswer[stmt.id] === false;
                const isCorrectlyAnswered = tfAnswer[stmt.id] === stmt.isTrue;

                return (
                  <div key={stmt.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50">
                    <p className="font-medium text-slate-800 mb-3">{stmt.text}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => !isSubmitted && setTfAnswer(prev => ({...prev, [stmt.id]: true}))}
                        disabled={isSubmitted}
                        className={cn(
                          "flex-1 py-2 rounded-xl border-2 font-medium transition-colors",
                          isSubmitted && stmt.isTrue ? "border-emerald-500 bg-emerald-50 text-emerald-700" :
                          isSubmitted && isTrueSelected && !stmt.isTrue ? "border-rose-500 bg-rose-50 text-rose-700" :
                          isTrueSelected ? "border-emerald-500 bg-emerald-50 text-emerald-700" :
                          "border-slate-200 bg-white text-slate-600 hover:border-emerald-200"
                        )}
                      >
                        Đúng
                      </button>
                      <button
                        onClick={() => !isSubmitted && setTfAnswer(prev => ({...prev, [stmt.id]: false}))}
                        disabled={isSubmitted}
                        className={cn(
                          "flex-1 py-2 rounded-xl border-2 font-medium transition-colors",
                          isSubmitted && !stmt.isTrue ? "border-emerald-500 bg-emerald-50 text-emerald-700" :
                          isSubmitted && isFalseSelected && stmt.isTrue ? "border-rose-500 bg-rose-50 text-rose-700" :
                          isFalseSelected ? "border-emerald-500 bg-emerald-50 text-emerald-700" :
                          "border-slate-200 bg-white text-slate-600 hover:border-emerald-200"
                        )}
                      >
                        Sai
                      </button>
                    </div>
                    {isSubmitted && (
                      <div className="mt-2 text-sm flex items-center gap-1">
                        {isCorrectlyAnswered ? (
                          <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Trả lời đúng</span>
                        ) : (
                          <span className="text-rose-600 flex items-center gap-1"><XCircle className="w-4 h-4"/> Trả lời sai</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {currentQuestion.type === 'short_answer' && (
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <label className="block text-sm font-medium text-slate-700 mb-2">Nhập đáp án của bạn:</label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={saAnswer}
                  onChange={(e) => setSaAnswer(e.target.value)}
                  disabled={isSubmitted}
                  placeholder="Nhập số..."
                  className={cn(
                    "flex-1 p-4 rounded-xl border-2 outline-none transition-shadow text-lg font-medium",
                    isSubmitted && saAnswer.trim() === currentQuestion.correctAnswer.toString() ? "border-emerald-500 bg-emerald-50 text-emerald-800" :
                    isSubmitted && saAnswer.trim() !== currentQuestion.correctAnswer.toString() ? "border-rose-500 bg-rose-50 text-rose-800" :
                    "border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 bg-white"
                  )}
                />
                {currentQuestion.unit && <span className="text-slate-500 font-medium">{currentQuestion.unit}</span>}
              </div>
              {isSubmitted && (
                <div className="mt-4">
                  {saAnswer.trim() === currentQuestion.correctAnswer.toString() ? (
                    <span className="text-emerald-600 flex items-center gap-1 font-medium"><CheckCircle2 className="w-5 h-5"/> Chính xác!</span>
                  ) : (
                    <div className="text-rose-600 font-medium">
                      <span className="flex items-center gap-1 mb-1"><XCircle className="w-5 h-5"/> Sai rồi.</span>
                      <span className="text-slate-700">Đáp án đúng là: <strong className="text-emerald-600">{currentQuestion.correctAnswer}</strong></span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isSubmitted && (aiExplanation || isAiLoading) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={cn(
              "border-t p-6",
              isAnswerCorrect ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100"
            )}
          >
            <div className="flex items-start gap-3">
              <AlertCircle className={cn(
                "w-6 h-6 flex-shrink-0 mt-0.5",
                isAnswerCorrect ? "text-emerald-600" : "text-rose-600"
              )} />
              <div className="flex-1">
                <h4 className={cn(
                  "font-bold mb-3 text-lg",
                  isAnswerCorrect ? "text-emerald-800" : "text-rose-800"
                )}>Phân tích từ AI</h4>
                {isAiLoading ? (
                  <div className={cn(
                    "flex items-center gap-2",
                    isAnswerCorrect ? "text-emerald-600" : "text-rose-600"
                  )}>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="font-medium">Đang phân tích câu trả lời...</span>
                  </div>
                ) : (
                  <div className={cn(
                    "leading-relaxed",
                    isAnswerCorrect ? "text-emerald-900" : "text-rose-900"
                  )}>
                    <RichContent content={aiExplanation!} />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
