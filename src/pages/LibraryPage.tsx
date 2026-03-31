import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Library, PlayCircle, Gamepad2, FileText, ExternalLink, Search,
  BookOpen, ChevronRight, Plus, Trash2, Upload, X, Loader2,
  Video, File, FileType, Download, Link2, CheckCircle2
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useAuth } from '../contexts/AuthContext';
import { libraryService, LibraryVideo, LibraryFile } from '../services/libraryService';

// ── Helpers ───────────────────────────────────────────────────────────────────
function fileIcon(type: string) {
  if (type === 'pdf') return '📄';
  if (type === 'word') return '📝';
  if (type === 'ppt') return '📊';
  return '📁';
}
function fileColor(type: string) {
  if (type === 'pdf') return 'rose';
  if (type === 'word') return 'sky';
  if (type === 'ppt') return 'amber';
  return 'slate';
}
function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type Tab = 'video' | 'file' | 'game';

const GAMES = [
  { id: 'g0', title: '🔔 Rung Chuông Vàng Địa Lí', desc: 'Trò chơi Rung Chuông Vàng chủ đề Địa lí — dành cho cả lớp, màn hình lớn.', url: 'https://rungchuongvangcothaibbd-p9xo.vercel.app/', tags: ['Rung Chuông', 'Cả lớp'], isNew: true },
  { id: 'g1', title: 'Kahoot — Ôn tập Địa lí', desc: 'Trò chơi trắc nghiệm tương tác theo nhóm.', url: 'https://kahoot.com/schools-u/', tags: ['Nhóm', 'Online'] },
  { id: 'g2', title: 'Quizizz — Địa lí 12', desc: 'Câu hỏi Địa lí lớp 12 dạng game, bảng xếp hạng.', url: 'https://quizizz.com/topic/geography', tags: ['Game', 'Online'] },
  { id: 'g3', title: 'Padlet — Bản đồ tư duy', desc: 'Tạo bản đồ tư duy và sơ đồ kiến thức trực tuyến.', url: 'https://padlet.com', tags: ['Tư duy'] },
  { id: 'g4', title: 'Wordwall — Ôn từ vựng Địa lí', desc: 'Trò chơi ôn tập thuật ngữ và khái niệm Địa lí.', url: 'https://wordwall.net/vi/community/dia-li', tags: ['Từ vựng'] },
];

