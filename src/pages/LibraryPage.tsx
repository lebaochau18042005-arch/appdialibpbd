import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Library, PlayCircle, Gamepad2, Presentation, ExternalLink, Search, BookOpen, ChevronRight, Star, Video } from 'lucide-react';
import { cn } from '../utils/cn';

// ── Data ─────────────────────────────────────────────────────────────────────
interface LibItem {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  tags?: string[];
  isNew?: boolean;
}

const VIDEOS: LibItem[] = [
  {
    id: 'v1',
    title: 'Địa lí dân cư Việt Nam — Tỉ suất sinh, tử, tăng tự nhiên',
    description: 'Bài giảng chi tiết về dân số, tỉ suất sinh thô, tử thô và cách tính.',
    url: 'https://www.youtube.com/results?search_query=dia+li+dan+cu+viet+nam+THPT',
    tags: ['Dân cư', 'Lớp 12'],
  },
  {
    id: 'v2',
    title: 'Địa lí kinh tế — Cơ cấu kinh tế Việt Nam',
    description: 'Phân tích chuyển dịch cơ cấu GDP theo ngành, thành phần kinh tế.',
    url: 'https://www.youtube.com/results?search_query=co+cau+kinh+te+viet+nam+dia+li+THPT',
    tags: ['Kinh tế', 'Lớp 12'],
  },
  {
    id: 'v3',
    title: 'Các vùng kinh tế - xã hội Việt Nam',
    description: 'Tổng hợp 6 vùng kinh tế - xã hội: đặc điểm, thế mạnh, hạn chế.',
    url: 'https://www.youtube.com/results?search_query=vung+kinh+te+xa+hoi+viet+nam+12',
    tags: ['Vùng KT', 'Lớp 12'],
    isNew: true,
  },
  {
    id: 'v4',
    title: 'Địa lí Đông Nam Á — Đặc điểm tự nhiên và kinh tế',
    description: 'Bài giảng Lớp 11: tự nhiên, dân cư, kinh tế các nước ĐNA.',
    url: 'https://www.youtube.com/results?search_query=dia+li+dong+nam+a+lop+11',
    tags: ['ĐNA', 'Lớp 11'],
  },
  {
    id: 'v5',
    title: 'Nông nghiệp Việt Nam — Hình thức tổ chức lãnh thổ',
    description: 'Trang trại, khu nông nghiệp CNC, vùng chuyên canh — theo TT 17/2025.',
    url: 'https://www.youtube.com/results?search_query=nong+nghiep+viet+nam+hinh+thuc+to+chuc+lanh+tho',
    tags: ['Nông nghiệp', 'Lớp 12'],
    isNew: true,
  },
  {
    id: 'v6',
    title: 'Du lịch Việt Nam — Phân hóa lãnh thổ & Phát triển bền vững',
    description: 'Phân tích sự phân hóa du lịch theo lãnh thổ và du lịch bền vững.',
    url: 'https://www.youtube.com/results?search_query=du+lich+viet+nam+phan+hoa+lanh+tho+ben+vung',
    tags: ['Du lịch', 'Lớp 12'],
  },
];

const GAMES: LibItem[] = [
  {
    id: 'g1',
    title: 'Kahoot — Ôn tập Địa lí',
    description: 'Trò chơi trắc nghiệm tương tác theo nhóm, phù hợp ôn thi cuối kỳ.',
    url: 'https://kahoot.com/schools-u/',
    tags: ['Trắc nghiệm', 'Nhóm'],
    isNew: true,
  },
  {
    id: 'g2',
    title: 'Quizizz — Địa lí 12',
    description: 'Bộ câu hỏi Địa lí lớp 12 dạng game, có bảng xếp hạng.',
    url: 'https://quizizz.com/topic/geography',
    tags: ['Game', 'Online'],
  },
  {
    id: 'g3',
    title: 'Padlet — Bản đồ tư duy Địa lí',
    description: 'Công cụ tạo bản đồ tư duy và sơ đồ kiến thức trực tuyến.',
    url: 'https://padlet.com',
    tags: ['Tư duy', 'Sơ đồ'],
  },
  {
    id: 'g4',
    title: 'Wordwall — Ôn từ vựng Địa lí',
    description: 'Trò chơi ôn tập thuật ngữ Địa lí và các khái niệm quan trọng.',
    url: 'https://wordwall.net/vi/community/dia-li',
    tags: ['Từ vựng', 'Game'],
  },
];

