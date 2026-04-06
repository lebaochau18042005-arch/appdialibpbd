import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Gamepad2, CheckCircle2, XCircle, ChevronRight, Trophy, RotateCcw } from 'lucide-react';
import { Exam, Question } from '../../types';
import { cn } from '../../utils/cn';

interface QuizPlayModalProps {
  exam: Exam;
  onClose: () => void;
}

type AnswerState = Record<number, any>;

function getCorrect(q: Question): any {
  if (q.type === 'multiple_choice') return q.correctAnswerIndex;
  if (q.type === 'true_false') return q.statements?.map(s => s.isTrue);
  if (q.type === 'short_answer') return String(q.correctAnswer).trim().toLowerCase();
  return null;
}

function isCorrect(q: Question, ans: any): boolean {
  if (ans === undefined || ans === null || ans === '') return false;
  if (q.type === 'multiple_choice') return ans === q.correctAnswerIndex;
  if (q.type === 'true_false') {
    if (!Array.isArray(ans)) return false;
    return (q as import('../../types').TrueFalseQuestion).statements?.every((s, i) => ans[i] === s.isTrue) ?? false;
  }
  if (q.type === 'short_answer') {
    return String(ans).trim().toLowerCase() === String((q as import('../../types').ShortAnswerQuestion).correctAnswer).trim().toLowerCase();
  }
  return false;
}

