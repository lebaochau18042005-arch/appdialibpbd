import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Question } from '../../types';
import { cn } from '../../utils/cn';
import RichContent from './RichContent';
import DataTableChart from './DataTableChart';
import { isShortAnswerCorrect } from '../../utils/scoreUtils';

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
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-x-hidden mb-6">
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
              <div className="mt-4 p-4 bg-indigo-50/70 rounded-xl border border-indigo-200">
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">📊 Bảng số liệu &amp; Biểu đồ tham khảo</p>
                <DataTableChart content={currentQuestion.context} />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {currentQuestion.type === 'multiple_choice' && currentQuestion.options.map((option, idx) => {
            const isSelected = mcAnswer === idx;
            const isCorrect = idx === currentQuestion.correctAnswerIndex;

            // Determine button style based on state
            let optionClass = '';
            let badgeClass = '';
            let textClass = 'text-slate-800'; // ← default: dark readable text

            if (isSubmitted) {
              if (isCorrect) {
                optionClass = 'border-emerald-500 bg-emerald-50';
                badgeClass = 'border-emerald-500 bg-emerald-500 text-white';
                textClass = 'text-emerald-800 font-semibold';
              } else if (isSelected) {
                optionClass = 'border-rose-500 bg-rose-50';
                badgeClass = 'border-rose-500 bg-rose-500 text-white';
                textClass = 'text-rose-800 font-semibold';
              } else {
                optionClass = 'border-slate-200 bg-slate-50';
                badgeClass = 'border-slate-300 text-slate-400';
                textClass = 'text-slate-500';
              }
            } else if (isSelected) {
              optionClass = 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-400';
              badgeClass = 'border-indigo-500 bg-indigo-500 text-white';
              textClass = 'text-indigo-800 font-semibold';
            } else {
              optionClass = 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50';
              badgeClass = 'border-slate-300 text-slate-700';
              textClass = 'text-slate-900 font-medium';
            }

            return (
              <button
                key={idx}
                onClick={() => !isSubmitted && setMcAnswer(idx)}
                disabled={isSubmitted}
                className={cn(
                  "w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-4",
                  optionClass
                )}
              >
                <span className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm",
                  badgeClass
                )}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className={cn("flex-1 leading-snug", textClass)}>{option}</span>
                {isSubmitted && isCorrect && <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />}
                {isSubmitted && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-rose-500 flex-shrink-0" />}
              </button>
            );
          })}


          {currentQuestion.type === 'true_false' && (
            <div className="space-y-3">
              {/* Header - scoring guide */}
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Phần II — Đúng / Sai (4 mệnh đề)
                </p>
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                  <span className="px-1.5 py-0.5 bg-slate-100 rounded">1Đ</span>
                  <span className="px-1.5 py-0.5 bg-slate-100 rounded">2→0.25</span>
                  <span className="px-1.5 py-0.5 bg-slate-100 rounded">3→0.5</span>
                  <span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded">4→1.0đ</span>
                </div>
              </div>

              {currentQuestion.statements.map((stmt, idx) => {
                const label = ['a', 'b', 'c', 'd'][idx] || String(idx + 1);
                const isTrueSelected = tfAnswer[stmt.id] === true;
                const isFalseSelected = tfAnswer[stmt.id] === false;
                const answered = tfAnswer[stmt.id] !== undefined;
                const isCorrectlyAnswered = tfAnswer[stmt.id] === stmt.isTrue;

                // Border + bg for the card
                let cardStyle = 'border-slate-200 bg-slate-50/50';
                if (isSubmitted) {
                  cardStyle = isCorrectlyAnswered
                    ? 'border-emerald-300 bg-emerald-50'
                    : 'border-rose-300 bg-rose-50';
                } else if (answered) {
                  cardStyle = 'border-indigo-200 bg-indigo-50/40';
                }

                return (
                  <div key={stmt.id} className={`rounded-2xl border-2 transition-all overflow-hidden ${cardStyle}`}>
                    <div className="flex items-start gap-3 p-4">
                      {/* Letter badge */}
                      <span className={cn(
                        'flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center font-black text-sm mt-0.5',
                        isSubmitted
                          ? isCorrectlyAnswered ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                          : answered ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-600'
                      )}>
                        {label}
                      </span>

                      {/* Statement text */}
                      <p className="flex-1 text-sm font-medium text-slate-800 leading-relaxed">{stmt.text}</p>

                      {/* After submit: correct answer badge */}
                      {isSubmitted && (
                        <span className={cn(
                          'flex-shrink-0 px-2 py-1 rounded-lg text-[10px] font-black uppercase',
                          stmt.isTrue ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-rose-100 text-rose-700 border border-rose-200'
                        )}>
                          {stmt.isTrue ? '✓ Đúng' : '✗ Sai'}
                        </span>
                      )}
                    </div>

                    {/* Đúng / Sai buttons */}
                    <div className="flex border-t border-slate-100">
                      <button
                        disabled={isSubmitted}
                        onClick={() => !isSubmitted && setTfAnswer(prev => ({ ...prev, [stmt.id]: true }))}
                        className={cn(
                          'flex-1 py-2.5 text-sm font-black transition-all flex items-center justify-center gap-1.5 border-r border-slate-100',
                          isSubmitted
                            ? stmt.isTrue
                              ? 'bg-emerald-500 text-white'
                              : isTrueSelected && !stmt.isTrue ? 'bg-rose-100 text-rose-600' : 'bg-white text-slate-400'
                            : isTrueSelected
                              ? 'bg-emerald-500 text-white'
                              : 'bg-white text-slate-500 hover:bg-emerald-50 hover:text-emerald-600'
                        )}
                      >
                        <CheckCircle2 size={14} /> Đúng
                      </button>
                      <button
                        disabled={isSubmitted}
                        onClick={() => !isSubmitted && setTfAnswer(prev => ({ ...prev, [stmt.id]: false }))}
                        className={cn(
                          'flex-1 py-2.5 text-sm font-black transition-all flex items-center justify-center gap-1.5',
                          isSubmitted
                            ? !stmt.isTrue
                              ? 'bg-rose-500 text-white'
                              : isFalseSelected && stmt.isTrue ? 'bg-rose-100 text-rose-600' : 'bg-white text-slate-400'
                            : isFalseSelected
                              ? 'bg-rose-500 text-white'
                              : 'bg-white text-slate-500 hover:bg-rose-50 hover:text-rose-600'
                        )}
                      >
                        <XCircle size={14} /> Sai
                      </button>
                    </div>

                    {/* After submit: user choice vs correct */}
                    {isSubmitted && (
                      <div className="px-4 pb-2.5 flex items-center gap-2 text-[11px]">
                        <span className="text-slate-400">Bạn chọn:</span>
                        <span className={cn('font-bold', isCorrectlyAnswered ? 'text-emerald-600' : 'text-rose-600')}>
                          {tfAnswer[stmt.id] === true ? 'Đúng' : tfAnswer[stmt.id] === false ? 'Sai' : '(Bỏ qua)'}
                        </span>
                        {isCorrectlyAnswered
                          ? <CheckCircle2 size={12} className="text-emerald-500" />
                          : <XCircle size={12} className="text-rose-500" />}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Live score indicator */}
              {!isSubmitted && Object.keys(tfAnswer).length > 0 && (
                <div className="flex justify-end">
                  <span className="text-[11px] font-bold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                    Đã chọn {Object.keys(tfAnswer).length}/4 mệnh đề
                  </span>
                </div>
              )}
            </div>
          )}

          {currentQuestion.type === 'short_answer' && (
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nhập đáp án của bạn:
              </label>
              {currentQuestion.unit && !isSubmitted && (
                <p className="text-xs text-slate-400 mb-2 font-medium">
                  💡 Đơn vị tham khảo: <strong>{currentQuestion.unit}</strong> — không cần gõ đơn vị vào ô. Dùng dấu phẩy cho số thập phân (VD: <strong>3,14</strong>)
                </p>
              )}
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={saAnswer}
                  onChange={(e) => setSaAnswer(e.target.value)}
                  disabled={isSubmitted}
                  placeholder="Ví dụ: 1234 hoặc 3,14"
                  className={cn(
                    "flex-1 p-4 rounded-xl border-2 outline-none transition-shadow text-lg font-medium",
                    isSubmitted && isShortAnswerCorrect(saAnswer, currentQuestion.correctAnswer) ? "border-emerald-500 bg-emerald-50 text-emerald-800" :
                    isSubmitted && !isShortAnswerCorrect(saAnswer, currentQuestion.correctAnswer) ? "border-rose-500 bg-rose-50 text-rose-800 font-bold" :
                    "border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 bg-white text-indigo-700 font-bold"
                  )}
                />
                {currentQuestion.unit && (
                  <span className="text-slate-400 font-medium text-sm bg-slate-100 px-2 py-1 rounded-lg">{currentQuestion.unit}</span>
                )}
              </div>
              {isSubmitted && (
                <div className="mt-4">
                  {isShortAnswerCorrect(saAnswer, currentQuestion.correctAnswer) ? (
                    <span className="text-emerald-600 flex items-center gap-1 font-medium"><CheckCircle2 className="w-5 h-5"/> Chính xác!</span>
                  ) : (
                    <div className="text-rose-600 font-medium">
                      <span className="flex items-center gap-1 mb-1"><XCircle className="w-5 h-5"/> Sai rồi.</span>
                      <span className="text-slate-700">Đáp án đúng là: <strong className="text-emerald-600">{currentQuestion.correctAnswer}</strong>{currentQuestion.unit ? ` ${currentQuestion.unit}` : ''}</span>
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
