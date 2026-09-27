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
      showQuestionMap ? "fixed inset-0 z-[80] bg-slate-900/95 backdrop-blur-md lg:relative lg:bg-transparent p-4 sm:p-6 lg:p-0 overflow-y-auto" : "hidden"
    )}>
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-5 sm:p-6 lg:sticky lg:top-28 max-w-lg mx-auto lg:max-w-none">
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-base">
            <LayoutGrid className="w-5 h-5 text-emerald-600" />
            Sơ đồ câu hỏi
          </h3>
          <button 
            onClick={() => setShowQuestionMap(false)}
            className="lg:hidden p-2 text-slate-500 hover:text-slate-800 bg-slate-100 rounded-xl font-bold text-xs flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Đóng
          </button>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 gap-2 mb-6">
          {examQuestions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx);
                setShowQuestionMap(false);
              }}
              className={cn(
                "aspect-square min-h-[42px] rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center border-2 active:scale-95",
                idx === currentIndex ? "border-emerald-500 bg-emerald-500 text-white shadow-md ring-2 ring-emerald-200" :
                isQuestionAnswered(idx) ? "border-emerald-200 bg-emerald-50 text-emerald-700" :
                "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-300"
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