export default function QuizPlayModal({ exam, onClose }: QuizPlayModalProps) {
  const questions = exam.questions ?? [];
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({});
  const [showResult, setShowResult] = useState(false);

  const current = questions[index];
  const totalCorrect = questions.filter((q, i) => isCorrect(q, answers[i])).length;

  const handleAnswer = (val: any) => {
    setAnswers(prev => ({ ...prev, [index]: val }));
  };

  const handleTrueFalse = (stmtIdx: number, val: boolean) => {
    const q = questions[index];
    const stmts = q.type === 'true_false' ? (q as import('../../types').TrueFalseQuestion).statements : [];
    const prev: boolean[] = answers[index] ?? stmts?.map(() => false) ?? [];
    const next = [...prev];
    next[stmtIdx] = val;
    setAnswers(a => ({ ...a, [index]: next }));
  };

  const handleSubmitQ = () => {
    setSubmitted(prev => ({ ...prev, [index]: true }));
  };

  const handleNext = () => {
    if (index < questions.length - 1) setIndex(i => i + 1);
    else setShowResult(true);
  };

  const handleReset = () => {
    setIndex(0);
    setAnswers({});
    setSubmitted({});
    setShowResult(false);
  };

  const typeLabel: Record<string, string> = {
    multiple_choice: 'Trắc nghiệm',
    true_false: 'Đúng / Sai',
    short_answer: 'Trả lời ngắn',
  };

  if (!current && !showResult) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center z-[90] p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b border-slate-50 sticky top-0 bg-white z-10 rounded-t-[2.5rem]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center">
              <Gamepad2 size={20} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg">CHƠI QUIZ</h3>
              <p className="text-xs text-slate-400 font-medium">{exam.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
            <X size={18} />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {showResult ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-6"
            >
              <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center">
                <Trophy size={40} />
              </div>
              <div>
                <div className="text-4xl font-black text-slate-900 mb-1">{totalCorrect}/{questions.length}</div>
                <div className="text-slate-500 font-medium">Câu trả lời đúng</div>
              </div>
              <div className="w-full max-w-xs bg-slate-50 rounded-2xl p-4 text-left space-y-2">
                {[
                  { label: 'Đúng', count: totalCorrect, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: 'Sai', count: questions.length - totalCorrect, color: 'text-rose-600', bg: 'bg-rose-50' },
                ].map(r => (
                  <div key={r.label} className={cn('flex justify-between items-center px-4 py-2 rounded-xl', r.bg)}>
                    <span className={cn('font-bold text-sm', r.color)}>{r.label}</span>
                    <span className={cn('font-black text-lg', r.color)}>{r.count}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={handleReset} className="flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-2xl font-bold hover:bg-violet-700 transition-all">
                  <RotateCcw size={16} /> Chơi lại
                </button>
                <button onClick={onClose} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">
                  Đóng
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="flex-1 p-8 space-y-5"
            >
              {/* Progress */}
              <div>
                <div className="flex justify-between text-xs text-slate-400 font-bold mb-1.5">
                  <span>Câu {index + 1} / {questions.length}</span>
                  <span className="text-violet-500">{typeLabel[current.type]}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-violet-500 rounded-full transition-all duration-500"
                    style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
                </div>
              </div>

              {/* Question */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="font-bold text-slate-800 text-base leading-relaxed">{current.text}</p>
                {current.imageUrl && (
                  <img src={current.imageUrl} alt="" className="mt-3 max-h-36 rounded-xl object-contain" />
                )}
              </div>

              {/* Answer area */}
              <div className="space-y-3">
                {current.type === 'multiple_choice' && current.options?.map((opt, i) => {
                  const isSelected = answers[index] === i;
                  const isDone = submitted[index];
                  const correct = current.correctAnswerIndex;
                  const isRight = i === correct;
                  return (
                    <button
                      key={i}
                      disabled={isDone}
                      onClick={() => handleAnswer(i)}
                      className={cn(
                        'w-full text-left px-5 py-3 rounded-2xl border-2 font-semibold text-sm transition-all',
                        !isDone && isSelected ? 'border-violet-400 bg-violet-50 text-violet-800' :
                        !isDone ? 'border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50' :
                        isRight ? 'border-emerald-400 bg-emerald-50 text-emerald-800' :
                        isSelected ? 'border-rose-300 bg-rose-50 text-rose-700' :
                        'border-slate-100 bg-white text-slate-400'
                      )}
                    >
                      <span className="font-black mr-2">{String.fromCharCode(65 + i)}.</span>{opt}
                      {isDone && isRight && <CheckCircle2 size={16} className="inline ml-2 text-emerald-500" />}
                      {isDone && isSelected && !isRight && <XCircle size={16} className="inline ml-2 text-rose-500" />}
                    </button>
                  );
                })}

                {current.type === 'true_false' && current.statements?.map((s, i) => {
                  const ans: boolean[] = answers[index] ?? [];
                  const isDone = submitted[index];
                  const chosen = ans[i];
                  return (
                    <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-sm font-semibold text-slate-700 mb-2">{i + 1}. {s.text}</p>
                      <div className="flex gap-2">
                        {[true, false].map(v => (
                          <button
                            key={String(v)}
                            disabled={isDone}
                            onClick={() => handleTrueFalse(i, v)}
                            className={cn(
                              'flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-all',
                              !isDone && chosen === v ? (v ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-rose-400 bg-rose-50 text-rose-700') :
                              !isDone ? 'border-slate-200 bg-white text-slate-500 hover:border-slate-300' :
                              v === s.isTrue ? 'border-emerald-400 bg-emerald-50 text-emerald-700' :
                              chosen === v ? 'border-rose-300 bg-rose-50 text-rose-700' :
                              'border-slate-100 bg-white text-slate-400'
                            )}
                          >
                            {v ? 'Đúng' : 'Sai'}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {current.type === 'short_answer' && (
                  <input
                    type="text"
                    value={answers[index] ?? ''}
                    onChange={e => handleAnswer(e.target.value)}
                    disabled={submitted[index]}
                    placeholder="Nhập đáp án..."
                    className={cn(
                      'w-full px-5 py-3 border-2 rounded-2xl outline-none font-semibold text-sm transition-all',
                      submitted[index]
                        ? isCorrect(current, answers[index])
                          ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                          : 'border-rose-300 bg-rose-50 text-rose-700'
                        : 'border-slate-200 focus:border-violet-400'
                    )}
                  />
                )}

                {submitted[index] && (
                  <div className={cn(
                    'p-4 rounded-2xl text-sm font-bold flex items-center gap-2',
                    isCorrect(current, answers[index]) ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  )}>
                    {isCorrect(current, answers[index])
                      ? <><CheckCircle2 size={18} /> Chính xác!</>
                      : <><XCircle size={18} /> Chưa đúng. Đáp án: <span className="font-black">{String(current.type === 'multiple_choice' ? `${['A','B','C','D'][current.correctAnswerIndex]}. ${current.options?.[current.correctAnswerIndex]}` : current.type === 'short_answer' ? current.correctAnswer : (current.statements?.map((s,i)=>`${i+1}.${s.isTrue?'Đúng':'Sai'}`).join(' ')))}</span></>
                    }
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex gap-3 pt-2">
                {!submitted[index] ? (
                  <button
                    onClick={handleSubmitQ}
                    disabled={answers[index] === undefined || answers[index] === ''}
                    className="flex-1 py-3 bg-violet-600 text-white rounded-2xl font-bold hover:bg-violet-700 transition-all disabled:opacity-40"
                  >
                    Kiểm tra
                  </button>
                ) : (
                  <button onClick={handleNext} className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-900 transition-all">
                    {index < questions.length - 1 ? <><ChevronRight size={18} /> Câu tiếp theo</> : <><Trophy size={18} /> Xem kết quả</>}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
