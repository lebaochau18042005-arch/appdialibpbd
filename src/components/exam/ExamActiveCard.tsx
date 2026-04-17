import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import { Question } from '../../types';
import { cn } from '../../utils/cn';
import RichContent from './RichContent';
import DataTableChart from './DataTableChart';


// Note: QuestionText has been replaced by the shared RichContent component (supports LaTeX, GFM tables, math)

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

// Helper: true when context has a real Markdown table (pipe syntax)
function hasMarkdownTable(ctx: string | null | undefined): boolean {
  if (!ctx) return false;
  const trimmed = ctx.trim();
  if (trimmed.length < 10) return false;
  if (['null', 'undefined', 'none', 'n/a'].includes(trimmed.toLowerCase())) return false;
  return trimmed.includes('|');
}

// Helper: true when context has any meaningful content (including plain text)
function hasAnyContext(ctx: string | null | undefined): boolean {
  if (!ctx) return false;
  const trimmed = ctx.trim();
  if (trimmed.length < 10) return false;
  if (['null', 'undefined', 'none', 'n/a'].includes(trimmed.toLowerCase())) return false;
  return true;
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
  const hasTable = hasMarkdownTable(currentQuestion.context);
  const hasCtx = hasAnyContext(currentQuestion.context);
  const CHART_RE = /biểu đồ|bảng số liệu|bảng dưới đây|số liệu|hình dưới/i;

  return (
    <motion.div
      key={currentIndex}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-x-hidden"
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

        <div className="text-xl md:text-2xl font-medium text-slate-800 leading-relaxed mb-4">
          <RichContent content={currentQuestion.text} />
        </div>

        {currentQuestion.imageUrl && (
          <div className="mb-6 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
            <img
              src={currentQuestion.imageUrl}
              alt="Hình minh họa câu hỏi"
              className="max-w-full max-h-96 object-contain"
            />
          </div>
        )}

        {/* Render DataTableChart khi context có cú pháp bảng Markdown (pipe |) */}
        {hasTable && (
          <div className="mb-6 p-4 bg-indigo-50/70 rounded-2xl border border-indigo-200">
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3">📊 Bảng số liệu &amp; Biểu đồ tham khảo</p>
            <DataTableChart content={currentQuestion.context!} />
          </div>
        )}

        {/* Fallback: hiển thị context văn xuôi (không có |) dưới dạng text block */}
        {!hasTable && hasCtx && (
          <div className="mb-6 p-4 bg-amber-50/80 rounded-2xl border border-amber-200">
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">📋 Ngữ cảnh / Số liệu tham khảo</p>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{currentQuestion.context}</p>
          </div>
        )}

        {/* Cảnh báo khi câu hỏi đề cập bảng/biểu đồ nhưng context hoàn toàn rỗng */}
        {!hasCtx && !currentQuestion.imageUrl && !currentQuestion.text?.includes('|') && CHART_RE.test(currentQuestion.text) && (
          <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl flex items-start gap-3">
            <span className="text-amber-500 text-xl shrink-0">⚠️</span>
            <div>
              <p className="text-sm font-bold text-amber-800">Câu hỏi này tham chiếu biểu đồ/bảng nhưng dữ liệu chưa được tải.</p>
              <p className="text-xs text-amber-600 mt-1">Hãy thử làm lại đề mới — AI sẽ tự động thêm bảng số liệu theo quy tắc mới.</p>
            </div>
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
              )}>{String.fromCharCode(65 + idx)}</span>
              <span className="text-lg">{option}</span>
            </button>
          ))}

          {currentQuestion.type === 'true_false' && (
            <div className="space-y-3">
              {/* Scoring guide header */}
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phần II — Đúng / Sai (4 mệnh đề)</p>
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                  <span className="px-1.5 py-0.5 bg-slate-100 rounded">1→0.1đ</span>
                  <span className="px-1.5 py-0.5 bg-slate-100 rounded">2→0.25đ</span>
                  <span className="px-1.5 py-0.5 bg-slate-100 rounded">3→0.5đ</span>
                  <span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded">4→1.0đ</span>
                </div>
              </div>
              {currentQuestion.statements.map((stmt, idx) => {
                const label = ['a', 'b', 'c', 'd'][idx] || String(idx + 1);
                const isTrueSelected = answer?.[stmt.id] === true;
                const isFalseSelected = answer?.[stmt.id] === false;
                const answered = answer?.[stmt.id] !== undefined;
                return (
                  <div key={stmt.id} className={cn(
                    'rounded-2xl border-2 transition-all overflow-hidden',
                    answered ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-100 bg-slate-50/50'
                  )}>
                    <div className="flex items-start gap-3 p-4">
                      <span className={cn(
                        'flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center font-black text-sm mt-0.5',
                        answered ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-600'
                      )}>{label}</span>
                      <p className="flex-1 text-base font-medium text-slate-800 leading-relaxed">{stmt.text}</p>
                    </div>
                    <div className="flex border-t border-slate-100">
                      <button
                        onClick={() => handleAnswer({ ...(answer || {}), [stmt.id]: true })}
                        className={cn(
                          'flex-1 py-3 text-sm font-black transition-all flex items-center justify-center gap-1.5 border-r border-slate-100',
                          isTrueSelected ? 'bg-emerald-500 text-white' : 'bg-white text-slate-500 hover:bg-emerald-50 hover:text-emerald-600'
                        )}
                      >✓ Đúng</button>
                      <button
                        onClick={() => handleAnswer({ ...(answer || {}), [stmt.id]: false })}
                        className={cn(
                          'flex-1 py-3 text-sm font-black transition-all flex items-center justify-center gap-1.5',
                          isFalseSelected ? 'bg-rose-500 text-white' : 'bg-white text-slate-500 hover:bg-rose-50 hover:text-rose-600'
                        )}
                      >✗ Sai</button>
                    </div>
                  </div>
                );
              })}
              {/* Progress indicator */}
              {answer && Object.keys(answer).length > 0 && Object.keys(answer).length < 4 && (
                <div className="flex justify-end">
                  <span className="text-[11px] font-bold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                    Đã chọn {Object.keys(answer).length}/4 mệnh đề
                  </span>
                </div>
              )}
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