const PPTS: LibItem[] = [
  {
    id: 'p1',
    title: 'Slide — Vùng Trung du và miền núi phía Bắc',
    description: 'Bài trình chiếu tổng hợp: khoáng sản, thủy điện, cây trồng, chăn nuôi.',
    url: 'https://docs.google.com/presentation/create',
    tags: ['Vùng BắcBộ', 'PPT'],
  },
  {
    id: 'p2',
    title: 'Slide — Đồng bằng sông Hồng & Bắc Trung Bộ',
    description: 'Bài trình chiếu: công nghiệp, dịch vụ, kinh tế biển, du lịch.',
    url: 'https://docs.google.com/presentation/create',
    tags: ['Vùng BắcBộ', 'PPT'],
    isNew: true,
  },
  {
    id: 'p3',
    title: 'Slide — Nam Trung Bộ & Đông Nam Bộ',
    description: 'Kinh tế biển, thủy điện, bôxit, cây công nghiệp, lâm nghiệp.',
    url: 'https://docs.google.com/presentation/create',
    tags: ['Vùng NamBộ', 'PPT'],
  },
  {
    id: 'p4',
    title: 'Slide — Đồng Nam Á (Lớp 11)',
    description: 'Tự nhiên, dân cư, GDP, xuất nhập khẩu, bảng số liệu đầy đủ.',
    url: 'https://docs.google.com/presentation/create',
    tags: ['Lớp 11', 'ĐNA', 'PPT'],
    isNew: true,
  },
];

// ── Components ────────────────────────────────────────────────────────────────
type Tab = 'video' | 'game' | 'ppt';

const TAB_CONFIG = [
  { id: 'video' as Tab, label: 'Video bài giảng', icon: Video, color: 'rose' },
  { id: 'game' as Tab, label: 'Trò chơi', icon: Gamepad2, color: 'violet' },
  { id: 'ppt' as Tab, label: 'Bài giảng PPT', icon: Presentation, color: 'amber' },
];

function ItemCard({ item, color }: { item: LibItem; color: string }) {
  const colorMap: Record<string, string> = {
    rose: 'bg-rose-50 text-rose-600 border-rose-100 hover:border-rose-300',
    violet: 'bg-violet-50 text-violet-600 border-violet-100 hover:border-violet-300',
    amber: 'bg-amber-50 text-amber-600 border-amber-100 hover:border-amber-300',
  };
  const iconBg: Record<string, string> = {
    rose: 'bg-rose-500',
    violet: 'bg-violet-500',
    amber: 'bg-amber-500',
  };

  return (
    <motion.a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex items-start gap-4 p-4 bg-white border-2 rounded-2xl transition-all group hover:shadow-md',
        colorMap[color]
      )}
    >
      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm', iconBg[color])}>
        <ExternalLink size={18} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-black text-slate-800 text-sm leading-snug line-clamp-2">{item.title}</p>
          {item.isNew && (
            <span className="shrink-0 text-[9px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">Mới</span>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{item.description}</p>
        {item.tags && (
          <div className="flex flex-wrap gap-1 mt-2">
            {item.tags.map(t => (
              <span key={t} className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{t}</span>
            ))}
          </div>
        )}
      </div>
      <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 shrink-0 mt-1 transition-colors" />
    </motion.a>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LibraryPage() {
  const [tab, setTab] = useState<Tab>('video');
  const [search, setSearch] = useState('');

  const allItems = tab === 'video' ? VIDEOS : tab === 'game' ? GAMES : PPTS;
  const filtered = allItems.filter(i =>
    i.title.toLowerCase().includes(search.toLowerCase()) ||
    i.description.toLowerCase().includes(search.toLowerCase()) ||
    (i.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()))
  );
  const activeTab = TAB_CONFIG.find(t => t.id === tab)!;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="pb-20 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
          <Library size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Thư Viện Tài Liệu</h1>
          <p className="text-sm text-slate-500">Video · Trò chơi · Bài giảng PPT</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type="text"
          placeholder="Tìm tài liệu..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
        />
      </div>

      {/* Tab Bar */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {TAB_CONFIG.map(({ id, label, icon: Icon, color }) => {
          const colorActive: Record<string, string> = {
            rose: 'bg-rose-500 text-white shadow-rose-200',
            violet: 'bg-violet-500 text-white shadow-violet-200',
            amber: 'bg-amber-500 text-white shadow-amber-200',
          };
          return (
            <button
              key={id}
              onClick={() => { setTab(id); setSearch(''); }}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm whitespace-nowrap transition-all shadow-md',
                tab === id ? colorActive[color] : 'bg-white text-slate-500 border border-slate-200 shadow-none hover:border-slate-300'
              )}
            >
              <Icon size={15} />
              {label}
            </button>
          );
        })}
      </div>

      {/* Count */}
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
        {filtered.length} tài liệu
      </p>

      {/* Items */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BookOpen size={40} className="text-slate-200 mb-3" />
              <p className="text-slate-400 font-bold">Không tìm thấy tài liệu.</p>
            </div>
          ) : (
            filtered.map(item => <ItemCard key={item.id} item={item} color={activeTab.color} />)
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