// ── Teacher: Add Video Modal ──────────────────────────────────────────────────
function AddVideoModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [desc, setDesc] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !url.trim()) return;
    setSaving(true);
    try {
      await libraryService.addVideo(title.trim(), url.trim(), desc.trim(), tags.trim());
      setDone(true);
      setTimeout(onClose, 900);
    } catch (e: any) {
      console.error('Save error:', e);
      alert('Lưu thất bại! (Lỗi: ' + (e.message || 'Chưa xác định') + ')');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-rose-500 to-orange-500 p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center"><Link2 size={18} /></div>
              <p className="font-black text-lg">Thêm video bài giảng</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30"><X size={16} /></button>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Tiêu đề *</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Vd: Bài giảng Dân số Việt Nam"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100" />
          </div>
          <div>
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Link video (YouTube, Drive...) *</label>
            <input value={url} onChange={e => setUrl(e.target.value)}
              placeholder="https://youtube.com/..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100" />
          </div>
          <div>
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Mô tả</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2}
              placeholder="Nội dung video..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 resize-none" />
          </div>
          <div>
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Tags (ngăn cách bởi dấu phẩy)</label>
            <input value={tags} onChange={e => setTags(e.target.value)}
              placeholder="Lớp 12, Dân cư, Tính toán"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100" />
          </div>
          <button onClick={handleSave} disabled={!title.trim() || !url.trim() || saving}
            className={cn('w-full py-3 rounded-2xl font-black text-white transition-all text-sm flex items-center justify-center gap-2',
              done ? 'bg-emerald-500' : 'bg-rose-500 hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed')}>
            {done ? <><CheckCircle2 size={16} /> Đã lưu!</> : saving ? <><Loader2 size={16} className="animate-spin" /> Đang lưu...</> : <><Plus size={16} /> Thêm video</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Teacher: Upload File Modal ────────────────────────────────────────────────
function UploadFileModal({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (f && !title) setTitle(f.name.replace(/\.[^.]+$/, ''));
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      await libraryService.uploadFile(file, title || file.name, setProgress);
      setDone(true);
      setTimeout(onClose, 1000);
    } catch (e: any) {
      console.error('Upload error:', e);
      alert('Tải lên thất bại! (Lỗi: ' + (e.message || 'Chưa xác định') + ')');
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center"><Upload size={18} /></div>
              <p className="font-black text-lg">Tải lên bài giảng</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30"><X size={16} /></button>
          </div>
          <p className="text-indigo-200 text-xs mt-1">Hỗ trợ: PDF, Word (.doc/.docx), PowerPoint (.ppt/.pptx)</p>
        </div>
        <div className="p-5 space-y-4">
          <input ref={fileRef} type="file" className="hidden"
            accept=".pdf,.doc,.docx,.ppt,.pptx" onChange={handleFile} />
          <button onClick={() => fileRef.current?.click()}
            className={cn('w-full border-2 border-dashed rounded-2xl py-8 text-center transition-all',
              file ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50')}>
            {file ? (
              <div>
                <p className="text-2xl mb-1">{fileIcon(file.name.split('.').pop()?.toLowerCase() || '')}</p>
                <p className="font-bold text-slate-800 text-sm">{file.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{formatSize(file.size)}</p>
              </div>
            ) : (
              <div>
                <Upload size={28} className="mx-auto mb-2 text-slate-300" />
                <p className="font-bold text-slate-500 text-sm">Chọn file để tải lên</p>
                <p className="text-xs text-slate-400">PDF, Word, PowerPoint</p>
              </div>
            )}
          </button>

          {file && (
            <div>
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Tiêu đề hiển thị</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
            </div>
          )}

          {uploading && !done && (
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                <span>Đang tải lên...</span><span>{progress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-2 bg-indigo-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          <button onClick={handleUpload} disabled={!file || uploading}
            className={cn('w-full py-3 rounded-2xl font-black text-white transition-all text-sm flex items-center justify-center gap-2',
              done ? 'bg-emerald-500' : 'bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed')}>
            {done ? <><CheckCircle2 size={16} /> Tải lên thành công!</> : uploading ? <><Loader2 size={16} className="animate-spin" /> Đang tải... {progress}%</> : <><Upload size={16} /> Tải lên</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LibraryPage() {
  const { isTeacherMode } = useAuth();
  const [tab, setTab] = useState<Tab>('video');
  const [search, setSearch] = useState('');
  const [videos, setVideos] = useState<LibraryVideo[]>([]);
  const [files, setFiles] = useState<LibraryFile[]>([]);
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [showUploadFile, setShowUploadFile] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const u1 = libraryService.subscribeToVideos(setVideos);
    const u2 = libraryService.subscribeToFiles(setFiles);
    return () => { u1(); u2(); };
  }, []);

  const filtered = (tab === 'video' ? videos : tab === 'file' ? files : GAMES).filter((i: any) => {
    const q = search.toLowerCase();
    return (i.title || '').toLowerCase().includes(q) || (i.desc || i.description || '').toLowerCase().includes(q) || (i.tags || '').toLowerCase().includes(q);
  });

  const handleDeleteVideo = async (id: string) => {
    if (!window.confirm('Xóa video này?')) return;
    setDeleting(id);
    try {
      await libraryService.deleteVideo(id);
    } catch (e: any) {
      console.error('Delete error:', e);
      alert('Xóa thất bại! (Lỗi: ' + (e.message || 'Chưa xác định') + ')');
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteFile = async (item: LibraryFile) => {
    if (!window.confirm('Xóa file này?')) return;
    setDeleting(item.id);
    try {
      await libraryService.deleteFile(item);
    } catch (e: any) {
      console.error('Delete error:', e);
      alert('Xóa thất bại! (Lỗi: ' + (e.message || 'Chưa xác định') + ')');
    } finally {
      setDeleting(null);
    }
  };

  const TAB_BTN = [
    { id: 'video' as Tab, label: 'Video bài giảng', icon: Video, cls: 'bg-rose-500 text-white shadow-rose-200', inactive: 'text-rose-500 border-rose-200' },
    { id: 'file' as Tab, label: 'Tài liệu', icon: FileText, cls: 'bg-indigo-500 text-white shadow-indigo-200', inactive: 'text-indigo-500 border-indigo-200' },
    { id: 'game' as Tab, label: 'Trò chơi', icon: Gamepad2, cls: 'bg-violet-500 text-white shadow-violet-200', inactive: 'text-violet-500 border-violet-200' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="pb-24 space-y-5">
      {/* Modals */}
      {showAddVideo && <AddVideoModal onClose={() => setShowAddVideo(false)} />}
      {showUploadFile && <UploadFileModal onClose={() => setShowUploadFile(false)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <Library size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Thư Viện</h1>
            <p className="text-xs text-slate-400 font-medium">Video · Tài liệu · Trò chơi</p>
          </div>
        </div>
        {/* Teacher buttons */}
        {isTeacherMode && (
          <div className="flex gap-2">
            <button onClick={() => setShowAddVideo(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-black border border-rose-200 hover:bg-rose-100 transition-all">
              <Plus size={13} /> Video
            </button>
            <button onClick={() => setShowUploadFile(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black border border-indigo-200 hover:bg-indigo-100 transition-all">
              <Upload size={13} /> File
            </button>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
        <input type="text" placeholder="Tìm tài liệu..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:border-indigo-400 transition-all" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TAB_BTN.map(({ id, label, icon: Icon, cls, inactive }) => (
          <button key={id} onClick={() => { setTab(id); setSearch(''); }}
            className={cn('flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs whitespace-nowrap transition-all border shadow-md',
              tab === id ? cls : `bg-white ${inactive} shadow-none`)}>
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BookOpen size={40} className="text-slate-200 mb-3" />
              <p className="text-slate-400 font-bold text-sm">
                {tab === 'video' && !isTeacherMode ? 'Giáo viên chưa thêm video.' : 'Không có tài liệu.'}
              </p>
              {tab === 'video' && isTeacherMode && (
                <button onClick={() => setShowAddVideo(true)}
                  className="mt-4 px-5 py-2.5 bg-rose-500 text-white rounded-2xl text-sm font-black hover:bg-rose-600 transition-colors flex items-center gap-2">
                  <Plus size={14} /> Thêm video đầu tiên
                </button>
              )}
              {tab === 'file' && isTeacherMode && (
                <button onClick={() => setShowUploadFile(true)}
                  className="mt-4 px-5 py-2.5 bg-indigo-500 text-white rounded-2xl text-sm font-black hover:bg-indigo-600 transition-colors flex items-center gap-2">
                  <Upload size={14} /> Tải lên tài liệu đầu tiên
                </button>
              )}
            </div>
          ) : tab === 'video' ? (
            (filtered as LibraryVideo[]).map(item => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-4 p-4 bg-white border-2 border-rose-100 rounded-2xl hover:border-rose-300 hover:shadow-md transition-all group">
                <div className="w-11 h-11 bg-rose-500 rounded-xl flex items-center justify-center shrink-0 shadow-sm shadow-rose-200">
                  <PlayCircle size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-800 text-sm leading-snug">{item.title}</p>
                  {item.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{item.description}</p>}
                  {item.tags && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.tags.split(',').map(t => t.trim()).filter(Boolean).map(t => (
                        <span key={t} className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {isTeacherMode && (
                    <button onClick={() => handleDeleteVideo(item.id)} disabled={deleting === item.id}
                      className="w-7 h-7 bg-red-50 text-red-400 rounded-xl flex items-center justify-center hover:bg-red-100 transition-colors">
                      {deleting === item.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                    </button>
                  )}
                  <a href={item.url} target="_blank" rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-rose-500 text-white text-xs font-black rounded-xl hover:bg-rose-600 transition-colors flex items-center gap-1">
                    <ExternalLink size={11} /> Xem
                  </a>
                </div>
              </motion.div>
            ))
          ) : tab === 'file' ? (
            (filtered as LibraryFile[]).map(item => {
              const col = fileColor(item.fileType);
              const borderMap: Record<string, string> = { rose: 'border-rose-100 hover:border-rose-300', sky: 'border-sky-100 hover:border-sky-300', amber: 'border-amber-100 hover:border-amber-300', slate: 'border-slate-100' };
              const bgMap: Record<string, string> = { rose: 'bg-rose-500', sky: 'bg-sky-500', amber: 'bg-amber-500', slate: 'bg-slate-400' };
              return (
                <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={cn('flex items-start gap-4 p-4 bg-white border-2 rounded-2xl hover:shadow-md transition-all', borderMap[col])}>
                  <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-xl shadow-sm', bgMap[col])}>
                    <span>{fileIcon(item.fileType)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-800 text-sm leading-snug">{item.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.fileName} · {formatSize(item.fileSize)}</p>
                    <p className="text-[10px] text-slate-300 mt-0.5">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isTeacherMode && (
                      <button onClick={() => handleDeleteFile(item)} disabled={deleting === item.id}
                        className="w-7 h-7 bg-red-50 text-red-400 rounded-xl flex items-center justify-center hover:bg-red-100 transition-colors">
                        {deleting === item.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                      </button>
                    )}
                    <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" download
                      className="px-3 py-1.5 bg-indigo-500 text-white text-xs font-black rounded-xl hover:bg-indigo-600 transition-colors flex items-center gap-1">
                      <Download size={11} /> Tải về
                    </a>
                  </div>
                </motion.div>
              );
            })
          ) : (
            GAMES.filter(g => {
              const q = search.toLowerCase();
              return g.title.toLowerCase().includes(q) || g.desc.toLowerCase().includes(q);
            }).map(item => (
              <motion.a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-4 p-4 bg-white border-2 border-violet-100 rounded-2xl hover:border-violet-300 hover:shadow-md transition-all group">
                <div className="w-11 h-11 bg-violet-500 rounded-xl flex items-center justify-center shrink-0 shadow-sm shadow-violet-200">
                  <Gamepad2 size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-800 text-sm">{item.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  <div className="flex gap-1 mt-2">
                    {item.tags.map(t => <span key={t} className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{t}</span>)}
                  </div>
                </div>
                <ExternalLink size={14} className="text-slate-300 group-hover:text-slate-500 shrink-0 mt-1 transition-colors" />
              </motion.a>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
