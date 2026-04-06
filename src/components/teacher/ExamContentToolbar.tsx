import React from 'react';
import { FileText, FileDown, Presentation, Layers, Gamepad2, BarChart3, FileImage } from 'lucide-react';
import { Exam } from '../../types';
import { exportExamToWord, exportExamToPdf } from '../../utils/exportDocs';
import { generatePptx } from '../../utils/exportPptx';

interface ExamContentToolbarProps {
  exam: Exam;
  onViewContent?: () => void;
  onFlashcard?: () => void;
  onPlayQuiz?: () => void;
  onAnalyze?: () => void;
}

export default function ExamContentToolbar({
  exam,
  onViewContent,
  onFlashcard,
  onPlayQuiz,
  onAnalyze,
}: ExamContentToolbarProps) {
  const hasQuestions = (exam.questions?.length ?? 0) > 0;

  const buttons = [
    {
      label: 'Nội Dung\nĐề Thi',
      icon: <FileText size={18} />,
      onClick: onViewContent,
      className: 'bg-slate-800 hover:bg-slate-900 text-white',
      show: !!onViewContent,
    },
    {
      label: 'Tải\nPDF',
      icon: <FileImage size={18} />,
      onClick: () => exportExamToPdf(exam),
      className: 'bg-red-500 hover:bg-red-600 text-white',
      show: hasQuestions,
    },
    {
      label: 'Tải\nWord',
      icon: <FileDown size={18} />,
      onClick: () => exportExamToWord(exam),
      className: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      show: hasQuestions,
    },
    {
      label: 'Xuất\nPPTX',
      icon: <Presentation size={18} />,
      onClick: () => generatePptx(exam),
      className: 'bg-orange-500 hover:bg-orange-600 text-white',
      show: hasQuestions,
    },
    {
      label: 'Flashcard',
      icon: <Layers size={18} />,
      onClick: onFlashcard,
      className: 'bg-purple-400 hover:bg-purple-500 text-white',
      show: hasQuestions && !!onFlashcard,
    },
    {
      label: 'Chơi\nQuiz',
      icon: <Gamepad2 size={18} />,
      onClick: onPlayQuiz,
      className: 'bg-violet-700 hover:bg-violet-800 text-white',
      show: hasQuestions && !!onPlayQuiz,
    },
    {
      label: 'Phân\nTích',
      icon: <BarChart3 size={18} />,
      onClick: onAnalyze,
      className: 'bg-slate-950 hover:bg-black text-white',
      show: hasQuestions && !!onAnalyze,
    },
  ].filter(b => b.show);

  if (buttons.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {buttons.map((btn, i) => (
        <button
          key={i}
          onClick={btn.onClick}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs leading-tight transition-all shadow-sm hover:shadow-md active:scale-95 ${btn.className}`}
          style={{ whiteSpace: 'pre-line' }}
        >
          {btn.icon}
          <span>{btn.label}</span>
        </button>
      ))}
    </div>
  );
}
