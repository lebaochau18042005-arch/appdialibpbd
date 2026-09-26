import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, BookOpen, X, Copy, Check, ChevronRight, Hash, Sparkles } from 'lucide-react';

interface FormulaItem {
  id: string;
  name: string;
  category: 'Dân cư' | 'Nông nghiệp' | 'Tự nhiên' | 'Kinh tế';
  formula: string;
  unit: string;
  note: string;
  example: string;
}

const FORMULAS: FormulaItem[] = [
  {
    id: 'f1',
    name: 'Mật độ dân số',
    category: 'Dân cư',
    formula: 'Mật độ = Dân số (người) / Diện tích (km²)',
    unit: 'người/km²',
    note: 'Lưu ý đổi dân số ra đơn vị người (nếu đề cho triệu người thì nhân 1.000.000).',
    example: 'Dân số 24,5 triệu người, diện tích 30.500 km² → 24.500.000 / 30.500 = 803 người/km²',
  },
  {
    id: 'f2',
    name: 'Tỉ suất gia tăng tự nhiên',
    category: 'Dân cư',
    formula: 'Tỉ suất gia tăng tự nhiên (%) = (Tỉ suất sinh ‰ - Tỉ suất tử ‰) / 10',
    unit: '%',
    note: 'Đổi từ phần nghìn (‰) sang phần trăm (%) bằng cách chia cho 10.',
    example: 'Sinh 15,2‰, tử 6,1‰ → (15,2 - 6,1) / 10 = 0,91%',
  },
  {
    id: 'f3',
    name: 'Sản lượng lương thực bình quân đầu người',
    category: 'Nông nghiệp',
    formula: 'Bình quân = Sản lượng lương thực (kg) / Dân số (người)',
    unit: 'kg/người',
    note: 'Đổi sản lượng ra kg (1 tấn = 1.000 kg, 1 nghìn tấn = 1.000.000 kg).',
    example: 'Sản lượng 43 triệu tấn, dân số 100 triệu người → 43.000.000.000 / 100.000.000 = 430 kg/người',
  },
  {
    id: 'f4',
    name: 'Năng suất cây trồng',
    category: 'Nông nghiệp',
    formula: 'Năng suất = Sản lượng / Diện tích gieo trồng',
    unit: 'tạ/ha hoặc tấn/ha',
    note: 'Đảm bảo đơn vị sản lượng và diện tích tương ứng trước khi chia.',
    example: 'Sản lượng 43 triệu tấn, diện tích 7,2 triệu ha → 43 / 7,2 = 5,97 tấn/ha (hoặc 59,7 tạ/ha)',
  },
  {
    id: 'f5',
    name: 'Biên độ nhiệt độ năm',
    category: 'Tự nhiên',
    formula: 'Biên độ nhiệt = Nhiệt độ tháng cao nhất - Nhiệt độ tháng thấp nhất',
    unit: '°C',
    note: 'Lấy giá trị nhiệt độ trung bình của tháng nóng nhất trừ đi tháng lạnh nhất.',
    example: 'Hà Nội: T7 cao nhất 28,9°C, T1 thấp nhất 16,4°C → 28,9 - 16,4 = 12,5°C',
  },
  {
    id: 'f6',
    name: 'Cân bằng ẩm',
    category: 'Tự nhiên',
    formula: 'Cân bằng ẩm = Lượng mưa - Lượng bốc hơi',
    unit: 'mm',
    note: 'Nếu lượng mưa > lượng bốc hơi thì cân bằng ẩm dương (+), ngược lại là âm (-).',
    example: 'Lượng mưa 1.680 mm, bốc hơi 1.000 mm → 1.680 - 1.000 = +680 mm',
  },
  {
    id: 'f7',
    name: 'Tỉ trọng cơ cấu',
    category: 'Kinh tế',
    formula: 'Tỉ trọng (%) = (Giá trị thành phần / Tổng giá trị) × 100',
    unit: '%',
    note: 'Tổng cơ cấu của tất cả các thành phần trong 1 năm luôn bằng 100%.',
    example: 'GDP Nông nghiệp 45 tỉ USD, tổng GDP 450 tỉ USD → (45 / 450) × 100 = 10,0%',
  },
  {
    id: 'f8',
    name: 'Tốc độ tăng trưởng',
    category: 'Kinh tế',
    formula: 'Tốc độ tăng trưởng (%) = (Giá trị năm sau / Giá trị năm gốc) × 100',
    unit: '%',
    note: 'Năm gốc luôn được tính là 100%.',
    example: 'Năm gốc 2015: 120 tỉ kWh (100%), năm 2023: 340 tỉ kWh → (340 / 120) × 100 = 283,3%',
  },
  {
    id: 'f9',
    name: 'Cán cân xuất nhập khẩu',
    category: 'Kinh tế',
    formula: 'Cán cân = Trị giá Xuất khẩu - Trị giá Nhập khẩu',
    unit: 'USD hoặc tỉ USD',
    note: 'Nếu Xuất > Nhập: Xuất siêu (dương). Nếu Xuất < Nhập: Nhập siêu (âm).',
    example: 'Xuất khẩu 355 tỉ USD, Nhập khẩu 327 tỉ USD → 355 - 327 = +28 tỉ USD (Xuất siêu)',
  },
  {
    id: 'f10',
    name: 'Độ che phủ rừng',
    category: 'Tự nhiên',
    formula: 'Độ che phủ (%) = (Diện tích rừng / Tổng diện tích tự nhiên) × 100',
    unit: '%',
    note: 'Cả hai đại lượng đều phải cùng đơn vị diện tích (thường là triệu ha hoặc nghìn ha).',
    example: 'Diện tích rừng 14,7 triệu ha, diện tích tự nhiên 33,1 triệu ha → (14,7 / 33,1) × 100 = 44,4%',
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onApplyResult?: (result: string) => void;
}

export default function GeoFormulasModal({ isOpen, onClose, onApplyResult }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Mini calculator state
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcFormula, setCalcFormula] = useState('');
  const [copiedCalc, setCopiedCalc] = useState(false);

  if (!isOpen) return null;

  const categories = ['Tất cả', 'Dân cư', 'Nông nghiệp', 'Tự nhiên', 'Kinh tế'];

  const filtered = FORMULAS.filter(f => {
    const matchCat = selectedCategory === 'Tất cả' || f.category === selectedCategory;
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.formula.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // Calculator logic
  const handleNum = (char: string) => {
    if (calcDisplay === '0' && char !== '.') {
      setCalcDisplay(char);
    } else {
      setCalcDisplay(prev => prev + char);
    }
  };

  const handleOp = (op: string) => {
    setCalcFormula(calcDisplay + ' ' + op + ' ');
    setCalcDisplay('0');
  };

  const handleClear = () => {
    setCalcDisplay('0');
    setCalcFormula('');
  };

  const handleBackspace = () => {
    if (calcDisplay.length > 1) {
      setCalcDisplay(prev => prev.slice(0, -1));
    } else {
      setCalcDisplay('0');
    }
  };

  const handleEval = () => {
    try {
      const expr = (calcFormula + calcDisplay).replace(/×/g, '*').replace(/÷/g, '/');
      // eslint-disable-next-line no-eval
      const res = Function(`'use strict'; return (${expr})`)();
      if (typeof res === 'number' && !isNaN(res)) {
        // Format to max 4 decimal digits
        const str = String(Math.round(res * 10000) / 10000);
        setCalcDisplay(str);
        setCalcFormula('');
      } else {
        setCalcDisplay('Lỗi');
      }
    } catch {
      setCalcDisplay('Lỗi');
    }
  };

  const handleRound = (decimals: number) => {
    const num = parseFloat(calcDisplay.replace(',', '.'));
    if (!isNaN(num)) {
      setCalcDisplay(num.toFixed(decimals).replace('.', ','));
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl overflow-hidden border border-cyan-500/30 shadow-[0_0_50px_rgba(0,191,255,0.25)]"
        style={{ background: '#0a1628' }}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-cyan-500/20 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Calculator size={22} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                Sổ tay Công thức & Máy tính Địa lí
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                  Chuẩn 2025
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Tra cứu công thức và tính toán nhanh kết quả Phần III (tối đa 4 ký tự theo chuẩn Bộ GD&ĐT)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content: 2 columns on desktop */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 custom-scrollbar">
          
          {/* Left Column: Formulas List (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap gap-2 items-center justify-between">
              {/* Category tabs */}
              <div className="flex flex-wrap gap-1.5">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 text-xs rounded-xl font-bold transition-all ${
                      selectedCategory === cat
                        ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(0,191,255,0.4)]'
                        : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search */}
              <input
                type="text"
                placeholder="Tìm công thức..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-cyan-400 w-36 sm:w-44"
              />
            </div>

            {/* List */}
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1 custom-scrollbar">
              {filtered.map(f => (
                <div
                  key={f.id}
                  className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/30 transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm flex items-center gap-1.5">
                      <Hash size={14} className="text-cyan-400" />
                      {f.name}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 border border-cyan-500/20">
                      {f.unit}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950 font-mono text-xs text-cyan-300 font-bold border border-cyan-500/20 flex items-center justify-between">
                    <span>{f.formula}</span>
                    <button
                      onClick={() => handleCopy(f.formula, f.id)}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors"
                      title="Sao chép công thức"
                    >
                      {copiedId === f.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    💡 <span className="text-slate-300">{f.note}</span>
                  </p>

                  <div className="text-[11px] text-slate-400 bg-slate-950/50 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-cyan-400 font-bold">Ví dụ: </span>
                    {f.example}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Mini Calculator (5 cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Calculator size={14} />
                  Bàn tính thực chiến
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Phiếu Bộ GD&ĐT: ≤ 4 ký tự
                </span>
              </div>

              {/* Screen */}
              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 text-right space-y-1">
                <div className="text-xs text-slate-500 font-mono h-4 overflow-hidden">
                  {calcFormula}
                </div>
                <div className="text-2xl font-black font-mono text-cyan-300 truncate">
                  {calcDisplay}
                </div>
              </div>

              {/* Quick rounding helpers */}
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleRound(0)}
                  className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-300 border border-slate-700 transition-colors"
                  title="Làm tròn đến hàng đơn vị"
                >
                  Đơn vị (803)
                </button>
                <button
                  onClick={() => handleRound(1)}
                  className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-300 border border-slate-700 transition-colors"
                  title="Làm tròn 1 chữ số thập phân"
                >
                  1 số lẻ (80,3)
                </button>
                <button
                  onClick={() => handleRound(2)}
                  className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-300 border border-slate-700 transition-colors"
                  title="Làm tròn 2 chữ số thập phân"
                >
                  2 số lẻ (8,03)
                </button>
              </div>

              {/* Keypad */}
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={handleClear}
                  className="py-3 rounded-xl bg-rose-500/20 text-rose-300 font-black hover:bg-rose-500/30 border border-rose-500/30"
                >
                  C
                </button>
                <button
                  onClick={handleBackspace}
                  className="py-3 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 border border-slate-700"
                >
                  ⌫
                </button>
                <button
                  onClick={() => handleOp('÷')}
                  className="py-3 rounded-xl bg-cyan-500/20 text-cyan-300 font-black hover:bg-cyan-500/30 border border-cyan-500/30"
                >
                  ÷
                </button>
                <button
                  onClick={() => handleOp('×')}
                  className="py-3 rounded-xl bg-cyan-500/20 text-cyan-300 font-black hover:bg-cyan-500/30 border border-cyan-500/30"
                >
                  ×
                </button>

                {['7', '8', '9'].map(n => (
                  <button
                    key={n}
                    onClick={() => handleNum(n)}
                    className="py-3 rounded-xl bg-slate-800/90 text-white font-bold hover:bg-slate-700 text-base border border-slate-700/60"
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => handleOp('-')}
                  className="py-3 rounded-xl bg-cyan-500/20 text-cyan-300 font-black hover:bg-cyan-500/30 border border-cyan-500/30"
                >
                  -
                </button>

                {['4', '5', '6'].map(n => (
                  <button
                    key={n}
                    onClick={() => handleNum(n)}
                    className="py-3 rounded-xl bg-slate-800/90 text-white font-bold hover:bg-slate-700 text-base border border-slate-700/60"
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => handleOp('+')}
                  className="py-3 rounded-xl bg-cyan-500/20 text-cyan-300 font-black hover:bg-cyan-500/30 border border-cyan-500/30"
                >
                  +
                </button>

                {['1', '2', '3'].map(n => (
                  <button
                    key={n}
                    onClick={() => handleNum(n)}
                    className="py-3 rounded-xl bg-slate-800/90 text-white font-bold hover:bg-slate-700 text-base border border-slate-700/60"
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={handleEval}
                  className="row-span-2 py-3 rounded-xl bg-cyan-500 text-slate-950 font-black hover:bg-cyan-400 text-lg shadow-[0_0_16px_rgba(0,191,255,0.4)] flex items-center justify-center"
                >
                  =
                </button>

                <button
                  onClick={() => handleNum('0')}
                  className="col-span-2 py-3 rounded-xl bg-slate-800/90 text-white font-bold hover:bg-slate-700 text-base border border-slate-700/60"
                >
                  0
                </button>
                <button
                  onClick={() => handleNum('.')}
                  className="py-3 rounded-xl bg-slate-800/90 text-white font-bold hover:bg-slate-700 text-base border border-slate-700/60"
                >
                  .
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(calcDisplay);
                    setCopiedCalc(true);
                    setTimeout(() => setCopiedCalc(false), 1500);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copiedCalc ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  Sao chép số ({calcDisplay})
                </button>

                {onApplyResult && (
                  <button
                    onClick={() => {
                      onApplyResult(calcDisplay);
                      onClose();
                    }}
                    className="py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black transition-colors"
                  >
                    Dán vào bài
                  </button>
                )}
              </div>
            </div>

            {/* Hint Box */}
            <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-200/80 space-y-1.5">
              <p className="font-bold text-cyan-300 flex items-center gap-1.5">
                <Sparkles size={14} /> Quy tắc phiếu trả lời 4 ô:
              </p>
              <p className="text-[11px] leading-relaxed">
                Khi thi THPT, mỗi câu Phần III chỉ có tối đa 4 ô để tô (kể cả dấu phẩy <code className="bg-slate-900 px-1 rounded text-cyan-300">,</code> hoặc dấu âm <code className="bg-slate-900 px-1 rounded text-cyan-300">-</code>). Hãy đọc kĩ yêu cầu làm tròn của đề bài!
              </p>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
