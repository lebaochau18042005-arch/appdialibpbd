import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, RotateCcw, Layers } from 'lucide-react';
import { Exam, Question } from '../../types';
import { cn } from '../../utils/cn';

interface FlashcardModalProps {
  exam: Exam;
  onClose: () => void;
}

function getAnswer(q: Question): string {
  if (q.type === 'multiple_choice') {
    const label = ['A', 'B', 'C', 'D'][q.correctAnswerIndex] ?? '';
    return `${label}. ${q.options?.[q.correctAnswerIndex] ?? ''}`;
  }
  if (q.type === 'true_false' && q.statements) {
    return q.statements.map((s, i) => `${['a','b','c','d'][i]}. ${s.text} → ${s.isTrue ? 'Đúng ✓' : 'Sai ✗'}`).join('\n');
  }
  if (q.type === 'short_answer') {
    return `${q.correctAnswer}${q.unit ? ' ' + q.unit : ''}`;
  }
  return '';
}

export default function FlashcardModal({ exam, onClose }: FlashcardModalProps) {
  // Flashcard mode: exclude true_false (4 sub-statements = too verbose for a flip card)
  const allQuestions = exam.questions ?? [];
  const questions = allQuestions.filter(q => q.type !== 'true_false');
  const filteredCount = allQuestions.length - questions.length;

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [direction, setDirection] = useState(0);

  const current = questions[index];


  // Navigate: reset flip state BEFORE changing index so card remounts fresh
  const go = (dir: 1 | -1) => {
    const next = Math.max(0, Math.min(questions.length - 1, index + dir));
    if (next === index) return;
    setFlipped(false);
    setDirection(dir);
    // Delay index change slightly so flip=false renders first, preventing
    // the back-face of the OLD card from bleeding through on the new card
    setTimeout(() => setIndex(next), 50);
  };

  const typeLabel: Record<string, string> = {
    multiple_choice: 'Trắc nghiệm',
    true_false: 'Đúng / Sai',
    short_answer: 'Trả lời ngắn',
  };

  if (!current) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center z-[90] p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
              <Layers size={20} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg">FLASHCARD</h3>
              <p className="text-xs text-slate-400 font-medium">{exam.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Progress */}
        <div className="px-8 mb-4">
          <div className="flex justify-between text-xs text-slate-400 font-bold mb-1">
            <span>Thẻ {index + 1} / {questions.length}</span>
            <span className="text-purple-500">{typeLabel[current.type] ?? ''}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${((index + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Card — key={index} forces remount on navigation, preventing stale flip state */}
        <div className="px-8 pb-2">
          <div
            className="cursor-pointer select-none"
            onClick={() => setFlipped(f => !f)}
            style={{ perspective: 1000 }}
          >
            <motion.div
              key={index}
              initial={{ rotateY: 0 }}
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.45, type: 'spring', stiffness: 220, damping: 28 }}
              style={{ transformStyle: 'preserve-3d', position: 'relative', minHeight: 220 }}
            >
              {/* Front — question */}
              <div
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl border-2 border-purple-100"
              >
                <div className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-4">CÂU HỎI — Nhấn để xem đáp án</div>
                <p className="text-slate-800 font-bold text-lg leading-relaxed text-center">{current.text}</p>
                {current.imageUrl && (
                  <img src={current.imageUrl} alt="" className="mt-4 max-h-28 rounded-xl object-contain" />
                )}
              </div>

              {/* Back — answer */}
              <div
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl border-2 border-emerald-200"
              >
                <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4">ĐÁP ÁN</div>
                <pre className="text-emerald-800 font-bold text-lg leading-relaxed text-center whitespace-pre-wrap font-sans">
                  {getAnswer(current)}
                </pre>
                {current.explanation && (
                  <p className="mt-4 text-slate-500 text-sm italic text-center line-clamp-3">{current.explanation}</p>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between px-8 py-6">
          <button
            onClick={() => go(-1)}
            disabled={index === 0}
            className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all disabled:opacity-30"
          >
            <ChevronLeft size={18} /> Trước
          </button>
          <button
            onClick={() => setFlipped(f => !f)}
            className="flex items-center gap-2 px-5 py-3 bg-purple-100 text-purple-700 rounded-2xl font-bold hover:bg-purple-200 transition-all"
          >
            <RotateCcw size={16} /> Lật thẻ
          </button>
          <button
            onClick={() => go(1)}
            disabled={index === questions.length - 1}
            className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all disabled:opacity-30"
          >
            Tiếp <ChevronRight size={18} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
