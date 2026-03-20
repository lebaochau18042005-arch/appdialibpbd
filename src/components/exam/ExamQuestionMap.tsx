import React from 'react';
import { LayoutGrid, ChevronLeft, Send } from 'lucide-react';
import { Question } from '../../types';
import { cn } from '../../utils/cn';

interface ExamQuestionMapProps {
  examQuestions: Question[];
  currentIndex: number;
  setCurrentIndex: (idx: number) => void;
  isQuestionAnswered: (idx: number) => boolean;
  setShowQuestionMap: (show: boolean) => void;
  setShowSubmitConfirm: (show: boolean) => void;
  showQuestionMap: boolean;
}

export default function ExamQuestionMap({
  examQuestions,
  currentIndex,
  setCurrentIndex,
  isQuestionAnswered,
  setShowQuestionMap,
  setShowSubmitConfirm,
  showQuestionMap
}: ExamQuestionMapProps) {
  return (
    <div className={cn(
      "lg:block",
      showQuestionMap ? "fixed inset-0 z-30 bg-white lg:relative lg:bg-transparent p-6 lg:p-0" : "hidden"
    )}>
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sticky top-28">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-emerald-600" />
            Sơ đồ câu hỏi
          </h3>
          <button 
            onClick={() => setShowQuestionMap(false)}
            className="lg:hidden p-2 text-slate-400"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-5 gap-2 mb-8">
          {examQuestions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx);
                setShowQuestionMap(false);
              }}
              className={cn(
                "aspect-square rounded-lg text-xs font-bold transition-all flex items-center justify-center border-2",
                idx === currentIndex ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-100" :
                isQuestionAnswered(idx) ? "border-emerald-100 bg-emerald-50 text-emerald-600" :
                "border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200"
              )}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span>Đang làm</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
            <div className="w-3 h-3 rounded-full bg-emerald-100 border border-emerald-200"></div>
            <span>Đã trả lời</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
            <div className="w-3 h-3 rounded-full bg-slate-100"></div>
            <span>Chưa làm</span>
          </div>
        </div>

        <button
          onClick={() => setShowSubmitConfirm(true)}
          className="w-full mt-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg flex items-center justify-center gap-2"
        >
          <Send className="w-5 h-5" />
          Nộp bài thi
        </button>
      </div>
    </div>
  );
}
