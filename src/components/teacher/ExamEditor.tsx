import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Save, Image, Table2, ChevronDown, ChevronUp, RefreshCw,
  CheckCircle2, Trash2, Plus, Camera, Link2, PencilLine, Eye
} from 'lucide-react';
import { Exam, Question } from '../../types';
import { cn } from '../../utils/cn';

// ─── Inline markdown table preview ───────────────────────────────────────────
function TablePreview({ markdown }: { markdown: string }) {
  const lines = markdown.split(/\r?\n/).filter(l => l.trim().startsWith('|'));
  const rows = lines.filter(l => l.replace(/[|\s\-:]/g, '').length > 0);
  if (rows.length === 0) return <p className="text-slate-400 text-xs italic">Chưa có dữ liệu bảng</p>;
  return (
    <div className="overflow-x-auto rounded-xl border border-indigo-200">
      <table className="text-xs text-slate-700 w-full border-collapse">
        <tbody>
          {rows.map((row, ri) => {
            const cells = row.split('|').filter((_, i, a) => i > 0 && i < a.length - 1);
            return (
              <tr key={ri} className={ri === 0 ? 'bg-indigo-600 text-white font-bold' : ri % 2 === 0 ? 'bg-white' : 'bg-indigo-50/40'}>
                {cells.map((cell, ci) => ri === 0
                  ? <th key={ci} className="px-3 py-2 border border-indigo-500 text-center whitespace-nowrap">{cell.trim()}</th>
                  : <td key={ci} className={cn("px-3 py-1.5 border border-indigo-100 whitespace-nowrap", ci === 0 ? "font-medium" : "text-center")}>{cell.trim()}</td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Single question editor ────────────────────────────────────────────────────
function QuestionEditor({
  question, index, onChange
}: {
  question: Question;
  index: number;
  onChange: (updated: Question) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [previewTable, setPreviewTable] = useState(false);
  const [imgMode, setImgMode] = useState<'url' | 'upload'>('url');

  const handleImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => onChange({ ...question, imageUrl: e.target?.result as string });
    reader.readAsDataURL(file);
  };

  const SECTION_LABEL: Record<string, string> = {
    multiple_choice: 'PHẦN I • TRẮC NGHIỆM',
    true_false: 'PHẦN II • ĐÚNG/SAI',
    short_answer: 'PHẦN III • TRẢ LỜI NGẮN',
  };

  const sectionColor: Record<string, string> = {
    multiple_choice: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    true_false: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    short_answer: 'bg-amber-50 text-amber-700 border-amber-100',
  };

  return (
    <div className={cn(
      "rounded-2xl border overflow-hidden transition-all",
      expanded ? "border-indigo-200 shadow-md" : "border-slate-100"
    )}>
      {/* Header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors text-left"
      >
        <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs shrink-0">
          {index + 1}
        </span>
        <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border shrink-0", sectionColor[question.type])}>
          {SECTION_LABEL[question.type]}
        </span>
        <p className="flex-1 text-sm font-medium text-slate-700 truncate">{question.text}</p>
        <div className="flex items-center gap-2 shrink-0">
          {question.imageUrl && <Camera size={14} className="text-emerald-500" />}
          {question.context && <Table2 size={14} className="text-blue-500" />}
          {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-100"
          >
            <div className="p-5 space-y-5 bg-slate-50/30">

              {/* ── Image section ── */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Image size={14} className="text-slate-500" />
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Hình ảnh biểu đồ / bản đồ</p>
                  <div className="flex gap-1 ml-auto">
                    <button onClick={() => setImgMode('url')} className={cn("px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors", imgMode === 'url' ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-500 border-slate-200")}>
                      <Link2 size={10} className="inline mr-1" />URL
                    </button>
                    <button onClick={() => setImgMode('upload')} className={cn("px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors", imgMode === 'upload' ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-500 border-slate-200")}>
                      <Camera size={10} className="inline mr-1" />Tải lên
                    </button>
                  </div>
                </div>

                {question.imageUrl && (
                  <div className="relative group">
                    <img src={question.imageUrl} alt="Question" className="max-h-48 rounded-xl border border-slate-200 object-contain bg-white w-full" />
                    <button
                      onClick={() => onChange({ ...question, imageUrl: undefined })}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-black opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}

                {imgMode === 'url' ? (
                  <input
                    type="url"
                    value={question.imageUrl && !question.imageUrl.startsWith('data:') ? question.imageUrl : ''}
                    onChange={e => onChange({ ...question, imageUrl: e.target.value || undefined })}
                    placeholder="https://... (URL ảnh biểu đồ, bản đồ)"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 outline-none bg-white"
                  />
                ) : (
                  <label className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors">
                    <Camera size={16} className="text-slate-400" />
                    <span className="text-sm text-slate-500 font-medium">Nhấn để chọn ảnh từ máy tính</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => { if (e.target.files?.[0]) handleImageFile(e.target.files[0]); e.target.value = ''; }}
                    />
                  </label>
                )}
              </div>

              {/* ── Context / Table section ── */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Table2 size={14} className="text-blue-500" />
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Bảng số liệu (Markdown)</p>
                  <button
                    onClick={() => setPreviewTable(v => !v)}
                    className={cn("ml-auto flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors", previewTable ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-500 border-slate-200")}
                  >
                    <Eye size={10} />{previewTable ? 'Ẩn xem trước' : 'Xem trước'}
                  </button>
                </div>

                {/* Quick table template buttons */}
                <div className="flex gap-2 flex-wrap">
                  {[
                    {
                      label: '📊 Mẫu 2 năm', value:
                        '**TIÊU ĐỀ BẢNG SỐ LIỆU**\n| Tiêu chí | Năm A | Năm B |\n|---|---|---|\n| Chỉ số 1 | 100 | 120 |\n| Chỉ số 2 | 200 | 250 |'
                    },
                    {
                      label: '📈 Mẫu 3 năm', value:
                        '**TIÊU ĐỀ BẢNG SỐ LIỆU**\n| Tiêu chí | Năm A | Năm B | Năm C |\n|---|---|---|---|\n| Chỉ số 1 | 100 | 120 | 145 |\n| Chỉ số 2 | 200 | 250 | 310 |'
                    },
                    {
                      label: '🌏 Mẫu ASEAN', value:
                        '**GDP CÁC NƯỚC ĐÔNG NAM Á (tỷ USD)**\n| Quốc gia | 2015 | 2020 | 2024 |\n|---|---|---|---|\n| Việt Nam | 193 | 271 | 430 |\n| Thái Lan | 401 | 500 | 574 |\n| In-đô-nê-xi-a | 861 | 1058 | 1371 |'
                    },
                  ].map(tpl => (
                    <button
                      key={tpl.label}
                      onClick={() => onChange({ ...question, context: tpl.value })}
                      className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg text-[10px] font-bold hover:bg-slate-50 hover:border-indigo-300 transition-colors whitespace-nowrap"
                    >
                      {tpl.label}
                    </button>
                  ))}
                  {question.context && (
                    <button
                      onClick={() => onChange({ ...question, context: undefined })}
                      className="px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-[10px] font-bold hover:bg-rose-100 transition-colors"
                    >
                      <Trash2 size={10} className="inline mr-1" />Xóa bảng
                    </button>
                  )}
                </div>

                <textarea
                  value={question.context || ''}
                  onChange={e => onChange({ ...question, context: e.target.value || undefined })}
                  placeholder={'Nhập bảng Markdown:\n**TIÊU ĐỀ BẢNG**\n| Cột 1 | Cột 2 | Cột 3 |\n|---|---|---|\n| Dữ liệu | Dữ liệu | Dữ liệu |'}
                  rows={6}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none bg-white font-mono resize-y"
                  spellCheck={false}
                />

                {previewTable && question.context && (
                  <div className="mt-2">
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">📊 Xem trước bảng</p>
                    <TablePreview markdown={question.context} />
                  </div>
                )}
              </div>

              {/* ── For true_false: show BieuDo note ── */}
              {question.type === 'true_false' && !question.context && !question.imageUrl && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-amber-700 text-xs font-bold">
                    💡 <strong>Câu Đúng/Sai về biểu đồ:</strong> Thêm bảng số liệu ở trên để học sinh có dữ liệu trả lời. Dùng nút mẫu cho nhanh!
                  </p>
                </div>
              )}

              {/* ── For short_answer: show table note ── */}
              {question.type === 'short_answer' && !question.context && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-blue-700 text-xs font-bold">
                    💡 <strong>Câu Trả lời ngắn cần bảng:</strong> Thêm bảng số liệu để học sinh có đủ dữ liệu tính toán!
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main ExamEditor ───────────────────────────────────────────────────────────
interface ExamEditorProps {
  exam: Exam;
  onSave: (updated: Exam) => void;
  onClose: () => void;
}

export default function ExamEditor({ exam, onSave, onClose }: ExamEditorProps) {
  const [questions, setQuestions] = useState<Question[]>(exam.questions || []);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleQuestionChange = useCallback((idx: number, updated: Question) => {
    setQuestions(prev => prev.map((q, i) => i === idx ? updated : q));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const updatedExam: Exam = { ...exam, questions, type: questions.length > 0 ? 'ai' as const : exam.type };
    onSave(updatedExam);
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const trueFalseQs = questions.filter(q => q.type === 'true_false');
  const shortAnswerQs = questions.filter(q => q.type === 'short_answer');
  const mcQs = questions.filter(q => q.type === 'multiple_choice');
  const needsAttention = questions.filter(q =>
    (q.type === 'true_false' || q.type === 'short_answer') && !q.context && !q.imageUrl
  );

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[90] p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-gradient-to-r from-indigo-50 to-white">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
            <PencilLine size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-black text-slate-900 text-xl truncate">SỬA ĐỀ THI</h2>
            <p className="text-sm text-slate-500 truncate">{exam.title}</p>
          </div>

          {/* Stats */}
          <div className="hidden md:flex gap-3">
            <div className="text-center px-3 py-1.5 bg-white rounded-xl border border-slate-100 shadow-sm">
              <div className="text-[9px] font-black text-indigo-400 uppercase">TN</div>
              <div className="font-black text-indigo-600">{mcQs.length}</div>
            </div>
            <div className="text-center px-3 py-1.5 bg-white rounded-xl border border-slate-100 shadow-sm">
              <div className="text-[9px] font-black text-emerald-400 uppercase">Đ/S</div>
              <div className="font-black text-emerald-600">{trueFalseQs.length}</div>
            </div>
            <div className="text-center px-3 py-1.5 bg-white rounded-xl border border-slate-100 shadow-sm">
              <div className="text-[9px] font-black text-amber-400 uppercase">TLN</div>
              <div className="font-black text-amber-600">{shortAnswerQs.length}</div>
            </div>
            {needsAttention.length > 0 && (
              <div className="text-center px-3 py-1.5 bg-rose-50 rounded-xl border border-rose-200 shadow-sm">
                <div className="text-[9px] font-black text-rose-400 uppercase">Cần bổ sung</div>
                <div className="font-black text-rose-600">{needsAttention.length}</div>
              </div>
            )}
          </div>

          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-rose-50 hover:border-rose-200 transition-colors shrink-0">
            <X size={16} className="text-slate-400" />
          </button>
        </div>

        {/* Alert for questions needing attention */}
        {needsAttention.length > 0 && (
          <div className="mx-6 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
            <span className="text-amber-600 text-lg shrink-0">⚠️</span>
            <div>
              <p className="text-amber-800 text-sm font-bold">
                {needsAttention.length} câu Đúng/Sai hoặc Trả lời ngắn chưa có bảng số liệu / hình ảnh
              </p>
              <p className="text-amber-600 text-xs mt-0.5">
                Click vào từng câu để mở rộng và thêm bảng Markdown hoặc hình ảnh biểu đồ.
              </p>
            </div>
          </div>
        )}

        {/* Question list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Table2 size={48} className="text-slate-200 mb-4" />
              <p className="text-slate-400 font-bold">Đề thi chưa có câu hỏi được trích xuất</p>
              <p className="text-slate-300 text-sm mt-1">Dùng tính năng "Trích xuất AI" để tạo câu hỏi từ nội dung đề thi</p>
            </div>
          ) : (
            questions.map((q, idx) => (
              <QuestionEditor
                key={q.id || idx}
                question={q}
                index={idx}
                onChange={(updated) => handleQuestionChange(idx, updated)}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <p className="text-xs text-slate-400 font-medium">
            {questions.length} câu hỏi • Click vào từng câu để thêm ảnh và bảng số liệu
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-200 text-slate-500 rounded-xl font-bold hover:bg-slate-100 transition-colors text-sm"
            >
              Đóng
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg",
                saved
                  ? "bg-emerald-600 text-white shadow-emerald-200"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 disabled:opacity-50"
              )}
            >
              {saving ? <RefreshCw size={16} className="animate-spin" /> :
                saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
              {saving ? 'Đang lưu...' : saved ? 'Đã lưu!' : 'Lưu thay đổi'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
