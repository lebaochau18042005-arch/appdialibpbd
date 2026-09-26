import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Map, MapPin, Search, AlertTriangle, ShieldCheck, ChevronRight, X, Building2, Trees, Sparkles } from 'lucide-react';

interface ProvinceInfo {
  name: string;
  isCityTw: boolean;
  mergedFrom: string[];
  region: string;
  keyFeatures: string;
}

const REGIONS_DATA = [
  {
    id: 'dnb',
    name: 'Đông Nam Bộ',
    description: 'Vùng kinh tế năng động và đầu tàu công nghiệp - dịch vụ của cả nước.',
    provinces: [
      { name: 'TP Hồ Chí Minh', isCityTw: true, mergedFrom: ['TP Hồ Chí Minh cũ', 'Bình Dương', 'Bà Rịa – Vũng Tàu'], region: 'Đông Nam Bộ', keyFeatures: 'Đô thị đặc biệt, trung tâm tài chính, công nghiệp công nghệ cao, cụm cảng nước sâu Cái Mép - Thị Vải' },
      { name: 'Đồng Nai', isCityTw: false, mergedFrom: ['Đồng Nai'], region: 'Đông Nam Bộ', keyFeatures: 'Trung tâm công nghiệp lớn, cảng hàng không quốc tế Long Thành' },
      { name: 'Tây Ninh', isCityTw: false, mergedFrom: ['Tây Ninh'], region: 'Đông Nam Bộ', keyFeatures: 'Cửa ngõ kết nối kinh tế với Campuchia qua cửa khẩu Mộc Bài, Xa Mát; du lịch tâm linh núi Bà Đen' },
    ]
  },
  {
    id: 'dbsh',
    name: 'Đồng bằng sông Hồng',
    description: 'Vùng trọng điểm kinh tế phía Bắc, cái nôi văn minh sông Hồng, mật độ dân cư cao.',
    provinces: [
      { name: 'Hà Nội', isCityTw: true, mergedFrom: ['Hà Nội'], region: 'Đồng bằng sông Hồng', keyFeatures: 'Thủ đô, trung tâm chính trị - hành chính quốc gia, trung tâm kinh tế - văn hóa lớn' },
      { name: 'TP Hải Phòng', isCityTw: true, mergedFrom: ['Hải Phòng cũ', 'Hải Dương'], region: 'Đồng bằng sông Hồng', keyFeatures: 'Cảng biển quốc tế Lạch Huyện, trung tâm công nghiệp ô tô, đóng tàu, cơ khí chế tạo' },
      { name: 'Quảng Ninh', isCityTw: false, mergedFrom: ['Quảng Ninh'], region: 'Đồng bằng sông Hồng', keyFeatures: 'Vùng than lớn nhất cả nước, di sản Vịnh Hạ Long, du lịch biển đảo cao cấp' },
      { name: 'Bắc Ninh', isCityTw: false, mergedFrom: ['Bắc Ninh cũ', 'Bắc Giang'], region: 'Đồng bằng sông Hồng', keyFeatures: 'Thủ phủ công nghiệp bán dẫn, lắp ráp linh kiện điện tử (Samsung, Foxconn), cây ăn quả đặc sản' },
      { name: 'Hưng Yên', isCityTw: false, mergedFrom: ['Hưng Yên cũ', 'Thái Bình'], region: 'Đồng bằng sông Hồng', keyFeatures: 'Nông nghiệp công nghệ cao, công nghiệp chế biến, khí mỏ Tiền Hải' },
      { name: 'Ninh Bình', isCityTw: false, mergedFrom: ['Ninh Bình cũ', 'Hà Nam', 'Nam Định'], region: 'Đồng bằng sông Hồng', keyFeatures: 'Quần thể danh thắng Tràng An, công nghiệp cơ khí ô tô, dệt may, sản xuất vật liệu xây dựng' },
    ]
  },
  {
    id: 'dbscl',
    name: 'Đồng bằng sông Cửu Long',
    description: 'Vựa lương thực, thủy sản và cây ăn quả nhiệt đới lớn nhất cả nước.',
    provinces: [
      { name: 'TP Cần Thơ', isCityTw: true, mergedFrom: ['Cần Thơ cũ', 'Hậu Giang', 'Sóc Trăng'], region: 'Đồng bằng sông Cửu Long', keyFeatures: 'Đô thị hạt nhân trung tâm vùng, trung tâm đào tạo, công nghiệp chế biến nông thủy sản' },
      { name: 'Vĩnh Long', isCityTw: false, mergedFrom: ['Vĩnh Long'], region: 'Đồng bằng sông Cửu Long', keyFeatures: 'Nằm giữa hai nhánh sông Tiền và sông Hậu, thế mạnh vườn cây ăn quả nhiệt đới' },
      { name: 'Đồng Tháp', isCityTw: false, mergedFrom: ['Đồng Tháp'], region: 'Đồng bằng sông Cửu Long', keyFeatures: 'Vùng trọng điểm lúa gạo Đồng Tháp Mười, xuất khẩu cá tra, du lịch sinh thái Tràm Chim' },
      { name: 'An Giang', isCityTw: false, mergedFrom: ['An Giang cũ', 'Kiên Giang'], region: 'Đồng bằng sông Cửu Long', keyFeatures: 'Biên giới tiếp giáp Campuchia, kinh tế biển đảo Phú Quốc, đánh bắt thủy sản lớn nhất' },
      { name: 'Cà Mau', isCityTw: false, mergedFrom: ['Cà Mau cũ', 'Bạc Liêu'], region: 'Đồng bằng sông Cửu Long', keyFeatures: 'Mũi Cà Mau, nuôi tôm sinh thái, điện gió biển, khí - điện - đạm Cà Mau' },
    ]
  },
  {
    id: 'tdmnpb',
    name: 'Trung du và miền núi phía Bắc',
    description: 'Vùng giàu tài nguyên khoáng sản, thủy điện và tiềm năng cây công nghiệp cận nhiệt, ôn đới.',
    provinces: [
      { name: 'Tuyên Quang', isCityTw: false, mergedFrom: ['Tuyên Quang cũ', 'Hà Giang'], region: 'Trung du và miền núi phía Bắc', keyFeatures: 'Cao nguyên đá Đồng Văn, kinh tế rừng, chè san tuyết, kinh tế cửa khẩu' },
      { name: 'Lào Cai', isCityTw: false, mergedFrom: ['Lào Cai cũ', 'Yên Bái'], region: 'Trung du và miền núi phía Bắc', keyFeatures: 'Khu du lịch quốc gia Sa Pa, mỏ apatit lớn nhất, hồ Thác Bà, cửa khẩu quốc tế đường sắt và đường bộ' },
      { name: 'Thái Nguyên', isCityTw: false, mergedFrom: ['Thái Nguyên cũ', 'Bắc Kạn'], region: 'Trung du và miền núi phía Bắc', keyFeatures: 'Trung tâm gang thép, công nghiệp điện tử lớn, chè Tân Cương, hồ Ba Bể' },
      { name: 'Phú Thọ', isCityTw: false, mergedFrom: ['Phú Thọ cũ', 'Hòa Bình', 'Vĩnh Phúc'], region: 'Trung du và miền núi phía Bắc', keyFeatures: 'Đền Hùng đất Tổ, thủy điện Hòa Bình, công nghiệp ô tô xe máy Vĩnh Phúc' },
      { name: 'Cao Bằng', isCityTw: false, mergedFrom: ['Cao Bằng'], region: 'Trung du và miền núi phía Bắc', keyFeatures: 'Thác Bản Giốc, công viên địa chất toàn cầu UNESCO, kinh tế cửa khẩu' },
      { name: 'Lạng Sơn', isCityTw: false, mergedFrom: ['Lạng Sơn'], region: 'Trung du và miền núi phía Bắc', keyFeatures: 'Cửa khẩu quốc tế Hữu Nghị, đầu mối giao thương lớn nhất với Trung Quốc' },
      { name: 'Lai Châu', isCityTw: false, mergedFrom: ['Lai Châu'], region: 'Trung du và miền núi phía Bắc', keyFeatures: 'Thủy điện Lai Châu và Bản Chát, khoáng sản đất hiếm' },
      { name: 'Điện Biên', isCityTw: false, mergedFrom: ['Điện Biên'], region: 'Trung du và miền núi phía Bắc', keyFeatures: 'Di tích lịch sử chiến trường Điện Biên Phủ, cánh đồng Mường Thanh lớn nhất Tây Bắc' },
      { name: 'Sơn La', isCityTw: false, mergedFrom: ['Sơn La'], region: 'Trung du và miền núi phía Bắc', keyFeatures: 'Nhà máy thủy điện Sơn La lớn nhất Đông Nam Á, cao nguyên Mộc Châu' },
    ]
  },
  {
    id: 'btb',
    name: 'Bắc Trung Bộ',
    description: 'Dải đất hẹp ngang kết nối Bắc - Nam, thế mạnh phát triển kinh tế biển đảo và du lịch di sản.',
    provinces: [
      { name: 'Thanh Hóa', isCityTw: false, mergedFrom: ['Thanh Hóa'], region: 'Bắc Trung Bộ', keyFeatures: 'Khu kinh tế Nghi Sơn, cửa ngõ kết nối Bắc Trung Bộ với vùng kinh tế trọng điểm Bắc Bộ' },
      { name: 'Nghệ An', isCityTw: false, mergedFrom: ['Nghệ An'], region: 'Bắc Trung Bộ', keyFeatures: 'Tỉnh có diện tích lớn nhất nước, quê hương Chủ tịch Hồ Chí Minh, cảng Cửa Lò' },
      { name: 'Hà Tĩnh', isCityTw: false, mergedFrom: ['Hà Tĩnh'], region: 'Bắc Trung Bộ', keyFeatures: 'Khu kinh tế Vũng Áng, luyện thép Formosa, mỏ sắt Thạch Khê lớn nhất Đông Nam Á' },
      { name: 'Quảng Trị', isCityTw: false, mergedFrom: ['Quảng Trị cũ', 'Quảng Bình'], region: 'Bắc Trung Bộ', keyFeatures: 'Di sản thiên nhiên thế giới Phong Nha - Kẻ Bàng, hành lang kinh tế Đông - Tây' },
      { name: 'TP Huế', isCityTw: true, mergedFrom: ['Thừa Thiên Huế'], region: 'Bắc Trung Bộ', keyFeatures: 'Thành phố trực thuộc TW mới, cố đô di sản văn hóa thế giới UNESCO, trung tâm y tế và đào tạo chuyên sâu' },
    ]
  },
  {
    id: 'ntb',
    name: 'Nam Trung Bộ (Bao gồm Tây Nguyên cũ theo TT17/2025)',
    description: 'Vùng kết hợp duyên hải biển đảo và cao nguyên badan, bãi bỏ vùng Tây Nguyên độc lập.',
    provinces: [
      { name: 'TP Đà Nẵng', isCityTw: true, mergedFrom: ['Đà Nẵng cũ', 'Quảng Nam'], region: 'Nam Trung Bộ', keyFeatures: 'Đô thị loại đặc biệt, trung tâm kinh tế biển, sân bay quốc tế, phố cổ Hội An, di tích Mỹ Sơn' },
      { name: 'Quảng Ngãi', isCityTw: false, mergedFrom: ['Quảng Ngãi cũ', 'Kon Tum'], region: 'Nam Trung Bộ', keyFeatures: 'Nhà máy lọc dầu Dung Quất, sâm Ngọc Linh, thủy điện Yaly' },
      { name: 'Gia Lai', isCityTw: false, mergedFrom: ['Gia Lai cũ', 'Bình Định'], region: 'Nam Trung Bộ', keyFeatures: 'Cao nguyên Pleiku, cây cà phê, cao su, cảng biển Quy Nhơn' },
      { name: 'Khánh Hòa', isCityTw: false, mergedFrom: ['Khánh Hòa cũ', 'Ninh Thuận'], region: 'Nam Trung Bộ', keyFeatures: 'Vịnh Cam Ranh, vịnh Nha Trang, trung tâm du lịch biển quốc tế, năng lượng tái tạo (điện gió, mặt trời)' },
      { name: 'Đắk Lắk', isCityTw: false, mergedFrom: ['Đắk Lắk'], region: 'Nam Trung Bộ', keyFeatures: 'Thủ phủ cà phê Buôn Ma Thuột, đất đỏ badan màu mỡ rộng lớn' },
      { name: 'Lâm Đồng', isCityTw: false, mergedFrom: ['Lâm Đồng cũ', 'Đắk Nông', 'Bình Thuận'], region: 'Nam Trung Bộ', keyFeatures: 'Đà Lạt du lịch nghỉ dưỡng và hoa - rau ôn đới, bauxite Đắk Nông, thanh long Bình Thuận' },
    ]
  }
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function InteractiveMapModal({ isOpen, onClose }: Props) {
  const [selectedRegionId, setSelectedRegionId] = useState<string>('dnb');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // Flatten all provinces for search
  const allProvinces = REGIONS_DATA.flatMap(r => r.provinces);

  // Search match logic (both old names and new names)
  const isSearching = searchQuery.trim().length > 0;
  const searchResults = isSearching
    ? allProvinces.filter(p => {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.region.toLowerCase().includes(q) ||
          p.mergedFrom.some(old => old.toLowerCase().includes(q)) ||
          p.keyFeatures.toLowerCase().includes(q)
        );
      })
    : [];

  const currentRegion = REGIONS_DATA.find(r => r.id === selectedRegionId) || REGIONS_DATA[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl overflow-hidden border border-cyan-500/30 shadow-[0_0_50px_rgba(0,191,255,0.25)]"
        style={{ background: '#0a1628' }}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-cyan-500/20 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Map size={22} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                Bản đồ & Tra cứu 34 Tỉnh/Thành Mới
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                  TT 17/2025 & NQ 202/2025
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Tra cứu ranh giới hành chính 6 thành phố TW, 28 tỉnh và 6 vùng kinh tế - xã hội sau sáp nhập
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

        {/* Warning banner about TT17 changes */}
        <div className="px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2 text-xs text-amber-200">
          <AlertTriangle size={15} className="text-amber-400 shrink-0" />
          <span>
            <strong>Lưu ý quan trọng cho đề thi 2025:</strong> Khái niệm <em>"Vùng Tây Nguyên"</em> và <em>"Vùng kinh tế trọng điểm"</em> đã bị bãi bỏ hoàn toàn theo Thông tư 17/2025. Tây Nguyên được sáp nhập vào vùng Nam Trung Bộ.
          </span>
        </div>

        {/* Search bar */}
        <div className="p-4 bg-slate-900/40 border-b border-slate-800 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400" size={16} />
            <input
              type="text"
              placeholder="Nhập tên tỉnh cũ hoặc mới (ví dụ: Bình Dương, Hải Dương, Hà Nam, Kon Tum, Cần Thơ)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-white text-sm outline-none transition-colors"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs px-3 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              Xóa tìm kiếm
            </button>
          )}
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          {isSearching ? (
            /* Search Results View */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-cyan-300">
                  Tìm thấy {searchResults.length} kết quả phù hợp với "{searchQuery}":
                </h3>
              </div>

              {searchResults.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <p className="text-base font-bold">Không tìm thấy tỉnh/thành nào phù hợp.</p>
                  <p className="text-xs">Hãy thử tìm theo tên tỉnh cũ (vd: Bình Dương, Kon Tum, Thái Bình) hoặc tên vùng.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.map((p, idx) => (
                    <ProvinceCard key={idx} province={p} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Region Tabs + Provinces View */
            <div className="space-y-6">
              {/* Region Selector Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {REGIONS_DATA.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRegionId(r.id)}
                    className={`p-3 rounded-2xl text-left transition-all border ${
                      selectedRegionId === r.id
                        ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300 shadow-[0_0_16px_rgba(0,191,255,0.2)]'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xs font-black line-clamp-1">{r.name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{r.provinces.length} đơn vị cấp tỉnh</div>
                  </button>
                ))}
              </div>

              {/* Selected Region Overview */}
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <MapPin size={18} className="text-cyan-400" />
                    Vùng {currentRegion.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{currentRegion.description}</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/20">
                  <Building2 size={14} />
                  {currentRegion.provinces.filter(p => p.isCityTw).length} TP trực thuộc TW • {currentRegion.provinces.filter(p => !p.isCityTw).length} Tỉnh
                </div>
              </div>

              {/* Provinces Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentRegion.provinces.map((p, idx) => (
                  <ProvinceCard key={idx} province={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function ProvinceCard({ province }: { province: ProvinceInfo }) {
  return (
    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="font-black text-white text-base flex items-center gap-2">
            {province.name}
            {province.isCityTw && (
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                Thành phố TW
              </span>
            )}
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">Vùng: <strong className="text-slate-300">{province.region}</strong></p>
        </div>
      </div>

      {/* Sáp nhập từ */}
      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
        <span className="text-cyan-400 font-bold">Thành phần cấu thành sau 1/7/2025:</span>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {province.mergedFrom.map((m, i) => (
            <span key={i} className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700">
              {m}
            </span>
          ))}
        </div>
      </div>

      {/* Thế mạnh kinh tế */}
      <div className="text-xs text-slate-400">
        <span className="text-slate-300 font-bold">Thế mạnh trọng tâm: </span>
        {province.keyFeatures}
      </div>
    </div>
  );
}
