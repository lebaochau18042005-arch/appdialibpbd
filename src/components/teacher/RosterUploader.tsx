import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload, X, Check, Trash2, Users, FileSpreadsheet,
  FileText, ChevronDown, ChevronUp, Plus, Save, AlertCircle
} from 'lucide-react';
import { rosterService, ClassRoster, StudentEntry } from '../../services/rosterService';
import { cn } from '../../utils/cn';

interface Props {
  onRosterChange?: () => void;
}

const ACCEPTED = '.xlsx,.xls,.csv,.docx,.txt';

function FileIcon({ ext }: { ext: string }) {
  if (['xlsx', 'xls', 'csv'].includes(ext)) return <FileSpreadsheet size={20} className="text-emerald-600" />;
  return <FileText size={20} className="text-indigo-600" />;
}

export default function RosterUploader({ onRosterChange }: Props) {
  const [rosters, setRosters] = useState<ClassRoster[]>(() => rosterService.getRosters());
  const [dragging, setDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<StudentEntry[] | null>(null);
  const [previewFile, setPreviewFile] = useState('');
  const [className, setClassName] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualText, setManualText] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = () => {
    const r = rosterService.getRosters();
    setRosters(r);
    onRosterChange?.();
  };

  const processFile = useCallback(async (file: File) => {
    setError('');
    setParsing(true);
    try {
      const { students, suggestedClass } = await rosterService.parseFile(file);
      if (students.length === 0) throw new Error('Không tìm thấy tên học sinh trong file.');
      setPreview(students);
      setPreviewFile(file.name);
      setClassName(prev => prev || suggestedClass);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPreview(null);
    } finally {
      setParsing(false);
    }
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleSave = () => {
    if (!className.trim()) { setError('Hãy nhập tên lớp!'); return; }
    if (!preview || preview.length === 0) { setError('Chưa có danh sách học sinh.'); return; }
    rosterService.saveRoster(className.trim(), preview);
    setPreview(null);
    setPreviewFile('');
    setClassName('');
    refresh();
  };

  const handleManualSave = () => {
    if (!className.trim()) { setError('Hãy nhập tên lớp!'); return; }
    const students = manualText.split('\n').map(l => l.trim()).filter(l => l.length > 1).map(name => ({ name }));
    if (students.length === 0) { setError('Chưa có tên học sinh nào.'); return; }
    rosterService.saveRoster(className.trim(), students);
    setManualText('');
    setManualMode(false);
    refresh();
  };

  const handleDelete = (id: string) => {
    if (!confirm('Xóa danh sách này?')) return;
    rosterService.deleteRoster(id);
    refresh();
  };

  return (
    <div className="space-y-5">
      {/* Upload Zone */}
      {!manualMode && !preview && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all',
            dragging ? 'border-indigo-400 bg-indigo-50 scale-[1.01]' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
          )}
        >
          <input
            ref={fileRef} type="file" accept={ACCEPTED} className="hidden"
            onChange={e => e.target.files?.[0] && processFile(e.target.files[0])}
          />
          {parsing ? (
            <div className="py-4">
              <div className="w-10 h-10 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-slate-500 text-sm font-medium">Đang đọc file...</p>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Upload size={24} className="text-indigo-500" />
              </div>
              <p className="font-bold text-slate-700 mb-1">Kéo thả hoặc click để tải file danh sách</p>
              <p className="text-xs text-slate-400">Hỗ trợ: <span className="font-bold text-slate-500">.xlsx, .xls, .csv, .docx, .txt</span></p>
            </>
          )}
        </div>
      )}

      {/* Manual input toggle */}
      {!preview && (
        <button
          onClick={() => setManualMode(v => !v)}
          className="flex items-center gap-2 text-sm text-indigo-600 font-bold hover:text-indigo-800 transition-colors"
        >
          <Plus size={14} /> {manualMode ? 'Hủy nhập thủ công' : 'Hoặc nhập thủ công tên học sinh'}
        </button>
      )}

      {/* Manual mode */}
      <AnimatePresence>
        {manualMode && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
            <input
              type="text" value={className} onChange={e => setClassName(e.target.value)}
              placeholder="Tên lớp (VD: 12C1)"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none font-medium text-sm"
            />
            <textarea
              value={manualText} onChange={e => setManualText(e.target.value)}
              placeholder={"Mỗi tên trên một dòng:\nNguyễn Văn A\nTrần Thị B\nLê Văn C"}
              rows={8}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none text-sm font-mono leading-loose resize-none"
            />
            <button
              onClick={handleManualSave}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors"
            >
              <Save size={14} /> Lưu danh sách
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview panel */}
      <AnimatePresence>
        {preview && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 bg-emerald-50 border-b border-emerald-100 flex items-center gap-3">
              <Check size={16} className="text-emerald-600" />
              <div className="flex-1">
                <p className="font-bold text-emerald-800 text-sm">Đọc được {preview.length} học sinh từ "{previewFile}"</p>
              </div>
              <button onClick={() => { setPreview(null); setPreviewFile(''); }} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Tên lớp</label>
                <input
                  type="text" value={className} onChange={e => setClassName(e.target.value)}
                  placeholder="VD: 12C1, 12A2..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none font-medium text-sm"
                />
              </div>
              <div className="max-h-48 overflow-y-auto bg-slate-50 rounded-xl p-3 space-y-1">
                {preview.slice(0, 30).map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="w-5 h-5 bg-slate-200 text-slate-500 rounded-md flex items-center justify-center text-[10px] font-black shrink-0">{i + 1}</span>
                    <span className="font-medium text-slate-700">{s.name}</span>
                  </div>
                ))}
                {preview.length > 30 && <p className="text-xs text-slate-400 text-center">... và {preview.length - 30} học sinh nữa</p>}
              </div>
              <button
                onClick={handleSave}
                disabled={!className.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                <Save size={16} /> Lưu danh sách lớp {className}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          <AlertCircle size={16} />
          <span className="font-medium">{error}</span>
          <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {/* Saved rosters */}
      {rosters.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Danh sách đã lưu ({rosters.length} lớp)</p>
          {rosters.map(roster => (
            <div key={roster.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === roster.id ? null : roster.id)}
                className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                  <Users size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-800">Lớp {roster.className}</p>
                  <p className="text-xs text-slate-400 font-medium">{roster.students.length} học sinh · Cập nhật {new Date(roster.updatedAt).toLocaleDateString('vi-VN')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(roster.id); }}
                    className="p-1.5 hover:bg-red-50 rounded-lg text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                  {expandedId === roster.id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </div>
              </button>
              <AnimatePresence>
                {expandedId === roster.id && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-slate-100">
                    <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto bg-slate-50/50">
                      {roster.students.map((s, i) => (
                        <span key={i} className="text-xs font-medium text-slate-600 px-2 py-1 bg-white rounded-lg border border-slate-100 truncate">
                          {i + 1}. {s.name}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
